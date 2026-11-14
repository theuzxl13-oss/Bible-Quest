import { Link } from 'react-router-dom'
import { ArtImage } from '../components/ArtImage'
import { PageHeader } from '../components/ui'
import { ART, commonsUrl } from '../data/images'
import { STORY_SEQUENCE } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
import { PRACTICE_DAILY_CAP } from '../services/game/scoring'
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
        <h3>Modo História</h3>
        <ol className="steps">
          <li>Abra o mapa da jornada. Ela começa em Gênesis e segue a ordem dos 66 livros até Apocalipse.</li>
          <li>Cada experiência tem 7 etapas: introdução, narrativa, referências bíblicas, aprendizado, desafio, resultado e recompensa.</li>
          <li>No desafio você tem 3 tentativas e precisa acertar ao menos 60% para concluir e liberar a próxima experiência.</li>
          <li>Experiências concluídas podem ser revisitadas a qualquer momento, sem perder o progresso.</li>
        </ol>
        <h3>Modo Quiz</h3>
        <p>Escolha qualquer modalidade, quando quiser: {FREE_MODES.map((m) => m.title).join(', ')}. Há também o desafio diário e salas multiplayer em demonstração.</p>
        <h3>Evolução compartilhada</h3>
        <p>
          XP, níveis, medalhas, conquistas, histórico e sequência diária são os mesmos nos dois modos. Para evitar
          acúmulo infinito: repetir uma experiência concluída só rende XP se você superar sua melhor pontuação; o Modo
          Livre tem um limite de {PRACTICE_DAILY_CAP} XP por dia; e a recompensa do desafio diário vale uma vez por dia.
        </p>
        <p>
          Hoje estão disponíveis {STORY_SEQUENCE.length} experiências (Gênesis e Êxodo) e {QUESTIONS.length} perguntas
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
        <p>Bible Quest é desenvolvido pela Kzann Tech. Versão 0.3: a aventura, com personagem, mapa de fases e Biblioteca Bíblica.</p>
        <p className="small">
          <Link to="/admin">Prévia do painel administrativo (protótipo, sem autenticação real)</Link>
        </p>
      </section>
    </div>
  )
}
