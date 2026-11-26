"""
PEÇAS DO PERSONAGEM MODULAR (reformulação visual, entrega 1: personagens)

Parte do corpo-base estilizado (pintar.py + refazer.py) e acrescenta, no mesmo
esqueleto, as peças que a personalização mostra e esconde:
- sobrancelhas (normal e marcante) e sardas: peças do rosto;
- 7 cabelos esculpidos (casca do couro cabeludo + volumes fundidos por voxels),
  com textura de mechas e oclusão em tons de cinza (o jogo tinge pela cor do cabelo);
- barbas curta e cheia (só no masculino);
- túnica, saias, mantos, xale, capuz, cintos, sandálias, botas, bolsa, odre,
  colar, lenço e acessórios de mão (funções de ../vestes.py);
- expressões (morph targets Piscar, Sorriso, Surpresa, Alegria) no corpo, nas
  sobrancelhas, nas sardas e na barba, para tudo se mexer junto.

Uso: blender -b -P pecas.py -- <corpo.blend> <juntas.json> <rosto.json> <feminino|masculino> <saida.glb> [proto]
"""
import json
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402
from comum import RAIZ, margem, rasterizar_tri, repouso, suave  # noqa: E402

sys.path.insert(0, RAIZ)
import construir  # noqa: E402
import vestes  # noqa: E402
from vestes import ativar, coords, normais, novo_objeto, pesos_grupos, set_coords, subconjunto, suavizar  # noqa: E402

args = sys.argv[sys.argv.index('--') + 1:]
ent, jj, rj, genero, saida = args[:5]
PROTO = 'proto' in args[5:]
SO_ROUPAS = 'roupas' in args[5:]  # iteração rápida das roupas (um cabelo só)
J = json.load(open(jj))
R = json.load(open(rj))
FEM = genero == 'feminino'
random.seed(7)
np.random.seed(7)

bpy.ops.wm.open_mainfile(filepath=ent)
corpo = bpy.data.objects['Corpo']
arm = bpy.data.objects['Esqueleto']
repouso(arm)
ctx = {'corpo': corpo, 'arm': arm, 'female': FEM, 'TEX': construir.TEX, 'material_pbr': construir.material_pbr}
SAIDA_TEX = os.path.join(os.path.dirname(saida), f'tex-{genero}')
os.makedirs(SAIDA_TEX, exist_ok=True)

# ---------------------------------------------------------------- crânio sem o cabelo modelado da IA
# O corpo-base feminino tem coque e rabo de cavalo modelados na cabeça; todo penteado seria
# construído sobre esse volume. Pontos do couro cabeludo muito além do raio típico do crânio
# voltam para a superfície do crânio (o volume vem só das peças de cabelo).
def achatar_cranio():
    c = coords(corpo)
    w = pesos_grupos(corpo, ['head'])
    cab = arm.data.bones['head']
    zc = cab.head_local.z + (cab.tail_local.z - cab.head_local.z) * 0.45
    sel = (w > 0.6) & (c[:, 2] > zc - 0.02)
    if sel.sum() < 50:
        return
    pts = c[sel]
    centro = np.array([float(np.median(pts[:, 0])), float(np.median(pts[:, 1])), zc])
    d = np.linalg.norm(c - centro, axis=1)
    r_med = float(np.median(d[sel]))
    lim = r_med * 1.10
    fora = sel & (d > lim)
    if not fora.any():
        print('crânio: nada a achatar')
        return
    alvo = centro + (c - centro) / d[:, None] * (r_med * 1.04 + (d[:, None] - lim) * 0.0)
    k = suave(np.clip((d - lim) / (r_med * 0.08), 0, 1))[:, None] * fora[:, None]
    c2 = c * (1 - k) + alvo * k
    set_coords(corpo, c2)
    print('crânio: achatados', int(fora.sum()), 'vértices (raio típico', round(r_med, 3), ')')
    # rabo de cavalo modelado: peça estreita atrás da nuca, acima da base do pescoço -> removida
    zp_ = arm.data.bones['neck01'].head_local.z
    rabo = (c[:, 1] > centro[1] + r_med * 0.75) & (c[:, 2] > zp_ - 0.01) & (c[:, 2] < zc + 0.03) & (np.abs(c[:, 0] - centro[0]) < 0.065)
    if rabo.any():
        bm = bmesh.new()
        bm.from_mesh(corpo.data)
        bm.verts.ensure_lookup_table()
        faces = [f for f in bm.faces if all(rabo[v.index] for v in f.verts)]
        bmesh.ops.delete(bm, geom=faces, context='FACES')
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
        # o buraco é fechado (fica sob a casca de todo penteado) e o remendo segue a forma do crânio
        borda = [e for e in bm.edges if e.is_boundary and all((v.co.z > zp_ - 0.04 and v.co.y > centro[1]) for v in e.verts)]
        novas = bmesh.ops.holes_fill(bm, edges=borda, sides=0)['faces']
        tri = bmesh.ops.triangulate(bm, faces=novas)['faces']
        for _ in range(2):
            bmesh.ops.subdivide_edges(bm, edges=list({e for f in tri if f.is_valid for e in f.edges}), cuts=1, use_grid_fill=True)
            tri = [f for f in bm.faces if f.is_valid and not f.select]
            break
        for v in bm.verts:
            p = np.array(v.co)
            if p[1] > centro[1] + r_med * 0.5 and zp_ - 0.04 < p[2] < zc + 0.03:
                dd = np.linalg.norm(p - centro)
                if dd < r_med * 0.95:
                    v.co = Vector(centro + (p - centro) / max(dd, 1e-6) * r_med * 0.98)
        bm.normal_update()
        bm.to_mesh(corpo.data)
        bm.free()
        print('crânio: rabo de cavalo removido,', len(faces), 'faces; buraco fechado com', len(novas), 'faces')


achatar_cranio()

# ---------------------------------------------------------------- medidas
co = coords(corpo)
w_cab = pesos_grupos(corpo, ['head'])
cab_pts = co[w_cab > 0.6]
zp = arm.data.bones['neck01'].head_local.z  # base do pescoço
z_nuca = arm.data.bones['head'].head_local.z
HX = float(R['centro_x'])
H = Vector((HX, float(np.median(cab_pts[:, 1])), float((cab_pts[:, 2].max() + z_nuca) / 2)))
z_topo = float(cab_pts[:, 2].max())
r_cab = float(np.percentile(np.linalg.norm(cab_pts - np.array(H), axis=1), 90))
y_frente = float(cab_pts[:, 1].min())
ex_R, ez = R['olho_R'][0], (R['olho_R'][1] + R['olho_L'][1]) / 2
ex_L = R['olho_L'][0]
rx_o, rz_o = R['olho_raio']
mx, mz, mw = R['boca']
z_sob = float(R['sobrancelha_z'])
# orelhas: pontos mais afastados do centro, na altura dos olhos
faixa = cab_pts[(np.abs(cab_pts[:, 2] - (ez - 0.01)) < 0.03) & (np.abs(cab_pts[:, 1] - float(np.median(cab_pts[:, 1]))) < 0.07)]
ORELHAS = []
for s in (-1, 1):
    lado = faixa[np.sign(faixa[:, 0] - HX) == s]
    p = lado[np.argmax(np.abs(lado[:, 0] - HX))]
    ORELHAS.append(Vector(p))
print('cabeça: centro', tuple(round(v, 3) for v in H), 'raio', round(r_cab, 3), 'topo', round(z_topo, 3), 'orelhas', [tuple(round(v, 3) for v in o) for o in ORELHAS])

# ossos auxiliares (não deformam) usados pelas funções de vestes.py
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
for nome, pai, cab_, cau in (
    ('oculi01.L', 'head', (ex_L, y_frente + 0.01, z_sob + 0.035), (ex_L, y_frente, z_sob + 0.035)),
    ('special04', 'head', (mx, y_frente + 0.02, mz - 0.035), (mx, y_frente + 0.01, mz - 0.035)),
    ('pelvis.L', 'root', (J['anca'][0], J['anca'][1], J['quadril_cima'][2]), (J['anca'][0], J['anca'][1], J['anca'][2] - 0.05)),
):
    if nome not in eb:
        b = eb.new(nome)
        b.head, b.tail = cab_, cau
        b.parent = eb[pai]
        b.use_deform = False
bpy.ops.object.mode_set(mode='OBJECT')


def campo_rosto(pts):
    """Peso 1 na frente do rosto (para as expressões)."""
    return ((pts[:, 1] < H.y - 0.01) & (pts[:, 2] > mz - 0.05) & (pts[:, 2] < z_sob + 0.05)).astype(float)


def raycast_rosto(x, z, afasta=0.001):
    """Ponto da superfície do rosto em (x, z), vindo da frente, e a normal."""
    origem = Vector((x, y_frente - 0.2, z))
    ok, loc, nor, _ = corpo.ray_cast(origem, Vector((0, 1, 0)), distance=0.5)
    if not ok:
        return None, None
    return loc + nor * afasta, nor


def ligar_cabeca(ob, misto=None):
    """Pesos: tudo na cabeça (ou misturado com o tronco para cabelo comprido)."""
    validar(ob)
    for vg in list(ob.vertex_groups):
        ob.vertex_groups.remove(vg)
    gh = ob.vertex_groups.new(name='head')
    if misto is None:
        gh.add(list(range(len(ob.data.vertices))), 1.0, 'REPLACE')
    else:
        gt = ob.vertex_groups.new(name='spine01')
        gn = ob.vertex_groups.new(name='neck01')
        for v in ob.data.vertices:
            w = misto(v.co)
            if w > 0.999:
                gh.add([v.index], 1.0, 'REPLACE')
            else:
                gh.add([v.index], max(w, 0.0), 'REPLACE')
                resto = 1 - w
                gn.add([v.index], resto * 0.35, 'REPLACE')
                gt.add([v.index], resto * 0.65, 'REPLACE')
    ob.parent = arm
    m = ob.modifiers.new('Esqueleto', 'ARMATURE')
    m.object = arm


def validar(ob):
    """Remove atributos que sobraram de edições (o exportador descarta malhas inconsistentes)."""
    me = ob.data
    for nome in [a.name for a in me.attributes if a.domain == 'CORNER' and a.name not in [u.name for u in me.uv_layers] and not a.name.startswith('.')]:
        me.attributes.remove(me.attributes[nome])
    me.validate(clean_customdata=True)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-7)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    me.update()


def material_cinza(nome, imagem, rug=0.55, duplo=False, alfa=False):
    m = construir.material_pbr(nome, cor=(1, 1, 1, 1), rugosidade=rug, especular=0.35, duplo=duplo, alfa=alfa)
    nt = m.node_tree
    tx = nt.nodes.new('ShaderNodeTexImage')
    tx.image = imagem
    bsdf = nt.nodes['Principled BSDF']
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    if alfa:
        nt.links.new(tx.outputs['Alpha'], bsdf.inputs['Alpha'])
    return m


def imagem_de(nome, arr):
    h, w = arr.shape[:2]
    img = bpy.data.images.new(nome, w, h, alpha=True)
    a = np.ones((h, w, 4), np.float32)
    a[:, :, :arr.shape[2]] = arr
    img.pixels.foreach_set(a.reshape(-1))
    img.filepath_raw = os.path.join(SAIDA_TEX, nome + '.png')
    img.file_format = 'PNG'
    img.save()
    img.pack()
    return img


def oclusao(ob):
    """Oclusão por vértice (cavidades mais escuras), de 0 a 1."""
    me = ob.data
    ativar(ob)
    if not me.vertex_colors:
        me.vertex_colors.new(name='Sujeira')
    bpy.ops.object.mode_set(mode='VERTEX_PAINT')
    bpy.ops.paint.vertex_color_dirt(blur_strength=1.0, blur_iterations=2, clean_angle=3.14, dirt_angle=0.0, dirt_only=False, normalize=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    vc = me.vertex_colors[0]
    ao = np.zeros(len(me.vertices))
    n = np.zeros(len(me.vertices))
    for p in me.polygons:
        for li in p.loop_indices:
            v = me.loops[li].vertex_index
            ao[v] += vc.data[li].color[0]
            n[v] += 1
    me.vertex_colors.remove(vc)
    return ao / np.maximum(n, 1)


def textura_procedural(ob, res, funcao, nome):
    """UV automática e textura calculada por texel (posição 3D, normal, oclusão)."""
    me = ob.data
    while me.uv_layers:
        me.uv_layers.remove(me.uv_layers[0])
    me.uv_layers.new(name='UVMap')
    ativar(ob)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.01, area_weight=0.0, correct_aspect=True, scale_to_bounds=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    ao = oclusao(ob)
    nl = len(me.loops)
    uv = np.empty(nl * 2)
    me.uv_layers.active.data.foreach_get('uv', uv)
    uv = uv.reshape(-1, 2)
    me.calc_loop_triangles()
    tl = np.empty(len(me.loop_triangles) * 3, dtype=np.int32)
    tv = np.empty(len(me.loop_triangles) * 3, dtype=np.int32)
    me.loop_triangles.foreach_get('loops', tl)
    me.loop_triangles.foreach_get('vertices', tv)
    tl, tv = tl.reshape(-1, 3), tv.reshape(-1, 3)
    vco = coords(ob)
    vno = normais(ob)
    iy, ix, tri, L = rasterizar_tri(uv, tl, res)
    L = np.clip(L, 0, 1)
    L /= L.sum(1, keepdims=True)
    P = (L[:, :, None] * vco[tv[tri]]).sum(1)
    Nn = (L[:, :, None] * vno[tv[tri]]).sum(1)
    Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-9
    A = (L * ao[tv[tri]]).sum(1)
    cor = funcao(P, Nn, A)
    out = np.zeros((res, res, 4), np.float32)
    out[:, :, 3] = 1
    out[iy, ix, :cor.shape[1]] = cor
    if cor.shape[1] == 1:
        out[iy, ix, 1] = cor[:, 0]
        out[iy, ix, 2] = cor[:, 0]
    cob = np.zeros((res, res), bool)
    cob[iy, ix] = True
    out = margem(out, cob, 8)
    return imagem_de(nome, out[:, :, :3])


def ruido3(P, escala, sementes=3):
    """Ruído suave barato (soma de senos em direções aleatórias), de -1 a 1."""
    rng = np.random.default_rng(sementes)
    acc = np.zeros(len(P))
    for k in range(6):
        d = rng.normal(size=3)
        d /= np.linalg.norm(d)
        f = escala * (1.7 ** k)
        acc += np.sin(P @ d * f + rng.uniform(0, 6.28)) / (1.6 ** k)
    return acc / 2.2


# ---------------------------------------------------------------- material da pele (cor de base para o tingimento)
mat_pele = corpo.data.materials[0]
mat_pele.name = 'Pele'
# só a cor pintada: a textura de metal/rugosidade gerada pela IA sai (peso e brilho errado)
_nt = mat_pele.node_tree
_img = [n.image for n in _nt.nodes if n.type == 'TEX_IMAGE' and n.image and n.image.name in ('Pele_modular', 'Image_0')][0]
for _n in list(_nt.nodes):
    _nt.nodes.remove(_n)
_b = _nt.nodes.new('ShaderNodeBsdfPrincipled')
_b.inputs['Roughness'].default_value = 0.62
_t = _nt.nodes.new('ShaderNodeTexImage')
_t.image = _img
_o = _nt.nodes.new('ShaderNodeOutputMaterial')
_nt.links.new(_t.outputs['Color'], _b.inputs['Base Color'])
_nt.links.new(_b.outputs[0], _o.inputs[0])
mat_pele['base'] = '#%02x%02x%02x' % tuple(int(v * 255) for v in ((0.868, 0.576, 0.459) if FEM else (0.824, 0.506, 0.365)))
# o jogo identifica as peças pelo nome do material "<tipo>__<peça>"
pecas = []


# ---------------------------------------------------------------- sobrancelhas
def sobrancelha(nome, grossa):
    """Faixa curva sobre cada olho, projetada na pele (afastada 1 mm)."""
    verts, faces = [], []
    NU, NV = 18, 4
    esp = (0.0034 if FEM else 0.0046) * (1.55 if grossa else 1.0)
    for lado, ex in ((-1, ex_R), (1, ex_L)):
        base = len(verts)
        x_in = ex - lado * rx_o * 0.95
        x_out = ex + lado * rx_o * 1.35
        for i in range(NU + 1):
            u = i / NU
            x = x_in + (x_out - x_in) * u
            # arco: sobe até 60 % e desce no canto externo
            zc = z_sob + 0.0045 * math.sin(math.pi * min(1.0, u / 1.2)) - 0.004 * max(0.0, u - 0.6) / 0.4 - 0.0015 * (1 - u)
            e = esp * (0.75 + 0.55 * math.sin(math.pi * (0.15 + u * 0.7))) * (1 - 0.55 * max(0.0, u - 0.7) / 0.3)
            for j in range(NV + 1):
                v = j / NV - 0.5
                p, _ = raycast_rosto(x, zc + v * e, 0.0011 if not grossa else 0.0014)
                if p is None:
                    p = Vector((x, y_frente, zc + v * e))
                verts.append(tuple(p))
        for i in range(NU):
            for j in range(NV):
                a = base + i * (NV + 1) + j
                faces.append((a, a + NV + 1, a + NV + 2, a + 1) if lado > 0 else (a, a + 1, a + NV + 2, a + NV + 1))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    ob = novo_objeto(nome, me)
    # textura: fios inclinados, raiz mais clara no canto interno
    nu = np.linspace(0, 1, 64)
    fios = 0.72 + 0.28 * np.sin(np.linspace(0, 60, 64))[None, :] * np.ones((16, 1))
    arr = np.repeat(fios[:, :, None], 3, 2) * np.clip(0.6 + 0.6 * nu, 0, 1)[None, :, None]
    img = imagem_de(nome + '_tex', arr)
    uvl = me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        for li in p.loop_indices:
            vi = me.loops[li].vertex_index % ((NU + 1) * (NV + 1))
            i, j = divmod(vi, NV + 1)
            uvl.data[li].uv = (i / NU, j / NV)
    me.materials.append(material_cinza('Sobrancelhas', img, rug=0.8))
    ligar_cabeca(ob)
    return ob


pecas.append(sobrancelha('Sobrancelhas', False))
pecas.append(sobrancelha('Sobrancelhas_marcantes', True))


def sardas():
    """Decalque fino sobre o nariz e as bochechas, com pontinhos (textura com transparência)."""
    NU, NV = 28, 12
    x0, x1 = ex_R - rx_o * 1.3, ex_L + rx_o * 1.3
    z1, z0 = ez - rz_o * 1.3, ez - rz_o * 1.3 - 0.034
    verts, faces, uvs = [], [], []
    for j in range(NV + 1):
        for i in range(NU + 1):
            x = x0 + (x1 - x0) * i / NU
            z = z0 + (z1 - z0) * j / NV
            p, _ = raycast_rosto(x, z, 0.0007)
            verts.append(tuple(p) if p is not None else (x, y_frente, z))
            uvs.append((i / NU, j / NV))
    for j in range(NV):
        for i in range(NU):
            a_ = j * (NU + 1) + i
            faces.append((a_, a_ + 1, a_ + NU + 2, a_ + NU + 1))
    me = bpy.data.meshes.new('Sardas')
    me.from_pydata(verts, [], faces)
    uvl = me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        for li in p.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
        p.use_smooth = True
    ob = novo_objeto('Sardas', me)
    W_, H_ = 512, 256
    alfa = np.zeros((H_, W_), np.float32)
    rng = np.random.default_rng(21)
    yy, xx = np.mgrid[0:H_, 0:W_]
    # mais pontos no nariz e no alto das bochechas, nenhum perto dos olhos
    for _ in range(170):
        while True:
            u, v = rng.uniform(0.05, 0.95), rng.uniform(0.1, 0.85)
            x = x0 + (x1 - x0) * u
            dens = math.exp(-((x - H.x) / 0.05) ** 2) * 0.5 + 0.5 * math.exp(-((abs(x - H.x) - 0.04) / 0.025) ** 2)
            if rng.uniform() < dens:
                break
        r = rng.uniform(1.6, 3.2)
        d = np.sqrt((xx - u * W_) ** 2 + ((yy - v * H_) * 1.0) ** 2)
        alfa = np.maximum(alfa, np.clip(1 - (d - r * 0.5) / (r * 0.6), 0, 1) * rng.uniform(0.45, 0.8))
    borda = np.minimum.reduce([xx / 30, (W_ - xx) / 30, yy / 20, (H_ - yy) / 20, np.ones_like(xx, dtype=float)])
    alfa *= np.clip(borda, 0, 1)
    arr = np.zeros((H_, W_, 4), np.float32)
    arr[:, :, :3] = 1
    arr[:, :, 3] = alfa
    img = bpy.data.images.new('Sardas_tex', W_, H_, alpha=True)
    img.pixels.foreach_set(arr.reshape(-1))
    img.filepath_raw = os.path.join(SAIDA_TEX, 'Sardas_tex.png')
    img.file_format = 'PNG'
    img.save()
    img.pack()
    me.materials.append(material_cinza('Sardas', img, rug=0.7, alfa=True))
    ligar_cabeca(ob)
    return ob


pecas.append(sardas())


# ---------------------------------------------------------------- cabelos
def linha_cabelo(p, frente_z, lado_z, nuca_z):
    """Altura da linha do cabelo no azimute do ponto (0 = frente)."""
    az = math.atan2(p[0] - H.x, -(p[1] - H.y))
    t = abs(az) / math.pi  # 0 frente, 0,5 lados, 1 nuca
    if t < 0.5:
        return frente_z + (lado_z - frente_z) * suave(np.array(t / 0.5)).item()
    return lado_z + (nuca_z - lado_z) * suave(np.array((t - 0.5) / 0.5)).item()


def casca_couro(espessura, frente_z, lado_z, nuca_z, orelha_livre=True, extra=0.0):
    """Casca fechada sobre o couro cabeludo (espessura para fora da pele)."""
    w = pesos_grupos(corpo, ['head', 'neck01'])
    mask = np.zeros(len(co), bool)
    for i, p in enumerate(co):
        if w[i] < 0.3:
            continue
        if p[2] < linha_cabelo(p, frente_z, lado_z, nuca_z):
            continue
        if orelha_livre and any((Vector(p) - o).length < 0.03 for o in ORELHAS):
            continue
        mask[i] = True
    ob = subconjunto(corpo, mask, 'casca')
    ob.vertex_groups.clear()
    ob.data.materials.clear()
    if ob.data.shape_keys:
        ob.shape_key_clear()
    p = coords(ob)
    n = normais(ob)
    set_coords(ob, p + n * (espessura + extra))
    suavizar(ob, 6, 0.5)
    ativar(ob)
    m = ob.modifiers.new('Espessura', 'SOLIDIFY')
    m.thickness = espessura + extra + 0.002
    m.offset = -1
    m.use_rim = True
    bpy.ops.object.modifier_apply(modifier=m.name)
    return ob


def bolas(lista, nome='vol'):
    """Volumes (elipsoides) fundidos numa malha: lista de (centro, raios, rotação_z)."""
    mb = bpy.data.metaballs.new(nome)
    mb.resolution = 0.004
    mb.threshold = 0.6
    for c, r, rot in lista:
        el = mb.elements.new()
        el.type = 'ELLIPSOID'
        el.co = c
        el.radius = max(r) * 1.25
        el.size_x, el.size_y, el.size_z = (r[0] / max(r), r[1] / max(r), r[2] / max(r))
        el.size_x *= max(r) * 0.9
        el.size_y *= max(r) * 0.9
        el.size_z *= max(r) * 0.9
        el.rotation = (math.cos(rot / 2), 0, 0, math.sin(rot / 2))
        el.stiffness = 2.2
    ob = bpy.data.objects.new(nome, mb)
    bpy.context.scene.collection.objects.link(ob)
    ativar(ob)
    bpy.ops.object.convert(target='MESH')
    return bpy.context.view_layer.objects.active


def unir_voxels(obs, nome, voxel=0.0026, tris=3500, suav=3):
    ativar(obs[0])
    for o in obs:
        o.select_set(True)
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = nome
    m = ob.modifiers.new('Voxels', 'REMESH')
    m.mode = 'VOXEL'
    m.voxel_size = voxel
    bpy.ops.object.modifier_apply(modifier=m.name)
    if suav:
        sm = ob.modifiers.new('Liso', 'SMOOTH')
        sm.factor = 0.6
        sm.iterations = suav
        bpy.ops.object.modifier_apply(modifier=sm.name)
    me = ob.data
    # partes soltas pequenas (sobras da borda da casca) são removidas
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    visto = set()
    partes = []
    for v in bm.verts:
        if v.index in visto:
            continue
        comp, pilha = [], [v]
        visto.add(v.index)
        while pilha:
            u = pilha.pop()
            comp.append(u)
            for e in u.link_edges:
                w = e.other_vert(u)
                if w.index not in visto:
                    visto.add(w.index)
                    pilha.append(w)
        partes.append(comp)
    maior = max(len(c) for c in partes)
    lixo = [u for c in partes if len(c) < maior * 0.04 for u in c]
    bmesh.ops.delete(bm, geom=lixo, context='VERTS')
    bm.to_mesh(me)
    bm.free()
    me.calc_loop_triangles()
    d = ob.modifiers.new('Reduzir', 'DECIMATE')
    d.ratio = min(1.0, tris / max(1, len(me.loop_triangles)))
    bpy.ops.object.modifier_apply(modifier=d.name)
    for p in me.polygons:
        p.use_smooth = True
    return ob


def limpar_rosto(ob, z_franja):
    """Nada de cabelo na frente do rosto abaixo da franja (olhos e sobrancelhas livres)."""
    p = coords(ob)
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    tira = [v for v in bm.verts if v.co.y < H.y - r_cab * 0.45 and v.co.z < z_franja and abs(v.co.x - H.x) < r_cab * 0.72 and v.co.z > mz - 0.06]
    bmesh.ops.delete(bm, geom=tira, context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    del p


def empurrar_para_fora(ob, folga=0.0015):
    """Vértices do cabelo que entraram na cabeça voltam para fora da pele."""
    p = coords(ob)
    for i, v in enumerate(p):
        loc_ok, loc, nor, _ = corpo.closest_point_on_mesh(Vector(v))
        if not loc_ok:
            continue
        d = Vector(v) - loc
        if d.dot(nor) < folga:
            p[i] = np.array(loc + nor * folga)
    set_coords(ob, p)


def no_couro(az, el, r_extra=0.0):
    """Ponto na superfície aproximada da cabeça: azimute (0 = frente) e elevação (0 = equador, 90 = topo)."""
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    origem = H + d * 0.3
    ok, loc, nor, _ = corpo.ray_cast(origem, -d, distance=0.4)
    if not ok:
        return H + d * (r_cab + r_extra), d
    return loc + nor * r_extra, nor


def perto_corpo(p):
    ok, loc, nor, _ = corpo.closest_point_on_mesh(p)
    return (loc, nor) if ok else (None, None)


def textura_mechas(nome, variantes=4, cacheado=False):
    """Textura de uma mecha (u: largura, v: comprimento), em 4 variações lado a lado."""
    W_, H_ = 64 * variantes, 256
    u = (np.arange(W_) % 64 + 0.5) / 64
    v = (np.arange(H_) + 0.5) / H_
    U, V = np.meshgrid(u, v)
    var = (np.arange(W_) // 64)[None, :].repeat(H_, 0)
    rng = np.random.default_rng(11)
    fase = rng.uniform(0, 6.28, size=(variantes, 3))
    f1 = np.sin(U * 31 + fase[var, 0] + np.sin(V * 9 + fase[var, 1]) * 0.8)
    f2 = np.sin(U * 73 + fase[var, 2] + V * 3)
    fios = 0.80 + 0.11 * f1 + 0.06 * f2
    crista = 1 - 0.38 * np.abs(U - 0.5) ** 1.6 * 2.2  # bordas mais escuras (volume)
    raiz = 0.62 + 0.38 * suave(V / 0.35)
    ponta = 1 + 0.08 * suave((V - 0.7) / 0.3)
    brilho = 0.10 * np.exp(-((V - 0.42) / 0.12) ** 2) * (1 - np.abs(U - 0.5) * 1.6)
    if cacheado:
        fios = 0.82 + 0.12 * np.sin(V * 40 + U * 6)
    lum = np.clip(fios * crista * raiz * ponta + brilho, 0.12, 1.0)
    return imagem_de(nome, np.repeat(lum[:, :, None], 3, 2))


def raizes(espaco, frente_z, lado_z, nuca_z, filtro=None):
    """Pontos de raiz no couro cabeludo (amostragem com distância mínima)."""
    w = pesos_grupos(corpo, ['head', 'neck01'])
    cand = [Vector(p) for i, p in enumerate(co) if w[i] > 0.3 and p[2] > linha_cabelo(p, frente_z, lado_z, nuca_z) - 0.004
            and all((Vector(p) - o).length > 0.026 for o in ORELHAS)]
    random.Random(5).shuffle(cand)
    out = []
    grade = {}
    for p in cand:
        k = (int(p.x / espaco), int(p.y / espaco), int(p.z / espaco))
        ok = True
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    for q in grade.get((k[0] + dx, k[1] + dy, k[2] + dz), []):
                        if (p - q).length < espaco:
                            ok = False
        if ok and (filtro is None or filtro(p)):
            grade.setdefault(k, []).append(p)
            out.append(p)
    return out


def mecha(raiz, direcao0, comp, larg, alto, fluxo, segs=10, sobe=0.0):
    """Caminho de uma mecha sobre a cabeça: segue a superfície quando a gravidade a empurra
    contra ela e cai livre fora dela. fluxo(p, d, t) devolve a direção desejada."""
    pts = []
    p = Vector(raiz)
    d = Vector(direcao0).normalized()
    passo = comp / segs
    for k in range(segs + 1):
        t = k / segs
        alt = alto * (0.25 + 0.75 * suave(np.array(t / 0.3)).item()) + sobe * math.sin(math.pi * t)
        loc, nor = perto_corpo(p)
        if loc is not None:
            dist = (p - loc).dot(nor)
            # sobre a cabeça a mecha fica rente (à altura alt); fora dela só não pode entrar no corpo
            na_cabeca = (p - H).length < r_cab * 1.35 and p.z > zp + 0.02
            if dist < alt or (na_cabeca and dist > alt):
                p = loc + nor * alt
        # rosto livre: na frente das orelhas, nada desce abaixo da franja
        y_orelha = min(o.y for o in ORELHAS)
        if p.y < y_orelha and abs(p.x - H.x) < abs(ORELHAS[1].x - H.x) - 0.012 and p.z < z_sob + 0.016:
            p.z = z_sob + 0.016
        pts.append(p.copy())
        nd = fluxo(p, d, t)
        d = (d * 0.55 + nd.normalized() * 0.45).normalized()
        p = p + d * passo
    return pts


def fita(pts, larg, variante, nvar, verts, faces, uvs, afina=True):
    """Fita com crista (seção em V invertido) ao longo dos pontos."""
    n = len(pts)
    base = len(verts)
    for k, p in enumerate(pts):
        t = k / (n - 1)
        tg = (pts[min(k + 1, n - 1)] - pts[max(k - 1, 0)]).normalized()
        loc, nor = perto_corpo(p)
        nrm = (p - loc).normalized() if loc is not None and (p - loc).length > 1e-5 else (p - H).normalized()
        b = tg.cross(nrm).normalized()
        nrm = b.cross(tg).normalized()
        w = larg * ((1 - suave(np.array((t - 0.55) / 0.45)).item() * 0.92) if afina else 1.0) * (0.8 + 0.2 * math.sin(math.pi * min(1, t * 2)))
        w = max(w, 0.0008)
        for j, (a, h) in enumerate(((-0.5, -0.03), (0.0, 0.12), (0.5, -0.03))):
            verts.append(tuple(p + b * (a * w) + nrm * (h * w)))
            u0 = variante / nvar
            uvs.append((u0 + (j / 2) / nvar, t))
    for k in range(n - 1):
        for j in range(2):
            a = base + k * 3 + j
            faces.append((a, a + 1, a + 4, a + 3))


def malha_de_fitas(nome, verts, faces, uvs):
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    uvl = me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        for li in p.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    for p in me.polygons:
        p.use_smooth = True
    return novo_objeto(nome, me)


def tubo_trancado(caminho, raio, nome, verts, faces, uvs, variante, nvar, voltas=0.0, fase=0.0, amp=0.0):
    """Tubo com seção elíptica ao longo de um caminho (fios da trança)."""
    n = len(caminho)
    S = 8
    base = len(verts)
    for k, c in enumerate(caminho):
        t = k / (n - 1)
        tg = (caminho[min(k + 1, n - 1)] - caminho[max(k - 1, 0)]).normalized()
        b = tg.cross(Vector((0, 1, 0))).normalized()
        if b.length < 0.5:
            b = Vector((1, 0, 0))
        nn = b.cross(tg).normalized()
        ang = voltas * t * 2 * math.pi + fase
        ctr = c + b * math.sin(ang) * amp + nn * math.cos(ang) * amp * 0.55
        r = raio * (1 - 0.35 * t)
        for s in range(S):
            a = 2 * math.pi * s / S
            verts.append(tuple(ctr + b * math.cos(a) * r + nn * math.sin(a) * r * 0.8))
            uvs.append((variante / nvar + (s / S) / nvar, t * 4 % 1))
    for k in range(n - 1):
        for s in range(S):
            a = base + k * S + s
            b2 = base + k * S + (s + 1) % S
            faces.append((a, b2, b2 + S, a + S))


def tubo_caminho(pts, raios, nome='mecha'):
    """Tubo (curva com seção redonda e raio variável) ao longo dos pontos."""
    cu = bpy.data.curves.new(nome, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 2
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, c, r in zip(sp.points, pts, raios):
        p.co = (c[0], c[1], c[2], 1)
        p.radius = max(r, 0.0004)
    ob = bpy.data.objects.new(nome, cu)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def textura_por_fluxo(caminhos, estilo):
    """Fios que acompanham a mecha mais próxima de cada ponto (sulcos na direção da mecha)."""
    from mathutils.kdtree import KDTree
    pts, tgs = [], []
    for c in caminhos:
        for k in range(len(c)):
            pts.append(c[k])
            tgs.append((c[min(k + 1, len(c) - 1)] - c[max(k - 1, 0)]).normalized())
    kd = KDTree(len(pts))
    for i, p in enumerate(pts):
        kd.insert(p, i)
    kd.balance()
    TG = np.array([tuple(t) for t in tgs])

    def f(P, N, A):
        T = np.zeros((len(P), 3))
        for i, p in enumerate(P):
            for _, j, dd in kd.find_n(Vector(p), 8):
                T[i] += TG[j] / (dd + 0.004)
        T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-9
        B = np.cross(T, N)
        B /= np.linalg.norm(B, axis=1, keepdims=True) + 1e-9
        corte = (P * B).sum(1)  # coordenada transversal à mecha
        ao_longo = (P * T).sum(1)
        if estilo == 'cacheado':
            fios = 0.80 + 0.14 * np.sin(corte * 700 + ao_longo * 120) + 0.06 * ruido3(P, 400, 4)
        elif estilo == 'raspado':
            fios = 0.86 + 0.14 * ruido3(P, 900, 6)
        else:
            fios = 0.84 + 0.08 * np.sin(corte * 900 + ruido3(P, 150, 7) * 2.2) + 0.05 * np.sin(corte * 2300 + ao_longo * 40)
        rel = P - np.array(H)
        el = np.arctan2(rel[:, 2], np.hypot(rel[:, 0], rel[:, 1]))
        brilho = np.exp(-((el - 0.72) / 0.2) ** 2) * np.clip(N[:, 2] * 0.8 + 0.2, 0, 1) * 0.16
        ao = 0.76 + 0.24 * np.clip(A, 0, 1)
        return np.clip((0.78 * fios + brilho) * ao, 0.08, 1.0)[:, None]
    return f


def cabelo(estilo):
    nome = {'curto': 'Cabelo_curto', 'raspado': 'Cabelo_raspado', 'ondulado': 'Cabelo_ondulado', 'longo': 'Cabelo_longo',
            'cacheado': 'Cabelo_cacheado', 'coque': 'Cabelo_coque', 'tranca': 'Cabelo_tranca'}[estilo]
    frente_z = z_sob + (0.030 if FEM else 0.034)
    lado_z = ez + 0.004
    nuca_z = zp + 0.035
    orelha = estilo in ('raspado', 'curto', 'coque', 'tranca', 'cacheado')
    massa = {'raspado': 0.0035, 'curto': 0.0105, 'ondulado': 0.011, 'longo': 0.011, 'cacheado': 0.013, 'coque': 0.0075, 'tranca': 0.008}[estilo]
    casca = casca_couro(massa, frente_z + (0.004 if estilo == 'raspado' else 0.0), lado_z, nuca_z, orelha_livre=orelha)
    coroa = H + Vector((0, r_cab * 0.35, r_cab * 0.92))
    rng = random.Random(sum(map(ord, estilo)))
    G = Vector((0, 0, -1))
    risca_lado = not FEM

    def tangente(v, nor):
        return (v - nor * v.dot(nor))

    caminhos, raios, so_textura = [], [], []
    if estilo != 'raspado':
        cfg = {
            'curto': dict(esp=0.013, comp=(0.06, 0.09), r=0.0085, alto=0.0085, grav=0.45),
            'ondulado': dict(esp=0.012, comp=(0.13, 0.18), r=0.0135, alto=0.008, grav=0.75),
            'longo': dict(esp=0.011, comp=(0.30, 0.40), r=0.0145, alto=0.009, grav=0.85),
            'cacheado': dict(esp=0.017, comp=(0.045, 0.065), r=0.0115, alto=0.010, grav=0.2),
            'coque': dict(esp=0.02, comp=(0, 0), r=0.0085, alto=0.0035, grav=0.0),
            'tranca': dict(esp=0.02, comp=(0, 0), r=0.009, alto=0.004, grav=0.0),
        }[estilo]
        alvo_preso = None
        if estilo == 'coque':
            p, n = no_couro(180, 46, 0.0)
            alvo_preso = p + n * 0.01
        if estilo == 'tranca':
            p, n = no_couro(180, 2, 0.0)
            alvo_preso = p + n * 0.01
        for r0 in raizes(cfg['esp'], frente_z, lado_z, nuca_z):
            loc, nor = perto_corpo(r0)
            if loc is None:
                continue
            rel = r0 - H
            frente = rel.y < -r_cab * 0.35 and rel.z > (frente_z - H.z) - 0.03
            if alvo_preso is not None:
                def fluxo(p, d, t, a=alvo_preso):
                    lc, nr = perto_corpo(p)
                    v = (a - p)
                    tv = tangente(v, nr) if nr is not None else v
                    return tv.normalized() if tv.length > 1e-6 else v.normalized()
                comp = max(0.02, (alvo_preso - r0).length * 1.1)
                pts = mecha(r0, fluxo(r0, Vector((0, 1, 0)), 0), comp, 0, cfg['alto'], fluxo, segs=8)
            else:
                comp = rng.uniform(*cfg['comp'])
                radial = tangente(r0 - coroa, nor)
                d0 = radial.normalized() if radial.length > 1e-6 else Vector((0, -1, 0))
                if frente:
                    d0 = (d0 + (Vector((0.9, -0.2, -0.25)) if risca_lado else Vector((math.copysign(0.9, rel.x), 0, -0.3)))).normalized()
                fase = rng.uniform(0, 6.28)

                def fluxo(p, d, t, grav=cfg['grav'], fase=fase):
                    lc, nr = perto_corpo(p)
                    g = G.copy()
                    if estilo == 'longo' and p.z < ez:
                        g = (g + Vector((0, 0.9, 0))).normalized()
                    v = d * (1 - grav * t) + g * (grav * (0.4 + t))
                    if estilo == 'ondulado':
                        v += d.cross(Vector((0, 0, 1))) * math.sin(t * 9 + fase) * 0.5
                    if estilo == 'cacheado' and nr is not None:
                        v = d + d.cross(nr) * 1.7 * math.sin(t * 6 + fase) + nr * 0.35
                    return v
                pts = mecha(r0, d0, comp, 0, cfg['alto'] + rng.uniform(-0.001, 0.0015), fluxo, segs=6 if comp < 0.1 else 10)
            if estilo in ('curto', 'cacheado', 'coque', 'tranca'):
                corte = []
                for q in pts:
                    if q.z < linha_cabelo(q, frente_z, lado_z, nuca_z) + (0.012 if estilo != 'cacheado' else -0.01) or any((q - o).length < 0.034 for o in ORELHAS):
                        break  # a mecha termina antes da linha do cabelo e longe das orelhas
                    corte.append(q)
                pts = corte if len(corte) >= 3 else pts[:3]
            n = len(pts)
            rr = cfg['r'] * rng.uniform(0.85, 1.15)
            if estilo == 'curto' and rel.y > r_cab * 0.3 and rel.z < r_cab * 0.15:
                # atrás: só os sulcos da textura seguem o fluxo (sem relevo, a massa fica limpa)
                so_textura.append(pts)
                continue
            caminhos.append(pts)
            raios.append([rr * (0.7 + 0.3 * math.sin(math.pi * min(1, k / (n - 1) * 1.6))) * (1 - 0.55 * suave(np.array((k / (n - 1) - 0.55) / 0.45)).item()) for k in range(n)])
        if estilo == 'coque':
            ctr = alvo_preso + (alvo_preso - H).normalized() * 0.016
            ax = (alvo_preso - H).normalized()
            b1 = ax.cross(Vector((0, 0, 1))).normalized()
            b2 = ax.cross(b1).normalized()
            for k in range(7):
                c = []
                for sx in range(20):
                    a = k * 0.9 + sx * 0.38
                    r = 0.026 * (1 - 0.5 * k / 7)
                    c.append(ctr + b1 * math.cos(a) * r + b2 * math.sin(a) * r + ax * (0.01 * k / 7))
                caminhos.append(c)
                raios.append([0.0105] * len(c))
        if estilo == 'tranca':
            central = []
            p = Vector(alvo_preso)
            z_fim = J['coluna3'][2] + 0.01
            while p.z > z_fim:
                loc, nor = perto_corpo(p)
                if loc is not None and (p - loc).dot(nor) < 0.02:
                    p = loc + nor * 0.02
                central.append(p.copy())
                p = p + Vector((0, 0.003, -0.012))
            for i in range(3):
                c = []
                n = len(central)
                for k, q in enumerate(central):
                    a = k / 2.2 + i * 2.094
                    c.append(q + Vector((math.sin(a) * 0.008, math.cos(a) * 0.004, 0)))
                caminhos.append(c)
                raios.append([0.0085 * (1 - 0.3 * k / n) for k in range(n)])
            fim = central[-1]
            caminhos.append([fim + Vector((0, 0, 0.004)), fim + Vector((0, 0, -0.004))])
            raios.append([0.011, 0.011])
    obs = [casca]
    for c, r in zip(caminhos, raios):
        if len(c) >= 2:
            obs.append(tubo_caminho(c, r))
    for o in obs[1:]:
        ativar(o)
        bpy.ops.object.convert(target='MESH')
    ob = unir_voxels(obs, nome, voxel=0.0019 if estilo in ('raspado', 'curto') else 0.0023, tris=8000 if estilo not in ('raspado',) else 3000, suav=2)
    limpar_rosto(ob, z_sob + 0.012)
    # (sem empurrar para fora: o couro cabeludo do corpo é afundado 4 mm no fim)
    todos = caminhos + so_textura
    if not todos:
        todos = [[H + Vector((0, 0, r_cab)), H + Vector((0, -r_cab, 0))]]
    img = textura_procedural(ob, 512, textura_por_fluxo(todos, estilo), nome + '_tex')
    ob.data.materials.clear()
    ob.data.materials.append(material_cinza('Cabelo', img, rug=0.5, duplo=False))
    z_ligacao = zp + 0.02

    def misto(c):
        return float(suave(np.array((c.z - (z_ligacao - 0.07)) / 0.08)).item())
    ligar_cabeca(ob, misto if estilo in ('longo', 'tranca', 'ondulado') else None)
    print('cabelo', nome, len(ob.data.polygons), 'faces')
    return ob


ESTILOS = ['curto'] if (PROTO or SO_ROUPAS) else ['curto', 'raspado', 'ondulado', 'longo', 'cacheado', 'coque', 'tranca']
for e in ESTILOS:
    pecas.append(cabelo(e))


# ---------------------------------------------------------------- barbas (masculino)
def barba(estilo):
    nome = 'Barba_curta' if estilo == 'curta' else 'Barba_cheia'
    w = pesos_grupos(corpo, ['head', 'neck01'])
    o_r, o_l = ORELHAS
    mask = np.zeros(len(co), bool)
    for i, p in enumerate(co):
        if w[i] < 0.3 or p[1] > H.y + 0.01:
            continue
        x, y, z = p
        # linha de cima: da orelha (costeleta) descendo até o canto da boca
        t = min(1.0, abs(x - H.x) / max(abs(o_r.x - H.x), 0.01))
        topo = (mz + 0.010) + (ez - 0.048 - (mz + 0.010)) * t ** 1.25
        if z > topo or z < zp + 0.02:
            continue
        # lábios livres (o bigode fica acima do lábio de cima)
        u = (x - mx) / (mw * 1.15)
        if abs(u) < 1 and mz - 0.011 < z < mz + 0.0075 + 0.002 * (1 - u * u):
            continue
        if y > min(o_r.y, o_l.y) - 0.012:
            continue  # atrás da costeleta
        mask[i] = True
    print('barba: vértices na máscara', int(mask.sum()))
    ob = subconjunto(corpo, mask, nome)
    ob.vertex_groups.clear()
    ob.data.materials.clear()
    if ob.data.shape_keys:
        ob.shape_key_clear()
    p = coords(ob)
    n = normais(ob)
    # normais para fora da cabeça (a malha da IA tem normais invertidas em alguns trechos)
    fora = np.einsum('ij,ij->i', n, p - np.array(H)) < 0
    print('barba: normais invertidas', int(fora.sum()), 'de', len(n))
    n[fora] *= -1
    # distância (em arestas) até a borda da barba: a espessura cresce da borda para dentro
    me_b = ob.data
    viz = [[] for _ in range(len(me_b.vertices))]
    for e in me_b.edges:
        a_, b_ = e.vertices
        viz[a_].append(b_)
        viz[b_].append(a_)
    bm_b = bmesh.new()
    bm_b.from_mesh(me_b)
    borda = [v.index for v in bm_b.verts if v.is_boundary]
    bm_b.free()
    dist = np.full(len(p), 1e9)
    fila = list(borda)
    for i in borda:
        dist[i] = 0
    while fila:
        nova = []
        for i in fila:
            for j in viz[i]:
                dd = dist[i] + np.linalg.norm(p[i] - p[j])
                if dd < dist[j] - 1e-9:
                    dist[j] = dd
                    nova.append(j)
        fila = nova
    sobe = suave(dist / 0.012)
    if estilo == 'curta':
        off = 0.0008 + 0.0028 * sobe
    else:
        queixo = suave((mz - 0.01 - p[:, 2]) / 0.05)
        off = 0.0008 + (0.004 + 0.013 * queixo) * sobe
    set_coords(ob, p + n * off[:, None])
    suavizar(ob, 4, 0.5)
    ativar(ob)
    m = ob.modifiers.new('Espessura', 'SOLIDIFY')
    m.thickness = float(off.mean()) + 0.0015
    m.offset = -1
    bpy.ops.object.modifier_apply(modifier=m.name)
    obs = [ob]
    if estilo == 'cheia':
        pc, _ = raycast_rosto(mx, mz - 0.042, 0.012)
        if pc is not None:
            obs.append(bolas([(tuple(pc), (0.03, 0.022, 0.026), 0), (tuple(pc + Vector((0, 0.008, -0.012))), (0.024, 0.02, 0.02), 0)], 'queixo'))
        ob = unir_voxels(obs, nome, voxel=0.0022, tris=2600, suav=2)
    else:
        ob = unir_voxels(obs, nome, voxel=0.0016, tris=2000, suav=3)
    # a boca continua livre depois da fusão
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    tira = [v for v in bm.verts if abs((v.co.x - mx) / (mw * 1.1)) < 1 and mz - 0.009 < v.co.z < mz + 0.0065 and v.co.y < H.y - r_cab * 0.6]
    bmesh.ops.delete(bm, geom=tira, context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    empurrar_para_fora(ob, 0.0009)

    def f(P, N, A):
        if estilo == 'curta':
            lum = 0.72 + 0.18 * ruido3(P, 1400, 9) + 0.1 * ruido3(P, 300, 10)
        else:
            rel = P - np.array(H)
            lum = 0.75 + 0.2 * np.sin(rel[:, 0] * 520 + ruido3(P, 140, 11) * 2)
        return (np.clip(lum * (0.6 + 0.4 * A), 0.1, 1))[:, None]
    img = textura_procedural(ob, 256, f, nome + '_tex')
    ob.data.materials.clear()
    ob.data.materials.append(material_cinza('Barba', img, rug=0.6))
    ligar_cabeca(ob)
    print('barba', nome, len(ob.data.polygons))
    return ob


if not FEM:
    pecas.append(barba('curta'))
    if not PROTO:
        pecas.append(barba('cheia'))

# ---------------------------------------------------------------- roupas e acessórios (funções de ../vestes.py)
def tunica_cima(mat, z_cintura):
    """Parte de cima da túnica nos corpos estilizados, construída por anéis (não pela malha do corpo,
    que tem trechos irregulares): tronco da cintura à base do pescoço, seguindo a forma do corpo em cada
    altura e direção, e mangas em sino ao longo do eixo do braço até abaixo do cotovelo. As partes são
    fundidas por voxels: peça fechada, sem buracos e com as normais consistentes."""
    c = coords(corpo)
    zp_ = arm.data.bones['neck01'].head_local.z
    perto_braco = np.zeros(len(c), bool)
    bracos = []
    for lado in ('L', 'R'):
        om = np.array(arm.data.bones[f'upperarm01.{lado}'].head_local)
        co_ = np.array(arm.data.bones[f'lowerarm01.{lado}'].head_local)
        pu = np.array(arm.data.bones[f'wrist.{lado}'].head_local)
        eixo = pu - om
        L = np.linalg.norm(eixo)
        t = ((c - om) @ eixo) / (L * L)
        proj = om + np.clip(t, 0, 1)[:, None] * eixo
        dist = np.linalg.norm(c - proj, axis=1)
        braco = (dist < 0.07) & (t > 0.02) & (np.sign(c[:, 0]) == np.sign(om[0]))
        perto_braco |= braco
        bracos.append((om, eixo, L, t, dist, braco, ((co_ - om) @ eixo) / (L * L)))
    cx = float(np.median(c[(c[:, 2] > z_cintura) & (c[:, 2] < zp_) & ~perto_braco][:, 0]))
    cy = float(np.median(c[(c[:, 2] > z_cintura) & (c[:, 2] < zp_) & ~perto_braco][:, 1]))
    S = 48
    z0, z1 = z_cintura - 0.07, zp_ - 0.005
    NZ = 26
    verts, faces = [], []
    tronco = ~perto_braco
    ang = np.arctan2(c[:, 0] - cx, -(c[:, 1] - cy))
    rad = np.hypot(c[:, 0] - cx, c[:, 1] - cy)
    for k in range(NZ + 1):
        z = z0 + (z1 - z0) * k / NZ
        faixa = tronco & (np.abs(c[:, 2] - z) < 0.018)
        r = np.zeros(S)
        if faixa.any():
            b = ((ang[faixa] + math.pi) / (2 * math.pi) * S).astype(int) % S
            np.maximum.at(r, b, rad[faixa])
        # buracos (direções sem pontos) recebem o vizinho; leve suavização em volta
        for _ in range(S):
            if (r == 0).any():
                r = np.where(r == 0, np.maximum(np.roll(r, 1), np.roll(r, -1)), r)
        r = (np.roll(r, 1) + 2 * r + np.roll(r, -1)) / 4
        folga = 0.012 if z < z1 - 0.05 else 0.012 * max(0.3, (z1 - z) / 0.05)
        for i in range(S):
            a = -math.pi + 2 * math.pi * (i + 0.5) / S
            rr = r[i] + folga
            verts.append((cx + math.sin(a) * rr, cy - math.cos(a) * rr, z))
    for k in range(NZ):
        for i in range(S):
            a_, b_ = k * S + i, k * S + (i + 1) % S
            faces.append((a_, b_, b_ + S, a_ + S))
    # tampa de cima (gola) e de baixo: a fusão por voxels precisa de volumes fechados
    topo = len(verts)
    verts.append((cx, cy, z1))
    for i in range(S):
        faces.append((NZ * S + i, NZ * S + (i + 1) % S, topo))
    fundo = len(verts)
    verts.append((cx, cy, z0))
    for i in range(S):
        faces.append(((i + 1) % S, i, fundo))
    me = bpy.data.meshes.new('tronco')
    me.from_pydata(verts, [], faces)
    partes = [novo_objeto('tronco', me)]
    # mangas
    for om, eixo, L, t, dist, braco, t_cot in bracos:
        u = eixo / L
        ref = np.array([0, 0, 1.0]) if abs(u[2]) < 0.9 else np.array([1.0, 0, 0])
        b1 = np.cross(u, ref)
        b1 /= np.linalg.norm(b1)
        b2 = np.cross(u, b1)
        t_fim = t_cot + 0.12
        NT, SM = 14, 20
        vs, fs = [], []
        for k in range(NT + 1):
            tt = -0.06 + (t_fim + 0.06) * k / NT
            fatia = braco & (np.abs(t - tt) < 0.05)
            rr = float(np.percentile(dist[fatia], 95)) if fatia.sum() > 5 else 0.05
            rr += 0.011 + 0.022 * max(0.0, (tt - t_cot * 0.5)) / max(t_fim, 1e-3)  # sino
            ctr = om + u * (tt * L)
            for i in range(SM):
                a = 2 * math.pi * i / SM
                vs.append(tuple(ctr + (b1 * math.cos(a) + b2 * math.sin(a)) * rr))
        for k in range(NT):
            for i in range(SM):
                a_, b_ = k * SM + i, k * SM + (i + 1) % SM
                fs.append((a_, b_, b_ + SM, a_ + SM))
        for lado_, k in (('ini', 0), ('fim', NT)):
            cc = len(vs)
            vs.append(tuple(om + u * ((-0.06 + (t_fim + 0.06) * k / NT) * L)))
            for i in range(SM):
                a_, b_ = k * SM + i, k * SM + (i + 1) % SM
                fs.append((b_, a_, cc) if k == 0 else (a_, b_, cc))
        mm = bpy.data.meshes.new('manga')
        mm.from_pydata(vs, [], fs)
        partes.append(novo_objeto('manga', mm))
    ativar(partes[0])
    for o in partes:
        o.select_set(True)
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = 'Tunica_cima'
    m = ob.modifiers.new('Voxels', 'REMESH')
    m.mode = 'VOXEL'
    m.voxel_size = 0.004
    bpy.ops.object.modifier_apply(modifier=m.name)
    sm = ob.modifiers.new('Liso', 'SMOOTH')
    sm.factor = 0.7
    sm.iterations = 6
    bpy.ops.object.modifier_apply(modifier=sm.name)
    # a gola fica aberta: remove a tampa de cima (em volta do pescoço) e a de baixo (dentro da saia)
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    tira = [f for f in bm.faces if (f.calc_center_median().z > z1 - 0.006 and f.normal.z > 0.6) or (f.calc_center_median().z < z0 + 0.006 and f.normal.z < -0.6)]
    bmesh.ops.delete(bm, geom=tira, context='FACES')
    for e in [e for e in bm.edges if e.is_wire]:
        bm.edges.remove(e)
    bm.to_mesh(ob.data)
    bm.free()
    for p in ob.data.polygons:
        p.use_smooth = True
    vestes.uv_projecao(ob)
    ob.data.materials.append(mat)
    return ob


def roupas():
    pbr = construir.material_pbr
    tex = construir.TEX
    linho = pbr('Tunica', duplo=True, textura=os.path.join(tex, 'linho.jpg'), rugosidade=0.9, especular=0.15)
    la = pbr('Manto', duplo=True, textura=os.path.join(tex, 'la.jpg'), rugosidade=0.95, especular=0.1)
    couro = pbr('Couro', textura=os.path.join(tex, 'couro.jpg'), rugosidade=0.6, especular=0.3)
    corda = pbr('Corda', textura=os.path.join(tex, 'corda.jpg'), rugosidade=0.85)
    faixa = pbr('Faixa', duplo=True, textura=os.path.join(tex, 'linho.jpg'), rugosidade=0.85)
    w_braco = pesos_grupos(corpo, ['upperarm01.L', 'upperarm01.R', 'lowerarm01.L', 'lowerarm01.R', 'wrist.L', 'wrist.R'])
    colisor = subconjunto(corpo, w_braco < 0.3, 'Colisor')
    colisor.vertex_groups.clear()
    if colisor.data.shape_keys:
        colisor.shape_key_clear()
    ctx['colisor_c'] = coords(colisor)
    vestes.colisao(colisor)
    z_cintura = J['coluna1'][2] - 0.005
    out = []
    vestes.colisao(corpo)
    cima = tunica_cima(linho, z_cintura)
    corpo.modifiers.remove(corpo.modifiers['Colisao'])
    out.append(cima)
    vestes.colisao(cima, 0.004)
    saia, cint = vestes.saia(ctx, linho, z_cintura + 0.02, 0.07)
    out.append(saia)
    curta, _ = vestes.saia(ctx, linho, z_cintura + 0.02, J['joelho'][2] - 0.03, nome='Tunica_saia_curta')
    out.append(curta)
    vestes.colisao(corpo)
    for estilo_c, mat in (('couro', couro), ('corda', corda), ('faixa', faixa)):
        out.append(vestes.cinto(ctx, mat, cint, z_cintura + 0.005, estilo_c))
    vestes.colisao(saia, 0.005)
    out.append(vestes.manto(ctx, la, J['joelho'][2] - 0.08))
    out.append(vestes.manto(ctx, la, 0.12, nome='Manto_longo'))
    out.append(vestes.manto(ctx, la, J['coluna3'][2] - 0.13, estilo='xale', nome='Xale'))
    out.append(vestes.capuz(ctx, la))
    saia.modifiers.remove(saia.modifiers['Colisao'])
    out.append(vestes.lenco(ctx, pbr('Lenco', duplo=True, textura=os.path.join(tex, 'linho.jpg'), rugosidade=0.9)))
    out.append(vestes.sandalias(ctx, couro, 'simples'))
    out.append(vestes.sandalias(ctx, couro, 'tiras'))
    out.append(vestes.botas(ctx, couro))
    out.append(vestes.bolsa_tiracolo(ctx, couro, 'bolsa'))
    out.append(vestes.bolsa_tiracolo(ctx, couro, 'odre'))
    out.append(vestes.colar(ctx, pbr('Contas', cor=(0.6, 0.35, 0.25, 1), rugosidade=0.35, especular=0.5)))
    if 'Colisao' in corpo.modifiers:
        corpo.modifiers.remove(corpo.modifiers['Colisao'])
    bpy.data.objects.remove(colisor)
    for o in out:
        for m in list(o.modifiers):
            if m.type == 'COLLISION':
                o.modifiers.remove(m)
    # orçamento de triângulos por peça (as peças simuladas saem densas demais para o celular)
    META = {'Lenco': 2600, 'Tunica_cima': 4200, 'Tunica_saia': 2600, 'Tunica_saia_curta': 2200, 'Manto': 2400, 'Manto_longo': 2600,
            'Xale': 2000, 'Capuz': 1600, 'Botas': 1600, 'Sandalia_simples': 1400, 'Sandalia_tiras': 1600, 'Bolsa': 1200, 'Odre': 1200, 'Colar': 900,
            'Cinto_couro': 800, 'Cinto_corda': 1400, 'Cinto_faixa': 800}
    for p in out:
        meta = META.get(p.name)
        if meta:
            p.data.calc_loop_triangles()
            n = len(p.data.loop_triangles)
            if n > meta:
                ativar(p)
                d = p.modifiers.new('Reduzir', 'DECIMATE')
                d.ratio = meta / n
                bpy.ops.object.modifier_apply(modifier=d.name)
    for p in out:
        if p.data.shape_keys:
            p.shape_key_clear()
        vestes.transferir_pesos(p, corpo, arm, suavidade=3 if 'saia' in p.name or p.name.startswith('Manto') else 1)
        if p.name.startswith('Manto') or p.name == 'Xale':
            for vg in list(p.vertex_groups):
                if any(k in vg.name for k in ('arm', 'wrist')):
                    p.vertex_groups.remove(vg)
            ativar(p)
            bpy.ops.object.vertex_group_normalize_all(lock_active=False)
        validar(p)
    mats = {
        'madeira': pbr('Madeira', textura=os.path.join(tex, 'madeira.jpg'), rugosidade=0.7),
        'pergaminho': pbr('Pergaminho', cor=(0.9, 0.84, 0.68, 1), rugosidade=0.85),
        'barro': pbr('Barro', cor=(0.62, 0.36, 0.22, 1), rugosidade=0.9),
        'vime': pbr('Vime', textura=os.path.join(tex, 'corda.jpg'), rugosidade=0.85),
        'folhas': pbr('Folhas', cor=(0.32, 0.45, 0.2, 1), rugosidade=0.6),
    }
    rig = vestes.acessorios(ctx, mats)
    for p in rig:
        validar(p)
    print('roupas', [p.name for p in out + rig])
    return out + rig


if not PROTO:
    pecas.extend(roupas())


def esconder_sob_roupa():
    """Remove do corpo as faces sempre cobertas pela túnica (toda roupa tem a parte de cima e,
    no mínimo, a saia curta): a camiseta e a bermuda pintadas da IA nunca atravessam o tecido."""
    from mathutils.bvhtree import BVHTree
    arvores = []
    for nome in ('Tunica_cima', 'Tunica_saia_curta'):
        ob = bpy.data.objects.get(nome)
        if ob:
            arvores.append(BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get(), deform=False))
    if not arvores:
        return
    me = corpo.data
    nv = len(me.vertices)
    c = coords(corpo)
    n = normais(corpo)
    coberto = np.zeros(nv, bool)
    for i in range(nv):
        o = Vector(c[i]) + Vector(n[i]) * 0.0005
        for arv in arvores:
            hit = arv.ray_cast(o, Vector(n[i]), 0.06)
            if hit[0] is not None:
                coberto[i] = True
                break
    # margem: só some o que está coberto e cercado de pontos cobertos (bordas das mangas e da saia ficam)
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    dentro = np.array([coberto[v.index] and all(coberto[w.index] for e in v.link_edges for w in e.verts) for v in bm.verts])
    faces = [f for f in bm.faces if all(dentro[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=faces, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(me)
    bm.free()
    print('corpo: faces sob a túnica removidas', len(faces))


if not PROTO:
    esconder_sob_roupa()

# ---------------------------------------------------------------- couro cabeludo afundado
# Todo penteado tem a casca sobre o couro cabeludo; a pele (com o cabelo pintado da IA) é afundada
# 4 mm ali, para nunca atravessar a massa do cabelo.
frente_z0 = z_sob + (0.030 if FEM else 0.034)
pc = coords(corpo)
pn = normais(corpo)
wcab = pesos_grupos(corpo, ['head', 'neck01'])
afundar = np.zeros(len(pc))
for i, p in enumerate(pc):
    if wcab[i] < 0.3 or any((Vector(p) - o).length < 0.03 for o in ORELHAS):
        continue
    lz = linha_cabelo(p, frente_z0 + 0.006, ez + 0.01, zp + 0.045)
    afundar[i] = suave(np.array((p[2] - lz) / 0.012)).item()
pc = pc - pn * (0.004 * afundar)[:, None]
set_coords(corpo, pc)
print('couro cabeludo afundado:', int((afundar > 0.5).sum()), 'vértices')

# ---------------------------------------------------------------- expressões
olhos = []
for o in ('olho_R', 'olho_L'):
    x, z = R[o]
    p, _ = raycast_rosto(x, z, 0)
    olhos.append((x, (p.y if p is not None else y_frente), z, rx_o, rz_o))
p, _ = raycast_rosto(mx, mz, 0)
by = p.y if p is not None else y_frente


def deslocamentos(pts, nome):
    frente = campo_rosto(pts)

    def campo(cx, cy, cz, raio):
        d = np.sqrt((pts[:, 0] - cx) ** 2 + (pts[:, 1] - cy) ** 2 * 0.3 + (pts[:, 2] - cz) ** 2)
        return (1 - suave(d / raio)) * frente
    d = np.zeros_like(pts)
    if nome == 'Piscar':
        for x, y, z, rx, rz in olhos:
            hor = 1 - suave((np.abs(pts[:, 0] - x) - rx * 0.95) / (rx * 0.5))
            zb, zt, zc = z - rz * 0.95, z + rz * 0.98, z - rz * 2.3
            zz = pts[:, 2]
            alvo = zz.copy()
            olho = (zz >= zb) & (zz <= zt)
            alvo[olho] = zt - (zt - zz[olho]) * 0.03
            f_zb = zt - (zt - zb) * 0.03
            palp = (zz > zc) & (zz < zb)
            alvo[palp] = zc + (zz[palp] - zc) * (f_zb - zc) / (zb - zc)
            w = hor * frente * (pts[:, 1] < y + 0.03)
            d[:, 2] += (alvo - zz) * w
    if nome in ('Sorriso', 'Alegria'):
        k = 1.0 if nome == 'Sorriso' else 1.3
        for s in (1, -1):
            cx = mx + s * mw
            w = campo(cx, by, mz, 0.024)
            d[:, 2] += 0.0068 * k * w
            d[:, 0] += 0.0026 * s * k * w
            d[:, 1] += 0.0012 * k * w
            w2 = campo(cx + s * 0.008, by, mz + 0.022, 0.028)
            d[:, 2] += 0.0026 * k * w2
            d[:, 1] -= 0.0014 * k * w2
        if nome == 'Alegria':
            for x, y, z, rx, rz in olhos:
                w = campo(x, y, z - rz * 1.1, 0.022)
                d[:, 2] += 0.003 * w
    if nome == 'Surpresa':
        for x, y, z, rx, rz in olhos:
            w = campo(x, y, z + rz + 0.012, 0.034)
            d[:, 2] += 0.005 * w
            e = np.sqrt(((pts[:, 0] - x) / (rx * 1.6)) ** 2 + ((pts[:, 2] - z) / (rz * 1.6)) ** 2)
            w2 = (1 - suave(e)) * frente
            d[:, 2] += (pts[:, 2] - z) * 0.16 * w2
        w = campo(mx, by, mz - 0.02, 0.03) * (pts[:, 2] < mz)
        d[:, 2] -= 0.0045 * w
    return d


EXPRESSOES = ('Piscar', 'Sorriso', 'Surpresa', 'Alegria')
for ob in [corpo] + [p for p in pecas if p.name.startswith(('Sobrancelhas', 'Barba', 'Sardas'))]:
    pts = coords(ob)
    if not ob.data.shape_keys:
        ob.shape_key_add(name='Basis', from_mix=False)
    for nome in EXPRESSOES:
        d = deslocamentos(pts, nome)
        if ob is not corpo and nome == 'Piscar':
            d[:] = 0  # sobrancelha e barba não piscam
        if ob.name.startswith('Sobrancelhas') and nome == 'Surpresa':
            d[:, 2] += 0.004 * campo_rosto(pts)
        sk = ob.shape_key_add(name=nome, from_mix=False)
        if len(sk.data) != len(pts):
            print('AVISO', ob.name, len(sk.data), len(pts))
        sk.data.foreach_set('co', (pts + d).reshape(-1))
print('expressões ok')

# ---------------------------------------------------------------- exportar
for t in arm.animation_data.nla_tracks:
    t.mute = False
bpy.context.scene['estilo'] = 'modular'
for o in bpy.data.objects:
    if o.type == 'MESH':
        print('OBJ', o.name, len(o.data.vertices), len(o.data.loops), bool(o.data.shape_keys))
construir.exportar(saida, extras=True, qualidade=76)
print('GLB', saida)
