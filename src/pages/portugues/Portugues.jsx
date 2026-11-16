import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import PaginaJogo from '../../components/PaginaJogo'
import { useEscalao } from '../../components/useProgresso'
import musica from '../../assets/musica-portugues.m4a'
import fundo from '../../assets/portugues/portugues_fundo.jpg'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import { useJogo } from '../../components/useJogo'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'

// Quantas perguntas tem cada jogo: 5 letras; 3 palavras; 1 grelha com 3 palavras
const PERGUNTAS = { '3-4': 5, '5-6': 3, '7-8': 3 }

/**
 * Página do jogo "Português" (as letras e a sopa de letras).
 * O nível vem de fora (escolhido antes); a página mostra as instruções → jogo.
 */
function Portugues() {
  useMusicaPagina(musica)

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  // Se já carregou em "Vamos jogar!" (antes disso mostra o objetivo do jogo)
  const [aJogar, setAJogar] = useState(false)
  // O jogo atual: perguntas (conforme a idade), estrelas e fim (igual em todos os jogos)
  const jogo = useJogo(PERGUNTAS[escalao], 'portugues')

  // Nas sopas de letras (5–6 e 7–8) a grelha ocupa o meio do ecrã: o contador
  // de estrelas vai para a coluna da direita, por baixo das palavras
  const contadorNaColuna = (
    <ContadorEstrelas placar={jogo.placar} ganho={jogo.ganho} naColuna />
  )
  const sopaDeLetras = aJogar && !jogo.fim && escalao !== '3-4'

  return (
    // O título fica escondido, para o jogo ter mais espaço
    <PaginaJogo titulo="Português" imagem={fundo} semTitulo>
      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}
      {/* O key muda a cada jogo novo: o jogo recomeça do zero */}
      {aJogar && !jogo.fim && escalao === '3-4' && (
        <Jogo34 key={`jogo-${jogo.numero}`} aoAcertar={jogo.aoAcertar} aoErrar={jogo.aoErrar} />
      )}
      {aJogar && !jogo.fim && escalao === '5-6' && (
        <Jogo56
          key={`jogo-${jogo.numero}`}
          aoAcertar={jogo.aoAcertar}
          aoErrar={jogo.aoErrar}
          contador={contadorNaColuna}
        />
      )}
      {aJogar && !jogo.fim && escalao === '7-8' && (
        <Jogo78
          key={`jogo-${jogo.numero}`}
          aoAcertar={jogo.aoAcertar}
          aoErrar={jogo.aoErrar}
          contador={contadorNaColuna}
        />
      )}

      {/* Em cima ao centro: no jogo dos 3–4, nas instruções e no fim do jogo */}
      {!sopaDeLetras && <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />}
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}
    </PaginaJogo>
  )
}

export default Portugues
