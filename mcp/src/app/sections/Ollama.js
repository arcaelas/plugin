import { html, useState } from '../lib/html.js';
import { Combobox } from '../components/Combobox.js';
import { Progress } from '../components/Progress.js';
import { showToast } from '../components/Toast.js';

export function Ollama({ ollama, models, onChangeUrl, onChangeModel, onModelsUpdate }) {
  const [badge, setBadge] = useState(null); // { type, text }
  const [testing, setTesting] = useState(false);
  const [pull, setPull] = useState(null); // { percent, label, pulse }

  const modelValue = ollama.model.embedding;
  const isInstalled = models.some(m => m === modelValue || m === modelValue + ':latest' || m.split(':')[0] === modelValue);
  const showPull = modelValue.trim() && !isInstalled && !pull;

  const testOllama = async () => {
    setTesting(true);
    setBadge(null);
    try {
      const r = await fetch('/v1/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ollama.base_url, model: modelValue }),
      });
      const d = await r.json();
      if (d.ok) setBadge({ type: 'ok', text: d.dims + 'd · ' + d.elapsed_ms + 'ms' });
      else setBadge({ type: 'err', text: d.error });
    } catch (e) { setBadge({ type: 'err', text: e.message }); }
    setTesting(false);
    setTimeout(() => setBadge(null), 8000);
  };

  const pullModel = async () => {
    const model = modelValue.trim();
    if (!model) return;
    setPull({ percent: 0, label: 'Iniciando descarga...', pulse: true });
    try {
      const res = await fetch('/v1/ollama', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const d = await res.json();
        if (d.ok) {
          setPull({ percent: 100, label: d.status === 'already_installed' ? 'Ya instalado' : 'Completo', pulse: false });
          if (!models.includes(model)) onModelsUpdate([...models, model]);
          setTimeout(() => setPull(null), 2500);
          return;
        }
        showToast(d.error || 'Error', 'error');
        setPull(null);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.total && msg.completed) {
              const pct = Math.round(msg.completed / msg.total * 100);
              setPull({ percent: pct, label: (msg.status || 'Descargando') + ' — ' + pct + '%', pulse: false });
            } else if (msg.status) {
              setPull(p => ({ ...p, label: msg.status }));
            }
          } catch {}
        }
      }
      setPull({ percent: 100, label: 'Completo', pulse: false });
      if (!models.includes(model)) onModelsUpdate([...models, model]);
      showToast('Modelo descargado', 'success');
      setTimeout(() => setPull(null), 2500);
    } catch (err) {
      showToast(err.message || 'Error', 'error');
      setPull(null);
    }
  };

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon purple"><span class="material-symbols-outlined">memory</span></div>
        <div class="section-info"><h2>Ollama</h2><p>Motor local de embeddings para busqueda semantica</p></div>
        <div class="section-actions">
          ${badge && html`
            <span class="badge visible ${badge.type}">
              <span class="material-symbols-outlined">${badge.type === 'ok' ? 'check_circle' : 'error'}</span>
              <span class="badge-text">${badge.text}</span>
            </span>
          `}
        </div>
      </div>
      <div class="ollama-fields">
        <div class="field">
          <label>Base URL</label>
          <input type="url" placeholder="http://localhost:11434"
            value=${ollama.base_url} onInput=${(e) => onChangeUrl(e.target.value)} />
        </div>
        <div class="field">
          <label>Embedding</label>
          <div class="combo-action">
            <${Combobox}
              value=${modelValue}
              options=${models}
              onChange=${onChangeModel}
              placeholder="mxbai-embed-large"
            />
            <button class="btn-ghost" onClick=${testOllama} disabled=${testing}>
              <span class="material-symbols-outlined ${testing ? 'spin' : ''}">${testing ? 'progress_activity' : 'science'}</span>
            </button>
            ${showPull && html`
              <button class="btn-ghost" onClick=${pullModel}>
                <span class="material-symbols-outlined">download</span>
              </button>
            `}
          </div>
        </div>
      </div>
      ${modelValue.trim() && !pull && html`
        <div class="model-status visible" style="margin-top:8px">
          <span class="badge visible ${isInstalled ? 'ok' : 'warn'}">
            <span class="material-symbols-outlined">${isInstalled ? 'check_circle' : 'warning'}</span>
            ${isInstalled ? 'Instalado' : 'No instalado'}
          </span>
        </div>
      `}
      <${Progress} visible=${!!pull} percent=${pull?.percent || 0} label=${pull?.label} pulse=${pull?.pulse} />
    </section>
  `;
}
