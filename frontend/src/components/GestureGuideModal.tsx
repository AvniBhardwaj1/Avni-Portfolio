import { AnimatePresence, motion } from "framer-motion";
import { Camera, Hand, Lock, Pointer, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
};

const GESTURES = [
  {
    icon: Hand,
    title: "Move hand up / down",
    desc: "Scrolls the page — raise your hand to go up, lower it to scroll down.",
  },
  {
    icon: Pointer,
    title: "Pinch thumb + index",
    desc: "Clicks links & buttons under your cursor. Hold the pinch a beat to confirm.",
  },
];

export const GestureGuideModal = ({ open, onClose, onStart }: Props) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        data-testid="gesture-guide-modal"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-foreground/10 bg-background/80 p-7 shadow-[0_40px_100px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent">
                {"// gesture control"}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">
                Your hand is the mouse
              </h3>
            </div>
            <button
              data-testid="gesture-guide-close-button"
              onClick={onClose}
              aria-label="Close gesture guide"
              className="rounded-full border border-foreground/10 p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {GESTURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-foreground/10 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Private by design — video is processed on your device only. Nothing is
              recorded or uploaded.
            </p>
          </div>

          <button
            data-testid="gesture-start-camera-button"
            data-magnetic
            onClick={onStart}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-mono text-xs uppercase tracking-[0.25em] text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
