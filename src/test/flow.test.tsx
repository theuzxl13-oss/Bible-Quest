import { describe, expect, it } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { getQuestion } from '../data/questions'
import type { Question } from '../types'

function setup(path = '/', store = new MemoryStore()) {
  const services = createLocalServices(store)
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={services}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
  return { user, services, store }
}

/** Identifica a pergunta exibida pelo id do título (q-<id>). */
function currentQuestion(): Question {
  const h = document.querySelector('.question-prompt') as HTMLElement
  return getQuestion(h.id.slice(2))!
}

async function answerCorrectly(user: ReturnType<typeof userEvent.setup>, q: Question) {
  const group = screen.getByRole('group', { name: /alternativas|verdadeiro ou falso/i })
  if (q.type === 'truefalse') {
    await user.click(within(group).getByRole('button', { name: q.answer ? /verdadeiro/i : /falso/i }))
  } else if ('options' in q) {
    await user.click(within(group).getByRole('button', { name: q.options[q.answer] }))
  } else {
    throw new Error(`tipo não tratado no teste: ${q.type}`)
  }
}

describe('fluxo principal de ponta a ponta', () => {
  it('cria perfil, lê o capítulo, responde, ganha XP e libera o próximo capítulo', async () => {
    const { user, services } = setup('/entrar')

    await user.type(screen.getByLabelText('Apelido'), 'Lia')
    await user.click(screen.getByLabelText('18 anos ou mais'))
    await user.click(screen.getByRole('button', { name: /começar/i }))

    expect(await screen.findByRole('heading', { name: /olá, lia/i })).toBeInTheDocument()
    expect(services.auth.current()?.nickname).toBe('Lia')

    // abre o primeiro capítulo pelo cartão "Continuar"
    await user.click(screen.getByRole('link', { name: /capítulo 1: no princípio/i }))
    expect(await screen.findByRole('heading', { name: 'Texto bíblico' })).toBeInTheDocument()
    expect(screen.getByText('Narrativa dramatizada')).toBeInTheDocument()
    expect(screen.getByText(/No princípio, criou Deus os céus e a terra\./)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /iniciar desafio/i }))

    for (let i = 0; i < 5; i++) {
      const q = currentQuestion()
      await answerCorrectly(user, q)
      expect(await screen.findByText(/correto!/i)).toBeInTheDocument()
      expect(screen.getAllByText(q.reference).length).toBeGreaterThan(0)
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }

    expect(await screen.findByRole('heading', { name: /capítulo concluído/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 de 3 estrelas' })).toBeInTheDocument()

    const progress = services.progress.load()
    expect(progress.chapters['criacao-1'].completed).toBe(true)
    expect(progress.xp).toBeGreaterThan(50)
    expect(progress.achievements['primeiro-passo']).toBeTruthy()
    expect(progress.history).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: /próximo capítulo/i }))
    expect(await screen.findByRole('heading', { name: 'Os dias da criação' })).toBeInTheDocument()
  })

  it('erros consomem tentativas e mostram explicação e resposta correta', async () => {
    const store = new MemoryStore()
    createLocalServices(store).auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
    const { user, services } = setup('/desafio/criacao-1', store)

    for (let i = 0; i < 3; i++) {
      const q = currentQuestion()
      const group = screen.getByRole('group', { name: /alternativas|verdadeiro ou falso/i })
      if (q.type === 'truefalse') {
        await user.click(within(group).getByRole('button', { name: q.answer ? /falso/i : /verdadeiro/i }))
      } else if ('options' in q) {
        const wrong = q.options.find((_, idx) => idx !== q.answer)!
        await user.click(within(group).getByRole('button', { name: wrong }))
      }
      expect(await screen.findByText(/não foi desta vez/i)).toBeInTheDocument()
      expect(screen.getByText(q.explanation)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }

    expect(await screen.findByRole('heading', { name: /ainda não foi desta vez/i })).toBeInTheDocument()
    const p = services.progress.load()
    expect(p.chapters['criacao-1'].completed).toBe(false)
    expect(p.history[0].passed).toBe(false)
  })

  it('capítulos bloqueados não podem ser abertos por URL', async () => {
    const store = new MemoryStore()
    createLocalServices(store).auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
    setup('/capitulo/criacao-3', store)
    expect(await screen.findByRole('heading', { name: 'A Criação do Mundo' })).toBeInTheDocument()
    expect(screen.getAllByText(/bloqueado/i).length).toBeGreaterThan(0)
  })

  it('telas protegidas redirecionam para o cadastro sem perfil', async () => {
    setup('/painel')
    expect(await screen.findByRole('heading', { name: /crie seu perfil local/i })).toBeInTheDocument()
  })

  it('ranking identifica dados de exemplo e o multiplayer identifica o modo demonstração', async () => {
    const store = new MemoryStore()
    createLocalServices(store).auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: 'ate12' })
    const { user } = setup('/ranking', store)
    expect(await screen.findByText('Ranking de demonstração')).toBeInTheDocument()
    expect(screen.getAllByText('Exemplo').length).toBeGreaterThan(3)
    expect(screen.getByText('Você · local')).toBeInTheDocument()

    await user.click(screen.getAllByRole('link', { name: 'Multiplayer' })[0])
    expect(await screen.findByText(/não uma partida online/i)).toBeInTheDocument()
    expect(screen.getByText('Proteção para menores')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /criar sala de demonstração/i }))
    expect(await screen.findAllByText('Fictício')).toHaveLength(3)
  })

  it('configurações de acessibilidade são aplicadas e persistidas', async () => {
    const { user, services } = setup('/configuracoes')
    await user.click(screen.getByLabelText('Extra grande'))
    await user.click(screen.getByRole('switch', { name: 'Alto contraste' }))
    await waitFor(() => expect(document.documentElement.dataset.font).toBe('extra'))
    expect(document.documentElement.dataset.contrast).toBe('alto')
    expect(services.settings.load()).toMatchObject({ fontScale: 'extra', highContrast: true })
  })

  it('página inexistente mostra mensagem amigável', async () => {
    setup('/nao-existe')
    expect(await screen.findByRole('heading', { name: /não está no mapa/i })).toBeInTheDocument()
  })
})
