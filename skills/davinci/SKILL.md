---
name: davinci
description: >
  Da Vinci is the UI/UX craft skill — it makes interfaces look expensive and feel alive.
  Load it whenever the task involves building, modifying, styling, reviewing, or redesigning
  any visual surface: pages, components, dashboards, landing pages, layouts, responsive
  behavior, interaction states, motion, forms, color, typography, spacing, elevation, or
  loading experiences. It unifies taste (what reads as refined), motion craft (timing,
  easing, overlays, micro-interactions), and verifiable interface guidelines (accessibility,
  states, overflow, forms) on top of the user's non-negotiable laws (Tailwind-only, shadcn
  over native, mobile-first). Triggers on "diseño", "design", "UI", "UX", "layout",
  "responsive", "componente", "rediseño", "estilos", "Tailwind", "shadcn", "frontend",
  "animation", "motion", "color", "theme", "landing", "dashboard", "page", "modal", "card".
  Da Vinci owns visual and interaction decisions; file/folder naming and code structure come
  from `clean-code`. When Da Vinci and the RAG disagree, the RAG wins.
---

# Da Vinci — UI/UX Design & Craft

Da Vinci is the authority for every visual and interaction decision. Its job is not decoration — it is to make software read as **refined, deliberate, and premium**, and feel **fluid and responsive**, while staying correct and accessible. The rules below are contracts. Violating one is a defect even when the screen "looks fine".

This skill unifies four bodies of knowledge into one:
- **Taste** — what separates a refined interface from a generic one.
- **Motion craft** — timing, easing, and the invisible details that make software feel alive.
- **Interface guidelines** — the verifiable rules (accessibility, states, overflow, forms) that keep it correct.
- **The user's laws** — the non-negotiables already established in this project.

**Authority order:** the RAG (live user preferences) > this skill > general defaults. Code-level concerns — file/folder naming, import scope, control flow, helper extraction — belong to `clean-code`; Da Vinci governs the *visual and interaction* layer. Where they overlap on component anatomy, casing comes from `clean-code`, composition comes from here.

---

## 0. The three dials — calibrate before you build

Every screen is a point in a 3-axis space. Decide these **before** writing markup; they govern every downstream choice. An LLM left on autopilot collapses to the statistical average (the "AI-generic" look) — these dials are how you escape it.

| Dial | Low | High |
|------|-----|------|
| **Variance** (order ↔ expression) | symmetric, grid-locked, enterprise | asymmetric, editorial, expressive |
| **Motion** (still ↔ animated) | near-static, utilitarian | rich, playful, physical |
| **Density** (gallery ↔ cockpit) | huge whitespace, few elements | compact, data-rich, 1px dividers |

- A **banking dashboard** is low-variance, low-motion, high-density. A **creative studio landing** is high-variance, high-motion, low-density. Never build a landing page with dashboard density, or a data table with landing-page whitespace.
- **Density is a decision, not an accident.** Low density (1–3): generous gaps, content "breathes", reads as expensive. High density (8–10): minimal padding, `1px` dividers instead of cards, `font-mono`/`tabular-nums` on figures, everything compact.
- Motion intensity scales the whole motion section below. Low ≠ zero; it means only functional motion survives.

When unsure of the target, infer it from the domain and ask via `AskUserQuestion` only if two very different points are plausible.

---

## 1. Non-negotiable laws

These never bend (they are also the user's standing law):

1. **Tailwind utilities only.** No custom `.css` files, no `<style>` blocks, no `style={{}}` attributes. The only CSS allowed is what Tailwind/shadcn ship, and those vendor files are never edited. The single exception is a genuinely runtime-dynamic value, which must flow through a CSS variable consumed by an arbitrary-value utility (`[--x:...] w-[var(--x)]`), never an ad-hoc `style` prop.
2. **Modern components over native.** Native `<select>`, `<input type=checkbox|radio|range>` are forbidden in user-facing UI. Use shadcn `Select`/`Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Calendar+Popover`.
3. **Color/state through tokens and variants, never ad-hoc.** Semantic state uses shadcn `variant` (`Button variant="destructive"`), never `bg-red-500` to *mean* destructive. See §2.
4. **Class hygiene.** No redundant variants — write the base class when light/dark (or any variant) share a value; `dark:`/`hover:`/`md:` are reserved for when the value *diverges*. No two utilities targeting the same property in one list (`p-4 p-2`, `flex grid`). Conditional overrides go through a single source of truth (`cn()`/`tailwind-merge`) so exactly one value reaches the DOM.
5. **Mobile-first, three viewports, always.** Base classes describe mobile; `md:` (tablet) and `lg:` (desktop) layer up. Never assume a higher breakpoint covers a lower one. This is not optional.
6. **Motion is mandatory on overlays** (§6) and **`motion-reduce` is explicit on every new entrance** (§6.7).

```tsx
// BAD — ad-hoc color for state, redundant dark, style attr, native select
<div style={{ marginTop: 8 }} className="text-black dark:text-black">
  <span className="text-green-600">Active</span>
  <select>...</select>
</div>

// GOOD
<div className="mt-2 text-neutral-900 dark:text-neutral-100">
  <Badge variant="success">Active</Badge>
  <Select>...</Select>
</div>
```

---

## 2. Color with judgment

Da Vinci does not hand you a palette — it teaches you to choose one that doesn't look generic.

- **One accent, maximum.** A single accent hue carries interaction and brand. Everything else is neutral. Two competing accents read as unresolved.
- **Neutral base, honest neutrals.** Build on a true neutral ramp (Zinc/Slate/Neutral). Keep **temperature consistent** — never mix warm and cool grays in one product.
- **Never pure black or pure white for large surfaces.** `#000`/`#fff` are harsh; use off-black (`neutral-950`, charcoal) and off-white. Reserve maximum contrast for text that needs it.
- **Desaturate to integrate.** An accent above ~80% saturation screams. Pull saturation down so it sits *inside* the neutral world, not on top of it.
- **The Lila ban.** The default neon purple/electric-blue gradient is the tell of AI-generated UI. Avoid it unless the brand genuinely owns it.
- **Tokens, not literals.** Color lives in shadcn/Tailwind theme tokens (`bg-background`, `text-muted-foreground`, `border`, `primary`). Ad-hoc `bg-[#3b82f6]` in a component is a defect — it can't be re-themed and it drifts.
- **`dark:` only when the value differs.** Same value in both themes → base class only (`text-neutral-500`). Different → `text-neutral-600 dark:text-neutral-400`. (User law.)
- **Contrast is a requirement, not a preference.** Body/UI text ≥ **4.5:1** against its background; large text (≥24px or ≥19px bold) and UI boundaries ≥ **3:1**. Verify computed foreground against computed background, including inside tinted/translucent surfaces.

---

## 3. Typography & hierarchy

- **Hierarchy comes from weight and color, not size.** Resist the giant heading that "shouts". Separate levels with `font-weight` and a muted/loud color contrast first; scale up only when the layout genuinely calls for a display moment.
- **Body:** ~15–16px, `leading-relaxed` (1.5–1.6, never below 1.4), measure capped at `max-w-[65ch]`, in a *muted* foreground (`text-muted-foreground`), not full-contrast black.
- **Display:** `text-4xl md:text-6xl tracking-tighter leading-none` when you do go big; tighten tracking as size grows.
- **Numbers:** `tabular-nums` in any column or changing value so digits don't jitter; `font-mono` for dense figure-heavy contexts.
- **Font choice signals the tier.** For "premium/creative", avoid defaulting to Inter (it's the safe average); Geist, Outfit, Satoshi, Cabinet Grotesk read more intentional. Serif only for editorial, never a dashboard.
- **Typographic correctness** (verifiable): real ellipsis `…` not `...`; curly quotes; non-breaking space in `10 MB`, `⌘ K`, brand names; `text-wrap: balance`/`text-pretty` on headings to kill orphans/widows.

---

## 4. Space, layout & density

- **Plan the layout first.** Decide the skeleton before any component: `LAYOUT → NAVBAR + (BODY: DRAWER | MAIN)`. Drawer = global app nav (desktop persists open/closed, mobile defaults closed). Sidebar = sub-section nav *inside* MAIN (e.g. Settings).
- **Grid over flex-math.** Use `grid-cols-*` for structured layouts; never fake columns with `w-[calc(33%-1rem)]`. Flex for one-dimensional flows.
- **Contain the measure.** Wrap content in `max-w-7xl mx-auto` (or a chosen max) — full-bleed body text is a tell of an unplanned page.
- **Consistent spacing scale.** Stick to the Tailwind spacing ramp; don't scatter arbitrary `gap-[13px]`. Padding should feel mathematically even, not "roughly aligned".
- **Break the 3-equal-cards reflex.** A row of three identical horizontal cards is the generic default. Prefer a 2-column zig-zag, an asymmetric/bento grid, or horizontal scroll when variance is high.
- **Anti-center for expressive layouts.** A centered hero is fine at low variance; at high variance, split 50/50 or left-align with an asset on the right.
- **Shallow trees.** Most layouts resolve with flex/gap utilities on one container. Recursive nesting that reproduces what `flex`/`grid` already does is a defect (§ clean-code covers structure).

---

## 5. Depth, elevation & shape

- **Cards are not the default container.** Use a card only when elevation *communicates* separation or grouping. At higher density, group with `border-t`/`divide-y`/whitespace instead — metrics that "float" on the page read more refined than boxes-in-boxes.
- **Shadows are tinted and diffuse, never generic.** A real shadow is wide, soft, low-opacity, and tinted toward the background/surface tone — not a hard default `box-shadow`. Never use outer glows or neon halos. Exaggerated drop shadows are a defect.
- **Glass done right.** `backdrop-blur` alone looks cheap. Real glass adds a 1px inner border (`border-white/10`) and a subtle inner shadow to fake the refraction at the edge. Keep blur radius modest (`<20px`, expensive in Safari).
- **Radius is coherent.** Border-radius is consistent across primitives; nested containers share the radius scale (a large container carries a large unified radius, inner elements a proportionally smaller one). Mismatched radii read as accidental.
- **Z-index follows the source.** In-house overlays use Tailwind z utilities (`z-10`, `z-20`); third-party primitives (shadcn) already manage layering — consume as-is, never override.

---

## 6. Motion — the craft that makes it feel alive

Motion is where "correct" becomes "premium". It is also where most UIs go wrong, in both directions: dead hard-cuts and gratuitous animation.

### 6.1 When to animate (by frequency)
The single best predictor of "should this animate" is **how often the user sees it**:
- **100+/day** (keyboard shortcuts, command palette, actions the user *drives* with the keyboard): **no animation, ever.** Animating a keyboard-triggered action makes it feel slow and disconnected.
- **Dozens/day** (hover, nav): reduce drastically or remove.
- **Occasional** (modals, drawers, toasts): standard animation.
- **Rare / first-run** (onboarding): delight is allowed.

Every animation needs a purpose: spatial consistency, state indication, explanation, feedback, or softening an abrupt change. "It looks cool" + seen often → don't animate.

### 6.2 Timing & easing (concrete)
- **Durations:** press feedback 100–160ms; tooltips/small popovers 125–200ms; dropdowns/selects 150–250ms; modals/drawers 200–500ms. **Hard rule: interface motion stays under 300ms** (large surfaces excepted).
- **The stock CSS curves are weak.** Define custom eases:
  - Enter/exit → `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`
  - On-screen move/morph → `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`
  - Drawers → `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` (iOS feel)
  - Hover/color → plain `ease`; constant motion (marquee, progress) → `linear`.
- **Never `ease-in` for UI.** It starts slow and feels sluggish. `ease-out` at 200ms *feels faster* than `ease-in` at 200ms because the eye tracks the initial movement.
- **Exit faster than enter.** Slow where the user decides, fast where the system responds.

### 6.3 Overlays (open/close)
- **Origin-aware for anchored overlays.** Popovers, tooltips, dropdowns scale from their trigger: `transform-origin: var(--radix-popover-content-transform-origin)` (Radix) — not center. **Modals are the exception**: they stay centered (not anchored to a trigger).
- **Never `scale(0)`** — nothing should appear from a single point. Enter from `scale(0.95)` + `opacity:0`.
- Prefer shadcn's `data-[state=open]:animate-in` / `data-[state=closed]:animate-out` (via `tailwindcss-animate`); modern zero-JS entrance is `@starting-style` with a `data-mounted` fallback.
- **Tooltips:** delay the *first* one; subsequent tooltips open instantly with no animation (`[data-instant]{transition-duration:0}`).

### 6.4 Feedback & ripple
- Buttons press in: `active:scale-[0.97]` with `transition-transform duration-150 ease-out` (subtle, 0.95–0.98). `scale()` also scales children — that's the point.
- Provide touch feedback; do not strip `-webkit-tap-highlight` without an intentional replacement.
- Hold-to-confirm (destructive): animate a `clip-path: inset(0 100% 0 0)` → `inset(0)` fill over the hold, snap back on release (asymmetric timing).

### 6.5 Avoiding hard cuts
- **Transitions, not keyframes**, for rapidly re-triggered UI (toasts, quickly reopened menus): transitions retarget mid-flight; keyframes restart from zero and stutter.
- **Blur masks imperfect crossfades:** a brief `filter: blur(2px)` during a state swap blends the two states. Keep `<20px`.
- Springs preserve velocity when interrupted (a drawer reverses smoothly on Escape); CSS transitions restart.

### 6.6 Spring vs tween & performance
- **Spring** for drag with momentum, interruptible gestures, "alive" elements. Sane default: `{ type: "spring", duration: 0.5, bounce: 0.2 }`; keep bounce 0.1–0.3, avoid bounce in serious UI. **Tween** for everything deterministic.
- **Animate only `transform` and `opacity`** — they skip layout/paint and run on the GPU. Never animate `width`/`height`/`margin`/`padding`/`top`/`left`.
- Don't mutate CSS variables on a parent to drive motion (it recalculates every child); set `transform` on the moving element directly.
- Percentages adapt: `translateY(100%)` slides a sheet fully regardless of its height.

### 6.7 Reduced motion (mandatory)
- **`prefers-reduced-motion` reduces, it doesn't delete.** Keep opacity/color transitions that aid comprehension; drop *movement* and *position* animation.
- Every new entrance ships an explicit escape: pair the animation with `motion-reduce:animate-none` (user law — `motion-reduce` is declared per new entrance, not assumed global).
- Gate hover behind capability: `@media (hover: hover) and (pointer: fine)` so touch devices don't fire a phantom hover on tap.

### 6.8 Invisible details (the difference)
Perceived speed *is* speed — a faster spinner reads as a faster load. Stagger list entrances 30–80ms per item. Match a component's easing/duration to its personality (a calm toast uses a slow elegant `ease`, not a snappy `ease-out`). Review animations the next day and frame-by-frame. Handle edge cases silently (pause timers when the tab is hidden).

---

## 7. Interaction states & accessibility

Every interactive element ships its **full state set**, and correctness is verifiable by reading the code.

- **Semantics first.** `<button>` for actions, `<a>`/`<Link>` for navigation. `<div onClick>` is a defect (no focus, no keyboard, no role). ARIA only after semantic HTML can't express it.
- **Complete states:** `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, and `empty`. Missing any is incomplete.
- **States must increase contrast.** Hover/active/focus make an element *more* prominent than rest, not merely different.
- **Focus is always visible.** `focus-visible:ring-2` (or equivalent); never `outline-none` without a replacement. Prefer `:focus-visible` over `:focus` (no ring on mouse click); use `:focus-within` for composite controls.
- **Icon-only buttons need `aria-label`;** decorative icons get `aria-hidden="true"`; every `<img>` has `alt` (or `alt=""` if decorative).
- **Async updates announce:** toasts and live validation live in an `aria-live="polite"` region.
- **Keyboard & touch:** logical heading order (h1–h6) + a skip link to main; `scroll-margin-top` on heading anchors; `touch-action: manipulation` to kill the 300ms double-tap delay; `overscroll-behavior: contain` on modals/drawers/sheets; disable text selection and mark the dragged node `inert` during drag.

---

## 8. Forms

- **Native affordances on:** meaningful `name` + `autocomplete`; correct `type`/`inputmode` (`email`/`tel`/`url`/`number`); labels are clickable (`htmlFor` or wrapping the control); `spellCheck={false}` on emails/codes/usernames.
- **Never block paste** (`onPaste`+`preventDefault` is user-hostile). Checkbox/radio and their labels share one hit target — no dead zones.
- **Validation timing (user law):** API-backed rules (uniqueness, server checks) fire on **blur**, never per keystroke. Local rules (format, length, required, regex) fire on **input** for instant feedback.
- **Submit stays enabled until the request starts**, then shows a spinner (don't gate submit on a "valid" flag the user can't see); on submit, render errors inline next to each field and **move focus to the first error**.
- **Placeholders end in `…`** and show an example pattern. Warn before navigating away with unsaved changes (`beforeunload`).

---

## 9. Overflow, text & empty states

- **Anticipate short, medium, and very long content** for every text slot. Handle overflow with `truncate` / `line-clamp-*` / `break-words`. **Flex children need `min-w-0`** or `truncate` silently fails — a classic, invisible bug.
- **Wrap naturally by default; `line-clamp` only on real overflow**, never preemptively (truncation hides information — preserve it when the layout allows).
- **Empty states are designed:** a custom illustration (not a bare icon) + explanatory text + a CTA to act. A blank surface or a lone sentence is not an acceptable empty state. Never render broken UI from an empty string/array.
- **Lists over ~50 items virtualize** (`virtua`, `content-visibility:auto`).

---

## 10. Loading, skeletons & perceived performance

- **Skeleton whenever the final layout is known;** it matches the eventual shape so there's zero shift when data lands. Spinners are only for punctual actions (submit, manual refresh) where there's no layout to preview. Replacing a skeleton with a spinner is a downgrade.
- **Skeletons shimmer, they don't pulse.** Use a light-sweep (`animate-sheen`), not opacity pulse, and respect `motion-reduce`. (User pattern.)
- Wrap lazy data in `<Suspense fallback={<XSkeleton/>}>`. A skeleton must match the **exact final width/height** to prevent layout shift.
- **Mount overlays on first open and keep them mounted** (`useOverlay`/`useState(mounted)`) so the *close* animation isn't lost — unmounting on close kills the exit. (User pattern.)
- **Lazy-load heavy/off-screen work:** `next/dynamic` (`ssr:false` + skeleton fallback) for charts/dialogs; `IntersectionObserver` (`useInView`, `rootMargin:"200px"`) to defer expensive fan-out until near the viewport; `prefetch` links for instant drill-down.
- **Prevent layout shift (CLS):** `<img>` with explicit `width`+`height`; `font-display: swap` + preload critical fonts; prefer flex/grid over JS measurement; no layout reads (`getBoundingClientRect`, `offsetHeight`) during render.
- **Loading copy ends in `…`** ("Saving…", "Loading…").

---

## 11. Components, composition & reuse

*(Casing, folder anatomy, and import scope come from `clean-code`; here we govern composition.)*

- **Shared primitives are single and generic.** Dropdowns, dialogs, sheets, tooltips, buttons, inputs, cards, badges, tables live once at the shared layer. Views *consume* them; they never fork them. Building a second `Dialog` is the bug — extend or compose.
- **`Card` is the canonical case:** one generic Card owns the global structural decisions (border, radius, elevation, anatomy); each view customizes through composition and classes (hide header, drop footer, swap padding) — never by forking.
- **Cards are self-contained by default.** One card ↔ one API resource → it fetches its own data, owns its loading/error, blast radius = one card; receiving primary data via props is forbidden there. Props are accepted **only** when a higher-level endpoint returns the collection as a unit (galleries, lists). No third option.
- **Abstractions earn their place.** A 4-line component that maps a status to a color is microfragmentation — inline it. Extract only when it encapsulates complete, reused behavior.
- **Equivalent views share composition.** Same-problem views (fetch+list+actions, form+submit, detail+edit) use the same loading/empty/error structure and data flow across the app. Infinite scroll here + manual pagination there for the same domain is a defect.
- **`memo()` only with primitive props** (string/number/boolean) — cheap shallow compare that blocks unrelated re-renders. With objects/arrays/functions, fix prop instability first (`useMemo`/`useCallback`/lift state), then decide. Don't sprinkle `useMemo`/`useCallback` on cheap ops.
- **Don't reimplement the framework** (MUI `IconButton`+`startIcon`, Next.js route groups, shadcn variants) — consume it.

---

## 12. Responsive patterns by viewport

All descend from §1.5 (mobile-first, three viewports):

| Concern | Mobile | Tablet / Desktop |
|---------|--------|------------------|
| Feedback | `active:` / `focus:` (no hover) | `hover:` free |
| Navigation context | Back button | Breadcrumbs |
| Reorder | up/down buttons | drag & drop |
| Route transition | horizontal slide (fwd→right, back→left) | none (instant) — desktop |
| Diff view | inline unified (default) | side-by-side (default) |
| Drawer state | defaults closed each load | persists across reloads |

Scroll is designed, never native: `tailwind-scrollbar` utilities on local containers (sidebars, tables, modal bodies); a smooth-scroll library (Lenis) on the main long-form surface.

---

## 13. UX pattern catalog

Standing decisions — apply them by default:

- **Destructive actions:** confirmation dialog **and** `beforeunload` protection against navigating away with unsaved work.
- **Notifications:** `Toast` over `Alert` (non-blocking).
- **Tables:** sort by clicking column headers *only when the API supports it* (no client-side sort over a page); advanced filters in a toolbar above the table; bulk = per-row checkbox + a persistent toolbar whose buttons enable on selection.
- **Lists:** infinite scroll driven by the API's pagination (cursor if available, else offset/limit) — no classic pagination bars.
- **Autocomplete:** dropdown always renders a loader inside while searching. **Debounce by cost:** autocomplete 300ms, list filters 500ms, heavy search on submit.
- **File upload:** drag-&-drop zone that also opens the picker + per-file thumbnail + per-file loader (no single global bar).
- **Command palette (`⌘K`/`Ctrl+K`)** is the global action/nav entry; every shortcut is documented inside it.
- **Button loading:** a `loading` prop disables the button, swaps the leading icon for a spinner, keeps the label, sets `aria-busy` — replaces the manual `{isSubmitting ? <Spinner/> : null}` pattern.
- **Account dropdown order:** identity → workspace → settings → theme → logout.
- **Images optimized** (`next/image` or equivalent) — shipping unoptimized images is a defect.
- **Formatting via `Intl.*`** in the user's locale (`DateTimeFormat`/`NumberFormat`/`RelativeTimeFormat`, `ago`-style deltas); `moment` only as a last-resort fallback.
- **Dark mode:** `dark` class on `<html>` via a `useTheme` hook + a `beforeInteractive` FOUC-guard script reading `localStorage` and `matchMedia`.

---

## 14. Content realism & voice

Placeholder content is where mockups betray themselves as fake:

- **Data is organic, not round.** `47.2%`, not `50%`/`99.99%`. Real-looking names, real-shaped phone numbers — never `John Doe`, `123-4567`, egg avatars, or `Acme`/`Nexus` brands.
- **No emoji in product UI, copy, or `alt`.** Use icons from one library with a standardized `strokeWidth` (1.5 or 2.0).
- **Copy is specific and active.** Title Case for labels, numerals ("8 deployments"), concrete button verbs ("Save API Key", not "Continue"). Error messages state the fix, not just the problem. Avoid "Elevate / Seamless / Next-Gen" filler.
- **Mockups reflect the real product** — demo chats, previews, and sample data mirror what the code actually does; never invent capabilities to fill space. (User law.)

---

## 15. Advanced — decouple render from input when layers collide

When two layout requirements seem mutually exclusive (a carousel *fixed behind* content that must still be *swipeable*; a sticky header the body scrolls *over*; a bottom-sheet above interactive content), the impossibility is almost always in your composition, not the problem.

The usual culprit: **paint order (z-index) is deciding both what's on top *and* who receives the gesture** — but render and input-routing are separable axes.

**Technique (input proxy + shared control):**
1. Leave the element where it must be *visually* (carousel behind, fixed).
2. Put a transparent layer in front that intercepts *only* the gesture you need (e.g. horizontal drag) and delegates it to the element behind; other gestures (vertical scroll) fall through to the ancestor — different axes don't compete.
3. Lift control to a common owner: the shared controller/state lives on an ancestor, so tree position no longer dictates who's in charge.

Mnemonic: **when two things won't coexist, suspect the lever that binds them before the requirement you were about to sacrifice.** (User pattern.)

---

## 16. Ship gate — verify before done

A visual change is not done until it passes this. Most of it is auditable by reading the diff:

- **Laws:** Tailwind-only, no `style=`/`<style>`/`.css`; no ad-hoc state colors; no redundant `dark:`/variant; no conflicting utilities; tokens not literals.
- **Responsive:** works at mobile, tablet, desktop; base = mobile, `md:`/`lg:` layer up; no breakpoint assumed to cover a lower one.
- **States:** hover/focus-visible/active/disabled/loading/error/empty all present; focus visible; contrast ≥ 4.5:1 (text) / 3:1 (large + UI).
- **Motion:** overlays animate; durations `<300ms`; `ease-out` enter (never `ease-in`); origin-aware anchored overlays; only `transform`/`opacity` animated; `motion-reduce:animate-none` on every new entrance.
- **Overflow:** long/medium/short content handled; `min-w-0` on truncating flex children; empty states designed.
- **Semantics:** `<button>`/`<a>` not `<div onClick>`; `aria-label` on icon buttons; `alt` on images.
- **Loading:** skeleton (sheen, not pulse) matching final layout; no CLS; overlays mounted-on-first-open so exits animate.
- **Taste:** dials calibrated for the domain; one accent; hierarchy by weight/color; realistic content; no emoji; no 3-equal-card autopilot; shadows tinted and subtle.

When the RAG holds a preference that touches any of the above, it overrides this skill — query it before finalizing a visual decision.
