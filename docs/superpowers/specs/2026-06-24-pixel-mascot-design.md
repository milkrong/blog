# Pixel Robot Mascot — Design

**Date:** 2026-06-24
**Status:** Approved (pending implementation plan)
**Topic:** Replace the rotating hero cube with an interactive pixel robot mascot.

## Goal

Replace the decorative rotating `pixel-cube` in the profile hero with a more
characterful **8-bit pixel robot mascot**. It should feel "alive" and fun while
staying on-brand with the site's neo-brutalist pixel language and locked palette,
and degrade cleanly under reduced motion and dark mode.

## Background

The current hero mascot (`src/components/ProfileHeader.tsx`, styled in
`src/styles/globals.css` under `.pixel-cube`) is a CSS 3D cube that auto-rotates
and blinks. Two problems: it has no personality, and its rainbow face colors
(`#ef4444`, `#22c55e`, `#3b82f6`, `#f97316`, `#facc15`, `#e5e7eb`) violate the
site-wide palette lock established in the recent redesign (ink + paper, blue =
action, yellow = highlight). This change replaces it.

## Scope

In scope:
- New `PixelMascot` client component.
- Swap it into `ProfileHeader.tsx` in place of the cube markup.
- Remove the now-dead `.pixel-cube` CSS and `@keyframes cube-rotate` /
  `cube-blink` from `globals.css`.

Out of scope:
- Any other ProfileHeader content (avatar, name, bio, chips) stays as-is.
- No new dependencies (no Motion/GSAP needed; plain React + CSS).

## Component

**File:** `src/components/PixelMascot.tsx` — `'use client'` leaf component.

Built from positioned `<div>`s (no SVG, no images):
- `head` — yellow (`--hi`) square with 3px ink border + offset shadow.
- `antenna` — thin ink bar; `antenna-dot` — small square filled with `--accent`.
- two `eye` squares (ink) inside the head.
- `mouth` — ink bar.

Container keeps the same footprint as the current cube slot
(`h-16 w-16 md:h-20 md:w-20` region) so the hero layout does not shift.

`aria-hidden="true"` — decorative only.

## Behavior

Three layers, combined (the approved "D" option):

1. **Idle bob + blink** — CSS keyframes. Vertical bob (~6–8px, ~2.4s ease-in-out)
   and an occasional eye blink (scaleY pinch every few seconds).

2. **Eyes follow cursor** — a single page-level `pointermove` listener computes the
   cursor direction relative to the mascot's center and writes a small clamped
   `translate` (max ~3–4px) to the eyes via a `ref` and direct `style` writes
   (or a `useMotionValue`-style ref). **Never** per-frame React state — the tree
   must not re-render on mouse move. Listener attached in `useEffect`, removed in
   its cleanup.

3. **Click easter egg** — clicking the mascot plays a one-shot **hop + 360° spin**.
   Implemented by adding a CSS class that runs the animation once; the class is
   removed on `animationend` so it can replay on the next click. Ignore clicks
   while a reaction is already playing.

## Palette & Dark Mode

Use locked CSS tokens only:
- head: `--hi` (yellow, both themes)
- borders / shadows / eyes / mouth / antenna: `--ink`
- antenna dot: `--accent`

These read correctly on both `--surface` (light) and dark surfaces because `--ink`
inverts per theme. No hardcoded hex. Head stays yellow in both modes (decided).

## Accessibility & Performance

- Everything gated by `prefers-reduced-motion: reduce`: bob, blink, and the click
  hop/spin collapse to static; the cursor-follow listener is not attached (mascot
  sits still). This mirrors the existing reduced-motion handling in `globals.css`.
- Animate only `transform` / `opacity` (hardware-friendly).
- One global listener, cleaned up on unmount. No `window` scroll listeners.
- `aria-hidden` so screen readers skip it.

## Files Touched

- **Add:** `src/components/PixelMascot.tsx`
- **Edit:** `src/components/ProfileHeader.tsx` — replace the `.pixel-cube` block
  with `<PixelMascot />` (same container size).
- **Edit:** `src/styles/globals.css` — delete `.pixel-cube*` rules and the
  `cube-rotate` / `cube-blink` keyframes (and their reduced-motion block).

## Verification

Run the dev server and check in the browser, **both light and dark**:
- Idle: bob + blink play.
- Move cursor around the page: eyes track it (small, clamped offset), no jank,
  no re-render storm.
- Click the mascot: one hop + 360 spin, then it settles; repeatable.
- Enable reduced motion (OS setting): mascot is fully static, no errors.
- Hero layout unchanged (no shift from the swap).
- `tsc --noEmit` and `next build` pass.
