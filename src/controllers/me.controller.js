import { sendResponse } from '../utils/response.util.js';

export const me = (req, res) => {
  const rec = req.apiKeyRecord;
  return sendResponse(res, 200, true, 'API key is valid.', {
    id: rec.id,
    name: rec.name,
    nomor: rec.nomor || null,
    type: rec.type || 'user',
    active: String(rec.active) === '1',
    expiresAt: rec.expiresAt || null,
    createdAt: rec.createdAt,
  });
};
