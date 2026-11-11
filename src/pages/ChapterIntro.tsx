import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { ReadAloud } from '../components/ReadAloud'
import { BIBLE_SOURCE_NOTE, getChapter, getJourney } from '../data/journeys'
import { questionsForChapter } from '../data/questions'
import { useGame } from '../state/GameContext'
import { isChapterUnlocked } from '../services/game/unlock'
import NotFound from './NotFound'

export default function ChapterIntro() {
  const { chapterId } = useParams()
  const chapter = getChapter(chapterId)
  const { progress } = useGame()
  if (!chapter) return <NotFound />
  if (!isChapterUnlocked(chapter.id, progress)) return <Navigate to={`/jornada/${chapter.journeyId}`} replace />
  const journey = getJourney(chapter.journeyId)!
  const count = questionsForChapter(chapter.id).length

  return (
    <article>
      <section className="hero hero-mid">
        <ArtImage art={chapter.image} className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to={`/jornada/${journey.id}`} className="back-link"><Icon name="arrowLeft" size={16} /> {journey.title}</Link>
          <p className="eyebrow">Capítulo {chapter.order} · {chapter.scope}</p>
          <h1 className="display-sm">{chapter.title}</h1>
          <ArtCredit art={chapter.image} />
        </div>
      </section>

      <div className="container section reading">
        <section className="reading-block" aria-labelledby="narr">
          <div className="reading-head">
            <h2 id="narr">Introdução</h2>
            <span className="tag tag-narrative" title="Texto criado pela equipe para ambientação">Narrativa dramatizada</span>
            <ReadAloud text={chapter.narrative.join(' ')} />
          </div>
          {chapter.narrative.map((p, i) => (
            <p key={i} className="narrative">{p}</p>
          ))}
          <p className="small muted">Esta introdução é uma ambientação escrita pela equipe e não faz parte do texto bíblico.</p>
        </section>

        <section className="reading-block scripture" aria-labelledby="scr">
          <div className="reading-head">
            <h2 id="scr">Texto bíblico</h2>
            <span className="tag tag-scripture">Almeida RC 1911</span>
            <ReadAloud text={chapter.passages.map((p) => `${p.reference}. ${p.text}`).join(' ')} />
          </div>
          {chapter.passages.map((p) => (
            <blockquote key={p.reference} className="passage">
              <p>{p.text}</p>
              <cite>{p.reference}</cite>
            </blockquote>
          ))}
          <p className="small muted">{BIBLE_SOURCE_NOTE} Leia o capítulo completo em {chapter.scope}.</p>
        </section>

        <section className="reading-block" aria-labelledby="ctx">
          <div className="reading-head">
            <h2 id="ctx">Contexto histórico e bíblico</h2>
            <ReadAloud text={chapter.context.join(' ')} />
          </div>
          {chapter.context.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <div className="start-box panel">
          <div>
            <h2>Desafio do capítulo</h2>
            <p className="muted">{count} perguntas · 3 tentativas · acerte pelo menos 60% para concluir</p>
          </div>
          <Link to={`/desafio/${chapter.id}`} className="btn btn-gold btn-lg">
            Iniciar desafio <Icon name="play" size={18} />
          </Link>
        </div>
      </div>
    </article>
  )
}
