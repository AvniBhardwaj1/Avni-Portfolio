import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useMotion } from "@/theme/MotionContext";

export const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = dotRef.current;
    if (!dot) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const xTo = gsap.quickTo(dot, "x", { duration: 0.3, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.3, ease: "power3" });

    let active: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      if (active) {
        const rect = active.getBoundingClientRect();
        gsap.to(active, {
          x: (e.clientX - (rect.left + rect.width / 2)) * 0.3,
          y: (e.clientY - (rect.top + rect.height / 2)) * 0.3,
          duration: 0.4,
          ease: "power3",
        });
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest?.("[data-magnetic]") as HTMLElement | null;
      if (target === active) return;
      if (active) gsap.to(active, { x: 0, y: 0, duration: 0.4, ease: "power3" });
      active = target;
      gsap.to(dot, { scale: active ? 2.8 : 1, duration: 0.3, ease: "power3" });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (active) gsap.set(active, { x: 0, y: 0 });
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={dotRef}
      data-testid="custom-cursor"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-4 w-4 rounded-full bg-white mix-blend-difference md:block"
    />
  );
};
