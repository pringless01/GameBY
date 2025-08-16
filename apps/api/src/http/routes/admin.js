import express from 'express';

import { authRequired, roleRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/admin.js';
import * as Admin from '../controllers/adminController.js';

const router = express.Router();

router.get('/audit', authRequired, roleRequired('admin'), Admin.getAudit);
router.post('/fraud/flag', authRequired, roleRequired('admin'), Admin.postFraudFlag);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
