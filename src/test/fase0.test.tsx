import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { GameProvider } from '../state/GameContext'
import { createLocalServices } from '../services'
import { MemoryStore } from '../services/storage/keyValueStore'
import { VERSAO } from '../versao'
import type { CharacterAppearance } from '../types'

/*
 * Fase 0 da Etapa 2 (0.17.4): nomes oficiais da navegação, Desafio diário como
 * destino secundário, versão do jogo vinda do pacote e o acesso à linha do tempo.
 */

const CHAR: CharacterAppearance = {
  version: 2, id: 'teste', name: 'Tobias', base: 'viajante', skin: 2, face: 'suave', hairStyle: 'cacheado', hairColor: 0,
  equipped: { tunica: 'tunica-linho', manto: 'manto-marrom', calcado: 'sandalias-simples', cinto: 'cinto-couro', acessorios: ['cajado'] },
}

function setup(path: string) {
  const store = new MemoryStore()
  const s = createLocalServices(store)
  const perfil = s.auth.createLocalProfile({ nickname: 'Teo', avatar: 'lamp', ageRange: '18mais' })
  s.auth.update({ ...perfil, character: structuredClone(CHAR) })
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider services={createLocalServices(store)}>
        <App />
      </GameProvider>
    </MemoryRouter>,
  )
}

const pacote = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string }

describe('Fase 0 (0.17.4)', () => {
  it('a barra do computador usa os nomes oficiais, e o Desafio diário fica como destino secundário', async () => {
    setup('/biblioteca')
    await screen.findAllByRole('heading')
    const principal = screen.getByRole('navigation', { name: 'Navegação principal' })
    const links = within(principal).getAllByRole('link')
    expect(links.map((l) => l.textContent?.trim())).toEqual(['Central', 'História', 'Quiz', 'Biblioteca', 'Perfil'])
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/painel', '/historia', '/quiz', '/biblioteca', '/perfil'])
    expect(within(principal).queryByRole('link', { name: /diário/i })).not.toBeInTheDocument()
    // o Desafio diário continua acessível, com esse nome, fora dos destinos principais
    const diario = screen.getAllByRole('link', { name: 'Desafio diário' })
    expect(diario.length).toBeGreaterThanOrEqual(1)
    for (const d of diario) expect(d).toHaveAttribute('href', '/diario')
  })

  it('a Central não recebe o link secundário (a tela aprovada continua igual)', async () => {
    const { container } = setup('/painel')
    await screen.findByRole('heading', { name: 'Tobias', level: 1 })
    expect(container.querySelector('.topbar-secundario')).toBeNull()
  })

  it('a versão exibida vem do pacote, sem texto fixo', async () => {
    expect(VERSAO).toBe(pacote.version)
    setup('/sobre')
    await screen.findAllByRole('heading')
    expect(screen.getByText(new RegExp(`Versão ${VERSAO.replace(/\./g, '\\.')} · perfil local`))).toBeInTheDocument()
    expect(screen.getByText(`Bible Quest é desenvolvido pela Kzann Tech. Versão ${VERSAO}.`)).toBeInTheDocument()
    expect(screen.queryByText(/Versão 0\.3:/)).not.toBeInTheDocument()
    // nenhuma versão escrita à mão nas telas
    for (const f of ['src/components/layout/Layout.tsx', 'src/pages/About.tsx']) expect(readFileSync(join(process.cwd(), f), 'utf8'), f).not.toMatch(/Versão \d/)
  })

  it('a barra de abas da Biblioteca mantém as abas e o acesso à linha do tempo', async () => {
    setup('/biblioteca')
    const abas = await screen.findByRole('tablist', { name: 'Seções da Biblioteca' })
    expect(within(abas).getAllByRole('tab').map((t) => t.textContent?.replace(/\s*\(.*\)$/, ''))).toEqual(['Personagens', 'Livros', 'Lugares', 'Acontecimentos', 'Temas'])
    expect(within(abas).getByRole('link', { name: 'Linha do tempo' })).toHaveAttribute('href', '/linha-do-tempo')
  })
})
