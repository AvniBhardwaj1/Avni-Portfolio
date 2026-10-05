import { Award, BrainCircuit, Trophy } from "lucide-react";
import { Chapter } from "@/components/Chapter";

const HIGHLIGHTS = [
  {
    id: "engineering-tools",
    Icon: BrainCircuit,
    value: "30+",
    title: "Engineering tools brought into reach",
    detail: "FP-BOT makes technical documentation from 30+ internal tools queryable in plain English.",
    source: "Airbus internship",
  },
  {
    id: "techinnovation",
    Icon: Trophy,
    value: "Top 5",
    title: "Techinnovation, IIT Kanpur",
    detail: "CCTV analytics platform finalist among 25,000 applicants.",
    source: "Techinnovation",
  },
  {
    id: "oracle-challenge",
    Icon: Award,
    value: "Winner",
    title: "GDSC Oracle Challenge",
    detail: "First place with team TECH-TITANS in the 2023 Oracle Challenge.",
    source: "Google Developer Student Clubs",
  },
];

export const Highlights = () => (
  <section
    id="highlights"
    data-testid="highlights-section"
    className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
  >
    <Chapter no="03" title="Highlights" id="highlights" />
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {HIGHLIGHTS.map(({ id, Icon, value, title, detail, source }, index) => (
        <article
          key={id}
          data-testid={`highlight-${id}`}
          className="flex min-h-64 flex-col rounded-3xl border border-foreground/10 bg-background/60 p-7 backdrop-blur-sm transition-colors hover:border-accent/40"
        >
          <div className="flex items-center justify-between">
            <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="mt-8 font-display text-4xl font-bold tracking-tight text-accent">{value}</p>
          <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p>
          <p className="mt-auto pt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {source}
          </p>
        </article>
      ))}
    </div>
  </section>
);
