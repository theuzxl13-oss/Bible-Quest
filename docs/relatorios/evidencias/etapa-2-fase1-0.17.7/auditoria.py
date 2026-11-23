# Contraste de cada texto: cor do texto contra o fundo real (pixels da caixa,
# descartando os mais parecidos com o texto). Critério WCAG 1.4.3: 4,5:1, ou 3:1 no texto grande.
import json, sys, glob, os
from PIL import Image
def L(c):
    def f(v):
        v /= 255; return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
rat = lambda a, b: (max(a, b) + 0.05) / (min(a, b) + 0.05)
pasta = sys.argv[1]; detalhe = len(sys.argv) > 2
res = {}
for j in sorted(glob.glob(pasta + '/*.json')):
    nome = os.path.basename(j)[:-5]; d = json.load(open(j)); im = Image.open(j[:-5] + '.png').convert('RGB')
    tot = ruins = 0; piores = []
    fixos = d.get('fixos', [])
    for t in d['textos']:
        if t.get('inativo'): continue
        dentro = lambda f: t['x'] >= f['x'] - 1 and t['y'] >= f['y'] - 1 and t['x'] + t['w'] <= f['x'] + f['w'] + 1 and t['y'] + t['h'] <= f['y'] + f['h'] + 1
        cruza = lambda f: not (t['x'] + t['w'] <= f['x'] or f['x'] + f['w'] <= t['x'] or t['y'] + t['h'] <= f['y'] or f['y'] + f['h'] <= t['y'])
        if t.get('sobFixo') or t.get('atrasDaJanela'): continue
        cor = [float(v) for v in t['cor'][t['cor'].index('(') + 1:-1].split(',')]
        if len(cor) == 4 and cor[3] < 0.95: continue
        box = (int(t['x']), int(t['y']), int(t['x'] + t['w']), int(t['y'] + t['h']))
        if box[2] <= box[0] or box[3] <= box[1] or box[3] > im.height or box[2] > im.width: continue
        px = list(im.crop(box).getdata());
        if len(px) < 20: continue
        lt = L(cor); ls = sorted(px, key=lambda p: abs(L(p) - lt)); fundo = ls[int(len(ls) * 0.4):]
        lb = sorted(L(p) for p in fundo)[len(fundo) // 2]
        r = rat(lt, lb); grande = t['tam'] >= 24 or (t['tam'] >= 18.66 and t['peso'] >= 700)
        tot += 1
        if r < (3 if grande else 4.5): ruins += 1; piores.append((round(r, 2), t['t'], t['cls']))
    res[nome] = (tot, ruins, sorted(piores)[:6], d.get('alto'))
for k, (tot, ruins, p, alto) in res.items():
    print(f'{k:26} modo={alto:6} textos={tot:4} abaixo={ruins:3}' + ('' if not detalhe or not p else '  ' + ' | '.join(f'{a}:1 "{b}" {c}' for a, b, c in p)))
print('TOTAL', sum(v[0] for v in res.values()), 'abaixo', sum(v[1] for v in res.values()))
