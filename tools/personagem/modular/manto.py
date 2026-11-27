"""
MANTOS PARAMÉTRICOS (reformulação visual, entrega 1: rodada final de acabamento)

Os mantos da primeira versão eram simulações de tecido de ../vestes.py feitas sobre o corpo:
com a túnica nova, atravessavam o tecido e não tinham forma definida. Aqui cada manto é uma
peça independente, construída sobre a túnica já pronta (parte de cima, mangas e saia longa):

- capa sobre os ombros: raios a partir do centro do peito (frente aberta, borda em volta do
  pescoço); o raio é o ponto MAIS EXTERNO da túnica naquela direção + folga, suavizado
  (o tecido assenta nos ombros e cobre o alto das mangas);
- painel das costas: abaixo da capa o manto cai reto (anéis horizontais, raio que não entra
  ao descer), mais estreito que a capa, até a barra de cada estilo;
- xale: só a capa, com as pontas da frente caindo sobre o peito;
- espessura de lã, UV de 0 a 2 na largura (o jogo pinta as bordas pelo U) e textura de lã gerada.
"""
import math

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from PIL import Image

from tunica import _max_janela, _suave_circ, cair, orientar


def textura_la(caminho, n=512, semente=5):
    """Lã: trama mais grossa que o linho, fios irregulares e leve felpa; clara e neutra (o jogo tinge)."""
    rng = np.random.default_rng(semente)
    u = np.arange(n) / n
    fios = 48
    ga = 1 + 0.35 * rng.standard_normal(fios)
    fa = np.interp(u * fios, np.arange(fios + 1), np.r_[ga, ga[0]])
    tu = 0.5 + 0.5 * np.cos(2 * math.pi * u * fios)
    U, V = np.meshgrid(tu * fa, tu)
    sarja = ((np.floor(u * fios)[None, :] + np.floor(u * fios)[:, None] * 1) % 3 == 0)
    trama = np.where(sarja, U, V)
    felpa = rng.standard_normal((n, n))
    for _ in range(2):
        felpa = (felpa + np.roll(felpa, 1, 0) + np.roll(felpa, 1, 1) + np.roll(felpa, -1, 1)) / 4
    lum = 0.86 + 0.055 * (trama - trama.mean()) / trama.std() + 0.035 * felpa / felpa.std()
    lum = np.clip(lum, 0, 1)
    rgb = np.stack([lum, lum * 0.99, lum * 0.97], -1)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(caminho, quality=90)
    return caminho


def _arvore(obs):
    verts, polys = [], []
    for ob in obs:
        me = ob.data
        b = len(verts)
        verts += [tuple(ob.matrix_world @ v.co) for v in me.vertices]
        polys += [tuple(i + b for i in p.vertices) for p in me.polygons]
    return BVHTree.FromPolygons(verts, polys, all_triangles=False)


def _mais_externo(arv, origem, direcao, dist=0.8):
    """Último ponto atingido pelo raio (a superfície mais externa da roupa naquela direção)."""
    o = Vector(origem)
    d = Vector(direcao).normalized()
    ultimo = None
    for _ in range(12):
        h = arv.ray_cast(o, d, dist)
        if h[0] is None:
            break
        ultimo = h[0]
        o = h[0] + d * 0.0005
    return ultimo


def construir(nome, cima, saia, centro, z_axila, z_gola, r_gola, z_barra, estilo='manto', folga=0.011, extras=()):
    """Manto sobre a túnica pronta. centro = (cx, cy); r_gola: raio da gola por ângulo (frente = 0)."""
    cx, cy = centro
    arv = _arvore([cima, saia] + list(extras))  # extras: cintos (o manto passa por fora deles)
    O = np.array([cx, cy, z_axila + 0.03])
    NA = 56  # colunas na largura
    abertura = math.radians(22 if estilo != 'xale' else 28)  # meia-abertura da frente
    # ------------------------------------------------ capa (raios a partir do peito)
    el_top = math.atan2((z_gola + 0.004) - O[2], 0.09)
    el_bot = math.radians(-22)
    NE = 16
    els = np.linspace(el_top, el_bot, NE)
    ths = np.pi + np.linspace(-1, 1, NA + 1) * (math.pi - abertura)  # pi = costas
    D = np.zeros((NE, NA + 1))
    for i, el in enumerate(els):
        for j, th in enumerate(ths):
            d = np.array([math.sin(th) * math.cos(el), -math.cos(th) * math.cos(el), math.sin(el)])
            h = _mais_externo(arv, O, d)
            D[i, j] = (Vector(h) - Vector(O)).length if h is not None else np.nan
    for j in range(NA + 1):
        col = D[:, j]
        m = np.isnan(col)
        if m.all():
            col[:] = 0.12
        elif m.any():
            col[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), col[~m])
    D = _max_janela(D, 1, 1)
    bruto = D.copy()
    D = _suave_circ(D, 1.5, 0.0)
    for _ in range(2):  # suaviza na largura sem dar a volta (a frente é aberta)
        D[:, 1:-1] = (D[:, :-2] + 2 * D[:, 1:-1] + D[:, 2:]) / 4
    D = np.maximum(D, bruto)  # a suavização nunca põe a capa abaixo da manga (a manga furava a borda)
    linhas = []
    for i, el in enumerate(els):
        f = i / (NE - 1)
        pts = []
        for j, th in enumerate(ths):
            d = np.array([math.sin(th) * math.cos(el), -math.cos(th) * math.cos(el), math.sin(el)])
            pts.append(O + d * (D[i, j] + folga * (0.6 + 0.4 * f)))
        linhas.append(np.array(pts))
    # a primeira linha assenta em volta da gola (sobe um pouco atrás: o manto fica sobre os ombros)
    topo = linhas[0]
    for j, th in enumerate(ths):
        a = (th + math.pi) % (2 * math.pi) - math.pi
        k = (a + math.pi) / (2 * math.pi) * len(r_gola) - 0.5
        k0 = int(math.floor(k)) % len(r_gola)
        fr = k - math.floor(k)
        rg = r_gola[k0] * (1 - fr) + r_gola[(k0 + 1) % len(r_gola)] * fr + 0.012
        topo[j] = np.array([cx + math.sin(a) * rg, cy - math.cos(a) * rg, max(topo[j][2], z_gola - 0.004)])
    linhas[0] = topo
    # ------------------------------------------------ painel das costas (ou pontas do xale)
    z_ini = float(np.min(linhas[-1][:, 2])) - 0.01
    if estilo == 'xale':
        meia_costas = math.radians(60)
    else:
        meia_costas = math.radians(80 if estilo == 'manto' else 86)
    if z_barra < z_ini - 0.02:
        NZ = max(8, int((z_ini - z_barra) / 0.03))
        zs = np.linspace(z_ini, z_barra, NZ + 1)
        R = np.zeros((len(zs), NA + 1))
        largura = np.zeros(len(zs))
        lim_tronco = 0.215
        for i, z in enumerate(zs):
            t = (z_ini - z) / max(z_ini - z_barra, 1e-6)
            largura[i] = (math.pi - abertura) + ((meia_costas) - (math.pi - abertura)) * min(1.0, t / 0.1) ** 0.6
        for i, z in enumerate(zs):
            for j in range(NA + 1):
                th = math.pi + (-1 + 2 * j / NA) * largura[i]
                d = np.array([math.sin(th), -math.cos(th), 0.0])
                o = np.array([cx, cy, z])
                h = _mais_externo(arv, o, d)
                rr = math.hypot(h.x - cx, h.y - cy) if h is not None else np.nan
                # o painel cai pelas costas: o que o raio encontra longe do tronco é a manga (ignorado)
                R[i, j] = rr if rr == rr and (rr < lim_tronco or z < z_axila - 0.28) else np.nan
        for j in range(NA + 1):
            col = R[:, j]
            m = np.isnan(col)
            if m.all():
                col[:] = 0.2
            elif m.any():
                col[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), col[~m])
        R = cair(R, list(zs), 0.0)  # o manto não entra ao descer: cai reto das costas
        bruto_r = R.copy()
        R = _suave_circ(R, 2.0, 0.0)
        for _ in range(3):
            R[:, 1:-1] = (R[:, :-2] + 2 * R[:, 1:-1] + R[:, 2:]) / 4
        R = np.maximum(R, bruto_r)
        rng = np.random.default_rng(13)
        fase = rng.uniform(0, 6.28, 2)
        for i, z in enumerate(zs):
            t = (z_ini - z) / max(z_ini - z_barra, 1e-6)
            pts = []
            for j in range(NA + 1):
                s = -1 + 2 * j / NA
                th = math.pi + s * largura[i]
                dobra = 0.012 * t ** 1.3 * (0.6 * math.sin(7 * s * math.pi + fase[0]) + 0.4 * math.sin(3 * s * math.pi + fase[1]))
                r = R[i, j] + folga + 0.02 * t + dobra
                pts.append((cx + math.sin(th) * r, cy - math.cos(th) * r, z - 0.012 * t * (1 - abs(s)) ** 2))
            linhas.append(np.array(pts))
    # ------------------------------------------------ malha (grade aberta), UV de 0 a 2 na largura
    verts, faces, uvs = [], [], []
    comp = 0.0
    for i, L in enumerate(linhas):
        if i:
            comp += float(np.mean(np.linalg.norm(L - linhas[i - 1], axis=1)))
        for j in range(NA + 1):
            verts.append(tuple(L[j]))
            uvs.append((2.0 * j / NA, comp / 0.25))
    W = NA + 1
    for i in range(len(linhas) - 1):
        for j in range(NA):
            a = i * W + j
            faces.append((a, a + 1, a + W + 1, a + W))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        p.use_smooth = True
        for li, vi in zip(p.loop_indices, p.vertices):
            uv.data[li].uv = uvs[vi]
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    # alisa a junção da capa com o painel e empurra para fora o que tiver entrado na túnica
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    borda = {v.index for v in bm.verts if v.is_boundary and v.index < W}
    for _ in range(6):
        bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if v.index not in borda], factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(me)
    bm.free()
    for v in me.vertices:
        loc, nor, _, dist = arv.find_nearest(v.co, 0.2)
        if loc is None:
            continue
        fora = Vector((v.co.x - cx, v.co.y - cy, 0)).normalized()
        rel = v.co - loc
        if rel.dot(fora) < folga * 0.8:
            v.co = loc + fora * folga * 0.8 + Vector((0, 0, rel.z))
    me.update()
    orientar(ob, lambda q: np.array([q[0] - cx, q[1] - cy, 0.0]))
    bpy.context.view_layer.objects.active = ob
    m = ob.modifiers.new('Espessura', 'SOLIDIFY')
    m.thickness = 0.004
    m.offset = 1
    bpy.ops.object.modifier_apply(modifier=m.name)
    return ob
