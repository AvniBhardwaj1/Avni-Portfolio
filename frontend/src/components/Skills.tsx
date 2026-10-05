import { Chapter } from "@/components/Chapter";
import { FlipIn } from "@/components/Reveal";
import { GitHubHeatmap } from "@/components/GitHubHeatmap";

const GROUPS = [
  {
    id: "data-cloud",
    title: "Data Engineering & Cloud",
    items: ["AWS", "Docker", "Kubernetes", "Kafka", "ClickHouse"],
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    items: ["PyTorch", "LangChain", "RAG"],
  },
  {
    id: "backend",
    title: "Backend",
    items: [
      "Python",
      "C++",
      "FastAPI",
      "ESP32",
      "Embedded C",
      "Sensor interfacing",
      "GPIO",
      "I2C",
      "Blynk Cloud",
    ],
  },
];

const GROUP_COLORS = ["text-accent", "text-accent2", "text-accent3"];
export const SKILL_PILLAR_COUNT = GROUPS.length;

export const Skills = () => (
  <section
    id="skills"
    data-testid="skills-section"
    className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
  >
    <Chapter no="04" title="Skills" id="skills" />
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {GROUPS.map((group, gi) => (
        <FlipIn
          key={group.id}
          delay={gi * 0.1}
          testId={`skill-group-${group.id}`}
        >
          <article className="relative flex min-h-[290px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-foreground/10 bg-background/50 px-5 py-8 backdrop-blur-sm">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/5"
              aria-hidden="true"
            />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full text-accent/20"
              viewBox="0 0 400 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M200 150 74 76M200 150 326 76M200 150 76 230M200 150 324 230M200 150 200 24" fill="none" stroke="currentColor" strokeDasharray="3 7" />
              <circle cx="74" cy="76" r="3" fill="currentColor" />
              <circle cx="326" cy="76" r="3" fill="currentColor" />
              <circle cx="76" cy="230" r="3" fill="currentColor" />
              <circle cx="324" cy="230" r="3" fill="currentColor" />
              <circle cx="200" cy="24" r="3" fill="currentColor" />
            </svg>
            <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-accent/30 bg-background/90 text-center shadow-[0_0_40px_hsl(var(--accent)/0.12)]">
              <span className={`font-mono text-[9px] uppercase tracking-[0.12em] ${GROUP_COLORS[gi % 3]}`}>
                Pillar {String(gi + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 px-1 font-display text-xs font-semibold leading-tight">
                {group.title}
              </span>
            </div>
            <ul className="relative z-10 mt-7 flex max-w-sm flex-wrap justify-center gap-2">
            {group.items.map((item, i) => (
              <li
                key={item}
                data-testid={`skill-${group.id}-${i}`}
                className="rounded-full border border-foreground/10 bg-background/90 px-3 py-2 font-mono text-[10px] text-muted-foreground shadow-sm transition-[transform,border-color,color] duration-300 hover:-translate-y-1 hover:border-accent/50 hover:text-foreground"
              >
                {item}
              </li>
            ))}
            </ul>
          </article>
        </FlipIn>
      ))}
    </div>
    <GitHubHeatmap />
  </section>
);
