import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'; // Importation du CSS de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min'; // Importation du JS de Bootstrap
import App from './App.tsx'
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

      <App />
  </React.StrictMode>,
)
