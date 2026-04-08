# SIMRS Monorepo

Monorepo SIMRS (Sistem Informasi Manajemen Rumah Sakit) berbasis:

- Next.js App Router (frontend)
- NestJS (backend API)
- Prisma + PostgreSQL
- Redis
- MinIO (object storage)
- pnpm workspace + Turborepo

## Struktur Singkat

```text
apps/
  backend/        NestJS API (auth, RBAC, pasien, dokter, antrian, billing, file)
  frontend/       Next.js web app (dashboard + modul operasional)
packages/
  db/             Prisma schema, migration, seed, db package (@simrs/db)
  eslint-config/  Shared lint config
  tsconfig/       Shared tsconfig preset
docker-compose.yml
```

## Prasyarat

- Node.js 20 atau lebih baru
- pnpm 9 atau lebih baru
- Docker Desktop (dengan Docker Compose)

## Setup Lokal (Pertama Kali)

1. Install dependency workspace.

```bash
pnpm install
```

2. Siapkan file environment.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env.local
Copy-Item packages/db/.env.example packages/db/.env
```

Linux/macOS:

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
cp packages/db/.env.example packages/db/.env
```

3. Jalankan service infrastruktur.

```bash
pnpm docker:up
```

4. Inisialisasi database.

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. Jalankan backend dan frontend.

```bash
pnpm dev
```

## Endpoint Default

- Frontend: http://localhost:3000
- Backend API root: http://localhost:4000/v1
- Swagger: http://localhost:4000/docs
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

## Endpoint Klinis Baru (Backend)

Modul baru untuk menyesuaikan alur pada referensi database:

- Laboratorium
  - `GET /v1/laboratory/orders/dashboard/summary?date=YYYY-MM-DD`
  - `GET /v1/laboratory/orders`
  - `GET /v1/laboratory/orders/:id`
  - `POST /v1/laboratory/orders`
  - `PUT /v1/laboratory/orders/:id/status`
  - `POST /v1/laboratory/orders/:id/results`
- Radiologi
  - `GET /v1/radiology/orders/dashboard/summary?date=YYYY-MM-DD`
  - `GET /v1/radiology/orders`
  - `GET /v1/radiology/orders/:id`
  - `POST /v1/radiology/orders`
  - `PUT /v1/radiology/orders/:id/status`
  - `POST /v1/radiology/orders/:id/results`

Permission yang dipakai endpoint baru:

- Laboratorium: `laboratory.read`, `laboratory.write`
- Radiologi: `radiology.read`, `radiology.write`

## Kredensial Seed (Login API)

Semua user seed menggunakan password yang sama:

- Password: `Admin123!`

Daftar akun:

- Admin: `admin@simrs.local`
- Dokter: `doctor@simrs.local`
- Kasir: `cashier@simrs.local`
- Staff: `staff.rina@simrs.local`
- Apoteker: `apoteker.maya@simrs.local`
- Radiologi: `radiologi.eko@simrs.local`
- Laboratorium: `lab.tuti@simrs.local`
- Pasien Portal: `pasien.andi@simrs.local`

Contoh login ke API:

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "admin@simrs.local",
  "password": "Admin123!"
}
```

## Perintah Harian

```bash
# Development
pnpm dev
pnpm dev:backend
pnpm dev:frontend

# Quality checks
pnpm lint
pnpm typecheck
pnpm build

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:dev
pnpm db:seed

# Docker infra
pnpm docker:up
pnpm docker:down
```

## Jalankan Mode Production Lokal

```bash
pnpm build
pnpm --filter @simrs/backend start
pnpm --filter @simrs/frontend start
```

## Catatan Troubleshooting

### 1) Prisma error lock file di Windows (EPERM rename query engine)

Biasanya terjadi jika ada proses Node/Nest/Next lama yang masih aktif dan mengunci file Prisma engine.

Solusi:

1. Hentikan proses backend/frontend yang masih berjalan.
2. Jalankan ulang:

```bash
pnpm db:generate
```

### 2) Migrasi gagal karena state DB lokal tidak sinkron

Jika skema lokal sudah terisi manual, gunakan salah satu pendekatan:

```bash
# Aman untuk development baru
pnpm db:migrate:dev

# Atau reset total volume database
pnpm docker:down
docker volume rm simrs_postgres_data
pnpm docker:up
pnpm db:migrate
pnpm db:seed
```

### 3) Status MinIO unhealthy

Project ini sudah memakai healthcheck `mc ready local` di Docker Compose. Jika masih belum sehat, cek log:

```bash
docker logs simrs-minio
```

