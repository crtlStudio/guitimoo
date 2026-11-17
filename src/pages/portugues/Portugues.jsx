import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import PaginaJogo from '../../components/PaginaJogo'
import { useEscalao } from '../../components/useProgresso'
import { sortearTipo } from '../../games/matematica/rodizio'
import musica from '../../assets/musica-portugues.m4a'
import fundo from '../../assets/portugues/portugues_fundo.jpg'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import { useJogo } from '../../components/useJogo'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'
import JogoCaixa from './JogoCaixa'

/** Um jogo de Português são 5 rondas (vitórias), em todos os níveis. */
const RONDAS = 5

/**
 * Os jogos que podem sair em cada ronda: o de cada nível (as letras no
 * Fácil, a sopa de letras no Médio e no Difícil) e a caixa das palavras.
 */
const TIPOS = ['nivel', 'caixa']

/**
 * As rondas de UM jogo: cada uma é, ao calhas, o jogo do nível ou a caixa
 * (nunca o mesmo mais de 2 vezes seguidas). Cada jogo faz uma ronda e chama
 * aoProxima(); aqui sorteia-se o da ronda seguinte. Uma sopa de letras com
 * 3 palavras conta como 1 vitória. (O key muda a cada ronda: começa do zero.)
 */
function Rondas({ escalao, jogo }) {
  // Os jogos que já saíram, por ordem; o último é o da ronda atual
  const [saidos, setSaidos] = useState(() => [sortearTipo([], Math.random, TIPOS)])
  const tipo = saidos.at(-1)
  const proxima = () => setSaidos((s) => [...s, sortearTipo(s, Math.random, TIPOS)])
  const props = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar, aoProxima: proxima }
  const chave = `${tipo}-${saidos.length}`

  // Na sopa de letras a grelha ocupa o meio do ecrã: o contador de estrelas
  // vai para a coluna da direita, por baixo das palavras
  const contadorNaColuna = <ContadorEstrelas placar={jogo.placar} ganho={jogo.ganho} naColuna />
  const sopaDeLetras = tipo === 'nivel' && escalao !== '3-4'

  let ronda
  if (tipo === 'caixa') ronda = <JogoCaixa key={chave} escalao={escalao} {...props} />
  else if (escalao === '3-4') ronda = <Jogo34 key={chave} acertos={jogo.placar.feitas} {...props} />
  else if (escalao === '5-6') ronda = <Jogo56 key={chave} contador={contadorNaColuna} {...props} />
  else ronda = <Jogo78 key={chave} contador={contadorNaColuna} {...props} />

  return (
    <>
      {ronda}
      {/* Fora da sopa de letras, o contador fica em cima ao centro */}
      {!sopaDeLetras && <ContadorEstrelas placar={jogo.placar} ganho={jogo.ganho} />}
    </>
  )
}

/**
 * Página do jogo "Português": as letras, a sopa de letras e a caixa das
 * palavras, misturadas ao calhas. O nível vem de fora (escolhido antes);
 * a página mostra as instruções → jogo.
 */
function Portugues() {
  useMusicaPagina(musica)

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  // Se já carregou em "Vamos jogar!" (antes disso mostra o objetivo do jogo)
  const [aJogar, setAJogar] = useState(false)
  // O jogo atual: rondas, estrelas e fim (igual em todos os jogos)
  const jogo = useJogo(RONDAS, 'portugues')

  return (
    // O título fica escondido, para o jogo ter mais espaço
    <PaginaJogo titulo="Português" imagem={fundo} semTitulo>
      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}
      {/* O key muda a cada jogo novo: o sorteio recomeça do zero */}
      {aJogar && !jogo.fim && <Rondas key={`jogo-${jogo.numero}`} escalao={escalao} jogo={jogo} />}

      {/* Nas instruções e no fim do jogo, o contador fica em cima ao centro */}
      {(!aJogar || jogo.fim) && <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />}
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}
    </PaginaJogo>
  )
}

export default Portugues
