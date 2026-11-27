"""
MAPA DE GÊNESIS — REGIÃO DO ÉDEN (reformulação visual, entrega 2: protótipo)

Cena 3D gerada por código e renderizada como ilustração pintada, em vista aérea inclinada:
- terreno orgânico (colinas, um terraço com penhasco, margens), com o caminho de terra pintado
  no chão, sinuoso, ligando os marcos das fases;
- o rio que nasce no jardim (Gn 2.10), corre entre pedras e cai do penhasco numa cachoeira até o lago;
- vegetação abundante e variada (árvores de copa, frutíferas, ciprestes, palmeiras, arbustos, flores);
- marcos coerentes com os acontecimentos das fases (sem figuras humanas):
  1. a criação: o lago, a cachoeira, a luz da manhã e os animais pastando;
  2. o homem e a mulher: o prado florido do jardim, com a fonte;
  3. o jardim do Éden: a árvore da vida (frutos dourados) e a árvore do conhecimento (Gn 2.9),
     a nascente do rio;
  4. a queda: o portão do jardim, a leste, guardado pela espada flamejante (Gn 3.24), e os
     espinhos e cardos do lado de fora (Gn 3.18);
  5. Caim e Abel: o campo de trigo, o rebanho de ovelhas e os dois altares (Gn 4.2-4);
  baú: uma clareira de pedra ao lado do caminho;
- nada alto perto dos pontos das fases (a interface fica sempre visível).

Saída: <pasta>/eden.png (cor) e passes auxiliares; <pasta>/eden.json com a posição de cada ponto
na imagem (fração da largura e da altura). O pós-processamento (pos.py) faz o acabamento pintado.

Uso: blender -b -P eden.py -- <pasta> [largura_px] [amostras]
"""
import json
import math
import os
import random
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.noise import noise as ruido_perlin

args = sys.argv[sys.argv.index('--') + 1:]
PASTA = args[0]
LARG_PX = int(args[1]) if len(args) > 1 else 1080
AMOSTRAS = int(args[2]) if len(args) > 2 else 64
os.makedirs(PASTA, exist_ok=True)
random.seed(11)
np.random.seed(11)
# refinamento final: tudo o que foi acrescentado usa este gerador próprio, para não mexer na
# sequência global (que decide a posição de toda a vegetação já aprovada)
RR = random.Random(2026)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ------------------------------------------------------------------ mundo e caminho
LX, LY = 20.0, 68.0  # largura e profundidade do terreno (m); +y = norte (para cima no mapa)
X0 = -LX / 2

# pontos das fases (x, y) e do baú; o caminho passa por eles
PONTOS = [
    ('fase-1', (1.6, 6.0)),
    ('fase-2', (-3.4, 14.5)),
    ('fase-3', (2.6, 23.5)),
    ('fase-4', (-1.8, 33.0)),
    ('fase-5', (3.0, 41.5)),
    ('bau', (-3.0, 48.5)),
]
# curva do caminho: entra pelo sul, passa por todos os pontos e sai pelo norte
CTRL = [(0.5, -2.0), (1.2, 2.0)] + [p for _, p in PONTOS[:1]] + [(-1.5, 10.0)] + [PONTOS[1][1]] + [(-0.5, 19.0)] + \
       [PONTOS[2][1]] + [(1.0, 28.5)] + [PONTOS[3][1]] + [(0.2, 37.5)] + [PONTOS[4][1]] + [(0.5, 45.5)] + [PONTOS[5][1]] + [(-0.5, 53.0), (0.0, 58.0)]


def catmull(pts, n=24):
    out = []
    P = [np.array(p, float) for p in pts]
    P = [P[0]] + P + [P[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(P[-2])
    return np.array(out)


CAMINHO = catmull(CTRL)


def _dist(curva, x, y):
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    fx, fy = x.ravel(), y.ravel()
    out = np.empty(fx.shape, np.float32)
    for i in range(0, len(fx), 4096):
        d = np.hypot(curva[:, 0][None, :] - fx[i:i + 4096, None], curva[:, 1][None, :] - fy[i:i + 4096, None])
        out[i:i + 4096] = d.min(axis=1)
    return out.reshape(x.shape)


def dist_caminho(x, y):
    return _dist(CAMINHO, x, y)


# rio: nasce no jardim (leste), corre para sudoeste, cai do penhasco e chega ao lago
RIO_CTRL = [(6.5, 27.0), (5.0, 24.5), (5.5, 21.0), (3.5, 18.0), (0.0, 17.2), (-3.5, 17.6), (-6.2, 16.8), (-6.8, 13.0), (-6.0, 9.5)]
RIO = catmull(RIO_CTRL, 30)
LAGO = (-5.2, 6.0, 3.4, 2.6)  # centro x, y e semieixos
Z_TERRACO = 2.4  # o jardim fica num terraço mais alto
Y_PENHASCO = 16.0


def dist_rio(x, y):
    return _dist(RIO, x, y)


def linha_penhasco(x):
    x = np.asarray(x, float)
    return Y_PENHASCO + 1.3 * np.sin(x * 0.33 + 0.6) + 0.7 * np.sin(x * 0.9 + 2.0)


def suave(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def altura(x, y):
    """Relevo: colinas suaves, terraço do jardim com penhasco (exceto onde o caminho sobe),
    margens altas nas laterais, leito do rio e o lago; montanhas ao norte."""
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    h = np.zeros_like(x)
    # colinas
    for f, a in ((0.08, 0.6), (0.17, 0.25), (0.4, 0.08)):
        h += a * np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * f, b_ * f, 0.3))))(x, y)
    # laterais mais altas (o vale do caminho fica no meio): moldura natural
    h += 1.2 * suave((np.abs(x) - 6.5) / 3.5)
    # terraço do jardim: sobe em y = Y_PENHASCO (degrau íngreme), mais alto a oeste (penhasco da cachoeira)
    # a borda do terraço é sinuosa; é penhasco a oeste (onde cai a cachoeira) e encosta suave a leste
    yb = linha_penhasco(x)
    forte = suave((2.5 - x) / 6.0)
    degrau = suave((y - yb) / (0.9 + 3.5 * (1 - forte)))
    perto_caminho = suave(1 - (dist_caminho(x, y) - 1.2) / 1.6)  # rampa suave onde o caminho sobe
    rampa = suave((y - (yb - 2.5)) / 5.0)
    terr = Z_TERRACO * (degrau * (1 - perto_caminho) + rampa * perto_caminho)
    # depois do portão (y > 35) o chão desce um pouco: fora do jardim
    terr -= 0.5 * suave((y - 35.0) / 4.0)
    h += terr
    # norte: serra ao fundo
    h += 6.0 * suave((y - 52.0) / 9.0) * (0.75 + 0.5 * np.vectorize(lambda a_: ruido_perlin(Vector((a_ * 0.3, 3.1, 0.7))))(x))
    # leito do rio e lago
    h -= 0.35 * suave(1 - dist_rio(x, y) / 0.75)
    lx, ly, ax, ay = LAGO
    e = np.hypot((x - lx) / ax, (y - ly) / ay)
    h -= 0.6 * suave(1 - (e - 0.6) / 0.5)
    # caminho: só um leve rebaixo (trilha pisada), sem virar vala
    h -= 0.08 * suave(1 - dist_caminho(x, y) / 0.9)
    return h


# ------------------------------------------------------------------ terreno (malha) e cores por vértice
NX, NY = 160, 448
xs = np.linspace(X0, X0 + LX, NX)
ys = np.linspace(-1.0, LY, NY)
GX, GY = np.meshgrid(xs, ys)
print('calculando o relevo...')
GZ = altura(GX, GY)
DC = dist_caminho(GX, GY)
DR = dist_rio(GX, GY)


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]) ** 2.2


VERDE = [hexc('#84ad52'), hexc('#5f8f42'), hexc('#a3c26a'), hexc('#4e7c3c')]
TERRA_C, TERRA_B = hexc('#e3c48e'), hexc('#b8925a')
AREIA = hexc('#e8d7a6')
ROCHA = hexc('#9a958c')
SECO = hexc('#b9b468')

nz = np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 0.5, b_ * 0.5, 1.7))))(GX, GY)
nz2 = np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 1.7, b_ * 1.7, 4.2))))(GX, GY)
cor = np.zeros(GX.shape + (3,))
t = (nz * 0.5 + 0.5)
cor = VERDE[0] * (1 - t)[..., None] + VERDE[1] * t[..., None]
cor = cor * (1 - 0.35 * np.clip(nz2, 0, 1))[..., None] + VERDE[2] * (0.35 * np.clip(nz2, 0, 1))[..., None]
# fora do jardim (depois do portão) a grama é mais seca
fora = suave((GY - 35.0) / 3.0)[..., None]
cor = cor * (1 - 0.55 * fora) + SECO * 0.55 * fora
# margens de areia no rio e no lago
lx, ly, ax, ay = LAGO
eL = np.hypot((GX - lx) / ax, (GY - ly) / ay)
margem = np.maximum(suave(1 - (DR - 0.55) / 0.35), suave(1 - (eL - 0.95) / 0.25))[..., None]
cor = cor * (1 - margem) + AREIA * margem
# encostas íngremes viram rocha
gy_, gx_ = np.gradient(GZ, ys, xs)
incl = np.hypot(gx_, gy_)
rocha = suave((incl - 0.9) / 0.6)[..., None]
cor = cor * (1 - rocha) + ROCHA * rocha
# caminho de terra: centro claro e borda mais escura, com bordas irregulares
borda = 0.75 + 0.18 * nz2
cam = suave((borda - DC) / 0.2)[..., None]
centro = suave((borda * 0.6 - DC) / 0.3)[..., None]
terra = TERRA_B * (1 - centro) + TERRA_C * centro
cor = cor * (1 - cam) + terra * cam
# campo de trigo (fora do jardim, a leste) com o chão dourado em sulcos
borda_c = 0.9 * nz
e_campo = np.hypot((GX - 6.4) / 2.7, (GY - 42.4) / 3.5) + 0.22 * borda_c
campo = suave((1.0 - e_campo) / 0.18)[..., None] * (1 - cam)
sulco = 0.85 + 0.15 * np.sin(GY * 9.0)[..., None]
cor = cor * (1 - campo) + hexc('#d4b45a') * sulco * campo
# clareira em volta da árvore da vida: grama clara e dourada, borda irregular
VIDA_XY = (5.9, 27.6)
d_vida = np.hypot(GX - VIDA_XY[0], GY - VIDA_XY[1]) + 0.35 * nz2
clar = suave((3.1 - d_vida) / 0.9)[..., None] * (1 - cam)
cor = cor * (1 - 0.8 * clar) + hexc('#b4cf6a') * 0.8 * clar
# chão batido em volta do altar de Caim (ao norte do trigal)
CAIM_XY = (5.6, 47.4)
d_caim = np.hypot((GX - CAIM_XY[0]) / 1.5, (GY - CAIM_XY[1]) / 1.1) + 0.2 * nz2
chao_c = suave((1.0 - d_caim) / 0.3)[..., None] * (1 - cam)
cor = cor * (1 - 0.7 * chao_c) + hexc('#cdb27a') * 0.7 * chao_c
# longe (norte): perspectiva aérea — mais claro e azulado
longe = suave((GY - 50.0) / 12.0)[..., None]
cor = cor * (1 - 0.55 * longe) + hexc('#9fb3c4') * 0.55 * longe

me = bpy.data.meshes.new('terreno')
verts = np.stack([GX.ravel(), GY.ravel(), GZ.ravel()], 1)
faces = []
for j in range(NY - 1):
    for i in range(NX - 1):
        a = j * NX + i
        faces.append((a, a + 1, a + NX + 1, a + NX))
me.from_pydata(verts.tolist(), [], faces)
cl = me.color_attributes.new('Cor', 'FLOAT_COLOR', 'POINT')
cols = np.concatenate([cor.reshape(-1, 3), np.ones((NX * NY, 1))], 1)
cl.data.foreach_set('color', cols.ravel())
for p in me.polygons:
    p.use_smooth = True
terreno = bpy.data.objects.new('terreno', me)
sc.collection.objects.link(terreno)


def material(nome, cor=(0.5, 0.5, 0.5), rug=0.85, emissao=None, forca=0.0, vertex=False, alfa=1.0, ior=None, transm=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*cor, 1)
    b.inputs['Roughness'].default_value = rug
    if 'Specular IOR Level' in b.inputs:
        b.inputs['Specular IOR Level'].default_value = 0.25
    if vertex:
        a = m.node_tree.nodes.new('ShaderNodeVertexColor')
        a.layer_name = 'Cor'
        m.node_tree.links.new(a.outputs['Color'], b.inputs['Base Color'])
    if emissao is not None:
        b.inputs['Emission Color'].default_value = (*emissao, 1)
        b.inputs['Emission Strength'].default_value = forca
    if transm:
        b.inputs['Transmission Weight'].default_value = transm
    if ior:
        b.inputs['IOR'].default_value = ior
    if alfa < 1:
        b.inputs['Alpha'].default_value = alfa
    return m


terreno.data.materials.append(material('Terreno', vertex=True, rug=0.92))


def z_em(x, y):
    return float(altura(np.array([x]), np.array([y]))[0])


# ------------------------------------------------------------------ água: rio, lago e cachoeira
agua = material('Agua', cor=tuple(hexc('#3c93a8')), rug=0.1, emissao=tuple(hexc('#8fd0d4')), forca=0.08)
# reflexo do céu: faixas suaves de ruído deixam a água pintada, não chapada
_n = agua.node_tree.nodes
_rn = _n.new('ShaderNodeTexNoise'); _rn.inputs['Scale'].default_value = 1.6; _rn.inputs['Detail'].default_value = 3
_rr = _n.new('ShaderNodeValToRGB'); _rr.color_ramp.elements[0].color = (*hexc('#2f7f98'), 1); _rr.color_ramp.elements[1].color = (*hexc('#79c4cf'), 1)
_rr.color_ramp.elements[0].position = 0.35; _rr.color_ramp.elements[1].position = 0.7
agua.node_tree.links.new(_rn.outputs['Fac'], _rr.inputs['Fac'])
agua.node_tree.links.new(_rr.outputs['Color'], _n['Principled BSDF'].inputs['Base Color'])


def faixa_rio():
    vs, fs = [], []
    n = len(RIO)
    for k in range(n):
        p = RIO[k]
        q = RIO[min(k + 1, n - 1)] - RIO[max(k - 1, 0)]
        q = q / (np.linalg.norm(q) + 1e-9)
        lado = np.array([-q[1], q[0]])
        larg = 0.42 + 0.18 * (k / n)
        for s in (-1, 1):
            x, y = p + lado * s * larg
            vs.append((x, y, z_em(*p) + 0.22))
        if k:
            a = 2 * (k - 1)
            fs.append((a, a + 1, a + 3, a + 2))
    m = bpy.data.meshes.new('rio')
    m.from_pydata(vs, [], fs)
    o = bpy.data.objects.new('rio', m)
    sc.collection.objects.link(o)
    o.data.materials.append(agua)


faixa_rio()
bpy.ops.mesh.primitive_circle_add(vertices=48, radius=1.0, fill_type='NGON', location=(LAGO[0], LAGO[1], z_em(LAGO[0], LAGO[1]) + 0.32))
lago = bpy.context.active_object
lago.scale = (LAGO[2] * 1.02, LAGO[3] * 1.02, 1)
lago.data.materials.append(agua)
# a cachoeira: onde o rio cai do terraço, perto de (-6.6, 15.5)
espuma = material('Espuma', cor=(0.95, 0.98, 1.0), rug=0.3, emissao=(0.9, 0.97, 1.0), forca=0.25)
queda = material('Queda', cor=tuple(hexc('#9fdde3')), rug=0.15, emissao=tuple(hexc('#d8f4f6')), forca=0.2)
_qn = queda.node_tree.nodes
_tc = _qn.new('ShaderNodeTexCoord')
_wv = _qn.new('ShaderNodeTexWave'); _wv.wave_type = 'BANDS'; _wv.bands_direction = 'X'
_wv.inputs['Scale'].default_value = 7.0; _wv.inputs['Distortion'].default_value = 6.0; _wv.inputs['Detail'].default_value = 3
_qr = _qn.new('ShaderNodeValToRGB'); _qr.color_ramp.elements[0].color = (*hexc('#4fa6b8'), 1); _qr.color_ramp.elements[1].color = (*hexc('#f2fbfc'), 1)
queda.node_tree.links.new(_tc.outputs['Object'], _wv.inputs['Vector'])
queda.node_tree.links.new(_wv.outputs['Fac'], _qr.inputs['Fac'])
queda.node_tree.links.new(_qr.outputs['Color'], _qn['Principled BSDF'].inputs['Base Color'])
# a cachoeira: lâmina de água que cai do terraço até o lago (onde o rio cruza o penhasco)
yq = float(linha_penhasco(-6.4)) + 0.4
iq = int(np.argmin(np.abs(RIO[:, 1] - yq) + 10 * (RIO[:, 0] > -4)))
xq = float(RIO[iq, 0])
z_alto = z_em(xq, yq + 0.6) + 0.2
z_baixo = z_em(xq, yq - 2.0) + 0.15
z_topo = z_alto + 1.1  # a água sai de um paredão de rochas acima do terraço: queda mais alta
vs, fs = [], []
LIN = 18
for k in range(LIN + 1):
    t = k / LIN
    yy = yq + 0.35 - 1.55 * t ** 1.4
    zz = z_topo + (z_baixo - z_topo) * t
    meia = 0.5 + 0.28 * t  # abre ao cair
    xe = xq - meia - 0.09 * math.sin(t * 13.0 + 0.4) - 0.05 * math.sin(t * 29.0)
    xd = xq + meia + 0.08 * math.sin(t * 11.0 + 1.3) + 0.05 * math.sin(t * 23.0 + 2.0)
    for xx in (xe, xq + 0.07 * math.sin(t * 9.0), xd):
        vs.append((xx, yy, zz))
    if k:
        a0 = 3 * (k - 1)
        fs += [(a0, a0 + 1, a0 + 4, a0 + 3), (a0 + 1, a0 + 2, a0 + 5, a0 + 4)]
mq = bpy.data.meshes.new('cachoeira')
mq.from_pydata(vs, [], fs)
oq = bpy.data.objects.new('cachoeira', mq)
sc.collection.objects.link(oq)
oq.data.materials.append(queda)
# fios de água soltos dos lados (a queda não é uma lâmina só)
for lado, ini, comp, larg in ((-1, 0.15, 0.75, 0.09), (1, 0.3, 0.65, 0.07), (-1, 0.5, 0.45, 0.06)):
    vs2, fs2 = [], []
    for k in range(9):
        t = ini + comp * k / 8
        yy = yq + 0.35 - 1.55 * t ** 1.4
        zz = z_topo + (z_baixo - z_topo) * t
        xc = xq + lado * (0.95 + 0.25 * t) + 0.05 * math.sin(t * 17)
        vs2 += [(xc - larg, yy - 0.02, zz), (xc + larg, yy - 0.02, zz)]
        if k:
            a0 = 2 * (k - 1)
            fs2.append((a0, a0 + 1, a0 + 3, a0 + 2))
    m2 = bpy.data.meshes.new('cachoeira_fio')
    m2.from_pydata(vs2, [], fs2)
    o2 = bpy.data.objects.new('cachoeira_fio', m2)
    sc.collection.objects.link(o2)
    o2.data.materials.append(queda)
rochedo = material('Rochedo', tuple(hexc('#8d8678')), 0.95)
rochedo2 = material('Rochedo2', tuple(hexc('#a9a191')), 0.95)
for k in range(22):  # paredão de rochas: dos dois lados e atrás da queda, mais alto que o terraço
    lado = -1 if k % 2 else 1
    t = RR.uniform(0.0, 1.0)
    yy = yq + 0.55 - 1.5 * t ** 1.4 + RR.uniform(0.1, 0.5)
    zz = z_topo + (z_baixo - z_topo) * t - 0.15
    xx = xq + lado * (1.05 + 0.3 * t + RR.uniform(0.0, 0.5))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=RR.uniform(0.35, 0.65), location=(xx, yy, zz))
    o3 = bpy.context.active_object
    o3.scale = (1.0, RR.uniform(0.8, 1.2), RR.uniform(0.7, 1.1))
    o3.data.materials.append(rochedo if k % 3 else rochedo2)
for k in range(7):  # rochas da borda de cima, por onde a água passa
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=RR.uniform(0.4, 0.6), location=(xq + RR.uniform(-1.4, 1.4), yq + 0.9 + RR.uniform(0, 0.5), z_topo - 0.3))
    bpy.context.active_object.data.materials.append(rochedo)
for k in range(28):  # névoa e espuma no pé da queda, mais larga
    a = RR.uniform(0, 2 * math.pi)
    r = RR.uniform(0.2, 1.3)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=RR.uniform(0.1, 0.24), location=(xq + math.cos(a) * r, yq - 1.25 + math.sin(a) * r * 0.45, z_baixo + 0.12))
    bpy.context.active_object.data.materials.append(espuma)
for k in range(10):  # espuma na borda de cima e pedras dos lados da queda
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=random.uniform(0.07, 0.12), location=(xq + random.uniform(-0.35, 0.35), yq - 0.15, z_alto + 0.05))
    bpy.context.active_object.data.materials.append(espuma)
for k in range(30):
    a = random.uniform(0, 2 * math.pi)
    r = random.uniform(0.1, 0.8)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=random.uniform(0.08, 0.18), location=(xq + math.cos(a) * r, yq - 1.9 + math.sin(a) * r * 0.5, z_baixo + 0.1))
    bpy.context.active_object.data.materials.append(espuma)

# ------------------------------------------------------------------ biblioteca de formas (instâncias)
LIB = bpy.data.collections.new('biblioteca')
sc.collection.children.link(LIB)
LIB.hide_render = True
mats = {
    'tronco': material('Tronco', tuple(hexc('#6b4a2e')), 0.9),
    'copa1': material('Copa1', tuple(hexc('#4f8a3c')), 0.9),
    'copa2': material('Copa2', tuple(hexc('#79a64a')), 0.9),
    'copa3': material('Copa3', tuple(hexc('#3d7448')), 0.9),
    'copa4': material('Copa4', tuple(hexc('#8aa24c')), 0.9),
    'cipreste': material('Cipreste', tuple(hexc('#2c6b3a')), 0.9),
    'palma': material('Palma', tuple(hexc('#5f9f3a')), 0.9),
    'fruto_v': material('FrutoV', tuple(hexc('#d8432f')), 0.5),
    'fruto_o': material('FrutoO', tuple(hexc('#f0a32e')), 0.5),
    'fruto_d': material('FrutoD', tuple(hexc('#ffd25a')), 0.4, emissao=tuple(hexc('#ffcf4a')), forca=1.2),
    'rocha': material('Rocha', tuple(hexc('#8a8f96')), 0.95),
    'rocha2': material('Rocha2', tuple(hexc('#b9bec4')), 0.95),
    'flor_r': material('FlorR', tuple(hexc('#e85d75')), 0.7),
    'flor_a': material('FlorA', tuple(hexc('#f6d64a')), 0.7),
    'flor_b': material('FlorB', tuple(hexc('#f4f1ea')), 0.7),
    'flor_l': material('FlorL', tuple(hexc('#9b7bd8')), 0.7),
    'trigo': material('Trigo', tuple(hexc('#e2bf5c')), 0.8),
    'la': material('La', tuple(hexc('#f2ede0')), 0.9),
    'cara': material('Cara', tuple(hexc('#3b2c24')), 0.8),
    'pedra_altar': material('PedraAltar', tuple(hexc('#a39a88')), 0.95),
    'fogo': material('Fogo', (1.0, 0.55, 0.15), 0.5, emissao=(1.0, 0.45, 0.1), forca=8.0),
    'fumaca': material('Fumaca', (0.92, 0.9, 0.86), 1.0, alfa=0.3),
    'espinho': material('Espinho', tuple(hexc('#6d6a3e')), 0.9),
    'portal': material('Portal', tuple(hexc('#c9b48a')), 0.9),
    'espada': material('Espada', (1.0, 0.7, 0.3), 0.3, emissao=(1.0, 0.5, 0.12), forca=12.0),
    'madeira': material('Madeira', tuple(hexc('#7a5234')), 0.85),
    'cerca': material('Cerca', tuple(hexc('#4a7a34')), 0.9),
}


def nova(nome):
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    LIB.objects.link(ob)
    return ob


def juntar(nome, partes):
    """partes: lista de (bmesh_fn, material). Cria um objeto da biblioteca com vários materiais."""
    ob = nova(nome)
    bm = bmesh.new()
    for fn, mat in partes:
        if mat.name not in [m.name for m in ob.data.materials]:
            ob.data.materials.append(mat)
        idx = [m.name for m in ob.data.materials].index(mat.name)
        antes = set(bm.faces)
        fn(bm)
        for f in bm.faces:
            if f not in antes:
                f.material_index = idx
                f.smooth = True
    bm.to_mesh(ob.data)
    bm.free()
    return ob


def esfera(c, r, sub=2, ruido=0.12, sem=0):
    def f(bm):
        res = bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0, matrix=Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*r, 1)))
        for v in res['verts']:
            d = v.co - Vector(c)
            v.co += d.normalized() * ruido * max(r) * ruido_perlin(v.co * 3.1 + Vector((sem, 0, 0)))
    return f


def cone(c, r1, r2, h, seg=10):
    def f(bm):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r1, radius2=r2, depth=h, matrix=Matrix.Translation(Vector((c[0], c[1], c[2] + h / 2))))
    return f


def caixa(c, s):
    def f(bm):
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*s, 1)))
    return f


# árvores de copa (variações), frutíferas, ciprestes, palmeiras, arbustos, flores, pedras, trigo, ovelhas
def arvore_copa(nome, altura_=2.6, copa=1.3, mat_copa='copa1', frutos=None, sem=0):
    partes = [(cone((0, 0, 0), 0.16, 0.1, altura_ * 0.6), mats['tronco'])]
    rnd = random.Random(sem)
    blocos = [(0, 0, altura_ * 0.75, copa)] + [(rnd.uniform(-0.6, 0.6) * copa, rnd.uniform(-0.6, 0.6) * copa, altura_ * 0.7 + rnd.uniform(-0.2, 0.35) * copa, copa * rnd.uniform(0.55, 0.75)) for _ in range(4)]
    for k, (x, y, z, r) in enumerate(blocos):
        partes.append((esfera((x, y, z), (r, r, r * 0.85), 2, 0.18, sem + k), mats[mat_copa if k % 3 else ('copa4' if mat_copa != 'copa4' else 'copa2')]))
    if frutos:
        for k in range(14):
            a = rnd.uniform(0, 2 * math.pi)
            e = rnd.uniform(-0.3, 0.9)
            p = (math.cos(a) * copa * 0.95, math.sin(a) * copa * 0.95, altura_ * 0.75 + e * copa * 0.6)
            partes.append((esfera(p, (0.11, 0.11, 0.11), 1, 0.0), mats[frutos]))
    return juntar(nome, partes)


ARV = [arvore_copa(f'arv{k}', 2.3 + k * 0.22, 1.05 + 0.09 * k, ['copa1', 'copa2', 'copa3', 'copa4'][k % 4], sem=k * 7) for k in range(6)]
FRUT = [arvore_copa('frut_v', 2.2, 1.0, 'copa2', 'fruto_v', 31), arvore_copa('frut_o', 2.4, 1.1, 'copa1', 'fruto_o', 37)]
CIP = [juntar(f'cip{k}', [(cone((0, 0, 0), 0.1, 0.08, 0.5), mats['tronco']), (cone((0, 0, 0.35), 0.48 + 0.06 * k, 0.04, 3.0 + 0.4 * k, 9), mats['cipreste'])]) for k in range(2)]


def palmeira(nome, sem):
    rnd = random.Random(sem)
    partes = []
    h = 3.2
    for k in range(6):
        partes.append((cone((0.04 * k, 0, k * h / 6), 0.14 - k * 0.01, 0.13 - k * 0.01, h / 6 + 0.02, 7), mats['tronco']))
    for k in range(8):
        a = k * math.pi / 4 + rnd.uniform(-0.2, 0.2)
        c = (0.24 + math.cos(a) * 0.75, math.sin(a) * 0.75, h - 0.15)
        partes.append((esfera(c, (0.75, 0.22, 0.07), 1, 0.0), mats['palma']))
    return juntar(nome, partes)


PALM = [palmeira('palm0', 3)]
ARB = [juntar(f'arb{k}', [(esfera((0, 0, 0.35), (0.6 + 0.1 * k, 0.55, 0.45), 2, 0.2, 40 + k), mats['copa2' if k % 2 else 'copa3'])]) for k in range(3)]
ARB_FLOR = [juntar(f'arbf{k}', [(esfera((0, 0, 0.32), (0.55, 0.5, 0.4), 2, 0.2, 50 + k), mats['copa2'])] + [(esfera((random.uniform(-0.45, 0.45), random.uniform(-0.4, 0.4), 0.45 + random.uniform(0, 0.25)), (0.07, 0.07, 0.07), 1, 0.0), mats[['flor_r', 'flor_a', 'flor_b', 'flor_l'][k]]) for _ in range(10)]) for k in range(4)]
FLOR = [juntar(f'flor{k}', [(esfera((random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), 0.06), (0.06, 0.06, 0.05), 1, 0.0), mats[['flor_r', 'flor_a', 'flor_b', 'flor_l'][k]]) for _ in range(9)]) for k in range(4)]
PED = [juntar(f'ped{k}', [(esfera((0, 0, 0.1), (0.35 + 0.2 * k, 0.3 + 0.1 * k, 0.28 + 0.12 * k), 2, 0.3, 60 + k), mats['rocha' if k % 2 else 'rocha2'])]) for k in range(3)]
TUFO = [juntar(f'tufo{k}', [(cone((random.uniform(-0.15, 0.15), random.uniform(-0.15, 0.15), 0), 0.04, 0.0, 0.25 + random.uniform(0, 0.15), 4), mats['copa2' if k else 'copa4']) for _ in range(9)]) for k in range(2)]
ESP = [juntar(f'esp{k}', [(cone((math.cos(a) * 0.15, math.sin(a) * 0.15, 0), 0.05, 0.0, 0.5 + 0.2 * random.random(), 5), mats['espinho']) for a in np.linspace(0, 6.28, 9)] + [(esfera((0, 0, 0.18), (0.32, 0.32, 0.2), 1, 0.3, 70 + k), mats['espinho'])]) for k in range(2)]
TRIGO = juntar('trigo', [(cone((random.uniform(-0.45, 0.45), random.uniform(-0.45, 0.45), 0), 0.03, 0.05, 0.6 + random.uniform(0, 0.15), 5), mats['trigo']) for _ in range(28)])


def ovelha(nome):
    return juntar(nome, [
        (esfera((0, 0, 0.42), (0.42, 0.28, 0.27), 2, 0.25, 80), mats['la']),
        (esfera((0.42, 0, 0.5), (0.13, 0.1, 0.12), 1, 0.0), mats['cara']),
        *[(cone((dx, dy, 0), 0.04, 0.04, 0.24, 5), mats['cara']) for dx in (-0.22, 0.22) for dy in (-0.12, 0.12)],
    ])


OVE = [ovelha('ove0')]


def plantar(lib, x, y, esc=1.0, rot=None, nome='inst'):
    ob = bpy.data.objects.new(nome, lib.data)
    sc.collection.objects.link(ob)
    ob.location = (x, y, z_em(x, y) - 0.03)
    ob.rotation_euler = (0, 0, rot if rot is not None else random.uniform(0, 6.28))
    ob.scale = (esc, esc, esc)
    return ob


# ------------------------------------------------------------------ marcos das fases (peças únicas)
def objeto_unico(nome, partes, x, y, rot=0.0, esc=1.0):
    lib = juntar(nome, partes)
    return plantar(lib, x, y, esc, rot, nome + '_i')


# 3. árvore da vida (frutos dourados, leve brilho) e árvore do conhecimento (frutos vermelhos)
def arvore_da_vida():
    rnd = random.Random(91)
    copa_v = material('CopaVida', tuple(hexc('#7fb34c')), 0.85, emissao=tuple(hexc('#c9e07a')), forca=0.035)
    copa_v2 = material('CopaVida2', tuple(hexc('#6fae49')), 0.85)
    fruto = material('FrutoVida', tuple(hexc('#f5c536')), 0.35, emissao=tuple(hexc('#ffcf3a')), forca=1.6)
    partes = [(cone((0, 0, 0), 0.42, 0.22, 3.0, 12), mats['tronco'])]
    for k in range(5):  # raízes à mostra
        a = k * 2 * math.pi / 5 + 0.3
        partes.append((esfera((math.cos(a) * 0.45, math.sin(a) * 0.45, 0.08), (0.42, 0.16, 0.14), 1, 0.1, 120 + k), mats['tronco']))
    partes.append((esfera((0, 0, 3.9), (2.2, 2.2, 1.45), 2, 0.14, 130), copa_v))  # cúpula larga
    for k in range(8):  # coroa de lóbulos em volta (silhueta própria, diferente das outras árvores)
        a = k * 2 * math.pi / 8 + rnd.uniform(-0.15, 0.15)
        partes.append((esfera((math.cos(a) * 1.9, math.sin(a) * 1.9, 3.4 + rnd.uniform(-0.2, 0.3)), (0.95, 0.95, 0.8), 2, 0.18, 140 + k), copa_v2 if k % 2 else copa_v))
    partes.append((esfera((0, 0, 4.9), (1.2, 1.2, 0.9), 2, 0.15, 150), copa_v))
    for k in range(34):
        a = rnd.uniform(0, 2 * math.pi)
        r = rnd.uniform(1.4, 2.6)
        partes.append((esfera((math.cos(a) * r, math.sin(a) * r, 3.2 + rnd.uniform(0, 1.9)), (0.14, 0.14, 0.16), 2, 0.0), fruto))
    return juntar('arvore_vida', partes)


vida = arvore_da_vida()
plantar(vida, 5.9, 27.6, 1.15, 0.4, 'arvore_vida_i')
luz_v = bpy.data.lights.new('brilho_vida', 'POINT')
luz_v.energy = 75
luz_v.color = (1.0, 0.85, 0.45)
luz_v.shadow_soft_size = 2.0
lo_v = bpy.data.objects.new('brilho_vida', luz_v)
sc.collection.objects.link(lo_v)
lo_v.location = (5.9, 26.2, z_em(5.9, 27.6) + 5.2)
conh = arvore_copa('arvore_conhecimento', 3.8, 1.8, 'copa3', 'fruto_v', 97)
plantar(conh, -5.4, 25.6, 1.2, 1.2, 'arvore_conhecimento_i')
# nascente do rio: pedras em volta
for k in range(8):
    a = k * math.pi / 4
    plantar(PED[k % 3], 6.6 + math.cos(a) * 0.9, 27.0 + math.sin(a) * 0.7 - 1.3, 0.55, nome='nascente')

# 4. portão do jardim (leste), espada flamejante acima; sebe do jardim dos dois lados; espinhos fora
# recuado ao norte, sobre a própria trilha, para o estandarte da fase 4 não cobrir o arco
_i = int(np.argmin(np.abs(CAMINHO[:, 1] - 37.6)))
xp, yp = float(CAMINHO[_i, 0]), float(CAMINHO[_i, 1])
_tg = CAMINHO[min(_i + 1, len(CAMINHO) - 1)] - CAMINHO[max(_i - 1, 0)]
rot_portao = math.atan2(_tg[1], _tg[0]) - math.pi / 2
_portao = []
for lado in (-1, 1):
    _portao += [(caixa((lado * 1.5, 0, 0.25), (0.8, 0.8, 0.5)), mats['portal']),
                (cone((lado * 1.5, 0, 0.5), 0.3, 0.27, 3.0, 10), mats['portal']),
                (caixa((lado * 1.5, 0, 3.55), (0.75, 0.75, 0.3)), mats['portal'])]
for k in range(9):  # verga em arco, de pedras
    a = math.pi * k / 8
    _portao.append((caixa((-1.5 * math.cos(a), 0, 3.7 + 0.9 * math.sin(a)), (0.55, 0.6, 0.42)), mats['portal']))
objeto_unico('portao', _portao, xp, yp, rot_portao)
espada = objeto_unico('espada', [
    (caixa((0, 0, 0), (0.12, 0.06, 1.5)), mats['espada']),
    (caixa((0, 0, -0.68), (0.5, 0.08, 0.1)), mats['espada']),
], xp, yp, 0.0)
espada.location.z += 6.0
espada.rotation_euler = (0, math.radians(18), 0)
espada.scale = (1.5, 1.5, 1.5)
for k in range(7):  # chamas em volta da lâmina (Gn 3.24: a espada inflamada)
    a = k * 2 * math.pi / 7
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.16, depth=0.7, location=(xp + 0.25 * math.cos(a) + 0.2, yp + 0.12 * math.sin(a), z_em(xp, yp) + 5.2 + 0.35 * k))
    bpy.context.active_object.data.materials.append(mats['fogo'])
# a sebe acompanha o portão; os sorteios dela saem de uma cópia do gerador global, que depois
# avança exatamente como antes (o resto da vegetação continua no mesmo lugar)
_rs = random.Random()
_rs.setstate(random.getstate())
_n_antes = sum(1 for k in range(30) for lado in (-1, 1) if abs(-1.0 + lado * (2.2 + k * 0.42)) <= 9.2)
for _ in range(3 * _n_antes):
    random.random()
for k in range(30):  # sebe viva do jardim, em arco irregular, interrompida no portão
    for lado in (-1, 1):
        x = xp + lado * (2.2 + k * 0.42)
        if abs(x) > 9.2:
            continue
        y = yp - 0.07 * (x - xp) ** 2 + 0.6 * math.sin(x * 1.3) + _rs.uniform(-0.2, 0.2)
        plantar(ARB[k % 3], x, y, _rs.uniform(0.65, 0.9), _rs.uniform(0, 6.28), nome='sebe')
for k in range(14):  # espinhos e cardos do lado de fora
    x, y = random.uniform(-8.5, 8.5), random.uniform(36.5, 40.0)
    if dist_caminho(np.array([x]), np.array([y]))[0] > 1.6:
        plantar(ESP[k % 2], x, y, random.uniform(0.8, 1.2), nome='espinho')

# 5. Caim e Abel: campo de trigo (leste), rebanho (oeste), dois altares com fogo e fumaça
for k in range(170):
    x, y = random.uniform(3.4, 9.0), random.uniform(38.2, 46.8)
    bc = 0.9 * ruido_perlin(Vector((x * 0.5, y * 0.5, 1.7)))
    if math.hypot((x - 6.4) / 2.7, (y - 42.4) / 3.5) + 0.22 * bc > 0.9:
        continue
    if dist_caminho(np.array([x]), np.array([y]))[0] > 1.5:
        plantar(TRIGO, x, y, random.uniform(0.9, 1.15), nome='trigo')
for k in range(11):
    x, y = random.uniform(-8.3, -4.4), random.uniform(39.5, 45.8)
    plantar(OVE[0], x, y, random.uniform(1.15, 1.35), nome='ovelha')


def altar(nome, x, y, fumaca_alta):
    partes = [(esfera((0, 0, 0.25), (0.55, 0.45, 0.3), 1, 0.15, 101), mats['pedra_altar']),
              (esfera((0, 0, 0.55), (0.42, 0.36, 0.2), 1, 0.15, 103), mats['pedra_altar']),
              (cone((0, 0, 0.7), 0.22, 0.0, 0.5, 7), mats['fogo'])]
    objeto_unico(nome, partes, x, y)
    for k in range(5 if fumaca_alta else 2):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.16 + k * 0.06, location=(x + 0.1 * k, y + 0.05 * k, z_em(x, y) + 1.3 + k * 0.42))
        bpy.context.active_object.data.materials.append(mats['fumaca'])


altar('altar_abel', -4.0, 43.6, True)


def altar_caim(x, y):
    lavrada = material('PedraLavrada', tuple(hexc('#cbb68a')), 0.9)
    partes = [(caixa((0, 0, 0.32), (1.25, 0.9, 0.64)), lavrada),
              (caixa((0, 0, 0.7), (1.45, 1.05, 0.14)), lavrada)]
    for k, (dx, dy) in enumerate(((-0.4, 0.15), (0.0, -0.2), (0.42, 0.12))):  # feixes de trigo (a oferta)
        for j in range(11):  # hastes finas, com as espigas abrindo no alto
            ang = j * 2 * math.pi / 11 + k
            r0 = 0.05 + 0.06 * (j % 3) / 2
            partes.append((cone((dx + math.cos(ang) * r0, dy + math.sin(ang) * r0, 0.77), 0.022, 0.018, 0.62, 5), mats['trigo']))
            partes.append((esfera((dx + math.cos(ang) * (r0 + 0.1), dy + math.sin(ang) * (r0 + 0.1), 1.45), (0.045, 0.045, 0.11), 1, 0.0), mats['trigo']))
        partes.append((cone((dx, dy, 1.0), 0.13, 0.13, 0.06, 8), mats['madeira']))  # amarra
    partes.append((cone((0.05, 0.3, 0.77), 0.12, 0.0, 0.3, 6), mats['fogo']))
    objeto_unico('altar_caim', partes, x, y, 0.35, 1.35)
    for k in range(2):  # fumaça baixa, que se espalha de lado (a de Abel sobe alta)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.15 + k * 0.05, location=(x + 0.35 + 0.35 * k, y + 0.3, z_em(x, y) + 1.25 + 0.12 * k))
        bpy.context.active_object.data.materials.append(mats['fumaca'])
    for k in range(5):  # feixes no chão em volta
        a = 0.6 + k * 0.9
        plantar(TRIGO, x + math.cos(a) * 1.25, y + math.sin(a) * 0.95, 0.55, RR.uniform(0, 6.28), nome='feixe')


altar_caim(*CAIM_XY)

# baú: clareira de pedra (o baú interativo fica por cima, na interface)
xb, yb = PONTOS[5][1]
for k in range(9):
    a = k * 2 * math.pi / 9
    plantar(PED[k % 3], xb + math.cos(a) * 1.25, yb + math.sin(a) * 1.0, 0.45, nome='clareira')

# 1. a criação: animais pastando perto do lago (ovelhas) e flores à beira d'água
for k in range(4):
    plantar(OVE[0], random.uniform(-2.5, 1.0) - 3.0, random.uniform(9.5, 11.5), 0.9, nome='ovelha')

# ------------------------------------------------------------------ vegetação de enchimento (sem cobrir o caminho e os pontos)
def livre(x, y, raio):
    if dist_caminho(np.array([x]), np.array([y]))[0] < raio + 0.9:
        return False
    if any(math.hypot(x - px, y - py) < raio + 2.0 for _, (px, py) in PONTOS):
        return False
    if dist_rio(np.array([x]), np.array([y]))[0] < raio + 0.45:
        return False
    lx, ly, ax, ay = LAGO
    if math.hypot((x - lx) / (ax + raio), (y - ly) / (ay + raio)) < 1.05:
        return False
    if raio > 0.2 and math.hypot((x - 6.4) / (2.7 + raio), (y - 42.4) / (3.5 + raio)) < 1.0:
        return False  # o trigal de Caim fica aberto, à vista
    if raio > 0.2 and math.hypot(x - (-1.0), y - 35.2) < raio + 2.2:
        return False  # o portão do jardim fica à vista
    return True


colocados = []


def encher(n, libs, y0, y1, raio, esc=(0.85, 1.15), x0=X0 + 0.3, x1=-X0 - 0.3, dmin=None):
    for _ in range(n * 6):
        if n <= 0:
            break
        x, y = random.uniform(x0, x1), random.uniform(y0, y1)
        if not livre(x, y, raio):
            continue
        if dmin and any(math.hypot(x - a, y - b) < dmin for a, b in colocados):
            continue
        plantar(random.choice(libs), x, y, random.uniform(*esc), nome='veg')
        colocados.append((x, y))
        n -= 1


print('vegetação...')
# bordas: mata densa (moldura do mapa)
encher(80, ARV + CIP, -1, 52, 1.1, dmin=1.3, x0=X0 + 0.2, x1=X0 + 3.4)
encher(80, ARV + CIP, -1, 52, 1.1, dmin=1.3, x0=-X0 - 3.4, x1=-X0 - 0.2)
encher(40, CIP + ARV, 50, 60, 1.0, dmin=1.4)
# criação e prado (sul): árvores esparsas, flores
encher(7, ARV + FRUT, 0, 16, 1.1, dmin=2.6)
encher(60, FLOR, 0, 16, 0.3)
encher(18, ARB_FLOR + ARB, 0, 16, 0.6, dmin=0.9)
# jardim do Éden: frutíferas, palmeiras, ciprestes, flores abundantes
encher(18, FRUT + ARV + PALM + CIP, 17.5, 34, 1.0, dmin=2.2)
encher(160, FLOR, 17.5, 34, 0.3)
for k in range(9):  # canteiros: muitas flores juntas
    cx0, cy0 = random.uniform(-7, 7), random.uniform(18.5, 32.5)
    if not livre(cx0, cy0, 0.9):
        continue
    for _ in range(14):
        x, y = cx0 + random.gauss(0, 0.45), cy0 + random.gauss(0, 0.35)
        if livre(x, y, 0.2):
            plantar(FLOR[k % 4], x, y, random.uniform(0.9, 1.3), nome='canteiro')
encher(30, ARB_FLOR, 17.5, 34, 0.6, dmin=0.8)
# tufos de grama e pedrinhas por toda parte (textura do chão)
encher(220, TUFO, 0, 50, 0.15)
encher(60, PED, 0, 50, 0.25, esc=(0.25, 0.45))
# fora do jardim: pedras, arbustos, poucas árvores
encher(18, PED + ARB, 36, 50, 0.6, dmin=1.0)
encher(8, ARV + PALM, 36, 50, 1.1, dmin=2.5)
# pedras na beira do rio e do penhasco
for k in range(26):
    i = random.randrange(len(RIO))
    p = RIO[i]
    a = random.uniform(0, 6.28)
    x, y = p[0] + math.cos(a) * 0.75, p[1] + math.sin(a) * 0.75
    plantar(PED[k % 3], x, y, random.uniform(0.35, 0.7), nome='pedra_rio')
# ponte de madeira onde o caminho cruza o rio (o ponto mais perto dos dois)
melhor = min(((float(np.hypot(*(c - r))), c, r) for c in CAMINHO[::2] for r in RIO[::2]), key=lambda t: t[0])
cx_, cy_ = melhor[1]
ang = math.atan2(*(CAMINHO[min(len(CAMINHO) - 1, np.argmin(np.hypot(CAMINHO[:, 0] - cx_, CAMINHO[:, 1] - cy_)) + 2)] - np.array([cx_, cy_]))[::-1])
objeto_unico('ponte', [(caixa((0, k * 0.22 - 0.66, 0.3), (1.4, 0.18, 0.08)), mats['madeira']) for k in range(7)] +
             [(caixa((s * 0.72, 0, 0.55), (0.08, 1.6, 0.08)), mats['madeira']) for s in (-1, 1)], cx_, cy_, ang - math.pi / 2)

# ------------------------------------------------------------------ refinamento: clareiras e variedade
def variante(nome, tipo, sem):
    rnd = random.Random(sem)
    if tipo == 'oliveira':  # baixa, larga, verde acinzentado, tronco torto
        partes = [(cone((0, 0, 0), 0.2, 0.12, 1.0, 8), mats['tronco']), (cone((0.15, 0, 0.8), 0.12, 0.08, 0.6, 8), mats['tronco'])]
        for k in range(7):
            a = k * 2 * math.pi / 7
            partes.append((esfera((math.cos(a) * 0.8, math.sin(a) * 0.7, 1.45 + rnd.uniform(-0.15, 0.2)), (0.62, 0.58, 0.42), 2, 0.25, sem + k), mats['oliva' if k % 3 else 'oliva2']))
        return juntar(nome, partes)
    if tipo == 'terebinto':  # copa em guarda-chuva, achatada
        partes = [(cone((0, 0, 0), 0.2, 0.13, 2.4, 8), mats['tronco']),
                  (esfera((0, 0, 2.6), (1.9, 1.7, 0.6), 2, 0.2, sem), mats['copa5'])]
        for k in range(4):
            a = rnd.uniform(0, 2 * math.pi)
            partes.append((esfera((math.cos(a) * 1.1, math.sin(a) * 1.0, 2.9), (0.8, 0.8, 0.45), 2, 0.2, sem + 5 + k), mats['copa4']))
        return juntar(nome, partes)
    if tipo == 'alamo':  # alto e estreito, verde-amarelado
        return juntar(nome, [(cone((0, 0, 0), 0.13, 0.08, 1.2, 8), mats['tronco']),
                             (esfera((0, 0, 2.6), (0.75, 0.75, 1.9), 2, 0.15, sem), mats['copa_clara']),
                             (esfera((0.2, 0.1, 3.5), (0.45, 0.45, 0.9), 2, 0.15, sem + 1), mats['copa_clara'])])
    if tipo == 'cedro':  # camadas escuras, em degraus
        partes = [(cone((0, 0, 0), 0.18, 0.1, 1.2, 8), mats['tronco'])]
        for k in range(4):
            partes.append((esfera((rnd.uniform(-0.1, 0.1), 0, 1.3 + k * 0.75), (1.5 - k * 0.3, 1.4 - k * 0.28, 0.32), 2, 0.2, sem + k), mats['copa_escura']))
        return juntar(nome, partes)
    if tipo == 'amendoeira':  # em flor (Gn 43.11 cita amêndoas entre os bons frutos da terra)
        return arvore_copa(nome, 2.3, 1.0, 'amendoa', None, sem)
    return arvore_copa(nome, 2.0 + rnd.uniform(0, 1.2), 0.9 + rnd.uniform(0, 0.5), 'copa_escura', None, sem)


mats.update({
    'oliva': material('Oliva', tuple(hexc('#8e9c5e')), 0.9), 'oliva2': material('Oliva2', tuple(hexc('#a6ad7a')), 0.9),
    'copa5': material('Copa5', tuple(hexc('#5f9a3e')), 0.9), 'copa_clara': material('CopaClara', tuple(hexc('#a9b949')), 0.9),
    'copa_escura': material('CopaEscura', tuple(hexc('#2f5f3b')), 0.9), 'amendoa': material('Amendoa', tuple(hexc('#efcfd6')), 0.85),
})
VARIANTES = [variante(f'var_{t}{k}', t, 300 + 17 * k + i * 101) for i, t in enumerate(['oliveira', 'terebinto', 'alamo', 'cedro', 'amendoeira', 'escura']) for k in range(2)]
PESOS = {'oliveira': 3, 'terebinto': 2, 'alamo': 2, 'cedro': 2, 'amendoeira': 1, 'escura': 2}

PORTAO_XY = (xp, yp)
ALTAS = ('arv', 'frut', 'cip', 'palm', 'arb', 'var_')
for ob in list(sc.collection.objects):
    if ob.data is None or not hasattr(ob.data, 'name'):
        continue
    d = ob.data.name
    x, y = ob.location.x, ob.location.y
    alta = d.startswith(ALTAS) and ob.name.startswith(('veg', 'sebe', 'espinho'))
    if alta and math.hypot(x - VIDA_XY[0], y - VIDA_XY[1]) < 3.4 and ob.name != 'arvore_vida_i':
        bpy.data.objects.remove(ob)  # clareira da árvore da vida
        continue
    if (alta or ob.name == 'espinho') and math.hypot(x - PORTAO_XY[0], y - PORTAO_XY[1]) < 2.6:  # (a espada fica)
        bpy.data.objects.remove(ob)  # nada na frente do portão
        continue
    if (alta or d.startswith('trigo')) and ob.name != 'feixe' and math.hypot((x - CAIM_XY[0]) / 1.7, (y - CAIM_XY[1]) / 1.3) < 1.0:
        bpy.data.objects.remove(ob)  # o altar de Caim fica à vista
        continue
    # metade de cima: troca parte das copas iguais por outras espécies, alturas e tons
    if ob.name.startswith('veg') and d.startswith('arv') and y > 29.0 and RR.random() < 0.72:
        tipos = [t for t, p in PESOS.items() for _ in range(p)]
        t = RR.choice(tipos)
        cand = [v for v in VARIANTES if v.name.startswith(f'var_{t}')]
        ob.data = RR.choice(cand).data
        perto = min(math.hypot(x - px, y - py) for _, (px, py) in PONTOS)
        e = RR.uniform(0.8, 1.3) if perto > 4.0 else RR.uniform(0.75, 1.0)
        ob.scale = (ob.scale[0] * e,) * 3
# anel de flores em volta da clareira da árvore da vida
for k in range(26):
    a = k * 2 * math.pi / 26 + RR.uniform(-0.1, 0.1)
    r = RR.uniform(2.7, 3.3)
    x, y = VIDA_XY[0] + math.cos(a) * r, VIDA_XY[1] + math.sin(a) * r
    if dist_caminho(np.array([x]), np.array([y]))[0] > 1.1 and dist_rio(np.array([x]), np.array([y]))[0] > 0.6:
        plantar(FLOR[k % 4], x, y, RR.uniform(1.0, 1.4), RR.uniform(0, 6.28), nome='flor_vida')

# ------------------------------------------------------------------ luz, céu e câmera
w = bpy.data.worlds.new('ceu')
sc.world = w
w.use_nodes = True
bg = w.node_tree.nodes['Background']
bg.inputs[0].default_value = (*hexc('#a9cbe6'), 1)
bg.inputs[1].default_value = 0.6
sol = bpy.data.lights.new('sol', 'SUN')
sol.energy = 4.2
sol.color = tuple(hexc('#fff0d2'))
sol.angle = math.radians(6)
so = bpy.data.objects.new('sol', sol)
sc.collection.objects.link(so)
so.rotation_euler = (math.radians(48), math.radians(-28), math.radians(-35))  # do alto à esquerda

cam_d = bpy.data.cameras.new('cam')
cam_d.type = 'ORTHO'
cam = bpy.data.objects.new('cam', cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
INCL = math.radians(52)  # inclinação a partir da vertical
cam.rotation_euler = (INCL, 0, 0)
# o quadro cobre a largura do terreno e de y = 0 a y = 52 (projeção inclinada)
y_ini, y_fim = 0.0, 60.0
alt_quadro = (y_fim - y_ini) * math.cos(INCL) + 3.0 * math.sin(INCL)
cam_d.ortho_scale = max(LX * 0.94, alt_quadro)
sc.render.resolution_x = LARG_PX
sc.render.resolution_y = int(LARG_PX * alt_quadro / (LX * 0.94))
cam_d.ortho_scale = alt_quadro if alt_quadro > LX * 0.94 else LX * 0.94
centro = Vector((0, (y_ini + y_fim) / 2, 0.8))
dirc = Vector((0, -math.sin(INCL), math.cos(INCL)))  # da cena para a câmera
cam.location = centro + dirc * 60
cam_d.clip_end = 200

sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = AMOSTRAS
sc.cycles.use_denoising = False
sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 4
sc.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Standard'
sc.view_settings.look = 'None'
sc.view_settings.exposure = -0.25
sc.render.film_transparent = False
vl = sc.view_layers[0]
vl.use_pass_normal = True
vl.use_pass_z = True

# ------------------------------------------------------------------ acabamento pintado (compositor)
# - pinceladas: filtro de Kuwahara sobre a cor (áreas de cor chapadas, bordas preservadas);
# - contorno escuro (#2B1D10) nas quinas das formas (normais) e nas silhuetas (profundidade),
#   como pede a identidade visual para a vista aérea;
# - um pouco mais de saturação e calor.
sc.use_nodes = True
nt = sc.node_tree
for n_ in list(nt.nodes):
    nt.nodes.remove(n_)
rl = nt.nodes.new('CompositorNodeRLayers')
kuw = nt.nodes.new('CompositorNodeKuwahara')
kuw.size = max(2, int(LARG_PX / 300))
sob_n = nt.nodes.new('CompositorNodeFilter')
sob_n.filter_type = 'SOBEL'
bw_n = nt.nodes.new('CompositorNodeRGBToBW')
norm_z = nt.nodes.new('CompositorNodeNormalize')
sob_z = nt.nodes.new('CompositorNodeFilter')
sob_z.filter_type = 'SOBEL'
bw_z = nt.nodes.new('CompositorNodeRGBToBW')
mz = nt.nodes.new('CompositorNodeMath')
mz.operation = 'MULTIPLY'
mz.inputs[1].default_value = 40.0
mx_ = nt.nodes.new('CompositorNodeMath')
mx_.operation = 'MAXIMUM'
lim = nt.nodes.new('CompositorNodeMath')
lim.operation = 'GREATER_THAN'
lim.inputs[1].default_value = 0.55
desf = nt.nodes.new('CompositorNodeBlur')
desf.size_x = desf.size_y = 1
forca = nt.nodes.new('CompositorNodeMath')
forca.operation = 'MULTIPLY'
forca.inputs[1].default_value = 0.55
mix = nt.nodes.new('CompositorNodeMixRGB')
mix.inputs[2].default_value = (*hexc('#2b1d10'), 1)
hs = nt.nodes.new('CompositorNodeHueSat')
hs.inputs['Saturation'].default_value = 1.0
cb = nt.nodes.new('CompositorNodeColorBalance')
cb.correction_method = 'LIFT_GAMMA_GAIN'
cb.gain = (1.04, 1.0, 0.94)
comp = nt.nodes.new('CompositorNodeComposite')
L = nt.links
L.new(rl.outputs['Image'], kuw.inputs['Image'])
L.new(rl.outputs['Normal'], sob_n.inputs['Image'])
L.new(sob_n.outputs['Image'], bw_n.inputs['Image'])
L.new(rl.outputs['Depth'], norm_z.inputs[0])
L.new(norm_z.outputs[0], sob_z.inputs['Image'])
L.new(sob_z.outputs['Image'], bw_z.inputs['Image'])
L.new(bw_z.outputs[0], mz.inputs[0])
L.new(bw_n.outputs[0], mx_.inputs[0])
L.new(mz.outputs[0], mx_.inputs[1])
L.new(mx_.outputs[0], lim.inputs[0])
L.new(lim.outputs[0], desf.inputs['Image'])
L.new(desf.outputs['Image'], forca.inputs[0])
L.new(forca.outputs[0], mix.inputs['Fac'])
L.new(kuw.outputs['Image'], mix.inputs[1])
L.new(mix.outputs['Image'], hs.inputs['Image'])
L.new(hs.outputs['Image'], cb.inputs['Image'])
L.new(cb.outputs['Image'], comp.inputs['Image'])
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.render.filepath = os.path.join(PASTA, 'eden.png')

# ------------------------------------------------------------------ posições dos pontos na imagem
bpy.context.view_layer.update()
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
pontos = []
for nome, (x, y) in PONTOS:
    co = world_to_camera_view(sc, cam, Vector((x, y, z_em(x, y))))
    pontos.append({'id': nome, 'x': round(co.x, 5), 'y': round(1 - co.y, 5)})
# referências (só para conferência): onde caem na imagem o topo do arco do portão, a árvore da vida e os altares
refs = {}
for nome, co3 in (('arco_portao', (xp, yp, z_em(xp, yp) + 4.6)), ('base_portao', (xp, yp, z_em(xp, yp))),
                  ('arvore_vida', (VIDA_XY[0], VIDA_XY[1], z_em(*VIDA_XY) + 4.5)), ('altar_caim', (*CAIM_XY, z_em(*CAIM_XY) + 0.8)),
                  ('altar_abel', (-4.0, 43.6, z_em(-4.0, 43.6) + 0.6))):
    co = world_to_camera_view(sc, cam, Vector(co3))
    refs[nome] = {'x': round(co.x, 5), 'y': round(1 - co.y, 5)}
info = {'largura': sc.render.resolution_x, 'altura': sc.render.resolution_y, 'pontos': pontos, 'referencias': refs}
json.dump(info, open(os.path.join(PASTA, 'eden.json'), 'w'), indent=1)
print('pontos', info)
print('renderizando', sc.render.resolution_x, 'x', sc.render.resolution_y, 'amostras', AMOSTRAS)
bpy.ops.render.render(write_still=True)
print('OK', sc.render.filepath)
