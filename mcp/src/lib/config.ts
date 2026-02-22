import { homedir } from "node:os";
import { resolve } from "node:path";
import Package from '../../package.json';

export default {
  server: {
    name: Package.name,
    version: Package.version,
  },
  data_dir: resolve(homedir(), ".arcaelas", "mcp", "rag"),
  openai_api_key: process.env.OPENAI_API_KEY || "",
  openai_model_image: process.env.OPENAI_MODEL_IMAGE || "dall-e-3",
  openai_model_audio: process.env.OPENAI_MODEL_AUDIO || "gpt-4o-mini-audio",
  openai_base_url: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",

  ollama_base_url: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollama_embedding_model: process.env.OLLAMA_EMBEDDING_MODEL || "mxbai-embed-large",
} as const;
