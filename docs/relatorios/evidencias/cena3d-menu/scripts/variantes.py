#!/usr/bin/env python3
"""Variantes de TESTE da cena 3D do menu (só na cópia temporária `wt`; nada vai para a branch).

V1 sem-perda:      dispose() sem forceContextLoss (o contexto some quando o coletor de lixo o recolher)
V2 sem-perda+comp: V1 + libera os recursos compartilhados do personagem (geometrias e texturas do GLB em
                   cache), o que tira os ouvintes que prendiam o renderizador antigo
V3 perda+comp:     forceContextLoss mantido + libera os compartilhados (só a retenção corrigida)
V4 persistente:    a cena não é destruída ao sair: o canvas sai da página, o laço para e, na volta,
                   a mesma cena é reanexada (sem recriar contexto, shaders nem texturas)
Uso: python3 variantes.py <variante> <pasta wt>
"""
import sys, pathlib
var, wt = sys.argv[1], pathlib.Path(sys.argv[2])
orig = pathlib.Path(__file__).with_name('acampamento-orig.ts').read_text()
cena_orig = pathlib.Path(__file__).with_name('Cena-orig.tsx').read_text()
s, c = orig, cena_orig

LIBERAR = """      if (rig) {
        scene.remove(rig.root)
        // VARIANTE: libera geometrias e texturas compartilhadas do personagem (GLB em cache);
        // o evento 'dispose' faz cada renderizador soltar os seus buffers e tirar o ouvinte
        rig.root.traverse((o) => {
          const mm = o as THREE.Mesh
          if (mm.geometry) mm.geometry.dispose()
          const ms = Array.isArray(mm.material) ? mm.material : mm.material ? [mm.material] : []
          for (const mt of ms) for (const val of Object.values(mt)) if (val instanceof THREE.Texture) val.dispose()
        })
        rig.dispose()
      }"""
ANTES = """      if (rig) {
        scene.remove(rig.root)
        rig.dispose()
      }
      scene.traverse"""

def sem_perda(x):
    a = "      renderer.dispose()\n      renderer.forceContextLoss()\n"
    assert a in x
    return x.replace(a, "      renderer.dispose()\n      // VARIANTE: sem forceContextLoss\n")

def comp(x):
    assert ANTES in x
    return x.replace(ANTES, LIBERAR + "\n      scene.traverse")

if var == 'V1':
    s = sem_perda(s)
elif var == 'V2':
    s = comp(sem_perda(s))
elif var == 'V3':
    s = comp(s)
elif var == 'V4':
    # createCamp: container e opções trocáveis; pausar() e reanexar()
    s = s.replace("export function createCamp(container: HTMLElement, appearance: CharacterAppearance, opts: CampOptions): CampHandle {",
                  "export function createCamp(container0: HTMLElement, appearance: CharacterAppearance, opts: CampOptions): CampHandle & { pausar(): void; reanexar(c: HTMLElement, rot: Map<AlvoAcampamento, HTMLElement>, sel: (a: AlvoAcampamento) => void, pronto?: () => void): void } {\n  let container = container0")
    a = "  return {\n    setAppearance,\n    gesto,\n    dispose() {"
    assert a in s
    s = s.replace(a, """  let pausada = false
  return {
    setAppearance,
    gesto,
    pausar() {
      // VARIANTE: sai da página sem destruir nada
      pausada = true
      renderer.setAnimationLoop(null)
      window.clearInterval(medidorRef.id)
      ro.disconnect()
      io.disconnect()
      canvas.remove()
    },
    reanexar(c, rot, sel, pronto) {
      container = c
      opts.rotulos = rot
      opts.onSelect = sel
      c.appendChild(canvas)
      ro.observe(c)
      io.observe(c)
      medidorRef.id = window.setInterval(() => { medirPersonagem(); medirInterface() }, 1000)
      pausada = false
      resize()
      ultimo = performance.now()
      laco()
      renderer.render(scene, camera)
      posicionarRotulos()
      if (rig) pronto?.()
    },
    dispose() {""")
    s = s.replace("  const medidor = window.setInterval(() => {\n    medirPersonagem()\n    medirInterface()\n  }, 1000)",
                  "  const medidorRef = { id: window.setInterval(() => {\n    medirPersonagem()\n    medirInterface()\n  }, 1000) }")
    s = s.replace("      window.clearInterval(medidor)\n", "      window.clearInterval(medidorRef.id)\n")
    s = s.replace("  const laco = () => renderer.setAnimationLoop(!disposed && visivel && document.visibilityState !== 'hidden' ? tick : null)",
                  "  const laco = () => renderer.setAnimationLoop(!disposed && !pausada && visivel && document.visibilityState !== 'hidden' ? tick : null)")
    s = s.replace("  let visivel = true\n", "  let visivel = true\n  // eslint-disable-next-line prefer-const\n  let pausada = false\n", 1)
    s = s.replace("  let pausada = false\n  return {", "  return {")
    # componente: guarda a cena num cache de módulo e reanexa
    a = """    let cancelado = false
    const el = palco.current
    import('../../character3d/acampamento')"""
    assert a in c
    c = c.replace(a, """    let cancelado = false
    const el = palco.current
    const chaveCena = `${quality}|${reduced}|${chaveElementos}|${bauPronto}`
    if (cenaGuardada && cenaGuardada.chave === chaveCena) {
      // VARIANTE: reaproveita a cena
      handle.current = cenaGuardada.handle
      cenaGuardada.handle.reanexar(el, els.current, (a) => selecionar.current(a), () => setEstado('pronto'))
      cenaGuardada.handle.setAppearance(ultima.current)
      return () => {
        cancelado = true
        handle.current?.pausar()
        handle.current = null
      }
    }
    if (cenaGuardada) { cenaGuardada.handle.dispose(); cenaGuardada = null }
    import('../../character3d/acampamento')""")
    c = c.replace("""        handle.current = createCamp(el, ultima.current, {""", """        handle.current = createCamp(el, ultima.current, {""")
    a = """      .catch((e) => {
        console.warn('Cena 3D do acampamento indisponível; usando o cenário 2D.', e)"""
    c = c.replace("""          onReady: () => !cancelado && setEstado('pronto'),
        })
      })""", """          onReady: () => !cancelado && setEstado('pronto'),
        })
        cenaGuardada = { chave: chaveCena, handle: handle.current }
      })""")
    c = c.replace("""    return () => {
      cancelado = true
      handle.current?.dispose()
      handle.current = null
    }
  }, [quality, reduced, chaveElementos, bauPronto])""", """    return () => {
      cancelado = true
      handle.current?.pausar()
      handle.current = null
    }
  }, [quality, reduced, chaveElementos, bauPronto])""")
    c = c.replace("type Estado = 'carregando' | 'pronto' | '2d'", "type Estado = 'carregando' | 'pronto' | '2d'\n// VARIANTE: cena guardada entre visitas\ntype Guardada = ReturnType<typeof import('../../character3d/acampamento').createCamp>\nlet cenaGuardada: { chave: string; handle: Guardada } | null = null")
    c = c.replace("const handle = useRef<CampHandle | null>(null)", "const handle = useRef<Guardada | null>(null)")
    c = c.replace("import type { AlvoAcampamento, CampHandle } from '../../character3d/acampamento'", "import type { AlvoAcampamento } from '../../character3d/acampamento'")
else:
    raise SystemExit('variante desconhecida')
(wt / 'src/character3d/acampamento.ts').write_text(s)
(wt / 'src/components/camp/CenaAcampamento.tsx').write_text(c)
print('variante', var, 'aplicada')
