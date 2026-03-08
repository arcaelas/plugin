import { html, useState, useEffect, useRef, useCallback } from '../lib/html.js';

export function Menu({ value, options, onChange, placeholder = 'Seleccionar', iconKey = 'icon' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return html`
    <div class="menu ${open ? 'open' : ''}" ref=${ref}>
      <button type="button" class="menu-trigger" onClick=${() => setOpen(!open)}>
        <span class="menu-icon material-symbols-outlined">${selected?.[iconKey] || 'dns'}</span>
        <span class="menu-label">${selected?.name || placeholder}</span>
        <span class="material-symbols-outlined menu-arrow">expand_more</span>
      </button>
      <div class="menu-panel">
        ${options.length === 0 && html`<div class="menu-empty">Sin opciones disponibles</div>`}
        ${options.map(o => html`
          <button type="button" key=${o.value}
            class="menu-item ${o.value === value ? 'selected' : ''}"
            onClick=${() => { onChange(o.value); setOpen(false); }}>
            <span class="material-symbols-outlined">${o[iconKey] || 'dns'}</span>
            <div>
              <div class="menu-item-name">${o.name}</div>
              ${o.hint && html`<div class="menu-item-hint">${o.hint}</div>`}
            </div>
          </button>
        `)}
      </div>
    </div>
  `;
}
