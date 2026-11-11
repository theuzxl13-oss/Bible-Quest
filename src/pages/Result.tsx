import { Link, Navigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Stars } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { getBook } from '../data/bible/canon'
import { STORY_SEQUENCE, getExperience } from '../data/story'
import { getQuestion } from '../data/questions'
import { correctOptionText } from '../services/game/answers'
import { getFreeMode } from '../services/game/freeModes'
import { levelTitle } from '../services/game/levels'
import { PASS_RATIO, PRACTICE_DAILY_CAP } from '../services/game/scoring'
import { bookCompletion } from '../services/game/progression'
import { allChests, chestState, phaseNumber } from '../services/game/journeyMap'
import { Adventurer } from '../components/Adventurer'
import { ChestIcon } from '../components/map/Scenery'
import { STAR_RULES } from '../services/game/scoring'
import { useGame } from '../state/GameContext'

export default function Result() {
  const { lastOutcome, progress, questionPool, profile } = useGame()
  const location = useLocation()
  if (!lastOutcome) return <Navigate to="/painel" replace />
  const { record, xpGained, xpCapped, dailyAlreadyClaimed, newAchievements, levelBefore, levelAfter, firstClear } = lastOutcome
  const state = (location.state as { questionIds?: string[]; replayTo?: string; exitTo?: string } | null) ?? {}
  const exp = getExperience(record.experienceId)
  const book = getBook(record.bookId)
  const seqIdx = exp ? STORY_SEQUENCE.findIndex((e) => e.id === exp.id) : -1
  const nextExp = seqIdx >= 0 ? STORY_SEQUENCE[seqIdx + 1] : undefined
  const bookJustDone = exp && book && firstClear && bookCompletion(book.id, progress).done === bookCompletion(book.id, progress).total
  const free = getFreeMode(record.freeMode)
  const pct = Math.round((record.correct / Math.max(1, record.total)) * 100)

  const chestReady = record.mode === 'historia' ? allChests().find((c) => c.afterExperienceId === record.experienceId && chestState(c, progress) === 'disponivel') : undefined
  let headline = 'Partida concluída'
  if (record.mode === 'historia') headline = record.passed ? (firstClear ? 'Fase concluída!' : 'Fase revisada!') : 'Ainda não foi desta vez'
  if (record.mode === 'revisao') headline = 'Revisão concluída'
  if (record.mode === 'diario') headline = 'Desafio diário concluído'
  if (record.mode === 'livre' && free) headline = free.title

  return (
    <div className="container section stack-lg result">
      <header className="result-head panel">
        {record.mode === 'historia' && profile?.character && (
          <div className={`result-hero-char ${record.passed ? 'is-happy' : ''}`} aria-hidden="true">
            <Adventurer config={profile.character} size={88} />
          </div>
        )}
        <p className="eyebrow">{record.mode === 'historia' ? 'Modo História' : record.mode === 'livre' ? 'Modo Livre' : record.title}</p>
        <h1>{headline}</h1>
        {record.mode === 'historia' && <p className="muted">{exp ? `Fase ${phaseNumber(exp.id)} · ${exp.title}` : record.title}</p>}
        {record.mode === 'historia' && (
          <div className="stars-anim">
            <Stars value={record.stars} size={40} />
          </div>
        )}
        <dl className="result-stats">
          <div><dt>Acertos</dt><dd>{record.correct}/{record.total}</dd></div>
          <div><dt>Erros</dt><dd>{record.total - record.correct}</dd></div>
          <div><dt>Aproveitamento</dt><dd>{pct}%</dd></div>
          <div><dt>Pontos</dt><dd>{record.score}</dd></div>
        </dl>
        {record.mode === 'historia' && (
          <p className="small muted">1 estrela ao concluir (≥ {Math.round(PASS_RATIO * 100)}%), 2 com ≥ {Math.round(STAR_RULES.two * 100)}% e 3 com ≥ {Math.round(STAR_RULES.three * 100)}%.</p>
        )}
        <div className="rewards" aria-label="Recompensas">
          <p className="eyebrow">Recompensas</p>
          <ul>
            <li className="reward-xp"><Icon name="star" /> <strong>+{xpGained} XP</strong></li>
            {chestReady && <li><ChestIcon size={28} /> Um baú de recompensa foi liberado no mapa!</li>}
            {firstClear && nextExp && <li><Icon name="map" /> Próxima fase liberada: {nextExp.title}</li>}
          </ul>
        </div>
        {record.mode === 'historia' && !record.passed && (
          <p className="muted">É preciso acertar pelo menos {Math.round(PASS_RATIO * 100)}% sem perder todas as tentativas. Releia a experiência e tente de novo.</p>
        )}
        {record.mode === 'historia' && record.passed && !firstClear && xpGained === 0 && (
          <p className="small muted">Experiência já concluída: XP só é concedido quando você supera sua melhor pontuação.</p>
        )}
        {firstClear && <p className="gold small">Inclui o bônus de primeira conclusão.</p>}
        {bookJustDone && <p className="level-up" role="status"><Icon name="book" /> Você concluiu o livro de {book!.name}!</p>}
        {xpCapped > 0 && <p className="small muted">Limite diário de XP de prática atingido ({PRACTICE_DAILY_CAP} XP). {xpCapped} XP não foram somados hoje.</p>}
        {dailyAlreadyClaimed && <p className="small muted">A recompensa do desafio diário já foi recebida hoje. Esta partida conta apenas como treino.</p>}
        {record.mode === 'demo-multiplayer' && <p className="small muted">Partida demonstrativa: não rende XP.</p>}
        {levelAfter > levelBefore && <p className="level-up" role="status"><Icon name="crown" /> Você alcançou o nível {levelAfter}: {levelTitle(levelAfter)}!</p>}
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
          {state.replayTo && <Link to={state.replayTo} className="btn btn-outline">Jogar novamente</Link>}
          {record.mode === 'historia' && exp && (
            <Link to={`/historia/${exp.bookId}/${exp.id}/historia`} className="btn btn-outline">Revisar conteúdo</Link>
          )}
          {record.mode === 'historia' && (
            <Link to="/historia" className="btn btn-gold">Continuar a jornada <Icon name="arrowRight" /></Link>
          )}
          {record.mode === 'revisao' && <Link to="/revisao" className="btn btn-gold">Voltar à revisão</Link>}
          {record.mode === 'livre' && <Link to="/livre" className="btn btn-gold">Outras modalidades</Link>}
          {record.mode === 'diario' && <Link to="/painel" className="btn btn-gold">Voltar ao painel</Link>}
        </div>
      </header>

      {(state.questionIds?.length ?? 0) > 0 && (
        <section aria-labelledby="rev">
          <h2 id="rev" className="section-title">Revisão</h2>
          <ol className="review">
            {state.questionIds!.map((id) => {
              const q = getQuestion(id, questionPool)
              if (!q) return null
              const ans = correctOptionText(q)
              return (
                <li key={id} className="review-item">
                  <p className="review-q">{q.type === 'complete' && 'verse' in q ? q.verse : q.prompt}</p>
                  {q.type === 'whoami' && q.clues && <p className="small muted">Pistas: {q.clues.join(' ')}</p>}
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
