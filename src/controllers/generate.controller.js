import { sendResponse } from '../utils/response.util.js';

export const generateImage = (req, res) => {
  const { prompt } = req.body || {};
  return sendResponse(res, 501, false, 'Image generation belum dikonfigurasi. Hubungi admin.', {
    code: 'PROVIDER_NOT_CONFIGURED',
    hint: 'Endpoint ini siap digunakan. Provider image generation belum di-set oleh admin.',
    receivedPrompt: prompt || null,
  });
};
