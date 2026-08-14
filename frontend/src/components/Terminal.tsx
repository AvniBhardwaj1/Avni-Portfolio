import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TerminalSquare, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { useTheme } from "@/theme/ThemeContext";

type Line = { kind: "cmd" | "out" | "sys"; text: string };

const CHAT_API = `${process.env.REACT_APP_BACKEND_URL}/api/chat`;

const getSessionId = () => {
  let id = localStorage.getItem("ab-chat-session");
  if (!id) {
    id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    localStorage.setItem("ab-chat-session", id);
  }
  return id;
};

const BANNER: Line[] = [
  { kind: "sys", text: "AVNI://TERMINAL v1.0 — welcome, visitor" },
  { kind: "sys", text: "type `help` for commands · `ask <question>` talks to Avni's clone · ESC to exit" },
  { kind: "out", text: "" },
];

const COMMAND_NAMES = [
  "help", "whoami", "about", "skills", "projects", "experience", "achievements",
  "contact", "socials", "quote", "resume", "github", "linkedin", "leetcode",
  "theme", "ask", "ls", "pwd", "date", "echo", "banner", "certificates",
  "hireme", "matrix", "guess", "sudo", "clear", "exit",
];

const OUTPUTS: Record<string, string[]> = {
  whoami: ["avni bhardwaj — computer engineering | data, cloud & ai", "currently: turning raw events into production-grade intelligence."],
  about: [
    "B.Tech Computer Engineering @ NMIMS Indore.",
    "Data, Cloud & AI engineer: pipelines by day, LLM agents by night.",
    "Ex-Airbus India intern. GDSC Lead. IIM Indore national finalist.",
    'Motto: "Today no knowledge, tomorrow master."',
  ],
  skills: [
    "data & cloud   →  AWS · Docker · Kubernetes · Kafka · ClickHouse",
    "ai / ml        →  PyTorch · LangChain · RAG",
    "backend        →  Python · C++ · FastAPI",
    "languages      →  English · Hindi · Korean (I)",
  ],
  projects: [
    "briefing-bot          zero-maintenance daily AI digest — Gemini + GitHub Actions",
    "finance-assistant     local Llama-3 (GGUF) + LangChain ReAct tools + Streamlit",
    "mapmynotes            notes → interactive D3 mind maps, flashcards, quizzes",
    "jobhunt               ATS API agent: prefilter → LLM score → drafted kits → digest",
    "weather-mcp-server    OpenWeatherMap normalized into a stable MCP contract",
    "fake-news-detector    TF-IDF + cosine similarity, 89% accuracy, Streamlit app",
    "bone-age              DenseNet201 + SE-ResNet50 ensemble, medical diagnostics",
    "iot-actuator          Arduino Uno + ESP8266 remote control",
    "speed-typing          vanilla JS WPM trainer",
    "",
    "type `github` to open the repos.",
  ],
  experience: [
    "airbus india — data & ai engineering intern",
    "  · FP-BOT — Dockerized RAG pipeline, Jenkins CI/CD, FastAPI NL querying",
    "  · AirSimuPy — PySide6 sim engine, NetworkX graphs, NumPy, hybrid compiled arch",
    "  · validated a Python sorting tool against legacy Fortran solvers",
  ],
  achievements: [
    "national finalist — chaitanya, atharv ranbhoomi'24, IIM indore (top 20 of 977)",
    "GDSC lead 2023-24 — workshops, mentoring, community",
    "6th rank × 2 — techinnovation, IIT kanpur (top 5 of 25,000 once)",
    "organizing committee — wittyhacks 4.0, NMIMS indore",
    "top 10 — execute hackathon (AI fashion try-on)",
    "winner — GDSC oracle challenge 2023",
  ],
  contact: [
    "email    →  avnibhardwaj01.ab@gmail.com",
    "mobile   →  +91 96913 85721",
    "location →  indore, madhya pradesh",
    "type `resume` to download the PDF.",
  ],
  socials: [
    "github    →  github.com/avnibhardwaj1",
    "linkedin  →  linkedin.com/in/avni-bhardwaj10",
    "leetcode  →  leetcode.com/u/AvniBhardwaj10",
  ],
  help: [
    "help · whoami · about · skills · projects · experience · achievements",
    "contact · socials · quote · resume · certificates · github · linkedin · leetcode",
    "ls · pwd · date · echo <txt> · banner · hireme · theme · sudo",
    "ask <question>   ask the digital clone anything",
    "matrix · guess   easter eggs. guess is a game — you will lose gracefully",
    "clear / Ctrl+L   wipe the screen · exit / ESC  close terminal",
  ],
};

const QUOTES = [
  '"Today no knowledge, tomorrow master."',
  '"It works on my machine."',
  '"Turning caffeine into scalable architecture."',
  '"Kubernetes orchestrates my containers. Coffee orchestrates me."',
  '"My pipelines have fewer leaks than my deadlines."',
  '"I speak English, Hindi, Korean (I) — and fluent Python."',
  '"TF-IDF helps me find words that are contextually important, not globally common. Same energy for life."',
  '"Zero-maintenance is a lifestyle, not just an architecture choice."',
];

export const Terminal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{ target: number; tries: number } | null>(null);
  const { toggle } = useTheme();

  useEffect(() => {
    if (open) {
      setLines(BANNER);
      track("terminal_open");
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const push = (...newLines: Line[]) => setLines((prev) => [...prev, ...newLines]);

  const ask = async (question: string) => {
    setBusy(true);
    push({ kind: "sys", text: "clone is thinking…" });
    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          sessionId: getSessionId(),
        }),
      });
      if (!res.ok || !res.body) throw new Error("bad response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setLines((prev) => [...prev.slice(0, -1), { kind: "out", text: "clone> " }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const text = acc;
        setLines((prev) => [...prev.slice(0, -1), { kind: "out", text: `clone> ${text}` }]);
      }
    } catch {
      setLines((prev) => [...prev.slice(0, -1), { kind: "out", text: "clone> brain glitch — email the human: avnibhardwaj01.ab@gmail.com" }]);
    }
    setBusy(false);
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push({ kind: "cmd", text: `visitor@avni:~$ ${cmd}` });
    setHistory((h) => [...h, cmd]);
    setHistIdx(-1);
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);

    if (name === "clear") return setLines([]);
    if (name === "exit") return onClose();
    if (name === "ask") {
      if (!rest.length) return push({ kind: "sys", text: "usage: ask <question>" });
      track("chat_message", { source: "terminal" });
      return ask(rest.join(" "));
    }
    if (gameRef.current) {
      if (cmd.toLowerCase() === "guess exit") {
        gameRef.current = null;
        return push({ kind: "sys", text: "game over. the number keeps its secrets." });
      }
      const n = parseInt(cmd, 10);
      if (!Number.isNaN(n)) {
        const g = gameRef.current;
        g.tries++;
        if (n === g.target) {
          gameRef.current = null;
          return push({ kind: "out", text: `correct — ${n} in ${g.tries} ${g.tries === 1 ? "try" : "tries"}. avni would hire you for that alone.` });
        }
        return push({ kind: "sys", text: n < g.target ? "higher." : "lower." });
      }
    }
    if (name === "guess") {
      gameRef.current = { target: 1 + Math.floor(Math.random() * 10), tries: 0 };
      return push({ kind: "sys", text: "i picked a number between 1 and 10. type your guess. `guess exit` quits." });
    }
    if (name === "matrix") {
      const chars = "アイウエオカキクケコサシスセソ01<>[]{}=+*/\\|";
      let n = 0;
      const iv = setInterval(() => {
        n++;
        push({
          kind: "out",
          text: Array.from({ length: 68 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
        });
        if (n >= 10) {
          clearInterval(iv);
          push({ kind: "sys", text: "wake up, neo. the a380 has you." });
        }
      }, 120);
      return;
    }
    if (name === "hireme") {
      window.open(
        "mailto:avnibhardwaj01.ab@gmail.com?subject=" + encodeURIComponent("Let's build something meaningful"),
        "_self",
      );
      return push(
        { kind: "out", text: "opening your mail client with the subject pre-written, because i am thoughtful like that." },
        { kind: "out", text: "short pitch: airbus-grade pipelines, agentic AI, zero-maintenance automation. résumé is one `resume` away." },
      );
    }
    if (name === "ls") return push({ kind: "out", text: "about.txt  skills.txt  contact.txt  resume.pdf  projects/  achievements/  secrets/ (permission denied)" });
    if (name === "pwd") return push({ kind: "out", text: "/home/visitor/avni-portfolio" });
    if (name === "date") return push({ kind: "out", text: new Date().toString() });
    if (name === "echo") return push({ kind: "out", text: rest.join(" ") || "echo… echo… echo…" });
    if (name === "banner") return push(...BANNER);
    if (name === "certificates")
      return push(
        { kind: "out", text: "accenture forage · ML + robotics workshops (techkriti) · chaitanya merit · techkriti innovation" },
        { kind: "out", text: "iAspire gold · GDSC lead · hitnext org · AWS academy (60h) · tableau · oracle winner" },
        { kind: "out", text: "conference paper presenter (2022) · ISC2 CC cybersecurity (udemy) · kavach 2023 grand finale" },
        { kind: "sys", text: "14 vinyls on the shelf below — drop one on the turntable and listen for the crackle." },
      );
    if (name === "theme") {
      toggle();
      return push({ kind: "sys", text: "theme flipped. the terminal stays dark — terminals don't do beige." });
    }
    if (name === "resume") {
      window.open("/Avni_Bhardwaj_Resume.pdf", "_blank", "noreferrer");
      track("resume_download", { source: "terminal" });
      return push({ kind: "sys", text: "résumé downloading…" });
    }
    if (name === "github" || name === "linkedin" || name === "leetcode") {
      const urls: Record<string, string> = {
        github: "https://github.com/avnibhardwaj1",
        linkedin: "https://www.linkedin.com/in/avni-bhardwaj10/",
        leetcode: "https://leetcode.com/u/AvniBhardwaj10/",
      };
      window.open(urls[name], "_blank", "noreferrer");
      return push({ kind: "sys", text: `opening ${name}…` });
    }
    if (name === "quote") return push({ kind: "out", text: QUOTES[Math.floor(Math.random() * QUOTES.length)] });
    if (name === "sudo") return push({ kind: "out", text: "nice try. this incident will be reported to /dev/null." });
    const out = OUTPUTS[name];
    if (out) return push(...out.map((text) => ({ kind: "out" as const, text })));
    push({ kind: "sys", text: `command not found: ${name}. type \`help\`.` });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !busy) {
      run(input);
      setInput("");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMAND_NAMES.filter((c) => c.startsWith(input.toLowerCase()));
      if (match.length === 1) setInput(match[0]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          data-testid="terminal-overlay"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex h-[min(80vh,560px)] w-[min(94vw,760px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f14] shadow-2xl"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex items-center gap-2 font-mono text-xs text-white/50">
                  <TerminalSquare className="h-3.5 w-3.5" /> visitor@avni: ~
                </span>
              </div>
              <button
                onClick={onClose}
                data-testid="terminal-close-button"
                aria-label="Close terminal"
                className="text-white/50 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" data-testid="terminal-output">
              {lines.map((line, i) => (
                <pre
                  key={i}
                  className={`whitespace-pre-wrap font-mono text-[13px] leading-relaxed ${
                    line.kind === "cmd"
                      ? "text-cyan-300"
                      : line.kind === "sys"
                        ? "text-white/40"
                        : "text-white/85"
                  }`}
                >
                  {line.text}
                </pre>
              ))}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] text-cyan-300">visitor@avni:~$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  data-testid="terminal-input"
                  spellCheck={false}
                  autoComplete="off"
                  className="flex-1 bg-transparent font-mono text-[13px] text-white caret-cyan-300 outline-none"
                  style={{ cursor: "text" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
