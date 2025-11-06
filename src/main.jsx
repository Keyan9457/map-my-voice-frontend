import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.addEventListener("click", function (e) {
  const target = e.target.closest(".ripple");
  if (!target) return;

  target.classList.remove("animate");
  void target.offsetWidth; // reflow reset

  target.classList.add("animate");
}, false);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
