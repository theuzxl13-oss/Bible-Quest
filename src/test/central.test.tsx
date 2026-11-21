import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { ELEMENTOS_ACAMPAMENTO } from '../data/acampamento'
import { elementosLiberados } from '../services/game/acampamento'
import type { CharacterAppearance, Progress } from '../types'

/*
 * Central do Jogador (Etapa 2, tela piloto): acessos preservados, painel de
 * missões, "Continuar", visibilidade da navegação global, os 13 elementos de
 * evolução intactos e a guarda de cores dos estilos novos.
 */

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}

function setup(path: string, ajustar?: (p: Progress) => void) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const perfil = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...perfil, character: structuredClone(CHAR) })
  if (ajustar) {
    const p = s.progress.load()
    ajustar(p)
    s.progress.save(p)
  }
  const user = userEvent.setup()
  const r = render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={createLocalServices(store)}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
  return { user, services: createLocalServices(store), ...r }
}

describe('Central do Jogador', () => {
  it('1. todos os destinos de antes continuam alcançáveis pela Central ou pelo Perfil', async () => {
    const { unmount } = setup('/painel')
    await screen.findByRole('heading', { name: 'Tobias', level: 1 })
    const hrefs = new Set(Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')))
    // HUD, ações, navegação global e painel de missões (no DOM mesmo recolhido)
    for (const h of ['/perfil', '/configuracoes', '/historia', '/quiz', '/biblioteca', '/painel', '/diario', '/revisao']) expect(hrefs, h).toContain(h)
    // os objetos da cena levam ao guarda-roupa, à biblioteca, ao desafio diário e às recompensas
    for (const nome of [/^personagem/i, /^biblioteca/i, /^desafio diário/i, /^recompensas/i]) expect(screen.getByRole('button', { name: nome })).toBeInTheDocument()
    expect(document.querySelectorAll('.camp-label')).toHaveLength(4)
    unmount()

    setup('/perfil')
    await screen.findByRole('heading', { name: 'Tobias', level: 1 })
    const atalhos = screen.getByRole('navigation', { name: 'Atalhos do perfil' })
    expect(within(atalhos).getByRole('link', { name: 'Conquistas' })).toHaveAttribute('href', '/conquistas')
    expect(within(atalhos).getByRole('link', { name: 'Estatísticas' })).toHaveAttribute('href', '/estatisticas')
    expect(within(atalhos).getByRole('link', { name: 'Ranking' })).toHaveAttribute('href', '/ranking')
    expect(screen.getByRole('link', { name: 'Personalizar personagem' })).toHaveAttribute('href', '/guarda-roupa')
    expect(screen.getByRole('heading', { name: 'Histórico de partidas' })).toBeInTheDocument()
  })

  it('2. o painel de missões abre e fecha pelo teclado, com o estado anunciado', async () => {
    const { user } = setup('/painel')
    const botao = await screen.findByRole('button', { name: /missões/i })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region', { name: 'Missões' })).not.toBeInTheDocument()
    botao.focus()
    await user.keyboard('{Enter}')
    expect(botao).toHaveAttribute('aria-expanded', 'true')
    const painel = screen.getByRole('region', { name: 'Missões' })
    expect(within(painel).getByRole('link', { name: /revisão inteligente/i })).toHaveAttribute('href', '/revisao')
    expect(within(painel).getByRole('link', { name: /desafio diário/i })).toHaveAttribute('href', '/diario')
    expect(within(painel).getByRole('progressbar', { name: 'Progresso geral' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(botao).toHaveFocus()
    // o botão "Fechar missões" dentro do painel também fecha e devolve o foco
    await user.click(botao)
    await user.click(screen.getByRole('button', { name: 'Fechar missões' }))
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(botao).toHaveFocus()
  })

  it('2b. o Desafio diário abre pelos dois caminhos: rótulo na cena e painel de missões', async () => {
    const { user, unmount } = setup('/painel')
    await user.click(await screen.findByRole('button', { name: /^desafio diário/i }))
    expect(await screen.findByRole('heading', { name: /desafio diário/i, level: 1 })).toBeInTheDocument()
    unmount()
    const s2 = setup('/painel')
    await s2.user.click(await screen.findByRole('button', { name: /missões/i }))
    await s2.user.click(within(screen.getByRole('region', { name: 'Missões' })).getByRole('link', { name: /desafio diário/i }))
    expect(await screen.findByRole('heading', { name: /desafio diário/i, level: 1 })).toBeInTheDocument()
  })

  it('3. "Começar/Continuar" abre a próxima fase calculada e a marca como visitada', async () => {
    const { user, services } = setup('/painel', (p) => {
      p.experiences['gn-criacao'] = { completed: true, bestStars: 3, bestScore: 90, attempts: 1 }
    })
    await user.click(await screen.findByRole('button', { name: /^continuar: fase 2, a criação do homem e da mulher/i }))
    expect(await screen.findByRole('heading', { name: 'Introdução' })).toBeInTheDocument()
    expect(services.progress.load().lastExperienceId).toBe('gn-homem-mulher')
  })

  it('4. a navegação global aparece na Central e no Perfil e some nos mapas, perguntas e resultado', async () => {
    for (const [rota, visivel] of [['/painel', true], ['/perfil', true], ['/biblioteca', true], ['/historia', false], ['/quiz', false], ['/historia/genesis/gn-criacao/desafio', false]] as const) {
      const { unmount } = setup(rota)
      await screen.findAllByRole('heading')
      const nav = screen.queryByRole('navigation', { name: 'Navegação rápida' })
      if (visivel) expect(nav, rota).toBeInTheDocument()
      else expect(nav, rota).not.toBeInTheDocument()
      unmount()
    }
  })

  it('5. os 13 elementos do acampamento e suas regras continuam iguais', () => {
    // valores fixados antes da Etapa 2 (src/data/acampamento.ts, sem mudanças)
    expect(ELEMENTOS_ACAMPAMENTO.map((e) => `${e.id}:${e.condicao.tipo}${'valor' in e.condicao ? ':' + e.condicao.valor : ''}`)).toEqual([
      'tenda:sempre', 'fogueira:sempre', 'mesa:sempre', 'quadro:sempre', 'bau:sempre',
      'jarros:nivel:2', 'palmeiras:fases:3', 'lanternas:conquistas:3', 'tenda-grande:nivel:4',
      'estandarte:baus:1', 'poco:fases:10', 'ovelhas:nivel:6', 'jardim:conquistas:8',
    ])
    const s = createLocalServices(new MemoryStore())
    const vazio = s.progress.load()
    expect(elementosLiberados(vazio)).toEqual(['tenda', 'fogueira', 'mesa', 'quadro', 'bau'])
    const cheio = structuredClone(vazio)
    cheio.xp = 1_000_000
    for (let i = 0; i < 10; i++) cheio.experiences[`fase-${i}`] = { completed: true, bestStars: 1, bestScore: 50, attempts: 1 }
    for (let i = 0; i < 8; i++) cheio.achievements[`conquista-${i}`] = '2026-11-14T00:00:00Z'
    cheio.chests['bau-1'] = '2026-11-14T00:00:00Z'
    expect(elementosLiberados(cheio)).toHaveLength(13)
  })

  it('6. os estilos novos não usam cores HEX fora de tokens.css', () => {
    const base = join(process.cwd(), 'src/styles')
    const arquivos = ['componentes', 'telas'].flatMap((d) => readdirSync(join(base, d)).filter((f) => f.endsWith('.css')).map((f) => join(base, d, f)))
    expect(arquivos.length).toBeGreaterThanOrEqual(5)
    for (const f of arquivos) expect(readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{3,8}\b/g), f).toBeNull()
  })
})
