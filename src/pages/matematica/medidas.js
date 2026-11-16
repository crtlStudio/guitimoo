// ============================================================
// Medidas do jogo de Matemática, todas num sítio só, para ser fácil ajustar.
//
// As medidas no ecrã estão em "cqw": 1cqw = 1% da LARGURA da imagem de fundo.
// A imagem é 16:9, por isso a altura toda tem 56.25cqw.
// As medidas DENTRO de uma imagem estão em % dessa imagem (0 = esquerda/cima,
// 100 = direita/baixo), como as medi no ficheiro.
// ============================================================

/** Altura da imagem de fundo, em cqw (16:9 → 9/16 × 100). */
export const ALTURA_DO_FUNDO = 56.25

/** O corpo da balança (balanca.webp, quadrada; medidas em % da imagem, medidas no ficheiro). */
export const SUPORTE = {
  largura: 27, // largura da imagem no ecrã (cqw); a imagem é quadrada (os braços não mudam com isto)
  centroX: 50, // onde fica o centro do suporte no ecrã (% da largura do fundo)
  chao: 82, // onde fica a base do suporte no ecrã (% da altura do fundo)
  baseNaImagem: 93.8, // onde acaba a base azul dentro da imagem (% da altura)
  eixoX: 50, // centro do mostrador = eixo da balança, onde roda o ponteiro (% da imagem)
  eixoY: 50.3,
  bracosY: 44, // altura onde os braços saem da balança (% da imagem): mais acima do que o eixo,
  //              para terem espaço para descer (a ponta do tubo fica escondida atrás do corpo)
}

/** Os braços da balança (braco_esquerdo.png 945x82 e braco_direito.png 971x82). */
export const BRACOS = {
  comprimento: 30, // largura do braço esquerdo no ecrã (cqw); o direito é proporcional
  // ligacao: ponta do tubo que encaixa no eixo; prato: centro do prato e linha de cima do prato
  esquerdo: { largura: 945, altura: 82, ligacaoX: 94, ligacaoY: 50, pratoX: 20, pratoY: 24 },
  direito: { largura: 971, altura: 82, ligacaoX: 5, ligacaoY: 50, pratoX: 78, pratoY: 23 },
}

/** Os cubinhos (cubo_verde.webp, cubo_laranja.webp, cubo_azul.webp, quadrados). */
export const CUBINHO = {
  noMonte: 5.6, // tamanho no chão (cqw): grande, para dedos pequenos
  noPrato: 3.6, // tamanho em cima do prato, com poucos cubinhos (cqw)
  noPratoPequeno: 2.9, // tamanho em cima do prato, com muitos (em grupos de 5 e de 10)
}

/**
 * Zonas de relva onde os cubinhos podem ficar no chão (o "monte"), à volta
 * do suporte. Cada zona: onde pode ficar o CENTRO DA BASE de um cubinho
 * (x1–x2 na horizontal, y1–y2 na vertical, em cqw). Os cubinhos são
 * espalhados ao acaso dentro delas (ver games/matematica/monte.js).
 */
export const ZONAS_DO_MONTE = [
  { x1: 19, x2: 81, y1: 50, y2: 55.5 }, // à frente, de um lado ao outro
  { x1: 19, x2: 36, y1: 45, y2: 49 }, // por baixo do prato esquerdo
  { x1: 64, x2: 81, y1: 45, y2: 49 }, // por baixo do prato direito
]

/** Distância mínima entre dois cubinhos no chão (cqw): podem tocar-se um bocadinho, mas não se tapam. */
export const DISTANCIA_NO_MONTE = 4.4

/**
 * Ponteiro no botão azul (como o de um relógio): aponta para cima quando a
 * balança está equilibrada e roda para o lado mais pesado.
 */
export const PONTEIRO = {
  comprimento: 5.5, // altura do ponteiro (cqw); o pino fica no centro do mostrador
  exagero: 2, // roda o dobro da barra, para se ver bem a diferença
}

/** Zona onde se pode largar um cubinho num prato (cqw): maior do que o prato, para ser fácil acertar. */
export const ZONA_DO_PRATO = { largura: 15, altura: 16, abaixo: 2.5 }

/**
 * Tamanho e posição de cada braço no ecrã (em cqw), RELATIVOS ao eixo:
 * a ponta do tubo de cada braço fica exatamente em cima do eixo (0, 0).
 * Os dois usam a mesma escala (cqw por píxel da imagem), para terem a mesma grossura.
 */
export function medidasDosBracos() {
  const escala = BRACOS.comprimento / BRACOS.esquerdo.largura // cqw por píxel
  const braco = ({ largura, altura, ligacaoX, ligacaoY, pratoX, pratoY }) => {
    const l = largura * escala
    const a = altura * escala
    const esquerda = (-ligacaoX / 100) * l
    const topo = (-ligacaoY / 100) * a
    return {
      largura: l,
      altura: a,
      esquerda,
      topo,
      // Centro do prato, na linha de cima do prato (onde os cubinhos pousam)
      prato: { x: esquerda + (pratoX / 100) * l, y: topo + (pratoY / 100) * a },
    }
  }
  return { esquerdo: braco(BRACOS.esquerdo), direito: braco(BRACOS.direito) }
}

/**
 * Posição do suporte no ecrã, calculada a partir das medidas acima (em cqw):
 * - esquerda/topo: canto de cima à esquerda da imagem da balança
 * - eixo: o ponto do botão azul, à volta do qual a balança roda
 */
export function posicaoDoSuporte() {
  const esquerda = (SUPORTE.centroX / 100) * 100 - SUPORTE.largura / 2
  // A base da balança (93.8% da imagem) tem de ficar na linha do "chão"
  const topo = (SUPORTE.chao / 100) * ALTURA_DO_FUNDO - (SUPORTE.baseNaImagem / 100) * SUPORTE.largura
  return {
    esquerda,
    topo,
    // O botão azul, onde está o ponteiro
    eixo: {
      x: esquerda + (SUPORTE.eixoX / 100) * SUPORTE.largura,
      y: topo + (SUPORTE.eixoY / 100) * SUPORTE.largura,
    },
    // De onde saem os braços (na posição de partida, sem peso)
    bracos: {
      x: esquerda + (SUPORTE.eixoX / 100) * SUPORTE.largura,
      y: topo + (SUPORTE.bracosY / 100) * SUPORTE.largura,
    },
  }
}
