import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chapter } from "@/components/Chapter";
import { AircraftAssembly } from "@/components/AircraftAssembly";
import { useTheme } from "@/theme/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

type Tab = "industry" | "projects";

type Project = {
  id: string;
  index: string;
  period: string;
  title: string;
  org: string;
  points: string[];
  stack: string[];
};

const AIRBUS: Project = {
  id: "airbus",
  index: "01",
  period: "INTERNSHIP",
  title: "FP-BOT & AirSimuPy",
  org: "Airbus — Data & AI Engineering Intern",
  points: [
    "Architected FP-BOT, a Dockerized RAG pipeline deployed via Jenkins CI/CD, enabling natural-language querying of technical documentation through a FastAPI service.",
    "Built AirSimuPy, a Python + PySide6 simulation platform that executes block-diagram data pipelines as NetworkX graphs with NumPy compute.",
  ],
  stack: ["Python", "FastAPI", "RAG", "Docker", "Jenkins", "PySide6", "NetworkX", "NumPy"],
};

const PROJECTS: Project[] = [
  {
    id: "agent",
    index: "02",
    period: "AUTONOMOUS SYSTEM",
    title: "Autonomous AI Research Agent",
    org: "Independent Build — Pydantic AI × Gemini",
    points: [
      "Engineered a zero-maintenance, autonomous LLM agent using Pydantic AI and Gemini that scans, ranks, and synthesizes high-signal daily research digests.",
    ],
    stack: ["Pydantic AI", "Gemini", "LLM Agents", "Automation"],
  },
  {
    id: "fin-advisor",
    index: "03",
    period: "AI PRODUCT",
    title: "Personalized AI Financial Advisor",
    org: "Independent Build — LLM Reasoning × Data Pipelines",
    points: [
      "Built a personalized AI financial advisor that analyzes spending patterns and delivers tailored, conversational money guidance powered by LLM reasoning over structured transaction data.",
    ],
    stack: ["Python", "LangChain", "FastAPI", "LLM Tooling"],
  },
  {
    id: "dl-research",
    index: "04",
    period: "RESEARCH",
    title: "Ensemble Deep Learning Framework",
    org: "Deep Learning Research — Computer Vision",
    points: [
      "Architected an ensemble deep learning framework integrating DenseNet201 and SE-ResNet50 to optimize image-classification performance.",
    ],
    stack: ["PyTorch", "DenseNet201", "SE-ResNet50", "Ensembles"],
  },
];

const Card = ({ project, i }: { project: Project; i: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
    data-testid={`project-card-${project.id}`}
    className="group flex h-full flex-col gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 backdrop-blur-sm transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/60 md:p-10"
  >
    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
      <span className="text-accent">{project.index}</span>
      <span>{project.period}</span>
    </div>
    <div>
      <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{project.title}</h3>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">{project.org}</p>
    </div>
    <ul className="flex flex-col gap-3">
      {project.points.map((point) => (
        <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-accent" />
          {point}
        </li>
      ))}
    </ul>
    <div className="mt-auto flex flex-wrap gap-2 pt-2">
      {project.stack.map((tech) => (
        <span
          key={tech}
          className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:border-accent/30"
        >
          {tech}
        </span>
      ))}
    </div>
  </motion.article>
);

export const Experience = () => {
  const [tab, setTab] = useState<Tab>("industry");
  const { theme } = useTheme();
  const dark = theme === "dark";
  const projectsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (tab !== "projects") return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax-card]").forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          el,
          { y: 44 * dir },
          {
            y: -44 * dir,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      });
    }, projectsRef);
    return () => ctx.revert();
  }, [tab]);

  const switchTab = (t: Tab) => {
    setTab(t);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <section
      id="work"
      data-testid="experience-section"
      className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
    >
      <Chapter no="01" title="Experience & Projects" id="work" />

      <div
        data-testid="experience-tabs"
        className="sticky top-[72px] z-30 mb-16 inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-background/70 p-1 backdrop-blur-xl"
      >
        {(
          [
            { id: "industry", label: "Industry Experience" },
            { id: "projects", label: "AI & Data Projects" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            data-magnetic
            onClick={() => switchTab(t.id)}
            className={`rounded-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
              tab === t.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "industry" ? (
        <div data-testid="industry-panel">
          <div className="-mx-6 md:-mx-16 lg:-mx-24">
            <AircraftAssembly dark={dark} />
          </div>
          <div className="mt-16 max-w-4xl">
            <Card project={AIRBUS} i={0} />
          </div>
        </div>
      ) : (
        <div ref={projectsRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" data-testid="projects-panel">
          {PROJECTS.map((p, i) => (
            <div key={p.id} data-parallax-card>
              <Card project={p} i={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
