import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CloudSun, Headphones, Wrench } from "lucide-react";

// Edit these two lines anytime — they show on the live "Now" card.
const STATUS = [
  { id: "building", Icon: Wrench, label: "Building", value: "FP-BOT & AirSimuPy @ Airbus" },
  { id: "listening", Icon: Headphones, label: "Listening", value: "Lo-fi beats & vinyl crackle" },
];

const WEATHER_TEXT: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Showers",
  95: "Thunderstorm",
};
const weatherLabel = (code: number) =>
  WEATHER_TEXT[code] ?? (code >= 50 ? "Light rain" : "Cloudy");

export const NowCard = () => {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(`${fmt.format(new Date())} IST`);
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Open-Meteo: free, keyless, CORS-friendly — Indore coordinates
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=22.7196&longitude=75.8577&current_weather=true",
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        const cw = d.current_weather;
        if (cw) setWeather(`${Math.round(cw.temperature)}°C · ${weatherLabel(cw.weathercode)}`);
      })
      .catch(() => setWeather(null));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      data-testid="now-card"
      className="mt-12 max-w-3xl rounded-3xl border border-foreground/10 bg-background/60 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Now · Live
        </p>
        <p
          data-testid="now-clock"
          className="font-mono text-xs tabular-nums text-muted-foreground"
        >
          {time}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STATUS.map(({ id, Icon, label, value }) => (
          <div
            key={id}
            data-testid={`now-${id}`}
            className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3"
          >
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
            </div>
          </div>
        ))}
        <div
          data-testid="now-weather"
          className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3"
        >
          <CloudSun className="h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Indore weather
            </p>
            <p className="mt-0.5 truncate text-sm font-medium">{weather ?? "—"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
