import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AnswerResult, JourneyId } from '../types'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { QuestionView } from '../components/QuestionView'
import { DemoTag, Notice } from '../components/ui'
import { JOURNEYS } from '../data/journeys'
import { getQuestion } from '../data/questions'
import { checkAnswer, type AnswerResponse } from '../services/game/answers'
import { basePoints, summarizeMatch } from '../services/game/scoring'
import { QUICK_REACTIONS, type QuickReaction, type Room } from '../services/multiplayer/contracts'
import { createMultiplayerService } from '../services/multiplayer/supabaseMultiplayer'
import { useGame } from '../state/GameContext'

type Phase = 'lobby' | 'room' | 'playing' | 'finished'

export default function Multiplayer() {
  const { profile, recordMatch } = useGame()
  const service = useMemo(() => createMultiplayerService(), [])
  const [phase, setPhase] = useState<Phase>('lobby')
  const [room, setRoom] = useState<Room | null>(null)
  const [journeyId, setJourneyId] = useState<JourneyId | 'todas'>('todas')
  const [count, setCount] = useState(5)
  const [code, setCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<AnswerResponse | null>(null)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [reactions, setReactions] = useState<{ id: number; who: string; text: QuickReaction }[]>([])
  const reactionId = useRef(0)

  useEffect(() => {
    if (!room) return
    return service.subscribe(room.id, (e) => {
      if (e.type === 'room-updated') setRoom(e.room)
      if (e.type === 'match-finished') {
        setRoom(e.room)
      }
      if (e.type === 'reaction') {
        const who = e.playerId === 'you' ? 'Você' : 'Participante fictício'
        const id = ++reactionId.current
        setReactions((r) => [...r.slice(-3), { id, who, text: e.reaction }])
      }
    })
  }, [room?.id, service]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    if (room) void service.leaveRoom(room.id)
  }, [room?.id, service]) // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    const r = await service.createRoom({ hostNickname: profile!.nickname, journeyId, questionCount: count })
    setRoom(r)
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

  const q = room ? getQuestion(room.questionIds[index]) : undefined

  const onAnswer = async (r: AnswerResponse) => {
    if (!room || !q || answer) return
    setAnswer(r)
    const res = checkAnswer(q, r)
    setResults((prev) => [...prev, res])
    await service.submitAnswer(room.id, 'you', q.id, res.correct, basePoints(q.difficulty))
  }

  const next = () => {
    if (!room) return
    if (index + 1 >= room.questionIds.length) {
      const summary = summarizeMatch(results, room.questionIds.length, Number.POSITIVE_INFINITY)
      recordMatch({ mode: 'demo-multiplayer', title: 'Partida demonstrativa', results, summary })
      setPhase('finished')
      return
    }
    setIndex(index + 1)
    setAnswer(null)
  }

  const react = (text: QuickReaction) => {
    if (room) void service.react(room.id, 'you', text)
  }

  const reset = () => {
    if (room) void service.leaveRoom(room.id)
    setRoom(null)
    setPhase('lobby')
  }

  const sorted = room ? [...room.players].sort((a, b) => b.score - a.score) : []

  return (
    <div className="container section stack-lg">
      <header className="page-header">
        <p className="eyebrow">Multiplayer <DemoTag>Modo demonstração</DemoTag></p>
        <h1>Salas privadas</h1>
      </header>

      <Notice tone="demo" icon="info" title="Esta tela é uma demonstração, não uma partida online">
        Não há conexão com servidor nesta versão. Os adversários são <strong>participantes fictícios</strong> simulados
        pelo seu próprio dispositivo, só para mostrar como as partidas vão funcionar. O código da sala não funciona em
        outros aparelhos, e partidas demonstrativas não rendem XP.
      </Notice>

      {profile!.ageRange === 'ate12' && (
        <Notice tone="info" icon="shield" title="Proteção para menores">
          Na versão online, jogadores de até 12 anos só poderão jogar em salas privadas com código, com consentimento
          do responsável.
        </Notice>
      )}

      {phase === 'lobby' && (
        <div className="mp-grid">
          <section className="panel stack" aria-labelledby="mp-create">
            <ArtImage art="place-petra" className="mp-img" sizes="(min-width: 900px) 45vw, 100vw" />
            <h2 id="mp-create">Criar sala privada</h2>
            <label className="field">
              <span>Tema das perguntas</span>
              <select value={journeyId} onChange={(e) => setJourneyId(e.target.value as JourneyId | 'todas')}>
                <option value="todas">Todas as jornadas</option>
                {JOURNEYS.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
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
            <h2 id="mp-join">Entrar com código</h2>
            <form onSubmit={join} className="stack">
              <label className="field">
                <span>Código de convite</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} placeholder="Ex.: K7M2QX" autoCapitalize="characters" />
              </label>
              <button type="submit" className="btn btn-outline">Entrar</button>
              {joinError && <p className="form-error" role="alert">{joinError}</p>}
            </form>
            <h3>Como será a versão online</h3>
            <ul className="bullets small">
              <li>Convites por código para salas privadas de até 8 jogadores.</li>
              <li>Respostas sincronizadas e validadas no servidor.</li>
              <li>Sem chat livre: apenas reações predefinidas.</li>
              <li>Denúncia de apelidos e bloqueio de jogadores.</li>
            </ul>
          </section>
        </div>
      )}

      {phase === 'room' && room && (
        <section className="panel stack" aria-labelledby="room-t">
          <h2 id="room-t">Sala criada</h2>
          <p>
            Código de demonstração: <strong className="room-code">{room.code}</strong>{' '}
            <span className="small muted">(válido só neste aparelho)</span>
          </p>
          <ul className="players">
            {room.players.map((p) => (
              <li key={p.id} className="player">
                <Icon name={p.isDemoBot ? 'users' : 'user'} />
                <span>{p.nickname}</span>
                {p.isHost && <span className="tag">Anfitrião</span>}
                {p.isDemoBot && <span className="tag tag-demo">Fictício</span>}
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
            <p className="small muted">Pergunta {index + 1} de {room.questionIds.length}</p>
            <QuestionView key={q.id} question={q} answered={answer} onAnswer={onAnswer} />
            {answer && (
              <div className={`feedback ${results[results.length - 1]?.correct ? 'is-correct' : 'is-wrong'}`} role="status">
                <p><strong>{results[results.length - 1]?.correct ? 'Correto!' : 'Não foi desta vez.'}</strong> {q.explanation}</p>
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
              {sorted.map((p) => (
                <li key={p.id} className={p.isDemoBot ? '' : 'is-me'}>
                  <span>{p.nickname}</span>
                  <strong>{p.score}</strong>
                </li>
              ))}
            </ol>
            <p className="small muted">Reações rápidas (sem chat livre):</p>
            <div className="reactions">
              {QUICK_REACTIONS.map((r) => (
                <button key={r} type="button" className="chip" onClick={() => react(r)}>{r}</button>
              ))}
            </div>
            <ul className="reaction-feed" aria-live="polite">
              {reactions.map((r) => <li key={r.id} className="small">{r.who}: {r.text}</li>)}
            </ul>
          </aside>
        </div>
      )}

      {phase === 'finished' && room && (
        <section className="panel stack" aria-labelledby="fin">
          <h2 id="fin">Placar final <DemoTag>Simulado</DemoTag></h2>
          <ol className="podium">
            {sorted.map((p, i) => (
              <li key={p.id} className={p.isDemoBot ? '' : 'is-me'}>
                <span className="podium-pos">{i + 1}º</span> {p.nickname} <strong>{p.score} pts</strong>
              </li>
            ))}
          </ol>
          <p className="small muted">Resultado de demonstração: não conta para XP nem para o ranking.</p>
          <div className="row-actions">
            <button type="button" className="btn btn-outline" onClick={reset}>Nova sala</button>
            <Link to="/painel" className="btn btn-gold">Voltar ao painel</Link>
          </div>
        </section>
      )}
    </div>
  )
}
