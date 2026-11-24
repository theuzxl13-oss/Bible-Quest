# Emulador Android 16 (sistema user, desenho por software): 16 abertura(s) do aplicativo

| Cenário | onCreate | Página iniciada | Boas-vindas visível | Central visível | Cena 3D pronta | Bloqueios ≥ 0,5 s (qtd · maior · soma) | ANR | Toques (qtd · maior duração · maior atraso) | Retornos do 2º plano |
|---|---|---|---|---|---|---|---|---|---|
| 1-animacoes-desligadas-normal | 1,4 s | 2,5 s | — | 3,0 s | 19,3 s | 4 · 6,5 s · 9,8 s | 0 | 6 · 688 ms · 417 ms | 0 |
| 1-animacoes-desligadas-normal-conexao-aos-70s | 0,6 s | 1,6 s | — | 1,8 s | 12,6 s | 3 · 4,9 s · 6,5 s | 0 | 6 · 544 ms · 439 ms | 0 |
| 1-animacoes-desligadas-normal-conexao-aos-5s | 0,4 s | 0,7 s | — | 0,8 s | 12,7 s | 5 · 4,6 s · 7,5 s | 0 | 6 · 688 ms · 263 ms | 0 |
| 1-animacoes-desligadas-aviao | 0,4 s | 0,8 s | — | 1,1 s | 12,0 s | 4 · 5,0 s · 7,1 s | 0 | 6 · 712 ms · 328 ms | 0 |
| 1-animacoes-desligadas-segundo-plano | 0,5 s | 0,9 s | — | 1,0 s | 11,4 s | 6 · 4,5 s · 8,1 s | 0 | 6 · 648 ms · 242 ms | 1 |
| 2-animacoes-ligadas-normal | 0,9 s | 1,1 s | — | 14,7 s | 19,8 s | 4 · 5,4 s · 7,6 s | 0 | 6 · 736 ms · 309 ms | 0 |
| 2-animacoes-ligadas-normal-conexao-aos-70s | 0,8 s | 1,1 s | — | 1,3 s | 28,2 s | 4 · 5,6 s · 7,4 s | **1** | nenhum | 0 |
| 2-animacoes-ligadas-normal-conexao-aos-5s | 0,9 s | 1,2 s | — | 1,3 s | 18,8 s | 3 · 5,4 s · 6,6 s | 0 | 6 · 824 ms · 324 ms | 0 |
| 2-animacoes-ligadas-aviao | 0,7 s | 1,0 s | — | 14,4 s | 19,2 s | 4 · 5,0 s · 7,1 s | 0 | 6 · 632 ms · 235 ms | 0 |
| 2-animacoes-ligadas-segundo-plano | 2,0 s | 2,9 s | — | 21,0 s | 27,4 s | 8 · 3,7 s · 9,4 s | 0 | 6 · 704 ms · 365 ms | 1 |
| 3-animacoes-desligadas-normal | 1,0 s | 1,5 s | — | 1,7 s | 12,9 s | 4 · 5,1 s · 7,6 s | 0 | 6 · 992 ms · 583 ms | 0 |
| 3-animacoes-desligadas-normal-conexao-aos-70s | 0,5 s | 1,0 s | — | 1,5 s | 17,1 s | 5 · 4,8 s · 9,1 s | 0 | 5 · 1064 ms · 841 ms | 0 |
| 3-animacoes-desligadas-normal-conexao-aos-5s | 0,5 s | 1,0 s | — | 1,6 s | 24,3 s | 4 · 5,2 s · 7,2 s | 0 | 6 · 688 ms · 321 ms | 0 |
| 3-animacoes-desligadas-aviao | 0,5 s | 0,8 s | — | 1,0 s | 11,3 s | 3 · 4,5 s · 6,0 s | 0 | 6 · 432 ms · 127 ms | 0 |
| 3-animacoes-desligadas-segundo-plano | 0,6 s | 1,2 s | — | 1,4 s | 14,8 s | 2 · 5,6 s · 6,6 s | **1** | nenhum | 0 |
| abertura 16 | 0,5 s | 0,9 s | — | 8,6 s | 11,6 s | 3 · 4,6 s · 6,3 s | 0 | 6 · 552 ms · 361 ms | 0 |

Tempos medidos desde o início do processo do aplicativo (relógio do aparelho).
Bloqueio: a thread principal do Android ficou sem responder (vigia do build de diagnóstico).
Toque: duração = do toque até o quadro seguinte desenhado; atraso = do toque até o jogo começar a tratar.
