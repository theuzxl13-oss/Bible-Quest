import { Link } from 'react-router-dom'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { DemoTag, ProgressBar } from '../../components/ui'
import { FREE_MODES, freeModePool } from '../../services/game/freeModes'
import { PRACTICE_DAILY_CAP } from '../../services/game/scoring'
import { useGame } from '../../state/GameContext'

export default function FreeHub() {
  const { progress, questionPool, dailyContext } = useGame()
  const today = dailyContext().day
  const used = progress.practice.day === today ? progress.practice.xp : 0
  const dailyDone = progress.daily.lastCompletedDay === today

  return (
    <div className="free">
      <section className="free-hero">
        <div className="container">
          <Link to="/quiz" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa do Modo Quiz</Link>
          <p className="eyebrow">Modo Quiz · Treino livre</p>
          <h1 className="display-sm">Treino livre</h1>
          <p className="page-header-lead">
            Escolha qualquer modalidade, dificuldade e quantidade de perguntas, fora do mapa. O XP de treino vai para o
            mesmo perfil, com limite diário.
          </p>
          <div className="free-stats">
            <div className="free-stat"><span>{progress.free.matches}</span><small>partidas</small></div>
            <div className="free-stat"><span>{progress.xp}</span><small>XP total</small></div>
            <div className="free-stat free-cap">
              <small>XP de prática hoje: {used}/{PRACTICE_DAILY_CAP}</small>
              <ProgressBar value={used} max={PRACTICE_DAILY_CAP} label="XP de prática usado hoje" />
            </div>
          </div>
        </div>
      </section>

      <div className="container section stack-lg">
        <div className="free-specials">
          <Link to="/diario" className={`special-card ${dailyDone ? 'is-done' : ''}`}>
            <ArtImage art="place-catherine" className="special-img" sizes="(min-width: 900px) 40vw, 100vw" decorative />
            <div className="special-body">
              <p className="eyebrow">Desafio diário</p>
              <h2>{dailyDone ? 'Concluído hoje' : '5 perguntas · bônus de XP'}</h2>
              <span className="link">{dailyDone ? 'Ver detalhes' : 'Jogar agora'} <Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>
          <Link to="/quiz/multiplayer" className="special-card">
            <ArtImage art="place-petra" className="special-img" sizes="(min-width: 900px) 40vw, 100vw" decorative />
            <div className="special-body">
              <p className="eyebrow">Multiplayer <DemoTag>Demonstração</DemoTag></p>
              <h2>Salas privadas com amigos</h2>
              <span className="link">Abrir salas <Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>
        </div>

        <section aria-labelledby="mods">
          <div className="section-head">
            <h2 id="mods" className="section-title">Modalidades</h2>
            <Link to="/ranking" className="link">Ranking</Link>
          </div>
          <ul className="mode-grid">
            {FREE_MODES.map((m) => {
              const stats = progress.free.byMode[m.id]
              const n = freeModePool(m.id, questionPool).length
              return (
                <li key={m.id}>
                  <Link to={`/quiz/treino/${m.id}`} className="mode-card">
                    <ArtImage art={m.image} className="mode-img" sizes="(min-width: 900px) 25vw, 50vw" decorative />
                    <div className="mode-body">
                      <span className="mode-icon"><Icon name={m.icon} size={22} /></span>
                      <h3>{m.title}</h3>
                      <p className="small">{m.tagline}</p>
                      <p className="mode-meta small">
                        {stats ? `Recorde: ${stats.best} pts · ${stats.played} ${stats.played === 1 ? 'partida' : 'partidas'}` : `${n} perguntas no banco`}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <p className="small muted">
          Limite diário: até {PRACTICE_DAILY_CAP} XP por dia de treino (somado às tentativas reprovadas do Modo
          História). Depois do limite você continua jogando e registrando recordes, mas sem XP extra. Assim, ninguém
          acumula XP infinito repetindo as mesmas perguntas.
        </p>
      </div>
    </div>
  )
}
