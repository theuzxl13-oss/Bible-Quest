import { useGame } from '../../state/GameContext'
import { Character, type CharacterProps } from './Character'

/**
 * Fonte única da aparência do jogador. Todas as telas desenham o personagem
 * por aqui: nenhuma recebe ou guarda uma cópia própria da configuração.
 */
export function usePlayerCharacter() {
  return useGame().profile?.character
}

/** O personagem do jogador, com a aparência salva, em qualquer tamanho ou pose. */
export function PlayerCharacter(props: Omit<CharacterProps, 'appearance'>) {
  const appearance = usePlayerCharacter()
  if (!appearance) return null
  return <Character appearance={appearance} {...props} />
}
