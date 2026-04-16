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

// ── Pull-to-reload gesture ────────────────────────────────────────────────
// Fires when user is at scrollY === 0 and drags down more than 72px.
// Note: requires overscroll-behavior-y: none on body (already set).
(function setupPullToReload() {
  let startY = 0;
  let triggered = false;
  let indicator: HTMLDivElement | null = null;

  const createIndicator = () => {
    const el = document.createElement('div');
    el.id = 'ptr-indicator';
    el.style.cssText = [
      'position:fixed', 'top:0', 'left:50%', 'transform:translateX(-50%) translateY(-100%)',
      'padding:10px 24px',
      'background:rgba(10,10,10,0.85)',
      'border-bottom:1px solid rgba(245,243,239,0.1)',
      'font-family:General Sans,sans-serif',
      'font-size:10px', 'letter-spacing:0.2em',
      'color:rgba(245,243,239,0.5)',
      'text-transform:uppercase', 'z-index:9999',
      'backdrop-filter:blur(12px)',
      '-webkit-backdrop-filter:blur(12px)',
      'transition:transform 0.25s ease',
      'white-space:nowrap',
    ].join(';');
    el.textContent = '↓  RELEASE TO RELOAD';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    return el;
  };

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      triggered = false;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (window.scrollY !== 0) return;
    const delta = e.touches[0].clientY - startY;

    if (delta > 24 && !indicator) {
      indicator = createIndicator();
    }

    if (delta > 72 && !triggered) {
      triggered = true;
      if (indicator) indicator.textContent = '↻  RELOADING...';
      setTimeout(() => window.location.reload(), 350);
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (indicator) {
      indicator.style.transform = 'translateX(-50%) translateY(-100%)';
      setTimeout(() => { indicator?.remove(); indicator = null; }, 300);
    }
    if (!triggered) triggered = false;
  }, { passive: true });
})();

createRoot(document.getElementById("root")!).render(<App />);
