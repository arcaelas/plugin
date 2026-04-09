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
  provider: "openai" | "claude" | "claude-code" | "ollama";
  base_url?: string;
  api_key?: string;
  dirname?: string;
  model?: string;
  model_embedding?: string;
  think?: string;
}

interface ConfigData {
  providers?: ProviderEntry[];
  research?: {
    provider?: string;
  };
  rag?: {
    provider?: string;
  };
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

  // --- Ollama (resolved from RAG provider) ---

  get ollama(): { base_url: string; model: { embedding: string } } {
    const ragName = config().rag?.provider || "";
    const p = (config().providers || []).find((p) => p.name === ragName && p.provider === "ollama");
    return {
      base_url: p?.base_url || "http://localhost:11434",
      model: { embedding: p?.model_embedding || "mxbai-embed-large" },
    };
  },

  // --- Research ---

  research: {
    get provider(): string { return config().research?.provider || ""; },
    set provider(v: string) { set(["research", "provider"], v); },
  },

  // --- RAG ---

  rag: {
    get provider(): string { return config().rag?.provider || ""; },
    set provider(v: string) { set(["rag", "provider"], v); },
  },
};
