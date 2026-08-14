import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  lenisInstance = lenis;
};

export const scrollToSection = (target: string) => {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: -64, duration: 1.4 });
  } else {
    document.querySelector(target)?.scrollIntoView();
  }
};
