# Conferência de cena: eden-a.json × eden-mudancas.json

**Veredito: DIFERENTES**

Scripts: `eden.py` × `eden.py` (Blender 4.0.2).

Tolerância numérica: 1e-05 (relativa, para valores acima de 1). Vértices e cores comparados um a um: sim.

| | Objetos | Malhas | Materiais | Câmeras | Luzes |
|---|---|---|---|---|---|
| Referência | 1178 | 168 | 41 | 1 | 2 |
| Nova | 1177 | 168 | 41 | 1 | 2 |

| Categoria | Quantidade |
|---|---|
| Diferença estrutural | 2 |
| Diferença de valor | 1 |
| Diferença numérica relevante | 5 |
| Variação numérica pequena (dentro da tolerância) | 0 |

| Seção | Estrutural | Valor | Numérica relevante | Pequena |
|---|---|---|---|---|
| compositor | 1 | 0 | 0 | 0 |
| luzes | 0 | 0 | 1 | 0 |
| malhas | 0 | 0 | 1 | 0 |
| materiais | 0 | 0 | 1 | 0 |
| objetos | 1 | 0 | 2 | 0 |
| render | 0 | 1 | 0 | 0 |

## Diferença estrutural (2)

| Onde | Referência | Nova | Δ |
|---|---|---|---|
| `/objetos/ovelha` | existia | removido |  |
| `/compositor/nos/ligacoes` | Mix.Image -> Hue/Saturation/Value.Image | removida |  |

## Diferença de valor (1)

| Onde | Referência | Nova | Δ |
|---|---|---|---|
| `/render/cycles/use_denoising` | False | True |  |

## Diferença numérica relevante (5)

| Onde | Referência | Nova | Δ |
|---|---|---|---|
| `/objetos/arvore_vida_i/posicao[0]` | 5.9000001 | 6.4000001 | +0.5 |
| `/objetos/cam/rotacao[0]` | 0.907571197 | 0.916297853 | +0.00873 |
| `/materiais/Copa1/nos/nos/Principled BSDF/entradas/0:Base Color[0]` | 0.0759261176 | 0.125926122 | +0.05 |
| `/luzes/sol/props/energy` | 4.19999981 | 4.5999999 | +0.4 |
| `/malhas/terreno/vertices` | 1 vértices mudaram | máx. 0.05 |  |
