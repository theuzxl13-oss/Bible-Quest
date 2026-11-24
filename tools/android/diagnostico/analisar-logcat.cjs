/*
 * Analisa o logcat de um teste em aparelho físico com o BUILD DE DIAGNÓSTICO.
 *
 * Uso: node tools/android/diagnostico/analisar-logcat.cjs registro.txt [nome-do-aparelho]
 *
 * O registro deve ter sido coletado com:
 *   adb logcat -v epoch BQDiag:V Capacitor/Console:V ActivityManager:V ActivityTaskManager:V *:S
 * (o roteiro em docs/relatorios/ANDROID_TESTE_APARELHOS_FISICOS.md explica).
 *
 * Cada abertura do aplicativo começa numa linha "BQDiag ... onCreate". Rótulos de cenário
 * gravados pelo testador com  adb shell log -t BQDiag "cenario: <nome>"  dão nome à abertura seguinte.
 *
 * Para cada abertura, mostra (em ms desde o início do processo do aplicativo):
 *   onCreate · página iniciada · boas-vindas visível · Central visível · cena 3D pronta
 *   bloqueios da thread principal (quantidade, maior, soma) · ANR · toques (maior duração e maior atraso)
 */
const fs = require('fs')

const [ARQ, APARELHO = 'aparelho'] = process.argv.slice(2)
if (!ARQ) {
  console.error('uso: node analisar-logcat.cjs registro.txt [nome-do-aparelho]')
  process.exit(1)
}
const linhas = fs.readFileSync(ARQ, 'utf8').split(/\r?\n/)

const epoca = (l) => {
  const m = l.match(/^\s*(\d{9,}\.\d{3})\s/)
  return m ? Math.round(parseFloat(m[1]) * 1000) : null
}
const relogio = (l) => {
  const m = l.match(/relogio=(\d{12,})/)
  return m ? Number(m[1]) : null
}

const aberturas = []
let atual = null
let rotulo = null
for (const l of linhas) {
  const cen = l.match(/BQDiag[^:]*:\s*cenario:\s*(.+)$/i)
  if (cen) {
    rotulo = cen[1].trim()
    if (atual && !atual.encerrada) atual.rotulosDepois.push(rotulo)
    continue
  }
  if (/BQDiag.*onCreate/.test(l)) {
    const ini = l.match(/inicioDoProcessoRelogio=(\d+)/)
    const desde = l.match(/desde o início do processo=(\d+)/)
    atual = {
      cenario: rotulo || `abertura ${aberturas.length + 1}`,
      inicio: ini ? Number(ini[1]) : relogio(l),
      onCreate: desde ? Number(desde[1]) : null,
      marcos: {},
      bloqueios: [],
      anr: [],
      toques: [],
      pausas: 0,
      retornos: 0,
      rotulosDepois: [],
      fimEpoca: null,
    }
    rotulo = null
    aberturas.push(atual)
    continue
  }
  if (!atual) continue
  const e = epoca(l)
  if (e) atual.fimEpoca = e
  if (/ANR in com\.kzanntech\.biblequest/.test(l)) atual.anr.push(e ? new Date(e).toISOString() : l.trim().slice(0, 40))
  const bq = l.match(/bloqueada por (\d+) ms/)
  if (bq) atual.bloqueios.push({ ms: Number(bq[1]), fim: relogio(l) })
  if (/BQDiag.*onPause/.test(l)) atual.pausas++
  if (/BQDiag.*onResume/.test(l) && atual.pausas > 0) atual.retornos++
  const js = l.match(/BQDiag\|([^|]+)\|relogio=(\d+)\|t=(\d+)\|(.*)$/)
  if (js) {
    const [, tipo, rel, , det] = js
    const r = Number(rel)
    if (['página iniciada', 'tela de boas-vindas visível', 'Central visível', 'cena pronta'].includes(tipo) && atual.marcos[tipo] === undefined) atual.marcos[tipo] = r
    if (tipo === 'toque') {
      try {
        const d = JSON.parse(det)
        atual.toques.push(d)
      } catch {
        /* ignora */
      }
    }
  }
}

const seg = (v) => `${(v / 1000).toFixed(1).replace('.', ',')} s`
const ms = (abs, ini) => (abs && ini ? seg(abs - ini) : '—')
console.log(`# ${APARELHO}: ${aberturas.length} abertura(s) do aplicativo\n`)
console.log('| Cenário | onCreate | Página iniciada | Boas-vindas visível | Central visível | Cena 3D pronta | Bloqueios ≥ 0,5 s (qtd · maior · soma) | ANR | Toques (qtd · maior duração · maior atraso) | Retornos do 2º plano |')
console.log('|---|---|---|---|---|---|---|---|---|---|')
for (const a of aberturas) {
  const b = a.bloqueios.map((x) => x.ms)
  const bloq = b.length ? `${b.length} · ${seg(Math.max(...b))} · ${seg(b.reduce((s, x) => s + x, 0))}` : 'nenhum'
  const td = a.toques.map((t) => t.duracaoMs || 0)
  const ta = a.toques.map((t) => t.atrasoDeEntradaMs || 0)
  const toques = a.toques.length ? `${a.toques.length} · ${Math.max(...td)} ms · ${Math.max(...ta)} ms` : 'nenhum'
  console.log(
    `| ${a.cenario} | ${a.onCreate !== null ? seg(a.onCreate) : '—'} | ${ms(a.marcos['página iniciada'], a.inicio)} | ${ms(a.marcos['tela de boas-vindas visível'], a.inicio)} | ${ms(a.marcos['Central visível'], a.inicio)} | ${ms(a.marcos['cena pronta'], a.inicio)} | ${bloq} | ${a.anr.length ? `**${a.anr.length}**` : '0'} | ${toques} | ${a.retornos} |`,
  )
}
console.log('\nTempos medidos desde o início do processo do aplicativo (relógio do aparelho).')
console.log('Bloqueio: a thread principal do Android ficou sem responder (vigia do build de diagnóstico).')
console.log('Toque: duração = do toque até o quadro seguinte desenhado; atraso = do toque até o jogo começar a tratar.')
