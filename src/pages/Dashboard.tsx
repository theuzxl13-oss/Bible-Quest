import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { LocalProfileNotice, ProgressBar, Stars } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { getBook } from '../data/bible/canon'
import { STORY_SEQUENCE } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
import { levelProgress, levelTitle } from '../services/game/levels'
import { continueExperience, journeyCompletion, percent } from '../services/game/progression'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'

export const MODE_LABEL = { historia: 'Modo História', livre: 'Modo Livre', diario: 'Desafio diário', 'demo-multiplayer': 'Multiplayer (demo)' } as const

export default function Dashboard() {
  const { profile, progress, dailyContext } = useGame()
  const lp = levelProgress(progress.xp)
  const today = dailyContext().day
  const streak = visibleStreak(progress.streak, today)
  const dailyDone = progress.daily.lastCompletedDay === today
  const cont = continueExperience(progress)
  const contBook = cont ? getBook(cont.bookId) : null
  const doneExps = STORY_SEQUENCE.filter((e) => progress.experiences[e.id]?.completed).length
  const achievements = Object.keys(progress.achievements).length

  return (
    <div className="container section stack-lg">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Painel</p>
          <h1>Olá, {profile!.nickname}</h1>
        </div>
        <div className="stat-pills">
          <span className="pill" title="Sequência de dias"><Icon name="flame" size={18} /> {streak} {streak === 1 ? 'dia' : 'dias'}</span>
          <span className="pill"><Icon name="star" size={18} /> {progress.xp} XP</span>
          <span className="pill"><Icon name="crown" size={18} /> Nível {lp.level}</span>
        </div>
      </header>

      {cont && contBook && (
        <Link to={`/historia/${cont.bookId}/${cont.id}`} className="continue-banner">
          <ArtImage art={cont.image} className="continue-banner-img" sizes="100vw" priority />
          <div className="continue-banner-shade" />
          <div className="continue-banner-body">
            <p className="eyebrow">Continuar jornada · {contBook.name}</p>
            <h2>{cont.title}</h2>
            <p className="small">{cont.scope}</p>
            <span className="btn btn-gold">Continuar de onde parei <Icon name="arrowRight" /></span>
          </div>
        </Link>
      )}

      <div className="modes-grid">
        <Link to="/historia" className="mode-hero mode-hero-story">
          <ArtImage art="abraham-journey" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
          <div className="mode-hero-shade" />
          <div className="mode-hero-body">
            <span className="mode-hero-icon"><Icon name="map" size={26} /></span>
            <p className="eyebrow">Modo História</p>
            <h2>A grande jornada bíblica</h2>
            <p>De Gênesis a Apocalipse, na ordem dos livros, com narrativa, referências, aprendizado e desafios.</p>
            <ProgressBar value={Math.round(journeyCompletion(progress) * 1000)} max={1000} label="Conclusão da jornada completa" />
            <span className="small">{percent(journeyCompletion(progress))} da Bíblia · {doneExps}/{STORY_SEQUENCE.length} experiências disponíveis</span>
          </div>
        </Link>
        <Link to="/livre" className="mode-hero mode-hero-free">
          <ArtImage art="moses-plague" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
          <div className="mode-hero-shade" />
          <div className="mode-hero-body">
            <span className="mode-hero-icon"><Icon name="star" size={26} /></span>
            <p className="eyebrow">Modo Livre</p>
            <h2>Desafios bíblicos</h2>
            <p>{FREE_MODES.length} modalidades para jogar quando quiser, incluindo Contra o tempo e salas com amigos.</p>
            <div className="mode-chips">
              {FREE_MODES.slice(0, 4).map((m) => <span key={m.id} className="tag">{m.title}</span>)}
              <span className="tag">+{FREE_MODES.length - 4}</span>
            </div>
            <span className="small">{progress.free.matches} {progress.free.matches === 1 ? 'partida jogada' : 'partidas jogadas'}</span>
          </div>
        </Link>
      </div>

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
        <Link to="/ranking" className="panel daily-card">
          <Icon name="trophy" size={28} />
          <div>
            <p className="eyebrow">Ranking</p>
            <h2>Classificação geral</h2>
            <p className="muted small">Por XP, com dados de exemplo.</p>
          </div>
          <Icon name="arrowRight" />
        </Link>
        <Link to="/conquistas" className="panel daily-card">
          <Icon name="laurel" size={28} />
          <div>
            <p className="eyebrow">Perfil e conquistas</p>
            <h2>{achievements} de {ACHIEVEMENTS.length} conquistas</h2>
            <p className="muted small">Nível {lp.level} · {levelTitle(lp.level)}</p>
          </div>
          <Icon name="arrowRight" />
        </Link>
      </div>

      <section className="panel level-card" aria-labelledby="lvl-title">
        <div className="level-row">
          <div>
            <p className="eyebrow">Nível {lp.level}</p>
            <h2 id="lvl-title">{levelTitle(lp.level)}</h2>
          </div>
          <dl className="mini-stats">
            <div><dt>Respostas</dt><dd>{progress.stats.answered}</dd></div>
            <div><dt>Precisão</dt><dd>{progress.stats.answered ? Math.round((progress.stats.correct / progress.stats.answered) * 100) : 0}%</dd></div>
            <div><dt>Melhor sequência</dt><dd>{progress.streak.best}</dd></div>
          </dl>
        </div>
        <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
        <p className="muted small">{lp.current} / {lp.needed} XP para o nível {lp.level + 1}. O XP do Modo História, do Modo Livre e do diário somam no mesmo nível.</p>
      </section>

      <section aria-labelledby="hist-title">
        <div className="section-head">
          <h2 id="hist-title" className="section-title">Partidas recentes</h2>
          <Link to="/perfil" className="link">Histórico completo</Link>
        </div>
        {progress.history.length === 0 ? (
          <p className="muted">Nenhuma partida ainda. Comece pela primeira experiência de Gênesis ou escolha uma modalidade livre.</p>
        ) : (
          <ul className="history">
            {progress.history.slice(0, 5).map((h) => (
              <li key={h.id} className="history-item">
                <div>
                  <strong>{h.title}</strong>
                  <span className="muted small"> · {MODE_LABEL[h.mode]} · {new Date(h.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="history-right">
                  {h.mode === 'historia' && <Stars value={h.stars} size={14} />}
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
  )
}
