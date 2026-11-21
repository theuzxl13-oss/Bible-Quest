#!/usr/bin/env bash
# Reconstrói os dois personagens e comprime para a web.
set -euo pipefail
cd "$(dirname "$0")"
DEST=../../public/models/personagem
mkdir -p saida "$DEST"
python3 preparar_texturas.py >/dev/null
for corpo in masculino feminino; do
  blender -b -P construir.py -- --corpo "$corpo" --saida "saida/heroi-$corpo-bruto.glb" 2>&1 | grep -E "GLB|Error|Traceback" || true
  npx -y gltfpack@0.25.0 -i "saida/heroi-$corpo-bruto.glb" -o "$DEST/heroi-$corpo.glb" -cc -kn -km -ke -vp 14 -vt 12
  ls -la "$DEST/heroi-$corpo.glb"
done
