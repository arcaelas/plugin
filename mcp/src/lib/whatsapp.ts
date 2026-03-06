import { WhatsApp, FileEngine } from "@arcaelas/whatsapp";
import { homedir } from "node:os";
import { basename, resolve } from "node:path";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const SESSIONS_DIR = resolve(homedir(), ".arcaelas", ".sessions", "whatsapp");

// ═══════════════════════════════════════════════════════════════════════
// Accounts
// ═══════════════════════════════════════════════════════════════════════

/**
 * @description
 * Active WhatsApp account state.
 * Estado de una cuenta WhatsApp activa.
 */
export interface Account {
  wa: WhatsApp;
  phone: string;
  data_dir: string;
  status: "connected" | "connecting" | "disconnected";
  synced_at: number;
}

const accounts = new Map<string, Account>();

/**
 * @description
 * Resolves the target account from an optional owner phone.
 * Resuelve la cuenta objetivo a partir de un owner phone opcional.
 */
export function resolve_phone(phone?: string): Account {
  if (phone) {
    const account = accounts.get(phone);
    if (!account) throw new Error(`Account ${phone} not found. Available: ${[...accounts.keys()].join(", ") || "none"}`);
    return account;
  }
  if (accounts.size === 0) throw new Error("No WhatsApp accounts linked.");
  if (accounts.size > 1) throw new Error(`Multiple accounts linked. Specify owner: ${[...accounts.keys()].join(", ")}`);
  return accounts.values().next().value!;
}

/**
 * @description
 * Returns all active accounts.
 * Retorna todas las cuentas activas.
 */
export function list_accounts(): Account[] {
  return [...accounts.values()];
}

/**
 * @description
 * Disconnects and removes an account, deleting its session data.
 * Desconecta y elimina una cuenta, borrando sus datos de sesion.
 */
export async function close_account(phone?: string): Promise<string> {
  const account = resolve_phone(phone);
  try { if (account.wa.socket) await account.wa.socket.logout(); } catch {}
  accounts.delete(account.phone);
  await rm(account.data_dir, { recursive: true, force: true }).catch(() => {});
  try { unlinkSync(resolve(SESSIONS_DIR, `${account.phone}.ref`)); } catch {}
  return account.phone;
}


/**
 * @description
 * Reads a file as Buffer (for sending media).
 * Lee un archivo como Buffer (para enviar media).
 */
export async function read_file(path: string): Promise<Buffer> {
  return readFile(path);
}

// ═══════════════════════════════════════════════════════════════════════
// Pairing
// ═══════════════════════════════════════════════════════════════════════

/**
 * @description
 * Pairing session lifecycle.
 * Ciclo de vida de una sesion de vinculacion.
 */
export interface PairSession {
  phone: string;
  token: string;
  code: string | null;
  status: "pending" | "pairing" | "active" | "connected" | "expired";
  wa: WhatsApp | null;
  pairing_dir: string | null;
  listeners: Set<(event: string, data: unknown) => void>;
  expire_timer: ReturnType<typeof setTimeout> | null;
}

const sessions = new Map<string, PairSession>();

function notify(session: PairSession, event: string, data: unknown): void {
  for (const fn of session.listeners) fn(event, data);
}

function begin_pairing(session: PairSession): void {
  mkdirSync(SESSIONS_DIR, { recursive: true });

  const pairing_dir = resolve(SESSIONS_DIR, `.pairing-${randomUUID().slice(0, 8)}`);
  session.pairing_dir = pairing_dir;
  session.status = "pairing";

  const engine = new FileEngine(pairing_dir);
  const wa = new WhatsApp({ phone: session.phone, engine });
  session.wa = wa;

  wa.event.on("open", () => {
    if (session.wa !== wa) return;
    session.status = "connected";
    if (session.expire_timer) { clearTimeout(session.expire_timer); session.expire_timer = null; }

    writeFileSync(resolve(SESSIONS_DIR, `${session.phone}.ref`), basename(pairing_dir));

    const account: Account = { wa, phone: session.phone, data_dir: pairing_dir, status: "connected", synced_at: Date.now() };
    accounts.set(session.phone, account);
    wa.event.on("close", () => { account.status = "disconnected"; });
    wa.event.on("error", () => { account.status = "disconnected"; accounts.delete(session.phone); });

    notify(session, "connected", { phone: session.phone });
  });

  wa.event.on("error", (err: Error) => {
    if (session.wa !== wa || session.status === "connected") return;
    session.status = "expired";
    if (session.expire_timer) { clearTimeout(session.expire_timer); session.expire_timer = null; }
    notify(session, "expired", { message: err.message });
  });

  wa.pair((code: string | Buffer) => {
    if (typeof code === "string" && session.wa === wa) {
      session.code = code;
      session.status = "active";
      notify(session, "code", { code });

      session.expire_timer = setTimeout(() => {
        if (session.status === "active" && session.wa === wa) {
          session.status = "expired";
          notify(session, "expired", { message: "Pairing code expired." });
        }
      }, 60000);
    }
  }).catch(() => {});
}

/**
 * @description
 * Creates a pending pairing session. Instance is created when SSE connects.
 * Crea una sesion de pairing pendiente. La instancia se crea cuando el SSE conecta.
 */
export function pair(phone: string): { token: string } {
  const digits = phone.replace(/\D/g, "");
  if (!digits) throw new Error("Invalid phone number.");
  if (accounts.has(digits)) throw new Error(`Account ${digits} is already linked.`);
  for (const s of sessions.values()) {
    if (s.phone === digits && s.status !== "expired" && s.status !== "connected") return { token: s.token };
  }
  const token = randomUUID();
  const session: PairSession = {
    phone: digits, token, code: null, status: "pending",
    wa: null, pairing_dir: null, listeners: new Set(), expire_timer: null,
  };
  sessions.set(token, session);
  return { token };
}

/**
 * @description
 * Returns a pairing session by token.
 * Retorna una sesion de pairing por token.
 */
export function get_session(token: string): PairSession | null {
  return sessions.get(token) ?? null;
}

/**
 * @description
 * Subscribes to SSE events. Triggers deferred pairing on first connection.
 * Se suscribe a eventos SSE. Inicia el pairing diferido en la primera conexion.
 */
export function subscribe(token: string, listener: (event: string, data: unknown) => void): () => void {
  const session = sessions.get(token);
  if (!session) throw new Error("Invalid access_token");
  session.listeners.add(listener);

  if (session.status === "pending") begin_pairing(session);

  if (session.code && session.status === "active") listener("code", { code: session.code });
  if (session.status === "connected") listener("connected", { phone: session.phone });
  if (session.status === "expired") listener("expired", { message: "Pairing code expired." });

  return () => { session.listeners.delete(listener); };
}

/**
 * @description
 * Explicit retry from the HTML page. Creates a new instance with isolated temp dir.
 * Reintento explicito desde la pagina HTML. Crea nueva instancia con directorio temporal aislado.
 */
export function retry(token: string): void {
  const session = sessions.get(token);
  if (!session) throw new Error("Invalid access_token");
  if (session.status !== "expired") throw new Error("Session is not expired");

  if (session.pairing_dir) rm(session.pairing_dir, { recursive: true, force: true }).catch(() => {});
  if (session.expire_timer) { clearTimeout(session.expire_timer); session.expire_timer = null; }
  session.wa = null;
  session.code = null;
  session.pairing_dir = null;

  begin_pairing(session);
}

// ═══════════════════════════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════════════════════════

function register_account(phone: string, data_dir: string): void {
  if (accounts.has(phone)) return;
  const engine = new FileEngine(data_dir);
  const wa = new WhatsApp({ phone, engine });
  const account: Account = { wa, phone, data_dir, status: "connecting", synced_at: Date.now() };
  accounts.set(phone, account);
  wa.event.on("open", () => { account.status = "connected"; });
  wa.event.on("close", () => { account.status = "disconnected"; });
  wa.event.on("error", () => { account.status = "disconnected"; accounts.delete(phone); });
  wa.pair(() => {}).catch(() => accounts.delete(phone));
}

/**
 * @description
 * Reconnects sessions from disk and cleans orphaned pairing dirs.
 * Reconecta sesiones del disco y limpia directorios de pairing huerfanos.
 */
export async function boot(): Promise<void> {
  if (!existsSync(SESSIONS_DIR)) return;
  const entries = readdirSync(SESSIONS_DIR, { withFileTypes: true });
  const referenced = new Set<string>();

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".ref")) continue;
    const phone = entry.name.slice(0, -4);
    const dirName = readFileSync(resolve(SESSIONS_DIR, entry.name), "utf-8").trim();
    const dataDir = resolve(SESSIONS_DIR, dirName);
    if (!existsSync(dataDir)) { try { unlinkSync(resolve(SESSIONS_DIR, entry.name)); } catch {} continue; }
    referenced.add(dirName);
    register_account(phone, dataDir);
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (accounts.has(entry.name)) continue;
    register_account(entry.name, resolve(SESSIONS_DIR, entry.name));
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(".pairing-")) continue;
    if (referenced.has(entry.name)) continue;
    rm(resolve(SESSIONS_DIR, entry.name), { recursive: true, force: true }).catch(() => {});
  }
}
