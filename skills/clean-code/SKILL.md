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

### Variables, functions, parameters: `snake_case`

```ts
const user_name = "Miguel"
const is_active = true
function process_order(order_id: string, is_priority: boolean) {}
```

Never `camelCase` for variables or functions. This is a critical violation.

### Classes: `PascalCase` — Methods: `snake_case`

```ts
class UserController {
  get_by_id(id: string): User { ... }
  create(data: CreateInput): User { ... }
}
```

### Interfaces and Types: `PascalCase` — Fields: `snake_case`

```ts
interface UserFormProps {
  initial_name: string
  is_disabled?: boolean
  on_submit: () => void
}

type ButtonVariant = "primary" | "secondary"
```

### Enums: `PascalCase` name, `UPPER_SNAKE_CASE` keys

```ts
enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
}
```

### React Hooks: `camelCase` (exception to the rule)

```ts
import useButtonState from "./lib/use_button_state"
```

The function is `camelCase` (React convention), but the file/folder is `snake_case`.

### Files: `snake_case` — Components: `PascalCase` folders

```
src/lib/http_client.ts
src/services/user_controller.ts
src/components/Button/index.tsx
```

## Control flow

### Explicit blocks always — early returns are PROHIBITED

Every condition uses braces. Early returns are a critical violation — they break the explicit block rule.

```ts
// CORRECT
if (store.has(key)) {
  return store.get(key)
}

// WRONG — early return
if (!store.has(key)) return
return store.get(key)
```

Negations are allowed only for idempotency:

```ts
if (!store.has(key)) {
  store.set(key, value)
}
const stored = store.get(key)!
```

### Ternaries: only for atomic assignments

One condition, one line, trivially readable. Otherwise use `if/else` or an object map.

```ts
// CORRECT — atomic
const color = status === "active" ? "success" : "default"

// WRONG — nested ternary
const value = a ? (b ? r1 : r2) : (c ? r3 : r4)
```

### Object maps over switch

```ts
// CORRECT
const status_color: Record<string, string> = {
  active: "success",
  pending: "warning",
  inactive: "default",
}
const color = status_color[status] ?? "default"

// AVOID — switch with discrete values
switch (status) {
  case "active": return "success"
  // ...
}
```

## Abstractions

### Only when they encapsulate complete behavior

A 4-line component with no logic is microfragmentation, not abstraction. An abstraction must encapsulate a full functional unit: state, events, lifecycle.

```tsx
// CORRECT — encapsulates SSE, form, sync, events
<WhatsApp phone={phone} workspace={workspace_id} />

// WRONG — trivial presentation, inline it
function StatusChip({ status }: { status: string }) {
  const color = status === "active" ? "success" : "default"
  return <Chip label={status} color={color} />
}
```

### Private methods: only for shared encapsulation

If it's called once, inline it. Private methods exist to encapsulate shared internal state, not to fragment logic.

```ts
// CORRECT — shares internal state across methods
private _build_headers(): Record<string, string> {
  return { Authorization: `Bearer ${this._token}` }
}

// WRONG — called once, should be inline
private _validate_amount(amount: number) {
  if (amount <= 0) throw new Error("Invalid")
}
```

## Inline vs desglose

If an operation is atomic and the reader understands it without a dedicated line, it goes inline.

```ts
// CORRECT — reads as one unit
timer = setTimeout(connect, Math.min(retries++ * 3_000, MAX_DELAY))

// WRONG — unnecessary decomposition
const delay = Math.min(retries * 3_000, MAX_DELAY)
retries++
timer = setTimeout(connect, delay)
```

### Async + immediate call: IIFE

```ts
// CORRECT
useEffect(() => {
  if (!token) return
  (async function connect() {
    // logic
    timer = setTimeout(connect, delay)
  })()
  return () => { destroyed = true }
}, [])

// WRONG — declare and call separately
async function connect() { ... }
connect()
```

## Data structures

Use the right structure. Don't force arrays with `find()`, `includes()`, or `reduce()` when `Map` and `Set` exist.

```ts
// CORRECT
const orgs = new Map()
for (const role of roles) {
  if (!orgs.has(org.id)) orgs.set(org.id, { ...org })
}

// WRONG — array gymnastics
roles.reduce((acc, role) => {
  let org = acc.find(o => o.id === id)
  // ...
}, [])
```

`Map` groups without searching. `Set` deduplicates without filtering. `for...of` iterates without accumulating.

## Native APIs over libraries

Use native APIs before adding dependencies.

```ts
// CORRECT
const id = crypto.randomUUID()
const data = await fetch(url).then(r => r.json())
const formatted = new Intl.DateTimeFormat("es").format(date)

// WRONG
import { v4 } from "uuid"
import moment from "moment"
```

## Proportional complexity

The code must reflect the actual complexity of the problem. If the problem is fetch + render + basic actions, the code should be equally simple.

```tsx
// CORRECT — proportional
function TicketList() {
  const [tickets, set_tickets] = useState([])
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    api.get("/tickets").then(set_tickets).finally(() => set_loading(false))
  }, [])

  return <Table loading={loading} data={tickets} />
}

// WRONG — unnecessary layers
function TicketList() {
  const { tickets, loading } = useTickets()
  const { sorted } = useTicketSort(tickets)
  const { filtered } = useTicketFilters(sorted, filters)
  const { paginated } = useTicketPagination(filtered)
  return <TicketTable data={paginated} />
}
```

### Dead state = unnecessary re-renders

If a `useState` value has no consumer in the render, it causes re-renders for nothing. Remove it or convert to `useRef`.

## Component architecture

### Recursive pattern

Each component has its own `lib/` and `components/`:

```
src/components/Button/
├── index.tsx
├── lib/
│   └── use_button_state/
│       └── index.ts
└── components/
    └── ButtonIcon/
        └── index.tsx
```

### `components/` vs `lib/`

Does it return JSX? `components/`. Everything else: `lib/`.

### Import scope

A component can only import upward — from its own `lib/`, parent `lib/`, root `lib/`, or root `components/`. Never from siblings or descendants.

```ts
// CORRECT
import useIconSize from "./lib/use_icon_size"
import useButtonState from "../../lib/use_button_state"
import useTheme from "@/lib/use_theme"

// WRONG — sibling import
import { x } from "../ButtonSpinner/lib/use_spinner"
```

### Export order

1. Enums
2. Types
3. Interfaces (Props, Config)
4. Constants
5. Utility functions (only if complex)
6. `export default Component` (always last)

## API patterns

### Standardized responses

```ts
// Success
res.success({ id: "abc-123", name: "Miguel" })
// → { success: true, data: { ... } }

// Error
res.error("Not found", 404)
// → { success: false, message: "Not found" }
```

### CRUD methods reuse `get()` for validation

```ts
class ProductService {
  get(id: string): Product {
    const product = db.products.findUnique({ where: { id } })
    if (!product) throw new Error("Not found")
    return product
  }

  update(id: string, data: UpdateInput): Product {
    this.get(id) // reuses validation
    return db.products.update({ where: { id }, data })
  }
}
```

## Framework conventions

Use what the framework provides. If Next.js has `@drawer`, MUI has `IconButton`, use them. Don't reimplement solved patterns.

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
  children: React.ReactNode
  drawer: React.ReactNode
  sidebar: React.ReactNode
}) {
  return (
    <div className="flex">
      {sidebar}
      <main>{children}</main>
      {drawer}
    </div>
  )
}
```

### API routes

Export named HTTP method handlers from `route.ts`:

```ts
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await User.all()
  return Response.json({ success: true, data: users })
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await User.create(body)
  return Response.json({ success: true, data: user })
}
```

### Client vs Server components

Components are Server by default. Add `'use client'` only when you need hooks, events, or browser APIs. Always check `typeof window !== 'undefined'` before accessing `localStorage`, `window`, or other browser APIs.

### Providers

Client-side providers go in `app/providers.tsx` (or `src/app/providers.tsx`), wrapped in the root layout:

```tsx
'use client'
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}
```

### Special files

| File | Purpose |
|------|---------|
| `layout.tsx` | Wrapping layout, receives `{ children }` |
| `page.tsx` | Page content |
| `error.tsx` | Error boundary |
| `loading.tsx` | Suspense fallback |
| `not-found.tsx` | 404 page |
| `route.ts` | API handler (GET, POST, etc.) |
| `middleware.ts` | Request interceptor |

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

### Component anatomy

Every component lives in its own folder. Entry point is always `index.tsx`. `export default` always at the end.

```
src/components/Button/
├── index.tsx               # Required — export default at the end
├── types.d.ts              # Optional — only if exporting types
├── lib/                    # Optional — hooks and pure logic (no JSX)
│   └── use_button_state/
│       └── index.ts
└── components/             # Optional — subcomponents (JSX)
    └── ButtonIcon/
        ├── index.tsx
        └── lib/
            └── use_icon_size/
                └── index.ts
```

Never: `Button.tsx` as filename, loose files like `helpers.ts`, CSS files inside the folder, tests unless requested.

### `types.d.ts` is local

Each folder that needs types has its own `types.d.ts`. Types don't propagate — a hook's types are isolated from the parent component's types.

## Git workflow

### No work without an issue

Every change starts with a GitHub issue. No commits, no branches, no PRs without an issue number.

### Branches: `prefix/issue-number`

Valid prefixes: `fix/`, `feat/`, `chore/`, `docs/`. The issue number is mandatory.

```bash
# CORRECT
git checkout -b fix/15
git checkout -b feat/42

# WRONG
git checkout -b fix-login        # no issue number
git checkout -b new-feature      # no prefix or issue
```

### Commits: Spanish with prefix

Messages in Spanish. Prefix is mandatory: `fix:`, `feat:`, `chore:`, `docs:`.

```bash
# CORRECT
git commit -m "fix: corregir validación de email en formulario de registro"
git commit -m "feat: agregar filtro de búsqueda por categoría"
git commit -m "chore: actualizar dependencias de desarrollo"

# WRONG
git commit -m "fix login bug"           # English
git commit -m "corregir bug"            # no prefix
```

### Push and PR flow

Direct push to `main`, `dev`, or `prod` is forbidden. All changes arrive through a PR.

Two project types:
- **Type 1** (dev + main + prod): PR targets `dev`. Flow: issue -> dev -> main -> prod.
- **Type 2** (main only): PR targets `main`. Flow: issue -> main.

```bash
# 1. Sync with target branch
git checkout main
git pull origin main

# 2. Create branch from issue
git checkout -b feat/54

# 3. Commit changes
git commit -m "feat: agregar filtro de búsqueda"

# 4. Push and create PR
git push -u origin feat/54
gh pr create --base main --title "feat: agregar filtro de búsqueda"

# 5. After merge — cleanup
git checkout main
git pull origin main
git branch -d feat/54
```
