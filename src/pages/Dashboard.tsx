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
import { Adventurer } from '../components/Adventurer'
import { weakTopics } from '../services/game/review'
import { phaseNumber } from '../services/game/journeyMap'

export const MODE_LABEL = { historia: 'Modo História', livre: 'Modo Livre', diario: 'Desafio diário', revisao: 'Revisão', 'demo-multiplayer': 'Multiplayer (demo)' } as const

export default function Dashboard() {
  const { profile, progress, dailyContext, questionPool } = useGame()
  const weak = weakTopics(progress, questionPool)
  const character = profile!.character!
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
      <section className="player-hero panel" aria-labelledby="ph-name">
        <div className="player-hero-char" aria-hidden="true">
          <div className="creator-glow" />
          <Adventurer config={character} size={120} className="adv-idle" />
        </div>
        <div className="player-hero-info">
          <p className="eyebrow">Painel · {profile!.nickname}</p>
          <h1 id="ph-name">{character.name}</h1>
          <p className="small">Nível {lp.level} · {levelTitle(lp.level)} · {progress.xp} XP</p>
          <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
          <p className="small muted">{lp.current} / {lp.needed} XP para o nível {lp.level + 1}</p>
          <div className="stat-pills">
            <span className="pill" title="Sequência de dias"><Icon name="flame" size={18} /> {streak} {streak === 1 ? 'dia' : 'dias'}</span>
            <span className="pill"><Icon name="star" size={18} /> {Object.values(progress.experiences).reduce((s2, e) => s2 + e.bestStars, 0)} estrelas</span>
            <span className="pill"><Icon name="laurel" size={18} /> {achievements} conquistas</span>
          </div>
        </div>
        {cont && contBook && (
          <Link to={`/historia/${cont.bookId}/${cont.id}`} className="btn btn-gold btn-lg player-hero-cta">
            Continuar jornada <Icon name="arrowRight" />
          </Link>
        )}
      </section>

      {cont && contBook && (
        <Link to="/historia" className="continue-banner">
          <ArtImage art={cont.image} className="continue-banner-img" sizes="100vw" priority />
          <div className="continue-banner-shade" />
          <div className="continue-banner-body">
            <p className="eyebrow">Próxima parada · {contBook.name} · Fase {phaseNumber(cont.id)}</p>
            <h2>{cont.title}</h2>
            <p className="small">{cont.scope}</p>
            <span className="btn btn-gold">Abrir o mapa da jornada <Icon name="map" /></span>
          </div>
        </Link>
      )}

      {weak.length > 0 && (
        <Link to="/revisao" className="panel review-hint">
          <Icon name="book" size={24} />
          <div>
            <p className="eyebrow">Revisão sugerida</p>
            <p><strong>{weak[0].title}</strong> · {Math.round(weak[0].ratio * 100)}% de acertos{weak.length > 1 ? ` e mais ${weak.length - 1} assunto(s)` : ''}</p>
          </div>
          <Icon name="arrowRight" />
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
            <p className="eyebrow">Conquistas</p>
            <h2>{achievements} de {ACHIEVEMENTS.length}</h2>
            <p className="muted small">Medalhas, estrelas e marcos.</p>
          </div>
          <Icon name="arrowRight" />
        </Link>
        <Link to="/biblioteca" className="panel daily-card">
          <Icon name="book" size={28} />
          <div>
            <p className="eyebrow">Biblioteca Bíblica</p>
            <h2>{Object.keys(progress.library.characters).length} personagens</h2>
            <p className="muted small">Personagens, livros, lugares e linha do tempo.</p>
          </div>
          <Icon name="arrowRight" />
        </Link>
        <Link to="/revisao" className="panel daily-card">
          <Icon name="scroll" size={28} />
          <div>
            <p className="eyebrow">Revisão inteligente</p>
            <h2>{weak.length ? `${weak.length} assunto(s) para revisar` : 'Seu desempenho'}</h2>
            <p className="muted small">Erros, assuntos dominados e evolução.</p>
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
