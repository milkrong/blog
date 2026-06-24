# Product

## Register

brand

> Note: the project has two surfaces of roughly equal priority. The **public blog**
> (home, post reading, profile) is the brand surface and the default register above:
> its hand-built pixel identity is part of the experience. The **admin** (`/admin/*`,
> `/login` — auth-gated writing/CRUD tooling used only by the author) is a **product**
> sub-surface; treat admin tasks with the product register reference even though the
> document default is brand.

## Users

Primarily the author (milkrong, a full-stack developer) — this is first a **personal
knowledge log**: a place to record practices, architecture/DX/performance notes, and
thinking. Secondary readers are fellow developers who land on a post. Public readers
come to read one article and maybe browse the profile; the author comes to write and
publish through the admin. Readership growth is a welcome bonus, not the goal.

## Product Purpose

A personal developer blog that doubles as a published notebook. Success is: the author
keeps writing (low-friction admin), and any post reads cleanly and feels unmistakably
*his* — a site that could only be this person's, not a theme anyone installed. The
distinctive neo-brutalist pixel identity is the point of difference, but it serves the
writing rather than competing with it.

## Brand Personality

Playful, retro, hand-built — an 8-bit/neo-brutalist voice with confidence and humor.
Three words: **crafted, playful, honest**. It should feel like a developer who builds
their own tools and enjoys it: ink-bordered pixel surfaces, a mono brand voice, a
little robot mascot. Tone in copy is plain and functional, never marketing-speak.

## Anti-references

- Generic SaaS / shadcn-default templates (soft slate cards, default blue, "looks like
  every Next.js starter"). The earlier version of this site had exactly this leak on the
  post and login pages; it was deliberately removed.
- AI-slop landing tropes: per-section uppercase eyebrows, 01/02/03 numbered scaffolding,
  gradient text, identical icon-card grids, glassmorphism for its own sake.
- "Corporate playful" — emoji-as-personality, mascot that tries too hard. The pixel voice
  earns personality through craft, not decoration.

## Design Principles

- **Hand-built over templated.** Every surface should read as personally made. If a
  component looks like an untouched library default, it's wrong.
- **Identity is the interface.** The pixel/brutalist system (ink borders, offset shadows,
  mono, locked yellow+blue palette) is a feature; apply it consistently, never half-on.
- **Reading comes first.** It's a knowledge log. Long-form legibility, calm rhythm, and a
  readable body font outrank decoration; the playful layer never fights the prose.
- **Honest and unpretentious.** Plain functional copy, real content over filler, no
  performative polish or invented precision.
- **Accessible as craft.** AA contrast, `prefers-reduced-motion`, and a real dark mode are
  part of "done," not an afterthought.

## Accessibility & Inclusion

Target **WCAG AA**: body text ≥4.5:1, large text ≥3:1, in both light and dark themes.
Every animation honors `prefers-reduced-motion` (idle loops, the mascot, scroll reveals
collapse to static). Dark mode is first-class and respects `prefers-color-scheme` with a
manual toggle. Decorative elements (mascot, avatar canvas, pixel marks) are `aria-hidden`
or carry proper labels.
