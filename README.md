# Bergeerd — Admin Panel & Dynamic Menu

This monorepo makes the **bergeerd** restaurant website's menu fully dynamic.
Menu items (prices, images, titles, descriptions, categories, ordering, active
status) are managed through a secure **Admin Panel** and served to the public
website through a **REST API**, so any change in the panel appears on the site
automatically.

The system reuses the **existing MongoDB** and **MinIO** services already running
on the production server (`5.57.39.207`) — no new database or storage is installed.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  bergeerd_menu  │     │  bergeerd_admin │     │   bergeerd_api  │
│  (public site)  │     │  (admin panel)  │     │  (Go + Gin API) │
│  React + Vite   │     │  React + Vite   │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │ GET /api/menu          │ /api/admin/* (JWT)    │
         └─────────── fetch ──────┴───────────────────────┘
                                          │              │
                          ┌───────────────▼───┐  ┌───────▼────────┐
                          │  MongoDB (existing)│  │ MinIO (existing)│
                          │  db: bergeerd      │  │ bucket: bergeerd│
                          └───────────────────┘  └────────────────┘
```

---

## Repository layout

| Folder          | What it is                                              |
| --------------- | ------------------------------------------------------- |
| `bergeerd_api/`  | Go (Gin) REST API — backend, JWT auth, CRUD, seeding  |
| `bergeerd_admin/`| React (Vite + TS + Tailwind) admin panel               |
| `bergeerd_menu/` | Existing public website — now fetches menu from the API |

---

## Prerequisites (local development)

Install these on your machine:

| Tool   | Version         | Check                  |
| ------ | --------------- | ---------------------- |
| Go     | 1.22+           | `go version`           |
| Node   | 18+             | `node --version`       |
| npm    | 9+              | `npm --version`        |
| sshpass| any (for tunnel)| `sshpass -V`           |

The server already has MongoDB and MinIO running in Docker but their ports are
**not published to the host**, so for local development you connect to them over
an **SSH tunnel** (see step 2 below).

Server access:

```
Host: 5.57.39.207
Port: 3939
User: root
```

---

## Local Development — step by step

### Step 1 — Clone & enter the project

```bash
git clone <your-repo-url> bergeerd
cd bergeerd
```

### Step 2 — Open SSH tunnels to the existing MongoDB & MinIO

MongoDB and MinIO run as Docker containers on the server with **internal-only**
ports (no host mapping). Forward them to your localhost with two SSH tunnels:

```bash
# Terminal A — tunnel MongoDB (server container 172.18.0.3:27017 -> localhost:27017)
sshpass -p '9qA@NtZ5EP$pkD&' ssh -N \
  -L 27017:172.18.0.3:27017 \
  -p 3939 root@5.57.39.207

# Terminal B — tunnel MinIO (server container 172.18.0.2:9000 -> localhost:9000)
sshpass -p '9qA@NtZ5EP$pkD&' ssh -N \
  -L 9000:172.18.0.2:9000 \
  -p 3939 root@5.57.39.207
```

> Leave both terminals open. The `-N` flag means "no remote command, just
> forward ports". Verify with `mongosh`/`curl http://localhost:9000/minio/health/live`.
>
> If the container IPs change, find the current ones with:
> ```bash
> sshpass -p '9qA@NtZ5EP$pkD&' ssh -p 3939 root@5.57.39.207 \
>   'docker network inspect sansyar_default \
>    --format "{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}"'
> ```

### Step 3 — Configure & start the Go backend (`bergeerd_api`)

#### 3.1 Create `.env`

```bash
cd bergeerd_api
cp .env.example .env
```

Open `bergeerd_api/.env` and set at minimum:

```dotenv
# A strong random secret (generate with: openssl rand -base64 48)
JWT_SECRET=<paste-the-output-of-openssl-rand-here>

# Local dev points at the SSH tunnels from step 2
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=bergeerd
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bergeerd
MINIO_USE_SSL=false

# Images served from your local tunnel
MINIO_PUBLIC_URL=http://localhost:9000

# Allow the admin panel (:5173) + website (:3000) origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000

# Seed the admin user + demo menu on first run
SEED_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SEED_MENU=true
```

#### 3.2 (Optional) Upload existing product photos during seeding

The seeder can upload the website's existing images from `bergeerd_menu/src/assets`
into MinIO on first run. Set this extra env var before starting the API:

```bash
export SEED_IMAGES_DIR="$(pwd)/../bergeerd_menu/src/assets"
```

If unset, the seeder uses a placeholder image so the menu still seeds successfully.

#### 3.3 Download deps & run

```bash
go mod download
go run ./cmd/api
```

You should see logs like:

```
starting bergeerd-api — env=development port=8080 db=bergeerd minio=localhost:9000 bucket=bergeerd
seed admin: ensured admin user "admin" exists
seed menu: 23 items present
http server listening on :8080
```

Verify the public endpoint:

```bash
curl http://localhost:8080/health      # -> {"status":"ok"}
curl http://localhost:8080/api/menu    # -> {"data":[{"category":"burgers",...}]}
```

### Step 4 — Configure & start the Admin Panel (`bergeerd_admin`)

```bash
cd ../bergeerd_admin
cp .env.example .env        # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev
```

Open **http://localhost:5173** and log in:

```
Username: admin
Password: admin123
```

You can now **create, edit, delete, and reorder** menu items and upload images.
Changes are saved to MongoDB (data) and MinIO (images) through the API.

### Step 5 — Configure & start the public website (`bergeerd_menu`)

```bash
cd ../bergeerd_menu
cp .env.example .env        # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev
```

Open **http://localhost:3000** (the website's dev server). The menu now loads
from `GET http://localhost:8080/api/menu` (the Go backend). Any edit you make in
the admin panel appears on the website after a refresh (or automatically via
React Query's
`refetchOnWindowFocus`).

> **Fallback:** if `VITE_API_URL` is empty or the API is unreachable, the website
> silently falls back to the static data in `bergeerd_menu/src/data/menuData.ts`,
> so visitors always see a menu.

---

## API Reference

Base URL (local): `http://localhost:8080`

### Public (no auth)

| Method | Path           | Description                              |
| ------ | -------------- | ---------------------------------------- |
| GET    | `/health`      | Health check                             |
| GET    | `/api/menu`    | Active items grouped by category (for the website) |

Response shape for `GET /api/menu`:

```json
{
  "data": [
    { "category": "burgers", "items": [ { "id": "...", "name": "...", "price": "...", "image_url": "...", "image_alt": "...", "is_active": true, "order": 1 } ] },
    { "category": "fries", "items": [ ... ] }
  ]
}
```

### Admin (JWT Bearer token required)

Obtain a token first:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
# -> {"data":{"token":"<jwt>","admin":{"username":"admin"}}}
```

Then use `Authorization: Bearer <jwt>`:

| Method | Path                  | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/admin/menu`     | List all items (admin view)          |
| POST   | `/api/admin/menu`     | Create a new item                    |
| GET    | `/api/admin/menu/:id` | Get one item                         |
| PUT    | `/api/admin/menu/:id` | Update an item (partial fields)      |
| DELETE | `/api/admin/menu/:id` | Delete an item + its image           |
| POST   | `/api/admin/upload`   | Upload an image (`multipart`, field `image`, max 10MB) → returns `{url,...}` |

Example — create an item:

```bash
curl -X POST http://localhost:8080/api/admin/menu \
  -H "Authorization: Bearer <jwt>" \
  -H 'Content-Type: application/json' \
  -d '{"name":"برگر جدید","description":"...","price":"۵۰۰","image_url":"http://localhost:9000/bergeerd/menu/abc.jpg","image_alt":"...","category":"burgers","order":10,"is_active":true}'
```

### Validation errors

When input is invalid, the API returns `400` with field-level errors:

```json
{ "error": "validation failed", "fields": { "name": "name is required", "price": "price is required" } }
```

---

## Production Deployment

The backend and admin panel are deployed to the same server (`5.57.39.207`)
and join the existing `sansyar_default` Docker network so they can reach MongoDB
and MinIO by container name.

### 1. Build the API Docker image (on the server)

```bash
cd /opt/bergeerd/bergeerd_api
docker build -t bergeerd-api:latest .
```

### 2. Production `.env` for the API

```dotenv
APP_ENV=production
PORT=8080
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_HOURS=24

SEED_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<change-this-password>
SEED_MENU=false                       # set true only on first deploy

MONGO_URI=mongodb://sansyar-mongo:27017   # docker network DNS
MONGO_DATABASE=bergeerd
MINIO_ENDPOINT=sansyar-minio:9000         # docker network DNS
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=bergeerd
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=https://bergeerd.ir/bergeerd-minio   # proxied by Nginx
CORS_ORIGINS=https://bergeerd.ir
```

### 3. Production `.env` for the Admin Panel

```dotenv
VITE_API_URL=https://bergeerd.ir/api
```

### 4. Nginx proxy rules (Nginx Proxy Manager or custom)

Add these location blocks so the public domain serves the API, admin panel,
and MinIO images over HTTPS:

```nginx
# Go API
location /api/ {
    proxy_pass http://bergeerd-api:8080;
}

# Admin panel (static build)
location /admin/ {
    proxy_pass http://bergeerd-admin:80/;
}

# MinIO images (public, anonymous read)
location /bergeerd-minio/ {
    proxy_pass http://sansyar-minio:9000/bergeerd/;
}
```

### 5. Website production `.env`

```dotenv
VITE_API_URL=https://bergeerd.ir/api
```

Rebuild the website (`npm run build`) and redeploy the `dist/` folder.

---

## Project structure (backend)

```
bergeerd_api/
├── cmd/api/main.go              # wiring, seeding, graceful shutdown
├── internal/
│   ├── auth/                   # JWT + bcrypt
│   ├── config/                 # env loading (godotenv)
│   ├── database/               # MongoDB connect
│   ├── handler/                # HTTP handlers (auth + menu)
│   ├── httputil/               # OK/Created/Error helpers, APIError
│   ├── middleware/             # JWTAuth
│   ├── models/                 # MenuItem, Admin, inputs
│   ├── repository/             # Mongo CRUD (menu + admin)
│   ├── seeder/                 # default menu data + image upload
│   ├── server/                 # Gin router + CORS
│   ├── service/                # business logic (menu + auth)
│   ├── storage/                # MinIO upload/delete
│   └── validation/             # field-level validation
├── assets/placeholder.svg
├── Dockerfile                  # multi-stage (build + alpine runtime)
├── go.mod / go.sum
└── .env.example
```

## Project structure (admin panel)

```
bergeerd_admin/
├── src/
│   ├── api.ts                  # fetch wrapper + token + all API calls
│   ├── auth.tsx                # AuthProvider context + useAuth
│   ├── main.tsx                # router + protected routes
│   ├── types.ts                # Category, MenuItem, inputs
│   ├── components/
│   │   ├── Layout.tsx          # header + nav + logout
│   │   └── ItemForm.tsx        # create/edit modal + image upload
│   └── pages/
│       ├── Login.tsx
│       └── Dashboard.tsx       # category tabs + CRUD table
└── .env.example
```

---

## Build verification

All three projects build cleanly:

```bash
# Backend
cd bergeerd_api && go build ./... && go vet ./...

# Admin panel
cd bergeerd_admin && npm install && npm run build

# Website
cd bergeerd_menu && npm install && npm run build
```

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `config: JWT_SECRET must be set` | Generate one: `openssl rand -base64 48` and put it in `.env` |
| API can't connect to Mongo | Ensure the SSH tunnel (step 2) is running and `MONGO_URI=mongodb://localhost:27017` |
| API can't connect to MinIO | Ensure the SSH tunnel is running and `MINIO_ENDPOINT=localhost:9000` |
| Images don't show on website | Check `MINIO_PUBLIC_URL` points where the browser can reach MinIO; in dev that's `http://localhost:9000` |
| Admin login `401` | Wrong username/password, or `SEED_ADMIN` was false when the DB was empty — delete the `admins` collection and restart |
| Website shows static menu, not API data | `VITE_API_URL` is empty or the API is down — check the browser console for the `[menu] API unavailable` warning |
| Seeded images are placeholders | `SEED_IMAGES_DIR` not set, or the path is wrong — set it to `bergeerd_menu/src/assets` and reseed |
| Port 5173 / 8080 already in use | Change `PORT` in `bergeerd_api/.env` / Vite's port in `vite.config.ts` and update `VITE_API_URL`/`CORS_ORIGINS` |

---

## Security notes

- **Change the default admin password** (`ADMIN_PASSWORD`) before production.
- **Use a strong `JWT_SECRET`** (48+ random bytes) in production.
- MongoDB on the server currently runs **without auth** (inherited from the
  existing `sansyar` setup). Restrict network access accordingly.
- MinIO bucket `bergeerd` is created with an **anonymous-read** policy so the
  public website can load images without credentials. Writes require the
  `minioadmin` credentials (change these for production).
- CORS is configurable via `CORS_ORIGINS`; in production set it to only
  `https://bergeerd.ir`.
