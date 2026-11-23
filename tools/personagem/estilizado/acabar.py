"""
Acabamento do personagem estilizado (depois de rigar.py):

1. Regiões: cada face vai para um material (pele, cabelo, túnica, manto, faixa,
   couro) pela cor da textura e pela posição. O jogo troca a cor de cada região
   por um tingimento que só afeta os texels parecidos com a cor de base (olhos,
   bordados e sobrancelhas ficam como estão). A cor de base vai nos "extras" do material.
2. Olhos um pouco maiores e expressões (morph targets): Piscar, Sorriso, Surpresa, Alegria.
3. Acessórios de mão e coroa de folhas (os mesmos do modelo v0.7), presos aos ossos.
4. Exporta o GLB (a compressão é feita por montar.sh).

Uso: blender -b -P acabar.py -- <entrada.blend> <juntas.json> <saida.glb>
"""
import colorsys
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(AQUI))
import construir  # noqa: E402
import vestes  # noqa: E402

ent, juntas_json, saida = sys.argv[-3], sys.argv[-2], sys.argv[-1]
J = json.load(open(juntas_json))
bpy.ops.wm.open_mainfile(filepath=ent)
corpo = bpy.data.objects['Corpo']
arm = bpy.data.objects['Esqueleto']
# trabalha na pose de repouso: as animações (trilhas NLA) ficam desligadas até exportar
for t in arm.animation_data.nla_tracks:
    t.mute = True
arm.animation_data.action = None
for pb in arm.pose.bones:
    pb.rotation_quaternion = (1, 0, 0, 0)
    pb.location = (0, 0, 0)
bpy.context.view_layer.update()
me = corpo.data
co = vestes.coords(corpo)

# ------------------------------------------------------------------ 1. regiões
mat0 = me.materials[0]
img = [n.image for n in mat0.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and n.image.name == 'Image_0'][0]
W, H = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[:, :, :3]
uv = np.empty(len(me.loops) * 2)
me.uv_layers.active.data.foreach_get('uv', uv)
uv = uv.reshape(-1, 2)


def amostra(u, v):
    return px[np.clip((v * H).astype(int), 0, H - 1), np.clip((u * W).astype(int), 0, W - 1)]


REGIOES = ['Pele', 'Cabelo', 'Tunica', 'Manto', 'Faixa', 'Couro']
R = {n: i for i, n in enumerate(REGIOES)}
rosto = J['rosto']  # caixa da frente do rosto: [xmin, xmax, zmin, zmax, ymax]


def no_rosto(p):
    return rosto[0] < p[0] < rosto[1] and rosto[2] < p[2] < rosto[3] and p[1] < rosto[4]


def classe(rgb, p):
    h, s, v = colorsys.rgb_to_hsv(*rgb)
    h *= 360
    x, y, z = p
    if no_rosto(p):
        return R['Pele']
    if 170 < h < 250 and s > 0.15:
        return R['Faixa']
    escuro = v < 0.40
    if escuro:
        if z > J['pescoco'][2] + 0.04:
            return R['Cabelo']
        if z > J['coluna3'][2] and abs(x) < J['ombro'][0] + 0.12:
            return R['Manto']
        if z < 0.35 or abs(x) > J['ombro'][0] - 0.02:
            return R['Couro']
        return R['Tunica']
    pele = 8 < h < 40 and s >= 0.33 and v >= 0.45
    barra = J['saia'][1] - 0.02 < z < J['saia'][1] + 0.1 and abs(x) < J['saia'][2]
    if pele and not barra:
        if z < 0.12:
            return R['Couro']  # sola da sandália (cor de couro claro)
        return R['Pele']
    if s < 0.33:
        return R['Tunica']
    return R['Tunica'] if z > 0.35 else R['Couro']


npoli = len(me.polygons)
cls = np.zeros(npoli, dtype=int)
ls = np.empty(npoli, dtype=int)
lt = np.empty(npoli, dtype=int)
me.polygons.foreach_get('loop_start', ls)
me.polygons.foreach_get('loop_total', lt)
for i, p in enumerate(me.polygons):
    uvs = uv[ls[i]:ls[i] + lt[i]]
    pts = np.vstack([uvs, uvs.mean(0, keepdims=True)])
    c = np.median(amostra(pts[:, 0], pts[:, 1]), axis=0)
    cls[i] = classe(c, p.center)

# filtro de maioria pelos vizinhos (tira ruído nas bordas)
viz = [[] for _ in range(npoli)]
aresta = {}
for i, p in enumerate(me.polygons):
    for k in p.edge_keys:
        aresta.setdefault(k, []).append(i)
for fs in aresta.values():
    for a in fs:
        for b in fs:
            if a != b:
                viz[a].append(b)
for _ in range(2):
    novo = cls.copy()
    for i in range(npoli):
        if viz[i]:
            cont = np.bincount(cls[viz[i]], minlength=len(REGIOES))
            m = int(cont.argmax())
            if cont[m] > len(viz[i]) / 2 and m != cls[i]:
                novo[i] = m
    cls = novo

# cor de base de cada região (mediana dos texels das faces) e materiais
bases = {}
for n, i in R.items():
    sel = np.where(cls == i)[0]
    if len(sel) == 0:
        continue
    cs = []
    for f in sel[:: max(1, len(sel) // 3000)]:
        u = uv[ls[f]:ls[f] + lt[f]].mean(0)
        cs.append(amostra(np.array([u[0]]), np.array([u[1]]))[0])
    bases[n] = np.median(np.array(cs), axis=0)
    print(f'{n:7s} faces {len(sel):6d} base {np.round(bases[n], 3)}')

me.materials.clear()
for n in REGIOES:
    m = mat0.copy()
    m.name = f'{n}__Estilizado_{n.lower()}'
    b = bases.get(n, np.array([0.5, 0.5, 0.5]))
    m['base'] = '#%02x%02x%02x' % tuple(int(round(x * 255)) for x in b)
    me.materials.append(m)
me.polygons.foreach_set('material_index', cls)
me.update()


# ------------------------------------------------------------------ 2. olhos e expressões
def superficie(x, z):
    """y da frente do rosto no ponto (x, z)."""
    d = (co[:, 0] - x) ** 2 + (co[:, 2] - z) ** 2
    perto = d < 0.006 ** 2
    return float(co[perto, 1].min()) if perto.any() else float(co[np.argmin(d), 1])


def suave(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


frente = np.array([no_rosto(p) for p in co])
olhos = []
for nome in ('olho_L', 'olho_R'):
    x, z, rx, rz = J[nome]
    olhos.append((x, superficie(x, z), z, rx, rz))
bx, bz, bl = J['boca']
by = superficie(bx, bz)


def campo(cx, cy, cz, raio):
    d = np.sqrt((co[:, 0] - cx) ** 2 + (co[:, 1] - cy) ** 2 * 0.3 + (co[:, 2] - cz) ** 2)
    return (1 - suave(d / raio)) * frente


# olhos maiores (estilo de animação), com transição suave
k_olho = J.get('olho_escala', 1.1)
base = co.copy()
for x, y, z, rx, rz in olhos:
    e = np.sqrt(((co[:, 0] - x) / (rx * 1.9)) ** 2 + ((co[:, 2] - z) / (rz * 1.9)) ** 2)
    w = (1 - suave(e)) * frente * (co[:, 1] < y + 0.03)
    base[:, 0] += (co[:, 0] - x) * (k_olho - 1) * w
    base[:, 2] += (co[:, 2] - z) * (k_olho - 1) * w
vestes.set_coords(corpo, base)
co = base


def piscar():
    d = np.zeros_like(co)
    for x, y, z, rx, rz in olhos:
        rx, rz = rx * k_olho, rz * k_olho
        hor = 1 - suave((np.abs(co[:, 0] - x) - rx * 0.85) / (rx * 0.6))
        # o olho se fecha para cima (linha dos cílios); a pele da bochecha, com mais espaço, cobre o olho
        zb, zt, zc = z - rz * 1.0, z + rz * 0.85, z - rz * J.get('palpebra', 2.4)
        zz = co[:, 2]
        alvo = zz.copy()
        olho = (zz >= zb) & (zz <= zt)
        alvo[olho] = zt - (zt - zz[olho]) * 0.02
        f_zb = zt - (zt - zb) * 0.02
        palp = (zz > zc) & (zz < zb)
        alvo[palp] = zc + (zz[palp] - zc) * (f_zb - zc) / (zb - zc)
        w = hor * frente * (co[:, 1] < y + 0.025)
        d[:, 2] += (alvo - zz) * w
        d[:, 1] -= 0.0015 * w * (olho | palp)
    return d


def sorriso(k=1.0):
    d = np.zeros_like(co)
    for s in (1, -1):
        cx = bx + s * bl
        w = campo(cx, by, bz, 0.022)
        d[:, 2] += 0.0065 * k * w
        d[:, 0] += 0.0025 * s * k * w
        d[:, 1] += 0.0015 * k * w
        w2 = campo(cx + s * 0.006, by, bz + 0.02, 0.025)
        d[:, 2] += 0.0022 * k * w2
        d[:, 1] -= 0.0012 * k * w2
    return d


def surpresa():
    d = np.zeros_like(co)
    for x, y, z, rx, rz in olhos:
        rz2 = rz * k_olho
        w = campo(x, y, z + rz2 + 0.014, 0.03)
        d[:, 2] += 0.0045 * w
        e = np.sqrt(((co[:, 0] - x) / (rx * k_olho * 1.6)) ** 2 + ((co[:, 2] - z) / (rz2 * 1.6)) ** 2)
        w2 = (1 - suave(e)) * frente
        d[:, 2] += (co[:, 2] - z) * 0.18 * w2
    w = campo(bx, by, bz - 0.02, 0.03) * (co[:, 2] < bz)
    d[:, 2] -= 0.004 * w
    return d


def alegria():
    d = sorriso(1.25)
    for x, y, z, rx, rz in olhos:
        w = campo(x, y, z - rz * k_olho, 0.02)
        d[:, 2] += 0.0025 * w
    return d


corpo.shape_key_add(name='Basis', from_mix=False)
for nome, fn in (('Piscar', piscar), ('Sorriso', sorriso), ('Surpresa', surpresa), ('Alegria', alegria)):
    sk = corpo.shape_key_add(name=nome, from_mix=False)
    sk.data.foreach_set('co', (co + fn()).reshape(-1))
    print('expressão', nome)

# ------------------------------------------------------------------ 3. acessórios
# a coroa de folhas usa a altura dos olhos (osso "oculi01.L" do modelo v0.7): osso auxiliar, sem deformar
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones.new('oculi01.L')
x, y, z, rx, rz = olhos[0]
zc = z + J.get('coroa', 0.06)  # coroa sobre o cabelo, acima da testa
eb.head = (x, y, zc)
eb.tail = (x, y - 0.01, zc)
eb.parent = arm.data.edit_bones['head']
eb.use_deform = False
bpy.ops.object.mode_set(mode='OBJECT')
mats = {
    'madeira': construir.material_pbr('Madeira', textura=os.path.join(construir.TEX, 'madeira.jpg'), rugosidade=0.7),
    'pergaminho': construir.material_pbr('Pergaminho', cor=(0.9, 0.84, 0.68, 1), rugosidade=0.85),
    'barro': construir.material_pbr('Barro', cor=(0.62, 0.36, 0.22, 1), rugosidade=0.9),
    'vime': construir.material_pbr('Vime', textura=os.path.join(construir.TEX, 'corda.jpg'), rugosidade=0.85),
    'folhas': construir.material_pbr('Folhas', cor=(0.32, 0.45, 0.2, 1), rugosidade=0.6),
}
ctx = {'arm': arm, 'corpo': corpo}
pecas = vestes.acessorios(ctx, mats)
print('acessórios', [p.name for p in pecas])

# ------------------------------------------------------------------ 4. exportar
for t in arm.animation_data.nla_tracks:
    t.mute = False
bpy.context.scene['estilo'] = 'animacao'
construir.exportar(saida, extras=True)
