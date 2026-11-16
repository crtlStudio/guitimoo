import { useDroppable } from '@dnd-kit/core'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useEffect, useState } from 'react'
import imagemBracoDireito from '../../assets/matematica/braco_direito.png'
import imagemBracoEsquerdo from '../../assets/matematica/braco_esquerdo.png'
import imagemBalanca from '../../assets/matematica/balanca.webp'
import { arrumarPrato } from '../../games/matematica/arrumacao'
import { calcularAngulo, calcularDescidas } from '../../games/matematica/balanca'
import { medidasDosBracos, PONTEIRO, posicaoDoSuporte, CUBINHO, SUPORTE, ZONA_DO_PRATO } from './medidas'
import Cubinho from './Cubinho'
import styles from './Balanca.module.css'

/**
 * A balança: o suporte e os dois braços. O braço com mais peso desce a
 * direito (sem inclinar) e o outro fica onde está; o ponteiro do botão azul aponta
 * para o lado mais pesado.
 *
 * Props:
 * - pratos: { esquerda: [{ id, cor }] } — os cubinhos no prato esquerdo,
 *   pela ordem em que chegaram (o prato direito nunca tem cubinhos)
 * - numeroDireita: o número no prato direito (pesa o que vale: um 7 pesa
 *   como 7 cubinhos), ou null = prato direito vazio
 * - pintas: mostrar pintas por baixo do número (para os 3–4 contarem)
 * - bloqueada: true = os cubinhos do prato já não se podem tirar
 * - festejar: true = a balança dá uns saltos de alegria
 * - contagem: { numero, vez, duracao } — mostra um balãozinho com quantos
 *   cubinhos há no prato esquerdo (muda `vez` para o mostrar outra vez)
 *
 * As peças, de trás para a frente:
 *   1. os dois braços (com os pratos e os cubinhos), que descem a direito; ficam POR TRÁS do suporte: parecem sair de dentro dele
 *   2. o suporte
 *   3. o ponteiro no botão azul, que mostra para que lado a balança pesa
 */
function Balanca({ pratos, numeroDireita = null, pintas = false, bloqueada = false, festejar = false, contagem = null }) {
  const { esquerda: x, topo: y, eixo, bracos: origem } = posicaoDoSuporte()
  const bracos = medidasDosBracos()
  const pesoEsquerda = pratos.esquerda.length
  const pesoDireita = numeroDireita ?? 0
  const angulo = calcularAngulo(pesoEsquerda, pesoDireita) // para o ponteiro
  // Quanto desce cada braço (cqw): só o mais pesado desce, a direito; o outro fica onde está
  const desce = calcularDescidas(pesoEsquerda, pesoDireita)

  // Festa: a balança toda (suporte, braços e cubinhos) dá dois saltos
  const [balanca, animar] = useAnimate()
  useEffect(() => {
    if (festejar) animar(balanca.current, { y: ['0cqw', '-3cqw', '0cqw', '-1.6cqw', '0cqw'] }, { duration: 0.9, ease: 'easeOut' })
  }, [festejar, animar, balanca])

  // A mesma mola para os braços e para o ponteiro: mexem-se juntos.
  // Pouco travada: passa um bocadinho e balança antes de parar, como uma balança a sério
  const mola = { type: 'spring', stiffness: 90, damping: 7, mass: 1.2 }

  // Posição/tamanho do suporte
  const lugarDoSuporte = { left: `${x}cqw`, top: `${y}cqw`, width: `${SUPORTE.largura}cqw` }
  // Um braço, com a ponta do tubo encostada ao eixo (ver medidasDosBracos)
  const lugarDoBraco = (b) => ({
    left: `${b.esquerda}cqw`,
    top: `${b.topo}cqw`,
    width: `${b.largura}cqw`,
    height: `${b.altura}cqw`,
  })

  return (
    <div ref={balanca} className={styles.balanca}>
      {/* Os dois braços, cada um num "ponto" atrás do suporte (à altura dos ombros). Não inclinam: ficam
          sempre na horizontal e o mais pesado desce a direito (por trás do suporte,
          a ponta do tubo fica escondida na barriga). Cada braço leva o seu prato e cubinhos. */}
      <motion.div
        className={styles.barra}
        style={{ left: `${origem.x}cqw`, top: `${origem.y}cqw` }}
        animate={{ y: `${desce.esquerda}cqw` }}
        transition={mola}
        data-braco="esquerdo"
        data-angulo={angulo}
      >
        <img className={styles.braco} src={imagemBracoEsquerdo} alt="" draggable="false" style={lugarDoBraco(bracos.esquerdo)} />
        <Prato id="esquerda" centro={bracos.esquerdo.prato} cubinhos={pratos.esquerda} bloqueada={bloqueada} contagem={contagem} />
      </motion.div>
      <motion.div
        className={styles.barra}
        style={{ left: `${origem.x}cqw`, top: `${origem.y}cqw` }}
        animate={{ y: `${desce.direita}cqw` }}
        transition={mola}
        data-braco="direito"
      >
        <img className={styles.braco} src={imagemBracoDireito} alt="" draggable="false" style={lugarDoBraco(bracos.direito)} />
        <NumeroNoPrato centro={bracos.direito.prato} numero={numeroDireita} pintas={pintas} />
      </motion.div>

      <img className={styles.suporte} src={imagemBalanca} alt="Balança" draggable="false" style={lugarDoSuporte} />

      {/* O ponteiro no botão azul: para cima = equilibrada; roda para o lado mais pesado */}
      <motion.div
        className={styles.ponteiro}
        style={{
          left: `${eixo.x - PONTEIRO.comprimento * 0.2}cqw`,
          top: `${eixo.y - PONTEIRO.comprimento * 0.8}cqw`,
          width: `${PONTEIRO.comprimento * 0.4}cqw`,
          height: `${PONTEIRO.comprimento}cqw`,
          // Roda à volta do pino, que está no centro do botão (80% da altura da caixa)
          originX: 0.5,
          originY: 0.8,
        }}
        animate={{ rotate: angulo * PONTEIRO.exagero }}
        transition={mola}
        data-ponteiro={angulo * PONTEIRO.exagero}
        aria-hidden="true"
      >
        <svg viewBox="-10 -40 20 50">
          {/* agulha (com contorno branco, para se ver em cima do botão azul) */}
          <path d="M0 -38 L5 0 L-5 0 Z" className={styles.agulhaContorno} />
          <path d="M0 -38 L5 0 L-5 0 Z" className={styles.agulha} />
          {/* o "pino" do meio, como num relógio */}
          <circle r="5.5" className={styles.pino} />
        </svg>
      </motion.div>
    </div>
  )
}

/**
 * Um prato: a zona onde se pode largar um cubinho (maior do que o prato,
 * para ser fácil acertar) e os cubinhos arrumados em filas por cima.
 * - id: 'esquerda' (é este nome que o @dnd-kit devolve ao largar)
 * - centro: centro do prato, na linha de cima do prato (cqw, relativo ao braço)
 */
function Prato({ id, centro, cubinhos, bloqueada, contagem }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  // Poucos: grandes, em filas de 3. Muitos: mais pequenos, em grupos de 5 e de 10
  const { tamanho, posicoes } = arrumarPrato(cubinhos.length, { grande: CUBINHO.noPrato, pequeno: CUBINHO.noPratoPequeno })

  return (
    <>
      <div
        ref={setNodeRef}
        className={`${styles.zona} ${isOver ? styles.zonaPorCima : ''}`}
        aria-label={`Prato da ${id}`}
        style={{
          left: `${centro.x - ZONA_DO_PRATO.largura / 2}cqw`,
          top: `${centro.y - ZONA_DO_PRATO.altura}cqw`,
          width: `${ZONA_DO_PRATO.largura}cqw`,
          height: `${ZONA_DO_PRATO.altura + ZONA_DO_PRATO.abaixo}cqw`,
        }}
      />
      {cubinhos.map(({ id: idCubinho, cor }, i) => (
        <Cubinho
          key={idCubinho}
          id={idCubinho}
          cor={cor}
          tamanho={tamanho}
          // A base fica um bocadinho "dentro" do prato, para parecer assente
          x={centro.x + posicoes[i].x * tamanho}
          y={centro.y + posicoes[i].y * tamanho + tamanho * 0.12}
          bloqueado={bloqueada}
        />
      ))}

      {/* O balãozinho com a contagem, por cima do monte de cubinhos (o key faz
          cada contagem nova aparecer outra vez, com o seu próprio tempo) */}
      {contagem && (
        <BalaoContagem
          key={contagem.vez}
          numero={contagem.numero}
          duracao={contagem.duracao}
          x={centro.x}
          // Por cima do cubinho mais alto do prato (ou do prato, se estiver vazio)
          y={centro.y + Math.min(0, ...posicoes.map((p) => p.y)) * tamanho - (cubinhos.length ? tamanho : 0) - 0.8}
        />
      )}
    </>
  )
}

/**
 * Balãozinho com um número (quantos cubinhos há no prato), que aparece
 * com um pulo e desaparece sozinho ao fim de `duracao` milissegundos.
 * - x, y: o ponto onde fica a pontinha do balão (cqw, relativo ao braço)
 */
function BalaoContagem({ numero, duracao, x, y }) {
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    const temporizador = setTimeout(() => setVisivel(false), duracao)
    return () => clearTimeout(temporizador)
  }, [duracao])

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          className={styles.contagem}
          style={{ left: `${x - 4}cqw`, top: `${y - 6.2}cqw` }}
          initial={{ opacity: 0, scale: 0.4, y: '1cqw' }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          role="status"
          aria-label={`${numero} ${numero === 1 ? 'cubinho' : 'cubinhos'} no prato`}
        >
          {numero}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * O número no prato direito, com o estilo dourado do jogo, assente no prato.
 * Quando muda, aparece com um pulo. Com `pintas`, mostra por baixo uma
 * pinta por unidade (como num dado), para quem ainda está a aprender os números.
 */
function NumeroNoPrato({ centro, numero, pintas }) {
  return (
    <div
      className={styles.numeroNoPrato}
      style={{ left: `${centro.x - 8}cqw`, top: `${centro.y - 16}cqw`, width: '16cqw', height: '16cqw' }}
      aria-label={numero === null ? 'Prato da direita vazio' : `Prato da direita: ${numero}`}
    >
      <AnimatePresence>
        {numero !== null && (
          <motion.div
            key={numero}
            className={styles.numeroCaixa}
            initial={{ y: '-6cqw', opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
          >
            <span className={styles.numero}>{numero}</span>
            {pintas && (
              <span className={styles.pintas} aria-hidden="true">
                {Array.from({ length: numero }, (_, i) => (
                  <span key={i} className={styles.pinta} />
                ))}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Balanca
