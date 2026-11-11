import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { AgeRange } from '../types'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { Notice } from '../components/ui'
import { StepBar } from './onboarding/StepBar'
import { useGame } from '../state/GameContext'

const AGES: { id: AgeRange; label: string }[] = [
  { id: 'ate12', label: 'Até 12 anos' },
  { id: '13a17', label: '13 a 17 anos' },
  { id: '18mais', label: '18 anos ou mais' },
]

export default function Login() {
  const { profile, createProfile } = useGame()
  const navigate = useNavigate()
  const location = useLocation()
  const [nickname, setNickname] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange | ''>('')
  const [error, setError] = useState('')

  if (profile) return <Navigate to={profile.character ? '/painel' : '/personagem'} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ageRange) {
      setError('Escolha uma faixa etária.')
      return
    }
    try {
      createProfile({ nickname, avatar: 'lamp', ageRange })
      const from = (location.state as { from?: string } | null)?.from
      navigate('/personagem', { replace: true, state: { from: from && from !== '/entrar' ? from : '/painel' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o perfil.')
    }
  }

  return (
    <section className="auth">
      <ArtImage art="place-raheh" className="hero-bg" priority decorative />
      <div className="hero-shade" />
      <div className="container auth-grid">
        <form className="panel auth-form" onSubmit={submit} noValidate aria-describedby={error ? 'auth-error' : undefined}>
          <StepBar current={2} />
          <p className="eyebrow">Identificação</p>
          <h1>Crie seu perfil local</h1>
          <p className="muted">
            Nesta versão não há conta online, e-mail ou senha. Pedimos apenas um apelido e a faixa etária, que ficam
            guardados somente neste dispositivo.
          </p>

          <div className="field">
            <label htmlFor="nick">Nome ou apelido</label>
            <input
              id="nick"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="nickname"
              placeholder="Como quer ser chamado?"
              aria-describedby="nick-help"
              required
            />
            <small id="nick-help" className="muted">Não use seu nome completo. De 2 a 20 caracteres.</small>
          </div>

          <fieldset className="field">
            <legend>Faixa etária</legend>
            <div className="chips">
              {AGES.map((a) => (
                <label key={a.id} className={`chip ${ageRange === a.id ? 'is-on' : ''}`}>
                  <input type="radio" name="age" value={a.id} checked={ageRange === a.id} onChange={() => setAgeRange(a.id)} />
                  {a.label}
                </label>
              ))}
            </div>
            {ageRange === 'ate12' && (
              <small className="muted">Recomendamos que um responsável acompanhe. Recursos online ficarão restritos a salas privadas com código.</small>
            )}
          </fieldset>


          {error && (
            <p id="auth-error" className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-gold btn-block btn-lg">
            Continuar <Icon name="arrowRight" />
          </button>
        </form>

        <aside className="panel auth-aside">
          <h2>Conta online</h2>
          <p className="tag tag-demo">Em breve</p>
          <p className="muted">
            A sincronização entre dispositivos, o ranking global e o multiplayer real usarão Supabase Auth com login
            seguro no servidor. Esta versão publicada no GitHub Pages é estática e não oferece autenticação segura.
          </p>
          <Notice tone="info" icon="shield" title="Privacidade por padrão">
            Não coletamos e-mail, telefone, localização ou fotos. Você pode exportar ou apagar seus dados a qualquer
            momento em Perfil.
          </Notice>
        </aside>
      </div>
    </section>
  )
}
