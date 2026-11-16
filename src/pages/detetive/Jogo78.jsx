import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import { lembrarProfissoes, lerRecentes } from '../../games/detetive/memoria'
import { rondaDificil, trabalhaEm } from '../../games/detetive/regras'
import Retrato, { ImagemLocal } from './Retrato'
import styles from './Jogo78.module.css'

const ESPERA_ENTRE_RONDAS = 1800 // milissegundos até à ronda seguinte

/** Diz se o ponto (onde o dedo largou) está por cima da caixa do elemento. */
function estaPorCima(ponto, elemento) {
  const caixa = elemento?.getBoundingClientRect()
  if (!caixa) return false
  const x = ponto.x - window.scrollX
  const y = ponto.y - window.scrollY
  return x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom
}

/**
 * Nível difícil (7–8): "Onde trabalha?"
 * Em cima, 3 locais (hospital, escola, ...); em baixo, 3 pessoas.
 * A criança arrasta cada pessoa para onde trabalha (ou toca na pessoa e
 * depois no local). Cada par certo conta como uma pergunta; com os 3 pares
 * feitos, vem a ronda seguinte.
 * Props: aoAcertar() e aoErrar() — avisam a página (sons e estrelas)
 */
function Jogo78({ aoAcertar, aoErrar }) {
  // A ronda: { profissoes, locais } (null enquanto lê o telemóvel)
  const [ronda, setRonda] = useState(null)
  const [numero, setNumero] = useState(0) // conta as rondas
  const [colocadas, setColocadas] = useState([]) // ids das profissões já no sítio certo
  const [selecionada, setSelecionada] = useState(null) // id da pessoa tocada (para tocar no local a seguir)
  const [erro, setErro] = useState(null) // { localId, vez }: o local que abana
  const [mensagem, setMensagem] = useState(null)

  const recentes = useRef([])
  const locais = useRef({}) // os elementos dos locais, para saber onde se largou
  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  function novaRonda() {
    const nova = rondaDificil(recentes.current)
    recentes.current = lembrarProfissoes('7-8', recentes.current, nova.profissoes.map((p) => p.id))
    setRonda(nova)
    setColocadas([])
    setSelecionada(null)
    setErro(null)
    setMensagem(null)
    setNumero((n) => n + 1)
  }

  // Primeira ronda ao abrir: lê as profissões recentes do telemóvel
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    lerRecentes('7-8').then((lidas) => {
      recentes.current = lidas
      novaRonda()
    })
  }, [])

  // Ao sair do jogo, cancela a passagem automática para a ronda seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  /** A criança pôs a pessoa num local (a arrastar ou a tocar). */
  function tentar(profissao, localId) {
    if (colocadas.includes(profissao.id)) return
    if (!trabalhaEm(profissao, localId)) {
      aoErrar?.()
      setErro((anterior) => ({ localId, vez: (anterior?.vez ?? 0) + 1 }))
      setMensagem((anterior) => ({ tipo: 'erro', vez: (anterior?.vez ?? 0) + 1 }))
      setSelecionada(null)
      return
    }
    const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
    const novas = [...colocadas, profissao.id]
    setColocadas(novas)
    setSelecionada(null)
    setErro(null)
    const rondaFeita = novas.length === ronda.profissoes.length
    setMensagem((anterior) => ({ tipo: rondaFeita ? 'fim' : 'boa', vez: (anterior?.vez ?? 0) + 1 }))
    if (rondaFeita && !acabou) temporizador.current = setTimeout(novaRonda, ESPERA_ENTRE_RONDAS)
  }

  /** Largou a pessoa: em cima de que local? (Longe de todos: só volta para trás.) */
  function largar(profissao, ponto) {
    const local = ronda.locais.find((l) => estaPorCima(ponto, locais.current[l.id]))
    if (local) tentar(profissao, local.id)
  }

  function tocarNoLocal(localId) {
    const profissao = ronda.profissoes.find((p) => p.id === selecionada)
    if (profissao) tentar(profissao, localId)
  }

  if (!ronda) return null // ainda a ler do telemóvel

  const rondaFeita = colocadas.length === ronda.profissoes.length

  return (
    <>
      {/* Os locais, em cima: cada um recebe a sua pessoa */}
      <div className={styles.locais} key={`locais-${numero}`}>
        {ronda.locais.map((local, i) => {
          const pessoa = ronda.profissoes.find((p) => p.local.id === local.id && colocadas.includes(p.id))
          const abana = erro?.localId === local.id
          return (
            <motion.button
              key={abana ? `${local.id}-${erro.vez}` : local.id}
              ref={(el) => {
                locais.current[local.id] = el
              }}
              type="button"
              className={`${styles.local} ${pessoa ? styles.localCerto : ''} ${selecionada && !pessoa ? styles.aEspera : ''}`}
              onClick={() => tocarNoLocal(local.id)}
              aria-label={local.nome}
              initial={abana ? false : { opacity: 0, y: -20 }}
              animate={abana ? { opacity: 1, y: 0, x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, y: 0 }}
              transition={abana ? { duration: 0.45 } : { delay: i * 0.1 }}
            >
              <ImagemLocal local={local} className={styles.localImagem} />
              {/* A pessoa certa "entra" no local */}
              <AnimatePresence>
                {pessoa && (
                  <motion.span
                    className={styles.pessoaNoLocal}
                    aria-hidden="true"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.45 }}
                  >
                    <Retrato profissao={pessoa} className={styles.retratoNoLocal} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      <BalaoMascote mensagem={mensagem} textos={{ fim: 'Boa!', boa: 'Isso!' }} className={styles.mensagem} />

      {rondaFeita && <Festa semente={`detetive-ronda-${numero}`} origem={{ x: 50, y: 30 }} />}

      {/* As pessoas, em baixo: arrastar até ao local (ou tocar e depois tocar no local) */}
      <div className={styles.pessoas} key={`pessoas-${numero}`}>
        {ronda.profissoes.map((profissao, i) =>
          colocadas.includes(profissao.id) ? (
            <div key={profissao.id} className={styles.vazio} />
          ) : (
            <motion.button
              key={profissao.id}
              type="button"
              className={`${styles.pessoa} ${selecionada === profissao.id ? styles.selecionada : ''}`}
              aria-label={profissao.nome}
              aria-pressed={selecionada === profissao.id}
              drag
              dragSnapToOrigin
              dragElastic={1}
              dragMomentum={false}
              whileDrag={{ scale: 1.12, zIndex: 5, boxShadow: '0 1.2cqw 2.4cqw rgba(0,0,0,0.3)' }}
              onDragEnd={(evento, info) => largar(profissao, info.point)}
              onTap={() => setSelecionada((s) => (s === profissao.id ? null : profissao.id))}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Retrato profissao={profissao} className={styles.retrato} />
            </motion.button>
          ),
        )}
      </div>
    </>
  )
}

export default Jogo78
