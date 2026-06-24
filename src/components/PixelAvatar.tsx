import { useEffect, useRef, useState } from "react";

interface PixelAvatarProps {
  src: string;
  alt: string;
  /** Low-res grid size in px. Smaller = blockier. */
  resolution?: number;
  /** CSS filter applied for the retro look. */
  filter?: string;
  className?: string;
}

/**
 * Renders an image as crisp pixel-art: the source is drawn small onto a canvas
 * (averaging colors), then CSS upscales it with nearest-neighbor so you get
 * clean blocks instead of a blur. Falls back to a plain <img> if the image
 * cannot be loaded (e.g. CORS).
 */
export function PixelAvatar({
  src,
  alt,
  resolution = 24,
  filter = "contrast(1.08) saturate(1.2)",
  className = "",
}: PixelAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    // No crossOrigin: we only *display* the canvas, never read pixels back, so a
    // tainted canvas renders fine. Requesting CORS would fail on redirected
    // avatar URLs (e.g. github.com/<user>.png) and break the effect.
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = resolution;
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = true; // average colors while shrinking
      // center-crop the source to a square before shrinking
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
    };
    img.onerror = () => setFailed(true);
    img.src = src;
  }, [src, resolution]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={{ filter }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
      style={{ imageRendering: "pixelated", filter }}
    />
  );
}

export default PixelAvatar;
