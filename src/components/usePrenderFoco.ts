import { useEffect, useRef, type RefObject } from 'react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Acessibilidade (0.17.6, passo 1.4): mantém o Tab dentro de uma janela
 * aberta (diálogo modal), em vez de ir para o que está escondido atrás dela.
 * Opcionalmente, Esc chama `aoEsc`. Não muda nada visual.
 */
export function usePrenderFoco(ref: RefObject<HTMLElement | null>, ativo = true, aoEsc?: () => void) {
  const esc = useRef(aoEsc)
  esc.current = aoEsc
  useEffect(() => {
    if (!ativo) return
    const onKey = (e: KeyboardEvent) => {
      const caixa = ref.current
      if (!caixa) return
      if (e.key === 'Escape' && esc.current) {
        esc.current()
        return
      }
      if (e.key !== 'Tab') return
      const itens = Array.from(caixa.querySelectorAll<HTMLElement>(FOCAVEIS)).filter((el) => {
        if (el.closest('[hidden], [inert]')) return false
        const st = getComputedStyle(el)
        return st.display !== 'none' && st.visibility !== 'hidden'
      })
      if (itens.length === 0) return
      const primeiro = itens[0]
      const ultimo = itens[itens.length - 1]
      const atual = document.activeElement as HTMLElement | null
      const dentro = atual ? caixa.contains(atual) : false
      if (e.shiftKey && (!dentro || atual === primeiro)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (!dentro || atual === ultimo)) {
        e.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ref, ativo])
}
