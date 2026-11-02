import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "ab-theme-override";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

const hasStoredOverride = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark";
};

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [hasOverride, setHasOverride] = useState(hasStoredOverride);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#050505" : "#f4f7fa");
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const syncWithSystem = (event: MediaQueryListEvent) => {
      if (!hasOverride) setTheme(event.matches ? "light" : "dark");
    };
    media.addEventListener("change", syncWithSystem);
    return () => media.removeEventListener("change", syncWithSystem);
  }, [hasOverride]);

  const toggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setHasOverride(true);
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
