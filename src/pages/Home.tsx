import { Link } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { JOURNEYS } from '../data/journeys'
import { QUESTIONS } from '../data/questions'
import { useGame } from '../state/GameContext'

export default function Home() {
  const { profile, settings } = useGame()
  const start = profile ? '/painel' : settings.onboardingDone ? '/entrar' : '/boas-vindas'
  return (
    <>
      <section className="hero hero-full">
        <ArtImage art="hero-jerusalem" className="hero-bg" priority />
        <div className="hero-shade" />
        <div className="container hero-content">
          <p className="eyebrow">Kzann Tech apresenta</p>
          <h1 className="display">Bible Quest</h1>
          <p className="hero-slogan">Uma jornada pelas Escrituras.</p>
          <p className="hero-lead">
            Atravesse os grandes relatos do Gênesis e do Êxodo. Leia, entenda o contexto histórico e prove o que aprendeu
            em desafios que recompensam conhecimento e constância.
          </p>
          <div className="hero-actions">
            <Link to={start} className="btn btn-gold btn-lg">
              {profile ? 'Continuar jornada' : 'Começar a jornada'}
              <Icon name="arrowRight" />
            </Link>
            <Link to="/sobre" className="btn btn-outline btn-lg">Sobre o jogo</Link>
          </div>
          <ArtCredit art="hero-jerusalem" />
        </div>
      </section>

      <section className="container section">
        <div className="feature-row">
          <div className="feature">
            <Icon name="map" size={28} />
            <h2>{JOURNEYS.length} jornadas</h2>
            <p>Da criação do mundo ao monte Sinai, com {JOURNEYS.reduce((s, j) => s + j.chapters.length, 0)} capítulos de leitura e desafio.</p>
          </div>
          <div className="feature">
            <Icon name="scroll" size={28} />
            <h2>{QUESTIONS.length} perguntas</h2>
            <p>Sete modalidades, cada pergunta com explicação e referência bíblica para conferir.</p>
          </div>
          <div className="feature">
            <Icon name="flame" size={28} />
            <h2>Constância</h2>
            <p>XP, níveis, medalhas, conquistas e uma sequência diária que valoriza quem estuda um pouco todo dia.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">As jornadas</h2>
        <div className="journey-strip">
          {JOURNEYS.map((j) => (
            <article key={j.id} className="strip-card">
              <ArtImage art={j.image} className="strip-img" sizes="(min-width: 900px) 20vw, 60vw" />
              <div className="strip-body">
                <p className="eyebrow">{j.books}</p>
                <h3>{j.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
