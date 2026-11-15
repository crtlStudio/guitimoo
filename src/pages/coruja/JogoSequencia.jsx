import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import { guardarSaco, lerProgresso, registarRonda } from '../../games/coruja/memoria'
import {
  TENTATIVAS,
  ordemEsperada,
  regrasDoNivel,
  sortearAoContrario,
  verificarToque,
} from '../../games/coruja/regras'
import {
  quantasImagens56,
  sortearImagens,
  sortearImagensParecidas,
  sortearSequencia,
} from '../../games/coruja/sorteio'
import { pararSons, prepararSons, tocarSequencia, tocarSom } from '../../games/coruja/tocador'
import CartaoSom from './CartaoSom'
import styles from './JogoSequencia.module.css'

const ESPERA_ANTES_DE_TOCAR = 900 // ms para ver as imagens antes da sequência
const ESPERA_DEPOIS_DE_ACERTAR = 2200 // ms a festejar antes da ronda seguinte
const ESPERA_DEPOIS_DE_ERRAR = 1300 // ms do "Quase!" antes de voltar a ouvir
const TEMPO_DO_VISTO = 450 // ms que um cartão certo fica verde
const IMAGENS_78 = 6 // nos 7–8 há sempre 6 imagens (2 filas de 3)

/**
 * Sorteia uma ronda nova a partir do progresso: as imagens no ecrã, a
 * sequência que a Coruja vai tocar e se é "ao contrário".
 * - 5–6: 4 a 6 imagens variadas; cada som aparece no máximo uma vez
 * - 7–8: 6 imagens com sons parecidos (chuva/rio/mar...); os sons podem
 *   repetir-se (nunca dois seguidos); nos níveis altos, às vezes ao contrário
 * Devolve { imagens, sequencia, aoContrario, saco }.
 */
function sortearRonda(escalao, progresso) {
  const { comprimento } = regrasDoNivel(escalao, progresso.nivel)

  if (escalao === '7-8') {
    const { imagens, saco } = sortearImagensParecidas(progresso.saco, IMAGENS_78)
    const sequencia = sortearSequencia(imagens, comprimento, true)
    const aoContrario = sortearAoContrario(escalao, progresso.nivel)
    return { imagens, sequencia, aoContrario, saco }
  }

  const { imagens, saco } = sortearImagens(progresso.saco, quantasImagens56(comprimento))
  const sequencia = sortearSequencia(imagens, comprimento)
  return { imagens, sequencia, aoContrario: false, saco }
}

/**
 * 5–6 e 7–8 anos: a Coruja toca uma sequência de sons e cada imagem acende
 * enquanto o seu som toca. Depois a criança repete, tocando nas imagens
 * pela mesma ordem (ou ao contrário, nos 7–8). Enquanto a Coruja toca,
 * os toques são ignorados.
 *
 * Fases: 'ouvir' (a Coruja toca) → 'repetir' (vez da criança) → 'fim'
 *
 * Props: escalao ('5-6' ou '7-8'), aoAcertar() e aoErrar() — avisam a página (sons, estrelas, festa)
 */
function JogoSequencia({ escalao, aoAcertar, aoErrar }) {
  const progresso = useRef(null)
  const [ronda, setRonda] = useState(null) // { imagens, sequencia, aoContrario }
  const [fase, setFase] = useState('ouvir')
  const [aceso, setAceso] = useState(null) // id do cartão que está a tocar
  const [certos, setCertos] = useState(0) // quantos já tocou bem nesta tentativa
  const [verde, setVerde] = useState(null) // id do cartão com ✓ (por um instante)
  const [errado, setErrado] = useState(null) // id do cartão que abana
  const [mensagem, setMensagem] = useState(null)
  const tentativa = useRef(1)
  const controlo = useRef(null) // para poder parar a sequência a meio
  const temporizadores = useRef([])

  function depois(ms, funcao) {
    temporizadores.current.push(setTimeout(funcao, ms))
  }

  /** A Coruja toca a sequência; no fim, é a vez da criança. */
  async function tocar(sequencia) {
    setFase('ouvir')
    setCertos(0)
    setVerde(null)
    controlo.current = tocarSequencia(sequencia, {
      aoTocar: (i, id) => setAceso(id),
      aoCalar: () => setAceso(null),
    })
    const tocouTudo = await controlo.current.terminou
    if (tocouTudo) setFase('repetir')
  }

  function novaRonda() {
    const nova = sortearRonda(escalao, progresso.current)
    progresso.current = guardarSaco(escalao, progresso.current, nova.saco)
    prepararSons(nova.imagens)

    setRonda({ imagens: nova.imagens, sequencia: nova.sequencia, aoContrario: nova.aoContrario })
    setMensagem(null)
    setErrado(null)
    setFase('ouvir')
    setCertos(0)
    tentativa.current = 1
    depois(ESPERA_ANTES_DE_TOCAR, () => tocar(nova.sequencia))
  }

  useEffect(() => {
    let ativo = true
    const pendentes = temporizadores.current
    lerProgresso(escalao).then((p) => {
      if (!ativo) return
      progresso.current = p
      novaRonda()
    })
    return () => {
      ativo = false
      pendentes.forEach(clearTimeout)
      controlo.current?.parar()
      pararSons()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só uma vez, ao começar
  }, [])

  function aoTocarCartao(id) {
    if (fase !== 'repetir') return // a Coruja ainda está a tocar (ou já acabou)

    const esperada = ordemEsperada(ronda.sequencia, ronda.aoContrario)
    const resultado = verificarToque(esperada, certos, id)

    if (resultado === 'errado') {
      errou(id)
      return
    }

    // Certo: ouve-se o som do cartão e ele fica verde um instante
    tocarSom(id)
    setVerde(id)
    depois(TEMPO_DO_VISTO, () => setVerde((v) => (v === id ? null : v)))
    setCertos(certos + 1)

    if (resultado === 'completo') {
      setFase('fim')
      progresso.current = registarRonda(escalao, progresso.current, true)
      setMensagem((m) => ({ tipo: 'fim', vez: (m?.vez ?? 0) + 1 }))
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) depois(ESPERA_DEPOIS_DE_ACERTAR, novaRonda)
    }
  }

  /** Sem castigo: a Coruja anima e volta a tocar (ou, à 2.ª falha, troca de sequência). */
  function errou(id) {
    aoErrar?.()
    setFase('fim') // bloqueia os toques enquanto a Coruja fala
    setErrado(id)
    setMensagem((m) => ({ tipo: 'erro', vez: (m?.vez ?? 0) + 1 }))

    if (tentativa.current >= TENTATIVAS) {
      // 2.ª falha: conta como erro (a sequência encolhe) e vem uma nova
      progresso.current = registarRonda(escalao, progresso.current, false)
      depois(ESPERA_DEPOIS_DE_ERRAR, novaRonda)
    } else {
      tentativa.current += 1
      depois(ESPERA_DEPOIS_DE_ERRAR, () => {
        setErrado(null)
        tocar(ronda.sequencia)
      })
    }
  }

  /** Botão "Ouvir outra vez": recomeça a tentativa a ouvir a sequência. */
  function ouvirOutraVez() {
    if (fase !== 'repetir') return
    tocar(ronda.sequencia)
  }

  if (!ronda) return null

  // 4 imagens em 2 filas de 2; 5 ou 6 em filas de 3
  const colunas = ronda.imagens.length === 4 ? 2 : 3

  return (
    <>
      <div className={styles.zona}>
        <div className={styles.topo}>
          <AnimatePresence mode="wait">
            {fase === 'ouvir' ? (
              <motion.p
                key="ouvir"
                className={styles.aviso}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <span aria-hidden="true">👂</span> Ouve com atenção…
              </motion.p>
            ) : (
              <motion.div
                key="repetir"
                className={styles.vez}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <p className={styles.aviso}>
                  <span aria-hidden="true">👆</span> Agora tu!
                </p>
                <button
                  type="button"
                  className={styles.ouvir}
                  onClick={ouvirOutraVez}
                  disabled={fase !== 'repetir'}
                  aria-label="Ouvir outra vez"
                >
                  🔊
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uma bolinha por som: as cheias são os que a criança já acertou */}
          <div className={styles.bolinhas} aria-label={`${certos} de ${ronda.sequencia.length}`}>
            {ronda.sequencia.map((_, i) => {
              // Ao contrário, as bolinhas enchem da direita para a esquerda
              const posicao = ronda.aoContrario ? ronda.sequencia.length - 1 - i : i
              return <span key={i} className={`${styles.bolinha} ${posicao < certos ? styles.cheia : ''}`} />
            })}
          </div>
        </div>

        {/* Aviso bem visível: nesta ronda repete-se do último som para o primeiro */}
        {ronda.aoContrario && (
          <motion.p
            key={ronda.sequencia.join('-')}
            className={styles.contrario}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          >
            <span aria-hidden="true">⬅️</span> Ao contrário: do último para o primeiro!
          </motion.p>
        )}

        <div className={styles.grelha} style={{ '--colunas': colunas }}>
          {ronda.imagens.map((id) => (
            <div key={id} className={styles.lugar}>
              <CartaoSom
                id={id}
                aceso={aceso === id}
                bloqueado={fase !== 'repetir'}
                estado={verde === id ? 'certo' : errado === id ? 'errado' : null}
                aoTocar={aoTocarCartao}
              />
            </div>
          ))}
        </div>
      </div>

      <BalaoMascote
        emoji="🦉"
        mensagem={mensagem}
        textos={{ erro: 'Quase! Vamos ouvir outra vez', fim: 'Boa! Que memória!' }}
        className={styles.mensagem}
      />
    </>
  )
}

export default JogoSequencia
