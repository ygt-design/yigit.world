import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import TestApp from './test/TestApp.jsx'

const isTest = window.location.pathname.replace(/\/+$/, '') === '/test'

createRoot(document.getElementById('root')).render(
  isTest ? <TestApp /> : <App />
)
