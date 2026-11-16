// ============================================================
// Os jogos dentro da Matemática entram ao calhas, um em cada pergunta:
// ora uma conta na balança, ora lógica, ora quantidades.
// ============================================================

/** Os jogos que podem sair, por esta ordem (o primeiro é o da balança). */
export const TIPOS = ['balanca', 'logica', 'quantidades']

/** Nunca sai o mesmo jogo mais do que estas vezes seguidas. */
export const MAXIMO_SEGUIDAS = 2

/**
 * Sorteia o jogo da pergunta seguinte. `anteriores` são os que já saíram,
 * do mais antigo para o mais recente (ex.: ['balanca', 'logica', 'logica']).
 * Ao calhas, mas sem repetir o mesmo mais de MAXIMO_SEGUIDAS vezes seguidas.
 */
export function sortearTipo(anteriores = [], aleatorio = Math.random, tipos = TIPOS) {
  const ultimos = anteriores.slice(-MAXIMO_SEGUIDAS)
  const cheio = ultimos.length === MAXIMO_SEGUIDAS && ultimos.every((t) => t === ultimos[0])
  const possiveis = cheio && tipos.length > 1 ? tipos.filter((t) => t !== ultimos[0]) : tipos
  return possiveis[Math.floor(aleatorio() * possiveis.length)]
}
