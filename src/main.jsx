import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'

// Note: StrictMode is intentionally omitted. react-force-graph manages its own
// canvas/animation lifecycle, and StrictMode's double-invoke in dev can cause
// visible graph re-init flicker during a live demo. Production is unaffected.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
