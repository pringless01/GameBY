import * as Economy from '../../modules/economy/economy.service.js';

export async function chopWood(req, res) {
  try {
    const result = await Economy.chopWood(req.user.id);
    res.json({ success: true, result });
  } catch (e) { res.status(500).json({ error: 'action_failed' }); }
}

export async function farm(req, res) {
  try {
    const result = await Economy.farm(req.user.id);
    res.json({ success: true, result });
  } catch (e) { res.status(500).json({ error: 'action_failed' }); }
}
