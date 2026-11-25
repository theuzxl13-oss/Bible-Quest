"""
Prévia de um GLB do personagem modular (frente, 3/4, lado e costas), com luz de três pontos.
Uso: blender -b -P previa.py -- <modelo.glb> <saida.png> <pecas separadas por vírgula> [enquadramento: corpo|rosto] [cor do cabelo #hex] [expressão] [pele #hex]
"""
import math
import os
import sys

import bpy

args = sys.argv[sys.argv.index('--') + 1:]
glb, saida, pecas = args[0], args[1], set(args[2].split(','))
quadro = args[3] if len(args) > 3 else 'corpo'
cor_cabelo = args[4] if len(args) > 4 else '#3b2416'
expressao = args[5] if len(args) > 5 else ''
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene


def hexrgb(h):
    h = h.lstrip('#')
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1,)


for o in sc.objects:
    if o.type != 'MESH':
        continue
    mat = o.active_material
    tipo, _, peca = (mat.name if mat else '').partition('__')
    tipo = tipo.split('.')[0]
    peca = peca.split('.')[0]
    sempre = (tipo in ('Pele',) and 'sem_corpo' not in pecas) or 'todas' in pecas
    o.hide_render = not (sempre or peca in pecas)
    if tipo in ('Cabelo', 'Barba', 'Sobrancelhas') and mat:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        tx = [n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE']
        if bsdf and tx:
            mix = mat.node_tree.nodes.new('ShaderNodeMixRGB')
            mix.blend_type = 'MULTIPLY'
            mix.inputs[0].default_value = 1
            mix.inputs[2].default_value = hexrgb(cor_cabelo if tipo != 'Sobrancelhas' else cor_cabelo)
            mat.node_tree.links.new(tx[0].outputs['Color'], mix.inputs[1])
            mat.node_tree.links.new(mix.outputs[0], bsdf.inputs['Base Color'])
    if expressao and o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks:
            if kb.name == expressao:
                kb.value = 1.0
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 24
sc.cycles.use_denoising = False
sc.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Standard'
w = bpy.data.worlds.new('w')
sc.world = w
w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (0.32, 0.30, 0.28, 1)
w.node_tree.nodes['Background'].inputs[1].default_value = 0.6
for nome, pos, en, cor in (('chave', (2.5, -3, 3.2), 900, (1, 0.93, 0.85)), ('preench', (-3, -2.5, 1.8), 350, (0.85, 0.9, 1)), ('contra', (0.5, 3.5, 3), 600, (1, 0.95, 0.9))):
    ld = bpy.data.lights.new(nome, 'AREA')
    ld.energy = en
    ld.size = 2.5
    ld.color = cor
    lo = bpy.data.objects.new(nome, ld)
    sc.collection.objects.link(lo)
    lo.location = pos
    d = -lo.location.normalized() if False else None
    lo.rotation_euler = (0, 0, 0)
    c = bpy.data.objects.new('alvo_' + nome, None)
    sc.collection.objects.link(c)
    c.location = (0, 0, 1.0)
    t = lo.constraints.new('TRACK_TO')
    t.target = c
    t.track_axis = 'TRACK_NEGATIVE_Z'
    t.up_axis = 'UP_Y'
cam_d = bpy.data.cameras.new('cam')
cam = bpy.data.objects.new('cam', cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
alvo = bpy.data.objects.new('alvo', None)
sc.collection.objects.link(alvo)
tc = cam.constraints.new('TRACK_TO')
tc.target = alvo
tc.track_axis = 'TRACK_NEGATIVE_Z'
tc.up_axis = 'UP_Y'
# altura da cabeça pelo topo das malhas visíveis
zmax = max((o.matrix_world @ v.co).z for o in sc.objects if o.type == 'MESH' and not o.hide_render for v in list(o.data.vertices)[::20])
if quadro == 'rosto':
    alvo.location = (0, 0, zmax - 0.13)
    cam_d.type = 'ORTHO'
    cam_d.ortho_scale = 0.36
    dist = 2
    res = (520, 560)
    vistas = tuple(int(v) for v in os.environ.get('VISTAS', '0,35,90,180').split(','))
else:
    alvo.location = (0, 0, zmax / 2)
    cam_d.type = 'ORTHO'
    cam_d.ortho_scale = zmax * 1.08
    dist = 4
    res = (420, 760)
    vistas = (0, 35, 90, 180)
sc.render.resolution_x, sc.render.resolution_y = res
sc.render.film_transparent = False
partes = []
for i, a in enumerate(vistas):
    r = math.radians(a)
    cam.location = (math.sin(r) * dist, -math.cos(r) * dist, alvo.location.z + (0.05 if quadro == 'rosto' else 0.3))
    f = f'{saida}.{i}.png'
    sc.render.filepath = f
    bpy.ops.render.render(write_still=True)
    partes.append(f)
from PIL import Image  # noqa: E402
ims = [Image.open(f) for f in partes]
o = Image.new('RGB', (sum(i.width for i in ims), ims[0].height))
x = 0
for im in ims:
    o.paste(im.convert('RGB'), (x, 0))
    x += im.width
o.save(saida)
for f in partes:
    os.remove(f)
print('prévia', saida)
