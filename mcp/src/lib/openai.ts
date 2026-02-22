import config from "./config.js";

export default async function openai(
  endpoint: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  return fetch(`${config.openai_base_url}${endpoint}`, {
    method: options.method || "POST",
    headers: {
      Authorization: `Bearer ${config.openai_api_key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body,
  });
}
