import { sendResponse } from '../utils/response.util.js';
import { createApiKey, checkApiKeys, normPhoneId } from '../services/apikey.service.js';

export const createKey = async (req, res, next) => {
  try {
    const { nama, nomor, expired } = req.body || {};

    if (!nama || !String(nama).trim()) {
      return sendResponse(res, 422, false, 'Payload "nama" wajib diisi.', null);
    }

    const normalizedPhone = normPhoneId(nomor);
    if (!normalizedPhone) {
      return sendResponse(res, 422, false, 'Payload "nomor" wajib diisi (nomor HP valid).', null);
    }

    if (expired === undefined || expired === null || String(expired).trim() === '') {
      return sendResponse(res, 422, false, 'Payload "expired" wajib diisi (jumlah hari, 1 = 24 jam).', null);
    }

    const days = Number(expired);
    if (isNaN(days) || days <= 0) {
      return sendResponse(res, 422, false, 'Payload "expired" harus berupa angka > 0 (jumlah hari).', null);
    }

    const created = await createApiKey({
      name: String(nama).trim(),
      nomor: normalizedPhone,
      expiresInDays: days,
      createdBy: `adminkey:${req.apiKeyId}`,
    });

    return sendResponse(res, 201, true, 'API key berhasil dibuat. Simpan key ini, hanya ditampilkan sekali.', created);
  } catch (err) {
    next(err);
  }
};

export const cekKey = async (req, res, next) => {
  try {
    const { keys } = req.body || {};

    if (!Array.isArray(keys) || keys.length === 0) {
      return sendResponse(res, 422, false, 'Payload "keys" wajib berupa array API key (min. 1).', null);
    }

    if (keys.length > 100) {
      return sendResponse(res, 422, false, 'Maksimal 100 key per request.', null);
    }

    const results = await checkApiKeys(keys);
    const summary = {
      total: results.length,
      aktif: results.filter((r) => r.valid).length,
      tidakAktif: results.filter((r) => !r.valid).length,
    };

    return sendResponse(res, 200, true, 'Hasil pengecekan API key.', { summary, results });
  } catch (err) {
    next(err);
  }
};
