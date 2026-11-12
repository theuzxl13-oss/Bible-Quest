"""
Leitores dos formatos de dados do MakeHuman (malha base hm08, targets,
proxies .mhclo, esqueleto .mhskel e pesos .mhw).

Escritos do zero para o Bible Quest: lêem apenas os ARQUIVOS DE DADOS, que o
projeto MakeHuman liberou como CC0 1.0. Nenhum código do MakeHuman (AGPL) é
usado.

Unidades do MakeHuman: decímetros, eixo Y para cima, figura olhando para +Z.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field

import numpy as np


@dataclass
class Obj:
    verts: np.ndarray                  # (n, 3)
    uvs: np.ndarray                    # (m, 2)
    faces: list[list[int]]             # índices de vértice por face
    face_uvs: list[list[int]]          # índices de UV por face
    face_group: list[str]              # grupo de cada face
    groups: list[str] = field(default_factory=list)


def read_obj(path: str) -> Obj:
    verts, uvs, faces, fuvs, fgroup = [], [], [], [], []
    group = 'default'
    groups: list[str] = []
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith('v '):
                verts.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('vt '):
                uvs.append([float(x) for x in line.split()[1:3]])
            elif line.startswith('g ') or line.startswith('o '):
                group = line.split(maxsplit=1)[1].strip()
                if group not in groups:
                    groups.append(group)
            elif line.startswith('f '):
                vi, ti = [], []
                for tok in line.split()[1:]:
                    parts = tok.split('/')
                    vi.append(int(parts[0]) - 1)
                    ti.append(int(parts[1]) - 1 if len(parts) > 1 and parts[1] else -1)
                faces.append(vi)
                fuvs.append(ti)
                fgroup.append(group)
    return Obj(np.array(verts, dtype=np.float64), np.array(uvs, dtype=np.float64) if uvs else np.zeros((0, 2)), faces, fuvs, fgroup, groups)


def read_target(path: str) -> tuple[np.ndarray, np.ndarray]:
    idx, d = [], []
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip() or line.startswith('#'):
                continue
            p = line.split()
            idx.append(int(p[0]))
            d.append([float(p[1]), float(p[2]), float(p[3])])
    return np.array(idx, dtype=np.int64), np.array(d, dtype=np.float64).reshape(-1, 3)


def apply_targets(base: np.ndarray, targets: list[tuple[str, float]]) -> np.ndarray:
    v = base.copy()
    for path, w in targets:
        if w == 0:
            continue
        idx, d = read_target(path)
        if len(idx):
            v[idx] += w * d
    return v


@dataclass
class Proxy:
    name: str
    obj_file: str
    material: str | None
    refs: np.ndarray        # (n, 3) índices da malha base
    weights: np.ndarray     # (n, 3)
    offsets: np.ndarray     # (n, 3)
    scales: dict            # eixo -> (v1, v2, escala)
    delete_verts: list[int]
    folder: str


def read_mhclo(path: str) -> Proxy:
    refs, ws, offs = [], [], []
    scales = {}
    obj_file = material = None
    name = os.path.splitext(os.path.basename(path))[0]
    delete: list[int] = []
    mode = None
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            p = s.split()
            key = p[0]
            if key == 'verts':
                mode = 'verts'
                continue
            if key == 'delete_verts':
                mode = 'delete'
                continue
            if mode == 'verts' and key[0].isdigit():
                if len(p) == 1:
                    refs.append([int(p[0])] * 3)
                    ws.append([1.0, 0.0, 0.0])
                    offs.append([0.0, 0.0, 0.0])
                else:
                    refs.append([int(p[0]), int(p[1]), int(p[2])])
                    ws.append([float(p[3]), float(p[4]), float(p[5])])
                    offs.append([float(p[6]), float(p[7]), float(p[8])])
                continue
            if mode == 'delete' and key[0].isdigit():
                for tok in p:
                    if '-' in tok:
                        a, b = tok.split('-')
                        delete.extend(range(int(a), int(b) + 1))
                    else:
                        delete.append(int(tok))
                continue
            if key == 'obj_file':
                obj_file = p[1]
            elif key == 'material':
                material = p[1]
            elif key == 'name':
                name = p[1]
            elif key in ('x_scale', 'y_scale', 'z_scale'):
                scales[key[0]] = (int(p[1]), int(p[2]), float(p[3]))
    return Proxy(name, obj_file, material, np.array(refs, dtype=np.int64).reshape(-1, 3), np.array(ws, dtype=np.float64).reshape(-1, 3), np.array(offs, dtype=np.float64).reshape(-1, 3), scales, delete, os.path.dirname(path))


def fit_proxy(proxy: Proxy, base: np.ndarray) -> np.ndarray:
    """Posiciona os vértices do proxy sobre a malha base já deformada."""
    pos = (base[proxy.refs] * proxy.weights[:, :, None]).sum(axis=1)
    sc = np.ones(3)
    for i, ax in enumerate('xyz'):
        if ax in proxy.scales:
            a, b, s = proxy.scales[ax]
            sc[i] = abs(base[a][i] - base[b][i]) / s
    return pos + proxy.offsets * sc


def proxy_weights(proxy: Proxy, bone_weights: dict[str, dict[int, float]]) -> dict[str, dict[int, float]]:
    """Pesos de esqueleto do proxy, herdados dos vértices de referência da malha base."""
    out: dict[str, dict[int, float]] = {}
    for bone, vw in bone_weights.items():
        acc: dict[int, float] = {}
        for i, (r, w) in enumerate(zip(proxy.refs, proxy.weights)):
            s = 0.0
            for rj, wj in zip(r, w):
                if wj:
                    s += wj * vw.get(int(rj), 0.0)
            if s > 1e-4:
                acc[i] = s
        if acc:
            out[bone] = acc
    return out


def read_skeleton(path: str):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def joint_pos(skel: dict, base: np.ndarray, name: str) -> np.ndarray:
    return base[skel['joints'][name]].mean(axis=0)


def read_weights(path: str) -> dict[str, dict[int, float]]:
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    return {bone: {int(v): float(w) for v, w in vw} for bone, vw in d['weights'].items()}


def read_mhmat(path: str) -> dict:
    out = {}
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#') or s.startswith('//'):
                continue
            p = s.split(maxsplit=1)
            if len(p) == 2:
                out[p[0]] = p[1]
    return out
