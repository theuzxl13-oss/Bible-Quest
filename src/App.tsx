import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useGame } from './state/GameContext'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import JourneyMap from './pages/JourneyMap'
import JourneyPage from './pages/JourneyPage'
import ChapterIntro from './pages/ChapterIntro'
import Challenge from './pages/Challenge'
import Result from './pages/Result'
import Daily from './pages/Daily'
import Ranking from './pages/Ranking'
import Achievements from './pages/Achievements'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import About from './pages/About'
import Multiplayer from './pages/Multiplayer'
import NotFound from './pages/NotFound'

const Admin = lazy(() => import('./admin/AdminApp'))

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { profile } = useGame()
  const location = useLocation()
  if (!profile) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <>{children}</>
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
          <Route path="mapa" element={p(<JourneyMap />)} />
          <Route path="jornada/:journeyId" element={p(<JourneyPage />)} />
          <Route path="capitulo/:chapterId" element={p(<ChapterIntro />)} />
          <Route path="desafio/:chapterId" element={p(<Challenge />)} />
          <Route path="diario" element={p(<Daily />)} />
          <Route path="resultado" element={p(<Result />)} />
          <Route path="ranking" element={p(<Ranking />)} />
          <Route path="conquistas" element={p(<Achievements />)} />
          <Route path="perfil" element={p(<ProfilePage />)} />
          <Route path="multiplayer" element={p(<Multiplayer />)} />
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
