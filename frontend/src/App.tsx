import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/theme/ThemeContext";
import { MotionProvider, useMotion } from "@/theme/MotionContext";
import { setLenis } from "@/lib/scroll";
import { initAudioOnGesture } from "@/lib/sounds";
import { initAnalytics } from "@/lib/analytics";
import { useGestureScroll } from "@/hooks/useGestureScroll";
import { Scene3D } from "@/components/Scene3D";
import { Cursor } from "@/components/Cursor";
import { MeshGradient } from "@/components/MeshGradient";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Experience } from "@/components/Experience";
import { Timeline } from "@/components/Timeline";
import { Skills } from "@/components/Skills";
import { Certificates } from "@/components/Certificates";
import { Contact } from "@/components/Contact";
import { ChatWidget } from "@/components/ChatWidget";
import { Terminal } from "@/components/Terminal";
import StatsPage from "@/pages/StatsPage";

gsap.registerPlugin(ScrollTrigger);

function Site() {
  const lenisRef = useRef<Lenis | null>(null);
  const gesture = useGestureScroll(lenisRef);
  const { reduced } = useMotion();
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    initAudioOnGesture();
    initAnalytics();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      setLenis(null);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, [reduced]);

  useEffect(() => {
    console.log(
      "%c AVNI://KERNEL ",
      "background:#0891b2;color:#fff;font-family:monospace;padding:4px 10px;border-radius:6px;font-weight:bold",
      "\nYou inspect elements before you say hello. We would get along.\nWhile you are here: github.com/avnibhardwaj1\nP.S. The robot in the hero is watching your cursor. No, you cannot pet it.",
    );
  }, []);

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
    <div className="min-h-screen bg-background font-body text-foreground">
      <MeshGradient />
      <Scene3D />
      <Nav onOpenTerminal={() => setTerminalOpen(true)} />
      <main className="relative z-10">
        <Hero gesture={gesture} />
        <Marquee />
        <Experience />
        <Timeline />
        <Skills />
        <Certificates />
        <Contact />
      </main>
      <ChatWidget />
      <Terminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <Cursor />

      <div
        data-testid="gesture-preview-panel"
        className={`fixed bottom-6 left-6 z-40 ${gesture.status === "active" ? "" : "hidden"}`}
      >
        <div className="rounded-xl border border-foreground/10 bg-background/70 p-2 backdrop-blur-xl">
          <video
            ref={gesture.videoRef}
            data-testid="gesture-video"
            muted
            playsInline
            className="aspect-[4/3] w-40 -scale-x-100 rounded-lg object-cover"
          />
          <div className="mt-2 flex items-center justify-between px-1 pb-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent">
              Gesture · Live
            </span>
            <button
              data-testid="gesture-disable-button"
              onClick={gesture.disable}
              aria-label="Disable gesture scrolling"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </MotionConfig>
  );
}

export default function App() {
  const isStats = window.location.pathname === "/stats";
  return (
    <ThemeProvider>
      <MotionProvider>
        {isStats ? <StatsPage /> : <Site />}
      </MotionProvider>
    </ThemeProvider>
  );
}
