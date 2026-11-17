import { motion } from 'motion/react'
import { Cena, Dedo, InstrucoesEmPaineis, Visto } from '../../components/demonstracao/Demonstracao'
import { usePassos } from '../../components/demonstracao/usePassos'
import ImagemPalavra from '../../components/ImagemPalavra'
import { NIVEIS_DA_CAIXA } from '../../games/portugues/caixa'
import { corDaPalavra } from './cores'
import {
  BALAO,
  CAIXA,
  LETRAS,
  PASSOS_LETRA,
  PASSOS_SOPA_DIFICIL,
  PASSOS_SOPA_MEDIO,
  SOPA_DIFICIL,
  SOPA_MEDIO,
  cubosDaCaixa,
  passosDaCaixa,
} from './passosDasInstrucoes'
import styles from './Instrucoes.module.css'

/** Posição pelo centro: left/top em cqw da cena. */
const sitio = (x, y) => ({ left: `${x}cqw`, top: `${y}cqw` })

/** O que o dedo leva no Português: um cubo com uma letra. */
function desenharLevado(letra) {
  return <span className={`${styles.cubo} ${styles.levado}`}>{letra}</span>
}

// ---------- 1. Fácil: o balão da letra ----------

/** O balão com o G (e o gato) e, em baixo, as letras: o dedo toca no G. */
function DemoLetra({ aCorrer, aoAcabar }) {
  const estado = usePassos(PASSOS_LETRA, aCorrer, aoAcabar)

  return (
    <Cena>
      <div className={styles.balao} style={sitio(BALAO.x, BALAO.y)}>
        <span className={styles.letraGrande}>{BALAO.letra}</span>
        <span className={styles.exemploDoBalao}>
          <ImagemPalavra palavra={BALAO.palavra} emoji={BALAO.emoji} className={styles.imagemDoBalao} />
          <span>
            <span className={styles.destaque}>{BALAO.palavra[0]}</span>
            {BALAO.palavra.slice(1)}
          </span>
        </span>
      </div>

      {LETRAS.letras.map((letra, i) => {
        const certa = i === LETRAS.certa && estado.tocada
        return (
          <motion.span
            key={letra}
            className={`${styles.letra} ${certa ? styles.letraCerta : ''}`}
            style={sitio(LETRAS.x[i], LETRAS.y)}
            animate={{ scale: certa ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.45 }}
          >
            {letra}
          </motion.span>
        )
      })}

      {estado.certo && <Visto x={88} y={14} />}
      <Dedo estado={estado} tamanho={13} />
    </Cena>
  )
}

// ---------- 2. Médio e Difícil: a sopa de letras ----------

/**
 * A grelha à esquerda e, à direita, o que procurar (a imagem e a palavra).
 * O dedo arrasta por cima de cada palavra: as letras ficam amarelas e,
 * no fim, com a cor da palavra (como no jogo a sério).
 */
function DemoSopa({ sopa, passos, aCorrer, aoAcabar }) {
  const estado = usePassos(passos, aCorrer, aoAcabar)
  const { grelha, letras, palavras } = sopa
  const lado = letras.length

  /** A cor da célula: a da palavra encontrada a que pertence (ou nenhuma). */
  const corDaCelula = (l, c) => {
    const n = estado.encontradas.find((k) => palavras[k].celulas.some(([ll, cc]) => ll === l && cc === c))
    return n === undefined ? null : corDaPalavra(estado.encontradas.indexOf(n))
  }
  const marcada = (l, c) => estado.marcadas.some(([ll, cc]) => ll === l && cc === c)

  // As palavras à direita, umas por baixo das outras, centradas na altura
  const yDaPalavra = (n) => 31.5 + (n - (palavras.length - 1) / 2) * 22

  return (
    <Cena>
      <div
        className={styles.grelha}
        style={{
          left: `${grelha.x}cqw`,
          top: `${grelha.y}cqw`,
          width: `${grelha.lado}cqw`,
          '--lado': lado,
        }}
      >
        {letras.flatMap((linha, l) =>
          [...linha].map((letra, c) => {
            const cor = corDaCelula(l, c)
            return (
              <span
                key={`${l}-${c}`}
                className={`${styles.celula} ${marcada(l, c) ? styles.marcada : ''} ${cor ? styles.encontrada : ''}`}
                style={cor ? { '--cor': cor } : undefined}
              >
                {letra}
              </span>
            )
          }),
        )}
      </div>

      {palavras.map(({ palavra, emoji }, n) => {
        const ordem = estado.encontradas.indexOf(n)
        const encontrada = ordem !== -1
        return (
          <motion.div
            key={palavra}
            className={`${styles.procurar} ${encontrada ? styles.procurada : ''}`}
            style={{ ...sitio(79, yDaPalavra(n)), '--cor': encontrada ? corDaPalavra(ordem) : undefined }}
            animate={{ scale: encontrada ? [1, 1.12, 1] : 1 }}
            transition={{ duration: 0.45 }}
          >
            <ImagemPalavra palavra={palavra} emoji={emoji} className={styles.imagemProcurar} />
            <span>{palavra}</span>
            {encontrada && <span className={styles.vistoPequeno}>✓</span>}
          </motion.div>
        )
      })}

      {estado.certo && <Visto x={79} y={palavras.length > 1 ? 56 : 52} />}
      <Dedo estado={estado} tamanho={13} />
    </Cena>
  )
}

/** O jogo do nível: as letras no Fácil, a sopa de letras no Médio e no Difícil. */
function DemoNivel({ escalao, aCorrer, aoAcabar }) {
  const props = { aCorrer, aoAcabar }
  if (escalao === '3-4') return <DemoLetra {...props} />
  if (escalao === '5-6') return <DemoSopa sopa={SOPA_MEDIO} passos={PASSOS_SOPA_MEDIO} {...props} />
  return <DemoSopa sopa={SOPA_DIFICIL} passos={PASSOS_SOPA_DIFICIL} {...props} />
}

// ---------- 3. A caixa das palavras ----------

/**
 * A caixa de madeira com o cartão do PATO e os lugares; fora, os cubos.
 * O dedo leva o P e o A, toca no T (que salta sozinho) e leva o O.
 * As ajudas mudam com o nível, como no jogo (ver NIVEIS_DA_CAIXA).
 */
function DemoCaixa({ escalao, aCorrer, aoAcabar }) {
  const passos = PASSOS_DA_CAIXA[escalao] ?? PASSOS_DA_CAIXA['3-4']
  const estado = usePassos(passos, aCorrer, aoAcabar)
  const nivel = NIVEIS_DA_CAIXA[escalao] ?? NIVEIS_DA_CAIXA['3-4']
  const { lugarDe, arrastadas, naMao, certo } = estado
  const ocupados = Object.values(lugarDe)

  return (
    <Cena>
      {/* A caixa: o monte dos cartões à esquerda e a ranhura com o cartão */}
      <div className={styles.caixa} />
      {[0, 1].map((n) => (
        <span key={n} className={styles.verso} style={{ ...sitio(15 + n * 0.8, 21 - n), '--n': n }} />
      ))}
      <span className={styles.ranhura} style={sitio(CAIXA.cartao[0], 26)} />
      <motion.div
        className={styles.cartaoCaixa}
        style={sitio(...CAIXA.cartao)}
        animate={{ scale: certo ? [1, 1.12, 1] : 1 }}
      >
        <ImagemPalavra palavra={CAIXA.palavra} emoji={CAIXA.emoji} className={styles.imagemCartao} />
        {(nivel.mostraPalavra || certo) && <span className={styles.palavraCartao}>{CAIXA.palavra}</span>}
      </motion.div>

      {/* Os lugares das letras (no Fácil, com a letra clarinha) */}
      {CAIXA.xDosLugares.map((x, i) => (
        <span key={i} className={styles.lugar} style={sitio(x, CAIXA.yDosLugares)}>
          {nivel.guias && !ocupados.includes(i) && <span className={styles.guia}>{CAIXA.palavra[i]}</span>}
        </span>
      ))}

      {/* Os cubos: lá fora, na mão do dedo (escondidos) ou no seu lugar */}
      {cubosDaCaixa(escalao).map(({ letra, x }) => {
        const lugar = lugarDe[letra]
        const dentro = lugar !== undefined
        // Os que o dedo levou aparecem logo no lugar; o tocado voa até lá
        const voar = { duration: arrastadas.includes(letra) ? 0 : 0.5, ease: 'easeInOut' }
        return (
          <motion.span
            key={letra}
            className={styles.cubo}
            initial={false}
            animate={{
              ...(dentro ? sitio(CAIXA.xDosLugares[lugar], CAIXA.yDosLugares) : sitio(x, CAIXA.yDosCubos)),
              opacity: naMao === letra || (arrastadas.includes(letra) && !dentro) ? 0 : 1,
              scale: certo && dentro ? [1, 1.2, 1] : 1,
            }}
            transition={{ left: voar, top: voar, opacity: { duration: 0.15 }, scale: { duration: 0.4 } }}
          >
            {letra}
          </motion.span>
        )
      })}

      {certo && <Visto x={86} y={14} />}
      <Dedo estado={estado} tamanho={13} desenharLevado={desenharLevado} />
    </Cena>
  )
}

/** Os passos da caixa, um para cada nível (preparados uma vez só). */
const PASSOS_DA_CAIXA = {
  '3-4': passosDaCaixa('3-4'),
  '5-6': passosDaCaixa('5-6'),
  '7-8': passosDaCaixa('7-8'),
}

/**
 * Ecrã com o objetivo do jogo, antes de começar: o jogo do nível e a caixa
 * das palavras lado a lado e, um de cada vez, o dedo mostra como se joga
 * (ver InstrucoesEmPaineis).
 * Props: escalao ('3-4', '5-6', '7-8') e aoComecar (função do botão).
 */
function Instrucoes({ escalao, aoComecar }) {
  return (
    <InstrucoesEmPaineis
      titulo="Português!"
      demos={[DemoNivel, DemoCaixa]}
      escalao={escalao}
      aoComecar={aoComecar}
      largura={76}
    />
  )
}

export default Instrucoes
