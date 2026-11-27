"""
BASE COMUM DE PINTURA DOS MAPAS (expansão de Gênesis, etapa 1)

Funções extraídas de tools/mapa/eden.py, sem mudança de comportamento, para as próximas
regiões de Gênesis e do Quiz usarem a mesma base:
- argumentos da linha de comando e cena vazia;
- curvas (Catmull-Rom), distância a uma curva, transição suave e cores (#hex para linear);
- material padrão (Principled) e a malha do terreno com cores por vértice;
- formas para a biblioteca (esfera com ruído, cone, caixa) e a biblioteca de instâncias
  (juntar peças, plantar no terreno, árvores de copa, palmeira, ovelha);
- enchimento de vegetação com uma regra de espaço livre dada por cada região;
- céu e sol, câmera ortográfica inclinada, ajustes do Cycles e o acabamento pintado
  (Kuwahara, contorno #2B1D10, saturação e calor);
- posição de um ponto do mundo na imagem e a gravação do JSON.

Regras para manter as imagens idênticas:
- usa o módulo `random` global (o mesmo da região), sem semente própria: a região semeia;
- nada aqui cria dados no Blender ao ser importado; tudo é criado quando a região chama,
  na mesma ordem em que o eden.py fazia antes.
Só depende do Blender (bpy, bmesh, mathutils) e do NumPy, como o eden.py.
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


# ------------------------------------------------------------------ linha de comando e cena
def argumentos(amostras_padrao=64):
    """Lê `-- <pasta> [largura_px] [amostras]` e cria a pasta de saída."""
    args = sys.argv[sys.argv.index('--') + 1:]
    pasta = args[0]
    larg_px = int(args[1]) if len(args) > 1 else 1080
    amostras = int(args[2]) if len(args) > 2 else amostras_padrao
    os.makedirs(pasta, exist_ok=True)
    return pasta, larg_px, amostras


def nova_cena():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


# ------------------------------------------------------------------ curvas, distâncias e cores
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


def dist_curva(curva, x, y):
    """Menor distância de cada (x, y) à curva (em blocos, para não estourar a memória)."""
    x = np.asarray(x, float)
    y = np.asarray(y, float)
    fx, fy = x.ravel(), y.ravel()
    out = np.empty(fx.shape, np.float32)
    for i in range(0, len(fx), 4096):
        d = np.hypot(curva[:, 0][None, :] - fx[i:i + 4096, None], curva[:, 1][None, :] - fy[i:i + 4096, None])
        out[i:i + 4096] = d.min(axis=1)
    return out.reshape(x.shape)


def suave(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def hexc(h):
    """#rrggbb para RGB linear (gama 2,2)."""
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]) ** 2.2


# ------------------------------------------------------------------ materiais e terreno
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


def malha_terreno(sc, GX, GY, GZ, cor, nome='terreno'):
    """Malha em grade (NY × NX) com a altura GZ e a cor de cada vértice no atributo 'Cor'."""
    NY, NX = GX.shape
    me = bpy.data.meshes.new(nome)
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
    ob = bpy.data.objects.new(nome, me)
    sc.collection.objects.link(ob)
    return ob


# ------------------------------------------------------------------ formas (funções que desenham num bmesh)
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


# ------------------------------------------------------------------ biblioteca de instâncias
class Biblioteca:
    """Coleção oculta com as formas-modelo; cada uso no mapa é uma instância que compartilha a malha.
    `z_em(x, y)` dá a altura do terreno da região; `mats` é o dicionário de materiais da região
    (pode ser dado depois de criar a biblioteca, como no Éden)."""

    def __init__(self, sc, z_em, mats=None):
        self.sc = sc
        self.z_em = z_em
        self.mats = mats
        self.colecao = bpy.data.collections.new('biblioteca')
        sc.collection.children.link(self.colecao)
        self.colecao.hide_render = True

    def nova(self, nome):
        me = bpy.data.meshes.new(nome)
        ob = bpy.data.objects.new(nome, me)
        self.colecao.objects.link(ob)
        return ob

    def juntar(self, nome, partes):
        """partes: lista de (bmesh_fn, material). Cria um objeto da biblioteca com vários materiais."""
        ob = self.nova(nome)
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

    def plantar(self, lib, x, y, esc=1.0, rot=None, nome='inst'):
        ob = bpy.data.objects.new(nome, lib.data)
        self.sc.collection.objects.link(ob)
        ob.location = (x, y, self.z_em(x, y) - 0.03)
        ob.rotation_euler = (0, 0, rot if rot is not None else random.uniform(0, 6.28))
        ob.scale = (esc, esc, esc)
        return ob

    def objeto_unico(self, nome, partes, x, y, rot=0.0, esc=1.0):
        lib = self.juntar(nome, partes)
        return self.plantar(lib, x, y, esc, rot, nome + '_i')

    # formas de vegetação e animais usadas por mais de uma região
    def arvore_copa(self, nome, altura_=2.6, copa=1.3, mat_copa='copa1', frutos=None, sem=0):
        mats = self.mats
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
        return self.juntar(nome, partes)

    def palmeira(self, nome, sem):
        mats = self.mats
        rnd = random.Random(sem)
        partes = []
        h = 3.2
        for k in range(6):
            partes.append((cone((0.04 * k, 0, k * h / 6), 0.14 - k * 0.01, 0.13 - k * 0.01, h / 6 + 0.02, 7), mats['tronco']))
        for k in range(8):
            a = k * math.pi / 4 + rnd.uniform(-0.2, 0.2)
            c = (0.24 + math.cos(a) * 0.75, math.sin(a) * 0.75, h - 0.15)
            partes.append((esfera(c, (0.75, 0.22, 0.07), 1, 0.0), mats['palma']))
        return self.juntar(nome, partes)

    def ovelha(self, nome):
        mats = self.mats
        return self.juntar(nome, [
            (esfera((0, 0, 0.42), (0.42, 0.28, 0.27), 2, 0.25, 80), mats['la']),
            (esfera((0.42, 0, 0.5), (0.13, 0.1, 0.12), 1, 0.0), mats['cara']),
            *[(cone((dx, dy, 0), 0.04, 0.04, 0.24, 5), mats['cara']) for dx in (-0.22, 0.22) for dy in (-0.12, 0.12)],
        ])


def encher(bib, livre, colocados, n, libs, y0, y1, raio, esc, x0, x1, dmin=None):
    """Planta até `n` instâncias sorteadas de `libs` em [x0, x1] × [y0, y1], onde `livre(x, y, raio)`
    permitir e, com `dmin`, longe das já colocadas (a lista `colocados` é da região)."""
    for _ in range(n * 6):
        if n <= 0:
            break
        x, y = random.uniform(x0, x1), random.uniform(y0, y1)
        if not livre(x, y, raio):
            continue
        if dmin and any(math.hypot(x - a, y - b) < dmin for a, b in colocados):
            continue
        bib.plantar(random.choice(libs), x, y, random.uniform(*esc), nome='veg')
        colocados.append((x, y))
        n -= 1


# ------------------------------------------------------------------ luz, câmera e render
def ceu_e_sol(sc):
    """A mesma luz em todas as regiões: céu claro e sol quente do alto, à esquerda."""
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
    return so


def camera_inclinada(sc, LX, y_ini, y_fim, larg_px, incl_graus=52):
    """Câmera ortográfica inclinada (a partir da vertical), olhando para o norte (+y para cima no mapa).
    O quadro cobre 94% da largura do terreno e de y_ini a y_fim (projeção inclinada)."""
    cam_d = bpy.data.cameras.new('cam')
    cam_d.type = 'ORTHO'
    cam = bpy.data.objects.new('cam', cam_d)
    sc.collection.objects.link(cam)
    sc.camera = cam
    INCL = math.radians(incl_graus)
    cam.rotation_euler = (INCL, 0, 0)
    alt_quadro = (y_fim - y_ini) * math.cos(INCL) + 3.0 * math.sin(INCL)
    cam_d.ortho_scale = max(LX * 0.94, alt_quadro)
    sc.render.resolution_x = larg_px
    sc.render.resolution_y = int(larg_px * alt_quadro / (LX * 0.94))
    cam_d.ortho_scale = alt_quadro if alt_quadro > LX * 0.94 else LX * 0.94
    centro = Vector((0, (y_ini + y_fim) / 2, 0.8))
    dirc = Vector((0, -math.sin(INCL), math.cos(INCL)))  # da cena para a câmera
    cam.location = centro + dirc * 60
    cam_d.clip_end = 200
    return cam


def ajustes_render(sc, amostras):
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = amostras
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


def acabamento_pintado(sc, larg_px):
    """Compositor da identidade dos mapas:
    - pinceladas: filtro de Kuwahara sobre a cor (áreas de cor chapadas, bordas preservadas);
    - contorno escuro (#2B1D10) nas quinas das formas (normais) e nas silhuetas (profundidade);
    - um pouco mais de saturação e calor."""
    sc.use_nodes = True
    nt = sc.node_tree
    for n_ in list(nt.nodes):
        nt.nodes.remove(n_)
    rl = nt.nodes.new('CompositorNodeRLayers')
    kuw = nt.nodes.new('CompositorNodeKuwahara')
    kuw.size = max(2, int(larg_px / 300))
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


def saida_png(sc, caminho):
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGB'
    sc.render.filepath = caminho


# ------------------------------------------------------------------ posições na imagem e exportação
def na_imagem(sc, cam, co3):
    """Fração (x da esquerda, y do topo) de um ponto do mundo na imagem renderizada."""
    from bpy_extras.object_utils import world_to_camera_view
    co = world_to_camera_view(sc, cam, Vector(co3))
    return {'x': round(co.x, 5), 'y': round(1 - co.y, 5)}


def gravar_json(caminho, info):
    json.dump(info, open(caminho, 'w'), indent=1)
