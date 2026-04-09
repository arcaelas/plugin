import { html, useState } from '../lib/html.js';
import { Menu } from '../components/Menu.js';

const PROV_DEFS = [
  { value: 'openai', icon: 'bolt', name: 'OpenAI', hint: 'API compatible con GPT' },
  { value: 'claude', icon: 'auto_awesome', name: 'Claude', hint: 'API de Anthropic' },
  { value: 'claude-code', icon: 'terminal', name: 'ClaudeCode', hint: 'CLI local de Claude' },
  { value: 'ollama', icon: 'memory', name: 'Ollama', hint: 'Modelos locales' },
];

const THINK_OPTIONS = [
  { value: 'none', icon: 'visibility_off', name: 'None', hint: 'Sin razonamiento' },
  { value: 'low', icon: 'lightbulb', name: 'Low', hint: 'Razonamiento minimo' },
  { value: 'medium', icon: 'psychology', name: 'Medium', hint: 'Razonamiento moderado' },
  { value: 'high', icon: 'neurology', name: 'High', hint: 'Razonamiento profundo' },
];

const PLACEHOLDERS = {
  openai: { url: 'https://api.openai.com/v1', key: 'sk-...', model: 'gpt-4o' },
  claude: { url: 'https://api.anthropic.com', key: 'sk-ant-...', model: 'claude-sonnet-4-20250514' },
  'claude-code': { dirname: '~/.claude', model: 'sonnet' },
  ollama: { url: 'http://localhost:11434', model_embedding: 'mxbai-embed-large', model: '' },
};

function ProviderEntry({ provider, index, onChange, onRemove }) {
  const type = provider.provider;
  const ph = PLACEHOLDERS[type] || PLACEHOLDERS.openai;
  const [visKey, setVisKey] = useState(false);

  const set = (field, val) => onChange(index, { ...provider, [field]: val });

  return html`
    <div class="provider-entry" data-provider=${type}>
      <div class="provider-top">
        <input type="text" class="provider-name-input" placeholder="Nombre unico"
          value=${provider.name} onInput=${(e) => set('name', e.target.value)} />
        <div class="provider-type-wrap">
          <${Menu} value=${type} options=${PROV_DEFS} onChange=${(v) => set('provider', v)} />
        </div>
        <button type="button" class="btn-delete" onClick=${() => onRemove(index)}>
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      ${type === 'claude-code' && html`
        <div class="provider-bottom single">
          <div class="field">
            <label>Directorio</label>
            <input type="text" placeholder=${ph.dirname} value=${provider.dirname || ''} onInput=${(e) => set('dirname', e.target.value)} />
          </div>
          <div class="field">
            <label>Modelo</label>
            <input type="text" placeholder=${ph.model} value=${provider.model || ''} onInput=${(e) => set('model', e.target.value)} />
          </div>
        </div>
      `}

      ${type === 'claude' && html`
        <div class="provider-bottom">
          <div class="field">
            <label>Base URL</label>
            <input type="text" placeholder=${ph.url} value=${provider.base_url || ''} onInput=${(e) => set('base_url', e.target.value)} />
          </div>
          <div class="field">
            <label>API Key</label>
            <div class="input-wrap">
              <input type=${visKey ? 'text' : 'password'} class="pr-btn" placeholder=${ph.key} value=${provider.api_key || ''} onInput=${(e) => set('api_key', e.target.value)} />
              <button type="button" class="toggle-vis" onClick=${() => setVisKey(!visKey)}>
                <span class="material-symbols-outlined">${visKey ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="provider-bottom" style="margin-top:10px">
          <div class="field">
            <label>Modelo</label>
            <input type="text" placeholder=${ph.model} value=${provider.model || ''} onInput=${(e) => set('model', e.target.value)} />
          </div>
          <div class="field">
            <label>Razonamiento</label>
            <${Menu} value=${provider.think || 'none'} options=${THINK_OPTIONS} onChange=${(v) => set('think', v)} />
          </div>
        </div>
      `}

      ${type === 'openai' && html`
        <div class="provider-bottom">
          <div class="field">
            <label>Base URL</label>
            <input type="text" placeholder=${ph.url} value=${provider.base_url || ''} onInput=${(e) => set('base_url', e.target.value)} />
          </div>
          <div class="field">
            <label>API Key</label>
            <div class="input-wrap">
              <input type=${visKey ? 'text' : 'password'} class="pr-btn" placeholder=${ph.key} value=${provider.api_key || ''} onInput=${(e) => set('api_key', e.target.value)} />
              <button type="button" class="toggle-vis" onClick=${() => setVisKey(!visKey)}>
                <span class="material-symbols-outlined">${visKey ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="provider-bottom single" style="margin-top:10px">
          <div class="field">
            <label>Modelo</label>
            <input type="text" placeholder=${ph.model} value=${provider.model || ''} onInput=${(e) => set('model', e.target.value)} />
          </div>
        </div>
      `}

      ${type === 'ollama' && html`
        <div class="provider-bottom">
          <div class="field">
            <label>Base URL</label>
            <input type="text" placeholder=${ph.url} value=${provider.base_url || ''} onInput=${(e) => set('base_url', e.target.value)} />
          </div>
          <div class="field">
            <label>API Key</label>
            <div class="input-wrap">
              <input type=${visKey ? 'text' : 'password'} class="pr-btn" placeholder="(opcional)" value=${provider.api_key || ''} onInput=${(e) => set('api_key', e.target.value)} />
              <button type="button" class="toggle-vis" onClick=${() => setVisKey(!visKey)}>
                <span class="material-symbols-outlined">${visKey ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="provider-bottom" style="margin-top:10px">
          <div class="field">
            <label>Modelo embedding</label>
            <input type="text" placeholder=${ph.model_embedding} value=${provider.model_embedding || ''} onInput=${(e) => set('model_embedding', e.target.value)} />
          </div>
          <div class="field">
            <label>Modelo texto</label>
            <input type="text" placeholder=${ph.model} value=${provider.model || ''} onInput=${(e) => set('model', e.target.value)} />
          </div>
        </div>
      `}
    </div>
  `;
}

export function Providers({ providers, onChange }) {
  const add = () => {
    onChange([...providers, { name: '', provider: 'openai', base_url: '', api_key: '', model: '' }]);
  };

  const update = (index, updated) => {
    const next = [...providers];
    next[index] = updated;
    onChange(next);
  };

  const remove = (index) => {
    onChange(providers.filter((_, i) => i !== index));
  };

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
