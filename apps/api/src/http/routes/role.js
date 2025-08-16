import express from 'express';

import { authRequired, roleRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/role.js';
import * as Role from '../controllers/roleController.js';

const router = express.Router();

router.post('/add', authRequired, roleRequired('admin'), Role.postAdd);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
