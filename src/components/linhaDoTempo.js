// ============================================================
// O caminho do dedo fantasma (ver DedoFantasma.jsx), sem ecrã: só contas,
// fácil de testar. Recebe os passos já com os pontos (em píxeis) e devolve
// as "fotografias" (keyframes) para o motion animar:
//   { duracao, tempos: [0, ..., 1], x: [...], y: [...], escala: [...],
//     opacidade: [...], objetos: [{ imagem, x, y, opacidade }] }
//
// Cada passo:
//   { tipo: 'tocar', em: {x, y}, vezes: 2 }        carrega no sítio (vezes)
//   { tipo: 'arrastar', de: {x, y}, para: {x, y}, imagem }   leva algo
//   { tipo: 'percorrer', de: {x, y}, para: {x, y} }          passa por cima
// ============================================================

// Quanto demora cada movimento (segundos)
const VIAGEM = 0.45 // ir de um sítio para outro
const CARREGAR = 0.15 // o dedo baixa
const LARGAR = 0.2 // o dedo sobe
const LEVAR = 0.9 // a arrastar
const PERCORRER = 0.9
const APARECER = 0.3

const OPACIDADE = 0.85 // o dedo é "fantasma": um pouco transparente
const CARREGADO = 0.82 // tamanho do dedo quando carrega

/** O primeiro ponto de um passo (onde o dedo começa). */
function inicioDe(passo) {
  return passo.tipo === 'tocar' ? passo.em : passo.de
}

/** Constrói a linha do tempo. Sem passos: null. */
export function criarLinhaDoTempo(passos) {
  if (!passos || passos.length === 0) return null
  const fotos = [] // { t, x, y, escala, opacidade }
  let t = 0
  const foto = (ponto, escala, opacidade = OPACIDADE) => fotos.push({ t, x: ponto.x, y: ponto.y, escala, opacidade })
  const arrastos = [] // { imagem, de, ate }: índices das fotos em que leva o objeto

  // Aparece no início do 1.º passo
  const primeiro = inicioDe(passos[0])
  foto(primeiro, 1.1, 0)
  t += APARECER
  foto(primeiro, 1)

  for (const passo of passos) {
    t += VIAGEM
    foto(inicioDe(passo), 1)
    if (passo.tipo === 'tocar') {
      for (let i = 0; i < (passo.vezes ?? 1); i++) {
        t += CARREGAR
        foto(passo.em, CARREGADO)
        t += LARGAR
        foto(passo.em, 1)
      }
    } else if (passo.tipo === 'arrastar') {
      t += CARREGAR
      foto(passo.de, CARREGADO)
      const de = fotos.length - 1
      t += LEVAR
      foto(passo.para, CARREGADO)
      t += LARGAR
      foto(passo.para, 1)
      if (passo.imagem) arrastos.push({ imagem: passo.imagem, de, ate: fotos.length - 2 })
    } else {
      t += PERCORRER
      foto(passo.para, 1)
    }
  }

  // Desaparece onde acabou
  const ultimo = fotos.at(-1)
  t += APARECER
  foto(ultimo, 1, 0)

  const duracao = t
  return {
    duracao,
    tempos: fotos.map((f) => f.t / duracao),
    x: fotos.map((f) => f.x),
    y: fotos.map((f) => f.y),
    escala: fotos.map((f) => f.escala),
    opacidade: fotos.map((f) => f.opacidade),
    // Cada coisa arrastada segue o dedo, e só se vê enquanto ele a leva
    objetos: arrastos.map(({ imagem, de, ate }) => ({
      imagem,
      x: fotos.map((f) => f.x),
      y: fotos.map((f) => f.y),
      opacidade: fotos.map((_, i) => (i >= de && i <= ate ? 0.75 : 0)),
    })),
  }
}
