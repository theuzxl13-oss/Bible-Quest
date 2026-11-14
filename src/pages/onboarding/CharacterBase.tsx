import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Character } from '../../components/character/Character'
import { Icon } from '../../components/Icon'
import { BASES, newAppearance } from '../../data/character/bases'
import { useGame } from '../../state/GameContext'
import { StepBar } from './StepBar'

/** Etapa 3 — escolha do personagem-base. */
export default function CharacterBase() {
  const { profile } = useGame()
  const navigate = useNavigate()
  const [base, setBase] = useState(BASES[0].id)
  if (profile?.character) return <Navigate to="/guarda-roupa" replace />
  const name = profile?.nickname ?? ''

  return (
    <section className="onb">
      <div className="container stack-lg">
        <StepBar current={3} />
        <header className="page-header">
          <p className="eyebrow">Escolha do personagem</p>
          <h1>Quem vai percorrer a jornada?</h1>
          <p className="page-header-lead">
            Escolha o aventureiro que vai representar você no universo Bible Quest. Ele não é um personagem bíblico: é você,
            acompanhando as histórias e aprendendo sobre as Escrituras. No próximo passo você personaliza cabelo, roupas e acessórios.
          </p>
        </header>
        <fieldset className="base-grid-wrap">
          <legend className="sr-only">Personagem-base</legend>
          <div className="base-grid">
            {BASES.map((b) => (
              <label key={b.id} className={`base-card ${base === b.id ? 'is-on' : ''}`}>
                <input type="radio" name="base" value={b.id} checked={base === b.id} onChange={() => setBase(b.id)} />
                <span className="base-stage"><Character appearance={newAppearance(b.id, name)} size={96} pose={base === b.id ? 'idle' : 'still'} /></span>
                <strong>{b.label}</strong>
                <span className="small muted">{b.description}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="row-actions">
          <button type="button" className="btn btn-gold btn-lg" onClick={() => navigate('/personagem/personalizar', { state: { base } })}>
            Personalizar <Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </section>
  )
}
