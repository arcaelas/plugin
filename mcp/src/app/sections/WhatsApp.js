import { html, useState, useEffect, useRef } from '../lib/html.js';
import { postMcp, postApi } from '../lib/api.js';
import { showToast } from '../components/Toast.js';

export function WhatsApp() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [pairing, setPairing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const sseRef = useRef(null);
  const timerRef = useRef(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      let d = await postMcp('whatsapp', { actions: [{ accounts: true }] });
      if (Array.isArray(d)) d = d[0];
      setAccounts(d?.ok && Array.isArray(d.data) ? d.data : []);
    } catch { setAccounts([]); }
    setLoading(false);
  };

  useEffect(() => { loadAccounts(); }, []);

  const cleanup = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null; }
    setCountdown(0);
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelPairing = () => {
    cleanup();
    setPairing(null);
    setShowForm(false);
    setPhone('');
  };

  const connect = async () => {
    const raw = phone.replace(/\D/g, '');
    if (!raw || raw.length < 8) { showToast('Ingresa un numero valido', 'error'); return; }

    setPairing({ status: 'waiting' });

    try {
      const d = await postApi('whatsapp', { phone: raw });
      if (!d.ok) { showToast(d.error || 'Error al vincular', 'error'); cancelPairing(); return; }

      const source = new EventSource('/v1/whatsapp?access_token=' + encodeURIComponent(d.token));
      sseRef.current = source;

      source.addEventListener('code', (e) => {
        const data = JSON.parse(e.data);
        setPairing({ status: 'code', code: data.code });
        startCountdown(60);
      });

      source.addEventListener('connected', () => {
        cleanup();
        setPairing({ status: 'connected' });
        loadAccounts();
        setTimeout(() => {
          cancelPairing();
          showToast('Cuenta +' + raw + ' vinculada', 'success');
        }, 2000);
      });

      source.addEventListener('expired', () => {
        cleanup();
        setPairing({ status: 'expired' });
      });

      source.onerror = () => {
        if (source.readyState === EventSource.CLOSED) {
          cleanup();
          showToast('Conexion perdida', 'error');
          cancelPairing();
        }
      };
    } catch (e) { showToast(e.message || 'Error de conexion', 'error'); cancelPairing(); }
  };

  const retry = () => { cleanup(); setPairing(null); connect(); };

  const disconnect = async (ownerPhone) => {
    try {
      let d = await postMcp('whatsapp', { actions: [{ close: true, owner: ownerPhone }] });
      if (Array.isArray(d)) d = d[0];
      if (d?.ok) showToast('Cuenta +' + ownerPhone + ' desvinculada', 'success');
      else showToast(d?.error || 'Error al desvincular', 'error');
    } catch (e) { showToast(e.message || 'Error', 'error'); }
    loadAccounts();
  };

  const dotClass = (s) => s === 'connected' ? 'ok' : s === 'connecting' ? 'warn' : 'off';
  const statusLabel = (s) => s === 'connected' ? 'Conectado' : s === 'connecting' ? 'Conectando...' : 'Desconectado';

  return html`
    <section class="section">
      <div class="section-head">
        <div class="section-icon green"><span class="material-symbols-outlined">chat</span></div>
        <div class="section-info"><h2>WhatsApp</h2><p>Cuentas vinculadas y sesiones activas</p></div>
        <div class="section-actions">
          <button class="btn-ghost" onClick=${() => setShowForm(true)} disabled=${showForm}>
            <span class="material-symbols-outlined">add</span>Vincular
          </button>
        </div>
      </div>

      <div class="wa-list">
        ${accounts.map(a => html`
          <div class="wa-entry" key=${a.phone}>
            <div class="wa-avatar"><span class="material-symbols-outlined">person</span></div>
            <div class="wa-info">
              <div class="wa-phone">+${a.phone}</div>
              <div class="wa-meta">
                <span class="wa-status"><span class="dot ${dotClass(a.status)}"></span>${statusLabel(a.status)}</span>
                ${a.unread > 0 && html`<span class="wa-unread">${a.unread}</span>`}
              </div>
            </div>
            <button class="btn-delete" onClick=${() => disconnect(a.phone)}>
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        `)}
      </div>

      ${!loading && accounts.length === 0 && !showForm && html`
        <div class="empty-state"><span class="material-symbols-outlined">phone_disabled</span><p>Sin cuentas vinculadas</p></div>
      `}

      ${showForm && html`
        <div class="wa-pairing">
          <div class="wa-pair-head">
            <div class="field" style="flex:1;margin:0">
              <label>Numero de telefono</label>
              <div class="wa-input-row">
                <input type="text" placeholder="+52 1 234 567 8900"
                  value=${phone} onInput=${(e) => setPhone(e.target.value)}
                  onKeyDown=${(e) => e.key === 'Enter' && connect()}
                  disabled=${!!pairing} />
                <button class="btn-ghost" onClick=${connect}
                  disabled=${!phone.trim() || !!pairing}>
                  <span class="material-symbols-outlined">link</span>Conectar
                </button>
              </div>
            </div>
            <button class="wa-pair-close" onClick=${cancelPairing}>
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          ${pairing?.status === 'waiting' && html`
            <div class="wa-pair-body">
              <div class="wa-pair-status"><span class="dot warn"></span>Conectando...</div>
            </div>
          `}

          ${pairing?.status === 'code' && html`
            <div class="wa-pair-body">
              <div class="wa-pair-code">${pairing.code.replace(/(.{4})/g, '$1 ').trim()}</div>
              <div class="wa-pair-instructions">
                Abre <strong>WhatsApp</strong> en tu telefono${'<br>'}
                Ve a <strong>Dispositivos vinculados</strong> → <strong>Vincular dispositivo</strong>${'<br>'}
                Toca <strong>Vincular con numero de telefono</strong>${'<br>'}
                Ingresa el codigo de arriba
              </div>
              <div class="wa-pair-status"><span class="dot warn"></span>Esperando confirmacion...</div>
              ${countdown > 0 && html`<div class="wa-pair-timer">${countdown}s restantes</div>`}
            </div>
          `}

          ${pairing?.status === 'connected' && html`
            <div class="wa-pair-body">
              <div class="wa-pair-code" style="color:var(--accent);font-size:22px;letter-spacing:2px">✓ Conectado</div>
              <p class="wa-pair-success">Cuenta vinculada correctamente</p>
            </div>
          `}

          ${pairing?.status === 'expired' && html`
            <div class="wa-pair-body">
              <div class="wa-pair-status"><span class="dot off"></span>Codigo expirado</div>
              <p class="wa-pair-error">El codigo expiro antes de ser ingresado.</p>
              <div class="wa-pair-actions">
                <button class="btn-ghost" onClick=${retry}><span class="material-symbols-outlined">refresh</span>Nuevo codigo</button>
              </div>
            </div>
          `}
        </div>
      `}
    </section>
  `;
}
