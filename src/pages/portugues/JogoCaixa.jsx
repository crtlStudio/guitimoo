import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { tocarEfeito } from '../../audio/efeitos'
import BalaoMascote from '../../components/BalaoMascote'
import DedoFantasma from '../../components/DedoFantasma'
import Festa from '../../components/Festa'
import ImagemPalavra from '../../components/ImagemPalavra'
import { NIVEIS_DA_CAIXA, criarRondaCaixa, encaixa, lugaresVazios, palavraCompleta, primeiroVazio } from '../../games/portugues/caixa'
import { proximaPalavra } from '../../games/portugues/memoria'
import { entreOsDoMeio } from '../matematica/ajuda'
import styles from './JogoCaixa.module.css'

/** Tempo a festejar antes da ronda seguinte (milissegundos). */
const ESPERA_DEPOIS_DE_ACERTAR = 2600

/** Diz se o ponto (onde o dedo largou) está por cima do elemento. */
function estaPorCima(ponto, elemento) {
  const caixa = elemento?.getBoundingClientRect()
  if (!caixa) return false
  const x = ponto.x - window.scrollX
  const y = ponto.y - window.scrollY
  return x >= caixa.left && x <= caixa.right && y >= caixa.top && y <= caixa.bottom
}

/**
 * Jogo da caixa das palavras (dentro do Português). Uma caixa de madeira:
 * à esquerda, o monte dos próximos cartões; o cartão que sai fica de pé na
 * ranhura, com a imagem (e a palavra, nos níveis mais fáceis). Fora da
 * caixa estão os cubos com as letras, baralhados: a criança leva cada um
 * para o seu lugar (arrastar, ou tocar: vai para o primeiro lugar vazio).
 * O que muda em cada nível está em games/portugues/caixa.js.
 * Uma ronda só: no fim chama aoProxima() (a página sorteia o jogo seguinte).
 *
 * Props: escalao, aoAcertar(), aoErrar(), aoProxima()
 */
function JogoCaixa({ escalao, aoAcertar, aoErrar, aoProxima }) {
  const nivel = NIVEIS_DA_CAIXA[escalao] ?? NIVEIS_DA_CAIXA['3-4']
  const [ronda, setRonda] = useState(null) // ver criarRondaCaixa (null enquanto carrega)
  const [postos, setPostos] = useState([]) // a letra em cada lugar (null = vazio)
  const [usados, setUsados] = useState([]) // ids dos cubos já dentro da caixa
  const [abana, setAbana] = useState(null) // { id, vez }: o cubo que não encaixou
  const [mensagem, setMensagem] = useState(null) // { tipo, texto?, vez }
  const [certa, setCerta] = useState(false)

  const lugares = useRef([]) // os lugares da caixa (elementos), para saber onde largou
  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  // Tira a palavra do saco (um saco só da caixa, para cada nível) e prepara a ronda
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    const todas = nivel.lista.map((p) => p.palavra)
    proximaPalavra(`caixa-${escalao}`, todas).then((palavra) => {
      const nova = criarRondaCaixa(
        nivel.lista.find((p) => p.palavra === palavra),
        escalao,
      )
      setRonda(nova)
      setPostos(lugaresVazios(nova.letras))
    })
  }, [escalao, nivel])

  // Ao sair, cancela a passagem para a ronda seguinte
  useEffect(() => () => clearTimeout(temporizador.current), [])

  function falar(tipo, texto) {
    setMensagem((m) => ({ tipo, texto, vez: (m?.vez ?? 0) + 1 }))
  }

  /** O cubo foi largado (ou tocado) para o lugar `lugar`. */
  function porNoLugar(cubo, lugar) {
    if (certa || usados.includes(cubo.id)) return
    if (!encaixa(ronda.letras, postos, lugar, cubo.letra)) {
      aoErrar?.()
      setAbana((a) => ({ id: cubo.id, vez: (a?.vez ?? 0) + 1 }))
      falar('erro', 'Quase! Essa letra vai noutro lugar')
      return
    }
    tocarEfeito('cubinho')
    const novos = postos.map((p, i) => (i === lugar ? cubo.letra : p))
    setPostos(novos)
    setUsados((u) => [...u, cubo.id])
    setMensagem(null)
    if (palavraCompleta(ronda.letras, novos)) {
      setCerta(true)
      falar('fim')
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) temporizador.current = setTimeout(() => aoProxima?.(), ESPERA_DEPOIS_DE_ACERTAR)
    }
  }

  /** Largou o cubo: conta o lugar por baixo do dedo (fora dos lugares, volta sem erro). */
  function largar(cubo, ponto) {
    const lugar = lugares.current.findIndex((el) => estaPorCima(ponto, el))
    if (lugar !== -1) porNoLugar(cubo, lugar)
  }

  if (!ronda) return null

  // A ajuda (3 s parada): o dedo leva um cubo do meio da fila (sem apontar
  // nenhum) até ao primeiro lugar vazio. Mostra o gesto, não a letra.
  const vazio = primeiroVazio(postos)
  const gesto =
    certa || vazio === -1
      ? null
      : {
          chave: `caixa-${vazio}`,
          tipo: 'arrastar',
          de: () => entreOsDoMeio('[data-cubos]'),
          para: () => lugares.current[vazio],
        }

  const mostrarPalavra = nivel.mostraPalavra || certa
  const tamanho = ronda.letras.length > 5 ? styles.pequenos : ''

  return (
    <>
      <DedoFantasma gesto={gesto} />

      {/* A caixa de madeira */}
      <div className={styles.caixa}>
        {/* À esquerda: o monte dos próximos cartões, virados para baixo */}
        <div className={styles.compartimento} aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <span key={n} className={styles.verso} style={{ '--n': n }} />
          ))}
        </div>

        <div className={styles.meio}>
          {/* O cartão que saiu: vem do monte, vira-se e fica de pé na ranhura */}
          <div className={styles.ranhura}>
            <motion.div
              className={styles.cartao}
              initial={{ x: '-26cqw', rotateY: 180, opacity: 0 }}
              animate={{ x: '0cqw', rotateY: 0, opacity: 1, scale: certa ? [1, 1.1, 1] : 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 16 }}
              aria-label={mostrarPalavra ? ronda.mostrar : 'Que palavra é?'}
            >
              <ImagemPalavra palavra={ronda.palavra} emoji={ronda.emoji} className={styles.imagem} />
              {mostrarPalavra && (
                <motion.span
                  className={styles.palavra}
                  initial={nivel.mostraPalavra ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {ronda.mostrar}
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Os lugares das letras, dentro da caixa */}
          <div className={`${styles.lugares} ${tamanho}`}>
            {ronda.letras.map((letra, i) => (
              <span
                key={i}
                ref={(el) => {
                  lugares.current[i] = el
                }}
                className={`${styles.lugar} ${postos[i] ? styles.lugarCheio : ''}`}
                aria-label={postos[i] ? postos[i] : 'Lugar vazio'}
              >
                {postos[i] ? (
                  <motion.span
                    className={styles.cubo}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: certa ? [1, 1.2, 1] : [0.5, 1.15, 1] }}
                    transition={{ duration: 0.35, delay: certa ? i * 0.08 : 0 }}
                  >
                    {postos[i]}
                  </motion.span>
                ) : (
                  nivel.guias && (
                    <span className={styles.guia} aria-hidden="true">
                      {letra}
                    </span>
                  )
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <BalaoMascote
        mensagem={mensagem}
        textos={mensagem?.texto ? { [mensagem.tipo]: mensagem.texto } : { fim: 'Boa!' }}
        className={styles.mensagem}
      />

      {certa && <Festa semente={`caixa-${ronda.palavra}`} origem={{ x: 55, y: 40 }} />}

      {/* Fora da caixa: os cubos com as letras, para levar lá para dentro */}
      <div className={`${styles.cubos} ${tamanho}`} data-cubos role="group" aria-label="Letras">
        {ronda.cubos.map((cubo, i) => {
          if (usados.includes(cubo.id)) return <span key={cubo.id} className={styles.cuboVazio} />
          const aAbanar = abana?.id === cubo.id
          return (
            <motion.button
              key={aAbanar ? `${cubo.id}-${abana.vez}` : cubo.id}
              type="button"
              className={styles.cubo}
              aria-label={`Letra ${cubo.letra}`}
              disabled={certa}
              drag={!certa}
              dragSnapToOrigin
              dragElastic={1}
              dragMomentum={false}
              whileDrag={{ scale: 1.15, zIndex: 5 }}
              onDragEnd={(evento, info) => largar(cubo, info.point)}
              // Tocar: vai para o primeiro lugar vazio (se for a letra dele)
              onTap={() => vazio !== -1 && porNoLugar(cubo, vazio)}
              initial={aAbanar ? false : { opacity: 0, y: 20 }}
              animate={aAbanar ? { x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
              transition={aAbanar ? { duration: 0.45 } : { delay: 0.6 + i * 0.06 }}
            >
              {cubo.letra}
            </motion.button>
          )
        })}
      </div>
    </>
  )
}

export default JogoCaixa
