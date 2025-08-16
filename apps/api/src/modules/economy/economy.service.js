import { initDb } from '../../config/database.js';
import { logResource } from '../../services/auditService.js';
import { getIo } from '../../sockets/io.js';

async function updateAndReturn(userId, changes) {
	const db = await initDb();
	const sets = Object.keys(changes).map((k) => `${k} = ${k} + ?`).join(', ');
	const values = Object.values(changes);
	await db.run(`UPDATE users SET ${sets} WHERE id = ?`, [...values, userId]);
	const row = await db.get('SELECT id, username, trust_score, money, wood, grain, business FROM users WHERE id = ?', [userId]);
	const io = getIo();
	if (io) io.emit('resource_updated', { userId: row.id, resources: { money: row.money, wood: row.wood, grain: row.grain, business: row.business } });
	return row;
}

export async function chopWood(userId) {
	const gained = Math.floor(Math.random() * 3) + 2; // 2-4
	const moneyGain = 1;
	const u = await updateAndReturn(userId, { wood: gained, money: moneyGain });
	logResource(userId, 'resource_chop_wood', { wood: gained, money: moneyGain });
	return { woodGained: gained, moneyGained: moneyGain, wood: u.wood, money: u.money };
}

export async function farm(userId) {
	const gained = Math.floor(Math.random() * 4) + 1; // 1-4
	const moneyGain = 2;
	const u = await updateAndReturn(userId, { grain: gained, money: moneyGain });
	logResource(userId, 'resource_farm', { grain: gained, money: moneyGain });
	return { grainGained: gained, moneyGained: moneyGain, grain: u.grain, money: u.money };
}

export async function getEconomySummary() { return null; }
