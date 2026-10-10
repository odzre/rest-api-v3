# payment-api-platform

REST API sederhana dengan dashboard admin untuk mengelola API key ber masa aktif. Tanpa payment gateway, tanpa halaman user — user API hanya menerima respons JSON.

- **Express.js** + ES Modules
- **Upstash Redis** sebagai database (serverless-friendly, kompatibel Vercel)
- Autentikasi admin: email + password (JWT)
- API key dengan masa aktif (expiry per key), revoke/activate/delete
- Endpoint `/api/docs` berisi dokumentasi API dalam JSON

## Endpoint API (untuk user)

| Method | Path | Proteksi | Deskripsi |
|--------|------|----------|-----------|
| GET | `/api/health` | Public | Status server |
| GET | `/api/docs` | Public | Dokumentasi API (JSON) |
| GET | `/api/me` | `X-API-Key` | Info API key yang dipakai (status, masa aktif) |
| POST | `/api/generate-image` | `X-API-Key` | Endpoint contoh (provider belum dikonfigurasi) |

### Contoh request

```bash
curl -X POST https://your-app.vercel.app/api/generate-image \
  -H "X-API-Key: sk_xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "kucing astronaut"}'
```

### Format error

```json
{
  "success": false,
  "statusCode": 403,
  "message": "API key sudah kedaluwarsa. Hubungi admin untuk perpanjang.",
  "data": { "code": "EXPIRED_API_KEY" },
  "timestamp": "..."
}
```

## Dashboard Admin

- `/admin/login` — halaman login admin
- `/admin` — dashboard kelola API key (buat, revoke, activate, delete, lihat expiry)

Endpoint internal admin (Bearer JWT):

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/admin/login` | Login admin → JWT |
| GET | `/admin/api/me` | Info admin |
| POST | `/admin/api/keys` | Buat API key (key hanya tampil sekali) |
| GET | `/admin/api/keys` | List semua key |
| GET | `/admin/api/keys/:id` | Detail key |
| PATCH | `/admin/api/keys/:id/revoke` | Cabut key |
| PATCH | `/admin/api/keys/:id/activate` | Aktifkan ulang |
| PATCH | `/admin/api/keys/:id/expiry` | Update masa aktif `{ "expiresAt": "ISO" }` |
| DELETE | `/admin/api/keys/:id` | Hapus permanen |

## Setup

### 1. Prasyarat

- Node.js >= 18
- Akun [Upstash](https://upstash.com/) — buat database Redis, salin REST URL & token

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env
```

Isi `.env`:

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
JWT_SECRET=random-secret-string
JWT_EXPIRES_IN=7d
PORT=3000
```

### 4. Buat akun admin (sekali saja)

```bash
npm run setup-admin
```

### 5. Jalankan lokal

```bash
npm run dev
```

- Dashboard admin: `http://localhost:3000/admin`
- Docs API: `http://localhost:3000/api/docs`

## Deploy ke Vercel

1. Push project ke GitHub.
2. Import repo di [vercel.com](https://vercel.com/).
3. Tambahkan environment variables di Vercel:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Deploy.
5. Setelah deploy, jalankan sekali dari lokal (tetap konek ke Redis Upstash yang sama):

```bash
npm run setup-admin
```

## Redis Schema

```
admin                      -> hash { email, passwordHash, createdAt }
apikey:{id}                -> hash { id, hashedKey, name, active, createdBy, createdAt, expiresAt }
apikey:hash:{hashedKey}    -> {id}   (index hash → id, untuk verifikasi cepat)
apikeys:list               -> set of {id}
```

API key disimpan sebagai hash SHA-256 — nilai aslinya hanya ditampilkan sekali saat dibuat oleh admin.

## Lisensi

MIT
