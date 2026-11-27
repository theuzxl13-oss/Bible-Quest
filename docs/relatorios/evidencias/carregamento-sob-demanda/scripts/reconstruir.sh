#!/bin/bash
# Reconstrói a versão Android atual (depois) e a variante de teste com 4 regiões (só na cópia temporária).
set -e
S=/tmp/claude-0/-home-user-Bible-Quest/d34eff35-e9d6-51dc-a3ec-8ed5e55e0bd0/scratchpad/memoria
cd /home/user/Bible-Quest && npx vite build --mode android --outDir $S/dist-depois --emptyOutDir > /dev/null
rm -rf $S/wt4/src && cp -r src $S/wt4/ && cd $S/wt4 && python3 - <<'PY'
p='src/data/mapas/artes.ts'; s=open(p).read()
s=s.replace("""export const ARTES_DO_MUNDO: Record<string, ArteRegiao[]> = {
  'mundo-genesis': [ARTE_EDEN, ARTE_DILUVIO],
}""","""// VARIANTE DE TESTE (só na cópia temporária): regiões 3 e 4 simuladas com cópias das pinturas
const copia = (a: ArteRegiao, n: number): ArteRegiao => ({ ...a, id: `sim${n}`, alta: `${a.alta}?regiao=${n}`, leve: `${a.leve}?regiao=${n}` })
export const ARTES_DO_MUNDO: Record<string, ArteRegiao[]> = {
  'mundo-genesis': [ARTE_EDEN, ARTE_DILUVIO, copia(ARTE_EDEN, 3), copia(ARTE_DILUVIO, 4)],
}""")
assert 'sim' in s
open(p,'w').write(s)
PY
npx vite build --mode android --outDir $S/dist-4reg --emptyOutDir > /dev/null
echo reconstruido
