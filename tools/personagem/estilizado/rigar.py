"""
Esqueleto, pesos e animações para o personagem estilizado (malha do TRELLIS.2 preparada por preparar.py).

O esqueleto usa os mesmos nomes de ossos do modelo v0.7, então as animações de
`tools/personagem/animacoes.py` (descritas em eixos do mundo) servem sem mudança.

Uso: blender -b -P rigar.py -- <entrada.blend> <juntas.json> <saida.blend>
"""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(AQUI))

ent, juntas_json, saida = sys.argv[-3], sys.argv[-2], sys.argv[-1]
J = json.load(open(juntas_json))
bpy.ops.wm.open_mainfile(filepath=ent)
corpo = bpy.data.objects['Corpo']

# ------------------------------------------------------------------ esqueleto
# (nome, pai, cabeça, cauda); o lado ".L" (x > 0) é espelhado para ".R"
OSSOS = [
    ('root', None, 'quadril', 'quadril_cima'),
    ('spine05', 'root', 'quadril', 'coluna1'),
    ('spine04', 'spine05', 'coluna1', 'coluna2'),
    ('spine03', 'spine04', 'coluna2', 'coluna3'),
    ('spine02', 'spine03', 'coluna3', 'coluna4'),
    ('spine01', 'spine02', 'coluna4', 'pescoco'),
    ('neck01', 'spine01', 'pescoco', 'nuca'),
    ('head', 'neck01', 'nuca', 'topo'),
    ('clavicle.L', 'spine01', 'clavicula', 'ombro'),
    ('upperarm01.L', 'clavicle.L', 'ombro', 'cotovelo'),
    ('lowerarm01.L', 'upperarm01.L', 'cotovelo', 'pulso'),
    ('wrist.L', 'lowerarm01.L', 'pulso', 'mao'),
    ('upperleg01.L', 'root', 'anca', 'joelho'),
    ('lowerleg01.L', 'upperleg01.L', 'joelho', 'tornozelo'),
    ('foot.L', 'lowerleg01.L', 'tornozelo', 'dedos'),
]


def ponto(nome, espelho=False):
    p = Vector(J[nome])
    if espelho:
        p.x = -p.x
    return p


arm_data = bpy.data.armatures.new('Esqueleto')
arm = bpy.data.objects.new('Esqueleto', arm_data)
bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
for nome, pai, a, b in OSSOS:
    lados = [('', False)] if not nome.endswith('.L') else [('.L', False), ('.R', True)]
    for suf, esp in lados:
        n = nome if not suf else nome[:-2] + suf
        eb = arm_data.edit_bones.new(n)
        eb.head = ponto(a, esp)
        eb.tail = ponto(b, esp)
        eb.roll = 0
        if pai:
            eb.parent = arm_data.edit_bones[pai if not pai.endswith('.L') else pai[:-2] + suf]
            eb.use_connect = False
bpy.ops.object.mode_set(mode='OBJECT')

# ------------------------------------------------------------------ pesos
# O "calor" automático do Blender falha em malhas abertas; calcula numa cópia
# fechada (remesh em voxels) e transfere para a malha original.
prox = corpo.copy()
prox.data = corpo.data.copy()
bpy.context.scene.collection.objects.link(prox)
rm = prox.modifiers.new('rm', 'REMESH')
rm.mode = 'VOXEL'
rm.voxel_size = 0.012
bpy.context.view_layer.objects.active = prox
bpy.ops.object.modifier_apply(modifier='rm')
bpy.ops.object.select_all(action='DESELECT')
prox.select_set(True)
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
print('grupos no proxy:', len(prox.vertex_groups))

for g in prox.vertex_groups:
    corpo.vertex_groups.new(name=g.name)
dt = corpo.modifiers.new('dt', 'DATA_TRANSFER')
dt.object = prox
dt.use_vert_data = True
dt.data_types_verts = {'VGROUP_WEIGHTS'}
dt.vert_mapping = 'POLYINTERP_NEAREST'
dt.layers_vgroup_select_src = 'ALL'
dt.layers_vgroup_select_dst = 'NAME'
bpy.context.view_layer.objects.active = corpo
bpy.ops.object.modifier_apply(modifier='dt')
bpy.data.objects.remove(prox)

# saia: perto do quadril segue o tronco, perto da barra divide com as pernas (menos rasgo ao andar)
saia_top, saia_base = J['saia'][0], J['saia'][1]
grupos = {g.name: g for g in corpo.vertex_groups}
for v in corpo.data.vertices:
    z = v.co.z
    if not (saia_base - 0.03 < z < saia_top) or abs(v.co.x) > J['saia'][2]:
        continue
    t = (saia_top - z) / (saia_top - saia_base)  # 0 no quadril, 1 na barra
    perna_max = 0.15 + 0.35 * max(0.0, min(1.0, t))
    pesos = {corpo.vertex_groups[g.group].name: g.weight for g in v.groups}
    perna = sum(w for n, w in pesos.items() if 'leg' in n)
    total = sum(pesos.values()) or 1
    if perna / total <= perna_max:
        continue
    k = perna_max * total / perna
    tirado = 0.0
    for n, w in pesos.items():
        if 'leg' in n:
            grupos[n].add([v.index], w * k, 'REPLACE')
            tirado += w * (1 - k)
    grupos['spine05'].add([v.index], pesos.get('spine05', 0) + tirado, 'REPLACE')

mod = corpo.modifiers.new('Esqueleto', 'ARMATURE')
mod.object = arm
corpo.parent = arm


# ------------------------------------------------------------------ repouso com braços junto ao corpo
def baixar_bracos(graus):
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    for lado in ('L', 'R'):
        pb = arm.pose.bones[f'upperarm01.{lado}']
        fim = arm.pose.bones[f'lowerarm01.{lado}'].tail
        d = (fim - pb.head).normalized()
        atual = math.degrees(math.acos(max(-1, min(1, -d.z))))
        giro = math.radians(atual - graus) * (1 if lado == 'L' else -1)
        R = Matrix.Translation(pb.head) @ Matrix.Rotation(giro, 4, 'Y') @ Matrix.Translation(-pb.head)
        pb.matrix = R @ pb.matrix
        bpy.context.view_layer.update()
        print(f'braço {lado}: {atual:.0f}° -> {graus}°')
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.objects.active = corpo
    bpy.ops.object.modifier_apply(modifier='Esqueleto')
    m = corpo.modifiers.new('Esqueleto', 'ARMATURE')
    m.object = arm
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='OBJECT')


baixar_bracos(J.get('braco_graus', 11))

# ------------------------------------------------------------------ animações
import animacoes  # noqa: E402

animacoes.gravar_clipes(arm)
bpy.ops.wm.save_as_mainfile(filepath=saida)
print('salvo', saida)
