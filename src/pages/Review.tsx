import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { QuizRunner } from '../components/QuizRunner'
import { PageHeader, ProgressBar } from '../components/ui'
import { getBook } from '../data/bible/canon'
import { masteredTopics, pendingErrors, reviewQuestions, topicStats, weakTopics } from '../services/game/review'
import { phaseNumber } from '../services/game/journeyMap'
import { useGame } from '../state/GameContext'
import type { Question } from '../types'

/** Revisão inteligente: aprende com os erros registrados em todos os modos. */
export default function Review() {
  const { progress, questionPool } = useGame()
  const [session, setSession] = useState<{ title: string; questions: Question[] } | null>(null)
  const weak = weakTopics(progress, questionPool)
  const mastered = masteredTopics(progress, questionPool)
  const all = topicStats(progress, questionPool)
  const pending = pendingErrors(progress)
  const recent = useMemo(() => [...progress.history].filter((h) => h.mode !== 'demo-multiplayer').slice(0, 10).reverse(), [progress.history])
  const lastErrors = useMemo(
    () =>
      Object.entries(progress.review)
        .filter(([, r]) => r.lastWrong)
        .sort((a, b) => b[1].lastSeen.localeCompare(a[1].lastSeen))
        .slice(0, 6)
        .map(([id]) => questionPool.find((q) => q.id === id))
        .filter(Boolean) as Question[],
    [progress.review, questionPool],
  )

  // Desempenho por livro, a partir do histórico de respostas
  const byBook = useMemo(() => {
    const m = new Map<string, { seen: number; wrong: number }>()
    for (const [id, r] of Object.entries(progress.review)) {
      const q = questionPool.find((x) => x.id === id)
      if (!q) continue
      const cur = m.get(q.bookId) ?? { seen: 0, wrong: 0 }
      m.set(q.bookId, { seen: cur.seen + r.seen, wrong: cur.wrong + r.wrong })
    }
    return [...m.entries()].map(([bookId, v]) => ({ bookId, ratio: (v.seen - v.wrong) / v.seen, seen: v.seen })).sort((a, b) => a.ratio - b.ratio)
  }, [progress.review, questionPool])

  if (session) {
    return <QuizRunner questions={session.questions} title={session.title} mode="revisao" exitTo="/revisao" replayTo="/revisao" rules={{ lives: 0 }} />
  }

  const start = (title: string, qs: Question[]) => qs.length > 0 && setSession({ title, questions: qs })
  const general = reviewQuestions(progress, questionPool, 8)

  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Revisão inteligente" title="Aprenda com seus erros">
        O jogo registra cada resposta. Assuntos com menos de 70% de acertos aparecem aqui para revisão. Revisões rendem
        XP de prática, dentro do limite diário.
      </PageHeader>

      {Object.keys(progress.review).length === 0 ? (
        <div className="panel center stack">
          <Icon name="scroll" size={32} />
          <p>Ainda não há respostas registradas. Jogue uma fase ou uma modalidade do Modo Livre e volte aqui.</p>
          <Link to="/historia" className="btn btn-gold">Ir para a jornada</Link>
        </div>
      ) : (
        <>
          <div className="review-top">
            <div className="panel stack">
              <h2>Revisão geral</h2>
              <p className="muted">{pending} {pending === 1 ? 'pergunta errada' : 'perguntas erradas'} da última vez.</p>
              <button type="button" className="btn btn-gold" disabled={general.length === 0} onClick={() => start('Revisão geral', general)}>
                {general.length ? `Revisar ${general.length} perguntas` : 'Nada pendente'}
              </button>
            </div>
            <div className="panel stack">
              <h2>Evolução dos acertos</h2>
              {recent.length === 0 ? <p className="muted small">Sem partidas ainda.</p> : (
                <div className="evo-chart" role="img" aria-label={`Aproveitamento das últimas ${recent.length} partidas: ${recent.map((h) => Math.round((h.correct / Math.max(1, h.total)) * 100) + '%').join(', ')}`}>
                  {recent.map((h) => {
                    const r = h.correct / Math.max(1, h.total)
                    return <span key={h.id} className="evo-bar" style={{ height: `${Math.max(6, r * 100)}%` }} title={`${h.title}: ${Math.round(r * 100)}%`} />
                  })}
                </div>
              )}
              <p className="small muted">Aproveitamento das últimas {recent.length} partidas (da mais antiga para a mais recente).</p>
            </div>
          </div>

          <section aria-labelledby="weak">
            <h2 id="weak" className="section-title">Assuntos para revisar</h2>
            {weak.length === 0 ? <p className="muted">Nenhum assunto com dificuldade no momento.</p> : (
              <ul className="topic-list">
                {weak.map((t) => (
                  <li key={t.experienceId} className="panel topic">
                    <div>
                      <strong>Fase {phaseNumber(t.experienceId)} · {t.title}</strong>
                      <p className="small muted">{Math.round(t.ratio * 100)}% de acertos · {t.pending} erro(s) pendente(s)</p>
                      <ProgressBar value={Math.round(t.ratio * 100)} max={100} label={`Acertos em ${t.title}`} />
                    </div>
                    <div className="row-actions">
                      <button type="button" className="btn btn-gold btn-sm" onClick={() => start(`Revisão: ${t.title}`, reviewQuestions(progress, questionPool, 8, t.experienceId).length ? reviewQuestions(progress, questionPool, 8, t.experienceId) : questionPool.filter((q) => q.experienceId === t.experienceId))}>Revisar</button>
                      <Link to={`/historia/${t.bookId}/${t.experienceId}/historia`} className="btn btn-outline btn-sm">Reler a história</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="review-top">
            <section className="panel" aria-labelledby="dom">
              <h2 id="dom">Assuntos dominados</h2>
              {mastered.length === 0 ? <p className="muted small">Acerte 90% ou mais em pelo menos 5 respostas de uma fase para dominá-la.</p> : (
                <ul className="bullets">{mastered.map((t) => <li key={t.experienceId}><Icon name="check" size={14} /> {t.title} · {Math.round(t.ratio * 100)}%</li>)}</ul>
              )}
              <p className="small muted">{mastered.length} de {all.length} assuntos estudados.</p>
            </section>
            <section className="panel" aria-labelledby="livros">
              <h2 id="livros">Desempenho por livro</h2>
              <ul className="bars">
                {byBook.map((b) => (
                  <li key={b.bookId}>
                    <span className="bar-label">{getBook(b.bookId)?.name} · {b.seen} respostas</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width: `${b.ratio * 100}%` }} /></span>
                    <span className="bar-n">{Math.round(b.ratio * 100)}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {lastErrors.length > 0 && (
            <section aria-labelledby="errs">
              <h2 id="errs" className="section-title">Últimos erros</h2>
              <ul className="review">
                {lastErrors.map((q) => (
                  <li key={q.id} className="review-item">
                    <p className="review-q">{'verse' in q && q.verse ? q.verse : q.prompt}</p>
                    <p className="small muted">{q.explanation} <span className="ref-inline">({q.reference})</span></p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
