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
  const { unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={services}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
  return { user, services, store, unmount }
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
    await user.click(screen.getByRole('tab', { name: 'Cabelo' }))
    await user.click(screen.getByLabelText('Longo'))
    await user.click(screen.getByRole('tab', { name: 'Túnica' }))
    await user.click(screen.getByRole('button', { name: /túnica de linho\./i }))
    expect(preview()).toContain('tunica-linho')
    await user.click(screen.getByRole('tab', { name: 'Manto' }))
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
    expect(screen.getByRole('heading', { name: 'Mundo 1: Gênesis', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Modo História', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fase 1: a criação do mundo\. fase atual/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /fase 2: .*bloqueada/i }))
    // fase bloqueada: a janela explica o requisito e não tem botão de começar
    const bloqueada = await screen.findByRole('dialog', { name: 'A criação do homem e da mulher' })
    expect(within(bloqueada).getByText(/conclua a fase 1/i)).toBeInTheDocument()
    expect(within(bloqueada).queryByRole('button', { name: /começar fase/i })).not.toBeInTheDocument()
    await user.click(within(bloqueada).getByRole('button', { name: 'Fechar' }))

    // apresentação da fase: referência, objetivo, dificuldade e recompensa
    await user.click(screen.getByRole('button', { name: /fase 1: a criação do mundo/i }))
    const janela = await screen.findByRole('dialog', { name: 'A criação do mundo' })
    expect(within(janela).getByText(/responda 10 perguntas/i)).toBeInTheDocument()
    expect(within(janela).getByText('Gênesis 1:1–2:3')).toBeInTheDocument()
    expect(within(janela).getByText(/\+ 50 XP na primeira conclusão/i)).toBeInTheDocument()

    // cena narrativa
    await user.click(within(janela).getByRole('button', { name: /começar fase/i }))
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
    expect(await screen.findByRole('button', { name: /fase 1: a criação do mundo\. concluída, 3 de 3 estrelas/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fase 2: a criação do homem e da mulher\. fase atual/i })).toBeInTheDocument()
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
    expect(await screen.findByRole('region', { name: 'Mapa da jornada' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'A torre de Babel' })).not.toBeInTheDocument()
  })

  it('livro em preparação mostra aviso e leva ao Modo Quiz', async () => {
    setup('/historia/apocalipse', withProfile())
    expect(await screen.findByRole('heading', { name: 'Em preparação' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir para o modo quiz/i })).toBeInTheDocument()
  })

  it('treino livre (endereço antigo /livre): verdadeiro ou falso de ponta a ponta, XP no mesmo perfil', async () => {
    const { user, services } = setup('/livre', withProfile())
    expect(await screen.findByRole('heading', { name: 'Treino livre' })).toBeInTheDocument()
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
    expect(await screen.findByRole('region', { name: 'Mapa da jornada' })).toBeInTheDocument()
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

  it('central do acampamento: personagem, cabeçalho, missões, os dois modos e o menu inferior', async () => {
    const { user } = setup('/painel', withProfile())
    expect(await screen.findByRole('heading', { name: 'Tobias', level: 1 })).toBeInTheDocument()
    // cabeçalho com dados reais (nível, XP, estrelas, sequência), sem moedas inventadas
    expect(screen.getByRole('progressbar', { name: 'Progresso para o próximo nível' })).toBeInTheDocument()
    expect(screen.getByLabelText('0 estrelas conquistadas')).toBeInTheDocument()
    expect(screen.queryByText(/moedas?/i)).not.toBeInTheDocument()
    // modos de jogo
    const modos = screen.getByRole('navigation', { name: 'Modos de jogo' })
    expect(within(modos).getByRole('link', { name: /modo história.*explore as escrituras/i })).toHaveAttribute('href', '/historia')
    expect(within(modos).getByRole('link', { name: /modo quiz.*teste seu conhecimento/i })).toHaveAttribute('href', '/quiz')
    // quadro de missões e próxima melhoria do acampamento
    expect(screen.getByRole('link', { name: /desafio diário/i })).toHaveAttribute('href', '/diario')
    expect(screen.getByText(/próximo no acampamento: jarros de barro/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progresso geral' })).toBeInTheDocument()
    // menu inferior no estilo de jogo
    const menu = screen.getByRole('navigation', { name: 'Navegação rápida' })
    for (const name of ['Início', 'Personagem', 'Conquistas', 'Biblioteca', 'Perfil']) expect(within(menu).getByRole('link', { name })).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveClass('active')
    // personagem em corpo inteiro no centro (cenário 2D nos testes, sem WebGL)
    expect(document.querySelector('.home-char .character')).not.toHaveClass('is-portrait')
    // objetos do acampamento levam às funções reais
    await user.click(screen.getByRole('button', { name: /^biblioteca/i }))
    expect(await screen.findByRole('heading', { name: /personagens, livros, lugares/i, level: 1 })).toBeInTheDocument()
  })

  it('mapa do Modo Quiz: desafio concluído libera o próximo, com bônus da primeira vez', async () => {
    const { user, services } = setup('/quiz', withProfile())
    expect(await screen.findByRole('heading', { name: 'Vale dos Iniciantes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vale dos iniciantes, desafio 2: perguntas aleatórias\. bloqueado/i })).toBeInTheDocument()
    // trilha própria do Quiz: dificuldade, tipo de desafio e recompensa na apresentação
    expect(screen.getByRole('combobox', { name: /dificuldade/i })).toHaveValue('vale')
    await user.click(screen.getByRole('button', { name: /vale dos iniciantes, desafio 1: verdadeiro ou falso\. disponível/i }))
    const janela = await screen.findByRole('dialog', { name: 'Verdadeiro ou falso' })
    expect(within(janela).getByText('Iniciante')).toBeInTheDocument()
    expect(within(janela).getByText(/\+ 30 XP na primeira conclusão/i)).toBeInTheDocument()
    await user.click(within(janela).getByRole('button', { name: /começar desafio/i }))
    for (let i = 0; i < 6; i++) {
      await answerCorrectly(user, currentQuestion())
      await user.click(screen.getByRole('button', { name: /próxima pergunta|ver resultado/i }))
    }
    expect(await screen.findByRole('heading', { name: 'Desafio concluído!' })).toBeInTheDocument()
    expect(screen.getByText(/próximo desafio liberado: perguntas aleatórias/i)).toBeInTheDocument()
    const p = services.progress.load()
    expect(p.quiz.nodes['vale-1']).toMatchObject({ completed: true, bestStars: 3 })
    expect(p.history[0]).toMatchObject({ mode: 'quiz', quizNodeId: 'vale-1', xp: p.history[0].score + 30 })
    // o mapa de desafios é independente do Modo História
    expect(Object.keys(p.experiences)).toHaveLength(0)
    await user.click(screen.getByRole('link', { name: /voltar ao mapa do quiz/i }))
    expect(await screen.findByRole('button', { name: /vale dos iniciantes, desafio 2: perguntas aleatórias\. disponível/i })).toBeInTheDocument()
  })

  it('desafio bloqueado do Quiz não abre por URL', async () => {
    setup('/quiz/desafio/torre-6', withProfile())
    expect(await screen.findByText(/este desafio ainda está bloqueado/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /começar desafio/i })).not.toBeInTheDocument()
  })

  it('tela de recompensa: item desbloqueado pode ser equipado e aparece no personagem', async () => {
    const store = withProfile()
    const s = createLocalServices(store)
    const p = s.progress.load()
    s.progress.save({ ...p, xp: 5000, items: { unlocked: { 'manto-azul': '2026-11-11T00:00:00.000Z' }, unseen: ['manto-azul'] } })
    const { user, services } = setup('/painel', store)
    const dialog = await screen.findByRole('dialog', { name: 'Manto azul-escuro' })
    expect(within(dialog).getByText(/motivo: alcance o nível 2/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Equipar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(services.auth.current()!.character!.equipped.manto).toBe('manto-azul')
    expect(services.progress.load().items.unseen).toEqual([])
    expect(document.querySelector('.home-char .character')!.getAttribute('data-appearance')).toContain('|manto-azul|')
  })

  it('a mesma aparência aparece em todas as telas, inclusive depois de recarregar', async () => {
    const store = withProfile()
    const expected = (() => {
      const { unmount } = setup('/painel', store)
      const a = document.querySelector('.home-char .character')!.getAttribute('data-appearance')!
      unmount()
      return a
    })()
    expect(expected).toBe('viajante|2|suave|cacheado|0|tunica-linho|manto-marrom|sandalias-simples|cinto-couro|cajado|masculino|nenhuma|-/-')
    for (const path of ['/painel', '/historia', '/quiz', '/quiz/desafio/vale-1', '/historia/genesis/gn-criacao', '/perfil', '/guarda-roupa']) {
      const { unmount } = setup(path, store) // nova montagem = recarregar a página
      await waitFor(() => expect(document.querySelectorAll('.character[data-appearance]').length).toBeGreaterThan(0))
      const shown = new Set(Array.from(document.querySelectorAll('.character[data-appearance]:not(.item-preview .character):not(.option-preview .character)')).map((e) => e.getAttribute('data-appearance')))
      expect([...shown], path).toEqual([expected])
      unmount()
    }
  })

  it('guarda-roupa: corpo, barba e tingimento são salvos e aparecem no personagem', async () => {
    const store = withProfile()
    const { user, services } = setup('/guarda-roupa', store)
    await user.click(await screen.findByRole('tab', { name: 'Barba' }))
    await user.click(screen.getByLabelText('Cheia'))
    await user.click(screen.getByRole('tab', { name: 'Túnica' }))
    await user.click(screen.getByLabelText('Índigo'))
    await user.click(screen.getByRole('button', { name: 'Salvar personagem' }))
    const c = services.auth.current()!.character!
    expect(c).toMatchObject({ beard: 'cheia', dyes: { tunica: 4 } })
    expect(document.querySelector('.wardrobe-preview .character')!.getAttribute('data-appearance')).toMatch(/\|masculino\|cheia\|4\/-$/)
    // estrutura feminina remove a barba
    await user.click(screen.getByRole('tab', { name: 'Rosto' }))
    await user.click(screen.getByLabelText('Feminino'))
    expect(screen.queryByRole('tab', { name: 'Barba' })).not.toBeInTheDocument()
    // remover acessórios e voltar ao padrão
    await user.click(screen.getByRole('button', { name: 'Remover acessórios' }))
    expect(document.querySelector('.wardrobe-preview .character')!.getAttribute('data-appearance')).toMatch(/\|sandalias-simples\|cinto-couro\|\|/)
    await user.click(screen.getByRole('button', { name: 'Restaurar aparência original' }))
    expect(document.querySelector('.wardrobe-preview .character')!.getAttribute('data-appearance')).toMatch(/^viajante\|1\|suave\|curto/)
  })

  it('editor: cores livres e expressão aparecem no personagem e são salvas', async () => {
    const store = withProfile()
    const { user, services } = setup('/guarda-roupa', store)
    await user.click(await screen.findByRole('tab', { name: 'Cores' }))
    await user.click(screen.getByLabelText('Cabelo: cor #d8b26a'))
    await user.click(screen.getByLabelText('Túnica: cor #2f4766'))
    await user.click(screen.getByRole('tab', { name: 'Rosto' }))
    await user.click(screen.getByLabelText('Sorriso'))
    expect(document.querySelector('.wardrobe-preview .character')!.getAttribute('data-appearance')).toMatch(/cabelo=#d8b26a,tunica=#2f4766\|sorriso$/)
    await user.click(screen.getByRole('button', { name: 'Salvar personagem' }))
    expect(services.auth.current()!.character).toMatchObject({ cores: { cabelo: '#d8b26a', tunica: '#2f4766' }, expressao: 'sorriso' })
  })

  it('ficha de personagem traz o contexto histórico da linha do tempo', async () => {
    const store = withProfile()
    const s2 = createLocalServices(store)
    const p = s2.progress.load()
    s2.progress.save({ ...p, library: { ...p.library, characters: { ...p.library.characters, abraao: '2026-11-12T00:00:00.000Z' } } })
    setup('/biblioteca/personagem/abraao', store)
    expect(await screen.findByRole('heading', { name: 'Contexto histórico' })).toBeInTheDocument()
    expect(screen.getAllByText(/sequência bíblica|data estimada|data debatida/i).length).toBeGreaterThan(0)
  })

  it('boas-vindas mostra o personagem de quem já começou a jornada', async () => {
    setup('/boas-vindas', withProfile())
    expect(await screen.findByRole('link', { name: /continuar jornada/i })).toBeInTheDocument()
    expect(document.querySelector('.welcome-char .character')!.getAttribute('data-appearance')).toMatch(/^viajante\|2\|suave\|cacheado/)
  })

  it('página inexistente mostra mensagem amigável', async () => {
    setup('/nao-existe')
    expect(await screen.findByRole('heading', { name: /não está no mapa/i })).toBeInTheDocument()
  })
})
