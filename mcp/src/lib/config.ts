import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";

const { name, version } = createRequire(import.meta.url)("../../package.json");
const CONFIG_PATH = resolve(homedir(), ".arcaelas", "mcp", "config.json");

let _cache: Record<string, any> | null = null;

function config(): Record<string, any> {
  try {
    if (_cache) return _cache;
    _cache = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    setTimeout(() => { _cache = null; }, 10_000);
    return _cache!;
  } catch { return {}; }
}

function set(path: string[], value: any): void {
  const data = config();
  let obj = data;
  for (let i = 0; i < path.length - 1; i++) {
    if (!obj[path[i]] || typeof obj[path[i]] !== "object") obj[path[i]] = {};
    obj = obj[path[i]];
  }
  obj[path[path.length - 1]] = value;
  _cache = data;
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

export function openBrowser(url: string): void {
  const cmd = process.platform === "darwin"
    ? `open "${url}"`
    : process.platform === "win32"
      ? `start "" "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

export default {
  booted: (() => { try { readFileSync(CONFIG_PATH); return true; } catch { return false; } })(),
  config,
  server: { name, version },
  data_dir: resolve(homedir(), ".arcaelas", "mcp", "rag"),

  openai: {
    get api_key() { return config().openai?.api_key || ""; },
    set api_key(v: string) { set(["openai", "api_key"], v); },

    get base_url() { return config().openai?.base_url || "https://api.openai.com/v1"; },
    set base_url(v: string) { set(["openai", "base_url"], v); },

    model: {
      get image() { return config().openai?.model?.image || "dall-e-3"; },
      set image(v: string) { set(["openai", "model", "image"], v); },

      get audio() { return config().openai?.model?.audio || "gpt-4o-mini-audio"; },
      set audio(v: string) { set(["openai", "model", "audio"], v); },
    },
  },

  claude: {
    get dirname() { return config().claude?.dirname || resolve(homedir(), ".claude"); },
    set dirname(v: string) { set(["claude", "dirname"], v); },
  },

  ollama: {
    get base_url() { return config().ollama?.base_url || "http://localhost:11434"; },
    set base_url(v: string) { set(["ollama", "base_url"], v); },

    model: {
      get embedding() { return config().ollama?.model?.embedding || "mxbai-embed-large"; },
      set embedding(v: string) { set(["ollama", "model", "embedding"], v); },
    },
  },
};
