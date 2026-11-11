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

function withProfile(ageRange: 'ate12' | '13a17' | '18mais' = '18mais') {
  const store = new MemoryStore()
  createLocalServices(store).auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange })
  return store
}

function currentQuestion(): Question {
  const h = document.querySelector('.question-prompt') as HTMLElement
  return getQuestion(h.id.slice(2))!
}

/** Responde corretamente qualquer modalidade (inclusive ordem e memória). */
async function answerCorrectly(user: ReturnType<typeof userEvent.setup>, q: Question) {
  if (q.type === 'truefalse') {
    await user.click(screen.getByRole('button', { name: q.answer ? 'Verdadeiro' : 'Falso' }))
  } else if ('options' in q) {
    await user.click(within(screen.getByRole('group', { name: 'Alternativas' })).getByRole('button', { name: q.options[q.answer] }))
  } else if (q.type === 'order') {
    for (let target = 0; target < q.items.length; target++) {
      for (;;) {
        const texts = Array.from(document.querySelectorAll('.order-text')).map((e) => e.textContent)
        const pos = texts.indexOf(q.items[target])
        if (pos <= target) break
        await user.click(screen.getByRole('button', { name: `Mover "${q.items[target]}" para cima` }))
      }
    }
    await user.click(screen.getByRole('button', { name: 'Confirmar ordem' }))
  } else if (q.type === 'memory') {
    await solveMemory(user, q.pairs)
  }
}

/** Resolve o jogo da memória como um jogador: lembra das cartas vistas. */
async function solveMemory(user: ReturnType<typeof userEvent.setup>, pairs: { a: string; b: string }[]) {
  const partner = new Map<string, string>()
  for (const p of pairs) {
    partner.set(p.a, p.b)
    partner.set(p.b, p.a)
  }
  const known = new Map<number, string>()
  const cards = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.memory-card'))
  const textOf = (i: number) => cards()[i].querySelector('.memory-face')!.textContent!.trim()
  for (let guard = 0; guard < 30; guard++) {
    const open = cards().map((c, i) => (c.disabled ? -1 : i)).filter((i) => i >= 0)
    if (open.length === 0) break
    const i = open.find((k) => !known.has(k)) ?? open[0]
    await user.click(cards()[i])
    known.set(i, textOf(i))
    const want = partner.get(known.get(i)!)
    let j = open.find((k) => k !== i && known.get(k) === want)
    if (j === undefined) j = open.find((k) => k !== i && !known.has(k))!
    await user.click(cards()[j])
    known.set(j, textOf(j))
    if (known.get(j) !== want) {
      await waitFor(() => expect(document.querySelectorAll('.memory-card.is-open:not(.is-matched)')).toHaveLength(0), { timeout: 2000 })
    }
  }
}

async function playStoryChallenge(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 10; i++) {
    const q = currentQuestion()
    await answerCorrectly(user, q)
    expect(await screen.findByText(/correto!/i, {}, { timeout: 3000 })).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /próxima pergunta|ver resultado/i })
    const last = /ver resultado/i.test(btn.textContent ?? '')
    await user.click(btn)
    if (last) return
  }
}

describe('fluxos de ponta a ponta', () => {
  it('cadastro → painel com os dois modos → Modo História começa em Gênesis → desafio → XP → próxima experiência', async () => {
    const { user, services } = setup('/entrar')
    await user.type(screen.getByLabelText('Apelido'), 'Lia')
    await user.click(screen.getByLabelText('18 anos ou mais'))
    await user.click(screen.getByRole('button', { name: /começar/i }))

    expect(await screen.findByRole('heading', { name: /olá, lia/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A grande jornada bíblica' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Desafios bíblicos' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /a grande jornada bíblica/i }))
    expect(await screen.findByRole('heading', { name: 'Antigo Testamento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Novo Testamento' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Apocalipse: Em preparação/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Êxodo: Bloqueado/)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Gênesis: Disponível/ }))
    await user.click(await screen.findByRole('link', { name: /começar experiência 1: a criação do mundo/i }))
    for (const h of ['Introdução', 'Narrativa', 'Referências bíblicas', 'Aprendizado', 'Desafio']) {
      expect(screen.getByRole('heading', { name: new RegExp(h) })).toBeInTheDocument()
    }
    expect(screen.getByText('Narrativa dramatizada')).toBeInTheDocument()
    expect(services.progress.load().lastExperienceId).toBe('gn-criacao')

    await user.click(screen.getByRole('link', { name: /iniciar desafio/i }))
    await playStoryChallenge(user)

    expect(await screen.findByRole('heading', { name: /experiência concluída/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 de 3 estrelas' })).toBeInTheDocument()
    const p = services.progress.load()
    expect(p.experiences['gn-criacao'].completed).toBe(true)
    expect(p.xp).toBeGreaterThan(50)

    await user.click(screen.getByRole('link', { name: /próxima experiência/i }))
    expect(await screen.findByRole('heading', { name: 'A criação do homem e da mulher' })).toBeInTheDocument()
  })

  it('erros consomem tentativas e não concluem a experiência', async () => {
    const { user, services } = setup('/historia/genesis/gn-criacao/desafio', withProfile())
    for (let i = 0; i < 3; i++) {
      const q = currentQuestion()
      if (q.type === 'truefalse') await user.click(screen.getByRole('button', { name: q.answer ? 'Falso' : 'Verdadeiro' }))
      else if ('options' in q) await user.click(within(screen.getByRole('group', { name: 'Alternativas' })).getByRole('button', { name: q.options.find((_, idx) => idx !== q.answer)! }))
      else if (q.type === 'order') await user.click(screen.getByRole('button', { name: 'Confirmar ordem' }))
      else throw new Error('tipo')
      expect(await screen.findByText(/não foi desta vez/i)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: /ainda não foi desta vez/i })).toBeInTheDocument()
    expect(services.progress.load().experiences['gn-criacao'].completed).toBe(false)
  })

  it('experiências e livros bloqueados não abrem por URL', async () => {
    setup('/historia/genesis/gn-babel', withProfile())
    expect(await screen.findByRole('heading', { name: 'Gênesis' })).toBeInTheDocument()
    expect(screen.getAllByText(/conclua a anterior/i).length).toBeGreaterThan(0)
  })

  it('livro em preparação mostra aviso e leva ao Modo Livre', async () => {
    setup('/historia/apocalipse', withProfile())
    expect(await screen.findByRole('heading', { name: 'Em preparação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir para o modo livre/i })).toBeInTheDocument()
  })

  it('Modo Livre: verdadeiro ou falso de ponta a ponta, XP no mesmo perfil', async () => {
    const { user, services } = setup('/livre', withProfile())
    expect(await screen.findByRole('heading', { name: 'Desafios bíblicos' })).toBeInTheDocument()
    for (const t of ['Perguntas aleatórias', 'Verdadeiro ou falso', 'Complete o versículo', 'Quem sou eu?', 'Contra o tempo', 'Ordem dos acontecimentos', 'Identifique o livro']) {
      expect(screen.getByRole('heading', { name: t })).toBeInTheDocument()
    }
    await user.click(screen.getByRole('link', { name: /verdadeiro ou falso/i }))
    await user.click(await screen.findByRole('button', { name: /começar/i }))
    for (let i = 0; i < 10; i++) {
      const q = currentQuestion()
      expect(q.type).toBe('truefalse')
      await answerCorrectly(user, q)
      expect(screen.getByText(q.reference, { selector: '.ref' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: 'Verdadeiro ou falso' })).toBeInTheDocument()
    const p = services.progress.load()
    expect(p.free.matches).toBe(1)
    expect(p.xp).toBeGreaterThan(0)
    expect(p.history[0]).toMatchObject({ mode: 'livre', freeMode: 'verdadeiro-falso' })
  })

  it('Quem sou eu?: pistas aparecem uma a uma e menos pistas valem mais', async () => {
    const { user } = setup('/livre/quem-sou-eu', withProfile())
    await user.click(await screen.findByRole('button', { name: /começar/i }))
    const q = currentQuestion()
    expect(q.type).toBe('whoami')
    expect(within(screen.getByRole('list', { name: 'Pistas' })).getAllByRole('listitem')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /mostrar próxima pista/i }))
    expect(within(screen.getByRole('list', { name: 'Pistas' })).getAllByRole('listitem')).toHaveLength(2)
    await answerCorrectly(user, q)
    const expected = 10 + 5 * (q.difficulty - 1) + 5 * ((('clues' in q && q.clues?.length) || 0) - 2)
    expect(await screen.findByText(`Correto! +${expected} pts`)).toBeInTheDocument()
  })

  it('Contra o tempo mostra a contagem regressiva e as tentativas', async () => {
    const { user } = setup('/livre/contra-o-tempo', withProfile())
    await user.click(await screen.findByRole('button', { name: /começar/i }))
    expect(screen.getByLabelText('60 segundos restantes')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 de 3 tentativas restantes' })).toBeInTheDocument()
  })

  it('desafio diário: recompensa uma vez por dia', async () => {
    const { user, services } = setup('/diario', withProfile())
    await user.click(await screen.findByRole('button', { name: /^começar/i }))
    for (let i = 0; i < 5; i++) {
      await answerCorrectly(user, currentQuestion())
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: 'Desafio diário concluído' })).toBeInTheDocument()
    const xp = services.progress.load().xp
    expect(services.progress.load().daily.completedCount).toBe(1)
    await user.click(screen.getByRole('link', { name: /jogar novamente/i }))
    expect(await screen.findByRole('button', { name: /treinar novamente \(sem recompensa\)/i })).toBeInTheDocument()
    expect(services.progress.load().xp).toBe(xp)
  })

  it('multiplayer fica no Modo Livre e identifica a demonstração', async () => {
    const { user } = setup('/livre/multiplayer', withProfile('ate12'))
    expect(await screen.findByText(/servidor online: desconectado/i)).toBeInTheDocument()
    expect(screen.getByText('Proteção para menores')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /criar sala de demonstração/i }))
    expect(await screen.findAllByText('Fictício')).toHaveLength(3)
    expect(screen.getByRole('button', { name: /convidar amigos/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }))
    expect(await screen.findByRole('complementary', { name: 'Placar' })).toBeInTheDocument()
  })

  it('endereços antigos redirecionam para o Modo História', async () => {
    setup('/mapa', withProfile())
    expect(await screen.findByRole('heading', { name: 'A grande jornada bíblica' })).toBeInTheDocument()
  })

  it('ranking identifica dados de exemplo', async () => {
    setup('/ranking', withProfile())
    expect(await screen.findByText('Ranking de demonstração')).toBeInTheDocument()
    expect(screen.getAllByText('Exemplo').length).toBeGreaterThan(3)
  })

  it('telas protegidas redirecionam para o cadastro sem perfil', async () => {
    setup('/livre')
    expect(await screen.findByRole('heading', { name: /crie seu perfil local/i })).toBeInTheDocument()
  })

  it('configurações de acessibilidade são aplicadas e persistidas', async () => {
    const { user, services } = setup('/configuracoes')
    await user.click(screen.getByLabelText('Extra grande'))
    await user.click(screen.getByRole('switch', { name: 'Alto contraste' }))
    await waitFor(() => expect(document.documentElement.dataset.font).toBe('extra'))
    expect(services.settings.load()).toMatchObject({ fontScale: 'extra', highContrast: true })
  })

  it('painel administrativo cria pergunta local e a usa no Modo Livre', async () => {
    const { user, services } = setup('/admin', withProfile())
    await user.click(await screen.findByRole('button', { name: /entendi/i }))
    await user.click(screen.getByRole('tab', { name: 'Perguntas' }))
    await user.click(screen.getByRole('button', { name: 'Nova pergunta' }))
    const form = screen.getByRole('form', { name: 'Nova pergunta local' })
    await user.selectOptions(within(form).getByLabelText('Livro'), 'salmos')
    await user.type(within(form).getByLabelText('Referência bíblica'), 'Salmos 150')
    await user.type(within(form).getByLabelText('Enunciado'), 'Quantos salmos tem o livro de Salmos?')
    await user.type(within(form).getByLabelText(/Alternativas/), '150{enter}100{enter}120')
    await user.type(within(form).getByLabelText('Explicação'), 'O livro de Salmos tem 150 salmos.')
    await user.click(within(form).getByRole('button', { name: /salvar/i }))
    expect(await screen.findByText('Quantos salmos tem o livro de Salmos?')).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: /usar perguntas locais/i }))
    const content = services.content.load()
    expect(content.questions).toHaveLength(1)
    expect(content.includeInFreeMode).toBe(true)
  })

  it('página inexistente mostra mensagem amigável', async () => {
    setup('/nao-existe')
    expect(await screen.findByRole('heading', { name: /não está no mapa/i })).toBeInTheDocument()
  })
})
