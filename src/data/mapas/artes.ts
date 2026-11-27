/*
 * CENÁRIOS PINTADOS DO MAPA (reformulação visual, entrega 2: protótipo do Éden)
 * Cada região pintada é uma imagem pré-renderizada (cena 3D procedural em Blender,
 * acabamento de pintura no compositor: tools/mapa/eden.py) com os pontos do caminho
 * exportados pela própria cena, em frações da imagem (x da esquerda, y do topo).
 * Origem e licença: public/mapas/LICENCAS.md.
 * Cada região tem também uma miniatura embutida (~2 KB, tools/mapa/miniaturas.py), mostrada
 * enquanto a pintura definitiva não está pronta (carregamento sob demanda).
 *
 * Cada região recebe, na ordem, os nós seguintes do trecho (5 fases e o baú depois delas):
 * Éden = fases 1 a 5 e o baú da fase 5; Terras do Dilúvio = fases 6 a 10 e o baú da fase 10.
 * As duas vêm de um mundo contínuo (tools/mapa/diluvio.py contém o Éden e o continua ao norte):
 * a imagem do Dilúvio fica logo acima da do Éden, e a emenda não aparece.
 */

export interface ArteRegiao {
  id: string
  nome: string
  alta: string
  leve: string
  /** Miniatura embutida (data URI de ~2 KB): fundo provisório da região. */
  miniatura: string
  largura: number
  altura: number
  /** Pontos do caminho, na ordem da trilha (de baixo para cima). */
  pontos: { x: number; y: number }[]
}

import { MINIATURA_DILUVIO, MINIATURA_EDEN } from './miniaturas'

const base = import.meta.env.BASE_URL ?? '/'

export const ARTE_EDEN: ArteRegiao = {
  id: 'eden',
  nome: 'Jardim do Éden',
  alta: `${base}mapas/genesis/eden.webp`,
  leve: `${base}mapas/genesis/eden-leve.webp`,
  miniatura: MINIATURA_EDEN,
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

export const ARTE_DILUVIO: ArteRegiao = {
  id: 'diluvio',
  nome: 'Terras do Dilúvio',
  alta: `${base}mapas/genesis/diluvio.webp`,
  leve: `${base}mapas/genesis/diluvio-leve.webp`,
  miniatura: MINIATURA_DILUVIO,
  largura: 1080,
  altura: 2257,
  pontos: [
    { x: 0.39366, y: 0.86998 },
    { x: 0.61698, y: 0.723 },
    { x: 0.36707, y: 0.6013 },
    { x: 0.60634, y: 0.46461 },
    { x: 0.39366, y: 0.31704 },
    { x: 0.64888, y: 0.15326 },
  ],
}

/** Regiões pintadas por mundo: quantos nós do começo do trecho cada uma recebe. */
export const ARTES_DO_MUNDO: Record<string, ArteRegiao[]> = {
  'mundo-genesis': [ARTE_EDEN, ARTE_DILUVIO],
}
