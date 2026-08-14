import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const MotionContext = createContext<{ reduced: boolean; toggle: () => void }>({
  reduced: false,
  toggle: () => {},
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (localStorage.getItem("ab-reduced") === "1") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    localStorage.setItem("ab-reduced", reduced ? "1" : "0");
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }, [reduced]);

  return (
    <MotionContext.Provider value={{ reduced, toggle: () => setReduced((r) => !r) }}>
      {children}
    </MotionContext.Provider>
  );
}

export const useMotion = () => useContext(MotionContext);
