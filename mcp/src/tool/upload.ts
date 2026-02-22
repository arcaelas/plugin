import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as rag from "../lib/rag.js";

export const schema = z.object({
  filename: z.string().describe("Absolute path to a JSONL file to import"),
});

export function func(server: McpServer) {
  server.registerTool("upload", {
    description: "Import memories from a JSONL file. Each line must be {content: string, tags?: string[]}. Returns line numbers that failed.",
    inputSchema: schema,
  }, async (input) => {
    const result = await rag.upload({ filename: input.filename });
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  });
}
