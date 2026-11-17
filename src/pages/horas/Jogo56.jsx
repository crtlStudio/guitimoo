import { useEffect, useRef, useState } from 'react'
import atividades from '../../data/atividades.json'
import BalaoMascote from '../../components/BalaoMascote'
import { aHora } from '../../games/horas/horas'
import { lembrarUsada, lerProgresso, registarResposta } from '../../games/horas/memoria'
import { atividadePara, chaveDaHora, nomeDoNivel, sortearHora } from '../../games/horas/sorteio'
import { tocarEfeito } from '../../audio/efeitos'
import Relogio from './Relogio'
import styles from './JogoRelogio.module.css'
import { useChamada } from '../../components/useProgresso'
import ImagemPalavra from '../../components/ImagemPalavra'

const ESCALAO = '5-6'
const ESPERA_DEPOIS_DE_ACERTAR = 1800

/**
 * 5–6 anos: horas certas. O ponteiro dos minutos está fixo no 12 e a
 * criança roda o ponteiro das horas até à hora pedida; o ponteiro encaixa
 * nos números.
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons, estrelas e a mascote avança)
 */
function Jogo56({ aoAcertar, aoErrar }) {
  // Quem faz as atividades das perguntas: a mascote escolhida ("O Panda vai almoçar…")
  const quem = useChamada(true)
  const progresso = useRef(null) // nível e horas recentes (lidos do telemóvel)
  const [ronda, setRonda] = useState(null) // { alvo: {h, m}, atividade }
  // Posição do ponteiro das horas, em horas a partir do 12. Pode passar de 12
  // ou ser negativa (dar voltas): 1 e 13 apontam ambos para o 1.
  const [posicao, setPosicao] = useState(0)
  const posicaoRef = useRef(0) // a mesma posição, para ler logo nos eventos
  const graus = useRef(0) // ângulo exato do dedo acumulado (antes de encaixar)
  const [mensagem, setMensagem] = useState(null)
  const [resolvida, setResolvida] = useState(false)
  const temporizador = useRef(null)

  function mudarPosicao(nova) {
    posicaoRef.current = nova
    setPosicao(nova)
  }

  function novaRonda() {
    const p = progresso.current
    const alvo = sortearHora(nomeDoNivel(ESCALAO, p.nivel), p.recentes)
    progresso.current = lembrarUsada(ESCALAO, p, chaveDaHora(alvo))

    // O ponteiro começa do lado oposto à resposta, para a criança ter de o rodar
    const inicio = (alvo.h % 12) + 6
    graus.current = inicio * 30
    mudarPosicao(inicio)
    setRonda({ alvo, atividade: atividadePara(alvo, atividades) })
    setMensagem(null)
    setResolvida(false)
  }

  // Lê o progresso guardado e começa a primeira ronda
  useEffect(() => {
    let ativo = true
    lerProgresso(ESCALAO).then((p) => {
      if (!ativo) return
      progresso.current = p
      novaRonda()
    })
    return () => {
      ativo = false
      clearTimeout(temporizador.current)
    }
    // Só ao abrir o jogo: a primeira ronda começa uma vez (as seguintes vêm de verificar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** O dedo rodou `diferenca` graus: o ponteiro encaixa no número mais próximo (30° cada). */
  function aoRodar(diferenca) {
    if (resolvida) return
    graus.current += diferenca
    const nova = Math.round(graus.current / 30)
    if (nova !== posicaoRef.current) {
      mudarPosicao(nova)
      tocarEfeito('tictac')
    }
  }

  function aoLargar() {
    graus.current = posicaoRef.current * 30 // fica exatamente no número
  }

  function verificar() {
    const horaNoRelogio = ((posicao % 12) + 12) % 12 // 0 a 11 (0 = 12)
    if (horaNoRelogio === ronda.alvo.h % 12) {
      progresso.current = registarResposta(ESCALAO, progresso.current, true)
      setResolvida(true)
      setMensagem((m) => ({ tipo: 'fim', vez: (m?.vez ?? 0) + 1 }))
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      if (!acabou) temporizador.current = setTimeout(novaRonda, ESPERA_DEPOIS_DE_ACERTAR)
    } else {
      aoErrar?.()
      progresso.current = registarResposta(ESCALAO, progresso.current, false)
      setMensagem((m) => ({ tipo: 'erro', vez: (m?.vez ?? 0) + 1 }))
    }
  }

  if (!ronda) return null

  const { alvo, atividade } = ronda
  const numeroAlvo = alvo.h % 12 === 0 ? 12 : alvo.h % 12

  return (
    <>
      <div className={styles.zonaRelogio}>
        <Relogio
          anguloHoras={posicao * 30}
          anguloMinutos={0}
          ativo={resolvida ? null : 'horas'}
          aoRodar={aoRodar}
          aoLargar={aoLargar}
          rotulo="Relógio: roda o ponteiro pequeno"
        />
      </div>

      <div className={styles.lado}>
        <p className={styles.pergunta}>
          <span className={styles.emojiPergunta} aria-hidden="true">
            <ImagemPalavra palavra={atividade.imagem} emoji={atividade.emoji} />
          </span>
          {quem} {atividade.texto} {aHora(alvo)}!
        </p>

        {/* A ajuda, sem texto: um ponteiro pequenino (igual ao do relógio) a apontar para o número */}
        <p className={styles.ajuda} style={{ margin: 0 }} aria-label={`Ponteiro pequeno no ${numeroAlvo}`}>
          <svg className={styles.miniPonteiro} viewBox="0 0 60 24" aria-hidden="true">
            <line x1="8" y1="12" x2="46" y2="12" className={styles.miniHoras} />
            <circle cx="47" cy="12" r="8" className={styles.miniPega} />
            <circle cx="8" cy="12" r="6" className={styles.miniCentro} />
          </svg>
          <span className={styles.numeroAlvo} aria-hidden="true">
            {numeroAlvo}
          </span>
        </p>

        <button type="button" className={styles.pronto} onClick={verificar} disabled={resolvida} aria-label="Já está!">
          <span aria-hidden="true">✓</span>
        </button>
      </div>

      <BalaoMascote
        mensagem={mensagem}
        textos={{ fim: 'Boa! Chego a horas!' }}
        className={styles.mensagem}
      />
    </>
  )
}

export default Jogo56
