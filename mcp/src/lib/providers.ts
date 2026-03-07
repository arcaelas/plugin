import config from "./config.js";

export async function openai(
  endpoint: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  return fetch(`${config.openai.base_url}${endpoint}`, {
    method: options.method || "POST",
    headers: {
      Authorization: `Bearer ${config.openai.api_key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body,
    signal: AbortSignal.timeout(120000),
  });
}

export async function ollama(endpoint: string, body?: unknown): Promise<Response> {
  return fetch(`${config.ollama.base_url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
}
