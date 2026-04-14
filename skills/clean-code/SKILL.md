---
name: clean-code
description: >
  Code optimization and clean code conventions. Use this skill whenever writing, reviewing,
  or refactoring code — it covers naming (snake_case, PascalCase), control flow (no early returns,
  explicit blocks), abstractions (only when they encapsulate complete behavior), data structures
  (Map/Set over array hacks), inline vs desglose, component architecture, API patterns, and more.
  Trigger on any code change, review, refactor, optimization request, or when the user asks
  about code style, naming, structure, or best practices.
---

# Clean Code Conventions

These are the user's established coding conventions. They apply to every line of code you write or review. Violations are not style preferences — they are defects. The RAG contains the full, evolving set of preferences; this skill captures the stable core. When in doubt, search the RAG for the specific topic.

## Naming

### `useState` uses `[snake_case, setCamelCase]`

The state variable is written in `snake_case` and the setter in `camelCase` with `set` prefix. Only exception where `camelCase` appears outside of component or hook names — kept for compatibility with the framework API.

```ts
// GOOD
const [is_loading, setIsLoading] = useState(false);
const [error_message, setErrorMessage] = useState<string | null>(null);
const [current_step, setCurrentStep] = useState(1);
const [form_data, setFormData] = useState({ email: "", password: "" });

// BAD
const [isLoading, setIsLoading] = useState(false); // camelCase state
const [IS_LOADING, setIsLoading] = useState(false); // UPPER state
```

### Variables, functions, parameters: `snake_case`

Variables, functions, and parameters are always written in `snake_case`. This replaces the typical `camelCase` convention in JavaScript/TypeScript. Includes booleans with `is_`, `has_`, `can_` prefixes. Exception: React hooks keep `camelCase` (`useButtonState`), only the folder uses `snake_case` (`use_button_state/`).

```ts
// GOOD
const user_name = "Miguel Guevara"
const is_active = true
const has_permission = false
function process_order(order_id: string, is_priority: boolean) {
  const discount_rate = 0.15
}

// BAD
const userName = "Miguel Guevara"               // camelCase
const isActive = true                           // camelCase
function processOrder(orderId: string) { ... }  // camelCase
```

```ts
// GOOD — hooks: function camelCase, folder snake_case
import useButtonState from "./lib/use_button_state";
import useTheme from "@/lib/use_theme";

// BAD — hooks: function snake_case or folder camelCase
import use_button_state from "./lib/useButtonState";
```

### Constants: local is `snake_case`, global exported is `UPPER_SNAKE_CASE`

Only module-level constants that are exported and shared between files use `UPPER_SNAKE_CASE`. These are immutable configuration values, limits, or URLs that don't change during execution. Local constants inside functions or limited scopes are `snake_case` like any other variable.

```ts
// GOOD — global exported → UPPER_SNAKE_CASE
// ./src/lib/config.ts
export const MAX_RETRIES = 3;
export const API_BASE_URL = "https://api.example.com";
export const DEFAULT_TIMEOUT = 30_000;

// ./src/services/http_client.ts
import { API_BASE_URL, DEFAULT_TIMEOUT } from "@/lib/config";

// BAD — global exported in wrong case
export const maxRetries = 3; // camelCase for global exported
export const api_base_url = "..."; // snake_case for global exported
```

```ts
// GOOD — local constants → snake_case
function calculate_shipping(weight: number) {
  const base_rate = 5.99;
  const weight_factor = 0.5;
}

// BAD — UPPER_SNAKE_CASE in local scope
function calculate_shipping(weight: number) {
  const BASE_RATE = 5.99;
  const WEIGHT_FACTOR = 0.5;
}
```

### Classes: `PascalCase` — Methods: `snake_case`

Class names are always written in `PascalCase`. Methods of those classes are written in `snake_case`, not `camelCase`.

```ts
// GOOD
class UserController {
  get_by_id(id: string): User { ... }
  get_all(): User[] { ... }
  create(data: CreateInput): User { ... }
}

// BAD
class userController {                  // camelCase name
  getById(id: string) { ... }          // camelCase method
  getAll() { ... }                     // camelCase method
}
```

### Interfaces and types are `PascalCase`

Interfaces and type aliases are always written in `PascalCase`. Component prop interfaces follow the pattern `{ComponentName}Props`. Fields inside the interface follow `snake_case`.

```ts
// GOOD
interface UserFormProps {
  initial_name: string;
  is_disabled?: boolean;
  on_submit: () => void;
}

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error_message?: string;
}

// BAD
interface userFormProps {
  // camelCase name
  initialName: string; // camelCase field
  isDisabled?: boolean; // camelCase field
  onSubmit: () => void; // camelCase callback
}
```

### Props use `snake_case`, callbacks use `on_{action}`

Component prop fields are written in `snake_case`. Callback props follow the `on_{action}` pattern. The `handle{Action}` pattern and `camelCase` are not used.

```ts
// GOOD
interface SearchBarProps {
  placeholder_text: string;
  is_expanded: boolean;
  max_results: number;
  on_search: (query: string) => void;
  on_clear: () => void;
  on_focus: () => void;
}

// BAD
interface SearchBarProps {
  placeholderText: string; // camelCase
  isExpanded: boolean; // camelCase
  onSearch: (q: string) => void; // camelCase callback
  handleClear: () => void; // handle pattern
}
```

### Global types use `I{Domain}` prefix

Globally shared types across the entire project use the `I` prefix followed by the domain they belong to. This distinguishes them from local or component interfaces. They are defined in centralized type files.

```ts
// GOOD
// ./src/lib/types/global.d.ts
interface IAuth {
  user_id: string
  token: string
  expires_at: number
}

interface IProduct {
  id: string
  name: string
  price: number
}

const auth: IAuth = await get_session()
const response: IHttp<IProduct[]> = await api.get("/products")

// BAD
interface Auth { ... }          // no I prefix, confuses with local
interface ProductType { ... }   // Type suffix instead of I prefix
```

### Enums: `PascalCase` name, `UPPER_SNAKE_CASE` keys

The enum name is written in `PascalCase`. Each key inside the enum uses `UPPER_SNAKE_CASE`. Values can be `snake_case` strings or numbers.

```ts
// GOOD
enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
}

enum Priority {
  P1 = 1,
  P2 = 2,
  P3 = 3,
}

const current_status = TicketStatus.IN_PROGRESS;

// BAD
enum ticketStatus {
  // camelCase name
  open = "open", // lowercase key
  inProgress = "in_progress", // camelCase key
}
```

### Files are always `snake_case`

Every file is named in `snake_case`. This applies to services, utilities, config, tests, and any file that is not a component `index.tsx`. `camelCase` and `PascalCase` are never used for file names.

```
// GOOD
// ./src/
├── lib/
│   ├── http_client.ts
│   ├── format_helpers.ts
│   └── use_theme/
│       └── index.ts
├── services/
│   ├── user_controller.ts
│   └── payment_service.ts

// BAD
├── services/
│   ├── UserController.ts       // PascalCase
│   ├── paymentService.ts       // camelCase
```

### Folders always `snake_case`, except components

Every folder is named in `snake_case`. The only exception is visual component folders, which use `PascalCase` to match the component exported name.

```
// GOOD
// ./src/
├── lib/
│   └── use_theme/               // snake_case — hook
├── services/
│   └── ticket_management/       // snake_case
├── components/
│   ├── Button/                  // PascalCase — visual component
│   └── UserCard/                // PascalCase — visual component

// BAD
├── lib/
│   └── UseTheme/                // PascalCase in hook
├── components/
│   └── user_card/               // snake_case in component
```

### The component file is always `index.tsx`

Inside a component `PascalCase` folder, the main file is always `index.tsx`. It is never named after the component (`Button.tsx`) or in lowercase (`button.tsx`).

```
// GOOD
./src/components/Button/index.tsx        → import Button from "@/components/Button"
./src/components/UserCard/index.tsx      → import UserCard from "@/components/UserCard"

// BAD
./src/components/Button/Button.tsx       → file named after component
./src/components/Button/button.tsx       → lowercase file
./src/components/Button/component.tsx    → generic name
```

## Control flow

### Control flow — explicit blocks mandatory

Explicit blocks with braces are required for all conditions. Early returns are completely forbidden — they are a critical standards violation. Use blocks instead. Negated conditionals are authorized only for idempotency.

```ts
// GOOD — explicit block
if (store.has(key)) {
  return store.get(key);
}

// GOOD — negation for idempotency
if (!store.has(key)) {
  store.set(key, value);
}
const stored = store.get(key)!; // ensures idempotency

// BAD — early return (critical violation)
if (!store.has(key)) return;
return store.get(key);

// BAD — early return with negation
if (user.type !== "premium") return 0;
return amount * 0.15;
```

### Ternaries: only for atomic assignments

One condition, one line, trivially readable. Otherwise use `if/else` or an object map.

```ts
// CORRECT — atomic
const color = status === "active" ? "success" : "default";

// WRONG — nested ternary
const value = a ? (b ? r1 : r2) : c ? r3 : r4;
```

### Object maps over switch

```ts
// CORRECT
const status_color: Record<string, string> = {
  active: "success",
  pending: "warning",
  inactive: "default",
};
const color = status_color[status] ?? "default";

// AVOID — switch with discrete values
switch (status) {
  case "active":
    return "success";
  // ...
}
```

## Abstractions

### Only when they encapsulate complete behavior

An abstraction is only justified if it encapsulates complete behavior, not just presentation. A 4-line component that maps a status to a color is not an abstraction, it's microfragmentation. A component that manages SSE connection, form, synchronization and events is valid: it isolates a complete functional unit with its own state and lifecycle.

```tsx
// GOOD — valid abstraction — encapsulates complete behavior
<WhatsApp
  phone={phone}
  workspace={workspace_id}
  onOpen={() => {}}
  onClose={() => {}}
/>;
// internally: SSE connection, registration form, sync pin,
// connection/disconnection events. Isolated functional unit.

// BAD — abstraction without behavior — presentation only
function StatusChip({ status }: { status: string }) {
  const color = status === "active" ? "success" : "default";
  return <Chip label={status} color={color} />;
}
// 4 lines, single use, no logic. This goes inline where needed.
```

### Compose variants, don't duplicate infrastructure

If a feature can be built on top of another that already exists, compose. Don't maintain parallel infrastructure for variants of the same behavior. `once()` is `listen()` that unsubscribes after the first call. It doesn't need its own `Set`, its own `ref`, or its own cleanup logic.

```ts
// GOOD — once composed over listen
const once = useCallback(
  (cb: Listener): (() => void) => {
    const unsub = listen((event, data) => {
      unsub();
      cb(event, data);
    });
    return unsub;
  },
  [listen],
);

// BAD — once with its own infrastructure
const once_listeners = useRef<Set<Listener>>(new Set());

const once = useCallback((cb: Listener): (() => void) => {
  once_listeners.current.add(cb);
  return () => {
    once_listeners.current.delete(cb);
  };
}, []);

function dispatch(event: string, data: unknown) {
  for (const fn of listeners.current) fn(event, data);
  const pending = [...once_listeners.current];
  once_listeners.current.clear();
  for (const fn of pending) fn(event, data);
}
```

### Private methods: only for encapsulation, not for splitting

Private methods with `_snake_case` prefix are allowed only when they encapsulate internal class state. They are forbidden when used to split a public method's logic into helpers that are only called once. Each public method must be self-contained.

```ts
class PaymentService {
  // GOOD — accesses internal state shared by multiple methods
  private _build_headers(): Record<string, string> {
    return { Authorization: `Bearer ${this._token}` };
  }

  // BAD — only called by charge(), should be inline
  private _validate_amount(amount: number) {
    if (amount <= 0) throw new Error("Invalid");
  }

  charge(amount: number) {
    if (amount <= 0) throw new Error("Invalid"); // inline, self-contained
    const headers = this._build_headers(); // reusable encapsulation
  }
}
```

## Inline vs desglose

### Inline atomic operations

If an operation is atomic and the reader understands what happens without a dedicated line, it goes inline. Increments, simple calculations and direct assignments don't need to be broken into separate steps when context makes them obvious.

```ts
// GOOD — inline — reads at once
timer = setTimeout(connect, Math.min(retries++ * 3_000, MAX_DELAY));

// BAD — break down what reads fine together
const delay = Math.min(retries * 3_000, MAX_DELAY);
retries++;
timer = setTimeout(connect, delay);
```

### Async + immediate call: IIFE

If you define an async function and call it immediately in the same scope, an IIFE eliminates the artificial separation. Declaring then calling are two steps for what is a single intention: execute this logic now.

```ts
// GOOD — IIFE — one intention, one block
useEffect(() => {
  if (!token) return;
  (async function connect() {
    // connection logic
    timer = setTimeout(connect, delay);
  })();
  return () => {
    destroyed = true;
  };
}, []);

// BAD — declare and call separately
useEffect(() => {
  if (!token) return;
  async function connect() {
    // same logic
    timer = setTimeout(connect, delay);
  }
  connect();
  return () => {
    destroyed = true;
  };
}, []);
```

## Data structures

Use the right structure. Don't force arrays with `find()`, `includes()`, or `reduce()` when `Map` and `Set` exist.

```ts
// CORRECT
const orgs = new Map();
for (const role of roles) {
  if (!orgs.has(org.id)) orgs.set(org.id, { ...org });
}

// WRONG — array gymnastics
roles.reduce((acc, role) => {
  let org = acc.find((o) => o.id === id);
  // ...
}, []);
```

`Map` groups without searching. `Set` deduplicates without filtering. `for...of` iterates without accumulating.

## Native APIs over external libraries

Native language and platform APIs are preferred over adding external dependencies. Fewer dependencies = less maintenance and less attack surface.

```ts
// GOOD — native APIs
const id = crypto.randomUUID();
const data = await fetch(url).then((r) => r.json());
const hash = crypto.createHash("sha256").update(text);
const formatted = new Intl.DateTimeFormat("es").format(date);

// BAD — unnecessary library
import { v4 } from "uuid"; // crypto.randomUUID() exists
import moment from "moment"; // Intl.DateTimeFormat exists
import _ from "lodash"; // Array/Object methods exist
```

### Don't reimplement runtime primitives

Don't reimplement functionality the runtime already offers. If you need pub/sub in the browser, `EventTarget` already exists. Don't create manual `Set`s with dispatch functions that iterate and clean. Less code, fewer bugs, and the browser optimizes it better than your implementation.

```ts
// GOOD — native EventTarget
const target = useRef(new EventTarget());
target.current.dispatchEvent(Object.assign(new Event(event), { data: parsed }));

const listen = useCallback((cb: Listener): (() => void) => {
  const handler = (e: Event) =>
    cb(e.type, (e as Event & { data: unknown }).data);
  target.current.addEventListener("message", handler);
  return () => target.current.removeEventListener("message", handler);
}, []);

// BAD — reimplementing pub/sub with Sets
const listeners = useRef<Set<Listener>>(new Set());
const once_listeners = useRef<Set<Listener>>(new Set());

function dispatch(event: string, data: unknown) {
  for (const fn of listeners.current) fn(event, data);
  const pending = [...once_listeners.current];
  once_listeners.current.clear();
  for (const fn of pending) fn(event, data);
}
```

## Proportional complexity

The code must reflect the actual complexity of the problem. If the problem is fetch + render + basic actions, the code should be equally simple.

```tsx
// CORRECT — proportional
function TicketList() {
  const [tickets, set_tickets] = useState([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    api
      .get("/tickets")
      .then(set_tickets)
      .finally(() => set_loading(false));
  }, []);

  return <Table loading={loading} data={tickets} />;
}

// WRONG — unnecessary layers
function TicketList() {
  const { tickets, loading } = useTickets();
  const { sorted } = useTicketSort(tickets);
  const { filtered } = useTicketFilters(sorted, filters);
  const { paginated } = useTicketPagination(filtered);
  return <TicketTable data={paginated} />;
}
```

### Dead state = unnecessary re-renders

If a `useState` value has no consumer in the render, it causes re-renders for nothing. Remove it or convert to `useRef`.

## Component architecture

### React component hierarchy

A component can have its own `components/` and `lib/` at any level of depth. Each level only knows upward (parent, grandparent), never its siblings.

```
// GOOD — each level replicates the same anatomy
// ./src/components/Button/
├── index.tsx
├── lib/
│   └── use_button_state/
│       └── index.ts
└── components/
    └── ButtonIcon/
        ├── index.tsx
        └── lib/
            └── use_icon_size/
                └── index.ts

// BAD — breaking hierarchy with loose files
// ./src/components/Button/
├── index.tsx
├── useButtonState.ts          // loose file, no own folder
├── helpers.ts                 // generic file outside lib/
└── ButtonIcon.tsx             // child component without own folder
```

### Recursive component pattern

Each component at any level can have its own `lib/` and `components/`. The pattern repeats downward without depth limit. A subcomponent inside `components/` follows the exact same anatomy as its parent.

```
// ./src/components/Button/
├── index.tsx
├── lib/
│   └── use_button_state/
│       └── index.ts
└── components/
    └── ButtonIcon/
        ├── index.tsx
        ├── lib/
        │   └── use_icon_size/
        │       └── index.ts
        └── components/
            └── SpinnerDot/
                ├── index.tsx
                └── lib/
                    └── use_dot_pulse/
                        └── index.ts
```

### `components/` vs `lib/`

Within any component the separation between `components/` and `lib/` is decided by a single question: **Does it return JSX?**

- **Yes** → `components/`
- **No** → `lib/`

This includes hooks, constants, helpers, types, configurations — anything that does not emit JSX goes in `lib/`, without exception.

```ts
// GOOD
const ButtonIcon = () => <svg>...</svg>             // components/ → returns JSX
const useButtonState = () => useState(false)         // lib/ → doesn't return JSX
const button_variants = { primary: "bg-blue-500" }   // lib/ → doesn't return JSX

// BAD
const useButtonState = () => useState(false)         // components/ → doesn't return JSX
const ButtonIcon = () => <svg>...</svg>              // lib/ → returns JSX
```

### Import scope — allowed

A component can only import upward: its own `lib/`, its parent's `lib/`, its grandparent's `lib/`, and the root `lib/`. Root-level components (`src/components/`) are accessible from any depth.

```ts
// GOOD — ./src/components/Button/components/ButtonIcon/index.tsx
import useIconSize from "./lib/use_icon_size"; // own
import useButtonState from "../../lib/use_button_state"; // parent
import useTheme from "@/lib/use_theme"; // root
import Input from "@/components/Input"; // root component

// BAD
import { x } from "../ButtonSpinner/lib/x"; // sibling
import { y } from "@/components/Form/lib/y"; // unrelated
```

### Import scope — forbidden

Importing from descendants, siblings, or unrelated branches is forbidden. If two siblings need shared logic, that logic moves up to the common parent's `lib/`.

```ts
// ./src/components/Button/components/ButtonIcon/index.tsx

// GOOD
import { x } from "../../lib/shared_logic"; // common parent

// BAD
import { x } from "../ButtonSpinner/lib/use_spinner"; // sibling
import { x } from "./components/SpinnerDot/lib/x"; // descendant
import { x } from "@/components/Form/lib/x"; // unrelated
```

### Hook location and naming inside `lib/`

Hooks live inside the `lib/` of the component that uses them. A hook is not shared with siblings or parents — it belongs to its component.

Hooks have a **dual convention**: the folder is named in `snake_case` with `use_` prefix (`use_button_state/`), but the exported function is written in `camelCase` (`useButtonState`). Files/folders follow `snake_case`, but framework hooks must start with `use` in `camelCase`.

```
// GOOD
// ./src/components/Terminal/lib/
├── use_terminal/
│   └── index.ts              // export default function useTerminal() {}
└── use_terminal_tabs/
    └── index.ts              // export default function useTerminalTabs() {}

// BAD
├── useTerminal/              // camelCase folder
│   └── index.ts
└── use_terminal/
    └── index.ts              // export function use_terminal() {}  // snake_case function
├── useButtonState.ts         // loose file, no folder
└── hooks.ts                  // multiple hooks in one file
```

### Export order in `index.tsx`

The main component file follows a strict export order. The component (`export default`) is always last. Hooks never appear here — they live in `lib/use_name/`.

Order:

1. Enums
2. Types
3. Interfaces (Props, Config)
4. Constants
5. Utility functions (only if complex)
6. `export default Component` — always last

```tsx
// GOOD
export enum ButtonSize { SM = "sm", MD = "md", LG = "lg" }
export type ButtonVariant = "primary" | "secondary" | "ghost"
export interface ButtonProps { size?: ButtonSize; variant?: ButtonVariant }
export const DEFAULT_SIZE = ButtonSize.MD
export default function Button({ size = DEFAULT_SIZE }: ButtonProps) {
  return <button />
}

// BAD
export default function Button() { ... }    // default first
export enum ButtonSize { ... }              // enum after component
export function useButtonState() { ... }    // hook inside index.tsx
```

### Root-level components and `lib` — global access

Files at the root level (`src/components/` and `src/lib/`) are accessible from any component at any depth. They represent shared, base-level abstractions: utilities, base components, global hooks.

```ts
// GOOD — import from root at any level
// ./src/components/Button/components/ButtonIcon/index.tsx
import useTheme from "@/lib/use_theme";
import useAuth from "@/lib/use_auth";
import Input from "@/components/Input";
```

```
// ./src/
├── lib/
│   ├── use_theme/
│   └── use_auth/
└── components/
    ├── Button/
    ├── Input/
    └── Modal/
```

```ts
// BAD — putting shared logic inside a specific component
// ./src/components/Button/lib/use_theme/  // theme is global, not Button's
```

### `memo()` for components with computed props

`memo()` is used when a component receives props that are constantly recalculated (derived objects, filtered arrays, recreated functions). If props are immutable values or primitives, it is not needed.

```tsx
// GOOD — computed props, memo needed
const filtered_users = users.filter(u => u.is_active)
<UserList items={filtered_users} />  // filtered_users recalculates every render

function UserCard({ user, on_select }: UserCardProps) {
  return <div>{user.name}</div>
}
export default memo(UserCard)

// GOOD — immutable props, memo unnecessary
<StatusBadge label="active" color="green" />  // primitives, don't change

// BAD — memo without reason
const Title = memo(({ text }: { text: string }) => <h1>{text}</h1>)
// text is an immutable string, memo adds nothing
```

## Documentation

### JSDoc mandatory on all functions

JSDoc goes on all functions, methods, and classes, written in both English and Spanish simultaneously. Include descriptive comments, examples when they add clarity, and JSDoc tags (`@param`, `@returns`, `@type`, `@typedef`) as appropriate — not mandatory but desirable. No inline comments inside functions.

```ts
// GOOD
/**
 * Calcula minutos hábiles entre dos fechas excluyendo fines de semana.
 * Calculates business minutes between two dates excluding weekends.
 *
 * @param start - Fecha de inicio / Start date
 * @param minutes - Minutos a agregar / Minutes to add
 * @returns Fecha resultante / Resulting date
 */
function add_business_minutes(start: Date, minutes: number): Date { ... }

// BAD — no JSDoc
function add_business_minutes(start: Date, minutes: number): Date { ... }

// BAD — JSDoc in one language only
/** Calculates business minutes */
function add_business_minutes(start: Date, minutes: number): Date { ... }

// BAD — inline comments instead of JSDoc
function add_business_minutes(start: Date, minutes: number): Date {
  // calculate difference  ← forbidden
}
```

## API patterns

### Standardized API response format

All APIs follow a uniform response format. The client extracts `data` automatically.

```ts
// Successful response — individual object
res.success({ id: "abc-123", name: "Miguel" })
// → { "success": true, "data": { "id": "abc-123", "name": "Miguel" } }

// Successful response — paginated list
res.success({ rows: [...], count: 100, offset: 0, limit: 20, order: "asc" })
// → { "success": true, "data": { "rows": [...], "count": 100, "offset": 0, "limit": 20, "order": "asc" } }

// Error response
res.error("User not found", 404)
// → { "success": false, "message": "User not found" }

// Client
const user = await api.get<User>("/v1/users/abc-123")
// user is already { id: "abc-123", name: "Miguel" } — data extracted automatically

// BAD — responses without standard format
res.json({ id: "abc-123" })          // no success/data wrapper
res.status(404).send("Not found")    // no structure
```

### HTTP client with automatic authentication

Centralized HTTP client that injects token from `localStorage`, automatic redirect to `/login` on 401, extracts `data` from the standard `{ success, data }` response, and supports TypeScript generics.

```ts
// ./src/lib/api/index.ts
import axios from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data?.data,
  (error) => {
    if (error.response?.status === 401) window.location.href = "/login";
    throw new APIError(error);
  },
);

export const api = {
  get: <T>(url: string, config?) => client.get<T>(url, config),
  post: <T>(url: string, body?, config?) => client.post<T>(url, body, config),
  put: <T>(url: string, body?, config?) => client.put<T>(url, body, config),
  patch: <T>(url: string, body?, config?) => client.patch<T>(url, body, config),
  del: (url: string, config?) => client.delete(url, config),
};

export default api;
```

### File-based routing for serverless

In serverless projects (AWS Lambda), file-based routing where each folder = URL segment, dynamic parameters with `[param]`, each `index.ts` exports handlers by HTTP method. Alias `~/*` → `./src/*` in `tsconfig`.

```
src/
├── auth/
│   ├── index.ts              # POST /v1/auth
│   ├── challenge/
│   │   └── index.ts          # POST /v1/auth/challenge
│   └── keys/
│       ├── index.ts          # GET/POST /v1/auth/keys
│       └── [id]/
│           └── index.ts      # DELETE /v1/auth/keys/{id}
├── chat/
│   └── completions/
│       └── index.ts          # POST /v1/chat/completions
└── models/
    ├── index.ts              # GET /v1/models
    └── [id]/
        └── index.ts          # GET/DELETE /v1/models/{id}
```

```ts
// ./src/chat/completions/index.ts
import { http } from '~/app/lib/http'

export const POST = http(async (req, res) => {
  res.success({ choices: [...] })
})
```

### HTTP handlers — serverless vs express

The handler pattern changes depending on the project type:

**Serverless / Next.js** — each file exports constants by HTTP method:

```ts
// ./src/users/index.ts
export const GET = http(async (req, res) => {
  const users = await User.all();
  res.success(users);
});

export const POST = http(async (req, res) => {
  const user = await User.create(req.body);
  res.success(user);
});
```

**Express** — uses `http(pathname, handler)` with the function name as the method:

```ts
http("/users", async function GET(req, res, next) {
  const users = await User.all();
  res.success(users);
});

http("/users", async function POST(req, res, next) {
  const user = await User.create(req.body);
  res.success(user);
});
```

### `controller.ts` — Zod schemas (4 per controller)

Every controller defines 4 Zod schemas to parse I/O at the boundary:

- **`schema.get`** — Parses output (`toJSON` to API). Only validates shape, does not transform.
- **`schema.list`** — Parses pagination input. Includes parent FK + defaults (`offset: 0`, `limit: 100`, `order: "DESC"`).
- **`schema.create`** — Parses creation input. Includes parent FK + defaults that mirror the model's `@Default` + sanitize.
- **`schema.update`** — Parses update input. Includes ID + all fields optional + sanitize.

Key rule: `create` and `update` include FK/ID so that `parsed.data` is self-contained and can be passed directly to Sequelize.

### CRUD methods recycle the `get()` method

In CRUD classes, the `get()` method is the base that validates existence. `update()` and `delete()` reuse `get()` to validate before operating. `create()` delegates directly to the ORM without checking prior existence.

```ts
class ProductService {
  get(id: string): Product {
    const product = db.products.findUnique({ where: { id } });
    if (!product) throw new Error("Not found");
    return product;
  }

  create(data: CreateInput): Product {
    return db.products.create({ data });
  }

  update(id: string, data: UpdateInput): Product {
    this.get(id);
    return db.products.update({ where: { id }, data });
  }

  delete(id: string): void {
    this.get(id);
    db.products.delete({ where: { id } });
  }
}
```

## Framework conventions

If the framework already solves something, don't reimplement it. MUI provides `IconButton`, `startIcon`, `endIcon`, spacing system, color palette and typography. Creating wrapper components that only re-expose what MUI already offers adds a layer without new behavior. Customization is only justified when there is a concrete functional reason that MUI doesn't cover.

```tsx
// GOOD — use what MUI already offers
import EditIcon from '@mui/icons-material/Edit'
import { IconButton, Button, Chip } from '@mui/material'

<IconButton onClick={on_edit}><EditIcon /></IconButton>
<Button startIcon={<EditIcon />}>Edit</Button>
<Chip label={status} color={status === 'active' ? 'success' : 'default'} />

// BAD — wrappers without new behavior
function Icon({ name, ...props }) {
  const icons = { edit: EditIcon, delete: DeleteIcon }
  const Component = icons[name]
  return <Component {...props} />
}
```

## Project structure: Next.js

```
project/
├── app/
│   ├── layout.tsx                # Root: HTML, providers, theme
│   ├── page.tsx                  # /
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404
│   ├── middleware.ts             # Auth, redirects, headers
│   │
│   ├── (dashboard)/              # Route group (not in URL)
│   │   ├── layout.tsx            # Dashboard layout (nav + sidebar)
│   │   ├── page.tsx              # /dashboard
│   │   ├── @drawer/default.tsx   # Parallel route slot
│   │   ├── @sidebar/default.tsx  # Parallel route slot
│   │   ├── tickets/
│   │   │   ├── page.tsx          # /dashboard/tickets
│   │   │   └── [id]/page.tsx     # /dashboard/tickets/123
│   │   └── settings/
│   │       └── page.tsx          # /dashboard/settings
│   │
│   └── api/
│       └── users/
│           ├── route.ts          # GET/POST /api/users
│           └── [id]/route.ts     # GET/PUT/DELETE /api/users/:id
│
├── src/
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Global hooks, utils, api client
│   │   ├── api/index.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── styles/globals.css
│
├── public/                       # Static assets (served at /)
├── next.config.js
├── tsconfig.json
└── .env.local
```

### Route groups and parallel routes

- `(name)/` groups routes without affecting the URL. Use for different layouts on the same URL level.
- `@slot/` creates parallel route slots injected into the parent layout as props.

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
  drawer,
  sidebar,
}: {
  children: React.ReactNode;
  drawer: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex">
      {sidebar}
      <main>{children}</main>
      {drawer}
    </div>
  );
}
```

### API routes

Export named HTTP method handlers from `route.ts`:

```ts
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await User.all();
  return Response.json({ success: true, data: users });
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await User.create(body);
  return Response.json({ success: true, data: user });
}
```

### Client vs Server components

Components are Server by default. Add `'use client'` only when you need hooks, events, or browser APIs. Always check `typeof window !== 'undefined'` before accessing `localStorage`, `window`, or other browser APIs.

### Providers

Client-side providers go in `app/providers.tsx` (or `src/app/providers.tsx`), wrapped in the root layout:

```tsx
"use client";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
```

### Special files

| File            | Purpose                                  |
| --------------- | ---------------------------------------- |
| `layout.tsx`    | Wrapping layout, receives `{ children }` |
| `page.tsx`      | Page content                             |
| `error.tsx`     | Error boundary                           |
| `loading.tsx`   | Suspense fallback                        |
| `not-found.tsx` | 404 page                                 |
| `route.ts`      | API handler (GET, POST, etc.)            |
| `middleware.ts` | Request interceptor                      |

## Project structure: React (non-Next.js)

```
src/
├── components/                # Reusable UI components
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── lib/
│   │   │   └── use_button_state/index.ts
│   │   └── components/
│   │       └── ButtonIcon/index.tsx
│   ├── Input/
│   └── Modal/
│
├── lib/                       # Global hooks, utils, shared logic
│   ├── use_theme/index.ts
│   ├── use_auth/index.ts
│   ├── api/index.ts
│   ├── utils/
│   └── types/
│
└── services/                  # Business logic services
    └── ticket_management/
```

### Component folder anatomy

Every component lives in its own folder with files of defined roles. No extra files (CSS, README, doc.md) are added unless strictly necessary.

```
// GOOD
// ./src/components/Button/
├── index.tsx                // required, export default always last
├── types.d.ts               // optional, only if exports external types
├── lib/                     // optional, hooks and pure logic without markup
└── components/              // optional, visual subcomponents with markup

// BAD
// ./src/components/Button/
├── Button.tsx               // file named after component
├── Button.css               // separate CSS
├── Button.test.tsx          // unsolicited test
└── README.md                // unsolicited documentation
```

### `types.d.ts` — local and non-recursive scope

A `types.d.ts` file only affects the folder where it is placed. It does not propagate to siblings, parents, or children. Each folder that needs its own types has its own `types.d.ts`.

```
// GOOD — each folder with its own types.d.ts
// ./src/components/Button/
├── index.tsx
├── types.d.ts                     // Button types only
└── lib/
    └── use_button_state/
        ├── index.ts
        └── types.d.ts             // hook types only, NOT visible in Button/

// BAD — centralized or shared types.d.ts
// ./src/components/Button/
├── index.tsx
├── types.d.ts                     // Button + ButtonIcon + hooks types = all mixed
└── components/
    └── ButtonIcon/
        └── index.tsx              // imports parent types instead of having its own
```

## Package management

### `yarn` is mandatory for local operations

Every operation inside a local project uses `yarn`. `npm` is never used for local operations under any circumstance.

```bash
# GOOD — yarn for all local operations
yarn                     # install dependencies
yarn add axios           # add dependency
yarn add -D typescript   # add devDependency
yarn remove axios        # remove dependency
yarn dev                 # run script
yarn build
yarn test

# BAD — npm for local operations
npm install axios        # FORBIDDEN
npm run dev              # FORBIDDEN
npm run build            # FORBIDDEN
```

### `npm` only for global installations

`npm` is used exclusively to install CLI tools at the system global level. It is not used to add project dependencies or run local scripts.

```bash
# GOOD — npm only global
npm i -g typescript
npm i -g eslint
npm i -g @arcaelas/mcp

# BAD — yarn for global
yarn global add typescript   # FORBIDDEN
```

### `npx` for running commands without installing

`npx` is used to run tools once without permanent installation. Ideal for formatters, scaffolders, and temporary utilities.

```bash
# GOOD — npx for one-off commands
npx prettier --write .
npx create-next-app
npx eslint .
npx -y @arcaelas/mcp --stdio

# BAD — installing globally something temporary
npm i -g prettier         # unnecessary if only used once
```

### `tsx` for running TypeScript in development

`tsx` runs TypeScript files directly without compilation. Used in development to run servers, migration scripts, and any `.ts` file.

```bash
# GOOD — tsx to run TypeScript directly
tsx src/server.ts
tsx scripts/migrate.ts
tsx scripts/seed.ts
npx tsx bot.ts

# BAD — compile before running in development
npx tsc && node dist/server.js   # unnecessary in development
```

## Git workflow

### Branch names with prefix and issue number

Branches are named with a prefix indicating the type of change followed by the issue number. Valid prefixes are `fix/`, `feat/`, `chore/`, and `docs/`. The issue is mandatory — no work without an issue.

```bash
# GOOD
git checkout -b fix/15
git checkout -b feat/42
git checkout -b chore/8
git checkout -b docs/23

# BAD
git checkout -b fix-login        # no issue number
git checkout -b new-feature      # no prefix or issue
git checkout -b 42               # no prefix
```

### Commits in Spanish with prefixes

Commit messages are written in Spanish with a mandatory prefix. Valid prefixes are `fix:`, `feat:`, `chore:`, and `docs:`.

```bash
# GOOD
git commit -m "fix: corregir validación de email en formulario de registro"
git commit -m "feat: agregar filtro de búsqueda por categoría"
git commit -m "chore: actualizar dependencias de desarrollo"
git commit -m "docs: agregar documentación del endpoint de pagos"

# BAD
git commit -m "fix login bug"                    # English, no format
git commit -m "updated dependencies"             # English, no prefix
git commit -m "corregir bug"                     # no prefix
```

### Branch and push workflow

Two types of projects exist:

- **Type 1**: has `dev`, `main` and `prod` branches
- **Type 2**: only has `main`

The push workflow is the same for both:

1. Know the active branch
2. Create an issue in the project
3. `git checkout -b {prefix}/{ID}` where prefix is `fix/`, `feat/`, `chore/` or `docs/` and ID is the issue number
4. Commit changes in the new branch

The difference is the PR target:

- **Type 1**: PR from new branch to `dev` (flow: issue → dev → main → prod)
- **Type 2**: PR from new branch to `main` (flow: issue → main)

```bash
# Type 1
git checkout dev
git pull origin dev
git checkout -b feat/54      # prefix + issue ID
# ... commits ...
gh pr create --base dev      # PR to dev

# Type 2
git checkout main
git pull origin main
git checkout -b fix/54       # prefix + issue ID
# ... commits ...
gh pr create --base main     # PR to main
```

### Never push directly to main

Pushing directly to `main`, `dev`, or `prod` is forbidden. All changes reach these branches only through a PR. After merge, the local branch is cleaned up.

```bash
# GOOD — flow with PR
git push -u origin fix/15
gh pr create --base main --title "fix: corregir validación"
# → code review → merge → cleanup
git checkout main
git pull origin main
git branch -d fix/15

# BAD — direct push
git checkout main
git push origin main          # FORBIDDEN — no PR
```
