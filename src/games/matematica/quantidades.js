// ============================================================
// Jogo das Quantidades (dentro da Matemática): um quadro com duas linhas.
//   1.ª linha: 🟦🟦🟦🟦🟦 → ☐   a criança põe o cartão do número (5)
//   2.ª linha:     3      → ☐   a criança põe tantos cubinhos como o número
//
// Só funções puras (sem ecrã), fáceis de testar. `aleatorio` dá números
// entre 0 e 1 (por omissão Math.random); nos testes passa-se uma fixa.
// ============================================================
import { baralhar } from '../portugues/baralho'
import { opcoesDeResposta } from './contas'
import { CORES } from './logica'

/**
 * As regras de cada faixa etária:
 * - minimo, maximo: os números que podem sair
 * - opcoes: quantos cartões de números há para escolher (1.ª linha)
 * - confereSozinho: na 2.ª linha, a festa é logo que fica o número certo
 *   de cubinhos (3–4, como na balança); senão, confirma-se com o ✓
 */
export const NIVEIS = {
  '3-4': { minimo: 1, maximo: 5, opcoes: 3, confereSozinho: true },
  '5-6': { minimo: 3, maximo: 10, opcoes: 3, confereSozinho: false },
  '7-8': { minimo: 6, maximo: 20, opcoes: 4, confereSozinho: false },
}

/** Quantos cubinhos por fila, nos desenhos (em grupos de 5: fácil de contar). */
export const POR_FILA = 5

/** Um inteiro ao calhas entre minimo e maximo (inclusive). */
const entre = (minimo, maximo, aleatorio) => minimo + Math.floor(aleatorio() * (maximo - minimo + 1))

/**
 * Cria uma pergunta (um quadro):
 *   { cubos: 5, cor: 'azul', opcoes: [4, 5, 6],  numero: 3, corDoNumero: 'verde' }
 * - cubos: quantos cubinhos há na 1.ª linha (a resposta é este número)
 * - opcoes: os cartões de números para escolher (com o certo, baralhados)
 * - numero: o número da 2.ª linha (diferente do da 1.ª)
 */
export function criarPergunta(escalao, aleatorio = Math.random) {
  const { minimo, maximo, opcoes: quantas } = NIVEIS[escalao] ?? NIVEIS['3-4']
  const cubos = entre(minimo, maximo, aleatorio)
  let numero = entre(minimo, maximo, aleatorio)
  if (numero === cubos) numero = numero === maximo ? minimo : numero + 1

  // Os cartões: números perto do certo, sem passar do máximo do nível
  let opcoes = opcoesDeResposta(cubos, quantas, aleatorio)
  if (opcoes.some((n) => n > maximo)) {
    const abaixo = Array.from({ length: quantas * 2 }, (_, i) => cubos - 1 - i).filter((n) => n >= 1 && n <= maximo)
    opcoes = [cubos, ...opcoes.filter((n) => n !== cubos && n <= maximo), ...abaixo]
      .filter((n, i, lista) => lista.indexOf(n) === i)
      .slice(0, quantas)
    opcoes = baralhar(opcoes, aleatorio)
  }

  const cores = CORES.slice(0, 3)
  const cor = cores[Math.floor(aleatorio() * cores.length)]
  const corDoNumero = cores.filter((c) => c !== cor)[Math.floor(aleatorio() * 2)]
  return { cubos, cor, opcoes, numero, corDoNumero }
}

/** As filas de um desenho de `n` cubinhos, em grupos de POR_FILA: 7 → [5, 2]. */
export function filasDeCubos(n) {
  const filas = []
  for (let resto = n; resto > 0; resto -= POR_FILA) filas.push(Math.min(POR_FILA, resto))
  return filas
}
