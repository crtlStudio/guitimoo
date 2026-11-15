import { useEffect, useState } from 'react'
import { prepararEfeitos } from '../../audio/efeitos'
import { alternarMudo, useMudo, useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import EscolherIdade from '../../components/EscolherIdade'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaMascote from '../../components/PaginaMascote'
import { useJogo } from '../../components/useJogo'
import { guardarEscalao, lerEscalao } from '../../games/coruja/memoria'
import imagemCoruja from '../../assets/coruja.webp'
import FestaCoruja from './FestaCoruja'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import JogoSequencia from './JogoSequencia'
import styles from './Coruja.module.css'

// Um jogo são 5 perguntas (5 sons ou 5 sequências)
const PERGUNTAS = 5

/**
 * Página do jogo da Coruja ("Memória e Sons").
 * O caminho é sempre: escolher a idade → instruções → jogo.
 * A coruja está no ramo à direita da imagem; os jogos usam o céu à esquerda.
 */
function Coruja() {
  // Sem música: os sons são o jogo (mas a música de início pára)
  useMusicaPagina(null)
  // Sem som não se pode jogar: mostramos um aviso por cima de tudo
  const mudo = useMudo()

  const [escalao, setEscalao] = useState(null) // null = ainda a escolher a idade
  const [ultimo, setUltimo] = useState(null) // idade da última vez (estrela)
  const [aJogar, setAJogar] = useState(false) // false = a mostrar as instruções
  // O jogo atual: perguntas, estrelas e fim (igual em todas as mascotes)
  const jogo = useJogo(PERGUNTAS)

  // Ao abrir a página, lê do telemóvel a idade escolhida da última vez
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

  // Com o som desligado o jogo sai do ecrã (cala-se) e fica o aviso; ao ligar
  // o som volta com uma ronda nova (o nível e as estrelas ficam guardados)
  const mostrarJogo = aJogar && !mudo && !jogo.fim
  const propsDoJogo = { aoAcertar: jogo.aoAcertar, aoErrar: jogo.aoErrar }

  return (
    <PaginaMascote titulo="Memória e Sons" imagem={imagemCoruja} semTitulo={escalao !== null}>
      {escalao === null ? (
        <EscolherIdade
          ultimo={ultimo}
          aoEscolher={escolher}
          posicao={{ left: '4%', width: '64%', top: '20%' }}
        />
      ) : (
        <>
          {!aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}

          {/* O key muda a cada jogo novo: o jogo recomeça do zero. Os keys têm
              nomes diferentes ('jogo-…', 'asas-…'): dois elementos lado a lado
              com o mesmo key baralham o React (ficavam jogos antigos no ecrã) */}
          {mostrarJogo && escalao === '3-4' && <Jogo34 key={`jogo-${jogo.numero}`} {...propsDoJogo} />}
          {/* 5–6 e 7–8 usam o mesmo jogo de sequências */}
          {mostrarJogo && escalao !== '3-4' && (
            <JogoSequencia key={`jogo-${escalao}-${jogo.numero}`} escalao={escalao} {...propsDoJogo} />
          )}

          {/* A cada resposta certa a Coruja bate as asas (o key faz a animação repetir) */}
          {aJogar && jogo.placar.feitas > 0 && <FestaCoruja key={`asas-${jogo.placar.feitas}`} />}

          <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />
          {jogo.fim && (
            <FimDeJogo
              placar={jogo.placar}
              mascote="🦉"
              aoJogarOutraVez={() => jogo.recomecar()}
              aoMudarIdade={() => setEscalao(null)}
            />
          )}

          <button type="button" className={styles.mudarIdade} onClick={() => setEscalao(null)}>
            Mudar idade
          </button>
        </>
      )}

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
    </PaginaMascote>
  )
}

export default Coruja
