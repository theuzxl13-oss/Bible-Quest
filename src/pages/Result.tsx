import { Link, Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Stars } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { getChapter, getJourney } from '../data/journeys'
import { getQuestion } from '../data/questions'
import { correctOptionText } from '../services/game/answers'
import { levelTitle } from '../services/game/levels'
import { PASS_RATIO } from '../services/game/scoring'
import { isChapterUnlocked } from '../services/game/unlock'
import { useGame } from '../state/GameContext'

export default function Result() {
  const { lastOutcome, progress } = useGame()
  const location = useLocation()
  if (!lastOutcome) return <Navigate to="/painel" replace />
  const { record, xpGained, newAchievements, levelBefore, levelAfter, firstClear } = lastOutcome
  const chapter = getChapter(record.chapterId)
  const journey = getJourney(record.journeyId)
  const nextChapter = chapter && journey ? journey.chapters[chapter.order] : undefined
  const canGoNext = nextChapter && isChapterUnlocked(nextChapter.id, progress)
  const ids = (location.state as { questionIds?: string[] } | null)?.questionIds ?? []
  const pct = Math.round((record.correct / Math.max(1, record.total)) * 100)

  let headline = 'Partida concluída'
  if (record.mode === 'capitulo') headline = record.passed ? (firstClear ? 'Capítulo concluído!' : 'Capítulo revisado!') : 'Ainda não foi desta vez'
  if (record.mode === 'diario') headline = 'Desafio diário concluído'

  return (
    <div className="container section stack-lg result">
      <header className="result-head panel">
        <p className="eyebrow">{record.title}</p>
        <h1>{headline}</h1>
        {record.mode === 'capitulo' && <Stars value={record.stars} size={36} />}
        <dl className="result-stats">
          <div><dt>Acertos</dt><dd>{record.correct}/{record.total}</dd></div>
          <div><dt>Aproveitamento</dt><dd>{pct}%</dd></div>
          <div><dt>Pontos</dt><dd>{record.score}</dd></div>
          <div><dt>XP ganho</dt><dd className="gold">+{xpGained}</dd></div>
        </dl>
        {record.mode === 'capitulo' && !record.passed && (
          <p className="muted">É preciso acertar pelo menos {Math.round(PASS_RATIO * 100)}% sem perder todas as tentativas. Releia a introdução e tente de novo.</p>
        )}
        {firstClear && <p className="gold">Bônus de primeira conclusão incluído. Próximo capítulo liberado.</p>}
        {levelAfter > levelBefore && (
          <p className="level-up" role="status"><Icon name="crown" /> Você alcançou o nível {levelAfter}: {levelTitle(levelAfter)}!</p>
        )}
        {newAchievements.length > 0 && (
          <div className="new-ach" role="status">
            <p className="eyebrow">Nova conquista</p>
            <ul>
              {newAchievements.map((id) => {
                const a = ACHIEVEMENTS.find((x) => x.id === id)!
                return <li key={id}><Icon name={a.icon} /><span><strong>{a.title}</strong> — {a.description}</span></li>
              })}
            </ul>
          </div>
        )}
        <div className="row-actions">
          {chapter && <Link to={`/desafio/${chapter.id}`} className="btn btn-outline">Jogar novamente</Link>}
          {canGoNext && nextChapter && <Link to={`/capitulo/${nextChapter.id}`} className="btn btn-gold">Próximo capítulo <Icon name="arrowRight" /></Link>}
          {journey && !canGoNext && <Link to={record.passed && !nextChapter ? '/mapa' : `/jornada/${journey.id}`} className="btn btn-gold">{record.passed && !nextChapter ? 'Ver mapa' : 'Voltar à jornada'}</Link>}
          {!journey && <Link to="/painel" className="btn btn-gold">Voltar ao painel</Link>}
        </div>
      </header>

      {ids.length > 0 && (
        <section aria-labelledby="rev">
          <h2 id="rev" className="section-title">Revisão</h2>
          <ol className="review">
            {ids.map((id) => {
              const q = getQuestion(id)
              if (!q) return null
              const ans = correctOptionText(q)
              return (
                <li key={id} className="review-item">
                  <p className="review-q">{q.type === 'complete' && 'verse' in q ? q.verse : q.prompt}</p>
                  {ans && <p className="small">Resposta: <strong>{ans}</strong></p>}
                  {q.type === 'truefalse' && <p className="small">Resposta: <strong>{q.answer ? 'Verdadeiro' : 'Falso'}</strong></p>}
                  {q.type === 'order' && <p className="small">Ordem: {q.items.join(' → ')}</p>}
                  <p className="small muted">{q.explanation} <span className="ref-inline">({q.reference})</span></p>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
