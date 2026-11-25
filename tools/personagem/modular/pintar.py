"""
Repinta os traços do rosto do corpo-base (mesmo desenho nos dois personagens):
- apaga os traços gerados pela IA (olhos borrados, sobrancelhas, lábios, blush, cílios soltos);
- pinta olhos novos: branco, íris, pupila, dois brilhos, linha dos cílios e pálpebra inferior;
- lábios e bochechas suaves.
As sobrancelhas viram peças 3D (pecas.py), para seguirem a cor do cabelo.
Uso: blender -b -P pintar.py -- <corpo-rig.blend> <juntas.json> <rosto.json> <feminino|masculino> <saida.blend>
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from comum import abrir, imagem_base, margem, pixels, rasterizar, rasterizar_tri, suave  # noqa: E402

ent, jj, rj, genero, saida = sys.argv[-5:]
J = json.load(open(jj))
R = json.load(open(rj))
fem = genero == 'feminino'
corpo, arm = abrir(ent)
img = imagem_base(corpo)
W, H = img.size
px = pixels(img)
zp = J['pescoco'][2]
ycab = arm.data.bones['head'].head_local.y


def filtro(c, n):
    return (c[:, 2] > zp + 0.03) & (c[:, 1] < ycab + 0.01) & (n[:, 1] < 0.6)


iy, ix, P, N = rasterizar(corpo, filtro, W)
x, z = P[:, 0], P[:, 2]
frente = suave((-N[:, 1] - 0.05) / 0.35)
# para apagar os traços antigos basta não estar de costas (as dobras da testa e das pálpebras apontam para cima)
nao_costas = suave((0.35 - N[:, 1]) / 0.3)
# os olhos são pintados também onde a superfície vira para o lado (vista de 3/4)
lado_ok = suave((0.55 - N[:, 1]) / 0.3)
cor = px[iy, ix, :3].copy()
pele = np.array([0.868, 0.576, 0.459]) if fem else np.array([0.824, 0.506, 0.365])
A = R['antigos']


def elipse(cx, cz, rx, rz):
    return np.sqrt(((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2)


def misturar(c, alvo, w):
    w = np.clip(w, 0, 1)[:, None]
    return c * (1 - w) + np.asarray(alvo) * w


# ---------------------------------------------------------------- 1. apagar os traços antigos
apagar = np.zeros(len(x))
for o in ('olho_R', 'olho_L'):
    ex, ez = R[o]
    apagar = np.maximum(apagar, 1 - suave((elipse(ex, ez, *A['olho_raio']) - 0.75) / 0.35))
sx0, sx1, sz0, sz1 = A['sobrancelha']
for s in (-1, 1):
    cx = R['centro_x'] + s * (sx0 + sx1) / 2
    apagar = np.maximum(apagar, 1 - suave((elipse(cx, (sz0 + sz1) / 2, (sx1 - sx0) / 2 + 0.008, (sz1 - sz0) / 2 + 0.007) - 0.8) / 0.4))
bw, bz0, bz1 = A['boca']
apagar = np.maximum(apagar, 1 - suave((elipse(R['boca'][0], (bz0 + bz1) / 2, bw, (bz1 - bz0) / 2 + 0.004) - 0.8) / 0.4))
if A['cilios'][2] > 0:
    for s in (-1, 1):
        apagar = np.maximum(apagar, 1 - suave((elipse(R['centro_x'] + s * A['cilios'][0], A['cilios'][1], A['cilios'][2], A['cilios'][2]) - 0.7) / 0.4))
bx, bzc, br = A['bochecha']
if br > 0:
    for s in (-1, 1):
        apagar = np.maximum(apagar, 0.85 * (1 - suave((elipse(R['centro_x'] + s * bx * 0.72, bzc, br * 1.2, br) - 0.6) / 0.5)))
# pele lisa no lugar, com um leve sombreado pela forma (a frente mais clara)
luz = 0.93 + 0.09 * np.clip(-N[:, 1], 0, 1) - 0.04 * np.clip(N[:, 2] * -1, 0, 1)
cor = misturar(cor, pele[None, :] * luz[:, None], apagar * nao_costas)

# ---------------------------------------------------------------- 2. bochechas e lábios
for s in (-1, 1):
    cx = R[('olho_L' if s > 0 else 'olho_R')][0] + s * 0.006
    cz = R['olho_L'][1] - (0.045 if fem else 0.05)
    w = (1 - suave(elipse(cx, cz, 0.024, 0.016))) * (0.30 if fem else 0.12) * frente
    cor = misturar(cor, cor * np.array([1.06, 0.84, 0.84]), w)
mx, mz, mw = R['boca']
u = (x - mx) / mw
lab = np.clip(1 - u ** 2, 0, 1)
top = mz + 0.0072 * lab ** 0.7 + 0.0016 * np.exp(-((u * 3.2) ** 2))  # arco do cupido suave
bot = mz - 0.0085 * lab ** 0.55
dentro = (z < top) & (z > bot) & (np.abs(u) < 1)
borda = np.minimum(np.abs(z - top), np.abs(z - bot))
w_lab = np.where(dentro, suave(borda / 0.0016), 0) * suave((1 - np.abs(u)) / 0.18) * frente
tom = np.array([0.93, 0.66, 0.62]) if fem else np.array([0.84, 0.56, 0.5])
cor = misturar(cor, tom * (pele / pele.max()) * 1.02, w_lab * (0.75 if fem else 0.5))
# linha entre os lábios, mais escura nos cantos (sorriso leve)
linha = mz - 0.0006 + 0.0012 * (u ** 2)
w_l = (1 - suave(np.abs(z - linha) / 0.0011)) * suave((1.05 - np.abs(u)) / 0.15) * frente
cor = misturar(cor, pele * 0.42, w_l * 0.85)
# brilho no lábio de baixo
w_b = (1 - suave(elipse(mx, mz - 0.0045, mw * 0.35, 0.0016))) * frente
cor = misturar(cor, np.minimum(1, cor * 1.12), w_b * 0.5)

# ---------------------------------------------------------------- 3. olhos
ESCLERA = np.array([0.96, 0.94, 0.91])
IRIS_BORDA = np.array([0.16, 0.10, 0.07])
IRIS = np.array([0.30, 0.20, 0.13])
IRIS_CLARA = np.array([0.52, 0.36, 0.20])
CILIOS = np.array([0.10, 0.065, 0.05])
rx, rz = R['olho_raio']
for o, lado in (('olho_R', -1), ('olho_L', 1)):
    ex, ez = R[o]
    # u cresce para fora do rosto nos dois olhos (canto externo um pouco mais alto)
    u = (x - ex) / rx * lado
    v = (z - ez) / rz
    uu = np.clip(u, -1, 1)
    sup = 0.95 * (1 - uu ** 2) ** 0.55 + 0.12 * uu
    inf = -0.80 * (1 - uu ** 2) ** 0.75 + 0.06 * uu
    dentro = (np.abs(u) < 1) & (v < sup) & (v > inf)
    dist_borda = np.minimum(sup - v, v - inf) * rz
    w_esc = np.where(dentro, suave(dist_borda / 0.0008), 0) * lado_ok
    # sombra da pálpebra no alto do branco do olho
    esc = ESCLERA[None, :] * (1 - 0.22 * suave((v - (sup - 0.55)) / 0.55)[:, None])
    cor = misturar(cor, esc, w_esc)
    # íris: círculo grande (estilo de animação), um pouco abaixo do centro
    ri = rz * 0.95
    d = np.sqrt((x - ex) ** 2 + (z - (ez - rz * 0.06)) ** 2) / ri
    t = np.clip(d, 0, 1)
    ic = IRIS[None, :] * (1 - t[:, None]) + IRIS_BORDA[None, :] * t[:, None]
    # reflexo quente na parte de baixo da íris
    baixo = suave(((ez - rz * 0.06) - z) / (ri * 0.9)) * (1 - suave((d - 0.45) / 0.4))
    ic = ic * (1 - 0.6 * baixo[:, None]) + IRIS_CLARA[None, :] * 0.6 * baixo[:, None]
    w_iris = (1 - suave((d - 0.96) / 0.06)) * w_esc
    cor = misturar(cor, ic, w_iris)
    w_pup = (1 - suave((d - 0.44) / 0.06)) * w_esc
    cor = misturar(cor, np.array([0.035, 0.025, 0.02]), w_pup)
    # brilhos
    for hx, hz, hr in ((-0.32, 0.36, 0.24), (0.36, -0.30, 0.11)):
        dh = np.sqrt((x - (ex + lado * hx * ri)) ** 2 + (z - (ez - rz * 0.06 + hz * ri)) ** 2) / (hr * ri)
        cor = misturar(cor, np.array([1.0, 1.0, 0.98]), (1 - suave((dh - 0.8) / 0.25)) * w_esc)
    # linha dos cílios (pálpebra de cima), mais grossa no canto externo e com um leve "rabo"
    esp = (0.0011 + 0.0011 * suave((uu + 0.2) / 1.2)) * (1.25 if fem else 1.0)
    dz = (z - (ez + sup * rz))
    w_c = (1 - suave((np.abs(dz - esp * 0.35) - esp * 0.5) / 0.0005)) * (np.abs(u) < 1.02)
    # rabo do canto externo
    ur = (u - 0.95) / 0.35
    rabo = (ur > 0) & (ur < 1)
    zr = ez + (0.12 + 0.18 * ur) * rz + 0.002 * ur
    w_r = np.where(rabo, (1 - suave((np.abs(z - zr) - esp * 0.45 * (1 - ur)) / 0.0005)), 0)
    cor = misturar(cor, CILIOS, np.maximum(w_c, w_r) * lado_ok)
    # pálpebra de baixo: traço fino e suave
    dzi = z - (ez + inf * rz)
    w_i = (1 - suave((np.abs(dzi + 0.0004) - 0.00035) / 0.0005)) * suave((1 - np.abs(u)) / 0.4) * 0.45
    cor = misturar(cor, pele * 0.55, w_i * frente)
    # dobra da pálpebra acima do olho
    dzd = z - (ez + (sup + 0.42) * rz)
    w_d = (1 - suave((np.abs(dzd) - 0.0003) / 0.0009)) * suave((0.85 - np.abs(u)) / 0.5) * 0.35
    cor = misturar(cor, pele * 0.72, w_d * frente)
    if fem:
        # três cílios no canto externo
        for k, (cu, ang) in enumerate(((0.55, 0.9), (0.78, 0.65), (0.95, 0.35))):
            bx0 = ex + lado * cu * rx
            bz0 = ez + (0.95 * (1 - cu ** 2) ** 0.55 + 0.12 * cu) * rz
            tt = np.clip(((x - bx0) * lado * np.cos(ang) + (z - bz0) * np.sin(ang)) / 0.0035, 0, 1)
            px_ = bx0 + lado * np.cos(ang) * tt * 0.0035
            pz_ = bz0 + np.sin(ang) * tt * 0.0035 + 0.0008 * tt ** 2
            dd = np.sqrt((x - px_) ** 2 + (z - pz_) ** 2)
            cor = misturar(cor, CILIOS, (1 - suave((dd - 0.0005 * (1 - tt)) / 0.00035)) * (tt < 0.999) * frente)

px[iy, ix, :3] = np.clip(cor, 0, 1)
# margem das ilhas de UV: a textura da IA não tem margem preenchida entre as ilhas (58 % da imagem
# fica livre); a filtragem misturava a cor das ilhas vizinhas (rachaduras). As bordas de todas as
# ilhas são estendidas sobre as áreas livres.
me = corpo.data
uvall = np.empty(len(me.loops) * 2)
me.uv_layers.active.data.foreach_get('uv', uvall)
uvall = uvall.reshape(-1, 2)
me.calc_loop_triangles()
tl = np.empty(len(me.loop_triangles) * 3, dtype=np.int32)
me.loop_triangles.foreach_get('loops', tl)
cy_, cx_, _, _ = rasterizar_tri(uvall, tl.reshape(-1, 3), W)
coberto = np.zeros((H, W), bool)
coberto[cy_, cx_] = True
px = margem(px, coberto, 16)
novo = bpy.data.images.new('Pele_modular', W, H, alpha=True)
novo.pixels.foreach_set(px.reshape(-1))
novo.filepath_raw = os.path.join(os.path.dirname(saida), f'pele-modular-{genero}.png')
novo.file_format = 'PNG'
novo.save()
for n in corpo.data.materials[0].node_tree.nodes:
    if n.type == 'TEX_IMAGE' and n.image == img:
        n.image = novo
novo.pack()
bpy.ops.wm.save_as_mainfile(filepath=saida)
print('salvo', saida)
