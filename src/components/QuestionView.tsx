import { useEffect, useMemo, useRef, useState } from 'react'
import type { MemoryQuestion, MultipleChoiceQuestion, OrderQuestion, Question, TrueFalseQuestion } from '../types'
import { memoryMistakesAllowed, type AnswerResponse } from '../services/game/answers'
import { shuffle, shuffleNotIdentity } from '../services/game/random'
import { QUESTION_TYPE_LABEL, DIFFICULTY_LABEL } from '../data/questions'
import { Icon } from './Icon'

interface Props {
  question: Question
  /** Resposta já dada (modo revisão/feedback). */
  answered: AnswerResponse | null
  onAnswer: (r: AnswerResponse) => void
  /** "Quem sou eu?" com pistas reveladas uma a uma. */
  progressiveClues?: boolean
}

export function QuestionView({ question, answered, onAnswer, progressiveClues }: Props) {
  return (
    <section className="question" aria-labelledby={`q-${question.id}`}>
      <div className="question-meta">
        <span className="tag">{QUESTION_TYPE_LABEL[question.type]}</span>
        <span className={`tag tag-diff-${question.difficulty}`}>{DIFFICULTY_LABEL[question.difficulty]}</span>
      </div>
      <h2 id={`q-${question.id}`} className="question-prompt">
        {question.prompt}
      </h2>
      {question.type === 'truefalse' ? (
        <TrueFalse q={question} answered={answered} onAnswer={onAnswer} />
      ) : question.type === 'order' ? (
        <OrderItems key={question.id} q={question} answered={answered} onAnswer={onAnswer} />
      ) : question.type === 'memory' ? (
        <MemoryGame key={question.id} q={question} answered={answered} onAnswer={onAnswer} />
      ) : (
        <Choice key={question.id} q={question} answered={answered} onAnswer={onAnswer} progressive={progressiveClues} />
      )}
    </section>
  )
}

function useNumberKeys(count: number, enabled: boolean, onPick: (i: number) => void) {
  const ref = useRef(onPick)
  ref.current = onPick
  useEffect(() => {
    if (!enabled) return
    const h = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target as HTMLElement | null
      if (target && /input|textarea|select/i.test(target.tagName)) return
      const n = Number(e.key)
      if (n >= 1 && n <= count) {
        e.preventDefault()
        ref.current(n - 1)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [count, enabled])
}

function Choice({ q, answered, onAnswer, progressive }: { q: MultipleChoiceQuestion; answered: AnswerResponse | null; onAnswer: (r: AnswerResponse) => void; progressive?: boolean }) {
  const options = useMemo(() => shuffle(q.options), [q])
  const correct = q.options[q.answer]
  const chosen = answered?.kind === 'choice' ? answered.option : null
  const totalClues = q.clues?.length ?? 0
  const [shown, setShown] = useState(progressive ? 1 : totalClues)
  const visibleClues = answered ? totalClues : shown
  const pick = (option: string) => onAnswer({ kind: 'choice', option, cluesUsed: q.clues ? shown : undefined })
  useNumberKeys(options.length, !answered, (i) => pick(options[i]))

  return (
    <>
      {q.clues && (
        <>
          <ol className="clues" aria-label="Pistas" aria-live="polite">
            {q.clues.slice(0, visibleClues).map((c, i) => (
              <li key={i}>
                <span className="clue-n">Pista {i + 1}</span> {c}
              </li>
            ))}
          </ol>
          {progressive && !answered && shown < totalClues && (
            <button type="button" className="btn btn-outline btn-sm clue-more" onClick={() => setShown(shown + 1)}>
              Mostrar próxima pista ({totalClues - shown} restante{totalClues - shown > 1 ? 's' : ''}, −5 pts)
            </button>
          )}
        </>
      )}
      {q.verse && (
        <blockquote className="verse-gap">
          {q.verse.split('____').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="gap" aria-label="lacuna">
                  {chosen ?? '      '}
                </span>
              )}
            </span>
          ))}
          <cite>{q.reference}</cite>
        </blockquote>
      )}
      <div className="options" role="group" aria-label="Alternativas">
        {options.map((opt, i) => {
          const state = !answered ? '' : opt === correct ? 'is-correct' : opt === chosen ? 'is-wrong' : 'is-dim'
          return (
            <button
              key={opt}
              type="button"
              className={`option ${state}`}
              disabled={Boolean(answered)}
              onClick={() => pick(opt)}
              aria-describedby={answered && opt === correct ? 'feedback' : undefined}
            >
              <span className="option-key" aria-hidden="true">{i + 1}</span>
              <span className="option-text">{opt}</span>
              {answered && opt === correct && <Icon name="check" title="Resposta correta" />}
              {answered && opt === chosen && opt !== correct && <Icon name="x" title="Sua resposta" />}
            </button>
          )
        })}
      </div>
    </>
  )
}

function TrueFalse({ q, answered, onAnswer }: { q: TrueFalseQuestion; answered: AnswerResponse | null; onAnswer: (r: AnswerResponse) => void }) {
  const chosen = answered?.kind === 'bool' ? answered.value : null
  const opts = [
    { v: true, label: 'Verdadeiro' },
    { v: false, label: 'Falso' },
  ]
  useNumberKeys(2, !answered, (i) => onAnswer({ kind: 'bool', value: opts[i].v }))
  return (
    <div className="options options-2" role="group" aria-label="Verdadeiro ou falso">
      {opts.map((o, i) => {
        const state = !answered ? '' : o.v === q.answer ? 'is-correct' : o.v === chosen ? 'is-wrong' : 'is-dim'
        return (
          <button key={o.label} type="button" className={`option option-tf ${state}`} disabled={Boolean(answered)} onClick={() => onAnswer({ kind: 'bool', value: o.v })}>
            <span className="option-key" aria-hidden="true">{i + 1}</span>
            <span className="option-text">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function OrderItems({ q, answered, onAnswer }: { q: OrderQuestion; answered: AnswerResponse | null; onAnswer: (r: AnswerResponse) => void }) {
  const [items, setItems] = useState(() => shuffleNotIdentity(q.items))
  const [live, setLive] = useState('')
  const final = answered?.kind === 'order' ? answered.items : items

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
    setLive(`"${next[j]}" movido para a posição ${j + 1}.`)
  }

  return (
    <>
      <p className="hint">Use as setas para mover cada acontecimento. O primeiro da lista é o mais antigo.</p>
      <ol className="order-list">
        {final.map((it, i) => {
          const state = !answered ? '' : it === q.items[i] ? 'is-correct' : 'is-wrong'
          return (
            <li key={it} className={`order-item ${state}`}>
              <span className="order-n" aria-hidden="true">{i + 1}</span>
              <span className="order-text">{it}</span>
              {!answered ? (
                <span className="order-actions">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Mover "${it}" para cima`}>
                    <Icon name="arrowUp" />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === final.length - 1} aria-label={`Mover "${it}" para baixo`}>
                    <Icon name="arrowDown" />
                  </button>
                </span>
              ) : (
                <Icon name={it === q.items[i] ? 'check' : 'x'} title={it === q.items[i] ? 'Posição correta' : 'Posição incorreta'} />
              )}
            </li>
          )
        })}
      </ol>
      <p className="sr-only" aria-live="polite">{live}</p>
      {answered && answered.kind === 'order' && answered.items.some((it, i) => it !== q.items[i]) && (
        <div className="order-correct">
          <p className="eyebrow">Ordem correta</p>
          <ol>
            {q.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ol>
        </div>
      )}
      {!answered && (
        <button type="button" className="btn btn-gold btn-block" onClick={() => onAnswer({ kind: 'order', items })}>
          Confirmar ordem
        </button>
      )}
    </>
  )
}

interface Card {
  id: string
  pair: number
  text: string
}

function MemoryGame({ q, answered, onAnswer }: { q: MemoryQuestion; answered: AnswerResponse | null; onAnswer: (r: AnswerResponse) => void }) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        q.pairs.flatMap((p, i) => [
          { id: `${i}a`, pair: i, text: p.a },
          { id: `${i}b`, pair: i, text: p.b },
        ]),
      ),
    [q],
  )
  const [open, setOpen] = useState<string[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [live, setLive] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const done = matched.length === q.pairs.length

  useEffect(() => {
    if (done && !answered) {
      const t = window.setTimeout(() => onAnswer({ kind: 'memory', mistakes }), 450)
      return () => window.clearTimeout(t)
    }
  }, [done, answered, mistakes, onAnswer])

  const flip = (card: Card) => {
    if (answered || matched.includes(card.pair) || open.includes(card.id)) return
    if (open.length === 2) return
    const next = [...open, card.id]
    setOpen(next)
    if (next.length === 2) {
      const [a, b] = next.map((id) => cards.find((c) => c.id === id)!)
      if (a.pair === b.pair) {
        setMatched((m) => [...m, a.pair])
        setOpen([])
        setLive(`Par encontrado: ${a.text} e ${b.text}.`)
      } else {
        setMistakes((m) => m + 1)
        setLive(`Não formam par: ${a.text} e ${b.text}.`)
        timer.current = window.setTimeout(() => setOpen([]), 1100)
      }
    } else {
      setLive(`Carta virada: ${card.text}.`)
    }
  }

  return (
    <>
      <p className="hint">
        Vire duas cartas por vez e encontre os pares. Até {memoryMistakesAllowed(q.pairs.length)} erros ainda contam como acerto. Erros: <strong>{mistakes}</strong>
      </p>
      <div className="memory-grid">
        {cards.map((c, i) => {
          const isMatched = matched.includes(c.pair)
          const isOpen = isMatched || open.includes(c.id) || Boolean(answered)
          return (
            <button
              key={c.id}
              type="button"
              className={`memory-card ${isOpen ? 'is-open' : ''} ${isMatched ? 'is-matched' : ''}`}
              onClick={() => flip(c)}
              disabled={isMatched || Boolean(answered)}
              aria-label={isOpen ? `Carta ${i + 1}: ${c.text}${isMatched ? ' (par encontrado)' : ''}` : `Carta ${i + 1}, virada para baixo`}
            >
              <span className="memory-face" aria-hidden="true">{isOpen ? c.text : ''}</span>
            </button>
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">{live}</p>
    </>
  )
}
