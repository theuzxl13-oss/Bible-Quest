import { Link, Navigate, useLocation } from 'react-router-dom'
import { ArtImage, ArtCredit } from '../../components/ArtImage'
import { Icon } from '../../components/Icon'
import { useGame } from '../../state/GameContext'
import { StepBar } from './StepBar'

/** Etapa 1 — boas-vindas. */
export default function Welcome() {
  const { profile } = useGame()
  const { pathname } = useLocation()
  if (pathname === '/' && profile?.character) return <Navigate to="/painel" replace />
  const next = !profile ? '/entrar' : !profile.character ? '/personagem' : '/painel'
  return (
    <section className="welcome">
      <ArtImage art="hero-jerusalem" className="hero-bg welcome-bg" priority />
      <div className="hero-shade" />
      <div className="welcome-rays" aria-hidden="true" />
      <div className="container welcome-body">
        {!profile?.character && <StepBar current={1} />}
        <p className="eyebrow">Kzann Tech apresenta</p>
        <h1 className="display welcome-title">Bible Quest</h1>
        <p className="hero-slogan">Uma jornada pelas Escrituras.</p>
        <p className="welcome-msg">Prepare-se para explorar as Escrituras, conhecer grandes histórias e iniciar sua própria jornada.</p>
        <Link to={next} className="btn btn-gold btn-lg welcome-cta">
          {profile?.character ? 'Continuar jornada' : 'Começar jornada'} <Icon name="arrowRight" />
        </Link>
        <p className="small muted welcome-note">Seu progresso fica salvo neste aparelho. Não pedimos e-mail, telefone nem data de nascimento.</p>
        <ArtCredit art="hero-jerusalem" />
      </div>
    </section>
  )
}
