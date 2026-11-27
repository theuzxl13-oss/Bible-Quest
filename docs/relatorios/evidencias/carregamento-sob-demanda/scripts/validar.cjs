// Validação funcional do carregamento sob demanda no Chromium (mesma tela de celular da auditoria).
// Uso: node validar.cjs <porta> <qualidade alta|leve|2d> <fases concluídas> <saida.json> [pasta de capturas]
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const [PORTA, QUAL, NFASES, SAIDA, CAPT] = process.argv.slice(2)
const URL = `http://localhost:${PORTA}/`
const ARGS = ['--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const GN = ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao', 'gn-noe', 'gn-arca', 'gn-diluvio', 'gn-alianca-noe']
const src = fs.readFileSync(path.join(__dirname, 'cenarios.cjs'), 'utf8')
const perfil = eval('(' + src.match(/const perfil = (\{[\s\S]*?\} \} \})/)[1] + ')')
if (CAPT) fs.mkdirSync(CAPT, { recursive: true })

async function novoContexto(nav, extra = {}) {
  const ctx = await nav.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
  await ctx.addInitScript(([p, q, g, n]) => {
    if (!localStorage.getItem('bible-quest:v1:profile')) {
      localStorage.setItem('bible-quest:v1:profile', JSON.stringify(p))
      localStorage.setItem('bible-quest:v1:settings', JSON.stringify({ graphics: q, onboardingDone: true, reduceMotion: true }))
      const ch = n >= 5 ? { 'bau-mundo-genesis-5': '2026-11-27T00:00:00Z' } : {}
      localStorage.setItem('bible-quest:v1:progress', JSON.stringify({ experiences: Object.fromEntries(g.slice(0, n).map((i) => [i, { completed: true, bestStars: 3, bestScore: 80, attempts: 1 }])), chests: ch, worldsSeen: ['mundo-genesis', 'mundo-exodo'], mapCursor: null }))
    }
  }, [perfil, QUAL, GN, +NFASES])
  if (extra.bloquear) await ctx.route(extra.bloquear, (r) => r.abort())
  return ctx
}

// estado das pinturas na tela, a cada quadro
const AMOSTRA = () => {
  const vh = innerHeight
  const regs = [...document.querySelectorAll('.tr-pintada')].map((r) => {
    const b = r.getBoundingClientRect()
    const arte = r.querySelector('img.tr-arte'); const mini = r.querySelector('img.tr-miniatura')
    return { id: [...r.classList].find((c) => c.startsWith('tr-regiao-'))?.slice(10), topo: b.top, base: b.bottom, naTela: b.bottom > 0 && b.top < vh,
      arte: Boolean(arte), arteOk: Boolean(arte && arte.complete && arte.naturalWidth > 0), miniVisivel: Boolean(mini && getComputedStyle(mini).visibility !== 'hidden'), miniOk: Boolean(mini && mini.complete && mini.naturalWidth > 0) }
  })
  return regs
}

;(async () => {
  const nav = await chromium.launch({ args: ARGS })
  const res = { porta: PORTA, qualidade: QUAL, fases: +NFASES }

  // ---------- 1. abertura: do menu ao mapa, quadro a quadro ----------
  {
    const ctx = await novoContexto(nav); const pg = await ctx.newPage(); pg.setDefaultTimeout(60000)
    await pg.goto(URL + '#/painel'); await pg.waitForTimeout(3500)
    res.abertura = await pg.evaluate(async (amostraTxt) => {
      const amostra = eval(amostraTxt)
      const quadros = []
      const t0 = performance.now()
      location.hash = '#/historia'
      await new Promise((ok) => {
        const passo = () => {
          const t = performance.now() - t0
          const mapa = Boolean(document.querySelector('.av-historia'))
          const raiz = document.getElementById('root')
          quadros.push({ t: Math.round(t), mapa, vazio: !raiz || raiz.children.length === 0 || (raiz.textContent ?? '').trim() === '' && !raiz.querySelector('canvas,img,svg'), regs: mapa ? amostra() : null })
          if ((mapa && quadros.filter((q) => q.mapa).length > 120) || t > 30000) return ok()
          requestAnimationFrame(passo)
        }
        requestAnimationFrame(passo)
      })
      const primeiro = quadros.find((q) => q.mapa)
      const mapaQ = quadros.filter((q) => q.mapa)
      return { quadros_do_mapa_observados: mapaQ.length, quadros_com_miniatura_na_tela: mapaQ.filter((q) => q.regs.some((r) => r.naTela && !r.arteOk)).length, quadros_sem_nada_na_tela: mapaQ.filter((q) => q.regs.some((r) => r.naTela && !r.arteOk && !(r.miniVisivel && r.miniOk))).length, quadros_antes_do_mapa: quadros.filter((q) => !q.mapa).length, quadros_vazios: quadros.filter((q) => q.vazio).length, ms_ate_mapa: primeiro?.t,
        primeiro_quadro: primeiro?.regs, quadros: quadros.filter((q) => q.mapa).slice(0, 30).map((q) => ({ t: q.t, regs: q.regs.map((r) => `${r.id}:${r.naTela ? 'tela' : 'fora'}:${r.arteOk ? 'pintura' : r.miniVisivel ? 'miniatura' : 'nada'}`).join(' ') })) }
    }, `(${AMOSTRA})`)
    await pg.waitForTimeout(1500)
    if (CAPT) await pg.screenshot({ path: path.join(CAPT, `abertura-${QUAL}-${PORTA}.png`) })
    // ---------- 2. posição de cada marco (página) e emenda ----------
    res.marcos = await pg.evaluate(() => [...document.querySelectorAll('[data-node]')].map((n) => { const b = n.querySelector('button').getBoundingClientRect(); return { id: n.getAttribute('data-node'), x: +(b.left + b.width / 2).toFixed(2), y: +(b.top + scrollY + b.height / 2).toFixed(2), rotulo: n.querySelector('button').getAttribute('aria-label') } }))
    res.emenda_px = await pg.evaluate(() => { const d = document.querySelector('.tr-regiao-diluvio')?.getBoundingClientRect(); const e = document.querySelector('.tr-regiao-eden')?.getBoundingClientRect(); return d && e ? +(e.top - d.bottom).toFixed(3) : null })
    res.altura_pagina = await pg.evaluate(() => document.documentElement.scrollHeight)
    // ---------- 3. rolagem: normal (1 tela/s) e rápida (página inteira em 3 s), ida e volta ----------
    res.rolagem = {}
    for (const [nome, vel] of [['normal', 1], ['rapida', 0]]) {
      res.rolagem[nome] = await pg.evaluate(async ([amostraTxt, vel]) => {
        const amostra = eval(amostraTxt)
        const fim = document.documentElement.scrollHeight - innerHeight
        const st = { quadros: 0, max_pinturas: 0, quadros_com_miniatura_na_tela: 0, quadros_sem_nada: 0, emenda_na_tela: 0, emenda_incompleta: 0, intervalos: [], trocas: 0 }
        let antes = ''
        for (const [de, ate] of [[fim, 0], [0, fim]]) {
          window.scrollTo(0, de); await new Promise((r) => setTimeout(r, 600))
          const dur = vel ? (Math.abs(ate - de) / innerHeight) * 1000 / vel : 3000
          const t0 = performance.now(); let u = t0
          await new Promise((ok) => { const passo = (t) => {
            const k = Math.min(1, (t - t0) / dur); window.scrollTo(0, de + (ate - de) * k)
            const regs = amostra(); st.quadros++; st.intervalos.push(t - u); u = t
            st.max_pinturas = Math.max(st.max_pinturas, regs.filter((r) => r.arte).length)
            const sig = regs.map((r) => r.arte ? 1 : 0).join(''); if (sig !== antes) { st.trocas++; antes = sig }
            if (regs.some((r) => r.naTela && !r.arteOk)) st.quadros_com_miniatura_na_tela++
            if (regs.some((r) => r.naTela && !r.arteOk && !(r.miniVisivel && r.miniOk))) st.quadros_sem_nada++
            const d = regs.find((r) => r.id === 'diluvio'); const e = regs.find((r) => r.id === 'eden')
            if (d && e && d.base > 0 && d.base < innerHeight) { st.emenda_na_tela++; if (!(d.arteOk && e.arteOk)) st.emenda_incompleta++ }
            k < 1 ? requestAnimationFrame(passo) : ok() }; requestAnimationFrame(passo) })
        }
        const o = st.intervalos.slice(1).sort((a, b) => a - b)
        st.p95_ms = +o[Math.floor(o.length * 0.95)].toFixed(1); st.max_ms = +o[o.length - 1].toFixed(1); st.acima_33 = o.filter((x) => x > 33.4).length
        delete st.intervalos
        return st
      }, [`(${AMOSTRA})`, vel])
    }
    // ---------- 4. liberação: topo da página (longe das pinturas) ----------
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(1200)
    res.no_topo = await pg.evaluate((a) => eval(a)().map((r) => ({ id: r.id, dist_telas: +(Math.max(0, r.topo - innerHeight) / innerHeight).toFixed(2), pintura: r.arte })), `(${AMOSTRA})`)
    // volta ao fundo
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(1200)
    res.no_fundo = await pg.evaluate((a) => eval(a)().map((r) => ({ id: r.id, pintura: r.arte })), `(${AMOSTRA})`)
    // ---------- 5. toque nos marcos (todas as fases e baús desbloqueados abrem algo) ----------
    const ids = res.marcos.map((m) => m.id)
    res.toque = await pg.evaluate((ids) => ids.map((id) => {
      const b = document.querySelector(`[data-node="${id}"] button`); b.scrollIntoView({ block: 'center' })
      const q = b.getBoundingClientRect(); const alvo = document.elementFromPoint(q.left + q.width / 2, q.top + q.height * 0.4)
      return { id, livre: Boolean(alvo && b.contains(alvo)) }
    }), ids)
    // ---------- 6. troca de qualidade ----------
    if (QUAL !== '2d') {
      const outra = QUAL === 'alta' ? 'Leve' : 'Alta'
      await pg.evaluate(() => { location.hash = '#/configuracoes' })
      await pg.waitForFunction(() => document.querySelectorAll('input[name=graphics]').length === 4)
      await pg.evaluate((o) => [...document.querySelectorAll('input[name=graphics]')].find((i) => i.parentElement.textContent.trim() === o).click(), outra)
      await pg.waitForTimeout(400)
      await pg.evaluate(() => { location.hash = '#/historia' })
      await pg.waitForFunction(() => Boolean(document.querySelector('.av-historia')))
      await pg.waitForTimeout(1500)
      await pg.evaluate(() => document.querySelector('.tr-regiao-eden')?.scrollIntoView({ block: 'center' })); await pg.waitForTimeout(800)
      await pg.evaluate(() => document.querySelector('.tr-regiao-diluvio')?.scrollIntoView({ block: 'center' })); await pg.waitForTimeout(800)
      res.troca_qualidade = { para: outra.toLowerCase(), srcs: await pg.evaluate(() => [...document.querySelectorAll('img.tr-arte')].map((i) => i.getAttribute('src').replace(/^.*mapas\//, ''))) }
    }
    await ctx.close()
  }

  // ---------- 7. arquivo bloqueado: a região mostra a miniatura, nunca imagem quebrada ----------
  {
    const ctx = await novoContexto(nav, { bloquear: /mapas\/genesis\/diluvio(-leve)?\.webp/ }); const pg = await ctx.newPage(); pg.setDefaultTimeout(60000)
    await pg.goto(URL + '#/painel'); await pg.waitForTimeout(2500)
    await pg.evaluate(() => { location.hash = '#/historia' })
    await pg.waitForFunction(() => Boolean(document.querySelector('.tr-regiao-diluvio')))
    await pg.evaluate(() => document.querySelector('.tr-regiao-diluvio').scrollIntoView({ block: 'center' }))
    await pg.waitForTimeout(3500)
    res.arquivo_bloqueado = await pg.evaluate(() => { const r = document.querySelector('.tr-regiao-diluvio'); const a = r.querySelector('img.tr-arte'); const m = r.querySelector('img.tr-miniatura')
      return { pintura_na_pagina: Boolean(a), pintura_quebrada: Boolean(a && a.complete && a.naturalWidth === 0), miniatura_visivel: Boolean(m && getComputedStyle(m).visibility !== 'hidden' && m.naturalWidth > 0) } })
    if (CAPT) await pg.screenshot({ path: path.join(CAPT, `bloqueado-miniatura-${QUAL}-${PORTA}.png`) })
    await ctx.close()
  }
  fs.writeFileSync(SAIDA, JSON.stringify(res, null, 1))
  const r = res
  console.log(JSON.stringify({ abertura: { ms: r.abertura.ms_ate_mapa, mini_na_tela: r.abertura.quadros_com_miniatura_na_tela, sem_nada: r.abertura.quadros_sem_nada_na_tela, obs: r.abertura.quadros_do_mapa_observados, antes: r.abertura.quadros_antes_do_mapa, vazios: r.abertura.quadros_vazios, primeiro: r.abertura.primeiro_quadro?.map((x) => `${x.id}:${x.naTela ? 'tela' : 'fora'}:${x.arteOk ? 'P' : x.miniVisivel ? 'm' : '-'}`).join(' ') },
    emenda: r.emenda_px, rolagem: r.rolagem, topo: r.no_topo, fundo: r.no_fundo, toque: `${r.toque.filter((t) => t.livre).length}/${r.toque.length}`, troca: r.troca_qualidade, bloqueado: r.arquivo_bloqueado }, null, 0))
  await nav.close()
})()
