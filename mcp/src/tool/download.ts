import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as rag from "../lib/rag.js";

export const schema = z.object({
  filename: z.string().describe("Absolute path for the JSONL export file"),
});

export function func(server: McpServer) {
  server.registerTool("download", {
    description: "Export the entire knowledge base to a JSONL file. Each line is {content: string, tags: string[]}. Returns line numbers that failed.",
    inputSchema: schema,
  }, async (input) => {
    const result = await rag.download({ filename: input.filename });
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  });
}
