import { html, useState, useEffect, useCallback } from '../lib/html.js';

const toasts = [];
const listeners = new Set();

export function showToast(msg, type = 'info') {
  const id = Date.now() + Math.random();
  toasts.push({ id, msg, type });
  for (const fn of listeners) fn([...toasts]);
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx !== -1) toasts.splice(idx, 1);
    for (const fn of listeners) fn([...toasts]);
  }, 3500);
}

const ICONS = { success: 'check_circle', error: 'error', info: 'info' };
const COLORS = { success: 'var(--accent)', error: 'var(--red)', info: 'var(--text-s)' };

export function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  if (!items.length) return null;

  return html`
    <div class="toast-container">
      ${items.map(t => html`
        <div class="toast" key=${t.id}>
          <span class="material-symbols-outlined" style="color:${COLORS[t.type] || COLORS.info}">${ICONS[t.type] || 'info'}</span>
          <span>${t.msg}</span>
        </div>
      `)}
    </div>
  `;
}
