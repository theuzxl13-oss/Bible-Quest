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
import './styles/ponte.css'
import './styles/ambientes.css'
import './styles/acessibilidade.css'
import './styles/componentes/base-botao.css'
import './styles/componentes/base-painel.css'
import './styles/componentes/base-cartao.css'
import './styles/componentes/base-janela.css'
import './styles/componentes/base-aviso.css'
import './styles/componentes/base-mensagem.css'
import './styles/componentes/base-campo.css'
import './styles/componentes/base-progresso.css'
import './styles/componentes/base-abas.css'
import './styles/componentes/base-cabecalho.css'
import './styles/componentes/base-voltar.css'
import './styles/componentes/navegacao.css'
import './styles/componentes/hud.css'
import './styles/componentes/placa.css'
import './styles/componentes/painel.css'
import './styles/telas/acampamento.css'
import './styles/alto-contraste.css'
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

// aplicativo Android: botão voltar, links externos e tela de abertura.
// No site, __ANDROID__ vira false na compilação e este trecho (com a importação) sai do pacote.
if (__ANDROID__) {
  void import('./android/nativo').then((m) => m.iniciarAplicativo())
}
