import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, CameraOff, Download, Hand, Loader2, ScanFace } from "lucide-react";
import type { useGestureScroll } from "@/hooks/useGestureScroll";
import { Portrait } from "@/components/Portrait";
import { SocialLinks } from "@/components/SocialLinks";
import { GestureGuideModal } from "@/components/GestureGuideModal";
import { PROJECT_COUNT } from "@/components/Experience";
import { CERTIFICATION_COUNT } from "@/components/Certificates";
import { SKILL_PILLAR_COUNT } from "@/components/Skills";
import { useMotion } from "@/theme/MotionContext";

const NAME_LINES = ["AVNI", "BHARDWAJ"];

const lineReveal = {
  hidden: { y: "115%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { delay: 0.2 + i * 0.13, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATUS_TEXT: Record<string, string> = {
  idle: "Gesture control ready — camera stays off until you opt in",
  loading: "Loading hand-tracking model",
  active: "Gesture control live — hand scrolls, pinch clicks",
  denied: "Camera access denied — enable it in your browser",
  error: "Camera unavailable here — classic scroll works fine",
};

const STATISTICS = [
  { id: "projects", value: PROJECT_COUNT, label: "Projects documented" },
  { id: "skills", value: SKILL_PILLAR_COUNT, label: "Skill pillars" },
  { id: "certificates", value: CERTIFICATION_COUNT, label: "Certificates" },
];

const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const { reduced } = useMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [count, inView, reduced, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export const Hero = ({ gesture }: { gesture: ReturnType<typeof useGestureScroll> }) => {
  const { status, enable } = gesture;
  const { reduced } = useMotion();
  const [guideOpen, setGuideOpen] = useState(false);
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
            <div
              data-testid="availability-pill"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/80"
            >
              <span className={`h-2 w-2 rounded-full bg-accent ${reduced ? "" : "animate-pulse"}`} />
              Open to internships &amp; collaborations
            </div>
            <p
              data-testid="hero-tagline"
              className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Architecting intelligent data pipelines and scalable AI solutions — turning
              raw events into production-grade intelligence.
            </p>
            <a
              href={`${process.env.PUBLIC_URL ?? ""}/Avni_Bhardwaj_Resume.pdf`}
              download
              data-testid="hero-resume-link"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Download résumé
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <div className="mt-8">
              <SocialLinks />
            </div>
            <div
              data-testid="hero-statistics"
              className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-foreground/10 pt-5"
            >
              {STATISTICS.map((stat) => (
                <div key={stat.id} data-testid={`hero-stat-${stat.id}`}>
                  <p className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-muted-foreground sm:text-[10px]">
                    {stat.label}
                  </p>
                </div>
              ))}
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
                  onClick={() => setGuideOpen(true)}
                  className="mt-1 font-mono text-xs text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-foreground"
                >
                  Enable Camera for Gesture Control
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="relative hidden lg:block">
          <Portrait />
        </div>
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

      <GestureGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStart={() => {
          setGuideOpen(false);
          enable();
        }}
      />
    </section>
  );
};
