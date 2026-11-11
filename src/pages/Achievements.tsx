import { Icon } from '../components/Icon'
import { PageHeader } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { JOURNEYS } from '../data/journeys'
import { journeyMedal } from '../services/game/unlock'
import { useGame } from '../state/GameContext'

const MEDAL = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze' }

export default function Achievements() {
  const { progress } = useGame()
  const unlocked = ACHIEVEMENTS.filter((a) => progress.achievements[a.id]).length
  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Conquistas e medalhas" title={`${unlocked} de ${ACHIEVEMENTS.length} conquistas`}>
        Conquistas premiam conhecimento e constância. Medalhas dependem das estrelas obtidas em cada jornada:
        bronze ao concluir, prata com 2/3 das estrelas e ouro com todas.
      </PageHeader>

      <section aria-labelledby="med">
        <h2 id="med" className="section-title">Medalhas das jornadas</h2>
        <ul className="medal-grid">
          {JOURNEYS.map((j) => {
            const m = journeyMedal(j.id, progress)
            return (
              <li key={j.id} className={`medal-card ${m ? `medal-${m}` : 'is-locked'}`}>
                <Icon name="laurel" size={32} />
                <strong>{j.title}</strong>
                <span className="small">{m ? `Medalha de ${MEDAL[m]}` : 'Ainda não conquistada'}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="ach">
        <h2 id="ach" className="section-title">Conquistas</h2>
        <ul className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const at = progress.achievements[a.id]
            return (
              <li key={a.id} className={`ach-card ${at ? 'is-on' : ''}`}>
                <span className="ach-icon"><Icon name={at ? a.icon : 'lock'} size={26} /></span>
                <div>
                  <strong>{a.title}</strong>
                  <p className="small muted">{a.description}</p>
                  <p className="small">{at ? `Conquistada em ${new Date(at).toLocaleDateString('pt-BR')}` : 'Bloqueada'}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
