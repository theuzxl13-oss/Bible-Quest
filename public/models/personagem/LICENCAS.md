# Licenças dos modelos 3D do personagem

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
