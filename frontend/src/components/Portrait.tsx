import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// Add more photos by dropping them in /public and appending paths here.
// With a single photo the slideshow gracefully falls back to a static Ken-Burns frame.
const PHOTOS = ["/portrait.webp"];
const SLIDE_MS = 5200;

export const Portrait = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 140, damping: 18 });

  useEffect(() => {
    if (PHOTOS.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), SLIDE_MS);
    return () => clearInterval(t);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
      className="relative hidden lg:block"
      style={{ perspective: 1100 }}
      data-testid="hero-portrait"
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-foreground/10 bg-background/50 p-3 shadow-[0_36px_90px_-24px_hsl(var(--foreground)/0.3)] backdrop-blur-xl"
      >
        <div
          data-testid="hero-portrait-slideshow"
          className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={PHOTOS[index]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.1, ease: "easeInOut" } }}
              className="absolute inset-0"
            >
              <motion.img
                src={PHOTOS[index]}
                alt="Avni Bhardwaj"
                data-testid="hero-portrait-image"
                initial={{ scale: 1.02, x: 0, y: 0 }}
                animate={{
                  scale: 1.14,
                  x: index % 2 === 0 ? "-2.5%" : "2.5%",
                  y: index % 2 === 0 ? "-2%" : "2%",
                }}
                transition={{ duration: SLIDE_MS / 1000 + 1.2, ease: "linear" }}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/15" />
        </div>

        {PHOTOS.length > 1 && (
          <div
            data-testid="hero-portrait-dots"
            className="absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-1.5"
          >
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                data-testid={`hero-portrait-dot-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-accent" : "w-1.5 bg-foreground/30 hover:bg-foreground/60"
                }`}
              />
            ))}
          </div>
        )}

        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-foreground/10 bg-background/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-xl"
          style={{ transform: "translateX(-50%) translateZ(40px)" }}
        >
          Indore · Open to opportunities
        </div>
      </motion.div>
    </motion.div>
  );
};
