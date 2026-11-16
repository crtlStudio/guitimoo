// ============================================================
// Tocador dos sons do jogo de Memória, com o Howler.
//
// - tocarSom(id): toca um som e devolve uma "promessa" que só fica
//   cumprida quando o som ACABA (assim podemos esperar por ele com await).
// - tocarSequencia(ids): toca vários sons, um de cada vez, com uma pequena
//   pausa entre eles, e avisa qual está a tocar (para a imagem acender).
//   Pode ser interrompida a meio com parar() (ex.: a criança saiu da página).
//
// Os ficheiros estão em src/assets/sons/memoria/ com o nome indicado em
// src/data/sons.json. Para pôr os sons reais basta substituir os ficheiros.
// ============================================================
import { Howl } from 'howler'
import { sons } from '../../data/sons.json'
import { calarEfeitos, volumeComDefinicoes } from '../../audio/efeitos'

/** Volume normal dos sons do jogo de Memória (× o volume dos efeitos nas Definições). */
const VOLUME = 0.9

/** Pausa entre dois sons de uma sequência (milissegundos). */
export const PAUSA_ENTRE_SONS = 500

/**
 * Numa sequência, cada som toca no máximo este tempo (os sons longos, como a
 * chuva ou o mar, acabam com um fade suave). Assim uma sequência de 8 sons
 * não demora mais de meio minuto. Sozinho (3–4, ou ao tocar num cartão),
 * o som ouve-se inteiro.
 */
export const MAXIMO_NUMA_SEQUENCIA = 2500

/** Duração do fade quando um som é cortado (milissegundos). */
const DURACAO_DO_FADE = 300

/** Se um som nunca avisar que acabou (ficheiro estragado...), desistimos ao fim deste tempo. */
const TEMPO_MAXIMO_DE_UM_SOM = 8000

// O Vite junta aqui o endereço de todos os .mp3 da pasta, por nome de ficheiro:
// { '../../assets/sons/memoria/cao.mp3': '/assets/cao-abc123.mp3', ... }
const ENDERECOS = import.meta.glob('../../assets/sons/memoria/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** id do som → endereço do ficheiro (ex.: 'cao' → '/assets/cao-abc123.mp3') */
const ENDERECO_DO_SOM = Object.fromEntries(
  sons.map((som) => [som.id, ENDERECOS[`../../assets/sons/memoria/${som.ficheiro}`]]),
)

// Cada som só é carregado uma vez e fica guardado aqui para as próximas vezes
const carregados = new Map()

function obterSom(id) {
  if (!carregados.has(id)) {
    const endereco = ENDERECO_DO_SOM[id]
    if (!endereco) throw new Error(`Som desconhecido: ${id}`)
    carregados.set(id, new Howl({ src: [endereco], volume: VOLUME }))
  }
  return carregados.get(id)
}

/** Carrega de antemão os sons indicados, para não haver atraso ao tocar. */
export function prepararSons(ids) {
  ids.forEach(obterSom)
}

/**
 * Toca um som e espera que acabe.
 * A promessa fica cumprida quando o som acaba, quando é parado, ou se der erro
 * (nunca fica "presa": o jogo continua sempre).
 *
 * `maximo` (opcional, em ms): se o som for mais comprido, desvanece e pára
 * ao fim desse tempo (contado a partir do momento em que começa a soar).
 */
export function tocarSom(id, maximo = null) {
  const som = obterSom(id)
  // A "estrela" ou a "festa" da resposta anterior não podem tapar este som
  calarEfeitos()
  // O volume das Definições pode ter mudado desde a última vez
  som.volume(volumeComDefinicoes(VOLUME))
  return new Promise((cumprir) => {
    // Se este som ainda estava a tocar, recomeça do início. Só quando já está
    // carregado: antes disso o Howler põe o stop() em fila e, ao carregar,
    // pararia também o som que vamos tocar agora (e a promessa acabava logo).
    if (som.state() === 'loaded') som.stop()
    const numero = som.play() // o Howler dá um número a cada "toque"

    let terminado = false
    let corte = null
    function terminar() {
      if (terminado) return
      terminado = true
      clearTimeout(seguranca)
      clearTimeout(corte)
      som.off('play', comecou, numero)
      som.off('end', terminar, numero)
      som.off('stop', terminar, numero)
      som.off('playerror', terminar, numero)
      som.off('loaderror', terminar)
      cumprir()
    }

    // Quando começar mesmo a soar, marca o corte (se houver máximo)
    function comecou() {
      if (!maximo || corte || terminado) return
      corte = setTimeout(() => {
        som.fade(som.volume(), 0, DURACAO_DO_FADE, numero)
        corte = setTimeout(() => som.stop(numero), DURACAO_DO_FADE)
      }, maximo - DURACAO_DO_FADE)
    }

    som.once('play', comecou, numero)
    som.once('end', terminar, numero)
    som.once('stop', terminar, numero)
    som.once('playerror', terminar, numero)
    som.once('loaderror', terminar)
    const seguranca = setTimeout(terminar, TEMPO_MAXIMO_DE_UM_SOM)
    // Se já está a soar (o aviso 'play' pode ter vindo antes de o ouvirmos)
    if (som.playing(numero)) comecou()
  })
}

/** Cala todos os sons do jogo de Memória que estejam a tocar. */
export function pararSons() {
  carregados.forEach((som) => som.stop())
}

function esperar(ms) {
  return new Promise((cumprir) => setTimeout(cumprir, ms))
}

/**
 * Toca uma sequência de sons, um de cada vez.
 *
 * Opções:
 * - pausa: milissegundos de silêncio entre sons
 * - aoTocar(indice, id): chamado quando cada som começa (para acender a imagem)
 * - aoCalar(indice, id): chamado quando cada som acaba (para apagar a imagem)
 * - maximo: tempo máximo de cada som (por defeito MAXIMO_NUMA_SEQUENCIA)
 *
 * Devolve { terminou, parar }:
 * - terminou: promessa que dá true se tocou tudo, ou false se foi parada a meio
 * - parar(): interrompe a sequência e cala o som que estiver a tocar
 */
export function tocarSequencia(
  ids,
  { pausa = PAUSA_ENTRE_SONS, aoTocar, aoCalar, maximo = MAXIMO_NUMA_SEQUENCIA } = {},
) {
  let parada = false
  // Antes de começar, cala o que ainda estiver a tocar (ex.: o som do último
  // cartão em que a criança tocou), para não se misturar com a sequência
  pararSons()

  async function tocarTudo() {
    for (let i = 0; i < ids.length; i++) {
      if (parada) return false
      aoTocar?.(i, ids[i])
      await tocarSom(ids[i], maximo)
      aoCalar?.(i, ids[i])
      if (parada) return false
      if (i < ids.length - 1) await esperar(pausa)
    }
    return !parada
  }

  return {
    terminou: tocarTudo(),
    parar() {
      parada = true
      pararSons()
    },
  }
}
