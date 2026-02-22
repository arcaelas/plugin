import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFile, readFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config from "../lib/config.js";
import openai from "../lib/openai.js";

export const schema = z.object({
  content: z.string().describe("Text description of how to redesign the image"),
  references: z.array(z.string()).describe("Absolute paths to reference image files"),
});

export function func(server: McpServer) {
  server.registerTool("redraw", {
    description: "Redesign an existing image based on a text prompt and reference images. Returns the file path to the generated image.",
    inputSchema: schema,
  }, async (input) => {
    const images: string[] = [];
    for (const ref of input.references) {
      const buf = await readFile(ref);
      const ext = ref.split(".").pop()?.toLowerCase() || "png";
      const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
      images.push(`data:${mime};base64,${buf.toString("base64")}`);
    }

    const dir = await mkdtemp(join(tmpdir(), "mcp-redraw-"));
    const filename = join(dir, "redraw.png");

    const res = await openai("/images/generations", {
      body: JSON.stringify({
        model: config.openai_model_image,
        prompt: input.content,
        image: images,
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
