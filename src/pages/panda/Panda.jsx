import { useEffect, useState } from 'react'
import { prepararEfeitos } from '../../audio/efeitos'
import { useMusicaPagina } from '../../audio/musica'
import PaginaMascote from '../../components/PaginaMascote'
import { guardarEscalao, lerEscalao } from '../../games/panda/memoria'
import musicaPanda from '../../assets/musica-panda.m4a'
import imagemPanda from '../../assets/panda.webp'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import EscolherIdade from '../../components/EscolherIdade'
import FimDeJogo from '../../components/FimDeJogo'
import { useJogo } from '../../components/useJogo'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'
import styles from './Panda.module.css'

// Quantas perguntas tem cada jogo: 5 letras; 3 palavras; 1 grelha com 3 palavras
const PERGUNTAS = { '3-4': 5, '5-6': 3, '7-8': 3 }

function Panda() {
  useMusicaPagina(musicaPanda)

  // Estado: o escalão com que se está a jogar (null = ainda a escolher)
  const [escalao, setEscalao] = useState(null)
  // O escalão escolhido da última vez, lido do telemóvel (para a estrela)
  const [ultimo, setUltimo] = useState(null)
  // Se já carregou em "Vamos jogar!" (antes disso mostra o objetivo do jogo)
  const [aJogar, setAJogar] = useState(false)
  // O jogo atual: perguntas, estrelas e fim (igual em todas as mascotes)
  const jogo = useJogo(PERGUNTAS['3-4'])

  // Ao abrir a página, lê o último escalão guardado
  useEffect(() => {
    let ativo = true // evita atualizar o estado se a página já tiver fechado
    lerEscalao().then((guardado) => {
      if (ativo) setUltimo(guardado)
    })
    return () => {
      ativo = false
    }
  }, [])

  function escolher(novoEscalao) {
    setEscalao(novoEscalao)
    setAJogar(false) // primeiro mostra o objetivo do jogo
    setUltimo(novoEscalao)
    guardarEscalao(novoEscalao) // guarda para a próxima vez (não é preciso esperar)
    jogo.recomecar(PERGUNTAS[novoEscalao]) // jogo novo, com as perguntas desta idade
    prepararEfeitos() // carrega os sons agora, que a criança já tocou no ecrã
  }

  // Nas sopas de letras (5–6 e 7–8) a grelha ocupa o meio do ecrã: o contador
  // de estrelas vai para a coluna da direita, por baixo das palavras
  const contadorNaColuna = (
    <ContadorEstrelas placar={jogo.placar} ganho={jogo.ganho} naColuna />
  )
  const sopaDeLetras = aJogar && !jogo.fim && escalao !== '3-4'

  return (
    <PaginaMascote
      titulo="Letras e Trapalhadas"
      imagem={imagemPanda}
      // Durante o jogo o título esconde-se, para o jogo ter mais espaço
      semTitulo={escalao !== null}
    >
      {escalao === null ? (
        <EscolherIdade ultimo={ultimo} aoEscolher={escolher} />
      ) : (
        <>
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
          {jogo.fim && (
            <FimDeJogo
              placar={jogo.placar}
              mascote="🐼"
              aoJogarOutraVez={() => jogo.recomecar()}
              aoMudarIdade={() => setEscalao(null)}
            />
          )}

          <button type="button" className={styles.mudarIdade} onClick={() => setEscalao(null)}>
            Mudar idade
          </button>
        </>
      )}
    </PaginaMascote>
  )
}

export default Panda
