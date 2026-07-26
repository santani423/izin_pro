# CMS Corporate IzinPro

Aplikasi CMS corporate berbasis Next.js, Prisma, Better Auth, dan MySQL/MariaDB untuk panel admin serta landing page publik.

## Prasyarat

Sebelum memulai, pastikan perangkat sudah memiliki:

- Node.js 20+ (disarankan LTS)
- npm 10+
- MySQL/MariaDB lokal yang sudah berjalan
- SMTP server untuk fitur reset password (opsional untuk tahap awal, tetapi disarankan)

## 1. Clone dan install dependensi

```bash
git clone <repo-url>
cd cms-corporate
npm install
```

## 2. Siapkan file environment

Buat file `.env` berdasarkan template berikut:

```bash
cp .env.example .env
```

Isi nilai di dalam `.env` dengan konfigurasi lokal Anda:

```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/izinpro"
BETTER_AUTH_SECRET="ganti-dengan-string-random"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@example.com"

CRON_SECRET="ganti-dengan-string-random"
```

Catatan:
- Pastikan database `izinpro` sudah ada di MySQL/MariaDB sebelum menjalankan migrasi.
- Jika Anda memakai XAMPP, biasanya MySQL berjalan di `127.0.0.1:3306`.
- Untuk pengembangan lokal, nilai SMTP bisa disamakan dengan akun mail provider atau layanan seperti Mailtrap.

## 3. Siapkan database

Jalankan perintah berikut untuk generate client Prisma, membuat tabel, dan menyiapkan data awal:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Perintah `db seed` akan membuat akun admin awal untuk login ke panel admin.

Akun default yang dibuat oleh seed:

- Email: `admin@izinpro.co.id`
- Password: `admin123`

## 4. Jalankan aplikasi di mode development

```bash
npm run dev
```

Buka browser ke:

- Frontend publik: http://localhost:3000
- Login admin: http://localhost:3000/admin/login

## 5. Build untuk produksi

Sebelum deploy, lakukan build terlebih dahulu:

```bash
npm run build
```

Jika build berhasil, jalankan aplikasi produksi dengan:

```bash
npm run start
```

## 6. Lint (opsional)

```bash
npm run lint
```

## Troubleshooting umum

- Jika Prisma error terkait koneksi database, cek lagi nilai `DATABASE_URL` dan pastikan MySQL/MariaDB sedang berjalan.
- Jika login admin tidak bisa berjalan, cek apakah `npx prisma db seed` sudah berhasil dijalankan.
- Jika reset password tidak mengirim email, cek konfigurasi SMTP di `.env`.

## Struktur singkat proyek

- `src/app` → route aplikasi Next.js (publik dan panel admin)
- `src/lib` → konfigurasi auth, database, mailer, dan helper bisnis
- `prisma` → schema database dan seed data
