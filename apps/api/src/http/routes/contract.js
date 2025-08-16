// Controller-first shim for contracts, with legacy passthrough preserved.
import express from 'express';

import { authRequired } from '../../middleware/auth.js';
import legacyRouter from '../../routes/contract.js';
import * as Contract from '../controllers/contractController.js';

const router = express.Router();

router.post('/', authRequired, Contract.create);
router.get('/', authRequired, Contract.list);
router.post('/:id/action', authRequired, Contract.act);
router.get('/:id', authRequired, Contract.getOne);

// Fallback to legacy for any remaining routes
router.use(legacyRouter);

export default router;
