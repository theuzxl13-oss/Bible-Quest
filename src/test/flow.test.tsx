import { describe, expect, it } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { getQuestion } from '../data/questions'
import type { CharacterAppearance, Question } from '../types'

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

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}

function withProfile(ageRange: 'ate12' | '13a17' | '18mais' = '18mais') {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const p = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange })
  s.auth.update({ ...p, character: structuredClone(CHAR) })
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
  it('cadastro → criação do personagem → mapa → fase → cena → desafio → estrelas e XP → avatar avança', async () => {
    const { user, services } = setup('/entrar')
    await user.type(screen.getByLabelText('Nome ou apelido'), 'Lia')
    await user.click(screen.getByLabelText('18 anos ou mais'))
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    // etapa 3: escolha do personagem-base
    expect(await screen.findByRole('heading', { name: /quem vai percorrer a jornada/i })).toBeInTheDocument()
    await user.click(screen.getByLabelText(/^Pastora/))
    await user.click(screen.getByRole('button', { name: /personalizar/i }))

    // etapa 4: personalização com prévia em tempo real
    expect(await screen.findByRole('heading', { name: /personalize seu aventureiro/i })).toBeInTheDocument()
    const preview = () => screen.getByRole('img', { name: /prévia de/i }).getAttribute('data-appearance')
    expect(preview()).toContain('pastora')
    const nameInput = screen.getByLabelText('Nome do personagem')
    await user.clear(nameInput)
    await user.type(nameInput, 'Rute Viajante')
    await user.click(screen.getByLabelText('Longo'))
    await user.click(screen.getByRole('tab', { name: 'Túnicas' }))
    await user.click(screen.getByRole('button', { name: /túnica de linho\./i }))
    expect(preview()).toContain('tunica-linho')
    await user.click(screen.getByRole('tab', { name: 'Mantos' }))
    expect(screen.getByRole('button', { name: /manto marrom\. equipado; toque para retirar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manto azul-escuro\. bloqueado: alcance o nível 2/i })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Acessórios' }))
    await user.click(screen.getByRole('button', { name: /lamparina de barro \(na mão\)\. toque para equipar/i }))
    expect(preview()).toContain('lamparina')
    expect(preview()).not.toContain('cajado')
    await user.click(screen.getByRole('button', { name: /finalizar personagem/i }))
    const saved = services.auth.current()!.character!
    expect(saved).toMatchObject({ name: 'Rute Viajante', base: 'pastora', hairStyle: 'longo', equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', acessorios: ['lamparina'] } })

    // etapa 5: chegada e entrada no jogo
    expect(await screen.findByRole('heading', { name: /rute viajante chega ao universo bible quest/i })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /entrar no jogo/i }))
    await user.click((await screen.findAllByRole('link', { name: /modo história/i }))[0])

    // mapa: abertura do mundo, fase 1 atual, fase 2 bloqueada
    await user.click(await screen.findByRole('button', { name: /entrar no mundo/i }))
    expect(screen.getByRole('heading', { name: 'Rute Viajante' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fase 1: a criação do mundo\. fase atual/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /fase 2: .*bloqueada/i }))
    expect(await screen.findByText(/conclua a fase 1/i)).toBeInTheDocument()

    // tela da fase: personagens, referência, quantidade e dificuldade
    await user.click(screen.getByRole('link', { name: /fase 1: a criação do mundo/i }))
    expect(await screen.findByRole('heading', { name: 'A criação do mundo' })).toBeInTheDocument()
    expect(screen.getByText('10 perguntas')).toBeInTheDocument()
    expect(screen.getByText('Gênesis 1:1–2:3')).toBeInTheDocument()

    // cena narrativa
    await user.click(screen.getByRole('link', { name: /iniciar fase/i }))
    expect(await screen.findByRole('heading', { name: 'Introdução' })).toBeInTheDocument()
    for (let i = 0; i < 10; i++) {
      const next = screen.queryByRole('button', { name: /^continuar/i })
      if (!next) break
      await user.click(next)
    }
    expect(screen.getByRole('heading', { name: 'Aprendizado' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /começar o desafio \(10 perguntas\)/i }))

    await playStoryChallenge(user)
    expect(await screen.findByRole('heading', { name: /fase concluída/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 de 3 estrelas' })).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    const p = services.progress.load()
    expect(p.experiences['gn-criacao']).toMatchObject({ completed: true, bestStars: 3 })
    expect(p.xp).toBeGreaterThan(100)

    // continuar a jornada: avatar vai para a fase 2, agora liberada
    await user.click(screen.getByRole('link', { name: /continuar a jornada/i }))
    expect(await screen.findByRole('link', { name: /fase 1: a criação do mundo\. concluída, 3 de 3 estrelas/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fase 2: a criação do homem e da mulher\. fase atual/i })).toBeInTheDocument()
    await waitFor(() => expect(services.progress.load().mapCursor).toBe('gn-homem-mulher'), { timeout: 4000 })
  })

  it('abaixo de 60% a fase não é concluída e não libera a próxima', async () => {
    const { user, services } = setup('/historia/genesis/gn-noe/desafio', (() => {
      const store = withProfile()
      const s = createLocalServices(store)
      const p = s.progress.load()
      for (const id of ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel', 'gn-corrupcao']) p.experiences[id] = { completed: true, bestStars: 3, bestScore: 50, attempts: 1 }
      s.progress.save(p)
      return store
    })())
    for (let i = 0; i < 6; i++) {
      const q = currentQuestion()
      if (q.type === 'truefalse') await user.click(screen.getByRole('button', { name: q.answer ? 'Falso' : 'Verdadeiro' }))
      else if ('options' in q) await user.click(within(screen.getByRole('group', { name: 'Alternativas' })).getByRole('button', { name: q.options.find((_, idx) => idx !== q.answer)! }))
      else throw new Error('tipo ' + q.type)
      expect(await screen.findByText(/não foi desta vez/i)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: /ainda não foi desta vez/i })).toBeInTheDocument()
    expect(services.progress.load().experiences['gn-noe'].completed).toBe(false)
  })

  it('entrar numa fase desbloqueia as fichas da Biblioteca', async () => {
    const { services } = setup('/historia/genesis/gn-criacao', withProfile())
    expect(await screen.findByText(/nova ficha na biblioteca/i)).toBeInTheDocument()
    expect(services.progress.load().library.places.eden).toBeTruthy()
  })

  it('baú do mapa abre uma vez e concede XP', async () => {
    const store = withProfile()
    const s = createLocalServices(store)
    const p = s.progress.load()
    for (const e of ['gn-criacao', 'gn-homem-mulher', 'gn-eden', 'gn-queda', 'gn-caim-abel']) p.experiences[e] = { completed: true, bestStars: 2, bestScore: 50, attempts: 1 }
    p.worldsSeen = ['mundo-genesis']
    p.mapCursor = 'gn-corrupcao'
    s.progress.save(p)
    const { user, services } = setup('/historia', store)
    await user.click(await screen.findByRole('button', { name: /abrir baú de recompensa \(\+40 xp\)/i }))
    await user.click(screen.getByRole('button', { name: 'Abrir baú' }))
    expect(await screen.findByRole('heading', { name: '+40 XP' })).toBeInTheDocument()
    expect(services.progress.load().xp).toBe(40)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('button', { name: 'Baú já aberto' })).toBeInTheDocument()
  })

  it('revisão inteligente recomenda e treina as perguntas erradas', async () => {
    const store = withProfile()
    const s = createLocalServices(store)
    const p = s.progress.load()
    p.review = { 'no-01': { seen: 2, wrong: 2, lastWrong: true, lastSeen: '2026-11-10T00:00:00Z' }, 'no-03': { seen: 1, wrong: 1, lastWrong: true, lastSeen: '2026-11-10T00:00:00Z' }, 'no-04': { seen: 1, wrong: 0, lastWrong: false, lastSeen: '2026-11-10T00:00:00Z' } }
    s.progress.save(p)
    const { user, services } = setup('/revisao', store)
    expect(await screen.findByText(/fase 7 · noé, um homem justo/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Revisar 2 perguntas' }))
    for (let i = 0; i < 2; i++) {
      await answerCorrectly(user, currentQuestion())
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: 'Revisão concluída' })).toBeInTheDocument()
    expect(services.progress.load().review['no-01'].lastWrong).toBe(false)
  })

  it('fases bloqueadas não abrem por URL', async () => {
    setup('/historia/genesis/gn-babel', withProfile())
    expect(await screen.findByRole('navigation', { name: 'Mundos da jornada' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'A torre de Babel' })).not.toBeInTheDocument()
  })

  it('livro em preparação mostra aviso e leva ao Modo Livre', async () => {
    setup('/historia/apocalipse', withProfile())
    expect(await screen.findByRole('heading', { name: 'Em preparação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir para o modo livre/i })).toBeInTheDocument()
  })

  it('Modo Livre: verdadeiro ou falso de ponta a ponta, XP no mesmo perfil', async () => {
    const { user, services } = setup('/livre', withProfile())
    expect(await screen.findByRole('heading', { name: 'Desafios bíblicos' })).toBeInTheDocument()
    for (const t of ['Perguntas aleatórias', 'Verdadeiro ou falso', 'Complete o versículo', 'Quem sou eu?', 'Contra o tempo', 'Ordem dos acontecimentos', 'Identifique o livro', 'Desafios por personagem', 'Desafios por tema', 'Desafios por dificuldade']) {
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
    expect(await screen.findByRole('navigation', { name: 'Mundos da jornada' })).toBeInTheDocument()
  })

  it('sem perfil com personagem, a jornada pede a criação do personagem', async () => {
    const store = new MemoryStore()
    createLocalServices(store).auth.createLocalProfile({ nickname: 'Sem', avatar: 'lamp', ageRange: '18mais' })
    setup('/historia', store)
    expect(await screen.findByRole('heading', { name: /quem vai percorrer a jornada/i })).toBeInTheDocument()
  })

  it('ranking não inventa jogadores e mostra só os recordes locais', async () => {
    const { user } = setup('/ranking', withProfile())
    expect(await screen.findByText('Ranking online indisponível')).toBeInTheDocument()
    expect(screen.queryByText(/Exemplo/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Modo História' }))
    expect(screen.getByText('Fases concluídas')).toBeInTheDocument()
  })

  it('Modo Livre por dificuldade: Especialista só com perguntas difíceis e cronômetro', async () => {
    const { user } = setup('/livre/dificuldade', withProfile())
    await user.click(await screen.findByLabelText('Especialista'))
    await user.click(screen.getByLabelText('5'))
    await user.click(screen.getByRole('button', { name: /começar/i }))
    expect(screen.getByLabelText('100 segundos restantes')).toBeInTheDocument()
    expect(currentQuestion().difficulty).toBe(3)
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
