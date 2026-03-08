import { html } from '../lib/html.js';

const COLORS = {
  connected: 'var(--color-success, #22c55e)',
  connecting: 'var(--color-warning, #eab308)',
  disconnected: 'var(--color-error, #ef4444)',
};

export function Badge({ status }) {
  const color = COLORS[status] || 'var(--color-muted, #888)';
  return html`
    <span class="badge" style="--badge-color: ${color}">
      ${status}
    </span>
  `;
}
