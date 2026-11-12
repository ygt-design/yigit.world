import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// src/test is gitignored — glob resolves to {} when the folder is absent (e.g. on Vercel)
const TestApp = Object.values(
  import.meta.glob('./test/TestApp.jsx', { eager: true, import: 'default' })
)[0]

const isTest = window.location.pathname.replace(/\/+$/, '') === '/test'

createRoot(document.getElementById('root')).render(
  isTest && TestApp ? <TestApp /> : <App />
)
