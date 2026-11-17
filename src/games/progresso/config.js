// ============================================================
// Configuração do progresso: TUDO o que se pode afinar está aqui.
//
// - JOGOS: os jogos da app. Cada jogo dá peças de uma cor (`cor` é o nome,
//   `hex` é a cor no ecrã). `icone` é o emoji do botão do jogo.
//   `ativo: false` quer dizer que o jogo ainda não existe: as suas estrelas
//   contam, mas não dá peças nem é preciso para acabar um projeto.
// - MASCOTES: os companheiros. Cada um tem um projeto para construir.
//   `chamada` é o nome com o artigo, para as frases ("Ajuda o Sapo!").
//   `peca` / `pecas` / `generoPeca` ('m' ou 'f'): o nome das peças, para as
//   frases ("1 lego vermelho", "2 sementes vermelhas"). `imagemPeca` é o
//   nome da imagem da peça na pasta icones_gerais; enquanto não houver,
//   aparece o `emojiPeca`. `iconeProjeto` é o emoji de reserva do projeto.
// - NIVEIS: a dificuldade, escolhida uma vez e igual para todos os jogos.
//   `escalaoAntigo` é a faixa etária que se usava antes (para converter
//   o que já estava guardado no telemóvel).
// ============================================================

/** Quantas estrelas de um jogo valem 1 peça da cor desse jogo. */
export const ESTRELAS_POR_PECA = 75

/** Quantas peças de cada cor são precisas para acabar um projeto. */
export const PECAS_POR_COR = 5

/** O nome do perfil que existe enquanto não houver perfis. */
export const PERFIL_PRINCIPAL = 'principal'

export const JOGOS = [
  { id: 'matematica', nome: 'Matemática e Lógica', cor: 'vermelho', hex: '#e5483f', icone: '🧮', ativo: true },
  { id: 'portugues', nome: 'Português', cor: 'azul', hex: '#2f80d8', icone: '🔤', ativo: true },
  { id: 'memoria', nome: 'Memória', cor: 'verde', hex: '#3fa34d', icone: '🧠', ativo: true },
  { id: 'horas', nome: 'Horas e Rotinas', cor: 'amarelo', hex: '#f2b705', icone: '⏰', ativo: true },
  { id: 'detetive', nome: 'Detetive das Profissões', cor: 'laranja', hex: '#f07c1b', icone: '🔍', ativo: true },
]

export const MASCOTES = [
  {
    id: 'sapo',
    nome: 'Sapo construtor',
    chamada: 'o Sapo',
    emoji: '🐸',
    projeto: 'a casa',
    proximoProjeto: 'a próxima casa',
    iconeProjeto: '🏠',
    peca: 'lego',
    pecas: 'legos',
    generoPeca: 'm',
    emojiPeca: '🧱',
    imagemPeca: 'tijolo',
  },
  {
    id: 'panda',
    nome: 'Panda jardineiro',
    chamada: 'o Panda',
    emoji: '🐼',
    projeto: 'o bosque de bambu',
    proximoProjeto: 'o próximo bosque',
    iconeProjeto: '🎋',
    peca: 'semente',
    pecas: 'sementes',
    generoPeca: 'f',
    emojiPeca: '🌱',
    imagemPeca: 'rebento',
  },
  {
    id: 'coruja',
    nome: 'Coruja sábia',
    chamada: 'a Coruja',
    emoji: '🦉',
    projeto: 'a biblioteca',
    proximoProjeto: 'a próxima biblioteca',
    iconeProjeto: '📚',
    peca: 'livro',
    pecas: 'livros',
    generoPeca: 'm',
    emojiPeca: '📕',
    imagemPeca: 'livro',
  },
  {
    id: 'tartaruga',
    nome: 'Tartaruga viajante',
    chamada: 'a Tartaruga',
    emoji: '🐢',
    projeto: 'a carrinha das viagens',
    proximoProjeto: 'a próxima carrinha',
    iconeProjeto: '🚐',
    peca: 'peça',
    pecas: 'peças',
    generoPeca: 'f',
    emojiPeca: '🔩',
    imagemPeca: 'parafuso',
  },
]

export const NIVEIS = [
  { id: 'facil', nome: 'Fácil', escalaoAntigo: '3-4' },
  { id: 'medio', nome: 'Médio', escalaoAntigo: '5-6' },
  { id: 'dificil', nome: 'Difícil', escalaoAntigo: '7-8' },
]
