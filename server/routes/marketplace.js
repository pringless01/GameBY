import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { createListing, buyListing, listListings } from '../services/marketplaceService.js';

const router = express.Router();

router.post('/list', authRequired, async (req,res)=>{
  const { item, price } = req.body;
  if(!item || typeof price !== 'number' || price <=0) return res.status(400).json({ error:'invalid' });
  const listing = await createListing(req.user.id, item, price);
  res.json({ listing });
});

router.post('/buy/:id', authRequired, async (req,res)=>{
  try {
    const result = await buyListing(req.params.id, req.user.id);
    res.json(result);
  } catch(e){
    if(e.message==='not_found') return res.status(404).json({ error:'not_found' });
    if(e.message==='insufficient_funds') return res.status(400).json({ error:'insufficient_funds' });
    res.status(500).json({ error:'buy_failed' });
  }
});

router.get('/', authRequired, async (req,res)=>{
  const listings = await listListings();
  res.json({ listings });
});

export default router;
