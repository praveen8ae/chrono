# Chrono

Chrono is a modular monolith with a Next.js frontend, a Django backend, and PostgreSQL for persistence.

## Structure

- `frontend/` - Next.js app router frontend
- `backend/` - Django project with modular apps
- PostgreSQL - local or Neon-hosted database

## Why `node_modules`, `src`, and `public` can appear

- `frontend/node_modules/` is created when you install the frontend dependencies.
- The old root-level Vite `src/` and `public/` folders are not part of the new architecture and should be removed.

## Run locally

1. Install the frontend dependencies from the repo root:

	```bash
	pnpm install
	```

2. Create and activate a Python virtual environment for Django:

	```bash
	python -m venv backend/.venv
	source backend/.venv/bin/activate
	pip install -r backend/requirements.txt
	```

3. Copy environment files and set your values:

	```bash
	cp frontend/.env.example frontend/.env.local
	cp backend/.env.example backend/.env
	```

4. Start the frontend in one terminal:

	```bash
	pnpm dev
	```

5. Start the backend in another terminal:

	```bash
	source backend/.venv/bin/activate
	python backend/manage.py runserver 0.0.0.0:8000
	```

## Build

```bash
pnpm build
```

## Type check

```bash
pnpm typecheck
```