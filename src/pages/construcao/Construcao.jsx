import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prepararEfeitos, tocarEfeito } from '../../audio/efeitos'
import EcraEscolha from '../../components/EcraEscolha'
import Festa from '../../components/Festa'
import IconeJogo from '../../components/IconeJogo'
import ImagemMascote from '../../components/ImagemMascote'
import Peca from '../../components/Peca'
import ProjetoAcabado from '../../components/ProjetoAcabado'
import { useMascoteAtiva, usePerfil } from '../../components/useProgresso'
import { PECAS_POR_COR } from '../../games/progresso/config'
import { marcarPecasVistas, progressoAtual } from '../../games/progresso/estado'
import { corQueMaisFalta, jogosAtivos, pecasNovas, projetoAtual } from '../../games/progresso/progresso'
import styles from './Construcao.module.css'

/**
 * Lista das peças novas que vão cair, pela ordem dos jogos:
 *   [{ jogoId: 'portugues', indice: 2 }, ...]   (indice = o lugar na torre, 0 = em baixo)
 * Calcula-se UMA vez, quando o ecrã abre (depois as peças passam a "vistas").
 */
function pecasACair(progresso) {
  const novas = pecasNovas(progresso)
  const projeto = projetoAtual(progresso)
  const lista = jogosAtivos().flatMap((j) => {
    const quantas = novas.porCor[j.id]
    const primeira = projeto.pecas[j.id] - quantas
    return Array.from({ length: quantas }, (_, k) => ({ jogoId: j.id, indice: primeira + k }))
  })
  return { projetosNovos: novas.projetosNovos, lista }
}

/**
 * O ecrã da construção: o projeto da mascote ativa a crescer peça a peça.
 * Quase sem texto (as crianças pequenas ainda não leem):
 * - o projeto aparece "fantasma" (cinzento) e ganha cor de baixo para cima
 * - cada cor (jogo) tem uma torre de 5 lugares; por baixo, o botão do jogo
 * - as peças novas caem uma a uma; no fim, a mão 👆 aponta para o jogo
 *   que mais falta. Tocar num lugar vazio aponta para o jogo dessa cor.
 * - reserva (peças guardadas) em baixo à esquerda; projetos acabados numa
 *   prateleira por baixo do projeto (tocar mostra-o em grande)
 */
function Construcao() {
  const navegar = useNavigate()
  const perfil = usePerfil()
  const mascote = useMascoteAtiva()

  // O que é novo, congelado quando o ecrã abre
  const [inicio] = useState(() => pecasACair(progressoAtual()))
  const [festaFeita, setFestaFeita] = useState(inicio.projetosNovos === 0)
  const [caidas, setCaidas] = useState(0) // quantas peças novas já aterraram
  const [salto, setSalto] = useState(0) // muda a cada peça: a mascote salta
  const [escolhida, setEscolhida] = useState(null) // a cor do lugar vazio tocado
  const [verAcabado, setVerAcabado] = useState(null) // o n.º do projeto acabado aberto

  const acabou = festaFeita && caidas >= inicio.lista.length

  // Quando todas as peças aterraram, deixam de ser novas
  useEffect(() => {
    if (acabou) marcarPecasVistas()
  }, [acabou])

  if (!perfil || !mascote) return null

  const { projetos, reserva } = perfil.mascotes[mascote.id]
  const projeto = projetos.at(-1)
  const acabados = projetos.filter((p) => p.completoEm)
  const ativos = jogosAtivos()

  // Peças que se veem agora (as novas só contam depois de aterrar)
  const aindaPorCair = inicio.lista.length - caidas
  const naObra = ativos.reduce((soma, j) => soma + projeto.pecas[j.id], 0) - aindaPorCair
  const fracao = Math.max(0, naObra) / (ativos.length * PECAS_POR_COR)

  // Para onde aponta a mão: a cor tocada, ou (no fim da animação) a que mais falta
  const apontar = escolhida ?? (acabou ? corQueMaisFalta(progressoAtual()) : null)
  const jogoApontado = ativos.find((j) => j.id === apontar)

  /** O estado de cada lugar da torre: 'cheio', 'cair' (a cair agora) ou 'vazio'. */
  function estadoDoLugar(jogoId, indice) {
    if (indice >= projeto.pecas[jogoId]) return 'vazio'
    const n = inicio.lista.findIndex((p) => p.jogoId === jogoId && p.indice === indice)
    if (n === -1 || n < caidas) return 'cheio'
    if (n === caidas && festaFeita) return 'cair'
    return 'vazio' // nova, à espera da sua vez
  }

  function aterrou() {
    tocarEfeito('cubinho')
    setCaidas((c) => c + 1)
    setSalto((s) => s + 1)
  }

  function jogar(id) {
    prepararEfeitos()
    navegar(`/${id}`)
  }

  const reservaComPecas = ativos.filter((j) => reserva[j.id] > 0)

  return (
    <EcraEscolha
      titulo={
        <span className={styles.titulo}>
          <ImagemMascote mascote={mascote} className={styles.tituloMascote} />
          <span aria-label={mascote.projeto}>{mascote.iconeProjeto}</span>
        </span>
      }
      voltar="/jogos"
    >
      {/* A mascote, com um balão que mostra o jogo para onde a mão aponta */}
      <div className={styles.mascote}>
        <AnimatePresence>
          {jogoApontado && (
            <motion.button
              key={jogoApontado.id}
              type="button"
              className={styles.balao}
              style={{ '--cor': jogoApontado.hex }}
              onClick={() => jogar(jogoApontado.id)}
              aria-label={`Jogar ${jogoApontado.nome}`}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            >
              <span className={styles.balaoCor} aria-hidden="true" />
              <span aria-hidden="true">➜</span>
              <IconeJogo jogo={jogoApontado} className={styles.balaoIcone} />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.span
          key={salto}
          className={styles.mascoteSalta}
          animate={salto ? { y: ['0cqw', '-3cqw', '0cqw'], rotate: [0, -8, 0] } : undefined}
          transition={{ duration: 0.45 }}
        >
          <ImagemMascote mascote={mascote} className={styles.mascoteImagem} />
        </motion.span>
      </div>

      {/* Reserva: as peças guardadas para o próximo projeto */}
      {reservaComPecas.length > 0 && (
        <div className={styles.reserva} aria-label="Peças guardadas">
          {reservaComPecas.map((j) => (
            <motion.span
              key={j.id}
              className={styles.reservaPeca}
              whileTap={{ rotate: [0, -15, 15, -8, 0], scale: 1.15 }}
            >
              <Peca mascote={mascote} jogo={j} className={styles.pecaPequena} />
              <span className={styles.numero}>+{reserva[j.id]}</span>
            </motion.span>
          ))}
        </div>
      )}

      {/* O projeto: fantasma cinzento + a cor a subir de baixo para cima */}
      <div className={styles.projeto} role="img" aria-label={`${mascote.projeto}: ${naObra} peças`}>
        <span className={styles.fantasma} aria-hidden="true">
          {mascote.iconeProjeto}
        </span>
        <motion.span
          className={styles.colorido}
          aria-hidden="true"
          initial={false}
          animate={{ clipPath: `inset(${(1 - fracao) * 100}% 0% 0% 0%)` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          {mascote.iconeProjeto}
        </motion.span>
      </div>

      {/* Prateleira dos projetos acabados */}
      {acabados.length > 0 && (
        <div className={styles.prateleira} aria-label="Acabados">
          {acabados.map((p, i) => (
            <motion.button
              key={i}
              type="button"
              className={styles.acabado}
              onClick={() => setVerAcabado(i)}
              aria-label={`${mascote.projeto} ${i + 1}`}
              whileTap={{ scale: 0.85 }}
            >
              {mascote.iconeProjeto}
            </motion.button>
          ))}
        </div>
      )}

      {/* As torres: 5 lugares por cor e, por baixo, o botão do jogo */}
      <div className={styles.torres}>
        {ativos.map((j) => {
          const completa = projeto.pecas[j.id] >= PECAS_POR_COR && estadoDoLugar(j.id, PECAS_POR_COR - 1) === 'cheio'
          const apontado = apontar === j.id
          return (
            <div key={j.id} className={styles.torre} style={{ '--cor': j.hex }}>
              <span className={styles.certoLugar}>
                <AnimatePresence>
                  {completa && (
                    <motion.span
                      className={styles.certo}
                      aria-label="Completo"
                      initial={{ scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>

              <div className={`${styles.lugares} ${apontado ? styles.lugaresApontados : ''}`}>
                {Array.from({ length: PECAS_POR_COR }, (_, i) => {
                  const estado = estadoDoLugar(j.id, i)
                  if (estado === 'vazio') {
                    return (
                      <button
                        key={i}
                        type="button"
                        className={styles.vazio}
                        onClick={() => setEscolhida(j.id)}
                        aria-label={`Falta ${j.nome}`}
                      />
                    )
                  }
                  return (
                    <motion.span
                      key={i}
                      className={styles.cheio}
                      initial={estado === 'cair' ? { y: '-45cqw', opacity: 0 } : false}
                      animate={{ y: '0cqw', opacity: 1 }}
                      transition={estado === 'cair' ? { type: 'spring', stiffness: 260, damping: 16, delay: 0.25 } : undefined}
                      onAnimationComplete={estado === 'cair' ? aterrou : undefined}
                      whileTap={{ rotate: [0, -12, 12, 0], scale: 1.12 }}
                    >
                      <Peca mascote={mascote} jogo={j} className={styles.pecaLugar} />
                    </motion.span>
                  )
                })}
              </div>

              <motion.button
                type="button"
                className={`${styles.jogo} ${apontado ? styles.alvo : ''}`}
                onClick={() => jogar(j.id)}
                aria-label={`Jogar ${j.nome}`}
                whileTap={{ scale: 0.88 }}
              >
                <IconeJogo jogo={j} className={styles.jogoIcone} />
              </motion.button>

              {apontado && (
                <span className={styles.mao} aria-hidden="true">
                  👆
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Jogar: volta à escolha dos jogos */}
      <motion.button
        type="button"
        className={styles.jogar}
        onClick={() => navegar('/jogos')}
        aria-label="Jogar"
        whileTap={{ scale: 0.88 }}
        animate={acabou ? { scale: [1, 1.08, 1] } : undefined}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ▶
      </motion.button>

      {/* Um projeto acabado em grande, com festa; toca em qualquer lado para fechar */}
      <AnimatePresence>
        {verAcabado !== null && (
          <motion.div
            role="button"
            tabIndex={0}
            className={styles.verAcabado}
            onClick={() => setVerAcabado(null)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setVerAcabado(null)}
            aria-label="Fechar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Festa semente={`acabado-${verAcabado}`} origem={{ x: 50, y: 50 }} />
            <motion.span
              className={styles.grande}
              initial={{ scale: 0.2, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            >
              {mascote.iconeProjeto}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acabou um projeto sem a criança o ver: primeiro a festa, depois as peças caem */}
      {!festaFeita && <ProjetoAcabado vez={1} aoFechar={() => setFestaFeita(true)} />}
    </EcraEscolha>
  )
}

export default Construcao
