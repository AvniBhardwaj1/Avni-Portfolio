import { useCallback, useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";

const STOPS = [
  { label: "Work", target: "#work" },
  { label: "Journey", target: "#journey" },
  { label: "Skills", target: "#skills" },
  { label: "Certs", target: "#certificates" },
  { label: "Contact", target: "#contact" },
];

type Stop = (typeof STOPS)[number] & { ratio: number };

export const FlightPath = () => {
  const [progress, setProgress] = useState(0);
  const [stops, setStops] = useState<Stop[]>([]);

  const measure = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    setStops(
      STOPS.map((s) => {
        const el = document.querySelector<HTMLElement>(s.target);
        const ratio = el
          ? Math.min(1, Math.max(0, (el.offsetTop - 64) / max))
          : 0;
        return { ...s, ratio };
      }),
    );
  }, []);

  useEffect(() => {
    measure();
    const late = window.setTimeout(measure, 1500); // after fonts / images settle
    window.addEventListener("resize", measure);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(late);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  return (
    <div
      data-testid="flight-path"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      aria-hidden={false}
    >
      <div className="relative h-[42vh] w-px bg-foreground/15">
        <Plane
          data-testid="flight-plane"
          className="absolute -left-[9px] h-[18px] w-[18px] rotate-[135deg] text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.6)]"
          style={{ top: `calc(${progress * 100}% - 9px)` }}
        />
        {stops.map((s) => (
          <button
            key={s.target}
            data-testid={`flight-stop-${s.label.toLowerCase()}`}
            onClick={() => scrollToSection(s.target)}
            aria-label={`Fly to ${s.label}`}
            className="group absolute -left-[3.5px] flex items-center"
            style={{ top: `calc(${s.ratio * 100}% - 4px)` }}
          >
            <span
              className={`h-2 w-2 rounded-full border transition-colors ${
                progress >= s.ratio - 0.01
                  ? "border-accent bg-accent"
                  : "border-accent/50 bg-background group-hover:bg-accent/50"
              }`}
            />
            <span className="absolute right-5 whitespace-nowrap rounded-full border border-foreground/10 bg-background/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
