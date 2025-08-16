import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/marketplace.js';
import * as Marketplace from '../controllers/marketplaceController.js';

const router = express.Router();

router.post('/list', authRequired, Marketplace.create);
router.post('/buy/:id', authRequired, Marketplace.buy);
router.get('/', authRequired, Marketplace.list);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
