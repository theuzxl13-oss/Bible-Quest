# Licenças dos modelos 3D do personagem

Os arquivos `heroi-masculino.glb`, `heroi-feminino.glb` e `pele-*.webp` foram gerados pelo pipeline de `tools/personagem/`, a partir destes recursos:

| Recurso | Origem | Licença |
| --- | --- | --- |
| Malha base humana hm08, targets de forma, esqueleto "default" (163 ossos) e pesos, unidades de pose facial | github.com/makehumancommunity/makehuman (pasta `makehuman/data`) | **CC0 1.0**, conforme o `LICENSE.md` do repositório (seção C: os assets foram liberados como CC0) e o cabeçalho de cada arquivo |
| Cabelos (short02, short04, long01, bob01, afro01, ponytail01, braid01), sobrancelhas, cílios, olhos, dentes, língua e texturas de pele | Pacote "makehuman_system_assets" (files.makehumancommunity.org/asset_packs) | **CC0 1.0** (catálogo `packs/makehuman_system_assets.json` e cabeçalho de cada arquivo) |
| Roupas de época, acessórios, simulação de tecido, animações, expressões e texturas de tecido | Criados para o Bible Quest (scripts em `tools/personagem/`) | Mesma licença do projeto |

O CC0 permite usar, modificar e redistribuir, inclusive comercialmente, sem atribuição obrigatória. O crédito ao projeto MakeHuman é feito por cortesia.

Nenhum código do MakeHuman (licença AGPL) foi usado: os leitores de formato (`tools/personagem/mh.py`) foram escritos do zero e só processam os arquivos de dados.
