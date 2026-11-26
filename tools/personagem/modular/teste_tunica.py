"""
Iteração rápida da túnica paramétrica: abre o corpo preparado (modular-<g>-2.blend), constrói a
túnica (tunica.py) e renderiza frente, 3/4, lado e costas. Não exporta nada.
Uso: blender -b -P teste_tunica.py -- <corpo.blend> <juntas.json> <feminino|masculino> <saida.png> [curta]
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from comum import RAIZ, repouso  # noqa: E402

sys.path.insert(0, RAIZ)
from vestes import coords, pesos_grupos  # noqa: E402
import tunica  # noqa: E402

args = sys.argv[sys.argv.index('--') + 1:]
ent, jj, genero, saida = args[:4]
curta = 'curta' in args[4:]
J = json.load(open(jj))
bpy.ops.wm.open_mainfile(filepath=ent)
corpo = bpy.data.objects['Corpo']
arm = bpy.data.objects['Esqueleto']
repouso(arm)
ossos = {b.name: (tuple(b.head_local), tuple(b.tail_local)) for b in arm.data.bones}
tex = os.path.join(os.path.dirname(saida), 'linho-teste.jpg')
tunica.textura_linho(tex)
from PIL import Image as _I  # noqa: E402
_a = np.asarray(_I.open(tex), float) * (np.array([0.62, 0.38, 0.22]) if genero == 'masculino' else np.array([0.2, 0.36, 0.55]))
_I.fromarray(_a.astype(np.uint8)).save(tex)
mat = bpy.data.materials.new('Tunica')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
tx = mat.node_tree.nodes.new('ShaderNodeTexImage')
tx.image = bpy.data.images.load(tex)
mix = mat.node_tree.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
mix.blend_type = 'MULTIPLY'
mix.inputs['Factor'].default_value = 0
mix.inputs[7].default_value = (0.42, 0.22, 0.11, 1) if genero == 'masculino' else (0.08, 0.2, 0.36, 1)
mat.node_tree.links.new(tx.outputs['Color'], mix.inputs[6])
mat.node_tree.links.new(mix.outputs[2], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = 0.9
masc = tunica.arredondar_sob_tunica(corpo, ossos, lambda n: pesos_grupos(corpo, n), J['coluna1'][2] - 0.005)
saias = [('Tunica_saia_curta', J['joelho'][2] - 0.03)] if curta else [('Tunica_saia', 0.07)]
pecas, cint, zc, anel = tunica.construir(coords(corpo), lambda n: pesos_grupos(corpo, n), ossos, J, mat, saias, feminino=genero == 'feminino', poligonos=[tuple(p.vertices) for p in corpo.data.polygons])
sys.path.insert(0, RAIZ)
import vestes  # noqa: E402
couro = bpy.data.materials.new('Couro')
couro.use_nodes = True
couro.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.12, 0.06, 0.03, 1)
ci = vestes.cinto({'corpo': corpo}, couro, (cint[0], cint[1], cint[2] - 0.02, cint[3] - 0.02), zc, 'couro')
tunica.ajustar_cinto(ci, cint[0], cint[1], cint[2], cint[3], anel)
pecas.append(ci)
tunica.recolher_corpo(corpo, pecas[0], masc, z_max=ossos['neck01'][0][2] - 0.035)
for p in pecas:
    p.data.calc_loop_triangles()
    print('peça', p.name, len(p.data.vertices), 'vértices', len(p.data.loop_triangles), 'triângulos')
print('cintura', [round(x, 3) for x in cint], 'cinto', round(zc, 3))

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 20
sc.cycles.use_denoising = False
w = bpy.data.worlds.new('w')
sc.world = w
w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (0.32, 0.30, 0.28, 1)
w.node_tree.nodes['Background'].inputs[1].default_value = 0.6
alvo_l = bpy.data.objects.new('alvo_l', None)
sc.collection.objects.link(alvo_l)
alvo_l.location = (0, 0, 1.0)
for nome, pos, en in (('chave', (2.5, -3, 3.2), 900), ('preench', (-3, -2.5, 1.8), 350), ('contra', (0.5, 3.5, 3), 600)):
    ld = bpy.data.lights.new(nome, 'AREA')
    ld.energy = en
    ld.size = 2.5
    lo = bpy.data.objects.new(nome, ld)
    sc.collection.objects.link(lo)
    lo.location = pos
    t = lo.constraints.new('TRACK_TO')
    t.target = alvo_l
    t.track_axis = 'TRACK_NEGATIVE_Z'
    t.up_axis = 'UP_Y'
cam_d = bpy.data.cameras.new('cam')
cam_d.type = 'ORTHO'
zoom = os.environ.get('ZOOM')
cam_d.ortho_scale = float(zoom.split(',')[0]) if zoom else 1.9
cam = bpy.data.objects.new('cam', cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
alvo = bpy.data.objects.new('alvo', None)
sc.collection.objects.link(alvo)
alvo.location = (0, 0, float(zoom.split(',')[1]) if zoom else 0.86)
tc = cam.constraints.new('TRACK_TO')
tc.target = alvo
tc.track_axis = 'TRACK_NEGATIVE_Z'
tc.up_axis = 'UP_Y'
sc.render.resolution_x, sc.render.resolution_y = (420, 760) if not zoom else (520, 560)
vistas = [int(v) for v in os.environ.get('VISTAS', '0,45,90,180').split(',')]
partes = []
for i, a in enumerate(vistas):
    r = math.radians(a)
    cam.location = (math.sin(r) * 4, -math.cos(r) * 4, alvo.location.z + 0.25)
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
