import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from './components/ui/Tooltip'
import { CityProvider } from './contexts/CityContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <CityProvider>
        <App />
      </CityProvider>
    </TooltipProvider>
  </StrictMode>,
)
