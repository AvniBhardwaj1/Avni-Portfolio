import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Award } from "lucide-react";
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
    org: "Independent Build — Pydantic AI × Gemini",
    points: [
      "Engineered a zero-maintenance, autonomous LLM agent using Pydantic AI and Gemini that scans, ranks, and synthesizes high-signal daily research digests — shipped on schedule via GitHub Actions.",
    ],
    stack: ["Pydantic AI", "Gemini", "LLM Agents", "GitHub Actions"],
    href: "https://github.com/avnibhardwaj1",
  },
  {
    id: "fin-advisor",
    index: "03",
    period: "AI PRODUCT",
    title: "Personalized AI Financial Advisor",
    org: "Independent Build — Agentic RAG × Llama-3",
    points: [
      "Built an Agentic RAG system using LangChain ReAct, fine-tuning Llama-3 (8B) via Unsloth and PyTorch to deliver personalized, conversational financial guidance.",
    ],
    stack: ["LangChain", "ReAct Agents", "Llama-3 8B", "Unsloth", "PyTorch"],
    href: "https://github.com/avnibhardwaj1",
  },
  {
    id: "mapmynotes",
    index: "04",
    period: "NLP PRODUCT",
    title: "MapMyNotes",
    org: "Study Companion — Streamlit × Google Gemini",
    points: [
      "Built an NLP-powered study companion that converts raw text into structured, navigable mind maps using Streamlit and Google Gemini.",
    ],
    stack: ["Streamlit", "Gemini", "NLP", "Python"],
    href: "https://github.com/avnibhardwaj1/MapMyNotes",
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
    href: "https://github.com/avnibhardwaj1",
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
    href: "https://github.com/avnibhardwaj1",
  },
];

const CERTS = ["CERT_01", "CERT_02", "CERT_03", "CERT_04", "CERT_05"];

const Card = ({ project, i }: { project: Project; i: number }) => {
  const clickable = Boolean(project.href);
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
      data-testid={`project-card-${project.id}`}
      onClick={() => clickable && window.open(project.href, "_blank", "noreferrer")}
      data-magnetic={clickable ? "" : undefined}
      className={`group flex h-full flex-col gap-6 rounded-2xl border border-foreground/10 bg-background/70 p-8 backdrop-blur-sm transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/60 ${
        clickable ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <span className="text-accent">{project.index}</span>
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
            { id: "projects", label: "Projects & Certificates" },
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
          <p className="mb-6 mt-24 font-mono text-xs uppercase tracking-[0.3em] text-accent" data-testid="certificates-label">
            Certificates & Achievements
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {CERTS.map((id) => (
              <a
                key={id}
                href="https://www.linkedin.com/in/avni-bhardwaj10/details/certifications/"
                target="_blank"
                rel="noreferrer"
                data-magnetic
                data-testid={`cert-card-${id.toLowerCase()}`}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-dashed border-foreground/20 p-6 transition-colors hover:border-accent/60"
              >
                <Award className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {id}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  Certificate slot — credential link drops in here
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
