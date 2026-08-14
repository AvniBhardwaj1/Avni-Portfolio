import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const Portrait = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 140, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 140, damping: 18 });

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
        <div className="relative overflow-hidden rounded-[1.6rem]">
          <img
            src="/portrait.webp"
            alt="Avni Bhardwaj"
            data-testid="hero-portrait-image"
            className="w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/15" />
        </div>
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
