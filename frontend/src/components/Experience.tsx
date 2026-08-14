import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chapter } from "@/components/Chapter";
import { AircraftAssembly } from "@/components/AircraftAssembly";
import { useTheme } from "@/theme/ThemeContext";
import { track } from "@/lib/analytics";

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
  href?: string;
};

const AIRBUS: Project = {
  id: "airbus",
  index: "01",
  period: "INTERNSHIP",
  title: "FP-BOT & AirSimuPy",
  org: "Airbus — Data & AI Engineering Intern",
  points: [
    "Architected FP-BOT, a Dockerized RAG pipeline deployed via Jenkins CI/CD, enabling natural-language querying of technical documentation through a FastAPI service.",
    "Built AirSimuPy, a Python + PySide6 simulation platform executing block-diagram data pipelines as NetworkX graphs with NumPy compute — via a Hybrid Compiled Architecture.",
    "Executed mathematical validation of a Python-based Sorting Tool against legacy Fortran solvers.",
  ],
  stack: ["Python", "FastAPI", "RAG", "Docker", "Jenkins", "PySide6", "NetworkX", "NumPy", "Fortran"],
};

const PROJECTS: Project[] = [
  {
    id: "agent",
    index: "02",
    period: "AUTONOMOUS SYSTEM",
    title: "Autonomous AI Research Agent",
    org: "Briefing-Bot — Gemini × GitHub Actions",
    points: [
      "Zero-maintenance daily AI/tech digest: a GitHub Actions cron pulls a strict source allowlist, Gemini synthesizes headlines and a verified Fact of the Day under prompt-injection defenses, and Gmail SMTP ships a formatted HTML email.",
    ],
    stack: ["Python", "Gemini", "GitHub Actions", "Gmail SMTP"],
    href: "https://github.com/AvniBhardwaj1/Briefing-Bot-Automation",
  },
  {
    id: "fin-advisor",
    index: "03",
    period: "AI PRODUCT",
    title: "Personalized AI Financial Advisor",
    org: "Agentic RAG — Local Llama-3 × LangChain",
    points: [
      "Fine-tuned, quantized Llama-3 (GGUF) served locally via Ollama, wired into a LangChain ReAct agent that calls live tools — yfinance prices and CSV client lookups — inside a Streamlit app. Reasoning stays with the LLM; facts stay with tools.",
    ],
    stack: ["LangChain", "ReAct", "Llama-3", "Ollama", "Streamlit"],
    href: "https://github.com/AvniBhardwaj1/personal-finance-assistant",
  },
  {
    id: "mapmynotes",
    index: "04",
    period: "NLP PRODUCT",
    title: "MapMyNotes",
    org: "Study Companion — Streamlit × Google Gemini",
    points: [
      "Turns PDFs, slides, or raw text into interactive D3.js mind maps with hover explanations, auto-generated flashcards, and quizzes — Gemini handles hierarchy extraction end to end.",
    ],
    stack: ["Streamlit", "Gemini", "D3.js", "PyMuPDF"],
    href: "https://github.com/AvniBhardwaj1/MapMyNotes",
  },
  {
    id: "bone-age",
    index: "05",
    period: "MEDICAL AI RESEARCH",
    title: "Pediatric Bone Age Prediction",
    org: "Deep Learning Research — Medical Diagnostics",
    points: [
      "Architected an ensemble deep learning framework integrating DenseNet201 and SE-ResNet50 for pediatric bone-age assessment in medical diagnostics.",
    ],
    stack: ["PyTorch", "DenseNet201", "SE-ResNet50", "Medical AI"],
    href: "https://github.com/AvniBhardwaj1",
  },
  {
    id: "iot-actuator",
    index: "06",
    period: "HARDWARE",
    title: "IoT Actuator Control",
    org: "Embedded Build — Arduino Uno × ESP8266",
    points: [
      "Implemented practical hardware integration for remote actuator control using Arduino Uno and ESP8266 with real-time signal handling.",
    ],
    stack: ["Arduino Uno", "ESP8266", "IoT", "C++"],
    href: "https://github.com/AvniBhardwaj1",
  },
  {
    id: "jobhunt",
    index: "07",
    period: "AUTOMATION",
    title: "Job Hunt Automation",
    org: "jobhunt — ATS APIs × LLM Screening",
    points: [
      "A personal job-search agent that reads public ATS APIs (Greenhouse, Lever, Ashby), deterministically prefilters ~99% of postings, LLM-scores the rest against a resume, drafts application kits, and emails a daily digest.",
    ],
    stack: ["Python", "Claude / Gemini / Groq", "GitHub Actions", "pytest"],
    href: "https://github.com/AvniBhardwaj1/Job_search_automation",
  },
  {
    id: "weather-mcp",
    index: "08",
    period: "SERVICE DESIGN",
    title: "Weather MCP Server",
    org: "OpenWeatherMap Wrapper — Minimal Common Platform",
    points: [
      "A small MCP-style service that normalizes OpenWeatherMap into a stable JSON contract — current conditions and daily forecasts — with TTL/Redis caching, uniform error responses, Jest tests, and a demo browser UI.",
    ],
    stack: ["Node.js", "REST", "Redis", "Jest"],
    href: "https://github.com/AvniBhardwaj1/weather-mcp-server",
  },
  {
    id: "fake-news",
    index: "09",
    period: "ML RESEARCH",
    title: "Fake News Detection",
    org: "NLP — TF-IDF × Cosine Similarity",
    points: [
      "Classifies articles as real or fake using TF-IDF vectorization and threshold-based cosine-similarity clustering — 89% accuracy with balanced precision/recall — shipped with EDA and a Streamlit prediction app.",
    ],
    stack: ["NLP", "TF-IDF", "scikit-learn", "Streamlit"],
    href: "https://github.com/AvniBhardwaj1/MLPROJECT",
  },
  {
    id: "typing-game",
    index: "10",
    period: "WEB GAME",
    title: "Speed Typing Game",
    org: "Browser Build — Vanilla JS",
    points: [
      "An interactive typing trainer that tracks words-per-minute and accuracy in real time with instant visual feedback.",
    ],
    stack: ["JavaScript", "HTML", "CSS"],
    href: "https://github.com/AvniBhardwaj1/speed-typing-game",
  },
];

const INDEX_COLORS = ["text-accent", "text-accent2", "text-accent3"];

const Card = ({ project, i }: { project: Project; i: number }) => {
  const clickable = Boolean(project.href);
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
      data-testid={`project-card-${project.id}`}
      onClick={() => {
        track("card_click", { id: project.id, title: project.title });
        if (clickable) window.open(project.href, "_blank", "noreferrer");
      }}
      data-magnetic={clickable ? "" : undefined}
      className={`group flex h-full flex-col gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 backdrop-blur-sm transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/60 ${
        clickable ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <span className={INDEX_COLORS[i % 3]}>{project.index}</span>
        <span className="flex items-center gap-2">
          {project.period}
          {clickable && (
            <ArrowUpRight className="h-3.5 w-3.5 transition-colors group-hover:text-accent" />
          )}
        </span>
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
};

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
            { id: "projects", label: "Projects" },
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
        <div ref={projectsRef} data-testid="projects-panel">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <div key={p.id} data-parallax-card>
                <Card project={p} i={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
