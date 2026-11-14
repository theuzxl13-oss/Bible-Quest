"""
Animações (clipes de esqueleto) e expressões (morph targets) do personagem.

Clipes: Idle, Walk, Run, Victory, Greeting, Discovery.
Expressões (shape keys, controladas pelo jogo): Piscar, Sorriso, Surpresa, Alegria.

As rotações são descritas em eixos do mundo (Blender: X = esquerda->direita do
personagem, Y = para trás, Z = para cima) em torno da cabeça de cada osso, na
ordem da hierarquia, o que torna as poses legíveis e independentes do "roll".
"""
import math

import bpy
from mathutils import Matrix, Vector

FPS = 30
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))


def _pb(arm, nome):
    return arm.pose.bones.get(nome)


def zerar(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
        pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()


def girar(arm, nome, eixo, graus):
    pb = _pb(arm, nome)
    if pb is None or not graus:
        return
    h = pb.head.copy()
    R = Matrix.Translation(h) @ Matrix.Rotation(math.radians(graus), 4, eixo) @ Matrix.Translation(-h)
    pb.matrix = R @ pb.matrix
    bpy.context.view_layer.update()


def mover(arm, nome, delta):
    pb = _pb(arm, nome)
    if pb is None:
        return
    pb.matrix = Matrix.Translation(Vector(delta)) @ pb.matrix
    bpy.context.view_layer.update()


DEDOS = [f'finger{i}-{j}' for i in range(2, 6) for j in range(1, 4)]


def relaxar_maos(arm, fechar=0.0):
    """Dedos levemente curvados (mão relaxada) ou fechados (segurando)."""
    for lado, s in (('L', 1), ('R', -1)):
        for d in DEDOS:
            pb = _pb(arm, f'{d}.{lado}')
            if pb is None:
                continue
            j = int(d[-1])
            ang = (12 + 6 * j) + fechar * (45 + 10 * j)
            pb.rotation_quaternion = Matrix.Rotation(math.radians(ang), 4, 'X').to_quaternion()
        bpy.context.view_layer.update()


def postura_base(arm, t=0.0):
    """Repouso natural: cotovelos levemente dobrados, palmas voltadas para as coxas."""
    for lado, s in (('L', 1), ('R', -1)):
        girar(arm, f'lowerarm01.{lado}', X, -10)
        girar(arm, f'wrist.{lado}', Z, -12 * s)
    relaxar_maos(arm)


# ------------------------------------------------------------------ poses por tempo
def pose_idle(arm, t):
    ciclo = 2 * math.pi * t / 4.0
    resp = math.sin(ciclo * 2)
    girar(arm, 'root', Y, 1.2 * math.sin(ciclo))
    girar(arm, 'spine03', X, 1.0 * resp)
    girar(arm, 'spine01', Y, -1.0 * math.sin(ciclo))
    girar(arm, 'clavicle.L', Y, -0.8 * resp)
    girar(arm, 'clavicle.R', Y, 0.8 * resp)
    girar(arm, 'neck01', Z, 4 * math.sin(ciclo * 0.5))
    girar(arm, 'head', X, -1.5 * math.sin(ciclo + 1))
    postura_base(arm)
    for lado, s in (('L', 1), ('R', -1)):
        girar(arm, f'upperarm01.{lado}', X, 2 * math.sin(ciclo + (0 if s > 0 else 1)))


def pose_walk(arm, t, run=False):
    T = 0.66 if run else 1.0
    f = 2 * math.pi * t / T
    s = math.sin(f)
    amp_perna = 38 if run else 26
    amp_braco = 45 if run else 22
    joelho = 75 if run else 45
    mover(arm, 'root', (0, 0, (0.035 if run else 0.018) * abs(math.cos(f)) - (0.03 if run else 0.012)))
    if run:
        girar(arm, 'spine01', X, -12)
    girar(arm, 'spine01', Z, 5 * s)
    girar(arm, 'spine04', Z, -7 * s)
    for lado, k in (('L', 1), ('R', -1)):
        fase = s * k
        girar(arm, f'upperleg01.{lado}', X, -amp_perna * fase)
        dobra = joelho * max(0.0, math.sin(f * 1 + (0 if k > 0 else math.pi) - 1.2))
        girar(arm, f'lowerleg01.{lado}', X, dobra)
        girar(arm, f'foot.{lado}', X, -0.4 * dobra + 8 * fase)
    postura_base(arm)
    for lado, k in (('L', 1), ('R', -1)):
        girar(arm, f'upperarm01.{lado}', X, amp_braco * s * k)
        if run:
            girar(arm, f'lowerarm01.{lado}', X, -70)
    if run:
        relaxar_maos(arm, 0.8)


def pose_victory(arm, t):
    f = 2 * math.pi * t / 1.0
    pulo = max(0.0, math.sin(f))
    mover(arm, 'root', (0, 0, 0.07 * pulo))
    girar(arm, 'head', X, 10)
    for lado, s in (('L', 1), ('R', -1)):
        girar(arm, f'upperleg01.{lado}', X, -12 * pulo)
        girar(arm, f'lowerleg01.{lado}', X, 22 * pulo)
        girar(arm, f'clavicle.{lado}', Y, -10 * s)
        girar(arm, f'upperarm01.{lado}', Y, -145 * s)
        girar(arm, f'upperarm01.{lado}', X, -10)
        girar(arm, f'lowerarm01.{lado}', Y, -15 * s)
    relaxar_maos(arm, 0.9)


def pose_greeting(arm, t):
    f = 2 * math.pi * t / 1.0
    postura_base(arm)
    girar(arm, 'head', Z, 6)
    girar(arm, 'head', Y, -5)
    girar(arm, 'upperarm01.R', Y, 115)
    girar(arm, 'upperarm01.R', X, -15)
    girar(arm, 'lowerarm01.R', Y, 55 + 22 * math.sin(f))
    relaxar_maos(arm, 0.0)


def pose_discovery(arm, t):
    f = 2 * math.pi * t / 3.0
    girar(arm, 'spine03', X, -7)
    girar(arm, 'neck01', X, -6)
    girar(arm, 'head', Y, 8 + 3 * math.sin(f))
    postura_base(arm)
    # mão direita no queixo
    girar(arm, 'upperarm01.R', X, -55)
    girar(arm, 'upperarm01.R', Y, 12)
    girar(arm, 'lowerarm01.R', X, -120)
    girar(arm, 'wrist.R', X, 20)
    relaxar_maos(arm, 0.5)


CLIPES = {
    'Idle': (4.0, pose_idle),
    'Walk': (1.0, lambda a, t: pose_walk(a, t)),
    'Run': (0.66, lambda a, t: pose_walk(a, t, run=True)),
    'Victory': (2.0, pose_victory),
    'Greeting': (2.0, pose_greeting),
    'Discovery': (3.0, pose_discovery),
}


def gravar_clipes(arm):
    arm.animation_data_create()
    for nome, (dur, fn) in CLIPES.items():
        act = bpy.data.actions.new(nome)
        act.use_fake_user = True
        arm.animation_data.action = act
        n = max(2, round(dur * FPS / 2))  # uma chave a cada 2 quadros; o glTF interpola
        for k in range(n + 1):
            t = dur * k / n
            zerar(arm)
            fn(arm, t)
            fr = 1 + round(t * FPS)
            for pb in arm.pose.bones:
                pb.keyframe_insert('rotation_quaternion', frame=fr)
                if pb.name == 'root':
                    pb.keyframe_insert('location', frame=fr)
        # remove canais parados no valor de repouso (ossos que não se movem neste clipe);
        # um canal constante fora do repouso (ex.: braço erguido o tempo todo) precisa ficar
        for fc in list(act.fcurves):
            vals = [kp.co[1] for kp in fc.keyframe_points]
            repouso = 1.0 if (fc.data_path.endswith('rotation_quaternion') and fc.array_index == 0) else 0.0
            if max(vals) - min(vals) < 1e-5 and abs(vals[0] - repouso) < 1e-5:
                act.fcurves.remove(fc)
        track = arm.animation_data.nla_tracks.new()
        track.name = nome
        track.strips.new(nome, 1, act)
        arm.animation_data.action = None
    zerar(arm)


# ------------------------------------------------------------------ expressões
def expressao(arm, nome):
    if nome == 'Piscar':
        for lado in ('L', 'R'):
            girar(arm, f'orbicularis03.{lado}', X, 30)
            girar(arm, f'orbicularis04.{lado}', X, -8)
    elif nome == 'Sorriso':
        for lado, s in (('L', 1), ('R', -1)):
            for b in (f'oris03.{lado}', f'oris07.{lado}'):
                mover(arm, b, (0.0025 * s, 0.001, 0.003))
            mover(arm, f'levator05.{lado}', (0.001 * s, 0, 0.002))
            mover(arm, f'risorius03.{lado}', (0.002 * s, 0, 0.0025))
            girar(arm, f'orbicularis04.{lado}', X, -6)
    elif nome == 'Surpresa':
        for lado in ('L', 'R'):
            mover(arm, f'oculi01.{lado}', (0, 0, 0.004))
            mover(arm, f'oculi02.{lado}', (0, 0, 0.0035))
            girar(arm, f'orbicularis03.{lado}', X, -6)
        girar(arm, 'jaw', X, 7)
    elif nome == 'Alegria':
        expressao(arm, 'Sorriso')
        girar(arm, 'jaw', X, 9)
        for lado in ('L', 'R'):
            mover(arm, f'oculi02.{lado}', (0, 0, 0.002))


def gravar_expressoes(arm, malhas):
    for ob in malhas:
        if ob.data.shape_keys is None:
            ob.shape_key_add(name='Basis', from_mix=False)
    for nome in ('Piscar', 'Sorriso', 'Surpresa', 'Alegria'):
        zerar(arm)
        expressao(arm, nome)
        dg = bpy.context.evaluated_depsgraph_get()
        for ob in malhas:
            ev = ob.evaluated_get(dg)
            sk = ob.shape_key_add(name=nome, from_mix=False)
            co = [v.co.copy() for v in ev.data.vertices]
            for i, c in enumerate(co):
                sk.data[i].co = c
    zerar(arm)


def animar(ctx):
    arm = ctx['arm']
    rosto = [o for o in bpy.data.objects if o.type == 'MESH' and (o.name in ('Corpo', 'Cilios', 'Sobrancelhas', 'Dentes', 'Lingua') or o.name.startswith('Barba'))]
    gravar_expressoes(arm, rosto)
    gravar_clipes(arm)
