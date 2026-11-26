# Licenças dos modelos 3D do personagem

## Personagens modulares da reformulação visual (25 e 26/11/2026): `heroi-masculino.glb`, `heroi-feminino.glb` e as variantes `-leve`

Desde a entrega 1 da reformulação visual (personagens), os dois arquivos são os modelos MODULARES, do mesmo estilo e com a mesma estrutura, construídos pelos scripts de `tools/personagem/modular/` (Blender 4.0, sem interface). Eles substituem o herói estilizado de peça única (v0.8) e a estrutura feminina MakeHuman (v0.7).

| Recurso | Origem, ferramenta e data | Licença |
| --- | --- | --- |
| Corpos-base (malha, textura pintada, esqueleto, pesos e animações) | Os corpos-base de `tools/personagem/estilizado/corpos-base/` (imagens do Canva enviadas pelo dono do projeto em 13/11/2026; malhas do TRELLIS.2 em 14/11/2026; esqueleto e animações pelos scripts do projeto). Ver a seção "Corpos base do editor modular" abaixo | Uso permitido pelos termos do Canva (conteúdo gerado pelo usuário), autorizado pelo dono do projeto; TRELLIS.2: **MIT**; scripts: mesma licença do projeto |
| Rosto repintado (olhos, íris, brilhos, cílios, pálpebras, lábios, bochechas) | Pintado por código sobre a textura do corpo-base (`modular/pintar.py`), em 25/11/2026 | Mesma licença do projeto |
| Limpeza e redução da malha (faces internas removidas, orientação das faces corrigida, 11,7 mil e 24,7 mil triângulos visíveis) | `modular/refazer.py`, em 25/11/2026 | Mesma licença do projeto |
| 7 cabelos esculpidos, 2 barbas, sobrancelhas (normal e marcante), sardas e suas texturas em tons de cinza | Gerados por código (`modular/pecas.py`): mechas em tubos fundidos por voxels sobre a casca do couro cabeludo; texturas de fios calculadas pela direção das mechas. 25/11/2026 | Mesma licença do projeto |
| Expressões (Piscar, Sorriso, Surpresa, Alegria) no corpo, nas sobrancelhas, nas sardas e na barba | `modular/pecas.py`, a partir das medidas do rosto (`modular/rosto-*.json`), 25/11/2026 | Mesma licença do projeto |
| Roupas, calçados, mantos, capuz, lenço, bolsa, odre, colar e acessórios de mão | Funções de `tools/personagem/vestes.py` (simulação de tecido e peças rígidas presas aos ossos), aplicadas aos corpos novos em 25/11/2026 | Mesma licença do projeto |
| Texturas de tecido (linho, lã, couro, corda, madeira) | Geradas pelo projeto (`tools/personagem/preparar_texturas.py`) | Mesma licença do projeto |
| Túnica refeita (parte de cima com mangas, saia longa e saia curta) e textura de linho uniforme `linho-tunica.jpg` | Construídas e geradas por código (`modular/tunica.py`), rodada de refinamento, 26/11/2026 | Mesma licença do projeto |
| Limpeza da malha e da pele (furos fechados, manchas escuras da textura limpas, normais invertidas corrigidas), barba cheia, sobrancelhas marcantes, expressões e cabelos médio e longo refeitos | `modular/pecas.py`, rodada de refinamento, 26/11/2026 | Mesma licença do projeto |
| Variantes do modo gráfico leve `heroi-masculino-leve.glb` e `heroi-feminino-leve.glb` | Mesmas fontes e peças, com cabelos, roupas e acessórios reduzidos à metade dos triângulos e texturas (menos a pele) à metade da resolução (`modular/pecas.py`), 26/11/2026 | Mesma licença do projeto |

Nenhum recurso de terceiros além dos listados acima foi usado. Nenhuma imagem de jogo comercial foi usada como recurso.

## Corpos base do editor modular (v0.13.1): `tools/personagem/estilizado/corpos-base/`

Ainda não usados no jogo: são a base do editor de personagens por peças (`docs/planos/EDITOR-3D-PLANO.md`).

| Recurso | Origem, ferramenta e data | Licença |
| --- | --- | --- |
| Imagens de referência `corpo-feminino.png` e `corpo-masculino.png` | Geradas por IA no Canva (gerador de imagens), na conta do dono do projeto, em 13/11/2026 | Uso permitido pelos termos do Canva para conteúdo gerado pelo usuário; autorizado pelo dono do projeto |
| Malhas 3D e texturas `corpo-feminino.glb` e `corpo-masculino.glb` | Geradas a partir das imagens com o TRELLIS.2 (Microsoft), pela demonstração gratuita do Hugging Face (`microsoft/TRELLIS.2`), semente 1, em 14/11/2026 | Código e pesos do TRELLIS.2: **MIT**. O resultado foi gerado pelo projeto |
| Esqueleto, pesos e animações (`corpo-*-rig.glb`) | Criados para o Bible Quest pelos scripts de `tools/personagem/estilizado/` (Blender), em 14/11/2026 | Mesma licença do projeto |

## Herói masculino estilizado (v0.8): `heroi-masculino.glb`

| Recurso | Origem, ferramenta e data | Licença |
| --- | --- | --- |
| Imagem de referência do personagem | Gerada por IA no Canva (gerador de imagens), na conta do dono do projeto, em 13/11/2026 | Uso permitido pelos termos do Canva para conteúdo gerado pelo usuário; autorizado pelo dono do projeto |
| Malha 3D e textura pintada | Geradas a partir da imagem com o TRELLIS.2 (Microsoft), pela demonstração gratuita do Hugging Face (`microsoft/TRELLIS.2`), em 13/11/2026 | Código e pesos do TRELLIS.2: **MIT**. O resultado foi gerado pelo projeto |
| Esqueleto, pesos, regiões de cor, expressões, animações e acessórios | Criados para o Bible Quest pelos scripts de `tools/personagem/estilizado/` e `tools/personagem/` (Blender), em 13/11/2026 | Mesma licença do projeto |

## Estrutura feminina (v0.7): `heroi-feminino.glb`

Os arquivos `heroi-feminino.glb` e `pele-*.webp` (e o `heroi-masculino.glb` da v0.7) foram gerados pelo pipeline de `tools/personagem/`, a partir destes recursos:

| Recurso | Origem | Licença |
| --- | --- | --- |
| Malha base humana hm08, targets de forma, esqueleto "default" (163 ossos) e pesos, unidades de pose facial | github.com/makehumancommunity/makehuman (pasta `makehuman/data`) | **CC0 1.0**, conforme o `LICENSE.md` do repositório (seção C: os assets foram liberados como CC0) e o cabeçalho de cada arquivo |
| Cabelos (short02, short04, long01, bob01, afro01, ponytail01, braid01), sobrancelhas, cílios, olhos, dentes, língua e texturas de pele | Pacote "makehuman_system_assets" (files.makehumancommunity.org/asset_packs) | **CC0 1.0** (catálogo `packs/makehuman_system_assets.json` e cabeçalho de cada arquivo) |
| Roupas de época, acessórios, simulação de tecido, animações, expressões e texturas de tecido | Criados para o Bible Quest (scripts em `tools/personagem/`) | Mesma licença do projeto |

O CC0 permite usar, modificar e redistribuir, inclusive comercialmente, sem atribuição obrigatória. O crédito ao projeto MakeHuman é feito por cortesia.

Nenhum código do MakeHuman (licença AGPL) foi usado: os leitores de formato (`tools/personagem/mh.py`) foram escritos do zero e só processam os arquivos de dados.
