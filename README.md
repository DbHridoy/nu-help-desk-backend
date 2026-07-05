# NU Student Help Website

Local MVP workspace for three connected projects:

- Backend API: Express + TypeScript + MongoDB
- Public frontend: Next.js + TypeScript + Tailwind CSS
- Admin dashboard: Next.js + TypeScript + Tailwind CSS

The backend repo is the current root folder. The two Next.js apps stay separate in sibling folders.

## Folder Structure

```text
nu-help-desk/
├── src/                         # backend source
├── nu-help-desk-frontend/       # public frontend
├── nu-help-desk-dashboard/      # admin dashboard
├── docker-compose.yml           # MongoDB only
└── package.json                 # root orchestration scripts
```

## Required Node Version

- Node.js 20.x or newer
- npm 10.x or newer

## Install All Dependencies

```bash
npm run install:all
```

This uses `pnpm` for `nu-help-desk-frontend` because that repo already ships with `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

## Start MongoDB

Use Docker Compose:

```bash
docker compose up -d
```

MongoDB URL:

```text
mongodb://localhost:27017/nu-help-desk
```

## Seed the Backend

```bash
npm run seed
```

Default admin credentials:

- Email: `admin@nuhelpdesk.com`
- Password: `Admin@12345`

## Run All Apps

```bash
npm run dev
```

Useful individual scripts:

- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run dev:dashboard`
- `npm run build:all`

## Local URLs

- Public frontend: `http://localhost:3000`
- Admin dashboard: `http://localhost:3001`
- Backend API: `http://localhost:5000/api`
- Upload files: `http://localhost:5000/uploads/<filename>`

## Environment Setup

Included local env files:

- `.env`
- `.env.example`
- `nu-help-desk-frontend/.env`
- `nu-help-desk-frontend/.env.example`
- `nu-help-desk-dashboard/.env`
- `nu-help-desk-dashboard/.env.example`

Default frontend and dashboard API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Troubleshooting

- CORS error:
  Confirm backend `.env` contains `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`.
- MongoDB not running:
  Start `docker compose up -d` or run a local MongoDB server on port `27017`.
- Wrong API base URL:
  Confirm both Next apps use `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`.
- Upload file not loading:
  Confirm the backend is running and the file path is under `/uploads/...`.
- Port already in use:
  Free ports `3000`, `3001`, or `5000` before running `npm run dev`.
