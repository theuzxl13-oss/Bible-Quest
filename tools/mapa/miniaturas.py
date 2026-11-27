#!/usr/bin/env python3
"""
Miniaturas das regiões pintadas do mapa (carregamento sob demanda).

Cada região mostra uma miniatura de ~1,5 a 2 KB enquanto a pintura definitiva não está
pronta (ou quando a região está longe da tela e a pintura foi liberada). A miniatura é
derivada da pintura ALTA aprovada, sem nenhuma alteração da pintura: só redução para
54 × 113 px (LANCZOS) e WebP com qualidade 55.

Saída: src/data/mapas/miniaturas.ts (dados embutidos, para a miniatura nunca depender de
um arquivo a mais nem aparecer depois do primeiro quadro).

Uso: python3 tools/mapa/miniaturas.py
"""
import base64
import hashlib
import io
import pathlib

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
REGIOES = [('MINIATURA_EDEN', 'eden'), ('MINIATURA_DILUVIO', 'diluvio')]
LARGURA, ALTURA, QUALIDADE = 54, 113, 55

linhas = [
    '/*',
    ' * MINIATURAS DAS REGIÕES PINTADAS (gerado por tools/mapa/miniaturas.py; não editar à mão).',
    f' * Cada uma é a pintura alta aprovada reduzida para {LARGURA} × {ALTURA} px, WebP qualidade {QUALIDADE}.',
    ' * Servem de fundo provisório enquanto a pintura definitiva não está pronta.',
    ' */',
    '',
]
for nome, arq in REGIOES:
    fonte = RAIZ / 'public' / 'mapas' / 'genesis' / f'{arq}.webp'
    dados = fonte.read_bytes()
    im = Image.open(io.BytesIO(dados)).convert('RGB').resize((LARGURA, ALTURA), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=QUALIDADE, method=6)
    mini = b.getvalue()
    linhas.append(f'/** {arq}.webp (sha256 {hashlib.sha256(dados).hexdigest()[:16]}…) → {len(mini)} bytes */')
    linhas.append(f"export const {nome} = 'data:image/webp;base64,{base64.b64encode(mini).decode()}'")
    linhas.append('')
    print(f'{arq}: {len(mini)} bytes')

(RAIZ / 'src' / 'data' / 'mapas' / 'miniaturas.ts').write_text('\n'.join(linhas))
