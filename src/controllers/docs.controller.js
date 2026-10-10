import { sendResponse } from '../utils/response.util.js';
import { generateDocs, generateAdminDocs } from '../services/docs.service.js';

export const getDocs = (_req, res) => {
  return res.status(200).json(generateDocs());
};

export const getAdminDocs = (_req, res) => {
  return sendResponse(res, 200, true, 'Dokumentasi endpoint admin (rahasia).', generateAdminDocs());
};
