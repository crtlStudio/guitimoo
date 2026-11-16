// ============================================================
// Sorteios do jogo de Memória: que som toca, que imagens aparecem,
// qual é a sequência. Nada aqui é escrito à mão: tudo sai de sons.json.
//
// Trabalhamos sempre com os `id` dos sons (ex.: 'cao', 'chuva'), que são
// texto simples e podem ser guardados no telemóvel (passo 6).
//
// O "saco" é o mesmo do jogo de Português: a lista de ids que ainda não saíram.
// Quando esvazia, volta a encher baralhado. Assim, todos os sons vão
// aparecendo antes de algum se repetir.
//
// Todas as funções recebem `aleatorio` (por defeito Math.random), para os
// testes poderem usar números previsíveis.
// ============================================================
import { sons } from '../../data/sons.json'
import { baralhar, tirarDoSaco } from '../portugues/baralho'

/** Todos os ids, pela ordem do ficheiro. */
export const TODOS_OS_IDS = sons.map((s) => s.id)

/** id → som completo (nome, emoji, categoria...) */
const SOM_POR_ID = Object.fromEntries(sons.map((s) => [s.id, s]))

/** Devolve a informação completa de um som a partir do id. */
export function somDoId(id) {
  return SOM_POR_ID[id]
}

/** Ids dos sons do mesmo grupo de "parecidos" (sem o próprio). */
export function parecidosCom(id) {
  const grupo = SOM_POR_ID[id].parecidos
  return TODOS_OS_IDS.filter((outro) => outro !== id && SOM_POR_ID[outro].parecidos === grupo)
}

/**
 * Tira do saco o primeiro id que ainda não esteja em `evitar`.
 * Os que forem saltados voltam para o fim do saco (para saírem mais tarde).
 * Devolve { id, saco }.
 */
function tirarNovo(saco, evitar, aleatorio) {
  let sacoAtual = saco
  const saltados = []
  // Nunca dá mais voltas do que o dobro do número de sons (evita ficar preso)
  for (let volta = 0; volta < TODOS_OS_IDS.length * 2; volta++) {
    const { palavra: id, saco: resto } = tirarDoSaco(sacoAtual, TODOS_OS_IDS, null, aleatorio)
    sacoAtual = resto
    if (!evitar.includes(id)) return { id, saco: [...sacoAtual, ...saltados] }
    saltados.push(id)
  }
  throw new Error('Não há sons suficientes')
}

// ---------------- 3–4 anos: ouvir e escolher entre 3 ----------------

/**
 * Sorteia uma pergunta dos 3–4: o som certo e 3 opções baralhadas.
 * - fácil: as 2 erradas são de OUTRAS categorias (cão vs. chuva vs. buzina)
 * - difícil: as 2 erradas são da MESMA categoria (cão vs. gato vs. vaca)
 *
 * Devolve { certo: 'cao', opcoes: ['buzina', 'cao', 'chuva'], saco }
 */
export function sortearPergunta34(saco, dificil = false, aleatorio = Math.random) {
  const { palavra: certo, saco: resto } = tirarDoSaco(saco, TODOS_OS_IDS, null, aleatorio)
  const categoria = SOM_POR_ID[certo].categoria

  const candidatas = TODOS_OS_IDS.filter((id) => {
    if (id === certo) return false
    const mesma = SOM_POR_ID[id].categoria === categoria
    return dificil ? mesma : !mesma
  })

  let erradas
  if (dificil) {
    erradas = baralhar(candidatas, aleatorio).slice(0, 2)
  } else {
    // Fácil: de preferência uma de cada uma das outras duas categorias
    const baralhadas = baralhar(candidatas, aleatorio)
    const primeira = baralhadas[0]
    const segunda =
      baralhadas.find((id) => SOM_POR_ID[id].categoria !== SOM_POR_ID[primeira].categoria) ??
      baralhadas[1]
    erradas = [primeira, segunda]
  }

  return { certo, opcoes: baralhar([certo, ...erradas], aleatorio), saco: resto }
}

// ---------------- 5–6 anos: imagens variadas ----------------

/** Quantas imagens mostrar nos 5–6: pelo menos 2 a mais do que a sequência, entre 4 e 6. */
export function quantasImagens56(comprimento) {
  return Math.min(6, Math.max(4, comprimento + 2))
}

/**
 * Sorteia `quantidade` imagens diferentes, com o saco baralhado.
 * Devolve { imagens: ['cao', 'mar', ...], saco }
 */
export function sortearImagens(saco, quantidade, aleatorio = Math.random) {
  const imagens = []
  let sacoAtual = saco
  while (imagens.length < quantidade) {
    const tirado = tirarNovo(sacoAtual, imagens, aleatorio)
    imagens.push(tirado.id)
    sacoAtual = tirado.saco
  }
  return { imagens, saco: sacoAtual }
}

// ---------------- 7–8 anos: imagens com sons parecidos ----------------

/**
 * Sorteia imagens em que os sons vêm aos pares/trios parecidos
 * (ex.: chuva + rio + mar, galo + pato). Cada id tirado do saco traz
 * consigo os seus parecidos, enquanto houver espaço.
 * Devolve { imagens, saco }
 */
export function sortearImagensParecidas(saco, quantidade, aleatorio = Math.random) {
  const imagens = []
  let sacoAtual = saco
  while (imagens.length < quantidade) {
    const tirado = tirarNovo(sacoAtual, imagens, aleatorio)
    sacoAtual = tirado.saco
    imagens.push(tirado.id)

    // Junta parecidos deste som (ao acaso), sem passar da quantidade
    const parecidos = baralhar(parecidosCom(tirado.id), aleatorio).filter((id) => !imagens.includes(id))
    for (const id of parecidos) {
      if (imagens.length >= quantidade) break
      imagens.push(id)
      sacoAtual = sacoAtual.filter((s) => s !== id) // já saiu: tira-o do saco
    }
  }
  // Baralha para os parecidos não ficarem sempre lado a lado
  return { imagens: baralhar(imagens, aleatorio), saco: sacoAtual }
}

// ---------------- Sequências ----------------

/**
 * Sorteia a sequência que o jogo vai tocar, só com sons das `imagens`.
 *
 * - comRepeticoes = false (5–6): cada som aparece no máximo uma vez
 * - comRepeticoes = true (7–8): um som pode voltar, mas nunca duas vezes seguidas
 *   (permite sequências de 8 com só 6 imagens)
 */
export function sortearSequencia(imagens, comprimento, comRepeticoes = false, aleatorio = Math.random) {
  if (!comRepeticoes) {
    if (comprimento > imagens.length) throw new Error('Sequência maior do que as imagens')
    return baralhar(imagens, aleatorio).slice(0, comprimento)
  }

  const sequencia = []
  while (sequencia.length < comprimento) {
    const possiveis = imagens.filter((id) => id !== sequencia.at(-1))
    sequencia.push(possiveis[Math.floor(aleatorio() * possiveis.length)])
  }
  return sequencia
}
