import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { GameIcon } from '../components/GameIcon'
import { LocalProfileNotice, ProgressBar, Stars } from '../components/ui'
import { STORY_SEQUENCE } from '../data/story'
import { levelProgress, levelTitle } from '../services/game/levels'
import { continueExperience } from '../services/game/progression'
import { visibleStreak } from '../services/game/streak'
import { useGame } from '../state/GameContext'
import { PlayerCharacter } from '../components/character/PlayerCharacter'
import { weakTopics } from '../services/game/review'
import { phaseNumber } from '../services/game/journeyMap'
import { quizAvatarNode, quizCompletion } from '../services/game/quizMap'
import { DAILY_BONUS } from '../services/game/scoring'
import { bausDisponiveis, conquistaRecente, elementosLiberados, formatarTempo, minutosAteAmanha, proximaMelhoria } from '../services/game/acampamento'
import { textoCondicao } from '../data/acampamento'
import { CenaAcampamento, type CenaApi, type RotuloAcampamento } from '../components/camp/CenaAcampamento'
import type { AlvoAcampamento } from '../character3d/acampamento'
import type { Progress } from '../types'

export const MODE_LABEL = { historia: 'Modo História', livre: 'Modo Quiz · treino', quiz: 'Modo Quiz', diario: 'Desafio diário', revisao: 'Revisão', 'demo-multiplayer': 'Multiplayer (demo)' } as const

/** Progresso geral: fases publicadas do Modo História + desafios do mapa do Quiz. */
export function overallProgress(p: Progress) {
  const story = STORY_SEQUENCE.filter((e) => p.experiences[e.id]?.completed).length
  const quiz = quizCompletion(p)
  return { done: story + quiz.done, total: STORY_SEQUENCE.length + quiz.total, story, quiz }
}

/** Contagem regressiva até o próximo desafio diário, atualizada a cada minuto. */
function useMinutosAteAmanha() {
  const [min, setMin] = useState(() => minutosAteAmanha())
  useEffect(() => {
    const t = window.setInterval(() => setMin(minutosAteAmanha()), 30000)
    return () => window.clearInterval(t)
  }, [])
  return min
}

/**
 * CENTRAL DO JOGO (v0.10): o acampamento do jogador.
 * Cenário 3D com o personagem no centro, cabeçalho com nível e XP, quadro de
 * missões com dados reais, acesso aos dois modos e um diário de viagem abaixo.
 */
export default function Dashboard() {
  const { profile, progress, dailyContext, questionPool } = useGame()
  const navigate = useNavigate()
  const cena = useRef<CenaApi>(null)
  const character = profile!.character!
  const lp = levelProgress(progress.xp)
  const today = dailyContext().day
  const streak = visibleStreak(progress.streak, today)
  const dailyDone = progress.daily.lastCompletedDay === today
  const cont = continueExperience(progress)
  const overall = overallProgress(progress)
  const quizNext = quizAvatarNode(progress)
  const stars = Object.values(progress.experiences).reduce((s, e) => s + e.bestStars, 0) + overall.quiz.stars
  const baus = bausDisponiveis(progress)
  const recente = conquistaRecente(progress)
  const melhoria = proximaMelhoria(progress)
  const elementos = elementosLiberados(progress)
  const weak = weakTopics(progress, questionPool)
  const minutos = useMinutosAteAmanha()
  const [quadroAberto, setQuadroAberto] = useState(() => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 900px)').matches)

  const rotulos: RotuloAcampamento[] = [
    { id: 'tenda', label: 'Personagem', detalhe: 'roupas e acessórios na tenda', icon: 'tunica' },
    { id: 'mesa', label: 'Biblioteca', detalhe: 'mesa de estudos', icon: 'book' },
    { id: 'quadro', label: 'Diário', detalhe: dailyDone ? 'desafio diário concluído' : 'desafio diário disponível', icon: 'scroll', badge: dailyDone ? undefined : 1 },
    { id: 'bau', label: 'Recompensas', detalhe: baus ? `${baus} baú(s) pronto(s) para abrir no mapa` : 'conquistas e baús', icon: 'bau', badge: baus || undefined },
  ]
  const destino: Record<AlvoAcampamento, string> = {
    personagem: '/guarda-roupa',
    tenda: '/guarda-roupa',
    mesa: '/biblioteca',
    quadro: '/diario',
    bau: baus ? '/historia' : '/conquistas',
  }

  return (
    <div className="camp">
      <section className="camp-stage" aria-labelledby="home-name">
        <CenaAcampamento ref={cena} appearance={character} elementos={elementos} bauPronto={baus > 0} rotulos={rotulos} onSelect={(a) => navigate(destino[a])} />

        <header className="camp-hud">
          <Link to="/perfil" className="hud-player" aria-label={`Perfil de ${profile!.nickname}`}>
            <span className="hud-portrait"><PlayerCharacter size={60} portrait pose="still" /></span>
            <span className="hud-player-info">
              <span className="hud-name">
                <h1 id="home-name">{character.name}</h1>
              </span>
              <span className="hud-level"><GameIcon name="shield" size={18} /> Nível {lp.level} · {levelTitle(lp.level)}</span>
              <span className="hud-xp">
                <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
                <span className="hud-xp-text">{lp.current} / {lp.needed} XP</span>
              </span>
            </span>
          </Link>
          <div className="hud-resources">
            <span className="hud-res" aria-label={`${stars} estrelas conquistadas`} title="Estrelas das fases e desafios">
              <span className="hud-res-icon" aria-hidden="true"><GameIcon name="star" size={30} /></span>
              {stars}
            </span>
            <span className="hud-res" aria-label={`Sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'}`} title="Dias seguidos jogando">
              <span className="hud-res-icon" aria-hidden="true"><GameIcon name="flame" size={30} /></span>
              {streak}
            </span>
            <Link to="/configuracoes" className="hud-settings" aria-label="Configurações"><GameIcon name="settings" size={30} /></Link>
          </div>
        </header>

        <div className="camp-flag" aria-hidden="true">
          <Icon name="book" size={26} />
          <span>Bible<br />Quest</span>
        </div>

        <details className="camp-board" open={quadroAberto} onToggle={(e) => setQuadroAberto((e.currentTarget as HTMLDetailsElement).open)}>
          <summary>
            <GameIcon name="scroll" size={24} /> Missões
            {(!dailyDone || baus > 0) && <span className="camp-badge" aria-label="há missões disponíveis">{(dailyDone ? 0 : 1) + (baus ? 1 : 0)}</span>}
          </summary>
          <ul className="board-list">
            <li>
              <Link to="/diario" className={`board-item ${dailyDone ? 'is-done' : ''}`}>
                <span className="board-icon"><GameIcon name={dailyDone ? 'check' : 'calendar'} size={28} /></span>
                <span>
                  <strong>Desafio diário</strong>
                  <small>{dailyDone ? `Concluído. Próximo em ${formatarTempo(minutos)}` : `5 perguntas · +${DAILY_BONUS} XP de bônus · termina em ${formatarTempo(minutos)}`}</small>
                </span>
              </Link>
            </li>
            <li>
              <Link to={cont ? `/historia/${cont.bookId}/${cont.id}` : '/historia'} className="board-item">
                <span className="board-icon"><GameIcon name="map" size={28} /></span>
                <span>
                  <strong>Continuar jornada</strong>
                  <small>{cont ? `Fase ${phaseNumber(cont.id)} · ${cont.title}` : 'Todas as fases publicadas concluídas'}</small>
                </span>
              </Link>
            </li>
            <li>
              <Link to={baus ? '/historia' : '/conquistas'} className={`board-item ${baus ? 'is-hot' : ''}`}>
                <span className="board-icon"><GameIcon name="bau" size={28} /></span>
                <span>
                  <strong>{baus ? `${baus} ${baus === 1 ? 'baú pronto' : 'baús prontos'} para abrir` : 'Baús de recompensa'}</strong>
                  <small>{baus ? 'Abra no mapa do Modo História.' : recente ? `Conquista recente: ${recente.title}` : 'Conclua fases para liberar baús no mapa.'}</small>
                </span>
              </Link>
            </li>
            {melhoria && (
              <li className="board-item board-upgrade">
                <span className="board-icon"><GameIcon name="tenda" size={28} /></span>
                <span>
                  <strong>Próximo no acampamento: {melhoria.elemento.nome}</strong>
                  <small>{textoCondicao(melhoria.elemento.condicao)} ({melhoria.atual}/{melhoria.meta})</small>
                  <ProgressBar value={melhoria.atual} max={melhoria.meta} label={`Andamento até liberar ${melhoria.elemento.nome}`} />
                </span>
              </li>
            )}
          </ul>
        </details>

        <nav className="camp-modes" aria-label="Modos de jogo">
          <Link to="/historia" className="camp-mode camp-mode-story" onMouseEnter={() => cena.current?.gesto('celebrate', 2.4)} onFocus={() => cena.current?.gesto('celebrate', 2.4)}>
            <span className="camp-mode-icon" aria-hidden="true"><GameIcon name="book" size={46} /></span>
            <span className="camp-mode-text">
              <strong>Modo História</strong>
              <small>Explore as Escrituras</small>
              <span className="camp-mode-progress">{overall.story} de {STORY_SEQUENCE.length} fases</span>
            </span>
            <Icon name="arrowRight" size={22} className="camp-mode-arrow" />
          </Link>
          <Link to="/quiz" className="camp-mode camp-mode-quiz" onMouseEnter={() => cena.current?.gesto('react', 2.4)} onFocus={() => cena.current?.gesto('react', 2.4)}>
            <span className="camp-mode-icon" aria-hidden="true"><GameIcon name="cerebro" size={46} /></span>
            <span className="camp-mode-text">
              <strong>Modo Quiz</strong>
              <small>Teste seu conhecimento</small>
              <span className="camp-mode-progress">{overall.quiz.done} de {overall.quiz.total} desafios</span>
            </span>
            <Icon name="arrowRight" size={22} className="camp-mode-arrow" />
          </Link>
        </nav>
      </section>

      <div className="container section stack-lg camp-more">
        <h2 className="section-title">Diário de viagem</h2>
        <div className="panel camp-journey">
          <ProgressBar value={overall.done} max={overall.total} label="Progresso geral" />
          <p className="small muted">
            Progresso geral: {overall.done} de {overall.total} fases e desafios disponíveis · {progress.xp} XP no total · próximo desafio do Quiz: {quizNext.title}
          </p>
        </div>

        <div className="dash-row">
          {(
            [
              { to: '/revisao', icon: 'scroll', eyebrow: 'Revisão inteligente', title: weak.length ? `${weak.length} assunto(s) para revisar` : 'Seu desempenho', text: weak.length ? `${weak[0].title}: ${Math.round(weak[0].ratio * 100)}% de acertos` : 'Erros, assuntos dominados e evolução.' },
              { to: '/estatisticas', icon: 'trophy', eyebrow: 'Estatísticas', title: `${progress.stats.answered} respostas`, text: 'Acertos por modo, tipo de pergunta e diário.' },
              { to: '/ranking', icon: 'crown', eyebrow: 'Rankings', title: 'Seus recordes', text: 'Ranking online ainda indisponível.' },
            ] as { to: string; icon: IconName; eyebrow: string; title: string; text: string }[]
          ).map((c) => (
            <Link key={c.to} to={c.to} className="panel daily-card">
              <GameIcon name={c.icon} size={40} />
              <div>
                <p className="eyebrow">{c.eyebrow}</p>
                <h3>{c.title}</h3>
                <p className="muted small">{c.text}</p>
              </div>
              <Icon name="arrowRight" />
            </Link>
          ))}
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
