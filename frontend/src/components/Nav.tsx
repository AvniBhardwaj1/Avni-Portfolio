import { Download, PersonStanding, TerminalSquare } from "lucide-react";
import { useMotion } from "@/theme/MotionContext";
import { scrollToSection } from "@/lib/scroll";
import { track } from "@/lib/analytics";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Journey", target: "#journey" },
  { label: "Skills", target: "#skills" },
  { label: "Contact", target: "#contact" },
];

export const Nav = ({ onOpenTerminal }: { onOpenTerminal: () => void }) => {
  const { reduced, toggle: toggleMotion } = useMotion();
  return (
    <header
      data-testid="main-nav"
      className="fixed inset-x-0 top-0 z-40 border-b border-foreground/5 bg-background/70 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-16 md:py-4 lg:px-24">
        <button
          data-testid="nav-logo"
          onClick={() => scrollToSection("#hero")}
          className="font-mono text-sm font-bold tracking-[0.12em] sm:tracking-[0.2em]"
        >
          AB<span className="text-accent">://</span>
        </button>
        <nav className="flex items-center gap-0 md:gap-4">
          {LINKS.map((l) => (
            <button
              key={l.target}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              onClick={() => scrollToSection(l.target)}
              className={`px-1 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-accent sm:px-2 sm:text-xs sm:tracking-[0.2em] ${
                l.label === "Journey" || l.label === "Skills" ? "hidden sm:block" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="terminal-open-button"
            data-magnetic
            onClick={onOpenTerminal}
            aria-label="Open terminal"
            title="Open the terminal — type help"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 transition-colors hover:border-accent hover:text-accent sm:ml-2 sm:h-9 sm:w-9"
          >
            <TerminalSquare className="h-4 w-4" />
          </button>
          <a
            href={`${process.env.PUBLIC_URL ?? ""}/Avni_Bhardwaj_Resume.pdf`}
            download
            onClick={() => track("resume_download")}
            data-testid="resume-download-button"
            aria-label="Download résumé"
            data-magnetic
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent px-2 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-105 active:scale-95 sm:ml-2 sm:h-9 sm:w-auto sm:gap-2 sm:px-4"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Résumé</span>
          </a>
          <button
            data-testid="motion-toggle"
            data-magnetic
            onClick={toggleMotion}
            aria-label="Toggle reduced motion"
            title={reduced ? "Reduced motion on — click to enable animations" : "Animations on — click for reduced motion"}
            className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:border-accent hover:text-accent sm:ml-2 sm:h-9 sm:w-9 ${
              reduced ? "border-accent text-accent" : "border-foreground/10"
            }`}
          >
            <PersonStanding className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};
