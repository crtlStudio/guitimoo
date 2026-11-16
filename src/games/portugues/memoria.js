// ============================================================
// Memória do jogo de Português, guardada no telemóvel com @capacitor/preferences.
//
// O Preferences guarda pares "chave → texto". Como o saco é uma lista,
// convertemo-lo em texto com JSON.stringify ao guardar e voltamos a
// convertê-lo com JSON.parse ao ler.
//
// Ler e guardar no telemóvel demora um bocadinho, por isso estas funções
// são assíncronas (async): devolvem uma "promessa" do resultado, e quem
// as usa espera por ele com `await`.
// ============================================================
import { Preferences } from '@capacitor/preferences'
import { tirarDoSaco, tirarVariasDoSaco } from './baralho'

// (As chaves guardadas no telemóvel mantêm o nome antigo do jogo, de propósito:
//  assim o progresso que já existe não se perde.)
const chaveDoSaco = (escalao) => `panda:saco:${escalao}`

// ---------- Saco de palavras de cada escalão ----------

/**
 * Lê o saco guardado de um escalão: { saco: [...], ultima: 'GATO' | null }.
 * Se não houver nada guardado, ou o que está guardado estiver estragado,
 * começa com o saco vazio (que depois é enchido e baralhado).
 *
 * `todas` são as palavras atuais do escalão: palavras que entretanto tenham
 * sido tiradas do palavras.json são ignoradas.
 */
async function lerSaco(escalao, todas) {
  const vazio = { saco: [], ultima: null }
  const { value } = await Preferences.get({ key: chaveDoSaco(escalao) })
  if (!value) return vazio

  try {
    const guardado = JSON.parse(value)
    const saco = Array.isArray(guardado.saco)
      ? guardado.saco.filter((palavra) => todas.includes(palavra))
      : []
    return { saco, ultima: guardado.ultima ?? null }
  } catch {
    return vazio // texto guardado inválido: começa de novo
  }
}

async function guardarSaco(escalao, saco, ultima) {
  await Preferences.set({
    key: chaveDoSaco(escalao),
    value: JSON.stringify({ saco, ultima }),
  })
}

// ---------- O que o jogo usa ----------

/**
 * Tira a próxima palavra de um escalão e guarda o saco atualizado.
 * `todas` é a lista de palavras do escalão (texto), ex.: ['GATO', 'SOL', ...].
 *
 *   const palavra = await proximaPalavra('5-6', todas)   // 'GATO'
 */
export async function proximaPalavra(escalao, todas) {
  const { saco, ultima } = await lerSaco(escalao, todas)
  const resultado = tirarDoSaco(saco, todas, ultima)
  await guardarSaco(escalao, resultado.saco, resultado.palavra)
  return resultado.palavra
}

/**
 * Tira várias palavras diferentes (escalão 7–8) e guarda o saco atualizado.
 *
 *   const palavras = await proximasPalavras('7-8', todas, 3)   // ['GATO', 'TIGRE', 'POLVO']
 */
export async function proximasPalavras(escalao, todas, quantidade) {
  const { saco } = await lerSaco(escalao, todas)
  const resultado = tirarVariasDoSaco(saco, todas, quantidade)
  await guardarSaco(escalao, resultado.saco, resultado.palavras.at(-1))
  return resultado.palavras
}
