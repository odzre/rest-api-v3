import { sendResponse } from '../utils/response.util.js';

export const notFound = (req, res) => {
  return sendResponse(res, 404, false, `Endpoint ${req.method} ${req.path} tidak ditemukan.`);
};

export const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err);
  const statusCode = err.statusCode || 500;
  return sendResponse(res, statusCode, false, err.message || 'Internal server error.');
};
