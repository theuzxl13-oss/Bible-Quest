// Despejo de memória do Chromium (memory-infra) por processo, via CDP no nível do navegador.
const fs = require('fs')

async function despejar(cdpNav) {
  const partes = []
  const fim = new Promise((ok) => cdpNav.once('Tracing.tracingComplete', ok))
  const coleta = (e) => partes.push(...e.value)
  cdpNav.on('Tracing.dataCollected', coleta)
  await cdpNav.send('Tracing.start', {
    traceConfig: { includedCategories: ['disabled-by-default-memory-infra'], excludedCategories: ['*'], memoryDumpConfig: { triggers: [] } },
    transferMode: 'ReportEvents',
  })
  const r = await cdpNav.send('Tracing.requestMemoryDump', { deterministic: true, levelOfDetail: 'detailed' })
  await cdpNav.send('Tracing.end')
  await fim
  cdpNav.off('Tracing.dataCollected', coleta)
  // nomes dos processos
  const nomes = {}
  for (const e of partes) if (e.ph === 'M' && e.name === 'process_name') nomes[e.pid] = e.args.name
  const porProc = {}
  for (const e of partes) {
    if (e.ph !== 'v' || !e.args?.dumps) continue
    const d = e.args.dumps
    const p = (porProc[e.pid] ??= { nome: nomes[e.pid] ?? String(e.pid), alocadores: {}, residente: 0 })
    if (d.process_totals?.resident_set_bytes) p.residente = parseInt(d.process_totals.resident_set_bytes, 16)
    if (d.process_totals?.private_footprint_bytes) p.pegada = parseInt(d.process_totals.private_footprint_bytes, 16)
    for (const [nome, a] of Object.entries(d.allocators ?? {})) {
      const t = a.attrs?.size ? parseInt(a.attrs.size.value, 16) : 0
      const ef = a.attrs?.effective_size ? parseInt(a.attrs.effective_size.value, 16) : t
      p.alocadores[nome] = { size: t, effective: ef, ...(a.attrs?.locked_size ? { locked: parseInt(a.attrs.locked_size.value, 16) } : {}) }
    }
  }
  return { ok: r.success, porProc }
}
module.exports = { despejar }

if (require.main === module) {
  const { chromium } = require('playwright')
  ;(async () => {
    const nav = await chromium.launch({ args: process.argv.slice(2) })
    const cdp = await nav.newBrowserCDPSession()
    const pg = await nav.newPage()
    await pg.goto('http://localhost:5310/')
    await pg.waitForTimeout(1500)
    const d = await despejar(cdp)
    for (const [pid, p] of Object.entries(d.porProc)) {
      const top = Object.entries(p.alocadores).filter(([n]) => !n.includes('/', n.indexOf('/') + 1) || n.split('/').length <= 2).sort((a, b) => b[1].effective - a[1].effective).slice(0, 14)
      console.log(pid, p.nome, 'rss', (p.residente / 1048576).toFixed(1), 'pegada', ((p.pegada ?? 0) / 1048576).toFixed(1))
      for (const [n, a] of top) console.log('   ', n, (a.effective / 1048576).toFixed(2))
    }
    await nav.close()
  })()
}
