import type { Express } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as ws from "../lib/whatsapp.js";

// ═══════════════════════════════════════════════════════════════════════
// Action schemas — ordered most-specific first for z.union matching
// ═══════════════════════════════════════════════════════════════════════

const O = z.string().optional().describe("Owner account phone (required if >1 account)");

const ReactAction = z.object({ chat: z.string(), message: z.string(), react: z.string(), owner: O });
const DeleteMessageAction = z.object({ chat: z.string(), message: z.string(), delete: z.enum(["all"]), owner: O });
const SendTextAction = z.object({ chat: z.string(), text: z.string(), owner: O });
const SendImageAction = z.object({ chat: z.string(), image: z.string(), owner: O, caption: z.string().optional() });
const SeenAction = z.object({ chat: z.string(), seen: z.literal(true), owner: O });
const ArchiveAction = z.object({ chat: z.string(), archive: z.boolean(), owner: O });
const PinAction = z.object({ chat: z.string(), pin: z.boolean(), owner: O });
const DeleteChatAction = z.object({ chat: z.string(), delete: z.literal(true), owner: O });
const MessagesAction = z.object({ chat: z.string(), messages: z.number().min(1).max(100), owner: O, offset: z.number().min(0).optional() });
const ContactAction = z.object({ contact: z.string(), owner: O });
const PairAction = z.object({ pair: z.string() });
const UnreadAction = z.object({ unread: z.literal(true), owner: O });
const AccountsAction = z.object({ accounts: z.literal(true) });
const CloseAction = z.object({ close: z.literal(true), owner: O });

const Action = z.union([
  ReactAction, DeleteMessageAction,
  SendTextAction, SendImageAction, SeenAction, ArchiveAction, PinAction, DeleteChatAction, MessagesAction,
  ContactAction, PairAction, UnreadAction, AccountsAction, CloseAction,
]);

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

interface ActionResult { ok: boolean; data?: unknown; error?: string }

const CONTENT_TAGS: Record<string, string> = {
  image: "Image", video: "Video", audio: "Audio", location: "Location", poll: "Poll",
};

function format_content(type: string, caption: string): string {
  if (type === "text") return caption;
  return `[<${CONTENT_TAGS[type] || "File"} />]`;
}

// ═══════════════════════════════════════════════════════════════════════
// Action handler
// ═══════════════════════════════════════════════════════════════════════

async function handle(action: Record<string, unknown>): Promise<ActionResult> {
  try {
    if ("pair" in action) {
      const { token } = ws.pair(action.pair as string);
      const port = process.env.PORT || "3100";
      return { ok: true, data: { token, url: `http://localhost:${port}/whatsapp?access_token=${token}` } };
    }

    if ("accounts" in action) {
      const result = [];
      for (const a of ws.list_accounts()) {
        let unread = 0;
        try { unread = (await a.wa.Chat.list(0, 500)).filter((c: { read: boolean }) => !c.read).length; } catch {}
        result.push({ phone: a.phone, status: a.status, synced_at: a.synced_at, unread });
      }
      return { ok: true, data: result };
    }

    if ("close" in action) {
      return { ok: true, data: { phone: await ws.close_account(action.owner as string | undefined), status: "closed" } };
    }

    if ("unread" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const data = (await account.wa.Chat.list(0, 500)).filter((c: any) => !c.read).map((c: any) => ({
        id: c.id, name: c.name, type: c.type, unread: c.raw.unreadCount ?? 0,
      }));
      return { ok: true, data };
    }

    if ("react" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { reacted: await account.wa.Message.react(action.chat as string, action.message as string, action.react as string) } };
    }

    if ("delete" in action && "message" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { deleted: await account.wa.Message.remove(action.chat as string, action.message as string) } };
    }

    if ("text" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const msg = await account.wa.Message.text(action.chat as string, action.text as string);
      if (!msg) return { ok: false, error: "Failed to send message" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("image" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const buffer = await ws.read_file(action.image as string);
      const msg = await account.wa.Message.image(action.chat as string, buffer, action.caption as string | undefined);
      if (!msg) return { ok: false, error: "Failed to send image" };
      return { ok: true, data: { id: msg.id, chat: msg.cid, status: msg.status } };
    }

    if ("seen" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { seen: await account.wa.Chat.seen(action.chat as string) } };
    }

    if ("archive" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { archived: await account.wa.Chat.archive(action.chat as string, action.archive as boolean) } };
    }

    if ("pin" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { pinned: await account.wa.Chat.pin(action.chat as string, action.pin as boolean) } };
    }

    if ("delete" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      return { ok: true, data: { deleted: await account.wa.Chat.remove(action.chat as string) } };
    }

    if ("messages" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const msgs = await account.wa.Message.list(action.chat as string, (action.offset as number | undefined) ?? 0, action.messages as number);
      return { ok: true, data: msgs.map((m: any) => ({
        id: m.id, author: m.me ? "me" : m.author, me: m.me,
        content: format_content(m.type, m.caption), time: m.created_at,
      })) };
    }

    if ("contact" in action) {
      const account = ws.resolve_phone(action.owner as string | undefined);
      const c = await account.wa.Contact.get(action.contact as string);
      if (!c) return { ok: false, error: "Contact not found" };
      return { ok: true, data: { id: c.id, name: c.name, phone: c.phone, photo: c.photo, bio: c.content } };
    }

    return { ok: false, error: "Unknown action shape" };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════════════════

export async function func(app: Express, mcp: McpServer) {
  mcp.registerTool("whatsapp", {
    description: [
      "WhatsApp batch actions. Each object shape determines the operation:",
      "  { pair }                              — Link new phone (returns URL for pairing page)",
      "  { chat, text, owner? }               — Send text message",
      "  { chat, image, owner?, caption? }     — Send image",
      "  { chat, message, react, owner? }      — React to a message",
      "  { chat, message, delete:'all', owner?} — Delete message for everyone",
      "  { chat, seen: true, owner? }          — Mark chat as read",
      "  { chat, archive: bool, owner? }       — Archive/unarchive chat",
      "  { chat, pin: bool, owner? }           — Pin/unpin chat",
      "  { chat, delete: true, owner? }        — Delete chat",
      "  { chat, messages: N, owner?, offset? } — List N messages (non-text shown as [<Image/>] etc.)",
      "  { contact, owner? }                   — Get contact info",
      "  { unread: true, owner? }              — List unread chats",
      "  { accounts: true }                    — List linked accounts",
      "  { close: true, owner? }               — Disconnect and remove account",
      "Returns [{ ok, data?, error? }] in the same order.",
    ].join("\n"),
    inputSchema: z.object({
      actions: z.array(Action).describe("Array of action objects"),
    }),
  }, async (input) => {
    const results: ActionResult[] = [];
    for (const action of input.actions) results.push(await handle(action as Record<string, unknown>));
    return { content: [{ type: "text" as const, text: JSON.stringify(results) }] };
  });

  app.get("/whatsapp", (req, res) => {
    res.redirect(`/whatsapp.html?${new URLSearchParams(req.query as Record<string, string>)}`);
  });

  app.get("/whatsapp/sse", (req, res) => {
    const token = req.query.access_token as string;
    if (!token) { res.status(400).json({ error: "Missing access_token" }); return; }
    const session = ws.get_session(token);
    if (!session) { res.status(404).json({ error: "Invalid access_token" }); return; }

    res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    res.flushHeaders();
    res.write(":ok\n\n");

    const unsubscribe = ws.subscribe(token, (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    });
    req.on("close", unsubscribe);
  });

  app.post("/whatsapp/retry", (req, res) => {
    const token = (req.query.access_token || req.body?.access_token) as string;
    if (!token) { res.status(400).json({ error: "Missing access_token" }); return; }
    try {
      ws.retry(token);
      res.json({ ok: true });
    } catch (err: unknown) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid request" });
    }
  });

  await ws.boot();
}
