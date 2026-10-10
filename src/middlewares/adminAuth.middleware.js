import { verifyAdminToken } from '../utils/jwt.util.js';
import { getAdmin } from '../services/admin.service.js';
import { sendResponse } from '../utils/response.util.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (!token || scheme.toLowerCase() !== 'bearer') {
      return sendResponse(res, 401, false, 'Token admin tidak ditemukan. Gunakan header: Authorization: Bearer <token>');
    }

    let decoded;
    try {
      decoded = verifyAdminToken(token);
    } catch (err) {
      return sendResponse(res, 401, false, 'Token admin tidak valid atau sudah kedaluwarsa.');
    }

    const admin = await getAdmin();
    if (!admin || !admin.email || decoded.email !== admin.email) {
      return sendResponse(res, 401, false, 'Token admin tidak valid.');
    }

    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    return sendResponse(res, 500, false, 'Gagal memverifikasi token admin: ' + err.message);
  }
};
