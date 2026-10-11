export const generateAdminDocs = () => {
  return {
    name: 'REST API Platform — Endpoint Admin',
    version: '1.0.0',
    description:
      'Dokumentasi endpoint khusus admin. Endpoint ini TIDAK ditampilkan di /api/docs publik — hanya admin yang mengetahuinya.',
    authentication: {
      type: 'API Key Admin',
      header: 'X-API-Key',
      description:
        'Hanya API key bertipe admin yang dapat mengakses endpoint ini. Key admin dibuat dari dashboard admin (centang "Key admin" saat membuat key). Key admin TIDAK dapat mengakses endpoint user, dan key user TIDAK dapat mengakses endpoint ini.',
      example: 'X-API-Key: skadm_xxxxxxxxxxxxxxxxxxxxxxxx',
    },
    endpoints: [
      {
        method: 'POST',
        path: '/api/admin/create-key',
        auth: 'X-API-Key (admin)',
        description: 'Membuat API key user baru. Nomor HP otomatis dinormalisasi ke format 08xx.',
        payload: {
          nama: 'string (wajib) — Nama pemilik key',
          nomor: 'string (wajib) — Nomor HP. Otomatis dikonversi ke format 08xx (contoh: "+62 812-3456-789" atau "628123456789" menjadi "08123456789")',
          expired: 'integer (wajib) — Masa aktif dalam hari. 1 = 1 hari (24 jam) sejak key dibuat. Contoh: 30 = 30 hari',
        },
        exampleRequest: {
          nama: 'Andika',
          nomor: '+62 812-3456-789',
          expired: 30,
        },
        exampleResponse: {
          success: true,
          statusCode: 201,
          message: 'API key berhasil dibuat. Simpan key ini, hanya ditampilkan sekali.',
          data: {
            id: 'k_1791600000000_abc123',
            key: 'sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            name: 'Andika',
            nomor: '08123456789',
            type: 'user',
            expiresAt: '2026-11-09T07:00:00.000Z',
            createdAt: '2026-10-10T07:00:00.000Z',
          },
          timestamp: '2026-10-10T07:00:00.000Z',
        },
      },
      {
        method: 'POST',
        path: '/api/admin/cek-key',
        auth: 'X-API-Key (admin)',
        description: 'Cek status dan masa aktif satu atau beberapa API key sekaligus (maks. 100 key per request).',
        payload: {
          keys: 'array of string (wajib) — Daftar API key yang ingin dicek. Contoh: ["sk_aaa...", "sk_bbb..."]',
        },
        exampleRequest: {
          keys: ['sk_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'sk_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'],
        },
        exampleResponse: {
          success: true,
          statusCode: 200,
          message: 'Hasil pengecekan API key.',
          data: {
            summary: { total: 2, aktif: 1, tidakAktif: 1 },
            results: [
              {
                key: 'sk_aaa...',
                id: 'k_1',
                name: 'Andika',
                nomor: '08123456789',
                type: 'user',
                valid: true,
                status: 'active',
                sisaHari: 29,
                expiresAt: '2026-11-09T07:00:00.000Z',
                createdAt: '2026-10-10T07:00:00.000Z',
              },
              {
                key: 'sk_bbb...',
                id: 'k_2',
                name: 'Budi',
                nomor: '08987654321',
                type: 'user',
                valid: false,
                status: 'expired',
                expiresAt: '2026-10-05T07:00:00.000Z',
                createdAt: '2026-10-04T07:00:00.000Z',
              },
            ],
          },
          timestamp: '2026-10-10T07:00:00.000Z',
        },
      },
    ],
    statusValues: {
      active: 'Key valid, aktif, dan belum kedaluwarsa. Field sisaHari berisi sisa hari.',
      expired: 'Key sudah melewati masa aktif (kedaluwarsa).',
      revoked: 'Key sudah dicabut oleh admin.',
      invalid: 'Key tidak ditemukan di sistem.',
    },
    errorResponses: {
      MISSING_API_KEY: { statusCode: 401, message: 'API key diperlukan. Gunakan header: X-API-Key <key>' },
      INVALID_API_KEY: { statusCode: 403, message: 'API key tidak valid.' },
      EXPIRED_API_KEY: { statusCode: 403, message: 'API key sudah kedaluwarsa. Hubungi admin untuk perpanjang.' },
      REVOKED_API_KEY: { statusCode: 403, message: 'API key sudah dicabut dan tidak bisa digunakan lagi.' },
      ADMIN_KEY_REQUIRED: { statusCode: 403, message: 'Endpoint ini hanya untuk API key admin.' },
    },
  };
};

export const generateDocs = () => {
  const baseUrl = process.env.BASE_URL || 'https://your-app.vercel.app';

  return {
    name: 'REST API Platform',
    version: '1.0.0',
    description: 'REST API sederhana dengan autentikasi API key ber masa aktif. Dashboard admin tersedia untuk mengelola API key.',
    baseUrl,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      description: 'Semua endpoint (kecuali /api/health dan /api/docs) memerlukan API key. Sertakan pada header request.',
      example: 'X-API-Key: sk_xxxxxxxxxxxxxxxxxxxxxxxx',
    },
    apiKeyStatus: {
      active: 'API key valid dan belum kedaluwarsa.',
      expired: 'API key sudah melewati tanggal kedaluwarsa. Hubungi admin untuk perpanjang.',
      revoked: 'API key sudah dicabut oleh admin dan tidak bisa digunakan lagi.',
    },
    endpoints: [
      {
        method: 'GET',
        path: '/api/health',
        auth: null,
        description: 'Cek status server.',
        response: {
          success: true,
          statusCode: 200,
          message: 'Server is running.',
          data: { status: 'ok', uptime: 123.45 },
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
      {
        method: 'GET',
        path: '/api/docs',
        auth: null,
        description: 'Dokumentasi API ini.',
      },
      {
        method: 'GET',
        path: '/api/me',
        auth: 'X-API-Key',
        description: 'Cek status API key yang digunakan, termasuk masa aktif dan kedaluwarsa.',
        response: {
          success: true,
          statusCode: 200,
          message: 'API key is valid.',
          data: {
            id: 'k_1791619061016_fix1q7',
            name: 'Andika',
            nomor: '08123456789',
            type: 'user',
            active: true,
            expiresAt: '2026-11-09T07:57:58.986Z',
            createdAt: '2026-10-10T07:57:58.986Z',
          },
          timestamp: '2026-10-10T08:00:00.000Z',
        },
      },
      {
        method: 'POST',
        path: '/api/generate-image',
        auth: 'X-API-Key',
        description: 'Endpoint untuk generate image (contoh). Provider belum dikonfigurasi.',
        requestBody: {
          prompt: 'string - Deskripsi gambar yang ingin dibuat',
        },
        response: {
          success: false,
          statusCode: 501,
          message: 'Provider belum dikonfigurasi.',
          data: null,
          timestamp: '2026-01-01T00:00:00.000Z',
        },
      },
      {
        method: 'GET',
        path: '/api/get-contact/profile',
        auth: 'X-API-Key',
        description: 'Cari profil kontak GetContact berdasarkan nomor telepon.',
        query: {
          phone: 'string (wajib) - Nomor telepon, misal: 08123456789 atau +628123456789',
        },
        example: 'GET /api/get-contact/profile?phone=083162065090',
        response: {
          success: true,
          statusCode: 200,
          message: 'Profil kontak ditemukan.',
          data: {
            meta: { requestId: '6zjh-REQ-6ac9f67fe00a', httpStatusCode: 200 },
            result: {
              profile: {
                name: null,
                surname: null,
                phoneNumber: '+6283162065090',
                displayNumber: '+62 831-6206-5090',
                countryCode: 'ID',
                displayName: 'Andika Putea',
                tagCount: 5,
                profileImage: 'https://s3-v2.cdngtc.com/profile_img_v2_xxx.png',
                email: null,
                trustScore: null,
              },
              badge: 'premium',
              spamInfo: { type: null, degree: 'green' },
              limitedResult: false,
            },
          },
          timestamp: '2026-10-10T08:30:00.000Z',
        },
      },
      {
        method: 'GET',
        path: '/api/get-contact/tag',
        auth: 'X-API-Key',
        description: 'Cari tag/tagar GetContact berdasarkan nomor telepon.',
        query: {
          phone: 'string (wajib) - Nomor telepon, misal: 08123456789 atau +628123456789',
        },
        example: 'GET /api/get-contact/tag?phone=083162065090',
        response: {
          success: true,
          statusCode: 200,
          message: 'Tag kontak ditemukan.',
          data: {
            meta: { requestId: 'dmff-REQ-6ac9f68586901', httpStatusCode: 200 },
            result: {
              tags: [
                { tag: 'Dika | Www.odzre.shop', count: 2, isNew: false, removable: true, askReason: true },
                { tag: 'Odzreshop | Jadi Bot & Topup', count: 1, isNew: false, removable: true, askReason: true },
              ],
              deletedTags: [],
              deletedTagCount: 0,
              subscriptionInfo: {
                isPro: true,
                proStats: true,
                proAds: true,
                proWho: true,
                proTelco: true,
              },
            },
          },
          timestamp: '2026-10-10T08:30:00.000Z',
        },
      },
      {
        method: 'GET',
        path: '/api/alight-motion/send',
        auth: 'X-API-Key',
        description: 'Kirim link verifikasi (magic link) Alight Motion ke email pengguna.',
        query: {
          email: 'string (wajib) - Email yang terdaftar / akan didaftarkan di Alight Motion',
        },
        example: 'GET /api/alight-motion/send?email=user@example.com',
        response: {
          success: true,
          statusCode: 200,
          message: 'Link berhasil dikirim.',
          data: {
            email: 'user@example.com',
            instruksi:
              'Cek kotak masuk atau spam email Anda. Salin link verifikasi yang diterima dari Alight Motion dan gunakan pada endpoint /api/alight-motion/verif.',
          },
          timestamp: '2026-10-10T08:32:22.847Z',
        },
      },
      {
        method: 'GET',
        path: '/api/alight-motion/verif',
        auth: 'X-API-Key',
        description:
          'Verifikasi link dari email, lalu aktifkan premium Alight Motion (1 tahun) pada akun tersebut.',
        query: {
          email: 'string (wajib) - Email yang sama dengan saat memanggil /send',
          link: 'string (wajib) - Link verifikasi lengkap yang diterima dari email Alight Motion (berisi parameter oobCode)',
        },
        example: 'GET /api/alight-motion/verif?email=user@example.com&link=https://...oobCode=xxx',
        response: {
          success: true,
          statusCode: 200,
          message: 'Verifikasi berhasil! Akun premium telah diaktifkan.',
          data: {
            email: 'user@example.com',
            duration: '1 Year',
            orderId: '48271',
            instruksi:
              'Akun Anda sekarang sudah berstatus Premium. Silakan login ke aplikasi Alight Motion menggunakan email tersebut atau refresh jika sudah login.',
          },
          timestamp: '2026-10-10T08:32:22.847Z',
        },
      },
    ],
    errorResponses: {
      MISSING_API_KEY: {
        statusCode: 401,
        message: 'API key diperlukan. Gunakan header: X-API-Key <key>',
      },
      INVALID_API_KEY: {
        statusCode: 403,
        message: 'API key tidak valid.',
      },
      EXPIRED_API_KEY: {
        statusCode: 403,
        message: 'API key sudah kedaluwarsa. Hubungi admin untuk perpanjang.',
      },
      REVOKED_API_KEY: {
        statusCode: 403,
        message: 'API key sudah dicabut dan tidak bisa digunakan lagi.',
      },
      GETCONTACT_NOT_CONFIGURED: {
        statusCode: 503,
        message: 'GetContact belum dikonfigurasi. Admin harus memasang finalKey & token terlebih dahulu.',
      },
      PROVIDER_ERROR: {
        statusCode: 502,
        message: 'Gagal menghubungi server GetContact.',
      },
    },
    admin: {
      dashboard: '/admin',
      login: '/admin/login',
      description: 'Dashboard admin untuk mengelola API key (create, revoke, activate, extend, delete).',
    },
  };
};
