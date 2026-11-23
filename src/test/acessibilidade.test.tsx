import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { ambienteDaRota } from '../components/layout/ambiente'
import { AjudaMapa, JanelaFase } from '../components/map/aventura/Interface'
import { usePrenderFoco } from '../components/usePrenderFoco'
import { PainelMissoes } from '../components/camp/PainelMissoes'
import type { CharacterAppearance } from '../types'

/*
 * Fase 1 da Etapa 2, passos 1.4 e 1.5 (0.17.6): foco preso nas janelas,
 * identificação dos ambientes sem efeito visual e as duas correções da Central.
 */

const raiz = process.cwd()
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8')
const semComentarios = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}
function app(path: string) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const perfil = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...perfil, character: structuredClone(CHAR) })
  return render(<MemoryRouter initialEntries={[path]}><GameProvider services={createLocalServices(store)}><App /></GameProvider></MemoryRouter>)
}

describe('passo 1.5: identificação dos ambientes', () => {
  it('cada rota recebe o ambiente aprovado; as telas de serviço ficam neutras', () => {
    const casos: [string, string | undefined][] = [
      ['/painel', 'central'], ['/historia', 'historia'], ['/historia/livros', 'historia'], ['/historia/genesis', 'historia'], ['/historia/genesis/gn-criacao', 'historia'],
      ['/historia/genesis/gn-criacao/historia', 'historia'], ['/historia/genesis/gn-criacao/desafio', 'historia'],
      ['/quiz', 'quiz'], ['/quiz/treino', 'quiz'], ['/quiz/treino/aleatorias', 'quiz'], ['/quiz/desafio/vale-1', 'quiz'], ['/quiz/multiplayer', 'quiz'], ['/diario', 'quiz'], ['/revisao', 'quiz'],
      ['/biblioteca', 'biblioteca'], ['/biblioteca/personagem/adao', 'biblioteca'], ['/linha-do-tempo', 'biblioteca'],
      ['/perfil', 'perfil'], ['/estatisticas', 'perfil'], ['/ranking', 'perfil'], ['/guarda-roupa', 'perfil'],
      ['/conquistas', 'conquistas'],
      ['/', undefined], ['/boas-vindas', undefined], ['/entrar', undefined], ['/configuracoes', undefined], ['/sobre', undefined], ['/admin', undefined], ['/nao-existe', undefined],
    ]
    for (const [rota, amb] of casos) expect(ambienteDaRota(rota), rota).toBe(amb)
    expect(ambienteDaRota('/resultado', 'historia')).toBe('historia')
    expect(ambienteDaRota('/resultado', 'quiz')).toBe('quiz')
    expect(ambienteDaRota('/resultado', 'diario')).toBe('quiz')
    expect(ambienteDaRota('/resultado')).toBeUndefined()
  })

  it('o Layout marca a aplicação com o ambiente da rota', async () => {
    const { container, unmount } = app('/biblioteca')
    await screen.findAllByRole('heading')
    expect(container.querySelector('.app')).toHaveAttribute('data-ambiente', 'biblioteca')
    unmount()
    const outro = app('/sobre')
    await screen.findAllByRole('heading')
    expect(outro.container.querySelector('.app')).not.toHaveAttribute('data-ambiente')
  })

  it('o atributo não muda nada na tela: só tokens.css o seleciona, e os tokens de ambiente só são lidos pelos componentes base', () => {
    const estilos = ['src/styles/global.css', 'src/styles/tokens.css', 'src/styles/ponte.css', 'src/styles/acessibilidade.css',
      ...['componentes', 'telas'].flatMap((d) => readdirSync(join(raiz, 'src/styles', d)).map((f) => `src/styles/${d}/${f}`))]
    for (const f of estilos) {
      const css = semComentarios(ler(f))
      if (f !== 'src/styles/tokens.css') expect(css, f).not.toMatch(/data-ambiente/)
      if (f !== 'src/styles/tokens.css' && !f.includes('/base-')) expect(css, f).not.toMatch(/var\(--amb-/)
    }
    // nenhum componente ou tela lê o atributo pelo código
    const codigo = readdirSync(join(raiz, 'src'), { recursive: true }).map(String).filter((f) => /\.tsx?$/.test(f) && !f.startsWith('test')).filter((f) => !f.endsWith('layout/ambiente.ts') && !f.endsWith('layout/Layout.tsx'))
    for (const f of codigo) expect(ler(`src/${f}`), f).not.toMatch(/data-ambiente|dataset\.ambiente/)
  })
})

describe('passo 1.4: teclado e foco', () => {
  it('a janela da fase prende o Tab e fecha com Esc', async () => {
    const user = userEvent.setup()
    function Teste() {
      const [aberta, setAberta] = useState(true)
      return (
        <>
          <button type="button">Atrás da janela</button>
          {aberta && (
            <JanelaFase titulo="A queda" numero={4} rotulo="Gênesis · Fase 4" onFechar={() => setAberta(false)} acoes={<><button type="button" data-foco>Voltar ao mapa</button><button type="button">Começar fase</button></>}>
              <p>Descrição</p>
            </JanelaFase>
          )}
        </>
      )
    }
    render(<MemoryRouter><Teste /></MemoryRouter>)
    const janela = screen.getByRole('dialog', { name: 'A queda' })
    expect(within(janela).getByRole('button', { name: 'Voltar ao mapa' })).toHaveFocus()
    await user.tab()
    expect(within(janela).getByRole('button', { name: 'Começar fase' })).toHaveFocus()
    await user.tab() // volta ao primeiro, sem sair da janela
    expect(within(janela).getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await user.tab({ shift: true })
    expect(within(janela).getByRole('button', { name: 'Começar fase' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('a ajuda do mapa prende o Tab e agora fecha com Esc', async () => {
    const user = userEvent.setup()
    function Teste() {
      const [aberta, setAberta] = useState(true)
      return aberta ? <AjudaMapa onFechar={() => setAberta(false)} itens={[{ icone: 'star', texto: 'Estrelas' }]} /> : <p>fechada</p>
    }
    render(<MemoryRouter><Teste /></MemoryRouter>)
    const janela = screen.getByRole('dialog', { name: 'Como funciona' })
    expect(within(janela).getByRole('button', { name: 'Entendi' })).toHaveFocus()
    await user.tab()
    expect(within(janela).getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await user.tab()
    expect(within(janela).getByRole('button', { name: 'Entendi' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByText('fechada')).toBeInTheDocument()
  })

  it('usePrenderFoco traz o foco de volta para dentro quando ele está fora', async () => {
    const user = userEvent.setup()
    function Teste() {
      const ref = useRef<HTMLDivElement>(null)
      usePrenderFoco(ref)
      return <><button type="button">Fora</button><div ref={ref}><button type="button">Primeiro</button><button type="button">Último</button></div></>
    }
    render(<Teste />)
    screen.getByRole('button', { name: 'Fora' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Primeiro' })).toHaveFocus()
  })
})

describe('passo 1.4: estilos de acessibilidade', () => {
  it('áreas de toque ampliadas sem mudar o visual, e foco com cor por tipo de fundo', () => {
    const css = semComentarios(ler('src/styles/acessibilidade.css'))
    for (const s of ['.footer-links a', 'a.brand', '.topbar-profile', '.topnav-link', '.topbar-secundario', '.back-link', '.btn-sm', ':is(button, label).chip', '.chip > a', '.swatch', '.icon-btn', '.av-bau-topo']) expect(css, s).toContain(s)
    expect(css).toMatch(/inset:\s*min\(0px, calc\(\(100% - var\(--toque-min\)\) \/ 2\)\)/)
    expect(css).toMatch(/\.switch::before/)
    expect(css).toMatch(/--foco-local:\s*var\(--foco-sobre-claro\)/)
    expect(css).toMatch(/\.av-pagina\s*\{\s*--foco-local:\s*var\(--tinta\)/)
    // o contorno padrão segue --gold-strong, que o alto contraste unificado troca por ouro-300 (0.17.7)
    expect(css).toMatch(/:focus-visible\s*\{\s*outline-color:\s*var\(--foco-local, var\(--gold-strong\)\)/)
    expect(ler('src/main.tsx').indexOf('acessibilidade.css')).toBeGreaterThan(ler('src/main.tsx').indexOf('ponte.css'))
  })

  it('Central: só as duas correções autorizadas (foco do painel de missões e selo de aviso)', () => {
    const painel = semComentarios(ler('src/styles/componentes/painel.css'))
    expect(painel).toMatch(/a\.board-item:focus-visible\s*\{\s*outline:\s*3px solid var\(--foco-sobre-claro\)/)
    expect(painel).toMatch(/\.camp-painel-fechar:focus-visible\s*\{\s*outline:\s*3px solid var\(--foco-sobre-claro\)/)
    expect(painel).toMatch(/\.camp-missoes-botao:focus-visible\s*\{\s*outline:\s*3px solid var\(--tinta\)/)
    const placa = semComentarios(ler('src/styles/componentes/placa.css'))
    expect(placa).toMatch(/\.camp-badge\s*\{[^}]*background:\s*var\(--feedback-selo\)/)
  })

  it('Central, autorização adicional: anel duplo nos rótulos, topo, placas e Continuar, e toque dos rótulos ≥ 44 px', () => {
    const placa = semComentarios(ler('src/styles/componentes/placa.css'))
    const hud = semComentarios(ler('src/styles/componentes/hud.css'))
    const anel = /outline:\s*3px solid var\(--tinta\);\s*outline-offset:\s*3px;\s*box-shadow:\s*0 0 0 3px var\(--marfim\)/
    expect(placa).toMatch(new RegExp('\\.camp-label:focus-visible\\s*\\{\\s*' + anel.source))
    expect(hud).toMatch(new RegExp('\\.hud-player:focus-visible, \\.hud-settings:focus-visible\\s*\\{\\s*' + anel.source))
    expect(placa).toMatch(/\.camp-modo:focus-visible, \.camp-continuar:focus-visible\s*\{\s*outline:\s*3px solid var\(--tinta\)/)
    expect(placa).toMatch(/\.camp-modo:focus-visible\s*\{\s*box-shadow:\s*0 0 0 3px var\(--marfim\)/)
    expect(placa).toMatch(/\.camp-continuar:focus-visible\s*\{\s*box-shadow:\s*0 0 0 3px var\(--marfim\)/)
    // nenhum foco da Central usa mais o azul-claro (--foco), que tinha contraste baixo sobre o cenário
    for (const css of [placa, hud, semComentarios(ler('src/styles/componentes/painel.css'))]) expect(css).not.toMatch(/focus-visible[^}]*var\(--foco\)/)
    // área de toque: 30 + 2 × 8 e 28 + 2 × 9 (celular), acima de 44 px
    expect(placa).toMatch(/\.camp-label::before\s*\{[^}]*inset:\s*-8px -5px/)
    expect(placa).toMatch(/\.camp-label::before\s*\{\s*inset:\s*-9px -5px/)
  })
})

describe('0.17.7: foco com o painel de missões aberto', () => {
  function cena() {
    const itens = [{ id: 'diario', icon: 'calendar' as const, titulo: 'Desafio diário', detalhe: '5 perguntas', to: '/diario' }]
    return render(
      <MemoryRouter>
        <button type="button">Visível antes</button>
        <button type="button">Encoberto</button>
        <PainelMissoes itens={itens} pendentes={1} />
        <button type="button">Visível depois</button>
      </MemoryRouter>,
    )
  }

  it('com o painel aberto, Tab e Shift+Tab pulam o que fica embaixo dele; fechado, a ordem é a de sempre', async () => {
    const user = userEvent.setup()
    cena()
    const encoberto = screen.getByRole('button', { name: 'Encoberto' })
    // simula a cena: o painel aberto cobre o botão "Encoberto"
    const original = document.elementFromPoint
    document.elementFromPoint = (x: number, y: number) => {
      const painel = document.querySelector('.camp-painel') as HTMLElement
      const caixa = encoberto.getBoundingClientRect()
      if (!painel.hidden && x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom) return painel.querySelector('h2')
      return null
    }
    encoberto.getBoundingClientRect = () => ({ x: 10, y: 10, left: 10, top: 10, width: 100, height: 30, right: 110, bottom: 40, toJSON: () => ({}) })
    try {
      // fechado: a ordem normal passa pelo botão encoberto
      screen.getByRole('button', { name: 'Visível antes' }).focus()
      await user.tab()
      expect(encoberto).toHaveFocus()
      // aberto: o foco pula o botão encoberto nos dois sentidos
      await user.click(screen.getByRole('button', { name: /^missões/i }))
      screen.getByRole('button', { name: 'Visível antes' }).focus()
      await user.tab()
      expect(screen.getByRole('button', { name: /^missões/i })).toHaveFocus()
      await user.tab({ shift: true })
      expect(screen.getByRole('button', { name: 'Visível antes' })).toHaveFocus()
      // os itens do próprio painel continuam na ordem
      screen.getByRole('button', { name: /^missões/i }).focus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'Fechar missões' })).toHaveFocus()
    } finally {
      document.elementFromPoint = original
    }
  })
})
