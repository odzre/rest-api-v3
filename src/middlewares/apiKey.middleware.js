import { verifyApiKey } from '../services/apikey.service.js';
import { sendResponse } from '../utils/response.util.js';

const statusMap = {
  MISSING_API_KEY: { statusCode: 401, message: 'API key diperlukan. Gunakan header: X-API-Key <key>' },
  INVALID_API_KEY: { statusCode: 403, message: 'API key tidak valid.' },
  EXPIRED_API_KEY: { statusCode: 403, message: 'API key sudah kedaluwarsa. Hubungi admin untuk perpanjang.' },
  REVOKED_API_KEY: { statusCode: 403, message: 'API key sudah dicabut dan tidak bisa digunakan lagi.' },
};

const rejectInvalid = (res, reason) => {
  const mapped = statusMap[reason] || { statusCode: 403, message: 'API key tidak valid.' };
  return sendResponse(res, mapped.statusCode, false, mapped.message, { code: reason });
};

export const requireApiKey = async (req, res, next) => {
  try {
    const rawKey = req.headers['x-api-key'];
    const result = await verifyApiKey(rawKey);

    if (!result.valid) return rejectInvalid(res, result.reason);

    if ((result.rec.type || 'user') === 'admin') {
      return sendResponse(res, 403, false, 'API key admin tidak dapat mengakses endpoint user.', {
        code: 'ADMIN_KEY_FORBIDDEN',
      });
    }

    req.apiKeyId = result.id;
    req.apiKeyRecord = result.rec;
    next();
  } catch (err) {
    return sendResponse(res, 500, false, 'Gagal memverifikasi API key: ' + err.message);
  }
};

export const requireAdminApiKey = async (req, res, next) => {
  try {
    const rawKey = req.headers['x-api-key'];
    const result = await verifyApiKey(rawKey);

    if (!result.valid) return rejectInvalid(res, result.reason);

    if ((result.rec.type || 'user') !== 'admin') {
      return sendResponse(res, 403, false, 'Endpoint ini hanya untuk API key admin.', {
        code: 'ADMIN_KEY_REQUIRED',
      });
    }

    req.apiKeyId = result.id;
    req.apiKeyRecord = result.rec;
    next();
  } catch (err) {
    return sendResponse(res, 500, false, 'Gagal memverifikasi API key: ' + err.message);
  }
};
