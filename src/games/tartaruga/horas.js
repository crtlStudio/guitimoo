// ============================================================
// Horas: texto em português de Portugal, ângulos dos ponteiros e
// comparação de horas.
//
// Uma hora é um objeto { h, m }:
//   h = hora do dia, de 0 a 23 (0 = meia-noite, 12 = meio-dia, 15 = três da tarde)
//   m = minutos, de 0 a 59 (no jogo, sempre de 5 em 5)
// ============================================================

const NOMES_DAS_HORAS = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze']

// Como se dizem os minutos (de 5 em 5) até à meia hora
const NOMES_DOS_MINUTOS = {
  5: 'cinco',
  10: 'dez',
  15: 'um quarto',
  20: 'vinte',
  25: 'vinte e cinco',
  30: 'meia',
}

/** Nome de uma hora do dia: 0 → 'meia-noite', 12 → 'meio-dia', 15 → 'três'. */
function nomeDaHora(h) {
  const hora = ((h % 24) + 24) % 24 // 24 → 0, -1 → 23
  if (hora === 0) return 'meia-noite'
  if (hora === 12) return 'meio-dia'
  return NOMES_DAS_HORAS[hora % 12]
}

/**
 * A hora dita em voz alta, como em Portugal:
 *   {h: 15, m: 0}  → 'três horas'
 *   {h: 13, m: 0}  → 'uma hora'
 *   {h: 12, m: 0}  → 'meio-dia'
 *   {h: 15, m: 30} → 'três e meia'
 *   {h: 16, m: 45} → 'um quarto para as cinco'
 *   {h: 12, m: 50} → 'dez para a uma'
 *   {h: 23, m: 45} → 'um quarto para a meia-noite'
 */
export function textoDaHora({ h, m }) {
  if (m % 5 !== 0 || m < 0 || m > 55) throw new Error(`Minutos inválidos: ${m}`)

  // Hora certa
  if (m === 0) {
    const nome = nomeDaHora(h)
    if (nome === 'meio-dia' || nome === 'meia-noite') return nome
    return nome === 'uma' ? 'uma hora' : `${nome} horas`
  }

  // Até à meia hora: "três e dez", "três e um quarto", "três e meia"
  if (m <= 30) return `${nomeDaHora(h)} e ${NOMES_DOS_MINUTOS[m]}`

  // Depois da meia hora conta-se o que falta para a hora seguinte:
  // "vinte para as quatro", "um quarto para a uma", "cinco para o meio-dia"
  const seguinte = nomeDaHora(h + 1)
  const artigo = seguinte === 'meio-dia' ? 'o' : seguinte === 'meia-noite' || seguinte === 'uma' ? 'a' : 'as'
  return `${NOMES_DOS_MINUTOS[60 - m]} para ${artigo} ${seguinte}`
}

/**
 * A hora com a palavra certa antes, para usar numa frase
 * ("A tartaruga vai almoçar à uma hora!"):
 *   'às três e meia', 'à uma hora', 'ao meio-dia', 'à meia-noite',
 *   'a um quarto para as cinco'
 */
export function aHora(hora) {
  const texto = textoDaHora(hora)
  if (hora.m > 30) return `a ${texto}`
  if (texto.startsWith('meio-dia')) return `ao ${texto}`
  if (texto.startsWith('meia-noite') || texto.startsWith('uma')) return `à ${texto}`
  return `às ${texto}`
}

/** Hora como num relógio digital de 12 horas: {h: 16, m: 5} → '4:05'. */
export function horaDigital({ h, m }) {
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')}`
}

/**
 * Diz se duas horas aparecem iguais num relógio de ponteiros
 * (que não distingue manhã de tarde: 3:00 e 15:00 são iguais).
 */
export function mesmaHoraNoRelogio(a, b) {
  return a.h % 12 === b.h % 12 && a.m === b.m
}

// ------------------------------------------------------------
// Ângulos, em graus, a contar do 12 no sentido dos ponteiros do relógio
// (0° = 12, 90° = 3, 180° = 6, 270° = 9).
// ------------------------------------------------------------

/** Ângulo do ponteiro dos minutos: 6° por minuto (360° / 60). */
export const anguloDosMinutos = (m) => m * 6

/** Ângulo do ponteiro das horas: 30° por hora, mais 0,5° por cada minuto. */
export const anguloDasHoras = (h, m) => (h % 12) * 30 + m * 0.5

/**
 * Ângulo de um ponto (o dedo) visto do centro do relógio.
 * Usa Math.atan2, que dá o ângulo de uma direção; trocamos a ordem dos
 * eixos para o 0° ficar em cima (no 12) e os ângulos crescerem para a direita.
 */
export function anguloDoPonto(x, y, centroX, centroY) {
  const graus = (Math.atan2(x - centroX, centroY - y) * 180) / Math.PI
  return (graus + 360) % 360
}

/**
 * Quanto é preciso rodar para ir de um ângulo a outro pelo caminho mais
 * curto, entre -180° e 180°. Ex.: de 350° para 10° são +20° (não -340°).
 */
export function diferencaAngular(de, para) {
  return ((((para - de) % 360) + 540) % 360) - 180
}

/**
 * Hora mostrada por um relógio a partir do total de minutos rodados desde
 * as 12:00 (pode ser negativo ou passar das 12 horas).
 *   0 → 12:00 · 90 → 1:30 · -15 → 11:45 · 780 → 1:00
 */
export function horaDosMinutos(totalMinutos) {
  const minutosNoDia = ((totalMinutos % 720) + 720) % 720 // 0 a 719
  return { h: Math.floor(minutosNoDia / 60), m: minutosNoDia % 60 }
}

/** Arredonda um número ao múltiplo mais próximo de `passo`. */
export const encaixar = (valor, passo) => Math.round(valor / passo) * passo
