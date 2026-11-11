import { Icon } from '../components/Icon'
import { PageHeader } from '../components/ui'
import { ACHIEVEMENTS, ACHIEVEMENT_AREA_LABEL } from '../data/achievements'
import { BOOKS } from '../data/bible/canon'
import { hasContent } from '../data/story'
import { bookMedal } from '../services/game/progression'
import { useGame } from '../state/GameContext'
import { PlayerCharacter } from '../components/character/PlayerCharacter'

const MEDAL = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze' } as const
const AREAS = ['historia', 'livre', 'constancia'] as const

export default function Achievements() {
  const { progress } = useGame()
  const unlocked = ACHIEVEMENTS.filter((a) => progress.achievements[a.id]).length
  const books = BOOKS.filter((b) => hasContent(b.id))
  return (
    <div className="container section stack-lg">
      <div className="ach-hero">
        <PlayerCharacter size={110} pose={unlocked > 0 ? 'celebrate' : 'idle'} />
      </div>
      <PageHeader eyebrow="Conquistas e medalhas" title={`${unlocked} de ${ACHIEVEMENTS.length} conquistas`}>
        Conquistas premiam conhecimento e constância nos dois modos. Medalhas de livro dependem das estrelas: bronze ao
        concluir, prata com 2/3 das estrelas e ouro com todas.
      </PageHeader>

      <section aria-labelledby="med">
        <h2 id="med" className="section-title">Medalhas dos livros</h2>
        <ul className="medal-grid">
          {books.map((b) => {
            const m = bookMedal(b.id, progress)
            return (
              <li key={b.id} className={`medal-card ${m ? `medal-${m}` : 'is-locked'}`}>
                <Icon name="laurel" size={32} />
                <strong>{b.name}</strong>
                <span className="small">{m ? `Medalha de ${MEDAL[m]}` : 'Ainda não conquistada'}</span>
              </li>
            )
          })}
        </ul>
        <p className="small muted">Novos livros ganharão medalhas à medida que suas experiências forem publicadas.</p>
      </section>

      {AREAS.map((area) => (
        <section key={area} aria-labelledby={`ach-${area}`}>
          <h2 id={`ach-${area}`} className="section-title">{ACHIEVEMENT_AREA_LABEL[area]}</h2>
          <ul className="ach-grid">
            {ACHIEVEMENTS.filter((a) => a.area === area).map((a) => {
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
      ))}
    </div>
  )
}
