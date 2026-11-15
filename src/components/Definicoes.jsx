import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { tocarEfeito } from '../audio/efeitos'
import { mudarVolume, useVolume, VOLUME_MAXIMO, VOLUME_MINIMO } from '../audio/volume'
import styles from './Definicoes.module.css'

// Roda dentada (ícone de definições)
const RODA =
  'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'

/**
 * Uma linha da janela: nome, girafa, seletor e leão.
 * - tipo: 'musica' ou 'efeitos' (ver audio/volume.js)
 */
function SeletorVolume({ tipo, nome, icone }) {
  const volume = useVolume(tipo)
  const id = `definicoes-volume-${tipo}`
  // Percentagem do seletor (0% na girafa, 100% no leão), para pintar a barra
  const percentagem = ((volume - VOLUME_MINIMO) / (VOLUME_MAXIMO - VOLUME_MINIMO)) * 100

  // Nos efeitos, ao largar o dedo ouve-se um "certo" com o volume novo
  // (na música não é preciso: a música está a tocar e ouve-se logo a mudar)
  const exemplo = tipo === 'efeitos' ? () => tocarEfeito('certo') : undefined

  return (
    <>
      <label className={styles.etiqueta} htmlFor={id}>
        <span aria-hidden="true">{icone}</span> {nome}
      </label>
      <div className={styles.linhaVolume}>
        <span className={styles.baixo} aria-hidden="true" title="Baixinho">
          🦒
        </span>
        <input
          id={id}
          className={styles.seletor}
          type="range"
          min={VOLUME_MINIMO}
          max={VOLUME_MAXIMO}
          step={0.05}
          value={volume}
          style={{ '--cheio': `${percentagem}%` }}
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={(evento) => mudarVolume(tipo, evento.target.value)}
          onPointerUp={exemplo}
          onKeyUp={exemplo}
        />
        <span className={styles.alto} aria-hidden="true" title="Alto">
          🦁
        </span>
      </div>
    </>
  )
}

/**
 * Botão de definições (roda dentada, canto inferior direito) e a janela
 * que abre, com dois volumes, cada um num seletor da girafa 🦒 (baixinho)
 * ao leão 🦁 (alto):
 *   Música  → a música de fundo e a de cada página
 *   Efeitos → os sons dos jogos (certo, erro, estrela, festa, toque, Coruja...)
 */
function Definicoes() {
  const [aberta, setAberta] = useState(false)

  // Com a janela aberta, a tecla Esc (ou o botão "voltar" do teclado) fecha-a
  useEffect(() => {
    if (!aberta) return
    const aoCarregar = (evento) => {
      if (evento.key === 'Escape') setAberta(false)
    }
    document.addEventListener('keydown', aoCarregar)
    return () => document.removeEventListener('keydown', aoCarregar)
  }, [aberta])

  return (
    <>
      <button
        type="button"
        className={styles.botao}
        onClick={() => setAberta(true)}
        aria-label="Definições"
        aria-haspopup="dialog"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path className={styles.contorno} d={RODA} />
          <path className={styles.preenchido} d={RODA} />
          <circle className={styles.centro} cx="12" cy="12" r="3" />
        </svg>
      </button>

      <AnimatePresence>
        {aberta && (
          <motion.div
            className={styles.fundo}
            // Tocar fora da janela também a fecha
            onClick={(evento) => {
              if (evento.target === evento.currentTarget) setAberta(false)
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.janela}
              role="dialog"
              aria-modal="true"
              aria-labelledby="definicoes-titulo"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <h2 id="definicoes-titulo" className={styles.titulo}>
                Definições
              </h2>

              {/* Um seletor para cada tipo de som */}
              <div className={styles.volumes}>
                <SeletorVolume tipo="musica" nome="Música" icone="🎵" />
                <SeletorVolume tipo="efeitos" nome="Efeitos" icone="🔔" />
              </div>

              <button type="button" className={styles.pronto} onClick={() => setAberta(false)}>
                Pronto
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Definicoes
