import { useEffect, useRef } from "react";
import type { GestureCursorState } from "@/hooks/useGestureScroll";

const RING = 44;

export const GestureCursor = ({
  cursorRef,
}: {
  cursorRef: { current: GestureCursorState };
}) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const chargeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const { x, y, pinch, hovering } = cursorRef.current;
      const ring = ringRef.current;
      if (ring) {
        ring.style.transform = `translate(${x - RING / 2}px, ${y - RING / 2}px) scale(${hovering ? 1.5 : 1})`;
        ring.style.borderColor = hovering
          ? "hsl(var(--accent))"
          : "hsl(var(--foreground) / 0.5)";
      }
      const charge = chargeRef.current;
      if (charge) {
        charge.style.transform = `scale(${pinch})`;
        charge.style.opacity = pinch > 0.02 ? "1" : "0";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cursorRef]);

  return (
    <div
      data-testid="gesture-cursor"
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      aria-hidden
    >
      <div
        ref={ringRef}
        className="flex items-center justify-center rounded-full border-2 transition-[border-color] duration-150 will-change-transform"
        style={{ width: RING, height: RING }}
      >
        <div
          ref={chargeRef}
          className="h-full w-full rounded-full bg-accent/40 transition-opacity duration-100 will-change-transform"
          style={{ transform: "scale(0)", opacity: 0 }}
        />
      </div>
    </div>
  );
};
