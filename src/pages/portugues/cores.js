// Cores das palavras encontradas, pela ordem em que são encontradas.
// Partilhadas pela Grelha e pela lista de palavras (7–8 anos), para a
// mesma palavra ter a mesma cor nos dois sítios.
export const CORES_ENCONTRADAS = ['#7ed957', '#5ec8f2', '#ffb347', '#c39bf0', '#ff8fab']

export const corDaPalavra = (indice) => CORES_ENCONTRADAS[indice % CORES_ENCONTRADAS.length]
