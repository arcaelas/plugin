---
name: clean-code
description: >
  Code optimization and clean code conventions. Use this skill whenever writing, reviewing,
  or refactoring code — it covers folder structure (Next.js, React, Flutter), file/component
  hierarchy (lib/ and components/), naming, conditionals, comments, abstractions, async
  patterns, data structures, API patterns, package management, and git workflow.
  Trigger on any code change, review, refactor, optimization request, or when the user
  asks about code style, naming, structure, or best practices.
---

# Clean Code Conventions

These are the user's established coding conventions. They apply to every line of code you write or review. Violations are not style preferences — they are defects. The RAG contains the full evolving set of preferences; this skill captures the stable core. When in doubt, search the RAG.

---

## 1. Project structure

### Next.js

```
project/
├── app/
│   ├── layout.tsx                 # Root: HTML, providers, theme
│   ├── page.tsx                   # /
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # 404
│   ├── middleware.ts              # Auth, redirects, headers
│   ├── (dashboard)/               # Route group (not in URL)
│   │   ├── layout.tsx
│   │   ├── page.tsx               # /dashboard
│   │   ├── @drawer/default.tsx    # Parallel route slot
│   │   ├── @sidebar/default.tsx   # Parallel route slot
│   │   ├── tickets/
│   │   │   ├── page.tsx           # /dashboard/tickets
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       └── users/
│           ├── route.ts           # GET/POST /api/users
│           └── [id]/route.ts
├── src/
│   ├── components/                # Reusable UI components
│   ├── lib/                       # Global hooks, utils, api client
│   │   ├── api/index.ts
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── styles/globals.css
├── public/
├── next.config.js
├── tsconfig.json
└── .env.local
```

- **Route groups `(name)/`** organize routes without affecting URL.
- **Parallel routes `@slot/`** inject components into the parent layout as props. Use `@drawer`, `@sidebar`, `@modal` instead of building custom drawer/sidebar components when the framework provides the slot natively.
- **API routes** export named HTTP method handlers from `route.ts` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Never use Express-style `router.get(...)` patterns inside Next.js.
- **Server vs Client components.** Components are Server by default. Add `'use client'` only when hooks, events, or browser APIs are needed.
- **Browser API access** must be guarded with `typeof window !== 'undefined'` inside event handlers and effects. For render-time conditional output that depends on browser state, use the `mounted` pattern (see §6).
- **Providers** live in `app/providers.tsx` (Client Component), wrapped in the root layout.

### React (non-Next.js)

```
src/
├── components/
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── lib/
│   │   │   └── use_button_state/index.ts
│   │   └── components/
│   │       └── ButtonIcon/index.tsx
│   ├── Input/
│   └── Modal/
├── lib/
│   ├── use_theme/index.ts
│   ├── use_auth/index.ts
│   ├── api/index.ts
│   ├── utils/
│   └── types/
└── services/
    └── ticket_management/
```

### Flutter

```
lib/
├── main.dart
├── assets/                  # icons, sounds, static resources
├── lib/                     # global libs (shared across views)
│   └── {module}/main.dart
├── widget/                  # global widgets (shared across views)
│   └── {widget}/main.dart
└── view/
    └── {view}/
        ├── main.dart
        ├── lib/{module}/main.dart
        └── widget/{widget}/
            ├── main.dart
            ├── lib/{module}/main.dart
            └── widget/{child}/main.dart
```

- **Encapsulation by context.** What is used inside a single view lives inside that view. Only what is shared across views moves up to global. The pattern repeats recursively at every depth.
- **Forbidden root folders:** `models/`, `utils/`, `helpers/`, `constants/`, `providers/`. Generic dump folders fragment context — content lives next to where it is used.
- **FlutterWind for styling.** Use `.className('...')` with Tailwind classes. Do not use `TextStyle(...)`, `BoxDecoration(...)`, or other manual style props if a FlutterWind equivalent exists.
- **Naming:** files and folders `snake_case`; main file of every module/widget/view is always `main.dart`; class names `PascalCase` (Dart convention).
- **Run commands:** `flutter run --hot` (no `&`, no `nohup`). Manual hot reload: `kill -SIGUSR2 $(pgrep -f "flutter_tools.snapshot run")`.

---

## 2. Component hierarchy (`lib/` and `components/`)

### `components/` vs `lib/` — single decision question

Does it return JSX? **Yes** → `components/`. **No** → `lib/`. This includes hooks, constants, helpers, types, configurations — anything that does not emit JSX goes in `lib/`, no exceptions.

### Recursive component pattern

A component at any level can have its own `lib/` and `components/`. The pattern repeats downward without depth limit. A subcomponent inside `components/` follows the exact same anatomy as its parent.

### Hierarchy direction — only upward

Each level only knows upward (parent, grandparent, root), never its siblings. Loose files (`useButtonState.ts`, `helpers.ts`, flat `ButtonIcon.tsx`) at the component root break the hierarchy.

### Component folder anatomy

```
src/components/Button/
├── index.tsx                # required, export default always last
├── types.d.ts               # optional, only if exports external types
├── lib/                     # optional, hooks and pure logic without markup
└── components/              # optional, visual subcomponents with markup
```

No extra files (CSS, README, doc.md, tests, stories) unless strictly necessary or explicitly requested.

### Import scope

A component imports only upward: own `lib/`, parent's `lib/`, grandparent's `lib/`, root `lib/`, root `components/`. Importing from descendants, siblings, or unrelated branches is forbidden. If two siblings need shared logic, that logic moves up to the common parent's `lib/`.

### Hooks inside `lib/`

Each hook lives in its own subfolder under `lib/` with `snake_case` and `use_` prefix (`use_button_state/`). The exported function uses `camelCase` (`useButtonState`) with `export default`. Dual convention: folder `snake_case`, function `camelCase` — this is the only place where `camelCase` appears outside React's own naming.

### Root-level components and `lib` are global

Files at `src/components/` and `src/lib/` are accessible from any depth. Reserve them for shared, base-level abstractions (theme hook, auth hook, base components, http client). Do not put global logic inside a specific component's `lib/`.

### `types.d.ts` is local and non-recursive

A `types.d.ts` only affects the folder where it is placed. It does not propagate to siblings, parents, or children. Each folder that needs its own types has its own `types.d.ts`.

### Export order in `index.tsx`

The component file (`export default`) is the last export. Hooks never appear here — they live in their own `lib/use_name/`. Order:

1. Enums
2. Types
3. Interfaces (Props, Config)
4. Constants
5. Utility functions (only if complex)
6. `export default Component`

---

## 3. Naming

- **Variables, functions, parameters:** `snake_case` always. Booleans use `is_`, `has_`, `can_` prefixes. The only `camelCase` exceptions are React hooks (`useButtonState`) and the `useState` setter pair (`[snake_case, setCamelCase]`).
- **Classes:** `PascalCase`. **Methods:** `snake_case`.
- **Interfaces and types:** `PascalCase`. Component prop interfaces follow `{ComponentName}Props`. Fields inside use `snake_case`.
- **Global shared types:** `I{Domain}` prefix (`IAuth`, `IProduct`). Defined in centralized type files (`src/lib/types/`).
- **Props in components:** `snake_case` fields. Callbacks use the `on_{action}` pattern (`on_search`, `on_clear`). The `handle{Action}` pattern is forbidden.
- **Enums:** `PascalCase` name, `UPPER_SNAKE_CASE` keys. Values can be `snake_case` strings or numbers.
- **Constants:** local `snake_case` (inside functions, limited scopes); only **module-level exported** constants use `UPPER_SNAKE_CASE` (configuration, limits, URLs).
- **Files:** `snake_case` always. Applies to services, utilities, config, tests. The component file is always `index.tsx` (never `Button.tsx` or `button.tsx`).
- **Folders:** `snake_case` always, except visual component folders which use `PascalCase` to match the exported component name (`Button/`, `UserCard/`).

---

## 4. Control flow

### Early returns are an absolute violation

This is not a style preference — it is a hard prohibition. Early returns waste the user's time and force corrections. Every condition uses braces. Every branch is **explicit and affirmative**. No exceptions, no shortcuts, no "just one line."

### `throw` as fallback, never as leading negation

Errors are thrown as the **terminal fallback** of a function — after the affirmative success block. Lead with the affirmative path; the throw sits at the end as the implicit "else". Do not lead a function with `if (!x) throw ...` — that is an early-return in disguise.

### Optional chaining + explicit `if` validation

`?.` is allowed for navigating possibly-null structures. After extracting the value, validate it with an **explicit affirmative `if`-block** and act inside it. Do not silently shortcut, do not lead with `if (!result) return`.

### Disguised early-returns — also forbidden as leading guards

These syntactic variants are early-returns when used as the first executable line: `if (!x) return null`, `if (!x) throw ...`, `x || throw ...`, `return !x ? null : x.value`. The same constructs are **acceptable as terminal fallbacks** at the end of a function (e.g., `return user?.email ?? DEFAULT`).

### Negations only for idempotency

`!cond` is authorized **only** to guarantee idempotency — ensuring something is done once. Outside that case, prefer affirmative conditions.

### Ternaries — atomic only

One condition, one line, trivially readable. Otherwise use `if/else` or an object map. No nested ternaries.

### Object maps over `switch`

Replace `switch` and long `if/else` chains for value dispatch with a `Record` object map. Use `Map` when keys are dynamic.

---

## 5. Comments

### JSDoc mandatory on all functions, methods, and classes

Bilingual: written in English **and** Spanish simultaneously in the same block. Tags (`@param`, `@returns`, `@type`, `@typedef`) are desirable but not mandatory. Examples allowed when they add clarity.

### Inline comments inside function bodies — absolutely forbidden

No comments inside the body of any function. If something needs explanation, that explanation belongs in the function's JSDoc — not as a `// comment` between statements. Variables, function names, and structure must carry meaning on their own.

### `console.log` and debug statements — absolutely forbidden in committed code

No `console.log`, `console.debug`, `print()`, `debugger`, or any debug/trace statement in committed code. Use them locally during development, then remove before committing. For real logging needs, use a proper logger (Pino, Winston, etc.).

---

## 6. Abstractions and helpers

### Don't extract trivial operations into helpers

The user actively hates trivial helper functions. A `replace`, `match`, 2-line validation, `.toLowerCase().trim()`, `string.split(',')`, single ternary — these go **inline at the point of use**. Wrapping them in `formatX`, `validateY`, `parseZ` adds a layer with no behavior, no state, no reuse — just indirection.

The test for "is this helper justified?":

- Is the operation **non-obvious** at the call site?
- Is it **used in 3+ places** with the **same exact shape**?
- Does it **encapsulate state, side effects, or orchestration**?

If all three answers are "no", the operation goes inline. Do not invent helpers preemptively "in case we need it later."

### Abstractions justified only when they encapsulate complete behavior

A 4-line component that maps a status to a color is microfragmentation, not abstraction. A component that manages SSE connection, form, sync, and events is valid: it isolates a complete functional unit with its own state and lifecycle.

### Compose variants, don't duplicate infrastructure

If a feature can be built on top of another, compose it. `once()` is `listen()` that unsubscribes after the first call — it doesn't need its own `Set`, `ref`, or cleanup logic.

### Private methods only for shared encapsulation

Private methods (`_snake_case`) are allowed only when they encapsulate internal state shared by multiple public methods. If a private method is only called once, inline it.

---

## 7. Inline vs breakdown

### Inline atomic operations

If an operation is atomic and the reader understands it without a dedicated line, it goes inline. Increments, simple calculations, and direct assignments don't need to be broken into separate steps when context makes them obvious.

### Async + immediate call → IIFE

If you define an async function and call it immediately in the same scope, an IIFE eliminates the artificial separation. Two steps for one intention is wrong.

---

## 8. Async patterns and cleanup

### Race condition guard with `destroyed` flag

When an effect launches async operations that may keep running after unmount (fetch with retry, WebSocket reconnect, recursive setTimeout), use a mutable flag in the closure. The cleanup sets `destroyed = true` and clears any pending timer; the async function checks `destroyed` before continuing.

### Event listener cleanup

Every `addEventListener` requires a matching `removeEventListener` in the cleanup, with the **same function reference**. Same rule applies to `setInterval`/`setTimeout` (clear with returned id), observers (`.disconnect()`), `AbortController` (`.abort()`).

### SSR hydration with `mounted` state

When a client component depends on browser-only APIs (`window`, `localStorage`, `document`) for **render output**, render `null` on the server pass to avoid hydration mismatch:

```ts
const [mounted, set_mounted] = useState(false)
useEffect(() => set_mounted(true), [])
if (!mounted) return null
```

For data access inside event handlers or effects (not render), `typeof window !== 'undefined'` is sufficient.

---

## 9. Data structures

Use the right structure. Don't force arrays with `find()`, `includes()`, or `reduce()` when `Map` and `Set` exist. `Map` groups without searching. `Set` deduplicates without filtering. `for...of` iterates without accumulating.

---

## 10. Native APIs over external libraries

Native language and platform APIs are preferred over adding external dependencies. `crypto.randomUUID()` over `uuid`. `Intl.DateTimeFormat` over `moment`. Native Array/Object methods over `lodash`.

### Don't reimplement runtime primitives

If you need pub/sub in the browser, `EventTarget` already exists. Don't create manual `Set`s with dispatch functions that iterate and clean. Less code, fewer bugs, and the runtime optimizes it better.

---

## 11. Proportional complexity

The code must reflect the actual complexity of the problem. If the problem is fetch + render + basic actions, the code should be equally simple — no `useTickets() → useTicketSort() → useTicketFilters() → useTicketPagination()` chain when one `useEffect` would do.

### Dead state = unnecessary re-renders

If a `useState` value has no consumer in the render, it causes re-renders for nothing. Remove it or convert to `useRef`.

### Consistency across equivalent views

Views that solve the same problem (fetch + list + actions) follow the same composition pattern. Don't mix infinite scroll on one and manual pagination on another. Don't use a custom `useTickets()` hook in one screen and direct `fetch` in another. Loading, empty, and error state structures are identical across the family.

### `memo()` only for components with computed props

`memo()` is used when a component receives props that are constantly recalculated (derived objects, filtered arrays, recreated functions). If props are immutable values or primitives, it is not needed.

---

## 12. API patterns

### Standardized response format

All APIs follow `{ success: true, data: ... }` for success, `{ success: false, message: ... }` for errors. Paginated lists use `{ rows, count, offset, limit, order }` inside `data`. The HTTP client extracts `data` automatically — consumers receive the unwrapped payload.

### HTTP client with automatic authentication

Centralized in `src/lib/api/index.ts`. Axios with interceptors that inject token from `localStorage`, redirect to `/login` on 401, extract `data` from the standard response, and support TypeScript generics.

### File-based routing for serverless

In serverless projects (AWS Lambda, Next.js), each folder is a URL segment. Dynamic params with `[param]`. Each `index.ts` / `route.ts` exports HTTP method handlers as constants.

### HTTP handler pattern

- **Serverless / Next.js:** export `GET`, `POST`, etc. as constants from each file.
- **Express:** `http(pathname, handler)` with the function name as the method.

### `controller.ts` Zod schemas

Every controller defines 4 Zod schemas:

- `schema.get` — output (toJSON to API). Validates shape only.
- `schema.list` — pagination input + parent FK + defaults (`offset: 0`, `limit: 100`, `order: "DESC"`).
- `schema.create` — creation input + parent FK + model defaults + sanitize.
- `schema.update` — ID + all fields optional + sanitize.

`create` and `update` include FK/ID so `parsed.data` is self-contained and can pass directly to Sequelize.

### CRUD methods recycle `get()`

In CRUD classes, `get()` validates existence using affirmative explicit blocks (throw as fallback at the end). `update()` and `delete()` reuse `get()` for validation. `create()` delegates directly to the ORM.

---

## 13. Framework conventions

If the framework already solves something, don't reimplement it. MUI provides `IconButton`, `startIcon`, `endIcon`, spacing, color palette, typography. Wrapper components that only re-expose what the framework offers add a layer with no new behavior. Customization is justified only when there is a concrete functional reason the framework doesn't cover.

---

## 14. Package management

- **`yarn`** is mandatory for local operations. `npm install`, `npm run` are forbidden in projects.
- **`npm`** only for global CLI installs (`npm i -g typescript`). Never `yarn global add`.
- **`npx -y`** for one-off CLI tools (`npx prettier --write .`, `npx create-next-app`). Don't install globally what is used once.
- **`tsx`** runs TypeScript files directly in development (`tsx src/server.ts`, `npx tsx scripts/migrate.ts`). Don't compile with `tsc && node dist/...` in dev.

---

## 15. Git workflow

### Branch names

Format: `{prefix}/{issue-id}`. Valid prefixes: `fix/`, `feat/`, `chore/`, `docs/`. The issue number is mandatory — no work without an issue.

### Commits in Spanish with prefixes

Commit messages are written in Spanish. The prefix is mandatory: `fix:`, `feat:`, `chore:`, `docs:`. Example: `feat: agregar filtro de búsqueda por categoría`.

### Branch and push workflow

Two project types:

- **Type 1** (has `dev`, `main`, `prod`): PR target is `dev`. Flow: issue → dev → main → prod.
- **Type 2** (only `main`): PR target is `main`. Flow: issue → main.

Workflow for both:

1. Sync with target branch (`git checkout {target} && git pull origin {target}`).
2. Create branch from issue (`git checkout -b feat/54`).
3. Commit.
4. Push and create PR (`git push -u origin feat/54 && gh pr create --base {target}`).
5. After merge, clean up local branch.

### Never push directly to `main`, `dev`, or `prod`

Direct push is forbidden. All changes reach these branches only through a PR. After merge, the local branch is cleaned up.

---

## 16. Agent behavior while writing code

### Silence over chatter — summary at the end

The user does not want running commentary. No "I'm now creating the file...", no narrating each step. Work silently. When the task is done, deliver a single concise summary in 1-3 short paragraphs or a bullet list. No filler, no apologies, no justifications unless the user asks.

If something blocks progress mid-task and requires user input, surface it with `AskUserQuestion` — do not narrate the obstacle in prose.

### Ask when ambiguous, do not assume

When the instruction is clear, act. When there is real ambiguity (scope, target file, technology choice, intended behavior), stop and ask with `AskUserQuestion`. The user prefers a question over an assumption that has to be undone.

Threshold: if a wrong assumption would force the user to correct or rollback your work, ask first. Do not ask for confirmation on trivially safe choices — that wastes time too.
