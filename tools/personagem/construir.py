"""
Constrói o personagem 3D do Bible Quest no Blender e exporta em GLB.

Uso (sem interface):
    blender -b -P tools/personagem/construir.py -- --corpo masculino --saida public/models/personagem/heroi-masculino.glb

Etapas:
 1. Corpo: malha base MakeHuman (CC0) deformada por targets (sexo, idade,
    musculatura, proporções).
 2. Esqueleto "default" do MakeHuman (163 ossos, com rosto) e pesos de pele.
 3. Proxies ajustados ao corpo: olhos, sobrancelhas, cílios, dentes, língua
    e cabelos (texturas com transparência).
 4. Roupas de época modeladas e drapeadas por simulação de tecido (vestes.py).
 5. Animações e expressões (animacoes.py).
 6. Exportação GLB.
"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import mh  # noqa: E402

FONTE = os.path.join(AQUI, 'fonte')
SYS = os.path.join(FONTE, 'sys')
TEX = os.path.join(AQUI, 'saida', 'tex')
ESCALA = 0.1  # decímetros -> metros


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    out = {'corpo': 'masculino', 'saida': os.path.join(AQUI, 'saida', 'heroi.glb'), 'cabelos': 'todos', 'roupas': '1', 'anim': '1'}
    for i in range(0, len(a) - 1, 2):
        out[a[i].lstrip('-')] = a[i + 1]
    return out


def mh2b(p):
    """Coordenadas MakeHuman (Y para cima, dm) -> Blender (Z para cima, m)."""
    p = np.asarray(p)
    return np.stack([p[..., 0], -p[..., 2], p[..., 1]], axis=-1) * ESCALA


# ---------------------------------------------------------------- corpo
def targets_para(corpo: str):
    g = 'male' if corpo == 'masculino' else 'female'
    tg = os.path.join(FONTE, 'tg')
    lst = [(os.path.join(tg, f'{r}-{g}-young.target'), 1 / 3) for r in ('caucasian', 'african', 'asian')]
    lst.append((os.path.join(tg, f'universal-{g}-young-maxmuscle-averageweight.target'), 0.35 if g == 'male' else 0.12))
    lst.append((os.path.join(tg, f'universal-{g}-young-averagemuscle-minweight.target'), 0.25))
    lst.append((os.path.join(tg, f'{g}-young-averagemuscle-averageweight-idealproportions.target'), 0.6))
    return lst


def limpar_cena():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'


def malha(nome, verts_b, faces, uvs=None, face_uvs=None):
    me = bpy.data.meshes.new(nome)
    me.from_pydata([tuple(v) for v in verts_b], [], [tuple(f) for f in faces])
    if uvs is not None and len(uvs) and face_uvs is not None:
        uvl = me.uv_layers.new(name='UV')
        k = 0
        for poly, fu in zip(me.polygons, face_uvs):
            for li, ti in zip(poly.loop_indices, fu):
                uvl.data[li].uv = tuple(uvs[ti]) if ti >= 0 else (0, 0)
                k += 1
    for p in me.polygons:
        p.use_smooth = True
    me.validate()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


# ---------------------------------------------------------------- materiais
def imagem(caminho):
    return bpy.data.images.load(caminho, check_existing=True)


def material_pbr(nome, cor=(1, 1, 1, 1), textura=None, rugosidade=0.6, alfa=False, normal=None, especular=0.3, duplo=False):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = cor
    bsdf.inputs['Roughness'].default_value = rugosidade
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = especular
    if textura:
        tx = nt.nodes.new('ShaderNodeTexImage')
        tx.image = imagem(textura)
        nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
        if alfa:
            nt.links.new(tx.outputs['Alpha'], bsdf.inputs['Alpha'])
    if normal:
        tn = nt.nodes.new('ShaderNodeTexImage')
        tn.image = imagem(normal)
        tn.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(tn.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    if alfa:
        m.blend_method = 'HASHED'
        m.shadow_method = 'HASHED'
    m.use_backface_culling = not (alfa or duplo)
    return m


# ---------------------------------------------------------------- esqueleto
def criar_esqueleto(skel, V):
    arm = bpy.data.armatures.new('Esqueleto')
    ob = bpy.data.objects.new('Esqueleto', arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    bones = skel['bones']
    planes = skel.get('planes', {})
    ordem, visto = [], set()

    def visitar(n):
        if n in visto:
            return
        p = bones[n]['parent']
        if p:
            visitar(p)
        visto.add(n)
        ordem.append(n)

    for n in bones:
        visitar(n)
    jp = lambda name: Vector(mh2b(mh.joint_pos(skel, V, name)))
    for n in ordem:
        b = bones[n]
        eb = arm.edit_bones.new(n)
        eb.head = jp(b['head'])
        eb.tail = jp(b['tail'])
        if (eb.tail - eb.head).length < 1e-4:
            eb.tail = eb.head + Vector((0, 0, 0.01))
        if b['parent']:
            eb.parent = arm.edit_bones[b['parent']]
        pl = b.get('rotation_plane')
        if pl and pl in planes:
            a, c, d = (jp(x) for x in planes[pl])
            nrm = (c - a).cross(d - c)
            if nrm.length > 1e-8:
                eb.align_roll(nrm.normalized())
    bpy.ops.object.mode_set(mode='OBJECT')
    return ob


def aplicar_pesos(ob, pesos: dict, remap=None):
    for bone, vw in pesos.items():
        vg = ob.vertex_groups.get(bone) or ob.vertex_groups.new(name=bone)
        por_peso: dict[float, list[int]] = {}
        for v, w in vw.items():
            if remap is not None:
                v = remap.get(v)
                if v is None:
                    continue
            por_peso.setdefault(round(w, 4), []).append(v)
        for w, vs in por_peso.items():
            vg.add(vs, w, 'REPLACE')


def prender(ob, arm):
    ob.parent = arm
    mod = ob.modifiers.new('Esqueleto', 'ARMATURE')
    mod.object = arm


# ---------------------------------------------------------------- proxies
class Pesos:
    """Pesos da malha base como matriz densa (vértices x ossos), para herdar em proxies."""

    def __init__(self, pesos, n):
        self.ossos = list(pesos)
        self.W = np.zeros((n, len(self.ossos)), dtype=np.float32)
        for j, b in enumerate(self.ossos):
            for v, w in pesos[b].items():
                if v < n:
                    self.W[v, j] = w

    def para_proxy(self, px):
        Wp = (self.W[px.refs] * px.weights[:, :, None]).sum(axis=1)
        out = {}
        for j, b in enumerate(self.ossos):
            col = Wp[:, j]
            nz = np.nonzero(col > 1e-3)[0]
            if len(nz):
                out[b] = {int(i): float(col[i]) for i in nz}
        return out


def criar_proxy(caminho_mhclo, V, pesos: Pesos, arm, nome, material, sem_faces_uv=None):
    px = mh.read_mhclo(caminho_mhclo)
    ob_data = mh.read_obj(os.path.join(px.folder, px.obj_file))
    if sem_faces_uv:
        # remove faces cujo UV cai numa região (ex.: córnea dos olhos, que no MakeHuman é transparente)
        keep = [i for i, fu in enumerate(ob_data.face_uvs) if not all(sem_faces_uv(*ob_data.uvs[t]) for t in fu)]
        ob_data.faces = [ob_data.faces[i] for i in keep]
        ob_data.face_uvs = [ob_data.face_uvs[i] for i in keep]
    pos = mh.fit_proxy(px, V)
    if len(pos) != len(ob_data.verts):
        print('AVISO: vértices diferentes em', nome, len(pos), len(ob_data.verts))
    ob = malha(nome, mh2b(pos), ob_data.faces, ob_data.uvs, ob_data.face_uvs)
    ob.data.materials.append(material)
    aplicar_pesos(ob, pesos.para_proxy(px))
    prender(ob, arm)
    return ob, px


# ---------------------------------------------------------------- principal
def construir():
    a = args()
    corpo = a['corpo']
    limpar_cena()
    base = mh.read_obj(os.path.join(FONTE, 'base.obj'))
    V = mh.apply_targets(base.verts, targets_para(corpo))
    # pés no chão (y = 0); a malha do MakeHuman é centrada no quadril
    corpo_idx = sorted({v for f, g in zip(base.faces, base.face_group) if g == 'body' for v in f})
    V[:, 1] -= V[corpo_idx, 1].min()

    # malha do corpo (só o grupo "body"; ajudantes ficam de fora)
    body_faces = [f for f, g in zip(base.faces, base.face_group) if g == 'body']
    body_fuv = [t for t, g in zip(base.face_uvs, base.face_group) if g == 'body']
    usados = sorted({v for f in body_faces for v in f})
    remap = {v: i for i, v in enumerate(usados)}
    faces = [[remap[v] for v in f] for f in body_faces]
    corpo_ob = malha('Corpo', mh2b(V[usados]), faces, base.uvs, body_fuv)

    skel = mh.read_skeleton(os.path.join(FONTE, 'rig', 'default.mhskel'))
    arm = criar_esqueleto(skel, V)
    pesos_raw = mh.read_weights(os.path.join(FONTE, 'rig', 'default_weights.mhw'))
    aplicar_pesos(corpo_ob, pesos_raw, remap)
    prender(corpo_ob, arm)
    pesos = Pesos(pesos_raw, len(V))

    female = corpo == 'feminino'
    skin_tex = os.path.join(TEX, f'pele-{"f" if female else "m"}-clara.jpg')
    pele = material_pbr('Pele', textura=skin_tex, rugosidade=0.5, especular=0.35)
    corpo_ob.data.materials.append(pele)

    olhos_m = material_pbr('Olhos', textura=os.path.join(TEX, 'olho-castanho.jpg'), rugosidade=0.08, especular=0.6)
    criar_proxy(os.path.join(SYS, 'eyes', 'high-poly', 'high-poly.mhclo'), V, pesos, arm, 'Olhos', olhos_m, sem_faces_uv=lambda u, v: u > 0.82 and v < 0.18)
    dentes_m = material_pbr('Dentes', textura=os.path.join(TEX, 'dentes.jpg'), rugosidade=0.3)
    criar_proxy(os.path.join(SYS, 'teeth', 'teeth_base', 'teeth_base.mhclo'), V, pesos, arm, 'Dentes', dentes_m)
    lingua_m = material_pbr('Lingua', cor=(0.55, 0.22, 0.22, 1), rugosidade=0.4)
    criar_proxy(os.path.join(SYS, 'tongue', 'tongue01', 'tongue01.mhclo'), V, pesos, arm, 'Lingua', lingua_m)
    sob_m = material_pbr('Sobrancelhas', textura=os.path.join(TEX, 'sobrancelha.png' if not female else 'sobrancelha-f.png'), alfa=True, rugosidade=0.7)
    criar_proxy(os.path.join(SYS, 'eyebrows', 'eyebrow001' if not female else 'eyebrow006', ('eyebrow001' if not female else 'eyebrow006') + '.mhclo'), V, pesos, arm, 'Sobrancelhas', sob_m)
    cil_m = material_pbr('Cilios', textura=os.path.join(TEX, 'cilios.png'), alfa=True, rugosidade=0.7)
    criar_proxy(os.path.join(SYS, 'eyelashes', 'eyelashes01', 'eyelashes01.mhclo'), V, pesos, arm, 'Cilios', cil_m)

    # cabelos: um objeto por estilo do jogo (visibilidade alternada no navegador)
    estilos = {
        'curto': 'short02', 'raspado': 'short04', 'longo': 'long01', 'ondulado': 'bob01',
        'cacheado': 'afro01', 'coque': 'ponytail01', 'tranca': 'braid01',
    }
    if a['cabelos'] != 'todos':
        estilos = {k: v for k, v in estilos.items() if k in a['cabelos'].split(',')}
    for estilo, pasta in estilos.items():
        mhclo = os.path.join(SYS, 'hair', pasta, pasta + '.mhclo')
        m = material_pbr(f'Cabelo_{estilo}', textura=os.path.join(TEX, f'cabelo-{pasta}.png'), alfa=True, rugosidade=0.45, especular=0.5)
        ob, _ = criar_proxy(mhclo, V, pesos, arm, f'Cabelo_{estilo}', m)

    baixar_bracos(arm, graus=11)

    ctx = {'V': V, 'arm': arm, 'corpo': corpo_ob, 'pesos': pesos, 'female': female, 'skel': skel, 'mh2b': mh2b, 'material_pbr': material_pbr, 'aplicar_pesos': aplicar_pesos, 'prender': prender, 'malha': malha, 'TEX': TEX}
    if a['roupas'] == '1' and os.path.exists(os.path.join(AQUI, 'vestes.py')):
        import vestes
        vestes.vestir(ctx)
    if a['anim'] == '1' and os.path.exists(os.path.join(AQUI, 'animacoes.py')):
        import animacoes
        animacoes.animar(ctx)

    exportar(a['saida'])


def baixar_bracos(arm, graus=11):
    """
    Muda a pose de repouso: braços do "A" do MakeHuman para quase junto ao corpo.
    A pose é aplicada às malhas (que continuam com os mesmos pesos) e vira a
    nova pose de repouso do esqueleto. Roupas criadas depois já nascem nela.
    """
    import math
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    for lado in ('L', 'R'):
        pb = arm.pose.bones[f'upperarm01.{lado}']
        fim = arm.pose.bones[f'lowerarm02.{lado}'].tail
        d = (fim - pb.head).normalized()
        atual = math.degrees(math.acos(max(-1, min(1, -d.z))))
        giro = math.radians(atual - graus) * (1 if lado == 'L' else -1)
        R = Matrix.Translation(pb.head) @ Matrix.Rotation(giro, 4, 'Y') @ Matrix.Translation(-pb.head)
        pb.matrix = R @ pb.matrix
        bpy.context.view_layer.update()
        print(f'braço {lado}: {atual:.0f}° da vertical -> {graus}°')
    bpy.ops.object.mode_set(mode='OBJECT')
    # aplica a pose nas malhas e redefine o repouso
    for ob in [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]:
        bpy.context.view_layer.objects.active = ob
        for m in [m for m in ob.modifiers if m.type == 'ARMATURE']:
            bpy.ops.object.modifier_apply(modifier=m.name)
        mod = ob.modifiers.new('Esqueleto', 'ARMATURE')
        mod.object = arm
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='OBJECT')


def exportar(caminho):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    # cada peça ganha um material próprio "<tipo>__<peça>": o compressor (gltfpack -km) não funde
    # peças diferentes, e o jogo identifica cada variante pelo nome do material
    for ob in bpy.data.objects:
        if ob.type != 'MESH' or not ob.data.materials:
            continue
        for i, m in enumerate(ob.data.materials):
            if m is None or '__' in m.name:
                continue
            m2 = m.copy()
            m2.name = f'{m.name}__{ob.name}'
            ob.data.materials[i] = m2
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.export_scene.gltf(
        filepath=caminho,
        export_format='GLB',
        export_skins=True,
        export_animations=True,
        export_animation_mode='NLA_TRACKS',
        export_force_sampling=False,
        export_morph=True,
        export_morph_normal=False,
        export_apply=False,
        export_yup=True,
        export_texcoords=True,
        export_colors=True,
        export_normals=True,
        export_image_format='WEBP',
        export_image_quality=82,
        export_all_influences=False,
        export_def_bones=False,
    )
    print('GLB exportado:', caminho, os.path.getsize(caminho) // 1024, 'KB')


if __name__ == '__main__':
    construir()
