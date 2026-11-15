import { useEffect, useSyncExternalStore } from 'react'
import { Howl } from 'howler'
import musicaInicio from '../assets/musica-inicio.m4a'
import { inscreverVolume, volumeDe } from './volume'

// Música de fundo partilhada: vive fora das páginas para continuar entre rotas.
const VOLUME_FUNDO = 0.6
const FADE_MS = 800

let musicaFundo = null
let fundoAtivo = false // o jogo já começou (carregaram em Jogar)
let paginasComMusica = 0 // páginas abertas que têm música própria
let retomarTimer = null

// ---- Mute da música (só música: os sons dos jogos não são afetados) ----
const CHAVE_MUDO = 'guitimoo:musicaMuda'
// Música de fundo + música da página aberta, cada uma com o seu volume "normal"
// (o volume real é esse × o volume da música nas Definições)
const musicasAtivas = new Map()
const ouvintes = new Set()

let mudo = false
try {
  mudo = localStorage.getItem(CHAVE_MUDO) === '1'
} catch {
  // sem acesso ao armazenamento: começa com som
}

/** Liga/desliga o som da música e guarda a escolha. */
export function alternarMudo() {
  mudo = !mudo
  musicasAtivas.forEach((_, musica) => musica.mute(mudo))
  try {
    localStorage.setItem(CHAVE_MUDO, mudo ? '1' : '0')
  } catch {
    // ignora: a escolha vale só nesta sessão
  }
  ouvintes.forEach((avisar) => avisar())
}

/** O volume real de uma música: o normal × o escolhido nas Definições. */
const comDefinicoes = (volume) => volume * volumeDe('musica')

// Quando o volume da música muda nas Definições, as músicas a tocar mudam logo
inscreverVolume((tipo) => {
  if (tipo !== 'musica') return
  musicasAtivas.forEach((volume, musica) => {
    musica.volume(comDefinicoes(volume))
  })
})

/** Estado do mute para componentes React (atualiza quando muda). */
export function useMudo() {
  return useSyncExternalStore(
    (avisar) => {
      ouvintes.add(avisar)
      return () => ouvintes.delete(avisar)
    },
    () => mudo,
  )
}

/** Começa a música de fundo em loop (chamar num clique, p.ex. no botão Jogar). */
export function iniciarMusicaFundo() {
  fundoAtivo = true
  if (paginasComMusica > 0) return
  if (!musicaFundo) {
    musicaFundo = new Howl({
      src: [musicaInicio],
      loop: true,
      volume: comDefinicoes(VOLUME_FUNDO),
      html5: true, // faixa longa: faz streaming em vez de descodificar tudo em memória
      mute: mudo,
    })
    musicasAtivas.set(musicaFundo, VOLUME_FUNDO)
  }
  musicaFundo.off('fade') // cancela uma paragem que esteja a meio
  musicaFundo.volume(comDefinicoes(VOLUME_FUNDO))
  if (!musicaFundo.playing()) musicaFundo.play()
}

/** Pára a música de fundo com um fade curto (volta ao início na próxima vez). */
function pararMusicaFundo() {
  if (!musicaFundo || !musicaFundo.playing()) return
  const musica = musicaFundo
  musica.off('fade')
  musica.fade(musica.volume(), 0, FADE_MS)
  musica.once('fade', () => musica.stop())
}

/**
 * Para usar nas páginas com som próprio: pára a música de fundo,
 * toca a música da página em loop e, ao sair, a música de fundo recomeça.
 *   useMusicaPagina(musicaSapo)   -> pára o fundo e toca a música do sapo
 *   useMusicaPagina(null)         -> só pára o fundo (página com sons próprios)
 */
export function useMusicaPagina(src, volume = VOLUME_FUNDO) {
  useEffect(() => {
    paginasComMusica++
    clearTimeout(retomarTimer)
    pararMusicaFundo()

    const musica = src
      ? new Howl({ src: [src], loop: true, volume: comDefinicoes(volume), html5: true, mute: mudo })
      : null
    if (musica) {
      musicasAtivas.set(musica, volume)
      musica.play()
    }

    return () => {
      if (musica) {
        musicasAtivas.delete(musica)
        musica.unload()
      }
      paginasComMusica--
      // Espera um instante: se a página seguinte também tiver música, não recomeça
      clearTimeout(retomarTimer)
      retomarTimer = setTimeout(() => {
        if (fundoAtivo && paginasComMusica === 0) iniciarMusicaFundo()
      }, 0)
    }
  }, [src, volume])
}
