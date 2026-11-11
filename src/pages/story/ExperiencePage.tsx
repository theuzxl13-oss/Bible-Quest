import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { ReadAloud } from '../../components/ReadAloud'
import { Stars } from '../../components/ui'
import { getBook } from '../../data/bible/canon'
import { BIBLE_SOURCE_NOTE, getExperience } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { isExperienceUnlocked } from '../../services/game/progression'
import { STORY_CHALLENGE_SIZE } from './StoryChallenge'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

const STEPS = ['Introdução', 'Narrativa', 'Referências', 'Aprendizado', 'Desafio', 'Resultado', 'Recompensa']

export default function ExperiencePage() {
  const { bookId, experienceId } = useParams()
  const exp = getExperience(experienceId)
  const { progress, markVisited } = useGame()
  const unlocked = exp ? isExperienceUnlocked(exp.id, progress) : false

  useEffect(() => {
    if (exp && unlocked) markVisited(exp.id)
  }, [exp, unlocked, markVisited])

  if (!exp || exp.bookId !== bookId) return <NotFound />
  if (!unlocked) return <Navigate to={`/historia/${exp.bookId}`} replace />
  const book = getBook(exp.bookId)!
  const count = Math.min(questionsForExperience(exp.id).length, STORY_CHALLENGE_SIZE)
  const ep = progress.experiences[exp.id]

  return (
    <article>
      <section className="hero hero-mid">
        <ArtImage art={exp.image} className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <Link to={`/historia/${book.id}`} className="back-link"><Icon name="arrowLeft" size={16} /> {book.name}</Link>
          <p className="eyebrow">{book.name} · Experiência {exp.order} · {exp.scope}</p>
          <h1 className="display-sm">{exp.title}</h1>
          {ep?.completed && <p className="small"><Stars value={ep.bestStars} size={16} /> Concluída · melhor pontuação {ep.bestScore}</p>}
          <ArtCredit art={exp.image} />
        </div>
      </section>

      <div className="container section reading">
        <ol className="steps-bar" aria-label="Etapas da experiência">
          {STEPS.map((s, i) => (
            <li key={s} className={i < 4 ? 'is-here' : ''}><span>{i + 1}</span>{s}</li>
          ))}
        </ol>

        <section className="reading-block" aria-labelledby="intro">
          <div className="reading-head">
            <h2 id="intro"><span className="step-n">1</span> Introdução</h2>
            <ReadAloud text={exp.intro.join(' ')} />
          </div>
          {exp.intro.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <section className="reading-block" aria-labelledby="narr">
          <div className="reading-head">
            <h2 id="narr"><span className="step-n">2</span> Narrativa</h2>
            <span className="tag tag-narrative" title="Texto criado pela equipe para ambientação">Narrativa dramatizada</span>
            <ReadAloud text={exp.narrative.join(' ')} />
          </div>
          {exp.narrative.map((p, i) => <p key={i} className="narrative">{p}</p>)}
          <p className="small muted">Ambientação escrita pela equipe. Não é texto bíblico e não atribui falas aos personagens.</p>
        </section>

        <section className="reading-block scripture" aria-labelledby="scr">
          <div className="reading-head">
            <h2 id="scr"><span className="step-n">3</span> Referências bíblicas</h2>
            <span className="tag tag-scripture">Almeida RC 1911</span>
            <ReadAloud text={exp.passages.map((p) => `${p.reference}. ${p.text}`).join(' ')} />
          </div>
          {exp.passages.map((p) => (
            <blockquote key={p.reference} className="passage">
              <p>{p.text}</p>
              <cite>{p.reference}</cite>
            </blockquote>
          ))}
          <p className="refs-title">Para ler na sua Bíblia:</p>
          <ul className="refs-list">
            {exp.references.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <p className="small muted">{BIBLE_SOURCE_NOTE}</p>
        </section>

        <section className="reading-block" aria-labelledby="learn">
          <div className="reading-head">
            <h2 id="learn"><span className="step-n">4</span> Aprendizado</h2>
            <ReadAloud text={exp.learning.join(' ')} />
          </div>
          {exp.learning.map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <div className="start-box panel">
          <div>
            <h2><span className="step-n">5</span> Desafio</h2>
            <p className="muted">{count} perguntas · 3 tentativas · acerte pelo menos 60% para concluir e liberar a próxima experiência</p>
            {ep?.completed && <p className="small muted">Ao repetir, você só ganha XP se superar sua melhor pontuação ({ep.bestScore}).</p>}
          </div>
          <Link to={`/historia/${book.id}/${exp.id}/desafio`} className="btn btn-gold btn-lg">
            Iniciar desafio <Icon name="play" size={18} />
          </Link>
        </div>
      </div>
    </article>
  )
}
