import { useNavigate } from 'react-router-dom'
import EcraEscolha from '../../components/EcraEscolha'
import { usePerfil } from '../../components/useProgresso'
import { MASCOTES } from '../../games/progresso/config'
import { mudarProgresso } from '../../games/progresso/estado'
import { escolherMascote } from '../../games/progresso/progresso'
import imagemMascotes from '../../assets/fundo_mascotes.webp'
import styles from './Mascotes.module.css'

// Onde fica cada mascote na imagem (da esquerda para a direita)
const POSICAO = {
  sapo: styles.sapo,
  panda: styles.panda,
  coruja: styles.coruja,
  tartaruga: styles.tartaruga,
}

/**
 * Escolher a mascote: a criança escolhe quem vai ajudar a acabar o projeto.
 * A mascote que já estava escolhida tem uma estrela. Pode-se trocar sempre:
 * o progresso de cada mascote fica guardado.
 */
function Mascotes() {
  const navegar = useNavigate()
  const ativa = usePerfil()?.mascoteAtiva

  function escolher(id) {
    mudarProgresso((progresso) => escolherMascote(progresso, id))
    navegar('/jogos')
  }

  return (
    <EcraEscolha titulo="Quem vais ajudar?" voltar="/nivel" imagem={imagemMascotes}>
      <nav aria-label="Mascotes">
        {MASCOTES.map(({ id, nome }) => {
          // 'Sapo construtor' → 2 linhas: 'Sapo' e 'construtor'
          const [primeira, ...resto] = nome.split(' ')
          return (
            <button
              key={id}
              type="button"
              className={`${styles.botao} ${POSICAO[id]} ${id === ativa ? styles.ativa : ''}`}
              onClick={() => escolher(id)}
              aria-pressed={id === ativa}
            >
              {id === ativa && (
                <span className={styles.estrela} aria-hidden="true">
                  ⭐
                </span>
              )}
              <span className={styles.linha}>{primeira}</span>
              <span className={styles.linha}>{resto.join(' ')}</span>
            </button>
          )
        })}
      </nav>
    </EcraEscolha>
  )
}

export default Mascotes
