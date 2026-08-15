import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;
const WEEKS = 26; // ~6 months of activity

type Day = { date: string; count: number; level: number };

const LEVEL_ALPHA = [0.07, 0.3, 0.5, 0.75, 1];

export const GitHubHeatmap = () => {
  const [days, setDays] = useState<Day[] | null>(null);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/github/contributions`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        setDays(d.days);
        setTotal(d.total);
      })
      .catch(() => setFailed(true));
  }, []);

  const weeks = useMemo(() => {
    if (!days) return [];
    const recent = days.slice(-WEEKS * 7);
    const cols: Day[][] = [];
    for (let i = 0; i < recent.length; i += 7) cols.push(recent.slice(i, i + 7));
    return cols;
  }, [days]);

  if (failed) return null; // fail silent — the section works without it

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      data-testid="github-heatmap"
      className="mt-20 rounded-3xl border border-foreground/10 bg-background/60 p-6 backdrop-blur-sm md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 text-accent">
            <Github className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              Proof of work
            </p>
            <p
              data-testid="github-heatmap-total"
              className="mt-1 font-display text-lg font-bold tracking-tight"
            >
              {days ? `${total} contributions this year` : "Loading activity…"}
            </p>
          </div>
        </div>
        <a
          href="https://github.com/avnibhardwaj1"
          target="_blank"
          rel="noreferrer"
          data-testid="github-heatmap-link"
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Live from GitHub
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      {days ? (
        <>
          <div className="flex gap-[3px]" data-testid="github-heatmap-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <motion.div
                    key={day.date}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.45,
                      delay: wi * 0.035,
                      ease: "easeOut",
                    }}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}
                    className="h-3 w-3 origin-bottom rounded-[3px] transition-transform hover:scale-125"
                    style={{
                      backgroundColor: `hsl(var(--accent) / ${LEVEL_ALPHA[Math.min(day.level, 4)]})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Less
            {LEVEL_ALPHA.map((a) => (
              <span
                key={a}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: `hsl(var(--accent) / ${a})` }}
              />
            ))}
            More
          </div>
        </>
      ) : (
        <div className="flex h-28 animate-pulse items-center justify-center rounded-xl bg-foreground/5">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Fetching commit grid…
          </span>
        </div>
      )}
    </motion.div>
  );
};
