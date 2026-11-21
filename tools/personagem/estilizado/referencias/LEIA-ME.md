# Referências dos personagens estilizados

Recortes da folha de personagens enviada pelo dono do projeto em 13/11/2026 (imagem gerada por IA, autorizada por ele para uso no projeto). Uma figura por base do jogo, centralizada em fundo branco, 1024 × 1024.

| Arquivo | Base | Situação |
| --- | --- | --- |
| `viajante.png` | Viajante | já publicado (modelo da referência aprovada antes) |
| `pastora.png` | Pastora | na fila |
| `escriba.png` | Escriba | na fila |
| `exploradora.png` | Exploradora | na fila |
| `mensageiro.png` | Mensageiro | na fila |
| `guardia.png` | Guardiã da lâmpada | na fila |
| `peregrino.png` | Peregrino | na fila |
| `contadora.png` | Contadora de histórias | na fila |

## Versões em pose neutra (usadas para o 3D)

Objetos seguros na mão ficariam grudados ao corpo no modelo 3D e atrapalhariam as animações. Por decisão do dono do projeto (13/11/2026), cada personagem foi refeito no Canva (gerador de imagens, com o desenho original como referência), igual ao desenho mas de braços um pouco abertos e mãos vazias. Cajado, pergaminho e lamparina continuam no jogo como acessórios separados.

| Arquivo | Personagem | Observação |
| --- | --- | --- |
| `pastora-neutra.png` | Pastora | |
| `exploradora-neutra.png` | Exploradora | o gerador tirou a bolsa |
| `mensageiro-neutra.png` | Mensageiro | da miniatura do Canva (resolução menor) |
| `guardia-neutra.png` | Guardiã da lâmpada | |
| `peregrino-neutra.png` | Peregrino | |
| `contadora-neutra.png` | Contadora de histórias | |
| — | Escriba | o filtro automático do Canva bloqueou 4 tentativas; aguardando decisão |

Cada modelo é gerado com `../gerar3d.py` (TRELLIS.2, gratuito). A cota gratuita diária do Hugging Face permite cerca de um modelo por dia.

## Corpos base (editor modular)

| Arquivo | Corpo | Situação |
| --- | --- | --- |
| `corpo-feminino.png` | Feminino | enviado pelo dono do projeto em 13/11/2026 (gerado no Canva); 3D gerado em 14/11/2026 → `../corpos-base/` |
| `corpo-masculino.png` | Masculino | enviado pelo dono do projeto em 13/11/2026 (gerado no Canva); 3D gerado em 14/11/2026 → `../corpos-base/` |

## Penteados e véu do editor modular (pasta `cabelos/`)

Gerados por IA no Canva (gerador de imagens) em 14/11/2026, a partir das imagens dos corpos base, mesmo rosto e mesmo estilo. Baixados e enviados pelo dono do projeto (550 × 550, ampliados para 1024 × 1024 com fundo branco). Uso autorizado por ele. Cada um vira peça 3D com `../gerar3d.py`; o cabelo é separado da cabeça e encaixado no corpo base.

| Arquivo | Peça | Situação |
| --- | --- | --- |
| `f-longo-ondulado.png` | Cabelo longo ondulado (feminino) | na fila do 3D |
| `f-tranca.png` | Trança (feminino) | na fila do 3D |
| `f-cacheado.png` | Cacheado volumoso (feminino) | na fila do 3D |
| `f-veu.png` | Véu (feminino) | na fila do 3D |
| `m-cacheado.png` | Cacheado (masculino) | na fila do 3D |
| — | Cabelo médio com barba (masculino) | imagem recebida no chat, mas não chegou como arquivo; aguardando reenvio |
