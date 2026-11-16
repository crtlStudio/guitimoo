// ============================================================
// Gerar a grelha da sopa de letras.
//
// A grelha é uma lista de linhas; cada linha é uma lista de letras:
//   [
//     ['G', 'A', 'T', 'O'],
//     ['X', 'B', 'L', 'M'],
//     ...
//   ]
// Uma célula identifica-se por { linha, coluna }, a contar do 0
// (linha 0 é a de cima, coluna 0 é a da esquerda).
// ============================================================

/**
 * Direções em que uma palavra pode ser escrita.
 * Cada direção diz quanto se anda em linhas e em colunas para ir
 * de uma letra para a seguinte. Todas se leem da esquerda para a direita
 * ou de cima para baixo, que é como as crianças estão a aprender a ler.
 */
export const DIRECOES = {
  horizontal: { linhas: 0, colunas: 1 }, // →
  vertical: { linhas: 1, colunas: 0 }, // ↓
  diagonalDesce: { linhas: 1, colunas: 1 }, // ↘
  diagonalSobe: { linhas: -1, colunas: 1 }, // ↗
}

// Letras usadas para encher os espaços vazios (sem K, W e Y, raras em português)
const LETRAS_ENCHIMENTO = 'ABCDEFGHIJLMNOPQRSTUVXZ'

// Quantas posições ao calhas se experimentam para cada palavra,
// e quantas vezes se recomeça a grelha toda se uma palavra não couber
const TENTATIVAS_POR_PALAVRA = 200
const TENTATIVAS_GRELHA = 50

/**
 * Lista das células ocupadas por uma palavra, a partir de uma célula
 * inicial e numa direção. Ex.: 'SOL' na horizontal a partir de {0,1}
 * ocupa {0,1}, {0,2}, {0,3}.
 */
export function celulasDaPalavra(palavra, inicio, direcao) {
  const celulas = []
  for (let i = 0; i < palavra.length; i++) {
    celulas.push({
      linha: inicio.linha + direcao.linhas * i,
      coluna: inicio.coluna + direcao.colunas * i,
    })
  }
  return celulas
}

/**
 * Verifica se a palavra cabe nessas células: todas dentro da grelha e
 * cada uma vazia (null) ou já com a mesma letra (cruzamento permitido).
 */
function cabe(letras, palavra, celulas) {
  const tamanho = letras.length
  return celulas.every(({ linha, coluna }, i) => {
    const dentro = linha >= 0 && linha < tamanho && coluna >= 0 && coluna < tamanho
    if (!dentro) return false
    const atual = letras[linha][coluna]
    return atual === null || atual === palavra[i]
  })
}

/** Número inteiro ao calhas entre 0 e maximo - 1. */
function inteiroAoCalhas(maximo, aleatorio) {
  return Math.floor(aleatorio() * maximo)
}

/**
 * Tenta colocar todas as palavras numa grelha vazia.
 * Devolve a grelha (com null nos espaços vazios) e onde ficou cada palavra,
 * ou null se alguma palavra não coube.
 */
function tentarColocar(palavras, tamanho, direcoes, aleatorio) {
  // Grelha vazia: `tamanho` linhas, cada uma com `tamanho` células a null
  const letras = Array.from({ length: tamanho }, () => Array(tamanho).fill(null))
  const colocadas = []

  // As palavras mais compridas primeiro: são as mais difíceis de encaixar
  const porTamanho = [...palavras].sort((a, b) => b.length - a.length)

  for (const palavra of porTamanho) {
    let colocou = false

    for (let t = 0; t < TENTATIVAS_POR_PALAVRA && !colocou; t++) {
      const nomeDirecao = direcoes[inteiroAoCalhas(direcoes.length, aleatorio)]
      const direcao = DIRECOES[nomeDirecao]
      const inicio = {
        linha: inteiroAoCalhas(tamanho, aleatorio),
        coluna: inteiroAoCalhas(tamanho, aleatorio),
      }
      const celulas = celulasDaPalavra(palavra, inicio, direcao)

      if (cabe(letras, palavra, celulas)) {
        // Escreve a palavra na grelha, letra a letra
        celulas.forEach(({ linha, coluna }, i) => {
          letras[linha][coluna] = palavra[i]
        })
        colocadas.push({ palavra, direcao: nomeDirecao, celulas })
        colocou = true
      }
    }

    if (!colocou) return null // esta palavra não coube: desiste desta tentativa
  }

  return { letras, colocadas }
}

/**
 * Gera uma grelha completa.
 *
 * Opções:
 * - tamanho: número de linhas e colunas (ex.: 6 para 6x6)
 * - palavras: lista de palavras em maiúsculas, sem acentos (ex.: ['GATO'])
 * - direcoes: nomes das direções permitidas (ex.: ['horizontal'])
 * - aleatorio: função de números ao calhas (por defeito Math.random)
 *
 * Devolve:
 *   {
 *     letras: [['G','A','T','O',...], ...],   // grelha cheia
 *     colocadas: [{ palavra: 'GATO', direcao: 'horizontal', celulas: [...] }]
 *   }
 */
export function gerarGrelha({ tamanho, palavras, direcoes = ['horizontal'], aleatorio = Math.random }) {
  // Proteção: uma palavra maior que a grelha nunca caberia
  const grande = palavras.find((p) => p.length > tamanho)
  if (grande) {
    throw new Error(`A palavra ${grande} tem mais letras do que a grelha (${tamanho})`)
  }

  // Às vezes as palavras encaixam mal e é preciso recomeçar do zero
  for (let t = 0; t < TENTATIVAS_GRELHA; t++) {
    const resultado = tentarColocar(palavras, tamanho, direcoes, aleatorio)

    if (resultado) {
      // Enche os espaços vazios com letras ao calhas
      const letras = resultado.letras.map((linha) =>
        linha.map(
          (letra) =>
            letra ?? LETRAS_ENCHIMENTO[inteiroAoCalhas(LETRAS_ENCHIMENTO.length, aleatorio)],
        ),
      )
      return { letras, colocadas: resultado.colocadas }
    }
  }

  throw new Error('Não foi possível colocar todas as palavras na grelha')
}
