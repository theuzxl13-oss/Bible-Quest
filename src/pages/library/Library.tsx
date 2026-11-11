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
import { DATING_LABEL, TIMELINE } from '../../data/timeline'
import { THEMES } from '../../data/themes'
import { filteredPool } from '../../services/game/freeModes'
import { getExperience } from '../../data/story'

type Tab = 'personagens' | 'livros' | 'lugares' | 'acontecimentos' | 'temas'
const TABS: { id: Tab; label: string }[] = [
  { id: 'personagens', label: 'Personagens' },
  { id: 'livros', label: 'Livros' },
  { id: 'lugares', label: 'Lugares' },
  { id: 'acontecimentos', label: 'Acontecimentos' },
  { id: 'temas', label: 'Temas' },
]

/** Fases do Modo História ligadas a um tema. */
export function themeExperiences(themeId: string) {
  const t = THEMES.find((x) => x.id === themeId)
  if (!t) return []
  return STORY_SEQUENCE.filter((e) => t.experiences?.includes(e.id) || (t.prefix && e.id.startsWith(t.prefix)) || t.books?.includes(e.bookId))
}

/** Primeira fase em que um personagem ou lugar aparece. */
export function firstPhaseWith(kind: 'characters' | 'places', id: string) {
  return STORY_SEQUENCE.find((e) => e[kind].includes(id))
}

export default function Library() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'personagens') as Tab
  const { progress, questionPool } = useGame()
  const metChars = CHARACTERS.filter((c) => progress.library.characters[c.id]).length
  const metPlaces = PLACES.filter((p) => progress.library.places[p.id]).length

  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Biblioteca Bíblica" title="Personagens, livros, lugares, acontecimentos e temas">
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

        {tab === 'acontecimentos' && (
          <ol className="lib-events">
            {TIMELINE.map((ev) => {
              const exp = getExperience(ev.experienceId)
              const open = !exp || Boolean(progress.experiences[exp.id]?.completed)
              return (
                <li key={ev.id} className={`panel lib-event ${open ? '' : 'is-locked'}`}>
                  <p className="eyebrow">{ev.era} · {DATING_LABEL[ev.dating.kind]}</p>
                  <h3>{open ? ev.title : <><Icon name="lock" size={16} /> {ev.title}</>}</h3>
                  {open ? (
                    <>
                      <p className="small">{ev.description}</p>
                      <p className="small muted">{ev.dating.label} · {ev.references.join('; ')}</p>
                      {exp && <Link to={`/historia/${exp.bookId}/${exp.id}/historia`} className="link small">Rever a fase {phaseNumber(exp.id)}: {exp.title}</Link>}
                    </>
                  ) : (
                    <p className="small muted">Conclua a fase {phaseNumber(exp!.id)} ({exp!.title}) para ler este acontecimento.</p>
                  )}
                </li>
              )
            })}
          </ol>
        )}

        {tab === 'temas' && (
          <ul className="lib-themes">
            {THEMES.map((t) => {
              const exps = themeExperiences(t.id)
              const done = exps.filter((e) => progress.experiences[e.id]?.completed).length
              const qs = filteredPool('tema', questionPool, { themeId: t.id }).length
              return (
                <li key={t.id} className="panel stack-sm">
                  <h3>{t.label}</h3>
                  {exps.length > 0 ? (
                    <>
                      <ProgressBar value={done} max={exps.length} label={`Fases concluídas do tema ${t.label}`} />
                      <p className="small muted">{done} de {exps.length} fases do Modo História: {exps.map((e) => e.title).join(', ')}.</p>
                    </>
                  ) : (
                    <p className="small muted">As fases deste tema ainda estão em preparação no Modo História.</p>
                  )}
                  <p className="small">{qs} {qs === 1 ? 'pergunta' : 'perguntas'} no banco{qs >= 5 ? ' · disponível no treino por tema do Modo Quiz' : ''}.</p>
                  {qs >= 5 && <Link to="/quiz/treino/tema" className="link small">Treinar por tema</Link>}
                </li>
              )
            })}
          </ul>
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
