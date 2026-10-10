import { sendResponse } from '../utils/response.util.js';
import { getAdmin } from '../services/admin.service.js';
import { comparePassword } from '../utils/hash.util.js';
import { signAdminToken } from '../utils/jwt.util.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return sendResponse(res, 422, false, 'Email dan password wajib diisi.');
    }

    const admin = await getAdmin();
    if (!admin || !admin.email || admin.email !== email.toLowerCase()) {
      return sendResponse(res, 401, false, 'Email atau password salah.');
    }

    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) {
      return sendResponse(res, 401, false, 'Email atau password salah.');
    }

    const token = signAdminToken({ email: admin.email, role: 'admin' });
    return sendResponse(res, 200, true, 'Login admin berhasil.', { token });
  } catch (err) {
    next(err);
  }
};

export const me = (req, res) => {
  return sendResponse(res, 200, true, 'Admin authenticated.', {
    email: req.adminEmail,
    role: 'admin',
  });
};
