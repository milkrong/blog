---
name: milkrong blog
description: A hand-built neo-brutalist pixel notebook for a developer's writing.
colors:
  ink: "#16181d"
  fg-muted: "#555a63"
  paper: "#f3f2ec"
  surface: "#ffffff"
  surface-2: "#f6f6f1"
  accent: "#2563eb"
  accent-fg: "#ffffff"
  highlight: "#facc15"
  highlight-ink: "#a16207"
  ok: "#16a34a"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  prose:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  none: "0"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  section: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.none}"
    padding: "0.5rem 1rem"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 1rem"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "0.5rem 1rem"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.5rem"
  chip-highlight:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.highlight-ink}"
    rounded: "{rounded.none}"
    padding: "0.15rem 0.5rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.75rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1.25rem"
---

# Design System: milkrong blog

## 1. Overview

**Creative North Star: "The 8-Bit Notebook"**

This is a developer's published notebook rendered as a hand-built pixel machine. Every
surface is a thick ink-bordered tile that casts a hard, blur-free offset shadow, as if
pieces of paper were stacked on a workbench and pinned down. The chrome speaks in mono
(JetBrains Mono); the long-form writing relaxes into a clean reading sans. The mood is
**crafted, playful, honest** — a person who builds their own tools and enjoys it, not a
brand performing polish.

The system rejects the generic-template look on sight. No soft slate cards, no default
shadcn blue, no glassmorphism, no per-section uppercase eyebrows or `01 / 02 / 03`
scaffolding, no gradient text. Where a normal site would reach for an elevation shadow or
a rounded card, this one reaches for a 3px ink border and a solid offset shadow. The
playfulness (a blinking robot mascot, a pixelated avatar, a pixel-`M` mark) is earned
through craft and kept subordinate to the writing.

It is dual-theme from the ground up: a warm graph-paper light mode and an off-black dark
mode that share one structural language — in dark mode the "ink" inverts to a light
off-white so borders and shadows keep reading.

**Key Characteristics:**
- Hard offset shadows (solid, zero blur) instead of ambient elevation.
- Square corners everywhere (radius 0).
- Mono for all chrome/headings; readable sans reserved for prose.
- A two-job color palette: blue acts, yellow highlights, everything else is structure.
- Motion is small and motivated; every loop honors reduced-motion.

## 2. Colors

A near-monochrome ink-on-paper base, punctuated by exactly two working colors. The palette
is locked by role, not by mood.

### Primary
- **Action Blue** (#2563eb): the single action color — primary buttons, links, focus
  rings, the active read affordance. In dark mode it lifts to a brighter periwinkle
  (#5b8cff) with dark text on top. Nothing else competes for "this is clickable."

### Secondary
- **Highlighter Yellow** (#facc15): the one highlight color, used only for category tags,
  the role badge, and the brand mark — the visual equivalent of a marker swipe. Paired with
  its own deep ochre text (#a16207) for contrast, never gray-on-yellow.

### Tertiary (semantic only)
- **Go Green** (#16a34a) and **Stop Red** (#dc2626): reserved strictly for success and
  destructive/error states. They never appear as decoration or accents.

### Neutral
- **Ink** (#16181d): all borders, all offset shadows, and primary text. The structural
  spine of the system. Inverts to off-white (#f2f1ea) in dark mode.
- **Slate Ink** (#555a63): muted/secondary text (meta, captions, placeholders) — kept dark
  enough to clear 4.5:1, never a pale "elegant" gray.
- **Graph Paper** (#f3f2ec): the warm page background, overlaid with a faint 18px grid.
  Dark mode swaps to near-black (#0e0f12).
- **Card White** (#ffffff) / **Recessed Paper** (#f6f6f1): raised tile surfaces and inset
  fills (code blocks, chips, secondary buttons). Dark: #1b1d22 / #23262d.

### Named Rules
**The Two-Job Palette Rule.** Blue is the *only* action color and yellow is the *only*
highlight color, used identically on every surface. Green and red are semantic-only. If a
new screen introduces a third accent, it is wrong — pull it back to ink, blue, or yellow.

**The Inverting-Ink Rule.** Borders and shadows are always `--ink`, never a fixed black.
In dark mode `--ink` becomes light, so the entire brutalist structure survives the theme
flip without per-component overrides.

## 3. Typography

**Display / Chrome Font:** JetBrains Mono (fallback: ui-monospace, monospace)
**Body / Prose Font:** system sans stack with CJK fallback (PingFang SC, Microsoft YaHei)
**Label Font:** JetBrains Mono

**Character:** A deliberate two-axis pairing — a sharp monospace for everything structural
(brand, nav, headings, chips, buttons, numbers) against a neutral humanist sans for
reading. The contrast between "machine" chrome and "human" prose is the whole point; they
are never blurred together.

### Hierarchy
- **Display** (JetBrains Mono 800, clamp(1.75rem, 4vw, 2.25rem), 1.1): post titles. The
  largest type on any page; tight tracking (-0.02em), never shouting past ~2.25rem.
- **Headline** (JetBrains Mono 800, 1.25rem, 1.2): section headers ("最新文章"), paired with
  a full-width ink rule rather than an eyebrow.
- **Title** (JetBrains Mono 700, 1.125rem, 1.35): card titles, the author name.
- **Body** (sans 400, 1rem, 1.625): UI copy, bios, card excerpts.
- **Prose** (sans 400, 1.0625rem, 1.8): long-form article body, capped at ~70ch for
  comfortable reading. Article headings switch back to mono 800.
- **Label** (JetBrains Mono 700, 0.7rem, +0.02em, often uppercase): chips, tags, the theme
  toggle, meta strips.

### Named Rules
**The Mono-Brand Rule.** JetBrains Mono carries 100% of the chrome — brand, nav, headings,
buttons, labels, numbers. The reading sans is reserved exclusively for long-form prose and
UI sentences. Never set body paragraphs in mono; never set a chip or button in the sans.

## 4. Elevation

This system does not use blur for depth. Depth is communicated by a single, repeated
gesture: a **hard offset shadow** — a solid block of `--ink` pushed down-right with zero
blur and zero spread — paired with a matching ink border. It reads as physical, stacked,
hand-pinned, not as soft Material elevation. There is no ambient/diffuse shadow anywhere.

### Shadow Vocabulary
- **Tile** (`box-shadow: 4px 4px 0 0 var(--ink)`): default for cards, panels, the profile
  header, modals (8px for the largest).
- **Inset control** (`box-shadow: 3px 3px 0 0 var(--ink)`): inputs and buttons at rest.
- **Lift** (`box-shadow: 7px 7px 0 0 var(--ink)` + `translate(-3px,-3px)`): hover state for
  clickable cards — the tile jumps toward the cursor and the shadow deepens.
- **Press** (shadow removed + `translate(1px,1px)`): `:active` on buttons/chips — the
  control physically presses into the page.

### Named Rules
**The Hard-Shadow Rule.** Every shadow is a solid offset of `--ink` with `0` blur and `0`
spread. A blurred, soft, or semi-transparent drop shadow is forbidden — it instantly breaks
the hand-built feel. If it looks like a 2014 Material card, the blur radius is the bug.

**The No-Radius Rule.** Corners are square (`--radius: 0`). Pills, rounded cards, and soft
8px corners are prohibited; the brutalist edge is part of the identity.

## 5. Components

### Buttons
- **Shape:** square (radius 0), 3px ink border, mono bold label, inset 3px offset shadow.
- **Primary:** Action Blue fill (#2563eb) with white label; padding 0.5rem 1rem.
- **Hover / Focus:** lifts `translate(-1px,-1px)` and the shadow grows to 4px; focus-visible
  shows a 2px Action Blue ring offset from the border.
- **Secondary:** Recessed Paper fill (#f6f6f1), ink label. **Danger:** Stop Red fill, white
  label — destructive actions only.
- **Active:** presses in (`translate(1px,1px)`, shadow removed).

### Chips / Tags
- **Style:** 2px ink border, 2px offset shadow, mono, ~0.7rem. Square corners.
- **Default:** Recessed Paper fill with Slate Ink text (tags prefix a blue `#`).
- **Highlight:** Highlighter Yellow fill with deep-ochre text — categories, the role badge.
- Tags and the theme toggle share this one chip primitive.

### Cards / Containers
- **Corner Style:** square (radius 0).
- **Background:** Card White (#ffffff); Recessed Paper for inset regions (code, image cells).
- **Shadow Strategy:** the **Tile** shadow (4px offset, see Elevation), never ambient.
- **Border:** 3px solid ink on all sides. Side-stripe accent borders are forbidden.
- **Internal Padding:** 1.25rem (cards) to 2rem (hero panel).
- Clickable cards add the **Lift** hover; whole card is the link, title turns Action Blue.

### Inputs / Fields
- **Style:** 3px ink border, 3px offset shadow, mono text, square corners, Card White fill.
- **Focus:** border and shadow both shift to Action Blue (no glow); label sits above the
  field in mono uppercase Slate Ink.
- **Error:** inline message in Stop Red with a 4px left accent on the message block only.

### Navigation
- **Style:** sticky top bar, ≤64px tall, Card White with a 3px ink bottom border, mono.
- **Brand:** pixel-`M` tile (yellow, ink border) + `milkrong/blog` wordmark; hover → Action
  Blue. **Links:** Slate Ink → Action Blue on hover. **Theme toggle:** mono chip on the right.
- **Mobile:** secondary links collapse; brand + toggle stay on one line.

### Signature Components
- **PixelMascot:** an 8-bit robot (yellow head, ink features) that idles with a bob + blink,
  tracks the cursor with its eyes, and does a one-shot hop+spin on click. Decorative,
  `aria-hidden`, fully static under reduced-motion.
- **PixelAvatar:** the profile photo drawn to a low-res (~24px) canvas and upscaled with
  `image-rendering: pixelated` for crisp 8-bit blocks, plus a light contrast/saturation
  filter. Falls back to a plain filtered `<img>` if the source can't be processed.
- **Pixel-M mark:** the brand glyph, an "M" built from solid pixel rects on a yellow
  ink-bordered tile; reused as the favicon (SVG) and the nav logo.

## 6. Do's and Don'ts

### Do:
- **Do** wrap every surface in a 3px ink border + a hard offset shadow (`Npx Npx 0 0
  var(--ink)`); that pairing IS the brand.
- **Do** keep blue as the only action color and yellow as the only highlight, identically
  across every section (the Two-Job Palette Rule).
- **Do** set all chrome (nav, headings, buttons, chips, numbers) in JetBrains Mono, and all
  long-form reading in the sans (the Mono-Brand Rule).
- **Do** keep corners square and shadows blur-free everywhere.
- **Do** ship light + dark together, route shadows/borders through `--ink` so they survive
  the theme flip, and give every animation a `prefers-reduced-motion` static fallback.
- **Do** keep muted text (#555a63) dark enough for 4.5:1; bump toward ink if it's close.

### Don't:
- **Don't** reintroduce the generic SaaS/shadcn-default look — soft slate cards, default
  shadcn blue, rounded elevation. That leak was deliberately removed from the post and login
  pages; do not bring it back.
- **Don't** use AI-slop landing tropes: per-section uppercase eyebrows, `01 / 02 / 03`
  numbered scaffolding, gradient text, glassmorphism, or identical icon-card grids.
- **Don't** use blurred, soft, or semi-transparent drop shadows (the Hard-Shadow Rule).
- **Don't** use side-stripe accent borders (`border-left` > 1px as a colored stripe) on
  cards, callouts, or alerts — use a full ink border or a tint.
- **Don't** let "corporate playful" creep in — emoji-as-personality or a mascot that tries
  too hard. Personality comes from craft, not decoration.
- **Don't** set prose in mono or chrome in the sans, and don't introduce a third accent color.
