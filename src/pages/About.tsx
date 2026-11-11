import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { PageHeader } from '../components/ui'
import { ART, commonsUrl } from '../data/images'
import { JOURNEYS } from '../data/journeys'
import { QUESTIONS, QUESTION_TYPE_LABEL } from '../data/questions'

export default function About() {
  return (
    <div className="container section stack-lg narrow">
      <PageHeader eyebrow="Sobre o jogo" title="Bible Quest">
        Uma jornada pelas Escrituras. Um jogo educativo da Kzann Tech para todas as idades.
      </PageHeader>

      <figure className="about-figure">
        <ArtImage art="moses-redsea" className="about-img" sizes="(min-width: 900px) 760px, 100vw" />
      </figure>

      <section className="stack">
        <h2>Como jogar</h2>
        <ol className="steps">
          <li>Escolha uma jornada no mapa. A primeira, A Criação do Mundo, já está liberada.</li>
          <li>Abra um capítulo e leia a introdução, o texto bíblico e o contexto histórico.</li>
          <li>Responda ao desafio: você tem 3 tentativas e precisa acertar ao menos 60% para concluir.</li>
          <li>Cada resposta traz uma explicação e a referência bíblica para você conferir.</li>
          <li>Ganhe XP e estrelas, suba de nível, mantenha sua sequência diária e libere novos capítulos.</li>
        </ol>
        <p>
          Esta versão traz {JOURNEYS.length} jornadas, {JOURNEYS.reduce((s, j) => s + j.chapters.length, 0)} capítulos e {QUESTIONS.length} perguntas
          nas modalidades: {Object.values(QUESTION_TYPE_LABEL).join(', ')}.
        </p>
      </section>

      <section className="stack">
        <h2>Conteúdo bíblico</h2>
        <p>
          Os trechos bíblicos são da <strong>Almeida Revista e Corrigida, edição de 1911</strong>, que está em domínio
          público, com ortografia atualizada. Usamos apenas trechos curtos, sempre com referência, e o conteúdo está em
          revisão contra a fonte. Traduções protegidas por direitos autorais não são reproduzidas.
        </p>
        <p>
          As introduções marcadas como <span className="tag tag-narrative">Narrativa dramatizada</span> são textos de
          ambientação da equipe: não são citações bíblicas e não atribuem falas aos personagens. Os textos de contexto
          histórico indicam quando datas e localizações são debatidas por estudiosos.
        </p>
      </section>

      <section className="stack" id="privacidade">
        <h2>Privacidade e segurança</h2>
        <ul className="bullets">
          <li><strong>Dados mínimos:</strong> só apelido, selo e faixa etária. Sem e-mail, telefone, foto ou localização.</li>
          <li><strong>Somente no dispositivo:</strong> tudo fica no armazenamento local do navegador e nada é enviado a servidores.</li>
          <li><strong>Controle:</strong> exporte ou apague seus dados a qualquer momento em Perfil (direitos previstos na LGPD).</li>
          <li><strong>Menores de idade:</strong> recomendamos o acompanhamento de um responsável. Na versão online, menores de 13 anos só poderão jogar em salas privadas, e o cadastro exigirá consentimento do responsável.</li>
          <li><strong>Sem chat aberto:</strong> o multiplayer usará apenas reações predefinidas, sem conversa livre entre desconhecidos.</li>
          <li><strong>Versão estática:</strong> o perfil local não é uma autenticação segura, e o módulo administrativo é apenas um protótipo.</li>
        </ul>
      </section>

      <section className="stack">
        <h2>Créditos das imagens</h2>
        <p className="muted">
          Pinturas e litografias em domínio público (artistas falecidos há mais de 100 anos), obtidas no Wikimedia
          Commons. Os arquivos foram redimensionados e convertidos para WebP.
        </p>
        <ul className="credits">
          {Object.values(ART).map((a) => (
            <li key={a.key}>
              <cite>{a.title}</cite> — {a.artist}, {a.year}.{' '}
              <a href={commonsUrl(a.commonsFile)} target="_blank" rel="noreferrer noopener">Fonte no Commons</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack">
        <h2>Kzann Tech</h2>
        <p>Bible Quest é desenvolvido pela Kzann Tech. Versão 0.1, a primeira versão pública para avaliação.</p>
        <p className="small">
          <Link to="/admin">Prévia do painel administrativo (protótipo, sem autenticação real)</Link>
        </p>
      </section>
    </div>
  )
}
