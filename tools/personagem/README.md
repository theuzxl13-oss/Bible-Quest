# Pipeline do personagem 3D

Esta pasta constrói os modelos `public/models/personagem/heroi-masculino.glb` e `heroi-feminino.glb` a partir de recursos **CC0**, com o Blender rodando sem interface. Tudo é reprodutível por script.

## Como reconstruir

Requisitos:

- Blender 4.0 ou superior, com numpy (no Ubuntu: `apt-get install blender python3-numpy`);
- Python 3 com Pillow;
- Node.js (o `gltfpack` é baixado pelo `npx`).

Comandos:

```bash
tools/personagem/coletar.sh
```

```bash
tools/personagem/montar.sh
```

- `coletar.sh` baixa os recursos para `tools/personagem/fonte/` (fora do Git).
- `montar.sh` prepara as texturas, constrói os dois corpos no Blender e comprime com `gltfpack`. Leva cerca de 3 minutos por corpo.

## Arquivos

| Arquivo | Função |
| --- | --- |
| `mh.py` | Leitores dos formatos de dados do MakeHuman: malha `.obj`, targets, proxies `.mhclo`, esqueleto `.mhskel`, pesos `.mhw`. Escrito do zero; nenhum código do MakeHuman (AGPL) é usado. |
| `preparar_texturas.py` | Reduz e converte as texturas. Cabelo e sobrancelhas viram tons de cinza para o jogo tingir. Gera também os tecidos procedurais: linho, lã, couro e corda. |
| `construir.py` | Monta o corpo e o esqueleto. Etapas: targets (sexo, idade, musculatura, proporções); esqueleto de 163 ossos com pesos; olhos, sobrancelhas, cílios, dentes, língua e 7 cabelos ajustados ao corpo; baixa os braços para a pose de repouso; exporta em GLB. |
| `vestes.py` | Roupas e acessórios. Túnica (parte de cima derivada da pele; saias longa e curta simuladas como tecido), mantos (padrão, longo, xale, capuz) simulados, cintos, sandálias, botas, barbas, lenço, bolsa, odre, colar e acessórios de mão presos aos ossos. |
| `animacoes.py` | Clipes Idle, Walk, Run, Victory, Greeting e Discovery. Expressões (morph targets) Piscar, Sorriso, Surpresa e Alegria, feitas com o rig facial. |
| `montar.sh` | Executa tudo e comprime: `gltfpack -cc -kn -km -ke` (meshopt). |

## Contrato do modelo (para substituir por um modelo de artista)

O jogo (`src/character3d/heroi.ts`) só depende destas convenções. Um modelo feito por um artista pode substituir o atual se seguir estas regras:

- **Peças.** Cada peça tem material próprio chamado `<tipo>__<peça>`, por exemplo `Tunica__Tunica_saia` ou `Cabelo_curto__Cabelo_curto`. As peças esperadas estão em `PECAS_DO_MODELO`. O teste `personagem.test.ts` confere todas.
- **Tipos de material** com regras próprias de cor:
  - `Pele`, `Tunica`, `Manto`, `Couro`, `Corda`, `Faixa`, `Lenco`;
  - `Cabelo_*`, `Barba` e `Sobrancelhas` (tingidos pela luminância da textura);
  - `Cilios`, `Olhos`.
- **Animações:** clipes `Idle`, `Walk`, `Run`, `Victory`, `Greeting` e `Discovery`.
- **Expressões:** morph targets `Piscar`, `Sorriso`, `Surpresa` e `Alegria` (nos nomes de `extras.targetNames`).
- **Escala:** metros, pés em y = 0, frente para +Z (padrão glTF).

## Licenças

Veja `public/models/personagem/LICENCAS.md`.
