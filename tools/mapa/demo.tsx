/*
 * DEMONSTRAÇÃO DOS MARCOS DO MAPA (ferramenta; não faz parte do jogo nem do build)
 * Aberta pelo servidor de desenvolvimento em /tools/mapa/demo.html, só para fotografar
 * no relatório os quatro estados do estandarte e os três estados do baú, inclusive o
 * estado "disponível", que as regras lineares de hoje quase nunca produzem no jogo.
 * Usa os mesmos componentes do jogo (RegiaoTrilha, Estandarte, ChestIcon).
 */
import { createRoot } from 'react-dom/client'
import '@fontsource/cinzel/700.css'
import '../../src/styles/global.css'
import '../../src/styles/tokens.css'
import '../../src/styles/ponte.css'
import '../../src/styles/telas/mapa-trilha.css'
import { RegiaoTrilha, type Marco } from '../../src/components/map/trilha/Trilha'
import { ARTE_EDEN } from '../../src/data/mapas/artes'
import type { EstadoMarco } from '../../src/services/game/marcos'

const nada = () => {}
const fase = (i: number, estado: EstadoMarco, estrelas: number, icone?: 'check' | 'clock'): Marco => ({ tipo: 'fase', id: `f${i}`, numero: i, estado, estrelas, rotulo: '', icone, onClick: nada })
const bau = (id: string, estado: 'fechado' | 'disponivel' | 'aberto'): Marco => ({ tipo: 'bau', id, estado, final: false, rotulo: '', onClick: nada })
const P = ARTE_EDEN.pontos

function Legenda({ t }: { t: string }) {
  return <p style={{ margin: 0, padding: '10px 16px', color: '#f5ecd6', font: '700 18px Cinzel, serif', background: '#2b1d10' }}>{t}</p>
}

function Faixa({ classe, marcos, fundo, y = 150 }: { classe?: string; marcos: Marco[]; fundo: string; y?: number }) {
  return (
    <div className={classe} style={{ width: 412 }}>
      <RegiaoTrilha W={412} H={190} atributo="data-node" marcos={marcos} pontos={marcos.map((m, i) => ({ id: m.id, x: 58 + i * (296 / Math.max(1, marcos.length - 1)), y }))}
        fundo={<div style={{ position: 'absolute', inset: 0, background: fundo }} />} />
    </div>
  )
}
const pintura = (y: string) => `url(${ARTE_EDEN.alta}) center ${y} / 100% auto`

function Demo() {
  return (
    <div style={{ width: 412 }} className="av-mapa">
      <div id="estados">
        <Legenda t="Os quatro estados (História)" />
        <Faixa fundo={pintura('62%')} marcos={[fase(1, 'concluida', 3), fase(2, 'atual', 0), fase(3, 'disponivel', 0), fase(4, 'bloqueada', 0)]} />
        <Faixa fundo={pintura('80%')} marcos={[fase(5, 'concluida', 1), fase(6, 'concluida', 2), fase(7, 'disponivel', 0), fase(8, 'bloqueada', 0)]} />
      </div>
      <div id="quiz">
        <Legenda t="Os mesmos estados (Quiz)" />
        <Faixa classe="tr-quiz" fundo="linear-gradient(#efe4c4,#d9c99c)" marcos={[fase(1, 'concluida', 2, 'check'), fase(2, 'atual', 0, 'clock'), fase(3, 'disponivel', 0, 'check'), fase(4, 'bloqueada', 0)]} />
      </div>
      <div id="baus">
        <Legenda t="Baú: bloqueado, disponível, resgatado" />
        <Faixa fundo={pintura('19%')} y={105} marcos={[bau('b1', 'fechado'), bau('b2', 'disponivel'), bau('b3', 'aberto')]} />
      </div>
      <div id="regiao">
        <Legenda t="Região do Éden com todos os estados" />
        <div style={{ width: 412 }}>
          <RegiaoTrilha W={ARTE_EDEN.largura} H={ARTE_EDEN.altura} atributo="data-node" arte={{ regiao: ARTE_EDEN, leve: false }}
            pontos={P.map((p, i) => ({ id: i < 5 ? `e${i}` : 'eb', x: p.x * ARTE_EDEN.largura, y: p.y * ARTE_EDEN.altura }))}
            marcos={[
              { ...fase(1, 'concluida', 3), id: 'e0' }, { ...fase(2, 'concluida', 2), id: 'e1' }, { ...fase(3, 'atual', 0), id: 'e2' },
              { ...fase(4, 'disponivel', 0), id: 'e3' }, { ...fase(5, 'bloqueada', 0), id: 'e4' }, { ...bau('eb', 'fechado') },
            ]} />
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Demo />)
