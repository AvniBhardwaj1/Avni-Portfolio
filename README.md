# Avni Bhardwaj — Portfolio

React portfolio with a FastAPI API, MongoDB-backed analytics/chat history, an
optional provider-backed chat assistant, and a scheduled weekly digest.

## Stack

- Frontend: React 19, TypeScript, Tailwind CSS, Craco
- API: FastAPI, Motor, exposed to Vercel by `api/index.py`
- Database: MongoDB Atlas
- Hosting and scheduled digest: Vercel

## Local development

1. Install Node.js 20+ and Python 3.11+.
2. Configure the backend:

   ```sh
   cp backend/.env.example backend/.env
   ```

   Set `MONGO_URL` and `DB_NAME` in `backend/.env`. `LLM_PROVIDER=mock` is safe
   for local development; select a provider and set its key to enable live chat.
3. Install and start the API:

   ```sh
   python -m venv .venv
   . .venv/bin/activate
   pip install -r backend/requirements.txt
   cd backend
   uvicorn server:app --reload
   ```
4. In another terminal, install and start the frontend:

   ```sh
   cd frontend
   npm ci
   npm start
   ```

The frontend defaults to same-origin `/api` requests. For local frontend/API
development on different origins, set `REACT_APP_BACKEND_URL=http://127.0.0.1:8000`
in `frontend/.env`.

## Deployment

Follow [DEPLOY.md](./DEPLOY.md) for a Vercel + MongoDB Atlas deployment and
provider configuration. For Vercel, select `updated_2026` or the branch you
choose to deploy; no push to `main` is required.

## Checks

```sh
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
python -m pytest backend/tests
```

The GitHub contributions test calls the configured local API by default. Start
the API before running it, or set `REACT_APP_BACKEND_URL` to another API URL.
