import { html, render, useState, useEffect } from './lib/html.js';
import { getSettings, saveSettings } from './lib/api.js';
import { showToast, ToastContainer } from './components/Toast.js';
import { Providers } from './sections/Providers.js';
import { Menu } from './components/Menu.js';

function ProviderRefMenu({ label, icon, color, description, providers, value, onChange }) {
  const options = providers
    .filter(p => p.name.trim())
    .map(p => ({ value: p.name, icon: 'dns', name: p.name, hint: p.provider }));

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon ${color}"><span class="material-symbols-outlined">${icon}</span></div>
        <div class="section-info"><h2>${label}</h2><p>${description}</p></div>
      </div>
      <div class="field">
        <label>Proveedor</label>
        ${options.length > 0
          ? html`<${Menu} value=${value} options=${options} onChange=${onChange} />`
          : html`<p class="hint">Sin proveedores configurados</p>`
        }
      </div>
    </section>
  `;
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const [research, setResearch] = useState('');
  const [rag, setRag] = useState('');

  useEffect(() => {
    getSettings().then(data => {
      setProviders((data.providers || []).map(p => ({
        name: p.name || '', provider: p.provider || 'openai',
        base_url: p.base_url || '', api_key: p.api_key || '',
        dirname: p.dirname || '', model: p.model || '',
        model_embedding: p.model_embedding || '', think: p.think || 'none',
      })));
      setResearch(data.research?.provider || '');
      setRag(data.rag?.provider || '');
      setLoaded(true);
    }).catch(() => setError(true));
  }, []);

  const save = async () => {
    for (let i = 0; i < providers.length; i++) {
      if (!providers[i].name.trim()) { showToast('El proveedor #' + (i + 1) + ' necesita un nombre', 'error'); return; }
    }
    const names = providers.map(p => p.name.trim()).filter(Boolean);
    if (new Set(names).size !== names.length) { showToast('Los nombres de proveedores deben ser unicos', 'error'); return; }

    setSaving(true);
    try {
      const d = await saveSettings({ providers, research: { provider: research }, rag: { provider: rag } });
      showToast(d.ok ? 'Configuracion guardada' : 'Error al guardar', d.ok ? 'success' : 'error');
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };

  if (error) {
    return html`
      <div class="empty-state" style="padding:64px 24px">
        <span class="material-symbols-outlined" style="font-size:36px;color:var(--red)">cloud_off</span>
        <p style="margin-top:8px">No se pudo conectar al servidor</p>
      </div>
    `;
  }

  if (!loaded) {
    return html`
      <nav class="topbar"><div class="topbar-inner">
        <div class="brand"><div class="brand-mark"><span class="material-symbols-outlined">hub</span></div><span class="brand-name">Arko Studio</span></div>
      </div></nav>
      <div class="wrap">
        <div class="sk-section"><div class="skeleton-block sk-h"></div><div class="skeleton-block sk-input"></div><div class="skeleton-block sk-input"></div></div>
        <div class="sk-section"><div class="skeleton-block sk-h"></div><div class="sk-row"><div class="skeleton-block sk-half"></div><div class="skeleton-block sk-half"></div></div></div>
      </div>
    `;
  }

  return html`
    <nav class="topbar"><div class="topbar-inner">
      <div class="brand"><div class="brand-mark"><span class="material-symbols-outlined">hub</span></div><span class="brand-name">Arko Studio</span></div>
      <button class="save-btn" onClick=${save} disabled=${saving}>
        ${saving
          ? html`<span class="material-symbols-outlined spin" style="font-size:16px">progress_activity</span>`
          : html`<span class="material-symbols-outlined">check</span>Guardar`
        }
      </button>
    </div></nav>
    <div class="wrap">
      <${Providers} providers=${providers} onChange=${setProviders} />
      <${ProviderRefMenu}
        label="Investigacion"
        icon="search_insights"
        color="amber"
        description="Proveedor para el agente de investigacion en memoria semantica"
        providers=${providers}
        value=${research}
        onChange=${setResearch}
      />
      <${ProviderRefMenu}
        label="RAG"
        icon="memory"
        color="purple"
        description="Proveedor con modelo de embedding para busqueda semantica"
        providers=${providers.filter(p => p.provider === 'ollama')}
        value=${rag}
        onChange=${setRag}
      />
      <p class="footer">Configuracion en <code>~/.arcaelas/mcp/config.json</code></p>
    </div>
    <${ToastContainer} />
  `;
}

render(html`<${App} />`, document.getElementById('app'));
