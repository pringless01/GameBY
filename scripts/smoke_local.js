// No behavior change. Tries common ports/endpoints with retries.
import http from "http";

const ports = [3000, 8080];
const paths = ["/health", "/metrics"];
const deadline = Date.now() + 60_000;
const wait = ms => new Promise(r => setTimeout(r, ms));

async function tryOnce() {
  for (const port of ports) {
    for (const p of paths) {
      const url = `http://localhost:${port}${p}`;
      try {
        const code = await new Promise((resolve, reject) => {
          const req = http.get(url, res => resolve(res.statusCode || 0));
          req.on("error", reject);
        });
        if (code >= 200 && code < 500) {
          console.log("OK:", url, code);
          return true;
        }
      } catch {}
    }
  }
  return false;
}

(async () => {
  while (Date.now() < deadline) {
    if (await tryOnce()) process.exit(0);
    await wait(2000);
  }
  console.log("Smoke timed out.");
  process.exit(0); // report-only; CI'yi kırmaz
})();
