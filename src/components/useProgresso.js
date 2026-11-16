import { useSyncExternalStore } from 'react'
import { inscrever, progressoAtual } from '../games/progresso/estado'
import { MASCOTES } from '../games/progresso/config'
import { escalaoDoNivel, perfilAtivo } from '../games/progresso/progresso'
import { comMaiuscula } from '../games/progresso/textos'

/**
 * O progresso inteiro (para as funções do progresso.js), ou null enquanto
 * ainda está a ler do telemóvel. Volta a desenhar-se quando muda.
 */
export function useProgresso() {
  return useSyncExternalStore(inscrever, progressoAtual)
}

/**
 * O perfil de quem está a jogar ({ nivel, mascoteAtiva, estrelas, mascotes }),
 * ou null enquanto ainda está a ler do telemóvel. O componente volta a
 * desenhar-se sozinho sempre que o progresso muda.
 */
export function usePerfil() {
  const progresso = useSyncExternalStore(inscrever, progressoAtual)
  return progresso ? perfilAtivo(progresso) : null
}

/**
 * A mascote que a criança escolheu, do config.js ({ id, nome, emoji, ... }),
 * ou null. É ela que aparece nos balões e no fim de cada jogo.
 */
export function useMascoteAtiva() {
  const id = usePerfil()?.mascoteAtiva
  return MASCOTES.find((m) => m.id === id) ?? null
}

/**
 * O nome da mascote escolhida com o artigo, para pôr numa frase:
 *   useChamada()        → 'o Panda'  (a meio da frase)
 *   useChamada(true)    → 'O Panda'  (no início da frase)
 */
export function useChamada(noInicio = false) {
  const chamada = useMascoteAtiva()?.chamada ?? 'a mascote'
  return noInicio ? comMaiuscula(chamada) : chamada
}

/**
 * A faixa etária que os jogos usam por dentro ('3-4', '5-6', '7-8'),
 * a partir do nível escolhido. Só se usa dentro de <Guarda nivel>, onde
 * o nível já está escolhido.
 */
export function useEscalao() {
  return escalaoDoNivel(usePerfil()?.nivel)
}
