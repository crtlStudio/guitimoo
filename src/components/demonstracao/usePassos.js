import { useEffect, useRef, useState } from 'react'
import { estadoNoPasso } from './passos'

/**
 * Faz avançar os passos de uma demonstração, um a um, enquanto `aCorrer`.
 * No fim chama aoAcabar(). Devolve o estado do passo atual.
 * (Para recomeçar do início, quem a usa muda o `key` da demonstração.)
 */
export function usePassos(passos, aCorrer, aoAcabar) {
  const [i, setI] = useState(0)
  const acabar = useRef(aoAcabar)
  useEffect(() => {
    acabar.current = aoAcabar
  })

  useEffect(() => {
    if (!aCorrer) return undefined
    const ultimo = i >= passos.length - 1
    const temporizador = setTimeout(() => (ultimo ? acabar.current?.() : setI(i + 1)), passos[i].ms)
    return () => clearTimeout(temporizador)
  }, [aCorrer, i, passos])

  return { ...estadoNoPasso(passos, i), vez: i }
}
