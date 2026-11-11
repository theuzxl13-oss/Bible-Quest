import { Link, Navigate } from 'react-router-dom'
import { ArtImage } from '../../components/ArtImage'
import { PlayerCharacter, usePlayerCharacter } from '../../components/character/PlayerCharacter'
import { Icon } from '../../components/Icon'
import { StepBar } from './StepBar'

/** Etapa 5 — a primeira aparição do aventureiro no universo do jogo. */
export default function Arrival() {
  const appearance = usePlayerCharacter()
  if (!appearance) return <Navigate to="/personagem" replace />
  return (
    <section className="arrival">
      <ArtImage art="place-raheh" className="hero-bg arrival-bg" priority decorative />
      <div className="arrival-sky" aria-hidden="true" />
      <svg className="arrival-ground" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 Q100 20 200 34 T400 30 L400 80 L0 80 Z" fill="#2b2216" />
        <path d="M0 52 Q120 40 200 50 T400 46" stroke="#d9c7a0" strokeWidth="6" fill="none" opacity=".55" />
      </svg>
      <div className="container arrival-body">
        <StepBar current={5} />
        <div className="arrival-walker">
          <PlayerCharacter size={190} pose="walk" className="arrival-walk" title={`${appearance.name}, seu personagem`} />
        </div>
        <div className="arrival-text">
          <p className="eyebrow">Uma grande aventura começa</p>
          <h1 className="display-sm">{appearance.name} chega ao universo Bible Quest</h1>
          <p className="lead">À frente, caminhos por jardins, desertos, cidades antigas e montanhas. Cada passo é uma nova história das Escrituras.</p>
          <Link to="/painel" className="btn btn-gold btn-lg">Entrar no jogo <Icon name="arrowRight" /></Link>
        </div>
      </div>
    </section>
  )
}
