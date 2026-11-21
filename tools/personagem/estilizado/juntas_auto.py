"""
Juntas do esqueleto de um corpo base (malha do TRELLIS.2 preparada por preparar.py).

As alturas e a abertura (x) de cada junta foram medidas na silhueta de frente
de cada corpo (largura por altura: pescoço, ombros, mãos, virilha, joelhos e
tornozelos) e ficam em MEDIDAS. A profundidade (y) e o centro exato são
calculados aqui, pelo meio da superfície da malha perto de cada junta.

Uso: python3 juntas_auto.py <feminino|masculino> <malha.npz> <saida.json>
"""
import json
import sys

import numpy as np

# (x, z) em metros; x do lado esquerdo do personagem (espelhado para o direito)
MEDIDAS = {
    'feminino': dict(
        quadril=(0, .75), quadril_cima=(0, .81), coluna1=(0, .85), coluna2=(0, .95), coluna3=(0, 1.05), coluna4=(0, 1.15),
        pescoco=(0, 1.275), nuca=(0, 1.35), topo=(0, 1.596), clavicula=(.03, 1.24), ombro=(.12, 1.19),
        cotovelo=(.20, .97), pulso=(.27, .75), mao=(.28, .66), anca=(.08, .75), joelho=(.09, .44), tornozelo=(.125, .085), dedos=(.14, .02)),
    'masculino': dict(
        quadril=(0, .73), quadril_cima=(0, .79), coluna1=(0, .84), coluna2=(0, .97), coluna3=(0, 1.10), coluna4=(0, 1.23),
        pescoco=(0, 1.42), nuca=(0, 1.50), topo=(0, 1.71), clavicula=(.03, 1.35), ombro=(.18, 1.30),
        cotovelo=(.245, 1.03), pulso=(.31, .77), mao=(.31, .66), anca=(.10, .73), joelho=(.126, .40), tornozelo=(.175, .10), dedos=(.19, .02)),
}

corpo, arq, saida = sys.argv[1:4]
d = np.load(arq)
v, t = d['v'], d['t']
# amostras densas da superfície (12 pontos por triângulo)
rng = np.random.default_rng(1)
a, b, c = v[t[:, 0]], v[t[:, 1]], v[t[:, 2]]
pts = []
for _ in range(12):
    r1, r2 = rng.random((len(t), 1)), rng.random((len(t), 1))
    s = np.sqrt(r1)
    pts.append(a * (1 - s) + b * s * (1 - r2) + c * s * r2)
S = np.concatenate(pts)


def meio_y(x, z, rx, rz=0.012):
    m = (np.abs(S[:, 2] - z) < rz) & (np.abs(S[:, 0] - x) < rx)
    q = S[m]
    return float((np.percentile(q[:, 1], 3) + np.percentile(q[:, 1], 97)) / 2)


J = {}
for nome, (x, z) in MEDIDAS[corpo].items():
    if nome == 'dedos':
        pe = S[(S[:, 2] < 0.04) & (np.abs(S[:, 0] - x) < 0.05)]
        J[nome] = [x, round(float(np.percentile(pe[:, 1], 2)) + 0.035, 4), z]
        continue
    if nome == 'topo':
        J[nome] = [0, J['nuca'][1], z]
        continue
    rx = 0.05 if x == 0 else (0.035 if nome in ('ombro', 'cotovelo', 'pulso', 'mao') else 0.045)
    J[nome] = [x, round(meio_y(x, z, rx), 4), z]
J['saia'] = [0, 1, 0]  # corpo base: sem saia
J['braco_graus'] = 11
for k, val in J.items():
    print(k, val)
json.dump(J, open(saida, 'w'), indent=1)
