import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaJogo from '../../components/PaginaJogo'
import { useJogo } from '../../components/useJogo'
import { useEscalao } from '../../components/useProgresso'
import { sortearTipo } from '../../games/matematica/rodizio'
import musica from '../../assets/musica-matematica.m4a'
import fundo from '../../assets/matematica/fundo.webp'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import JogoContas from './JogoContas'
import JogoLogica from './JogoLogica'
import JogoQuantidades from './JogoQuantidades'

// Um jogo são 5 perguntas
const PERGUNTAS = 5

/**
 * As perguntas de UM jogo: cada uma é, ao calhas, uma conta na balança, um
 * padrão de lógica ou um quadro de quantidades (ver rodizio.js). Cada jogo dentro faz uma pergunta e
 * chama aoProxima(); aqui sorteia-se o jogo da pergunta seguinte.
 * (O key muda a cada pergunta: o jogo dela começa do zero.)
 */
function Perguntas({ escalao, jogo }) {
  // Os jogos que já saíram, por ordem; o último é o da pergunta atual
  const [saidos, setSaidos] = useState(() => [sortearTipo()])
  const tipo = saidos.at(-1)
  const proxima = () => setSaidos((s) => [...s, sortearTipo(s)])
  const props = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar, aoProxima: proxima }
  const chave = `${tipo}-${saidos.length}`

  if (tipo === 'logica') return <JogoLogica key={chave} escalao={escalao} {...props} />
  if (tipo === 'quantidades') return <JogoQuantidades key={chave} escalao={escalao} {...props} />
  if (escalao === '3-4') return <Jogo34 key={chave} {...props} />
  // 5–6 e 7–8: o mesmo jogo de contas (as regras de cada idade estão em contas.js)
  return <JogoContas key={chave} escalao={escalao} {...props} />
}

/**
 * Página do jogo "Matemática e Lógica": contas na balança, padrões de
 * lógica e quadros de quantidades, misturados ao calhas. O nível vem de fora (escolhido antes);
 * a página mostra as instruções → jogo.
 */
function Matematica() {
  useMusicaPagina(musica)

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  const [aJogar, setAJogar] = useState(false) // false = a mostrar as instruções
  // O jogo atual: perguntas, estrelas e fim (igual em todos os jogos)
  const jogo = useJogo(PERGUNTAS, 'matematica')

  return (
    <PaginaJogo titulo="Matemática e Lógica" imagem={fundo} semTitulo>
      {/* Os jogos só aparecem depois de "Vamos jogar!" (antes disso ficariam por
          baixo do cartão das instruções). O key muda a cada jogo novo. */}
      {aJogar && !jogo.fim && <Perguntas key={`jogo-${jogo.numero}`} escalao={escalao} jogo={jogo} />}

      <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}

      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}
    </PaginaJogo>
  )
}

export default Matematica
