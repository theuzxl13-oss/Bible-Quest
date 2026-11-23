import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import type { CharacterAppearance } from '../types'

/*
 * Aplicativo Android (Capacitor), etapa 1.
 * Aqui o build é simulado como Android (ANDROID = true). O comportamento do
 * site é conferido pelos outros arquivos de teste, que rodam com ANDROID = false.
 */
vi.mock('../plataforma', () => ({ ANDROID: true }))

const capacitor = vi.hoisted(() => ({
  exitApp: vi.fn(async () => {}),
  addListener: vi.fn(async () => ({ remove: async () => {} })),
  open: vi.fn(async () => {}),
  hide: vi.fn(async () => {}),
}))
vi.mock('@capacitor/app', () => ({ App: { exitApp: capacitor.exitApp, addListener: capacitor.addListener } }))
vi.mock('@capacitor/browser', () => ({ Browser: { open: capacitor.open } }))
vi.mock('@capacitor/splash-screen', () => ({ SplashScreen: { hide: capacitor.hide } }))

const raiz = process.cwd()
const ler = (f: string) => readFileSync(join(raiz, f), 'utf8')

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}
function setup(path: string) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const p = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...p, character: structuredClone(CHAR) })
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={createLocalServices(store)}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
}

afterEach(() => vi.clearAllMocks())

describe('aplicativo Android: recursos desativados nesta primeira versão', () => {
  it('o painel administrativo não existe no aplicativo', async () => {
    setup('/admin')
    expect(await screen.findByRole('heading', { name: /este caminho não está no mapa/i })).toBeInTheDocument()
    expect(screen.queryByText(/módulo administrativo/i)).not.toBeInTheDocument()
  })

  it('o multiplayer de demonstração fica desativado: a rota leva ao treino livre e não há atalho para ele', async () => {
    setup('/quiz/multiplayer')
    expect(await screen.findByRole('heading', { name: /treino livre/i })).toBeInTheDocument()
    expect(screen.queryByText(/salas privadas com amigos/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^multiplayer$/i })).not.toBeInTheDocument()
  })

  it('os endereços antigos do multiplayer também levam ao treino livre', async () => {
    setup('/livre/multiplayer')
    expect(await screen.findByRole('heading', { name: /treino livre/i })).toBeInTheDocument()
  })

  it('o ranking continua, só com os recordes do aparelho e sem a aba das partidas de demonstração', async () => {
    setup('/ranking')
    const abas = await screen.findByRole('tablist', { name: /categorias de ranking/i })
    expect(within(abas).getAllByRole('tab').map((t) => t.textContent)).toEqual(['XP geral', 'Modo História', 'Modo Quiz', 'Desafio diário'])
    expect(screen.getByText(/nenhum jogador ou posição é inventado/i)).toBeInTheDocument()
  })

  it('a leitura em voz alta fica oculta, mesmo se o aparelho tiver síntese de voz', async () => {
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() })
    setup('/configuracoes')
    expect(await screen.findByRole('switch', { name: 'Alto contraste' })).toBeInTheDocument()
    expect(screen.queryByRole('switch', { name: /leitura em voz alta/i })).not.toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('a página Sobre não leva ao painel administrativo e fala do armazenamento do aplicativo', async () => {
    setup('/sobre')
    expect(await screen.findByText(/armazenamento local do aplicativo/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /painel administrativo/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/salas multiplayer em demonstração/i)).not.toBeInTheDocument()
  })

  it('exportar e apagar os dados continuam disponíveis no Perfil', async () => {
    setup('/perfil')
    expect(await screen.findByRole('button', { name: /exportar meus dados/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apagar perfil e progresso/i })).toBeInTheDocument()
  })
})

describe('aplicativo Android: integração nativa', () => {
  it('voltar fecha a janela aberta antes de sair da tela', async () => {
    const { voltar } = await import('../android/nativo')
    const janela = document.createElement('div')
    janela.setAttribute('role', 'dialog')
    document.body.appendChild(janela)
    const esc = vi.fn(() => janela.remove())
    document.addEventListener('keydown', esc)
    window.location.hash = '#/historia'
    await voltar()
    expect(esc).toHaveBeenCalled()
    expect(capacitor.exitApp).not.toHaveBeenCalled()
    document.removeEventListener('keydown', esc)
  })

  it('voltar na Central sai do aplicativo; em outra tela, volta uma tela (ou vai à Central)', async () => {
    const { voltar } = await import('../android/nativo')
    window.location.hash = '#/painel'
    await voltar()
    expect(capacitor.exitApp).toHaveBeenCalledTimes(1)
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
    window.history.replaceState({ idx: 2 }, '', '#/biblioteca')
    await voltar()
    expect(back).toHaveBeenCalledTimes(1)
    window.history.replaceState({ idx: 0 }, '', '#/biblioteca')
    await voltar()
    expect(window.location.hash).toBe('#/painel')
    back.mockRestore()
  })

  it('links externos abrem no navegador do sistema; links internos não', async () => {
    const { iniciarAplicativo } = await import('../android/nativo')
    iniciarAplicativo()
    expect(capacitor.addListener).toHaveBeenCalledWith('backButton', expect.any(Function))
    const externo = document.createElement('a')
    externo.href = 'https://commons.wikimedia.org/wiki/File:Teste.jpg'
    externo.textContent = 'Fonte no Commons'
    const interno = document.createElement('a')
    interno.href = '#/sobre'
    document.body.append(externo, interno)
    externo.click()
    expect(capacitor.open).toHaveBeenCalledWith({ url: 'https://commons.wikimedia.org/wiki/File:Teste.jpg' })
    interno.click()
    expect(capacitor.open).toHaveBeenCalledTimes(1)
    externo.remove()
    interno.remove()
    await waitFor(() => expect(capacitor.hide).toHaveBeenCalled())
  })
})

describe('aplicativo Android: configuração do projeto', () => {
  it('Capacitor: identificador aprovado, arquivos locais de dist e nenhum site remoto', () => {
    const cfg = ler('capacitor.config.ts')
    expect(cfg).toMatch(/appId:\s*'com\.kzanntech\.biblequest'/)
    expect(cfg).toMatch(/appName:\s*'Bible Quest'/)
    expect(cfg).toMatch(/webDir:\s*'dist'/)
    expect(cfg).not.toMatch(/server\s*:/)
    expect(cfg).not.toMatch(/https?:\/\//)
    expect(cfg).toMatch(/insetsHandling:\s*'native'/)
  })

  it('Android: mínimo API 24, alvo e compilação API 36, identificador e orientação', () => {
    const vars = ler('android/variables.gradle')
    expect(vars).toMatch(/minSdkVersion = 24/)
    expect(vars).toMatch(/compileSdkVersion = 36/)
    expect(vars).toMatch(/targetSdkVersion = 36/)
    const app = ler('android/app/build.gradle')
    expect(app).toMatch(/applicationId "com\.kzanntech\.biblequest"/)
    const main = ler('android/app/src/main/java/com/kzanntech/biblequest/MainActivity.java')
    expect(main).toMatch(/SCREEN_ORIENTATION_PORTRAIT/)
    expect(main).toMatch(/smallestScreenWidthDp >= TELA_GRANDE_DP/)
  })

  it('ícone adaptativo com camada monocromática e tela de abertura do Bible Quest', () => {
    const icone = ler('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml')
    expect(icone).toMatch(/<monochrome android:drawable="@mipmap\/ic_launcher_monochrome"/)
    for (const d of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
      for (const f of ['ic_launcher_foreground', 'ic_launcher_monochrome', 'ic_launcher', 'ic_launcher_round']) {
        expect(existsSync(join(raiz, `android/app/src/main/res/mipmap-${d}/${f}.png`)), `${d}/${f}`).toBe(true)
      }
    }
    const estilos = ler('android/app/src/main/res/values/styles.xml')
    expect(estilos).toMatch(/windowSplashScreenAnimatedIcon">@mipmap\/ic_launcher_foreground/)
    expect(estilos).toMatch(/postSplashScreenTheme">@style\/AppTheme\.NoActionBar/)
  })

  it('o build do aplicativo é separado do site: modo "android" e o HTML sem viewport-fit=cover', () => {
    const pkg = JSON.parse(ler('package.json'))
    expect(pkg.scripts['build:android']).toMatch(/vite build --mode android/)
    expect(pkg.scripts.build).toBe('tsc -b && vite build')
    const vite = ler('vite.config.ts')
    expect(vite).toMatch(/__ANDROID__: JSON\.stringify\(android\)/)
    expect(vite).toMatch(/viewport-fit=cover/)
  })

  it('nenhum SDK de anúncios ou de análise nas dependências', () => {
    const pkg = JSON.parse(ler('package.json'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join(' ')
    expect(deps).not.toMatch(/firebase|analytics|admob|ads|gtag|sentry|amplitude|mixpanel|facebook/i)
    const gradle = ler('android/app/build.gradle')
    expect(gradle).not.toMatch(/firebase|play-services-ads|analytics/i)
  })
})
