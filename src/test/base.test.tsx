import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Abas, Aviso, Botao, BotaoLink, Cabecalho, Campo, Cartao, Janela, MensagemRapida, Painel, Progresso, TituloSecao, Voltar } from '../components/base'

/*
 * Componentes base da Fase 1 da Etapa 2 (0.17.5): estrutura, teclado e
 * nomes acessíveis. Eles ainda não são usados pelas telas.
 */

const comRotas = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('componentes base (bq-*)', () => {
  it('Botão: papel, tamanho, carregando e desativado', async () => {
    const clique = vi.fn()
    const { rerender } = comRotas(<Botao variante="secundario" tamanho="pequeno" onClick={clique}>Salvar</Botao>)
    const b = screen.getByRole('button', { name: 'Salvar' })
    expect(b).toHaveClass('bq-botao', 'bq-botao--secundario', 'bq-botao--pequeno')
    expect(b).toHaveAttribute('type', 'button')
    await userEvent.click(b)
    expect(clique).toHaveBeenCalledTimes(1)
    rerender(<MemoryRouter><Botao carregando onClick={clique}>Salvar</Botao></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveAttribute('aria-busy', 'true')
  })

  it('BotaoLink e Voltar são links com nome', () => {
    comRotas(<><BotaoLink to="/historia" icone="map">Abrir o mapa</BotaoLink><Voltar to="/biblioteca">Biblioteca</Voltar></>)
    expect(screen.getByRole('link', { name: 'Abrir o mapa' })).toHaveAttribute('href', '/historia')
    expect(screen.getByRole('link', { name: 'Biblioteca' })).toHaveClass('bq-voltar')
  })

  it('Painel e Cabeçalho têm títulos na hierarquia certa', () => {
    comRotas(<><Cabecalho sobretitulo="Biblioteca" titulo="Personagens">Fichas da jornada</Cabecalho><Painel titulo="Resumo">texto</Painel><TituloSecao>Seção</TituloSecao></>)
    expect(screen.getByRole('heading', { level: 1, name: 'Personagens' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Resumo' })).toHaveClass('bq-painel--leitura')
    expect(screen.getByRole('heading', { level: 2, name: 'Seção' })).toHaveClass('bq-titulo-secao')
  })

  it('Cartão bloqueado diz o estado em texto (não só pela cor) e não navega', () => {
    comRotas(<><Cartao titulo="Abel" estado="bloqueado" dica="aparece na fase 5" to="/biblioteca/personagem/abel" /><Cartao titulo="Adão" estado="concluido" to="/biblioteca/personagem/adao" /></>)
    expect(screen.getByText(/Bloqueado · aparece na fase 5/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /abel/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /adão/i })).toHaveTextContent('Concluído')
  })

  it('Janela: foco entra, fica preso, Esc fecha e o foco volta para quem abriu', async () => {
    const user = userEvent.setup()
    function Teste() {
      const [aberta, setAberta] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setAberta(true)}>Abrir</button>
          <Janela titulo="Fase 4" aberta={aberta} onFechar={() => setAberta(false)} acoes={<Botao>Começar</Botao>}>
            <p>Descrição</p>
          </Janela>
        </>
      )
    }
    comRotas(<Teste />)
    const abrir = screen.getByRole('button', { name: 'Abrir' })
    await user.click(abrir)
    const dialogo = screen.getByRole('dialog', { name: 'Fase 4' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    expect(within(dialogo).getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await user.tab()
    expect(within(dialogo).getByRole('button', { name: 'Começar' })).toHaveFocus()
    await user.tab() // volta ao primeiro: foco preso
    expect(within(dialogo).getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(abrir).toHaveFocus()
  })

  it('Aviso tem papel de nota e título', () => {
    comRotas(<Aviso tom="alerta" titulo="Atenção">Mensagem</Aviso>)
    const nota = screen.getByRole('note')
    expect(nota).toHaveClass('bq-aviso--alerta')
    expect(within(nota).getByText('Atenção')).toHaveClass('bq-aviso__titulo')
  })

  it('Mensagem rápida é anunciada e some sozinha', () => {
    vi.useFakeTimers()
    const fim = vi.fn()
    comRotas(<MensagemRapida texto="Fase bloqueada" duracao={1000} onFim={fim} />)
    expect(screen.getByRole('status')).toHaveTextContent('Fase bloqueada')
    act(() => { vi.advanceTimersByTime(1000) })
    expect(fim).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('Campo liga rótulo, ajuda e erro ao campo', async () => {
    function Teste() {
      const [v, setV] = useState('')
      return <Campo rotulo="Apelido" valor={v} onMudar={setV} ajuda="De 2 a 20 caracteres" erro={v.length === 1 ? 'Muito curto' : undefined} />
    }
    comRotas(<Teste />)
    const campo = screen.getByRole('textbox', { name: 'Apelido' })
    expect(campo).toHaveAccessibleDescription('De 2 a 20 caracteres')
    await userEvent.type(campo, 'a')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Muito curto')
    expect(campo).toHaveAccessibleDescription('De 2 a 20 caracteres Muito curto')
  })

  it('Progresso informa valor e limite', () => {
    comRotas(<Progresso valor={3} max={20} rotulo="Fases concluídas" mostrarTexto />)
    const barra = screen.getByRole('progressbar', { name: 'Fases concluídas' })
    expect(barra).toHaveAttribute('aria-valuenow', '3')
    expect(barra).toHaveAttribute('aria-valuemax', '20')
  })

  it('Abas mudam com as setas, Home e End, e só a ativa entra no Tab', async () => {
    const user = userEvent.setup()
    function Teste() {
      const [a, setA] = useState('personagens')
      return (
        <Abas rotulo="Seções" ativa={a} onTrocar={setA} abas={[{ id: 'personagens', rotulo: 'Personagens' }, { id: 'livros', rotulo: 'Livros' }, { id: 'lugares', rotulo: 'Lugares' }]}>
          <p>Conteúdo de {a}</p>
        </Abas>
      )
    }
    comRotas(<Teste />)
    const lista = screen.getByRole('tablist', { name: 'Seções' })
    const abas = within(lista).getAllByRole('tab')
    expect(abas.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1'])
    abas[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Livros' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Livros' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Lugares' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Home}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo de personagens')
  })
})
