import { useEffect, useState } from 'react'
import { prepararEfeitos } from '../../audio/efeitos'
import { useMusicaPagina } from '../../audio/musica'
import ContadorEstrelas from '../../components/ContadorEstrelas'
import EscolherIdade from '../../components/EscolherIdade'
import FimDeJogo from '../../components/FimDeJogo'
import PaginaMascote from '../../components/PaginaMascote'
import { useJogo } from '../../components/useJogo'
import { guardarEscalao, lerEscalao } from '../../games/sapo/memoria'
import musicaSapo from '../../assets/musica-sapo.m4a'
import fundoSapo from '../../assets/sapo/fundo_sapo.webp'
import Instrucoes from './Instrucoes'
import Jogo34 from './Jogo34'
import JogoContas from './JogoContas'
import styles from './Sapo.module.css'

// Um jogo são 5 contas
const PERGUNTAS = 5

/**
 * Página do jogo do Sapo ("Contas e Saltos"): uma balança de matemática.
 * O caminho é sempre: escolher a idade → instruções → jogo.
 */
function Sapo() {
  useMusicaPagina(musicaSapo)

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
    setAJogar(false) // primeiro mostra as instruções
    jogo.recomecar() // jogo novo
    guardarEscalao(novoEscalao) // guarda para a próxima vez (não é preciso esperar)
    prepararEfeitos() // carrega os sons agora, que a criança já tocou no ecrã
  }

  /** Volta à escolha das idades (também sai do jogo: sem idade não há jogo). */
  function mudarIdade() {
    setEscalao(null)
    setAJogar(false)
  }

  return (
    <PaginaMascote titulo="Contas e Saltos" imagem={fundoSapo} semTitulo={escalao !== null}>
      {/* A balança e os sapinhos só aparecem depois de "Vamos jogar!" (antes disso
          ficariam por baixo dos botões das idades e do cartão das instruções).
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

      {escalao !== null && <ContadorEstrelas placar={aJogar ? jogo.placar : null} ganho={jogo.ganho} />}
      {jogo.fim && (
        <FimDeJogo
          placar={jogo.placar}
          mascote="🐸"
          aoJogarOutraVez={() => jogo.recomecar()}
          aoMudarIdade={mudarIdade}
        />
      )}

      {escalao === null && (
        <EscolherIdade ultimo={ultimo} aoEscolher={escolher} posicao={{ left: '18%', width: '64%', top: '22%' }} />
      )}

      {escalao !== null && !aJogar && <Instrucoes escalao={escalao} aoComecar={() => setAJogar(true)} />}

      {escalao !== null && (
        <button type="button" className={styles.mudarIdade} onClick={mudarIdade}>
          Mudar idade
        </button>
      )}
    </PaginaMascote>
  )
}

export default Sapo
