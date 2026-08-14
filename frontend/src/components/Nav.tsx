import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";
import { scrollToSection } from "@/lib/scroll";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Skills", target: "#skills" },
  { label: "Contact", target: "#contact" },
];

export const Nav = () => {
  const { theme, toggle } = useTheme();
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
