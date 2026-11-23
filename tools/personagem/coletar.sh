#!/usr/bin/env bash
# Baixa os recursos CC0 do MakeHuman usados para construir o personagem 3D.
# Fontes (todas CC0 1.0, conforme LICENSE.md do repositório MakeHuman e o
# cabeçalho de cada arquivo):
#  - github.com/makehumancommunity/makehuman (pasta makehuman/data):
#    malha base hm08, targets, esqueleto default e pesos, unidades de pose facial
#  - files.makehumancommunity.org/asset_packs/makehuman_system_assets:
#    cabelos, sobrancelhas, cílios, olhos, dentes e texturas de pele
set -euo pipefail
cd "$(dirname "$0")"
F=fonte
mkdir -p "$F/tg" "$F/rig" "$F/pose"
R=https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data
get() { [ -s "$2" ] || curl -fsSL -m 300 -o "$2" "$1"; }

get "$R/3dobjs/base.obj" "$F/base.obj"
get "$R/rigs/default.mhskel" "$F/rig/default.mhskel"
get "$R/rigs/default_weights.mhw" "$F/rig/default_weights.mhw"
get "$R/poseunits/face-poseunits.bvh" "$F/pose/face-poseunits.bvh"
get "$R/poseunits/face-poseunits.json" "$F/pose/face-poseunits.json"
for r in caucasian african asian; do for g in male female; do
  get "$R/targets/macrodetails/$r-$g-young.target" "$F/tg/$r-$g-young.target"
done; done
for g in male female; do
  get "$R/targets/macrodetails/universal-$g-young-maxmuscle-averageweight.target" "$F/tg/universal-$g-young-maxmuscle-averageweight.target"
  get "$R/targets/macrodetails/universal-$g-young-averagemuscle-minweight.target" "$F/tg/universal-$g-young-averagemuscle-minweight.target"
  get "$R/targets/macrodetails/proportions/$g-young-averagemuscle-averageweight-idealproportions.target" "$F/tg/$g-young-averagemuscle-averageweight-idealproportions.target"
done

ZIP="$F/makehuman_system_assets_cc0.zip"
get https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip "$ZIP"
python3 - "$ZIP" "$F/sys" <<'EOF'
import sys, zipfile
z = zipfile.ZipFile(sys.argv[1])
keep = ('hair/', 'eyebrows/', 'eyelashes/eyelashes01', 'eyelashes/eyelashes02', 'eyes/high-poly', 'eyes/materials', 'skins/young_', 'teeth/teeth_base', 'tongue/', 'packs/')
for i in z.infolist():
    if i.filename.startswith(keep) and not i.is_dir():
        z.extract(i, sys.argv[2])
EOF
echo "Recursos prontos em $(pwd)/$F"
