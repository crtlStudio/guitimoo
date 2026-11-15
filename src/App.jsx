import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Tartaruga from './pages/tartaruga/Tartaruga'
import Panda from './pages/panda/Panda'
import Sapo from './pages/sapo/Sapo'
import Coruja from './pages/coruja/Coruja'
import Mascotes from './pages/mascotes/Mascotes'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mascotes" element={<Mascotes />} />
      <Route path="/tartaruga" element={<Tartaruga />} />
      <Route path="/panda" element={<Panda />} />
      <Route path="/sapo" element={<Sapo />} />
      <Route path="/coruja" element={<Coruja />} />
    </Routes>
  )
}

export default App
