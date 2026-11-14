"""
Exporta um corpo base já com esqueleto e animações (saída de rigar.py) para GLB.
Sem regiões de cor, expressões nem acessórios: isso vem nas próximas etapas do editor modular.

Uso: blender -b -P exportar_corpo.py -- <entrada-rig.blend> <saida.glb>
"""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import construir  # noqa: E402

ent, saida = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=ent)
arm = bpy.data.objects['Esqueleto']
arm.animation_data.action = None
for t in arm.animation_data.nla_tracks:
    t.mute = False
bpy.context.scene['estilo'] = 'animacao'
construir.exportar(saida, extras=True)
print('GLB', saida)
