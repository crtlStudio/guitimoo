// ============================================================
// Efeitos sonoros partilhados por todos os jogos, com o Howler:
//   certo   → cada resposta certa
//   erro    → cada resposta errada
//   estrela → cada vez que se ganham estrelas
//   festa   → quando se acaba um jogo (jogo ganho)
//   toque   → cada toque num botão (automático, ver ativarSomDeToque)
//   tictac  → o ponteiro do relógio da Tartaruga a avançar
//   sapinho → (Sapo) um sapinho posto num prato
//   cair    → (Sapo) um sapinho largado fora dos pratos
//
// Os ficheiros estão em src/assets/sons/. Para trocar um som, basta
// substituir o ficheiro mantendo o nome.
// Estes sons fazem parte do jogo: tocam mesmo com a música desligada
// (o botão de som só silencia a música).
// ============================================================
import { Howl } from 'howler'
import somCerto from '../assets/sons/certo.mp3'
import somErro from '../assets/sons/erro.mp3'
import somEstrela from '../assets/sons/estrela.mp3'
import somFesta from '../assets/sons/festa.mp3'
import somToque from '../assets/sons/toque.mp3'
import somTicTac from '../assets/sons/tictac.mp3'
import somSapinho from '../assets/sons/sapinho.mp3'
import somCair from '../assets/sons/cair.mp3'
import { volumeDe } from './volume'

// Volume "normal" de cada som (0 = mudo, 1 = máximo). O volume real é este
// × o volume dos efeitos escolhido nas Definições (ver volumeComDefinicoes)
const EFEITOS = {
  certo: { src: somCerto, volume: 0.8 },
  erro: { src: somErro, volume: 0.6 },
  estrela: { src: somEstrela, volume: 0.7 },
  festa: { src: somFesta, volume: 0.9 },
  toque: { src: somToque, volume: 0.4 },
  tictac: { src: somTicTac, volume: 0.35 },
  sapinho: { src: somSapinho, volume: 0.8 }, // Sapo: um sapinho posto num prato
  cair: { src: somCair, volume: 0.7 }, // Sapo: um sapinho largado fora dos pratos
}

/**
 * Volume real de um som de jogo: o seu volume normal × o volume dos efeitos
 * das Definições. Também usado pelos sons da Coruja (games/coruja/tocador.js).
 */
export function volumeComDefinicoes(volume) {
  return volume * volumeDe('efeitos')
}

// Cada som só é carregado na primeira vez que é preciso
const carregados = {}

function obter(nome) {
  if (!carregados[nome]) {
    const { src, volume } = EFEITOS[nome]
    carregados[nome] = new Howl({ src: [src], volume: volumeComDefinicoes(volume) })
  }
  return carregados[nome]
}

/** Carrega todos os efeitos de antemão, para não haver atraso no primeiro. */
export function prepararEfeitos() {
  Object.keys(EFEITOS).forEach(obter)
}

/** Toca um efeito ('certo', 'erro', 'estrela', 'festa', 'toque', 'tictac'). */
export function tocarEfeito(nome) {
  const som = obter(nome)
  if (som.state() === 'loaded') som.stop() // se ainda estiver a tocar, recomeça
  som.off('fade') // se estava a ser calado (calarEfeitos), já não interessa
  som.volume(volumeComDefinicoes(EFEITOS[nome].volume))
  som.play()
}

/**
 * Cala depressa (com um fade curto) os efeitos que estejam a tocar.
 * A Coruja usa-o antes de cada som do jogo: a criança tem de o ouvir bem,
 * sem a "estrela" ou a "festa" por cima.
 */
export function calarEfeitos(fade = 200) {
  Object.entries(carregados).forEach(([nome, som]) => {
    if (!som.playing()) return
    som.fade(som.volume(), 0, fade)
    som.once('fade', () => {
      som.stop()
      som.volume(volumeComDefinicoes(EFEITOS[nome].volume)) // repõe o volume para a próxima vez
    })
  })
}

let somDeToqueAtivo = false

/**
 * Liga o som de "toque" em todos os botões da app (chamar uma vez, no início).
 * Escuta os toques no documento inteiro: quando o dedo toca num botão ou
 * link, ouve-se o "toque". Um elemento com o atributo `data-sem-toque`
 * (ex.: os cartões da Coruja, que já tocam o seu próprio som) fica de fora;
 * `data-toque` acrescenta o som a elementos que não são botões (ex.: a grelha).
 */
export function ativarSomDeToque() {
  if (somDeToqueAtivo) return
  somDeToqueAtivo = true
  document.addEventListener(
    'pointerdown',
    (evento) => {
      if (!evento.isPrimary) return // só o primeiro dedo
      const alvo = evento.target instanceof Element ? evento.target : null
      if (!alvo || alvo.closest('[data-sem-toque]')) return
      if (alvo.closest('button:not(:disabled), a, [role="button"], [data-toque]')) tocarEfeito('toque')
    },
    { passive: true },
  )
}
