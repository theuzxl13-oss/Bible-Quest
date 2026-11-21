import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useGame } from '../../state/GameContext'
import { Icon, type IconName } from '../Icon'
import { GameIcon } from '../GameIcon'
import { Avatar } from '../ui'
import { levelFromXp } from '../../services/game/levels'
import { PlayerCharacter } from '../character/PlayerCharacter'
import { ItemReward } from '../character/ItemReward'
import { NavegacaoGlobal } from './NavegacaoGlobal'
import { VERSAO } from '../../versao'
import { ambienteDaRota } from './ambiente'

const NAV: { to: string; label: string; short: string; icon: IconName }[] = [
  { to: '/painel', label: 'Central', short: 'Central', icon: 'home' },
  { to: '/historia', label: 'História', short: 'História', icon: 'map' },
  { to: '/quiz', label: 'Quiz', short: 'Quiz', icon: 'shield' },
  { to: '/biblioteca', label: 'Biblioteca', short: 'Biblioteca', icon: 'book' },
  { to: '/perfil', label: 'Perfil', short: 'Perfil', icon: 'user' },
]

const SECONDARY: { to: string; label: string }[] = [
  { to: '/estatisticas', label: 'Estatísticas' },
  { to: '/guarda-roupa', label: 'Guarda-roupa' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/diario', label: 'Desafio diário' },
  { to: '/revisao', label: 'Revisão' },
  { to: '/linha-do-tempo', label: 'Linha do tempo' },
  { to: '/quiz/multiplayer', label: 'Multiplayer' },
  { to: '/conquistas', label: 'Conquistas' },
  { to: '/configuracoes', label: 'Configurações' },
  { to: '/sobre', label: 'Sobre' },
]

/** Telas de jogo usam layout imersivo, sem barra inferior. */
const IMMERSIVE = [/^\/$/, /^\/historia$/, /^\/quiz$/, /^\/personagem/, /^\/chegada$/, /^\/entrar$/, /\/desafio$/, /^\/historia\/[^/]+\/[^/]+\/historia$/, /^\/quiz\/treino\/[^/]+$/, /^\/quiz\/desafio\/[^/]+$/, /^\/diario$/, /^\/boas-vindas$/, /^\/resultado$/]

export function Layout() {
  const { profile, progress, lastOutcome } = useGame()
  const { pathname } = useLocation()
  const immersive = IMMERSIVE.some((r) => r.test(pathname))
  const showTabs = Boolean(profile) && !immersive
  const camp = pathname === '/painel' && Boolean(profile?.character)
  const mapa = (pathname === '/historia' || pathname === '/quiz') && Boolean(profile?.character)
  // passo 1.5: só identificação do ambiente; não muda nada na tela nesta versão
  const ambiente = ambienteDaRota(pathname, lastOutcome?.record.mode)

  return (
    <div className={`app ${showTabs ? 'has-tabs' : ''} ${camp ? 'is-camp' : ''} ${mapa ? 'is-mapa' : ''}`} data-ambiente={ambiente}>
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
                <NavLink key={n.to} to={n.to} className="topnav-link" end={n.to === '/painel' ? true : undefined}>
                  <GameIcon name={n.icon === 'map' ? 'book' : n.icon === 'shield' ? 'cerebro' : n.icon === 'home' ? 'tenda' : n.icon === 'book' ? 'scroll' : n.icon} size={22} />
                  {n.label}
                </NavLink>
              ))}
            </nav>
          )}
          <div className="topbar-actions">
            {/* destino secundário (não é um sexto destino principal): aparece junto das ações, no computador; a Central (que esconde esta barra) não muda */}
            {profile && !camp && (
              <NavLink to="/diario" className="topbar-secundario">
                <GameIcon name="calendar" size={20} />Desafio diário
              </NavLink>
            )}
            {profile ? (
              <Link to="/perfil" className="topbar-profile" aria-label={`Perfil de ${profile.nickname}, nível ${levelFromXp(progress.xp)}`}>
                <span className="topbar-level">Nv {levelFromXp(progress.xp)}</span>
                {profile.character ? (
                  <span className="topbar-portrait"><PlayerCharacter size={36} portrait pose="still" /></span>
                ) : (
                  <Avatar id={profile.avatar} size={34} />
                )}
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
        <div key={pathname} className="route-fade">
          <Outlet />
        </div>
        {profile && <ItemReward />}
      </main>

      {!immersive && !camp && (
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
              Versão {VERSAO} · perfil local · Obras de arte em domínio público · Texto bíblico: Almeida RC 1911 (domínio público)
            </p>
          </div>
        </footer>
      )}

      {showTabs && <NavegacaoGlobal />}
    </div>
  )
}
