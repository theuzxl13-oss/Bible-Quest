import { Link } from 'react-router-dom'
import type { FontScale } from '../types'
import { Notice, PageHeader } from '../components/ui'
import { useGame } from '../state/GameContext'

const FONTS: { id: FontScale; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'grande', label: 'Grande' },
  { id: 'extra', label: 'Extra grande' },
]

function Toggle({ id, label, help, checked, onChange }: { id: string; label: string; help: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id} className="toggle-label">{label}</label>
        <p id={`${id}-h`} className="small muted">{help}</p>
      </div>
      <input id={id} type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={`${id}-h`} />
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings, profile } = useGame()
  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window
  return (
    <div className="container section stack-lg narrow">
      <PageHeader eyebrow="Configurações" title="Preferências e acessibilidade">
        As preferências ficam salvas neste dispositivo.
      </PageHeader>

      <section className="panel stack" aria-labelledby="leit">
        <h2 id="leit">Leitura</h2>
        <fieldset className="field">
          <legend>Tamanho do texto</legend>
          <div className="chips">
            {FONTS.map((f) => (
              <label key={f.id} className={`chip ${settings.fontScale === f.id ? 'is-on' : ''}`}>
                <input type="radio" name="font" checked={settings.fontScale === f.id} onChange={() => updateSettings({ fontScale: f.id })} />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
        <Toggle id="contrast" label="Alto contraste" help="Aumenta o contraste de textos, bordas e botões." checked={settings.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
        <Toggle id="motion" label="Reduzir animações" help="Remove transições e efeitos de movimento." checked={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} />
        <Toggle
          id="read"
          label="Botões de leitura em voz alta"
          help={speech ? 'Mostra o botão "Ouvir" nas introduções, usando a voz do seu dispositivo.' : 'Seu navegador não oferece síntese de voz.'}
          checked={settings.readAloud}
          onChange={(v) => updateSettings({ readAloud: v })}
        />
      </section>

      <section className="panel stack" aria-labelledby="jogo">
        <h2 id="jogo">Jogo</h2>
        <Toggle id="timer" label="Mostrar cronômetro" help="Apenas informativo: o tempo nunca altera a pontuação." checked={settings.showTimer} onChange={(v) => updateSettings({ showTimer: v })} />
        <p className="small muted">Atalhos de teclado nas perguntas: teclas 1 a 4 escolhem alternativas; Tab e Enter navegam e confirmam.</p>
        <div className="row-actions">
          <Link to="/boas-vindas" className="btn btn-outline">Rever apresentação</Link>
          {profile && <Link to="/personagem" className="btn btn-outline">Editar aparência do personagem</Link>}
        </div>
      </section>

      <section className="panel stack" aria-labelledby="priv">
        <h2 id="priv">Privacidade</h2>
        <Notice tone="info" icon="shield">
          Nenhum dado é enviado a servidores. Não usamos cookies de rastreamento, anúncios ou análise de comportamento.
          {profile ? <> Gerencie ou apague seus dados em <Link to="/perfil">Perfil</Link>.</> : null}
        </Notice>
        <Link to="/sobre" className="link">Leia a política de privacidade resumida em Sobre</Link>
      </section>
    </div>
  )
}
