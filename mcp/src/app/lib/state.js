const listeners = new Set();

export const state = {
  providers: [],
  ollama: { base_url: '', model: { embedding: '' } },
  research: { provider: '', model: 'haiku', think: 'none', score: 0.7 },
  image: '',
  models: [],
  _loaded: false,
};

export function notify() {
  for (const fn of listeners) fn();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function update(partial) {
  Object.assign(state, partial);
  notify();
}

export function updateNested(path, value) {
  const keys = path.split('.');
  let obj = state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  notify();
}
