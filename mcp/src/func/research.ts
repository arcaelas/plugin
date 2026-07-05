import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pkg from "@arcaelas/agent";
const { Agent, Tool, Rule, ClaudeCode } = pkg;
import { homedir } from "node:os";
import * as rag from "../lib/rag.js";
import config from "../lib/config.js";

function resolveHome(p: string): string {
  return p.startsWith("~") ? p.replace("~", homedir()) : p;
}

export function func(_app: Express, mcp: McpServer) {
  mcp.registerTool("research", {
    description:
      "Deep research in semantic memory. An AI agent searches RAG autonomously " +
      "with varied queries and returns a synthesized summary.",
    inputSchema: z.object({
      search: z.string().describe("What to research in semantic memory"),
      model: z.enum(["haiku", "sonnet", "opus"]).default("sonnet").optional(),
      limit: z.number().min(5).max(100).default(5).optional().describe("Max memories to retrieve per search"),
    }),
  }, async (input) => {
    const p = config.provider(config.research.provider);
    if (!p) throw new Error("No research provider configured");
    const limit = input.limit ?? 5;

    const agent = new Agent({
      name: "researcher",
      description: "Searches semantic memory and synthesizes findings",
      providers: [new ClaudeCode({ model: input.model ?? "sonnet", think: "none", dirname: resolveHome(p.dirname ?? p.base_url ?? "") })],
      rules: [new Rule(
        "You are a research agent with access to semantic memory (RAG). " +
        "Search multiple times using varied phrasing to gather comprehensive information. " +
        "Synthesize findings into a clear, structured summary. " +
        "Output only the summary — no greetings, no filler, no meta-commentary. " +
        "Respond in the same language as the query."
      )],
      tools: [new Tool("rag_search", {
        description: "Search semantic memory. Vary query phrasing for better coverage.",
        parameters: { query: "Semantic search query" },
        func: async (_, args) => {
          const results = await rag.search({ content: args.query, limit });
          if (!results.length) return "No results found.";
          return results.map((r) => r.content).join("\n\n---\n\n");
        },
      })],
    });

    const [messages, ok] = await agent.call(input.search);
    if (!ok) return { content: [{ type: "text" as const, text: "Research could not be completed." }] };

    const last = messages[messages.length - 1].toJSON();
    return { content: [{ type: "text" as const, text: last.content || "No findings." }] };
  });
}
