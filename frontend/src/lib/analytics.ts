const API = `${process.env.REACT_APP_BACKEND_URL ?? ""}/api/analytics`;

export const getAnalyticsSession = () => {
  let id = localStorage.getItem("ab-analytics-session");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    localStorage.setItem("ab-analytics-session", id);
  }
  return id;
};

export const track = (type: string, data: Record<string, unknown> = {}) => {
  const payload = JSON.stringify({
    sessionId: getAnalyticsSession(),
    type,
    data,
    ts: new Date().toISOString(),
  });
  try {
    const url = `${API}/event`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch {
    /* analytics must never break the page */
  }
};

const initGA = () => {
  const gaId = process.env.REACT_APP_GA_ID;
  if (!gaId) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = (...args: unknown[]) => w.dataLayer.push(args);
  w.gtag("js", new Date());
  w.gtag("config", gaId);
};

export const initAnalytics = () => {
  initGA();
  track("page_view", { path: window.location.pathname });

  const enterTimes = new Map<string, number>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        const id = (en.target as HTMLElement).id;
        if (!id) return;
        if (en.isIntersecting) {
          enterTimes.set(id, performance.now());
        } else if (enterTimes.has(id)) {
          track("section_view", {
            section: id,
            dwellMs: Math.round(performance.now() - enterTimes.get(id)!),
          });
          enterTimes.delete(id);
        }
      });
    },
    { threshold: 0.35 },
  );
  document.querySelectorAll("section[id]").forEach((s) => io.observe(s));

  window.addEventListener("beforeunload", () => {
    enterTimes.forEach((t, id) =>
      track("section_view", { section: id, dwellMs: Math.round(performance.now() - t) }),
    );
  });
};
