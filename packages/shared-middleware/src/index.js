// @gameby/shared-middleware
export function requestId(req,res,next){ req.reqId = req.reqId||Date.now().toString(36); next&&next(); }
