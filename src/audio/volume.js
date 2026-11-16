// ============================================================
// Volumes da app (Definições). Há dois, cada um com o seu seletor:
//   musica  → a música de fundo e a música de cada página
//   efeitos → os sons dos jogos: certo, erro, estrela, festa, toque,
//             tic-tac e os sons do jogo de Memória
//
// Cada valor vai de 0.1 (10%) a 1 (100% = volume normal). O mínimo é 10%
// para nunca ficar sem som por engano (o jogo de Memória precisa de som;
// para calar a música já existe o botão de som).
// Os valores ficam guardados no telemóvel (Preferences). musica.js e
// efeitos.js multiplicam o volume de cada som por estes valores.
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { useSyncExternalStore } from 'react'

export const VOLUME_MINIMO = 0.1
export const VOLUME_MAXIMO = 1
export const TIPOS = ['musica', 'efeitos']

const volumes = { musica: VOLUME_MAXIMO, efeitos: VOLUME_MAXIMO }
const ouvintes = new Set()

const chave = (tipo) => `definicoes:volume:${tipo}`

/** Garante que o volume fica entre o mínimo e o máximo (e com 2 casas decimais). */
function limitar(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return VOLUME_MAXIMO
  return Math.round(Math.min(VOLUME_MAXIMO, Math.max(VOLUME_MINIMO, numero)) * 100) / 100
}

function aplicar(tipo, valor) {
  volumes[tipo] = valor
  ouvintes.forEach((avisar) => avisar(tipo))
}

/** Lê os volumes guardados e aplica-os (chamar uma vez, ao abrir a app). */
export async function carregarVolumes() {
  await Promise.all(
    TIPOS.map(async (tipo) => {
      try {
        const { value } = await Preferences.get({ key: chave(tipo) })
        if (value !== null && value !== undefined) aplicar(tipo, limitar(value))
      } catch {
        // sem acesso ao armazenamento: fica o volume normal
      }
    }),
  )
  return { ...volumes }
}

/** Muda um volume ('musica' ou 'efeitos'), aplica-o já e guarda-o. */
export function mudarVolume(tipo, valor) {
  aplicar(tipo, limitar(valor))
  Preferences.set({ key: chave(tipo), value: String(volumes[tipo]) }).catch(() => {})
}

/** O volume atual de 'musica' ou 'efeitos' (0.1 a 1). */
export function volumeDe(tipo) {
  return volumes[tipo]
}

/** Avisa `funcao(tipo)` sempre que um volume muda. Devolve a função para deixar de avisar. */
export function inscreverVolume(funcao) {
  ouvintes.add(funcao)
  return () => ouvintes.delete(funcao)
}

/** Para os componentes React: o volume de um tipo, que se atualiza quando muda. */
export function useVolume(tipo) {
  return useSyncExternalStore(inscreverVolume, () => volumes[tipo])
}
