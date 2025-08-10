import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { createContract, listUserContracts, actOnContract, getContract } from '../services/contractService.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { counterparty_id, subject, amount, type } = req.body;
  if (!counterparty_id || !subject || typeof amount !== 'number' || !type) return res.status(400).json({ error: 'Eksik alan' });
  try {
    const contract = await createContract({ creator_id: req.user.id, counterparty_id, subject, amount, type });
    res.json({ contract });
  } catch (e) {
    res.status(500).json({ error: 'Oluşturma hatası' });
  }
});

router.get('/', authRequired, async (req, res) => {
  const list = await listUserContracts(req.user.id);
  res.json({ contracts: list });
});

router.post('/:id/action', authRequired, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!['accept','cancel','complete'].includes(action)) return res.status(400).json({ error: 'Geçersiz aksiyon' });
  try {
    const updated = await actOnContract(Number(id), req.user.id, action);
    res.json({ contract: updated });
  } catch (e) {
    if (e.message === 'not_found') return res.status(404).json({ error: 'Bulunamadı' });
    if (e.message === 'forbidden') return res.status(403).json({ error: 'Yetki yok' });
    res.status(500).json({ error: 'İşlem hatası' });
  }
});

router.get('/:id', authRequired, async (req, res) => {
  const c = await getContract(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Bulunamadı' });
  if (![c.creator_id, c.counterparty_id].includes(req.user.id)) return res.status(403).json({ error: 'Yetki yok' });
  res.json({ contract: c });
});

export default router;
