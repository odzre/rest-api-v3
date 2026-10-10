import { sendResponse } from '../utils/response.util.js';
import AlightMotionAuth from '../services/alightmotion.service.js';

const amAuth = new AlightMotionAuth();

export const sendVerification = async (req, res, next) => {
  try {
    const email = (req.query.email || '').trim();
    if (!email) {
      return sendResponse(res, 422, false, 'Parameter "email" wajib diisi.', null);
    }

    const result = await amAuth.sendMagicLink(email);

    if (result.success) {
      return sendResponse(res, 200, true, result.message || 'Link verifikasi berhasil dikirim.', {
        email,
        instruksi:
          'Cek kotak masuk atau spam email Anda. Salin link verifikasi yang diterima dari Alight Motion dan gunakan pada endpoint /api/alight-motion/verif.',
      });
    }
    return sendResponse(res, 400, false, result.error || 'Gagal mengirim verifikasi.', null);
  } catch (err) {
    next(err);
  }
};

export const verifyAccount = async (req, res, next) => {
  try {
    const email = (req.query.email || '').trim();
    const link = (req.query.link || '').trim();
    if (!email) {
      return sendResponse(res, 422, false, 'Parameter "email" wajib diisi.', null);
    }
    if (!link) {
      return sendResponse(res, 422, false, 'Parameter "link" wajib diisi (link verifikasi dari email).', null);
    }

    const verifResult = await amAuth.verifyAndFetchProfile(email, link);
    if (!verifResult.success) {
      return sendResponse(res, 400, false, verifResult.error || 'Verifikasi gagal.', null);
    }

    const premiumResult = await amAuth.applyPremium(verifResult.idToken);
    if (!premiumResult.success) {
      return sendResponse(res, 400, false, premiumResult.error || 'Gagal mengaktifkan premium.', null);
    }

    return sendResponse(res, 200, true, 'Verifikasi berhasil! Akun premium telah diaktifkan.', {
      email,
      duration: '1 Year',
      orderId: premiumResult.codeorder,
      instruksi:
        'Akun Anda sekarang sudah berstatus Premium. Silakan login ke aplikasi Alight Motion menggunakan email tersebut atau refresh jika sudah login.',
    });
  } catch (err) {
    next(err);
  }
};
