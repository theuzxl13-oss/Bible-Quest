import { NavLink } from 'react-router-dom'
import { GameIcon } from '../GameIcon'
import type { IconName } from '../Icon'

/**
 * Navegação global inferior (Etapa 2): os cinco destinos principais do jogo.
 * Só leva a rotas que já existem. Personagem e Conquistas continuam acessíveis
 * pela Central (tenda e baú) e pelo Perfil.
 */
export const NAVEGACAO_GLOBAL: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/painel', label: 'Central', icon: 'tenda', end: true },
  { to: '/historia', label: 'História', icon: 'map' },
  { to: '/quiz', label: 'Quiz', icon: 'cerebro' },
  { to: '/biblioteca', label: 'Biblioteca', icon: 'book' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
]

export function NavegacaoGlobal() {
  return (
    <nav className="nav-global" aria-label="Navegação rápida">
      {NAVEGACAO_GLOBAL.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className="nav-global-link">
          <span className="nav-global-icon" aria-hidden="true"><GameIcon name={n.icon} size={28} /></span>
          <span>{n.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
