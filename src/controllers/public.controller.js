import { sendResponse } from '../utils/response.util.js';

export const health = (_req, res) => {
  return sendResponse(res, 200, true, 'Server is running.', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const root = (_req, res) => {
  return sendResponse(res, 200, true, 'REST API is running. See /api/docs for documentation.', {
    docs: '/api/docs',
    health: '/api/health',
  });
};
