# Emulador Android 16 (sistema user, desenho por software): 15 abertura(s) do aplicativo

| Cenário | onCreate | Página iniciada | Boas-vindas visível | Central visível | Cena 3D pronta | Bloqueios ≥ 0,5 s (qtd · maior · soma) | ANR | Toques (qtd · maior duração · maior atraso) | Retornos do 2º plano |
|---|---|---|---|---|---|---|---|---|---|
| 1-animacoes-desligadas-normal | 1,4 s | 2,6 s | — | 20,0 s | 27,4 s | 9 · 10,0 s · 17,8 s | 0 | 5 · 1232 ms · 1149 ms | 0 |
| 1-animacoes-desligadas-normal-conexao-aos-70s | 1,6 s | 3,3 s | — | 4,1 s | 24,5 s | 5 · 2,5 s · 7,3 s | 0 | 6 · 1344 ms · 979 ms | 0 |
| 1-animacoes-desligadas-normal-conexao-aos-5s | 0,7 s | 1,4 s | — | 2,0 s | 31,8 s | 12 · 6,2 s · 15,3 s | 0 | 6 · 904 ms · 480 ms | 0 |
| 1-animacoes-desligadas-aviao | 0,5 s | 0,9 s | — | 10,9 s | 14,9 s | 5 · 6,4 s · 9,6 s | 0 | 6 · 784 ms · 377 ms | 0 |
| 1-animacoes-desligadas-segundo-plano | 0,7 s | 1,1 s | — | 12,3 s | 19,5 s | 6 · 6,3 s · 12,2 s | 0 | 6 · 664 ms · 404 ms | 1 |
| 2-animacoes-ligadas-normal | 0,9 s | 1,3 s | — | 1,4 s | 24,0 s | 7 · 6,2 s · 10,0 s | 0 | 6 · 912 ms · 522 ms | 0 |
| 2-animacoes-ligadas-normal-conexao-aos-70s | 1,0 s | 1,2 s | — | 20,4 s | 25,7 s | 8 · 9,1 s · 13,1 s | **1** | 6 · 896 ms · 491 ms | 0 |
| 2-animacoes-ligadas-normal-conexao-aos-5s | 0,9 s | 1,2 s | — | 1,3 s | 23,1 s | 5 · 5,6 s · 8,1 s | 0 | 6 · 784 ms · 247 ms | 0 |
| 2-animacoes-ligadas-aviao | 1,2 s | 1,4 s | — | 17,6 s | 23,7 s | 5 · 6,6 s · 9,5 s | 0 | 6 · 640 ms · 285 ms | 0 |
| 2-animacoes-ligadas-segundo-plano | 0,8 s | 1,1 s | — | 1,2 s | 24,5 s | 7 · 6,0 s · 10,5 s | 0 | 6 · 880 ms · 374 ms | 1 |
| 3-animacoes-desligadas-normal | 0,4 s | 0,7 s | — | 0,8 s | 13,9 s | 3 · 5,5 s · 7,2 s | **1** | nenhum | 0 |
| 3-animacoes-desligadas-normal-conexao-aos-70s | 0,4 s | 0,7 s | — | 9,3 s | 12,6 s | 5 · 5,2 s · 8,1 s | **1** | nenhum | 0 |
| 3-animacoes-desligadas-normal-conexao-aos-5s | 0,4 s | 0,6 s | — | 0,8 s | 16,5 s | 7 · 5,6 s · 10,9 s | **1** | nenhum | 0 |
| 3-animacoes-desligadas-aviao | 0,4 s | 0,7 s | — | 0,8 s | 16,2 s | 5 · 6,4 s · 9,9 s | **1** | 6 · 872 ms · 348 ms | 0 |
| 3-animacoes-desligadas-segundo-plano | 0,5 s | 0,8 s | — | 1,0 s | 13,9 s | 5 · 5,9 s · 9,0 s | **1** | 6 · 736 ms · 394 ms | 1 |

Tempos medidos desde o início do processo do aplicativo (relógio do aparelho).
Bloqueio: a thread principal do Android ficou sem responder (vigia do build de diagnóstico).
Toque: duração = do toque até o quadro seguinte desenhado; atraso = do toque até o jogo começar a tratar.
