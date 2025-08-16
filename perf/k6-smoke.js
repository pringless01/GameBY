import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = { vus: 1, iterations: 5 };

export default function () {
  const target = __ENV.TARGET || 'http://localhost:3000/health';
  const res = http.get(target);
  check(res, { 'status 200/204/404 ok-ish': r => [200,204,404].includes(r.status) });
  sleep(0.5);
}
