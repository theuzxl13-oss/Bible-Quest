import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * Passo 1.7 da Fase 1: paletas por ambiente nas telas antigas.
 * Entrega 1 (0.17.8): Conquistas (Sala dos Troféus). Entrega 2 (0.17.9): Biblioteca (Sala de Estudos).
 */

const raiz = process.cwd()
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8')
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const css = semComentarios(ler('src/styles/ambientes.css'))
const regras = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ seletor: m[1].trim(), corpo: m[2] }))
const AMBIENTES_MIGRADOS = ['conquistas', 'biblioteca']

function contraste(a: string, b: string) {
  const L = (h: string) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const tokens = semComentarios(ler('src/styles/tokens.css'))
const hex = (nome: string) => tokens.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`))![1]

describe('passo 1.7: ambientes.css', () => {
  it('só tokens, sem cor HEX', () => {
    expect(css.match(/#[0-9a-fA-F]{3,8}\b/g)).toBeNull()
  })

  it('toda regra fica fora do alto contraste e dentro de um ambiente já autorizado', () => {
    expect(regras.length).toBeGreaterThan(0)
    for (const { seletor } of regras) {
      for (const parte of seletor.split(/,(?![^(]*\))/)) {
        expect(parte.trim(), seletor).toMatch(/^html:not\(\[data-contrast='alto'\]\) \.app\[data-ambiente='([a-z]+)'\]/)
        const amb = parte.trim().match(/data-ambiente='([a-z]+)'/)![1]
        expect(AMBIENTES_MIGRADOS, seletor).toContain(amb)
      }
    }
  })

  it('a Central e os outros ambientes ficam de fora', () => {
    expect(css).not.toMatch(/central|camp-|hud-|nav-global/)
    for (const amb of ['historia', 'quiz', 'perfil']) expect(css).not.toContain(`data-ambiente='${amb}'`)
  })

  it('a ponte, a paleta legada e :root continuam com os valores antigos', () => {
    expect(css).not.toMatch(/:root/)
    expect(css).not.toMatch(/--legado-/)
    // a ponte do ambiente só aponta variáveis antigas para tokens de ambiente
    for (const amb of AMBIENTES_MIGRADOS) {
      const ponte = regras.find((r) => r.seletor === `html:not([data-contrast='alto']) .app[data-ambiente='${amb}']`)!
      expect(ponte, amb).toBeDefined()
      for (const d of ponte.corpo.matchAll(/(--[\w-]+):\s*([^;]+);/g)) expect(d[2].trim(), `${amb} ${d[1]}`).toMatch(/^var\(--amb-[\w-]+\)$/)
    }
  })

  it('é carregado depois da ponte e antes da acessibilidade e do alto contraste', () => {
    const main = ler('src/main.tsx')
    const pos = (f: string) => main.indexOf(`./styles/${f}`)
    expect(pos('ambientes.css')).toBeGreaterThan(pos('ponte.css'))
    expect(pos('ambientes.css')).toBeLessThan(pos('acessibilidade.css'))
    expect(pos('ambientes.css')).toBeLessThan(pos('alto-contraste.css'))
  })

  it('Conquistas: os pares de cor usados passam no contraste da WCAG', () => {
    const pares: [string, string, number][] = [
      ['tinta', 'pergaminho', 4.5], ['tinta-suave', 'pergaminho', 4.5], // cartões e descrições
      ['ouro-300', 'veludo-800', 4.5], ['marfim', 'veludo-800', 4.5], // faixas, conquistas e medalhas obtidas
      ['bronze', 'veludo-800', 3], ['prata', 'veludo-800', 3], ['ouro-300', 'veludo-800', 3], // folhas e bordas das medalhas
    ]
    for (const [a, b, min] of pares) expect(contraste(hex(a), hex(b)), `${a}/${b}`).toBeGreaterThanOrEqual(min)
    expect(css).toMatch(/\.ach-card:not\(\.is-on\), \.medal-card\.is-locked\)\s*\{\s*opacity:\s*1/)
    expect(css).toMatch(/\.medal-card\.medal-bronze \.game-icon ellipse\s*\{\s*fill:\s*var\(--bronze\)/)
    expect(css).toMatch(/\.medal-card\.medal-prata \.game-icon ellipse\s*\{\s*fill:\s*var\(--prata\)/)
  })

  it('Biblioteca: os pares de cor usados passam no contraste da WCAG', () => {
    const pares: [string, string][] = [
      ['tinta', 'papel'], ['tinta-suave', 'papel'], // fichas da página de aventura
      ['marfim', 'couro-700'], ['lamparina-300', 'couro-700'], // placas, faixas, abas e etiquetas de data
      ['tinta', 'lamparina-300'], // aba e ficha escolhidas
      ['lamparina-300', 'terra-900'], // destaques sobre o fundo escuro
    ]
    for (const [a, b] of pares) expect(contraste(hex(a), hex(b)), `${a}/${b}`).toBeGreaterThanOrEqual(4.5)
    // a lamparina nunca vira texto sobre o papel (1,4:1)
    expect(contraste(hex('lamparina-300'), hex('papel'))).toBeLessThan(3)
    expect(css).not.toMatch(/data-ambiente='biblioteca'\] \.av-pagina[^{]*\{[^}]*color:\s*var\(--amb-acento-texto\)[^}]*background:\s*var\(--amb-leitura\)/)
  })
})
