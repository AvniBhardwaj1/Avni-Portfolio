# Free Deployment Guide — Vercel + MongoDB Atlas

Everything below is $0. **No credit card needed for anything.**

## Architecture

- **Frontend + Backend (FastAPI) + Cron** → Vercel free Hobby plan, one project, one URL like `https://avni-portfolio.vercel.app`
- **Database** → MongoDB Atlas M0 (free forever, 512 MB)

The backend runs as a Vercel Python serverless function (`/api/index.py` reuses `backend/server.py`). The weekly digest email runs via Vercel Cron (daily 09:00 IST check, sends Mondays only).

---

## Step 1 — MongoDB Atlas (free database)

1. https://cloud.mongodb.com → sign up free
2. Create an **M0 FREE** cluster (AWS, Mumbai region is fine)
3. Database Access → Add Database User → save the username + password
4. Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`) — required so Vercel can reach it
5. Connect → **Drivers** → Python → copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   (replace `<password>` with the database user's password)

## Step 2 — Push this code to GitHub

Use **"Save to GitHub"** in the Emergent chat input → select repo `avnibhardwaj1/Avni-Portfolio` → branch `main` → PUSH.

(`.env` files are gitignored — secrets never leave this workspace.)

## Step 3 — Vercel (free hosting for everything)

1. https://vercel.com → sign up **with GitHub** (free, no card)
2. **Add New → Project** → import `Avni-Portfolio`
3. Leave **Root Directory** as the repo root (the included `vercel.json` handles the frontend build + API)
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `MONGO_URL` | your Atlas connection string from Step 1 |
   | `DB_NAME` | `avni_portfolio` |
   | `EMERGENT_LLM_KEY` | from `backend/.env` in your Emergent workspace |
   | `EMERGENT_EMAIL_KEY` | from `backend/.env` |
   | `STATS_TOKEN` | from `backend/.env` |
   | `DIGEST_EMAIL` | from `backend/.env` (where the weekly digest goes) |
   | `EMAIL_FROM_NAME` | from `backend/.env` |
   | `EMAIL_REPLY_TO` | from `backend/.env` |
   | `SITE_URL` | `https://<your-project>.vercel.app` |
   | `CORS_ORIGINS` | `https://<your-project>.vercel.app` |
   | `CRON_SECRET` | make up a long random string (protects the cron endpoint) |

   You do NOT need `REACT_APP_BACKEND_URL` — frontend and API share the same origin on Vercel.

5. **Deploy**. ~2-3 minutes later your site is live.

## Step 4 — Verify the live site

- `https://<your-project>.vercel.app` — hero, A380, vinyls, everything
- `https://<your-project>.vercel.app/api/` — should return a JSON "Hello World"
- Chat widget answers (needs `EMERGENT_LLM_KEY`)
- Skills section shows the live GitHub heatmap
- Stats dashboard: `https://<your-project>.vercel.app/stats`

## Notes

- Your Emergent preview keeps working exactly as before — nothing here affects it.
- Every push to `main` auto-redeploys on Vercel. No GitHub Actions needed.
- Serverless means the first API call after idle can take a few seconds (cold start) — normal on the free plan.
- The weekly digest email still goes out Mondays 09:00 IST via Vercel Cron.
- If the Vercel build log shows a Python dependency error, check the function logs under your project → Deployments → Functions.
- Optional later: add a custom domain in Vercel → Settings → Domains (free).
