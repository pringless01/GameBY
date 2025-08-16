// Controller-first shim: mount selected handlers from controllers, then fall back to legacy router.
import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/user.js';
import { 
	getFraudMultiUserIps,
	getFraudMultiUserDevices,
	getFraudRiskScore,
	getLeaderboardAbuseIps,
	getOnboardingProgress,
	postOnboardingStep
} from '../controllers/userController.js';

const router = express.Router();

// New controller-mounted endpoints (behavior identical)
router.get('/fraud/multiuser-ips', authRequired, getFraudMultiUserIps);
router.get('/fraud/multiuser-devices', authRequired, getFraudMultiUserDevices);
router.get('/fraud/risk-score', authRequired, getFraudRiskScore);
router.get('/leaderboard/abuse/ips', authRequired, getLeaderboardAbuseIps);
router.get('/onboarding/progress', authRequired, getOnboardingProgress);
router.post('/onboarding/step', authRequired, postOnboardingStep);

// Fallback to legacy routes for the rest
router.use(legacyRouter);

export default router;
