"""
TÚNICA PARAMÉTRICA (reformulação visual, entrega 1: rodada de refinamento)

A túnica da primeira versão era montada por anéis com o raio máximo do corpo em cada fatia,
fundida por voxels e reduzida: a superfície ficava ondulada (sulcos horizontais), as mangas
abriam buracos nas costas, a saia simulada tinha a borda de cima larga demais e a projeção
plana de UV esticava o tecido nos lados (manchas).

Aqui a roupa é construída como um molde de costura, em malha de quadriláteros regular:
- envoltória do corpo (sem os braços) em altura x ângulo, fechada (máximo em janela) e
  suavizada; o tecido "cai": descendo, o raio não pode diminuir mais depressa que um limite
  (o pano passa reto sob o peito, a barriga e as costas);
- ombros por um campo de alturas (o pano assenta nos ombros até a gola);
- mangas em sino ao longo do eixo do braço, com perfil de raio ajustado (sem degraus);
- saia em sino com dobras suaves que crescem para a barra e franzido logo abaixo do cinto;
- na cintura, a túnica e a saia viram uma elipse exata (o cinto cobre a emenda sem atravessar);
- todas as bordas (barra, mangas, gola) têm bainha dobrada para dentro: espessura visível;
- UV cilíndrico em escala constante e textura de linho uniforme gerada aqui.
"""
import math

import bmesh
import bpy
import numpy as np
from PIL import Image


def _suave_circ(r, sz, sa):
    """Suavização gaussiana em (altura, ângulo); o ângulo é circular."""
    def k1(s):
        n = max(1, int(math.ceil(s * 2.5)))
        x = np.arange(-n, n + 1)
        g = np.exp(-0.5 * (x / max(s, 1e-6)) ** 2)
        return g / g.sum(), n
    if sa > 0:
        g, n = k1(sa)
        r = sum(np.roll(r, i, axis=1) * w for i, w in zip(range(-n, n + 1), g))
    if sz > 0:
        g, n = k1(sz)
        p = np.pad(r, ((n, n), (0, 0)), mode='edge')
        r = sum(p[n + i:n + i + r.shape[0]] * w for i, w in zip(range(-n, n + 1), g))
    return r


def _max_janela(r, wz, wa):
    out = r.copy()
    for i in range(-wa, wa + 1):
        out = np.maximum(out, np.roll(r, i, axis=1))
    r2 = out.copy()
    for j in range(1, wz + 1):
        r2[j:] = np.maximum(r2[j:], out[:-j])
        r2[:-j] = np.maximum(r2[:-j], out[j:])
    return r2


def envoltoria(pts, cx, cy, zs, S, banda):
    """Raio máximo dos pontos em cada (altura, ângulo); ângulo 0 = frente (-y)."""
    ang = np.arctan2(pts[:, 0] - cx, -(pts[:, 1] - cy))
    rad = np.hypot(pts[:, 0] - cx, pts[:, 1] - cy)
    b = ((ang + math.pi) / (2 * math.pi) * S).astype(int) % S
    r = np.zeros((len(zs), S))
    for k, z in enumerate(zs):
        f = np.abs(pts[:, 2] - z) < banda
        if f.any():
            np.maximum.at(r[k], b[f], rad[f])
    # direções sem pontos: vizinho mais próximo no ângulo; anéis vazios: anel vizinho
    for k in range(len(zs)):
        if not (r[k] > 0).any():
            continue
        for _ in range(S):
            if not (r[k] == 0).any():
                break
            r[k] = np.where(r[k] == 0, np.maximum(np.roll(r[k], 1), np.roll(r[k], -1)), r[k])
    for k in range(len(zs)):
        if not (r[k] > 0).any():
            viz = [j for j in range(len(zs)) if (r[j] > 0).any()]
            r[k] = r[min(viz, key=lambda j: abs(j - k))]
    return r


def cair(r, zs, inclinacao):
    """O pano cai: descendo (z menor), o raio diminui no máximo `inclinacao` por metro."""
    r = r.copy()
    ordem = np.argsort(-np.asarray(zs))  # de cima para baixo
    for a, b in zip(ordem[:-1], ordem[1:]):
        dz = abs(zs[a] - zs[b])
        r[b] = np.maximum(r[b], r[a] - inclinacao * dz)
    return r


def elipse_que_cobre(r_anel, S):
    """Elipse (rx, ry) com eixos no centro que cobre o anel de raios (ângulo 0 = frente)."""
    a = -math.pi + 2 * math.pi * (np.arange(S) + 0.5) / S
    x, y = np.abs(np.sin(a) * r_anel), np.abs(np.cos(a) * r_anel)
    rx, ry = float(x.max()), float(y.max())
    s = float(np.max(np.sqrt((x / rx) ** 2 + (y / ry) ** 2)))
    return rx * s, ry * s


def raio_elipse(rx, ry, S):
    a = -math.pi + 2 * math.pi * (np.arange(S) + 0.5) / S
    return 1 / np.sqrt((np.sin(a) / rx) ** 2 + (np.cos(a) / ry) ** 2)


def textura_linho(caminho, n=512, fios=96, semente=3):
    """Linho uniforme, claro e neutro (o jogo multiplica pela cor da túnica): trama fina de
    baixo contraste, sem manchas grandes; ladrilhável."""
    rng = np.random.default_rng(semente)
    u = np.arange(n) / n
    # espessura de cada fio varia um pouco (aspecto de tecido feito à mão)
    ga = 1 + 0.25 * rng.standard_normal(fios)
    gb = 1 + 0.25 * rng.standard_normal(fios)
    fa = np.interp(u * fios, np.arange(fios + 1), np.r_[ga, ga[0]])
    fb = np.interp(u * fios, np.arange(fios + 1), np.r_[gb, gb[0]])
    tu = 0.5 + 0.5 * np.cos(2 * math.pi * u * fios)
    U, V = np.meshgrid(tu * fa, tu * fb)
    xadrez = ((np.floor(u * fios)[None, :] + np.floor(u * fios)[:, None]) % 2)
    trama = np.where(xadrez > 0, U, V) * 0.6 + 0.4 * (U + V) / 2
    ruido = rng.standard_normal((n, n))
    ruido = (ruido + np.roll(ruido, 1, 0) + np.roll(ruido, 1, 1)) / 3
    lum = 0.9 + 0.045 * (trama - trama.mean()) / trama.std() + 0.012 * ruido
    lum = np.clip(lum, 0, 1)
    rgb = np.stack([lum * 1.0, lum * 0.985, lum * 0.955], -1)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(caminho, quality=92)
    return caminho


def suave_passo(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def _malha(nome, verts, faces, uvs):
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    uv = me.uv_layers.new(name='UV')
    for p in me.polygons:
        p.use_smooth = True
        for li, vi in zip(p.loop_indices, p.vertices):
            uv.data[li].uv = uvs[vi]
    me.validate()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def orientar(ob, para_fora):
    """Vira todas as faces se a maioria aponta para dentro. para_fora(ponto) -> vetor para fora."""
    me = ob.data
    soma = 0.0
    for p in me.polygons:
        soma += float(np.dot(np.array(p.normal), para_fora(np.array(p.center))))
    if soma < 0:
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
        bm.to_mesh(me)
        bm.free()
    me.update()


class Grade:
    """Malha em grade (anéis x setores, fechada no ângulo) com UV contínuo (costura atrás)."""

    def __init__(self, S):
        self.S = S
        self.verts, self.faces, self.uvs, self.aneis = [], [], [], []

    def anel(self, pts, v):
        """pts: S pontos (ângulo 0 = frente); v: coordenada V da textura."""
        S = self.S
        base = len(self.verts)
        for i in range(S + 1):  # S+1: a costura repete o primeiro ponto (UV contínuo)
            self.verts.append(tuple(pts[i % S]))
            self.uvs.append((i / S, v))
        if self.aneis:
            a0 = self.aneis[-1]
            for i in range(S):
                self.faces.append((a0 + i, a0 + i + 1, base + i + 1, base + i))
        self.aneis.append(base)

    def objeto(self, nome, ru=1.0):
        uvs = [(u * ru, v) for u, v in self.uvs]
        ob = _malha(nome, self.verts, self.faces, uvs)
        # a costura (pontos repetidos) é soldada: normais contínuas, UV continua separado
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
        bm.to_mesh(ob.data)
        bm.free()
        return ob


def _pontos(cx, cy, z, r, S, desloc=0.0):
    a = -math.pi + 2 * math.pi * (np.arange(S) + 0.5) / S + desloc
    return np.stack([cx + np.sin(a) * r, cy - np.cos(a) * r, np.full(S, z) if np.isscalar(z) else z], 1)


def bainha_anel(grade, ultimo, centro, dentro=0.0035, altura=0.012, v0=0.0, sentido=-1, eixo=None):
    """Bainha dobrada: o tecido faz a curva na borda e volta para dentro, subindo `altura`.
    `ultimo` = pontos do último anel; `centro` = ponto (ou pontos) do eixo; `sentido` = direção
    da borda (-1: para baixo em z; +1: para cima). Com `eixo`, a borda segue esse vetor."""
    d = np.array([0, 0, sentido], float) if eixo is None else np.asarray(eixo, float)
    radial = ultimo - centro
    radial -= np.outer(radial @ d, d)
    radial /= np.linalg.norm(radial, axis=1)[:, None]
    p1 = ultimo + d * dentro * 0.5 - radial * dentro * 0.5
    p2 = ultimo - radial * dentro
    p3 = p2 - d * altura
    grade.anel(p1, v0 + 0.004 * sentido)
    grade.anel(p2, v0 + 0.008 * sentido)
    grade.anel(p3, v0 + 0.02 * sentido)


def construir(corpo_c, pesos, ossos, J, mat, saias, S=64, nome_cima='Tunica_cima', feminino=False, poligonos=None):
    """Túnica completa. corpo_c: coordenadas do corpo em repouso; pesos(nomes) -> pesos por vértice;
    ossos: dict nome -> (cabeça, cauda) em repouso; saias: [(nome, z_barra)].
    Devolve ([objetos], cintura=(cx, cy, rx, ry), z_cinto)."""
    c = corpo_c
    z_cintura = J['coluna1'][2] - 0.005
    zp = ossos['neck01'][0][2]
    w_cab = pesos(['head', 'neck01', 'neck02', 'neck03'])
    # braços: pontos perto do eixo do braço (geométrico; os pesos da IA vazam para o tronco)
    perto_braco = np.zeros(len(c), bool)
    bracos = []
    for lado in ('L', 'R'):
        om = np.array(ossos[f'upperarm01.{lado}'][0])
        co_ = np.array(ossos[f'lowerarm01.{lado}'][0])
        pu = np.array(ossos[f'wrist.{lado}'][0])
        eixo = pu - om
        L = float(np.linalg.norm(eixo))
        t = ((c - om) @ eixo) / (L * L)
        proj = om + np.clip(t, 0, 1.6)[:, None] * eixo
        dist = np.linalg.norm(c - proj, axis=1)
        braco = (dist < 0.075) & (t > -0.05) & (np.sign(c[:, 0]) == np.sign(om[0])) & (np.abs(c[:, 0]) > abs(om[0]) * 0.72)
        perto_braco |= braco
        bracos.append(dict(om=om, u=eixo / L, L=L, t=t, dist=dist, braco=braco, t_cot=float(((co_ - om) @ eixo) / (L * L))))
    # mãos (ficam ao lado do quadril): fora da envoltória
    w_mao = pesos(['wrist.L', 'wrist.R'] + [n for n in ossos if 'finger' in n or 'metacarpal' in n or 'thumb' in n])
    perto_braco |= w_mao > 0.15
    # acima da axila o pano envolve ombro e braço juntos (a manga começa na axila)
    z_axila = float(min(b['om'][2] for b in bracos)) - 0.10
    w_so_cab = pesos(['head'])
    tronco_env = ~perto_braco & (w_cab < 0.5)  # a manga (com calota no ombro) cobre o braço
    tronco = ~perto_braco & (w_cab < 0.5)
    tr = c[tronco & (c[:, 2] > z_cintura) & (c[:, 2] < zp)]
    cx = float(np.median(tr[:, 0]))
    cy = float(np.median(tr[:, 1]))
    # centro único (tronco, ombros e gola): entre o meio do tronco e o meio do pescoço, que fica mais à
    # frente; assim os anéis do tronco e a gola são medidos do mesmo eixo
    pesc0 = c[(w_cab > 0.3) & (np.abs(c[:, 2] - (zp + 0.01)) < 0.012)]
    if len(pesc0):
        cy = (cy + float(np.median(pesc0[:, 1]))) / 2

    # ------------------------------------------------ envoltória única: barra da saia mais longa até a gola
    z_barra_min = min(z for _, z in saias)
    z_ombro = float(min(b['om'][2] for b in bracos))
    zs = np.linspace(z_barra_min, z_ombro, 120)
    pts = c[tronco_env | ((c[:, 2] < z_cintura) & ~perto_braco)]
    env = envoltoria(pts, cx, cy, zs, S, 0.012)
    env = _max_janela(env, 1, 2)
    env = _suave_circ(env, 1.5, 1.5)
    dz = zs[1] - zs[0]

    def r_em(z, tab):
        k = np.clip((z - zs[0]) / dz, 0, len(zs) - 1.001)
        k0 = int(k)
        f = k - k0
        return tab[k0] * (1 - f) + tab[k0 + 1] * f

    # elipse da cintura: túnica e saia viram elipse exata na faixa do cinto
    z_cinto = z_cintura + 0.005
    r_cint = np.max([r_em(z, env) for z in np.linspace(z_cinto - 0.03, z_cinto + 0.03, 7)], axis=0)
    rx_c, ry_c = elipse_que_cobre(r_cint + 0.009, S)
    # anel da cintura: segue o corpo (alisado), não uma elipse (a elipse sobrava na barriga)
    r_elip = _suave_circ((r_cint + 0.009)[None, :], 0, 3.0)[0]

    def mistura_cinto(z, r, largura=0.045):
        """Peso 1 na faixa do cinto (raio vira a elipse); some suavemente acima e abaixo."""
        k = max(0.0, 1 - abs(z - z_cinto) / largura)
        k = k * k * (3 - 2 * k)
        return r * (1 - k) + r_elip * k

    out = []
    # ------------------------------------------------ parte de cima: tronco
    # tronco (anéis horizontais) da cintura até a axila: o pano cai do peito e das costas
    z_tr0 = z_cinto - 0.05
    zt = np.linspace(z_axila, z_tr0, 30)
    r_tr = np.array([r_em(z, env) for z in zt])
    r_tr = cair(r_tr, list(zt), 0.32 if feminino else 0.45)
    r_tr = _suave_circ(r_tr, 2.5, 1.5)
    # ombros e gola: campo de alturas sobre o tronco (acima da axila o tronco inclui ombros e braços).
    # Cada anel vai do anel da axila até a gola (centrada no pescoço); a altura é o topo do corpo
    # naquele ponto + folga, sempre subindo em direção à gola, e suavizada (ombro arredondado).
    folga_t = lambda z: 0.012 + 0.006 * min(1.0, max(0.0, (z - z_cinto) / 0.2)) + (0.01 * math.exp(-((z - z_cinto - 0.045) / 0.03) ** 2))  # noqa: E731
    sup = ~perto_braco & (w_so_cab < 0.5) & (c[:, 2] > z_axila - 0.02) & (c[:, 2] < zp + 0.03)
    P = c[sup]
    a_ = -math.pi + 2 * math.pi * (np.arange(S) + 0.5) / S
    fw = np.maximum(0, np.cos(a_)) ** 2  # frente
    fc = np.maximum(0, -np.cos(a_)) ** 2  # costas
    # decote redondo: mais baixo na frente, um pouco mais baixo atrás; a gola assenta no corpo
    # (o pescoço do corpo-base avança para a frente e o queixo fica baixo: decote alto e redondo)
    z_gola = zp + 0.012 - 0.022 * fw - 0.01 * fc
    gp = c[(c[:, 2] > zp - 0.07) & (c[:, 2] < zp + 0.04) & (w_mao < 0.15) & ~perto_braco & ~((w_so_cab > 0.5) & (c[:, 2] > zp - 0.03))]
    angG = np.arctan2(gp[:, 0] - cx, -(gp[:, 1] - cy))
    radG = np.hypot(gp[:, 0] - cx, gp[:, 1] - cy)
    bG = ((angG + math.pi) / (2 * math.pi) * S).astype(int) % S
    r_gola = np.zeros(S)
    for i in range(S):
        m = (np.minimum((bG - i) % S, (i - bG) % S) <= 2) & (np.abs(gp[:, 2] - z_gola[i]) < 0.014)
        r_gola[i] = radG[m].max() if m.any() else np.nan
    m = np.isnan(r_gola)
    if m.any():
        r_gola[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), r_gola[~m], period=S)
    r_gola = _suave_circ(r_gola[None, :], 0, 2.5)[0] + 0.008
    base_xy = np.stack([cx + np.sin(a_) * (r_tr[0] + folga_t(z_axila)), cy - np.cos(a_) * (r_tr[0] + folga_t(z_axila))], 1)
    gola_xy = np.stack([cx + np.sin(a_) * r_gola, cy - np.cos(a_) * r_gola], 1)
    # campo de alturas por raios de cima para baixo, só nas faces do tronco e ombros (sem cabeça e
    # pescoço acima da gola): o primeiro ponto atingido é o topo do corpo ali
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    lim = zp + 0.02
    ok_v = (c[:, 2] < lim) & (~perto_braco | (c[:, 2] > z_ombro - 0.02)) & (w_mao < 0.15) & (c[:, 2] > z_axila - 0.05) & ~((w_so_cab > 0.5) & (c[:, 2] > zp - 0.03))
    polys = [p_ for p_ in poligonos if all(ok_v[k] for k in p_)]
    arvore = BVHTree.FromPolygons([tuple(v) for v in c.tolist()], polys, all_triangles=False)
    NC = 16
    Z = np.zeros((NC, S))
    XY = np.zeros((NC, S, 2))
    for j in range(1, NC + 1):
        f = j / NC
        xy = base_xy * (1 - f) + gola_xy * f
        XY[j - 1] = xy
        for i in range(S):
            hz = np.nan
            for dx, dy in ((0, 0), (0.012, 0), (-0.012, 0), (0, 0.012), (0, -0.012)):
                o = Vector((xy[i, 0] + dx, xy[i, 1] + dy, lim + 0.05))
                for _ in range(6):  # superfícies viradas para baixo (queixo) não contam: o raio segue
                    h = arvore.ray_cast(o, Vector((0, 0, -1)), 0.6)
                    if h[0] is None or h[1].z > 0.15:
                        break
                    o = h[0] - Vector((0, 0, 0.0005))
                if h[0] is not None and not (hz >= h[0].z):
                    hz = h[0].z
            Z[j - 1, i] = hz
    for i in range(S):
        col = Z[:, i]
        m = np.isnan(col)
        if m.all():
            col[:] = z_axila
        elif m.any():
            col[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), col[~m])
    folga_c = np.linspace(folga_t(z_axila), 0.006, NC)[:, None]
    import os as _os
    if _os.environ.get('DEP'):
        for i in (S // 2, S // 2 + S // 4, S // 2 + S // 8):
            print('DEP', i, 'xy', [tuple(np.round(XY[j, i], 3)) for j in (0, 5, 10, 15)], 'Z', np.round(Z[:, i], 3).tolist(), 'gola', round(z_gola[i], 3))
    Z = _max_janela(Z, 2, 2)
    Z = np.minimum(np.maximum(Z + folga_c, z_axila + 0.004), z_gola[None, :])
    # nunca abaixo do cone que liga o anel da axila à gola: o pano desce reto do pescoço ao peito
    fj = (np.arange(1, NC + 1) / NC)[:, None]
    Z = np.maximum(Z, z_axila + (z_gola[None, :] - z_axila) * fj ** 0.85)
    Z = np.maximum.accumulate(Z, axis=0)   # sobe sempre em direção à gola
    Z = _suave_circ(Z, 2.5, 2.0)
    # perto da gola converge para a altura da gola
    for j in range(NC):
        mg = float(suave_passo(np.array(((j + 1) / NC - 0.75) / 0.25)))
        Z[j] = Z[j] * (1 - mg) + z_gola * mg
    # a gola assenta no corpo: nunca abaixo do topo do corpo naquele ponto
    for i in range(S):
        d2 = (P[:, 0] - gola_xy[i, 0]) ** 2 + (P[:, 1] - gola_xy[i, 1]) ** 2
        m = d2 < 0.012 ** 2
        if m.any():
            Z[-1, i] = max(Z[-1, i], min(P[m, 2].max() + 0.004, z_gola[i] + 0.01))
    Z = np.maximum.accumulate(Z, axis=0)
    aneis_cap = [np.concatenate([XY[j], Z[j][:, None]], 1) for j in range(NC)]
    g = Grade(S)
    # bainha da gola (dentro) -> gola -> ombros -> tronco -> barra de dentro da saia
    seq = []
    for j in reversed(range(NC)):
        seq.append(aneis_cap[j])
    for k, z in enumerate(zt):
        if k == 0:
            continue  # o anel da axila é a elevação 0 da parte de cima
        rr = mistura_cinto(z, r_tr[k] + folga_t(z))
        if z < z_cinto:
            rr = np.minimum(rr, r_elip - 0.004)
        seq.append(_pontos(cx, cy, z, rr, S))
    # bainha da gola: a primeira faixa volta para dentro
    gola = seq[0]
    radial = gola[:, :2] - np.array([cx, cy])
    radial /= np.linalg.norm(radial, axis=1)[:, None]
    dentro = gola.copy()
    dentro[:, :2] -= radial * 0.003
    dentro2 = dentro.copy()
    dentro2[:, 2] -= 0.012
    dentro2[:, :2] -= radial * 0.002
    v = 0.0
    g.anel(dentro2, v - 0.02)
    g.anel(dentro, v - 0.008)
    g.anel(gola + np.array([0, 0, 0.002]), v - 0.003)
    ant = seq[0]
    for p in seq:
        v += float(np.mean(np.linalg.norm(p - ant, axis=1)))
        g.anel(p, v)
        ant = p
    cima = g.objeto(nome_cima, ru=1.0)
    orientar(cima, lambda q: np.array([q[0] - cx, q[1] - cy, 0.0]))
    # escala do UV: 1 unidade = 12 cm de tecido (o U em ângulo vira comprimento médio do anel)
    _escala_uv(cima, 2 * math.pi * float(np.mean(r_tr)), 1.0)

    # ------------------------------------------------ mangas
    for b in bracos:
        om, u, L, t, dist, braco = b['om'], b['u'], b['L'], b['t'], b['dist'], b['braco']
        ref = np.array([0, -1.0, 0])
        b1 = np.cross(u, ref)
        b1 /= np.linalg.norm(b1)
        b2 = np.cross(u, b1)
        t_ini = -0.13  # calota: começa acima do ombro e se fecha em cúpula
        t_fim = b['t_cot'] + (0.14 if not feminino else 0.10)
        ts = np.concatenate([t_ini + 0.13 * (1 - np.cos(np.linspace(0, math.pi / 2, 9)[:-1])), np.linspace(t_ini + 0.13, t_fim, 18)])
        SM = 28
        ang_m = 2 * math.pi * (np.arange(SM) + 0.5) / SM
        # raio por direção e altura (envoltória do braço), ajustado e suavizado
        vb = c[braco]
        tb, db = t[braco], dist[braco]
        rel = vb - (om + np.outer(tb * L, u))
        ab = np.arctan2(rel @ b2, rel @ b1) % (2 * math.pi)
        bin_ = (ab / (2 * math.pi) * SM).astype(int) % SM
        R = np.zeros((len(ts), SM))
        for k, tt in enumerate(ts):
            f = np.abs(tb - max(tt, 0.02)) < 0.05
            if f.any():
                np.maximum.at(R[k], bin_[f], db[f])
        for k in range(len(ts)):
            for _ in range(SM):
                if not (R[k] == 0).any():
                    break
                R[k] = np.where(R[k] == 0, np.maximum(np.roll(R[k], 1), np.roll(R[k], -1)), R[k])
        R = np.where(R == 0, np.median(R[R > 0]) if (R > 0).any() else 0.05, R)
        R = _max_janela(R, 1, 2)
        R = cair(R, list(-ts), 0.0)  # a manga não aperta descendo o braço
        R = _suave_circ(R, 2.0, 2.0)
        gm = Grade(SM)
        v = 0.0
        ant = None
        aneis = []
        for k, tt in enumerate(ts):
            s = max(0.0, (tt - b['t_cot'] * 0.35) / (t_fim - b['t_cot'] * 0.35))
            rr = R[k] + 0.013 + 0.03 * s ** 1.4  # sino
            # calota do ombro: cúpula (raio cai para zero no topo)
            hc = 0.13
            if tt < t_ini + hc:
                q = (t_ini + hc - tt) / hc
                rr = rr * math.sqrt(max(0.0, 1 - q * q)) + 1e-4
            ctr = om + u * (tt * L)
            p = ctr + (np.outer(np.cos(ang_m) * rr, b1) + np.outer(np.sin(ang_m) * rr, b2))
            aneis.append((p, ctr))
        for p, ctr in aneis:
            if ant is not None:
                v += float(np.mean(np.linalg.norm(p - ant, axis=1)))
            gm.anel(p, v)
            ant = p
        bainha_anel(gm, aneis[-1][0], aneis[-1][1], v0=v, sentido=1, eixo=u)
        ob = gm.objeto('manga', ru=1.0)
        orientar(ob, lambda q, om=om, u=u: (q - om) - ((q - om) @ u) * u)
        _escala_uv(ob, 2 * math.pi * float(np.mean(R)) + 0.1, 1.0)
        out.append(ob)
    # junta mangas e tronco num objeto só (sobreposição nos ombros, mesmo tecido)
    for ob in bpy.context.view_layer.objects:
        ob.select_set(False)
    bpy.context.view_layer.objects.active = cima
    cima.select_set(True)
    for ob in out:
        ob.select_set(True)
    bpy.ops.object.join()
    cima = bpy.context.view_layer.objects.active
    cima.name = nome_cima
    cima.data.materials.append(mat)
    pecas = [cima]

    # ------------------------------------------------ saias
    for nome, z_barra in saias:
        z_top = z_cinto + 0.022
        NZ = max(16, int((z_top - z_barra) / 0.018))
        zz = np.linspace(z_top, z_barra, NZ + 1)
        r_s = np.array([r_em(z, env) for z in zz])
        r_s = cair(r_s, list(zz), 0.25)
        # abaixo do quadril o pano não volta para dentro (cai reto) e abre um pouco para a barra
        r_s = _suave_circ(r_s, 2.0, 2.0)
        gs = Grade(S)
        v = 0.0
        ant = None
        rng = np.random.default_rng(11)
        fases = rng.uniform(0, 2 * math.pi, 3)
        a = -math.pi + 2 * math.pi * (np.arange(S) + 0.5) / S
        aneis = []
        for k, z in enumerate(zz):
            prof = (z_top - z)
            folga = 0.016 + 0.07 * max(0.0, prof - 0.12) * (1.0 if not feminino else 1.15)
            rr = r_s[k] + folga
            rr = mistura_cinto(z, rr, 0.035)
            rr = np.maximum(rr, r_elip + 0.0015) if z > z_cinto - 0.04 else rr
            # dobras: franzido logo abaixo do cinto (fino) e dobras largas que crescem para a barra
            fr = math.exp(-max(0.0, prof - 0.01) / 0.05)
            amp = 0.0035 * fr
            larga = min(1.0, max(0.0, (prof - 0.1) / 0.45)) ** 1.2 * 0.011
            rr = rr + amp * (0.5 + 0.5 * np.sin(22 * a + fases[0]))
            rr = rr + larga * (0.55 * np.sin(9 * a + fases[1]) + 0.3 * np.sin(5 * a + fases[2]) + 0.15 * np.sin(14 * a))
            # atrás a barra cai um pouco mais (o pano tem mais caimento sobre os calcanhares)
            zq = z - (0.006 * (1 - np.cos(a)) * (prof / max(z_top - z_barra, 1e-3)) if k == len(zz) - 1 else 0.0)
            p = np.stack([cx + np.sin(a) * rr, cy - np.cos(a) * rr, np.full(S, z) if np.isscalar(zq) else zq], 1)
            aneis.append(p)
        for p in aneis:
            if ant is not None:
                v += float(np.mean(np.linalg.norm(p - ant, axis=1)))
            gs.anel(p, v)
            ant = p
        bainha_anel(gs, aneis[-1], np.array([cx, cy, zz[-1]]), v0=v, sentido=-1, altura=0.018)
        ob = gs.objeto(nome)
        orientar(ob, lambda q: np.array([q[0] - cx, q[1] - cy, 0.0]))
        _escala_uv(ob, 2 * math.pi * float(np.mean(r_s)), 1.0)
        ob.data.materials.append(mat)
        pecas.append(ob)
    return pecas, (cx, cy, rx_c, ry_c), z_cinto, r_elip


def _escala_uv(ob, circunferencia, _v, cm=0.12):
    """U (fração da volta) vira comprimento de tecido; 1 unidade de UV = `cm` metros, U inteiro na costura."""
    me = ob.data
    uv = me.uv_layers['UV']
    reps = max(1, round(circunferencia / cm))
    for d in uv.data:
        if d.uv.x <= 1.0001:
            d.uv = (d.uv.x * reps, d.uv.y / cm)


def arredondar_sob_tunica(ob, ossos, pesos, z_cintura, vezes=40):
    """O corpo-base da IA veste uma camiseta modelada em forma de caixa (mangas largas e quinas nos
    ombros). Essa região fica sempre sob a túnica: é alisada (Laplace) para a túnica seguir um ombro
    natural, sem ombreiras. Pescoço, antebraços e mãos não mudam (a borda se mistura suavemente)."""
    from vestes import coords
    c = coords(ob)
    w_cab = pesos(['head', 'neck01', 'neck02', 'neck03'])
    zp = ossos['neck01'][0][2]
    dentro = np.ones(len(c))
    dentro *= np.clip((c[:, 2] - (z_cintura + 0.02)) / 0.05, 0, 1)
    dentro *= np.clip((zp - 0.035 - c[:, 2]) / 0.03, 0, 1)
    dentro *= 1 - np.clip(w_cab / 0.3, 0, 1)
    cobre = (c[:, 2] > z_cintura - 0.02) & (c[:, 2] < zp - 0.012)  # região coberta (sem a mistura)
    for lado in ('L', 'R'):
        om = np.array(ossos[f'upperarm01.{lado}'][0])
        co_ = np.array(ossos[f'lowerarm01.{lado}'][0])
        e = co_ - om
        t = ((c - om) @ e) / (e @ e)
        lado_ok = np.sign(c[:, 0]) == np.sign(om[0])
        dentro *= np.where(lado_ok, 1 - np.clip((t - 0.75) / 0.2, 0, 1), 1)
        cobre &= ~(lado_ok & (t > 1.05))
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    orig = c.copy()
    vs = [v for v in bm.verts if dentro[v.index] > 0.01]
    for _ in range(vezes):
        bmesh.ops.smooth_vert(bm, verts=vs, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    novo = np.array([v.co[:] for v in bm.verts])
    bm.free()
    final = orig + (novo - orig) * dentro[:, None]
    ob.data.vertices.foreach_set('co', final.reshape(-1))
    ob.data.update()
    print('corpo: região sob a túnica alisada', int((dentro > 0.5).sum()), 'vértices')
    return cobre.astype(float)


def ajustar_cinto(ob, cx, cy, rx, ry, r_anel, folga=0.007):
    """O cinto (../vestes.py) nasce numa elipse (rx, ry): cada vértice é levado para o anel da
    cintura da túnica, mantendo a espessura e o volume relativos à elipse."""
    S = len(r_anel)
    me = ob.data
    for v in me.vertices:
        x, y = v.co.x - cx, v.co.y - cy
        a = math.atan2(x, -y)
        r = math.hypot(x, y)
        e = 1 / math.sqrt((math.sin(a) / rx) ** 2 + (math.cos(a) / ry) ** 2)
        k = (a + math.pi) / (2 * math.pi) * S - 0.5
        k0 = int(math.floor(k)) % S
        f = k - math.floor(k)
        ra = r_anel[k0] * (1 - f) + r_anel[(k0 + 1) % S] * f
        nr = ra + folga + (r - e)
        v.co.x = cx + math.sin(a) * nr
        v.co.y = cy - math.cos(a) * nr
    me.update()


def recolher_corpo(corpo, cima, mascara, folga=0.009, z_max=None):
    """Nenhum ponto do corpo atravessa a túnica: na região coberta (máscara), todo vértice que
    estiver fora do tecido, ou a menos de `folga` dele, volta para dentro, `folga` abaixo da superfície."""
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    dg = bpy.context.evaluated_depsgraph_get()
    arv = BVHTree.FromObject(cima, dg, deform=False)
    me = corpo.data
    n = 0
    viz = {}
    for e in me.edges:
        a_, b_ = e.vertices
        viz.setdefault(a_, []).append(b_)
        viz.setdefault(b_, []).append(a_)
    # a máscara cresce um anel de vizinhos: faces que cruzam a borda também recolhem
    m2 = mascara.copy()
    for i, vs in viz.items():
        if mascara[i] < 0.5 and any(mascara[j] >= 0.5 for j in vs) and (z_max is None or me.vertices[i].co.z < z_max):
            m2[i] = 1
    mascara = m2
    for v in me.vertices:
        if mascara[v.index] < 0.5:
            continue
        loc, nor, _, _ = arv.find_nearest(v.co, 0.2)
        if loc is None:
            continue
        # normal do tecido apontando para fora (a túnica é fechada em volta do corpo: sentido do eixo)
        d = v.co - loc
        fora = d.dot(nor)
        if fora > -folga:
            v.co = loc - nor * folga
            n += 1
    me.update()
    print('corpo: vértices recolhidos para dentro da túnica', n)
