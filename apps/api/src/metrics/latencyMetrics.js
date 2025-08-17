import { Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in ms',
  buckets: [5,10,25,50,100,250,500,1000,2500,5000]
});

export const wsMessageDuration = new Histogram({
  name: 'ws_message_duration_ms',
  help: 'WebSocket message processing duration in ms',
  buckets: [5,10,25,50,100,250,500,1000]
});

function percentile(hist, p){
  const data = hist.get();
  if(!data || !data.values) return 0;
  const values = data.values.filter(v=>v.metricName.endsWith('_bucket')).sort((a,b)=>parseFloat(a.labels.le)-parseFloat(b.labels.le));
  const inf = values.find(v=>v.labels.le==='+'+'Inf');
  if(!inf) return 0;
  const total = inf.value;
  const target = total * p;
  let acc = 0;
  for(const v of values){
    acc += v.value;
    if(acc >= target) return parseFloat(v.labels.le);
  }
  return 0;
}

export function getPercentiles(){
  return {
    httpP95: percentile(httpRequestDuration, 0.95),
    httpP99: percentile(httpRequestDuration, 0.99),
    wsP95: percentile(wsMessageDuration, 0.95),
    wsP99: percentile(wsMessageDuration, 0.99)
  };
}
