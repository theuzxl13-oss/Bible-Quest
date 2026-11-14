import { useEffect, useState } from 'react'
import { useGame } from '../state/GameContext'
import { Icon } from './Icon'

/** Leitura em voz alta usando a síntese de voz do navegador (pt-BR), quando disponível. */
export function ReadAloud({ text, label = 'Ouvir' }: { text: string; label?: string }) {
  const { settings } = useGame()
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => {
    if (supported && speaking) window.speechSynthesis.cancel()
  }, [supported, speaking])

  if (!supported || !settings.readAloud) return null

  const toggle = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    u.rate = 0.95
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} aria-pressed={speaking}>
      <Icon name={speaking ? 'stop' : 'volume'} size={16} />
      {speaking ? 'Parar leitura' : label}
    </button>
  )
}
