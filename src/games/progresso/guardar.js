// ============================================================
// Ler e guardar o progresso no telemóvel (@capacitor/preferences).
//
// Fica tudo numa só chave, 'progresso', como texto JSON. A lógica (somar
// estrelas, peças...) está no progresso.js; aqui só se lê e escreve.
//
// Regras de segurança:
// - Se o que está guardado estiver estragado, a app não rebenta: aproveita
//   o que der (repararProgresso) ou começa do zero. O texto estragado é
//   copiado para 'progresso:estragado', para se poder recuperar à mão.
// - Se a leitura do telemóvel falhar, NÃO se guarda nada nesta sessão,
//   para não escrever um progresso vazio por cima do verdadeiro.
// - Na primeira vez (ainda sem 'progresso'), o nível vem da faixa etária
//   que os jogos antigos guardaram ('3-4' → 'facil', ...).
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { criarProgresso, nivelDosEscaloesAntigos, repararProgresso } from './progresso'

const CHAVE = 'progresso'
const CHAVE_ESTRAGADO = 'progresso:estragado'
const CHAVES_ESCALAO_ANTIGAS = ['sapo:escalao', 'panda:escalao', 'coruja:escalao', 'tartaruga:escalao']

let podeGuardar = true

/** Lê o nível a partir das faixas etárias guardadas pelos jogos antigos (ou null). */
async function lerNivelAntigo() {
  const escaloes = await Promise.all(
    CHAVES_ESCALAO_ANTIGAS.map(async (key) => (await Preferences.get({ key })).value),
  )
  return nivelDosEscaloesAntigos(escaloes)
}

/** Lê o progresso guardado. Devolve sempre um progresso válido. */
export async function lerProgresso() {
  let texto
  try {
    texto = (await Preferences.get({ key: CHAVE })).value
  } catch {
    podeGuardar = false // não sabemos o que lá está: não arriscar apagá-lo
    return criarProgresso()
  }

  if (texto) {
    try {
      return repararProgresso(JSON.parse(texto))
    } catch {
      // Texto que nem é JSON: guarda uma cópia e começa do zero
      await Preferences.set({ key: CHAVE_ESTRAGADO, value: texto }).catch(() => {})
    }
  }

  try {
    return criarProgresso(await lerNivelAntigo())
  } catch {
    return criarProgresso()
  }
}

/** Guarda o progresso (em segundo plano: não é preciso esperar). */
export async function guardarProgresso(progresso) {
  if (!podeGuardar) return
  try {
    await Preferences.set({ key: CHAVE, value: JSON.stringify(progresso) })
  } catch {
    // Não conseguiu gravar: a app continua; volta a tentar na próxima vez
  }
}

/** Só para os testes: volta ao estado inicial. */
export function _recomecarParaTestes() {
  podeGuardar = true
}
