# Avni Bhardwaj — Portfolio

An Emergent-free personal portfolio built with React and FastAPI. The frontend
and API deploy together to Vercel; MongoDB Atlas stores contact submissions,
chat history, and analytics.

## What’s included

- Interactive portfolio, responsive layouts, accessible keyboard dialogs, and
  reduced-motion support
- Individual case-study routes at `/projects/<project-id>`
- Optional, profile-grounded AI chat (`mock` mode works without a provider key)
- Opt-in hand-gesture controls; camera processing stays in the browser
- MongoDB-backed contact form, chat history, and token-protected `/stats`
- Optional Vercel Cron weekly digest using Resend or SMTP

Contact messages are saved to the `contact_submissions` MongoDB collection.
They are **not emailed automatically**. Chat history is stored in MongoDB to
restore conversations; the chat UI discloses this to visitors.

## Deploy

Use [DEPLOY.md](./DEPLOY.md) for a Vercel Hobby + Atlas M0 setup. The core site
does not require a paid service, LLM key, or email provider. Deploy the
`revamp/emergent-free` branch or another branch you select; no push to `main`
is required.

## Local development

Requirements: Node.js 20+, Python 3.11+, and a MongoDB URI.

```sh
cp backend/.env.example backend/.env
# Set MONGO_URL and DB_NAME in backend/.env.
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/uvicorn --app-dir backend server:app --reload --port 8000
```

In another terminal, point the frontend at the local API and start it:

```sh
cp frontend/.env.example frontend/.env
# Set REACT_APP_BACKEND_URL=http://127.0.0.1:8000 in frontend/.env.
cd frontend
npm ci
npm start
```

Open `http://localhost:3000`. The frontend uses same-origin `/api` by default;
`REACT_APP_BACKEND_URL` is needed for this two-port local setup. Never put
server credentials in a `REACT_APP_*` variable.

## Checks

```sh
cd frontend && npm run build
cd ..
.venv/bin/python -m pytest -q backend/tests
```

The backend suite includes three live GitHub-contributions integration tests.
Run the API locally and allow network access for those tests. Focused tests that
do not need the API or external network:

```sh
.venv/bin/python -m pytest -q \
  backend/tests/test_providers.py \
  backend/tests/test_security_config.py \
  backend/tests/test_profile_chat.py
```

There is no standalone frontend lint script or frontend unit-test suite yet;
the production build performs the CRA/TypeScript checks.

## Profile facts to confirm

The chat’s source of facts is [backend/profile.json](./backend/profile.json).
It includes `TODO(owner)` entries for the public repositories for Deep Learning
Research and IoT Actuator Control, and confirmation of what may be shared about
the publication-review status of the research project. The profile and
timeline also disagree on the Chaitanya finalist ranking (top 10 of 1,000+
versus top 20 from 977 registrations). Confirm these facts before treating them
as definitive; the chat intentionally does not expose the editorial TODOs.
