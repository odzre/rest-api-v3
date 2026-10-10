import { Router } from 'express';
import { root } from '../controllers/public.controller.js';
import apiRoutes from './api.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/', root);
router.use('/api', apiRoutes);
router.use('/admin', adminRoutes);

export default router;
