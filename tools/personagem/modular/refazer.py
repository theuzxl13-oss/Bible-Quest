"""
Limpa e reduz a malha do corpo (as UVs e a textura continuam as mesmas).

A malha gerada pela IA tem faces internas (arestas com mais de duas faces), que
fazem a redução criar pontas. Aqui elas são removidas e a malha é reduzida para o
mesmo número de triângulos nos dois corpos.
Uso: blender -b -P refazer.py -- <entrada.blend> <triangulos> <resolucao> <saida.blend>
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
from mathutils.bvhtree import BVHTree  # noqa: E402
from comum import repouso  # noqa: E402

ent, tris, res, saida = sys.argv[-4], int(sys.argv[-3]), int(sys.argv[-2]), sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=ent)
corpo = bpy.data.objects['Corpo']
arm = bpy.data.objects['Esqueleto']
repouso(arm)
me = corpo.data
bpy.ops.object.select_all(action='DESELECT')
corpo.select_set(True)
bpy.context.view_layer.objects.active = corpo

# ---------------------------------------------------------------- 1. limpeza e redução
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-6)
for _ in range(3):
    rem = set()
    for e in bm.edges:
        if len(e.link_faces) > 2:
            fs = sorted(e.link_faces, key=lambda f: f.calc_area())
            rem.update(fs[:len(fs) - 2])
    if not rem:
        break
    bmesh.ops.delete(bm, geom=list(rem), context='FACES')
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
# a malha da IA tem metade das faces com a orientação trocada (o material era desenhado dos dois
# lados, o que escondia o problema). Teste de paridade: um raio sai da face pela normal; se cruzar a
# malha um número ímpar de vezes, a normal aponta para dentro e a face é invertida.
# camadas internas (cascas duplicadas sob o couro cabeludo e a roupa pintada): faces que não
# enxergam o lado de fora em nenhuma direção são removidas
import random as _rnd  # noqa: E402
_g = _rnd.Random(3)
DIRS = []
while len(DIRS) < 120:
    v = Vector((_g.uniform(-1, 1), _g.uniform(-1, 1), _g.uniform(-1, 1)))
    if 0.2 < v.length <= 1:
        DIRS.append(v.normalized())
bm.faces.ensure_lookup_table()
arvore = BVHTree.FromBMesh(bm)
internas = []
for f in bm.faces:
    c = f.calc_center_median()
    livre = False
    nf = f.normal
    for d in DIRS:
        loc, _, idx, _ = arvore.ray_cast(c + nf * 3e-4 * (1 if d.dot(nf) >= 0 else -1) + d * 2e-4, d, 3.0)
        if loc is None:
            livre = True
            break
    if not livre:
        internas.append(f)
bmesh.ops.delete(bm, geom=internas, context='FACES')
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
print('faces internas removidas', len(internas))
bm.faces.ensure_lookup_table()
arvore = BVHTree.FromBMesh(bm)
trocar = []
for f in bm.faces:
    n = f.normal
    if n.length < 0.5:
        continue
    o = f.calc_center_median() + n * 1e-5
    cont = 0
    for _ in range(12):
        loc, _, idx, _ = arvore.ray_cast(o, n, 4.0)
        if loc is None:
            break
        if idx != f.index:
            cont += 1
        o = loc + n * 1e-5
    if cont % 2 == 1:
        trocar.append(f)
bmesh.ops.reverse_faces(bm, faces=trocar)
# cabeça (quase convexa): face que aponta claramente para o centro da cabeça é invertida
cab = arm.data.bones['head']
zc = (cab.head_local.z + cab.tail_local.z) / 2
cv = [v.co for v in bm.verts if v.co.z > zc - 0.02]
centro = sum(cv, Vector()) / max(len(cv), 1)
radiais = []
for f in bm.faces:
    c = f.calc_center_median()
    if c.z < cab.head_local.z + 0.04:
        continue
    d = (c - centro).normalized()
    if f.normal.dot(d) < -0.3:
        radiais.append(f)
bmesh.ops.reverse_faces(bm, faces=radiais)
print('faces da cabeça invertidas pelo centro', len(radiais))
print('faces invertidas para fora', len(trocar), 'de', len(bm.faces))
bm.to_mesh(me)
bm.free()
# o rosto (frente da cabeça) quase não é reduzido: costuras de UV nos olhos e na boca ficam intactas
zp = arm.data.bones['neck01'].head_local.z
ycab = arm.data.bones['head'].head_local.y
prot = corpo.vertex_groups.new(name='Proteger_rosto')
for v in me.vertices:
    if v.co.z > zp + 0.05 and v.co.y < ycab:
        prot.add([v.index], 1.0, 'REPLACE')
dec = corpo.modifiers.new('Reduzir', 'DECIMATE')
dec.vertex_group = prot.name
dec.vertex_group_factor = 4.0
dec.invert_vertex_group = True  # no Blender, o peso do grupo marca o que PODE ser reduzido
dec.ratio = min(1.0, tris / len(me.polygons))
while corpo.modifiers[0] != dec:
    bpy.ops.object.modifier_move_up(modifier=dec.name)
bpy.ops.object.modifier_apply(modifier=dec.name)
corpo.vertex_groups.remove(corpo.vertex_groups['Proteger_rosto'])
me.calc_loop_triangles()
print('triângulos', len(me.loop_triangles))

bpy.ops.wm.save_as_mainfile(filepath=saida)
print('salvo', saida)
