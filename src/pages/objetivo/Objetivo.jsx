import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prepararEfeitos, tocarEfeito } from '../../audio/efeitos'
import EcraEscolha from '../../components/EcraEscolha'
import Festa from '../../components/Festa'
import IconeJogo from '../../components/IconeJogo'
import ImagemMascote from '../../components/ImagemMascote'
import Peca from '../../components/Peca'
import { useMascoteAtiva } from '../../components/useProgresso'
import { PECAS_POR_COR } from '../../games/progresso/config'
import { marcarObjetivoComoVisto } from '../../games/progresso/estado'
import { jogosAtivos } from '../../games/progresso/progresso'
// O mesmo aspeto da construção (a criança reconhece-o depois): usamos os estilos dela
import construcao from '../construcao/Construcao.module.css'
import styles from './Objetivo.module.css'

/**
 * Onde fica a ponta do dedo, quando toca no botão do jogo `i` (em cqw,
 * dentro das torres). Tem de bater certo com o Construcao.module.css:
 * - cada torre tem 6.4cqw e há 1.2cqw entre torres → o centro do botão i
 *   fica em 3.2 + i × 7.6
 * - de cima até ao centro do botão: ✓ (5.6) + 1 + lugares (32) + 1 + metade do botão (3.2)
 */
const DEDO_X = (i) => 3.2 + i * 7.6
const DEDO_Y = 42.8

/**
 * A "coreografia" da demonstração, que se repete sem parar. Cada passo dura
 * `ms` milissegundos e diz como fica tudo:
 * - dedo: o jogo onde o dedo está (0..4), ou null = escondido
 * - toca: o dedo carrega e saltam estrelas do botão
 * - pecas: quantas peças tem cada cor (uma lista com 5 números)
 * - som: toca o som da peça a cair
 * - festa: o projeto ficou completo
 *
 * 1. Em cada jogo: o dedo vai ao botão, carrega, saltam ⭐, cai 1 peça.
 * 2. Depois as peças que faltam caem todas, depressa, até o projeto encher.
 * 3. Festa! E volta ao princípio.
 */
function criarPassos(quantos) {
  const zeros = Array(quantos).fill(0)
  const passos = [{ ms: 900, dedo: null, toca: false, pecas: zeros, festa: false }]
  let pecas = zeros

  // 1. Uma peça de cada cor, com o dedo
  for (let i = 0; i < quantos; i++) {
    passos.push({ ms: 800, dedo: i, toca: false, pecas, festa: false })
    passos.push({ ms: 900, dedo: i, toca: true, pecas, festa: false })
    pecas = pecas.map((n, j) => (j === i ? n + 1 : n))
    passos.push({ ms: 900, dedo: i, toca: false, pecas, festa: false, som: true })
  }

  // 2. O resto, depressa (fila a fila, da esquerda para a direita)
  for (let fila = 1; fila < PECAS_POR_COR; fila++) {
    for (let i = 0; i < quantos; i++) {
      pecas = pecas.map((n, j) => (j === i ? n + 1 : n))
      passos.push({ ms: 130, dedo: null, toca: false, pecas, festa: false })
    }
  }

  // 3. Festa
  passos.push({ ms: 4000, dedo: null, toca: false, pecas, festa: true })
  return passos
}

/**
 * Página do objetivo: aparece a seguir ao nível, na 1.ª vez com cada mascote.
 * Sem palavras: o dedo mostra que jogar dá estrelas, as estrelas dão peças
 * da cor do jogo, e as peças enchem de cor o projeto da mascote (a casa do
 * Sapo, o bosque do Panda, ...). O ▶ segue para os jogos.
 */
function Objetivo() {
  const navegar = useNavigate()
  const mascote = useMascoteAtiva()
  const ativos = jogosAtivos()
  const [passos] = useState(() => criarPassos(ativos.length))
  const [i, setI] = useState(0)
  const passo = passos[i]

  // Avança um passo de cada vez; no fim, volta ao princípio
  useEffect(() => {
    const temporizador = setTimeout(() => {
      const seguinte = (i + 1) % passos.length
      if (passos[seguinte].som) tocarEfeito('cubinho')
      setI(seguinte)
    }, passos[i].ms)
    return () => clearTimeout(temporizador)
  }, [i, passos])

  if (!mascote) return null

  const total = passo.pecas.reduce((soma, n) => soma + n, 0)
  const fracao = total / (ativos.length * PECAS_POR_COR)
  const rapido = passos[i].ms < 300 || (i > 0 && passos[i - 1].ms < 300) // a encher depressa

  function seguir() {
    prepararEfeitos()
    marcarObjetivoComoVisto(mascote.id)
    navegar('/jogos')
  }

  return (
    <EcraEscolha
      titulo={
        <span className={construcao.titulo}>
          <ImagemMascote mascote={mascote} className={construcao.tituloMascote} />
          <span aria-label={mascote.projeto}>{mascote.iconeProjeto}</span>
        </span>
      }
      voltar="/nivel"
    >
      {/* A mascote: salta a cada peça e, na festa, aos pulos */}
      <div className={construcao.mascote}>
        <motion.span
          key={passo.festa ? 'festa' : total}
          className={construcao.mascoteSalta}
          animate={
            passo.festa
              ? { y: ['0cqw', '-4cqw', '0cqw', '-4cqw', '0cqw'], rotate: [0, -10, 10, -6, 0] }
              : total > 0 && !rapido
                ? { y: ['0cqw', '-3cqw', '0cqw'], rotate: [0, -8, 0] }
                : undefined
          }
          transition={{ duration: passo.festa ? 1.2 : 0.45 }}
        >
          <ImagemMascote mascote={mascote} className={construcao.mascoteImagem} />
        </motion.span>
      </div>

      {/* O projeto: fantasma cinzento + a cor a subir de baixo para cima */}
      <div className={construcao.projeto} role="img" aria-label={`Enche de cor ${mascote.projeto}`}>
        <span className={construcao.fantasma} aria-hidden="true">
          {mascote.iconeProjeto}
        </span>
        <motion.span
          className={construcao.colorido}
          aria-hidden="true"
          initial={false}
          animate={{ clipPath: `inset(${(1 - fracao) * 100}% 0% 0% 0%)`, scale: passo.festa ? [1, 1.12, 1] : 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          {mascote.iconeProjeto}
        </motion.span>
      </div>

      {/* As torres (só para ver: nesta página não se joga) */}
      <div className={construcao.torres} aria-hidden="true">
        {ativos.map((j, n) => {
          const pecas = passo.pecas[n]
          const aTocar = passo.dedo === n && passo.toca
          return (
            <div key={j.id} className={construcao.torre} style={{ '--cor': j.hex }}>
              <span className={construcao.certoLugar}>
                {pecas >= PECAS_POR_COR && (
                  <motion.span
                    className={construcao.certo}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  >
                    ✓
                  </motion.span>
                )}
              </span>

              <div className={construcao.lugares}>
                {Array.from({ length: PECAS_POR_COR }, (_, lugar) =>
                  lugar < pecas ? (
                    <motion.span
                      key={`${lugar}-cheio`}
                      className={construcao.cheio}
                      initial={{ y: rapido ? '-6cqw' : '-30cqw', opacity: 0 }}
                      animate={{ y: '0cqw', opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    >
                      <Peca mascote={mascote} jogo={j} className={construcao.pecaLugar} />
                    </motion.span>
                  ) : (
                    <span key={`${lugar}-vazio`} className={construcao.vazio} />
                  ),
                )}
              </div>

              <motion.span
                className={`${construcao.jogo} ${passo.dedo === n ? construcao.alvo : ''}`}
                animate={{ scale: aTocar ? [1, 0.88, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <IconeJogo jogo={j} className={construcao.jogoIcone} />
              </motion.span>

              {/* Ao tocar: saltam 3 estrelas do botão */}
              {aTocar &&
                [-1, 0, 1].map((lado) => (
                  <motion.span
                    key={`${i}-${lado}`}
                    className={styles.estrela}
                    initial={{ x: '-50%', y: '0cqw', opacity: 0, scale: 0.4 }}
                    animate={{ x: `calc(-50% + ${lado * 3}cqw)`, y: '-14cqw', opacity: [0, 1, 1, 0], scale: 1 }}
                    transition={{ duration: 0.85, delay: 0.15 + (lado + 1) * 0.08, ease: 'easeOut' }}
                  >
                    ⭐
                  </motion.span>
                ))}
            </div>
          )
        })}

        {/* O dedo: vai de botão em botão e carrega */}
        {passo.dedo !== null && (
          <motion.span
            className={styles.dedo}
            initial={{ left: `${DEDO_X(passo.dedo)}cqw`, top: `${DEDO_Y + 8}cqw`, opacity: 0 }}
            animate={{
              left: `${DEDO_X(passo.dedo)}cqw`,
              top: `${DEDO_Y}cqw`,
              opacity: 1,
              scale: passo.toca ? [1, 0.75, 1] : 1,
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            👆
          </motion.span>
        )}
      </div>

      {/* Seguir para os jogos */}
      <motion.button
        type="button"
        className={construcao.jogar}
        onClick={seguir}
        aria-label="Vamos jogar!"
        whileTap={{ scale: 0.88 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ▶
      </motion.button>

      {passo.festa && <Festa semente={`objetivo-${mascote.id}`} origem={{ x: 35, y: 45 }} />}
    </EcraEscolha>
  )
}

export default Objetivo
