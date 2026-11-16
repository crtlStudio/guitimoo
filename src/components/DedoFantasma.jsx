import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { criarLinhaDoTempo } from './linhaDoTempo'
import styles from './DedoFantasma.module.css'

/** Quanto tempo sem tocar no ecrã até aparecer a ajuda (milissegundos). */
export const ESPERA_DA_AJUDA = 3000

/**
 * O ponto para onde o dedo vai, em píxeis, relativo à caixa do dedo:
 * - um elemento (ou algo com getBoundingClientRect): o centro dele
 * - { x, y } em frações da caixa (0 a 1): um sítio fixo (ex.: o chão)
 */
function centroDe(alvo, base) {
  if (typeof alvo.getBoundingClientRect !== 'function') {
    return { x: alvo.x * base.width, y: alvo.y * base.height, largura: 0 }
  }
  const r = alvo.getBoundingClientRect()
  return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top, largura: r.width }
}

/**
 * Transforma os passos do jogo (com funções que encontram os elementos)
 * em passos com pontos, para a linha do tempo. Se algum elemento não
 * existir, devolve null (aí não se mostra nada).
 */
function calcularPassos(passos, caixa) {
  if (!caixa) return null
  const base = caixa.getBoundingClientRect()
  const calculados = []
  for (const passo of passos) {
    if (passo.tipo === 'arrastar') {
      const de = passo.de()
      const para = passo.para()
      if (!de || !para) return null
      // Se o que se arrasta é uma imagem (ex.: um cubinho), o dedo leva uma cópia
      const imagem = de.tagName === 'IMG' ? de.src : null
      calculados.push({ tipo: 'arrastar', de: centroDe(de, base), para: centroDe(para, base), imagem })
    } else {
      const em = passo.em()
      if (!em) return null
      const c = centroDe(em, base)
      if (passo.tipo === 'percorrer') {
        // Da ponta esquerda à ponta direita (ex.: uma fila de números): "escolhe um destes"
        calculados.push({ tipo: 'percorrer', de: { ...c, x: c.x - c.largura * 0.38 }, para: { ...c, x: c.x + c.largura * 0.38 } })
      } else {
        calculados.push({ tipo: 'tocar', em: c, vezes: passo.vezes ?? 1 })
      }
    }
  }
  return calculados
}

/**
 * Um dedo "fantasma" (meio transparente) que aparece quando a criança está
 * parada há ESPERA_DA_AJUDA e mostra COMO se faz (não a resposta certa).
 * Repete até a criança tocar no ecrã; depois de cada toque, a espera recomeça.
 *
 * Props:
 * - gesto: null (sem ajuda), um passo ou uma sequência de passos:
 *     { chave, tipo: 'arrastar', de: () => elemento, para: () => elemento ou { x, y } }
 *     { chave, tipo: 'tocar', em: () => elemento, vezes? }
 *     { chave, tipo: 'percorrer', em: () => elemento }
 *     { chave, passos: [ ...passos como os de cima (sem chave)... ] }
 *   ({ x, y } em frações do ecrã do jogo, de 0 a 1: um sítio sem elemento, ex.: o chão)
 *   `chave` é um texto que muda quando a ajuda muda (ex.: nova ronda, nova fase):
 *   aí a espera recomeça. Ao arrastar uma imagem (ex.: um cubinho), o dedo
 *   leva uma cópia dela, meio transparente.
 *
 * Fica por cima do jogo, sem apanhar toques (o dedo não atrapalha).
 */
function DedoFantasma({ gesto }) {
  const caixa = useRef(null)
  const atual = useRef(gesto) // o gesto mais recente (as funções mudam a cada desenho)
  const [linha, setLinha] = useState(null) // { chave, ...linha do tempo } ou null
  const chave = gesto?.chave ?? null

  useEffect(() => {
    atual.current = gesto
  })

  useEffect(() => {
    if (chave === null) return undefined
    let temporizador = null
    const armar = () => {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => {
        const g = atual.current
        if (!g) return
        const passos = calcularPassos(g.passos ?? [g], caixa.current)
        const calculada = passos && criarLinhaDoTempo(passos)
        if (calculada) setLinha({ chave, ...calculada })
      }, ESPERA_DA_AJUDA)
    }
    // Qualquer toque (ou tecla) esconde o dedo e volta a esperar
    const aoTocar = () => {
      setLinha(null)
      armar()
    }
    armar()
    document.addEventListener('pointerdown', aoTocar, true)
    document.addEventListener('keydown', aoTocar, true)
    return () => {
      clearTimeout(temporizador)
      document.removeEventListener('pointerdown', aoTocar, true)
      document.removeEventListener('keydown', aoTocar, true)
    }
  }, [chave])

  const visivel = linha && linha.chave === chave && gesto
  const px = (lista) => lista.map((n) => `${n}px`)
  const repetir = visivel
    ? { duration: linha.duracao, times: linha.tempos, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }
    : null

  return (
    <div ref={caixa} className={styles.caixa} aria-hidden="true">
      {visivel && (
        <>
          {/* O que o dedo leva em cada arrasto, meio transparente */}
          {linha.objetos.map((o, i) => (
            <motion.img
              key={`objeto-${chave}-${i}`}
              className={styles.objeto}
              src={o.imagem}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ x: px(o.x), y: px(o.y), opacity: o.opacidade }}
              transition={repetir}
            />
          ))}
          <motion.span
            key={`dedo-${chave}`}
            className={styles.dedo}
            initial={{ opacity: 0 }}
            animate={{ x: px(linha.x), y: px(linha.y), opacity: linha.opacidade, scale: linha.escala }}
            transition={repetir}
          >
            👆
          </motion.span>
        </>
      )}
    </div>
  )
}

export default DedoFantasma
