import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import dados from '../../data/rotinas.json'
import BalaoMascote from '../../components/BalaoMascote'
import { lembrarUsada, lerProgresso, registarResposta } from '../../games/horas/memoria'
import { baralharPassos, nomeDoNivel, sortearMomento, sortearRotina } from '../../games/horas/sorteio'
import styles from './Jogo34.module.css'
import ImagemPalavra from '../../components/ImagemPalavra'

const ESCALAO = '3-4'
const ESPERA_DEPOIS_DE_ACERTAR = 1800

/**
 * 3–4 anos, sem relógio:
 * - 'diaNoite': uma situação (ex.: 😴 Dormir na cama) — é de dia ou de noite?
 * - 'rotina': 3 imagens baralhadas para pôr por ordem, arrastando para os
 *   lugares 1, 2, 3 (ou tocando nelas pela ordem certa).
 * No 1.º nível só há dia/noite; no 2.º aparecem sobretudo rotinas.
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons, estrelas e a mascote avança)
 */
function Jogo34({ aoAcertar, aoErrar }) {
  const progresso = useRef(null)
  // Ronda: { tipo: 'diaNoite', momento } ou { tipo: 'rotina', rotina, cartas }
  const [ronda, setRonda] = useState(null)
  const [colocadas, setColocadas] = useState([]) // cartas já postas nos lugares, por ordem
  const [mensagem, setMensagem] = useState(null)
  const [resolvida, setResolvida] = useState(false)
  const lugaresRef = useRef(null) // a zona dos lugares 1-2-3, para saber se a carta caiu lá
  const temporizador = useRef(null)

  function novaRonda() {
    const p = progresso.current
    const nivel = nomeDoNivel(ESCALAO, p.nivel)
    const tipo = nivel === 'rotina' && Math.random() < 0.7 ? 'rotina' : 'diaNoite'

    if (tipo === 'diaNoite') {
      const momento = sortearMomento(dados.momentos, p.recentes)
      progresso.current = lembrarUsada(ESCALAO, p, momento.id)
      setRonda({ tipo, momento })
    } else {
      const rotina = sortearRotina(dados.rotinas, p.recentes)
      progresso.current = lembrarUsada(ESCALAO, p, rotina.id)
      setRonda({ tipo, rotina, cartas: baralharPassos(rotina.passos) })
    }
    setColocadas([])
    setMensagem(null)
    setResolvida(false)
  }

  useEffect(() => {
    let ativo = true
    lerProgresso(ESCALAO).then((p) => {
      if (!ativo) return
      progresso.current = p
      novaRonda()
    })
    return () => {
      ativo = false
      clearTimeout(temporizador.current)
    }
  }, [])

  function acertou() {
    progresso.current = registarResposta(ESCALAO, progresso.current, true)
    setResolvida(true)
    setMensagem((m) => ({ tipo: 'fim', vez: (m?.vez ?? 0) + 1 }))
    const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
    if (!acabou) temporizador.current = setTimeout(novaRonda, ESPERA_DEPOIS_DE_ACERTAR)
  }

  function errou() {
    aoErrar?.()
    progresso.current = registarResposta(ESCALAO, progresso.current, false)
    setMensagem((m) => ({ tipo: 'erro', vez: (m?.vez ?? 0) + 1 }))
  }

  // ----- Dia ou noite -----

  function responder(resposta) {
    if (resolvida) return
    if (resposta === ronda.momento.momento) acertou()
    else errou()
  }

  // ----- Rotina -----

  /**
   * A criança largou (ou tocou) uma carta. Só entra se for a próxima da
   * ordem; senão volta para trás e a mascote diz "Quase!".
   * `largouNosLugares` é false se a largou longe dos lugares (aí só volta, sem erro).
   */
  function tentarColocar(carta, largouNosLugares = true) {
    if (resolvida || !largouNosLugares) return
    if (carta.ordem !== colocadas.length) {
      errou()
      return
    }
    const novas = [...colocadas, carta]
    setColocadas(novas)
    if (novas.length === ronda.cartas.length) acertou()
  }

  /** Diz se o ponto onde o dedo largou a carta está por cima dos lugares 1-2-3. */
  function estaNosLugares(ponto) {
    const caixa = lugaresRef.current?.getBoundingClientRect()
    if (!caixa) return false
    const x = ponto.x - window.scrollX
    const y = ponto.y - window.scrollY
    return x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom
  }

  if (!ronda) return null

  return (
    <>
      <AnimatePresence mode="wait">
        {ronda.tipo === 'diaNoite' ? (
          <motion.div
            key={`dn-${ronda.momento.id}`}
            className={styles.diaNoite}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <div className={styles.cena}>
              <span className={styles.cenaEmoji} aria-hidden="true">
                <ImagemPalavra palavra={ronda.momento.imagem} emoji={ronda.momento.emoji} />
              </span>
              <span className={styles.cenaTexto}>{ronda.momento.texto}</span>
            </div>

            <div className={styles.escolha}>
              <p className={styles.perguntaCurta}>É de dia ou de noite?</p>
              <motion.button
                type="button"
                className={`${styles.botaoMomento} ${styles.dia}`}
                onClick={() => responder('dia')}
                whileTap={{ scale: 0.92 }}
                aria-label="Dia"
              >
                <span aria-hidden="true">☀️</span> Dia
              </motion.button>
              <motion.button
                type="button"
                className={`${styles.botaoMomento} ${styles.noite}`}
                onClick={() => responder('noite')}
                whileTap={{ scale: 0.92 }}
                aria-label="Noite"
              >
                <span aria-hidden="true">🌙</span> Noite
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`r-${ronda.rotina.id}`}
            className={styles.rotina}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <p className={styles.perguntaCurta}>O que vem primeiro? Põe por ordem!</p>

            {/* Lugares 1, 2, 3 */}
            <div className={styles.lugares} ref={lugaresRef}>
              {ronda.cartas.map((_, i) => {
                const carta = colocadas[i]
                return (
                  <div key={i} className={`${styles.lugar} ${carta ? styles.lugarCheio : ''}`}>
                    {carta ? (
                      <motion.div
                        className={styles.cartaPosta}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <span className={styles.cartaEmoji} aria-hidden="true">
                          <ImagemPalavra palavra={carta.imagem} emoji={carta.emoji} />
                        </span>
                        <span className={styles.cartaTexto}>{carta.texto}</span>
                      </motion.div>
                    ) : (
                      <span className={styles.numeroLugar}>{i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Cartas por colocar: arrastar até aos lugares, ou tocar pela ordem */}
            <div className={styles.cartas}>
              {ronda.cartas.map((carta) =>
                colocadas.includes(carta) ? (
                  <div key={carta.ordem} className={styles.cartaVazia} />
                ) : (
                  <motion.button
                    key={carta.ordem}
                    type="button"
                    className={styles.carta}
                    aria-label={carta.texto}
                    drag
                    dragSnapToOrigin
                    dragElastic={1}
                    dragMomentum={false}
                    whileDrag={{ scale: 1.1, zIndex: 5, boxShadow: '0 1.2cqw 2.4cqw rgba(0,0,0,0.3)' }}
                    onDragEnd={(evento, info) => tentarColocar(carta, estaNosLugares(info.point))}
                    onTap={() => tentarColocar(carta)}
                  >
                    <span className={styles.cartaEmoji} aria-hidden="true">
                      <ImagemPalavra palavra={carta.imagem} emoji={carta.emoji} />
                    </span>
                    <span className={styles.cartaTexto}>{carta.texto}</span>
                  </motion.button>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BalaoMascote
        mensagem={mensagem}
        textos={{ fim: 'Boa! Muito bem!' }}
        className={styles.mensagem}
      />
    </>
  )
}

export default Jogo34
