import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import palavras from '../../data/palavras.json'
import { gerarGrelha } from '../../games/portugues/grelha'
import { proximasPalavras } from '../../games/portugues/memoria'
import { corDaPalavra } from './cores'
import BalaoMascote from '../../components/BalaoMascote'
import Festa from '../../components/Festa'
import Grelha from './Grelha'
import styles from './Jogo78.module.css'

const LISTA = palavras['7-8'] // [{ palavra: 'LEAO', mostrar: 'LEÃO', emoji: '🦁' }, ...]
const TODAS = LISTA.map((p) => p.palavra)
const QUANTAS = 3
const ESPERA_DEPOIS_DE_ACABAR = 2200 // milissegundos até à grelha seguinte

/**
 * Jogo dos 7–8 anos: encontrar 3 palavras numa grelha 8x8, em várias direções.
 * Cada palavra é uma pergunta. Props: aoAcertar() e aoErrar() — avisam a página;
 * contador — o contador de estrelas, que fica por baixo da lista de palavras.
 */
function Jogo78({ aoAcertar, aoErrar: avisarErro, contador }) {
  // A ronda atual: { itens: [{ palavra, mostrar, emoji }], letras } (null enquanto carrega)
  const [ronda, setRonda] = useState(null)
  // Palavras encontradas, pela ordem: [{ palavra, celulas }]
  const [encontradas, setEncontradas] = useState([])
  // Mensagem da mascote: null, { tipo: 'erro' | 'boa' | 'fim', vez }
  const [mensagem, setMensagem] = useState(null)

  const temporizador = useRef(null)
  const jaComecou = useRef(false)

  /** Tira 3 palavras do saco e gera uma grelha nova com elas. */
  async function novaRonda() {
    const escolhidas = await proximasPalavras('7-8', TODAS, QUANTAS)
    const itens = escolhidas.map((palavra) => {
      const { mostrar, emoji } = LISTA.find((p) => p.palavra === palavra)
      return { palavra, emoji, mostrar: mostrar ?? palavra }
    })
    const { letras } = gerarGrelha({
      tamanho: 8,
      palavras: escolhidas,
      direcoes: ['horizontal', 'vertical', 'diagonalDesce', 'diagonalSobe'],
    })
    setRonda({ itens, letras })
    setEncontradas([])
    setMensagem(null)
  }

  // Primeira ronda (o jaComecou evita gastar palavras a dobrar em desenvolvimento)
  useEffect(() => {
    if (jaComecou.current) return
    jaComecou.current = true
    novaRonda()
  }, [])

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const proxVez = (anterior) => (anterior?.vez ?? 0) + 1

  function aoEncontrar(palavra, celulas) {
    const novas = [...encontradas, { palavra, celulas }]
    setEncontradas(novas)

    if (novas.length === QUANTAS) {
      // Encontrou as 3: fim da grelha (a página mostra o fim do jogo)
      const acabou = aoAcertar?.() // true = era a última: vem aí o ecrã de fim
      setMensagem((m) => ({ tipo: 'fim', vez: proxVez(m) }))
      if (!acabou) temporizador.current = setTimeout(novaRonda, ESPERA_DEPOIS_DE_ACABAR)
    } else {
      aoAcertar?.()
      setMensagem((m) => ({ tipo: 'boa', vez: proxVez(m) }))
    }
  }

  function aoErrar() {
    avisarErro?.()
    setMensagem((m) => ({ tipo: 'erro', vez: proxVez(m) }))
  }

  if (!ronda) return null

  const jaEncontradas = encontradas.map((e) => e.palavra)
  const porEncontrar = ronda.itens.map((i) => i.palavra).filter((p) => !jaEncontradas.includes(p))
  const acabou = porEncontrar.length === 0

  return (
    <>
      <div className={styles.zonaGrelha}>
        <Grelha
          key={ronda.itens.map((i) => i.palavra).join('-')}
          letras={ronda.letras}
          porEncontrar={porEncontrar}
          encontradas={encontradas}
          aoEncontrar={aoEncontrar}
          aoErrar={aoErrar}
          bloqueada={acabou}
        />
      </div>

      <div className={styles.lado}>
        <BalaoMascote
          mensagem={mensagem}
          textos={{ fim: 'Encontraste todas!' }}
          className={styles.mensagem}
        />

        {/* Lista das palavras a encontrar; cada uma fica riscada e com a sua cor */}
        <ul className={styles.lista} aria-label="Palavras a encontrar">
          {ronda.itens.map(({ palavra, mostrar, emoji }, i) => {
            const indice = jaEncontradas.indexOf(palavra)
            const encontrada = indice !== -1

            return (
              <motion.li
                key={palavra}
                className={`${styles.item} ${encontrada ? styles.encontrada : ''}`}
                style={encontrada ? { '--cor': corDaPalavra(indice) } : undefined}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0, scale: encontrada ? [1, 1.1, 1] : 1 }}
                transition={{ delay: encontrada ? 0 : i * 0.1 }}
              >
                <span className={styles.emoji} aria-hidden="true">
                  {emoji}
                </span>
                <span className={styles.texto}>{mostrar}</span>
                {encontrada && (
                  <span className={styles.visto} aria-label="encontrada">
                    ✓
                  </span>
                )}
              </motion.li>
            )
          })}
        </ul>

        {/* O contador de estrelas, por baixo das palavras (vem da página) */}
        {contador}
      </div>

      {/* Festa a partir do meio da grelha, quando encontra as 3 */}
      {acabou && (
        <Festa semente={ronda.itens.map((i) => i.palavra).join()} origem={{ x: 37, y: 50 }} />
      )}
    </>
  )
}

export default Jogo78
