import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";

export type GestureStatus = "idle" | "loading" | "active" | "denied" | "error";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export function useGestureScroll(lenisRef: { current: Lenis | null }) {
  const [status, setStatus] = useState<GestureStatus>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const smoothRef = useRef<number | null>(null);

  const disable = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close?.();
    landmarkerRef.current = null;
    smoothRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

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

      const loop = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (video && landmarker && video.readyState >= 2) {
          const result = landmarker.detectForVideo(video, performance.now());
          const tip = result?.landmarks?.[0]?.[8];
          if (tip) {
            const y = Math.min(1, Math.max(0, (tip.y - 0.15) / 0.7));
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
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStatus(err?.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [status, lenisRef]);

  useEffect(() => disable, [disable]);

  return { status, enable, disable, videoRef };
}
