import { useEffect, useState } from 'react'
import { useMusicaPagina } from '../../audio/musica'
import { prepararEfeitos } from '../../audio/efeitos'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import EscolherIdade from '../../components/EscolherIdade'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaMascote from '../../components/PaginaMascote'
import { useJogo } from '../../components/useJogo'
import { guardarEscalao, lerEscalao } from '../../games/tartaruga/memoria'
import musicaTartaruga from '../../assets/musica-tartaruga.m4a'
import imagemTartaruga from '../../assets/tartaruga.webp'
import Caminho from './Caminho'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import Jogo56 from './Jogo56'
import Jogo78 from './Jogo78'
import styles from './Tartaruga.module.css'

// Um jogo são 5 perguntas: cada resposta certa leva a tartaruga uma pedra
// mais perto da 🏁; ao chegar lá, o jogo está ganho.
const PERGUNTAS = 5

function Tartaruga() {
  useMusicaPagina(musicaTartaruga)

  const [escalao, setEscalao] = useState(null) // null = ainda a escolher a idade
  const [ultimo, setUltimo] = useState(null) // idade da última vez (estrela)
  const [aJogar, setAJogar] = useState(false) // false = a mostrar as instruções
  // O jogo atual: perguntas, estrelas e fim (igual em todas as mascotes)
  const jogo = useJogo(PERGUNTAS)

  useEffect(() => {
    let ativo = true
    lerEscalao().then((guardado) => {
      if (ativo) setUltimo(guardado)
    })
    return () => {
      ativo = false
    }
  }, [])

  function escolher(novoEscalao) {
    setEscalao(novoEscalao)
    setUltimo(novoEscalao)
    setAJogar(false)
    jogo.recomecar()
    guardarEscalao(novoEscalao)
    prepararEfeitos()
  }

  // Os três jogos recebem as mesmas props (o key, que muda a cada jogo novo,
  // vai à parte: o React não o aceita dentro de {...props})
  const propsDoJogo = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar }

  return (
    <PaginaMascote titulo="Pontual sem Stress" imagem={imagemTartaruga} semTitulo={escalao !== null}>
      {escalao === null ? (
        <EscolherIdade
          ultimo={ultimo}
          aoEscolher={escolher}
          posicao={{ left: '36%', width: '61%', top: '20%' }}
        />
      ) : (
        <>
          {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}

          {aJogar && (
            <>
              {!jogo.fim && escalao === '3-4' && <Jogo34 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
              {!jogo.fim && escalao === '5-6' && <Jogo56 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
              {!jogo.fim && escalao === '7-8' && <Jogo78 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}

              {/* A tartaruga anda uma pedra por cada pergunta respondida */}
              <Caminho passos={jogo.placar.feitas} total={PERGUNTAS} />
            </>
          )}

          <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
          {jogo.fim && (
            <FimDeJogo
              placar={jogo.placar}
              mascote="🐢"
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

export default Tartaruga
