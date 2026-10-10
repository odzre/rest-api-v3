import { Router } from 'express';
import { loginPage, dashboardPage } from '../views/admin.views.js';
import { adminDocsPage } from '../views/adminDocs.views.js';
import { login, me } from '../controllers/adminAuth.controller.js';
import { requireAdmin } from '../middlewares/adminAuth.middleware.js';
import {
  create, list, getOne, revoke, activate, updateExpiry, remove,
} from '../controllers/adminApikey.controller.js';
import { getConfig, updateConfig } from '../controllers/adminConfig.controller.js';
import { getAdminDocs } from '../controllers/docs.controller.js';

const router = Router();

// Pages
router.get('/login', loginPage);
router.get('/', dashboardPage);
router.get('/docs', adminDocsPage);

// Auth
router.post('/login', login);
router.get('/api/me', requireAdmin, me);

// Admin docs (hidden endpoints)
router.get('/api/docs', requireAdmin, getAdminDocs);

// API Keys management
router.post('/api/keys', requireAdmin, create);
router.get('/api/keys', requireAdmin, list);
router.get('/api/keys/:id', requireAdmin, getOne);
router.patch('/api/keys/:id/revoke', requireAdmin, revoke);
router.patch('/api/keys/:id/activate', requireAdmin, activate);
router.patch('/api/keys/:id/expiry', requireAdmin, updateExpiry);
router.delete('/api/keys/:id', requireAdmin, remove);

// GetContact config
router.get('/api/config/getcontact', requireAdmin, getConfig);
router.put('/api/config/getcontact', requireAdmin, updateConfig);

export default router;
