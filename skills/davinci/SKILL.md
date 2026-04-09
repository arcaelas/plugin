---
name: davinci
description: >
  Expert design system for building production-grade interfaces across web, mobile, and Flutter.
  Use this skill whenever the task involves UI design, visual decisions, component styling,
  layout architecture, color systems, typography, responsive behavior, accessibility, animations,
  or any form of interface creation. Triggers on: building pages, components, dashboards, landing
  pages, mobile screens, design systems, theming, reviewing UI quality, or when the user mentions
  "diseño", "design", "UI", "UX", "layout", "responsive", "colores", "tipografía", or "estilos".
  This skill orchestrates specialized design modules — always load the relevant ones before acting.
---

# Da Vinci — Design System

You are now a design expert. This skill loads the essential design guides automatically and gives you access to specialized modules under `references/`. The essential guides below are already in your context — read them carefully. The specialized modules must be loaded with `Read` before you use them.

## Essential Guides (auto-loaded)

The following three guides apply to every design task. They are your baseline knowledge.

### Frontend Design — Creative Direction

!`cat ${CLAUDE_SKILL_DIR}/references/frontend-design/SKILL.md`

### Frontend UI/UX Engineer — Visual Polish

!`cat ${CLAUDE_SKILL_DIR}/references/frontend-ui-ux-engineer/SKILL.md`

### UI/UX Pro Max — Design Intelligence

!`cat ${CLAUDE_SKILL_DIR}/references/ui-ux-pro-max/SKILL.md`

---

## Specialized Modules (load on demand)

The following modules live in `${CLAUDE_SKILL_DIR}/references/`. Before writing code that falls into one of these domains, read the relevant module with the `Read` tool.

### Design System Architecture

**ui-design-system** — React + TailwindCSS + Radix + shadcn architecture. Three-tier tokens (primitive/semantic/component), OKLCH color spaces, dark mode, WCAG AA/AAA auditing.

```
${CLAUDE_SKILL_DIR}/references/ui-design-system/SKILL.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/DESIGN_TOKENS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/CUSTOMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RADIX_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/SHADCN_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/TAILWIND_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RESPONSIVE_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/PERFORMANCE_OPTIMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/INTEGRATION_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/canvas-design-system.md
```

### UI Compliance Audit

**web-design-guidelines** — Audits UI against 100+ rules (accessibility, performance, UX). Vercel Web Interface Guidelines.

```
${CLAUDE_SKILL_DIR}/references/web-design-guidelines/SKILL.md
```

### shadcn/ui Components

**shadcn** — Official skill. CLI, theming, semantic colors, form composition, styling rules, Base vs Radix.

```
${CLAUDE_SKILL_DIR}/references/shadcn/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn/cli.md
${CLAUDE_SKILL_DIR}/references/shadcn/customization.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/styling.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/composition.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/forms.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/icons.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/base-vs-radix.md
```

**shadcn-ui-expert** — 50+ components guide, React Hook Form + Zod, multi-framework support.

```
${CLAUDE_SKILL_DIR}/references/shadcn-ui-expert/SKILL.md
```

**shadcn-ui** — Complete shadcn/ui library patterns: installation, configuration, components, forms, theming, charts, Next.js integration.

```
${CLAUDE_SKILL_DIR}/references/shadcn-ui/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/setup-and-configuration.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-components.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/forms-and-validation.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/customization.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/nextjs-integration.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/charts-components.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-reference.md
```

### TypeScript Patterns

**typescript-advanced** — Advanced TypeScript patterns and best practices.

```
${CLAUDE_SKILL_DIR}/references/typescript-advanced/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced/references/best-practices.md
```

**typescript-advanced-patterns** — Generics, conditional types, mapped types, discriminated unions, branded types, type guards, template literal types, builder pattern.

```
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/advanced-generics.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/conditional-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/mapped-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/discriminated-unions.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/branded-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-guards.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-inference.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/utility-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/template-literal-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/decorators.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/builder-pattern.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/common-pitfalls.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/testing-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/performance-best-practices.md
```

### Mobile — Flutter

**flutter-frontend-design** — Distinctive Flutter UI. Design thinking, architecture, typography, animations. Material + Cupertino.

```
${CLAUDE_SKILL_DIR}/references/flutter-frontend-design/SKILL.md
```

**flutter-animating-apps** — Official Flutter animation guide.

```
${CLAUDE_SKILL_DIR}/references/flutter-animating-apps/SKILL.md
```

**flutter-animations** — Advanced animations: implicit, explicit, hero, staggered, physics, curves.

```
${CLAUDE_SKILL_DIR}/references/flutter-animations/SKILL.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/implicit.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/explicit.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/hero.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/staggered.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/physics.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/curves.md
```

**flutter-improving-accessibility** — Accessibility in Flutter: semantics, screen readers, contrast, touch targets.

```
${CLAUDE_SKILL_DIR}/references/flutter-improving-accessibility/SKILL.md
```

---

## Mandatory modules by project type

Before doing any design work, detect the project type and load the mandatory modules. This is not optional — these modules must be in your context before writing any UI code for that project type.

### Flutter projects

Detected by: `pubspec.yaml`, `.dart` files, Flutter imports, or the user mentions Flutter.

Load ALL of these immediately:

```
${CLAUDE_SKILL_DIR}/references/flutter-frontend-design/SKILL.md
${CLAUDE_SKILL_DIR}/references/flutter-animating-apps/SKILL.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/SKILL.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/implicit.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/explicit.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/hero.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/staggered.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/physics.md
${CLAUDE_SKILL_DIR}/references/flutter-animations/references/curves.md
${CLAUDE_SKILL_DIR}/references/flutter-improving-accessibility/SKILL.md
```

### Next.js projects

Detected by: `next.config.*`, `app/` directory with `layout.tsx`/`page.tsx`, or the user mentions Next.js.

Load ALL of these immediately:

```
${CLAUDE_SKILL_DIR}/references/shadcn/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/styling.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/composition.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/forms.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/icons.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/base-vs-radix.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui-expert/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/setup-and-configuration.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-components.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/forms-and-validation.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/customization.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/nextjs-integration.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/charts-components.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-reference.md
${CLAUDE_SKILL_DIR}/references/web-design-guidelines/SKILL.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/SKILL.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/DESIGN_TOKENS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/CUSTOMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RADIX_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/SHADCN_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/TAILWIND_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RESPONSIVE_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/PERFORMANCE_OPTIMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/INTEGRATION_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/canvas-design-system.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced/references/best-practices.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/advanced-generics.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/conditional-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/mapped-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/discriminated-unions.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-guards.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-inference.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/utility-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/common-pitfalls.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/performance-best-practices.md
```

### React projects (non-Next.js)

Detected by: `vite.config.*`, `react` in package.json, `.tsx`/`.jsx` files, or the user mentions React.

Load ALL of these immediately:

```
${CLAUDE_SKILL_DIR}/references/shadcn/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/styling.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/composition.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/forms.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/icons.md
${CLAUDE_SKILL_DIR}/references/shadcn/rules/base-vs-radix.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui-expert/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/SKILL.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/setup-and-configuration.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-components.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/forms-and-validation.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/customization.md
${CLAUDE_SKILL_DIR}/references/shadcn-ui/references/ui-reference.md
${CLAUDE_SKILL_DIR}/references/web-design-guidelines/SKILL.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/SKILL.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/DESIGN_TOKENS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/CUSTOMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RADIX_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/SHADCN_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/TAILWIND_REFERENCE.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/RESPONSIVE_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/PERFORMANCE_OPTIMIZATION.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/INTEGRATION_PATTERNS.md
${CLAUDE_SKILL_DIR}/references/ui-design-system/references/canvas-design-system.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced/references/best-practices.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/SKILL.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/advanced-generics.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/conditional-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/mapped-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/discriminated-unions.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-guards.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/type-inference.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/utility-types.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/common-pitfalls.md
${CLAUDE_SKILL_DIR}/references/typescript-advanced-patterns/references/performance-best-practices.md
```

---

The essential guides (frontend-design, frontend-ui-ux-engineer, ui-ux-pro-max) are already loaded above. The mandatory project modules must be loaded based on project type detection before writing any UI code.
