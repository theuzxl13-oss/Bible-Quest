import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section center">
      <p className="eyebrow">Página não encontrada</p>
      <h1>Este caminho não está no mapa</h1>
      <p className="muted">O endereço pode ter mudado ou não existir.</p>
      <Link to="/" className="btn btn-gold">Voltar ao início</Link>
    </div>
  )
}
