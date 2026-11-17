// ============================================================
// As profissões do jogo "Detetive das Profissões".
//
// Cada profissão tem:
// - id: o nome curto (também serve para não repetir perguntas)
// - nome: como se diz, no género da imagem (a bombeira, o médico...)
// - emoji: a pessoa, enquanto não houver imagem. As imagens estão em
//   src/assets/detetive/profissoes/<id>.webp (ver pages/detetive/Retrato.jsx); a que
//   faltar aparece com o emoji.
// - pistas: 3 objetos que a profissão usa (as pistas do detetive).
//   Cada pista só existe numa profissão, para não haver dúvidas.
//   O desenho de cada pista está em IMAGEM_DA_PISTA (mais abaixo).
// - local: onde trabalha (para o nível difícil), também único.
// ============================================================

export const PROFISSOES = [
  {
    id: 'bombeiro',
    nome: 'a bombeira',
    emoji: '👩‍🚒',
    pistas: ['🧯', '🔥', '🪜'],
    local: { id: 'quartel', nome: 'o quartel dos bombeiros', emoji: '🚒' },
  },
  {
    id: 'medico',
    nome: 'o médico',
    emoji: '👨‍⚕️',
    pistas: ['🩺', '💊', '🩹'],
    local: { id: 'hospital', nome: 'o hospital', emoji: '🏥' },
  },
  {
    id: 'cozinheiro',
    nome: 'a cozinheira',
    emoji: '👩‍🍳',
    pistas: ['🍳', '🥄', '🧂'],
    local: { id: 'restaurante', nome: 'o restaurante', emoji: '🍽️' },
  },
  {
    id: 'professor',
    nome: 'o professor',
    emoji: '👨‍🏫',
    pistas: ['📚', '✏️', '📐'],
    local: { id: 'escola', nome: 'a escola', emoji: '🏫' },
  },
  {
    id: 'agricultor',
    nome: 'o agricultor',
    emoji: '👨‍🌾',
    pistas: ['🚜', '🌽', '🥕'],
    local: { id: 'quinta', nome: 'a quinta', emoji: '🌾' },
  },
  {
    id: 'policia',
    nome: 'o polícia',
    emoji: '👮‍♂️',
    pistas: ['🚓', '🚨', '🚦'],
    local: { id: 'esquadra', nome: 'a esquadra', emoji: '🏢' },
  },
  {
    id: 'mecanico',
    nome: 'o mecânico',
    emoji: '👨‍🔧',
    pistas: ['🔧', '🔩', '🛞'],
    local: { id: 'oficina', nome: 'a oficina', emoji: '🚗' },
  },
  {
    id: 'pintor',
    nome: 'a pintora',
    emoji: '👩‍🎨',
    pistas: ['🎨', '🖌️', '🖍️'],
    local: { id: 'museu', nome: 'o museu', emoji: '🏛️' },
  },
  {
    id: 'astronauta',
    nome: 'o astronauta',
    emoji: '👨‍🚀',
    pistas: ['🚀', '🌙', '🪐'],
    local: { id: 'espaco', nome: 'o espaço', emoji: '🌌' },
  },
  {
    id: 'cientista',
    nome: 'a cientista',
    emoji: '👩‍🔬',
    pistas: ['🔬', '🧪', '🥽'],
    local: { id: 'laboratorio', nome: 'o laboratório', emoji: '🧬' },
  },
  {
    id: 'piloto',
    nome: 'o piloto',
    emoji: '👨‍✈️',
    pistas: ['✈️', '🧳', '🧭'],
    local: { id: 'aeroporto', nome: 'o aeroporto', emoji: '🛫' },
  },
  {
    id: 'cantor',
    nome: 'o cantor',
    emoji: '👨‍🎤',
    pistas: ['🎤', '🎵', '🎸'],
    local: { id: 'palco', nome: 'o palco', emoji: '🎭' },
  },
  {
    id: 'construtor',
    nome: 'o trolha',
    emoji: '👷‍♂️',
    pistas: ['🔨', '🧱', '🦺'],
    local: { id: 'obra', nome: 'a obra', emoji: '🏗️' },
  },
  {
    id: 'jogador',
    nome: 'o jogador de basquetebol',
    emoji: '⛹️‍♂️',
    pistas: ['🏀', '👟', '🏆'],
    local: { id: 'pavilhao', nome: 'o pavilhão', emoji: '🏟️' },
  },
]

/**
 * O nome da imagem de cada pista, em src/assets/icones_gerais (ver
 * components/ImagemPalavra.jsx). A pista que ainda não tiver imagem
 * aparece com o emoji.
 */
export const IMAGEM_DA_PISTA = {
  '🧯': 'extintor',
  '🔥': 'fogo',
  '🪜': 'escada',
  '🩺': 'estetoscopio',
  '💊': 'comprimidos',
  '🩹': 'penso',
  '🍳': 'frigideira',
  '🥄': 'colher',
  '🧂': 'saleiro',
  '📚': 'livros',
  '✏️': 'lapis',
  '📐': 'esquadro',
  '🚜': 'trator',
  '🌽': 'milho',
  '🥕': 'cenoura',
  '🚓': 'carro_policia',
  '🚨': 'sirene',
  '🚦': 'semaforo',
  '🔧': 'chave_inglesa',
  '🔩': 'parafuso',
  '🛞': 'pneu',
  '🎨': 'paleta',
  '🖌️': 'pincel',
  '🖍️': 'lapis_cera',
  '🚀': 'foguete',
  '🌙': 'lua',
  '🪐': 'planeta',
  '🔬': 'microscopio',
  '🧪': 'tubo_ensaio',
  '🥽': 'oculos_protecao',
  '✈️': 'aviao',
  '🧳': 'mala',
  '🧭': 'bussola',
  '🎤': 'microfone',
  '🎵': 'nota_musical',
  '🎸': 'guitarra',
  '🔨': 'martelo',
  '🧱': 'tijolo',
  '🦺': 'colete',
  '🏀': 'bola_basquete',
  '👟': 'sapatilhas',
  '🏆': 'taca',
}
