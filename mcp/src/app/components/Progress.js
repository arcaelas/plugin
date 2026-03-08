import { html } from '../lib/html.js';

export function Progress({ visible, percent, label, pulse }) {
  if (!visible) return null;
  return html`
    <div class="progress visible">
      <div class="progress-track">
        <div class="progress-fill ${pulse ? 'pulse' : ''}" style="width:${pulse ? '' : percent + '%'}"></div>
      </div>
      ${label && html`<p class="progress-label">${label}</p>`}
    </div>
  `;
}
