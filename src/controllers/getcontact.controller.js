import { sendResponse } from '../utils/response.util.js';
import { createClientFromConfig, normPhone } from '../services/getcontact.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const phone = normPhone(req.query.phone);
    if (!phone) {
      return sendResponse(res, 422, false, 'Parameter "phone" wajib diisi.', null);
    }
    const client = await createClientFromConfig();
    const result = await client.search(phone);
    return sendResponse(res, 200, true, 'Profil kontak ditemukan.', result);
  } catch (err) {
    if (err.code === 'GETCONTACT_NOT_CONFIGURED') {
      return sendResponse(res, 503, false, err.message, { code: err.code });
    }
    if (err.statusCode === 502) {
      return sendResponse(res, 502, false, 'Gagal menghubungi server GetContact: ' + err.message, {
        code: 'PROVIDER_ERROR',
      });
    }
    next(err);
  }
};

export const getTag = async (req, res, next) => {
  try {
    const phone = normPhone(req.query.phone);
    if (!phone) {
      return sendResponse(res, 422, false, 'Parameter "phone" wajib diisi.', null);
    }
    const client = await createClientFromConfig();
    const result = await client.getTags(phone);
    return sendResponse(res, 200, true, 'Tag kontak ditemukan.', result);
  } catch (err) {
    if (err.code === 'GETCONTACT_NOT_CONFIGURED') {
      return sendResponse(res, 503, false, err.message, { code: err.code });
    }
    if (err.statusCode === 502) {
      return sendResponse(res, 502, false, 'Gagal menghubungi server GetContact: ' + err.message, {
        code: 'PROVIDER_ERROR',
      });
    }
    next(err);
  }
};
