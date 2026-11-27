# Licenças dos cenários pintados do mapa

| Arquivo | Origem | Ferramenta | Data | Licença |
|---|---|---|---|---|
| `genesis/eden.webp` (1080 × 2257, qualidade alta) | Cena 3D procedural criada do zero por código próprio do projeto (`tools/mapa/eden.py`): relevo, água, vegetação, marcos e acabamento de pintura (filtro Kuwahara e contornos no compositor). Nenhuma textura, modelo ou imagem de terceiros. | Blender 4.0 (Cycles), Pillow (conversão para WebP) | 27/11/2026 | Do projeto Bible Quest (mesma licença do código) |
| `genesis/eden-leve.webp` (648 × 1354, qualidade leve e 2D) | Redução da imagem acima | Pillow | 27/11/2026 | Do projeto Bible Quest |

Para regerar:

```bash
blender -b -P tools/mapa/eden.py -- <pasta> 1080 96
```

O script grava `eden.png` e `eden.json` (pontos das fases e do baú em frações da imagem). Os pontos
vão para `src/data/mapas/artes.ts`.

Conteúdo bíblico representado (sem texto e sem falas): rios do jardim (Gn 2.10), árvore da vida e
árvore do conhecimento (Gn 2.9), o portão a leste com a espada flamejante (Gn 3.24), o campo de
Caim e o rebanho de Abel com os dois altares (Gn 4.2–4).
