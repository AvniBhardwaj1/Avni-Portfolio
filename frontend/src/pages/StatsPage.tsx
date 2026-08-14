import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Lock, RefreshCw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/analytics`;

type Stats = {
  visitors: number;
  pageViews: number;
  resumeDownloads: number;
  gestureOptins: number;
  chatMessages: number;
  cardClicks: [string, number][];
  dwellAvgSec: Record<string, number>;
  totalEvents: number;
};

const Bar = ({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) => (
  <div className="flex items-center gap-4">
    <span className="w-48 truncate font-mono text-xs text-muted-foreground">{label}</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${max ? Math.max(4, (value / max) * 100) : 0}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-2))]"
      />
    </div>
    <span className="w-16 text-right font-mono text-xs">
      {value}
      {suffix}
    </span>
  </div>
);

export default function StatsPage() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/stats`, { headers: { "x-stats-token": t } });
      if (!res.ok) throw new Error("unauthorized");
      const data = await res.json();
      setStats(data);
      sessionStorage.setItem("ab-stats-token", t);
    } catch {
      setError("Wrong passcode — or the stats server is napping.");
      setStats(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("ab-stats-token");
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = stats
    ? [
        { label: "Unique Visitors", value: stats.visitors, id: "visitors" },
        { label: "Page Views", value: stats.pageViews, id: "pageviews" },
        { label: "Résumé Downloads", value: stats.resumeDownloads, id: "resume" },
        { label: "Gesture Opt-ins", value: stats.gestureOptins, id: "gesture" },
        { label: "Clone Messages", value: stats.chatMessages, id: "chat" },
      ]
    : [];

  const maxClicks = stats?.cardClicks.length ? stats.cardClicks[0][1] : 0;
  const maxDwell = stats ? Math.max(1, ...Object.values(stats.dwellAvgSec)) : 1;

  return (
    <div className="min-h-screen bg-background px-6 py-16 font-body text-foreground md:px-16 lg:px-24">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">{"// private"}</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl" data-testid="stats-title">
        Portfolio Stats<span className="text-accent">.</span>
      </h1>

      {!stats ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(token);
          }}
          className="mt-12 flex max-w-md items-center gap-3"
        >
          <div className="flex flex-1 items-center gap-3 rounded-full border border-foreground/15 px-5 py-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Stats passcode"
              data-testid="stats-token-input"
              className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            data-testid="stats-unlock-button"
            className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-105 active:scale-95"
          >
            {loading ? "…" : "Unlock"}
          </button>
        </form>
      ) : (
        <div className="mt-12 flex flex-col gap-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5" data-testid="stats-cards">
            {cards.map((c) => (
              <div key={c.id} data-testid={`stat-${c.id}`} className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
                <p className="mt-2 font-display text-4xl font-bold text-accent">{c.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-accent">
              <BarChart3 className="h-4 w-4" /> Project Card Clicks
            </h2>
            <div className="flex flex-col gap-4" data-testid="stats-card-clicks">
              {stats.cardClicks.length === 0 && (
                <p className="font-mono text-xs text-muted-foreground">No card clicks yet — the recruiters are still reading.</p>
              )}
              {stats.cardClicks.map(([title, count]) => (
                <Bar key={title} label={title} value={count} max={maxClicks} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-accent">
              <BarChart3 className="h-4 w-4" /> Avg. Time per Section
            </h2>
            <div className="flex flex-col gap-4" data-testid="stats-dwell">
              {Object.keys(stats.dwellAvgSec).length === 0 && (
                <p className="font-mono text-xs text-muted-foreground">No dwell data yet.</p>
              )}
              {Object.entries(stats.dwellAvgSec).map(([sec, secs]) => (
                <Bar key={sec} label={`#${sec}`} value={secs} max={maxDwell} suffix="s" />
              ))}
            </div>
          </div>

          <button
            onClick={() => load(sessionStorage.getItem("ab-stats-token") || token)}
            data-testid="stats-refresh-button"
            className="flex w-fit items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 font-mono text-xs text-red-500" data-testid="stats-error">
          {error}
        </p>
      )}
    </div>
  );
}
