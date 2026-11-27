import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { STORAGE_PREFIX } from '../services/storage/repositories'

/*
 * PRÉVIA DE DESENVOLVIMENTO (docs/relatorios/PREVIA_DESENVOLVIMENTO.md)
 * Regras que protegem o site oficial: o jogo do site e do aplicativo continua gravando no
 * prefixo de sempre; a prévia usa outro; o fluxo da prévia nunca publica no GitHub Pages deste
 * repositório nem no próprio repositório; o fluxo oficial continua publicando só a partir do main.
 */

const raiz = join(__dirname, '..', '..')
const ler = (p: string) => readFileSync(join(raiz, p), 'utf8')

describe('prévia de desenvolvimento', () => {
  it('o site e o aplicativo continuam gravando os dados no prefixo de sempre', () => {
    expect(STORAGE_PREFIX).toBe('bible-quest:v1:')
  })

  it('a versão de prévia usa outro prefixo, outro título e não é indexada', () => {
    expect(ler('src/services/storage/repositories.ts')).toContain("__PREVIA__ ? 'bible-quest-previa:v1:' : 'bible-quest:v1:'")
    const vite = ler('vite.config.ts')
    expect(vite).toContain("mode === 'previa'")
    expect(vite).toContain('Bible Quest — Prévia de desenvolvimento')
    expect(vite).toContain('noindex, nofollow')
    expect(JSON.parse(ler('package.json')).scripts['build:previa']).toBe('tsc -b && vite build --mode previa')
  })

  it('o fluxo da prévia não publica no GitHub Pages deste repositório nem no próprio repositório', () => {
    const f = ler('.github/workflows/previa.yml')
    expect(f).not.toMatch(/pages:\s*write/)
    expect(f).not.toMatch(/deploy-pages|upload-pages-artifact|configure-pages/)
    expect(f).toMatch(/permissions:\s*\n\s*contents: read/)
    expect(f).toContain('o repositório da prévia não pode ser o do site oficial')
    expect(f).toContain("branches: ['claude/bible-quest-android']")
    expect(f).toContain('secrets.PREVIA_DEPLOY_KEY')
  })

  it('o site oficial continua publicado só a partir do main', () => {
    const f = ler('.github/workflows/deploy.yml')
    expect(f).toContain("if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'")
    expect(f).toContain('npm run build\n')
    expect(f).not.toContain('build:previa')
  })
})
