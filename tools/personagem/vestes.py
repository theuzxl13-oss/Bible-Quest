"""
Vestes de época, construídas sobre o corpo e drapeadas por simulação de tecido.

- Túnica (parte de cima): derivada da superfície do corpo (tronco e braços),
  afastada da pele e suavizada; as mangas alargam em sino e caem com a
  gravidade (simulação).
- Saia da túnica: cilindro de tecido franzido na cintura e simulado sobre as
  pernas (dobras reais de tecido).
- Manto: tecido sobre os ombros e as costas, simulado.
- Cinto (couro, corda, faixa): ajustado à cintura real; esconde a emenda.
- Sandálias e botas: sola recortada do contorno do pé e tiras.
Todas as peças recebem os pesos do esqueleto por transferência do corpo.
"""
import math

import bmesh
import bpy
import numpy as np
from mathutils import Vector

ALTO = ['spine01', 'spine02', 'spine03', 'spine04', 'spine05', 'breast.L', 'breast.R', 'clavicle.L', 'clavicle.R',
        'shoulder01.L', 'shoulder01.R', 'upperarm01.L', 'upperarm01.R', 'upperarm02.L', 'upperarm02.R',
        'lowerarm01.L', 'lowerarm01.R', 'lowerarm02.L', 'lowerarm02.R', 'pelvis.L', 'pelvis.R', 'root']
ANTEBRACO = ['lowerarm01.L', 'lowerarm01.R', 'lowerarm02.L', 'lowerarm02.R']
PE = ['foot.L', 'foot.R', 'toe1-1.L', 'toe1-1.R']


# ---------------------------------------------------------------- utilidades
def cena():
    return bpy.context.scene


def ativar(ob):
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob


def coords(ob):
    n = len(ob.data.vertices)
    a = np.empty(n * 3)
    ob.data.vertices.foreach_get('co', a)
    return a.reshape(n, 3)


def set_coords(ob, c):
    ob.data.vertices.foreach_set('co', c.reshape(-1))
    ob.data.update()


def pesos_grupos(ob, nomes):
    """Soma dos pesos de um conjunto de grupos para cada vértice."""
    idx = {ob.vertex_groups[n].index for n in nomes if n in ob.vertex_groups}
    out = np.zeros(len(ob.data.vertices))
    for v in ob.data.vertices:
        for g in v.groups:
            if g.group in idx:
                out[v.index] += g.weight
    return out


def novo_objeto(nome, me):
    ob = bpy.data.objects.new(nome, me)
    cena().collection.objects.link(ob)
    return ob


def subconjunto(ob, vmask, nome):
    """Nova malha com as faces cujos vértices estão todos na máscara."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    apagar = [f for f in bm.faces if not all(vmask[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=apagar, context='FACES')
    soltos = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=soltos, context='VERTS')
    me = bpy.data.meshes.new(nome)
    bm.to_mesh(me)
    bm.free()
    novo = novo_objeto(nome, me)
    for p in me.polygons:
        p.use_smooth = True
    return novo


def suavizar(ob, vezes=8, fator=0.5, fixos=None):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    vs = [v for v in bm.verts if not (fixos is not None and fixos[v.index])]
    for _ in range(vezes):
        bmesh.ops.smooth_vert(bm, verts=vs, factor=fator, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bm.to_mesh(ob.data)
    bm.free()


def normais(ob):
    ob.data.update()
    n = len(ob.data.vertices)
    a = np.empty(n * 3)
    ob.data.vertices.foreach_get('normal', a)
    return a.reshape(n, 3)


def colisao(ob, espessura=0.006):
    if not any(m.type == 'COLLISION' for m in ob.modifiers):
        ob.modifiers.new('Colisao', 'COLLISION')
    ob.collision.thickness_outer = espessura
    ob.collision.thickness_inner = 0.002
    ob.collision.cloth_friction = 6


def simular(ob, frames=60, fixar=None, massa=0.25, rigidez=12, dobra=0.4, encolher=0.0):
    """Simulação de tecido com o corpo como colisor; aplica o último quadro."""
    if fixar is not None:
        vg = ob.vertex_groups.new(name='fixo')
        for i, w in enumerate(fixar):
            if w > 0:
                vg.add([i], float(w), 'REPLACE')
    mod = ob.modifiers.new('Tecido', 'CLOTH')
    s = mod.settings
    s.quality = 8
    s.mass = massa
    s.tension_stiffness = rigidez
    s.compression_stiffness = rigidez
    s.shear_stiffness = rigidez * 0.4
    s.bending_stiffness = dobra
    s.air_damping = 1.5
    if encolher:
        s.shrink_min = encolher
    if fixar is not None:
        s.vertex_group_mass = 'fixo'
        s.pin_stiffness = 1
    c = mod.collision_settings
    c.distance_min = 0.004
    c.use_self_collision = False
    sc = cena()
    sc.frame_start = 1
    sc.frame_end = frames
    mod.point_cache.frame_start = 1
    mod.point_cache.frame_end = frames
    for f in range(1, frames + 1):
        sc.frame_set(f)
    ativar(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    ob.modifiers.clear()
    old = ob.data
    ob.data = me
    bpy.data.meshes.remove(old)
    sc.frame_set(1)
    for p in me.polygons:
        p.use_smooth = True
    normais_para_fora(ob)


def normais_para_fora(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(ob.data)
    bm.free()


def transferir_pesos(alvo, corpo, arm, suavidade=0):
    ativar(alvo)
    for vg in list(alvo.vertex_groups):
        alvo.vertex_groups.remove(vg)
    for vg in corpo.vertex_groups:
        alvo.vertex_groups.new(name=vg.name)
    m = alvo.modifiers.new('Pesos', 'DATA_TRANSFER')
    m.object = corpo
    m.use_vert_data = True
    m.data_types_verts = {'VGROUP_WEIGHTS'}
    m.vert_mapping = 'POLYINTERP_NEAREST'
    m.layers_vgroup_select_src = 'ALL'
    m.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.modifier_apply(modifier=m.name)
    if suavidade:
        bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
        bpy.ops.object.vertex_group_smooth(group_select_mode='ALL', factor=0.6, repeat=suavidade)
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    alvo.parent = arm
    mod = alvo.modifiers.new('Esqueleto', 'ARMATURE')
    mod.object = arm


def uv_cilindrico(ob, centro=(0, 0), escala_v=1.0):
    """UV em torno do eixo vertical (tecidos)."""
    me = ob.data
    uv = me.uv_layers.get('UV') or me.uv_layers.new(name='UV')
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            a = math.atan2(co.x - centro[0], -(co.y - centro[1]))
            uv.data[li].uv = ((a / (2 * math.pi) + 0.5) * 3, co.z * escala_v * 2)


def uv_projecao(ob, escala=2.0):
    me = ob.data
    uv = me.uv_layers.get('UV') or me.uv_layers.new(name='UV')
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = (co.x * escala + co.y * escala * 0.5, co.z * escala)


# ---------------------------------------------------------------- peças
def medir_cintura(corpo_c, z, faixa=0.012):
    sel = corpo_c[np.abs(corpo_c[:, 2] - z) < faixa]
    sel = sel[np.abs(sel[:, 0]) < 0.25]
    cx, cy = 0.0, float(np.median(sel[:, 1]))
    rx = float(np.abs(sel[:, 0]).max())
    ry = float(np.abs(sel[:, 1] - cy).max())
    return cx, cy, rx, ry


def tunica_superior(ctx, mat, z_cintura):
    corpo = ctx['corpo']
    c = coords(corpo)
    w_alto = pesos_grupos(corpo, ALTO)
    w_pescoco = pesos_grupos(corpo, ['neck01', 'neck02', 'neck03', 'head'])
    w_ante = pesos_grupos(corpo, ANTEBRACO)
    w_mao = pesos_grupos(corpo, ['wrist.L', 'wrist.R'] + [g.name for g in corpo.vertex_groups if 'finger' in g.name or 'metacarpal' in g.name])
    z_ombro = float(np.percentile(c[w_alto > 0.5][:, 2], 99))
    mask = (w_alto > 0.45) & (w_pescoco < 0.35) & (w_mao < 0.05) & (c[:, 2] > z_cintura - 0.06)
    # mangas até o meio do antebraço
    ante = w_ante > 0.4
    if ante.any():
        za = c[ante]
        meio = {}
        for lado in (-1, 1):
            s = ante & (np.sign(c[:, 0]) == lado)
            if s.any():
                d = np.abs(c[:, 0])
                meio[lado] = np.percentile(d[s], 45)
        for lado, lim in meio.items():
            mask &= ~((np.sign(c[:, 0]) == lado) & ante & (np.abs(c[:, 0]) > lim))
    ob = subconjunto(corpo, mask, 'Tunica_cima')
    ob.vertex_groups.clear()
    n = normais(ob)
    p = coords(ob)
    folga = 0.012 + 0.018 * np.clip((z_ombro - p[:, 2]) / 0.5, 0, 1)
    # mangas largas: folga cresce ao longo do braço
    dist_braco = np.clip((np.abs(p[:, 0]) - 0.2) / 0.35, 0, 1)
    folga += 0.035 * dist_braco ** 1.5
    p = p + n * folga[:, None]
    set_coords(ob, p)
    suavizar(ob, 10, 0.6)
    ativar(ob)
    m = ob.modifiers.new('Sub', 'SUBSURF')
    m.levels = 1
    bpy.ops.object.modifier_apply(modifier=m.name)
    # as pontas das mangas caem com a gravidade
    p = coords(ob)
    fix = 1 - np.clip((np.abs(p[:, 0]) - 0.36) / 0.12, 0, 1)
    simular(ob, frames=30, fixar=fix, massa=0.2, rigidez=20, dobra=0.6)
    uv_projecao(ob)
    ob.data.materials.append(mat)
    return ob


def saia(ctx, mat, z_topo, z_barra, nome='Tunica_saia'):
    corpo = ctx['corpo']
    c = coords(corpo)
    cx, cy, rx_c, ry_c = medir_cintura(ctx['colisor_c'], z_topo)
    quad = ctx['colisor_c'][(ctx['colisor_c'][:, 2] < z_topo) & (ctx['colisor_c'][:, 2] > z_topo - 0.35)]
    rx_q = float(np.abs(quad[:, 0]).max()) + 0.03
    ry_q = float(np.abs(quad[:, 1] - cy).max()) + 0.03
    S, T = 96, 46
    pernas = ctx['colisor_c']
    verts, faces = [], []
    for j in range(T + 1):
        t = j / T
        z = z_topo + (z_barra - z_topo) * t
        k = min(1, t * 4)
        rx = (rx_c + 0.012) + (rx_q - rx_c - 0.012) * k + 0.05 * t
        ry = (ry_c + 0.012) + (ry_q - ry_c - 0.012) * k + 0.04 * t
        faixa = pernas[np.abs(pernas[:, 2] - z) < 0.03]
        if j > 1 and len(faixa):
            rx = max(rx, float(np.abs(faixa[:, 0] - cx).max()) + 0.035)
            ry = max(ry, float(np.abs(faixa[:, 1] - cy).max()) + 0.035)
        for i in range(S):
            a = 2 * math.pi * i / S
            verts.append((cx + math.sin(a) * rx, cy - math.cos(a) * ry, z))
    for j in range(T):
        for i in range(S):
            a, b = j * S + i, j * S + (i + 1) % S
            faces.append((a, b, b + S, a + S))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    ob = novo_objeto(nome, me)
    fix = np.array([1.0 if j <= 1 else 0.0 for j in range(T + 1) for _ in range(S)])
    simular(ob, frames=70, fixar=fix, massa=0.3, rigidez=15, dobra=0.5)
    uv_cilindrico(ob, (cx, cy), 1.0)
    ob.data.materials.append(mat)
    return ob, (cx, cy, rx_c, ry_c)


def manto(ctx, mat, z_barra, estilo='manto', nome='Manto'):
    corpo = ctx['corpo']
    c = coords(corpo)
    w_alto = pesos_grupos(corpo, ALTO)
    z_ombro = float(np.percentile(c[w_alto > 0.5][:, 2], 99.5))
    cy = float(np.median(c[np.abs(c[:, 2] - (z_ombro - 0.2)) < 0.02][:, 1]))
    S, T = 70, 50
    span_topo, span_baixo = (2.35, 1.75) if estilo != 'xale' else (2.5, 2.2)
    verts, faces = [], []
    for j in range(T + 1):
        t = j / T
        z = z_ombro + 0.03 + (z_barra - z_ombro - 0.03) * t
        k = min(1, t * 5)
        rx = 0.09 + (0.27 - 0.09) * k + 0.06 * t
        ry = 0.08 + (0.2 - 0.08) * k + 0.06 * t
        span = span_topo + (span_baixo - span_topo) * min(1, t * 3)
        for i in range(S + 1):
            s = i / S * 2 - 1
            a = math.pi + s * span
            verts.append((math.sin(a) * rx, cy - math.cos(a) * ry, z))
    for j in range(T):
        for i in range(S):
            a = j * (S + 1) + i
            faces.append((a, a + 1, a + S + 2, a + S + 1))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    ob = novo_objeto(nome, me)
    fix = np.array([1.0 if j == 0 else (0.6 if j == 1 else 0.0) for j in range(T + 1) for _ in range(S + 1)])
    simular(ob, frames=70, fixar=fix, massa=0.35, rigidez=14, dobra=0.6)
    me = ob.data
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        for li in p.loop_indices:
            vi = me.loops[li].vertex_index
            j, i = divmod(vi, S + 1)
            uv.data[li].uv = (i / S * 2, 1 - j / T)
    ob.data.materials.append(mat)
    ativar(ob)
    m = ob.modifiers.new('Espessura', 'SOLIDIFY')
    m.thickness = 0.004
    m.offset = 1
    bpy.ops.object.modifier_apply(modifier=m.name)
    return ob


def cinto(ctx, mat, cintura, z, estilo='couro'):
    cx, cy, rx, ry = cintura
    S = 96
    h = 0.04 if estilo == 'couro' else 0.075 if estilo == 'faixa' else 0.016
    rx, ry = rx + 0.02, ry + 0.02
    if estilo == 'corda':
        verts, faces = [], []
        R = 10
        for i in range(S * 2):
            a = 2 * math.pi * i / (S * 2)
            ctr = Vector((cx + math.sin(a) * rx, cy - math.cos(a) * ry, z))
            radial = Vector((math.sin(a), -math.cos(a), 0)).normalized()
            for k in range(R):
                b = 2 * math.pi * k / R
                tw = 1 + 0.25 * math.cos(b * 2 + a * 28)
                off = radial * math.cos(b) * 0.007 * tw + Vector((0, 0, 1)) * math.sin(b) * 0.007 * tw
                verts.append(tuple(ctr + off))
        n = S * 2
        for i in range(n):
            for k in range(R):
                a = i * R + k
                b = i * R + (k + 1) % R
                c2 = ((i + 1) % n) * R + (k + 1) % R
                d = ((i + 1) % n) * R + k
                faces.append((a, b, c2, d))
    else:
        verts, faces = [], []
        L = 4
        for j in range(L + 1):
            zz = z - h / 2 + h * j / L
            bulge = 1 + 0.08 * math.sin(math.pi * j / L)
            for i in range(S):
                a = 2 * math.pi * i / S
                verts.append((cx + math.sin(a) * rx * bulge, cy - math.cos(a) * ry * bulge, zz))
        for j in range(L):
            for i in range(S):
                a, b = j * S + i, j * S + (i + 1) % S
                faces.append((a, b, b + S, a + S))
    me = bpy.data.meshes.new('Cinto_' + estilo)
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    ob = novo_objeto('Cinto_' + estilo, me)
    uv_cilindrico(ob, (cx, cy), 4.0)
    ob.data.materials.append(mat)
    if estilo != 'corda':
        ativar(ob)
        m = ob.modifiers.new('Espessura', 'SOLIDIFY')
        m.thickness = 0.005
        bpy.ops.object.modifier_apply(modifier=m.name)
    return ob


def sandalias(ctx, mat, estilo='simples'):
    corpo = ctx['corpo']
    c = coords(corpo)
    w = pesos_grupos(corpo, [g.name for g in corpo.vertex_groups if g.name.startswith('foot') or g.name.startswith('toe')])
    partes = []
    for lado in (-1, 1):
        pe = c[(w > 0.5) & (np.sign(c[:, 0]) == lado) & (c[:, 2] < 0.12)]
        if not len(pe):
            continue
        base = pe[pe[:, 2] < pe[:, 2].min() + 0.025][:, :2]
        # contorno (envoltória convexa) da planta do pé
        pts = sorted(map(tuple, base))
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        lo, up = [], []
        for p in pts:
            while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
                lo.pop()
            lo.append(p)
        for p in reversed(pts):
            while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0:
                up.pop()
            up.append(p)
        hull = np.array(lo[:-1] + up[:-1])
        ctr = hull.mean(axis=0)
        hull = ctr + (hull - ctr) * 1.08
        bm = bmesh.new()
        topo = [bm.verts.new((x, y, 0.014)) for x, y in hull]
        bm.faces.new(topo)
        ext = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
        for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
            v.co.z = 0.0
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        me = bpy.data.meshes.new('sola')
        bm.to_mesh(me)
        bm.free()
        sola = novo_objeto('sola', me)
        partes.append(sola)
        # tiras: arcos sobre o peito do pé e em volta do tornozelo
        ymin, ymax = pe[:, 1].min(), pe[:, 1].max()
        comp = ymax - ymin
        arcos = [0.25, 0.55] if estilo == 'simples' else [0.2, 0.4, 0.6]
        for f in arcos:
            yy = ymin + comp * f
            fatia = pe[np.abs(pe[:, 1] - yy) < 0.006]
            if len(fatia) < 4:
                continue
            xs = np.linspace(fatia[:, 0].min(), fatia[:, 0].max(), 14)
            arco = []
            for x in xs:
                viz = fatia[np.abs(fatia[:, 0] - x) < 0.008]
                zt = viz[:, 2].max() if len(viz) else 0.02
                arco.append((x, yy, zt + 0.004))
            arco[0] = (arco[0][0] - 0.004, yy, 0.012)
            arco[-1] = (arco[-1][0] + 0.004, yy, 0.012)
            partes.append(tubo(arco, 0.0045))
        # tornozelo
        tz = 0.085 if estilo == 'simples' else 0.07
        anel = c[(np.abs(c[:, 2] - tz) < 0.006) & (np.sign(c[:, 0]) == lado) & (np.abs(c[:, 0]) < 0.2)]
        if len(anel) > 6:
            cc = anel.mean(axis=0)
            r = np.sqrt(((anel[:, :2] - cc[:2]) ** 2).sum(1)).mean() * 1.05 + 0.003
            loop = [(cc[0] + math.cos(a) * r, cc[1] + math.sin(a) * r, tz) for a in np.linspace(0, 2 * math.pi, 25)]
            partes.append(tubo(loop, 0.0045, fechado=True))
            if estilo == 'tiras':
                hel = [(cc[0] + math.cos(a) * (r + 0.002), cc[1] + math.sin(a) * (r + 0.002), tz + 0.012 * a / math.pi) for a in np.linspace(0, 6 * math.pi, 60)]
                partes.append(tubo(hel, 0.004))
    for p in partes:
        p.data.materials.append(mat)
    ativar(partes[0])
    for p in partes:
        p.select_set(True)
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = 'Sandalia_' + estilo
    uv_projecao(ob, 6)
    return ob


def tubo(pontos, raio, fechado=False):
    cu = bpy.data.curves.new('t', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = raio
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pontos) - 1)
    for p, co in zip(sp.points, pontos):
        p.co = (co[0], co[1], co[2], 1)
    sp.use_cyclic_u = fechado
    ob = bpy.data.objects.new('t', cu)
    cena().collection.objects.link(ob)
    ativar(ob)
    bpy.ops.object.convert(target='MESH')
    return bpy.context.view_layer.objects.active


def mascara_suave(ob, m, vezes=6):
    """Suaviza uma máscara 0..1 pelos vizinhos da malha (bordas graduais)."""
    viz = [[] for _ in range(len(ob.data.vertices))]
    for e in ob.data.edges:
        a, b = e.vertices
        viz[a].append(b)
        viz[b].append(a)
    m = m.astype(float)
    for _ in range(vezes):
        m = np.array([(m[i] + sum(m[j] for j in viz[i])) / (1 + len(viz[i])) for i in range(len(m))])
    return m


def barba(ctx, mat, estilo):
    """Barba curta ou cheia: casca crescida da pele do rosto, com borda gradual."""
    corpo = ctx['corpo']
    c = coords(corpo)
    arm = ctx['arm']
    cab = arm.data.bones['head'].head_local
    jaw = arm.data.bones['jaw'].head_local
    nariz_z = arm.data.bones['oris06'].head_local.z + 0.006
    boca = arm.data.bones['oris05'].head_local
    w_cab = pesos_grupos(corpo, ['head', 'jaw', 'special04'] + [g.name for g in corpo.vertex_groups if g.name.startswith(('oris', 'levator', 'risorius', 'temporalis'))])
    rel = c - np.array(cab)
    frente = c[:, 1] < jaw.y - 0.01
    m = (w_cab > 0.3) & frente & (c[:, 2] < nariz_z + (0.012 if estilo == 'cheia' else 0.0)) & (c[:, 2] > jaw.z - 0.12)
    m |= (c[:, 2] < jaw.z - 0.055) & (c[:, 2] > jaw.z - 0.11) & (np.abs(rel[:, 0]) < 0.05) & (c[:, 1] < jaw.y - 0.02) & (w_cab > 0.05)
    labios = (np.abs(c[:, 0] - boca.x) < 0.03) & (np.abs(c[:, 2] - boca.z) < (0.013 if estilo == 'cheia' else 0.016)) & (c[:, 1] < boca.y + 0.025)
    m &= ~labios
    if estilo == 'curta':
        m &= ~((np.abs(c[:, 0]) > 0.035) & (c[:, 2] > boca.z + 0.012))
    ms = mascara_suave(corpo, m, 7)
    at = corpo.data.attributes.new('mascara', 'FLOAT', 'POINT')
    at.data.foreach_set('value', ms.astype(np.float32))
    ob = subconjunto(corpo, ms > 0.08, f'Barba_{estilo}')
    corpo.data.attributes.remove(corpo.data.attributes['mascara'])
    ob.vertex_groups.clear()
    sub = np.empty(len(ob.data.vertices), dtype=np.float32)
    ob.data.attributes['mascara'].data.foreach_get('value', sub)
    ob.data.attributes.remove(ob.data.attributes['mascara'])
    p = coords(ob)
    n = normais(ob)
    esp = 0.0028 if estilo == 'curta' else 0.0075
    k = np.clip((sub - 0.08) / 0.75, 0, 1) ** 1.5
    p = p + n * (esp * k)[:, None] - n * 0.0006
    if estilo == 'cheia':
        queixo = np.clip((jaw.z - 0.06 - p[:, 2]) / 0.05, 0, 1) * k
        p[:, 2] -= 0.012 * queixo
    set_coords(ob, p)
    ativar(ob)
    sm = ob.modifiers.new('Sub', 'SUBSURF')
    sm.levels = 1
    bpy.ops.object.modifier_apply(modifier=sm.name)
    me = ob.data
    # transparência gradual na borda (cor por vértice; alfa = distância até a borda)
    pc = coords(ob)
    centro = np.array([0.0, float(pc[:, 1].min()), float(np.median(pc[:, 2]))])
    viz = [[] for _ in range(len(me.vertices))]
    for e in me.edges:
        a_, b_ = e.vertices
        viz[a_].append(b_)
        viz[b_].append(a_)
    borda = np.zeros(len(me.vertices))
    for e in me.edges:
        if len(e.link_faces if hasattr(e, 'link_faces') else []) == 1:
            pass
    bm = bmesh.new()
    bm.from_mesh(me)
    dist = np.full(len(me.vertices), 99.0)
    fila = [v.index for v in bm.verts if v.is_boundary]
    for i in fila:
        dist[i] = 0
    while fila:
        nova = []
        for i in fila:
            for j in viz[i]:
                if dist[j] > dist[i] + 1:
                    dist[j] = dist[i] + 1
                    nova.append(j)
        fila = nova
    bm.free()
    alfa = np.clip(dist / 2.0, 0, 1) ** 0.7
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for i, a_ in enumerate(alfa):
        ca.data[i].color = (1, 1, 1, float(a_))
    uv = me.uv_layers.get('UV') or me.uv_layers.new(name='UV')
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = (math.atan2(co.x, -(co.y - cab.y)) * 0.45 + 0.5, co.z * 3.2)
    ob.data.materials.append(mat)
    return ob


def capuz(ctx, mat):
    """Capuz abaixado: tecido que cai das costas do pescoço e forma uma gola."""
    corpo = ctx['corpo']
    arm = ctx['arm']
    pesc = arm.data.bones['neck01'].head_local
    cab = arm.data.bones['head'].head_local
    S, T = 40, 22
    verts, faces = [], []
    for j in range(T + 1):
        t = j / T
        z = pesc.z + 0.02 + (cab.z + 0.14 - pesc.z) * t
        r = 0.13 + 0.02 * math.sin(math.pi * t)
        for i in range(S + 1):
            a = math.pi + (i / S * 2 - 1) * 1.7
            verts.append((math.sin(a) * r * 1.1, pesc.y - math.cos(a) * r, z))
    for j in range(T):
        for i in range(S):
            a = j * (S + 1) + i
            faces.append((a, a + 1, a + S + 2, a + S + 1))
    me = bpy.data.meshes.new('Capuz')
    me.from_pydata(verts, [], faces)
    ob = novo_objeto('Capuz', me)
    fix = np.array([1.0 if j <= 1 else 0.0 for j in range(T + 1) for _ in range(S + 1)])
    simular(ob, frames=60, fixar=fix, massa=0.3, rigidez=14, dobra=0.7)
    uv_projecao(ob, 3)
    ob.data.materials.append(mat)
    ativar(ob)
    m = ob.modifiers.new('Espessura', 'SOLIDIFY')
    m.thickness = 0.004
    bpy.ops.object.modifier_apply(modifier=m.name)
    return ob


def botas(ctx, mat):
    corpo = ctx['corpo']
    c = coords(corpo)
    w = pesos_grupos(corpo, [g.name for g in corpo.vertex_groups if g.name.startswith(('foot', 'toe', 'lowerleg02'))])
    m = (w > 0.3) & (c[:, 2] < 0.28)
    ob = subconjunto(corpo, m, 'Botas')
    ob.vertex_groups.clear()
    p = coords(ob)
    n = normais(ob)
    p = p + n * 0.006
    p[:, 2] = np.maximum(p[:, 2], 0.004)
    set_coords(ob, p)
    suavizar(ob, 4, 0.5)
    uv_projecao(ob, 6)
    ob.data.materials.append(mat)
    ativar(ob)
    mm = ob.modifiers.new('Espessura', 'SOLIDIFY')
    mm.thickness = 0.003
    bpy.ops.object.modifier_apply(modifier=mm.name)
    return ob


def bolsa_tiracolo(ctx, mat, tipo='bolsa'):
    corpo = ctx['corpo']
    c = coords(corpo)
    arm = ctx['arm']
    quadril = arm.data.bones['pelvis.L'].tail_local
    ombro = arm.data.bones['clavicle.R'].tail_local
    w_tronco = pesos_grupos(corpo, ALTO)
    # bolsa no quadril esquerdo, um pouco à frente
    centro = Vector((quadril.x + 0.09, quadril.y - 0.07, quadril.z + 0.01))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=18, location=centro)
    b = bpy.context.view_layer.objects.active
    if tipo == 'bolsa':
        b.scale = (0.035, 0.085, 0.075)
    else:
        b.scale = (0.045, 0.06, 0.1)
    b.rotation_euler = (0, 0, math.radians(35))
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    pts = []
    # alça: do ombro direito, cruzando o peito, até a bolsa (frente) e pelas costas
    for frente in (True, False):
        trilha = []
        for k in range(15):
            t = k / 14
            q = Vector(ombro).lerp(centro, t)
            faixa = c[(np.abs(c[:, 2] - q.z) < 0.02) & (w_tronco > 0.4)]
            if len(faixa):
                sel = faixa[np.abs(faixa[:, 0] - q.x) < 0.04]
                if len(sel):
                    y = sel[:, 1].min() - 0.012 if frente else sel[:, 1].max() + 0.012
                    q = Vector((q.x, y, q.z))
            trilha.append(tuple(q))
        pts.append(trilha)
    topo = Vector(ombro) + Vector((0, 0, 0.03))
    caminho = list(reversed(pts[1])) + [tuple(topo)] + pts[0]
    alca = tubo(caminho, 0.006)
    alca.scale = (1, 1, 1)
    for o in (b, alca):
        o.data.materials.append(mat)
    ativar(b)
    alca.select_set(True)
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = 'Bolsa' if tipo == 'bolsa' else 'Odre'
    for p in ob.data.polygons:
        p.use_smooth = True
    uv_projecao(ob, 5)
    return ob


def colar(ctx, mat):
    corpo = ctx['corpo']
    c = coords(corpo)
    arm = ctx['arm']
    pesc = arm.data.bones['neck01'].head_local
    faixa = c[np.abs(c[:, 2] - (pesc.z - 0.005)) < 0.008]
    cx, cy = 0.0, float(np.median(faixa[:, 1]))
    rx = float(np.abs(faixa[:, 0]).max()) + 0.01
    ry = float(np.abs(faixa[:, 1] - cy).max()) + 0.01
    obs = []
    for i in range(28):
        a = 2 * math.pi * i / 28
        frente = max(0.0, -math.cos(a))
        pos = (cx + math.sin(a) * rx, cy + math.cos(a) * ry * -1, pesc.z - 0.005 - 0.05 * frente ** 2)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.0065, location=pos)
        obs.append(bpy.context.view_layer.objects.active)
    for o in obs:
        o.data.materials.append(mat)
    ativar(obs[0])
    for o in obs:
        o.select_set(True)
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = 'Colar'
    for p in ob.data.polygons:
        p.use_smooth = True
    uv_projecao(ob, 10)
    return ob


def lenco(ctx, mat):
    """Lenço de cabeça: tecido moldado sobre a cabeça, a nuca e os ombros, com o rosto livre."""
    corpo = ctx['corpo']
    arm = ctx['arm']
    c = coords(corpo)
    sob = arm.data.bones['oculi01.L'].head_local
    queixo = arm.data.bones['special04'].head_local
    w = pesos_grupos(corpo, ['head', 'neck01', 'neck02', 'neck03', 'jaw', 'special04'] + [g.name for g in corpo.vertex_groups if g.name.startswith(('temporalis', 'oculi', 'orbicularis', 'levator', 'risorius', 'oris', 'special0'))])
    rosto = (c[:, 1] < sob.y + 0.045) & (c[:, 2] < sob.z + 0.038) & (c[:, 2] > queixo.z - 0.04)
    m = (w > 0.3) & ~rosto & (c[:, 2] > queixo.z - 0.06)
    ms = mascara_suave(corpo, m, 3)
    ob = subconjunto(corpo, ms > 0.5, 'Lenco')
    ob.vertex_groups.clear()
    p = coords(ob)
    n = normais(ob)
    p = p + n * 0.024
    set_coords(ob, p)
    suavizar(ob, 12, 0.6)
    ativar(ob)
    sm = ob.modifiers.new('Sub', 'SUBSURF')
    sm.levels = 1
    bpy.ops.object.modifier_apply(modifier=sm.name)
    # a parte de trás cai sobre os ombros (simulação com a borda do rosto fixa)
    p = coords(ob)
    fix = np.clip((p[:, 2] - (sob.z - 0.02)) / 0.04, 0, 1) + (p[:, 1] < sob.y + 0.06).astype(float)
    simular(ob, frames=40, fixar=np.clip(fix, 0, 1), massa=0.2, rigidez=12, dobra=0.5)
    uv_projecao(ob, 3)
    ob.data.materials.append(mat)
    ativar(ob)
    mm = ob.modifiers.new('Espessura', 'SOLIDIFY')
    mm.thickness = 0.003
    bpy.ops.object.modifier_apply(modifier=mm.name)
    return ob


def acessorio_rigido(nome, criar, osso, arm, mat):
    ob = criar()
    ob.name = nome
    ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = True
    uv_projecao(ob, 4)
    mw = ob.matrix_world.copy()
    ob.parent = arm
    ob.parent_type = 'BONE'
    ob.parent_bone = osso
    bpy.context.view_layer.update()
    ob.matrix_world = mw
    return ob


def acessorios(ctx, mats):
    arm = ctx['arm']
    corpo = ctx['corpo']
    c = coords(corpo)
    w_mao = pesos_grupos(corpo, ['wrist.R'] + [g.name for g in corpo.vertex_groups if g.name.endswith('.R') and ('finger' in g.name or 'metacarpal' in g.name)])
    palma = Vector(c[w_mao > 0.5].mean(axis=0))
    pecas = []

    def cajado():
        pts = [(palma.x - 0.005, palma.y - 0.01, z) for z in np.linspace(0.0, 1.62, 18)]
        pts += [(palma.x - 0.005, palma.y - 0.04, 1.69), (palma.x - 0.005, palma.y - 0.09, 1.72), (palma.x - 0.005, palma.y - 0.13, 1.69), (palma.x - 0.005, palma.y - 0.135, 1.63)]
        t = tubo(pts, 0.014)
        return t
    pecas.append(acessorio_rigido('Acessorio_cajado', cajado, 'wrist.R', arm, mats['madeira']))

    def pergaminho():
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.024, depth=0.2, location=(palma.x - 0.01, palma.y - 0.03, palma.z - 0.02), rotation=(0, math.radians(90), 0))
        return bpy.context.view_layer.objects.active
    pecas.append(acessorio_rigido('Acessorio_pergaminho', pergaminho, 'wrist.R', arm, mats['pergaminho']))

    def lamparina():
        verts = [(0.001, 0), (0.04, 0.004), (0.05, 0.018), (0.038, 0.03), (0.012, 0.033), (0.01, 0.026)]
        bm = bmesh.new()
        prof = [bm.verts.new((r, 0, z)) for r, z in verts]
        for a, b in zip(prof, prof[1:]):
            bm.edges.new((a, b))
        bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), steps=28, angle=2 * math.pi)
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
        for v in bm.verts:
            if v.co.y < 0:
                v.co.y *= 1 + 0.9 * min(1, -v.co.y / 0.05) * (1 - abs(v.co.x) / 0.05)
            v.co += Vector((palma.x - 0.01, palma.y - 0.05, palma.z - 0.07))
        me = bpy.data.meshes.new('lamp')
        bm.to_mesh(me)
        bm.free()
        return novo_objeto('lamp', me)
    pecas.append(acessorio_rigido('Acessorio_lamparina', lamparina, 'wrist.R', arm, mats['barro']))

    def cesto():
        bm = bmesh.new()
        prof = [bm.verts.new((r, 0, z)) for r, z in [(0.05, 0), (0.075, 0.03), (0.09, 0.09), (0.093, 0.1)]]
        for a, b in zip(prof, prof[1:]):
            bm.edges.new((a, b))
        bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), steps=32, angle=2 * math.pi)
        bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
        for v in bm.verts:
            v.co += Vector((palma.x - 0.02, palma.y, palma.z - 0.3))
        me = bpy.data.meshes.new('cesto')
        bm.to_mesh(me)
        bm.free()
        o = novo_objeto('cesto', me)
        alca = tubo([(palma.x - 0.02 + 0.09 * math.cos(a), palma.y, palma.z - 0.2 + 0.18 * math.sin(a)) for a in np.linspace(0, math.pi, 16)], 0.006)
        ativar(o)
        alca.select_set(True)
        bpy.ops.object.join()
        return bpy.context.view_layer.objects.active
    pecas.append(acessorio_rigido('Acessorio_cesto', cesto, 'wrist.R', arm, mats['vime']))

    def louros():
        zt = arm.data.bones['oculi01.L'].head_local.z + 0.032
        cabz = Vector((0, 0, zt + 0.02))
        anel = c[np.abs(c[:, 2] - (cabz.z - 0.02)) < 0.006]
        anel = anel[np.abs(anel[:, 0]) < 0.12]
        cy = float(np.median(anel[:, 1]))
        rx = float(np.abs(anel[:, 0]).max()) + 0.014
        ry = float(np.abs(anel[:, 1] - cy).max()) + 0.014
        obs = []
        for i in range(40):
            a = 2 * math.pi * i / 40
            pos = (math.sin(a) * rx, cy - math.cos(a) * ry, cabz.z - 0.02 + 0.01 * math.cos(a))
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.013, location=pos)
            o = bpy.context.view_layer.objects.active
            o.scale = (0.4, 1.0, 0.35)
            o.rotation_euler = (0.3, 0.6 if i % 2 else -0.6, -a)
            obs.append(o)
        ativar(obs[0])
        for o in obs:
            o.select_set(True)
        bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        return o
    pecas.append(acessorio_rigido('Acessorio_louros', louros, 'head', arm, mats['folhas']))
    return pecas


# ---------------------------------------------------------------- principal
def vestir(ctx):
    corpo, arm = ctx['corpo'], ctx['arm']
    pbr = ctx['material_pbr']
    tex = ctx['TEX']
    import os
    linho = pbr('Tunica', duplo=True, textura=os.path.join(tex, 'linho.jpg'), normal=os.path.join(tex, 'linho-normal.jpg'), rugosidade=0.9, especular=0.15)
    la = pbr('Manto', duplo=True, textura=os.path.join(tex, 'la.jpg'), normal=os.path.join(tex, 'la-normal.jpg'), rugosidade=0.95, especular=0.1)
    couro = pbr('Couro', textura=os.path.join(tex, 'couro.jpg'), rugosidade=0.6, especular=0.3)
    corda = pbr('Corda', textura=os.path.join(tex, 'corda.jpg'), rugosidade=0.85)
    faixa = pbr('Faixa', duplo=True, textura=os.path.join(tex, 'linho.jpg'), normal=os.path.join(tex, 'linho-normal.jpg'), rugosidade=0.85)

    c = coords(corpo)
    w_braco = pesos_grupos(corpo, ['upperarm01.L', 'upperarm01.R', 'upperarm02.L', 'upperarm02.R'] + ANTEBRACO + ['wrist.L', 'wrist.R'] + [g.name for g in corpo.vertex_groups if 'finger' in g.name or 'metacarpal' in g.name])
    colisor = subconjunto(corpo, w_braco < 0.3, 'Colisor')
    colisor.vertex_groups.clear()
    ctx['colisor_c'] = coords(colisor)
    colisao(colisor)
    w_pelvis = pesos_grupos(corpo, ['pelvis.L', 'pelvis.R'])
    z_cintura = float(np.percentile(c[w_pelvis > 0.3][:, 2], 92)) + 0.02

    pecas = []
    colisao(corpo)
    cima = tunica_superior(ctx, linho, z_cintura)
    corpo.modifiers.remove(corpo.modifiers['Colisao'])
    pecas.append(cima)
    colisao(cima, 0.004)
    s, cint = saia(ctx, linho, z_cintura + 0.02, 0.07)
    pecas.append(s)
    curta, _ = saia(ctx, linho, z_cintura + 0.02, 0.38, nome='Tunica_saia_curta')
    pecas.append(curta)
    # manto e mangas colidem também com os braços
    colisao(corpo)
    for estilo, mat in (('couro', couro), ('corda', corda), ('faixa', faixa)):
        pecas.append(cinto(ctx, mat, cint, z_cintura + 0.005, estilo))
    colisao(s, 0.005)  # o manto cai por fora da saia
    pecas.append(manto(ctx, la, 0.32))
    pecas.append(manto(ctx, la, 0.12, nome='Manto_longo'))
    pecas.append(manto(ctx, la, 0.92, estilo='xale', nome='Xale'))
    pecas.append(capuz(ctx, la))
    s.modifiers.remove(s.modifiers['Colisao'])
    pecas.append(lenco(ctx, pbr('Lenco', duplo=True, textura=os.path.join(tex, 'linho.jpg'), normal=os.path.join(tex, 'linho-normal.jpg'), rugosidade=0.9)))
    pecas.append(sandalias(ctx, couro, 'simples'))
    pecas.append(sandalias(ctx, couro, 'tiras'))
    pecas.append(botas(ctx, couro))
    if not ctx['female']:
        cab = pbr('Barba', textura=os.path.join(tex, 'cabelo-short02.png'), alfa=True, rugosidade=0.55, especular=0.4)
        pecas.append(barba(ctx, cab, 'curta'))
        pecas.append(barba(ctx, cab, 'cheia'))
    pecas.append(bolsa_tiracolo(ctx, couro, 'bolsa'))
    pecas.append(bolsa_tiracolo(ctx, couro, 'odre'))
    contas = pbr('Contas', cor=(0.6, 0.35, 0.25, 1), rugosidade=0.35, especular=0.5)
    pecas.append(colar(ctx, contas))
    corpo.modifiers.remove(corpo.modifiers['Colisao'])
    bpy.data.objects.remove(colisor)
    for m in list(cima.modifiers):
        if m.type == 'COLLISION':
            cima.modifiers.remove(m)
    for p in pecas:
        transferir_pesos(p, corpo, arm, suavidade=3 if 'saia' in p.name or p.name == 'Manto' else 1)
        if p.name == 'Manto':
            for vg in list(p.vertex_groups):
                if any(k in vg.name for k in ('arm', 'wrist', 'finger', 'metacarpal')):
                    p.vertex_groups.remove(vg)
            ativar(p)
            bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    mats = {
        'madeira': pbr('Madeira', textura=os.path.join(tex, 'madeira.jpg'), rugosidade=0.7),
        'pergaminho': pbr('Pergaminho', cor=(0.9, 0.84, 0.68, 1), rugosidade=0.85),
        'barro': pbr('Barro', cor=(0.62, 0.36, 0.22, 1), rugosidade=0.9),
        'vime': pbr('Vime', textura=os.path.join(tex, 'corda.jpg'), rugosidade=0.85),
        'folhas': pbr('Folhas', cor=(0.32, 0.45, 0.2, 1), rugosidade=0.6),
    }
    rigidos = acessorios(ctx, mats)
    ctx['pecas'] = pecas + rigidos
