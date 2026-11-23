import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Stars({ value, max = 3, size = 18 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} de ${max} estrelas`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="star" size={size} className={i < value ? 'star-on' : 'star-off'} />
      ))}
    </span>
  )
}

export function Notice({ tone = 'info', icon = 'info', title, children }: { tone?: 'info' | 'demo' | 'warn'; icon?: IconName; title?: string; children: ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role="note">
      <Icon name={icon} size={20} />
      <div>
        {title && <strong className="notice-title">{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  )
}

export function DemoTag({ children = 'Demonstração' }: { children?: ReactNode }) {
  return <span className="tag tag-demo">{children}</span>
}

export function LocalProfileNotice() {
  return (
    <Notice tone="info" icon="shield" title="Perfil local">
      Seu progresso fica salvo somente neste dispositivo e navegador. Ele não é sincronizado entre aparelhos e pode ser
      perdido se os dados do navegador forem apagados.
    </Notice>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <div className="page-header-lead">{children}</div>}
    </header>
  )
}

export const AVATARS: { id: string; icon: IconName; label: string }[] = [
  { id: 'lamp', icon: 'lamp', label: 'Lâmpada' },
  { id: 'scroll', icon: 'scroll', label: 'Pergaminho' },
  { id: 'star', icon: 'star', label: 'Estrela' },
  { id: 'crown', icon: 'crown', label: 'Coroa' },
  { id: 'dove', icon: 'dove', label: 'Pomba' },
  { id: 'mountain', icon: 'mountain', label: 'Monte' },
  { id: 'anchor', icon: 'anchor', label: 'Âncora' },
  { id: 'shield', icon: 'shield', label: 'Escudo' },
]

export function Avatar({ id, size = 48 }: { id: string; size?: number }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0]
  return (
    <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">
      <Icon name={a.icon} size={Math.round(size * 0.5)} />
    </span>
  )
}
