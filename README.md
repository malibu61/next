# Next.js Kullanıcı Yönetimi

Next.js ile kullanıcı yönetimi (giriş, liste, tekli/toplu ekleme, Excel import). PostgreSQL + Prisma + Docker.

## Çalıştırma

```bash
git clone https://github.com/malibu61/next.git
cd next
docker compose up -d --build
docker compose run --rm app npx prisma migrate deploy```

Tarayıcıda **http://localhost:3000** aç.

İsteğe bağlı: `JWT_SECRET` için proje kökünde `.env` oluşturup `JWT_SECRET=...` yaz; yoksa varsayılan kullanılır.
