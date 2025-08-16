import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/activity.js';
import * as Activity from '../controllers/activityController.js';

const router = express.Router();

router.post('/chop-wood', authRequired, Activity.chopWood);
router.post('/farm', authRequired, Activity.farm);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
