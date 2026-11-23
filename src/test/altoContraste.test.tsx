import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'

/*
 * Passo 1.6 da Fase 1 (0.17.7): um só alto contraste.
 * Antes havia dois: o antigo (preto e amarelo, em global.css) e o da Central
 * (terra e marfim, em tokens.css). Agora todos os valores vêm de tokens.css e
 * as regras das telas antigas ficam em alto-contraste.css, só com tokens.
 */

const raiz = process.cwd()
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8')
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const tokens = semComentarios(ler('src/styles/tokens.css'))
const ac = semComentarios(ler('src/styles/alto-contraste.css'))
const todosCss = [
  'src/styles/global.css', 'src/styles/tokens.css', 'src/styles/ponte.css', 'src/styles/acessibilidade.css', 'src/styles/alto-contraste.css',
  ...readdirSync(join(raiz, 'src/styles/componentes')).map((f) => `src/styles/componentes/${f}`),
  ...readdirSync(join(raiz, 'src/styles/telas')).map((f) => `src/styles/telas/${f}`),
]

/** Valor HEX de um token da paleta (segue var(--x) até chegar a um HEX). */
function hex(nome: string): string {
  const m = tokens.match(new RegExp(`--${nome}:\\s*([^;]+);`))
  if (!m) throw new Error(`token ${nome} não encontrado`)
  const v = m[1].trim()
  const ref = v.match(/^var\(--([\w-]+)\)$/)
  return ref ? hex(ref[1]) : v
}
/** Valor de um token dentro do bloco de alto contraste unificado. */
function noAlto(nome: string): string {
  const bloco = [...tokens.matchAll(/html\[data-contrast='alto'\]\s*\{([^}]*)\}/g)].map((b) => b[1]).join('\n')
  const m = bloco.match(new RegExp(`--${nome}:\\s*var\\(--([\\w-]+)\\)`))
  if (!m) throw new Error(`--${nome} não está no alto contraste`)
  return hex(m[1])
}
function contraste(a: string, b: string) {
  const L = (h: string) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('passo 1.6: um só alto contraste', () => {
  it('nenhuma regra de alto contraste usa cor HEX: os valores vêm só da paleta de tokens.css', () => {
    for (const f of todosCss) {
      if (f.endsWith('tokens.css')) continue
      for (const regra of semComentarios(ler(f)).matchAll(/[^{}]*data-contrast[^{}]*\{([^}]*)\}/g)) {
        expect(regra[1].match(/#[0-9a-fA-F]{3,8}\b/g), `${f}: ${regra[0].slice(0, 80)}`).toBeNull()
      }
    }
    // o bloco antigo (preto e amarelo) saiu de global.css
    expect(semComentarios(ler('src/styles/global.css'))).not.toMatch(/data-contrast/)
  })

  it('as variáveis que o modo antigo trocava continuam trocadas, agora para os tons de terra e marfim', () => {
    for (const nome of ['navy-900', 'navy-850', 'navy-800', 'text', 'muted', 'gold', 'gold-strong', 'border', 'border-strong', 'panel']) {
      expect(tokens, nome).toMatch(new RegExp(`html\\[data-contrast='alto'\\]\\s*\\{[^}]*--legado-${nome}:\\s*var\\(--`))
    }
  })

  it('as superfícies que o modo antigo cobria continuam cobertas, e as páginas claras ganham regra própria', () => {
    for (const s of ['.panel', '.lib-card', '.mode-card', '.history-item', '.btn-outline', '.chip', '.topbar', '.section-title', '.quiz-body .question', '.quiz-body .option', 'main::before']) {
      expect(ac, s).toContain(s)
    }
    expect(ac).toMatch(/\.av-pagina :is\([^)]*\.panel[^)]*\)\s*\{[^}]*background:\s*var\(--ac-claro-fundo\)/)
    expect(ac).toMatch(/\.chip\.is-on, \.tab\.is-on\)\s*\{[^}]*color:\s*var\(--ac-selecionado-texto\)/)
    expect(ac).toMatch(/\.option\.is-correct\s*\{[^}]*var\(--ac-acerto-fundo\)/)
    expect(ac).toMatch(/\.option\.is-wrong\s*\{[^}]*var\(--ac-erro-fundo\)/)
  })

  it('os pares de cor do alto contraste passam no contraste da WCAG (texto 4,5:1, bordas 3:1)', () => {
    const texto: [string, string][] = [
      ['ac-escuro-texto', 'ac-escuro-fundo'], ['ac-escuro-texto-suave', 'ac-escuro-fundo'], ['ac-claro-texto', 'ac-claro-fundo'],
      ['ac-selecionado-texto', 'ac-selecionado-fundo'], ['ac-escuro-texto', 'ac-acerto-fundo'], ['ac-escuro-texto', 'ac-erro-fundo'],
      ['ac-erro-fundo', 'ac-claro-fundo'], ['legado-text', 'legado-navy-900'], ['legado-muted', 'legado-navy-850'], ['legado-gold', 'legado-navy-900'],
    ]
    for (const [a, b] of texto) expect(contraste(noAlto(a), noAlto(b)), `${a} / ${b}`).toBeGreaterThanOrEqual(4.5)
    const bordas: [string, string][] = [['ac-escuro-borda', 'ac-escuro-fundo'], ['ac-claro-borda', 'ac-claro-fundo'], ['ac-acerto-borda', 'ac-fundo'], ['ac-erro-borda', 'ac-fundo'], ['legado-border', 'legado-navy-900']]
    for (const [a, b] of bordas) expect(contraste(noAlto(a), noAlto(b)), `${a} / ${b}`).toBeGreaterThanOrEqual(3)
  })

  it('alto-contraste.css é o último estilo carregado, e as regras da Central continuam nos arquivos dela', () => {
    const main = ler('src/main.tsx')
    const estilos = [...main.matchAll(/import '\.\/styles\/([^']+)'/g)].map((m) => m[1])
    expect(estilos.at(-1)).toBe('alto-contraste.css')
    expect(ac).not.toMatch(/\.(camp|hud|nav-global)-/)
  })

  it('a preferência salva liga o alto contraste ao abrir o jogo, e continua junto da animação reduzida', async () => {
    const store = new MemoryStore()
    const services = createLocalServices(store)
    services.settings.save({ ...services.settings.load(), highContrast: true, reduceMotion: true })
    render(
      <MemoryRouter initialEntries={['/']}>
        <GameProvider services={createLocalServices(store)}>
          <App />
        </GameProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(document.documentElement.dataset.contrast).toBe('alto'))
    expect(document.documentElement.dataset.motion).toBe('reduzido')
  })
})

describe('passo 1.6: foco na Central em alto contraste', () => {
  it('o anel marfim do foco não é mais apagado pelo "box-shadow: none" do alto contraste', () => {
    const hud = semComentarios(ler('src/styles/componentes/hud.css'))
    const painel = semComentarios(ler('src/styles/componentes/painel.css'))
    expect(hud).toMatch(/html\[data-contrast='alto'\] :is\(\.hud-player, \.hud-settings\):focus-visible\s*\{\s*box-shadow:\s*0 0 0 3px var\(--marfim\)/)
    expect(painel).toMatch(/html\[data-contrast='alto'\] \.camp-missoes-botao:focus-visible\s*\{\s*box-shadow:\s*0 0 0 3px var\(--marfim\)/)
  })
})
