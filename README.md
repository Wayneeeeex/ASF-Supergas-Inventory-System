# ASF Super Gas — Inventory System

Stack: **Vite + React** (frontend) → **Express API** (backend) → **MySQL** (database, managed with DBeaver).

```
asf-super-gas-inventory/
├── sql/
│   └── schema.sql          ← run this in DBeaver first
├── backend/                ← Express API (talks to MySQL)
│   ├── server.js
│   ├── db.js
│   └── routes/
└── frontend/                ← Vite + React dashboard
    └── src/App.jsx
```

## Option A — Docker (backend + MySQL, recommended)

No local MySQL or Node install needed for the backend — Docker Compose runs both.

```bash
cp .env.example .env        # sets the MySQL root password Compose will use
docker compose up --build
```

This starts two containers:
- **`mysql`** — MySQL 8, with `sql/schema.sql` auto-run the *first* time the container's data volume is created (creates the DB, tables, and seed rows). Exposed on `localhost:3306`, so **DBeaver connects to it exactly like a local install** — host `localhost`, port `3306`, user `root`, password from `.env`.
- **`backend`** — the Express API, built from `backend/Dockerfile`, exposed on `localhost:4000`. Source is volume-mounted, so edits to files in `backend/` reload live (via `node --watch`).

Check it's working: `http://localhost:4000/api/health` → `{"ok":true}`, then `http://localhost:4000/api/products`.

To stop: `docker compose down` (add `-v` if you also want to wipe the MySQL data volume and re-seed from scratch next time).

> Note: `schema.sql` only runs automatically the *first* time the `mysql_data` volume is created. If you edit the schema later, either `docker compose down -v` and `up` again (destroys data) or run the updated SQL manually through DBeaver against the running container.

Then skip to **Frontend** below — you don't need Option B.

## Option B — Manual (no Docker)

### 1. Database — MySQL + DBeaver

1. Make sure a MySQL server is running locally (or point at a remote one).
2. In DBeaver: **New Database Connection → MySQL**, fill in host/port/user/password, test connection.
3. Open `sql/schema.sql` in DBeaver, then use **Execute SQL Script** (not "Execute Statement" — the file has multiple statements). This creates the `asf_inventory` database, three tables (`tanks`, `products`, `purchase_orders`), and seeds them with the same data the dashboard was mocked up with.
4. Confirm the tables in DBeaver's schema browser show rows.

### 2. Backend — Node/Express

```bash
cd backend
cp .env.example .env       # then edit DB_USER / DB_PASSWORD to match your MySQL login
npm install
npm run dev                 # starts on http://localhost:4000
```

Check it's working: open `http://localhost:4000/api/health` in a browser — should return `{"ok":true}`. Then try `http://localhost:4000/api/products`.

### API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tanks` | Tank levels (% full computed from raw volumes) |
| PUT | `/api/tanks/:id` | Update a tank reading |
| GET | `/api/products` | List products — supports `?category=`, `?status=`, `?search=` |
| GET | `/api/products/stock-by-category` | Aggregated data for the bar chart |
| POST / PUT / DELETE | `/api/products[/:id]` | Create / edit / remove a product |
| GET | `/api/purchase-orders` | List purchase orders |
| POST | `/api/purchase-orders` | Create a purchase order |

## Frontend — Vite + React

(Same steps whether you used Option A or B for the backend.)

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:4000/api, adjust if needed
npm install
npm run dev                 # starts on http://localhost:5174
```

Open `http://localhost:5174` — the dashboard now loads tanks, stock levels, purchase orders, and products live from MySQL via the API, and the search box / category / status chips re-query the backend as you use them.

## Notes / next steps
- Auth isn't wired up yet — add a login route + JWT or session middleware in `backend/server.js` before deploying this anywhere real.
- `stock-by-category` percentages are a simple heuristic (`qty / min_qty` scaled) — adjust the formula in `routes/products.js` once you know how you actually want "healthy" defined.
- For production, `npm run build` in `frontend/` outputs static files you can serve from Express itself, Nginx, or any static host — just make sure `VITE_API_URL` points at wherever the backend actually runs.
