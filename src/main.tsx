import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerLicense } from '@syncfusion/ej2-base'
import './index.css'
import App from './App.tsx'

// Register Syncfusion license
registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cXGFCf0xzWmFZfVhgcl9HY1ZSTWYuP1ZhSXxWd0djX39YcXdRRWZYVUB9XEM=')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)