import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function lockViewportHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
lockViewportHeight();

let cachedWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth !== cachedWidth) { // only fires on rotation, not on scroll
    cachedWidth = window.innerWidth;
    lockViewportHeight();
  }
}, { passive: true });

createRoot(document.getElementById("root")!).render(<App />);
