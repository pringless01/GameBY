export function leaderboardHeader(req, res, next){
  if(req.method === 'GET' || req.method === 'HEAD'){
    res.setHeader('X-Leaderboard-Version','v1');
  }
  next();
}
