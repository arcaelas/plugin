import { html, render, useState, useEffect, useCallback } from './lib/html.js';
import { getSettings, saveSettings } from './lib/api.js';
import { showToast, ToastContainer } from './components/Toast.js';
import { Providers } from './sections/Providers.js';
import { Ollama } from './sections/Ollama.js';
import { Generation } from './sections/Generation.js';
import { Research } from './sections/Research.js';
import { WhatsApp } from './sections/WhatsApp.js';

function App() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const [ollama, setOllama] = useState({ base_url: '', model: { embedding: '' } });
  const [research, setResearch] = useState({ provider: '', model: 'haiku', think: 'none', score: 0.7 });
  const [image, setImage] = useState('');
  const [models, setModels] = useState([]);

  useEffect(() => {
    getSettings().then(data => {
      setProviders((data.providers || []).map(p => ({
        name: p.name || '', provider: p.provider || 'openai',
        base_url: p.base_url || '', api_key: p.api_key || '',
        models: p.models || {},
      })));
      setOllama({
        base_url: data.ollama?.base_url || '',
        model: { embedding: data.ollama?.model?.embedding || '' },
      });
      setResearch({
        provider: data.research?.provider || '',
        model: data.research?.model || 'haiku',
        think: data.research?.think || 'none',
        score: data.research?.score ?? 0.7,
      });
      setImage(data.image || '');
      setModels(data.models || []);
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
      const d = await saveSettings({ providers, ollama, research, image });
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
        <div class="sk-section"><div class="skeleton-block sk-h"></div><div class="skeleton-block sk-input"></div></div>
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
      <${Ollama}
        ollama=${ollama}
        models=${models}
        onChangeUrl=${(v) => setOllama({ ...ollama, base_url: v })}
        onChangeModel=${(v) => setOllama({ ...ollama, model: { embedding: v } })}
        onModelsUpdate=${setModels}
      />
      <${Generation} providers=${providers} value=${image} onChange=${setImage} />
      <${Research} providers=${providers} research=${research} onChange=${setResearch} />
      <${WhatsApp} />
      <p class="footer">Configuracion en <code>~/.arcaelas/mcp/config.json</code></p>
    </div>
    <${ToastContainer} />
  `;
}

render(html`<${App} />`, document.getElementById('app'));
