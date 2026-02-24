# Kullanıcı Yönetimi

Next.js, Prisma, PostgreSQL ve JWT ile kullanıcı yönetimi uygulaması. Giriş, dashboard, tekli/toplu kullanıcı ekleme ve Excel import.

## Gereksinimler

- [Docker](https://docs.docker.com/get-docker/) ve Docker Compose

## Kurulum (Docker)

```bash
git clone https://github.com/malibu61/next.git
cd next
docker compose up -d --build
docker compose run --rm app npx prisma migrate deploy
docker compose run --rm app npx prisma db seed
```

Tarayıcıda **http://localhost:3000** aç.

**Varsayılan giriş:** kullanıcı adı `admin`, şifre `admin`.

## İsteğe bağlı

- **JWT_SECRET:** Proje kökünde `.env` oluşturup `JWT_SECRET=...` yazabilirsin; yoksa `docker-compose` içindeki varsayılan kullanılır.
- **Yerel geliştirme (Docker olmadan):** PostgreSQL çalışır durumda olmalı. `.env` içinde `DATABASE_URL` ve isteğe bağlı `JWT_SECRET` tanımla, sonra `npm install`, `npx prisma migrate deploy`, `npx prisma db seed`, `npm run dev`.

## Routes

| Route | Açıklama |
|------|----------|
| `/` | Giriş sayfası |
| `/dashboard` | Kullanıcı listesi (sayfalama, yaş filtresi) |
| `/dashboard/add` | Yeni kullanıcı ekleme |
| `/dashboard/addmany` | Excel ile toplu kullanıcı ekleme |
| `/dashboard/[id]` | Kullanıcı detayı |

## Tech stack

Next.js, Node.js, Prisma, PostgreSQL, JWT, TailwindCSS, React Hook Form, TanStack React Query, Zod, Docker.
