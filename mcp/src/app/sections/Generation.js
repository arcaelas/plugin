import { html } from '../lib/html.js';
import { Menu } from '../components/Menu.js';

export function Generation({ providers, value, onChange }) {
  const options = providers
    .filter(p => p.name.trim())
    .map(p => ({
      value: p.name,
      name: p.name,
      icon: p.provider === 'openai' ? 'bolt' : p.provider === 'claude' ? 'auto_awesome' : 'terminal',
      hint: p.provider === 'openai' ? 'OpenAI' : p.provider === 'claude' ? 'Claude' : 'ClaudeCode',
    }));

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon blue"><span class="material-symbols-outlined">palette</span></div>
        <div class="section-info"><h2>Generacion</h2><p>Proveedor predeterminado para imagen, audio y video</p></div>
      </div>
      <div class="field">
        <label>Proveedor</label>
        <${Menu}
          value=${value}
          options=${options}
          onChange=${onChange}
          placeholder="Seleccionar proveedor"
        />
        <p class="hint">Usado por draw, redraw y herramientas multimedia</p>
      </div>
    </section>
  `;
}
