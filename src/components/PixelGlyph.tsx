interface PixelGlyphProps {
  /** Stable seed (slug or title) so the same post always gets the same glyph. */
  seed: string;
  className?: string;
}

// FNV-1a — deterministic and SSR-safe (no hooks, no randomness), so the glyph
// renders identically on server and client with no flash.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A small generative pixel "stamp" for posts that have no cover image. The
 * pattern is a left-right mirrored 5x5 grid derived from the seed, drawn in
 * ink with a single brand-accent spine (blue or yellow, chosen by the hash).
 * Decorative only — aria-hidden.
 */
export function PixelGlyph({ seed, className = "" }: PixelGlyphProps) {
  const h = hashSeed(seed || "post");
  const accent = h & 1 ? "var(--accent)" : "var(--hi)";
  const rects: JSX.Element[] = [];

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const on = (h >> (y * 3 + x)) & 1;
      if (!on) continue;
      const centerColor = x === 2 ? accent : "var(--ink)";
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={centerColor} />
      );
      if (x < 2) {
        rects.push(
          <rect key={`m${x}-${y}`} x={4 - x} y={y} width="1" height="1" fill="var(--ink)" />
        );
      }
    }
  }

  return (
    <svg
      viewBox="0 0 5 5"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {rects}
    </svg>
  );
}

export default PixelGlyph;
