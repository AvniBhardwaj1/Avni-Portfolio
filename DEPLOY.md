# Deploy from scratch — Vercel + MongoDB Atlas

The site and API can run on Vercel Hobby with an Atlas M0 database. The chat
provider and email sender are optional integrations; the site starts with chat
in mock mode and does not need either provider to deploy. Provider free tiers
and account requirements can change, so check the provider's current terms.

## 1. Create the database

1. Create a MongoDB Atlas account and an M0 free cluster.
2. Create a database user and allow Vercel to reach the cluster. Atlas network
   access rules apply to the Vercel serverless API; restrict access further if
   you use a stable egress option.
3. Copy the Python-driver connection URI. Replace the username/password
   placeholders, and use database name `avni_portfolio`.

## 2. Connect the repository to Vercel

1. Import `AvniBhardwaj1/Avni-Portfolio` into Vercel.
2. Keep the project root directory at the repository root.
3. Select `updated_2026` or another branch you choose. For the current cleanup,
   deploy `revamp/emergent-free` after its changes are ready; there is no need
   to push to `main`.
4. Add the server environment variables below before deploying.

| Variable | Required | Value |
|---|---:|---|
| `MONGO_URL` | Yes | MongoDB Atlas connection URI |
| `DB_NAME` | Yes | `avni_portfolio` |
| `STATS_TOKEN` | Yes | Long random secret used by `/stats` and manual digest trigger |
| `CRON_SECRET` | Yes | Separate long random secret used by the Vercel scheduled digest |
| `SITE_URL` | Yes | Your canonical HTTPS Vercel URL |
| `CORS_ORIGINS` | For cross-origin local/API use | Comma-separated allowed origins; set to your site origin |
| `LLM_PROVIDER` | No | `mock` (default), `groq`, `gemini`, `openrouter`, `anthropic`, or `openai` |
| `LLM_API_KEY` | For a real LLM | Key for the selected provider; never prefix it with `REACT_APP_` |
| `LLM_MODEL` | No | Optional provider model override |
| `LLM_MAX_TOKENS` | No | Maximum generated tokens (default 512; max 2048) |
| `EMAIL_PROVIDER` | For weekly email | `resend` or `smtp` |
| `EMAIL_FROM` | For weekly email | Sender accepted by the selected email provider |
| `DIGEST_EMAIL` | For weekly email | Recipient address |
| `EMAIL_REPLY_TO` | No | Optional reply-to address |
| `EMAIL_FROM_NAME` | No | Sender name in the digest |

Generate independent random values for the two access secrets (for example,
`openssl rand -hex 32`). Do not reuse a provider API key as either token.

For Resend, set `RESEND_API_KEY` and use an `EMAIL_FROM` sender authorized by
your Resend account. For SMTP, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`,
`SMTP_PASSWORD`, and `SMTP_USE_SSL` (`true` for implicit TLS, otherwise STARTTLS).
`EMAIL_FROM` must be accepted by that SMTP service.

Vercel injects the cron authorization header from `CRON_SECRET`; the endpoint
rejects requests without the matching bearer token. The configured schedule
checks daily at 09:00 India time and sends only on Mondays.

## 3. Deploy and verify

Deploy the selected branch. The repository config builds the frontend with
`npm ci` and routes `/api/*` to the FastAPI function. Verify:

- `/` loads the portfolio.
- `/api/` returns the API health response.
- `/stats` loads and rejects an incorrect token; unlock it with `STATS_TOKEN`.
- Chat works in `mock` mode, or with the provider selected in `LLM_PROVIDER`.
- Configure email and then use the protected manual digest endpoint only when
  you are ready to send a real email.

## Local environment files

Copy `backend/.env.example` to `backend/.env` for local API development. Root
`.env.example` documents the server-side deployment variables, and
`frontend/.env.example` contains only optional public frontend settings.
Never commit `.env` files or put server secrets in `REACT_APP_*` variables.
