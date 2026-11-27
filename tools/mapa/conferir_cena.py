"""
CONFERÊNCIA DE CENAS DOS MAPAS (ferramenta permanente da expansão de Gênesis e do Quiz)

Para provar que uma mudança no código de uma região (ou na base comum, comum.py) não mudou a
pintura, compara-se a CENA que gera a imagem, e não só a imagem: o Cycles não repete o mesmo
render bit a bit (algumas dezenas de pixels variam alguns níveis a cada render, mesmo sem mudança).

Três modos:

1) impressao (roda dentro do Blender): monta a cena de um script de região SEM renderizar e grava
   tudo o que define a imagem, com os valores brutos:
   - objetos: tipo, dados, pai, coleções, posição, rotação, escala, visibilidade, materiais, modificadores;
   - malhas: contagens, materiais e, em arquivo .npz ao lado, vértices, faces, materiais e
     suavização das faces e cores por vértice (para medir a diferença exata);
   - materiais, céu e compositor: nós, valores das entradas, propriedades, rampas de cor e ligações;
   - câmeras e luzes: todas as propriedades; render, Cycles, cores, formato e passes.
   Uso:
     blender -b -P tools/mapa/conferir_cena.py -- impressao <script_da_regiao.py> <saida> \
         [--args "<pasta> 1080 96"] [--depois <arquivo.py>:<função>]
   Grava <saida>.json e <saida>.npz. `--depois` roda uma função sobre a cena montada (usado na
   validação da ferramenta, para introduzir mudanças de propósito).

2) comparar (Python comum, com NumPy): compara duas impressões e classifica cada diferença:
   - ESTRUTURAL: algo foi criado ou removido (objeto, malha, material, nó, ligação, vértice, face);
   - VALOR: mudou um valor não numérico (tipo, opção, texto, verdadeiro/falso, material de um objeto);
   - NUMÉRICA RELEVANTE: um número mudou mais que a tolerância;
   - VARIAÇÃO PEQUENA: um número mudou, mas dentro da tolerância (arredondamento de ponto flutuante).
   Uso:
     python3 tools/mapa/conferir_cena.py comparar <ref.json> <nova.json> [--tol 1e-5] [--relatorio r.md]
   Saída 0: idêntica ou só variações pequenas; 1: há diferenças estruturais, de valor ou relevantes.

3) pixels (Python comum, com NumPy e Pillow): compara dois renders e separa ruído do Cycles de
   mudança real. Ruído: poucos pixels, espalhados, com diferença baixa. Mudança real: muitos pixels,
   diferença alta ou pixels diferentes agrupados num pedaço da imagem.
   Uso:
     python3 tools/mapa/conferir_cena.py pixels <ref.png> <novo.png> [--mapa diferencas.png]
         [--ruido-max 12] [--ruido-pct 0.006] [--bloco 32] [--bloco-max 20]
   Saída 0: idênticas ou só ruído; 1: mudança real.

Os limites padrão vêm da medição do Éden (10 pares de renders da mesma cena, 1080 × 2257, 96
amostras): no pior caso, 52 pixels diferentes de 2,4 milhões (0,0021%), diferença máxima 8 de 255
e 7 pixels diferentes num mesmo bloco de 32 px. Os padrões dão margem de 1,5 a 3 vezes sobre isso
(12 de diferença, 0,006% dos pixels, 20 por bloco). Para outra resolução ou número de amostras,
meça o ruído de novo (dois renders da mesma cena) e ajuste as opções.
Dependências: as que o projeto já usa nos mapas (Blender e NumPy; Pillow só no modo pixels).
"""
import hashlib
import json
import math
import os
import sys

import numpy as np

# ------------------------------------------------------------------ impressão digital (Blender)
# propriedades que não mudam a imagem (interface, identificação interna ou caminhos temporários)
IGNORAR = {
    'rna_type', 'name_full', 'session_uid', 'is_evaluated', 'original', 'users', 'use_fake_user', 'use_extra_user',
    'is_embedded_data', 'is_missing', 'is_runtime_data', 'tag', 'is_library_indirect', 'library', 'library_weak_reference',
    'override_library', 'preview', 'asset_data', 'id_type', 'is_editmode', 'select', 'location_ui', 'width', 'height',
    'dimensions', 'width_hidden', 'show_options', 'show_preview', 'show_texture', 'hide', 'use_custom_color', 'color_tag',
    'label', 'parent', 'internal_links', 'bl_idname', 'bl_label', 'bl_description', 'bl_icon', 'bl_static_type',
    'bl_width_default', 'bl_width_min', 'bl_width_max', 'bl_height_default', 'bl_height_min', 'bl_height_max',
    'warning_propagation', 'is_active_output', 'filepath', 'frame_path', 'stamp_note_text', 'views', 'stereo_views',
    'cycles_curves', 'debug_value', 'is_dirty', 'is_grease_pencil', 'texture_slots', 'animation_data',
}


def _serial(v, prof):
    """Valor bruto de uma propriedade do Blender: números, listas, textos, opções e estruturas aninhadas."""
    import bpy
    if isinstance(v, (bool, int, float, str)) or v is None:
        return v
    if isinstance(v, bpy.types.ID):
        return {'@id': v.name}
    if isinstance(v, bpy.types.bpy_struct):
        return _props(v, prof - 1) if prof > 0 else {'@struct': v.bl_rna.identifier}
    try:
        seq = list(v)
    except TypeError:
        return str(v)
    if all(isinstance(x, (bool, int, float)) for x in seq):
        return [x if isinstance(x, (bool, int)) else float(x) for x in seq]
    if all(isinstance(x, str) for x in seq):
        return sorted(seq) if isinstance(v, set) else seq
    if seq and all(hasattr(x, '__len__') for x in seq):
        try:
            return [[float(y) for y in x] for x in seq]  # matrizes
        except (TypeError, ValueError):
            pass
    return str(type(v).__name__)


def _props(st, prof=2):
    out = {}
    for p in st.bl_rna.properties:
        k = p.identifier
        if k in IGNORAR or p.type == 'COLLECTION':
            continue
        try:
            v = getattr(st, k)
        except Exception:
            continue
        if p.type == 'POINTER' and v is not None and not hasattr(v, 'bl_rna'):
            continue
        out[k] = _serial(v, prof)
    return out


def _arvore(tree):
    if tree is None:
        return None
    nos = {}
    for n in tree.nodes:
        d = {'tipo': n.bl_idname, 'props': _props(n, 1),
             'entradas': {f'{i}:{s.identifier}': _serial(getattr(s, 'default_value', None), 1) for i, s in enumerate(n.inputs)}}
        if getattr(n, 'color_ramp', None) is not None:
            d['rampa'] = {'interpolacao': n.color_ramp.interpolation,
                          'pontos': [[float(e.position), [float(c) for c in e.color]] for e in n.color_ramp.elements]}
        nos[n.name] = d
    links = sorted(f'{l.from_node.name}.{l.from_socket.identifier} -> {l.to_node.name}.{l.to_socket.identifier}' for l in tree.links)
    return {'nos': nos, 'ligacoes': links}


def _malha(me, arrays):
    v = np.empty(len(me.vertices) * 3, np.float32)
    me.vertices.foreach_get('co', v)
    tam = np.empty(len(me.polygons), np.int32)
    me.polygons.foreach_get('loop_total', tam)
    loops = np.empty(len(me.loops), np.int32)
    me.loops.foreach_get('vertex_index', loops)
    mi = np.empty(len(me.polygons), np.int32)
    me.polygons.foreach_get('material_index', mi)
    sm = np.empty(len(me.polygons), np.int8)
    me.polygons.foreach_get('use_smooth', sm)
    arrays[f'{me.name}|v'] = v.reshape(-1, 3)
    arrays[f'{me.name}|f'] = np.concatenate([tam, loops])
    arrays[f'{me.name}|mi'] = mi
    arrays[f'{me.name}|sm'] = sm
    cores = []
    for ca in me.color_attributes:
        c = np.empty(len(ca.data) * 4, np.float32)
        ca.data.foreach_get('color', c)
        arrays[f'{me.name}|cor:{ca.name}'] = c
        cores.append(ca.name)
    return {'vertices': len(me.vertices), 'arestas': len(me.edges), 'faces': len(me.polygons), 'cores': cores,
            'materiais': [m.name if m else None for m in me.materials],
            'hash_vertices': hashlib.sha256(v.tobytes()).hexdigest()[:16]}


def impressao():
    import runpy
    import bpy

    args = sys.argv[sys.argv.index('--') + 1:]
    script, saida = os.path.abspath(args[1]), os.path.abspath(args[2])
    extra = args[3:]
    args_script = extra[extra.index('--args') + 1].split() if '--args' in extra else [os.path.join(os.path.dirname(saida), '_tmp_impressao'), '1080', '96']
    depois = extra[extra.index('--depois') + 1] if '--depois' in extra else None

    # monta a cena sem renderizar: bpy.ops.render.render vira uma operação vazia (o resto de bpy.ops segue igual)
    class _Render:
        def __init__(self, orig):
            self._orig = orig

        def __getattr__(self, k):
            return (lambda *a, **kw: {'FINISHED'}) if k == 'render' else getattr(self._orig, k)

    class _Ops:
        def __init__(self, orig):
            self._orig = orig

        def __getattr__(self, k):
            return _Render(getattr(self._orig, k)) if k == 'render' else getattr(self._orig, k)

    ops_orig = bpy.ops
    bpy.ops = _Ops(ops_orig)
    sys.argv = [sys.argv[0], '--', *args_script]
    try:
        runpy.run_path(script, run_name='__main__')
        if depois:
            arq, fn = depois.rsplit(':', 1)
            runpy.run_path(os.path.abspath(arq))[fn](bpy.context.scene)
    finally:
        bpy.ops = ops_orig

    sc = bpy.context.scene
    bpy.context.view_layer.update()
    arrays = {}
    info = {'formato': 'conferir_cena/1', 'script': os.path.basename(script), 'blender': bpy.app.version_string}
    info['objetos'] = {}
    for ob in sc.objects:
        info['objetos'][ob.name] = {
            'tipo': ob.type, 'dados': ob.data.name if ob.data else None, 'pai': ob.parent.name if ob.parent else None,
            'colecoes': sorted(c.name for c in ob.users_collection),
            'posicao': list(ob.location), 'rotacao': list(ob.rotation_euler), 'modo_rotacao': ob.rotation_mode, 'escala': list(ob.scale),
            'oculto_render': ob.hide_render, 'visivel': ob.visible_get(),
            'materiais': [s.material.name if s.material else None for s in ob.material_slots],
            'modificadores': {m.name: {'tipo': m.type, 'props': _props(m, 0)} for m in ob.modifiers},
        }
    info['malhas'] = {me.name: _malha(me, arrays) for me in bpy.data.meshes if me.users}
    info['materiais'] = {m.name: {'props': _props(m, 0), 'nos': _arvore(m.node_tree)} for m in bpy.data.materials if m.users}
    info['cameras'] = {c.name: _props(c, 1) for c in bpy.data.cameras if c.users}
    info['luzes'] = {l.name: {'props': _props(l, 1), 'nos': _arvore(l.node_tree) if l.use_nodes else None} for l in bpy.data.lights if l.users}
    w = sc.world
    info['mundo'] = {'nome': w.name, 'props': _props(w, 0), 'nos': _arvore(w.node_tree)} if w else None
    info['camera_ativa'] = sc.camera.name if sc.camera else None
    info['render'] = {'render': _props(sc.render, 1), 'cycles': _props(sc.cycles, 0), 'cores': _props(sc.view_settings, 1),
                      'tela': _props(sc.display_settings, 0), 'camadas': {vl.name: _props(vl, 0) for vl in sc.view_layers},
                      'arquivo_saida': os.path.basename(sc.render.filepath), 'quadro': sc.frame_current}
    info['compositor'] = {'usa': sc.use_nodes, 'nos': _arvore(sc.node_tree) if sc.use_nodes else None}
    info['colecoes'] = {c.name: {'oculta_render': c.hide_render, 'objetos': len(c.objects), 'filhas': sorted(x.name for x in c.children)} for c in bpy.data.collections}

    json.dump(info, open(saida + '.json', 'w'), indent=1, sort_keys=True, allow_nan=True)
    np.savez_compressed(saida + '.npz', **arrays)
    print(f'IMPRESSAO OK {saida}.json: {len(info["objetos"])} objetos, {len(info["malhas"])} malhas, '
          f'{len(info["materiais"])} materiais, {len(info["luzes"])} luzes, {len(info["cameras"])} câmeras')


# ------------------------------------------------------------------ comparação de impressões
CATEGORIAS = ('estrutural', 'valor', 'numerica', 'pequena')
NOMES = {'estrutural': 'Diferença estrutural', 'valor': 'Diferença de valor', 'numerica': 'Diferença numérica relevante',
         'pequena': 'Variação numérica pequena (dentro da tolerância)'}


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def _diff(a, b, caminho, tol, saida):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            c = f'{caminho}/{k}'
            if k not in a:
                saida.append(('estrutural', c, 'ausente', 'criado'))
            elif k not in b:
                saida.append(('estrutural', c, 'existia', 'removido'))
            else:
                _diff(a[k], b[k], c, tol, saida)
        return
    if isinstance(a, list) and isinstance(b, list):
        if caminho.endswith('ligacoes'):
            for x in sorted(set(a) - set(b)):
                saida.append(('estrutural', caminho, x, 'removida'))
            for x in sorted(set(b) - set(a)):
                saida.append(('estrutural', caminho, 'ausente', x))
            return
        if len(a) != len(b):
            cat = 'estrutural' if caminho.endswith(('ligacoes', 'colecoes', 'materiais', 'filhas', 'pontos', 'cores')) else 'valor'
            saida.append((cat, caminho, f'{len(a)} itens', f'{len(b)} itens'))
            return
        for i, (x, y) in enumerate(zip(a, b)):
            _diff(x, y, f'{caminho}[{i}]', tol, saida)
        return
    if _num(a) and _num(b):
        if a == b or (isinstance(a, float) and isinstance(b, float) and math.isnan(a) and math.isnan(b)):
            return
        d = abs(a - b)
        saida.append(('pequena' if d <= tol * max(1.0, abs(a), abs(b)) else 'numerica', caminho, a, b))
        return
    if a != b:
        saida.append(('valor', caminho, a, b))


def _diff_arrays(ref_npz, nov_npz, malhas_comuns, tol, saida):
    for nome in sorted(malhas_comuns):
        for parte in ('v', 'f', 'mi', 'sm'):
            k = f'{nome}|{parte}'
            if k not in ref_npz or k not in nov_npz:
                continue
            a, b = ref_npz[k], nov_npz[k]
            c = f'/malhas/{nome}/{dict(v="vertices", f="faces", mi="material_das_faces", sm="suavizacao")[parte]}'
            if a.shape != b.shape:
                saida.append(('estrutural', c, f'{a.shape}', f'{b.shape}'))
            elif parte == 'v':
                if not np.array_equal(a, b):
                    m = float(np.abs(a.astype(np.float64) - b).max())
                    escala = max(1.0, float(np.abs(a).max()))
                    n = int((np.abs(a.astype(np.float64) - b) > 0).any(axis=1).sum())
                    saida.append(('pequena' if m <= tol * escala else 'numerica', c, f'{n} vértices mudaram', f'máx. {m:.3g}'))
            elif not np.array_equal(a, b):
                saida.append(('estrutural' if parte == 'f' else 'valor', c, 'diferente', f'{int((a != b).sum())} itens'))
        for k in sorted(x for x in ref_npz.files if x.startswith(f'{nome}|cor:')):
            if k in nov_npz.files:
                a, b = ref_npz[k], nov_npz[k]
                c = f'/malhas/{nome}/{k.split("|", 1)[1]}'
                if a.shape != b.shape:
                    saida.append(('estrutural', c, f'{a.shape}', f'{b.shape}'))
                elif not np.array_equal(a, b):
                    m = float(np.abs(a.astype(np.float64) - b).max())
                    saida.append(('pequena' if m <= tol else 'numerica', c, 'cores por vértice', f'máx. {m:.3g}'))


def comparar(ref, nov, tol=1e-5):
    A, B = json.load(open(ref)), json.load(open(nov))
    saida = []
    for parte in ('formato', 'blender'):  # o nome do script é só informação (não muda a cena)
        if A.get(parte) != B.get(parte):
            saida.append(('valor' if parte != 'formato' else 'estrutural', f'/{parte}', A.get(parte), B.get(parte)))
    ra, rb = ref[:-5] + '.npz', nov[:-5] + '.npz'
    arrays = os.path.exists(ra) and os.path.exists(rb)
    if arrays:  # com os .npz, os vértices são comparados um a um (o hash seria repetição)
        for X in (A, B):
            for m in (X.get('malhas') or {}).values():
                m.pop('hash_vertices', None)
    for secao in ('objetos', 'malhas', 'materiais', 'cameras', 'luzes', 'mundo', 'camera_ativa', 'render', 'compositor', 'colecoes'):
        _diff(A.get(secao), B.get(secao), f'/{secao}', tol, saida)
    if arrays:
        with np.load(ra) as za, np.load(rb) as zb:
            _diff_arrays(za, zb, set(A['malhas']) & set(B['malhas']), tol, saida)
    else:
        saida.append(('valor', '/malhas', 'sem .npz', 'comparadas só por contagem e hash dos vértices'))
    resumo = {
        'referencia': os.path.basename(ref), 'nova': os.path.basename(nov), 'tolerancia': tol, 'arrays_comparados': arrays,
        'script_ref': A.get('script'), 'script_nova': B.get('script'), 'blender': A.get('blender'),
        'contagens_ref': {k: len(A.get(k) or {}) for k in ('objetos', 'malhas', 'materiais', 'cameras', 'luzes')},
        'contagens_nova': {k: len(B.get(k) or {}) for k in ('objetos', 'malhas', 'materiais', 'cameras', 'luzes')},
        'por_categoria': {c: sum(1 for d in saida if d[0] == c) for c in CATEGORIAS},
    }
    return resumo, saida


def _secao(caminho):
    return caminho.split('/')[1]


def relatorio_md(resumo, difs, limite=40):
    pc = resumo['por_categoria']
    bloqueia = pc['estrutural'] + pc['valor'] + pc['numerica']
    veredito = ('IDÊNTICAS' if not difs else 'EQUIVALENTES (só variações numéricas pequenas)' if not bloqueia else 'DIFERENTES')
    L = [f'# Conferência de cena: {resumo["referencia"]} × {resumo["nova"]}', '',
         f'**Veredito: {veredito}**', '',
         f'Scripts: `{resumo["script_ref"]}` × `{resumo["script_nova"]}` (Blender {resumo["blender"]}).', '',
         f'Tolerância numérica: {resumo["tolerancia"]:g} (relativa, para valores acima de 1). Vértices e cores comparados um a um: {"sim" if resumo["arrays_comparados"] else "não"}.', '',
         '| | Objetos | Malhas | Materiais | Câmeras | Luzes |', '|---|---|---|---|---|---|',
         '| Referência | ' + ' | '.join(str(resumo['contagens_ref'][k]) for k in ('objetos', 'malhas', 'materiais', 'cameras', 'luzes')) + ' |',
         '| Nova | ' + ' | '.join(str(resumo['contagens_nova'][k]) for k in ('objetos', 'malhas', 'materiais', 'cameras', 'luzes')) + ' |', '',
         '| Categoria | Quantidade |', '|---|---|']
    L += [f'| {NOMES[c]} | {pc[c]} |' for c in CATEGORIAS]
    secs = sorted({_secao(d[1]) for d in difs})
    if secs:
        L += ['', '| Seção | Estrutural | Valor | Numérica relevante | Pequena |', '|---|---|---|---|---|']
        for s in secs:
            L.append(f'| {s} | ' + ' | '.join(str(sum(1 for d in difs if d[0] == c and _secao(d[1]) == s)) for c in CATEGORIAS) + ' |')
    for c in CATEGORIAS:
        itens = [d for d in difs if d[0] == c]
        if not itens:
            continue
        L += ['', f'## {NOMES[c]} ({len(itens)})', '', '| Onde | Referência | Nova | Δ |', '|---|---|---|---|']
        for _, cam, a, b in itens[:limite]:
            fa, fb = (f'{x:.9g}' if _num(x) else str(x)[:80] for x in (a, b))
            dd = f'{b - a:+.3g}' if _num(a) and _num(b) else ''
            L.append(f'| `{cam}` | {fa} | {fb} | {dd} |')
        if len(itens) > limite:
            L.append(f'| … mais {len(itens) - limite} | | | |')
    return '\n'.join(L) + '\n', (1 if bloqueia else 0)


# ------------------------------------------------------------------ comparação de renders
def pixels(ref, nov, ruido_max=12, ruido_pct=0.006, bloco=32, bloco_max=20, mapa=None):
    from PIL import Image
    a = np.asarray(Image.open(ref).convert('RGB')).astype(np.int16)
    b = np.asarray(Image.open(nov).convert('RGB')).astype(np.int16)
    if a.shape != b.shape:
        return {'veredito': 'MUDANÇA REAL', 'motivo': f'tamanhos diferentes {a.shape[1]}×{a.shape[0]} e {b.shape[1]}×{b.shape[0]}'}, 1
    m = np.abs(a - b).max(axis=2)
    dif = m > 0
    h, w = m.shape
    hb, wb = math.ceil(h / bloco), math.ceil(w / bloco)
    pad = np.zeros((hb * bloco, wb * bloco), bool)
    pad[:h, :w] = dif
    por_bloco = pad.reshape(hb, bloco, wb, bloco).sum(axis=(1, 3))
    r = {'tamanho': f'{w}×{h}', 'pixels_diferentes': int(dif.sum()), 'total': int(m.size),
         'pct': round(100 * float(dif.mean()), 5), 'diferenca_max': int(m.max()), 'diferenca_media_nos_diferentes': round(float(m[dif].mean()), 2) if dif.any() else 0,
         'pior_bloco': int(por_bloco.max()), 'bloco': bloco, 'limites': {'ruido_max': ruido_max, 'ruido_pct': ruido_pct, 'bloco_max': bloco_max}}
    motivos = []
    if r['diferenca_max'] > ruido_max:
        motivos.append(f'diferença máxima {r["diferenca_max"]} > {ruido_max}')
    if r['pct'] > ruido_pct:
        motivos.append(f'{r["pct"]}% dos pixels > {ruido_pct}%')
    if r['pior_bloco'] > bloco_max:
        motivos.append(f'{r["pior_bloco"]} pixels diferentes num bloco de {bloco} px > {bloco_max} (mudança agrupada)')
    r['veredito'] = 'IDÊNTICAS' if not dif.any() else ('RUÍDO DO CYCLES' if not motivos else 'MUDANÇA REAL')
    r['motivo'] = '; '.join(motivos) or ('nenhum pixel diferente' if not dif.any() else 'poucos pixels, espalhados, diferença baixa')
    if mapa:
        base = (np.asarray(Image.open(ref).convert('L')).astype(np.float32) * 0.35 + 165).astype(np.uint8)
        img = np.stack([base] * 3, axis=2)
        ys, xs = np.nonzero(dif)
        for y, x in zip(ys, xs):
            img[max(0, y - 5):y + 6, max(0, x - 5):x + 6] = (200, 40, 30)
        Image.fromarray(img).save(mapa)
    return r, (0 if r['veredito'] != 'MUDANÇA REAL' else 1)


# ------------------------------------------------------------------ linha de comando
def _opc(args, nome, padrao, tipo=str):
    return tipo(args[args.index(nome) + 1]) if nome in args else padrao


def main():
    if '--' in sys.argv and 'impressao' in sys.argv[sys.argv.index('--') + 1:sys.argv.index('--') + 2]:
        impressao()
        return
    args = sys.argv[1:]
    if not args or args[0] not in ('comparar', 'pixels'):
        print(__doc__)
        sys.exit(2)
    if args[0] == 'comparar':
        resumo, difs = comparar(args[1], args[2], _opc(args, '--tol', 1e-5, float))
        md, cod = relatorio_md(resumo, difs, _opc(args, '--limite', 40, int))
        if '--relatorio' in args:
            open(_opc(args, '--relatorio', ''), 'w').write(md)
        print(md)
        sys.exit(cod)
    r, cod = pixels(args[1], args[2], _opc(args, '--ruido-max', 12, int), _opc(args, '--ruido-pct', 0.006, float),
                    _opc(args, '--bloco', 32, int), _opc(args, '--bloco-max', 20, int), _opc(args, '--mapa', None))
    print(json.dumps(r, ensure_ascii=False, indent=1))
    sys.exit(cod)


if __name__ == '__main__':
    main()
