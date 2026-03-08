import { html } from '../lib/html.js';
import { Menu } from '../components/Menu.js';

const MODEL_OPTIONS = [
  { value: 'haiku', name: 'Haiku', icon: 'flash_on', hint: 'Rapido y ligero' },
  { value: 'sonnet', name: 'Sonnet', icon: 'tune', hint: 'Equilibrado' },
  { value: 'opus', name: 'Opus', icon: 'diamond', hint: 'Mas potente' },
];

const THINK_OPTIONS = [
  { value: 'none', name: 'None', icon: 'visibility_off', hint: 'Sin reflexion' },
  { value: 'low', name: 'Low', icon: 'lightbulb', hint: 'Reflexion minima' },
  { value: 'medium', name: 'Medium', icon: 'psychology', hint: 'Reflexion moderada' },
  { value: 'high', name: 'High', icon: 'neurology', hint: 'Reflexion profunda' },
];

export function Research({ providers, research, onChange }) {
  const provOptions = providers
    .filter(p => p.name.trim())
    .map(p => ({
      value: p.name,
      name: p.name,
      icon: p.provider === 'openai' ? 'bolt' : p.provider === 'claude' ? 'auto_awesome' : 'terminal',
      hint: p.provider === 'openai' ? 'OpenAI' : p.provider === 'claude' ? 'Claude' : 'ClaudeCode',
    }));

  const set = (key, val) => onChange({ ...research, [key]: val });

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon amber"><span class="material-symbols-outlined">search_insights</span></div>
        <div class="section-info"><h2>Investigacion</h2><p>Personaliza el agente que investiga en la memoria semantica</p></div>
      </div>
      <div class="field">
        <label>Proveedor</label>
        <${Menu}
          value=${research.provider}
          options=${provOptions}
          onChange=${(v) => set('provider', v)}
          placeholder="Seleccionar proveedor"
        />
      </div>
      <div class="field"><div class="field-row">
        <div>
          <label>Modelo</label>
          <${Menu} value=${research.model} options=${MODEL_OPTIONS} onChange=${(v) => set('model', v)} />
        </div>
        <div>
          <label>Pensamiento</label>
          <${Menu} value=${research.think} options=${THINK_OPTIONS} onChange=${(v) => set('think', v)} />
        </div>
      </div></div>
      <div class="field">
        <div class="field-label-row">
          <label>Score minimo</label>
          <span class="score-val">${parseFloat(research.score).toFixed(2)}</span>
        </div>
        <input type="range" min="0" max="1" step="0.05"
          value=${research.score}
          style="--val:${research.score}"
          onInput=${(e) => set('score', parseFloat(e.target.value))} />
        <p class="hint">Umbral de confianza para detener la investigacion</p>
      </div>
    </section>
  `;
}
