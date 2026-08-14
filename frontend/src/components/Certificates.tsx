import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Chapter } from "@/components/Chapter";
import { track } from "@/lib/analytics";
import { startCrackle, stopCrackle } from "@/lib/sounds";

type Cert = { id: string; label: string; sub: string; desc: string; img: string; pdf: string };

const CERTS: Cert[] = [
  { id: "cert-01", label: "Accenture — Forage Virtual Experience", sub: "Accenture · Forage", desc: "Virtual experience program simulating real project work the Accenture way.", img: "/certificates/cert-01.jpg", pdf: "/certificates/cert-01.pdf" },
  { id: "cert-02", label: "Machine Learning Workshop", sub: "Techkriti · IIT Kanpur", desc: "Hands-on machine learning workshop at Techkriti, IIT Kanpur's annual tech festival.", img: "/certificates/cert-02.jpg", pdf: "/certificates/cert-02.pdf" },
  { id: "cert-03", label: "Robotics Workshop", sub: "Techkriti · IIT Kanpur", desc: "Practical robotics workshop — hardware, control, and embedded thinking at Techkriti, IIT Kanpur.", img: "/certificates/cert-03.jpg", pdf: "/certificates/cert-03.pdf" },
  { id: "cert-04", label: "Chaitanya — The Leadership Event", sub: "IIM Indore · National Finalist", desc: "Certificate of Merit — National Finalist with Team INNOV8 at Atharv Ranbhoomi'24, IIM Indore.", img: "/certificates/cert-04.jpg", pdf: "/certificates/cert-04.pdf" },
  { id: "cert-05", label: "Community Service — MP Police", sub: "Madhya Pradesh Police", desc: "Recognized for community service with the Madhya Pradesh Police.", img: "/certificates/cert-05.jpg", pdf: "/certificates/cert-05.pdf" },
  { id: "cert-06", label: "Techkriti Innovation Challenge", sub: "IIT Kanpur · Certificate of Merit", desc: "Distinguished performance in the Techkriti Innovation Challenge at IIT Kanpur, Techkriti'23.", img: "/certificates/cert-06.jpg", pdf: "/certificates/cert-06.pdf" },
  { id: "cert-07", label: "Go for Gold — iAspire", sub: "Accenture · Gold Level, Jan 2025", desc: "Unlocked Gold level in Accenture's iAspire 'Go for Gold' contest.", img: "/certificates/cert-07.jpg", pdf: "/certificates/cert-07.pdf" },
  { id: "cert-08", label: "GDSC Lead — Certificate of Completion", sub: "Google Developer Student Clubs · 2023–24", desc: "Official Google recognition for serving as Google Developer Student Club Lead, 2023–24.", img: "/certificates/cert-08.jpg", pdf: "/certificates/cert-08.pdf" },
  { id: "cert-09", label: "HitNext Challenge — Organisation", sub: "GDSC × NMIMS Indore · 2023", desc: "Certificate of Organisation for volunteering in the HitNext Challenge at NMIMS Indore.", img: "/certificates/cert-09.jpg", pdf: "/certificates/cert-09.pdf" },
  { id: "cert-10", label: "AWS Academy — Cloud Architecting", sub: "AWS Academy · 60-hour badge, Nov 2025", desc: "AWS Academy Graduate — Cloud Architecting training badge, 60 course hours, Credly verified.", img: "/certificates/cert-10.jpg", pdf: "/certificates/cert-10.pdf" },
  { id: "cert-11", label: "Conference Paper Presenter", sub: "STME NMIMS Indore · Sep 2022", desc: "Paper presenter at the International Conference on Recent Paradigm in Computer Science and Engineering.", img: "/certificates/cert-11.jpg", pdf: "/certificates/cert-11.pdf" },
  { id: "cert-12", label: "ISC2 Certified in Cybersecurity (CC)", sub: "Udemy · 17.5 hours, Apr 2025", desc: "Completed the full ISC2 Certified in Cybersecurity (CC) course on Udemy.", img: "/certificates/cert-12.jpg", pdf: "/certificates/cert-12.pdf" },
  { id: "cert-13", label: "Oracle Challenge — Winner", sub: "GDSC STME · Team TECH-TITANS", desc: "Certificate of Achievement for outstanding performance in the Oracle Challenge, team TECH-TITANS.", img: "/certificates/cert-13.jpg", pdf: "/certificates/cert-13.pdf" },
  { id: "cert-14", label: "Kavach 2023 — Grand Finale", sub: "Govt. of India · Cybersecurity Hackathon", desc: "Grand Finale participant at Kavach 2023, the national cybersecurity hackathon, with team NM_VISIONARYTITANS.", img: "/certificates/cert-14.jpg", pdf: "/certificates/cert-14.pdf" },
];

const DiscFace = ({ cert }: { cert: Cert }) => (
  <>
    <img
      src={cert.img}
      alt={cert.label}
      className="h-full w-full rounded-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
    <div className="vinyl-grooves pointer-events-none absolute inset-0 rounded-full" />
    <div className="absolute inset-[40%] flex items-center justify-center rounded-full border border-foreground/20 bg-background">
      <Award className="h-4 w-4 text-accent" />
    </div>
  </>
);

export const Certificates = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Cert | null>(null);

  useEffect(() => {
    if (active) startCrackle();
    else stopCrackle();
  }, [active]);

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section
      id="certificates"
      data-testid="certificates-section"
      className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
    >
      <Chapter no="04" title="Certificates" id="certificates" />

      <div className="relative">
        <div
          ref={trackRef}
          data-testid="certificates-track"
          className="cert-track flex snap-x snap-mandatory gap-10 overflow-x-auto px-2 py-8"
        >
          {CERTS.map((cert, i) => (
            <motion.button
              key={cert.id}
              onClick={() => {
                track("card_click", { id: cert.id, title: cert.label, source: "certificates" });
                setActive(cert);
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: Math.min(i, 5) * 0.07, ease: "easeOut" }}
              data-testid={`cert-disc-${cert.id}`}
              data-magnetic
              className="group flex w-44 shrink-0 snap-center flex-col items-center gap-4 md:w-56"
            >
              <motion.div
                layoutId={`vinyl-${cert.id}`}
                className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-accent/25 bg-gradient-to-br from-accent/15 via-background to-accent2/15 shadow-[0_18px_50px_-18px_hsl(var(--foreground)/0.35)] transition-colors group-hover:border-accent/60"
              >
                <DiscFace cert={cert} />
              </motion.div>
              <span className="text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-accent">
                {cert.label}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            data-testid="cert-scroll-prev"
            data-magnetic
            onClick={() => scrollBy(-1)}
            aria-label="Scroll certificates left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            data-testid="cert-scroll-next"
            data-magnetic
            onClick={() => scrollBy(1)}
            aria-label="Scroll certificates right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Scroll the vinyls — drop one onto the turntable
          </p>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="cert-player-overlay"
            onClick={(e) => e.target === e.currentTarget && setActive(null)}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          >
            <motion.div
              exit={{ opacity: 0, scale: 0.12, rotate: 14, y: 160 }}
              transition={{ duration: 0.45, ease: [0.5, 0, 0.75, 0] }}
              className="relative flex w-full max-w-4xl flex-col gap-8 rounded-3xl border border-foreground/10 bg-background/85 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:gap-12 md:p-10"
            >
              <button
                onClick={() => setActive(null)}
                data-testid="cert-player-close"
                aria-label="Close certificate player"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative mx-auto h-64 w-64 shrink-0 md:h-80 md:w-80" data-testid="cert-turntable">
                <div className="absolute inset-0 rounded-full border border-foreground/15 bg-foreground/5" />
                <div className="absolute inset-3 rounded-full border border-foreground/10" />
                <div className="absolute inset-6 rounded-full border border-foreground/10" />
                <motion.div
                  layoutId={`vinyl-${active.id}`}
                  className="vinyl-playing absolute inset-4 overflow-hidden rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
                >
                  <DiscFace cert={active} />
                </motion.div>
                <div className="absolute -right-2 -top-1 z-10 h-9 w-9 rounded-full border-2 border-foreground/30 bg-background shadow-md" />
                <motion.div
                  initial={{ rotate: -18 }}
                  animate={{ rotate: 24 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
                  className="absolute right-1 top-7 z-10 h-[55%] w-[3px] origin-top rounded-full bg-foreground/50"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
                className="min-w-0 flex-1"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Now spinning</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl" data-testid="cert-player-title">
                  {active.label}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{active.sub}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{active.desc}</p>
                <img
                  src={active.img}
                  alt={active.label}
                  className="mt-6 max-h-56 w-full rounded-xl border border-foreground/10 object-contain"
                  data-testid="cert-player-image"
                />
                <a
                  href={active.pdf}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="cert-player-pdf-link"
                  data-magnetic
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open original PDF
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
