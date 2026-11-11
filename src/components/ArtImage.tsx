import { ART, artUrl } from '../data/images'

interface Props {
  art: string
  className?: string
  /** "eager" para a imagem principal da tela (melhora o LCP). */
  priority?: boolean
  sizes?: string
  decorative?: boolean
}

export function ArtImage({ art, className, priority, sizes = '100vw', decorative }: Props) {
  const meta = ART[art]
  return (
    <img
      className={className}
      src={artUrl(art)}
      srcSet={`${artUrl(art, 'sm')} 560w, ${artUrl(art)} 1280w`}
      sizes={sizes}
      alt={decorative || !meta ? '' : meta.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}

export function ArtCredit({ art }: { art: string }) {
  const meta = ART[art]
  if (!meta) return null
  return (
    <p className="art-credit">
      <cite>{meta.title}</cite> — {meta.artist}, {meta.year}. Domínio público.
    </p>
  )
}
