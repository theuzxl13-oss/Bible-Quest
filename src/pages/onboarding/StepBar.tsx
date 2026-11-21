const STEPS = ['Boas-vindas', 'Identificação', 'Personagem', 'Personalização', 'Entrada']

/** Indicador das etapas de criação do jogador. */
export function StepBar({ current }: { current: number }) {
  return (
    <ol className="stepbar" aria-label={`Etapa ${current} de ${STEPS.length}: ${STEPS[current - 1]}`}>
      {STEPS.map((s, i) => (
        <li key={s} className={i + 1 === current ? 'is-on' : i + 1 < current ? 'is-done' : ''} aria-current={i + 1 === current ? 'step' : undefined}>
          <span>{i + 1}</span>
          <em>{s}</em>
        </li>
      ))}
    </ol>
  )
}
