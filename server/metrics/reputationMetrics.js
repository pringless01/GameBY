// Reputation metrics counters (Prometheus compatible)
export const reputationMetrics = {
  eventsTotal: 0,
  eventsByType: {}, // type -> count
  cappedSkips: 0,
  unknownTypeSkips: 0,
  dbErrors: 0
};

export function incReputationEvent(type){
  reputationMetrics.eventsTotal++;
  reputationMetrics.eventsByType[type] = (reputationMetrics.eventsByType[type]||0)+1;
}
export function incCappedSkip(){ reputationMetrics.cappedSkips++; }
export function incUnknownType(){ reputationMetrics.unknownTypeSkips++; }
export function incReputationDbError(){ reputationMetrics.dbErrors++; }
