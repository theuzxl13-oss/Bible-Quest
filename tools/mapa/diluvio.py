"""
MAPA DE GÊNESIS — REGIÃO 2: TERRAS DO DILÚVIO (fases 6 a 10 e o baú da fase 10)

MUNDO CONTÍNUO. Esta cena CONTÉM o Éden aprovado (montado pelo próprio eden.py, sem mudança) e o
continua para o norte. A câmera é a mesma do Éden, deslocada exatamente uma altura de imagem para
cima: a última linha desta imagem é a continuação da primeira linha do Éden. Dentro do quadro do
Éden nada muda; o terreno só é remodelado e repintado além dele, com uma transição suave.

Narrativa (sem figuras humanas, sem textos), alinhada aos títulos reais das fases:
- saída do Éden: a mata do jardim rareia na serra; oliveiras soltas e capim seco;
- fase 6, A corrupção da humanidade (Gn 6.5,11): cidade de muros, casas de barro, fumaça,
  árvores secas, chão gasto — tensão e afastamento da natureza;
- fase 7, Noé, um homem justo (Gn 6.9): a casa de Noé, com horta e oliveiras, e o começo do canteiro;
- fase 8, A construção da arca (Gn 6.14-16): o casco em construção (quilha, cavernas, andaimes),
  toras, tocos e pilhas de madeira;
- fase 9, O dilúvio (Gn 7.17-24): a planície alagada, a arca pronta flutuando, copas e telhados
  submersos, sombra de tempestade e chuva; a trilha segue por uma calçada de pedras;
- entre 9 e 10, as águas baixam (Gn 8.3-11): lama, poças, brotos e a pomba;
- fase 10, A aliança com Noé (Gn 8.20; 9.13): o monte Ararate (Gn 8.4) com neve no alto, o altar
  com fumaça e o arco-íris; o baú fica no ombro do monte.

Uso: blender -b -P diluvio.py -- <pasta> [largura_px] [amostras]
Saída: <pasta>/diluvio.png (imagem final), <pasta>/diluvio_emenda.png (faixa extra abaixo, que
mostra a mesma área do topo do Éden, para conferir a emenda) e <pasta>/diluvio.json (pontos).
"""
import math
import os
import random
import runpy
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.noise import noise as ruido_perlin

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import comum  # noqa: E402
from comum import catmull, cone, esfera, hexc, material, suave  # noqa: E402

PASTA, LARG_PX, AMOSTRAS = comum.argumentos(64)
MARGEM_PX = max(8, int(round(48 * LARG_PX / 1080)))  # faixa extra abaixo (contexto do filtro e conferência da emenda)


# ------------------------------------------------------------------ 1. o Éden aprovado, exatamente como é (sem renderizar)
class _SemRender:
    def __init__(self, orig):
        self._orig = orig

    def __getattr__(self, k):
        if k == 'render':
            alvo = getattr(self._orig, k)
            return type('R', (), {'render': staticmethod(lambda *a, **kw: {'FINISHED'}), '__getattr__': lambda s, n: getattr(alvo, n)})()
        return getattr(self._orig, k)


_ops, _argv = bpy.ops, sys.argv
bpy.ops = _SemRender(_ops)
sys.argv = [sys.argv[0], '--', os.path.join(PASTA, '_eden'), str(LARG_PX), str(AMOSTRAS)]
try:
    E = runpy.run_path(os.path.join(AQUI, 'eden.py'), run_name='__main__')
finally:
    bpy.ops, sys.argv = _ops, _argv

sc = bpy.context.scene
cam = sc.camera
bib, mats = E['bib'], E['mats']
altura_eden, TERRA_C, TERRA_B, ROCHA = E['altura'], E['TERRA_C'], E['TERRA_B'], E['ROCHA']
ARV, CIP, PED, TUFO, FLOR, ARB, OVE, VARIANTES = E['ARV'], E['CIP'], E['PED'], E['TUFO'], E['FLOR'], E['ARB'], E['OVE'], E['VARIANTES']
X0, LX = E['X0'], E['LX']

random.seed(606)
np.random.seed(606)
RR = random.Random(6060)

# quadro do Éden: s(y, z) = quanto um ponto está ACIMA da borda de cima da imagem do Éden (unidades do mundo)
INCL = cam.rotation_euler.x
UP = Vector((0.0, math.cos(INCL), math.sin(INCL)))
ORTHO = cam.data.ortho_scale
RESX, RESY = sc.render.resolution_x, sc.render.resolution_y
C0 = cam.location.copy()


def alem_do_eden(y, z):
    return (np.asarray(y) - C0.y) * UP.y + (np.asarray(z) - C0.z) * UP.z - ORTHO / 2


def peso_transicao(s):
    """0 dentro do Éden (e numa folga de 0,5), 1 a partir de 3 unidades além da borda."""
    return suave((np.asarray(s) - 0.5) / 2.5)


# ------------------------------------------------------------------ 2. pontos e caminho da região
PONTOS = [
    ('fase-6', (-2.0, 70.5)),
    ('fase-7', (2.2, 79.5)),
    ('fase-8', (-2.5, 87.5)),
    ('fase-9', (2.0, 96.5)),
    ('fase-10', (-2.0, 104.5)),
    ('bau', (2.8, 109.5)),
]
# continua a trilha do Éden a partir do último ponto dele (0, 58), sem dobra
CTRL2 = [(-0.5, 53.0), (0.0, 58.0), (0.9, 62.5), (-0.4, 66.0)] + [PONTOS[0][1]] + [(0.6, 75.0)] + [PONTOS[1][1]] + \
        [(0.4, 83.5)] + [PONTOS[2][1]] + [(-0.6, 92.0)] + [PONTOS[3][1]] + [(0.9, 100.5)] + [PONTOS[4][1]] + \
        [(-0.3, 107.2)] + [PONTOS[5][1]] + [(1.2, 112.8), (0.2, 116.5), (0.0, 122.0), (0.5, 130.0)]
CAMINHO2 = catmull(CTRL2)[24:]  # a partir de (0, 58)
CAMINHO_TODO = np.concatenate([E['CAMINHO'], CAMINHO2])


def dist_caminho(x, y):
    return comum.dist_curva(CAMINHO_TODO, x, y)


AGUA_Z = 0.02          # nível da água do dilúvio
CIDADE = (5.0, 75.2, 3.9, 2.8)   # centro e semieixos dos muros
ARCA_OBRA = (4.4, 88.6)          # centro do casco em construção (comprimento ao longo de x)
ARCA_PRONTA = (-5.0, 98.6)
ALTAR = (0.8, 106.3)
PICO = (4.4, 111.8, 8.2)
PICO2 = (-5.4, 113.6, 5.0)
CASA_NOE = (6.2, 82.0)


def relevo2(x, y):
    """Relevo próprio da região (vetorizado)."""
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    h = np.zeros_like(x)
    for f, a in ((0.08, 0.5), (0.17, 0.22), (0.45, 0.06)):
        h += a * np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * f + 31.0, b_ * f, 0.9))))(x, y)
    h += 1.3 * suave((np.abs(x) - 6.8) / 3.0)                    # margens mais altas (moldura)
    h += 5.2 * (1 - suave((y - 61.5) / 8.0))                     # a serra que sai do Éden desce para a planície
    h += 0.35
    # bacia do dilúvio (com a calçada de pedras da trilha por cima)
    bacia = suave((y - 90.5) / 2.2) * (1 - suave((y - 102.5) / 2.8))
    calcada = suave(1 - (dist_caminho(x, y) - 0.7) / 0.5)
    h += 0.4 * (1 - bacia)
    h -= 1.0 * bacia * (1 - calcada)
    h += 0.05 * bacia * calcada
    # o Ararate: pico maior, pico menor, sopé e plataforma da fase 10
    px, py, pz = PICO
    h += pz * np.exp(-(((x - px) / 2.7) ** 2 + ((y - py) / 2.5) ** 2) / 2) * (0.9 + 0.12 * np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 0.6, b_ * 0.6, 5.5))))(x, y))
    qx, qy, qz = PICO2
    h += qz * np.exp(-(((x - qx) / 2.1) ** 2 + ((y - qy) / 2.3) ** 2) / 2)
    h += 1.0 * suave((y - 101.5) / 4.0) * (1 - suave((y - 117.0) / 5.0))
    plat = suave(1 - (np.hypot(x - PONTOS[4][1][0], y - PONTOS[4][1][1]) - 1.6) / 1.2)
    h = h * (1 - 0.6 * plat) + (1.45 + 0.35) * 0.6 * plat
    # além do monte: terras baixas (longe)
    h -= 0.6 * suave((y - 119.0) / 6.0)
    h -= 0.06 * suave(1 - dist_caminho(x, y) / 0.9)              # trilha pisada
    return h


def altura_final(x, y):
    """Altura que a cena usa: a do Éden dentro do quadro dele, a da região além (transição suave)."""
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    he = altura_eden(x, y)
    b = suave((y - 59.5) / 6.5)                                  # serra do Éden -> relevo da região
    h2 = he * (1 - b) + relevo2(x, y) * b
    w = peso_transicao(alem_do_eden(y, he))
    return he * (1 - w) + h2 * w


def z2(x, y):
    return float(altura_final(np.array([x]), np.array([y]))[0])


# ------------------------------------------------------------------ 3. cores do chão da região
def cores_regiao(X, Y, Z):
    nz = np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 0.5, b_ * 0.5, 1.7))))(X, Y)
    nz2 = np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 1.7, b_ * 1.7, 4.2))))(X, Y)
    t = (nz * 0.5 + 0.5)[..., None]
    zona = lambda a, b: suave((Y - a) / b)[..., None]  # noqa: E731
    # serra (verde do Éden) -> capim seco -> chão gasto da cidade -> terra do canteiro
    verde = hexc('#7fa64e') * (1 - t) + hexc('#5f8f42') * t
    seco = hexc('#b2a865') * (1 - t) + hexc('#9a9556') * t
    gasto = hexc('#b49a68') * (1 - t) + hexc('#9c845a') * t
    canteiro = hexc('#b8955f') * (1 - t) + hexc('#a3844f') * t
    lama = hexc('#6b5a40') * (1 - t) + hexc('#57503c') * t
    broto = hexc('#86ad55') * (1 - t) + hexc('#6f9a45') * t
    cor = verde
    cor = cor * (1 - zona(62.0, 4.0)) + seco * zona(62.0, 4.0)
    cor = cor * (1 - zona(68.5, 2.5)) + gasto * zona(68.5, 2.5)
    cor = cor * (1 - zona(78.0, 2.0)) + seco * zona(78.0, 2.0)
    cor = cor * (1 - zona(83.5, 1.5)) + canteiro * zona(83.5, 1.5)
    cor = cor * (1 - zona(90.0, 1.5)) + lama * zona(90.0, 1.5)
    cor = cor * (1 - zona(104.0, 2.5)) + broto * zona(104.0, 2.5)
    # horta e pomar da casa de Noé: verde no meio do chão seco
    hx, hy = CASA_NOE
    horta = suave((2.6 - np.hypot((X - hx) / 1.2, (Y - hy) / 0.9) - 0.3 * nz2) / 0.6)[..., None]
    cor = cor * (1 - horta) + hexc('#7fa64e') * horta
    campo = suave((1.0 - np.hypot((X + 5.6) / 2.6, (Y - 79.5) / 1.7) - 0.2 * nz2) / 0.2)[..., None]
    sulco = 0.86 + 0.14 * np.sin(Y * 8.0)[..., None]
    cor = cor * (1 - campo) + hexc('#a68f5c') * sulco * campo
    # pátio da cidade, mais escuro e pisado
    cx, cy, ax, ay = CIDADE
    patio = suave((1.0 - np.hypot((X - cx) / ax, (Y - cy) / ay)) / 0.25)[..., None]
    cor = cor * (1 - patio) + hexc('#8f7a55') * patio
    # encostas íngremes viram rocha; neve no alto do Ararate
    gy_, gx_ = np.gradient(Z, Y[:, 0], X[0, :])
    rocha = suave((np.hypot(gx_, gy_) - 0.75) / 0.5)[..., None]
    cor = cor * (1 - rocha) + hexc('#8d877c') * rocha
    neve = (suave((Z - 5.4 - 0.6 * nz2) / 0.5) * suave((Y - 106.0) / 2.0))[..., None]
    cor = cor * (1 - neve) + hexc('#f1f2ee') * neve
    # perto do Éden, a mesma névoa de distância que a borda dele tem (some subindo a serra)
    nevoa = (0.42 * (1 - suave((Y - 58.0) / 7.0)))[..., None]
    cor = cor * (1 - nevoa) + hexc('#9fb3c4') * nevoa
    # longe (além do monte): perspectiva aérea
    longe = (0.5 * suave((Y - 116.0) / 10.0))[..., None]
    cor = cor * (1 - longe) + hexc('#a7b8c4') * longe
    # a trilha (mesma pintura do Éden), com calçada de pedras na bacia do dilúvio
    DC = dist_caminho(X, Y)
    borda = 0.75 + 0.18 * nz2
    cam_ = suave((borda - DC) / 0.2)[..., None]
    centro = suave((borda * 0.6 - DC) / 0.3)[..., None]
    terra = TERRA_B * (1 - centro) + TERRA_C * centro
    bacia = (suave((Y - 90.5) / 2.2) * (1 - suave((Y - 102.5) / 2.8)))[..., None]
    nz6 = np.vectorize(lambda a_, b_: ruido_perlin(Vector((a_ * 5.5, b_ * 5.5, 7.3))))(X, Y)
    pedras = hexc('#a99d86') * (0.88 + 0.16 * nz6)[..., None]
    terra = terra * (1 - bacia) + pedras * bacia
    return cor * (1 - cam_) + terra * cam_


# ------------------------------------------------------------------ 4. terreno: remodela além do Éden e estende para o norte (uma malha só)
me = E['terreno'].data
bm = bmesh.new()
bm.from_mesh(me)
bm.verts.ensure_lookup_table()
lay = bm.verts.layers.float_color['Cor']
NX = len(E['xs'])
co = np.array([v.co[:] for v in bm.verts])
cor_eden = np.array([v[lay][:3] for v in bm.verts])
s = alem_do_eden(co[:, 1], co[:, 2])
fora = s > 0.5
print('vértices do Éden remodelados (fora do quadro dele):', int(fora.sum()), 'de', len(co))
idx = np.nonzero(fora)[0]
xf, yf = co[idx, 0], co[idx, 1]
w = peso_transicao(s[idx])
zf = altura_final(xf, yf)
# cores: calculadas numa grade (precisam de vizinhos para a inclinação); aqui usa a cor dos pontos via grade auxiliar
NY2_ = 900
ys_aux = np.linspace(52.0, 140.0, NY2_)
GXa, GYa = np.meshgrid(E['xs'], ys_aux)
print('calculando o relevo da região...')
GZa = altura_final(GXa, GYa)
CORa = cores_regiao(GXa, GYa, GZa)


def cor_em(x, y):
    i = np.clip(np.round((np.asarray(y) - 52.0) / (88.0 / (NY2_ - 1))).astype(int), 0, NY2_ - 1)
    j = np.clip(np.round((np.asarray(x) - X0) / (LX / (NX - 1))).astype(int), 0, NX - 1)
    return CORa[i, j]


cf = cor_em(xf, yf)
for k, i in enumerate(idx):
    v = bm.verts[i]
    v.co.z = float(zf[k])
    c = cor_eden[i] * (1 - w[k]) + cf[k] * w[k]
    v[lay] = (float(c[0]), float(c[1]), float(c[2]), 1.0)
# novas linhas ao norte, continuando a grade do Éden (mesmo espaçamento)
dy = float(E['ys'][1] - E['ys'][0])
ultima = [bm.verts[(len(E['ys']) - 1) * NX + i] for i in range(NX)]
y0 = float(E['ys'][-1])
ys_novas = y0 + dy * np.arange(1, int((140.0 - y0) / dy) + 1)
anterior = ultima
for yv in ys_novas:
    xs_ = np.array(E['xs'])
    zs = altura_final(xs_, np.full(NX, yv))
    cs = cor_em(xs_, np.full(NX, yv))
    linha = []
    for i in range(NX):
        v = bm.verts.new((float(xs_[i]), float(yv), float(zs[i])))
        v[lay] = (float(cs[i][0]), float(cs[i][1]), float(cs[i][2]), 1.0)
        linha.append(v)
    for i in range(NX - 1):
        f = bm.faces.new((anterior[i], anterior[i + 1], linha[i + 1], linha[i]))
        f.smooth = True
    anterior = linha
bm.to_mesh(me)
bm.free()
me.update()
# prova: nenhum vértice DENTRO do quadro do Éden mudou (posição nem cor)
_co2 = np.empty(len(me.vertices) * 3, np.float32)
me.vertices.foreach_get('co', _co2)
_co2 = _co2.reshape(-1, 3)[:len(co)]
_cor2 = np.empty(len(me.color_attributes['Cor'].data) * 4, np.float32)
me.color_attributes['Cor'].data.foreach_get('color', _cor2)
_cor2 = _cor2.reshape(-1, 4)[:len(co), :3]
_dentro = s <= 0.0
MUDOU_DENTRO = int((np.abs(_co2[_dentro] - co[_dentro]).max(axis=1) > 0).sum() + (np.abs(_cor2[_dentro] - cor_eden[_dentro]).max(axis=1) > 0).sum())
print('vértices do quadro do Éden alterados:', MUDOU_DENTRO, 'de', int(_dentro.sum()))

# ------------------------------------------------------------------ 5. materiais e formas novas
mats.update({
    'barro': material('Barro', tuple(hexc('#c8a477')), 0.92),
    'barro2': material('Barro2', tuple(hexc('#b58d63')), 0.92),
    'barro3': material('Barro3', tuple(hexc('#d6bb8e')), 0.92),
    'muro': material('Muro', tuple(hexc('#bfab86')), 0.95),
    'sombra': material('Vao', tuple(hexc('#2e2116')), 0.95),
    'seco': material('Seco', tuple(hexc('#7a6a52')), 0.95),
    'capim': material('Capim', tuple(hexc('#b9ad6a')), 0.9),
    'madeira_c': material('MadeiraClara', tuple(hexc('#a7794b')), 0.85),
    'madeira_e': material('MadeiraEscura', tuple(hexc('#5e3f26')), 0.85),
    'toco': material('Toco', tuple(hexc('#c9a678')), 0.9),
    'pomba': material('Pomba', tuple(hexc('#f7f5ef')), 0.6),
    'broto': material('Broto', tuple(hexc('#9cc45a')), 0.8),
    'rocha3': material('Rocha3', tuple(hexc('#8d877c')), 0.95),
})
# madeira do casco: tábuas (faixas) e betume (Gn 6.14)
casco_m = material('Casco', tuple(hexc('#6e4a2c')), 0.8)
_n = casco_m.node_tree.nodes
_tc = _n.new('ShaderNodeTexCoord')
_wv = _n.new('ShaderNodeTexWave')
_wv.wave_type = 'BANDS'
_wv.bands_direction = 'Z'
_wv.inputs['Scale'].default_value = 9.0
_wv.inputs['Distortion'].default_value = 1.5
_rp = _n.new('ShaderNodeValToRGB')
_rp.color_ramp.elements[0].color = (*hexc('#4a3120'), 1)
_rp.color_ramp.elements[1].color = (*hexc('#7d5634'), 1)
casco_m.node_tree.links.new(_tc.outputs['Object'], _wv.inputs['Vector'])
casco_m.node_tree.links.new(_wv.outputs['Fac'], _rp.inputs['Fac'])
casco_m.node_tree.links.new(_rp.outputs['Color'], _n['Principled BSDF'].inputs['Base Color'])
# água do dilúvio: escura, agitada
agua_d = material('AguaDiluvio', tuple(hexc('#3e5f6b')), 0.18, emissao=tuple(hexc('#6f8f97')), forca=0.04)
_n = agua_d.node_tree.nodes
_ns = _n.new('ShaderNodeTexNoise')
_ns.inputs['Scale'].default_value = 2.2
_ns.inputs['Detail'].default_value = 6
_r2 = _n.new('ShaderNodeValToRGB')
_r2.color_ramp.elements[0].color = (*hexc('#2f4b57'), 1)
_r2.color_ramp.elements[1].color = (*hexc('#6f8e94'), 1)
_r2.color_ramp.elements[0].position = 0.38
_r2.color_ramp.elements[1].position = 0.72
_bp = _n.new('ShaderNodeBump')
_bp.inputs['Strength'].default_value = 0.35
agua_d.node_tree.links.new(_ns.outputs['Fac'], _r2.inputs['Fac'])
agua_d.node_tree.links.new(_r2.outputs['Color'], _n['Principled BSDF'].inputs['Base Color'])
agua_d.node_tree.links.new(_ns.outputs['Fac'], _bp.inputs['Height'])
agua_d.node_tree.links.new(_bp.outputs['Normal'], _n['Principled BSDF'].inputs['Normal'])
poca_m = material('Poca', tuple(hexc('#5f8a96')), 0.08, emissao=tuple(hexc('#9cc7cf')), forca=0.08)
chuva_m = material('Chuva', (0.85, 0.9, 0.95), 0.3, alfa=0.12)


def bastao(p0, p1, r0, r1=None, seg=6):
    """Cilindro (ou cone) entre dois pontos, para galhos, vigas, andaimes e tábuas inclinadas."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()

    def f(b):
        bmesh.ops.create_cone(b, cap_ends=True, segments=seg, radius1=r0, radius2=r1 if r1 is not None else r0, depth=L,
                              matrix=Matrix.Translation(p0) @ rot @ Matrix.Translation(Vector((0, 0, L / 2))))
    return f


def bloco(c, s, rz=0.0):
    """Caixa girada em torno do eixo vertical."""
    def f(b):
        bmesh.ops.create_cube(b, size=1.0, matrix=Matrix.Translation(Vector(c)) @ Matrix.Rotation(rz, 4, 'Z') @ Matrix.Diagonal((*s, 1)))
    return f


def objeto(nome, verts, faces, mat):
    m = bpy.data.meshes.new(nome)
    m.from_pydata(verts, [], faces)
    for p in m.polygons:
        p.use_smooth = False
    o = bpy.data.objects.new(nome, m)
    sc.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def plantar2(lib, x, y, esc=1.0, rot=None, nome='veg2', afundar=0.0):
    o = bib.plantar(lib, x, y, esc, rot if rot is not None else RR.uniform(0, 6.28), nome)
    o.location.z = z2(x, y) - 0.03 - afundar
    return o


def unico(nome, partes, x, y, rot=0.0, esc=1.0, z=None):
    o = plantar2(bib.juntar(nome, partes), x, y, esc, rot, nome + '_i')
    if z is not None:
        o.location.z = z
    return o


# formas da região
def arvore_seca(nome, sem):
    r = random.Random(sem)
    p = [(cone((0, 0, 0), 0.14, 0.08, 1.6, 7), mats['seco'])]
    for k in range(5):
        a = r.uniform(0, 6.28)
        z0 = r.uniform(0.8, 1.4)
        L = r.uniform(0.6, 1.1)
        p.append((bastao((0, 0, z0), (math.cos(a) * L, math.sin(a) * L, z0 + r.uniform(0.3, 0.8)), 0.05, 0.015, 5), mats['seco']))
    return bib.juntar(nome, p)


SECAS = [arvore_seca(f'seca{k}', 700 + k) for k in range(3)]
TOCO = [bib.juntar(f'toco{k}', [(cone((0, 0, 0), 0.18 + 0.04 * k, 0.16 + 0.04 * k, 0.28, 9), mats['tronco']),
                                (cone((0, 0, 0.28), 0.16 + 0.04 * k, 0.16 + 0.04 * k, 0.02, 9), mats['toco'])]) for k in range(2)]
CAPIM = [bib.juntar(f'capim{k}', [(cone((RR.uniform(-0.18, 0.18), RR.uniform(-0.18, 0.18), 0), 0.035, 0.0, 0.3 + RR.uniform(0, 0.2), 4), mats['capim']) for _ in range(11)]) for k in range(2)]
ARB_SECO = [bib.juntar(f'arbseco{k}', [(esfera((0, 0, 0.28), (0.5 + 0.1 * k, 0.45, 0.32), 2, 0.3, 720 + k), mats['capim' if k else 'seco'])]) for k in range(2)]
BROTO = [bib.juntar(f'broto{k}', [(cone((RR.uniform(-0.2, 0.2), RR.uniform(-0.2, 0.2), 0), 0.03, 0.0, 0.18 + RR.uniform(0, 0.12), 4), mats['broto']) for _ in range(8)]) for k in range(2)]
TORA = bib.juntar('tora', [(bastao((-0.9, 0, 0.16), (0.9, 0, 0.16), 0.16, 0.15, 8), mats['tronco']),
                           (cone((0.9, 0, 0.0), 0.15, 0.15, 0.02, 8), mats['toco'])])


def pilha_toras(x, y, rot, n=3):
    partes = []
    for camada in range(n):
        for k in range(n - camada):
            off = (k - (n - camada - 1) / 2) * 0.33
            partes.append((bastao((-1.0, off, 0.16 + camada * 0.28), (1.0, off, 0.16 + camada * 0.28), 0.15, 0.15, 8), mats['tronco']))
            partes.append((cone((1.0, off, 0.01 + camada * 0.28), 0.15, 0.15, 0.3, 8), mats['toco']))
    return unico('pilha', partes, x, y, rot)


def casa(nome, x, y, l, p, a, rot, mat='barro', andar=False, porta=True):
    partes = [(bloco((0, 0, a / 2), (l, p, a)), mats[mat]),
              (bloco((0, 0, a + 0.05), (l + 0.08, p + 0.08, 0.1)), mats['barro2'])]
    if andar:
        partes += [(bloco((-l * 0.2, 0, a + 0.1 + a * 0.35), (l * 0.55, p * 0.7, a * 0.7)), mats[mat]),
                   (bloco((-l * 0.2, 0, a + 0.1 + a * 0.7 + 0.04), (l * 0.6, p * 0.75, 0.08)), mats['barro2'])]
    if porta:
        partes.append((bloco((0, -p / 2 - 0.01, 0.22), (0.22, 0.04, 0.42)), mats['sombra']))
        partes.append((bloco((l * 0.3, -p / 2 - 0.01, a * 0.7), (0.14, 0.04, 0.14)), mats['sombra']))
    return unico(nome, partes, x, y, rot)


def fumaca(x, y, z, n, alta=True):
    for k in range(n):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.14 + k * 0.05,
                                              location=(x + 0.12 * k * (1 if alta else 2.2), y + 0.04 * k, z + 0.4 + k * (0.38 if alta else 0.16)))
        bpy.context.active_object.data.materials.append(mats['fumaca'])


# ------------------------------------------------------------------ 6. espaço livre e enchimento
FAIXA_EMENDA = 2.8  # nada novo a menos disso além da borda do Éden (sombras e silhuetas não cruzam a emenda)


def livre(x, y, raio):
    if alem_do_eden(y, z2(x, y)) < FAIXA_EMENDA + raio:
        return False
    if dist_caminho(np.array([x]), np.array([y]))[0] < raio + 0.9:
        return False
    if any(math.hypot(x - px, y - py) < raio + 2.0 for _, (px, py) in PONTOS):
        return False
    cx, cy, ax, ay = CIDADE
    if math.hypot((x - cx) / (ax + 0.8 + raio), (y - cy) / (ay + 0.8 + raio)) < 1.0:
        return False
    if abs(x - ARCA_OBRA[0]) < 5.0 + raio and abs(y - ARCA_OBRA[1]) < 1.8 + raio:
        return False
    if math.hypot(x - CASA_NOE[0], y - CASA_NOE[1]) < 1.9 + raio:
        return False
    if math.hypot(x - ALTAR[0], y - ALTAR[1]) < 1.4 + raio:
        return False
    return True


colocados = []


def encher(n, libs, y0, y1, raio, esc=(0.85, 1.15), x0=X0 + 0.3, x1=-X0 - 0.3, dmin=None, regra=None):
    for _ in range(n * 8):
        if n <= 0:
            break
        x, y = RR.uniform(x0, x1), RR.uniform(y0, y1)
        if not livre(x, y, raio) or (regra and not regra(x, y)):
            continue
        if dmin and any(math.hypot(x - a, y - b) < dmin for a, b in colocados):
            continue
        plantar2(RR.choice(libs), x, y, RR.uniform(*esc))
        colocados.append((x, y))
        n -= 1


seco_ = lambda x, y: z2(x, y) > AGUA_Z + 0.15  # noqa: E731  (fora da água)

# ------------------------------------------------------------------ 7. a cena
print('região 2: saída do Éden...')
OLIV = [v for v in VARIANTES if v.name.startswith('var_oliveira')]
CEDRO = [v for v in VARIANTES if v.name.startswith('var_cedro')]
# a mata do jardim rareia na serra: densa logo além da emenda, depois só oliveiras e cedros soltos
encher(34, ARV + CIP + CEDRO, 58.0, 63.5, 1.1, dmin=1.6)
encher(16, OLIV + CEDRO + CIP, 63.0, 68.0, 1.0, dmin=2.2, regra=lambda x, y: x < 1.5 or y < 65.0)
encher(8, OLIV + SECAS, 67.0, 71.0, 0.9, dmin=2.6, x1=1.0)
encher(90, TUFO + CAPIM, 58.0, 72.0, 0.15)
encher(26, PED + ARB_SECO, 60.0, 72.0, 0.3, esc=(0.4, 0.8))

print('fase 6: a cidade...')
cx, cy, ax, ay = CIDADE
N_MURO = 26
for k in range(N_MURO):
    a0 = 2 * math.pi * k / N_MURO
    a1 = 2 * math.pi * (k + 1) / N_MURO
    am = (a0 + a1) / 2
    if abs(((am - math.pi) + math.pi) % (2 * math.pi) - math.pi) < 0.22:   # portão a oeste, de frente para a trilha
        continue
    if 0.55 < am < 0.85:                                                   # trecho desmoronado (nordeste)
        unico('entulho', [(esfera((0, 0, 0.12), (0.45, 0.3, 0.18), 1, 0.3, 731 + k), mats['muro'])], cx + ax * math.cos(am), cy + ay * math.sin(am), am)
        continue
    p0 = (cx + ax * math.cos(a0), cy + ay * math.sin(a0))
    p1 = (cx + ax * math.cos(a1), cy + ay * math.sin(a1))
    L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    rz = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    alt = 0.9 + 0.12 * math.sin(k * 1.7)
    partes = [(bloco((0, 0, alt / 2), (L + 0.08, 0.42, alt)), mats['muro'])]
    partes += [(bloco(((j - 1) * L / 3, 0, alt + 0.09), (L / 6, 0.44, 0.18)), mats['muro']) for j in range(3)]  # ameias
    unico('muro', partes, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, rz)
    if k % 7 == 0:
        unico('torre', [(cone((0, 0, 0), 0.42, 0.38, 1.45, 10), mats['muro']), (cone((0, 0, 1.45), 0.44, 0.44, 0.12, 10), mats['barro2'])], p0[0], p0[1], 0)
for lado in (-1, 1):   # torres do portão
    unico('torre_portao', [(cone((0, 0, 0), 0.4, 0.36, 1.6, 10), mats['muro']), (cone((0, 0, 1.6), 0.43, 0.43, 0.12, 10), mats['barro2'])],
          cx - ax + 0.05, cy + lado * 0.75, 0)
casas_ok = 0
for k in range(60):
    hx, hy = RR.uniform(cx - ax + 0.7, cx + ax - 0.5), RR.uniform(cy - ay + 0.6, cy + ay - 0.5)
    if math.hypot((hx - cx) / (ax - 0.55), (hy - cy) / (ay - 0.55)) > 1.0:
        continue
    if any(math.hypot(hx - a, hy - b) < 1.25 for a, b in colocados):
        continue
    colocados.append((hx, hy))
    l, p = RR.uniform(0.8, 1.25), RR.uniform(0.7, 1.0)
    casa('casa', hx, hy, l, p, RR.uniform(0.55, 0.85), RR.choice((0, 0.1, -0.1, math.pi / 2)), RR.choice(('barro', 'barro', 'barro2', 'barro3')), andar=RR.random() < 0.3)
    casas_ok += 1
# casa maior (palácio) e fogueiras com fumaça
casa('palacio', cx + 0.7, cy + 1.0, 1.9, 1.3, 1.1, 0.0, 'barro3', andar=True)
for fx, fy in ((cx - 1.2, cy - 0.6), (cx + 1.6, cy - 1.1), (cx + 0.3, cy + 1.9)):
    unico('fogueira', [(cone((0, 0, 0), 0.14, 0.0, 0.3, 6), mats['fogo'])], fx, fy, 0)
    fumaca(fx, fy, z2(fx, fy), 4, alta=False)
# fora dos muros: árvores secas, entulho, tocos
encher(9, SECAS, 67.5, 79.0, 0.7, x0=0.5, dmin=1.5)
encher(14, PED + ARB_SECO, 67.5, 79.0, 0.4, esc=(0.5, 0.9))
encher(8, SECAS + OLIV, 68.0, 80.0, 0.8, x1=-1.5, dmin=1.8)

tenda_m = material('Tenda', tuple(hexc('#8a6a4a')), 0.9)
for k, (tx, ty) in enumerate(((-7.6, 76.6), (-8.4, 82.8), (-4.0, 83.6), (-6.9, 73.2))):
    if k % 2:
        unico('tenda', [(cone((0, 0, 0), 0.75, 0.05, 0.85, 8), tenda_m), (bloco((0, -0.55, 0.2), (0.3, 0.1, 0.38)), mats['sombra'])], tx, ty, RR.uniform(-0.3, 0.3))
    else:
        casa('cabana', tx, ty, 0.9, 0.7, 0.55, RR.uniform(-0.3, 0.3), 'barro2')
encher(26, ARB_SECO + PED, 74.0, 86.0, 0.35, esc=(0.5, 1.0), x1=0.0)
encher(50, CAPIM + TUFO, 72.0, 86.0, 0.15)

print('fase 7: a casa de Noé...')
nx_, ny_ = CASA_NOE
casa('casa_noe', nx_, ny_, 1.1, 0.8, 0.62, 0.15, 'barro3')
for k in range(5):  # cerca
    a = 0.8 + k * 0.55
    unico('cerca', [(bastao((0, -0.5, 0.25), (0, 0.5, 0.25), 0.03), mats['madeira_c']), (bastao((0, -0.5, 0.45), (0, 0.5, 0.45), 0.03), mats['madeira_c']),
                    (cone((0, -0.5, 0), 0.04, 0.04, 0.55, 5), mats['madeira_c']), (cone((0, 0.5, 0), 0.04, 0.04, 0.55, 5), mats['madeira_c'])],
          nx_ + 1.7 * math.cos(a), ny_ + 1.3 * math.sin(a), a)
for k in range(6):  # canteiros da horta
    plantar2(BROTO[k % 2], nx_ - 1.3 + 0.45 * k, ny_ - 1.15, 1.3, 0.0)
for ox, oy in ((nx_ + 2.2, ny_ + 0.9), (nx_ + 1.6, ny_ - 1.6), (nx_ - 1.9, ny_ + 1.2)):
    plantar2(OLIV[0], ox, oy, 0.95)
plantar2(OVE[0], nx_ - 1.6, ny_ - 0.4, 1.1)
plantar2(OVE[0], nx_ - 2.1, ny_ + 0.2, 1.0)

print('fase 8: o canteiro da arca...')
ax_, ay_ = ARCA_OBRA
L_ARCA, W_ARCA, H_ARCA = 8.4, 1.45, 1.05


def perfil(t):
    """Largura relativa do casco ao longo do comprimento (proa e popa afinadas)."""
    return max(0.06, (1 - abs(2 * t - 1) ** 5) ** 0.5)


partes = [(bloco((0, 0, 0.1), (L_ARCA, 0.22, 0.2)), mats['madeira_e'])]  # quilha
NC = 13
for k in range(NC):  # cavernas (costelas do casco)
    t = 0.04 + 0.92 * k / (NC - 1)
    x = -L_ARCA / 2 + t * L_ARCA
    wf = perfil(t) * W_ARCA
    pts = [(x, 0.0, 0.15), (x, wf * 0.65, 0.35), (x, wf, H_ARCA * 0.65), (x, wf * 1.02, H_ARCA + 0.25)]
    for lado in (-1, 1):
        for a, b in zip(pts, pts[1:]):
            partes.append((bastao((a[0], lado * a[1], a[2]), (b[0], lado * b[1], b[2]), 0.07), mats['madeira_c']))
    partes.append((bastao((x, -wf, H_ARCA * 0.62), (x, wf, H_ARCA * 0.62), 0.04), mats['madeira_c']))  # vau
# tábuas já pregadas: metade de trás do casco, lado sul (o que a câmera vê)
for lado in (-1, 1):
    for fila in range(4):
        z = 0.28 + fila * 0.2
        n_tab = 12 if lado < 0 else 7 - fila      # lado sul quase todo fechado; lado norte só começado
        for k in range(n_tab):
            t0, t1 = 0.04 + k * 0.077, 0.04 + (k + 1) * 0.077
            x0_, x1_ = -L_ARCA / 2 + t0 * L_ARCA, -L_ARCA / 2 + t1 * L_ARCA
            y0_ = lado * perfil(t0) * W_ARCA * (0.66 + 0.34 * fila / 3)
            y1_ = lado * perfil(t1) * W_ARCA * (0.66 + 0.34 * fila / 3)
            partes.append((bastao((x0_, y0_, z), (x1_, y1_, z), 0.1, seg=4), casco_m))
# andaimes do lado norte e rampa
for k in range(6):
    x = -L_ARCA / 2 + 0.8 + k * 1.35
    partes += [(cone((x, W_ARCA + 0.55, 0), 0.04, 0.04, 1.6, 5), mats['madeira_c']),
               (bastao((x - 0.68, W_ARCA + 0.55, 0.85), (x + 0.68, W_ARCA + 0.55, 0.85), 0.05, seg=4), mats['madeira_c'])]
partes.append((bastao((L_ARCA / 2 + 1.6, -0.4, 0.05), (L_ARCA / 2 - 0.4, -0.2, H_ARCA * 0.65), 0.1, seg=4), mats['madeira_c']))
unico('arca_obra', partes, ax_, ay_, 0.0)
# toras, tocos e pilhas: a madeira cortada para a obra (lado oeste e entre a casa e o canteiro)
pilha_toras(-6.0, 85.2, 0.25, 3)
pilha_toras(-6.8, 90.2, -0.15, 3)
pilha_toras(0.9 + 6.0, 84.4, 0.0, 2)
encher(26, TOCO, 82.5, 91.5, 0.3, esc=(0.8, 1.2))
encher(6, [TORA], 82.5, 91.5, 0.6)
encher(10, CEDRO + ARV, 83.0, 91.5, 1.0, x1=-6.5, dmin=1.4)
encher(30, CAPIM + TUFO, 78.0, 91.0, 0.15)
fumaca(-4.3, 86.4, z2(-4.3, 86.4), 3, alta=False)   # fogo do betume
unico('betume', [(cone((0, 0, 0), 0.32, 0.36, 0.34, 10), mats['madeira_e']), (cone((0, 0, 0.34), 0.3, 0.3, 0.02, 10), mats['sombra'])], -4.3, 86.4, 0)

print('fase 9: o dilúvio...')
# a água cobre a bacia (o plano fica sob o terreno onde ele é mais alto)
bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 97.0, AGUA_Z))
ag = bpy.context.active_object
ag.scale = (LX + 2, 26.0, 1)
ag.data.materials.append(agua_d)
# a arca pronta, flutuando (Gn 6.15-16: três andares, janela em cima, porta ao lado)
L2, W2, H2 = 7.6, 1.4, 1.0
vs, fs = [], []
NS = 16
sec = lambda wf: [(-0.62 * wf, 0.0), (-wf, 0.45), (-wf, 1.0), (wf, 1.0), (wf, 0.45), (0.62 * wf, 0.0)]  # noqa: E731
for k in range(NS + 1):
    t = k / NS
    wf = perfil(t) * W2
    for (yy, zz) in sec(wf):
        vs.append((-L2 / 2 + t * L2, yy, zz * H2 + 0.08 * abs(2 * t - 1) ** 3))
    if k:
        a0 = 6 * (k - 1)
        for j in range(5):
            fs.append((a0 + j, a0 + j + 1, a0 + 6 + j + 1, a0 + 6 + j))
fs.append(tuple(range(5, -1, -1)))
fs.append(tuple(range(6 * NS, 6 * NS + 6)))
ox, oy = ARCA_PRONTA
arca = objeto('arca', [(ox + a, oy + b, c - 0.25) for a, b, c in vs], fs, casco_m)
unico('arca_casa', [(bloco((0, 0, 0.32), (L2 * 0.62, W2 * 1.2, 0.64)), casco_m),
                    (bastao((-L2 * 0.33, -W2 * 0.68, 0.62), (-L2 * 0.33, 0, 1.0), 0.06, seg=4), mats['madeira_e']),
                    (bloco((0, -W2 * 0.33, 0.83), (L2 * 0.68, W2 * 0.75, 0.07), 0.0), mats['madeira_e']),
                    (bloco((0, W2 * 0.33, 0.83), (L2 * 0.68, W2 * 0.75, 0.07), 0.0), mats['madeira_e']),
                    (bloco((0, -W2 * 0.61, 0.45), (L2 * 0.5, 0.04, 0.1)), mats['sombra']),   # janela corrida
                    (bloco((L2 * 0.18, -W2 * 0.61, 0.22), (0.35, 0.04, 0.4)), mats['sombra'])],  # porta
      ox, oy, 0.0, z=AGUA_Z + H2 - 0.3)
# as duas águas do telhado (inclinadas)
for lado in (-1, 1):
    tel = unico('arca_telhado', [(bloco((0, 0, 0), (L2 * 0.68, W2 * 0.72, 0.07)), mats['madeira_e'])], ox, oy + lado * W2 * 0.3, 0.0, z=AGUA_Z + H2 + 0.48)
    tel.rotation_euler = (lado * -0.42, 0, 0)
# copas e telhados submersos, espuma em volta
for k in range(9):
    x, y = RR.uniform(2.5, 9.0), RR.uniform(92.0, 102.5)
    if dist_caminho(np.array([x]), np.array([y]))[0] < 1.6 or math.hypot(x - PONTOS[3][1][0], y - PONTOS[3][1][1]) < 2.4:
        continue
    o = plantar2(RR.choice(ARV + CEDRO), x, y, RR.uniform(0.8, 1.1))
    o.location.z = AGUA_Z - RR.uniform(2.5, 2.9)
for k, (x, y) in enumerate(((7.2, 99.3), (8.3, 97.6), (-8.4, 93.6))):
    unico('telhado_submerso', [(bloco((0, 0, 0), (0.95, 0.7, 0.1)), mats['barro2']), (bloco((0, 0, -0.2), (0.85, 0.6, 0.3)), mats['barro'])], x, y, 0.3 * k, z=AGUA_Z + 0.06)
espuma = mats.get('espuma') or material('EspumaD', (0.9, 0.93, 0.95), 0.4)
for k in range(60):
    x, y = RR.uniform(-9.5, 9.5), RR.uniform(91.5, 103.5)
    if abs(z2(x, y) - AGUA_Z) < 0.12:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=RR.uniform(0.06, 0.12), location=(x, y, AGUA_Z + 0.02))
        bpy.context.active_object.scale = (1.6, 1.0, 0.35)
        bpy.context.active_object.data.materials.append(espuma)
# tempestade: nuvens que só fazem sombra (a câmera não as vê) e chuva fina
for k in range(7):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0, location=(RR.uniform(-7, 7), RR.uniform(91, 103) - 6.0, 14.0))
    n_ = bpy.context.active_object
    n_.scale = (RR.uniform(3.5, 5.5), RR.uniform(2.0, 3.0), 0.8)
    n_.visible_camera = False
    n_.data.materials.append(mats['rocha3'])
for k in range(55):
    x, y = RR.uniform(-9.5, 9.5), RR.uniform(90.5, 102.0)
    z0 = AGUA_Z + RR.uniform(1.0, 3.5)
    bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=0.01, depth=1.6, location=(x + 0.1, y, z0))
    gota = bpy.context.active_object
    gota.rotation_euler = (0.0, 0.12, 0.0)
    gota.data.materials.append(chuva_m)

print('entre 9 e 10: as águas baixam...')
encher(70, BROTO, 102.0, 108.0, 0.15, regra=seco_)
encher(14, ARB + OLIV, 103.5, 110.0, 0.7, regra=seco_, dmin=1.5)
for k in range(16):  # poças na lama
    x, y = RR.uniform(-8.5, 8.5), RR.uniform(101.0, 105.5)
    if dist_caminho(np.array([x]), np.array([y]))[0] < 1.2 or not livre(x, y, 0.4):
        continue
    bpy.ops.mesh.primitive_circle_add(vertices=20, radius=1.0, fill_type='NGON', location=(x, y, z2(x, y) + 0.04))
    p_ = bpy.context.active_object
    p_.scale = (RR.uniform(0.35, 0.8), RR.uniform(0.25, 0.5), 1)
    p_.rotation_euler.z = RR.uniform(0, 3.14)
    p_.data.materials.append(poca_m)
# a pomba com o ramo de oliveira (Gn 8.11), voando perto da fase 10
pomba = bib.juntar('pomba', [(esfera((0, 0, 0), (0.22, 0.09, 0.09), 2, 0.0), mats['pomba']), (esfera((0.2, 0, 0.04), (0.07, 0.06, 0.06), 1, 0.0), mats['pomba']),
                              (bastao((0, 0, 0.02), (-0.08, 0.38, 0.14), 0.07, 0.02, 4), mats['pomba']), (bastao((0, 0, 0.02), (-0.08, -0.38, 0.14), 0.07, 0.02, 4), mats['pomba']),
                              (bastao((0.25, 0, 0.0), (0.42, 0.05, -0.04), 0.012, 0.012, 4), mats['tronco']), (esfera((0.38, 0.06, -0.03), (0.06, 0.03, 0.02), 1, 0.0), mats['copa2'])])
pb = plantar2(pomba, -4.6, 102.2, 1.8, 0.6)
pb.location.z = z2(-4.6, 102.2) + 3.1

print('fase 10: o Ararate...')
# altar de pedras com fogo e fumaça subindo reta (paz)
altx, alty = ALTAR
unico('altar_noe', [(esfera((0, 0, 0.25), (0.6, 0.5, 0.3), 1, 0.15, 761), mats['pedra_altar']),
                    (esfera((0, 0, 0.55), (0.46, 0.38, 0.2), 1, 0.15, 763), mats['pedra_altar']),
                    (cone((0, 0, 0.7), 0.22, 0.0, 0.5, 7), mats['fogo'])], altx, alty, 0.3)
fumaca(altx, alty, z2(altx, alty) + 0.9, 6, alta=True)
plantar2(OVE[0], altx + 1.3, alty + 0.4, 1.0)
plantar2(OVE[0], altx + 1.7, alty - 0.3, 0.9)
# clareira de pedras do baú
bx, by = PONTOS[5][1]
for k in range(9):
    a = k * 2 * math.pi / 9
    plantar2(PED[k % 3], bx + math.cos(a) * 1.25, by + math.sin(a) * 1.0, 0.45, 0.0)
# encostas: verde novo, flores, rochas; poucas árvores; neve fica no alto (cor do terreno)
encher(50, FLOR + BROTO, 104.0, 115.0, 0.2, regra=seco_)
encher(18, ARB + OLIV + CEDRO, 106.0, 118.0, 0.8, dmin=1.5, regra=lambda x, y: z2(x, y) < 3.6)
encher(22, PED, 106.0, 118.0, 0.4, esc=(0.5, 1.1), regra=lambda x, y: 2.0 < z2(x, y) < 5.0)
# terras baixas além do monte (longe)
encher(34, ARV + CEDRO + OLIV, 115.0, 138.0, 1.0, dmin=2.0, regra=lambda x, y: z2(x, y) < 3.0)

# o arco-íris (Gn 9.13): meio anel no plano da imagem, sobre o monte, translúcido
arco_m = bpy.data.materials.new('ArcoIris')
arco_m.use_nodes = True
nt_ = arco_m.node_tree
for n_ in list(nt_.nodes):
    nt_.nodes.remove(n_)
tc_ = nt_.nodes.new('ShaderNodeTexCoord')
sep = nt_.nodes.new('ShaderNodeSeparateXYZ')
rmp = nt_.nodes.new('ShaderNodeValToRGB')
cores_arco = ['#b34a8c', '#3f5fbf', '#2f9fd0', '#4cad4a', '#f2d23a', '#f0902a', '#e04a3a']
rmp.color_ramp.elements[0].position = 0.0
rmp.color_ramp.elements[0].color = (*hexc(cores_arco[0]), 1)
rmp.color_ramp.elements[1].position = 1.0
rmp.color_ramp.elements[1].color = (*hexc(cores_arco[-1]), 1)
for k, c_ in enumerate(cores_arco[1:-1], 1):
    e_ = rmp.color_ramp.elements.new(k / (len(cores_arco) - 1))
    e_.color = (*hexc(c_), 1)
em = nt_.nodes.new('ShaderNodeEmission')
em.inputs['Strength'].default_value = 1.4
tr = nt_.nodes.new('ShaderNodeBsdfTransparent')
mixs = nt_.nodes.new('ShaderNodeMixShader')
mixs.inputs['Fac'].default_value = 0.42
saida = nt_.nodes.new('ShaderNodeOutputMaterial')
nt_.links.new(tc_.outputs['UV'], sep.inputs['Vector'])
nt_.links.new(sep.outputs['X'], rmp.inputs['Fac'])
nt_.links.new(rmp.outputs['Color'], em.inputs['Color'])
nt_.links.new(tr.outputs['BSDF'], mixs.inputs[1])
nt_.links.new(em.outputs['Emission'], mixs.inputs[2])
nt_.links.new(mixs.outputs['Shader'], saida.inputs['Surface'])
if hasattr(arco_m, 'blend_method'):
    arco_m.blend_method = 'BLEND'
CX_A = Vector((1.0, 109.6, z2(1.0, 109.6) + 0.4))
R_EXT, R_INT, NA = 5.6, 5.0, 64
XV = Vector((1, 0, 0))
vs, fs, uvs = [], [], []
for k in range(NA + 1):
    t = math.pi * 0.06 + math.pi * 0.88 * k / NA
    for j, r_ in enumerate((R_INT, R_EXT)):
        p = CX_A + XV * (math.cos(t) * r_) + UP * (math.sin(t) * r_) + Vector((0, -2.0, 0)) * (0.0)
        vs.append(tuple(p))
    if k:
        a0 = 2 * (k - 1)
        fs.append((a0, a0 + 1, a0 + 3, a0 + 2))
arco = objeto('arco_iris', vs, fs, arco_m)
uvl = arco.data.uv_layers.new(name='UVMap')
for poly in arco.data.polygons:
    for li in poly.loop_indices:
        vi = arco.data.loops[li].vertex_index
        uvl.data[li].uv = (float(vi % 2), 0.0)
arco.visible_shadow = False

# ------------------------------------------------------------------ 8. câmera da região (a do Éden, uma altura acima) e saída
pix = ORTHO / RESY
cam.location = C0 + UP * ORTHO - UP * (MARGEM_PX * pix) / 2
cam.data.ortho_scale = ORTHO * (RESY + MARGEM_PX) / RESY
sc.render.resolution_y = RESY + MARGEM_PX
comum.saida_png(sc, os.path.join(PASTA, 'diluvio_completo.png'))
bpy.context.view_layer.update()
H_TOT = RESY + MARGEM_PX


def na_final(co3):
    p = comum.na_imagem(sc, cam, co3)
    return {'x': p['x'], 'y': round(p['y'] * H_TOT / RESY, 5)}


pontos = [{'id': nome, **na_final((x, y, z2(x, y)))} for nome, (x, y) in PONTOS]
refs = {
    'altar': na_final((ALTAR[0], ALTAR[1], z2(*ALTAR) + 0.8)),
    'arca_obra': na_final((ARCA_OBRA[0], ARCA_OBRA[1], z2(*ARCA_OBRA) + 1.3)),
    'arca_pronta': na_final((ARCA_PRONTA[0], ARCA_PRONTA[1], AGUA_Z + 1.4)),
    'cidade': na_final((CIDADE[0], CIDADE[1], z2(CIDADE[0], CIDADE[1]) + 0.6)),
    'casa_noe': na_final((CASA_NOE[0], CASA_NOE[1], z2(*CASA_NOE) + 0.6)),
    'pico': na_final((PICO[0], PICO[1], z2(PICO[0], PICO[1]))),
    'arco_topo': na_final(tuple(CX_A + UP * R_EXT)),
}
info = {'largura': RESX, 'altura': RESY, 'margem_emenda_px': MARGEM_PX, 'pontos': pontos, 'referencias': refs,
        'terreno_eden': {'vertices_no_quadro_do_eden': int(_dentro.sum()), 'alterados_no_quadro_do_eden': MUDOU_DENTRO,
                         'remodelados_alem_do_quadro': int(fora.sum()), 'vertices_novos_ao_norte': len(ys_novas) * NX}}
comum.gravar_json(os.path.join(PASTA, 'diluvio.json'), info)
print('pontos', info)
print('renderizando', RESX, 'x', H_TOT, 'amostras', AMOSTRAS)
bpy.ops.render.render(write_still=True)

# recorte: a imagem da região (de cima) e a faixa extra (embaixo), que mostra o topo do Éden
# (sem render, como na conferência de cena, não há o que recortar)
def recortar():
    img = bpy.data.images.load(os.path.join(PASTA, 'diluvio_completo.png'))
    px = np.array(img.pixels[:], dtype=np.float32).reshape(H_TOT, RESX, 4)  # linhas de baixo para cima

    def gravar(nome, arr):
        im2 = bpy.data.images.new(nome, RESX, arr.shape[0], alpha=False)
        im2.pixels.foreach_set(np.ascontiguousarray(arr).ravel())
        im2.filepath_raw = os.path.join(PASTA, nome + '.png')
        im2.file_format = 'PNG'
        im2.save()

    gravar('diluvio', px[MARGEM_PX:])
    gravar('diluvio_emenda', px[:MARGEM_PX])
    print('OK', os.path.join(PASTA, 'diluvio.png'))


if os.path.exists(os.path.join(PASTA, 'diluvio_completo.png')):
    recortar()
else:
    print('sem render: cena montada, nada a recortar')
