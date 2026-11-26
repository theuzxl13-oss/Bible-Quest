#!/usr/bin/env bash
# Personagens modulares da reformulação visual (entrega 1: personagens).
# Corpo-base estilizado (../saida/corpo-<genero>-rig.blend, ver ../README.md) ->
#   pintar.py  (rosto repintado: olhos, lábios e bochechas; margem das ilhas de UV)
#   refazer.py (faces internas removidas, orientação das faces corrigida, malha reduzida)
#   pecas.py   (cabelos, barbas, sobrancelhas, sardas, túnica (tunica.py), roupas, acessórios e expressões;
#               no fim, a variante leve)
#   gltfpack   (compressão meshopt; nomes, materiais e extras preservados)
# Uso: tools/personagem/modular/montar.sh [masculino|feminino]   (sem argumento: os dois)
set -euo pipefail
cd "$(dirname "$0")"
DEST=../../../public/models/personagem
for g in ${1:-masculino feminino}; do
  blender -b -P pintar.py -- ../saida/corpo-$g-rig.blend ../estilizado/juntas-corpo-$g.json rosto-$g.json $g ../saida/modular-$g-1.blend 2>&1 | grep -E "salvo|Error" || true
  blender -b -P refazer.py -- ../saida/modular-$g-1.blend 36000 2048 ../saida/modular-$g-2.blend 2>&1 | grep -E "faces|triângulos|Error" || true
  blender -b -P pecas.py -- ../saida/modular-$g-2.blend ../estilizado/juntas-corpo-$g.json rosto-$g.json $g ../saida/modular-$g.glb 2>&1 | grep -E "cabelo|barba |roupas|GLB|Error" || true
  npx -y gltfpack@0.25.0 -i ../saida/modular-$g.glb -o "$DEST/heroi-$g.glb" -cc -kn -km -ke -vp 14 -vt 12
  # variante do modo gráfico leve (gerada no fim de pecas.py)
  npx -y gltfpack@0.25.0 -i ../saida/modular-$g-leve.glb -o "$DEST/heroi-$g-leve.glb" -cc -kn -km -ke -vp 14 -vt 12
  ls -la "$DEST/heroi-$g.glb" "$DEST/heroi-$g-leve.glb"
done
