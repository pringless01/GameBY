import { initDb } from '../config/database.js';

export async function createListing(sellerId, item, price){
  const db = await initDb();
  const res = await db.run('INSERT INTO marketplace_listings (seller_id,item,price) VALUES (?,?,?)',[sellerId,item,price]);
  return db.get('SELECT * FROM marketplace_listings WHERE id=?',[res.lastID]);
}

export async function listListings(){
  const db = await initDb();
  return db.all('SELECT * FROM marketplace_listings ORDER BY id');
}

export async function buyListing(id, buyerId){
  const db = await initDb();
  await db.exec('BEGIN IMMEDIATE');
  try{
    const listing = await db.get('SELECT * FROM marketplace_listings WHERE id=?',[id]);
    if(!listing){ await db.exec('ROLLBACK'); throw new Error('not_found'); }
    const price = listing.price;
    const sellerId = listing.seller_id;
    const buyer = await db.get('SELECT money FROM users WHERE id=?',[buyerId]);
    if(!buyer || buyer.money < price){ await db.exec('ROLLBACK'); throw new Error('insufficient_funds'); }
    await db.run('UPDATE users SET money = money - ? WHERE id=?',[price,buyerId]);
    await db.run('UPDATE users SET money = money + ? WHERE id=?',[price,sellerId]);
    await db.run('DELETE FROM marketplace_listings WHERE id=?',[id]);
    await db.exec('COMMIT');
    return { success:true };
  }catch(e){
    await db.exec('ROLLBACK');
    throw e;
  }
}
