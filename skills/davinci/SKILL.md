---
name: davinci
description: >
  Da Vinci is the UI/UX design skill. Use it whenever the task involves building, modifying,
  styling, or redesigning interfaces — pages, components, dashboards, landing pages, layouts,
  responsive behavior, interaction states, motion, or any visual structure. Triggers on
  "diseño", "design", "UI", "UX", "layout", "responsive", "componente", "rediseño",
  "estilos", "Tailwind", "shadcn". Da Vinci does not write color palettes or accessibility
  labels — it enforces structural and architectural decisions: which primitives to use,
  how to compose layouts, how to handle space, overflow, state, motion, and density.
---

# Da Vinci — UI/UX Conventions

These rules govern every visual decision in the project. They are not preferences — they are the contract for any interface you build, modify, or review. Violations are defects. The RAG holds the live, evolving set of preferences; this skill captures the stable core. When in doubt, search the RAG.

---

## 1. No custom CSS files

Custom `.css` files are forbidden. The only `.css` allowed in the project are the ones shipped by Tailwind and shadcn (their base/reset/layer files). Those framework files **must not be modified** — they are vendor standard. If a style is needed, it must be expressed through Tailwind utility classes, never through a new stylesheet.

This rule has no exceptions for "small overrides", "global resets", or "just one variable". If Tailwind cannot express it, revisit the design — do not reach for CSS.

---

## 2. No `<style>` blocks, no `style=` attributes

Inline `style="..."` props and `<style>...</style>` blocks are absolutely forbidden anywhere in the project. Every visual property — color, spacing, sizing, position, typography, shadow, border, transform — is expressed exclusively through Tailwind classes.

Any occurrence of `style={{ ... }}` or a `<style>` element is a violation, regardless of how trivial the value looks. The only exception is when a value is genuinely dynamic and impossible to derive at build-time (e.g., a CSS variable assigned from runtime user input) — and even then, the dynamic value must flow into a Tailwind-aware pattern (CSS variables consumed by `[--var]:`/arbitrary value syntax), not into an ad-hoc `style` prop.

---

## 3. Animations — Tailwind first, custom only as last resort

Animations and transitions are encouraged, but they must be expressed with Tailwind utilities first: `transition-*`, `duration-*`, `ease-*`, `animate-*`, `hover:`, `focus:`, `data-[state=open]:`, etc. Tailwind already provides the vocabulary for opacity, transform, color, and state-driven animations.

Custom keyframes or external animation libraries are allowed **only** when the desired motion cannot be achieved with Tailwind classes directly. Before reaching for Framer Motion, GSAP, or a `@keyframes` declaration, prove that no combination of Tailwind utilities solves it.

---

## 4. Native form elements are forbidden — use modern components

Native `<select>`, `<input type="checkbox">`, `<input type="radio">`, and `<input type="range">` are prohibited in user-facing UI. Every project has a richer counterpart available:

- **Select / dropdown** → shadcn `Select`, `Combobox`, or `DropdownMenu`.
- **Checkbox** → shadcn `Checkbox`.
- **Radio** → shadcn `RadioGroup`.
- **On/off toggle** → shadcn `Switch`.
- **Range** → shadcn `Slider`.
- **Date / time** → shadcn `Calendar` + `Popover`.

Native versions render with platform-default visuals that break the design system, ignore Tailwind theming, and look dated. Replace them on sight.

---

## 5. Motion is mandatory on overlays — no dry, hard transitions

Any component that appears, expands, or collapses must animate. Hard-cut openings (a popover snapping into existence, a modal flashing on the screen) are visually cheap and break the perceived quality of the product. Animate every entrance and exit for:

- Dropdowns, popovers, tooltips, context menus.
- Drawers, sheets, sidebars.
- Modals, dialogs, alert dialogs.
- Toast notifications.
- Accordions, collapsibles, tabs (when content height changes).

shadcn primitives ship with `data-[state=open]:animate-in`, `data-[state=closed]:animate-out`, and the `tailwindcss-animate` plugin — use those utilities. The standard duration range is 150–250ms with `ease-out` for enters and `ease-in` for exits. Do not ship overlays without motion.

---

## 6. Components stay generic — share, don't duplicate

Reusable components (dropdowns, dialogs, modals, sheets, tooltips, buttons, inputs, cards, badges, tables) live as **single, generic implementations** at the project's shared component layer. Sections and views consume them — they do not fork them.

A view-specific component is justified only when the requirement is genuinely view-specific: a one-off layout, a domain widget that wraps the generic primitives, a composition that has no reuse value. Even then, the view-specific component is built **on top of** the shared primitives, never as a rewrite of them.

If you find yourself building a second `Dialog`, a custom `Dropdown`, or a parallel `Tooltip` — stop. The duplication is the bug. Extend the shared component or compose around it.

**`<Card/>` is the canonical case of this principle.** A single generic `Card` lives at the shared layer because it has a consistent structure across the entire app — the same border, radius, elevation, and inner anatomy (header, body, actions, footer). What changes is how each section consumes it: every view can hide the header, drop the footer, omit the actions slot, swap padding, change the background, or re-style the surface through Tailwind classes. The card stays generic for the global structural decisions (radius, elevation, anatomy) while every section customizes it through composition and classes — never by forking it into a parallel implementation.

---

## 7. Optimize re-renders — `React.memo()` on components with primitive props

Wrap components in `React.memo()` when their props are primitives (string, number, boolean, null, undefined). Shallow comparison on primitives is essentially free and prevents the entire subtree from re-rendering when a parent re-renders for unrelated reasons. This is the cheapest performance win available in React.

Do **not** wrap components whose props are objects, arrays, or functions recreated on every render — the shallow comparison will always fail and `memo()` becomes pure overhead. For those, fix the prop instability first (lift state, `useMemo` the object, `useCallback` the function), then decide if `memo()` adds value.

`useMemo` and `useCallback` are reserved for expensive computations or for stabilizing reference identity of non-primitive props passed to a memoized child. Do not sprinkle them on cheap operations.

---

## 8. Scroll is part of the design — never leave it native

Native scrollbars look like the operating system, not like the project. Treat the scroll surface as a designed element:

- **Static styling** → use `tailwind-scrollbar` to apply utilities (`scrollbar-thin`, `scrollbar-track-*`, `scrollbar-thumb-*`) so the scrollbar matches the project palette and density.
- **Smooth scroll behavior** → use a JS library (Lenis, Locomotive, or equivalent) to replace the native scroll easing on long-form pages and main content surfaces. Inertia, easing, and direction must feel intentional.
- **Section transitions** → animate scroll-into-view interactions, anchor jumps, and scroll-driven reveals. A page that scrolls "by default" feels unfinished.

Apply the lighter approach (scrollbar utilities) to local containers — sidebars, tables, modal bodies. Apply the heavier approach (smooth-scroll library) to the main page scroll where the user spends most of their time.

---

## 9. Class lists must be unambiguous and non-redundant

Every Tailwind class on an element earns its place. Two rules govern the class list:

**No redundant `dark:` variants.** If the value is the same in light and dark, write the base class only. `text-white dark:text-white` is wrong — write `text-white`. The `dark:` prefix is reserved exclusively for cases where the dark value differs from the light value (`text-neutral-900 dark:text-neutral-100`). Same logic for `hover:`, `focus:`, `md:`, `lg:` and any other variant: only declare the variant when its value diverges from the base.

**No classes overwriting each other.** Tailwind resolves conflicts by source order, not by class order in the string — relying on that is a footgun. A class list must never contain two utilities that target the same property: no `p-4 p-2`, no `text-sm text-base`, no `flex grid`, no `bg-white bg-neutral-100`, no `mt-4 mt-0`. If a conditional override is needed, build the class list with a single source of truth (`cn()` / `clsx` / `tailwind-merge`) so only one value reaches the DOM.

The class list is read top-to-bottom by humans. Ambiguity costs review time and produces silent bugs when a refactor reorders utilities or when a variant unexpectedly takes precedence.

---

## 10. Component folder anatomy

Every visual component lives in its own folder. Each subcomponent and each hook also lives in **its own folder** with an `index.ts`, never as a flat file inside `components/` or `lib/`. The pattern is recursive — folders all the way down:

```
src/components/Button/
├── index.ts                          # main entry of the Button component
├── components/                       # optional, subcomponents that return JSX
│   └── Icon/
│       └── index.ts                  # subcomponent used by Button
└── lib/                              # optional, hooks and pure logic without JSX
    └── use_loading/
        └── index.ts                  # hook that belongs to Button
```

The main entry is always `index.ts`, never `Button.ts`. No extra files (CSS, README, tests) unless strictly necessary.

**`components/` vs `lib/` — single decision:** does it return JSX? Yes → `components/`. No → `lib/`.

**Export order inside `index.ts`:** Enums → Types → Interfaces → Constants → Utility functions (only if complex) → `export default Component` (always last).

**Recursive hierarchy.** Each subcomponent and each hook is its own folder, and each can in turn have its own `components/` and `lib/` at any depth — the pattern repeats identically downward, no depth limit.

**Import scope — upward only.** A component imports from: its own `lib/`, its parent's `lib/`, the root `lib/`, and the root `components/`. Never from siblings or unrelated branches.

```ts
// OK
import useIconSize from "./lib/use_icon_size"; // own
import useButtonState from "../../lib/use_button_state"; // parent
import useTheme from "@/lib/use_theme"; // root

// WRONG
import { x } from "../ButtonSpinner/lib/x"; // sibling
import { y } from "@/components/Form/lib/y"; // unrelated branch
```

---

## 11. Cards are self-contained by default

A card owns its data fetching, state, and lifecycle whenever its content maps to a dedicated API resource. Receiving primary data via props is **forbidden** in that case — the card builds itself with lazy loading and stays decoupled from any parent. If the fetch fails or the endpoint changes, the blast radius is exactly one card.

Props are accepted **only** when a higher-level API returns the collection as a unit (galleries, lists rendered from a single endpoint). Refetching per item in those surfaces multiplies network calls and re-fragments data the API already delivered together.

```tsx
// OK — one card ↔ one resource → self-contained
function Balance() {
  const [n, setN] = useState(0);
  useEffect(() => { fetch("/api/balance").then(setN); }, []);
  return <div>{n}</div>;
}

// OK — many cards ↔ one collection → props from parent
function Photo({ src, alt }) { return <img src={src} alt={alt} />; }

function Gallery() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch("/api/photos").then(setItems); }, []);
  return items.map((p) => <Photo key={p.id} {...p} />);
}
```

One card ↔ one resource → self-contained. Many cards ↔ one collection → props from parent. There is no third option.

---

## 12. View stabilization and shared logic

**Equivalent views follow the same composition.** Views that solve the same problem (fetch + list + actions, form + submit, detail + edit) use the same composition pattern across the app: same loading, empty, and error structures, same data flow, same interaction shape. Mixing infinite scroll on one screen and manual pagination on another for the same domain is a defect. Consistency across equivalent views is what makes the product feel like one product.

**Abstractions earn their place.** An abstraction is justified only when it encapsulates complete behavior reused across multiple views. A 4-line component that only maps a status to a color is microfragmentation — it goes inline. The smallest implementation that satisfies the requirement is the correct one.

**Do not reimplement the framework.** If a framework primitive already covers the case (MUI's `IconButton` with `startIcon`, Next.js parallel routes and route groups, shadcn variants), consume it directly. Inventing a custom solution alongside a working framework primitive is forbidden.

---

## 13. Cross-cutting principles

- **Enrich flat data.** When two APIs together produce a richer record (user + workspace metadata, ticket + assignee details), cross them in the loader and pass the enriched object to the view.
- **Right data structure for the job.** `Map` to group by key, `Set` to deduplicate, `for...of` to iterate. Avoid forcing arrays through `find()`, `includes()`, or `reduce()` when these structures exist natively.

---

## 14. Tailwind dark mode setup

Dark mode is driven by the `dark` class on `document.documentElement`, controlled through a `useTheme` hook at `@/lib/use_theme/`.

The toggle persists the chosen theme in `localStorage` and toggles the `dark` class on `<html>`:

```ts
const toggle_theme = () => {
  const next = theme === "dark" ? "light" : "dark";
  setTheme(next);
  localStorage.setItem("theme", next);
  document.documentElement.classList.toggle("dark");
};
```

To prevent FOUC (flash of unstyled content), inject a `beforeInteractive` script in the document head that reads `localStorage('theme')` and `matchMedia('(prefers-color-scheme: dark)')`, then applies the `dark` class to `<html>` before React mounts.

For SSR, gate any browser-only render with the `mounted` pattern (defined in `clean-code` skill).

---

## 15. Tailwind composition principles

**Variant-to-class maps are named exports in the component's `index.ts`.** Mappings from variant name to Tailwind classes are predefined data — they have no `function()` and they don't return JSX. They live as `export const` in the component's own `index.ts`, never in `lib/` (reserved for hooks and pure logic), and never as default export (reserved for the component itself):

```tsx
// components/Button/index.ts
export const button_variants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  ghost: "bg-transparent text-blue-500 hover:bg-blue-50",
};

export default function Button({ variant }) {
  /* ... */
}
```

**Conditional classes inline as ternaries.** Use a single inline ternary inside `className` for binary state changes — do not split into `if/else` blocks or pre-computed variables for trivial cases.

```tsx
<button className={is_active ? "bg-blue-500" : "bg-neutral-200"}>
```

For three or more states, use a `Record` lookup defined as a named export in the component's `index.ts`, not nested ternaries.

**No micro-wrappers around classes.** A component that exists only to map one prop to one Tailwind class adds a layer with no behavior. Inline the class at the call site.

---

## 16. Layout is planned first

Nothing is built before the Layout is defined — its skeleton is decided upfront and every component composes inside it. Canonical hierarchy:

```
LAYOUT — section root or full view (Next.js: layout.tsx)
  ├── NAVBAR — top of the view; direct child of LAYOUT
  └── BODY  — flex
        ├── DRAWER — first horizontal slot of BODY
        └── MAIN   — second horizontal slot of BODY; renders the view's content
```

**Drawer vs Sidebar.** Two distinct, non-interchangeable surfaces:

- **Drawer** — the **global** app navigation. Layout-level, lives in the slot above. Hosts modules, sections, primary destinations. Collapsible on both viewports: **desktop persists** state across reloads (e.g., `localStorage`), **mobile defaults to closed** on every load.
- **Sidebar** — a **sub-section** navigation living **inside `MAIN`**. View-level. Canonical case: the Settings page renders a Sidebar with Profile / Security / Notifications / Billing on the left, the active subsection on the right, the URL reflecting the active section.

---

## 17. Avoid deep element nesting

Element hierarchy is kept as shallow as the design allows. Recursive children should be reduced, not accumulated — every additional nested level adds tree weight and reading complexity.

Most layout cases are resolved with Tailwind flex utilities (`flex`, `flex-col`, `gap-*`, `justify-*`, `items-*`) on a single container. Recursive compositions that saturate the tree to achieve a layout that flex already solves are a defect.

---

## 18. Mobile-first responsive is non-negotiable

Every design is mobile-first. Every component, layout, and view is built with mobile, tablet, and desktop in mind from the start — this is not optional, not negotiable. Each piece that ships must account for the three viewports.

Tailwind provides the breakpoint vocabulary (`md:`, `lg:`, `xl:`, …): base classes describe the mobile state, breakpoint variants layer the larger viewports on top.

The next sections (19–23) cover patterns that explicitly diverge by viewport. They all descend from this foundational rule.

---

## 19. Hover on desktop, `active:` / `focus:` on mobile

Hover affordances are free to use on desktop, where the input model supports them. On mobile, where hover does not exist, interactive feedback relies on `active:` (touch press) and `focus:` (after tap) instead.

---

## 20. Navigation context: Back on mobile, breadcrumbs on tablet/desktop

Navigation hierarchy is exposed differently depending on the viewport:

- **Mobile** — prefer a "Back" button. Breadcrumbs consume horizontal space mobile cannot afford.
- **Tablet / Desktop** — breadcrumbs are welcome and can be included in designs to expose the full hierarchy.

---

## 21. Drag-to-reorder: drag on desktop, buttons on mobile

Reordering is split by viewport. **Desktop** uses drag & drop. **Mobile** uses explicit up / down buttons — drag interactions on touch conflict with scroll and are imprecise.

The same list renders the appropriate control per viewport: drag handles on desktop, arrow buttons on mobile.

---

## 22. Route transitions: horizontal slide on mobile/tablet, none on desktop

Page transitions follow the viewport:

- **Mobile / Tablet** — horizontal slide animation between routes, mirroring the navigation direction (forward enters from the right, back enters from the left).
- **Desktop** — no transition. Routes change instantly.

---

## 23. Diff view: toggle between side-by-side and inline

Diff views (comparing versions, before/after) expose **both layouts** behind a toggle:

- **Side-by-side** — two columns (left = before, right = after) with changed lines highlighted in place. Default on desktop.
- **Inline (unified)** — a single column with `-` lines (removed, red) and `+` lines (added, green). Default on mobile, where two-column layouts get too narrow.

---

## 24. Form validation: API on blur, local on input

Form validation timing depends on the source of the rule:

- **API-backed validation** (uniqueness checks, server-side rules) — triggered on `blur`, never on every keystroke. Hammering the endpoint while the user types is forbidden.
- **Local validation** (format, length, required, regex) — triggered on `input` for immediate feedback, since there is no network cost.

This split keeps real-time feedback for what the client can answer instantly, while protecting the API from request floods.

---

## 25. Z-index follows the component source

Z-index management is dictated by where the overlay primitive comes from:

- **Custom components** built in-house use Tailwind's z-index utilities directly (`z-10`, `z-20`, …).
- **Third-party components** (shadcn, or any other provider) already ship z-index management — they are consumed as-is. Do not override their layering.

---

## 26. Single icon library with canonical sizes

The project uses a single icon library across the entire UI. Mixing icon libraries is forbidden — visual consistency depends on a unified stroke weight, metaphor system, and optical balance.

Icon sizing is restricted to a fixed scale: `size-4`, `size-5`, `size-6`. Free-form sizes break the rhythm of buttons, headers, and form fields.

---

## 27. Destructive actions: confirmation dialog + navigation protection

Destructive actions (deleting, discarding changes) must be confirmed through a dialog before executing. The user has to explicitly approve the operation.

Beyond the dialog, the app must protect against navigation events that could silently lose work. When a form holds unsaved changes, intercept refresh and tab-close attempts with the browser's native prompt (`beforeunload`) — this is the mechanism that survives a page navigation and prevents accidental loss.

---

## 28. Empty states: illustration + text + action

Every empty state — empty list, table with no results, dashboard without data — composes three elements: a custom illustration (not a generic icon), explanatory text describing the state, and a CTA that lets the user act on it. A blank surface or a single sentence is not an acceptable empty state.

---

## 29. Lazy data uses `<Suspense/>` with `Skeleton`

Any interface that loads data lazily wraps the lazy boundary in `<Suspense/>`, and the Suspense `fallback` renders a `Skeleton`.

```tsx
<Suspense fallback={<BalanceSkeleton />}>
  <Balance />
</Suspense>
```

---

## 30. Skeleton whenever the layout is known

Loading uses `Skeleton` whenever the shape of the final content is predictable. The skeleton matches the eventual layout so the structure is visible from the first paint, with no shift when data lands.

Spinners are reserved for punctual actions — form submit, manual refresh — where there is no layout to preview. Replacing a Skeleton with a spinner is a downgrade.

---

## 31. All lists use infinite scroll

Lists render with infinite scroll, driven by the API's pagination contract. If the API exposes cursor-based pagination, use cursors. Otherwise use the offset/limit pagination the API provides. Manual "next page" buttons and classical pagination bars do not belong in standard list views.

---

## 32. Sort on column headers, filters in a toolbar above the table

Tables expose two separate controls:

- **Sort** — when the API permits sorting data or columns, clicking a column header toggles the sort order for that column. If the API does not support sort, headers are not interactive — client-side sorting over the visible page is forbidden.
- **Filters** — a dedicated toolbar above the table holds the advanced filter options the API permits.

---

## 33. Autocompletes show a loader inside the dropdown

Every autocomplete renders a dropdown panel with a loader inside it to indicate the search is in progress.

---

## 34. Prefer `Toast` over `Alert`

Notifications use `Toast` by default rather than `Alert` — Toasts are less invasive and do not block the user's flow.

---

## 35. Images must be optimized

Every image ships through an optimization strategy. `next/image` is the preferred path in Next.js projects (automatic lazy loading, modern formats, responsive sizes). Alternative optimization solutions are acceptable when they cover the same ground.

What is not acceptable is shipping unoptimized images.

---

## 36. Natural wrap by default, line-clamp only on overflow

Text wraps naturally by default. `line-clamp` is applied only when the content would visibly overflow its container — not preemptively. Truncation hides information; preserve it whenever the layout allows.

---

## 37. Search debounce: variable by context

Debounce timing on search inputs depends on the surface:

- **Autocompletes** — 300ms. Fast feedback expected, results inform the next keystroke.
- **List filters** — 500ms. Larger payloads, less keystroke-by-keystroke interaction.
- **Heavy searches** — on submit (Enter or button). The user opts in explicitly when the cost is high.

There is no universal debounce value — each search input declares its timing based on the cost of the call and the expectation of the surface.

---

## 38. Native APIs and formatting: `Intl.*` first, libraries only when needed

Native APIs are preferred over external libraries for capabilities the platform already exposes:

- `crypto.randomUUID()` over `uuid`.
- `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat` over `moment.js`.
- Native `fetch` over HTTP clients when sufficient.

For date, number and currency formatting specifically — always in the user's active locale.

`Intl.*` is the default. `ago`-style relative outputs are preferred for time deltas, expressed through `Intl.RelativeTimeFormat`.

`moment.js` is the fallback — reach for it only when `Intl.*` cannot cover a specific format, never as the default.

---

## 39. Bulk actions: row checkboxes + persistent toolbar

Lists and tables that support bulk operations expose two pieces:

- A **checkbox per row** for selection.
- A **toolbar above the table**, always visible, holding the bulk action buttons. The buttons stay disabled until there is a selection and enable as soon as one row is checked.

The toolbar does not appear and disappear with selection — it lives at the top of the table and signals availability through its buttons' enabled state.

---

## 40. File upload: drag & drop, thumbnail preview, per-file loader

File upload surfaces compose three elements:

- **Drag & drop zone** that also opens the native file picker on click.
- **Thumbnail preview** of each selected file.
- **Per-file loader** showing individual progress for each upload.

Global progress bars covering the whole batch are not used — each file owns its own loader.

---

## 41. Command palette + documented shortcuts

The product ships with a **command palette** opened by `⌘K` (`Ctrl+K` on non-Mac). It is the global entry point for actions and navigation.

Every keyboard shortcut in the product is documented and surfaced inside the command palette so the user can discover what is available without leaving the app.

---

## 42. Status semantics use shadcn variants, never ad-hoc colors

Semantic states (destructive, success, warning, info, neutral) are expressed through shadcn's `variant` prop on the corresponding primitives — `Button variant="destructive"`, `Alert variant="destructive"`, etc. The variant carries the intent.

Ad-hoc colors for state (`bg-red-500` to mean "destructive", `text-green-600` to mean "success") are forbidden. State expression lives inside the official variants — introducing colors outside that system is not permitted.

---

## 43. Tooltips for trivial info, Popover for explanation

Tooltips are reserved for trivial information — 1 to 3 words at most: the label of an icon-only button, a short status name, an abbreviation expansion.

When the content needs to be explained, use a `Popover` instead. The popover offers structured space for paragraphs, lists, or interactive content; the tooltip is a quick label, not a documentation surface.

---

## 44. Avatar groups: stacked with `+N` overflow

Avatars in a group context render as a stack — overlapping circles showing the first 3-4 members. Beyond that limit, the last circle displays `+N` to communicate the remaining count.

---

## 45. Mutations are optimistic by default

Mutations (toggles, likes, marking as read, archiving) update the UI immediately, without waiting for the API response. If the request fails, the local state is rolled back and a `Toast` informs the user of the error.

---

## 46. Fetch errors render inline with a Retry action

When a list or table fails to load (network error, server error, timeout), the container renders an inline error state — a clear message plus a **Retry** button that re-issues the fetch without reloading the page.

The error stays scoped to the failed container; the rest of the view continues working.

---

## 47. Sticky by default: page header and table header

Two surfaces are sticky by default:

- **Page header** — stays visible as the user scrolls down the view.
- **Table header** — the column header row stays visible as the table body scrolls.

The first column of a table becomes sticky only when the table is very wide; this is a context decision, not a default.

---

## 48. Offline indicator: full-width red bar, green confirmation on recovery

When the client loses connection, render a full-width bar at the top of the viewport (`w-screen`) in red with centered white text: "Sin conexión" / "Connection lost".

When connection is restored, the same bar switches to green to confirm recovery and is hidden after **700ms** — long enough to register the change, short enough not to linger.

---

## 49. i18n: JSON per locale + `useTranslation()`

Internationalization is structured as JSON files per language (`/locales/es.json`, `/locales/en.json`, …) consumed through a `useTranslation()` hook that returns `t('key.path')`. The JSON structure can be flat or nested by feature.

User-facing strings flow through `t()`; they are not hardcoded inside components.

---

## 50. Button loading: spinner replaces the icon, text stays, button disables

When a button is executing an async action:

- The **icon** (if any) is replaced by a spinner. If there is no icon, the spinner appears to the left of the text.
- The **text label stays visible** — never replaced or hidden.
- The button becomes **disabled** for the duration of the action.

---

## 51. Date pickers: input + calendar in Popover, range = double calendar

Date selection follows a single pattern:

- **Single date** — a text input that opens a `Popover` containing one calendar on click.
- **Date range** — same input pattern, but the popover shows two calendars side by side (two months visible at once).

---

## 52. Border-radius is coherent across primitives

Border-radius decisions follow the project's overall visual language and remain consistent across primitives. Square inputs paired with rounded buttons (or any inconsistent mix) is a defect.

Inputs, buttons, cards, tags, modals — all share the same radius language. Either the project commits to a sharp/rectilinear vocabulary and every primitive is square, or it commits to rounded and every primitive reflects that.

---

## 53. Long text: fade-out gradient + centered Expand button

Long-form text that requires collapse uses a **fade-out gradient** at the bottom of the truncated block, followed by a centered **Expand** button below.

The gradient signals that more content exists; the button toggles the expansion with an animated height transition.

---

## 54. Right-click is intercepted contextually, not globally

Right-click behavior depends on the element under the cursor:

- **Interactive elements with a defined action set** (list rows, table rows, kanban cards) — right-click is intercepted and shows the same actions exposed by the element's `⋮` (or actions) icon.
- **Plain text and non-interactive content** — right-click defers to the browser's native menu (copy, search, inspect).

The decision is per-element. Intercept where a richer menu adds value; defer to the browser everywhere else.

---

## 55. Account dropdown order: identity → workspace → settings → theme → logout

The account dropdown (avatar in the top-right) follows a fixed top-to-bottom order:

1. **Identity block** — avatar, name, and email of the current user.
2. **Workspace switcher** — when the product has multiple workspaces.
3. **Settings / Profile** — links to user-level configuration.
4. **Theme toggle** — light / dark switch (see section 14).
5. **Logout** — at the bottom, visually separated from the rest.

The order does not change per page.

---

## 56. Tag input separators depend on the data type

Tag-input fields commit chips with separators that depend on what is being collected:

- **Tags / labels** — `,` (comma) **or** space confirms the chip.
- **Email addresses** — `,` (comma) **or** space confirms.
- **Free-form text** (categories, phrases that may contain spaces) — **only** `,` (comma) confirms. Space is preserved as part of the value.

---

## 57. Charts use Tremor

Data visualization is built with **Tremor**. Tremor's charts ship pre-designed in a shadcn-aligned visual language and fit the project's typography and palette out of the box.

Custom chart compositions are built on top of Tremor primitives, not by switching libraries.

---

## 58. Global search: navbar input + command palette

The product exposes a **global search input in the navbar** — depending on the app, it can be centered or right-aligned as an expandable icon. The same search experience is also reachable through the **command palette** (`⌘K`, see section 41).

Both surfaces lead to the same search: the navbar input is the always-visible entry, the palette is the keyboard entry.

---

## 59. Onboarding: interactive tour with sequential coachmarks

New users are onboarded through an **interactive tour built with coachmarks** — sequential tooltips that highlight key elements of the UI in order. The tour has a **Next** button to advance through the steps and a visible **Skip** option for users who want to opt out.

---

## 60. Avatar upload: two patterns by context

Avatar / profile-image upload picks between two patterns depending on the surface:

**Pattern A — Inline crop (compact contexts):**

1. Hovering the avatar reveals a camera icon.
2. Click opens the native file picker.
3. After selection, the user can drag the image inside the avatar slot to crop it in place.
4. Confirm commits. The crop happens in the browser before the file is sent to the server.

**Pattern B — Modal editor (full edit):**

1. An upload icon opens the native file picker.
2. After selection, a modal opens with the full image and crop / rotate controls.
3. The user adjusts and confirms. The transformations happen in the browser before the file is sent to the server.

In both patterns, the image is processed client-side; the server receives the final cropped (and rotated) version, not the original.

---

## 61. Auth screens: Google-style centered form, no backdrop

Login and sign-up follow the Google pattern:

- A **centered form** rendered like a modal without backdrop, with inputs and options inside.
- When social-login providers are included, separate them from the email/password block with a **horizontal divider**.
- **Sign-up and Sign-in are not separate routes** — a text link ("¿Aún no tienes cuenta?" / "Already have an account?") toggles the form between the two modes inline.

---

## 62. Error pages: keep the layout, render the error inline in MAIN

Error pages (404, 500, 403, no permissions) do **not** take over the full screen. The app's layout — navbar, drawer — stays visible. The error renders inline inside the `MAIN` slot of the layout (see section 16), so navigation surfaces remain available for recovery.

---

## 63. Numeric inputs: sliders, currency, integers — distinct patterns

Numeric inputs split by purpose:

- **Sliders** — use a non-native slider component (consistent with section 4).
- **Currency** — use an input-formatting library that handles locale-aware grouping, decimals, and symbol placement.
- **Integers** — guard the field with `onInput` (or equivalent) to reject non-numeric characters at the source, so the value never holds an invalid string.

---

## 64. Password input: visibility toggle + real-time strength meter

Password fields ship with two affordances:

- **Visibility toggle** — an eye icon at the right of the input toggles between hidden and shown text.
- **Strength meter** — a real-time indicator that updates as the user types (weak / medium / strong).

The **requirements list** (length, uppercase, number, symbol, …) is not a fixed component — its content is decided per product, based on the password policy that applies to the user.

---

## 65. Phone input: country dropdown + flag/code handle + paste detection

Phone inputs use a country dropdown for the prefix:

- The **dropdown list** shows three columns per option: flag, country name, dial code.
- The **handle** (collapsed state of the dropdown) shows only the flag and the dial code — no country name, to keep the field compact.
- When the user **pastes** a phone number, attempt to detect the country from the prefix automatically and update the dropdown selection.

---

## 66. List item motion: slide and/or fade, direction by context

Items entering or leaving a list animate with **slide and/or fade**. The direction of the slide is determined by the context, not by a global rule:

- **Messages on mobile** — removed items slide out to the left (swipe-to-delete affordance).
- **Task lists** — fade only, no slide.
- **Notifications** — slide up on entry / removal.

Each surface picks the motion that matches the user's mental model for that interaction.

---

## 67. Cookie consent: simple bottom banner with Accept + privacy link

Cookie / privacy consent uses a **simple bottom banner**: an **Accept** button and a link to the privacy policy. Nothing more.

Granular settings, blocking modals, and multi-button choices (configure, reject all, partial accept) are not part of the default — the banner stays minimal.

---

## 68. Image lightbox: full-screen overlay + prev/next + Esc closes

Image galleries open into a full-screen overlay:

- **Click** on a thumbnail opens the overlay with the image centered at maximum size on a dark backdrop.
- **Prev / Next** controls (and the arrow keys `←` / `→`) navigate between images in the gallery.
- **Esc** (and the X button) closes the overlay.

---

## 69. Rich text editor: Tiptap with a basic formatting toolbar

Rich-text editing (comments, descriptions, longer-form fields) uses **Tiptap** as the editor base.

The toolbar exposes the essentials only: **bold**, **italic**, **link**, **lists** (ordered / unordered), **code**. Heavier formatting (tables, embeds, mentions) is added per surface only when the use case justifies it — the default editor stays lean.

---

## 70. Long forms: grouped into Cards with their own titles

Long forms are split into **Cards**, each with its own title in the header, grouping related fields together inside the card body.

Cards are separated visually (padding, gap), so the user reads the form as a sequence of self-contained sections rather than one continuous wall of inputs.

---

## 71. File preview: inline preview in Modal/Drawer + Download button

File previews (PDF, image, video) open inside a **Modal or Drawer** with the content rendered inline (PDF.js, native image, video player, etc.).

A **Download** button stays visible inside the overlay so the user can grab the original file at any moment.

---

## 72. Browser permissions: custom pre-prompt before the native prompt

Before triggering a browser permission request (notifications, geolocation, microphone, camera), show a **custom pre-prompt** explaining why the permission is needed and what the user gains by granting it.

Only when the user accepts the pre-prompt does the app fire the **native browser prompt**. This avoids the "blocked forever" trap that happens when users dismiss the native prompt without context.

---

## 73. OTP / 2FA input: separated boxes + auto-paste + auto-submit + SMS listener

OTP and 2FA verification fields use one input slot per expected character (the slot count matches the code length — 6 boxes for 6 digits, 4 for 4 digits, etc.).

Behavior:

- **Auto-paste** — pasting the full code in any slot distributes the digits across all slots automatically.
- **Auto-submit** — once the code is fully entered, submit fires without requiring a separate button click.
- **Mobile SMS autofill** — listen for incoming SMS messages (Web OTP API or platform-specific listener) and autofill the field as soon as the code arrives.

---

## 74. Share: native Web Share API on mobile, modal on desktop

Content sharing adapts to the platform:

- **Mobile** — use the **Web Share API** (`navigator.share`). The OS-native sheet appears with the user's actual share targets (messaging apps, social, email, etc.).
- **Desktop** — fall back to a **modal/popover** with a read-only input holding the URL plus a copy button, social icons (Twitter, LinkedIn, …), and a "Send via email" option.

---

## 75. Comment threads: collapsible sub-threads with visible reply count

Comment replies open a **collapsible sub-thread** under the parent comment. By default the sub-thread is collapsed and shows "N replies"; clicking expands it to reveal the conversation.

Top-level comments stay scannable; depth lives behind one click.

---

## 76. `@` mentions: dropdown search → Enter → chip in the text

Typing `@` inside a text input opens a **dropdown** with a live search across users (and other mentionable entities). Filtering happens as the user keeps typing.

**Enter** on a result inserts a **chip** into the text — clickable, referencing the selected user, distinct from the surrounding plain text.

---

## 77. Reactions: trigger button + emoji picker + grouped chips with count

Reactions on content (messages, comments, posts) follow the Slack/Discord pattern:

- A **reaction trigger button** opens an emoji picker.
- Existing reactions render as **chips below the content**, grouped by emoji with the **count** (e.g., `👍 3`, `❤️ 5`).
- **Clicking an existing chip** toggles the user's own reaction for that emoji — adds it if absent, removes it if already present.

---

## Cross-references

- Code-level rules (naming, control flow, file structure, hooks placement, package management, JSDoc conventions) live in the `clean-code` skill. Da Vinci defers to `clean-code` for anything that is not a visual decision.
- The RAG supersedes both skills when there is a conflict — it is the live source of truth.
