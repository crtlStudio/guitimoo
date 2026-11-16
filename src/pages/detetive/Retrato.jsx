// As imagens do Detetive, de uma vez (o import.meta.glob do Vite junta os
// ficheiros de cada pasta). Uma imagem nova entra sozinha: basta ter como
// nome o id da profissão (profissoes/) ou do local (locais/).
const PESSOAS = porNome(import.meta.glob('../../assets/detetive/profissoes/*.webp', { eager: true, import: 'default' }))
const LOCAIS = porNome(import.meta.glob('../../assets/detetive/locais/*.webp', { eager: true, import: 'default' }))

/** { 'caminho/bombeiro.webp': url } → { bombeiro: url } */
function porNome(ficheiros) {
  return Object.fromEntries(
    Object.entries(ficheiros).map(([caminho, url]) => [caminho.split('/').at(-1).replace('.webp', ''), url]),
  )
}

/** A imagem, ou o emoji se ainda não houver imagem. É só decoração. */
function Imagem({ url, emoji, className }) {
  if (!url) {
    return (
      <span className={className} aria-hidden="true">
        {emoji}
      </span>
    )
  }
  return <img className={className} src={url} alt="" draggable="false" />
}

/**
 * A imagem de uma profissão (a pessoa). Quem a usa põe o nome no botão à volta.
 * Props: profissao (de profissoes.js) e className (o tamanho em cada sítio).
 */
function Retrato({ profissao, className = '' }) {
  return <Imagem url={PESSOAS[profissao.id]} emoji={profissao.emoji} className={className} />
}

/**
 * A imagem de um local (o hospital, a escola...).
 * Props: local (o `local` de uma profissão) e className.
 */
export function ImagemLocal({ local, className = '' }) {
  return <Imagem url={LOCAIS[local.id]} emoji={local.emoji} className={className} />
}

export default Retrato
