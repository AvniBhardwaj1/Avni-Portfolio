import { Download, Github, Linkedin, Mail, TerminalSquare } from "lucide-react";
import { track } from "@/lib/analytics";

type DockItem = {
  id: string;
  label: string;
  Icon: typeof Github;
  href?: string;
  action?: () => void;
};

export const Dock = ({ onOpenTerminal }: { onOpenTerminal: () => void }) => {
  const items: DockItem[] = [
    { id: "terminal", label: "Terminal", Icon: TerminalSquare, action: onOpenTerminal },
    { id: "github", label: "GitHub", Icon: Github, href: "https://github.com/avnibhardwaj1" },
    { id: "linkedin", label: "LinkedIn", Icon: Linkedin, href: "https://www.linkedin.com/in/avni-bhardwaj10/" },
    { id: "email", label: "Email", Icon: Mail, href: "mailto:avnibhardwaj01.ab@gmail.com" },
    { id: "resume", label: "Résumé", Icon: Download, href: "/Avni_Bhardwaj_Resume.pdf" },
  ];

  const cls =
    "group relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-1.5 hover:bg-accent/15 hover:text-accent";

  const tooltip = (label: string) => (
    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-foreground/10 bg-background/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );

  return (
    <div
      className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
      data-testid="floating-dock"
    >
      <div className="flex items-center gap-1 rounded-full border border-foreground/10 bg-background/60 px-2 py-1.5 shadow-[0_16px_50px_-16px_hsl(var(--foreground)/0.35)] backdrop-blur-xl">
        {items.map(({ id, label, Icon, href, action }) =>
          href ? (
            <a
              key={id}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              download={id === "resume" ? true : undefined}
              aria-label={label}
              data-testid={`dock-${id}`}
              data-magnetic
              onClick={() => track("dock_click", { id })}
              className={cls}
            >
              {tooltip(label)}
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ) : (
            <button
              key={id}
              onClick={() => {
                track("dock_click", { id });
                action?.();
              }}
              aria-label={label}
              data-testid={`dock-${id}`}
              data-magnetic
              className={cls}
            >
              {tooltip(label)}
              <Icon className="h-[18px] w-[18px]" />
            </button>
          ),
        )}
      </div>
    </div>
  );
};
