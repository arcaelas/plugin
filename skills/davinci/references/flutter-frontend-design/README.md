# 🎨 Flutter Frontend Design Skill

> Create distinctive, production-grade Flutter mobile & web UI with high design quality.

This skill guides AI assistants in creating **exceptional Flutter interfaces** that avoid generic "AI slop" aesthetics. It produces real, working Dart/Flutter code with meticulous attention to aesthetic detail, creative choices, and production readiness.

---

## ✨ What It Does

Use this skill when you need to build:

- 📱 **Flutter screens** — Full-page layouts with immersive scroll effects, animations, and responsive design
- 🧩 **Widgets & components** — Reusable, styled building blocks with micro-interactions
- 📊 **Dashboards** — Data-rich interfaces with charts, cards, and live indicators
- 🚀 **Full apps** — Complete multi-screen Flutter applications with theme systems and navigation

The skill enforces a **design-first philosophy** — every generated interface must have a clear aesthetic direction, custom typography, meaningful animations, and dark mode support.

---

## 🏗️ Architecture

Generated code follows a clean, scalable Flutter project structure:

```
lib/
├── main.dart
├── app.dart                    # MaterialApp / CupertinoApp config
├── core/
│   ├── theme/
│   │   ├── app_theme.dart      # ThemeData definitions
│   │   ├── app_colors.dart     # Color constants & extensions
│   │   ├── app_typography.dart  # TextStyle definitions
│   │   └── app_spacing.dart    # Spacing constants
│   ├── constants/
│   └── utils/
├── features/
│   └── feature_name/
│       ├── presentation/
│       │   ├── screens/
│       │   ├── widgets/
│       │   └── controllers/
│       ├── domain/
│       └── data/
└── shared/
    └── widgets/                # Reusable custom widgets
```

---

## 🎯 Design Principles

### Design Thinking (Before Code)

Every interface begins with intentional decisions about:

| Question | Example Directions |
|----------|-------------------|
| **Purpose** | What problem does this UI solve? Who is the user? |
| **Tone** | Brutally minimal, luxury/refined, retro-futuristic, glassmorphism, neumorphism, editorial, playful, etc. |
| **Platform** | Material 3, Cupertino, or fully custom design system |
| **Constraints** | State management, navigation, target platforms |
| **Differentiation** | What makes this *unforgettable*? |

### Typography

- Never uses default Material fonts without customization
- Leverages the `google_fonts` package for distinctive pairings
- Example strong pairings:
  - `Playfair Display` + `Source Sans Pro`
  - `Space Grotesk` + `DM Sans`
  - `Sora` + `Inter`

### Color & Theme

- Custom `ColorScheme` with bold palettes — dominant colors with sharp accents
- `ThemeExtension<T>` for properties beyond Material
- Light **and** dark themes from the start

### Motion & Animation

Flutter's animation system is treated as a superpower:

- **Implicit**: `AnimatedContainer`, `AnimatedOpacity`, `AnimatedScale`
- **Hero**: Shared-element screen transitions
- **Staggered**: Orchestrated reveals with `Interval` + `AnimationController`
- **Micro-interactions**: Tap feedback via `GestureDetector` + `AnimatedScale`
- **Rich animations**: Lottie & Rive for complex illustrative animations

### Spatial Composition

- `SliverAppBar` + `FlexibleSpaceBar` for immersive scrolling
- `CustomScrollView` with mixed slivers
- `ClipPath` / `CustomClipper` for non-rectangular shapes
- `CustomPaint` / `CustomPainter` for decorative elements
- `BackdropFilter` for glassmorphism effects
- `ShaderMask` for gradient text and masked effects

---

## 📦 Recommended Packages

| Purpose | Package | Usage |
|---------|---------|-------|
| Fonts | `google_fonts` | Typography |
| Icons | `flutter_svg`, `hugeicons`, `phosphor_flutter` | Custom icon sets |
| Animation | `flutter_animate`, `lottie`, `rive` | Complex animations |
| Charts | `fl_chart`, `syncfusion_flutter_charts` | Data visualization |
| Effects | `shimmer`, `flutter_blurhash` | Loading & image effects |
| Layout | `flutter_staggered_grid_view` | Masonry/staggered grids |
| Navigation | `go_router`, `auto_route` | Declarative routing |
| State | `flutter_riverpod`, `flutter_bloc` | State management |
| Images | `cached_network_image`, `extended_image` | Image loading & caching |

---

## ✅ Quality Checklist

Every generated UI is verified against:

- [ ] Custom `ThemeData` with unique colors and typography
- [ ] Responsive layout (mobile + tablet minimum)
- [ ] At least 2–3 meaningful animations or transitions
- [ ] Dark mode support or explicit light/dark theme
- [ ] Proper widget extraction (no mega-build methods)
- [ ] Performance considerations (`const` constructors, `RepaintBoundary`)
- [ ] Accessibility (`Semantics` widgets, sufficient contrast ratios)
- [ ] Platform-adaptive elements where appropriate

---

## 🚫 Anti-Patterns (What This Skill Avoids)

- ❌ Default Material theme with zero customization
- ❌ Plain `Scaffold` + `ListView` + `Card` with no styling
- ❌ Default Material colors (purple/teal) without thought
- ❌ Skipping dark mode entirely
- ❌ No animations — Flutter's 120fps canvas deserves better
- ❌ Hardcoded sizes instead of responsive patterns
- ❌ Generic placeholder UI that looks like every tutorial
- ❌ Ignoring platform conventions (e.g., Cupertino on iOS)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
