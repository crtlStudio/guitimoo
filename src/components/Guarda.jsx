import { Navigate, Outlet } from 'react-router-dom'
import { usePerfil } from './useProgresso'

/**
 * "Porteiro" das páginas: só as mostra se o que precisam já estiver escolhido.
 * - mascote: precisa da mascote (senão vai para a escolha da mascote)
 * - nivel: precisa do nível (senão vai para a escolha do nível)
 * A mascote vê-se primeiro: é a 1.ª coisa que se escolhe (depois, o nível).
 * Enquanto lê o progresso do telemóvel não mostra nada (é muito rápido).
 *
 * Usa-se no App.jsx à volta das rotas:
 *   <Route element={<Guarda nivel mascote />}> ...rotas dos jogos... </Route>
 * e o <Outlet /> é o sítio onde aparece a página da rota.
 */
function Guarda({ nivel = false, mascote = false }) {
  const perfil = usePerfil()
  if (!perfil) return null
  if (mascote && !perfil.mascoteAtiva) return <Navigate to="/mascotes" replace />
  if (nivel && !perfil.nivel) return <Navigate to="/nivel" replace />
  return <Outlet />
}

export default Guarda
