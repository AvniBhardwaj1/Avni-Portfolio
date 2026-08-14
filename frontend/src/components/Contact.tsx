import { motion } from "framer-motion";
import { ArrowUpRight, Braces, Github, Linkedin, Mail } from "lucide-react";
import { Chapter } from "@/components/Chapter";

const LINES = ["LET'S BUILD", "WHAT'S NEXT."];

export const Contact = () => (
  <section
    id="contact"
    data-testid="contact-section"
    className="relative z-10 px-6 pb-10 pt-32 md:px-16 lg:px-24"
  >
    <Chapter no="03" title="Contact" id="contact" />

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
            {i === 1 ? <span className="text-accent glow-accent">{line}</span> : line}
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
      Have a data platform to scale or an AI system to ship? My inbox is open.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mt-10 flex flex-wrap items-center gap-4"
    >
      <a
        href="mailto:avnibhardwaj01.ab@gmail.com"
        data-testid="contact-email-button"
        data-magnetic
        className="flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Mail className="h-4 w-4" />
        avnibhardwaj01.ab@gmail.com
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
        href="https://www.linkedin.com/in/avnibhardwaj"
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
        href="https://leetcode.com/u/avnibhardwaj1"
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

    <footer className="mt-32 flex flex-col gap-3 border-t border-foreground/10 pt-6 md:flex-row md:items-center md:justify-between">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground" data-testid="footer-copyright">
        © 2026 Avni Bhardwaj
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        React · Three.js · GSAP · MediaPipe
      </p>
    </footer>
  </section>
);
