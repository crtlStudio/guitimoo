import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { tocarEfeito } from '../audio/efeitos'
import { ESTRELAS_POR_PECA, JOGOS, PECAS_POR_COR } from '../games/progresso/config'
import { guardarPecasNaReserva } from '../games/progresso/estado'
import { comMaiuscula, estasPecas, nomeDasPecas, oProximo, todasAsPecas } from '../games/progresso/textos'
import Peca from './Peca'
import { useMascoteAtiva, usePerfil } from './useProgresso'
import styles from './PremioPecas.module.css'

/**
 * A parte das peças no ecrã de fim de jogo:
 * 1. as peças que este jogo deu à mascote (a saltar, com festa)
 * 2. quantas estrelas faltam para a próxima peça desta cor
 * 3. se a cor já estava completa e houve peças a mais: pergunta, com imagens,
 *    se as quer guardar para o próximo projeto (sim → reserva)
 *
 * Props:
 * - premio: { jogoId, pecasGanhas, pecasExtra, projetosAcabados } ou null
 *   (vai mudando: as 15 estrelas do fim chegam um bocadinho depois)
 * - jogoId: o jogo que acabou (para quando ainda não há prémio)
 */
function PremioPecas({ premio, jogoId }) {
  const perfil = usePerfil()
  const mascote = useMascoteAtiva()
  const jogo = JOGOS.find((j) => j.id === jogoId)
  // A resposta à pergunta da reserva: null (ainda não respondeu), 'sim' ou 'nao'
  const [resposta, setResposta] = useState(null)

  const ganhas = premio?.pecasGanhas ?? 0
  const extra = premio?.pecasExtra ?? 0

  // Festa (som) quando chega uma peça nova; um bocadinho depois da "estrela"
  useEffect(() => {
    if (ganhas === 0) return
    const quando = setTimeout(() => tocarEfeito('festa'), 450)
    return () => clearTimeout(quando)
  }, [ganhas])

  if (!perfil || !mascote || !jogo?.ativo) return null

  const projeto = perfil.mascotes[mascote.id].projetos.at(-1)
  const corCompleta = projeto.pecas[jogo.id] >= PECAS_POR_COR
  const faltam = ESTRELAS_POR_PECA - perfil.estrelas[jogo.id].resto
  const chamada = comMaiuscula(mascote.chamada)

  function responder(sim) {
    if (sim) guardarPecasNaReserva(jogo.id, extra)
    setResposta(sim ? 'sim' : 'nao')
  }

  return (
    <div className={styles.premio}>
      {/* 1. Peças ganhas */}
      <AnimatePresence>
        {ganhas > 0 && (
          <motion.div
            key={`ganhas-${ganhas}`}
            className={styles.ganhas}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          >
            <span className={styles.pecas}>
              {Array.from({ length: Math.min(ganhas, 5) }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -30, rotate: -20, opacity: 0 }}
                  animate={{ y: [-30, 0, -8, 0], rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.15, duration: 0.6 }}
                >
                  <Peca mascote={mascote} jogo={jogo} />
                </motion.span>
              ))}
            </span>
            <span className={styles.texto}>
              Ganhaste {nomeDasPecas(mascote, jogo, ganhas)} para {mascote.projeto}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Quanto falta para a próxima peça (só se a cor ainda não estiver completa) */}
      {!corCompleta && (
        <div className={styles.falta}>
          <span className={styles.barra} style={{ '--cor': jogo.hex }}>
            <span style={{ width: `${((ESTRELAS_POR_PECA - faltam) / ESTRELAS_POR_PECA) * 100}%` }} />
          </span>
          <span>
            {faltam === 1 ? 'Falta' : 'Faltam'} {faltam} ⭐ para {oProximo(mascote)}
          </span>
        </div>
      )}

      {/* 3. Cor completa e peças a mais: guardar para o próximo projeto? */}
      {extra > 0 && resposta === null && (
        <motion.div
          className={styles.pergunta}
          role="group"
          aria-label="Guardar as peças a mais?"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.textos}>
            <p className={styles.texto}>
              <span aria-hidden="true">{mascote.emoji} ✅ </span>
              {chamada} já tem {todasAsPecas(mascote, jogo)} de que precisa!
            </p>
            <p className={styles.texto}>
              <strong>Guardamos {estasPecas(mascote, extra)} para {mascote.proximoProjeto}?</strong>
            </p>
          </div>
          <div className={styles.opcoes}>
            <motion.button type="button" className={styles.sim} onClick={() => responder(true)} whileTap={{ scale: 0.92 }}>
              <span className={styles.imagem} aria-hidden="true">
                <Peca mascote={mascote} jogo={jogo} className={styles.pecaPequena} /> ➜ 📦
              </span>
              Sim, guarda!
            </motion.button>
            <motion.button type="button" className={styles.nao} onClick={() => responder(false)} whileTap={{ scale: 0.92 }}>
              <span className={styles.imagem} aria-hidden="true">
                👋
              </span>
              Não
            </motion.button>
          </div>
        </motion.div>
      )}
      {extra > 0 && resposta === 'sim' && (
        <p className={styles.guardado}>📦 Guardado para {mascote.proximoProjeto}!</p>
      )}
    </div>
  )
}

export default PremioPecas
