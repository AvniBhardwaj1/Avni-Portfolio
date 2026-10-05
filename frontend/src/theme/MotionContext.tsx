import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const MotionContext = createContext<{ reduced: boolean; toggle: () => void }>({
  reduced: false,
  toggle: () => {},
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState<boolean>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [motionOverride, setMotionOverride] = useState<boolean | null>(() => {
    const saved = localStorage.getItem("ab-motion-override");
    return saved === "1" ? true : saved === "0" ? false : null;
  });
  const reduced = motionOverride ?? systemReduced;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystemReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }, [reduced]);

  return (
    <MotionContext.Provider
      value={{
        reduced,
        toggle: () => {
          const next = !reduced;
          localStorage.setItem("ab-motion-override", next ? "1" : "0");
          setMotionOverride(next);
        },
      }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export const useMotion = () => useContext(MotionContext);
