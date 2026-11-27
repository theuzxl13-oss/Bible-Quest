import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { STORY_SEQUENCE } from '../data/story'
import { QUIZ_REGIONS } from '../data/quiz/regions'
import { allChests } from '../services/game/journeyMap'
import type { CharacterAppearance, Progress } from '../types'

/*
 * PROTEÇÃO DO COMPORTAMENTO DOS MAPAS (reformulação visual, entrega 2: mapa de Gênesis)
 * Escrita ANTES da reformulação: o mapa novo precisa mostrar exatamente as mesmas fases, estados,
 * estrelas e baús, com os mesmos rótulos acessíveis, e visitar o mapa não pode mudar o progresso.
 */

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'masculino', body: 'masculino', skin: 2, face: 'suave', hairStyle: 'curto', hairColor: 0,
  equipped: { tunica: 'tunica-terra', manto: null, calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: [] },
}
const feita = (estrelas: number) => ({ completed: true, bestStars: estrelas, bestScore: 80, attempts: 1 })

function setup(path: string, ajustar?: (p: Progress) => void) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const perfil = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...perfil, character: structuredClone(CHAR) })
  const p = s.progress.load()
  p.worldsSeen = ['mundo-genesis', 'mundo-exodo']
  ajustar?.(p)
  s.progress.save(p)
  const antes = structuredClone(s.progress.load())
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={createLocalServices(store)}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
  return { user, antes, services: createLocalServices(store) }
}

const ids = STORY_SEQUENCE.map((e) => e.id)

describe('mapa do Modo História: proteção do comportamento', () => {
  it('todas as fases aparecem como botões, com estado e estrelas reais', async () => {
    setup('/historia', (p) => {
      p.experiences[ids[0]] = feita(3)
      p.experiences[ids[1]] = feita(2)
      p.experiences[ids[2]] = feita(1)
    })
    await screen.findByRole('heading', { name: 'Modo História', level: 1 })
    const fases = screen.getAllByRole('button', { name: /^Fase \d+:/ })
    expect(fases).toHaveLength(STORY_SEQUENCE.length)
    expect(screen.getByRole('button', { name: /^Fase 1: .*Concluída, 3 de 3 estrelas/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Fase 2: .*Concluída, 2 de 3 estrelas/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Fase 3: .*Concluída, 1 de 3 estrelas/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Fase atual$/ })).toHaveLength(1)
    expect(screen.getByRole('button', { name: /^Fase 4: .*Fase atual$/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Bloqueada$/ })).toHaveLength(STORY_SEQUENCE.length - 4)
  })

  it('os baús aparecem nos estados do sistema (bloqueado, disponível, aberto)', async () => {
    const primeiro = allChests()[0]
    setup('/historia', (p) => {
      for (let i = 0; i < 5; i++) p.experiences[ids[i]] = feita(2)
    })
    await screen.findByRole('heading', { name: 'Modo História', level: 1 })
    expect(screen.getAllByRole('button', { name: /^(Abrir baú de recompensa|Baú bloqueado|Baú já aberto)/ })).toHaveLength(allChests().length)
    expect(screen.getByRole('button', { name: /abrir baú de recompensa/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /baú bloqueado/i })).toHaveLength(allChests().length - 1)
    expect(document.querySelector(`[data-node="${primeiro.id}"]`)).not.toBeNull()
  })

  it('baú já aberto continua aberto; abrir é a única ação que muda o progresso', async () => {
    const primeiro = allChests()[0]
    const { user, services } = setup('/historia', (p) => {
      for (let i = 0; i < 5; i++) p.experiences[ids[i]] = feita(2)
    })
    await user.click(await screen.findByRole('button', { name: /abrir baú de recompensa/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Abrir baú' }))
    expect(services.progress.load().chests[primeiro.id]).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('button', { name: 'Baú já aberto' })).toBeInTheDocument()
  })

  it('fase bloqueada não começa; a fase atual abre a janela para começar', async () => {
    const { user } = setup('/historia')
    await user.click(await screen.findByRole('button', { name: /^Fase 2: .*Bloqueada$/ }))
    let janela = await screen.findByRole('dialog')
    expect(within(janela).queryByRole('button', { name: /começar/i })).not.toBeInTheDocument()
    await user.click(within(janela).getByRole('button', { name: /fechar/i }))
    await user.click(screen.getByRole('button', { name: /^Fase 1: .*Fase atual$/ }))
    janela = await screen.findByRole('dialog')
    expect(within(janela).getByRole('button', { name: /começar/i })).toBeInTheDocument()
  })

  it('visitar o mapa não muda fases, estrelas nem baús', async () => {
    const { antes, services } = setup('/historia', (p) => {
      p.experiences[ids[0]] = feita(3)
    })
    await screen.findByRole('heading', { name: 'Modo História', level: 1 })
    const depois = services.progress.load()
    expect(depois.experiences).toEqual(antes.experiences)
    expect(depois.chests).toEqual(antes.chests)
    expect(depois.xp).toBe(antes.xp)
  })
})

describe('mapa do Modo Quiz: proteção do comportamento', () => {
  it('todos os desafios da região aparecem com estado real', async () => {
    const vale = QUIZ_REGIONS[0]
    setup('/quiz', (p) => {
      p.quiz.nodes[vale.nodes[0].id] = feita(2)
    })
    await screen.findByRole('heading', { name: 'Modo Quiz', level: 1 })
    expect(screen.getAllByRole('button', { name: /desafio \d+:/i })).toHaveLength(vale.nodes.length)
    expect(screen.getByRole('button', { name: /desafio 1: .*Concluído, 2 de 3 estrelas/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /desafio 2: .*Disponível/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Bloqueado$/ })).toHaveLength(vale.nodes.length - 2)
  })
})
