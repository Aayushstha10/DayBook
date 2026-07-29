<<<<<<< HEAD
# Ledger — Expense Tracker UI

A front-end-only expense tracker built with React, React Router, Tailwind CSS, and Recharts. Transaction data is seeded from `src/data/dummyData.js` and persisted to `localStorage` so edits survive a page refresh — there's no backend.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── assets/            static files (empty by default)
├── components/        reusable UI pieces (table, modals, cards, nav)
├── context/            ExpenseContext — the single source of truth for transactions
├── data/               seed data: categories + starter transactions
├── layout/             MainLayout — sidebar + navbar shell used by the app pages
├── pages/               one file per route
├── App.jsx              route table
├── main.jsx             app entry point
└── index.css            Tailwind entry + a few shared component classes
```

## Notes

- Auth screens (`/login`, `/register`) are UI only — submitting just redirects to the dashboard.
- "Export as CSV" and "Clear all data" on the Settings page are placeholders; wire them up to real logic when you add a backend.
- Colors, type, and the receipt-style dashed row dividers are defined as design tokens in `tailwind.config.js` — change those instead of hardcoding hex values in components.
=======
currently this project is development phase..............
>>>>>>> 20b36084e7f0667fc6796feb00e5e10671431571
