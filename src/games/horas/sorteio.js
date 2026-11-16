// ============================================================
// Sorteios e dificuldade do jogo das Horas.
//
// Cada escalão tem vários NÍVEIS, do mais fácil para o mais difícil.
// A criança sobe de nível quando acerta várias seguidas e desce
// quando erra várias seguidas.
// ============================================================
import { baralhar } from '../portugues/baralho'

export const NIVEIS = {
  '3-4': ['diaNoite', 'rotina'],
  '5-6': ['horasFaceis', 'horasTodas'],
  '7-8': ['horasCertas', 'meiasHoras', 'quartos', 'cincoMinutos'],
}

// Quantas certas seguidas para subir e quantos erros seguidos para descer
export const SOBE_COM = 3
export const DESCE_COM = 2

// Horas do dia em que a mascote faz coisas (7 da manhã às 9 da noite)
const HORAS_DO_DIA = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
// Para começar: as horas em que os ponteiros ficam na vertical ou na horizontal
const HORAS_FACEIS = [9, 12, 15, 18]

// Minutos possíveis em cada nível
const MINUTOS = {
  horasFaceis: [0],
  horasTodas: [0],
  horasCertas: [0],
  meiasHoras: [0, 30, 30], // a meia hora aparece mais vezes: é a novidade do nível
  quartos: [15, 45, 15, 45, 30],
  cincoMinutos: [5, 10, 20, 25, 35, 40, 50, 55, 15, 45],
}

/** Número inteiro ao calhas entre 0 e maximo - 1. */
const inteiro = (maximo, aleatorio) => Math.floor(aleatorio() * maximo)

/** Escolhe um elemento ao calhas, evitando os que estão em `recentes`. */
export function escolherSemRepetir(lista, chave, recentes, aleatorio = Math.random) {
  const novos = lista.filter((item) => !recentes.includes(chave(item)))
  const fonte = novos.length > 0 ? novos : lista // se já saíram todos, vale qualquer um
  return fonte[inteiro(fonte.length, aleatorio)]
}

/** Lista nova com `chave` à frente, sem repetidos, com no máximo `maximo`. */
export function lembrarRecente(recentes, chave, maximo = 5) {
  return [chave, ...recentes.filter((c) => c !== chave)].slice(0, maximo)
}

// ---------------- Horas ----------------

/** Chave de uma hora para não a repetir: igual para 3:00 e 15:00 (o relógio é igual). */
export const chaveDaHora = ({ h, m }) => `${h % 12}:${m}`

/** Todas as horas possíveis num nível, ex.: 'meiasHoras' → [{h:7,m:0}, {h:7,m:30}, ...]. */
export function horasDoNivel(nivel) {
  const horas = nivel === 'horasFaceis' ? HORAS_FACEIS : HORAS_DO_DIA
  return horas.flatMap((h) => MINUTOS[nivel].map((m) => ({ h, m })))
}

/** Sorteia uma hora do nível, sem repetir as últimas usadas. */
export function sortearHora(nivel, recentes = [], aleatorio = Math.random) {
  return escolherSemRepetir(horasDoNivel(nivel), chaveDaHora, recentes, aleatorio)
}

/**
 * Escolhe uma atividade que faça sentido àquela hora
 * (não se almoça às 8 da manhã!). `atividades` vem do atividades.json.
 */
export function atividadePara(hora, atividades, aleatorio = Math.random) {
  const possiveis = atividades.filter((a) => hora.h >= a.de && hora.h < a.ate)
  const fonte = possiveis.length > 0 ? possiveis : atividades
  return fonte[inteiro(fonte.length, aleatorio)]
}

/**
 * Três horas para escolher (exercício "ler o relógio"): a certa e duas
 * erradas parecidas, que são os enganos mais comuns das crianças:
 * - trocar os ponteiros (ler o grande como horas e o pequeno como minutos)
 * - enganar-se na hora por uma (sobretudo em "um quarto para as...")
 * - enganar-se nos minutos
 */
export function opcoesDeHora(certa, nivel, aleatorio = Math.random) {
  const candidatas = []

  // Ponteiros trocados: o grande no 3 (15 min) lido como "3 horas", etc.
  candidatas.push({ h: certa.m === 0 ? 12 : certa.m / 5, m: (certa.h % 12) * 5 })
  // Uma hora antes ou depois
  candidatas.push({ h: certa.h + 1, m: certa.m }, { h: certa.h + 11, m: certa.m })
  // Outros minutos do mesmo nível, à mesma hora
  for (const m of new Set(MINUTOS[nivel])) candidatas.push({ h: certa.h, m })
  // Reserva: meia hora de diferença
  candidatas.push({ h: certa.h, m: (certa.m + 30) % 60 })

  // Tira repetidas e a própria resposta certa
  const vistas = new Set([chaveDaHora(certa)])
  const erradas = []
  for (const hora of candidatas) {
    const normal = { h: hora.h % 12 === 0 ? 12 : hora.h % 12, m: hora.m }
    const chave = chaveDaHora(normal)
    if (!vistas.has(chave)) {
      vistas.add(chave)
      erradas.push(normal)
    }
  }

  return baralhar([certa, ...baralhar(erradas, aleatorio).slice(0, 2)], aleatorio)
}

// ---------------- 3–4 anos ----------------

/** Sorteia uma situação para "é de dia ou de noite?", sem repetir as últimas. */
export function sortearMomento(momentos, recentes = [], aleatorio = Math.random) {
  return escolherSemRepetir(momentos, (m) => m.id, recentes, aleatorio)
}

/** Sorteia uma rotina para ordenar, sem repetir as últimas. */
export function sortearRotina(rotinas, recentes = [], aleatorio = Math.random) {
  return escolherSemRepetir(rotinas, (r) => r.id, recentes, aleatorio)
}

/** Baralha os passos de uma rotina, garantindo que não ficam já pela ordem certa. */
export function baralharPassos(passos, aleatorio = Math.random) {
  const comOrdem = passos.map((passo, ordem) => ({ ...passo, ordem }))
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const baralhados = baralhar(comOrdem, aleatorio)
    if (baralhados.some((p, i) => p.ordem !== i)) return baralhados
  }
  return [...comOrdem].reverse()
}

// ---------------- Dificuldade ----------------

/**
 * Atualiza o nível depois de uma resposta.
 * `progresso` = { nivel, certas, erradas }: o nível atual (posição em
 * NIVEIS[escalao]) e quantas certas/erradas seguidas.
 *
 *   ajustarNivel({ nivel: 0, certas: 2, erradas: 0 }, true, 4)
 *   → { nivel: 1, certas: 0, erradas: 0 }   (3.ª certa seguida: sobe)
 */
export function ajustarNivel(progresso, acertou, totalDeNiveis) {
  let { nivel, certas, erradas } = progresso

  if (acertou) {
    certas += 1
    erradas = 0
    if (certas >= SOBE_COM && nivel < totalDeNiveis - 1) {
      nivel += 1
      certas = 0
    }
  } else {
    erradas += 1
    certas = 0
    if (erradas >= DESCE_COM && nivel > 0) {
      nivel -= 1
      erradas = 0
    }
  }

  return { nivel, certas, erradas }
}

/** Nome do nível atual, ex.: nomeDoNivel('7-8', 2) → 'quartos'. */
export const nomeDoNivel = (escalao, nivel) => NIVEIS[escalao][Math.min(nivel, NIVEIS[escalao].length - 1)]
