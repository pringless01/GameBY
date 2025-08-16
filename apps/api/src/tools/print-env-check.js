import '../config/env.js';

const jwt = process.env.JWT_SECRET || '';
const refresh = process.env.REFRESH_SECRET || '';
const cursor = process.env.CURSOR_SECRET || '';
console.log('JWT_SECRET.len=', jwt.length);
console.log('REFRESH_SECRET.len=', refresh.length);
console.log('CURSOR_SECRET.len=', cursor.length);
