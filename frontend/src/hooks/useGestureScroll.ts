import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { track } from "@/lib/analytics";

export type GestureStatus = "idle" | "loading" | "active" | "denied" | "error";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/** Mutable per-frame state shared with the GestureCursor overlay (no React re-renders). */
export type GestureCursorState = {
  x: number;
  y: number;
  pinch: number; // 0..1 charge while pinching
  hovering: boolean;
};

const CLICKABLE_SELECTOR = "a, button, [data-gesture-click]";
const PINCH_RATIO = 0.32; // thumb-tip/index-tip dist vs wrist/middle-mcp dist
const PINCH_DWELL_MS = 200;
const HOVER_CLASS = "gesture-hover";

export function useGestureScroll(lenisRef: { current: Lenis | null }) {
  const [status, setStatus] = useState<GestureStatus>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const smoothRef = useRef<number | null>(null);
  const cursorRef = useRef<GestureCursorState>({ x: -100, y: -100, pinch: 0, hovering: false });
  const hoverElRef = useRef<Element | null>(null);
  const pinchStartRef = useRef<number | null>(null);
  const pinchFiredRef = useRef(false);

  const setHoverEl = useCallback((el: Element | null) => {
    if (hoverElRef.current === el) return;
    hoverElRef.current?.classList.remove(HOVER_CLASS);
    el?.classList.add(HOVER_CLASS);
    hoverElRef.current = el;
  }, []);

  const disable = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close?.();
    landmarkerRef.current = null;
    smoothRef.current = null;
    pinchStartRef.current = null;
    pinchFiredRef.current = false;
    setHoverEl(null);
    cursorRef.current = { x: -100, y: -100, pinch: 0, hovering: false };
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, [setHoverEl]);

  const enable = useCallback(async () => {
    if (status === "loading" || status === "active") return;
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;

      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const options = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO" as const,
        numHands: 1,
      });
      try {
        landmarkerRef.current = await vision.HandLandmarker.createFromOptions(
          fileset,
          options("GPU"),
        );
      } catch {
        landmarkerRef.current = await vision.HandLandmarker.createFromOptions(
          fileset,
          options("CPU"),
        );
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
      track("gesture_optin");

      const loop = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (video && landmarker && video.readyState >= 2) {
          const result = landmarker.detectForVideo(video, performance.now());
          const lm = result?.landmarks?.[0];
          if (lm) {
            const indexTip = lm[8];
            const thumbTip = lm[4];
            const wrist = lm[0];
            const middleMcp = lm[9];

            // Hand scale reference for a resolution-independent pinch threshold
            const handSize =
              Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y) || 1;
            const pinchDist = Math.hypot(
              indexTip.x - thumbTip.x,
              indexTip.y - thumbTip.y,
            );
            const isPinching = pinchDist / handSize < PINCH_RATIO;

            // Virtual cursor follows the index fingertip (mirrored like a selfie cam)
            const targetX = (1 - indexTip.x) * window.innerWidth;
            const targetY = indexTip.y * window.innerHeight;
            const cur = cursorRef.current;
            cur.x = cur.x < -50 ? targetX : cur.x + (targetX - cur.x) * 0.35;
            cur.y = cur.y < -50 ? targetY : cur.y + (targetY - cur.y) * 0.35;

            // Hover highlight on links / buttons only
            const under = document.elementFromPoint(cur.x, cur.y);
            const clickable = under?.closest?.(CLICKABLE_SELECTOR) ?? null;
            setHoverEl(clickable);
            cur.hovering = !!clickable;

            // Pinch = dwell-charged click
            if (isPinching) {
              if (pinchStartRef.current === null) {
                pinchStartRef.current = performance.now();
                pinchFiredRef.current = false;
              }
              const held = performance.now() - pinchStartRef.current;
              cur.pinch = Math.min(1, held / PINCH_DWELL_MS);
              if (!pinchFiredRef.current && held >= PINCH_DWELL_MS) {
                pinchFiredRef.current = true;
                if (clickable instanceof HTMLElement) {
                  clickable.click();
                  track("gesture_click");
                }
              }
            } else {
              pinchStartRef.current = null;
              pinchFiredRef.current = false;
              cur.pinch = Math.max(0, cur.pinch - 0.15);

              // Open-hand up/down = scroll (paused while pinching so aim stays steady)
              const y = Math.min(1, Math.max(0, (indexTip.y - 0.15) / 0.7));
              smoothRef.current =
                smoothRef.current === null
                  ? y
                  : smoothRef.current + (y - smoothRef.current) * 0.18;
              const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;
              lenisRef.current?.scrollTo(smoothRef.current * maxScroll, {
                immediate: true,
              });
            }
          } else {
            setHoverEl(null);
            cursorRef.current.hovering = false;
            cursorRef.current.pinch = 0;
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStatus(err?.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [status, lenisRef, setHoverEl]);

  useEffect(() => disable, [disable]);

  return { status, enable, disable, videoRef, cursorRef };
}
