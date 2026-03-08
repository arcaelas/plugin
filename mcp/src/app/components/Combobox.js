import { html, useState, useEffect, useRef } from '../lib/html.js';

export function Combobox({ value, options, onChange, placeholder = '' }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const q = (filter || value || '').toLowerCase();
  const filtered = q ? options.filter(o => o.toLowerCase().includes(q)) : options;

  const handleInput = (e) => {
    const v = e.target.value;
    setFilter(v);
    onChange(v);
    if (!open) setOpen(true);
  };

  const pick = (v) => {
    onChange(v);
    setFilter('');
    setOpen(false);
  };

  return html`
    <div class="combobox ${open ? 'open' : ''}" ref=${ref}>
      <div class="input-wrap">
        <input type="text" class="pr-btn" placeholder=${placeholder}
          value=${value} onInput=${handleInput}
          onFocus=${() => setOpen(true)} />
        <button type="button" class="toggle-vis" onMouseDown=${(e) => { e.preventDefault(); setOpen(!open); }}>
          <span class="material-symbols-outlined">arrow_drop_down</span>
        </button>
      </div>
      <div class="combo-panel">
        ${filtered.length === 0 && html`
          <div class="combo-empty">${options.length ? 'Sin coincidencias' : 'Sin modelos disponibles'}</div>
        `}
        ${filtered.map(m => html`
          <button type="button" key=${m} class="combo-item" onClick=${() => pick(m)}>
            <span class="material-symbols-outlined">smart_toy</span>${m}
          </button>
        `)}
      </div>
    </div>
  `;
}
