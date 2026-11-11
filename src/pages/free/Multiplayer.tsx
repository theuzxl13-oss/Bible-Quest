import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AnswerResult } from '../../types'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { QuestionView } from '../../components/QuestionView'
import { Avatar, DemoTag, Notice, ProgressBar } from '../../components/ui'
import { BOOKS } from '../../data/bible/canon'
import { getQuestion } from '../../data/questions'
import { checkAnswer, type AnswerResponse } from '../../services/game/answers'
import { summarizeMatch, timeAttackPoints } from '../../services/game/scoring'
import { QUICK_REACTIONS, type QuickReaction, type Room } from '../../services/multiplayer/contracts'
import { createMultiplayerService } from '../../services/multiplayer/supabaseMultiplayer'
import { useGame } from '../../state/GameContext'

type Phase = 'lobby' | 'room' | 'playing' | 'finished'

/** Segundos para responder cada pergunta na partida. */
export const MP_QUESTION_SECONDS = 20

export default function Multiplayer() {
  const { profile, recordMatch, questionPool } = useGame()
  const service = useMemo(() => createMultiplayerService(), [])
  const [phase, setPhase] = useState<Phase>('lobby')
  const [room, setRoom] = useState<Room | null>(null)
  const [theme, setTheme] = useState('todas')
  const [count, setCount] = useState(5)
  const [code, setCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<AnswerResponse | null>(null)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [correctBy, setCorrectBy] = useState<Record<string, number>>({})
  const [left, setLeft] = useState(MP_QUESTION_SECONDS)
  const [reactions, setReactions] = useState<{ id: number; who: string; text: QuickReaction }[]>([])
  const reactionId = useRef(0)
  const started = useRef(Date.now())

  const themes = BOOKS.filter((b) => questionPool.filter((q) => q.bookId === b.id && q.type !== 'memory' && q.type !== 'order').length >= 10)

  useEffect(() => {
    if (!room) return
    return service.subscribe(room.id, (e) => {
      if (e.type === 'room-updated' || e.type === 'match-finished') setRoom(e.room)
      if (e.type === 'answer-submitted' && e.correct) setCorrectBy((c) => ({ ...c, [e.playerId]: (c[e.playerId] ?? 0) + 1 }))
      if (e.type === 'reaction') {
        const id = ++reactionId.current
        setReactions((r) => [...r.slice(-3), { id, who: e.playerId === 'you' ? 'Você' : 'Participante fictício', text: e.reaction }])
      }
    })
  }, [room?.id, service]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (room) void service.leaveRoom(room.id)
  }, [room?.id, service]) // eslint-disable-line react-hooks/exhaustive-deps

  const q = room ? getQuestion(room.questionIds[index], questionPool) : undefined

  // contagem regressiva por pergunta
  useEffect(() => {
    if (phase !== 'playing' || answer) return
    started.current = Date.now()
    setLeft(MP_QUESTION_SECONDS)
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000)
    return () => window.clearInterval(t)
  }, [phase, index, answer])

  const onAnswer = async (r: AnswerResponse) => {
    if (!room || !q || answer) return
    setAnswer(r)
    const res = checkAnswer(q, r)
    const points = res.correct ? timeAttackPoints(q.difficulty, (Date.now() - started.current) / 1000) : 0
    if (res.correct) res.points = points
    setResults((prev) => [...prev, res])
    await service.submitAnswer(room.id, 'you', q.id, res.correct, points)
  }

  useEffect(() => {
    if (phase === 'playing' && !answer && left <= 0) void onAnswer({ kind: 'choice', option: '' })
  }, [left]) // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    const r = await service.createRoom({ hostNickname: profile!.nickname, theme, questionCount: count })
    setRoom(r)
    setCorrectBy({})
    setPhase('room')
  }

  const join = async (e: FormEvent) => {
    e.preventDefault()
    setJoinError('')
    try {
      await service.joinRoom(code.trim().toUpperCase(), profile!.nickname)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Não foi possível entrar na sala.')
    }
  }

  const start = async () => {
    if (!room) return
    setRoom(await service.startMatch(room.id))
    setIndex(0)
    setResults([])
    setAnswer(null)
    setPhase('playing')
  }

  const next = () => {
    if (!room) return
    if (index + 1 >= room.questionIds.length) {
      const summary = summarizeMatch(results, room.questionIds.length, Number.POSITIVE_INFINITY)
      const top = room.players.reduce((a, b) => (b.score > a.score ? b : a))
      recordMatch({ mode: 'demo-multiplayer', title: 'Partida demonstrativa', results, summary, demoWin: top.id === 'you' })
      setPhase('finished')
      return
    }
    setIndex(index + 1)
    setAnswer(null)
  }

  const reset = () => {
    if (room) void service.leaveRoom(room.id)
    setRoom(null)
    setPhase('lobby')
  }

  const sorted = room ? [...room.players].sort((a, b) => b.score - a.score) : []
  const winner = sorted[0]
  const lastRes = results[results.length - 1]

  return (
    <div className="mp">
      <div className="mp-statusbar" role="status">
        <div className="container mp-statusbar-inner">
          <span className="server-dot" aria-hidden="true" />
          <span><strong>Servidor online: desconectado.</strong> Modo demonstração local.</span>
          <DemoTag>Demonstração</DemoTag>
        </div>
      </div>

      <div className="container section stack-lg">
        <header className="page-header">
          <Link to="/quiz" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa do Modo Quiz</Link>
          <p className="eyebrow">Modo Quiz · Multiplayer</p>
          <h1>Salas privadas</h1>
        </header>

        {phase === 'lobby' && (
          <>
            <Notice tone="demo" icon="info" title="O que funciona agora e o que depende do servidor">
              Agora você pode criar uma sala de demonstração e jogar contra <strong>participantes fictícios</strong>{' '}
              simulados pelo seu próprio aparelho, para conhecer a experiência. Entrar por código, convidar amigos,
              sincronizar respostas em tempo real e o ranking online <strong>dependem do servidor</strong> (Supabase
              Realtime), que ainda não está conectado. Partidas de demonstração não rendem XP.
            </Notice>
            {profile!.ageRange === 'ate12' && (
              <Notice tone="info" icon="shield" title="Proteção para menores">
                Na versão online, jogadores de até 12 anos só poderão jogar em salas privadas com código, com
                consentimento do responsável.
              </Notice>
            )}
            <div className="mp-grid">
              <section className="panel stack" aria-labelledby="mp-create">
                <ArtImage art="place-petra" className="mp-img" sizes="(min-width: 900px) 45vw, 100vw" />
                <h2 id="mp-create">Criar sala privada</h2>
                <label className="field">
                  <span>Tema das perguntas</span>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="todas">Toda a Bíblia</option>
                    {themes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Número de perguntas</span>
                  <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    {[5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <button type="button" className="btn btn-gold" onClick={create}>Criar sala de demonstração</button>
              </section>

              <section className="panel stack" aria-labelledby="mp-join">
                <h2 id="mp-join">Entrar com código <span className="tag">Requer servidor</span></h2>
                <form onSubmit={join} className="stack">
                  <label className="field">
                    <span>Código de convite</span>
                    <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="Ex.: K7M2QX" autoCapitalize="characters" />
                  </label>
                  <button type="submit" className="btn btn-outline">Entrar</button>
                  {joinError && <p className="form-error" role="alert">{joinError}</p>}
                </form>
                <h3>Regras da versão online</h3>
                <ul className="bullets small">
                  <li>Salas privadas por código, com até 8 jogadores.</li>
                  <li>Todos respondem a mesma pergunta ao mesmo tempo; o servidor valida as respostas.</li>
                  <li>Sem chat livre: apenas reações predefinidas.</li>
                  <li>Denúncia de apelidos e bloqueio de jogadores.</li>
                </ul>
              </section>
            </div>
          </>
        )}

        {phase === 'room' && room && (
          <section className="panel stack mp-room" aria-labelledby="room-t">
            <h2 id="room-t">Sala de espera</h2>
            <div className="room-code-box">
              <span className="small muted">Código da sala</span>
              <strong className="room-code">{room.code}</strong>
              <span className="small muted">Válido só neste aparelho (demonstração)</span>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-outline btn-sm" disabled title="Disponível quando o servidor online estiver ativo">
                <Icon name="users" size={16} /> Convidar amigos
              </button>
              <span className="tag">Requer servidor</span>
            </div>
            <ul className="players">
              {room.players.map((p) => (
                <li key={p.id} className="player">
                  {p.isDemoBot ? <span className="avatar bot-avatar" aria-hidden="true"><Icon name="users" size={16} /></span> : <Avatar id={profile!.avatar} size={32} />}
                  <span>{p.nickname}</span>
                  {p.isHost && <span className="tag">Anfitrião</span>}
                  {p.isDemoBot && <span className="tag tag-demo">Fictício</span>}
                  <span className="ready">Pronto</span>
                </li>
              ))}
            </ul>
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" onClick={reset}>Fechar sala</button>
              <button type="button" className="btn btn-gold" onClick={start}>Iniciar partida demonstrativa</button>
            </div>
          </section>
        )}

        {phase === 'playing' && room && q && (
          <div className="mp-play">
            <div className="stack">
              <div className="mp-qhead">
                <span className="small">Pergunta {index + 1} de {room.questionIds.length}</span>
                <span className={`clock ${!answer && left <= 5 ? 'is-urgent' : ''}`} aria-label={`${Math.max(0, left)} segundos`}>
                  <Icon name="clock" size={14} /> {answer ? '—' : `${Math.max(0, left)}s`}
                </span>
              </div>
              <ProgressBar value={answer ? 0 : Math.max(0, left)} max={MP_QUESTION_SECONDS} label="Tempo para responder" />
              <QuestionView key={q.id} question={q} answered={answer} onAnswer={onAnswer} />
              {answer && (
                <div className={`feedback ${lastRes?.correct ? 'is-correct' : 'is-wrong'}`} role="status">
                  <p>
                    <strong>
                      {lastRes?.correct ? `Correto! +${lastRes.points} pts` : answer.kind === 'choice' && answer.option === '' ? 'Tempo esgotado.' : 'Não foi desta vez.'}
                    </strong>{' '}
                    {q.explanation}
                  </p>
                  <p className="ref"><Icon name="book" size={16} /> {q.reference}</p>
                  <button type="button" className="btn btn-gold btn-block" onClick={next}>
                    {index + 1 >= room.questionIds.length ? 'Ver placar final' : 'Próxima'}
                  </button>
                </div>
              )}
            </div>
            <aside className="panel scoreboard" aria-label="Placar">
              <h2>Placar <DemoTag>Simulado</DemoTag></h2>
              <ol>
                {sorted.map((p, i) => (
                  <li key={p.id} className={p.isDemoBot ? '' : 'is-me'}>
                    <span><span className="podium-pos">{i + 1}</span> {p.nickname}</span>
                    <strong>{p.score}</strong>
                  </li>
                ))}
              </ol>
              <p className="small muted">Reações rápidas (sem chat livre):</p>
              <div className="reactions">
                {QUICK_REACTIONS.map((r) => (
                  <button key={r} type="button" className="chip" onClick={() => room && void service.react(room.id, 'you', r)}>{r}</button>
                ))}
              </div>
              <ul className="reaction-feed" aria-live="polite">
                {reactions.map((r) => <li key={r.id} className="small">{r.who}: {r.text}</li>)}
              </ul>
            </aside>
          </div>
        )}

        {phase === 'finished' && room && winner && (
          <section className="stack" aria-labelledby="fin">
            <div className="panel winner-banner">
              <Icon name="crown" size={36} />
              <p className="eyebrow">Vencedor da partida</p>
              <h2 id="fin">{winner.isDemoBot ? winner.nickname : `${winner.nickname} (você)`}</h2>
              <p className="muted">{winner.score} pontos · resultado simulado <DemoTag>Demonstração</DemoTag></p>
            </div>
            <div className="table-wrap">
              <table className="ranking">
                <caption className="sr-only">Ranking da partida</caption>
                <thead><tr><th scope="col">#</th><th scope="col">Jogador</th><th scope="col">Acertos</th><th scope="col">Pontos</th></tr></thead>
                <tbody>
                  {sorted.map((p, i) => (
                    <tr key={p.id} className={p.isDemoBot ? '' : 'is-me'}>
                      <td>{i + 1}º</td>
                      <td>{p.nickname} {p.isDemoBot && <span className="tag tag-demo">Fictício</span>}</td>
                      <td>{correctBy[p.id] ?? 0}/{room.questionIds.length}</td>
                      <td>{p.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">Partida demonstrativa: não conta para XP nem para o ranking geral.</p>
            <div className="row-actions">
              <button type="button" className="btn btn-outline" onClick={reset}>Nova sala</button>
              <Link to="/quiz" className="btn btn-gold">Voltar ao mapa do Quiz</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
