import { useEffect, type RefObject } from 'react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Acessibilidade (0.17.7, verificação do passo 1.6): enquanto um painel não
 * modal está aberto (o painel de missões da Central), Tab e Shift+Tab pulam os
 * elementos que ficam encobertos por ele. Assim o foco nunca para num
 * controle escondido (WCAG 2.4.11). Os elementos visíveis continuam na ordem
 * de sempre, e com o painel fechado nada muda. Não altera nada visual.
 */
export function usePularEncobertos(painel: RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    if (!ativo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return
      const caixa = painel.current
      if (!caixa) return
      const itens = Array.from(document.querySelectorAll<HTMLElement>(FOCAVEIS)).filter((el) => {
        if (el.closest('[hidden], [inert]')) return false
        const st = getComputedStyle(el)
        return st.display !== 'none' && st.visibility !== 'hidden'
      })
      const atual = itens.indexOf(document.activeElement as HTMLElement)
      if (atual < 0) return
      const passo = e.shiftKey ? -1 : 1
      const proximo = itens[atual + passo]
      if (!proximo || !encoberto(proximo, caixa)) return // o navegador segue normalmente
      for (let i = atual + passo; i >= 0 && i < itens.length; i += passo) {
        if (!encoberto(itens[i], caixa)) {
          e.preventDefault()
          itens[i].focus()
          return
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [painel, ativo])
}

/** Metade ou mais da área do elemento (numa grade de 15 pontos) fica sob o painel? */
export function encoberto(el: HTMLElement, caixa: HTMLElement): boolean {
  if (caixa.contains(el) || typeof document.elementFromPoint !== 'function') return false
  const q = el.getBoundingClientRect()
  if (!q.width || !q.height) return false
  let sob = 0
  let total = 0
  for (let i = 1; i < 6; i++) {
    for (let j = 1; j < 4; j++) {
      total++
      const h = document.elementFromPoint(q.x + (q.width * i) / 6, q.y + (q.height * j) / 4)
      if (h && caixa.contains(h)) sob++
    }
  }
  return sob * 2 >= total
}
