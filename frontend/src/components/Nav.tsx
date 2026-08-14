import { Download, Moon, PersonStanding, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";
import { useMotion } from "@/theme/MotionContext";
import { scrollToSection } from "@/lib/scroll";
import { track } from "@/lib/analytics";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Journey", target: "#journey" },
  { label: "Skills", target: "#skills" },
  { label: "Contact", target: "#contact" },
];

export const Nav = () => {
  const { theme, toggle } = useTheme();
  const { reduced, toggle: toggleMotion } = useMotion();
  return (
    <header
      data-testid="main-nav"
      className="fixed inset-x-0 top-0 z-40 border-b border-foreground/5 bg-background/70 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-16 lg:px-24">
        <button
          data-testid="nav-logo"
          onClick={() => scrollToSection("#hero")}
          className="font-mono text-sm font-bold tracking-[0.2em]"
        >
          AB<span className="text-accent">://</span>
        </button>
        <nav className="flex items-center gap-1 md:gap-4">
          {LINKS.map((l) => (
            <button
              key={l.target}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              onClick={() => scrollToSection(l.target)}
              className="px-2 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
            >
              {l.label}
            </button>
          ))}
          <a
            href="/Avni_Bhardwaj_Resume.pdf"
            download
            onClick={() => track("resume_download")}
            data-testid="resume-download-button"
            data-magnetic
            className="ml-2 flex h-9 items-center gap-2 rounded-full bg-accent px-4 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-105 active:scale-95"
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
            className={`ml-2 flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-accent hover:text-accent ${
              reduced ? "border-accent text-accent" : "border-foreground/10"
            }`}
          >
            <PersonStanding className="h-4 w-4" />
          </button>
          <button
            data-testid="theme-toggle"
            onClick={toggle}
            aria-label="Toggle light and dark mode"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 transition-colors hover:border-accent hover:text-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
};
