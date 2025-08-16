import { createListing as svcCreateListing, buyListing as svcBuyListing, listListings as svcListListings } from '../../services/marketplaceService.js';

export async function create(req, res) {
  const { item, price } = req.body || {};
  if (!item || typeof price !== 'number' || price <= 0) return res.status(400).json({ error: 'invalid' });
  const listing = await svcCreateListing(req.user.id, item, price);
  res.json({ listing });
}

export async function buy(req, res) {
  try {
    const result = await svcBuyListing(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
    if (e.message === 'insufficient_funds') return res.status(400).json({ error: 'insufficient_funds' });
    res.status(500).json({ error: 'buy_failed' });
  }
}

export async function list(_req, res) {
  const listings = await svcListListings();
  res.json({ listings });
}
