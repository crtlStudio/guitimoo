import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import {
  celulaNoPonto,
  celulasSelecionadas,
  mesmaCelula,
  verificarSelecao,
} from '../../games/portugues/selecao'
import { corDaPalavra } from './cores'
import styles from './Grelha.module.css'

/**
 * Grelha de letras com seleção por arrasto (dedo ou rato).
 *
 * Props:
 * - letras: a grelha, ex.: [['G','A','T','O',...], ...]
 * - porEncontrar: palavras ainda escondidas, ex.: ['GATO']
 * - encontradas: palavras já encontradas e as suas células,
 *     ex.: [{ palavra: 'GATO', celulas: [{linha, coluna}, ...] }]
 * - aoEncontrar(palavra, celulas): chamada quando a criança encontra uma palavra
 * - aoErrar(): chamada quando larga o dedo numa seleção que não é palavra
 * - bloqueada: se true, ignora toques (ex.: durante a festa)
 */
function Grelha({ letras, porEncontrar, encontradas, aoEncontrar, aoErrar, bloqueada = false }) {
  const tamanho = letras.length
  const caixaRef = useRef(null) // o elemento da grelha, para saber onde está no ecrã
  const inicioRef = useRef(null) // célula onde o dedo começou
  const [selecao, setSelecao] = useState([]) // células selecionadas agora
  const [errou, setErrou] = useState(0) // conta os erros, para repetir o abanão

  /** Célula debaixo do dedo/rato, a partir do evento. */
  function celulaDoEvento(evento) {
    const caixa = caixaRef.current.getBoundingClientRect()
    return celulaNoPonto(evento.clientX, evento.clientY, caixa, tamanho)
  }

  // ----- Pointer events: funcionam igual com dedo, rato ou caneta -----

  function aoPousar(evento) {
    if (bloqueada || !evento.isPrimary) return // ignora um segundo dedo
    // "Agarra" o ponteiro: os eventos seguintes chegam aqui mesmo se o dedo
    // sair da grelha
    evento.currentTarget.setPointerCapture(evento.pointerId)
    const celula = celulaDoEvento(evento)
    inicioRef.current = celula
    setSelecao([celula])
  }

  function aoMover(evento) {
    if (!inicioRef.current) return // não está a arrastar
    const atual = celulaDoEvento(evento)
    setSelecao(celulasSelecionadas(inicioRef.current, atual, tamanho))
  }

  function aoLevantar() {
    if (!inicioRef.current) return
    inicioRef.current = null

    const palavra = verificarSelecao(letras, selecao, porEncontrar)
    if (palavra) {
      aoEncontrar(palavra, selecao)
    } else if (selecao.length > 1) {
      // Só conta como erro se arrastou; um toque numa letra não é erro
      setErrou((n) => n + 1)
      aoErrar()
    }
    setSelecao([])
  }

  function aoCancelar() {
    // O sistema interrompeu o toque (ex.: uma notificação): esquece a seleção
    inicioRef.current = null
    setSelecao([])
  }

  // ----- Desenho -----

  /** Cor da palavra encontrada a que a célula pertence (ou null). */
  function corDaCelula(celula) {
    const i = encontradas.findIndex((e) => e.celulas.some((c) => mesmaCelula(c, celula)))
    return i === -1 ? null : corDaPalavra(i)
  }

  return (
    <motion.div
      // A chave muda a cada erro, para a grelha abanar de novo
      key={errou}
      ref={caixaRef}
      className={styles.grelha}
      style={{ '--tamanho': tamanho }}
      onPointerDown={aoPousar}
      onPointerMove={aoMover}
      onPointerUp={aoLevantar}
      onPointerCancel={aoCancelar}
      animate={errou ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
      transition={{ duration: 0.4 }}
      role="grid"
      aria-label="Sopa de letras"
      data-toque // ao pousar o dedo na grelha ouve-se o "toque" (ver audio/efeitos.js)
    >
      {letras.map((linha, l) =>
        linha.map((letra, c) => {
          const celula = { linha: l, coluna: c }
          const selecionada = selecao.some((s) => mesmaCelula(s, celula))
          const cor = corDaCelula(celula)

          return (
            <div
              key={`${l}-${c}`}
              className={`${styles.celula} ${selecionada ? styles.selecionada : ''}`}
              style={cor ? { '--cor': cor } : undefined}
              data-encontrada={cor ? '' : undefined}
              role="gridcell"
            >
              {letra}
            </div>
          )
        }),
      )}
    </motion.div>
  )
}

export default Grelha
