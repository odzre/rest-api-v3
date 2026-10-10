import { sendResponse } from '../utils/response.util.js';
import { getGetContactConfig, setGetContactConfig, maskConfig } from '../services/config.service.js';

export const getConfig = async (_req, res, next) => {
  try {
    const stored = await getGetContactConfig();
    return sendResponse(res, 200, true, 'Konfigurasi GetContact.', maskConfig(stored));
  } catch (err) {
    next(err);
  }
};

export const updateConfig = async (req, res, next) => {
  try {
    const updated = await setGetContactConfig(req.body || {});
    const stored = await getGetContactConfig();
    return sendResponse(res, 200, true, 'Konfigurasi GetContact berhasil diperbarui.', maskConfig(stored));
  } catch (err) {
    next(err);
  }
};
