import config from "./config.js";

export async function ollama(endpoint: string, body?: unknown): Promise<Response> {
  return fetch(`${config.ollama.base_url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
}
