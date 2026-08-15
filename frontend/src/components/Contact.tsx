import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Braces,
  Download,
  Github,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Chapter } from "@/components/Chapter";
import { NowCard } from "@/components/NowCard";
import { track } from "@/lib/analytics";

const LINES = ["LET'S", "CONNECT."];

const DETAILS = [
  { id: "location", Icon: MapPin, label: "Location", value: "Indore, Madhya Pradesh" },
  { id: "email", Icon: Mail, label: "Email", value: "avnibhardwaj01.ab@gmail.com", href: "mailto:avnibhardwaj01.ab@gmail.com" },
  { id: "education", Icon: GraduationCap, label: "Education", value: "NMIMS Indore" },
  { id: "mobile", Icon: Phone, label: "Mobile", value: "+91 96913 85721", href: "tel:+919691385721" },
  { id: "languages", Icon: Languages, label: "Languages", value: "English · Hindi · Korean (I)" },
];

const QUOTES = [
  "Today no knowledge, tomorrow master.",
  "It works on my machine.",
  "Turning caffeine into scalable architecture.",
];

const QuoteRow = ({ hidden }: { hidden?: boolean }) => (
  <div className="flex shrink-0 items-center" aria-hidden={hidden}>
    {QUOTES.map((q) => (
      <span key={q} className="flex items-center">
        <span className="px-8 font-mono text-xs italic tracking-[0.2em] text-muted-foreground">
          “{q}”
        </span>
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      </span>
    ))}
  </div>
);

export const Contact = () => (
  <section
    id="contact"
    data-testid="contact-section"
    className="relative z-10 px-6 pb-10 pt-32 md:px-16 lg:px-24"
  >
    <Chapter no="05" title="Contact" id="contact" />

    <p
      className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-accent"
      data-testid="contact-kicker"
    >
      {"Contact me // Let's connect"}
    </p>

    <h3 className="font-display font-bold leading-[0.95] tracking-tight" data-testid="contact-headline">
      {LINES.map((line, i) => (
        <motion.span
          key={line}
          className="block overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span
            variants={{
              hidden: { y: "110%" },
              visible: {
                y: "0%",
                transition: { duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            className="block text-[clamp(2.75rem,9vw,7.5rem)]"
          >
            {i === 1 ? (
              <span className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] bg-clip-text text-transparent">
                {line}
              </span>
            ) : (
              line
            )}
          </motion.span>
        </motion.span>
      ))}
    </h3>

    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
      data-testid="contact-subtext"
    >
      Interested in a collaboration, internship, or product-focused project? I’m always
      open to new ideas and new teams. Reach out and let’s build something meaningful.
    </motion.p>

    <NowCard />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
      data-testid="contact-details-grid"
    >
      {DETAILS.map(({ id, Icon, label, value, href }) => {
        const inner = (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 truncate text-sm font-medium md:text-base">{value}</p>
            </div>
          </>
        );
        const cls =
          "flex items-center gap-4 rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur-sm transition-colors hover:border-accent/50";
        return href ? (
          <a key={id} href={href} data-testid={`contact-detail-${id}`} data-magnetic className={cls}>
            {inner}
          </a>
        ) : (
          <div key={id} data-testid={`contact-detail-${id}`} className={cls}>
            {inner}
          </div>
        );
      })}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-10 flex flex-wrap items-center gap-4"
    >
      <a
        href="mailto:avnibhardwaj01.ab@gmail.com"
        data-testid="contact-email-button"
        data-magnetic
        className="flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Mail className="h-4 w-4" />
        Email me
      </a>
      <a
        href="/Avni_Bhardwaj_Resume.pdf"
        download
        onClick={() => track("resume_download")}
        data-testid="contact-resume-button"
        data-magnetic
        className="flex items-center gap-3 rounded-full border border-foreground/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent"
      >
        <Download className="h-4 w-4" />
        Résumé
      </a>
      <a
        href="https://github.com/avnibhardwaj1"
        target="_blank"
        rel="noreferrer"
        data-testid="contact-github-link"
        data-magnetic
        className="flex items-center gap-3 rounded-full border border-foreground/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent"
      >
        <Github className="h-4 w-4" />
        GitHub
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
      <a
        href="https://www.linkedin.com/in/avni-bhardwaj10/"
        target="_blank"
        rel="noreferrer"
        data-testid="contact-linkedin-link"
        data-magnetic
        className="flex items-center gap-3 rounded-full border border-foreground/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
      <a
        href="https://leetcode.com/u/AvniBhardwaj10/"
        target="_blank"
        rel="noreferrer"
        data-testid="contact-leetcode-link"
        data-magnetic
        className="flex items-center gap-3 rounded-full border border-foreground/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent"
      >
        <Braces className="h-4 w-4" />
        LeetCode
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </motion.div>

    <div
      data-testid="quotes-marquee"
      className="mt-24 -mx-6 overflow-hidden border-y border-foreground/10 py-5 md:-mx-16 lg:-mx-24"
    >
      <div className="marquee-track marquee-slow flex w-max">
        <QuoteRow />
        <QuoteRow hidden />
      </div>
    </div>

    <footer className="mt-10 flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground" data-testid="footer-copyright">
        © 2026 Avni Bhardwaj
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        React · Three.js · GSAP · MediaPipe
      </p>
    </footer>
  </section>
);
