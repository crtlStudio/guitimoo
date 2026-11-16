import { motion } from 'motion/react'
import { useState, useSyncExternalStore } from 'react'
import { inscrever as inscreverEstrelas, totalAtual } from '../games/estrelas'
import { apagarProgresso } from '../games/progresso/estado'
import { resumoDoProgresso } from '../games/progresso/progresso'
import { porExtenso } from '../games/progresso/textos'
import { useProgresso } from './useProgresso'
import styles from './ApagarProgresso.module.css'

/**
 * Apagar o progresso, só para adultos (dentro da janela das Definições).
 * Dois passos:
 * 1. 'adulto': escrever um número que aparece por extenso ("setenta e três").
 *    Quem ainda não lê não passa daqui.
 * 2. 'confirmar': mostra o que se vai perder; "Cancelar" é o botão grande.
 * Apaga as estrelas, as peças, os projetos e o total ⭐. O nível e a mascote ficam.
 *
 * Props:
 * - numero: o número a escrever (20 a 99; escolhido por quem abre)
 * - aoCancelar: volta às Definições
 * - aoApagar: depois de apagar (fecha e volta aos jogos)
 */
function ApagarProgresso({ numero, aoCancelar, aoApagar }) {
  const [passo, setPasso] = useState('adulto')
  const [escrito, setEscrito] = useState('')
  const [errou, setErrou] = useState(0) // conta os erros (para o abanão repetir)
  const progresso = useProgresso()
  const estrelas = useSyncExternalStore(inscreverEstrelas, totalAtual)

  function verificar(evento) {
    evento.preventDefault() // o formulário não recarrega a página
    if (Number(escrito.trim()) === numero) {
      setPasso('confirmar')
    } else {
      setErrou((n) => n + 1)
      setEscrito('')
    }
  }

  function apagar() {
    apagarProgresso()
    aoApagar()
  }

  if (passo === 'adulto') {
    return (
      <form className={styles.caixa} onSubmit={verificar}>
        <h2 className={styles.titulo}>🔒 Só para adultos</h2>
        <label className={styles.frase} htmlFor="apagar-numero">
          Para continuar, escreve em algarismos o número:
          <strong className={styles.numero}>{porExtenso(numero)}</strong>
        </label>
        <motion.input
          key={errou}
          id="apagar-numero"
          className={`${styles.campo} ${errou ? styles.campoErrado : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          value={escrito}
          onChange={(e) => setEscrito(e.target.value.replace(/\D/g, ''))}
          animate={errou ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.4 }}
          aria-invalid={errou > 0}
          autoFocus
        />
        <div className={styles.botoes}>
          <button type="button" className={styles.cancelar} onClick={aoCancelar}>
            Cancelar
          </button>
          <button type="submit" className={styles.continuar} disabled={escrito.length === 0}>
            Continuar
          </button>
        </div>
      </form>
    )
  }

  const { pecas, projetos } = progresso ? resumoDoProgresso(progresso) : { pecas: 0, projetos: 0 }

  return (
    <div className={styles.caixa}>
      <h2 className={styles.titulo}>Apagar o progresso?</h2>
      <p className={styles.frase}>Vai ser apagado:</p>
      <ul className={styles.lista}>
        <li>
          ⭐ {estrelas} {estrelas === 1 ? 'estrela' : 'estrelas'}
        </li>
        <li>
          🧱 {pecas} {pecas === 1 ? 'peça' : 'peças'}
        </li>
        <li>
          🏠 {projetos} {projetos === 1 ? 'projeto acabado' : 'projetos acabados'}
        </li>
      </ul>
      <p className={styles.nota}>O nível e a mascote escolhida ficam. Não dá para desfazer.</p>
      <div className={styles.botoes}>
        <button type="button" className={styles.cancelar} onClick={aoCancelar} autoFocus>
          Cancelar
        </button>
        <button type="button" className={styles.apagar} onClick={apagar}>
          Apagar tudo
        </button>
      </div>
    </div>
  )
}

export default ApagarProgresso
