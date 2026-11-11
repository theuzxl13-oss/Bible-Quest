import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useGame } from './state/GameContext'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StoryMap from './pages/story/StoryMap'
import BookPage from './pages/story/BookPage'
import ExperiencePage from './pages/story/ExperiencePage'
import StoryChallenge from './pages/story/StoryChallenge'
import FreeHub from './pages/free/FreeHub'
import FreePlay from './pages/free/FreePlay'
import Multiplayer from './pages/free/Multiplayer'
import Result from './pages/Result'
import Daily from './pages/Daily'
import Ranking from './pages/Ranking'
import Achievements from './pages/Achievements'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import About from './pages/About'
import NotFound from './pages/NotFound'

const Admin = lazy(() => import('./admin/AdminApp'))

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile } = useGame()
  const location = useLocation()
  if (!profile) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

/** Remonta a tela ao trocar de modalidade, para não herdar o estado da anterior. */
function FreePlayRoute() {
  const { modeId } = useParams()
  return <FreePlay key={modeId} />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const main = document.getElementById('conteudo')
    main?.focus({ preventScroll: true })
  }, [pathname])
  return null
}

export default function App() {
  const p = (el: React.ReactNode) => <RequireProfile>{el}</RequireProfile>
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="boas-vindas" element={<Onboarding />} />
          <Route path="entrar" element={<Login />} />
          <Route path="painel" element={p(<Dashboard />)} />
          <Route path="historia" element={p(<StoryMap />)} />
          <Route path="historia/:bookId" element={p(<BookPage />)} />
          <Route path="historia/:bookId/:experienceId" element={p(<ExperiencePage />)} />
          <Route path="historia/:bookId/:experienceId/desafio" element={p(<StoryChallenge />)} />
          <Route path="livre" element={p(<FreeHub />)} />
          <Route path="livre/multiplayer" element={p(<Multiplayer />)} />
          <Route path="livre/:modeId" element={p(<FreePlayRoute />)} />
          {/* Endereços da versão 0.1 */}
          <Route path="mapa" element={<Navigate to="/historia" replace />} />
          <Route path="jornada/*" element={<Navigate to="/historia/genesis" replace />} />
          <Route path="capitulo/*" element={<Navigate to="/historia" replace />} />
          <Route path="desafio/*" element={<Navigate to="/historia" replace />} />
          <Route path="diario" element={p(<Daily />)} />
          <Route path="resultado" element={p(<Result />)} />
          <Route path="ranking" element={p(<Ranking />)} />
          <Route path="conquistas" element={p(<Achievements />)} />
          <Route path="perfil" element={p(<ProfilePage />)} />
          <Route path="multiplayer" element={<Navigate to="/livre/multiplayer" replace />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="sobre" element={<About />} />
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<p className="container section">Carregando módulo administrativo…</p>}>
                <Admin />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
