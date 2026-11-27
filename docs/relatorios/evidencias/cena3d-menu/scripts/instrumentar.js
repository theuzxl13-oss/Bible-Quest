// Instrumentação SÓ DA PÁGINA DE TESTE (injetada pelo Playwright antes do jogo; nada no repositório).
// Conta contextos WebGL criados, perdidos e coletados, e os objetos WebGL criados e apagados por contexto.
;(() => {
  const g = (window.__gl = { contextos: 0, coletados: 0, perdidos: 0, compilacoes: 0, porContexto: [], refs: [] })
  const reg = new FinalizationRegistry(() => g.coletados++)
  const tipos = ['Texture', 'Buffer', 'Framebuffer', 'Renderbuffer', 'Program', 'Shader', 'VertexArray']
  const orig = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (tipo, ...resto) {
    const c = orig.call(this, tipo, ...resto)
    if (c && /webgl/.test(tipo) && !c.__bq) {
      const reg2 = { id: g.contextos++, criado: performance.now(), cria: {}, apaga: {}, perdido: false, pixels: 0 }
      Object.defineProperty(c, '__bq', { value: reg2 })
      g.porContexto.push(reg2)
      g.refs.push(new WeakRef(c))
      reg.register(c, reg2.id)
      this.addEventListener('webglcontextlost', () => { reg2.perdido = true; g.perdidos++ })
    }
    return c
  }
  for (const P of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
    if (!P) continue
    for (const t of tipos) {
      for (const [verbo, campo] of [[`create${t}`, 'cria'], [`delete${t}`, 'apaga']]) {
        const f = P.prototype[verbo]
        if (!f) continue
        P.prototype[verbo] = function (...a) {
          const r = this.__bq
          if (r) r[campo][t] = (r[campo][t] ?? 0) + 1
          return f.apply(this, a)
        }
      }
    }
    const comp = P.prototype.compileShader
    P.prototype.compileShader = function (...a) { g.compilacoes++; return comp.apply(this, a) }
    for (const nome of ['texImage2D', 'texStorage2D']) {
      const f = P.prototype[nome]
      P.prototype[nome] = function (...a) {
        const r = this.__bq
        // largura × altura quando vêm como números (texStorage2D e texImage2D com tamanho)
        if (r) { const w = nome === 'texStorage2D' ? a[3] : typeof a[3] === 'number' ? a[3] : a[a.length - 1]?.width; const h = nome === 'texStorage2D' ? a[4] : typeof a[4] === 'number' ? a[4] : a[a.length - 1]?.height; if (w && h) r.pixels += w * h }
        return f.apply(this, a)
      }
    }
  }
  window.__glResumo = () => {
    const vivos = g.refs.map((w) => w.deref()).filter(Boolean)
    const ativos = vivos.filter((c) => !c.isContextLost())
    const soma = (lista, campo) => { const o = {}; for (const r of lista) for (const [k, v] of Object.entries(r[campo])) o[k] = (o[k] ?? 0) + v; return o }
    const ativosReg = ativos.map((c) => c.__bq)
    const vivosAtivos = {}
    for (const r of ativosReg) for (const k of tipos) vivosAtivos[k] = (vivosAtivos[k] ?? 0) + (r.cria[k] ?? 0) - (r.apaga[k] ?? 0)
    return {
      contextos_criados: g.contextos, contextos_perdidos: g.perdidos, contextos_ainda_na_memoria_js: vivos.length, contextos_coletados: g.coletados,
      contextos_ativos: ativos.length, objetos_gl_nos_ativos: vivosAtivos, compilacoes_de_shader: g.compilacoes,
      criados_total: soma(g.porContexto, 'cria'), apagados_total: soma(g.porContexto, 'apaga'),
      por_contexto: g.porContexto.map((r) => ({ id: r.id, perdido: r.perdido, texturas: (r.cria.Texture ?? 0) - (r.apaga.Texture ?? 0), buffers: (r.cria.Buffer ?? 0) - (r.apaga.Buffer ?? 0), programas: (r.cria.Program ?? 0) - (r.apaga.Program ?? 0), mpix: +(r.pixels / 1e6).toFixed(2) })),
    }
  }
})()
