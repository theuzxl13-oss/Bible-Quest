import { Link } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { BOOKS } from '../data/bible/canon'
import { STORY_SEQUENCE, experiencesOf } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
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
            Dois modos de jogo: uma jornada pela Bíblia na ordem dos livros, de Gênesis a Apocalipse, e desafios livres
            para jogar quando quiser, sozinho ou com amigos.
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
        <div className="modes-grid">
          <article className="mode-hero mode-hero-story">
            <ArtImage art="abraham-journey" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
            <div className="mode-hero-shade" />
            <div className="mode-hero-body">
              <span className="mode-hero-icon"><Icon name="map" size={26} /></span>
              <p className="eyebrow">Modo História</p>
              <h2>A grande jornada bíblica</h2>
              <p>
                Testamento, livro, experiência, desafio e conclusão. Cada experiência tem introdução, narrativa,
                referências, aprendizado e um desafio que libera a próxima. Disponível agora: {STORY_SEQUENCE.length}{' '}
                experiências em Gênesis e Êxodo; os outros {BOOKS.filter((b) => experiencesOf(b.id).length === 0).length} livros estão em preparação.
              </p>
            </div>
          </article>
          <article className="mode-hero mode-hero-free">
            <ArtImage art="moses-plague" className="mode-hero-img" sizes="(min-width: 900px) 50vw, 100vw" decorative />
            <div className="mode-hero-shade" />
            <div className="mode-hero-body">
              <span className="mode-hero-icon"><Icon name="star" size={26} /></span>
              <p className="eyebrow">Modo Livre</p>
              <h2>Desafios bíblicos</h2>
              <p>{FREE_MODES.map((m) => m.title).join(' · ')}. Mais o desafio diário e salas multiplayer (demonstração).</p>
            </div>
          </article>
        </div>
      </section>

      <section className="container section">
        <div className="feature-row">
          <div className="feature">
            <Icon name="book" size={28} />
            <h2>66 livros</h2>
            <p>O mapa da jornada segue o cânon evangélico, do Gênesis ao Apocalipse, com progresso por livro e testamento.</p>
          </div>
          <div className="feature">
            <Icon name="scroll" size={28} />
            <h2>{QUESTIONS.length} perguntas</h2>
            <p>Toda pergunta tem explicação e referência bíblica. Trechos da Almeida 1911, em domínio público.</p>
          </div>
          <div className="feature">
            <Icon name="flame" size={28} />
            <h2>Uma só evolução</h2>
            <p>XP, níveis, medalhas, conquistas e sequência diária compartilhados entre os dois modos.</p>
          </div>
        </div>
      </section>
    </>
  )
}
