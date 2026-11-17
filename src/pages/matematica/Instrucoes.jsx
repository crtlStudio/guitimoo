import { DndContext } from '@dnd-kit/core'
import { motion } from 'motion/react'
import { Cena, Dedo, InstrucoesEmPaineis, Visto } from '../../components/demonstracao/Demonstracao'
import { usePassos } from '../../components/demonstracao/usePassos'
import { DESCIDA_POR_CUBINHO } from '../../games/matematica/balanca'
import Balanca from './Balanca'
import { DesenhoCubinho } from './Cubinho'
import {
  CHAO_34,
  CHAO_CONTAS,
  CONTAS,
  LOGICA,
  PASSOS_34,
  PASSOS_CONTAS,
  PASSOS_LOGICA,
  PASSOS_QUANTIDADES,
  QUANTIDADES,
} from './passosDasInstrucoes'
import styles from './Instrucoes.module.css'

/** O que o dedo leva na Matemática: um cubinho (cor) ou um cartão (número). */
function desenharLevado(leva) {
  if (typeof leva === 'number') return <span className={`${styles.levado} ${styles.cartaoNumero}`}>{leva}</span>
  return <DesenhoCubinho cor={leva} className={styles.levado} />
}

// ---------- 1. Balança ----------

/**
 * A balança a sério do jogo, em ponto pequeno. Dentro do "mundo", as medidas
 * são as do jogo (1cqw = 1% do mundo), por isso os pontos de medidas.js servem.
 * - 3–4: o 3 no prato direito; o dedo põe 3 cubinhos verdes
 * - 5–6 e 7–8: a conta 2 + 1, cubinhos com as cores, o ✓ e o número
 */
function DemoBalanca({ escalao, aCorrer, aoAcabar }) {
  const contas = escalao !== '3-4'
  const estado = usePassos(contas ? PASSOS_CONTAS : PASSOS_34, aCorrer, aoAcabar)
  const chao = contas ? CHAO_CONTAS : CHAO_34
  const direita = contas ? estado.direita : 3

  return (
    <Cena>
      <div className={styles.mundo}>
        <DndContext>
          <Balanca
            pratos={{ esquerda: estado.prato.map((cor, i) => ({ id: `p${i}`, cor })) }}
            numeroDireita={direita}
            pintas={!contas}
            bloqueada
            festejar={estado.certo}
            porCubinho={DESCIDA_POR_CUBINHO[escalao]}
          />
        </DndContext>

        {/* Os cubinhos no chão */}
        {chao.map(({ id, cor, x, y }) => (
          <motion.span
            key={id}
            className={styles.noChao}
            style={{ left: `${x}cqw`, top: `${y}cqw` }}
            animate={{ opacity: estado.chao.includes(id) ? 1 : 0, scale: estado.chao.includes(id) ? 1 : 0.5 }}
          >
            <DesenhoCubinho cor={cor} className={styles.cuboDoMundo} />
          </motion.span>
        ))}

        {contas && <LinhaDaConta estado={estado} />}
        {estado.certo && <Visto x={50} y={16} />}
        <Dedo estado={estado} tamanho={9} desenharLevado={desenharLevado} />
      </div>
    </Cena>
  )
}

/** Nas contas: o cartão "2 + 1 = ?", o ✓ e (depois) os números para escolher. */
function LinhaDaConta({ estado }) {
  const sitio = ([x, y]) => ({ left: `${x}cqw`, top: `${y}cqw` })
  return (
    <>
      <span
        className={styles.contaMundo}
        style={{ ...sitio([CONTAS.cartao.de, CONTAS.cartao.y]), width: `${CONTAS.cartao.ate - CONTAS.cartao.de}cqw` }}
      />
      {CONTAS.partes.map(({ texto, cor, x }) => (
        <span key={x} className={`${styles.parteDaConta} ${cor ? styles[cor] : ''}`} style={sitio([x, CONTAS.cartao.y])}>
          {cor === 'resultado' && estado.fase === 'certo' ? 3 : texto}
        </span>
      ))}
      {estado.fase === 'montar' && (
        <span className={styles.jaEstaMundo} style={sitio(CONTAS.jaEsta)}>
          ✓
        </span>
      )}
      {estado.fase !== 'montar' &&
        CONTAS.opcoes.map(({ numero, x, y }) => (
          <motion.span
            key={numero}
            className={styles.opcaoMundo}
            style={sitio([x, y])}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: estado.fase === 'certo' && numero === 3 ? 0 : 1 }}
          >
            {numero}
          </motion.span>
        ))}
    </>
  )
}

// ---------- 2. Lógica ----------

function DemoLogica({ aCorrer, aoAcabar }) {
  const estado = usePassos(PASSOS_LOGICA, aCorrer, aoAcabar)
  const ultimo = LOGICA.fila.length - 1

  return (
    <Cena>
      <span className={styles.prateleira} style={{ top: `${LOGICA.yDaFila + 7}cqw` }} />
      {LOGICA.fila.map((cor, i) => (
        <span
          key={i}
          className={`${styles.lugar} ${i === ultimo && !estado.cheio ? styles.buraco : ''}`}
          style={{ left: `${LOGICA.xDaFila[i]}cqw`, top: `${LOGICA.yDaFila}cqw` }}
        >
          {cor && <DesenhoCubinho cor={cor} className={styles.cuboDaCena} />}
          {i === ultimo &&
            (estado.cheio ? (
              <motion.span initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.25, 1] }}>
                <DesenhoCubinho cor="azul" className={styles.cuboDaCena} />
              </motion.span>
            ) : (
              <span className={styles.interrogacao}>?</span>
            ))}
        </span>
      ))}

      {LOGICA.opcoes.map(({ cor, x }) => (
        <motion.span
          key={cor}
          className={styles.lugar}
          style={{ left: `${x}cqw`, top: `${LOGICA.yDasOpcoes}cqw` }}
          animate={{ opacity: cor === 'azul' && estado.apanhado ? 0 : 1 }}
        >
          <DesenhoCubinho cor={cor} className={styles.cuboDaCena} />
        </motion.span>
      ))}

      {estado.certo && <Visto x={90} y={8} />}
      <Dedo estado={estado} tamanho={13} desenharLevado={desenharLevado} />
    </Cena>
  )
}

// ---------- 3. Quantidades ----------

function DemoQuantidades({ aCorrer, aoAcabar }) {
  const estado = usePassos(PASSOS_QUANTIDADES, aCorrer, aoAcabar)
  const { y, caixaDoNumero } = QUANTIDADES
  const sitio = (x, yy) => ({ left: `${x}cqw`, top: `${yy}cqw` })

  return (
    <Cena>
      {/* 1.ª linha: 3 cubinhos ➜ número */}
      <span className={`${styles.caixa} ${styles.caixaLarga}`} style={sitio(24, y[0])}>
        {[0, 1, 2].map((i) => (
          <DesenhoCubinho key={i} cor="laranja" className={styles.cuboPequeno} />
        ))}
      </span>
      <span className={styles.seta} style={sitio(48, y[0])}>
        ➜
      </span>
      <span className={styles.caixa} style={sitio(caixaDoNumero, y[0])}>
        {estado.linha1 ? (
          <motion.span className={styles.numeroCaixa} initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.25, 1] }}>
            3
          </motion.span>
        ) : (
          <span className={styles.interrogacao}>?</span>
        )}
      </span>

      {/* 2.ª linha: número ➜ cubinhos (mais clara até a 1.ª estar feita) */}
      <motion.span className={styles.linha2} animate={{ opacity: estado.linha1 ? 1 : 0.35 }}>
        <span className={`${styles.caixa} ${styles.caixaLarga}`} style={sitio(24, y[1])}>
          <span className={`${styles.numeroCaixa} ${styles.azul}`}>2</span>
        </span>
        <span className={styles.seta} style={sitio(48, y[1])}>
          ➜
        </span>
        <span className={styles.caixa} style={sitio(caixaDoNumero, y[1])}>
          {estado.naCaixa === 0 && <span className={styles.interrogacao}>?</span>}
          {Array.from({ length: estado.naCaixa }, (_, i) => (
            <motion.span key={i} initial={{ y: '-3cqw', scale: 0.6 }} animate={{ y: 0, scale: 1 }}>
              <DesenhoCubinho cor="azul" className={styles.cuboPequeno} />
            </motion.span>
          ))}
        </span>
      </motion.span>

      {/* Em baixo: primeiro os cartões dos números, depois o monte de cubinhos */}
      {!estado.linha1 &&
        QUANTIDADES.cartoes.map(({ numero, x }) => (
          <motion.span
            key={numero}
            className={`${styles.cartaoNumero} ${styles.noFundo}`}
            style={sitio(x, QUANTIDADES.yDeBaixo)}
            animate={{ opacity: numero === 3 && estado.cartaoLevado ? 0 : 1 }}
          >
            {numero}
          </motion.span>
        ))}
      {estado.linha1 && !estado.certo && (
        <motion.span
          className={styles.lugar}
          style={sitio(QUANTIDADES.monte, QUANTIDADES.yDeBaixo)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <DesenhoCubinho cor="azul" className={styles.cuboDaCena} />
        </motion.span>
      )}

      {estado.certo && <Visto x={90} y={8} />}
      <Dedo estado={estado} tamanho={13} desenharLevado={desenharLevado} />
    </Cena>
  )
}

/**
 * Ecrã com o objetivo do jogo, antes de começar: os 3 jogos lado a lado e,
 * um de cada vez, o dedo mostra como se joga (ver InstrucoesEmPaineis).
 * Props: escalao ('3-4', '5-6', '7-8') e aoComecar (função do botão).
 */
function Instrucoes({ escalao, aoComecar }) {
  return (
    <InstrucoesEmPaineis
      titulo="Matemática e Lógica!"
      demos={[DemoBalanca, DemoLogica, DemoQuantidades]}
      escalao={escalao}
      aoComecar={aoComecar}
    />
  )
}

export default Instrucoes
