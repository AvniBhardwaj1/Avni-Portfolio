import { motion } from "framer-motion";
import { ArrowDown, CameraOff, Hand, Loader2, ScanFace } from "lucide-react";
import type { useGestureScroll } from "@/hooks/useGestureScroll";
import { useTheme } from "@/theme/ThemeContext";
import { HeroAvatar } from "@/components/HeroAvatar";
import { SocialLinks } from "@/components/SocialLinks";

const NAME_LINES = ["AVNI", "BHARDWAJ"];

const lineReveal = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { delay: 0.2 + i * 0.13, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATUS_TEXT: Record<string, string> = {
  idle: "Gesture scroll ready — camera stays off until you opt in",
  loading: "Loading hand-tracking model",
  active: "Gesture scroll live — move index finger up / down",
  denied: "Camera access denied — enable it in your browser",
  error: "Camera unavailable here — classic scroll works fine",
};

export const Hero = ({ gesture }: { gesture: ReturnType<typeof useGestureScroll> }) => {
  const { status, enable } = gesture;
  const { theme } = useTheme();
  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative flex min-h-screen flex-col justify-center px-6 pb-24 pt-28 md:px-16 lg:px-24"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6 }}
            data-testid="hero-kicker"
            className="mb-8 font-mono text-xs uppercase tracking-[0.35em] text-accent"
          >
            {"// data · cloud · ai"}
          </motion.p>

          <h1
            data-testid="hero-name"
            className="font-display font-bold leading-[0.92] tracking-tight"
          >
            {NAME_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  custom={i}
                  variants={lineReveal}
                  initial="hidden"
                  animate="visible"
                  className="block text-[clamp(3rem,10.5vw,8.5rem)]"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="mt-10 max-w-xl"
          >
            <p
              data-testid="hero-title"
              className="font-mono text-sm uppercase tracking-[0.25em] text-foreground/80"
            >
              Computer Engineering | Data, Cloud &amp; AI
            </p>
            <p
              data-testid="hero-tagline"
              className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Architecting intelligent data pipelines and scalable AI solutions — turning
              raw events into production-grade intelligence.
            </p>
            <div className="mt-8">
              <SocialLinks />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            data-testid="gesture-indicator"
            className="mt-8 flex w-full max-w-sm items-center gap-4 rounded-2xl border border-foreground/10 bg-background/60 p-4 backdrop-blur-xl"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">
              {status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : status === "active" ? (
                <Hand className="h-5 w-5" />
              ) : status === "denied" || status === "error" ? (
                <CameraOff className="h-5 w-5" />
              ) : (
                <ScanFace className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                data-testid="gesture-status-text"
                className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground"
              >
                {STATUS_TEXT[status]}
              </p>
              {status !== "active" && status !== "loading" && (
                <button
                  data-testid="enable-camera-button"
                  data-magnetic
                  onClick={enable}
                  className="mt-1 font-mono text-xs text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-foreground"
                >
                  Enable Camera for Gesture Scroll
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
          className="relative hidden h-[560px] lg:block"
          data-testid="hero-avatar"
        >
          <HeroAvatar dark={theme === "dark"} />
          <p className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            It watches your cursor back
          </p>
        </motion.div>
      </div>

      {status !== "active" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-6 flex items-center gap-3 md:left-16 lg:left-24"
          data-testid="hero-scroll-hint"
        >
          <ArrowDown className="h-4 w-4 animate-bounce text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Scroll — or let your hand do it
          </span>
        </motion.div>
      )}
    </section>
  );
};
