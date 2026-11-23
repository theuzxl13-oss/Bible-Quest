import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/ui'
import { getBook } from '../../data/bible/canon'
import { getCharacter } from '../../data/library/characters'
import { DATING_LABEL, TIMELINE } from '../../data/timeline'
import { getExperience } from '../../data/story'
import { isExperienceUnlocked } from '../../services/game/progression'
import { useGame } from '../../state/GameContext'

export default function Timeline() {
  const { progress } = useGame()
  const eras = [...new Set(TIMELINE.map((t) => t.era))]
  return (
    <div className="container section stack-lg narrow">
      <PageHeader eyebrow="Biblioteca Bíblica" title="Linha do tempo">
        Os principais acontecimentos em ordem. Cada um indica o tipo de informação de data:
      </PageHeader>
      <ul className="dating-legend">
        <li><span className="dating dating-biblico">{DATING_LABEL.biblico}</span> o próprio texto bíblico indica a sequência ou o dado.</li>
        <li><span className="dating dating-estimado">{DATING_LABEL.estimado}</span> data aproximada com amplo apoio histórico.</li>
        <li><span className="dating dating-debatido">{DATING_LABEL.debatido}</span> estudiosos propõem datas ou leituras diferentes.</li>
      </ul>
      <p className="small muted">A ordem dos livros na Bíblia nem sempre é a ordem cronológica dos acontecimentos. Por exemplo, o livro de Jó aparece entre os poéticos, e muitos profetas viveram durante os reinados narrados em Reis.</p>
      {eras.map((era) => (
        <section key={era} aria-labelledby={`era-${era}`}>
          <h2 id={`era-${era}`} className="section-title">{era}</h2>
          <ol className="timeline">
            {TIMELINE.filter((t) => t.era === era).map((t) => {
              const exp = t.experienceId ? getExperience(t.experienceId) : undefined
              return (
                <li key={t.id} className="tl-item">
                  <span className="tl-dot" aria-hidden="true" />
                  <div className="tl-card">
                    <h3>{t.title}</h3>
                    <p className={`dating dating-${t.dating.kind}`}>{DATING_LABEL[t.dating.kind]}: {t.dating.label}</p>
                    <p>{t.description}</p>
                    <p className="small"><Icon name="book" size={14} /> {t.references.join('; ')}</p>
                    <p className="small muted">
                      Livros: {t.books.map((b, i) => <span key={b}>{i > 0 && ', '}<Link to={`/biblioteca/livro/${b}`}>{getBook(b)?.name}</Link></span>)}
                      {t.characters.length > 0 && <> · Personagens: {t.characters.map((c, i) => <span key={c}>{i > 0 && ', '}{progress.library.characters[c] ? <Link to={`/biblioteca/personagem/${c}`}>{getCharacter(c)?.name}</Link> : getCharacter(c)?.name}</span>)}</>}
                    </p>
                    {exp && isExperienceUnlocked(exp.id, progress) && <Link to={`/historia/${exp.bookId}/${exp.id}`} className="link small">Ir para a fase: {exp.title}</Link>}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
