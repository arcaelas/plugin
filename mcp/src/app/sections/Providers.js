import { html, useState, useCallback } from '../lib/html.js';
import { Menu } from '../components/Menu.js';

const PROV_DEFS = [
  { value: 'openai', icon: 'bolt', name: 'OpenAI', hint: 'API compatible con GPT', urlLabel: 'Base URL', urlPh: 'https://api.openai.com/v1', keyPh: 'sk-...', modelPh: { text: 'gpt-4o', image: 'dall-e-3', audio: 'gpt-4o-mini-audio', video: '' } },
  { value: 'claude', icon: 'auto_awesome', name: 'Claude', hint: 'API de Anthropic', urlLabel: 'Base URL', urlPh: 'https://api.anthropic.com', keyPh: 'sk-ant-...', modelPh: { text: 'claude-sonnet-4-20250514' } },
  { value: 'claude-code', icon: 'terminal', name: 'ClaudeCode', hint: 'CLI local de Claude', urlLabel: 'Directorio', urlPh: '~/.claude', keyPh: '(opcional)', modelPh: {} },
];

function provMeta(type) { return PROV_DEFS.find(d => d.value === type) || PROV_DEFS[0]; }

function ProviderEntry({ provider, index, onChange, onRemove }) {
  const meta = provMeta(provider.provider);
  const isCode = provider.provider === 'claude-code';
  const isClaude = provider.provider === 'claude';
  const mp = provider.models || {};
  const ph = meta.modelPh || {};
  const [visKey, setVisKey] = useState(false);

  const set = (field, val) => {
    onChange(index, { ...provider, [field]: val });
  };

  const setModel = (field, val) => {
    onChange(index, { ...provider, models: { ...provider.models, [field]: val } });
  };

  return html`
    <div class="provider-entry" data-provider=${provider.provider}>
      <div class="provider-top">
        <input type="text" class="provider-name-input" placeholder="Nombre unico"
          value=${provider.name} onInput=${(e) => set('name', e.target.value)} />
        <div class="provider-type-wrap">
          <${Menu}
            value=${provider.provider}
            options=${PROV_DEFS}
            onChange=${(v) => set('provider', v)}
          />
        </div>
        <button type="button" class="btn-delete" onClick=${() => onRemove(index)}>
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="provider-bottom ${isCode ? 'no-key' : ''}">
        <div class="field">
          <label>${meta.urlLabel}</label>
          <input type="text" placeholder=${meta.urlPh}
            value=${provider.base_url} onInput=${(e) => set('base_url', e.target.value)} />
        </div>
        ${!isCode && html`
          <div class="field">
            <label>API Key</label>
            <div class="input-wrap">
              <input type=${visKey ? 'text' : 'password'} class="pr-btn" placeholder=${meta.keyPh}
                value=${provider.api_key} onInput=${(e) => set('api_key', e.target.value)} />
              <button type="button" class="toggle-vis" onClick=${() => setVisKey(!visKey)}>
                <span class="material-symbols-outlined">${visKey ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
        `}
      </div>
      ${!isCode && html`
        <div class="provider-models">
          <div class="provider-models-grid">
            <div class="field">
              <label>Text</label>
              <input type="text" placeholder=${ph.text || ''} value=${mp.text || ''} onInput=${(e) => setModel('text', e.target.value)} />
            </div>
            ${!isClaude && html`
              <div class="field">
                <label>Image</label>
                <input type="text" placeholder=${ph.image || ''} value=${mp.image || ''} onInput=${(e) => setModel('image', e.target.value)} />
              </div>
              <div class="field">
                <label>Audio</label>
                <input type="text" placeholder=${ph.audio || ''} value=${mp.audio || ''} onInput=${(e) => setModel('audio', e.target.value)} />
              </div>
              <div class="field">
                <label>Video</label>
                <input type="text" placeholder=${ph.video || ''} value=${mp.video || ''} onInput=${(e) => setModel('video', e.target.value)} />
              </div>
            `}
          </div>
        </div>
      `}
    </div>
  `;
}

export function Providers({ providers, onChange }) {
  const add = () => {
    onChange([...providers, { name: '', provider: 'openai', base_url: '', api_key: '', models: { text: '', image: '', audio: '', video: '' } }]);
  };

  const update = (index, updated) => {
    const next = [...providers];
    next[index] = updated;
    onChange(next);
  };

  const remove = (index) => {
    onChange(providers.filter((_, i) => i !== index));
  };

  // Detect duplicate names
  const names = providers.map(p => p.name.trim()).filter(Boolean);
  const hasDupes = new Set(names).size !== names.length;

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon green"><span class="material-symbols-outlined">dns</span></div>
        <div class="section-info"><h2>Proveedores</h2><p>Configura las conexiones y modelos de tus servicios de IA</p></div>
        <div class="section-actions">
          <button class="btn-ghost" onClick=${add}><span class="material-symbols-outlined">add</span>Agregar</button>
        </div>
      </div>
      <div id="providers-list">
        ${providers.map((p, i) => html`
          <${ProviderEntry} key=${i} provider=${p} index=${i} onChange=${update} onRemove=${remove} />
        `)}
      </div>
      ${providers.length === 0 && html`
        <div class="empty-state"><span class="material-symbols-outlined">cloud_off</span><p>Sin proveedores configurados</p></div>
      `}
    </section>
  `;
}
