import { useRef } from "react";
import { motion } from "framer-motion";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Chapter } from "@/components/Chapter";

const CERTS = [
  { id: "cert-01", label: "Accenture — Forage Virtual Experience", img: "/certificates/cert-01.jpg", pdf: "/certificates/cert-01.pdf" },
  { id: "cert-02", label: "Machine Learning Workshop", img: "/certificates/cert-02.jpg", pdf: "/certificates/cert-02.pdf" },
  { id: "cert-03", label: "Robotics Workshop", img: "/certificates/cert-03.jpg", pdf: "/certificates/cert-03.pdf" },
  { id: "cert-04", label: "Chaitanya — IIM Indore", img: "/certificates/cert-04.jpg", pdf: "/certificates/cert-04.pdf" },
  { id: "cert-05", label: "Community Service — MP Police", img: "/certificates/cert-05.jpg", pdf: "/certificates/cert-05.pdf" },
];

export const Certificates = () => {
  const trackRef = useRef<HTMLDivElement>(null);

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
            <motion.a
              key={cert.id}
              href={cert.pdf}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" }}
              data-testid={`cert-disc-${cert.id}`}
              data-magnetic
              className="group relative block aspect-square w-44 shrink-0 snap-center md:w-56"
            >
              <div className="cert-disc absolute inset-0 overflow-hidden rounded-full border-2 border-accent/25 bg-gradient-to-br from-accent/15 via-background to-accent2/15 shadow-[0_18px_50px_-18px_hsl(var(--foreground)/0.35)] transition-colors group-hover:border-accent/60">
                <img
                  src={cert.img}
                  alt={cert.label}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Award className="h-6 w-6 text-accent" />
                  <span className="px-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                    {cert.label}
                  </span>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-foreground/15" />
            </motion.a>
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
            Scroll the discs — click one to open the certificate
          </p>
        </div>
      </div>
    </section>
  );
};
