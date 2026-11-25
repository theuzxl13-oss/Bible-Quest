"""
Utilidades do pipeline modular (personagens da reformulação visual, 2026-11).
Roda dentro do Blender (bpy + numpy).
"""
import os
import sys

import bpy
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)  # tools/personagem
SAIDA = os.path.join(RAIZ, 'saida')
sys.path.insert(0, RAIZ)


def abrir(caminho):
    bpy.ops.wm.open_mainfile(filepath=caminho)
    arm = bpy.data.objects['Esqueleto']
    repouso(arm)
    return bpy.data.objects['Corpo'], arm


def repouso(arm):
    """Pose de repouso: as animações (trilhas NLA) ficam mudas até a exportação."""
    if arm.animation_data:
        for t in arm.animation_data.nla_tracks:
            t.mute = True
        arm.animation_data.action = None
    for pb in arm.pose.bones:
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    bpy.context.view_layer.update()


def imagem_base(corpo):
    mat = corpo.data.materials[0]
    return [n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and n.image.name == 'Image_0'][0]


def pixels(img):
    W, H = img.size
    return np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)


def rasterizar(ob, filtro_tri, res):
    """
    Posição 3D e normal de cada texel coberto pelos triângulos escolhidos.
    filtro_tri(centros, normais) -> máscara booleana dos triângulos.
    Devolve (iy, ix, pos, nor) em resolução `res` (texels inteiros).
    """
    me = ob.data
    me.calc_loop_triangles()
    nt = len(me.loop_triangles)
    tv = np.empty(nt * 3, dtype=np.int32)
    tl = np.empty(nt * 3, dtype=np.int32)
    me.loop_triangles.foreach_get('vertices', tv)
    me.loop_triangles.foreach_get('loops', tl)
    tv, tl = tv.reshape(-1, 3), tl.reshape(-1, 3)
    nv = len(me.vertices)
    co = np.empty(nv * 3)
    me.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    vn = np.empty(nv * 3)
    me.vertices.foreach_get('normal', vn)
    vn = vn.reshape(-1, 3)
    uv = np.empty(len(me.loops) * 2)
    me.uv_layers.active.data.foreach_get('uv', uv)
    uv = uv.reshape(-1, 2)
    cen = co[tv].mean(1)
    nor = vn[tv].mean(1)
    sel = np.where(filtro_tri(cen, nor))[0]
    IY, IX, P, N = [], [], [], []
    for t in sel:
        a, b, c = uv[tl[t]] * res
        x0, x1 = int(np.floor(min(a[0], b[0], c[0]))), int(np.ceil(max(a[0], b[0], c[0])))
        y0, y1 = int(np.floor(min(a[1], b[1], c[1]))), int(np.ceil(max(a[1], b[1], c[1])))
        if x1 - x0 > 200 or y1 - y0 > 200:
            continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        gx, gy = gx.ravel(), gy.ravel()
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-12:
            continue
        l1 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / d
        l2 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / d
        l3 = 1 - l1 - l2
        e = -0.02
        m = (l1 >= e) & (l2 >= e) & (l3 >= e)
        if not m.any():
            continue
        L = np.stack([l1[m], l2[m], l3[m]], 1)
        IX.append(np.clip(gx[m].astype(int), 0, res - 1))
        IY.append(np.clip(gy[m].astype(int), 0, res - 1))
        P.append(L @ co[tv[t]])
        N.append(L @ vn[tv[t]])
    IX, IY = np.concatenate(IX), np.concatenate(IY)
    P, N = np.concatenate(P), np.concatenate(N)
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-9
    # um texel por posição (o último vence: os triângulos vizinhos dão quase o mesmo ponto)
    k = IY * res + IX
    _, idx = np.unique(k, return_index=True)
    return IY[idx], IX[idx], P[idx], N[idx]


def suave(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def rasterizar_tri(uv, tl, res):
    """
    Texels cobertos por cada triângulo de UV.
    uv: (nloops, 2); tl: (ntri, 3) índices de loops. Devolve (iy, ix, tri, L) com L baricêntricas (n, 3).
    """
    IY, IX, T, LL = [], [], [], []
    for t in range(len(tl)):
        a, b, c = uv[tl[t]] * res
        x0, x1 = int(np.floor(min(a[0], b[0], c[0]))) - 1, int(np.ceil(max(a[0], b[0], c[0]))) + 1
        y0, y1 = int(np.floor(min(a[1], b[1], c[1]))) - 1, int(np.ceil(max(a[1], b[1], c[1]))) + 1
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        gx, gy = gx.ravel(), gy.ravel()
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-12:
            continue
        l1 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / d
        l2 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / d
        l3 = 1 - l1 - l2
        m = (l1 >= -1e-4) & (l2 >= -1e-4) & (l3 >= -1e-4)
        if not m.any():
            continue
        IX.append(np.clip(gx[m].astype(int), 0, res - 1))
        IY.append(np.clip(gy[m].astype(int), 0, res - 1))
        T.append(np.full(m.sum(), t))
        LL.append(np.stack([l1[m], l2[m], l3[m]], 1))
    return np.concatenate(IY), np.concatenate(IX), np.concatenate(T), np.concatenate(LL)


def margem(img4, coberto, passos=12):
    """Estende as bordas das ilhas para fora (evita costuras com filtragem e mipmap)."""
    res = coberto.shape[0]
    cob = coberto.copy()
    for _ in range(passos):
        soma = np.zeros((res, res, 3), np.float32)
        k = np.zeros((res, res), np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            soma += np.roll(np.roll(img4[:, :, :3] * cob[:, :, None], dy, 0), dx, 1)
            k += np.roll(np.roll(cob.astype(np.float32), dy, 0), dx, 1)
        novo = ~cob & (k > 0)
        img4[novo, :3] = soma[novo] / k[novo][:, None]
        cob |= novo
    return img4


def ilhas_uv(me, uv):
    """Ilhas de UV: faces que compartilham um vértice com a mesma coordenada UV (união-busca)."""
    pai = list(range(len(me.polygons)))

    def raiz(i):
        while pai[i] != i:
            pai[i] = pai[pai[i]]
            i = pai[i]
        return i

    vist = {}
    for p in me.polygons:
        for li in p.loop_indices:
            v = me.loops[li].vertex_index
            k = (v, round(float(uv[li, 0]), 5), round(float(uv[li, 1]), 5))
            if k in vist:
                a, b = raiz(vist[k]), raiz(p.index)
                if a != b:
                    pai[a] = b
            else:
                vist[k] = p.index
    return np.array([raiz(i) for i in range(len(pai))])
