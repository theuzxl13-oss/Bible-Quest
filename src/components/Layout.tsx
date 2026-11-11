import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useGame } from '../state/GameContext'
import { Icon, type IconName } from './Icon'
import { Avatar } from './ui'
import { levelFromXp } from '../services/game/levels'

const NAV: { to: string; label: string; short: string; icon: IconName }[] = [
  { to: '/painel', label: 'Painel', short: 'Início', icon: 'home' },
  { to: '/historia', label: 'Modo História', short: 'História', icon: 'map' },
  { to: '/livre', label: 'Modo Livre', short: 'Livre', icon: 'star' },
  { to: '/diario', label: 'Diário', short: 'Diário', icon: 'calendar' },
  { to: '/perfil', label: 'Perfil', short: 'Perfil', icon: 'user' },
]

const SECONDARY: { to: string; label: string }[] = [
  { to: '/ranking', label: 'Ranking' },
  { to: '/livre/multiplayer', label: 'Multiplayer' },
  { to: '/conquistas', label: 'Conquistas' },
  { to: '/configuracoes', label: 'Configurações' },
  { to: '/sobre', label: 'Sobre' },
]

/** Telas de jogo usam layout imersivo, sem barra inferior. */
const IMMERSIVE = [/\/desafio$/, /^\/livre\/(?!multiplayer)[^/]+$/, /^\/diario$/, /^\/boas-vindas$/]

export function Layout() {
  const { profile, progress } = useGame()
  const { pathname } = useLocation()
  const immersive = IMMERSIVE.some((r) => r.test(pathname))
  const showTabs = Boolean(profile) && !immersive

  return (
    <div className={`app ${showTabs ? 'has-tabs' : ''}`}>
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus() }}>
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <div className="topbar-inner container">
          <Link to={profile ? '/painel' : '/'} className="brand" aria-label="Bible Quest — página inicial">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28"><path d="M16 4v24M9 11h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" /></svg>
            </span>
            <span className="brand-name">Bible Quest</span>
          </Link>
          {profile && (
            <nav className="topnav" aria-label="Navegação principal">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className="topnav-link" end={n.to === '/livre' ? false : undefined}>
                  {n.label}
                </NavLink>
              ))}
              <NavLink to="/ranking" className="topnav-link">Ranking</NavLink>
            </nav>
          )}
          <div className="topbar-actions">
            {profile ? (
              <Link to="/perfil" className="topbar-profile" aria-label={`Perfil de ${profile.nickname}, nível ${levelFromXp(progress.xp)}`}>
                <span className="topbar-level">Nv {levelFromXp(progress.xp)}</span>
                <Avatar id={profile.avatar} size={34} />
              </Link>
            ) : (
              <Link to="/entrar" className="btn btn-gold btn-sm">Entrar</Link>
            )}
            <Link to="/configuracoes" className="icon-btn" aria-label="Configurações">
              <Icon name="settings" />
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>

      {!immersive && (
        <footer className="footer">
          <div className="container footer-inner">
            <div>
              <p className="footer-brand">Bible Quest</p>
              <p className="muted">Uma jornada pelas Escrituras. Um produto Kzann Tech.</p>
            </div>
            <nav aria-label="Links do rodapé" className="footer-links">
              {SECONDARY.map((s) => (
                <Link key={s.to} to={s.to}>{s.label}</Link>
              ))}
            </nav>
            <p className="muted small">
              Versão 0.2 · perfil local · Obras de arte em domínio público · Texto bíblico: Almeida RC 1911 (domínio público)
            </p>
          </div>
        </footer>
      )}

      {showTabs && (
        <nav className="tabbar" aria-label="Navegação rápida">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="tabbar-link">
              <Icon name={n.icon} size={22} />
              <span>{n.short}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
