import { useEffect, useRef, useState } from 'react'
import { useChamada } from '../../components/useProgresso'
import atividades from '../../data/atividades.json'
import BalaoMascote from '../../components/BalaoMascote'
import {
  aHora,
  anguloDasHoras,
  anguloDosMinutos,
  encaixar,
  horaDigital,
  horaDosMinutos,
  mesmaHoraNoRelogio,
} from '../../games/horas/horas'
import { lembrarUsada, lerProgresso, registarResposta } from '../../games/horas/memoria'
import {
  atividadePara,
  chaveDaHora,
  nomeDoNivel,
  opcoesDeHora,
  sortearHora,
} from '../../games/horas/sorteio'
import { tocarEfeito } from '../../audio/efeitos'
import Relogio from './Relogio'
import styles from './JogoRelogio.module.css'
import ImagemPalavra from '../../components/ImagemPalavra'

const ESCALAO = '7-8'
const ESPERA_DEPOIS_DE_ACERTAR = 1800

// Onde o ponteiro dos minutos encaixa ao largar o dedo, em cada nível
const ENCAIXE = { horasCertas: 60, meiasHoras: 30, quartos: 15, cincoMinutos: 5 }

/**
 * 7–8 anos: horas certas, meias horas, quartos e minutos de 5 em 5.
 * Dois tipos de ronda:
 * - 'acertar': a criança roda o ponteiro dos minutos e o das horas acompanha,
 *   como num relógio a sério
 * - 'ler': o relógio mostra uma hora e a criança escolhe entre 3 relógios digitais
 *
 * Props: aoAcertar() e aoErrar() — avisam a página (sons, estrelas e a mascote avança)
 */
function Jogo78({ aoAcertar, aoErrar }) {
  // Quem faz as atividades das perguntas: a mascote escolhida ("O Panda vai almoçar…")
  const quem = useChamada(true)
  const progresso = useRef(null)
  // Ronda: { tipo, nivel, alvo, atividade, opcoes }
  const [ronda, setRonda] = useState(null)
  // Total de minutos rodados desde as 12:00 (pode dar voltas e ser negativo)
  const [totalMinutos, setTotalMinutos] = useState(0)
  const totalRef = useRef(0)
  const graus = useRef(0) // ângulo exato do ponteiro dos minutos, antes de encaixar
  const [mensagem, setMensagem] = useState(null)
  const [resolvida, setResolvida] = useState(false)
  const [escolhida, setEscolhida] = useState(null) // opção certa tocada (para a pintar)
  const temporizador = useRef(null)

  function mudarTotal(novo) {
    totalRef.current = novo
    setTotalMinutos(novo)
  }

  function novaRonda() {
    const p = progresso.current
    const nivel = nomeDoNivel(ESCALAO, p.nivel)
    const alvo = sortearHora(nivel, p.recentes)
    progresso.current = lembrarUsada(ESCALAO, p, chaveDaHora(alvo))

    // Metade das rondas é "acertar o relógio", a outra metade é "ler o relógio"
    const tipo = Math.random() < 0.5 ? 'acertar' : 'ler'

    // O relógio começa nas 12:00 (ou nas 6:00, se a resposta for as 12:00)
    const inicio = chaveDaHora(alvo) === '0:0' ? 360 : 0
    graus.current = anguloDosMinutos(inicio)
    mudarTotal(inicio)

    setRonda({
      tipo,
      nivel,
      alvo,
      atividade: atividadePara(alvo, atividades),
      opcoes: tipo === 'ler' ? opcoesDeHora(alvo, nivel) : null,
    })
    setMensagem(null)
    setResolvida(false)
    setEscolhida(null)
  }

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

  // ----- Acertar o relógio -----

  /** O dedo rodou o ponteiro dos minutos: 6° = 1 minuto; mostra de 5 em 5. */
  function aoRodar(diferenca) {
    if (resolvida) return
    graus.current += diferenca
    const novo = encaixar(graus.current / 6, 5)
    if (novo !== totalRef.current) {
      mudarTotal(novo)
      tocarEfeito('tictac')
    }
  }

  /** Ao largar, o ponteiro encaixa nas posições do nível (horas, meias, quartos...). */
  function aoLargar() {
    const encaixado = encaixar(totalRef.current, ENCAIXE[ronda.nivel])
    graus.current = anguloDosMinutos(encaixado)
    if (encaixado !== totalRef.current) mudarTotal(encaixado)
  }

  // ----- Certo ou errado -----

  function acertou() {
    progresso.current = registarResposta(ESCALAO, progresso.current, true)
    setResolvida(true)
    setMensagem((m) => ({ tipo: 'fim', vez: (m?.vez ?? 0) + 1 }))
    const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
    if (!acabou) temporizador.current = setTimeout(novaRonda, ESPERA_DEPOIS_DE_ACERTAR)
  }

  function errou() {
    aoErrar?.()
    progresso.current = registarResposta(ESCALAO, progresso.current, false)
    setMensagem((m) => ({ tipo: 'erro', vez: (m?.vez ?? 0) + 1 }))
  }

  function verificarRelogio() {
    if (mesmaHoraNoRelogio(horaDosMinutos(totalMinutos), ronda.alvo)) acertou()
    else errou()
  }

  function escolherOpcao(opcao) {
    if (resolvida) return
    if (chaveDaHora(opcao) === chaveDaHora(ronda.alvo)) {
      setEscolhida(opcao)
      acertou()
    } else {
      errou()
    }
  }

  if (!ronda) return null

  const { tipo, alvo, atividade, opcoes } = ronda
  // No "ler", o relógio mostra a resposta; no "acertar", mostra o que a criança rodou
  const minutosMostrados = tipo === 'ler' ? alvo.h * 60 + alvo.m : totalMinutos

  return (
    <>
      <div className={styles.zonaRelogio}>
        <Relogio
          anguloHoras={tipo === 'ler' ? anguloDasHoras(alvo.h, alvo.m) : minutosMostrados * 0.5}
          anguloMinutos={tipo === 'ler' ? anguloDosMinutos(alvo.m) : anguloDosMinutos(minutosMostrados)}
          ativo={tipo === 'acertar' && !resolvida ? 'minutos' : null}
          aoRodar={aoRodar}
          aoLargar={aoLargar}
          rotulo={tipo === 'acertar' ? 'Relógio: roda o ponteiro grande' : 'Relógio'}
        />
      </div>

      <div className={styles.lado}>
        {tipo === 'acertar' ? (
          <>
            <p className={styles.pergunta}>
              <span className={styles.emojiPergunta} aria-hidden="true">
                <ImagemPalavra palavra={atividade.imagem} emoji={atividade.emoji} />
              </span>
              {quem} {atividade.texto} {aHora(alvo)}!
            </p>
            <button
              type="button"
              className={styles.pronto}
              onClick={verificarRelogio}
              disabled={resolvida}
              aria-label="Já está!"
            >
              <span aria-hidden="true">✓</span>
            </button>
          </>
        ) : (
          <>
            <p className={styles.pergunta}>
              <span className={styles.emojiPergunta} aria-hidden="true">
                ⏰
              </span>
              Que horas são no relógio?
            </p>
            <div className={styles.opcoes}>
              {opcoes.map((opcao) => (
                <button
                  key={chaveDaHora(opcao)}
                  type="button"
                  className={`${styles.opcao} ${escolhida === opcao ? styles.opcaoCerta : ''}`}
                  onClick={() => escolherOpcao(opcao)}
                >
                  {horaDigital(opcao)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <BalaoMascote
        mensagem={mensagem}
        textos={{ fim: 'Boa! Chego a horas!' }}
        className={styles.mensagem}
      />
    </>
  )
}

export default Jogo78
