# Transição 5→6: o Éden dentro da cena da região 2

Referência: `tools/mapa/referencias/eden-cena.json` (Éden aprovado). Cena nova: impressão de `diluvio.py`.

Objetos do Éden presentes na cena nova: 1178 de 1178; materiais do Éden presentes: 41 de 41; malhas do Éden presentes: 168 de 168.

| Grupo | Categoria | Quantidade |
|---|---|---|
| cameras | Diferença numérica relevante | 1 |
| colecoes | Diferença numérica relevante | 1 |
| malha do terreno (estendida) | Diferença estrutural | 5 |
| malha do terreno (estendida) | Diferença numérica relevante | 3 |
| malhas novas | Diferença estrutural | 176 |
| materiais novos | Diferença estrutural | 20 |
| objetos do Éden | Diferença numérica relevante | 2 |
| objetos novos da região 2 | Diferença estrutural | 764 |
| render | Diferença numérica relevante | 1 |
| render | Diferença de valor | 1 |

## Exemplos por grupo

**cameras, diferença numérica relevante:**

- `/cameras/cam/ortho_scale`: 39.3037223815918 → 40.13960266113281

**colecoes, diferença numérica relevante:**

- `/colecoes/biblioteca/objetos`: 50 → 130

**malha do terreno (estendida), diferença estrutural:**

- `/malhas/terreno/vertices`: (71680, 3) → (146240, 3)
- `/malhas/terreno/faces`: (355365,) → (725835,)
- `/malhas/terreno/material_das_faces`: (71073,) → (145167,)
- `/malhas/terreno/suavizacao`: (71073,) → (145167,)

**malha do terreno (estendida), diferença numérica relevante:**

- `/malhas/terreno/arestas`: 142752 → 291406
- `/malhas/terreno/faces`: 71073 → 145167
- `/malhas/terreno/vertices`: 71680 → 146240

**malhas novas, diferença estrutural:**

- `/malhas/Circle.001`: ausente → criado
- `/malhas/Circle.002`: ausente → criado
- `/malhas/Circle.003`: ausente → criado
- `/malhas/Circle.004`: ausente → criado

**materiais novos, diferença estrutural:**

- `/materiais/AguaDiluvio`: ausente → criado
- `/materiais/ArcoIris`: ausente → criado
- `/materiais/Barro`: ausente → criado
- `/materiais/Barro2`: ausente → criado

**objetos do Éden, diferença numérica relevante:**

- `/objetos/cam/posicao[1]`: -17.28064727783203 → 6.659831523895264
- `/objetos/cam/posicao[2]`: 37.739688873291016 → 68.3821029663086

**objetos novos da região 2, diferença estrutural:**

- `/objetos/Circle.001`: ausente → criado
- `/objetos/Circle.002`: ausente → criado
- `/objetos/Circle.003`: ausente → criado
- `/objetos/Circle.004`: ausente → criado

**render, diferença numérica relevante:**

- `/render/render/resolution_y`: 2257 → 2305

**render, diferença de valor:**

- `/render/arquivo_saida`: eden.png → diluvio_completo.png

