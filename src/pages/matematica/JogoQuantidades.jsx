import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import BalaoMascote from '../../components/BalaoMascote'
import DedoFantasma from '../../components/DedoFantasma'
import Festa from '../../components/Festa'
import { NIVEIS, criarPergunta, filasDeCubos } from '../../games/matematica/quantidades'
import { entreOsDoMeio } from './ajuda'
import { DesenhoCubinho } from './Cubinho'
import styles from './JogoQuantidades.module.css'

/** Tempo a festejar antes da pergunta seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 2600

/** Diz se o ponto (onde o dedo largou) está por cima do elemento. */
function estaPorCima(ponto, elemento) {
  const caixa = elemento?.getBoundingClientRect()
  if (!caixa) return false
  const x = ponto.x - window.scrollX
  const y = ponto.y - window.scrollY
  return x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom
}

/** Um desenho de `n` cubinhos, em filas de 5 (fácil de contar). */
function Cubos({ n, cor, aoTocar }) {
  let id = 0
  return (
    <span className={styles.cubos}>
      {filasDeCubos(n).map((quantos, f) => (
        <span key={f} className={styles.filaDeCubos}>
          {Array.from({ length: quantos }, () => {
            const meu = id++
            return aoTocar ? (
              // Na caixa da 2.ª linha: tocar num cubinho tira-o
              <motion.button
                key={meu}
                type="button"
                className={styles.cuboBotao}
                onClick={aoTocar}
                aria-label="Tirar um cubinho"
                initial={{ scale: 0.3, y: '-2cqw' }}
                animate={{ scale: 1, y: '0cqw' }}
              >
                <DesenhoCubinho cor={cor} className={styles.cubo} />
              </motion.button>
            ) : (
              <DesenhoCubinho key={meu} cor={cor} className={styles.cubo} />
            )
          })}
        </span>
      ))}
    </span>
  )
}

/**
 * Jogo das Quantidades (dentro da Matemática): um quadro com duas linhas.
 * 1.ª linha: N cubinhos → a criança arrasta (ou toca) o cartão do número N.
 * 2.ª linha (aparece depois): um número → a criança põe na caixa tantos
 *   cubinhos como o número (arrasta do monte, ou toca no monte; tocar num
 *   cubinho da caixa tira-o). Nos 3–4 a festa é logo que fica certo; nos
 *   outros, confirma-se com o ✓.
 * Uma pergunta (o quadro inteiro) só: no fim chama aoProxima().
 *
 * Props: escalao, aoAcertar(), aoErrar(), aoProxima() (como no JogoLogica)
 */
function JogoQuantidades({ escalao, aoAcertar, aoErrar, aoProxima }) {
  const nivel = NIVEIS[escalao] ?? NIVEIS['3-4']
  const [pergunta] = useState(() => criarPergunta(escalao))
  const [linha1, setLinha1] = useState(false) // a 1.ª linha está certa
  const [erradas, setErradas] = useState([]) // cartões já tentados e errados
  const [abana, setAbana] = useState(null) // { numero, vez }: o cartão errado que abana
  const [naCaixa, setNaCaixa] = useState(0) // cubinhos na caixa da 2.ª linha
  const [certo, setCerto] = useState(false) // o quadro todo está certo
  const [mensagem, setMensagem] = useState(null) // { tipo, texto?, vez }

  const lugarDoCartao = useRef(null)
  const caixa = useRef(null)
  const temporizador = useRef(null)

  // Ao sair, cancela a passagem para a pergunta seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function falar(tipo, texto) {
    setMensagem((m) => ({ tipo, texto, vez: (m?.vez ?? 0) + 1 }))
  }

  function acabar() {
    setCerto(true)
    falar('fim')
    const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
    if (!acabou) temporizador.current = setTimeout(() => aoProxima?.(), ESPERA_DEPOIS_DE_ACERTAR)
  }

  // ---------- 1.ª linha: o cartão do número ----------
  function tentarCartao(numero) {
    if (linha1 || erradas.includes(numero)) return
    if (numero === pergunta.cubos) {
      setLinha1(true)
      falar('boa', 'Boa! Agora a linha de baixo')
    } else {
      aoErrar?.()
      setErradas((e) => [...e, numero])
      setAbana((a) => ({ numero, vez: (a?.vez ?? 0) + 1 }))
      falar('erro', 'Quase! Conta outra vez os cubinhos')
    }
  }

  // ---------- 2.ª linha: os cubinhos na caixa ----------
  function mudarCaixa(quantos) {
    if (!linha1 || certo || quantos < 0) return
    setNaCaixa(quantos)
    setMensagem(null)
    if (!nivel.confereSozinho) return
    // 3–4: confere logo (como na balança)
    if (quantos === pergunta.numero) acabar()
    else if (quantos > pergunta.numero) {
      aoErrar?.()
      falar('erro', 'Quase! Tira um cubinho')
    }
  }

  function jaEsta() {
    if (certo) return
    if (naCaixa === pergunta.numero) acabar()
    else {
      aoErrar?.()
      falar('erro', 'Quase! Conta outra vez')
    }
  }

  // A ajuda (3 s parada) mostra COMO se faz, nunca a resposta:
  // 1.ª linha: o dedo vai do meio dos cartões até ao lugar vazio;
  // 2.ª linha: leva um cubinho do monte para a caixa (ou, já com cubinhos, toca no ✓)
  let gesto = null
  if (!linha1) {
    gesto = { chave: 'cartao', tipo: 'arrastar', de: () => entreOsDoMeio('[data-cartoes]'), para: () => lugarDoCartao.current }
  } else if (!certo && naCaixa > 0 && !nivel.confereSozinho) {
    gesto = { chave: 'ja-esta', tipo: 'tocar', em: () => document.querySelector('[data-ja-esta-quantidades]') }
  } else if (!certo) {
    gesto = { chave: 'monte', tipo: 'arrastar', de: () => document.querySelector('[data-monte] img'), para: () => caixa.current }
  }

  return (
    <>
      <DedoFantasma gesto={gesto} />

      {/* O quadro, com as duas linhas */}
      <div className={`${styles.quadro} ${styles[`tam${escalao.replace('-', '')}`]}`}>
        {/* 1.ª linha: cubinhos → número */}
        <div className={styles.linha}>
          <span className={styles.caixaQuadro} aria-label={`${pergunta.cubos} cubinhos`}>
            <Cubos n={pergunta.cubos} cor={pergunta.cor} />
          </span>
          <span className={styles.seta} aria-hidden="true">
            ➜
          </span>
          <span
            ref={lugarDoCartao}
            className={`${styles.caixaQuadro} ${styles.vazio} ${linha1 ? styles.certa : ''}`}
            aria-label={linha1 ? `${pergunta.cubos}` : 'Põe aqui o número'}
          >
            {linha1 ? (
              <motion.span
                className={styles.numeroGrande}
                initial={{ scale: 0.3 }}
                animate={{ scale: [0.3, 1.25, 1] }}
                transition={{ duration: 0.45 }}
              >
                {pergunta.cubos}
              </motion.span>
            ) : (
              <span className={styles.interrogacao} aria-hidden="true">
                ?
              </span>
            )}
          </span>
        </div>

        {/* 2.ª linha: número → cubinhos (só se pode mexer depois da 1.ª) */}
        <div className={`${styles.linha} ${linha1 ? '' : styles.aEspera}`}>
          <span className={styles.caixaQuadro} aria-label={`O número ${pergunta.numero}`}>
            <span className={`${styles.numeroGrande} ${styles[pergunta.corDoNumero]}`}>{pergunta.numero}</span>
          </span>
          <span className={styles.seta} aria-hidden="true">
            ➜
          </span>
          <span
            ref={caixa}
            className={`${styles.caixaQuadro} ${styles.vazio} ${certo ? styles.certa : ''}`}
            aria-label={`Caixa com ${naCaixa} cubinhos`}
          >
            {naCaixa > 0 ? (
              <Cubos n={naCaixa} cor={pergunta.corDoNumero} aoTocar={certo ? null : () => mudarCaixa(naCaixa - 1)} />
            ) : (
              <span className={styles.interrogacao} aria-hidden="true">
                ?
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Ao lado da 1.ª linha: os cartões dos números */}
      {!linha1 && (
        <div className={styles.cartoes} data-cartoes role="group" aria-label="Escolhe o número">
          {pergunta.opcoes.map((numero) => {
            const errado = erradas.includes(numero)
            const aAbanar = abana?.numero === numero
            return (
              <motion.button
                key={aAbanar ? `${numero}-${abana.vez}` : numero}
                type="button"
                className={`${styles.cartao} ${errado ? styles.cartaoErrado : ''}`}
                disabled={errado}
                drag={!errado}
                dragSnapToOrigin
                dragElastic={1}
                dragMomentum={false}
                whileDrag={{ scale: 1.15, zIndex: 5 }}
                onDragEnd={(evento, info) => estaPorCima(info.point, lugarDoCartao.current) && tentarCartao(numero)}
                onTap={() => tentarCartao(numero)}
                initial={aAbanar ? false : { opacity: 0, x: 20 }}
                animate={aAbanar ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, x: 0 }}
                transition={aAbanar ? { duration: 0.45 } : { delay: 0.4 }}
              >
                {numero}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Ao lado da 2.ª linha: o monte de cubinhos (e o ✓) */}
      {linha1 && !certo && (
        <motion.div className={styles.material} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <span className={styles.monte} data-monte>
            {/* Os de trás são só desenho (um monte); o da frente arrasta-se */}
            <DesenhoCubinho cor={pergunta.corDoNumero} className={styles.cuboAtras} />
            <motion.button
              type="button"
              className={styles.cuboDoMonte}
              aria-label="Pôr um cubinho na caixa"
              drag
              dragSnapToOrigin
              dragElastic={1}
              dragMomentum={false}
              whileDrag={{ scale: 1.15, zIndex: 5 }}
              onDragEnd={(evento, info) => estaPorCima(info.point, caixa.current) && mudarCaixa(naCaixa + 1)}
              onTap={() => mudarCaixa(naCaixa + 1)}
            >
              <DesenhoCubinho cor={pergunta.corDoNumero} className={styles.cubo} />
            </motion.button>
          </span>
          {!nivel.confereSozinho && (
            <motion.button
              type="button"
              className={styles.jaEsta}
              data-ja-esta-quantidades
              onClick={jaEsta}
              aria-label="Já está!"
              whileTap={{ scale: 0.92 }}
            >
              <span aria-hidden="true">✓</span>
            </motion.button>
          )}
        </motion.div>
      )}

      <BalaoMascote
        mensagem={mensagem}
        textos={mensagem?.texto ? { [mensagem.tipo]: mensagem.texto } : { fim: 'Boa!' }}
        className={styles.mensagem}
      />

      {certo && <Festa semente={`quantidades-${pergunta.cubos}-${pergunta.numero}`} origem={{ x: 35, y: 50 }} />}
    </>
  )
}

export default JogoQuantidades
