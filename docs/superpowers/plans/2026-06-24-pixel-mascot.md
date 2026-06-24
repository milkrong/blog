# Pixel Robot Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rotating hero cube with an interactive 8-bit pixel robot mascot (idle bob/blink, cursor-following eyes, click hop+spin), on the locked palette, with dark-mode and reduced-motion handling.

**Architecture:** A new `PixelMascot` client-capable component built from positioned `<span>`s (no SVG, no images). Idle bob/blink are CSS keyframes. Cursor-following eyes use a single `window` `pointermove` listener that writes an inline `transform` to the eyes group via a `ref` (never React state, so no per-frame re-render). The click reaction is a one-shot CSS animation toggled by a class and cleared on `animationend`. All animation styling lives in `globals.css` using the existing design tokens; the dead `.pixel-cube` CSS is removed.

**Tech Stack:** Next.js 14 (Pages Router), React 18, Tailwind v3, plain CSS keyframes. No new dependencies. No test runner in this project — verification is `tsc --noEmit`, `next build`, and browser checks.

**Spec:** `docs/superpowers/specs/2026-06-24-pixel-mascot-design.md`

**Note on `'use client'`:** This is the Pages Router, where every component is already client-rendered and the `'use client'` directive is an App Router concept (ignored here). Do **not** add it; just use `useRef`/`useEffect` normally.

---

### Task 1: Create the `PixelMascot` component, add its CSS, and swap it into the hero

This task makes every change needed for the mascot to render and animate. The old `.pixel-cube` CSS is left in place for now (it becomes dead but harmless), so the commit is in a working state. Task 2 deletes the dead CSS.

**Files:**
- Create: `src/components/PixelMascot.tsx`
- Modify: `src/styles/globals.css` (append mascot CSS near the existing cube block)
- Modify: `src/components/ProfileHeader.tsx` (swap cube markup for `<PixelMascot />`, add import)

- [ ] **Step 1: Create the component file**

Create `src/components/PixelMascot.tsx` with exactly this content:

```tsx
import { useEffect, useRef } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

export function PixelMascot() {
  const rootRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLSpanElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const reacting = useRef(false);

  // Eyes follow the cursor. One global listener; no React state per frame.
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    const onMove = (e: PointerEvent) => {
      const root = rootRef.current;
      const eyes = eyesRef.current;
      if (!root || !eyes) return;
      const r = root.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const max = 3; // px of eye travel
      eyes.style.transform = `translate(${(dx / len) * max}px, ${(dy / len) * max}px)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Click easter egg: one-shot hop + 360 spin, cleared on animationend.
  const handleClick = () => {
    if (window.matchMedia(REDUCED).matches) return;
    const bot = botRef.current;
    if (!bot || reacting.current) return;
    reacting.current = true;
    bot.classList.add("pixel-mascot-react");
    const done = () => {
      bot.classList.remove("pixel-mascot-react");
      bot.removeEventListener("animationend", done);
      reacting.current = false;
    };
    bot.addEventListener("animationend", done);
  };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      onClick={handleClick}
      className="pixel-mascot grid h-16 w-16 cursor-pointer place-items-center md:h-20 md:w-20"
    >
      <div ref={botRef} className="pixel-mascot-bot">
        <span className="pm-ant" />
        <span className="pm-ant-dot" />
        <span className="pm-head" />
        <span ref={eyesRef} className="pm-eyes">
          <span className="pm-eye" />
          <span className="pm-eye" />
        </span>
        <span className="pm-mouth" />
      </div>
    </div>
  );
}

export default PixelMascot;
```

- [ ] **Step 2: Add the mascot CSS to `globals.css`**

Open `src/styles/globals.css`. Find the comment block that begins:

```
/* ============================================================
   Pixel cube (profile mascot)
   ============================================================ */
```

Directly **above** that comment block, insert this new CSS (leave the cube block untouched for now):

```css
/* ============================================================
   Pixel robot mascot (replaces the cube)
   ============================================================ */
.pixel-mascot-bot {
  position: relative;
  width: 56px;
  height: 64px;
  animation: pm-bob 2.4s ease-in-out infinite;
}
.pixel-mascot-bot > span {
  position: absolute;
}
.pm-head {
  top: 14px;
  left: 4px;
  width: 48px;
  height: 40px;
  background: var(--hi);
  border: 3px solid var(--ink);
  box-shadow: 3px 3px 0 0 var(--ink);
}
.pm-ant {
  top: 0;
  left: 26px;
  width: 3px;
  height: 12px;
  background: var(--ink);
}
.pm-ant-dot {
  top: -4px;
  left: 22px;
  width: 11px;
  height: 11px;
  background: var(--accent);
  border: 3px solid var(--ink);
}
.pm-eyes {
  top: 26px;
  left: 11px;
  width: 34px;
  height: 14px;
  display: block;
}
.pm-eyes .pm-eye {
  position: absolute;
  top: 0;
  width: 10px;
  height: 14px;
  background: var(--ink);
  animation: pm-blink 3.4s steps(1) infinite;
}
.pm-eyes .pm-eye:first-child {
  left: 0;
}
.pm-eyes .pm-eye:last-child {
  left: 24px;
}
.pm-mouth {
  top: 44px;
  left: 16px;
  width: 24px;
  height: 4px;
  background: var(--ink);
}

/* click reaction: more specific selector, so it replaces pm-bob while active */
.pixel-mascot-bot.pixel-mascot-react {
  animation: pm-react 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pm-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@keyframes pm-blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  96% {
    transform: scaleY(0.12);
  }
}
@keyframes pm-react {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  30% {
    transform: translateY(-12px) rotate(0deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-mascot-bot,
  .pixel-mascot-bot.pixel-mascot-react,
  .pm-eyes .pm-eye {
    animation: none !important;
  }
}
```

Why the `.pixel-mascot-bot.pixel-mascot-react` selector wins: it has higher specificity than `.pixel-mascot-bot`, so while the class is present the `pm-react` animation replaces `pm-bob` cleanly. `pm-react` ends at `rotate(360deg)` (visually identical to `0deg`), so removing the class causes no visible jump. Blink lives on `.pm-eye` and the cursor `translate` lives on the `.pm-eyes` wrapper — different elements, so the two transforms never conflict.

- [ ] **Step 3: Swap the cube for the mascot in `ProfileHeader.tsx`**

In `src/components/ProfileHeader.tsx`, add the import near the other imports at the top:

```tsx
import { PixelMascot } from "./PixelMascot";
```

Then find this block:

```tsx
      <div className="hidden md:flex items-center justify-center flex-shrink-0 mr-8">
        <div className="h-16 w-16 md:h-20 md:w-20">
          <div className="pixel-cube">
            <div className="face front" />
            <div className="face back" />
            <div className="face right" />
            <div className="face left" />
            <div className="face top" />
            <div className="face bottom" />
          </div>
        </div>
      </div>
```

Replace it entirely with:

```tsx
      <div className="hidden md:flex items-center justify-center flex-shrink-0 mr-8">
        <PixelMascot />
      </div>
```

(The `PixelMascot` root already carries `h-16 w-16 md:h-20 md:w-20`, so the hero footprint is unchanged.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: completes with no output (exit 0). If it errors, fix before continuing.

- [ ] **Step 5: Build**

Run: `NEXT_SKIP_DB=1 pnpm build`
Expected: `✓ Compiled successfully` and the route table prints. No errors about `PixelMascot` or missing CSS.

- [ ] **Step 6: Browser check (both themes + interactions)**

Start the dev server: `pnpm dev` (then open `http://localhost:3000/`).

Verify on the home page hero (mascot shows at `md` width and up — widen the window if needed):
- Idle: the robot bobs up/down and blinks periodically.
- Move the cursor around the page: the two eyes shift a few px toward the cursor, smoothly, with no stutter.
- Click the robot: it hops and does one 360° spin, then settles; clicking again replays it.
- Click the header `DARK` / `LIGHT` toggle: in dark mode the head stays yellow and the ink outline/eyes/shadow remain clearly visible (they invert via `--ink`).
- Open DevTools > Rendering > emulate `prefers-reduced-motion: reduce` (or set it at the OS level) and reload: the robot is fully static, eyes do not track, clicking does nothing, and there are no console errors.

Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add src/components/PixelMascot.tsx src/styles/globals.css src/components/ProfileHeader.tsx
git commit -m "feat: replace hero cube with interactive pixel robot mascot

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Remove the now-dead `.pixel-cube` CSS

The cube markup is gone, so its CSS is dead. Remove it to keep `globals.css` clean.

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Delete the cube CSS block**

In `src/styles/globals.css`, delete the entire block that starts at the comment:

```
/* ============================================================
   Pixel cube (profile mascot)
   ============================================================ */
```

and continues through **all** of these rules: `.pixel-cube`, `.pixel-cube .face`, `.pixel-cube .front`, `.back`, `.right`, `.left`, `.top`, `.bottom`, `@keyframes cube-rotate`, `@keyframes cube-blink`, and the trailing `@media (prefers-reduced-motion: reduce)` block whose body targets `.pixel-cube, .pixel-cube .face`.

Stop deleting at the end of that reduced-motion block. Do **not** touch the new `.pixel-mascot*` block above it, the `.pixel-prose` rules, or the `.ProseMirror` / `hljs` rules.

- [ ] **Step 2: Confirm nothing else references the cube**

Run: `grep -rn "pixel-cube\|cube-rotate\|cube-blink\|face front" src`
Expected: no matches (empty output). If anything matches, it is leftover markup or CSS — remove it.

- [ ] **Step 3: Build**

Run: `NEXT_SKIP_DB=1 pnpm build`
Expected: `✓ Compiled successfully`, no warnings about the removed selectors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "chore: remove dead pixel-cube CSS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Component built from positioned divs/spans, no SVG/images → Task 1 Step 1. ✓
- Idle bob + blink (CSS keyframes) → Task 1 Step 2 (`pm-bob`, `pm-blink`). ✓
- Eyes follow cursor via ref/listener, not React state → Task 1 Step 1 (`useEffect` + `eyes.style.transform`). ✓
- Click hop+360 spin, one-shot, cleared on animationend, ignores clicks while playing → Task 1 Step 1 (`handleClick`) + Step 2 (`pm-react`). ✓
- Locked palette tokens (`--hi`, `--ink`, `--accent`) + dark mode → Task 1 Step 2. ✓
- `prefers-reduced-motion`: animations off + no cursor tracking + click no-op → Task 1 Step 1 (early returns) + Step 2 (media query). ✓
- `aria-hidden`, transform/opacity only, listener cleanup → Task 1 Step 1. ✓
- Same container footprint, swap into ProfileHeader → Task 1 Step 3. ✓
- Remove dead `.pixel-cube` CSS → Task 2. ✓
- Verify both themes + tsc/build → Task 1 Steps 4–6, Task 2 Step 3. ✓

**Placeholder scan:** No TBD/TODO; all code blocks are complete and literal. ✓

**Type/name consistency:** `rootRef`/`eyesRef`/`botRef`/`reacting` refs match their JSX usage; CSS class names (`pixel-mascot`, `pixel-mascot-bot`, `pixel-mascot-react`, `pm-ant`, `pm-ant-dot`, `pm-head`, `pm-eyes`, `pm-eye`, `pm-mouth`) match between component and CSS; keyframes (`pm-bob`, `pm-blink`, `pm-react`) are each defined once and referenced consistently. ✓
