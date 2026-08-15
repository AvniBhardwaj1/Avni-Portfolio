import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Masked slide-up reveal for heading text (same feel as the hero name). */
export const MaskedTitle = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <motion.span
    className="block overflow-hidden"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-40px" }}
  >
    <motion.span
      variants={{
        hidden: { y: "110%" },
        visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
      }}
      className={`block ${className}`}
    >
      {text}
    </motion.span>
  </motion.span>
);

/** 3D flip-in entrance for cards / rows as they scroll into view. */
export const FlipIn = ({
  children,
  delay = 0,
  className,
  testId,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  testId?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 48, rotateX: 16 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.85, delay, ease: EASE }}
    style={{ transformPerspective: 900 }}
    className={className}
    data-testid={testId}
  >
    {children}
  </motion.div>
);
