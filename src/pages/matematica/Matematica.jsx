import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaJogo from '../../components/PaginaJogo'
import { useJogo } from '../../components/useJogo'
import { useEscalao } from '../../components/useProgresso'
import musica from '../../assets/musica-matematica.m4a'
import fundo from '../../assets/matematica/fundo.webp'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import JogoContas from './JogoContas'

// Um jogo são 5 contas
const PERGUNTAS = 5

/**
 * Página do jogo "Matemática e Lógica" (a balança).
 * O nível vem de fora (escolhido antes); a página mostra as instruções → jogo.
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
      {/* A balança e os cubinhos só aparecem depois de "Vamos jogar!" (antes disso
          ficariam por baixo do cartão das instruções).
          O key muda a cada jogo novo: o jogo recomeça do zero. */}
      {aJogar && !jogo.fim && escalao === '3-4' && (
        <Jogo34 key={`jogo-${jogo.numero}`} aoAcertar={jogo.aoAcertar} aoErrar={jogo.aoErrar} />
      )}
      {/* 5–6 e 7–8: o mesmo jogo de contas (as regras de cada idade estão em contas.js) */}
      {aJogar && !jogo.fim && (escalao === '5-6' || escalao === '7-8') && (
        <JogoContas
          key={`jogo-${escalao}-${jogo.numero}`}
          escalao={escalao}
          aoAcertar={jogo.aoAcertar}
          aoErrar={jogo.aoErrar}
        />
      )}

      <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}

      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}
    </PaginaJogo>
  )
}

export default Matematica
