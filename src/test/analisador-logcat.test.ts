import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

/*
 * Analisador do logcat dos testes em aparelhos físicos (tools/android/diagnostico/analisar-logcat.cjs).
 * Não é código do jogo: estes testes garantem que o registro é lido igual em qualquer codificação,
 * porque no Windows o PowerShell grava em UTF-16 e o Prompt de Comando em UTF-8.
 */

const ANALISADOR = join(process.cwd(), 'tools/android/diagnostico/analisar-logcat.cjs')
const pasta = mkdtempSync(join(tmpdir(), 'bq-analisador-'))
afterAll(() => rmSync(pasta, { recursive: true, force: true }))

// registro sintético no formato de "adb logcat -v epoch", com valores conhecidos
const REGISTRO = [
  '1764000000.000  5000  5000 I BQDiag  : cenario: central-internet-1',
  '1764000001.500  6000  6000 I BQDiag  : onCreate | desde o início do processo=420 ms | relogio=1764000001500 | inicioDoProcessoRelogio=1764000001080',
  '1764000002.000  6000  6000 I Capacitor/Console: File:  - Line 1 - Msg: BQDiag|página iniciada|relogio=1764000002000|t=10|{}',
  '1764000008.900  6000  6100 W BQDiag  : thread principal bloqueada por 6200 ms (fim do bloqueio) | relogio=1764000008900',
  '1764000009.000   600   700 E ActivityManager: ANR in com.kzanntech.biblequest (com.kzanntech.biblequest/.MainActivity)',
  '1764000010.000  6000  6000 I Capacitor/Console: File:  - Line 1 - Msg: BQDiag|Central visível|relogio=1764000010000|t=8000|',
  '1764000020.000  6000  6000 I Capacitor/Console: File:  - Line 1 - Msg: BQDiag|cena pronta|relogio=1764000020000|t=18000|',
  '1764000025.000  6000  6000 I Capacitor/Console: File:  - Line 1 - Msg: BQDiag|toque|relogio=1764000025000|t=23000|{"evento":"click","duracaoMs":340,"atrasoDeEntradaMs":120}',
  '1764000030.000  5000  5000 I BQDiag  : cenario: qualidade-2d',
  '1764000031.000  7000  7000 I BQDiag  : onCreate | desde o início do processo=300 ms | relogio=1764000031000 | inicioDoProcessoRelogio=1764000030700',
  '1764000033.700  7000  7000 I Capacitor/Console: File:  - Line 1 - Msg: BQDiag|Central visível|relogio=1764000033700|t=2700|',
  '',
].join('\n')

const LINHA_1 = '| central-internet-1 | 0,4 s | 0,9 s | — | 8,9 s | 18,9 s | 1 · 6,2 s · 6,2 s | **1** | 1 · 340 ms · 120 ms | 0 |'
const LINHA_2 = '| qualidade-2d | 0,3 s | — | — | 3,0 s | — | nenhum | 0 | nenhum | 0 |'

function utf16be(texto: string, bom: boolean): Buffer {
  const le = Buffer.from(texto, 'utf16le')
  const be = Buffer.from(le).swap16()
  return bom ? Buffer.concat([Buffer.from([0xfe, 0xff]), be]) : be
}

const VARIANTES: [string, Buffer, string][] = [
  ['UTF-8', Buffer.from(REGISTRO, 'utf8'), 'UTF-8'],
  ['UTF-8 com BOM', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(REGISTRO, 'utf8')]), 'UTF-8 (com BOM)'],
  ['UTF-8 com CRLF (Prompt de Comando)', Buffer.from(REGISTRO.replace(/\n/g, '\r\n'), 'utf8'), 'UTF-8'],
  ['UTF-16 LE com BOM e CRLF (PowerShell 5 com ">")', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(REGISTRO.replace(/\n/g, '\r\n'), 'utf16le')]), 'UTF-16 LE (com BOM)'],
  ['UTF-16 LE sem BOM', Buffer.from(REGISTRO, 'utf16le'), 'UTF-16 LE (sem BOM)'],
  ['UTF-16 BE com BOM', utf16be(REGISTRO, true), 'UTF-16 BE (com BOM)'],
  ['UTF-16 BE sem BOM', utf16be(REGISTRO, false), 'UTF-16 BE (sem BOM)'],
]

function analisar(nome: string, conteudo: Buffer): string {
  const arq = join(pasta, `${nome.replace(/[^a-z0-9]+/gi, '-')}.txt`)
  writeFileSync(arq, conteudo)
  return execFileSync('node', [ANALISADOR, arq, 'Teste'], { encoding: 'utf8' })
}

describe('analisador do logcat (testes em aparelhos físicos)', () => {
  for (const [nome, conteudo, codificacao] of VARIANTES) {
    it(`lê o registro em ${nome} com os mesmos resultados`, () => {
      const saida = analisar(nome, conteudo)
      expect(saida).toContain('# Teste: 2 abertura(s) do aplicativo')
      expect(saida).toContain(`Arquivo lido como ${codificacao}.`)
      expect(saida).toContain(LINHA_1)
      expect(saida).toContain(LINHA_2)
    })
  }

  it('o registro real do emulador dá a mesma tabela em UTF-8 e em UTF-16 (PowerShell)', () => {
    const real = join(process.cwd(), 'docs/relatorios/evidencias/android-diagnostico-central/logcat-epoch.txt')
    if (!existsSync(real)) return
    const texto = readFileSync(real, 'utf8')
    const tabela = (s: string) => s.split('\n').filter((l) => l.startsWith('|') || l.startsWith('# '))
    const utf8 = tabela(analisar('real-utf8', Buffer.from(texto, 'utf8')))
    const utf16 = tabela(analisar('real-utf16', Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(texto.replace(/\r?\n/g, '\r\n'), 'utf16le')])))
    expect(utf8.length).toBeGreaterThan(3)
    expect(utf8[0]).not.toContain(': 0 abertura')
    expect(utf16).toEqual(utf8)
  })
})
