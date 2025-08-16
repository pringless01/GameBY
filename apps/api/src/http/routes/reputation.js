import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/reputation.js';
import * as Reputation from '../controllers/reputationController.js';

const router = express.Router();

router.get('/history', authRequired, Reputation.getHistory);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
