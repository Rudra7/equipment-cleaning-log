# Equipment Cleaning Log

## Goal

Equipment Cleaning Log is a small full-stack application for recording and auditing equipment-cleaning activity. It lets operators manage equipment, record cleaning work, track verification status, and review immutable field-level audit history.

Equipment is soft-retired rather than deleted. Retired equipment remains visible with its cleaning history, but cannot receive new cleaning records.

## Structure and tech stack

```text
equipment-cleaning-log/
├── backend/                 Express API, Prisma schema, migrations, tests, and seed data
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── routes/
│   │   └── utils/
│   └── tests/
├── frontend/                React and Vite application
│   └── src/
│       ├── api/
│       ├── components/
│       └── pages/
└── docker-compose.yml       Local service orchestration
```

| Area | Technology |
| --- | --- |
| Backend | Node.js, TypeScript, Express |
| Persistence | PostgreSQL, Prisma ORM |
| Backend tests | Vitest |
| Frontend | React, TypeScript, Vite, React Bootstrap |
| Local infrastructure | Docker Compose |

The backend follows a focused `route → validation → controller → service → Prisma` flow. Cleaning-record mutation and audit writes occur in the same database transaction. Audit-diff comparison is isolated in a utility and has unit coverage for dates, null values, and no-op updates.

## Set up components individually

### Database

Start PostgreSQL:

```bash
docker compose up -d postgres
```

The local database uses the credentials defined in `docker-compose.yml`. The backend connection string is available in `backend/.env.example`.

### Backend API

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

The API runs on `http://localhost:3000`.

Useful commands:

```bash
npm test
npm run build
npm run prisma:studio
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173`. Its development proxy forwards `/api` requests to the backend at port `3000`.

```
