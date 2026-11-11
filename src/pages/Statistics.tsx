import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHeader, ProgressBar } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { ITEMS } from '../data/character/items'
import { QUESTION_TYPE_LABEL } from '../data/questions'
import { QUIZ_REGIONS } from '../data/quiz/regions'
import { STORY_SEQUENCE } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
import { isItemUnlocked, totalStars } from '../services/game/items'
import { levelFromXp, levelTitle } from '../services/game/levels'
import { quizCompletion } from '../services/game/quizMap'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'
import type { QuestionType } from '../types'
import { overallProgress } from './Dashboard'

/** Estatísticas do jogador, calculadas só com dados reais deste aparelho. */
export default function Statistics() {
  const { progress, dailyContext } = useGame()
  const level = levelFromXp(progress.xp)
  const acc = progress.stats.answered ? Math.round((progress.stats.correct / progress.stats.answered) * 100) : 0
  const overall = overallProgress(progress)
  const quiz = quizCompletion(progress)
  const storyDone = STORY_SEQUENCE.filter((e) => progress.experiences[e.id]?.completed).length
  const items = ITEMS.filter((i) => isItemUnlocked(i, progress)).length
  const stat = (label: string, value: string | number) => (
    <div className="panel"><dt>{label}</dt><dd>{value}</dd></div>
  )

  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Estatísticas" title="Sua evolução">
        Números calculados com as suas partidas salvas neste aparelho.
      </PageHeader>

      <section aria-labelledby="eg">
        <h2 id="eg" className="section-title">Geral</h2>
        <dl className="stat-grid">
          {stat('Nível', `${level} · ${levelTitle(level)}`)}
          {stat('XP total', progress.xp)}
          {stat('Perguntas respondidas', progress.stats.answered)}
          {stat('Aproveitamento', `${acc}%`)}
          {stat('Maior sequência de acertos', progress.bestAnswerStreak)}
          {stat('Dias seguidos (atual / melhor)', `${visibleStreak(progress.streak, dailyContext().day)} / ${progress.streak.best}`)}
          {stat('Conquistas', `${Object.keys(progress.achievements).length} de ${ACHIEVEMENTS.length}`)}
          {stat('Itens do personagem', `${items} de ${ITEMS.length}`)}
        </dl>
        <div className="panel stack-sm">
          <ProgressBar value={overall.done} max={overall.total} label="Progresso geral" />
          <p className="small muted">Progresso geral: {overall.done} de {overall.total} fases e desafios disponíveis.</p>
        </div>
      </section>

      <section aria-labelledby="eh">
        <div className="section-head">
          <h2 id="eh" className="section-title">Modo História</h2>
          <Link to="/historia" className="link">Abrir o mapa</Link>
        </div>
        <dl className="stat-grid">
          {stat('Fases concluídas', `${storyDone} de ${STORY_SEQUENCE.length}`)}
          {stat('Estrelas', `${totalStars(progress)} de ${STORY_SEQUENCE.length * 3}`)}
          {stat('Baús abertos', Object.keys(progress.chests).length)}
        </dl>
      </section>

      <section aria-labelledby="eq">
        <div className="section-head">
          <h2 id="eq" className="section-title">Modo Quiz</h2>
          <Link to="/quiz" className="link">Abrir o mapa</Link>
        </div>
        <dl className="stat-grid">
          {stat('Desafios do mapa', `${quiz.done} de ${quiz.total}`)}
          {stat('Estrelas no mapa', `${quiz.stars} de ${quiz.maxStars}`)}
          {stat('Partidas (mapa e treino)', progress.free.matches)}
          {stat('Recorde no Contra o tempo', `${progress.free.bestTimeAttack} acertos`)}
        </dl>
        <ul className="journey-progress">
          {QUIZ_REGIONS.map((r) => {
            const done = r.nodes.filter((n) => progress.quiz.nodes[n.id]?.completed).length
            return (
              <li key={r.id} className="panel">
                <strong>{r.title}</strong>
                <ProgressBar value={done} max={r.nodes.length} label={`Desafios concluídos em ${r.title}`} />
                <span className="small muted">{done} de {r.nodes.length} desafios</span>
              </li>
            )
          })}
        </ul>
        <div className="table-wrap">
          <table className="simple-table">
            <caption>Recordes por modalidade</caption>
            <thead><tr><th scope="col">Modalidade</th><th scope="col">Partidas</th><th scope="col">Recorde</th></tr></thead>
            <tbody>
              {FREE_MODES.map((m) => {
                const s = progress.free.byMode[m.id]
                return <tr key={m.id}><td>{m.title}</td><td>{s?.played ?? 0}</td><td>{s ? `${s.best} pts` : '—'}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="et">
        <h2 id="et" className="section-title">Por tipo de pergunta</h2>
        {Object.keys(progress.stats.byType).length === 0 ? (
          <p className="muted">Nenhuma resposta registrada ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="simple-table">
              <caption className="sr-only">Desempenho por tipo de pergunta</caption>
              <thead><tr><th scope="col">Tipo</th><th scope="col">Respondidas</th><th scope="col">Acertos</th></tr></thead>
              <tbody>
                {(Object.entries(progress.stats.byType) as [QuestionType, { answered: number; correct: number }][]).map(([t, v]) => (
                  <tr key={t}><td>{QUESTION_TYPE_LABEL[t]}</td><td>{v.answered}</td><td>{v.correct} ({Math.round((v.correct / Math.max(1, v.answered)) * 100)}%)</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="ed">
        <h2 id="ed" className="section-title">Desafio diário e multiplayer</h2>
        <dl className="stat-grid">
          {stat('Desafios diários concluídos', progress.daily.completedCount)}
          {stat('Partidas de demonstração (multiplayer)', progress.multiplayer.demoMatches)}
        </dl>
        <p className="small muted"><Icon name="info" size={14} /> O multiplayer online ainda não existe; as partidas de demonstração não rendem XP.</p>
      </section>
    </div>
  )
}
