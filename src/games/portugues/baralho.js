// ============================================================
// Saco baralhado: tira palavras ao acaso sem repetir até saírem todas.
//
// O "saco" é só uma lista de palavras (texto) que ainda não saíram,
// por exemplo ['GATO', 'SOL', 'PATO']. Como é texto simples, mais tarde
// pode ser guardado no telemóvel (passo 6).
//
// Nenhuma função aqui altera as listas que recebe: devolvem sempre
// listas novas. Isso torna o código mais previsível e fácil de testar.
// ============================================================

/**
 * Devolve uma cópia da lista com os elementos por ordem aleatória.
 * Usa o algoritmo Fisher–Yates: percorre a lista de trás para a frente
 * e troca cada elemento com outro escolhido ao acaso entre os anteriores.
 *
 * `aleatorio` é a função que dá números ao acaso (por defeito Math.random).
 * Nos testes podemos trocá-la por outra que dá sempre os mesmos números.
 */
export function baralhar(lista, aleatorio = Math.random) {
  const copia = [...lista] // [...lista] cria uma lista nova com os mesmos elementos

  for (let i = copia.length - 1; i > 0; i--) {
    // Escolhe uma posição j entre 0 e i (inclusive)
    const j = Math.floor(aleatorio() * (i + 1))
    // Troca os elementos nas posições i e j
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }

  return copia
}

/**
 * Tira uma palavra do saco.
 *
 * - `saco`: palavras que ainda não saíram (pode estar vazio).
 * - `todas`: todas as palavras possíveis, para voltar a encher o saco.
 * - `ultima`: a palavra que saiu da última vez (opcional), para não
 *   repetir logo a seguir quando o saco é enchido de novo.
 *
 * Devolve um objeto com a palavra tirada e o saco que sobra:
 *   { palavra: 'GATO', saco: ['SOL', 'PATO'] }
 */
export function tirarDoSaco(saco, todas, ultima = null, aleatorio = Math.random) {
  let sacoAtual = saco

  // Saco vazio: enche com todas as palavras, baralhadas
  if (sacoAtual.length === 0) {
    sacoAtual = baralhar(todas, aleatorio)

    // Se a primeira for igual à última que saiu, troca-a com a segunda
    if (sacoAtual.length > 1 && sacoAtual[0] === ultima) {
      sacoAtual = [sacoAtual[1], sacoAtual[0], ...sacoAtual.slice(2)]
    }
  }

  // A primeira palavra sai; o resto (slice(1)) fica no saco
  return {
    palavra: sacoAtual[0],
    saco: sacoAtual.slice(1),
  }
}

/**
 * Tira várias palavras diferentes de uma vez (para o escalão 7–8, que usa 3).
 * Se o saco esvaziar a meio, é enchido de novo sem as palavras já escolhidas
 * nesta jogada, para nunca aparecerem duas iguais na mesma grelha.
 *
 * Devolve { palavras: ['GATO', 'SOL', 'PATO'], saco: [...] }
 */
export function tirarVariasDoSaco(saco, todas, quantidade, aleatorio = Math.random) {
  const escolhidas = []
  let sacoAtual = saco

  while (escolhidas.length < quantidade) {
    // Se o saco esvaziar, enche só com as que ainda não foram escolhidas agora
    if (sacoAtual.length === 0) {
      const disponiveis = todas.filter((p) => !escolhidas.includes(p))
      sacoAtual = baralhar(disponiveis, aleatorio)
    }

    escolhidas.push(sacoAtual[0])
    sacoAtual = sacoAtual.slice(1)
  }

  return { palavras: escolhidas, saco: sacoAtual }
}
