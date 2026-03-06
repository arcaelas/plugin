import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";

const { name, version } = createRequire(import.meta.url)("../../package.json");

// --- Types & constants ---

interface ConfigData {
  openai_api_key: string;
  openai_model_image: string;
  openai_model_audio: string;
  openai_base_url: string;
  ollama_base_url: string;
  ollama_embedding_model: string;
}

export const DEFAULTS: ConfigData = {
  openai_api_key: "",
  openai_model_image: "dall-e-3",
  openai_model_audio: "gpt-4o-mini-audio",
  openai_base_url: "https://api.openai.com/v1",
  ollama_base_url: "http://localhost:11434",
  ollama_embedding_model: "mxbai-embed-large",
};

const ENV_MAP: Record<keyof ConfigData, string> = {
  openai_api_key: "OPENAI_API_KEY",
  openai_model_image: "OPENAI_MODEL_IMAGE",
  openai_model_audio: "OPENAI_MODEL_AUDIO",
  openai_base_url: "OPENAI_BASE_URL",
  ollama_base_url: "OLLAMA_BASE_URL",
  ollama_embedding_model: "OLLAMA_EMBEDDING_MODEL",
};

const CONFIG_PATH = resolve(homedir(), ".arcaelas", "mcp", "config.json");

// --- Config management ---

export function applyToEnv(data: ConfigData): void {
  for (const key of Object.keys(DEFAULTS) as (keyof ConfigData)[]) {
    process.env[ENV_MAP[key]] = data[key];
  }
}

export function loadConfig(): ConfigData {
  if (existsSync(CONFIG_PATH)) {
    try {
      return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) };
    } catch { /* corrupted file — fall through */ }
  }
  const config = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof ConfigData)[]) {
    const val = process.env[ENV_MAP[key]];
    if (val) config[key] = val;
  }
  return config;
}

export function saveConfig(data: Partial<ConfigData>): void {
  const current = loadConfig();
  const patch: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && v !== "") patch[k] = v;
  }
  const merged: ConfigData = { ...current, ...patch };
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  applyToEnv(merged);
}

// --- Startup utilities ---

export function initConfig(): boolean {
  const isFirstRun = !existsSync(CONFIG_PATH);
  applyToEnv(loadConfig());
  return isFirstRun;
}

export function openBrowser(url: string): void {
  const cmd = process.platform === "darwin"
    ? `open "${url}"`
    : process.platform === "win32"
      ? `start "" "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

// --- Reactive getters (read process.env on each access) ---

function env(key: keyof ConfigData): string {
  return process.env[ENV_MAP[key]] || DEFAULTS[key];
}

export default {
  server: { name, version },
  data_dir: resolve(homedir(), ".arcaelas", "mcp", "rag"),
  get openai_api_key() { return env("openai_api_key"); },
  get openai_model_image() { return env("openai_model_image"); },
  get openai_model_audio() { return env("openai_model_audio"); },
  get openai_base_url() { return env("openai_base_url"); },
  get ollama_base_url() { return env("ollama_base_url"); },
  get ollama_embedding_model() { return env("ollama_embedding_model"); },
};
