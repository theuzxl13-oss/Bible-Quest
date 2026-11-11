import { Link, useSearchParams } from 'react-router-dom'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { PageHeader, ProgressBar } from '../../components/ui'
import { TESTAMENT_LABEL, booksOf } from '../../data/bible/canon'
import { BOOK_INFO } from '../../data/library/books'
import { CHARACTERS } from '../../data/library/characters'
import { PLACES } from '../../data/library/places'
import { STORY_SEQUENCE } from '../../data/story'
import { bookCompletion, percent } from '../../services/game/progression'
import { phaseNumber } from '../../services/game/journeyMap'
import { useGame } from '../../state/GameContext'

type Tab = 'personagens' | 'livros' | 'lugares'
const TABS: { id: Tab; label: string }[] = [
  { id: 'personagens', label: 'Personagens' },
  { id: 'livros', label: 'Livros' },
  { id: 'lugares', label: 'Lugares' },
]

/** Primeira fase em que um personagem ou lugar aparece. */
export function firstPhaseWith(kind: 'characters' | 'places', id: string) {
  return STORY_SEQUENCE.find((e) => e[kind].includes(id))
}

export default function Library() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'personagens') as Tab
  const { progress } = useGame()
  const metChars = CHARACTERS.filter((c) => progress.library.characters[c.id]).length
  const metPlaces = PLACES.filter((p) => progress.library.places[p.id]).length

  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Biblioteca Bíblica" title="Personagens, livros e lugares">
        As fichas de personagens e lugares são desbloqueadas quando você os encontra na jornada. Os livros podem ser
        consultados a qualquer momento. <Link to="/linha-do-tempo">Ver a linha do tempo</Link>.
      </PageHeader>

      <div className="tabs" role="tablist" aria-label="Seções da Biblioteca">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`lib-${t.id}`} aria-selected={tab === t.id} aria-controls={`lib-panel-${t.id}`} className={`tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setParams({ aba: t.id }, { replace: true })}>
            {t.label}
            {t.id === 'personagens' && ` (${metChars}/${CHARACTERS.length})`}
            {t.id === 'lugares' && ` (${metPlaces}/${PLACES.length})`}
          </button>
        ))}
        <Link to="/linha-do-tempo" className="tab">Linha do tempo</Link>
      </div>

      <section role="tabpanel" id={`lib-panel-${tab}`} aria-labelledby={`lib-${tab}`}>
        {tab === 'personagens' && (
          <ul className="lib-grid">
            {CHARACTERS.map((c) => {
              const met = progress.library.characters[c.id]
              const first = firstPhaseWith('characters', c.id)
              return (
                <li key={c.id}>
                  {met ? (
                    <Link to={`/biblioteca/personagem/${c.id}`} className="lib-card">
                      <span className="portrait portrait-lg"><ArtImage art={c.image} focus={c.focus} className="portrait-img" sizes="96px" decorative /></span>
                      <strong>{c.name}</strong>
                      <span className="small muted">{c.role}</span>
                    </Link>
                  ) : (
                    <div className="lib-card is-locked" aria-label={`Personagem ainda não encontrado${first ? `, aparece na fase ${phaseNumber(first.id)}` : ''}`}>
                      <span className="portrait portrait-lg lib-unknown"><Icon name="lock" size={26} /></span>
                      <strong>???</strong>
                      <span className="small muted">{first ? `Aparece na fase ${phaseNumber(first.id)}` : 'Em breve'}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {tab === 'livros' && (
          <div className="stack-lg">
            {(['AT', 'NT'] as const).map((t) => (
              <section key={t} aria-labelledby={`lb-${t}`}>
                <h2 id={`lb-${t}`} className="section-title">{TESTAMENT_LABEL[t]}</h2>
                <ul className="lib-books">
                  {booksOf(t).map((b) => {
                    const c = bookCompletion(b.id, progress)
                    return (
                      <li key={b.id}>
                        <Link to={`/biblioteca/livro/${b.id}`} className="lib-book">
                          <span className="book-abbrev">{b.abbrev}</span>
                          <span>
                            <strong>{b.name}</strong>
                            <span className="small muted"> · {BOOK_INFO[b.id]?.genre}</span>
                          </span>
                          <span className="small gold">{c.total ? percent(c.ratio) : ''}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === 'lugares' && (
          <ul className="lib-grid">
            {PLACES.map((pl) => {
              const met = progress.library.places[pl.id]
              const first = firstPhaseWith('places', pl.id)
              return (
                <li key={pl.id}>
                  {met ? (
                    <Link to={`/biblioteca/lugar/${pl.id}`} className="lib-card lib-place">
                      <ArtImage art={pl.image} className="lib-place-img" sizes="200px" decorative />
                      <strong>{pl.name}</strong>
                    </Link>
                  ) : (
                    <div className="lib-card lib-place is-locked">
                      <span className="lib-place-img lib-unknown"><Icon name="lock" size={26} /></span>
                      <strong>???</strong>
                      <span className="small muted">{first ? `Aparece na fase ${phaseNumber(first.id)}` : 'Em breve'}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <ProgressBar value={metChars + metPlaces} max={CHARACTERS.length + PLACES.length} label="Fichas desbloqueadas" />
      <p className="small muted">{metChars + metPlaces} de {CHARACTERS.length + PLACES.length} fichas desbloqueadas.</p>
    </div>
  )
}
