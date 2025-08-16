import { Router } from 'express';

import { authRequired } from '../middleware/auth.js';
import { ReputationService } from '../modules/reputation/index.js';

const router = Router();

router.get('/history', authRequired, async (req, res) => {
  const limit = Number(req.query.limit || 5);
  const { rows, cap, earned } = await ReputationService.getHistoryWithCaps(req.user.id, limit);
  res.json({ history: rows, dailyChatCap: cap, earnedToday: earned, dailyChatCapReached: earned >= cap });
});

export default router;
