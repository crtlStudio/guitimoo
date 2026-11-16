import { Navigate, Outlet } from 'react-router-dom'
import { usePerfil } from './useProgresso'

/**
 * "Porteiro" das páginas: só as mostra se o que precisam já estiver escolhido.
 * - nivel: precisa do nível (senão vai para a escolha do nível)
 * - mascote: precisa da mascote (senão vai para a escolha da mascote)
 * Enquanto lê o progresso do telemóvel não mostra nada (é muito rápido).
 *
 * Usa-se no App.jsx à volta das rotas:
 *   <Route element={<Guarda nivel mascote />}> ...rotas dos jogos... </Route>
 * e o <Outlet /> é o sítio onde aparece a página da rota.
 */
function Guarda({ nivel = false, mascote = false }) {
  const perfil = usePerfil()
  if (!perfil) return null
  if (nivel && !perfil.nivel) return <Navigate to="/nivel" replace />
  if (mascote && !perfil.mascoteAtiva) return <Navigate to="/mascotes" replace />
  return <Outlet />
}

export default Guarda
