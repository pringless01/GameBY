import jwt from 'jsonwebtoken';

import { isTokenRevoked } from '../security/tokenBlacklist.js';

export async function socketAuth(socket, next){
  let token = socket.handshake.auth?.token;
  if(token && token.startsWith('Bearer ')) token = token.slice(7);
  if(!token){
    const err = new Error('Unauthorized');
    err.data = { code: 4401 };
    return next(err);
  }
  try{
    if(await isTokenRevoked(token)){
      const err = new Error('Unauthorized');
      err.data = { code: 4401 };
      return next(err);
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    socket.user = { id: payload.sub, username: payload.username, roles: payload.roles || [] };
    return next();
  }catch(e){
    const err = new Error('Unauthorized');
    err.data = { code: 4401 };
    return next(err);
  }
}
