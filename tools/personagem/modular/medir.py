"""
Mede o rosto de um corpo-base: centro e tamanho dos olhos, sobrancelhas e boca,
a partir da textura (pixels escuros e avermelhados na frente da cabeça).
Uso: blender -b -P medir.py -- <corpo-rig.blend> <juntas.json> <saida.json> <debug.png>
"""
import json
import sys

import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402
from comum import abrir, imagem_base, pixels, rasterizar

ent, jj, saida, dbg = sys.argv[-4:]
J = json.load(open(jj))
corpo, arm = abrir(ent)
img = imagem_base(corpo)
W, H = img.size
px = pixels(img)
zp = J['pescoco'][2]
ztopo = J['topo'][2]
cab = arm.data.bones['head'].head_local
ycab = cab.y


def filtro(c, n):
    return (c[:, 2] > zp + 0.08) & (c[:, 1] < ycab - 0.02) & (n[:, 1] < -0.25)


iy, ix, P, N = rasterizar(corpo, filtro, W)
cor = px[iy, ix, :3]
lum = cor @ np.array([0.2126, 0.7152, 0.0722])
# mapa frontal (x, z) com passo de 0,5 mm
x0, x1 = P[:, 0].min(), P[:, 0].max()
z0, z1 = P[:, 2].min(), P[:, 2].max()
s = 0.001
gw, gh = int((x1 - x0) / s) + 1, int((z1 - z0) / s) + 1
gx = ((P[:, 0] - x0) / s).astype(int)
gz = ((z1 - P[:, 2]) / s).astype(int)
mapa = np.zeros((gh, gw, 3), np.float32)
cnt = np.zeros((gh, gw), np.float32)
np.add.at(mapa, (gz, gx), cor)
np.add.at(cnt, (gz, gx), 1)
mapa /= np.maximum(cnt, 1)[:, :, None]
# preenche buracos com a média dos vizinhos
for _ in range(3):
    vazio = cnt == 0
    soma = np.zeros_like(mapa)
    k = np.zeros_like(cnt)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        soma += np.roll(np.roll(mapa * (cnt > 0)[:, :, None], dy, 0), dx, 1)
        k += np.roll(np.roll((cnt > 0).astype(np.float32), dy, 0), dx, 1)
    novo = vazio & (k > 0)
    mapa[novo] = soma[novo] / k[novo][:, None]
    cnt[novo] = 1
from PIL import Image  # noqa: E402  (Pillow do sistema, se houver)


def componentes(mask):
    """Rótulos de componentes conexos (vizinhança 4), sem scipy."""
    lab = np.zeros(mask.shape, np.int32)
    n = 0
    hh, ww = mask.shape
    for yy, xx in zip(*np.nonzero(mask)):
        if lab[yy, xx]:
            continue
        n += 1
        pilha = [(yy, xx)]
        lab[yy, xx] = n
        while pilha:
            a, b = pilha.pop()
            for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                c, d = a + da, b + db
                if 0 <= c < hh and 0 <= d < ww and mask[c, d] and not lab[c, d]:
                    lab[c, d] = n
                    pilha.append((c, d))
    return lab, n


def para_mundo(gzz, gxx):
    return x0 + gxx * s, z1 - gzz * s


ml = mapa @ np.array([0.2126, 0.7152, 0.0722])
valido = cnt > 0
xc = float(np.median(P[:, 0]))
gxc = int((xc - x0) / s)
# região central do rosto (sem cabelo nas laterais e no alto)
X, Z = np.meshgrid(np.arange(gw), np.arange(gh))
xm, zm = para_mundo(Z, X)
central = valido & (np.abs(xm - xc) < 0.07) & (zm < ztopo - 0.06) & (zm > zp + 0.1)
escuro = central & (ml < 0.16)
lab, n = componentes(escuro)
blobs = []
for i in range(1, n + 1):
    yy, xx = np.nonzero(lab == i)
    if len(yy) < 12:
        continue
    wx, wz = para_mundo(yy, xx)
    blobs.append({'area': len(yy) * s * s, 'x': float(wx.mean()), 'z': float(wz.mean()),
                  'x0': float(wx.min()), 'x1': float(wx.max()), 'z0': float(wz.min()), 'z1': float(wz.max())})
blobs.sort(key=lambda b: -b['area'])
for b in blobs[:8]:
    print('blob', {k: round(v, 4) for k, v in b.items()})
res = {'xc': xc, 'blobs': blobs[:8]}
# boca: mais avermelhada que a pele, abaixo do nariz, no centro
pele = np.median(mapa[central & (ml > 0.35)], axis=0)
verm = (mapa[:, :, 0] - mapa[:, :, 1]) - (pele[0] - pele[1])
olhos_z = min(b['z'] for b in blobs[:4]) if blobs else zp + 0.2
cand = valido & (np.abs(xm - xc) < 0.035) & (zm < olhos_z - 0.04) & (zm > zp + 0.06)
sc = np.where(cand, verm, -1)
lim = np.percentile(sc[cand], 92)
bm = cand & (sc >= lim)
yy, xx = np.nonzero(bm)
wx, wz = para_mundo(yy, xx)
res['boca'] = {'x': float(wx.mean()), 'z': float(np.median(wz)), 'x0': float(np.percentile(wx, 3)), 'x1': float(np.percentile(wx, 97)), 'z0': float(np.percentile(wz, 3)), 'z1': float(np.percentile(wz, 97))}
res['pele'] = [float(v) for v in pele]
res['caixa'] = [float(x0), float(x1), float(z0), float(z1)]
print('boca', {k: round(v, 4) for k, v in res['boca'].items()}, 'pele', np.round(pele, 3))
json.dump(res, open(saida, 'w'), indent=1)
dbgimg = np.clip(mapa, 0, 1)
dbgimg[bm] = [0, 1, 0]
for b in blobs[:6]:
    for xx_, zz_ in ((b['x0'], b['z0']), (b['x1'], b['z1'])):
        pass
Image.fromarray((dbgimg * 255).astype(np.uint8)).save(dbg)
