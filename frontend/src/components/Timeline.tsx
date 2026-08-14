import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chapter } from "@/components/Chapter";
import { useMotion } from "@/theme/MotionContext";

gsap.registerPlugin(ScrollTrigger);

const EVENTS = [
  {
    date: "Nov 2024",
    title: "Chaitanya: The Leadership Event — National Finalist",
    org: "Atharv Ranbhoomi'24 · IIM Indore",
    desc: "Team INNOV8 selected from 977 registrations; advanced to the top 20 with a strategic product pitch and growth plan.",
  },
  {
    date: "Jul 2023 – Jul 2024",
    title: "GDSC Lead",
    org: "Google Developer Student Clubs",
    desc: "Built a high-energy campus community, led technical workshops, and mentored students on AI, cloud, and modern web development.",
  },
  {
    date: "Aug 2023",
    title: "Techinnovation — 6th Rank Winner",
    org: "IIT Kanpur",
    desc: "Built the frontend for a CCTV analytics platform detecting incidents and triggering alerts. Top 5 out of 25,000 applicants.",
  },
  {
    date: "Aug 2023",
    title: "Organizing Committee — WittyHacks 4.0",
    org: "NMIMS Indore",
    desc: "Managed event logistics, mentor coordination, and technical infrastructure for the hackathon.",
  },
  {
    date: "May 2023",
    title: "Techinnovation — 6th Rank Winner",
    org: "IIT Kanpur",
    desc: "Designed an autonomous environmental monitoring prototype combining low-cost hardware with data capture and analytics.",
  },
  {
    date: "Feb 2023",
    title: "Execute Hackathon — Top 10",
    org: "Technxex-Turing Club",
    desc: "Built an AI fashion concept using TensorFlow and OpenCV to personalize virtual try-on experiences.",
  },
  {
    date: "Sep 2022",
    title: "Winner — GDSC Oracle Challenge 2023",
    org: "Google Developer Student Clubs",
    desc: "First place solving demanding engineering puzzles and delivering polished solutions under pressure.",
  },
];

const INITIAL_COUNT = 4;

export const Timeline = () => {
  const [expanded, setExpanded] = useState(false);
  const { reduced } = useMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 55%",
            end: "bottom 75%",
            scrub: 1,
          },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-timeline-node]").forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, x: -32 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: node, start: "top 82%" },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-timeline-dot]").forEach((dot) => {
        ScrollTrigger.create({
          trigger: dot,
          start: "top 68%",
          toggleClass: { targets: dot, className: "dot-lit" },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced, expanded]);

  const visible = expanded ? EVENTS : EVENTS.slice(0, INITIAL_COUNT);

  return (
    <section
      id="journey"
      ref={sectionRef}
      data-testid="timeline-section"
      className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
    >
      <Chapter no="02" title="Leadership & Achievements" id="journey" />

      <div className="relative ml-2 md:ml-6">
        <div className="absolute bottom-4 left-[7px] top-2 w-px bg-foreground/10" />
        <div
          ref={lineRef}
          data-testid="timeline-glow-line"
          className="absolute bottom-4 left-[7px] top-2 w-px origin-top bg-accent shadow-[0_0_12px_hsl(var(--accent))]"
          style={reduced ? { transform: "scaleY(1)" } : undefined}
        />

        <div className="flex flex-col gap-14">
          {visible.map((event, i) => (
            <div key={event.title + event.date} data-timeline-node className="relative pl-12 md:pl-16">
              <span
                data-timeline-dot
                className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-accent bg-background transition-shadow ${
                  reduced ? "dot-lit" : ""
                }`}
              />
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{event.date}</p>
              <h3 className="mt-2 font-display text-xl font-bold tracking-tight md:text-2xl">
                {event.title}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {event.org}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {event.desc}
              </p>
              {i < visible.length - 1 && null}
            </div>
          ))}
        </div>
      </div>

      <button
        data-testid="timeline-load-more"
        data-magnetic
        onClick={() => setExpanded((e) => !e)}
        className="mt-14 ml-12 rounded-full border border-foreground/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent md:ml-[4.5rem]"
      >
        {expanded ? "Show less" : "View all achievements"}
      </button>
    </section>
  );
};
