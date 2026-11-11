import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { PageHeader, ProgressBar } from '../components/ui'
import { JOURNEYS } from '../data/journeys'
import { useGame } from '../state/GameContext'
import { isJourneyUnlocked, journeyCompletion, journeyMedal } from '../services/game/unlock'

const MEDAL_LABEL = { ouro: 'Medalha de ouro', prata: 'Medalha de prata', bronze: 'Medalha de bronze' }

export default function JourneyMap() {
  const { progress } = useGame()
  return (
    <div className="container section">
      <PageHeader eyebrow="Mapa da jornada bíblica" title="Do princípio ao Sinai">
        Cada jornada é liberada quando a anterior é concluída. Siga a rota em ordem cronológica do texto bíblico.
      </PageHeader>
      <ol className="route">
        {JOURNEYS.map((j) => {
          const unlocked = isJourneyUnlocked(j.id, progress)
          const c = journeyCompletion(j.id, progress)
          const medal = journeyMedal(j.id, progress)
          const status = !unlocked ? 'Bloqueada' : c.done === c.total ? 'Concluída' : c.done > 0 ? 'Em andamento' : 'Disponível'
          return (
            <li key={j.id} className={`route-stop ${unlocked ? '' : 'is-locked'}`}>
              <div className="route-marker" aria-hidden="true">
                {unlocked ? <span>{j.order}</span> : <Icon name="lock" size={16} />}
              </div>
              <article className="route-card">
                <ArtImage art={j.image} className="route-img" sizes="(min-width: 900px) 45vw, 100vw" />
                <div className="route-body">
                  <p className="eyebrow">{j.era} · {j.books}</p>
                  <h2>{j.title}</h2>
                  <p className="route-sub">{j.subtitle}</p>
                  <p className="muted">{j.summary}</p>
                  <div className="route-status">
                    <span className={`tag ${unlocked ? '' : 'tag-locked'}`}>{status}</span>
                    {medal && <span className={`medal medal-${medal}`}><Icon name="laurel" size={16} /> {MEDAL_LABEL[medal]}</span>}
                  </div>
                  {unlocked && <ProgressBar value={c.done} max={c.total} label={`Capítulos concluídos em ${j.title}`} />}
                  {unlocked ? (
                    <Link to={`/jornada/${j.id}`} className="btn btn-gold">
                      {c.done === 0 ? 'Iniciar jornada' : 'Abrir jornada'} <Icon name="arrowRight" />
                    </Link>
                  ) : (
                    <p className="small muted">Conclua a jornada anterior para liberar.</p>
                  )}
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
