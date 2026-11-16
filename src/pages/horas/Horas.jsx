import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaJogo from '../../components/PaginaJogo'
import { useJogo } from '../../components/useJogo'
import { useEscalao } from '../../components/useProgresso'
import musica from '../../assets/musica-horas.m4a'
import fundo from '../../assets/horas/horas_fundo.jpg'
import Caminho from './Caminho'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'

// Um jogo são 5 perguntas: cada resposta certa leva a mascote uma pedra
// mais perto da 🏁; ao chegar lá, o jogo está ganho.
const PERGUNTAS = 5

/**
 * Página do jogo "Horas e Rotinas" (o relógio).
 * O nível vem de fora (escolhido antes); a página mostra as instruções → jogo.
 */
function Horas() {
  useMusicaPagina(musica)

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  const [aJogar, setAJogar] = useState(false) // false = a mostrar as instruções
  // O jogo atual: perguntas, estrelas e fim (igual em todos os jogos)
  const jogo = useJogo(PERGUNTAS, 'horas')

  // Os três jogos recebem as mesmas props (o key, que muda a cada jogo novo,
  // vai à parte: o React não o aceita dentro de {...props})
  const propsDoJogo = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar }

  return (
    <PaginaJogo titulo="Horas e Rotinas" imagem={fundo} semTitulo>
      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}

      {aJogar && (
        <>
          {!jogo.fim && escalao === '3-4' && <Jogo34 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
          {!jogo.fim && escalao === '5-6' && <Jogo56 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
          {!jogo.fim && escalao === '7-8' && <Jogo78 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}

          {/* A mascote anda uma pedra por cada pergunta respondida */}
          <Caminho passos={jogo.placar.feitas} total={PERGUNTAS} />
        </>
      )}

      <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}
    </PaginaJogo>
  )
}

export default Horas
