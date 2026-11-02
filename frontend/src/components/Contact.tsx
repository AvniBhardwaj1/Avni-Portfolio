import { useState } from "react";
import type { FormEvent } from "react";
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
} from "lucide-react";
import { Chapter } from "@/components/Chapter";
import { NowCard } from "@/components/NowCard";
import { track } from "@/lib/analytics";

const LINES = ["LET'S", "CONNECT."];

const DETAILS = [
  { id: "location", Icon: MapPin, label: "Location", value: "Indore, Madhya Pradesh" },
  { id: "email", Icon: Mail, label: "Email", value: "avnibhardwaj01.ab@gmail.com", href: "mailto:avnibhardwaj01.ab@gmail.com" },
  { id: "education", Icon: GraduationCap, label: "Education", value: "NMIMS Indore" },
  { id: "languages", Icon: Languages, label: "Languages", value: "English · Hindi · Korean (I)" },
];

const QUOTES = [
  "Today no knowledge, tomorrow master.",
  "It works on my machine.",
  "Turning caffeine into scalable architecture.",
];

const CONTACT_API = `${process.env.REACT_APP_BACKEND_URL ?? ""}/api/contact`;

const ContactForm = () => {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          project_type: data.get("project_type"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          typeof body?.detail === "string"
            ? body.detail
            : "The message could not be sent. Please try again.",
        );
      }
      const body = await response.json();
      form.reset();
      setStatus(
        body.notificationStatus === "sent"
          ? "Thanks — your message was saved and Avni was notified."
          : body.notificationStatus === "failed"
            ? "Your message was saved, but the email notification failed. You can also email Avni directly."
            : "Your message was saved. Email notifications are not configured yet.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The message could not be sent. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      data-testid="contact-form"
      aria-busy={sending}
      className="mt-12 grid max-w-3xl grid-cols-1 gap-5 rounded-3xl border border-foreground/10 bg-background/60 p-6 backdrop-blur-xl md:grid-cols-2 md:p-8"
    >
      <h4 className="font-display text-2xl font-bold tracking-tight md:col-span-2">
        Send a message<span className="text-accent">.</span>
      </h4>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          data-testid="contact-name-input"
          autoComplete="name"
          maxLength={100}
          required
          className="min-h-12 rounded-xl border border-foreground/15 bg-background/75 px-4 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Your email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          data-testid="contact-email-input"
          autoComplete="email"
          maxLength={254}
          required
          className="min-h-12 rounded-xl border border-foreground/15 bg-background/75 px-4 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="contact-project-type" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Project type
        </label>
        <select
          id="contact-project-type"
          name="project_type"
          data-testid="contact-project-type-select"
          required
          defaultValue=""
          className="min-h-12 rounded-xl border border-foreground/15 bg-background/75 px-4 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <option value="" disabled>Select a topic</option>
          <option value="Internship">Internship</option>
          <option value="Project collaboration">Project collaboration</option>
          <option value="Speaking or community">Speaking or community</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          data-testid="contact-honeypot"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="contact-message" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          data-testid="contact-message-input"
          minLength={10}
          maxLength={3000}
          rows={5}
          required
          className="resize-y rounded-xl border border-foreground/15 bg-background/75 px-4 py-3 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>
      <p
        id="contact-form-privacy"
        data-testid="contact-form-privacy"
        className="text-xs leading-relaxed text-muted-foreground md:col-span-2"
      >
        Your message and reply email are saved to MongoDB. If email is configured, Avni also receives a notification. Please don’t include sensitive information.
      </p>
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button
          type="submit"
          data-testid="contact-submit-button"
          aria-describedby="contact-form-privacy"
          disabled={sending}
          className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.15em] text-accent-foreground transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
        {status && (
          <p role="status" aria-live="polite" data-testid="contact-form-status" className="text-sm text-accent">
            {status}
          </p>
        )}
        {error && (
          <p role="alert" data-testid="contact-form-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
};

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
    <Chapter no="06" title="Contact" id="contact" />

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

    <ContactForm />

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
        href={`${process.env.PUBLIC_URL ?? ""}/Avni_Bhardwaj_Resume.pdf`}
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

    <footer
      data-testid="portfolio-footer"
      className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 md:flex-row md:items-center md:justify-between"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground" data-testid="footer-copyright">
        © 2026 Avni Bhardwaj
      </p>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em]">
        <a data-testid="footer-work-link" href="#work" className="text-muted-foreground transition-colors hover:text-accent">Work</a>
        <a data-testid="footer-skills-link" href="#skills" className="text-muted-foreground transition-colors hover:text-accent">Skills</a>
        <a data-testid="footer-contact-link" href="#contact" className="text-muted-foreground transition-colors hover:text-accent">Contact</a>
        <a data-testid="footer-github-link" href="https://github.com/AvniBhardwaj1" target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-accent">GitHub ↗</a>
      </nav>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        React · Three.js · GSAP · MediaPipe
      </p>
    </footer>
  </section>
);
