import { useRef, useState } from 'react'
import { anguloDoPonto, diferencaAngular } from '../../games/tartaruga/horas'
import styles from './Relogio.module.css'

// Cores dos círculos dos números (à volta do relógio)
const CORES_NUMEROS = ['#ffd84d', '#7ed957', '#5ec8f2', '#ffb347', '#c39bf0', '#ff8fab']

// Desenho em SVG: o centro do relógio é o ponto (0, 0) e o mostrador vai de -100 a 100.
// Num SVG, y cresce para baixo, por isso o 12 fica em y negativo.
const RAIO_NUMEROS = 70
const posicaoDoNumero = (n) => {
  const angulo = (n * 30 * Math.PI) / 180
  return { x: Math.sin(angulo) * RAIO_NUMEROS, y: -Math.cos(angulo) * RAIO_NUMEROS }
}

/**
 * Relógio de ponteiros desenhado em SVG.
 *
 * Os ângulos são em graus a partir do 12 (0° = 12, 90° = 3) e podem passar
 * de 360 (ex.: 450° = 90° dada uma volta), para os ponteiros rodarem sempre
 * para o lado certo quando dão a volta.
 *
 * Props:
 * - anguloHoras, anguloMinutos: posição dos ponteiros
 * - ativo: 'horas', 'minutos' ou null — o ponteiro que a criança pode rodar
 * - aoRodar(graus): chamada enquanto o dedo roda (graus a mais, + ou -)
 * - aoLargar(): chamada quando o dedo larga o relógio
 * - rotulo: descrição para leitores de ecrã
 */
function Relogio({ anguloHoras, anguloMinutos, ativo = null, aoRodar, aoLargar, rotulo }) {
  const svgRef = useRef(null)
  const ultimoAngulo = useRef(null) // ângulo do dedo no movimento anterior
  const [aArrastar, setAArrastar] = useState(false)

  /** Ângulo do dedo/rato visto do centro do relógio. */
  function anguloDoEvento(evento) {
    const caixa = svgRef.current.getBoundingClientRect()
    const centroX = caixa.left + caixa.width / 2
    const centroY = caixa.top + caixa.height / 2
    return anguloDoPonto(evento.clientX, evento.clientY, centroX, centroY)
  }

  function aoPousar(evento) {
    if (!ativo || !evento.isPrimary) return
    evento.currentTarget.setPointerCapture(evento.pointerId)
    const angulo = anguloDoEvento(evento)
    // O ponteiro salta logo para onde a criança tocou (pelo caminho mais curto)
    const atual = ativo === 'horas' ? anguloHoras : anguloMinutos
    aoRodar(diferencaAngular(atual, angulo))
    ultimoAngulo.current = angulo
    setAArrastar(true)
  }

  function aoMover(evento) {
    if (ultimoAngulo.current === null) return
    const angulo = anguloDoEvento(evento)
    // Quanto rodou desde o último movimento: somar estes bocadinhos permite
    // dar várias voltas (e o ponteiro das horas anda com as voltas dos minutos)
    aoRodar(diferencaAngular(ultimoAngulo.current, angulo))
    ultimoAngulo.current = angulo
  }

  function aoLevantar() {
    if (ultimoAngulo.current === null) return
    ultimoAngulo.current = null
    setAArrastar(false)
    aoLargar?.()
  }

  return (
    <svg
      ref={svgRef}
      className={`${styles.relogio} ${ativo ? styles.ativo : ''} ${aArrastar ? styles.aArrastar : ''}`}
      viewBox="-100 -100 200 200"
      role="img"
      aria-label={rotulo}
      onPointerDown={aoPousar}
      onPointerMove={aoMover}
      onPointerUp={aoLevantar}
      onPointerCancel={aoLevantar}
    >
      {/* Aro colorido e mostrador */}
      <circle r="97" className={styles.aro} />
      <circle r="90" className={styles.mostrador} />

      {/* 60 tracinhos dos minutos (os de 5 em 5 mais grossos) */}
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          className={i % 5 === 0 ? styles.tracoGrande : styles.traco}
          x1="0"
          y1={i % 5 === 0 ? -88 : -88}
          x2="0"
          y2={i % 5 === 0 ? -81 : -85}
          transform={`rotate(${i * 6})`}
        />
      ))}

      {/* Números de 1 a 12, cada um num círculo colorido */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const { x, y } = posicaoDoNumero(n)
        return (
          <g key={n}>
            <circle cx={x} cy={y} r="13" fill={CORES_NUMEROS[i % CORES_NUMEROS.length]} />
            <text x={x} y={y} className={styles.numero}>
              {n}
            </text>
          </g>
        )
      })}

      {/* Ponteiro das horas: curto e grosso, laranja */}
      <g
        className={`${styles.ponteiro} ${ativo === 'horas' ? styles.ponteiroAtivo : ''}`}
        style={{ transform: `rotate(${anguloHoras}deg)` }}
      >
        <line x1="0" y1="8" x2="0" y2="-44" className={styles.horas} />
        {ativo === 'horas' && <circle cy="-44" r="9" className={styles.pega} />}
      </g>

      {/* Ponteiro dos minutos: comprido e fino, azul */}
      <g
        className={`${styles.ponteiro} ${ativo === 'minutos' ? styles.ponteiroAtivo : ''}`}
        style={{ transform: `rotate(${anguloMinutos}deg)` }}
      >
        <line x1="0" y1="10" x2="0" y2="-68" className={styles.minutos} />
        {ativo === 'minutos' && <circle cy="-68" r="9" className={styles.pega} />}
      </g>

      {/* Parafuso do centro */}
      <circle r="7" className={styles.centro} />
    </svg>
  )
}

export default Relogio
