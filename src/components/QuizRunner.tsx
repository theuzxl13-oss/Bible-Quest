import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerResult, JourneyId, MatchRecord, Question } from '../types'
import { checkAnswer, correctOptionText, type AnswerResponse } from '../services/game/answers'
import { MAX_LIVES, basePoints, summarizeMatch } from '../services/game/scoring'
import { useGame } from '../state/GameContext'
import { Icon } from './Icon'
import { ProgressBar } from './ui'
import { QuestionView } from './QuestionView'

interface Props {
  questions: Question[]
  title: string
  mode: MatchRecord['mode']
  journeyId?: JourneyId
  chapterId?: string
  exitTo: string
  /** Vidas só se aplicam aos capítulos. */
  useLives?: boolean
}

export function QuizRunner({ questions, title, mode, journeyId, chapterId, exitTo, useLives = true }: Props) {
  const navigate = useNavigate()
  const { recordMatch, settings } = useGame()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<AnswerResult[]>([])
  const [answer, setAnswer] = useState<AnswerResponse | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const finished = useRef(false)

  const q = questions[index]
  const last = results[results.length - 1]
  const lives = useLives ? MAX_LIVES - results.filter((r) => !r.correct).length : MAX_LIVES
  const score = useMemo(() => summarizeMatch(results, questions.length).score, [results, questions.length])

  useEffect(() => {
    if (!settings.showTimer) return
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [settings.showTimer])

  const onAnswer = useCallback(
    (r: AnswerResponse) => {
      if (answer) return
      setAnswer(r)
      setResults((prev) => [...prev, checkAnswer(q, r)])
    },
    [answer, q],
  )

  useEffect(() => {
    if (answer) feedbackRef.current?.focus()
  }, [answer])

  const finish = (all: AnswerResult[]) => {
    if (finished.current) return
    finished.current = true
    const summary = summarizeMatch(all, questions.length, useLives ? MAX_LIVES : Number.POSITIVE_INFINITY)
    recordMatch({ mode, title, journeyId, chapterId, results: all, summary })
    navigate('/resultado', { replace: true, state: { questionIds: questions.map((x) => x.id), answered: all.map((r) => r.questionId) } })
  }

  const next = () => {
    const outOfLives = useLives && lives <= 0
    if (index + 1 >= questions.length || outOfLives) {
      finish(results)
      return
    }
    setIndex(index + 1)
    setAnswer(null)
  }

  if (!q) return null
  const correct = last?.questionId === q.id ? last.correct : false
  const correctText = correctOptionText(q)

  return (
    <div className="quiz">
      <div className="quiz-top">
        <div className="container quiz-top-inner">
          <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Sair do desafio">
            <Icon name="x" />
          </button>
          <div className="quiz-progress">
            <span className="small">{title} · Pergunta {index + 1} de {questions.length}</span>
            <ProgressBar value={index + (answer ? 1 : 0)} max={questions.length} label="Progresso do desafio" />
          </div>
          <div className="quiz-stats">
            {useLives && (
              <span className="lives" role="img" aria-label={`${lives} de ${MAX_LIVES} tentativas restantes`}>
                {Array.from({ length: MAX_LIVES }, (_, i) => (
                  <Icon key={i} name="heart" size={18} className={i < lives ? 'life-on' : 'life-off'} />
                ))}
              </span>
            )}
            <span className="score" aria-label={`Pontuação: ${score}`}>{score} pts</span>
            {settings.showTimer && (
              <span className="small muted" aria-label="Tempo decorrido (não afeta a pontuação)">
                <Icon name="clock" size={14} /> {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>

      {confirmExit && (
        <div className="container">
          <div className="notice notice-warn confirm" role="alertdialog" aria-labelledby="exit-t">
            <p id="exit-t"><strong>Sair do desafio?</strong> O progresso desta tentativa será perdido.</p>
            <div className="row-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmExit(false)} autoFocus>Continuar jogando</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => navigate(exitTo)}>Sair</button>
            </div>
          </div>
        </div>
      )}

      <div className="container quiz-body">
        <QuestionView key={q.id} question={q} answered={answer} onAnswer={onAnswer} />

        {answer && (
          <div
            id="feedback"
            ref={feedbackRef}
            tabIndex={-1}
            className={`feedback ${correct ? 'is-correct' : 'is-wrong'}`}
            role="status"
            aria-live="polite"
          >
            <div className="feedback-head">
              <Icon name={correct ? 'check' : 'x'} size={22} />
              <strong>
                {correct ? `Correto! +${basePoints(q.difficulty)} pts` : useLives ? 'Não foi desta vez. Você perdeu uma tentativa.' : 'Não foi desta vez.'}
              </strong>
            </div>
            {!correct && correctText && <p>Resposta correta: <strong>{correctText}</strong></p>}
            {!correct && q.type === 'truefalse' && <p>A afirmação é <strong>{q.answer ? 'verdadeira' : 'falsa'}</strong>.</p>}
            <p>{q.explanation}</p>
            <p className="ref"><Icon name="book" size={16} /> {q.reference}</p>
            {useLives && lives <= 0 && <p className="small"><strong>Suas tentativas acabaram.</strong> Revise o capítulo e tente novamente.</p>}
            <button type="button" className="btn btn-gold btn-block" onClick={next}>
              {index + 1 >= questions.length || (useLives && lives <= 0) ? 'Ver resultado' : 'Próxima pergunta'} <Icon name="arrowRight" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
