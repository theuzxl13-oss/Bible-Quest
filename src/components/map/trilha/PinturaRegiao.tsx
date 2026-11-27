import { useEffect, useRef, useState } from 'react'
import type { ArteRegiao } from '../../../data/mapas/artes'
import { inscrever, pinturaPronta, prepararPintura, soltarPintura } from './pinturas'

/*
 * Fundo pintado de uma região, com carregamento sob demanda (pinturas.ts).
 * - A miniatura (~2 KB, embutida) está sempre embaixo: a região nunca fica vazia.
 * - A pintura definitiva só entra na página depois de baixada, com decoding="sync" (o navegador
 *   não mostra o quadro dela pela metade); dois quadros depois, a miniatura se esconde.
 * - Trocar a qualidade troca o endereço da mesma <img>: o navegador mantém a imagem anterior
 *   até a nova estar pronta, sem piscar.
 * - Longe da tela (mais de 3 telas), a pintura sai e a miniatura volta.
 * O tamanho e a posição da região não dependem da imagem (caixa com proporção fixa).
 */

const TENTATIVA_EXTRA_MS = 1500

export function PinturaRegiao({ regiao, leve }: { regiao: ArteRegiao; leve: boolean }) {
  const url = leve ? regiao.leve : regiao.alta
  const miniatura = useRef<HTMLImageElement>(null)
  const [carregar, setCarregar] = useState(() => pinturaPronta(url))
  const [exibida, setExibida] = useState<string | null>(() => (pinturaPronta(url) ? url : null))
  const [coberta, setCoberta] = useState(false)

  // Inscrição num efeito comum (não de layout), de propósito: ele roda no mesmo lote do efeito do
  // mapa que rola até a fase atual, e o temporizador da primeira avaliação (250 ms) vence depois
  // dessa rolagem mesmo se a página ficar presa um tempo (ex.: saída da cena 3D do menu).
  useEffect(() => (miniatura.current ? inscrever(miniatura.current, carregar, setCarregar) : undefined), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!carregar) {
      if (exibida) soltarPintura(exibida)
      setExibida(null)
      setCoberta(false)
      return
    }
    let vivo = true
    let tentativa: ReturnType<typeof setTimeout> | undefined
    const pedir = (ultima: boolean) =>
      prepararPintura(regiao.id, url).then(
        () => vivo && setExibida(url),
        () => {
          // arquivo ausente ou falha ao decodificar: a miniatura continua; tenta mais uma vez
          if (vivo && !ultima) tentativa = setTimeout(() => pedir(true), TENTATIVA_EXTRA_MS)
        },
      )
    pedir(false)
    return () => {
      vivo = false
      if (tentativa) clearTimeout(tentativa)
    }
  }, [carregar, url, regiao.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // decoding="sync": o quadro com a pintura só chega à tela com ela decodificada; dois quadros
  // depois do carregamento a miniatura já está coberta e pode sair (sem decode(), que forçaria
  // uma cópia em resolução cheia no cache do navegador).
  const pronta = () => requestAnimationFrame(() => requestAnimationFrame(() => setCoberta(true)))

  return (
    <>
      <img
        ref={miniatura}
        className={`tr-miniatura ${coberta ? 'is-coberta' : ''}`}
        src={regiao.miniatura}
        width={regiao.largura}
        height={regiao.altura}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      {exibida && (
        <img
          className="tr-arte"
          src={exibida}
          width={regiao.largura}
          height={regiao.altura}
          alt=""
          aria-hidden="true"
          decoding="sync"
          draggable={false}
          data-regiao={regiao.id}
          onLoad={pronta}
        />
      )}
    </>
  )
}
