---
name: davinci
description: >
  UI/UX craft skill: plan a frontend from the data up, then build interfaces that look authored
  and feel alive — never the AI-generic look. Load for any visual/frontend work — designing,
  building, modifying, reviewing or redesigning apps, pages, components, dashboards, landings,
  layouts, responsive, interaction states, motion, forms, color, typography, spacing, elevation,
  navigation, loading. Runs a mandatory method (know the API first, refuse data views without a
  contract, map views to services, build, audit) then unified rules for taste, motion, delight and
  interface guidelines on top of the user's laws (Tailwind-only, shadcn over native, mobile-first).
  Triggers: "diseño","design","UI","UX","layout","responsive","componente","rediseño","estilos",
  "Tailwind","shadcn","frontend","app","animation","motion","color","theme","landing","dashboard",
  "page","modal","card". When Da Vinci and the RAG disagree, the RAG wins.
---

# Da Vinci — UI/UX Design & Craft

Da Vinci owns how a frontend is **planned** and how it **looks and feels**. Two jobs: run the **six-phase lifecycle** (§0) that plans from resources and data before any pixel, then make the result read as refined, deliberate and premium while staying correct and accessible. **Every rule below is a contract — violating one is a defect even when the screen "looks fine".**

The bar is not "a working UI": it is UI that looks **authored**, at the tier of Meta's blue system, Google's Material motion and Linear/Stripe restraint — **never** the AI-generic default (violet-neon gradients, all-glass, inert 3-up cards, static monochrome icons). Rejecting that default and planning **delight** is a first-class goal, not a finishing touch (§18).

**Authority order:** the RAG (live user preferences) > this skill > general defaults. Code-level concerns — file/folder naming, import scope, control flow, helper extraction — belong to `clean-code`; Da Vinci governs *planning, visual and interaction* layers.

---

## 0. The lifecycle — how a frontend gets built

**Scale the method to the task first.** The full lifecycle governs building or reworking a **data-driven surface** — a page, dashboard or app backed by an API. For a **punctual, self-contained change** (restyle a button, fix responsive, adjust spacing, build one presentational component with no data), skip straight to the relevant rule sections (§1–§18); the API-contract gate below does not apply. When unsure whether real data is involved, treat it as data-driven.

For anything data-driven, run **six phases, in order**. Never jump ahead to pixels — each phase feeds the next, and the whole point is to prevent the failure this skill exists to stop: building UI before understanding the resources and the data.

### 0.1 Resources — know what you have
Inventory before planning: available **libraries** (local and third-party — including animated component sets like Magic UI / Aceternity beyond the shadcn base, §18), the **REST API**, **documentation**, and the **user's preferences** (the RAG). Reconstruct the API's data contract in particular — entities, fields, relations, endpoints (inputs/outputs), the exact response JSON, and which endpoints combine per view (`Promise.all`). You cannot design a screen whose data you cannot name.

**Clarity gate (hard rule):** if the API is not documented clearly enough to name entities, endpoints, inputs and outputs, do **not** proceed. Ask whether a Markdown doc of the API exists; if not, offer to draft and confirm it *with* the user; if no contract can be established, **pause the task** and say so. Building UI on guessed data is forbidden — a confident UI on an unknown backend is worse than none.

### 0.2 Planning — break the request down
Decompose the request into **objective execution points**, then cross them against the 0.1 resources to decide how to **combine, reuse and optimize** what exists. Be exhaustive: every entity needs its full lifecycle (list, detail, create, edit, delete — no missing CRUD), and the plan covers the whole shell (drawer, footer, global search, hero, offline/real-time), not just the obvious pages. Output = a concrete list of what must be built or gathered. Include a **delight pass**: per surface, enumerate the signature moments and richer interactions it deserves (§18) — decided here, never improvised at the end.

### 0.3 Roadmap — project before building, and persist it
Survey what already exists so you extend it instead of duplicating, and write the projection down:
- **Components** — review existing global components, the component library, the style library.
- **Views** — **list** existing views **without reading them** (avoid saturating context); this maps what exists.
- **Libraries** — review local libraries, the auth flow (if needed), and how axios / the HTTP client behaves (if needed).
- **Palette** — study palette, components and styles; fit them into the projection (derive the full ramp per §3 if brand colors are given).

**Write the roadmap to `.claude/{random}.md`** — a personal file that **persists the projection across contexts** (survives a context reset; it is the source of truth the final audit checks against). It coexists with `student`'s brief; this one is the frontend build plan.

### 0.4 Construction
Build the roadmap. Data layer first (typed client + services matching the contract), then the views that consume it, applying every rule in the parts below.

### 0.5 Refine — polish, then compress
Once built, run a dedicated refinement pass before delivery:
1. **Re-read this skill's craft parts over the build** and sharpen each surface against them — the laws (§1), color & type (§3–§4), motion (§7), interaction (§8), forms (§9), delight (§18). This craft lives in this skill already; the pass is a second deliberate read, **not** other skills to load.
2. **Compress & simplify** — collapse class lists, tighten markup, remove nesting, walk the tree for dead props / over-fragmentation / redundant wrappers. Shallow trees over deep.
3. **Audit** — render correctness (no `Slot`/`asChild` single-child violations), class hygiene, no stray CSS, no `as any`. Catches the runtime bugs a "looks fine" glance misses.

### 0.6 Delivery
Deliver to the user, reporting against the roadmap: what was built, how data/services are wired, which browser capabilities were used, and how to run it.

---

## 1. Non-negotiable laws

These never bend (they are the user's standing law):

1. **Tailwind utilities only.** No custom `.css`, no `<style>`, no `style={{}}`. The only CSS allowed is what Tailwind/shadcn ship, never edited. Sole exception: a genuinely runtime-dynamic value, flowed through a CSS variable consumed by an arbitrary-value utility — never an ad-hoc `style` prop.
2. **Modern components over native.** Native `<select>`, `<input type=checkbox|radio|range>` and native number spinners are forbidden in user-facing UI. Use shadcn `Select`/`Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Calendar+Popover`; for numeric entry use a masked/formatted input (§9), not the browser stepper.
3. **Color/state through tokens and variants, never ad-hoc.** Semantic state uses shadcn `variant`, never `bg-red-500` to *mean* destructive.
4. **Class hygiene.** No redundant variants (write the base class when light/dark or any variant share a value; `dark:`/`hover:`/`md:` are reserved for divergence). No two utilities on the same property. Conditional overrides go through `cn()`/`tailwind-merge` so exactly one value reaches the DOM.
5. **Mobile-first, three viewports, always.** Base = mobile; `md:` (tablet), `lg:` (desktop) layer up. Never assume a higher breakpoint covers a lower one.
6. **Motion is mandatory on overlays** (§7) and **`motion-reduce` is explicit on every new entrance** (§7.7).

---

## 2. The three dials — calibrate before you build

Every screen is a point in a 3-axis space. Decide these **before** writing markup; they govern every downstream choice. An LLM on autopilot collapses to the statistical average (the AI-generic look) — these dials are how you escape it.

| Dial | Low | High |
|------|-----|------|
| **Variance** (order ↔ expression) | symmetric, grid-locked, enterprise | asymmetric, editorial, expressive |
| **Motion** (still ↔ animated) | near-static, utilitarian | rich, playful, physical |
| **Density** (gallery ↔ cockpit) | huge whitespace, few elements | compact, data-rich, 1px dividers |

- A **banking dashboard** is low-variance, low-motion, high-density. A **creative studio landing** is high-variance, high-motion, low-density. Never build a landing with dashboard density, or a data table with landing whitespace.
- **Density is a decision.** Low (1–3): generous gaps, content breathes, reads expensive. High (8–10): minimal padding, `1px` dividers instead of cards, `font-mono`/`tabular-nums` on figures.

---

## 3. Color with judgment

- **One accent, maximum.** A single accent hue carries interaction and brand; everything else is neutral.
- **Neutral base, honest neutrals, consistent temperature.** Build on a true neutral ramp (Zinc/Slate/Neutral); never mix warm and cool grays.
- **Dark mode is derived from neutrals, not from a brand color.** A frequent failure: painting every dark surface with the raw deep-brand color. Wrong. In dark, surfaces come from cool near-black neutrals (Tailwind's ramp) tuned toward the brand hue, with the brand reserved as the single accent. `bg-background`/`bg-card` in dark = neutral-950-ish tinted, *not* `#001440` on everything.
- **Never pure black/white for large surfaces** — use off-black and off-white. **Desaturate the accent** (<~80%) so it integrates.
- **No neon-purple / electric-blue gradient** — the AI-default palette — unless the brand genuinely owns it.
- **Tokens, not literals.** Color lives in shadcn/Tailwind theme tokens (`--primary`, `bg-muted`, `border`). Ad-hoc hex in a component is a defect.
- **`dark:` only when the value differs** from light.
- **Contrast is a requirement:** body/UI text ≥ **4.5:1**; large text (≥24px or ≥19px bold) and UI boundaries ≥ **3:1** — verified against computed backgrounds, including tinted/translucent surfaces.

---

## 4. Typography & hierarchy

- **Hierarchy from weight and color, not size.** Separate levels with weight and a muted/loud color contrast first; scale up only for a genuine display moment.
- **Body:** ~15–16px, `leading-relaxed` (1.5–1.6, never <1.4), measure `max-w-[65ch]`, muted foreground (not full-contrast black).
- **Display:** `text-4xl md:text-6xl tracking-tighter leading-none`.
- **Numbers:** `tabular-nums` in any column or changing value; `font-mono` for dense figures.
- **Font signals the tier:** avoid defaulting to Inter for "premium"; Geist/Outfit/Satoshi/Cabinet Grotesk read more intentional. Serif only for editorial.
- **Typographic correctness:** real `…`, curly quotes, non-breaking space in `10 MB`/`⌘ K`/brands, `text-wrap: balance`/`text-pretty` on headings.

---

## 5. Space, layout & density

- **Grid over flex-math** (`grid-cols-*`, never `w-[calc(33%-1rem)]`). **Contain the measure** in `max-w-7xl mx-auto`. Stick to the spacing ramp; padding must feel mathematically even.
- **Break the 3-equal-cards reflex** — prefer a 2-column zig-zag, asymmetric/bento grid, or horizontal scroll at high variance. **Anti-center** for expressive layouts (split 50/50 or left-aligned with a right-side asset).
- **Shallow trees** — most layouts resolve with flex/gap on one container; recursive nesting that reproduces flex/grid is a defect.

---

## 6. Depth, elevation & shape

- **Cards are not the default container** — use one only when elevation communicates separation; at higher density group with `border-t`/`divide-y`/whitespace.
- **Shadows are tinted, wide, soft, low-opacity** — never a hard default `box-shadow`, never outer glows. Exaggerated drop shadows are a defect.
- **Glass done right:** `backdrop-blur` + 1px inner border (`border-white/10`) + subtle inner shadow; blur `<20px`.
- **Radius is coherent** across primitives; nested containers share the radius scale.
- **Z-index follows the source:** in-house overlays use Tailwind z utilities; third-party primitives manage their own layering.

---

## 7. Motion — the craft that makes it feel alive

### 7.1 When to animate (by frequency)
- **100+/day** (shortcuts, command palette): **never animate.**
- **Dozens/day** (hover, nav): reduce drastically.
- **Occasional** (modals, drawers, toasts): standard.
- **Rare/first-run** (onboarding): delight allowed.
- Every animation needs a purpose (spatial consistency, state, explanation, feedback, softening). "Looks cool" but seen often → don't animate.

### 7.2 Timing & easing
- **Durations:** press 100–160ms; tooltips/small popovers 125–200ms; dropdowns 150–250ms; modals/drawers 200–500ms. **Hard rule: UI motion <300ms.**
- **Custom eases** (stock CSS curves are weak): enter/exit `cubic-bezier(0.23,1,0.32,1)`; on-screen move `cubic-bezier(0.77,0,0.175,1)`; drawers `cubic-bezier(0.32,0.72,0,1)`; hover/color plain `ease`; constant motion `linear`.
- **Never `ease-in` for UI** (feels sluggish). **Exit faster than enter.**

### 7.3 Overlays
- **Origin-aware** for anchored overlays (`transform-origin: var(--radix-*-transform-origin)`), not center — **modals stay centered.**
- **Never `scale(0)`** — enter from `scale(0.95)+opacity:0`. Prefer shadcn `data-[state=open]:animate-in`.
- **Tooltips:** delay the first; subsequent open instantly.

### 7.4 Feedback & ripple
- `active:scale-[0.97]` with `transition-transform duration-150 ease-out`. Don't strip tap feedback.
- Hold-to-confirm: animate a `clip-path` fill over the hold.

### 7.5 Avoiding hard cuts
- **Transitions, not keyframes**, for rapidly re-triggered UI.
- **Blur masks crossfades** (`filter:blur(2px)`, <20px). Springs preserve velocity on interruption.

### 7.6 Spring vs tween & performance
- Spring for drag/interruptible/"alive" (`{type:"spring",duration:0.5,bounce:0.2}`, bounce 0.1–0.3).
- **Animate only `transform`/`opacity`** (GPU); never `width`/`height`/`margin`/`top`. Don't drive motion by mutating parent CSS vars.

### 7.7 Reduced motion
- `prefers-reduced-motion` **reduces, not deletes** (keep opacity/color, drop movement).
- Every new entrance carries `motion-reduce:animate-none`. Gate hover with `@media (hover:hover) and (pointer:fine)`.

### 7.8 Invisible details
- Perceived speed *is* speed. Stagger list entrances 30–80ms. Match easing to component personality. Review animations the next day and frame-by-frame.

---

## 8. Interaction, states, accessibility & cursor

Every interactive element ships its **full state set**, and correctness is verifiable by reading the code.

- **Semantics first:** `<button>` for actions, `<a>`/`<Link>` for navigation. `<div onClick>` is a defect. ARIA only after semantic HTML can't express it.
- **Complete states:** `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `empty`. States **increase contrast** vs rest.
- **Focus audit (do it explicitly):** every focusable element has a visible `focus-visible:ring-*`; never `outline-none` without a replacement; prefer `:focus-visible` over `:focus`; `:focus-within` for composite controls. Tab through the whole view and confirm nothing focusable is invisible or trapped.
- **Cursor semantics:** `cursor-pointer` on buttons/links/clickable rows; `cursor-text` on text inputs; `cursor-not-allowed` on disabled; default on non-interactive content. A clickable element with a default arrow, or a non-interactive one with a pointer, is a defect.
- **Icon-only buttons need `aria-label`;** decorative icons `aria-hidden`; every `<img>` has `alt`. Async updates announce via `aria-live="polite"`.
- **Touch:** `touch-action: manipulation`; `overscroll-behavior: contain` on modals/drawers/sheets; disable text selection + `inert` on the dragged node.

---

## 9. Forms

- **Native affordances on:** meaningful `name` + `autocomplete`; correct `type`/`inputmode`; clickable labels; `spellCheck={false}` on emails/codes.
- **Numeric inputs are never the raw browser spinner.** Use a masked/formatted numeric input (`inputmode="decimal"` + thousands/decimal masking, currency/locale aware). Money and quantities format as the user types.
- **Never block paste.** Checkbox/radio share one hit target.
- **Validation timing:** API-backed rules on **blur**; local rules on **input**.
- **Submit stays enabled until the request starts**, then shows a spinner.
- **On submit, render errors inline and focus the first error.**
- **Placeholders end in `…`** with a concrete example.
- **Warn on unsaved-changes navigation.**

---

## 10. Overflow, text & empty states

- **Anticipate short/medium/very-long content.** Overflow via `truncate`/`line-clamp-*`/`break-words`.
- **Flex children need `min-w-0`** or truncate silently fails. Wrap naturally by default; `line-clamp` only on real overflow.
- **Empty states are designed:** custom illustration + explanatory text + CTA. Never render broken UI from an empty string/array.
- **Lists over ~50 items virtualize.**

---

## 11. Data-driven components & cards

*(Casing, folder anatomy, import scope come from `clean-code`; here we govern composition and data flow.)*

- **Shared primitives are single and generic** — dropdowns, dialogs, sheets, tooltips, buttons, inputs, cards, tables live once; views consume, never fork. `Card` owns global structure (border, radius, elevation, anatomy); each view customizes via composition/classes.
- **Cards are self-contained by default.** One card ↔ one API resource → it fetches its own data, owns its loading/error, blast radius = one card. Receiving primary data via props is forbidden there; props are accepted only when a higher-level endpoint returns the collection as a unit.
- **A card that needs several endpoints composes them** — `Promise.all([api.get(a), api.get(b)])` into a single state/loading/error. Do **not** invent one artificial endpoint per card, and do **not** serialize independent calls.
- **Live data, not static snapshots.** A metric card exposes freshness: a manual **refresh** control and/or **auto-reload** (interval or on focus/visibility) hitting its own endpoint. A dashboard of numbers that never updates after first paint is a defect — plan refresh from the start.
- **Abstractions earn their place** (a 4-line status→color component is microfragmentation — inline it). **Equivalent views share composition** (same loading/empty/error shape). **`memo()` only with primitive props.** **Don't reimplement the framework.**

---

## 12. Loading, skeletons & perceived performance

- **Skeleton whenever the final layout is known**, matched to the eventual shape (zero shift). Spinners only for punctual actions.
- **Skeletons shimmer (`animate-sheen`), not pulse**, and respect `motion-reduce`.
- Wrap lazy data in `<Suspense fallback={<XSkeleton/>}>`. **Mount overlays on first open and keep them mounted** so the exit animates.
- **Lazy-load heavy/off-screen work** (`next/dynamic`, `IntersectionObserver`/`useInView` `rootMargin:"200px"`, `prefetch`).
- **Prevent CLS** (`<img>` w/h, `font-display:swap`, no layout reads in render). Loading copy ends in `…`.

---

## 13. App shell & navigation

Plan the shell in Part 0, build it here. Canonical hierarchy: `LAYOUT → NAVBAR + (BODY: DRAWER | MAIN)` + `FOOTER`.

- **Drawer = global nav; Sidebar = sub-section nav inside `MAIN`.**
- **The drawer is responsive and self-collapsing**, not just a burger: on desktop it persists open/collapsed state (localStorage) and offers a rail mode (collapses to an icon rail, expands on hover or toggle); on mobile it defaults closed as a sheet. A drawer that only toggles fully-open/fully-closed is the minimum, not the target.
- **Footer is mandatory** for any real site/app: it anchors secondary navigation, legal/links, locale/theme and status — and is what SEO and a complete browsing experience require. A site with no footer is incomplete.
- **Global search is a first-class surface:** a central search (navbar input + `⌘K`/`Ctrl+K` command palette) that queries **any filterable resource** (accounts, transactions, invoices, actions, navigation). It turns a set of pages into a system. Every shortcut is documented inside it.
- **Personalized hero on dashboards:** greet by time-of-day, day, locale and user ("Buenas noches, Valentina") — a small, human, localized touch at the top of the main view, not a generic title.
- **Scroll is designed, never native:** `tailwind-scrollbar` on local containers; a smooth-scroll library on the main long-form surface.
- **Responsive patterns by viewport** (all descend from the mobile-first law, §1):

| Concern | Mobile | Tablet / Desktop |
|---------|--------|------------------|
| Feedback | `active:`/`focus:` | `hover:` |
| Navigation context | Back button | Breadcrumbs |
| Reorder | up/down buttons | drag & drop |
| Route transition | horizontal slide | none (instant) |
| Diff view | inline unified | side-by-side |
| Drawer | sheet, closed by default | persists; rail/autocollapse |

---

## 14. Browser platform — offline, real-time & PWA

Design the experience hand-in-hand with the API and the platform, not as an afterthought:

- **Offline & cache:** a service worker with an explicit strategy (app-shell precache, network-first for navigations, cache-first for assets); an offline indicator (full-width bar) with a recovery confirmation. Cache API + Request for resilient data.
- **Real-time:** where the API supports it, reflect live updates (WebSocket/SSE/polling) into the same self-contained cards — a balance that changes should surface without a manual reload.
- **Proactive notifications:** the Notifications API + service worker are not just for "action done" toasts — use them for **reminders and alarms tied to the data**: overdue invoices, upcoming investment maturities, budget overruns. Request permission contextually; schedule/emit from the SW.
- **PWA:** `manifest` + installability + icons + theme-color, so the app is installable and standalone.
- **File handling:** uploads (receipts, attachments) via drag-&-drop + picker with per-file thumbnail/preview and per-file progress; use modern file APIs.

---

## 15. UX pattern catalog

Standing decisions — apply by default:

- **All lists use infinite scroll** driven by the API's pagination (cursor if available, else offset/limit). Manual pagination bars do not belong in standard lists — plan this in §0.2, not as an afterthought.
- **Destructive actions:** confirm dialog + `beforeunload` protection. **Notifications:** `Toast` over `Alert`.
- **Tables:** sort on headers *only when the API supports it*; filters in a toolbar above; bulk = per-row checkbox + persistent toolbar.
- **Autocomplete:** loader inside the dropdown; debounce by cost (autocomplete 300ms, list 500ms, heavy on submit).
- **Button loading:** `loading` disables, swaps the leading icon for a spinner, keeps the label, sets `aria-busy`.
- **Formatting via `Intl.*`** in the user's locale. **Dark mode** via `dark` class on `<html>` + FOUC-guard script. **Images optimized** (`next/image`).

---

## 16. Content realism & voice

- **Data is organic** (`47.2%`, not `50%`; real-shaped names/phones — never `John Doe`, `Acme`, egg avatars). **No emoji** in UI/copy/`alt` — use one icon library with a standardized `strokeWidth`.
- **Copy is specific and active** (Title Case, numerals, concrete verbs — "Save API Key" not "Continue"); errors state the fix. Mockups reflect the real product — never invent capabilities to fill space.
- **i18n real:** JSON per locale + `useTranslation()`; no hardcoded copy in components.

---

## 17. Advanced — decouple render from input when layers collide

When two layout requirements seem mutually exclusive (a carousel *fixed behind* content that must stay *swipeable*, a sticky header the body scrolls *over*), the impossibility is in your composition: paint order (z-index) is deciding both what's on top **and** who gets the gesture — but render and input-routing are separable. Leave the element where it must be visually; put a transparent layer in front that intercepts only the gesture you need and delegates it; lift control to a common ancestor. *When two things won't coexist, suspect the lever that binds them before the requirement you were about to sacrifice.*

---

## 18. Delight & signature craft — reject the generated look

The default an LLM reaches for is the tell that a machine made it: violet-to-cyan gradients, glass on everything, static cards in a 3-up grid, flat monochrome icons that never move, hero blobs, "AI purple." **Refuse it.** The reference standard is real product craft — Meta's blue system, Google's Material motion (ripples, buffers, shared-element transitions), Linear/Stripe restraint, and the small joys those teams ship. A screen that could have come from any prompt is a failure even if it "looks clean".

**Signature interactions — build these, don't just admire them:**
- **Expressive toggles/likes:** the Twitter heart that bursts into particles on like; a save/bookmark that fills and springs; a reaction bar that scales the chosen emoji. State changes are *events*, not silent swaps.
- **Confirming actions morph:** copy → the icon crossfades to a check for ~1.2s; "add" → check; follow → following. The button *tells you it worked* without needing a toast.
- **Animated, meaningful SVG** over static monochrome: icons that morph on state (menu↔close, play↔pause, chevron rotate), a logo that draws once on load, illustrations with a looping accent. Lottie/inline-`animate` where it earns the attention.
- **Living avatars:** presence rings, hover-to-play, tasteful status decoration (a subtle ring/badge for a verified/paid/pro account — the "Google paid account" cue), stacked avatar groups with an overflow `+N`.
- **Expressive metrics:** count-up on numbers entering view, progress bars/rings that fill from 0, a sparkline that draws left-to-right, delta chips that pulse on change. Ratings are interactive stars that fill on hover, never static glyphs.
- **Floating surfaces:** rich popovers/hovercards (profile preview on avatar hover, definition on term hover), a MUI-style floating IconMenu / speed-dial for grouped actions, tooltips on every non-obvious control (delayed first, instant after — §7.3).
- **Smooth scroll, never dry:** momentum/eased scrolling on the main long surface, scroll-linked reveals (fade/rise on enter, staggered per §7.8), a scroll-progress indicator on long reads, sticky section headers that hand off.

**Component sources — don't hand-roll what a library ships better.** shadcn is the *base*, not the ceiling. Pull richer, animated pieces from **Magic UI, Aceternity, motion-primitives, React Bits** (shimmer, marquee, animated-number, border-beam, reveal) — used with taste (§7 frequency), layered on the token system, never as a gradient dump. Inventory these in §0.1 and choose them in §0.2's delight pass.

**Creativity quotas — the plan guarantees delight, it does not hope for it:**
- **Every primary flow** ships **≥1 signature interaction** — never a screen of purely inert elements.
- **Every action icon animates** on its state change (hover / active / success), never a static swap.
- **Every empty, loading, and success state has personality** — illustration or motion, not bare text (§10, §12).
- **Every dense/data surface earns** hover affordances — tooltips, hovercards, or popovers that reveal detail on demand.
- **Motion has range:** at least one moment of *character* per view (a burst, a draw-on, a springy reveal), balanced against §7.1 — restraint on the 100×/day controls, delight on the rare/first-run ones.

Delight is **planned in §0.2 and audited in the ship gate**, never sprinkled on at the end. If a design has no signature moment, it is not finished — it is generic.

---

## 19. Ship gate — verify before done

Binary checklist. Most items are auditable by reading the diff — each must be true, not explained:

- **Lifecycle:** contract known or task paused · roadmap in `.claude/*.md` · full CRUD per entity · views map to real services · multi-endpoint cards use `Promise.all` · refined + compressed before delivery · nothing on guessed data.
- **Laws:** Tailwind-only · no `style=`/`<style>`/`.css` · no ad-hoc state colors · no redundant/conflicting utilities · tokens not literals · no native number spinner.
- **Color:** one accent · dark surfaces from cool neutrals (not raw brand-dark) · contrast ≥4.5:1 / 3:1.
- **Responsive:** mobile + tablet + desktop · base = mobile.
- **States & cursor:** hover/focus-visible/active/disabled/loading/error/empty present · focus visible everywhere (tab-tested) · correct `cursor-*`.
- **Motion:** overlays animate · <300ms · `ease-out` enter · only `transform`/`opacity` · `motion-reduce:animate-none` on new entrances.
- **Data UI:** cards self-contained with refresh/auto-reload · live where the API allows · skeletons (sheen) match final layout · no CLS.
- **Shell:** responsive/autocollapsing drawer · footer present · global search over filterable resources · personalized hero · infinite scroll on lists.
- **Platform:** offline/cache + SW · proactive notifications for data reminders · PWA installable · file upload with preview/progress.
- **Overflow & semantics:** long/short handled · `min-w-0` on truncating flex children · `<button>`/`<a>` not `<div onClick>` · `aria-label` on icon buttons · render audited (no `Slot`/`asChild` single-child).
- **Taste:** dials calibrated · hierarchy by weight/color · realistic content · no emoji · no 3-equal-card autopilot · tinted subtle shadows.
- **Delight (§18):** not the AI-generic look · ≥1 signature interaction per primary flow · action icons animate on state · like/copy/save give rich feedback · empty/loading/success states have personality · dense surfaces earn tooltips/popovers · smooth scroll · animated SVG over static monochrome.

When the RAG holds a preference touching any of the above, it overrides this skill — query it before finalizing a visual decision.
