import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import imagemAzul from '../../assets/sapo/sapinho_azul.png'
import imagemVerde from '../../assets/sapo/sapinho.png'
import styles from './Instrucoes.module.css'

// O objetivo de cada jogo
const JOGOS = {
  '3-4': {
    titulo: 'Equilibra a balança!',
    frase: 'Põe sapinhos no prato do braço esquerdo até a balança ficar direitinha.',
  },
  '5-6': {
    titulo: 'Contas na balança!',
    frase: 'Põe os sapinhos da conta no prato do braço esquerdo, carrega em «Já está!» e escolhe o número certo.',
  },
  '7-8': {
    titulo: 'Contas na balança!',
    frase: 'Mostra a conta com sapinhos no prato do braço esquerdo, carrega em «Já está!» e escolhe o número certo. Às vezes vais tirar sapinhos ou descobrir o número que falta.',
  },
}

/**
 * Demonstração que se repete sozinha:
 * - 3–4: o número 3 (com as pintas) e os sapinhos a chegar, um a um, até serem 3
 * - 5–6 e 7–8: a conta 2 + 1, os sapinhos de cada cor a chegar e depois o 3
 * `passo` avança sozinho (0, 1, 2, ...); a demonstração tem 5 momentos.
 */
function Demo({ escalao, passo }) {
  const momento = passo % 5 // 0 = vazio, 1..3 = chegam sapinhos, 4 = resultado
  const sapinhos = Math.min(momento, 3)
  // Nas contas: os 2 primeiros são azuis (o 2) e o terceiro verde (o 1)
  const cores = escalao === '3-4' ? [imagemVerde, imagemVerde, imagemVerde] : [imagemAzul, imagemAzul, imagemVerde]

  return (
    <div className={styles.demo} aria-hidden="true">
      {escalao === '3-4' ? (
        <span className={styles.numeroDemo}>
          3<span className={styles.pintas}>•••</span>
        </span>
      ) : (
        <span className={styles.conta}>
          <span className={styles.azul}>2</span> + <span className={styles.verde}>1</span> ={' '}
          <motion.span
            key={momento === 4 ? 'certo' : 'pergunta'}
            className={momento === 4 ? styles.resultado : undefined}
            initial={{ scale: momento === 4 ? 0.3 : 1 }}
            animate={{ scale: 1 }}
          >
            {momento === 4 ? 3 : '?'}
          </motion.span>
        </span>
      )}

      <span className={styles.prato}>
        {cores.map((imagem, i) => (
          <motion.img
            key={i}
            src={imagem}
            alt=""
            className={styles.sapinho}
            animate={{ opacity: i < sapinhos ? 1 : 0, y: i < sapinhos ? 0 : -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          />
        ))}
        {momento === 4 && (
          <motion.span className={styles.visto} initial={{ scale: 0 }} animate={{ scale: 1 }}>
            ✓
          </motion.span>
        )}
      </span>
    </div>
  )
}

/**
 * Ecrã com o objetivo do jogo, antes de começar.
 * Props: escalao ('3-4', '5-6', '7-8') e aoComecar (função do botão).
 */
function Instrucoes({ escalao, aoComecar }) {
  const jogo = JOGOS[escalao]
  // Contador que avança sozinho, para a demonstração se mexer
  const [passo, setPasso] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => setPasso((p) => p + 1), 800)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <motion.div
      className={styles.cartao}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <h2 className={styles.titulo}>{jogo.titulo}</h2>
      <p className={styles.frase}>{jogo.frase}</p>

      <Demo escalao={escalao} passo={passo} />

      <motion.button
        type="button"
        className={styles.comecar}
        onClick={aoComecar}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        Vamos jogar!
      </motion.button>
    </motion.div>
  )
}

export default Instrucoes
