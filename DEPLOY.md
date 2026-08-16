# Free Deployment Guide — GitHub Pages + Render + MongoDB Atlas

Everything below is $0. No credit card needed for any step.

## Architecture

- **Frontend (static)** → GitHub Pages at `https://avnibhardwaj1.github.io/Avni-Portfolio/`
- **Backend (FastAPI)** → Render free web service
- **Database** → MongoDB Atlas M0 (free forever, 512 MB)

---

## Step 1 — Push this code to GitHub

Use **"Save to GitHub"** in the Emergent chat input → select repo `avnibhardwaj1/Avni-Portfolio` → branch `main` → PUSH.

(`.env` files are gitignored — your secrets never leave this workspace.)

## Step 2 — MongoDB Atlas (free database)

1. Go to https://cloud.mongodb.com → sign up free
2. Create an **M0 FREE** cluster (any region near you)
3. Database Access → Add Database User → username + password (save these)
4. Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) — required so Render can reach it
5. Clusters → Connect → Drivers → copy the connection string, looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 3 — Render (free backend)

1. Go to https://render.com → sign up with GitHub (free)
2. New → **Blueprint** → select the `Avni-Portfolio` repo (it reads `render.yaml` automatically)
3. When prompted, fill in the environment variables:
   - `MONGO_URL` — your Atlas connection string from Step 2
   - `DB_NAME` — any name, e.g. `avni_portfolio`
   - `CORS_ORIGINS` — `https://avnibhardwaj1.github.io`
   - `EMERGENT_LLM_KEY`, `EMERGENT_EMAIL_KEY`, `STATS_TOKEN`, `DIGEST_EMAIL`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` — copy the values from `backend/.env` in your Emergent workspace (or reuse your own keys)
   - `SITE_URL` — `https://avnibhardwaj1.github.io/Avni-Portfolio/`
4. Deploy. When live, Render gives you a URL like `https://avni-portfolio-api.onrender.com`
5. Verify: open `https://<your-render-url>/api/` — you should get a JSON response

> Free-tier note: Render free services sleep after ~15 min idle. First visit after sleep takes ~30-60s to wake — normal, not a bug. The weekly digest email still runs on its schedule.

## Step 4 — GitHub Pages (free frontend)

1. In the repo on GitHub → **Settings → Secrets and variables → Actions → Variables** tab → New repository variable:
   - Name: `REACT_APP_BACKEND_URL`
   - Value: `https://<your-render-url>` (no trailing slash)
2. **Settings → Pages** → Source: **GitHub Actions**
3. Push any commit to `main` (or Actions tab → "Deploy frontend to GitHub Pages" → Run workflow)
4. Wait ~2 min → your site is live at https://avnibhardwaj1.github.io/Avni-Portfolio/

## Step 5 — Done. Verify the live site

- Hero loads, A380 assembles on scroll
- Chat widget answers (needs `EMERGENT_LLM_KEY` set on Render)
- Skills section shows the GitHub heatmap (proxied through your Render backend)
- Stats dashboard: `https://avnibhardwaj1.github.io/Avni-Portfolio/#stats` (GitHub Pages has no SPA fallback for `/stats` — the `#stats` hash works instead)

## Notes

- Your Emergent preview keeps working exactly as before — the subpath changes only activate when `PUBLIC_URL` is set (the GitHub workflow sets it).
- If the chat or heatmap shows errors on the live site but works on Emergent preview, check Render logs first — it's almost always a missing env var or Atlas network access.
- To update the site later: make changes here, "Save to GitHub", and both deployments update automatically (GitHub rebuilds Pages, Render auto-deploys on push if you keep auto-deploy on).
