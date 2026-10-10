import { sendResponse } from '../utils/response.util.js';
import {
  createApiKey,
  listApiKeys,
  getApiKeyById,
  revokeApiKey,
  activateApiKey,
  updateApiKeyExpiry,
  deleteApiKey,
} from '../services/apikey.service.js';

export const create = async (req, res, next) => {
  try {
    const { name, nomor, expiresAt, expired, type } = req.body || {};
    const created = await createApiKey({
      name,
      nomor,
      type: type === 'admin' ? 'admin' : 'user',
      expiresAt,
      expiresInDays: expired,
      createdBy: req.adminEmail,
    });
    return sendResponse(res, 201, true, 'API key berhasil dibuat. Simpan key ini, hanya ditampilkan sekali.', created);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const keys = await listApiKeys();
    return sendResponse(res, 200, true, 'Daftar API key.', keys);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const rec = await getApiKeyById(req.params.id);
    if (!rec) return sendResponse(res, 404, false, 'API key tidak ditemukan.');
    return sendResponse(res, 200, true, 'Detail API key.', rec);
  } catch (err) {
    next(err);
  }
};

export const revoke = async (req, res, next) => {
  try {
    const result = await revokeApiKey(req.params.id);
    if (!result) return sendResponse(res, 404, false, 'API key tidak ditemukan.');
    return sendResponse(res, 200, true, 'API key berhasil dicabut (revoked).');
  } catch (err) {
    next(err);
  }
};

export const activate = async (req, res, next) => {
  try {
    const result = await activateApiKey(req.params.id);
    if (!result) return sendResponse(res, 404, false, 'API key tidak ditemukan.');
    return sendResponse(res, 200, true, 'API key berhasil diaktifkan kembali.');
  } catch (err) {
    next(err);
  }
};

export const updateExpiry = async (req, res, next) => {
  try {
    const { expiresAt } = req.body || {};
    const result = await updateApiKeyExpiry(req.params.id, expiresAt);
    if (!result) return sendResponse(res, 404, false, 'API key tidak ditemukan.');
    return sendResponse(res, 200, true, 'Masa aktif API key berhasil diperbarui.', {
      id: result.id,
      expiresAt: result.expiresAt || null,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteApiKey(req.params.id);
    if (!result) return sendResponse(res, 404, false, 'API key tidak ditemukan.');
    return sendResponse(res, 200, true, 'API key berhasil dihapus permanen.');
  } catch (err) {
    next(err);
  }
};
