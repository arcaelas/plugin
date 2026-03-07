import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";

const { name, version } = createRequire(import.meta.url)("../../package.json");
const CONFIG_PATH = resolve(homedir(), ".arcaelas", "mcp", "config.json");

// ── Types ──

export interface ProviderEntry {
  name: string;
  provider: "openai" | "claude" | "claude-code";
  base_url: string;
  api_key: string;
  models: {
    text?: string;
    image?: string;
    audio?: string;
    video?: string;
  };
}

interface ConfigData {
  providers?: ProviderEntry[];
  ollama?: {
    base_url?: string;
    model?: { embedding?: string };
  };
  research?: {
    provider?: string;
    model?: string;
    think?: string;
    score?: number;
  };
  image?: string;
}

// ── Cache ──

let _cache: ConfigData | null = null;

function config(): ConfigData {
  try {
    if (_cache) return _cache;
    _cache = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    setTimeout(() => { _cache = null; }, 10_000);
    return _cache!;
  } catch { return {}; }
}

function set(path: string[], value: unknown): void {
  const data = config() as Record<string, any>;
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

// ── Helpers ──

export function openBrowser(url: string): void {
  const cmd = process.platform === "darwin"
    ? `open "${url}"`
    : process.platform === "win32"
      ? `start "" "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

// ── Exported config ──

export default {
  booted: (() => { try { readFileSync(CONFIG_PATH); return true; } catch { return false; } })(),
  config,
  save(data: Record<string, unknown>): void {
    const merged = { ...config(), ...data };
    _cache = merged as ConfigData;
    mkdirSync(dirname(CONFIG_PATH), { recursive: true });
    writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  },
  server: { name, version },
  data_dir: resolve(homedir(), ".arcaelas", "mcp", "rag"),

  // --- Providers ---

  get providers(): ProviderEntry[] {
    return config().providers || [];
  },
  set providers(v: ProviderEntry[]) {
    set(["providers"], v);
  },

  provider(name: string): ProviderEntry | undefined {
    return (config().providers || []).find((p) => p.name === name);
  },

  // --- Image (ref to provider name for draw/redraw) ---

  get image(): string { return config().image || ""; },
  set image(v: string) { set(["image"], v); },

  // --- Ollama ---

  ollama: {
    get base_url(): string { return config().ollama?.base_url || "http://localhost:11434"; },
    set base_url(v: string) { set(["ollama", "base_url"], v); },

    model: {
      get embedding(): string { return config().ollama?.model?.embedding || "mxbai-embed-large"; },
      set embedding(v: string) { set(["ollama", "model", "embedding"], v); },
    },
  },

  // --- Research ---

  research: {
    get provider(): string { return config().research?.provider || ""; },
    set provider(v: string) { set(["research", "provider"], v); },

    get model(): string { return config().research?.model || "haiku"; },
    set model(v: string) { set(["research", "model"], v); },

    get think(): string { return config().research?.think || "none"; },
    set think(v: string) { set(["research", "think"], v); },

    get score(): number { return config().research?.score ?? 0.7; },
    set score(v: number) { set(["research", "score"], v); },
  },
};
