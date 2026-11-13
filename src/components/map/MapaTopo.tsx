import { Link } from 'react-router-dom'
import { Icon } from '../Icon'
import { GameIcon } from '../GameIcon'
import type { IconName } from '../Icon'

/*
 * Barra flutuante e discreta sobre os mapas: voltar ao acampamento, total de
 * estrelas (dado real) e, se houver, um atalho extra.
 */
interface Props {
  voltar: string
  estrelas: number
  extra?: { to: string; label: string; icon: IconName }
}

export function MapaTopo({ voltar, estrelas, extra }: Props) {
  return (
    <div className="saga-topo">
      <Link to={voltar} className="saga-redondo" aria-label="Voltar ao acampamento">
        <Icon name="arrowLeft" size={22} />
      </Link>
      <span className="saga-pilula" aria-label={`${estrelas} estrelas conquistadas`}>
        <GameIcon name="star" size={24} /> {estrelas}
      </span>
      {extra ? (
        <Link to={extra.to} className="saga-redondo" aria-label={extra.label} title={extra.label}>
          <GameIcon name={extra.icon} size={26} />
        </Link>
      ) : (
        <span className="saga-redondo is-vazio" aria-hidden="true" />
      )}
    </div>
  )
}
