import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MaskedTitle } from "@/components/Reveal";

export const Chapter = ({ no, title, id }: { no: string; title: string; id?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle parallax drift — the whole chapter header floats against the scroll
  const y = useTransform(scrollYProgress, [0, 1], [26, -26]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="mb-16 flex items-baseline gap-6"
      data-testid={id ? `${id}-chapter` : undefined}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-mono text-sm tracking-[0.2em] text-accent"
      >
        {no}
      </motion.span>
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
        <MaskedTitle text={title} />
      </h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="h-px flex-1 bg-foreground/10"
      />
    </motion.div>
  );
};
