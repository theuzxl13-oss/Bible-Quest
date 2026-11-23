import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { GameIcon, temIlustracao } from '../components/GameIcon'

/* Ícones ilustrados (v0.12). */
describe('ícones ilustrados', () => {
  it('os ícones do menu, do acampamento e das conquistas têm versão ilustrada', () => {
    for (const n of ['tenda', 'tunica', 'trophy', 'book', 'user', 'star', 'flame', 'bau', 'scroll', 'map', 'calendar', 'laurel', 'crown', 'shield', 'compass', 'clock', 'users', 'cerebro', 'settings', 'lock', 'check'] as const) {
      expect(temIlustracao(n), n).toBe(true)
    }
  })

  it('gradientes com ids únicos e queda para o ícone de traço', () => {
    const { container } = render(<><GameIcon name="star" /><GameIcon name="star" /><GameIcon name="arrowRight" /></>)
    const ids = Array.from(container.querySelectorAll('linearGradient')).map((g) => g.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    expect(container.querySelectorAll('svg.game-icon')).toHaveLength(2)
    expect(container.querySelectorAll('svg.icon')).toHaveLength(1)
    // decorativo por padrão; com título vira imagem com nome
    const { getByRole } = render(<GameIcon name="trophy" title="Troféu" />)
    expect(getByRole('img', { name: 'Troféu' })).toBeInTheDocument()
  })
})
