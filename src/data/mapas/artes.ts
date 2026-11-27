/*
 * CENÁRIOS PINTADOS DO MAPA (reformulação visual, entrega 2: protótipo do Éden)
 * Cada região pintada é uma imagem pré-renderizada (cena 3D procedural em Blender,
 * acabamento de pintura no compositor: tools/mapa/eden.py) com os pontos do caminho
 * exportados pela própria cena, em frações da imagem (x da esquerda, y do topo).
 * Origem e licença: public/mapas/LICENCAS.md.
 *
 * `marcos` diz, na ordem, quais nós do trecho ocupam os pontos: as 5 primeiras fases
 * de Gênesis e o baú que vem depois delas. O motor não inventa nós: se um id não existir
 * no trecho, o ponto fica vazio.
 */

export interface ArteRegiao {
  id: string
  nome: string
  alta: string
  leve: string
  largura: number
  altura: number
  /** Pontos do caminho, na ordem da trilha (de baixo para cima). */
  pontos: { x: number; y: number }[]
}

const base = import.meta.env.BASE_URL ?? '/'

export const ARTE_EDEN: ArteRegiao = {
  id: 'eden',
  nome: 'Jardim do Éden',
  alta: `${base}mapas/genesis/eden.webp`,
  leve: `${base}mapas/genesis/eden-leve.webp`,
  largura: 1080,
  altura: 2257,
  pontos: [
    { x: 0.58507, y: 0.89037 },
    { x: 0.31922, y: 0.73593 },
    { x: 0.63824, y: 0.57197 },
    { x: 0.40429, y: 0.41923 },
    { x: 0.65951, y: 0.29901 },
    { x: 0.34049, y: 0.1894 },
  ],
}

/** Regiões pintadas por mundo: quantos nós do começo do trecho cada uma recebe. */
export const ARTES_DO_MUNDO: Record<string, ArteRegiao[]> = {
  'mundo-genesis': [ARTE_EDEN],
}
