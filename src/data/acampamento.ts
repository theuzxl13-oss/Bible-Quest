/*
 * ACAMPAMENTO EVOLUTIVO (v0.10)
 * Cada elemento do cenário da central tem uma condição de desbloqueio ligada
 * ao progresso real do jogador (nível, fases concluídas, conquistas, baús).
 * Não há compras: tudo vem de jogar. Para acrescentar um elemento novo:
 *   1. inclua-o aqui com uma condição;
 *   2. desenhe-o em `src/character3d/acampamento.ts` (função `construirElemento`);
 *   3. opcionalmente, dê a ele um destino (`rota`) para que seja clicável.
 */

export type CondicaoAcampamento =
  | { tipo: 'sempre' }
  | { tipo: 'nivel'; valor: number }
  | { tipo: 'fases'; valor: number }
  | { tipo: 'conquistas'; valor: number }
  | { tipo: 'baus'; valor: number }

export interface ElementoAcampamento {
  id: string
  nome: string
  /** O que este elemento representa no acampamento. */
  descricao: string
  condicao: CondicaoAcampamento
}

export const ELEMENTOS_ACAMPAMENTO: ElementoAcampamento[] = [
  { id: 'tenda', nome: 'Tenda do viajante', descricao: 'Onde você troca de roupa e acessórios.', condicao: { tipo: 'sempre' } },
  { id: 'fogueira', nome: 'Fogueira', descricao: 'O coração do acampamento.', condicao: { tipo: 'sempre' } },
  { id: 'mesa', nome: 'Mesa de estudos', descricao: 'Pergaminhos e livros da Biblioteca.', condicao: { tipo: 'sempre' } },
  { id: 'quadro', nome: 'Quadro de missões', descricao: 'Desafio diário e objetivos.', condicao: { tipo: 'sempre' } },
  { id: 'bau', nome: 'Baú de recompensas', descricao: 'Mostra os baús prontos para abrir.', condicao: { tipo: 'sempre' } },
  { id: 'jarros', nome: 'Jarros de barro', descricao: 'Provisões para a viagem.', condicao: { tipo: 'nivel', valor: 2 } },
  { id: 'palmeiras', nome: 'Palmeiras', descricao: 'Sombra para o acampamento.', condicao: { tipo: 'fases', valor: 3 } },
  { id: 'lanternas', nome: 'Lamparinas', descricao: 'Luz para as noites de estudo.', condicao: { tipo: 'conquistas', valor: 3 } },
  { id: 'tenda-grande', nome: 'Tenda da família', descricao: 'Uma segunda tenda, maior.', condicao: { tipo: 'nivel', valor: 4 } },
  { id: 'estandarte', nome: 'Estandarte', descricao: 'A bandeira do seu acampamento.', condicao: { tipo: 'baus', valor: 1 } },
  { id: 'poco', nome: 'Poço', descricao: 'Água fresca para os viajantes.', condicao: { tipo: 'fases', valor: 10 } },
  { id: 'ovelhas', nome: 'Rebanho', descricao: 'Algumas ovelhas pastando.', condicao: { tipo: 'nivel', valor: 6 } },
  { id: 'jardim', nome: 'Jardim', descricao: 'Flores e arbustos ao redor do caminho.', condicao: { tipo: 'conquistas', valor: 8 } },
]

export function textoCondicao(c: CondicaoAcampamento): string {
  switch (c.tipo) {
    case 'sempre':
      return 'Disponível desde o início'
    case 'nivel':
      return `Alcance o nível ${c.valor}`
    case 'fases':
      return `Conclua ${c.valor} ${c.valor === 1 ? 'fase' : 'fases'} do Modo História`
    case 'conquistas':
      return `Ganhe ${c.valor} ${c.valor === 1 ? 'conquista' : 'conquistas'}`
    case 'baus':
      return `Abra ${c.valor} ${c.valor === 1 ? 'baú' : 'baús'} no mapa`
  }
}
