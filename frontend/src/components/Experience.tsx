import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Github, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chapter } from "@/components/Chapter";
import { AircraftAssembly } from "@/components/AircraftAssembly";
import { useTheme } from "@/theme/ThemeContext";
import { track } from "@/lib/analytics";

gsap.registerPlugin(ScrollTrigger);

type Tab = "industry" | "projects";

type ProjectDetails = {
  problem: string;
  architecture: string[];
  impact: string[];
};

type Project = {
  id: string;
  index: string;
  period: string;
  title: string;
  org: string;
  points: string[];
  stack: string[];
  href?: string;
  details: ProjectDetails;
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
  details: {
    problem:
      "Flight-physics engineers were digging through dense technical documentation and Fortran-era tooling — the answers existed, but finding them was slow.",
    architecture: [
      "FP-BOT: Dockerized RAG service (FastAPI + LlamaIndex + vLLM + Qdrant) exposing 30+ engineering tools through one natural-language interface, shipped via Jenkins CI/CD.",
      "AirSimuPy: PySide6 desktop platform that executes block-diagram simulation pipelines as NetworkX graphs with NumPy compute — a hybrid compiled architecture.",
      "Sorting Tool: mathematical validation of a modern Python solver against legacy Fortran references.",
    ],
    impact: [
      "30+ internal tools queryable in plain English",
      "Legacy Fortran logic formally verified against modern Python",
    ],
  },
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
    details: {
      problem:
        "Keeping up with AI news daily is a job in itself — and most digest bots need constant babysitting.",
      architecture: [
        "GitHub Actions cron on a strict source allowlist — no scraping free-for-all.",
        "Gemini synthesizes headlines plus a verified Fact of the Day, under prompt-injection defenses.",
        "Gmail SMTP ships a formatted HTML digest every morning.",
      ],
      impact: [
        "Zero-maintenance — it runs itself every single day",
        "Hardened against prompt injection from untrusted source content",
      ],
    },
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
    details: {
      problem:
        "Financial advice tools either hallucinate numbers or burn money on hosted inference.",
      architecture: [
        "Quantized Llama-3 (GGUF) fine-tuned and served fully locally via Ollama.",
        "LangChain ReAct agent — reasoning stays with the LLM, facts stay with tools.",
        "Live yfinance price lookups + CSV client records (70k+ finance rows).",
        "Streamlit front end for conversations and reports.",
      ],
      impact: [
        "Fully local — zero inference cost, zero data leaves the machine",
        "Tool-grounded answers: the LLM never invents a figure",
      ],
    },
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
    details: {
      problem:
        "Dense PDFs and lecture slides don't turn themselves into study material.",
      architecture: [
        "PyMuPDF ingestion for PDFs, slides, or raw text.",
        "Gemini extracts the full concept hierarchy end to end.",
        "D3.js renders interactive mind maps with hover explanations, flashcards, and quizzes.",
      ],
      impact: ["Any PDF becomes an interactive study companion in one pass"],
    },
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
    details: {
      problem:
        "Pediatric bone-age assessment is manual, slow, and varies between radiologists.",
      architecture: [
        "4-model ensemble fusing DenseNet201 and SE-ResNet50 feature extractors.",
        "PyTorch training pipeline over pediatric X-ray datasets.",
      ],
      impact: ["Research-grade ensemble framework for medical diagnostics"],
    },
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
    details: {
      problem:
        "Remote actuator control needs a reliable handshake between hardware and the network.",
      architecture: [
        "Arduino Uno drives the actuators; ESP8266 handles Wi-Fi communication.",
        "Real-time signal handling written in C++.",
      ],
      impact: ["Working end-to-end remote actuator control build"],
    },
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
    details: {
      problem:
        "Job hunting is a full-time job — thousands of postings, almost all irrelevant.",
      architecture: [
        "Reads public ATS APIs (Greenhouse, Lever, Ashby) directly.",
        "Deterministic prefiltering drops ~99% of postings before any LLM call.",
        "An LLM scores the survivors against a resume and drafts application kits.",
        "GitHub Actions cron emails a daily digest; pytest covers the pipeline.",
      ],
      impact: [
        "~99% of noise removed before a single token is spent",
        "Daily digest of only the roles worth reading",
      ],
    },
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
    details: {
      problem:
        "Weather APIs return inconsistent shapes that quietly break downstream consumers.",
      architecture: [
        "MCP-style Node.js service normalizing OpenWeatherMap into one stable JSON contract.",
        "TTL/Redis caching plus uniform error responses.",
        "Jest test suite and a demo browser UI.",
      ],
      impact: ["One stable contract for current conditions and daily forecasts"],
    },
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
    details: {
      problem: "Most misinformation classifiers are opaque black boxes.",
      architecture: [
        "TF-IDF vectorization with threshold-based cosine-similarity clustering.",
        "Full EDA notebook plus a Streamlit prediction app.",
      ],
      impact: ["89% accuracy with balanced precision and recall"],
    },
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
    details: {
      problem: "Typing trainers are either ugly, paywalled, or both.",
      architecture: [
        "Vanilla JS engine tracking WPM and accuracy in real time.",
        "Instant visual feedback loop — no frameworks, no dependencies.",
      ],
      impact: ["Live WPM + accuracy tracking in a zero-dependency browser game"],
    },
  },
];

const INDEX_COLORS = ["text-accent", "text-accent2", "text-accent3"];

const Card = ({
  project,
  i,
  onOpen,
}: {
  project: Project;
  i: number;
  onOpen: (p: Project) => void;
}) => (
  <motion.article
    layoutId={`project-card-${project.id}`}
    initial={{ opacity: 0, y: 48, rotateX: 14 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.85, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
    style={{ transformPerspective: 1000 }}
    data-testid={`project-card-${project.id}`}
    onClick={() => {
      track("card_click", { id: project.id, title: project.title });
      onOpen(project);
    }}
    data-magnetic
    className="group flex h-full cursor-pointer flex-col gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 backdrop-blur-sm transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/60"
  >
    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
      <span className={INDEX_COLORS[i % 3]}>{project.index}</span>
      <span className="flex items-center gap-2">
        {project.period}
        <ArrowUpRight className="h-3.5 w-3.5 transition-colors group-hover:text-accent" />
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
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 transition-colors group-hover:text-accent">
      Tap to unfold the build
    </p>
  </motion.article>
);

const DetailBlock = ({
  label,
  items,
  diamond,
}: {
  label: string;
  items: string[];
  diamond?: boolean;
}) => (
  <div>
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{label}</p>
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {diamond && <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const ProjectOverlay = ({
  project,
  i,
  onClose,
}: {
  project: Project;
  i: number;
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      data-testid="project-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md md:p-8"
      onClick={onClose}
    >
      <motion.div
        layoutId={`project-card-${project.id}`}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col gap-6 overflow-y-auto rounded-2xl border border-accent/30 bg-background/95 p-8 shadow-[0_50px_120px_-30px_hsl(var(--foreground)/0.4)] backdrop-blur-2xl md:p-10"
      >
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className={INDEX_COLORS[i % 3]}>{project.index} · {project.period}</span>
          <button
            data-testid="project-overlay-close"
            onClick={onClose}
            aria-label="Close project details"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {project.org}
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            The problem
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {project.details.problem}
          </p>
        </div>

        <DetailBlock label="Architecture" items={project.details.architecture} diamond />
        <DetailBlock label="Impact" items={project.details.impact} diamond />

        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            data-testid="project-overlay-github"
            data-magnetic
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Github className="h-4 w-4" />
            View on GitHub
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
};

export const Experience = () => {
  const [tab, setTab] = useState<Tab>("industry");
  const [selected, setSelected] = useState<Project | null>(null);
  const { theme } = useTheme();
  const dark = theme === "dark";
  const projectsRef = useRef<HTMLDivElement>(null);

  const openProject = (p: Project) => {
    setSelected(p);
    track("project_expand", { id: p.id, title: p.title });
  };

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

  const allProjects = [AIRBUS, ...PROJECTS];
  const selectedIndex = selected
    ? allProjects.findIndex((p) => p.id === selected.id)
    : 0;

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
            <Card project={AIRBUS} i={0} onOpen={openProject} />
          </div>
        </div>
      ) : (
        <div ref={projectsRef} data-testid="projects-panel">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <div key={p.id} data-parallax-card>
                <Card project={p} i={i + 1} onOpen={openProject} />
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectOverlay
            project={selected}
            i={selectedIndex}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
