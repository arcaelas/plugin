const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function postMcp(tool, body) {
  const res = await fetch(`/mcp/${tool}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getSettings() {
  const res = await fetch('/v1/setting');
  return res.json();
}

export async function saveSettings(body) {
  const res = await fetch('/v1/setting', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function postApi(path, body) {
  const res = await fetch(`/v1/${path}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function putApi(path, body) {
  const res = await fetch(`/v1/${path}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return res.json();
}
