import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon, type IconName } from '../components/Icon'
import { LocalProfileNotice, ProgressBar, Stars } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { STORY_SEQUENCE } from '../data/story'
import { ITEMS } from '../data/character/items'
import { levelProgress, levelTitle } from '../services/game/levels'
import { continueExperience } from '../services/game/progression'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'
import { PlayerCharacter } from '../components/character/PlayerCharacter'
import { weakTopics } from '../services/game/review'
import { phaseNumber } from '../services/game/journeyMap'
import { quizAvatarNode, quizCompletion } from '../services/game/quizMap'
import { isItemUnlocked } from '../services/game/items'
import type { Progress } from '../types'

export const MODE_LABEL = { historia: 'Modo História', livre: 'Modo Quiz · treino', quiz: 'Modo Quiz', diario: 'Desafio diário', revisao: 'Revisão', 'demo-multiplayer': 'Multiplayer (demo)' } as const

/** Progresso geral: fases publicadas do Modo História + desafios do mapa do Quiz. */
export function overallProgress(p: Progress) {
  const story = STORY_SEQUENCE.filter((e) => p.experiences[e.id]?.completed).length
  const quiz = quizCompletion(p)
  return { done: story + quiz.done, total: STORY_SEQUENCE.length + quiz.total, story, quiz }
}

export default function Dashboard() {
  const { profile, progress, dailyContext, questionPool } = useGame()
  const weak = weakTopics(progress, questionPool)
  const character = profile!.character!
  const lp = levelProgress(progress.xp)
  const today = dailyContext().day
  const streak = visibleStreak(progress.streak, today)
  const dailyDone = progress.daily.lastCompletedDay === today
  const cont = continueExperience(progress)
  const overall = overallProgress(progress)
  const quizNext = quizAvatarNode(progress)
  const achievements = Object.keys(progress.achievements).length
  const items = ITEMS.filter((i) => isItemUnlocked(i, progress)).length
  const stars = Object.values(progress.experiences).reduce((s, e) => s + e.bestStars, 0)

  const shortcuts: { to: string; icon: IconName; label: string; detail: string }[] = [
    { to: '/guarda-roupa', icon: 'user', label: 'Personalizar', detail: `${items} de ${ITEMS.length} itens` },
    { to: '/conquistas', icon: 'laurel', label: 'Conquistas', detail: `${achievements} de ${ACHIEVEMENTS.length}` },
    { to: '/biblioteca', icon: 'book', label: 'Biblioteca', detail: `${Object.keys(progress.library.characters).length} personagens` },
    { to: '/estatisticas', icon: 'trophy', label: 'Estatísticas', detail: `${progress.stats.answered} respostas` },
  ]

  return (
    <div className="home">
      <section className="home-scene" aria-labelledby="home-name">
        <ArtImage art="place-raheh" className="hero-bg" priority decorative />
        <div className="home-scene-shade" />
        <div className="container home-scene-inner">
          <div className="home-char">
            <div className="home-char-glow" aria-hidden="true" />
            <div className="home-pedestal" aria-hidden="true" />
            <PlayerCharacter live size={270} pose="idle" title={`${character.name}, seu personagem`} />
          </div>
          <div className="home-info">
            <p className="eyebrow">Bible Quest · {profile!.nickname}</p>
            <div className="home-title">
              <span className="level-medal" aria-hidden="true"><small>Nível</small>{lp.level}</span>
              <div>
                <h1 id="home-name" className="display-sm">{character.name}</h1>
                <p>Nível {lp.level} · {levelTitle(lp.level)}</p>
              </div>
            </div>
            <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
            <p className="small muted">{lp.current} / {lp.needed} XP para o nível {lp.level + 1} · {progress.xp} XP no total</p>
            <ProgressBar value={overall.done} max={overall.total} label="Progresso geral" />
            <p className="small muted">Progresso geral: {overall.done} de {overall.total} fases e desafios disponíveis</p>
            <div className="stat-pills">
              <span className="pill" title="Sequência de dias"><Icon name="flame" size={18} /> {streak} {streak === 1 ? 'dia' : 'dias'}</span>
              <span className="pill"><Icon name="star" size={18} /> {stars + overall.quiz.stars} estrelas</span>
            </div>
            <div className="home-cta">
              <Link to={cont ? `/historia/${cont.bookId}/${cont.id}` : '/historia'} className="btn btn-gold">Continuar jornada <Icon name="arrowRight" size={16} /></Link>
              <Link to="/guarda-roupa" className="btn btn-outline btn-sm home-customize"><Icon name="user" size={16} /> Personalizar</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container section stack-lg home-body">
        <div className="modes-grid">
          <Link to="/historia" className="mode-hero mode-hero-story">
            <ArtImage art="abraham-journey" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
            <div className="mode-hero-shade" />
            <div className="mode-hero-body">
              <span className="mode-hero-icon"><Icon name="map" size={26} /></span>
              <h2>Modo História</h2>
              <p>Explore as Escrituras, conheça os acontecimentos bíblicos e percorra uma jornada pelos livros da Bíblia.</p>
              <ProgressBar value={overall.story} max={STORY_SEQUENCE.length} label="Fases do Modo História concluídas" />
              <span className="small">{overall.story} de {STORY_SEQUENCE.length} fases{cont ? ` · próxima: fase ${phaseNumber(cont.id)}, ${cont.title}` : ''}</span>
              <span className="mode-hero-cta" aria-hidden="true">Jogar <Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>
          <Link to="/quiz" className="mode-hero mode-hero-free">
            <ArtImage art="gn-babel" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
            <div className="mode-hero-shade" />
            <div className="mode-hero-body">
              <span className="mode-hero-icon"><Icon name="shield" size={26} /></span>
              <h2>Modo Quiz</h2>
              <p>Teste seus conhecimentos, enfrente desafios bíblicos e descubra até onde você consegue chegar.</p>
              <ProgressBar value={overall.quiz.done} max={overall.quiz.total} label="Desafios do Modo Quiz concluídos" />
              <span className="small">{overall.quiz.done} de {overall.quiz.total} desafios · próximo: {quizNext.title}</span>
              <span className="mode-hero-cta" aria-hidden="true">Jogar <Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>
        </div>

        <nav aria-label="Atalhos" className="home-shortcuts">
          {shortcuts.map((s) => (
            <Link key={s.to} to={s.to} className="home-shortcut">
              <span className="home-shortcut-icon"><Icon name={s.icon} size={24} /></span>
              <strong>{s.label}</strong>
              <span className="small muted">{s.detail}</span>
            </Link>
          ))}
        </nav>

        <div className="dash-row">
          <Link to="/diario" className={`panel daily-card ${dailyDone ? 'is-done' : ''}`}>
            <Icon name="calendar" size={28} />
            <div>
              <p className="eyebrow">Desafio diário</p>
              <h2>{dailyDone ? 'Concluído hoje' : '5 perguntas de hoje'}</h2>
              <p className="muted small">{dailyDone ? 'Volte amanhã para manter a sequência.' : 'Bônus de XP uma vez por dia.'}</p>
            </div>
            <Icon name="arrowRight" />
          </Link>
          <Link to="/revisao" className="panel daily-card">
            <Icon name="scroll" size={28} />
            <div>
              <p className="eyebrow">Revisão inteligente</p>
              <h2>{weak.length ? `${weak.length} assunto(s) para revisar` : 'Seu desempenho'}</h2>
              <p className="muted small">{weak.length ? `${weak[0].title}: ${Math.round(weak[0].ratio * 100)}% de acertos` : 'Erros, assuntos dominados e evolução.'}</p>
            </div>
            <Icon name="arrowRight" />
          </Link>
          <Link to="/ranking" className="panel daily-card">
            <Icon name="trophy" size={28} />
            <div>
              <p className="eyebrow">Rankings</p>
              <h2>Seus recordes</h2>
              <p className="muted small">Ranking online ainda indisponível.</p>
            </div>
            <Icon name="arrowRight" />
          </Link>
        </div>

        <section aria-labelledby="hist-title">
          <div className="section-head">
            <h2 id="hist-title" className="section-title">Partidas recentes</h2>
            <Link to="/perfil" className="link">Histórico completo</Link>
          </div>
          {progress.history.length === 0 ? (
            <p className="muted">Nenhuma partida ainda. Comece pela primeira fase do Modo História ou pelo primeiro desafio do Modo Quiz.</p>
          ) : (
            <ul className="history">
              {progress.history.slice(0, 5).map((h) => (
                <li key={h.id} className="history-item">
                  <div>
                    <strong>{h.title}</strong>
                    <span className="muted small"> · {MODE_LABEL[h.mode]} · {new Date(h.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="history-right">
                    {(h.mode === 'historia' || h.mode === 'quiz') && <Stars value={h.stars} size={14} />}
                    <span className="small">{h.correct}/{h.total}</span>
                    <span className="small gold">+{h.xp} XP</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <LocalProfileNotice />
      </div>
    </div>
  )
}
