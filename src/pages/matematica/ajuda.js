// ============================================================
// Onde estão as coisas da balança no ecrã, para o dedo fantasma
// (ver components/DedoFantasma.jsx) saber de onde pegar e para onde levar.
// ============================================================

/** Um cubinho no chão, de qualquer cor ou da cor pedida (ou null se não houver). */
export const umCubinhoNoChao = (cor) =>
  document.querySelector(cor ? `[data-lugar="chao"][aria-label="Cubinho ${cor}"]` : '[data-lugar="chao"]')

/** Um número do cartão da conta, pela sua cor ('azul' = o 1.º número, 'verde' = o 2.º). */
export const parteDaConta = (cor) => document.querySelector(`[data-parte="${cor}"]`)

/** Um cubinho no prato esquerdo (ou null se o prato estiver vazio). */
export const umCubinhoNoPrato = () => document.querySelector('[data-lugar="prato"]')

/**
 * Em cima do prato esquerdo. A zona onde se pode largar é bem maior do que o
 * prato (sobretudo para cima), por isso o dedo aponta para a parte de baixo
 * dela, onde está o prato, e não para o meio.
 */
export function pratoEsquerdo() {
  const zona = document.querySelector('[aria-label="Prato da esquerda"]')
  if (!zona) return null
  return {
    getBoundingClientRect() {
      const r = zona.getBoundingClientRect()
      const y = r.bottom - r.height * 0.24
      return { left: r.left, width: r.width, top: y, height: 0, bottom: y, right: r.right }
    },
  }
}

/** Um sítio na relva, à frente e à esquerda (para onde vai um cubinho tirado do prato). */
export const chao = () => ({ x: 0.3, y: 0.9 })

/** O botão ✓ ("já está!"). */
export const botaoJaEsta = () => document.querySelector('[aria-label="Já está!"]')

/** A fila de números para escolher. */
export const filaDeNumeros = () => document.querySelector('[data-opcoes]')

/**
 * Um ponto entre os dois elementos do meio de uma fila (ex.: os cubinhos ou
 * os cartões para escolher), para o dedo fantasma partir dali SEM apontar
 * para nenhum (seria uma dica). Ou a própria fila, se tiver menos de 2.
 */
export function entreOsDoMeio(seletor) {
  const fila = document.querySelector(seletor)
  const filhos = fila ? [...fila.children] : []
  if (filhos.length < 2) return fila
  const meio = Math.floor(filhos.length / 2)
  const a = filhos[meio - 1].getBoundingClientRect()
  const b = filhos[meio].getBoundingClientRect()
  const x = (a.right + b.left) / 2
  const y = (a.top + a.bottom) / 2
  return { getBoundingClientRect: () => ({ left: x, right: x, top: y, bottom: y, width: 0, height: 0 }) }
}
