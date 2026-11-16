import { motion } from 'motion/react'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import Retrato from './Retrato'
import styles from './EscolherPessoa.module.css'

/**
 * A fila de pessoas para escolher (níveis fácil e médio), em baixo na praça,
 * com a reação da mascote e a festa. Sem nada para ler.
 * - errada: o cartão abana e a mascote diz "Quase!"
 * - certa: o cartão fica verde, a pista "salta" para a mão da pessoa,
 *   as outras ficam apagadas e há festa
 *
 * Props:
 * - opcoes: as profissões (3 ou 4)
 * - resposta: { id, certa, vez } ou null (de usePergunta)
 * - pista: o objeto que salta para a mão da pessoa certa
 * - numero: o n.º da pergunta (para as animações recomeçarem)
 * - aoTocar(profissao)
 */
function EscolherPessoa({ opcoes, resposta, pista, numero, aoTocar }) {
  const mensagem = resposta && { tipo: resposta.certa ? 'fim' : 'erro', vez: resposta.vez }
  const acertou = resposta?.certa

  return (
    <>
      {/* Reação da mascote depois de cada toque */}
      <BalaoMascote mensagem={mensagem} textos={{ fim: 'Boa!' }} className={styles.mensagem} />

      {acertou && <Festa semente={`detetive-${numero}`} origem={{ x: 50, y: 75 }} />}

      <div className={`${styles.pessoas} ${opcoes.length > 3 ? styles.quatro : ''}`} key={numero}>
        {opcoes.map((profissao, i) => {
          const tocada = resposta?.id === profissao.id
          const certa = tocada && resposta.certa
          const errada = tocada && !resposta.certa
          // Depois de acertar, as outras ficam mais apagadas
          const apagada = acertou && !certa

          return (
            <motion.button
              // Na pessoa errada, a chave muda a cada erro para repetir o abanão
              key={errada ? `${profissao.id}-${resposta.vez}` : profissao.id}
              type="button"
              className={`${styles.pessoa} ${certa ? styles.certa : ''} ${apagada ? styles.apagada : ''}`}
              onClick={() => aoTocar(profissao)}
              aria-label={profissao.nome}
              initial={errada ? false : { opacity: 0, y: 30 }}
              animate={
                certa
                  ? { opacity: 1, y: 0, scale: [1, 1.18, 1.08] }
                  : errada
                    ? { opacity: 1, y: 0, x: [0, -12, 12, -8, 8, 0] }
                    : { opacity: 1, y: 0 }
              }
              transition={errada || certa ? { duration: 0.5 } : { delay: 0.3 + i * 0.1 }}
              whileTap={{ scale: 0.92 }}
            >
              <Retrato profissao={profissao} className={styles.retrato} />
              {/* Ao acertar, a pista "salta" para a mão da pessoa certa */}
              {certa && (
                <motion.span
                  className={styles.pistaNaMao}
                  aria-hidden="true"
                  initial={{ scale: 0, y: '-8cqw' }}
                  animate={{ scale: 1, y: '0cqw' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}
                >
                  {pista}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

export default EscolherPessoa
