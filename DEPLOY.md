# Deploy from scratch — Vercel Hobby + MongoDB Atlas M0

The portfolio and API can run on the free Vercel Hobby plan with an Atlas M0
cluster. Allow about 10–15 minutes if you already have GitHub, MongoDB Atlas,
and Vercel accounts. A custom domain, LLM provider, and email sender are
optional. Provider free tiers and account requirements can change; confirm
current terms before choosing one.

## 1. Create the free database

1. Create an Atlas M0 free cluster.
2. Create a database user limited to read/write access on `avni_portfolio`, with
   a unique, strong password. URL-encode special characters in the connection
   URI password.
3. Atlas M0 plus Vercel Hobby does not provide a stable Vercel egress IP for an
   Atlas IP allowlist. To connect from the serverless function, add `0.0.0.0/0`
   to the Atlas network access list. This permits connection attempts from any
   IP, so rely on TLS, the database user's least-privilege role, and a strong
   unique password; do not reuse that password anywhere.
4. Copy the Python-driver connection URI. Keep it private.

## 2. Import the GitHub repository into Vercel

1. Import `AvniBhardwaj1/Avni-Portfolio` into Vercel.
2. Keep the project root at the repository root. The checked-in `vercel.json`
   supplies the build command, output directory, Python function routing, SPA
   fallback (including case-study URLs), and daily cron schedule.
3. Select `revamp/emergent-free` or the branch you want to deploy. The branch
   must first be pushed to GitHub with a normal, non-forced push. There is no
   requirement to deploy from `main`.
4. Add the required server environment variables below, then deploy.

## 3. Add Vercel environment variables

Generate two different random secrets, for example with
`openssl rand -hex 32`. Add them only in Vercel Project → Settings →
Environment Variables; never commit them or use a `REACT_APP_` prefix.

| Variable | Required | Value |
|---|---:|---|
| `MONGO_URL` | Yes | Atlas connection URI |
| `DB_NAME` | Yes | `avni_portfolio` |
| `STATS_TOKEN` | Yes | First random secret; protects `/stats` and the manual digest trigger |
| `CRON_SECRET` | Yes | Separate random secret; protects the Vercel Cron endpoint |
| `SITE_URL` | Yes | Canonical HTTPS production URL, such as `https://<project>.vercel.app` |
| `REACT_APP_SITE_URL` | Recommended | Same public URL; used at build time for canonical, Open Graph, `robots.txt`, and `sitemap.xml` URLs |
| `LLM_PROVIDER` | No | Use `mock` first; choose `groq`, `gemini`, `openrouter`, `anthropic`, or `openai` to enable a hosted model |
| `LLM_API_KEY` | For hosted chat | Key for the provider selected above; keep server-side |
| `LLM_MODEL` | No | Optional model override |
| `LLM_BASE_URL` | No | Optional HTTPS API base URL override for the selected provider |
| `LLM_MAX_TOKENS` | No | Output limit from 1 to 2048; defaults to 512 |
| `LLM_FALLBACK_PROVIDER` | No | Defaults to `mock` if the selected provider fails |
| `CORS_ORIGINS` | Only for cross-origin use | Comma-separated trusted site origins; same-origin Vercel requests do not need CORS |
| `CHAT_LOGGING` | No | `off` by default; set `on` to persist chat transcripts in MongoDB |
| `GITHUB_USERNAME` | No | Defaults to `AvniBhardwaj1` for the contributions heatmap |
| `GITHUB_TOKEN` | No | Optional server-side token for GitHub's HTML fallback |

Vercel sets `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` for builds. Set
`REACT_APP_SITE_URL` explicitly if using a custom domain or if the generated
preview URLs are not the canonical URL you want.

The site starts with `LLM_PROVIDER=mock` and no LLM key. To enable dynamic chat,
choose a provider whose current free tier and key requirements work for you,
then set `LLM_PROVIDER` and `LLM_API_KEY`. No LLM provider is required to deploy
the site.

## 4. Enable contact email notifications

The contact form always stores messages in MongoDB. To also send notifications
to the email address in `backend/data/profile.json`, set these Vercel
Environment Variables:

| Variable | Value |
|---|---|
| `EMAIL_PROVIDER` | `resend` |
| `EMAIL_API_KEY` | Resend API key, kept server-side |
| `EMAIL_FROM_ADDRESS` | A sender address verified with Resend |
| `EMAIL_FROM_NAME` | Optional display name |

No recipient variable is required for contact messages. Resend sends them to
the profile email; `DIGEST_EMAIL` is only for the separate weekly digest. Never
put an email API key in frontend code or a `REACT_APP_*` variable. The contact
endpoint validates message fields, limits requests per IP, ignores honeypot
submissions, and escapes user text before putting it in the notification.
Email delivery is best-effort: a provider failure does not discard the saved
message and is reported to the sender.

## 5. Optional: enable the weekly email digest

The daily Vercel Cron runs at 09:00 India time and sends only on Mondays. The
digest is separate from contact notifications: contact messages are always
stored in MongoDB, and a notification is attempted when the email provider is
configured. Until `DIGEST_EMAIL` is set, the authorized Cron returns an
explicit `skipped` status and sends no digest.

To enable the digest, configure all of:

| Variable | Value |
|---|---|
| `EMAIL_PROVIDER` | `resend` or `smtp` |
| `EMAIL_FROM_ADDRESS` | Sender address authorized by the selected provider |
| `EMAIL_API_KEY` | Resend API key (SMTP uses its SMTP credentials instead) |
| `DIGEST_EMAIL` | Recipient address |
| `EMAIL_REPLY_TO` | Optional reply-to address |
| `EMAIL_FROM_NAME` | Optional sender display name |

For Resend, set `EMAIL_API_KEY` and use an authorized sender. For SMTP,
set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and
`SMTP_USE_SSL` (`true` for implicit TLS; otherwise STARTTLS). Email delivery is
optional; do not configure the cron email path until the provider accepts the
sender and recipient settings.

Contact notifications use the email provider settings above and are sent to
the contact address in `backend/data/profile.json`. A delivery failure does
not discard the MongoDB submission.

## 6. Deploy and verify

After deployment:

- Open `/` and a case-study route such as `/projects/agent`.
- Open `/api/` and confirm the JSON health response.
- Open `/stats`; verify that an incorrect token is rejected and use
  `STATS_TOKEN` to unlock it.
- Try chat in `mock` mode, or after configuring a hosted provider.
- Submit a contact message and verify it appears in the Atlas
  `contact_submissions` collection. If email delivery is configured, verify
  the notification arrives at the profile contact address. The app does not
  provide an inbox/admin screen; failed notification delivery does not discard
  the saved message.
- Only after email setup, wait for Monday’s cron or use the protected manual
  digest endpoint with `STATS_TOKEN`.

The custom domain is optional: the Vercel-provided HTTPS URL is sufficient.
When adding a domain, configure it in Vercel, update `SITE_URL` and
`REACT_APP_SITE_URL`, and redeploy so canonical and social metadata match.

## Local environment files

Use `backend/.env.example` for local server settings, the root `.env.example`
for server-side deployment variables, and `frontend/.env.example` for public
frontend settings. Copy the relevant template to `.env`; real `.env` files are
ignored by Git. Never put MongoDB, LLM, email, cron, or stats secrets in
`REACT_APP_*` variables.
