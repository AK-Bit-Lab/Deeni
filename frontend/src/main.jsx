import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Providers } from './components/Providers.jsx'
import { BrowserRouter } from 'react-router-dom'
import { primeSpeech } from './utils/speak'

// Pre-warm the speech synthesis engine so voices are loaded by the
// time the user taps a speak button (mobile browsers load async).
primeSpeech()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
)
