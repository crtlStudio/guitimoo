import styles from './ImagemPalavra.module.css'

// Todas as imagens da pasta icones_gerais. O import.meta.glob é do Vite: junta
// os ficheiros de uma pasta de uma vez, como se fizéssemos um import para cada.
// Fica um objeto { '../assets/icones_gerais/gato.png': 'endereço da imagem', ... }.
const FICHEIROS = import.meta.glob('../assets/icones_gerais/*.png', {
  eager: true,
  import: 'default',
})

// Imagens com nome diferente da palavra (nome do ficheiro → palavra)
const OUTROS_NOMES = {
  carrinha: 'camiao',
  onda: 'mar',
  cino: 'sino',
  foguetao: 'foguete',
  uvas: 'uva',
}

/** 'LEÃO' → 'leao': sem acentos e em minúsculas, como os nomes dos ficheiros. */
function chaveDaPalavra(palavra) {
  return palavra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// { gato: 'endereço', camiao: 'endereço', ... }
const IMAGENS = {}
for (const [caminho, endereco] of Object.entries(FICHEIROS)) {
  const nome = caminho.split('/').pop().replace('.png', '')
  IMAGENS[OUTROS_NOMES[nome] ?? nome] = endereco
}

/** O endereço da imagem de uma palavra, ou null se ainda não houver imagem. */
function imagemDaPalavra(palavra) {
  if (!palavra) return null
  return IMAGENS[chaveDaPalavra(palavra)] ?? null
}

/**
 * O desenho de uma palavra: a imagem da pasta icones_gerais ou, se ainda
 * não houver, o emoji. O tamanho vem do className (o font-size): a imagem
 * ocupa o mesmo espaço que o emoji ocuparia. É só decoração: a palavra já
 * está escrita ou dita à volta.
 *
 * Props:
 * - palavra: 'GATO', 'LEÃO', 'gato'... (acentos e maiúsculas não importam)
 * - emoji: o emoji de reserva
 * - className: o tamanho em cada sítio
 */
function ImagemPalavra({ palavra, emoji, className = '' }) {
  const imagem = imagemDaPalavra(palavra)
  return (
    <span className={className} aria-hidden="true">
      {imagem ? <img className={styles.imagem} src={imagem} alt="" draggable="false" /> : emoji}
    </span>
  )
}

export default ImagemPalavra
