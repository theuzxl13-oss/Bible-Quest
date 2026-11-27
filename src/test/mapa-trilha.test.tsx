import { describe, expect, it, vi } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, waitFor } from '@testing-library/react'
import { estadoDoMarco, rotuloDoEstado } from '../services/game/marcos'
import { ARTE_DILUVIO, ARTE_EDEN, ARTES_DO_MUNDO } from '../data/mapas/artes'
import { dividirTrecho } from '../components/map/JourneyMap'
import { worldSections } from '../services/game/journeyMap'
import { RegiaoTrilha, type Marco } from '../components/map/trilha/Trilha'

vi.mock('../components/character/PlayerCharacter', () => ({ PlayerCharacter: () => <span data-testid="avatar" /> }))

/*
 * MOTOR DA TRILHA (entrega 2: protótipo do Éden)
 * Os quatro estados do estandarte, a divisão do trecho de Gênesis entre a região pintada e o
 * restante vetorial, a geometria dos pontos da pintura e o peso das imagens.
 */

describe('estados do marco (compartilhados entre História e Quiz)', () => {
  it('traduz os estados de cada modo para os quatro estados do estandarte', () => {
    expect(estadoDoMarco('concluida', false)).toBe('concluida')
    expect(estadoDoMarco('concluido', true)).toBe('concluida')
    expect(estadoDoMarco('bloqueada', true)).toBe('bloqueada')
    expect(estadoDoMarco('bloqueado', false)).toBe('bloqueada')
    expect(estadoDoMarco('atual', true)).toBe('atual')
    expect(estadoDoMarco('atual', false)).toBe('disponivel')
  })

  it('mantém os rótulos acessíveis que o jogo já usava', () => {
    expect(rotuloDoEstado('concluida', 2, 'historia')).toBe('Concluída, 2 de 3 estrelas')
    expect(rotuloDoEstado('atual', 0, 'historia')).toBe('Fase atual')
    expect(rotuloDoEstado('bloqueada', 0, 'historia')).toBe('Bloqueada')
    expect(rotuloDoEstado('disponivel', 0, 'historia')).toBe('Disponível')
    expect(rotuloDoEstado('concluida', 3, 'quiz')).toBe('Concluído, 3 de 3 estrelas')
    expect(rotuloDoEstado('atual', 0, 'quiz')).toBe('Disponível')
    expect(rotuloDoEstado('disponivel', 0, 'quiz')).toBe('Disponível')
    expect(rotuloDoEstado('bloqueada', 0, 'quiz')).toBe('Bloqueado')
  })
})

describe('região pintada do Éden', () => {
  const genesis = worldSections().find((s) => s.world.id === 'mundo-genesis')!

  it('recebe as fases 1 a 5 e o primeiro baú; nenhum nó some nem se repete', () => {
    const { pintadas, resto } = dividirTrecho(genesis)
    expect(pintadas).toHaveLength(2) // Éden e, acima dele, Terras do Dilúvio (região 2)
    expect(pintadas[0].arte).toBe(ARTE_EDEN)
    const ids = pintadas[0].nos.map((n) => n.id)
    expect(pintadas[0].nos.map((n) => (n.kind === 'phase' ? n.number : 'bau'))).toEqual([1, 2, 3, 4, 5, 'bau'])
    expect(ids[5]).toBe('bau-mundo-genesis-5')
    expect([...pintadas.flatMap((p) => p.nos.map((n) => n.id)), ...resto.map((n) => n.id)]).toEqual(genesis.nodes.map((n) => n.id))
  })

  it('os pontos ficam dentro da imagem, sobem pelo mapa e não se sobrepõem', () => {
    const { pontos, largura, altura } = ARTE_EDEN
    expect(pontos).toHaveLength(6)
    for (const p of pontos) {
      expect(p.x).toBeGreaterThan(0.12)
      expect(p.x).toBeLessThan(0.88)
      expect(p.y).toBeGreaterThan(0.1)
      expect(p.y).toBeLessThan(0.95)
    }
    for (let i = 1; i < pontos.length; i++) expect(pontos[i].y).toBeLessThan(pontos[i - 1].y)
    // distância mínima entre marcos, em pixels de um celular de 400 px de largura
    const escala = 400 / largura
    for (let i = 0; i < pontos.length; i++)
      for (let j = i + 1; j < pontos.length; j++) {
        const d = Math.hypot((pontos[i].x - pontos[j].x) * largura * escala, (pontos[i].y - pontos[j].y) * altura * escala)
        expect(d).toBeGreaterThan(90)
      }
  })

  it('as imagens existem e são leves (alta até 450 KB, leve até 160 KB)', () => {
    const pub = (u: string) => join(process.cwd(), 'public', u.replace(/^.*?mapas\//, 'mapas/'))
    expect(existsSync(pub(ARTE_EDEN.alta))).toBe(true)
    expect(existsSync(pub(ARTE_EDEN.leve))).toBe(true)
    expect(statSync(pub(ARTE_EDEN.alta)).size).toBeLessThan(450 * 1024)
    expect(statSync(pub(ARTE_EDEN.leve)).size).toBeLessThan(160 * 1024)
  })

  it('só Gênesis tem região pintada neste protótipo (Êxodo continua como está)', () => {
    expect(Object.keys(ARTES_DO_MUNDO)).toEqual(['mundo-genesis'])
  })
})

describe('RegiaoTrilha', () => {
  const marcos: Marco[] = (['concluida', 'atual', 'disponivel', 'bloqueada'] as const).map((estado, i) => ({
    tipo: 'fase', id: `m${i}`, numero: i + 1, estado, estrelas: estado === 'concluida' ? 2 : 0,
    rotulo: `Fase ${i + 1}: teste. ${rotuloDoEstado(estado, 2, 'historia')}`, onClick: () => {},
  }))
  const pontos = marcos.map((m, i) => ({ id: m.id, x: 100 + i * 50, y: 400 - i * 90 }))

  it('mostra os quatro estados como botões, com a arte decorativa fora da acessibilidade', async () => {
    const { container } = render(<RegiaoTrilha W={400} H={500} atributo="data-node" marcos={marcos} pontos={pontos} arte={{ regiao: ARTE_EDEN, leve: false }} />)
    expect(screen.getByRole('button', { name: /Concluída, 2 de 3 estrelas/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fase atual/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Disponível/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bloqueada/ })).toBeInTheDocument()
    // carregamento sob demanda: a pintura entra assim que a região é avaliada como visível
    await waitFor(() => expect(container.querySelector('img.tr-arte')).not.toBeNull())
    const img = container.querySelector('img.tr-arte')!
    expect(img.getAttribute('aria-hidden')).toBe('true')
    expect(img.getAttribute('src')).toBe(ARTE_EDEN.alta)
    for (const e of ['concluida', 'atual', 'disponivel', 'bloqueada']) expect(container.querySelector(`.tr-estandarte.is-${e}`)).not.toBeNull()
    // estrelas reais: 2 acesas na concluída, nenhuma nas outras
    expect(container.querySelectorAll('.tr-estandarte.is-concluida .tr-estrelas .on')).toHaveLength(2)
    expect(container.querySelectorAll('.tr-estandarte.is-atual .tr-estrelas .on')).toHaveLength(0)
  })

  it('na qualidade leve usa a imagem leve; sem arte, usa o cenário vetorial', async () => {
    const { container, rerender } = render(<RegiaoTrilha W={400} H={500} atributo="data-node" marcos={marcos} pontos={pontos} arte={{ regiao: ARTE_EDEN, leve: true }} />)
    await waitFor(() => expect(container.querySelector('img.tr-arte')!.getAttribute('src')).toBe(ARTE_EDEN.leve))
    rerender(<RegiaoTrilha W={400} H={500} atributo="data-qnode" marcos={marcos} pontos={pontos} fundo={<svg data-testid="vetorial" />} />)
    expect(container.querySelector('img.tr-arte')).toBeNull()
    expect(screen.getByTestId('vetorial')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-qnode]')).toHaveLength(4)
  })

  it('baú nos três estados do sistema', () => {
    const baus: Marco[] = (['fechado', 'disponivel', 'aberto'] as const).map((estado, i) => ({ tipo: 'bau', id: `b${i}`, estado, final: false, rotulo: `baú ${estado}`, onClick: () => {} }))
    const { container } = render(<RegiaoTrilha W={400} H={500} atributo="data-node" marcos={baus} pontos={baus.map((b, i) => ({ id: b.id, x: 200, y: 100 + i * 120 }))} />)
    for (const e of ['fechado', 'disponivel', 'aberto']) expect(container.querySelector(`.tr-bau.is-${e} button`)).not.toBeNull()
  })
})

describe('região pintada das Terras do Dilúvio (região 2)', () => {
  const genesis = worldSections().find((s) => s.world.id === 'mundo-genesis')!

  it('recebe as fases 6 a 10 e o baú da fase 10; o restante de Gênesis continua no cenário vetorial', () => {
    const { pintadas, resto } = dividirTrecho(genesis)
    expect(pintadas[1].arte).toBe(ARTE_DILUVIO)
    expect(pintadas[1].nos.map((n) => (n.kind === 'phase' ? n.number : 'bau'))).toEqual([6, 7, 8, 9, 10, 'bau'])
    expect(pintadas[1].nos[5].id).toBe('bau-mundo-genesis-10')
    expect(resto[0].kind === 'phase' && resto[0].number).toBe(11)
  })

  it('os pontos ficam dentro da imagem, sobem pelo mapa e não se sobrepõem', () => {
    const { pontos, largura, altura } = ARTE_DILUVIO
    expect(pontos).toHaveLength(6)
    for (const p of pontos) {
      expect(p.x).toBeGreaterThan(0.12)
      expect(p.x).toBeLessThan(0.88)
      expect(p.y).toBeGreaterThan(0.1)
      expect(p.y).toBeLessThan(0.95)
    }
    for (let i = 1; i < pontos.length; i++) expect(pontos[i].y).toBeLessThan(pontos[i - 1].y)
    const escala = 400 / largura
    for (let i = 0; i < pontos.length; i++)
      for (let j = i + 1; j < pontos.length; j++)
        expect(Math.hypot((pontos[i].x - pontos[j].x) * largura * escala, (pontos[i].y - pontos[j].y) * altura * escala)).toBeGreaterThan(90)
  })

  it('tem o mesmo tamanho do Éden (as duas imagens se encaixam sem emenda) e é leve', () => {
    expect([ARTE_DILUVIO.largura, ARTE_DILUVIO.altura]).toEqual([ARTE_EDEN.largura, ARTE_EDEN.altura])
    const pub = (u: string) => join(process.cwd(), 'public', u.replace(/^.*?mapas\//, 'mapas/'))
    expect(statSync(pub(ARTE_DILUVIO.alta)).size).toBeLessThan(450 * 1024)
    expect(statSync(pub(ARTE_DILUVIO.leve)).size).toBeLessThan(160 * 1024)
  })

  it('o Éden aprovado não mudou (mesmos pontos)', () => {
    expect(ARTE_EDEN.pontos).toEqual([
      { x: 0.58507, y: 0.89037 }, { x: 0.31922, y: 0.73593 }, { x: 0.63824, y: 0.57197 },
      { x: 0.40429, y: 0.41923 }, { x: 0.65951, y: 0.29901 }, { x: 0.34049, y: 0.1894 },
    ])
  })
})
