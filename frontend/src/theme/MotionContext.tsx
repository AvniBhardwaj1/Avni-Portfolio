import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const MotionContext = createContext<{ reduced: boolean }>({
  reduced: false,
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState<boolean>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const reduced = systemReduced;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystemReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }, [reduced]);

  return <MotionContext.Provider value={{ reduced }}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);
