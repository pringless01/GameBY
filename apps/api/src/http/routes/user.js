// Controller-first shim: mount selected handlers from controllers, then fall back to legacy router.
import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/user.js';
import * as UserController from '../controllers/userController.js';

const router = express.Router();

// New controller-mounted endpoints (behavior identical)
router.get('/fraud/multiuser-ips', authRequired, UserController.getFraudMultiUserIps);
router.get('/fraud/multiuser-devices', authRequired, UserController.getFraudMultiUserDevices);
router.get('/fraud/risk-score', authRequired, UserController.getFraudRiskScore);
router.get('/leaderboard/abuse/ips', authRequired, UserController.getLeaderboardAbuseIps);
router.get('/onboarding/progress', authRequired, UserController.getOnboardingProgress);
router.post('/onboarding/step', authRequired, UserController.postOnboardingStep);

// Remaining user endpoints controller-first
router.get('/me', authRequired, UserController.getMe);
router.get('/profile', authRequired, UserController.getProfile);
router.get('/search', authRequired, UserController.searchUsers);
router.get('/trust/daily-earned', authRequired, UserController.getDailyTrustEarned);
router.get('/bootstrap', authRequired, UserController.getBootstrap);
router.get('/trust/history', authRequired, UserController.getTrustHistory);
router.get('/mentorship/history', authRequired, UserController.getMentorshipHistory);

// Fallback to legacy routes for the rest
router.use(legacyRouter);

export default router;
