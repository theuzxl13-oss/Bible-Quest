import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource-variable/inter'
import '@fontsource/crimson-pro/400.css'
import '@fontsource/crimson-pro/400-italic.css'
import '@fontsource/crimson-pro/600.css'
import './styles/global.css'
import './styles/tokens.css'
import './styles/componentes/navegacao.css'
import './styles/componentes/hud.css'
import './styles/componentes/placa.css'
import './styles/componentes/painel.css'
import './styles/telas/acampamento.css'
import { GameProvider } from './state/GameContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </HashRouter>
  </StrictMode>,
)
