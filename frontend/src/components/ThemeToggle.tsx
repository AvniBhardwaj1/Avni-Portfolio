import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 transition-colors hover:border-accent hover:text-accent sm:ml-2 sm:h-9 sm:w-9"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};
