import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { useGame } from '../state/GameContext'

const STEPS = [
  {
    art: 'abraham-journey',
    title: 'Viaje pelas Escrituras',
    text: 'Cada jornada percorre um grande relato bíblico em capítulos. Você lê uma introdução narrativa, o texto bíblico e o contexto histórico antes de cada desafio.',
  },
  {
    art: 'joseph-granaries',
    title: 'Aprenda com desafios variados',
    text: 'Múltipla escolha, complete o versículo, verdadeiro ou falso, "Quem sou eu?", identifique o livro, organize os acontecimentos e desafio de memória. Toda resposta vem com explicação e referência.',
  },
  {
    art: 'moses-sinai',
    title: 'Progrida com constância',
    text: 'Você tem 3 tentativas por capítulo. Acertos e constância geram XP, níveis, medalhas e conquistas. O tempo não conta pontos: estude no seu ritmo.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { updateSettings, profile } = useGame()
  const s = STEPS[step]
  const last = step === STEPS.length - 1

  const finish = () => {
    updateSettings({ onboardingDone: true })
    navigate(profile ? '/painel' : '/entrar')
  }

  return (
    <section className="onboarding">
      <ArtImage key={s.art} art={s.art} className="hero-bg fade-in" priority />
      <div className="hero-shade" />
      <div className="container onboarding-card">
        <p className="eyebrow">Passo {step + 1} de {STEPS.length}</p>
        <h1 aria-live="polite">{s.title}</h1>
        <p className="lead">{s.text}</p>
        <div className="dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={i === step ? 'dot is-on' : 'dot'} />
          ))}
        </div>
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={finish}>Pular</button>
          {step > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>
              <Icon name="arrowLeft" /> Voltar
            </button>
          )}
          <button type="button" className="btn btn-gold" onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? 'Criar meu perfil' : 'Próximo'} <Icon name="arrowRight" />
          </button>
        </div>
        <ArtCredit art={s.art} />
      </div>
    </section>
  )
}
