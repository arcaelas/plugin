import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config from "../lib/config.js";
import { openai } from "../lib/providers.js";

export const schema = z.object({
  content: z.string().describe("Text description of the image to generate"),
});

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("draw", {
    description: "Generate an image from a text prompt using AI. Returns the file path to the generated image.",
    inputSchema: schema,
  }, async (input) => {
    const dir = await mkdtemp(join(tmpdir(), "mcp-draw-"));
    const filename = join(dir, "draw.png");

    const res = await openai("/images/generations", {
      body: JSON.stringify({
        model: config.openai.model.image,
        prompt: input.content,
        n: 1,
        response_format: "b64_json",
      }),
    });

    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

    const data = (await res.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data in response");

    await writeFile(filename, Buffer.from(b64, "base64"));
    return { content: [{ type: "text" as const, text: JSON.stringify({ filename }) }] };
  });
}
