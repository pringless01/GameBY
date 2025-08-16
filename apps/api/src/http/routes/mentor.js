import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/mentor.js';
import * as Mentor from '../controllers/mentorController.js';
import { mentorLimiter } from '../controllers/mentorController.js';

const router = express.Router();

router.get('/state', authRequired, Mentor.getState);
router.post('/advance', authRequired, Mentor.postAdvance);
router.get('/guidance', authRequired, Mentor.getGuidance);
router.post('/set', authRequired, Mentor.postSet);

router.post('/mentor/ready', authRequired, mentorLimiter, Mentor.postMentorReady);
router.post('/mentor/leave', authRequired, Mentor.postMentorLeave);
router.post('/mentor/request', authRequired, mentorLimiter, Mentor.postMentorRequest);
router.get('/mentor/eligibility', authRequired, Mentor.getMentorEligibility);
router.get('/queues', authRequired, Mentor.getQueues);
router.get('/active', authRequired, Mentor.getActive);
router.post('/mentor/toggle', authRequired, mentorLimiter, Mentor.postMentorToggle);
router.post('/mentee/toggle', authRequired, mentorLimiter, Mentor.postMenteeToggle);
router.get('/mentorship/active', authRequired, Mentor.getMentorshipActive);
router.post('/mentorship/:id/complete', authRequired, Mentor.postMentorshipComplete);

router.use(legacyRouter);

export default router;
