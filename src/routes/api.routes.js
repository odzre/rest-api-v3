import { Router } from 'express';
import { health, root } from '../controllers/public.controller.js';
import { getDocs } from '../controllers/docs.controller.js';
import { me } from '../controllers/me.controller.js';
import { generateImage } from '../controllers/generate.controller.js';
import { getProfile, getTag } from '../controllers/getcontact.controller.js';
import { sendVerification, verifyAccount } from '../controllers/alightmotion.controller.js';
import { requireApiKey, requireAdminApiKey } from '../middlewares/apiKey.middleware.js';
import { createKey, cekKey } from '../controllers/adminApi.controller.js';

const router = Router();

// Public
router.get('/health', health);
router.get('/docs', getDocs);

// API key protected (user)
router.get('/me', requireApiKey, me);
router.post('/generate-image', requireApiKey, generateImage);
router.get('/get-contact/profile', requireApiKey, getProfile);
router.get('/get-contact/tag', requireApiKey, getTag);
router.get('/alight-motion/send', requireApiKey, sendVerification);
router.get('/alight-motion/verif', requireApiKey, verifyAccount);

// Hidden admin endpoints (tidak ada di /api/docs publik)
router.post('/admin/create-key', requireAdminApiKey, createKey);
router.post('/admin/cek-key', requireAdminApiKey, cekKey);

export default router;
