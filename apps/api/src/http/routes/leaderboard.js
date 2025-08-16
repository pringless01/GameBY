// Controller-first shim for leaderboard endpoints
import express from 'express';

import { authRequired, roleRequired } from '../../middleware/auth.js';
import * as Lb from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', authRequired, Lb.getLeaderboard);
router.head('/', authRequired, Lb.headLeaderboard);
router.get('/metrics', roleRequired('admin'), Lb.getMetricsSummary);
router.get('/metrics/prom', roleRequired('admin'), Lb.getMetricsPrometheus);

export default router;
