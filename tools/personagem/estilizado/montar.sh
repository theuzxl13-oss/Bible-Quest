#!/usr/bin/env bash
# Personagem estilizado: malha do TRELLIS.2 -> esqueleto, regiões, expressões e acessórios -> GLB comprimido.
# Uso: estilizado/montar.sh <corpo> <malha_trellis.glb>   (ex.: masculino saida/heroi-m-s7.glb)
set -euo pipefail
cd "$(dirname "$0")/.."
corpo=$1
malha=$2
j=estilizado/juntas-${corpo:0:1}.json
DEST=../../public/models/personagem
blender -b -P estilizado/preparar.py -- "$malha" "saida/estilizado-$corpo.blend" 1.70 40000 2>&1 | grep -E "^faces|Error" || true
blender -b -P estilizado/rigar.py -- "saida/estilizado-$corpo.blend" "$j" "saida/estilizado-$corpo-rig.blend" 2>&1 | grep -E "salvo|Error" || true
blender -b -P estilizado/acabar.py -- "saida/estilizado-$corpo-rig.blend" "$j" "saida/heroi-$corpo-estilizado-bruto.glb" 2>&1 | grep -E "faces|GLB|Error" || true
npx -y gltfpack@0.25.0 -i "saida/heroi-$corpo-estilizado-bruto.glb" -o "$DEST/heroi-$corpo.glb" -cc -kn -km -ke -vp 14 -vt 12
ls -la "$DEST/heroi-$corpo.glb"
