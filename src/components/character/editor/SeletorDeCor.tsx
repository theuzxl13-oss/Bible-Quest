import { useId } from 'react'

/**
 * Seletor de cor de uma região do personagem: paleta de cores de época,
 * cor livre (seletor do sistema) e "cor original". Acessível por teclado.
 */
export function SeletorDeCor({ label, paleta, valor, onChange }: { label: string; paleta: string[]; valor: string | undefined; onChange: (hex: string | undefined) => void }) {
  const id = useId()
  return (
    <fieldset className="field color-field">
      <legend>{label}</legend>
      <div className="swatches">
        <label className={`swatch swatch-original ${valor === undefined ? 'is-on' : ''}`} title="Cor original">
          <input type="radio" name={id} checked={valor === undefined} onChange={() => onChange(undefined)} />
          <span className="sr-only">Cor original</span>
        </label>
        {paleta.map((c) => (
          <label key={c} className={`swatch ${valor === c ? 'is-on' : ''}`} style={{ background: c }} title={c}>
            <input type="radio" name={id} checked={valor === c} onChange={() => onChange(c)} />
            <span className="sr-only">{`${label}: cor ${c}`}</span>
          </label>
        ))}
        <label className={`swatch swatch-livre ${valor && !paleta.includes(valor) ? 'is-on' : ''}`} title="Escolher outra cor" style={valor && !paleta.includes(valor) ? { background: valor } : undefined}>
          <input type="color" aria-label={`${label}: escolher outra cor`} value={valor ?? '#888888'} onChange={(e) => onChange(e.target.value)} />
        </label>
      </div>
    </fieldset>
  )
}
