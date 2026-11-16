import { useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaJogo from '../../components/PaginaJogo'
import { useJogo } from '../../components/useJogo'
import { useEscalao } from '../../components/useProgresso'
import { perguntasDoJogo } from '../../games/detetive/regras'
import musica from '../../assets/musica-detetive.m4a'
import fundo from '../../assets/detetive/detetive_fundo.jpg'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'

/**
 * Página do jogo "Detetive das Profissões": instruções → jogo → fim.
 * O nível vem de fora (escolhido antes). As regras estão em src/games/detetive/.
 */
function Detetive() {
  useMusicaPagina(musica)

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  // Se já carregou em "Vamos jogar!" (antes disso mostra o objetivo do jogo)
  const [aJogar, setAJogar] = useState(false)
  const jogo = useJogo(perguntasDoJogo(escalao), 'detetive')

  return (
    <PaginaJogo titulo="Detetive das Profissões" imagem={fundo} semTitulo>
      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}
      {/* O key muda a cada jogo novo: o jogo recomeça do zero */}
      {aJogar && !jogo.fim && escalao === '3-4' && (
        <Jogo34 key={`jogo-${jogo.numero}`} aoAcertar={jogo.aoAcertar} aoErrar={jogo.aoErrar} />
      )}
      {aJogar && !jogo.fim && escalao === '5-6' && (
        <Jogo56 key={`jogo-${jogo.numero}`} aoAcertar={jogo.aoAcertar} aoErrar={jogo.aoErrar} />
      )}
      {aJogar && !jogo.fim && escalao === '7-8' && (
        <Jogo78 key={`jogo-${jogo.numero}`} aoAcertar={jogo.aoAcertar} aoErrar={jogo.aoErrar} />
      )}

      <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}
    </PaginaJogo>
  )
}

export default Detetive
