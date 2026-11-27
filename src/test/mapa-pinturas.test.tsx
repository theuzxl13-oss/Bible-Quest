import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import { ARTE_DILUVIO, ARTE_EDEN, type ArteRegiao } from '../data/mapas/artes'
import { MINIATURA_DILUVIO, MINIATURA_EDEN } from '../data/mapas/miniaturas'
import { PinturaRegiao } from '../components/map/trilha/PinturaRegiao'
import {
  ESPERA_MAXIMA_ABERTURA_MS, LIMITE_REGISTRO, MAX_PINTURAS, aguardarAbertura, avaliar, distanciaEmTelas, escolherCarregadas,
  limparRegistroParaTestes, pinturaPronta, pinturasNoRegistro, prepararPintura, proximoEstado, soltarPintura,
  trocarCarregadorParaTestes,
} from '../components/map/trilha/pinturas'

/*
 * CARREGAMENTO SOB DEMANDA DAS PINTURAS DO MAPA
 * (docs/relatorios/MAPA_AUDITORIA_MEMORIA_DESEMPENHO.md § 10 e 11)
 * Regras de distância e histerese, limite de três pinturas, registro sem cópias, troca de
 * qualidade, abertura do mapa e a miniatura sempre presente.
 */

afterEach(() => {
  limparRegistroParaTestes()
  trocarCarregadorParaTestes(null)
})

/** Simula o navegador baixando as pinturas (o jsdom não carrega imagens). */
function navegador(comportamento: (url: string) => Promise<void> = () => Promise.resolve()) {
  const pedidos: string[] = []
  trocarCarregadorParaTestes((url) => {
    pedidos.push(url)
    return { img: null, promessa: comportamento(url) }
  })
  return pedidos
}

describe('distância e estados', () => {
  it('mede a distância em telas até a área visível', () => {
    expect(distanciaEmTelas(100, 900, 800)).toBe(0) // dentro da tela
    expect(distanciaEmTelas(-500, 10, 800)).toBe(0) // cruza o topo
    expect(distanciaEmTelas(1600, 2400, 800)).toBe(1) // começa 1 tela abaixo
    expect(distanciaEmTelas(-3000, -2400, 800)).toBe(3) // termina 3 telas acima
  })

  it('visível na tela, perto até 1,5 tela, longe acima de 3 telas', () => {
    expect(proximoEstado('longe', 0)).toBe('visivel')
    expect(proximoEstado('longe', 1.5)).toBe('perto')
    expect(proximoEstado('perto', 3.01)).toBe('longe')
    expect(proximoEstado('visivel', 9)).toBe('longe')
  })

  it('histerese entre 1,5 e 3 telas: quem tinha a pintura mantém, quem estava longe espera', () => {
    for (const d of [1.6, 2.5, 3]) {
      expect(proximoEstado('perto', d)).toBe('perto')
      expect(proximoEstado('visivel', d)).toBe('perto')
      expect(proximoEstado('longe', d)).toBe('longe')
    }
    // rolar para lá e para cá na divisa não troca o estado a cada passo
    let e = proximoEstado('longe', 1.4)
    for (const d of [1.6, 1.4, 2.9, 1.7, 2.2]) e = proximoEstado(e, d)
    expect(e).toBe('perto')
  })

  it('no máximo três pinturas, as mais próximas, qualquer que seja o número de regiões', () => {
    const regioes = [0, 0.4, 1.2, 0.2, 2.5, 0, 1].map((distancia) => ({ estado: 'perto' as const, distancia }))
    const r = escolherCarregadas(regioes)
    expect(r.filter(Boolean)).toHaveLength(MAX_PINTURAS)
    expect(r).toEqual([true, false, false, true, false, true, false])
    // regiões longe nunca carregam, mesmo havendo vaga
    expect(escolherCarregadas([{ estado: 'longe', distancia: 5 }, { estado: 'visivel', distancia: 0 }])).toEqual([false, true])
  })
})

describe('registro de pinturas decodificadas', () => {
  it('cada pintura é baixada uma vez só (sem cópias por visita)', async () => {
    const pedidos = navegador()
    await Promise.all([prepararPintura('eden', ARTE_EDEN.alta), prepararPintura('eden', ARTE_EDEN.alta)])
    await prepararPintura('eden', ARTE_EDEN.alta)
    expect(pinturasNoRegistro()).toEqual([ARTE_EDEN.alta])
    expect(pinturaPronta(ARTE_EDEN.alta)).toBe(true)
    expect(pedidos).toEqual([ARTE_EDEN.alta])
  })

  it('a região que sai da página continua referenciada: a volta reaproveita a mesma imagem', async () => {
    const pedidos = navegador()
    await prepararPintura('eden', ARTE_EDEN.alta)
    soltarPintura(ARTE_EDEN.alta)
    expect(pinturaPronta(ARTE_EDEN.alta)).toBe(true)
    await prepararPintura('eden', ARTE_EDEN.alta)
    expect(pedidos).toEqual([ARTE_EDEN.alta])
  })

  it('trocar a qualidade descarta a versão anterior da mesma região', async () => {
    navegador()
    await prepararPintura('eden', ARTE_EDEN.alta)
    await prepararPintura('diluvio', ARTE_DILUVIO.alta)
    await prepararPintura('eden', ARTE_EDEN.leve)
    expect(pinturasNoRegistro().sort()).toEqual([ARTE_DILUVIO.alta, ARTE_EDEN.leve].sort())
  })

  it(`referencia no máximo ${LIMITE_REGISTRO} pinturas; as que saíram da página e foram usadas há mais tempo saem primeiro`, async () => {
    navegador()
    for (let i = 1; i <= LIMITE_REGISTRO + 2; i++) {
      await prepararPintura(`r${i}`, `/mapas/r${i}.webp`)
      if (i !== 2) soltarPintura(`/mapas/r${i}.webp`) // r2 continua na página
    }
    const ficaram = pinturasNoRegistro()
    expect(ficaram).toHaveLength(LIMITE_REGISTRO)
    expect(ficaram).toContain('/mapas/r2.webp')
    expect(ficaram).not.toContain('/mapas/r1.webp')
    expect(ficaram).not.toContain('/mapas/r3.webp')
  })

  it('arquivo que não carrega não fica no registro e não trava a abertura', async () => {
    navegador(() => Promise.reject(new Error('quebrada')))
    await expect(prepararPintura('x', '/mapas/quebrada.webp')).rejects.toThrow()
    expect(pinturasNoRegistro()).toEqual([])
    const alvo = [{ regiao: 'x', url: '/mapas/quebrada.webp' }]
    const p = aguardarAbertura(alvo)
    await expect(p).resolves.toBeUndefined()
    // o mapa refeito pelo React recebe a mesma promessa (já cumprida): nada de pedir o arquivo em laço
    expect(aguardarAbertura(alvo)).toBe(p)
  })
})

describe('abertura do mapa', () => {
  it('a abertura prepara no máximo três pinturas (a da fase e as vizinhas)', async () => {
    navegador()
    await aguardarAbertura([1, 2, 3, 4, 5].map((n) => ({ regiao: `r${n}`, url: `/mapas/r${n}.webp` })))
    expect(pinturasNoRegistro()).toEqual(['/mapas/r1.webp', '/mapas/r2.webp', '/mapas/r3.webp'])
  })

  it('sem região pintada na fase atual, não espera nada', async () => {
    const p = aguardarAbertura([]) as Promise<void> & { status?: string }
    expect(p.status).toBe('fulfilled')
  })

  it('espera as pinturas da abertura e devolve sempre a mesma promessa; a segunda visita não espera', async () => {
    navegador()
    const alvo = [{ regiao: 'diluvio', url: ARTE_DILUVIO.alta }, { regiao: 'eden', url: ARTE_EDEN.alta }]
    const p = aguardarAbertura(alvo) as Promise<void> & { status?: string }
    expect(p.status).toBe('pending')
    expect(aguardarAbertura(alvo)).toBe(p)
    await p
    expect(p.status).toBe('fulfilled')
    expect(pinturaPronta(ARTE_DILUVIO.alta)).toBe(true)
    expect(pinturaPronta(ARTE_EDEN.alta)).toBe(true)
    expect((aguardarAbertura(alvo) as Promise<void> & { status?: string }).status).toBe('fulfilled')
  })

  it('sem carregamento de imagens (jsdom), não segura a abertura (prepara em segundo plano)', async () => {
    const p = aguardarAbertura([{ regiao: 'eden', url: ARTE_EDEN.alta }]) as Promise<void> & { status?: string }
    expect(p.status).toBe('fulfilled')
    await waitFor(() => expect(pinturaPronta(ARTE_EDEN.alta)).toBe(true))
  })

  it('nunca espera mais que o limite (a miniatura cobre se a pintura atrasar)', async () => {
    vi.useFakeTimers()
    try {
      navegador(() => new Promise(() => {}))
      const p = aguardarAbertura([{ regiao: 'lenta', url: '/mapas/lenta.webp' }]) as Promise<void> & { status?: string }
      await vi.advanceTimersByTimeAsync(ESPERA_MAXIMA_ABERTURA_MS + 10)
      expect(p.status).toBe('fulfilled')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('PinturaRegiao', () => {
  const regiao: ArteRegiao = ARTE_EDEN

  it('a miniatura (~2 KB, embutida) está sempre presente e fora da acessibilidade', () => {
    const { container } = render(<PinturaRegiao regiao={regiao} leve={false} />)
    const mini = container.querySelector('img.tr-miniatura')!
    expect(mini.getAttribute('src')).toBe(MINIATURA_EDEN)
    expect(mini.getAttribute('aria-hidden')).toBe('true')
    for (const m of [MINIATURA_EDEN, MINIATURA_DILUVIO]) {
      expect(m.startsWith('data:image/webp;base64,')).toBe(true)
      const bytes = Math.floor(((m.length - 'data:image/webp;base64,'.length) * 3) / 4)
      expect(bytes).toBeGreaterThan(1000)
      expect(bytes).toBeLessThan(2100)
    }
  })

  it('a pintura só entra depois de pronta; longe da tela ela sai e a miniatura volta', async () => {
    const { container } = render(<PinturaRegiao regiao={regiao} leve={false} />)
    // antes da primeira avaliação: só a miniatura (nada de imagem quebrada ou vazia)
    expect(container.querySelector('img.tr-arte')).toBeNull()
    await waitFor(() => expect(container.querySelector('img.tr-arte')?.getAttribute('src')).toBe(ARTE_EDEN.alta))
    expect(pinturaPronta(ARTE_EDEN.alta)).toBe(true)
    // a região vai para 10 telas acima
    const mini = container.querySelector('img.tr-miniatura')!
    vi.spyOn(mini, 'getBoundingClientRect').mockReturnValue({ top: -11000, bottom: -10000, left: 0, right: 0, width: 0, height: 1000, x: 0, y: 0, toJSON: () => ({}) })
    act(() => avaliar())
    await waitFor(() => expect(container.querySelector('img.tr-arte')).toBeNull())
    expect(container.querySelector('img.tr-miniatura')).not.toBeNull()
    // fora da página, mas ainda referenciada para a volta reaproveitar a mesma imagem
    expect(pinturasNoRegistro()).toContain(ARTE_EDEN.alta)
  })

  it('pintura já pronta (volta ao mapa) aparece já na primeira renderização, sem baixar de novo', async () => {
    await prepararPintura('eden', ARTE_EDEN.leve)
    const { container } = render(<PinturaRegiao regiao={regiao} leve />)
    expect(container.querySelector('img.tr-arte')?.getAttribute('src')).toBe(ARTE_EDEN.leve)
  })

  it('trocar a qualidade troca o endereço da mesma imagem (sem piscar) e descarta a versão anterior', async () => {
    const { container, rerender } = render(<PinturaRegiao regiao={regiao} leve={false} />)
    await waitFor(() => expect(container.querySelector('img.tr-arte')).not.toBeNull())
    const img = container.querySelector('img.tr-arte')
    rerender(<PinturaRegiao regiao={regiao} leve />)
    await waitFor(() => expect(container.querySelector('img.tr-arte')?.getAttribute('src')).toBe(ARTE_EDEN.leve))
    expect(container.querySelector('img.tr-arte')).toBe(img)
    expect(pinturasNoRegistro()).toEqual([ARTE_EDEN.leve])
  })
})
