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
