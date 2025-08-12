// Economy sink metrics
export const economyMetrics = {
  runs: 0,
  users_charged: 0,
  total_deducted: 0,
  errors: 0
};

export function incRun(){ economyMetrics.runs++; }
export function addUsersCharged(n){ economyMetrics.users_charged += (n||0); }
export function addTotalDeducted(n){ economyMetrics.total_deducted += (n||0); }
export function incErrors(){ economyMetrics.errors++; }
