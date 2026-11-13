"""Prepara a malha gerada pelo TRELLIS.2: une vértices, reduz o peso, põe em metros (pés em z = 0) e salva .blend.

Uso: blender -b -P preparar.py -- <entrada.glb> <saida.blend> <altura_m> <faces>
"""
import sys

import bpy
from mathutils import Vector

ent, saida, altura, faces = sys.argv[-4], sys.argv[-3], float(sys.argv[-2]), int(sys.argv[-1])
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
dec = ob.modifiers.new('dec', 'DECIMATE')
dec.ratio = min(1.0, faces / len(ob.data.polygons))
bpy.ops.object.modifier_apply(modifier='dec')
# escala e posição: pés em z = 0, centro em x = y = 0
zs = [v.co.z for v in ob.data.vertices]
xs = [v.co.x for v in ob.data.vertices]
ys = [v.co.y for v in ob.data.vertices]
k = altura / (max(zs) - min(zs))
desl = Vector(((max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, min(zs)))
for v in ob.data.vertices:
    v.co = (v.co - desl) * k
ob.data.update()
bpy.ops.object.shade_smooth()
print('faces', len(ob.data.polygons), 'vértices', len(ob.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=saida)
