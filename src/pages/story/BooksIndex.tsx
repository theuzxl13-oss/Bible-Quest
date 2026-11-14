import { Link } from 'react-router-dom'
import type { Testament } from '../../types'
import { ArtImage } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ui'
import { GROUP_INFO, TESTAMENT_LABEL, groupsOf } from '../../data/bible/canon'
import { STORY_SEQUENCE, experiencesOf } from '../../data/story'
import {
  BOOK_STATUS_LABEL,
  bookCompletion,
  bookMedal,
  bookStatus,
  continueExperience,
  journeyCompletion,
  percent,
  testamentCompletion,
} from '../../services/game/progression'
import { useGame } from '../../state/GameContext'

const TESTAMENTS: Testament[] = ['AT', 'NT']

export default function BooksIndex() {
  const { progress } = useGame()
  const cont = continueExperience(progress)
  const total = journeyCompletion(progress)
  const done = STORY_SEQUENCE.filter((e) => progress.experiences[e.id]?.completed).length

  return (
    <div className="story">
      <section className="hero hero-mid story-hero">
        <ArtImage art="place-raheh" className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to="/historia" className="back-link"><Icon name="arrowLeft" size={16} /> Mapa da jornada</Link>
          <p className="eyebrow">Modo História · Todos os livros</p>
          <h1 className="display-sm">Os 66 livros da jornada</h1>
          <p className="hero-lead">
            Percorra a Bíblia na ordem dos livros, de Gênesis a Apocalipse. Cada experiência traz introdução, narrativa,
            referências, aprendizado e um desafio. Concluir uma libera a próxima.
          </p>
          <div className="journey-meter">
            <div>
              <span className="meter-n">{percent(total)}</span>
              <span className="small">da jornada completa</span>
            </div>
            <div>
              <span className="meter-n">{done}/{STORY_SEQUENCE.length}</span>
              <span className="small">experiências disponíveis concluídas</span>
            </div>
          </div>
          {cont && (
            <Link to={`/historia/${cont.bookId}/${cont.id}`} className="btn btn-gold btn-lg">
              Continuar: {cont.title} <Icon name="arrowRight" />
            </Link>
          )}
        </div>
      </section>

      <div className="container section stack-lg">
        {TESTAMENTS.map((t) => (
          <section key={t} aria-labelledby={`t-${t}`} className="testament">
            <header className="testament-head">
              <h2 id={`t-${t}`}>{TESTAMENT_LABEL[t]}</h2>
              <div className="testament-meter">
                <ProgressBar value={Math.round(testamentCompletion(t, progress) * 1000)} max={1000} label={`Conclusão do ${TESTAMENT_LABEL[t]}`} />
                <span className="small muted">{percent(testamentCompletion(t, progress))} concluído</span>
              </div>
            </header>
            {groupsOf(t).map(({ group, books }) => (
              <div key={group} className="book-group">
                <div className="book-group-head">
                  <ArtImage art={GROUP_INFO[group].image} className="book-group-img" sizes="64px" decorative />
                  <h3>{GROUP_INFO[group].label}</h3>
                  <span className="small muted">{books.length} {books.length === 1 ? 'livro' : 'livros'}</span>
                </div>
                <ol className="book-grid">
                  {books.map((b) => {
                    const status = bookStatus(b, progress)
                    const c = bookCompletion(b.id, progress)
                    const medal = bookMedal(b.id, progress)
                    const open = status !== 'bloqueado' && status !== 'em-preparacao'
                    const inner = (
                      <>
                        <span className="book-abbrev" aria-hidden="true">{b.abbrev}</span>
                        <span className="book-name">{b.name}</span>
                        <span className="book-status">
                          {status === 'concluido' && <Icon name="check" size={14} />}
                          {status === 'bloqueado' && <Icon name="lock" size={14} />}
                          {BOOK_STATUS_LABEL[status]}
                          {c.total > 0 && status !== 'concluido' && status !== 'bloqueado' ? ` · ${percent(c.ratio)}` : ''}
                        </span>
                        {c.total > 0 && <span className="book-bar" style={{ width: `${c.ratio * 100}%` }} aria-hidden="true" />}
                        {medal && <span className={`book-medal medal-${medal}`} title={`Medalha de ${medal}`}><Icon name="laurel" size={14} /></span>}
                      </>
                    )
                    return (
                      <li key={b.id}>
                        {open ? (
                          <Link to={`/historia/${b.id}`} className={`book-tile is-${status}`} aria-label={`${b.name}: ${BOOK_STATUS_LABEL[status]}, ${experiencesOf(b.id).length} experiências`}>
                            {inner}
                          </Link>
                        ) : (
                          <div className={`book-tile is-${status}`} aria-label={`${b.name}: ${BOOK_STATUS_LABEL[status]}`}>
                            {inner}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </section>
        ))}
        <p className="small muted">
          Cânon evangélico de 66 livros. Os livros marcados como "Em preparação" receberão experiências nas próximas versões;
          a jornada segue sempre a ordem dos livros.
        </p>
      </div>
    </div>
  )
}
