import { Routes, Route } from 'react-router-dom'
import Guarda from './components/Guarda'
import Home from './pages/home/Home'
import Niveis from './pages/niveis/Niveis'
import Mascotes from './pages/mascotes/Mascotes'
import Jogos from './pages/jogos/Jogos'
import Construcao from './pages/construcao/Construcao'
import Matematica from './pages/matematica/Matematica'
import Portugues from './pages/portugues/Portugues'
import Memoria from './pages/memoria/Memoria'
import Horas from './pages/horas/Horas'
import Detetive from './pages/detetive/Detetive'

// O percurso: início → nível → mascote → jogo.
// A <Guarda> manda a criança para trás se faltar escolher alguma coisa
// (ex.: abrir um jogo sem ter escolhido o nível).
// A rota de cada jogo é o seu id em config.js (e o nome da sua pasta).
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nivel" element={<Niveis />} />
      <Route element={<Guarda nivel />}>
        <Route path="/mascotes" element={<Mascotes />} />
      </Route>
      <Route element={<Guarda nivel mascote />}>
        <Route path="/jogos" element={<Jogos />} />
        <Route path="/construcao" element={<Construcao />} />
        <Route path="/matematica" element={<Matematica />} />
        <Route path="/portugues" element={<Portugues />} />
        <Route path="/memoria" element={<Memoria />} />
        <Route path="/horas" element={<Horas />} />
        <Route path="/detetive" element={<Detetive />} />
      </Route>
    </Routes>
  )
}

export default App
