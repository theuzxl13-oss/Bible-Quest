import type { EnfeitePrado, PaletaMapa } from '../components/map/Prado'

/*
 * Cores e enfeites de cada trecho dos mapas (Modo História: mundos;
 * Modo Quiz: regiões). Campo claro e colorido, no estilo de trilha de fases.
 */
interface EstiloTrecho {
  paleta: PaletaMapa
  enfeites: EnfeitePrado[]
  /** Cor da fita com o nome do trecho. */
  fita: string
}

const verde: PaletaMapa = { ceu: '#fde6f1', campo: '#c4e87e', campoFundo: '#8fcf55', folha: '#5cbf4a', flor: '#ffb3cf', listra: '#e96f4f', montanha: '#a9c9e8' }

export const ESTILO_TRECHO: Record<string, EstiloTrecho> = {
  // Modo História
  'mundo-genesis': { paleta: verde, enfeites: ['amendoeira', 'arbusto', 'arvore', 'ovelha', 'oliveira', 'tenda', 'amendoeira', 'pedras', 'torre', 'poco'], fita: '#d9534f' },
  'mundo-exodo': { paleta: { ceu: '#fff0d6', campo: '#f6dc9a', campoFundo: '#e8bd6c', folha: '#6cbf4a', flor: '#ffc0d0', listra: '#d9733f', montanha: '#e2b08a' }, enfeites: ['palmeira', 'piramide', 'tenda', 'pedras', 'palmeira', 'poco'], fita: '#c9622f' },
  'mundo-conquista': { paleta: { ceu: '#fbf5d2', campo: '#dbe98e', campoFundo: '#b5d266', folha: '#6aae3e', flor: '#ffd0e0', listra: '#c9883a', montanha: '#b8c9e0' }, enfeites: ['oliveira', 'cidade', 'arbusto', 'ovelha', 'pedras'], fita: '#b9772e' },
  'mundo-reino': { paleta: { ceu: '#f2e8ff', campo: '#cbe79c', campoFundo: '#9ccd6c', folha: '#56b04a', flor: '#ffb8d2', listra: '#b03a3a', montanha: '#c0b6e6' }, enfeites: ['cidade', 'coluna', 'oliveira', 'arbusto'], fita: '#9d2f4f' },
  'mundo-exilio': { paleta: { ceu: '#fbe1ec', campo: '#ecd6a4', campoFundo: '#d6b77c', folha: '#62b04c', flor: '#e7b8ff', listra: '#7a4fa8', montanha: '#d6b8d8' }, enfeites: ['coluna', 'palmeira', 'cidade', 'pedras'], fita: '#6c4a9e' },
  'mundo-poesia': { paleta: { ceu: '#e3f1ff', campo: '#c3e8c9', campoFundo: '#92d3a7', folha: '#4fb66e', flor: '#c8d8ff', listra: '#4a8fd0', montanha: '#a8c4ee' }, enfeites: ['pergaminho', 'amendoeira', 'ovelha', 'arbusto'], fita: '#3b7cc0' },
  'mundo-profetas': { paleta: { ceu: '#ffe6d6', campo: '#edd5a0', campoFundo: '#d9b175', folha: '#69ad48', flor: '#ffc6a8', listra: '#c4542e', montanha: '#e0b4a0' }, enfeites: ['pergaminho', 'cidade', 'pedras', 'oliveira'], fita: '#b5482a' },
  'mundo-evangelhos': { paleta: { ceu: '#def4ff', campo: '#bfea8e', campoFundo: '#88cf62', folha: '#4fb34a', flor: '#ffd0e4', listra: '#2f8fb5', montanha: '#9cd0ec' }, enfeites: ['oliveira', 'ovelha', 'poco', 'cidade', 'arbusto'], fita: '#2a7fa3' },
  'mundo-igreja': { paleta: { ceu: '#e9edff', campo: '#cbe7a4', campoFundo: '#9dcf7a', folha: '#56b24e', flor: '#ffc8dc', listra: '#5a6fc0', montanha: '#b4bfe8' }, enfeites: ['coluna', 'cidade', 'pergaminho', 'arbusto'], fita: '#4a5fb0' },
  'mundo-apocalipse': { paleta: { ceu: '#fff6d6', campo: '#e4ecff', campoFundo: '#c3d1ff', folha: '#7ac1a0', flor: '#ffe6a0', listra: '#d9a520', montanha: '#d8cff6' }, enfeites: ['cidade', 'amendoeira', 'pedras', 'coluna'], fita: '#c08a12' },
  // Modo Quiz
  vale: { paleta: verde, enfeites: ['arvore', 'ovelha', 'arbusto', 'amendoeira', 'pedras'], fita: '#3f9a4a' },
  planicie: { paleta: { ceu: '#fff3d4', campo: '#f3df8e', campoFundo: '#e2c062', folha: '#6aae3e', flor: '#ffc0d0', listra: '#d9822f', montanha: '#c9d6e8' }, enfeites: ['tenda', 'oliveira', 'poco', 'palmeira', 'pedras'], fita: '#c9762a' },
  montanhas: { paleta: { ceu: '#e4ecff', campo: '#c8e3c2', campoFundo: '#98c79a', folha: '#4f9e5e', flor: '#d8c8ff', listra: '#5a72b8', montanha: '#8fa6d6' }, enfeites: ['pedras', 'oliveira', 'pergaminho', 'arvore'], fita: '#4c64aa' },
  torre: { paleta: { ceu: '#fbe3ee', campo: '#ecd7b0', campoFundo: '#d4b384', folha: '#5fa64c', flor: '#ffb8d0', listra: '#b03a3a', montanha: '#d6b8c8' }, enfeites: ['torre', 'coluna', 'cidade', 'palmeira'], fita: '#a3343f' },
}

export function estiloTrecho(id: string): EstiloTrecho {
  return ESTILO_TRECHO[id] ?? ESTILO_TRECHO['mundo-genesis']
}
