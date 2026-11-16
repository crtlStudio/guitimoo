import { motion } from 'motion/react'
import { PROFISSOES } from '../../games/detetive/profissoes'
import Lupa from './Lupa'
import Retrato, { ImagemLocal } from './Retrato'
import styles from './Instrucoes.module.css'

// O objetivo de cada nível: título, frase curta e a demonstração.
// As pessoas são ids de profissões (aparecem com a sua imagem).
const NIVEIS = {
  '3-4': {
    titulo: 'De quem é isto?',
    frase: 'Olha pela lupa. Toca em quem usa esta coisa!',
    pista: '🔨',
    pessoas: ['cozinheiro', 'construtor', 'medico'],
    certa: 1,
  },
  '5-6': {
    titulo: 'Quem é?',
    frase: 'Toca no ? para ver mais pistas. Depois toca na pessoa certa!',
    pistas: ['🧯', '🔥', '🪜'],
    pessoas: ['agricultor', 'bombeiro', 'policia', 'professor'],
    certa: 1,
  },
  '7-8': {
    titulo: 'Onde trabalha?',
    frase: 'Arrasta cada pessoa para o sítio onde trabalha.',
    locais: ['medico', 'professor', 'bombeiro'], // os locais destas profissões
    pessoa: 'bombeiro',
    certo: 2,
  },
}

const DURACAO = 2.8 // segundos de cada repetição da demonstração

/** A imagem de uma profissão pelo id (para as demonstrações). */
function Pessoa({ id, className }) {
  return <Retrato profissao={PROFISSOES.find((p) => p.id === id)} className={className} />
}

/** A imagem do local de uma profissão, pelo id da profissão (para as demonstrações). */
function LocalDe({ id, className }) {
  return <ImagemLocal local={PROFISSOES.find((p) => p.id === id).local} className={className} />
}

/**
 * Demonstração animada (sem texto): a lupa com a pista e 3 pessoas.
 * Um dedo vem tocar na pessoa certa, que fica verde e dá um pulo. Repete.
 */
function Demonstracao({ pista, pessoas, certa }) {
  const repetir = { duration: DURACAO, repeat: Infinity, ease: 'easeInOut' }
  // Momentos da animação, de 0 a 1: o dedo chega, toca, fica verde, apaga
  const tempos = [0, 0.35, 0.45, 0.85, 1]

  return (
    <div className={styles.demo} aria-hidden="true">
      <Lupa className={styles.lupa} quieta>
        {pista}
      </Lupa>
      <div className={styles.pessoas}>
        {pessoas.map((pessoa, i) => (
          <motion.span
            key={i}
            className={styles.pessoa}
            animate={
              i === certa
                ? {
                    backgroundColor: ['#fffdf6', '#fffdf6', '#7ed957', '#7ed957', '#fffdf6'],
                    y: ['0cqw', '0cqw', '-1cqw', '0cqw', '0cqw'],
                  }
                : undefined
            }
            transition={i === certa ? { ...repetir, times: tempos } : undefined}
          >
            <Pessoa id={pessoa} className={styles.retrato} />
          </motion.span>
        ))}
        {/* O dedo: vem de baixo, toca na pessoa certa e vai embora */}
        <motion.span
          className={styles.dedo}
          style={{ left: `${(certa + 0.5) * (100 / pessoas.length)}%` }}
          animate={{
            y: ['4cqw', '0.5cqw', '0.5cqw', '0.5cqw', '4cqw'],
            scale: [1, 0.85, 0.85, 1, 1],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ ...repetir, times: tempos }}
        >
          👆
        </motion.span>
      </div>
    </div>
  )
}

// Medidas da demonstração do nível médio, em cqw (iguais às do CSS)
const LUPA = 7.5
const ESPACO_LUPAS = 2.5
const PESSOA = 7
const ESPACO_PESSOAS = 1
const LARGURA = 32 // a largura da demonstração
const ALTURA_PESSOAS = LUPA + 2.5 // onde começa a fila das pessoas (por baixo das lupas)

/** O centro (em cqw) do elemento i de uma fila centrada na demonstração. */
function centro(i, quantos, tamanho, espaco) {
  const total = quantos * tamanho + (quantos - 1) * espaco
  return (LARGURA - total) / 2 + i * (tamanho + espaco) + tamanho / 2
}

/**
 * Demonstração do nível médio (sem texto): 3 lupas (a 1.ª com uma pista,
 * as outras com "?") e 4 pessoas. O dedo toca no 2.º "?", que vira pista;
 * depois toca na pessoa certa, que fica verde. Repete.
 */
function DemonstracaoPistas({ pistas, pessoas, certa }) {
  const repetir = { duration: DURACAO * 1.6, repeat: Infinity, ease: 'easeInOut' }
  // Momentos: o dedo chega ao "?", toca (a pista aparece), vai à pessoa, toca, apaga
  const tempos = [0, 0.2, 0.3, 0.55, 0.62, 0.9, 1]
  const xLupa = centro(1, pistas.length, LUPA, ESPACO_LUPAS)
  const xPessoa = centro(certa, pessoas.length, PESSOA, ESPACO_PESSOAS)
  const yLupa = LUPA * 0.7
  const yPessoa = ALTURA_PESSOAS + PESSOA * 0.7
  const cqw = (n) => `${n}cqw`

  return (
    <div className={styles.demoPistas} aria-hidden="true">
      <div className={styles.lupas}>
        {pistas.map((pista, i) => (
          <Lupa key={i} className={styles.lupaPequena} quieta>
            {i === 0 && pista}
            {i === 1 && (
              <span className={styles.troca}>
                <motion.span
                  className={styles.interrogacao}
                  animate={{ opacity: [1, 1, 0, 0, 0, 0, 1] }}
                  transition={{ ...repetir, times: tempos }}
                >
                  ?
                </motion.span>
                <motion.span animate={{ opacity: [0, 0, 1, 1, 1, 1, 0] }} transition={{ ...repetir, times: tempos }}>
                  {pista}
                </motion.span>
              </span>
            )}
            {i === 2 && <span className={styles.interrogacao}>?</span>}
          </Lupa>
        ))}
      </div>

      <div className={styles.pessoasPequenas}>
        {pessoas.map((pessoa, i) => (
          <motion.span
            key={i}
            className={styles.pessoaPequena}
            animate={
              i === certa
                ? { backgroundColor: ['#fffdf6', '#fffdf6', '#fffdf6', '#fffdf6', '#7ed957', '#7ed957', '#fffdf6'] }
                : undefined
            }
            transition={i === certa ? { ...repetir, times: tempos } : undefined}
          >
            <Pessoa id={pessoa} className={styles.retrato} />
          </motion.span>
        ))}
      </div>

      {/* O dedo: vai ao "?", toca, vai à pessoa certa, toca e sai */}
      <motion.span
        className={styles.dedoPistas}
        animate={{
          x: [xLupa, xLupa, xLupa, xPessoa, xPessoa, xPessoa, xLupa].map(cqw),
          y: [yLupa + 3, yLupa, yLupa, yPessoa, yPessoa, yPessoa, yLupa + 3].map(cqw),
          scale: [1, 0.85, 1, 1, 0.85, 1, 1],
          opacity: [0, 1, 1, 1, 1, 1, 0],
        }}
        transition={{ ...repetir, times: tempos }}
      >
        👆
      </motion.span>
    </div>
  )
}

// Medidas da demonstração do nível difícil, em cqw (iguais às do CSS)
const LOCAL = 8.5
const ESPACO_LOCAIS = 2.5
const ALTURA = 18 // a altura da demonstração (a pessoa começa em baixo)

/**
 * Demonstração do nível difícil (sem texto): 3 locais em cima e uma pessoa
 * em baixo. O dedo arrasta a pessoa até ao local certo, que fica verde. Repete.
 */
function DemonstracaoArrastar({ locais, pessoa, certo }) {
  const repetir = { duration: DURACAO * 1.4, repeat: Infinity, ease: 'easeInOut' }
  // Momentos: o dedo pousa na pessoa, arrasta, larga (fica verde), apaga
  const tempos = [0, 0.15, 0.6, 0.7, 0.92, 1]
  const xInicio = LARGURA / 2
  const xLocal = centro(certo, locais.length, LOCAL, ESPACO_LOCAIS)
  const yInicio = ALTURA - PESSOA / 2
  const yLocal = LOCAL / 2
  const cqw = (n) => `${n}cqw`
  // A pessoa e o dedo andam juntos (o dedo um pouco abaixo do centro da pessoa)
  const xs = [xInicio, xInicio, xLocal, xLocal, xLocal, xInicio].map(cqw)
  const ys = [yInicio, yInicio, yLocal, yLocal, yLocal, yInicio].map(cqw)

  return (
    <div className={styles.demoArrastar} aria-hidden="true">
      <div className={styles.lupas}>
        {locais.map((local, i) => (
          <motion.span
            key={i}
            className={styles.localPequeno}
            animate={i === certo ? { backgroundColor: ['#fffdf6', '#fffdf6', '#fffdf6', '#7ed957', '#7ed957', '#fffdf6'] } : undefined}
            transition={i === certo ? { ...repetir, times: tempos } : undefined}
          >
            <LocalDe id={local} className={styles.retrato} />
          </motion.span>
        ))}
      </div>

      <motion.span
        className={styles.pessoaArrastada}
        animate={{ x: xs, y: ys, scale: [1, 1.1, 1.1, 0.7, 0.7, 1], opacity: [1, 1, 1, 1, 0, 0] }}
        transition={{ ...repetir, times: tempos }}
      >
        <Pessoa id={pessoa} className={styles.retrato} />
      </motion.span>
      <motion.span
        className={styles.dedoArrastar}
        animate={{ x: xs, y: ys, opacity: [0, 1, 1, 0, 0, 0] }}
        transition={{ ...repetir, times: tempos }}
      >
        👆
      </motion.span>
    </div>
  )
}

/**
 * Ecrã com o objetivo do jogo, antes de começar.
 * Props: escalao ('3-4', ...) e aoComecar (função do botão).
 */
function Instrucoes({ escalao, aoComecar }) {
  const nivel = NIVEIS[escalao]
  if (!nivel) return null

  return (
    <motion.div
      className={styles.cartao}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <h2 className={styles.titulo}>{nivel.titulo}</h2>
      <p className={styles.frase}>{nivel.frase}</p>

      {nivel.locais && <DemonstracaoArrastar locais={nivel.locais} pessoa={nivel.pessoa} certo={nivel.certo} />}
      {nivel.pistas && <DemonstracaoPistas pistas={nivel.pistas} pessoas={nivel.pessoas} certa={nivel.certa} />}
      {nivel.pista && <Demonstracao pista={nivel.pista} pessoas={nivel.pessoas} certa={nivel.certa} />}

      <motion.button
        type="button"
        className={styles.comecar}
        onClick={aoComecar}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Vamos jogar!"
        autoFocus
      >
        ▶
      </motion.button>
    </motion.div>
  )
}

export default Instrucoes
