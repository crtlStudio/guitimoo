import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ativarSomDeToque } from './audio/efeitos'
import { carregarVolumes } from './audio/volume'
import './index.css'

// Som de "toque" em todos os botões da app
ativarSomDeToque()
// Volumes da música e dos efeitos escolhidos nas Definições (guardados no telemóvel)
carregarVolumes()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)