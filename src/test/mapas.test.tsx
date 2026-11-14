import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { CENARIO_MUNDO, CENARIO_QUIZ, zonasPorNo } from '../data/mapas/cenarios'
import { worldSections } from '../services/game/journeyMap'
import { cenarioDaPartida } from '../data/mapas/partida'
import type { CharacterAppearance } from '../types'

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}

function setup(path: string, ajustar?: (p: ReturnType<ReturnType<typeof createLocalServices>['progress']['load']>) => void) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const perfil = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...perfil, character: structuredClone(CHAR) })
  const p = s.progress.load()
  p.worldsSeen = ['mundo-genesis', 'mundo-exodo']
  ajustar?.(p)
  s.progress.save(p)
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={createLocalServices(store)}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
  return { user, services: createLocalServices(store) }
}

describe('cenários dos mapas', () => {
  it('as regiões de Gênesis cobrem as 20 fases, em ordem e sem buracos', () => {
    const genesis = worldSections().find((s) => s.world.id === 'mundo-genesis')!
    let f = 0
    const fasesDosNos = genesis.nodes.map((n) => (n.kind === 'phase' ? ++f : f))
    const zonas = zonasPorNo(CENARIO_MUNDO['mundo-genesis'], fasesDosNos)
    expect(zonas[0].de).toBe(0)
    expect(zonas[zonas.length - 1].ate).toBe(genesis.nodes.length - 1)
    zonas.forEach((z, i) => i > 0 && expect(z.de).toBe(zonas[i - 1].ate + 1))
    expect(zonas.map((z) => z.nome)).toEqual(['A criação', 'O jardim do Éden', 'Caim e Abel', 'Noé e o dilúvio', 'A torre de Babel', 'Abraão', 'Isaque e Jacó', 'José no Egito'])
  })

  it('a partida usa o cenário da região da fase ou do desafio', () => {
    expect(cenarioDaPartida({ experienceId: 'gn-noe' }).nome).toBe('Noé e o dilúvio')
    expect(cenarioDaPartida({ experienceId: 'gn-babel' }).nome).toBe('A torre de Babel')
    expect(cenarioDaPartida({ experienceId: 'gn-jose-egito' }).nome).toBe('José no Egito')
    expect(cenarioDaPartida({ quizNodeId: 'vale-5' }).nome).toBe('Biblioteca antiga')
    expect(cenarioDaPartida({}).nome).toBe('Biblioteca antiga')
  })

  it('cada região do Modo Quiz tem cenário próprio', () => {
    for (const id of ['vale', 'planicie', 'montanhas', 'torre']) {
      const zonas = zonasPorNo(CENARIO_QUIZ[id], [1, 2, 3, 4, 5, 6])
      expect(zonas[0].de).toBe(0)
      expect(zonas[zonas.length - 1].ate).toBe(5)
    }
  })
})

describe('mapa de aventura do Modo História', () => {
  it('mostra o cabeçalho com dados reais e a placa do mundo', async () => {
    setup('/historia', (p) => {
      p.experiences['gn-criacao'] = { completed: true, bestStars: 3, bestScore: 90, attempts: 1 }
      p.experiences['gn-homem-mulher'] = { completed: true, bestStars: 2, bestScore: 70, attempts: 1 }
    })
    expect(await screen.findByRole('heading', { name: 'Modo História', level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/5 de \d+ estrelas/)).toBeInTheDocument()
    expect(screen.getByLabelText('2 de 20 concluídas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fase 3: o jardim do éden\. fase atual/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao acampamento' })).toHaveAttribute('href', '/painel')
  })

  it('o botão de ajuda explica o mapa', async () => {
    const { user } = setup('/historia')
    await user.click(await screen.findByRole('button', { name: 'Como funciona o mapa' }))
    const ajuda = screen.getByRole('dialog', { name: 'Como funciona' })
    expect(within(ajuda).getByText(/separado do modo quiz/i)).toBeInTheDocument()
  })
})

describe('mapa de aventura do Modo Quiz', () => {
  it('a troca de dificuldade mostra a região, bloqueada até concluir a anterior', async () => {
    const { user } = setup('/quiz')
    const sel = await screen.findByRole('combobox', { name: /dificuldade/i })
    await user.selectOptions(sel, 'planicie')
    expect(screen.getByRole('heading', { name: 'Planície do Saber' })).toBeInTheDocument()
    expect(screen.getByText(/conclua todos os desafios de vale dos iniciantes/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /planície do saber, desafio 1: .*bloqueado/i }))
    const janela = await screen.findByRole('dialog')
    expect(within(janela).queryByRole('button', { name: /começar desafio/i })).not.toBeInTheDocument()
    expect(within(janela).getByText(/conclua todos os desafios da região anterior/i)).toBeInTheDocument()
  })

  it('os atalhos levam ao treino livre', async () => {
    setup('/quiz')
    const nav = await screen.findByRole('navigation', { name: 'Treino livre' })
    expect(within(nav).getByRole('link', { name: /desafio por tempo/i })).toHaveAttribute('href', '/quiz/treino/contra-o-tempo')
    expect(within(nav).getByRole('link', { name: /perguntas aleatórias/i })).toHaveAttribute('href', '/quiz/treino/aleatorias')
  })

  it('"Começar desafio" na janela já abre a partida, com o cenário de aventura ao fundo', async () => {
    const { user } = setup('/quiz')
    await user.click(await screen.findByRole('button', { name: /desafio 1: verdadeiro ou falso\. disponível/i }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /começar desafio/i }))
    expect(await screen.findByRole('button', { name: 'Sair da partida' })).toBeInTheDocument()
    expect(document.querySelector('.quiz.av-jogo .av-fundo')).not.toBeNull()
  })

  it('concluir um desafio do Quiz não libera fases do Modo História', async () => {
    const { services } = setup('/quiz', (p) => {
      p.quiz.nodes['vale-1'] = { completed: true, bestStars: 3, bestScore: 60, attempts: 1 }
    })
    expect(await screen.findByRole('button', { name: /desafio 2: perguntas aleatórias\. disponível/i })).toBeInTheDocument()
    expect(Object.keys(services.progress.load().experiences)).toHaveLength(0)
  })
})
