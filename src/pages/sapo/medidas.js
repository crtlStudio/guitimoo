// ============================================================
// Medidas do jogo do Sapo, todas num sítio só, para ser fácil ajustar.
//
// As medidas no ecrã estão em "cqw": 1cqw = 1% da LARGURA da imagem de fundo.
// A imagem é 16:9, por isso a altura toda tem 56.25cqw.
// As medidas DENTRO de uma imagem estão em % dessa imagem (0 = esquerda/cima,
// 100 = direita/baixo), como as medi no ficheiro.
// ============================================================

/** Altura da imagem de fundo, em cqw (16:9 → 9/16 × 100). */
export const ALTURA_DO_FUNDO = 56.25

/** O sapo grande (sapo_balanca.png, 1600x1600). */
export const SAPO = {
  largura: 32, // largura da imagem no ecrã (cqw); a imagem é quadrada
  centroX: 50, // onde fica o centro do sapo no ecrã (% da largura do fundo)
  chao: 82, // onde ficam os pés/base do sapo no ecrã (% da altura do fundo)
  baseNaImagem: 85.5, // onde acaba a base azul dentro da imagem (% da altura)
  eixoX: 50, // botão azul da barriga = eixo da balança (% da imagem)
  eixoY: 57,
  bracosY: 48.5, // altura onde os braços saem do sapo (% da imagem): mais acima do que o botão,
  //              para terem espaço para descer (a ponta do tubo fica escondida atrás do sapo)
}

/** Os braços da balança (braco_esquerdo.png 945x82 e braco_direito.png 971x82). */
export const BRACOS = {
  comprimento: 30, // largura do braço esquerdo no ecrã (cqw); o direito é proporcional
  // ligacao: ponta do tubo que encaixa no eixo; prato: centro do prato e linha de cima do prato
  esquerdo: { largura: 945, altura: 82, ligacaoX: 94, ligacaoY: 50, pratoX: 20, pratoY: 24 },
  direito: { largura: 971, altura: 82, ligacaoX: 5, ligacaoY: 50, pratoX: 78, pratoY: 23 },
}

/** Os sapinhos (sapinho.png, sapinho_laranja.png, sapinho_azul.png, 256x256). */
export const SAPINHO = {
  noMonte: 6.5, // tamanho no chão (cqw): grande, para dedos pequenos
  noPrato: 4.2, // tamanho em cima do prato, com poucos sapinhos (cqw)
  noPratoPequeno: 3.3, // tamanho em cima do prato, com muitos (em grupos de 5 e de 10)
}

/**
 * Zonas de relva onde os sapinhos podem ficar no chão (o "monte"), à volta
 * do sapo grande. Cada zona: onde pode ficar o CENTRO DOS PÉS de um sapinho
 * (x1–x2 na horizontal, y1–y2 na vertical, em cqw). Os sapinhos são
 * espalhados ao acaso dentro delas (ver games/sapo/monte.js).
 */
export const ZONAS_DO_MONTE = [
  { x1: 19, x2: 81, y1: 50, y2: 55.5 }, // à frente, de um lado ao outro
  { x1: 19, x2: 36, y1: 45, y2: 49 }, // por baixo do prato esquerdo
  { x1: 64, x2: 81, y1: 45, y2: 49 }, // por baixo do prato direito
]

/** Distância mínima entre dois sapinhos no chão (cqw): podem tocar-se um bocadinho, mas não se tapam. */
export const DISTANCIA_NO_MONTE = 4.4

/**
 * Ponteiro no botão azul (como o de um relógio): aponta para cima quando a
 * balança está equilibrada e roda para o lado mais pesado.
 */
export const PONTEIRO = {
  comprimento: 4.5, // altura do ponteiro (cqw); o pino fica no centro do botão
  exagero: 2, // roda o dobro da barra, para se ver bem a diferença
}

/** Zona onde se pode largar um sapinho num prato (cqw): maior do que o prato, para ser fácil acertar. */
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
      // Centro do prato, na linha de cima do prato (onde os sapinhos pousam)
      prato: { x: esquerda + (pratoX / 100) * l, y: topo + (pratoY / 100) * a },
    }
  }
  return { esquerdo: braco(BRACOS.esquerdo), direito: braco(BRACOS.direito) }
}

/**
 * Posição do sapo no ecrã, calculada a partir das medidas acima (em cqw):
 * - esquerda/topo: canto de cima à esquerda da imagem do sapo
 * - eixo: o ponto do botão azul, à volta do qual a balança roda
 */
export function posicaoDoSapo() {
  const esquerda = (SAPO.centroX / 100) * 100 - SAPO.largura / 2
  // A base do sapo (85.5% da imagem) tem de ficar na linha do "chão"
  const topo = (SAPO.chao / 100) * ALTURA_DO_FUNDO - (SAPO.baseNaImagem / 100) * SAPO.largura
  return {
    esquerda,
    topo,
    // O botão azul, onde está o ponteiro
    eixo: {
      x: esquerda + (SAPO.eixoX / 100) * SAPO.largura,
      y: topo + (SAPO.eixoY / 100) * SAPO.largura,
    },
    // De onde saem os braços (na posição de partida, sem peso)
    bracos: {
      x: esquerda + (SAPO.eixoX / 100) * SAPO.largura,
      y: topo + (SAPO.bracosY / 100) * SAPO.largura,
    },
  }
}
