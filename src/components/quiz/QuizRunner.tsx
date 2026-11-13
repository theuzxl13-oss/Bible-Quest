import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerResult, FreeModeId, MatchRecord, Question } from '../../types'
import { checkAnswer, correctOptionText, type AnswerResponse } from '../../services/game/answers'
import {
  basePoints,
  summarizeMatch,
  timeAttackPoints,
  whoamiPoints,
} from '../../services/game/scoring'
import { useGame } from '../../state/GameContext'
import { Icon } from '../Icon'
import { ProgressBar } from '../ui'
import { QuestionView } from './QuestionView'
import { PlayerCharacter } from '../character/PlayerCharacter'

/** Frases do companheiro (o próprio personagem do jogador), sem falas de personagens bíblicos. */
const ANIMO_ACERTO = ['Muito bem!', 'Isso mesmo!', 'Excelente!', 'Que memória!', 'Continue assim!']
const ANIMO_ERRO = ['Quase! Leia a explicação.', 'Vamos aprender juntos.', 'Na próxima você acerta.']
const ANIMO_INICIO = ['Leia com calma.', 'Você consegue!', 'Pense bem antes de responder.']

export interface QuizRules {
  /** Tentativas (vidas). 0 = sem limite de erros. */
  lives: number
  /** Tempo total da rodada em segundos (Contra o tempo). */
  timeLimit?: number
  /** Pistas progressivas em "Quem sou eu?". */
  progressiveClues?: boolean
  /** Pontos por rapidez (Contra o tempo). */
  speedBonus?: boolean
}

interface Props {
  questions: Question[]
  title: string
  mode: MatchRecord['mode']
  freeMode?: FreeModeId
  /** Desafio do mapa do Modo Quiz. */
  quizNodeId?: string
  bookId?: string
  experienceId?: string
  exitTo: string
  rules: QuizRules
  /** Para onde "Jogar novamente" leva na tela de resultado. */
  replayTo?: string
}

export function QuizRunner({ questions, title, mode, freeMode, quizNodeId, bookId, experienceId, exitTo, rules, replayTo }: Props) {
  const navigate = useNavigate()
  const { recordMatch, settings } = useGame()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [answer, setAnswer] = useState<AnswerResponse | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const questionStart = useRef(Date.now())
  const feedbackRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)

  const q = questions[index]
  const last = results[results.length - 1]
  const errors = results.filter((r) => !r.correct).length
  const livesLeft = rules.lives > 0 ? Math.max(0, rules.lives - errors) : Infinity
  const timeLeft = rules.timeLimit ? Math.max(0, rules.timeLimit - elapsed) : Infinity
  const score = useMemo(() => summarizeMatch(results, questions.length).score, [results, questions.length])
  const showClock = Boolean(rules.timeLimit) || settings.showTimer

  const finish = useCallback(
    (all: AnswerResult[]) => {
      if (finished.current) return
      finished.current = true
      // No Contra o tempo, o total é o número de perguntas efetivamente respondidas.
      const total = rules.timeLimit ? Math.max(1, all.length) : questions.length
      const summary = summarizeMatch(all, total, rules.lives > 0 ? rules.lives : Number.POSITIVE_INFINITY)
      recordMatch({ mode, title, freeMode, quizNodeId, bookId, experienceId, results: all, summary })
      navigate('/resultado', {
        replace: true,
        state: { questionIds: all.map((r) => r.questionId), replayTo, exitTo },
      })
    },
    [rules, questions.length, recordMatch, mode, title, freeMode, quizNodeId, bookId, experienceId, navigate, replayTo, exitTo],
  )

  // relógio: cronômetro informativo ou contagem regressiva
  useEffect(() => {
    if (!showClock) return
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [showClock])

  // fim do tempo no Contra o tempo
  const resultsRef = useRef(results)
  resultsRef.current = results
  useEffect(() => {
    if (rules.timeLimit && timeLeft <= 0) finish(resultsRef.current)
  }, [rules.timeLimit, timeLeft, finish])

  useEffect(() => {
    questionStart.current = Date.now()
  }, [index])

  const onAnswer = useCallback(
    (r: AnswerResponse) => {
      if (answer || finished.current) return
      setAnswer(r)
      const res = checkAnswer(q, r)
      if (res.correct) {
        if (rules.progressiveClues && q.type === 'whoami' && r.kind === 'choice') {
          res.points = whoamiPoints(q.difficulty, r.cluesUsed ?? q.clues?.length ?? 1, q.clues?.length ?? 1)
        } else if (rules.speedBonus) {
          res.points = timeAttackPoints(q.difficulty, (Date.now() - questionStart.current) / 1000)
        }
      }
      if (r.kind === 'choice' && r.cluesUsed) res.cluesUsed = r.cluesUsed
      setResults((prev) => [...prev, res])
    },
    [answer, q, rules],
  )

  useEffect(() => {
    if (answer) feedbackRef.current?.focus()
  }, [answer])

  const outOfLives = rules.lives > 0 && livesLeft <= 0
  const isLast = index + 1 >= questions.length || outOfLives

  const next = () => {
    if (isLast) {
      finish(results)
      return
    }
    setIndex(index + 1)
    setAnswer(null)
  }

  if (!q) return null
  const correct = last?.questionId === q.id ? last.correct : false
  const gained = correct ? (last?.points ?? basePoints(q.difficulty)) : 0
  const correctText = correctOptionText(q)
  const clock = rules.timeLimit ? timeLeft : elapsed
  // sequência atual de acertos (combo)
  let combo = 0
  for (let i = results.length - 1; i >= 0 && results[i].correct; i--) combo++
  const showSteps = !rules.timeLimit && questions.length <= 20
  const animo = answer ? (correct ? ANIMO_ACERTO : ANIMO_ERRO) : ANIMO_INICIO
  const fala = animo[index % animo.length]
  const pose = answer ? (correct ? 'wave' : 'react') : 'idle'

  return (
    <div className={`quiz ${freeMode ? 'quiz-free' : ''}`}>
      <div className="quiz-top">
        <div className="container quiz-top-inner">
          <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Sair da partida">
            <Icon name="x" />
          </button>
          <div className="quiz-progress">
            <span className="small">
              {title} · {rules.timeLimit ? `Pergunta ${index + 1}` : `Pergunta ${index + 1} de ${questions.length}`}
            </span>
            {rules.timeLimit ? (
              <ProgressBar value={timeLeft} max={rules.timeLimit} label="Tempo restante" />
            ) : showSteps ? (
              <ol className="quiz-steps" role="progressbar" aria-label="Progresso da partida" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + (answer ? 1 : 0)}>
                {questions.map((qq, i) => {
                  const r = results[i]
                  const st = r ? (r.correct ? 'is-ok' : 'is-err') : i === index ? 'is-current' : ''
                  return <li key={qq.id} className={`quiz-step ${st}`} />
                })}
              </ol>
            ) : (
              <ProgressBar value={index + (answer ? 1 : 0)} max={questions.length} label="Progresso da partida" />
            )}
          </div>
          <div className="quiz-stats">
            {rules.lives > 0 && (
              <span className="lives" role="img" aria-label={`${livesLeft} de ${rules.lives} tentativas restantes`}>
                {Array.from({ length: rules.lives }, (_, i) => (
                  <Icon key={i} name="heart" size={18} className={i < livesLeft ? 'life-on' : 'life-off'} />
                ))}
              </span>
            )}
            {combo >= 2 && (
              <span key={combo} className="combo" aria-label={`${combo} acertos seguidos`}>
                <Icon name="flame" size={16} /> {combo}
              </span>
            )}
            <span className="score" aria-label={`Pontuação: ${score}`}><span className="score-coin" aria-hidden="true" />{score} pts</span>
            {showClock && (
              <span className={`clock ${rules.timeLimit && timeLeft <= 10 ? 'is-urgent' : ''}`} aria-label={rules.timeLimit ? `${timeLeft} segundos restantes` : 'Tempo decorrido (não afeta a pontuação)'}>
                <Icon name="clock" size={14} /> {Math.floor(clock / 60)}:{String(clock % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>

      {confirmExit && (
        <div className="container">
          <div className="notice notice-warn confirm" role="alertdialog" aria-labelledby="exit-t">
            <p id="exit-t"><strong>Sair da partida?</strong> O progresso desta tentativa será perdido.</p>
            <div className="row-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmExit(false)} autoFocus>Continuar jogando</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => navigate(exitTo)}>Sair</button>
            </div>
          </div>
        </div>
      )}

      <div className="container quiz-stage">
        <aside className="quiz-companion" aria-hidden="true">
          <span key={`${index}-${pose}`} className={`quiz-bubble ${answer ? (correct ? 'is-ok' : 'is-err') : ''}`}>{fala}</span>
          <span className="quiz-pedestal">
            <PlayerCharacter size={190} pose={pose} />
          </span>
        </aside>
        <div className="quiz-body">
        <QuestionView key={q.id} question={q} answered={answer} onAnswer={onAnswer} progressiveClues={rules.progressiveClues} number={rules.timeLimit ? index + 1 : `${index + 1}/${questions.length}`} />

        {answer && (
          <div id="feedback" ref={feedbackRef} tabIndex={-1} className={`feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite">
            {correct && !settings.reduceMotion && (
              <span className="feedback-burst" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => <span key={i} style={{ ['--i' as string]: i }} />)}
              </span>
            )}
            <div className="feedback-head">
              <span className="feedback-seal" aria-hidden="true"><Icon name={correct ? 'check' : 'x'} size={22} /></span>
              <strong>
                {correct ? `Correto! +${gained} pts` : rules.lives > 0 ? 'Não foi desta vez. Você perdeu uma tentativa.' : 'Não foi desta vez.'}
              </strong>
            </div>
            {!correct && correctText && <p>Resposta correta: <strong>{correctText}</strong></p>}
            {!correct && q.type === 'truefalse' && <p>A afirmação é <strong>{q.answer ? 'verdadeira' : 'falsa'}</strong>.</p>}
            <p>{q.explanation}</p>
            <p className="ref"><Icon name="book" size={16} /> {q.reference}</p>
            {outOfLives && <p className="small"><strong>{rules.timeLimit ? 'Limite de erros atingido.' : 'Suas tentativas acabaram.'}</strong> {mode === 'historia' ? 'Revise a experiência e tente novamente.' : ''}</p>}
            <button type="button" className="btn btn-gold btn-block" onClick={next}>
              {isLast ? 'Ver resultado' : 'Próxima pergunta'} <Icon name="arrowRight" />
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
