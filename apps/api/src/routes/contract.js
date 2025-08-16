import express from 'express';

import { authRequired } from '../http/routes/auth.js';
import { createContract, listUserContracts, actOnContract, getContract, listUserContractsFiltered } from '../services/contractService.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { counterparty_id, subject, amount, type, price = 0, currency = 'TL',
    creator_give_money=0, creator_give_wood=0, creator_give_grain=0, creator_give_business=0,
    counter_give_money=0, counter_give_wood=0, counter_give_grain=0, counter_give_business=0 } = req.body;
  if (!counterparty_id || !subject || typeof amount !== 'number' || !type) return res.status(400).json({ error: 'Eksik alan' });
  const numFields = [price, creator_give_money, creator_give_wood, creator_give_grain, creator_give_business, counter_give_money, counter_give_wood, counter_give_grain, counter_give_business];
  if (numFields.some(v => typeof v !== 'number' || v < 0 || !Number.isFinite(v))) return res.status(400).json({ error: 'Geçersiz barter değerleri' });
  try {
    const contract = await createContract({ creator_id: req.user.id, counterparty_id, subject, amount, type, price, currency,
      creator_give_money, creator_give_wood, creator_give_grain, creator_give_business,
      counter_give_money, counter_give_wood, counter_give_grain, counter_give_business });
    res.json({ contract });
  } catch (e) {
    res.status(500).json({ error: 'Oluşturma hatası' });
  }
});

router.get('/', authRequired, async (req, res) => {
  const { status, role, limit, offset, sort } = req.query;
  try {
    const result = await listUserContractsFiltered(req.user.id, { status: status||null, role: role||'any', limit, offset, sort });
    res.json(result);
  } catch(e){
    res.status(500).json({ error: 'Listeleme hatası' });
  }
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
    if (e.message === 'insufficient_funds') return res.status(400).json({ error: 'Yetersiz bakiye' });
    if (e.message === 'insufficient_resources') return res.status(400).json({ error: 'Kaynak yetersiz' });
    if (e.message === 'invalid_amount') return res.status(400).json({ error: 'Geçersiz miktar' });
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
