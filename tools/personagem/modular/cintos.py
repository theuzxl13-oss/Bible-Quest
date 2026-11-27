"""
DETALHES DOS CINTOS (reformulação visual, entrega 1: rodada final de acabamento)

O cinto continua o anel ajustado à cintura da túnica (tunica.ajustar_cinto). Aqui ele ganha o que
o torna reconhecível, sempre por fora da saia:
- faixa de tecido: nó na frente, à esquerda, e duas pontas largas caindo com dobras;
- couro: laço com duas tiras curtas; a fivela de bronze é uma peça própria (Cinto_fivela), que o
  jogo mostra só no cinto que tem fivela;
- corda: nó e duas pontas de corda com borla.
"""
import math

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree


def _arvore(ob):
    me = ob.data
    return BVHTree.FromPolygons([tuple(ob.matrix_world @ v.co) for v in me.vertices], [tuple(p.vertices) for p in me.polygons], all_triangles=False)


def _fora(arv, cx, cy, z, th):
    """Ponto mais externo da saia na direção th (0 = frente), na altura z."""
    d = Vector((math.sin(th), -math.cos(th), 0))
    o = Vector((cx, cy, z))
    ult = None
    for _ in range(8):
        h = arv.ray_cast(o, d, 0.6)
        if h[0] is None:
            break
        ult = h[0]
        o = h[0] + d * 0.0005
    return ult


def _ponta(arv, cx, cy, z0, th0, comp, larg, afasta, gira=0.0, espessura=0.0, tubo=0.0, n=14):
    """Tira (ou corda, com tubo > 0) que cai do cinto rente à saia, abrindo um pouco para baixo."""
    verts, faces, uvs = [], [], []
    for k in range(n + 1):
        t = k / n
        z = z0 - comp * t
        th = th0 + gira * t
        p = _fora(arv, cx, cy, z, th)
        if p is None:
            p = Vector((cx + math.sin(th) * 0.2, cy - math.cos(th) * 0.2, z))
        rad = Vector((math.sin(th), -math.cos(th), 0))
        tang = Vector((math.cos(th), math.sin(th), 0))
        ctr = p + rad * (afasta + 0.004 * math.sin(t * math.pi))
        if tubo:
            R = 8
            for i in range(R):
                a = 2 * math.pi * i / R
                verts.append(tuple(ctr + (rad * math.cos(a) + tang * math.sin(a)) * tubo))
                uvs.append((i / R, t * comp / 0.03))
        else:
            w = larg * (1 + 0.25 * t)
            onda = 0.003 * math.sin(t * 9)
            verts.append(tuple(ctr - tang * w / 2 + rad * onda))
            verts.append(tuple(ctr + tang * w / 2 - rad * onda))
            uvs += [(0.0, t * comp / 0.12), (1.0, t * comp / 0.12)]
    if tubo:
        R = 8
        for k in range(n):
            for i in range(R):
                a, b = k * R + i, k * R + (i + 1) % R
                faces.append((a, b, b + R, a + R))
    else:
        for k in range(n):
            a = 2 * k
            faces.append((a, a + 1, a + 3, a + 2))
    return verts, faces, uvs


def _esfera(c, r, rot=0.0, u=12, v=8):
    bm = bmesh.new()
    m = Matrix.Translation(Vector(c)) @ Matrix.Rotation(rot, 4, 'Z') @ Matrix.Diagonal((r[0], r[1], r[2], 1))
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=1.0, matrix=m)
    verts = [tuple(v.co) for v in bm.verts]
    faces = [tuple(v.index for v in f.verts) for f in bm.faces]
    bm.free()
    uvs = [(0.5 + math.atan2(p[0] - c[0], p[1] - c[1]) / (2 * math.pi), 0.5 + (p[2] - c[2]) / (2 * max(r))) for p in verts]
    return verts, faces, uvs


def _juntar(ob, partes, espessura=0.0):
    """Acrescenta as partes (verts, faces, uvs) à malha do cinto, no mesmo material e UV."""
    me = ob.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uvl = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UV')
    for verts, faces, uvs in partes:
        vs = [bm.verts.new(v) for v in verts]
        for f in faces:
            try:
                face = bm.faces.new([vs[i] for i in f])
            except ValueError:
                continue
            face.smooth = True
            for l in face.loops:
                l[uvl].uv = uvs[vs.index(l.vert)]
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    me.update()


def detalhar(ob, estilo, saia, cx, cy, z_cinto, r_anel):
    """Acrescenta nó e pontas ao cinto `ob` (já ajustado ao anel da cintura)."""
    arv = _arvore(saia)
    S = len(r_anel)
    th0 = 0.42  # frente, à esquerda do personagem
    k = (th0 + math.pi) / (2 * math.pi) * S - 0.5
    r = float(r_anel[int(k) % S])
    no = Vector((cx + math.sin(th0) * (r + 0.02), cy - math.cos(th0) * (r + 0.02), z_cinto))
    partes = []
    if estilo == 'faixa':
        partes.append(_esfera(no, (0.024, 0.014, 0.02), rot=th0))
        h = 0.075 / 2
        partes.append(_ponta(arv, cx, cy, z_cinto - h + 0.01, th0 - 0.05, 0.2, 0.05, 0.011, gira=-0.1))
        partes.append(_ponta(arv, cx, cy, z_cinto - h + 0.01, th0 + 0.07, 0.16, 0.045, 0.013, gira=0.12))
    elif estilo == 'couro':
        partes.append(_esfera(no, (0.016, 0.009, 0.012), rot=th0))
        partes.append(_ponta(arv, cx, cy, z_cinto - 0.012, th0 - 0.03, 0.1, 0.018, 0.009, gira=-0.05))
        partes.append(_ponta(arv, cx, cy, z_cinto - 0.012, th0 + 0.04, 0.075, 0.018, 0.01, gira=0.06))
    else:  # corda
        partes.append(_esfera(no, (0.014, 0.011, 0.013), rot=th0))
        for dth, comp in ((-0.03, 0.15), (0.04, 0.12)):
            partes.append(_ponta(arv, cx, cy, z_cinto - 0.008, th0 + dth, comp, 0, 0.009, gira=dth, tubo=0.0055))
            # borla na ponta
            p = _fora(arv, cx, cy, z_cinto - 0.008 - comp, th0 + dth * 2)
            if p is not None:
                rad = Vector((math.sin(th0), -math.cos(th0), 0))
                partes.append(_esfera(p + rad * 0.011 + Vector((0, 0, -0.012)), (0.008, 0.008, 0.016), u=10, v=6))
    _juntar(ob, partes)
    if estilo == 'faixa':
        # as pontas de tecido ganham espessura (as outras partes já são fechadas)
        pass
    return ob


def fivela(nome, mat, cx, cy, z_cinto, r_anel, th=0.0):
    """Fivela de bronze retangular na frente do cinto de couro (peça própria)."""
    S = len(r_anel)
    k = (th + math.pi) / (2 * math.pi) * S - 0.5
    r = float(r_anel[int(k) % S]) + 0.017
    c = Vector((cx + math.sin(th) * r, cy - math.cos(th) * r, z_cinto))
    # moldura: anel (toro) de 3,8 cm, achatado na altura, de frente para fora do corpo
    bpy.ops.mesh.primitive_torus_add(major_radius=0.024, minor_radius=0.0045, major_segments=20, minor_segments=8,
                                     location=tuple(c), rotation=(math.pi / 2, 0, th))
    ob = bpy.context.active_object
    ob.name = nome
    ob.scale = (1.0, 0.82, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    me = ob.data
    me.name = nome
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        p.use_smooth = True
        for li in p.loop_indices:
            uv.data[li].uv = (0.5, 0.5)
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    return ob
