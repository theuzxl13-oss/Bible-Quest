"""
Prepara as texturas (Pillow, fora do Blender):
- reduz o tamanho para uso na web;
- converte cabelos, sobrancelhas e cílios para tons de cinza normalizados,
  para que o jogo possa tingi-los com qualquer cor de cabelo (cor do material
  multiplicada pela textura).
"""
import os

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
SYS = os.path.join(AQUI, 'fonte', 'sys')
TEX = os.path.join(AQUI, 'saida', 'tex')
os.makedirs(TEX, exist_ok=True)


def jpg(src, dst, size, q=86):
    im = Image.open(src).convert('RGB').resize((size, size), Image.LANCZOS)
    im.save(os.path.join(TEX, dst), quality=q, optimize=True, progressive=True)


def cinza_tingivel(src, dst, size, alvo=0.92):
    im = Image.open(src).convert('RGBA').resize((size, size), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    vis = a[..., 3] > 0.5
    ref = np.percentile(lum[vis], 92) if vis.any() else 1
    g = np.clip(lum / max(ref, 1e-3) * alvo, 0, 1)
    out = np.dstack([g, g, g, a[..., 3]])
    Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(os.path.join(TEX, dst), optimize=True)


peles = {
    'pele-m-clara.jpg': 'young_caucasian_male/young_lightskinned_male_diffuse.png',
    'pele-m-media.jpg': 'young_asian_male/young_lightskinned_male_diffuse3.png',
    'pele-m-escura.jpg': 'young_african_male/young_darkskinned_male_diffuse.png',
    'pele-f-clara.jpg': 'young_caucasian_female/young_lightskinned_female_diffuse.png',
    'pele-f-media.jpg': 'young_asian_female/young_lightskinned_female_diffuse3.png',
    'pele-f-escura.jpg': 'young_african_female/young_darkskinned_female_diffuse.png',
}
for dst, src in peles.items():
    jpg(os.path.join(SYS, 'skins', src), dst, 2048, 84)

for cor in ('brown', 'brownlight', 'green', 'blue'):
    jpg(os.path.join(SYS, 'eyes', 'materials', f'{cor}_eye.png'), f'olho-{dict(brown="castanho", brownlight="mel", green="verde", blue="azul")[cor]}.jpg', 512, 90)
jpg(os.path.join(SYS, 'teeth', 'teeth_base', 'teeth.png'), 'dentes.jpg', 256)

def rgba(src, dst, size):
    Image.open(src).convert('RGBA').resize((size, size), Image.LANCZOS).save(os.path.join(TEX, dst), optimize=True)


# cabelos, sobrancelhas e cílios mantêm a textura original; o jogo tinge no shader pela luminância
cinza_tingivel(os.path.join(SYS, 'eyebrows', 'eyebrow001', 'eyebrow001.png'), 'sobrancelha.png', 512, 0.8)
cinza_tingivel(os.path.join(SYS, 'eyebrows', 'eyebrow006', 'eyebrow006.png'), 'sobrancelha-f.png', 512, 0.8)
rgba(os.path.join(SYS, 'eyelashes', 'eyelashes01', 'eyelashes01.png'), 'cilios.png', 512)
for pasta in os.listdir(os.path.join(SYS, 'hair')):
    d = os.path.join(SYS, 'hair', pasta)
    dif = [f for f in os.listdir(d) if f.endswith('_diffuse.png')]
    if dif:
        # tons de cinza normalizados: a cor vem toda do jogo (qualquer cor de cabelo, clara ou escura)
        cinza_tingivel(os.path.join(d, dif[0]), f'cabelo-{pasta}.png', 1024, 0.95)
        nrm = [f for f in os.listdir(d) if f.endswith('_normal.png')]
        if nrm:
            Image.open(os.path.join(d, nrm[0])).convert('RGB').resize((1024, 1024), Image.LANCZOS).save(os.path.join(TEX, f'cabelo-{pasta}-normal.jpg'), quality=88)
print('Texturas:', sorted(os.listdir(TEX)))


# ---------------------------------------------------------------- tecidos (procedurais, claros e tingíveis)
def ruido(size, escala, seed):
    rng = np.random.default_rng(seed)
    base = rng.random((size // escala + 2, size // escala + 2))
    img = Image.fromarray((base * 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255


def normal_de_altura(h, forca=2.0):
    gy, gx = np.gradient(h)
    n = np.dstack([-gx * forca, -gy * forca, np.ones_like(h)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8), 'RGB')


def tecido(nome, size, fio, tom, contraste, seed, forca):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    trama = 0.5 + 0.5 * np.sin(x * 2 * np.pi / fio) * np.sign(np.sin(y * np.pi / fio))
    urdume = 0.5 + 0.5 * np.sin(y * 2 * np.pi / fio) * np.sign(np.sin(x * np.pi / fio))
    h = 0.5 * trama + 0.5 * urdume
    h = 0.75 * h + 0.25 * ruido(size, 6, seed) + 0.15 * (ruido(size, 64, seed + 1) - 0.5)
    fibras = ruido(size, 2, seed + 2)
    cor = tom * (1 - contraste + contraste * (0.7 * h + 0.3 * fibras))
    rgb = np.dstack([cor, cor * 0.985, cor * 0.96])
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), 'RGB').save(os.path.join(TEX, f'{nome}.jpg'), quality=88)
    normal_de_altura(h, forca).save(os.path.join(TEX, f'{nome}-normal.jpg'), quality=90)


tecido('linho', 1024, 6, 0.93, 0.22, 3, 1.6)
tecido('la', 1024, 10, 0.9, 0.3, 5, 2.4)


def couro(nome, size, seed):
    n1, n2 = ruido(size, 24, seed), ruido(size, 4, seed + 1)
    h = 0.6 * n1 + 0.4 * n2
    c = 0.75 + 0.25 * h
    rgb = np.dstack([c, c * 0.97, c * 0.93])
    Image.fromarray((rgb * 255).astype(np.uint8), 'RGB').save(os.path.join(TEX, f'{nome}.jpg'), quality=88)


couro('couro', 512, 9)
y, x = np.mgrid[0:256, 0:256].astype(np.float32)
fio = 0.7 + 0.3 * np.sin((x + y * 2) * 2 * np.pi / 16)
Image.fromarray((np.dstack([fio, fio * 0.95, fio * 0.85]) * 255).astype(np.uint8), 'RGB').save(os.path.join(TEX, 'corda.jpg'), quality=88)
print('Tecidos prontos')


# barba: fios curtos em tons de cinza com transparência (o jogo tinge com a cor do cabelo)
rng = np.random.default_rng(12)
S = 512
cor = np.zeros((S, S)); alfa = np.zeros((S, S))
img = Image.new('L', (S, S), 0); al = Image.new('L', (S, S), 0)
from PIL import ImageDraw
d1, d2 = ImageDraw.Draw(img), ImageDraw.Draw(al)
for _ in range(9000):
    x, y = rng.random() * S, rng.random() * S
    L = 6 + rng.random() * 12
    ang = np.pi / 2 + (rng.random() - 0.5) * 0.6
    x2, y2 = x + np.cos(ang) * L, y + np.sin(ang) * L
    tom = int(110 + rng.random() * 120)
    d1.line([(x, y), (x2, y2)], fill=tom, width=2)
    d2.line([(x, y), (x2, y2)], fill=int(170 + rng.random() * 85), width=2)
base = Image.fromarray((np.full((S, S), 0.55) * 255).astype(np.uint8))
g = Image.composite(img, base, al)
a = np.asarray(al).astype(np.float32) / 255
a = np.clip(a * 0.85 + 0.35, 0, 1)
Image.merge('RGBA', (g, g, g, Image.fromarray((a * 255).astype(np.uint8)))).save(os.path.join(TEX, 'barba.png'), optimize=True)

# madeira
y, x = np.mgrid[0:512, 0:128].astype(np.float32)
veio = 0.75 + 0.15 * np.sin(x * 0.35 + 3 * ruido(512, 32, 4)[:, :128] * 6) + 0.1 * ruido(512, 4, 6)[:, :128]
Image.fromarray((np.dstack([veio * 0.62, veio * 0.43, veio * 0.25]) * 255).astype(np.uint8), 'RGB').resize((128, 512)).save(os.path.join(TEX, 'madeira.jpg'), quality=88)
print('Barba e madeira prontas')
