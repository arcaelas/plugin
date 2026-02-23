import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as rag from "../lib/rag.js";

export const schema = z.object({
  document: z.union([z.string(), z.array(z.string())]).describe("Document ID or array of IDs to delete"),
});

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("destroy", {
    description: "Delete documents from memory by ID. Removes all associated chunks. Accepts a single ID or array of IDs.",
    inputSchema: schema,
  }, async (input) => {
    const result = await rag.destroy({ document: input.document });
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  });
}
