"""
VALIDAÇÃO DA FERRAMENTA DE CONFERÊNCIA (tools/mapa/conferir_cena.py)

Mudanças feitas de propósito na cena JÁ MONTADA, na memória do Blender, para provar que a
ferramenta encontra e classifica cada tipo de diferença. Nada aqui muda arquivos, o eden.py ou
a pintura aprovada. Uso, com a opção --depois do modo impressao:

  blender -b -P tools/mapa/conferir_cena.py -- impressao tools/mapa/eden.py <saida> \
      --depois tools/mapa/validar_conferencia.py:<função>

Funções:
- variacao_pequena: desloca uma árvore em 3 milionésimos de metro (abaixo da tolerância);
- mudancas: uma mudança de cada tipo, cada uma numa parte diferente da cena:
    objeto removido (estrutural), ligação do compositor removida (estrutural),
    árvore da vida deslocada 0,5 m (numérica), energia do sol (numérica), cor de um material
    (numérica), inclinação da câmera (numérica), um vértice do terreno (numérica, nos vértices),
    redução de ruído do Cycles ligada (valor).
"""
import math


def _primeira(sc, prefixo):
    return next(o for o in sorted(sc.objects, key=lambda o: o.name) if o.name.startswith(prefixo))


def variacao_pequena(sc):
    _primeira(sc, 'veg').location.x += 3e-6


def mudancas(sc):
    import bpy
    bpy.data.objects.remove(_primeira(sc, 'ovelha'))                     # estrutural: objeto a menos
    nt = sc.node_tree
    nt.links.remove(next(l for l in nt.links if l.to_node.bl_idname == 'CompositorNodeHueSat'))  # estrutural: ligação
    sc.objects['arvore_vida_i'].location.x += 0.5                        # numérica: posição
    bpy.data.lights['sol'].energy = 4.6                                  # numérica: luz
    bpy.data.materials['Copa1'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[0] += 0.05  # numérica: material
    sc.camera.rotation_euler.x += math.radians(0.5)                      # numérica: câmera
    me = bpy.data.meshes['terreno']
    me.vertices[5000].co.z += 0.05                                       # numérica: vértice do terreno
    sc.cycles.use_denoising = True                                       # valor: opção do render
