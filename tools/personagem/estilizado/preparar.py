"""Prepara a malha gerada pelo TRELLIS.2: une vértices, reduz o peso, põe em metros (pés em z = 0) e salva .blend.

Uso: blender -b -P preparar.py -- <entrada.glb> <saida.blend> <altura_m> <faces> [peso_rosto]

peso_rosto: 0 mantém o rosto inteiro (padrão); um valor entre 0 e 1 também reduz o rosto, só que menos que o corpo
(útil nos corpos base, de cabeça grande, em que o rosto inteiro tomaria quase todo o limite de faces).
"""
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
ent, saida, altura, faces = args[0], args[1], float(args[2]), int(args[3])
peso_rosto = float(args[4]) if len(args) > 4 else 0.0
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=ent)
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
for o in list(bpy.data.objects):
    if o is not ob:
        bpy.data.objects.remove(o)
ob.name = 'Corpo'
bpy.context.view_layer.objects.active = ob
ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.0004)
bpy.ops.object.mode_set(mode='OBJECT')
# escala e posição: pés em z = 0, centro em x = y = 0
zs = [v.co.z for v in ob.data.vertices]
xs = [v.co.x for v in ob.data.vertices]
ys = [v.co.y for v in ob.data.vertices]
k = altura / (max(zs) - min(zs))
desl = Vector(((max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, min(zs)))
for v in ob.data.vertices:
    v.co = (v.co - desl) * k
# reduz o corpo, mas mantém o rosto (frente da cabeça) com toda a resolução, para as expressões
g = ob.vertex_groups.new(name='reduzir')
z_rosto = altura * 0.82
for v in ob.data.vertices:
    rosto = v.co.z > z_rosto and v.co.y < 0.02 * altura and abs(v.co.x) < 0.075 * altura
    g.add([v.index], peso_rosto if rosto else 1.0, 'REPLACE')
dec = ob.modifiers.new('dec', 'DECIMATE')
dec.ratio = min(1.0, faces / len(ob.data.polygons))
dec.vertex_group = 'reduzir'
bpy.ops.object.modifier_apply(modifier='dec')
if 'reduzir' in ob.vertex_groups:
    ob.vertex_groups.remove(ob.vertex_groups['reduzir'])
ob.data.update()
bpy.ops.object.shade_smooth()
print('faces', len(ob.data.polygons), 'vértices', len(ob.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=saida)
