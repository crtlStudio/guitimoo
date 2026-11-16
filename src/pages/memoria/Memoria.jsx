import { useState } from 'react'
import { alternarMudo, useMudo, useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaJogo from '../../components/PaginaJogo'
import { useJogo } from '../../components/useJogo'
import { useEscalao } from '../../components/useProgresso'
import fundo from '../../assets/memoria/memoria_fundo.jpg'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import JogoSequencia from './JogoSequencia'
import styles from './Memoria.module.css'

// Um jogo são 5 perguntas (5 sons ou 5 sequências)
const PERGUNTAS = 5

/**
 * Página do jogo "Memória" (os sons).
 * O nível vem de fora (escolhido antes); a página mostra as instruções → jogo.
 */
function Memoria() {
  // Sem música: os sons são o jogo (mas a música de início pára)
  useMusicaPagina(null)
  // Sem som não se pode jogar: mostramos um aviso por cima de tudo
  const mudo = useMudo()

  // A faixa etária que o jogo usa por dentro ('3-4', '5-6', '7-8'), do nível escolhido
  const escalao = useEscalao()
  const [aJogar, setAJogar] = useState(false) // false = a mostrar as instruções
  // O jogo atual: perguntas, estrelas e fim (igual em todos os jogos)
  const jogo = useJogo(PERGUNTAS, 'memoria')

  // Com o som desligado o jogo sai do ecrã (cala-se) e fica o aviso; ao ligar
  // o som volta com uma ronda nova (o nível e as estrelas ficam guardados)
  const mostrarJogo = aJogar && !mudo && !jogo.fim
  const propsDoJogo = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar }

  return (
    <PaginaJogo titulo="Memória" imagem={fundo} semTitulo>
      {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}

      {/* O key muda a cada jogo novo: o jogo recomeça do zero. Os keys têm
          nomes diferentes ('jogo-…', 'asas-…'): dois elementos lado a lado
          com o mesmo key baralham o React (ficavam jogos antigos no ecrã) */}
      {mostrarJogo && escalao === '3-4' && <Jogo34 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
      {/* 5–6 e 7–8 usam o mesmo jogo de sequências */}
      {mostrarJogo && escalao !== '3-4' && (
        <JogoSequencia key={`jogo-${escalao}-${jogo.numero}`} escalao={escalao} {...propsDoJogo} />
      )}


      <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
      {jogo.fim && <FimDeJogo placar={jogo.placar} premio={jogo.premio} aoJogarOutraVez={() => jogo.recomecar()} />}

      {mudo && (
        <div className={styles.fundoAviso}>
          <div className={styles.aviso} role="alertdialog" aria-labelledby="aviso-som">
            <p id="aviso-som" className={styles.texto}>
              Sem som não é possível jogar
            </p>
            <button type="button" className={styles.ligar} onClick={alternarMudo} autoFocus>
              Ligar o som
            </button>
          </div>
        </div>
      )}
    </PaginaJogo>
  )
}

export default Memoria
