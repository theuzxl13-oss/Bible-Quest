"""
Reduz a malha do corpo e transfere a textura para UVs novas com margem.
A textura gerada pela IA vem picotada em centenas de ilhas sem margem: a filtragem
(e o mipmap no jogo) vaza cor entre ilhas vizinhas. As UVs novas têm margem e a
transferência (bake) lê a textura antiga sem interpolação.
Uso: blender -b -P rebake.py -- <entrada.blend> <triangulos> <resolucao> <saida.blend>
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
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
me.calc_loop_triangles()
n0 = len(me.loop_triangles)
dec = corpo.modifiers.new('Reduzir', 'DECIMATE')
dec.ratio = min(1.0, tris / n0)
dec.use_collapse_triangulate = True
while corpo.modifiers[0] != dec:
    bpy.ops.object.modifier_move_up(modifier=dec.name)
bpy.ops.object.modifier_apply(modifier=dec.name)
me.calc_loop_triangles()
print('triângulos', n0, '->', len(me.loop_triangles))

velha = me.uv_layers[0]
velha.name = 'UVvelha'
nova = me.uv_layers.new(name='UVMap')
me.uv_layers.active = nova
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.006, area_weight=0.0, correct_aspect=True, scale_to_bounds=True)
bpy.ops.object.mode_set(mode='OBJECT')

mat = me.materials[0]
nt = mat.node_tree
fonte = [n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.image and n.image.name in ('Pele_modular', 'Image_0')][0]
img_velha = fonte.image
alvo_img = bpy.data.images.new('Pele_base', res, res, alpha=False)
for n in list(nt.nodes):
    nt.nodes.remove(n)
uvn = nt.nodes.new('ShaderNodeUVMap')
uvn.uv_map = 'UVvelha'
tx = nt.nodes.new('ShaderNodeTexImage')
tx.image = img_velha
tx.interpolation = 'Closest'
em = nt.nodes.new('ShaderNodeEmission')
out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(uvn.outputs['UV'], tx.inputs['Vector'])
nt.links.new(tx.outputs['Color'], em.inputs['Color'])
nt.links.new(em.outputs[0], out.inputs[0])
alvo = nt.nodes.new('ShaderNodeTexImage')
alvo.image = alvo_img
nt.nodes.active = alvo
alvo.select = True

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 1
sc.cycles.use_denoising = False
sc.render.bake.margin = 12
sc.render.bake.use_clear = True
# as roupas e o esqueleto não entram no bake
for o in bpy.data.objects:
    o.select_set(o == corpo)
bpy.ops.object.bake(type='EMIT')
print('bake ok')

# material final: textura nova, sem a textura de metal/rugosidade da IA
for n in list(nt.nodes):
    nt.nodes.remove(n)
bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf.inputs['Roughness'].default_value = 0.6
bsdf.inputs['Metallic'].default_value = 0.0
tx = nt.nodes.new('ShaderNodeTexImage')
tx.image = alvo_img
out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
nt.links.new(bsdf.outputs[0], out.inputs[0])
me.uv_layers.remove(me.uv_layers['UVvelha'])
alvo_img.filepath_raw = os.path.splitext(saida)[0] + '-pele.png'
alvo_img.file_format = 'PNG'
alvo_img.save()
alvo_img.pack()
for im in list(bpy.data.images):
    if im != alvo_img and im.users == 0:
        bpy.data.images.remove(im)
bpy.ops.wm.save_as_mainfile(filepath=saida)
print('salvo', saida)
