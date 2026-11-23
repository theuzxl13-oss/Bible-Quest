import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * Fase 1 da Etapa 2 (0.17.5): a ponte de compatibilidade liga as variáveis
 * antigas de global.css aos tokens SEM mudar nenhum valor, e os arquivos novos
 * não têm cor HEX fora de tokens.css.
 */

const raiz = process.cwd()
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8')
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const norm = (v: string) => v.trim().replace(/\s+/g, ' ').toLowerCase()

/** Declarações de um bloco `seletor { ... }` (só o primeiro nível). */
function declaracoes(css: string, seletor: RegExp): Map<string, string> {
  const m = new Map<string, string>()
  for (const bloco of semComentarios(css).matchAll(new RegExp(`${seletor.source}\\s*\\{([^}]*)\\}`, 'g'))) {
    for (const d of bloco[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) m.set(d[1], d[2])
  }
  return m
}

const global = ler('src/styles/global.css')
const tokens = ler('src/styles/tokens.css')
const ponte = ler('src/styles/ponte.css')
const antigas = declaracoes(global, /(?:^|\n):root/)
const legado = declaracoes(tokens, /(?:^|\n):root/)
const mapa = declaracoes(ponte, /(?:^|\n):root/)

describe('ponte de compatibilidade (0.17.5)', () => {
  it('cobre todas as variáveis antigas de global.css', () => {
    expect(antigas.size).toBeGreaterThanOrEqual(39)
    for (const nome of antigas.keys()) expect(mapa.get(nome), nome).toBe(`var(--legado-${nome.slice(2)})`)
  })

  it('cada variável antiga mantém exatamente o valor de antes (cor, opacidade, gradiente, sombra, medida e fonte)', () => {
    for (const [nome, valor] of antigas) {
      const token = legado.get(`--legado-${nome.slice(2)}`)
      expect(token, `--legado-${nome.slice(2)}`).toBeDefined()
      expect(norm(token!), nome).toBe(norm(valor))
    }
  })

  it('a animação reduzida antiga continua com especificidade maior que a ponte; o alto contraste passou aos tokens (0.17.7)', () => {
    // a ponte usa :root (0,1,0); os ajustes usam html[data-...] (0,1,1)
    expect(semComentarios(ponte)).not.toMatch(/html\[data-/)
    expect(semComentarios(global)).not.toMatch(/data-contrast/)
    expect(tokens).toMatch(/html\[data-contrast='alto'\]\s*\{[^}]*--legado-gold:/)
    expect(global).toMatch(/html\[data-motion='reduzido'\]\s*\{\s*--speed:\s*0ms/)
  })

  it('a ponte é carregada depois de global.css e de tokens.css', () => {
    const main = ler('src/main.tsx')
    const pos = (f: string) => main.indexOf(`./styles/${f}`)
    expect(pos('global.css')).toBeGreaterThan(-1)
    expect(pos('tokens.css')).toBeGreaterThan(pos('global.css'))
    expect(pos('ponte.css')).toBeGreaterThan(pos('tokens.css'))
  })

  it('os tokens que a Central já usava continuam com os mesmos valores', () => {
    // valores da 0.17.3 (amostra dos usados pela Central); mudar exige aprovação
    const central: Record<string, string> = {
      '--terra-900': '#22160D', '--pergaminho': '#F4EAD2', '--ouro-300': '#E6C77E', '--ouro-500': '#C9A24E', '--marfim': '#F3EBDA',
      '--tinta': '#2B1D10', '--foco': '#7FB2E5', '--aviso': '#C9452F', '--fogueira-500': '#E08A2E', '--azul-700': '#1D3554',
      '--raio-m': '10px', '--raio-g': '16px', '--nav-altura': '64px', '--vidro-escuro': 'rgba(34, 22, 13, 0.86)',
    }
    for (const [k, v] of Object.entries(central)) expect(norm(legado.get(k) ?? ''), k).toBe(norm(v))
  })
})

describe('tokens de ambiente (0.17.5)', () => {
  it('cada ambiente define o mesmo conjunto de tokens, e nenhuma tela usa data-ambiente ainda', () => {
    const nomes = ['--amb-acento', '--amb-acento-texto', '--amb-base', '--amb-leitura', '--amb-moldura', '--amb-progresso']
    for (const amb of ['historia', 'quiz', 'biblioteca', 'perfil', 'conquistas']) {
      const d = declaracoes(tokens, new RegExp(`\\[data-ambiente='${amb}'\\]`))
      for (const n of nomes) expect(d.has(n), `${amb} ${n}`).toBe(true)
    }
    const padrao = declaracoes(tokens, /(?:^|\n):root/)
    for (const n of nomes) expect(padrao.has(n), n).toBe(true)
    // 0.17.6: só o Layout marca o ambiente (pela rota); as páginas não
    const telas = readdirSync(join(raiz, 'src/pages'), { recursive: true }).filter((f) => String(f).endsWith('.tsx')).map((f) => ler(`src/pages/${f}`)).join('\n')
    expect(telas).not.toMatch(/data-ambiente/)
  })
})

describe('arquivos novos sem cor HEX (0.17.5)', () => {
  it('ponte.css, os componentes base e as estruturas em components/base não têm HEX', () => {
    const arquivos = [
      'src/styles/ponte.css',
      'src/styles/acessibilidade.css',
      'src/styles/alto-contraste.css',
      ...readdirSync(join(raiz, 'src/styles/componentes')).filter((f) => f.startsWith('base-')).map((f) => `src/styles/componentes/${f}`),
      'src/components/base/index.tsx',
    ]
    expect(arquivos.length).toBe(15)
    for (const f of arquivos) expect(semComentarios(ler(f)).match(/#[0-9a-fA-F]{3,8}\b/g), f).toBeNull()
  })

  it('os 11 componentes base existem e só usam tokens para cor', () => {
    const nomes = ['botao', 'painel', 'cartao', 'janela', 'aviso', 'mensagem', 'campo', 'progresso', 'abas', 'cabecalho', 'voltar']
    for (const n of nomes) {
      const css = semComentarios(ler(`src/styles/componentes/base-${n}.css`))
      expect(css, n).toMatch(/\.bq-/)
      expect(css, n).toMatch(/var\(--/)
    }
  })
})
