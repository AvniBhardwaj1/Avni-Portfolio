# Portfolio project notes

## Current architecture

- Frontend: React 19 and TypeScript, built with Create React App/Craco, Tailwind,
  Framer Motion, GSAP, Lenis, React Three Fiber, and opt-in MediaPipe hand
  tracking.
- API: FastAPI exposed by Vercel through `api/index.py`.
- Data: MongoDB stores analytics events and opt-in chat history.
- Chat: provider selection is server-side (`LLM_PROVIDER`); mock mode is the
  default. Supported providers and setup are documented in `DEPLOY.md`.
- Weekly digest: Vercel Cron invokes the protected endpoint; Resend or SMTP can
  deliver mail when configured.

## Verified portfolio facts

Use the visible portfolio and backend chat profile as the source for factual
content. Do not infer missing dates, project metrics, links, or credentials.
Confirm facts with Avni before filling any content gap.

## Deployment notes

- Vercel builds the frontend from `frontend/` and maps `/api/*` to the FastAPI
  application in `backend/server.py`.
- MongoDB Atlas credentials, `STATS_TOKEN`, and `CRON_SECRET` are private
  deployment configuration. Never put secret values in source control.
- Deploy from `updated_2026` or another explicitly selected branch.
- The browser camera is opt-in; disabling gesture scroll must stop the camera
  tracks and detach the video stream.
