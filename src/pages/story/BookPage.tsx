import { Link, useParams } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { ProgressBar, Stars } from '../../components/ui'
import { BOOKS, GROUP_INFO, TESTAMENT_LABEL, getBook } from '../../data/bible/canon'
import { experiencesOf } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { phaseNumber } from '../../services/game/journeyMap'
import { BOOK_STATUS_LABEL, bookCompletion, bookMedal, bookStatus, isExperienceUnlocked, percent } from '../../services/game/progression'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

export default function BookPage() {
  const { bookId } = useParams()
  const book = getBook(bookId)
  const { progress } = useGame()
  if (!book) return <NotFound />
  const exps = experiencesOf(book.id)
  const status = bookStatus(book, progress)
  const c = bookCompletion(book.id, progress)
  const medal = bookMedal(book.id, progress)
  const image = exps[0]?.image ?? GROUP_INFO[book.group].image
  const idx = BOOKS.findIndex((b) => b.id === book.id)
  const nextBook = BOOKS[idx + 1]

  return (
    <>
      <section className="hero hero-mid">
        <ArtImage art={image} className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to="/historia/livros" className="back-link"><Icon name="arrowLeft" size={16} /> Todos os livros</Link>
          <p className="eyebrow">{TESTAMENT_LABEL[book.testament]} · {GROUP_INFO[book.group].label} · {book.chapters} capítulos</p>
          <h1 className="display-sm">{book.name}</h1>
          <div className="route-status">
            <span className="tag">{BOOK_STATUS_LABEL[status]}</span>
            {medal && <span className={`medal medal-${medal}`}><Icon name="laurel" size={16} /> Medalha de {medal}</span>}
          </div>
          {c.total > 0 && (
            <div className="hero-meter">
              <ProgressBar value={c.done} max={c.total} label={`Conclusão de ${book.name}`} />
              <span className="small">{c.done}/{c.total} fases · {percent(c.ratio)} · {c.stars}/{c.maxStars} estrelas</span>
            </div>
          )}
          <ArtCredit art={image} />
        </div>
      </section>

      <div className="container section">
        {exps.length === 0 ? (
          <div className="panel stack center">
            <h2>Em preparação</h2>
            <p className="muted">As experiências de {book.name} ainda estão sendo escritas e revisadas. Enquanto isso, você pode praticar no Modo Quiz.</p>
            <div className="row-actions" style={{ justifyContent: 'center' }}>
              <Link to="/historia" className="btn btn-outline">Voltar ao mapa</Link>
              <Link to="/quiz/treino" className="btn btn-gold">Ir para o Modo Quiz</Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="section-title">Fases</h2>
            <ol className="exp-path">
              {exps.map((e) => {
                const open = isExperienceUnlocked(e.id, progress)
                const ep = progress.experiences[e.id]
                const n = questionsForExperience(e.id).length
                return (
                  <li key={e.id} className={`exp-step ${open ? '' : 'is-locked'} ${ep?.completed ? 'is-done' : ''}`}>
                    <span className="exp-marker" aria-hidden="true">
                      {ep?.completed ? <Icon name="check" size={16} /> : open ? e.order : <Icon name="lock" size={14} />}
                    </span>
                    <article className="chapter-card">
                      <ArtImage art={e.image} className="chapter-img" sizes="(min-width: 900px) 200px, 30vw" />
                      <div className="chapter-body">
                        <p className="eyebrow">Fase {phaseNumber(e.id)} · {e.scope}</p>
                        <h3>{e.title}</h3>
                        <p className="small muted">{n} perguntas</p>
                        {ep?.completed && <Stars value={ep.bestStars} />}
                      </div>
                      <div className="chapter-action">
                        {open ? (
                          <Link to={`/historia/${book.id}/${e.id}`} className={`btn ${ep?.completed ? 'btn-outline' : 'btn-gold'}`} aria-label={`${ep?.completed ? 'Revisitar' : 'Começar'} fase ${phaseNumber(e.id)}: ${e.title}`}>
                            {ep?.completed ? 'Revisitar' : 'Começar'}
                          </Link>
                        ) : (
                          <span className="locked-label"><Icon name="lock" size={16} /> Conclua a anterior</span>
                        )}
                      </div>
                    </article>
                  </li>
                )
              })}
            </ol>
            {nextBook && (
              <p className="small muted next-book">
                Próximo livro: <strong>{nextBook.name}</strong>
                {experiencesOf(nextBook.id).length === 0 ? ' (em preparação)' : ', liberado ao concluir este livro.'}
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
