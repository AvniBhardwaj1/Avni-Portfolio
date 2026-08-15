import { useEffect, useRef } from "react";
import { getAudioLevel } from "@/lib/sounds";
import { useMotion } from "@/theme/MotionContext";

/**
 * Ambient reactive background: the mesh blobs gently drift with cursor
 * velocity, and a radial pulse layer breathes with the vinyl-crackle audio
 * level whenever a certificate is spinning.
 */
export const MeshGradient = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let energy = 0;
    let dirX = 0;
    let dirY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = performance.now();

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const vx = (e.clientX - lastX) / dt;
      const vy = (e.clientY - lastY) / dt;
      const speed = Math.hypot(vx, vy);
      energy = Math.min(1, energy + speed * 0.05);
      if (speed > 0.05) {
        dirX = vx / speed;
        dirY = vy / speed;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let smAudio = 0;
    let smEnergy = 0;
    const loop = () => {
      smAudio += (getAudioLevel() - smAudio) * 0.12;
      energy *= 0.94;
      smEnergy += (energy - smEnergy) * 0.15;

      const wrap = wrapRef.current;
      if (wrap) {
        const d = smEnergy * 16;
        wrap.style.transform = `translate3d(${dirX * d}px, ${dirY * d}px, 0)`;
        wrap.style.filter = `brightness(${(1 + smAudio * 0.22).toFixed(3)})`;
      }
      const pulse = pulseRef.current;
      if (pulse) {
        pulse.style.opacity = Math.min(1, smAudio * 2.4).toFixed(3);
        pulse.style.transform = `scale(${(1 + smAudio * 0.3).toFixed(3)})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div className="mesh-gradient" aria-hidden data-testid="mesh-gradient">
      <div ref={wrapRef} className="mesh-wrap">
        <div className="mesh-blob blob-a" />
        <div className="mesh-blob blob-b" />
        <div className="mesh-blob blob-c" />
      </div>
      <div ref={pulseRef} className="mesh-pulse" />
    </div>
  );
};
