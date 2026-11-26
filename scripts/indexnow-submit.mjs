// Submits changed canonical URLs from sitemap.xml to IndexNow. Run after deploying:  node scripts/indexnow-submit.mjs
// Only URLs whose page file changed since the last successful submission are sent. State is kept in scripts/.indexnow-state.json.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'lottochamp.vercel.app';
const KEY = fs.readFileSync(path.join(ROOT, 'key.txt'), 'utf8').trim();
const KEY_LOCATION = 'https://' + HOST + '/key.txt';
const STATE = path.join(ROOT, 'scripts', '.indexnow-state.json');
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]).filter(u => u.startsWith('https://' + HOST + '/'));
const changed = [], hashes = {};
for (const u of urls) {
  let rel = new URL(u).pathname; if (rel.endsWith('/')) rel += 'index.html';
  const f = path.join(ROOT, rel); if (!fs.existsSync(f)) { console.warn('skip (missing file)', u); continue; }
  const h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); hashes[u] = h;
  if (state[u] !== h || process.argv.includes('--all')) changed.push(u);
}
if (!changed.length) { console.log('No changed URLs. Nothing submitted.'); process.exit(0); }
// verify key file is live first
const kr = await fetch(KEY_LOCATION); const kt = (await kr.text()).trim();
if (kr.status !== 200 || kt !== KEY) { console.error('Key file check failed:', kr.status, kt.slice(0, 40)); process.exit(1); }
const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: changed });
for (let attempt = 1; attempt <= 4; attempt++) {
  const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
  console.log(`IndexNow attempt ${attempt}: HTTP ${r.status} for ${changed.length} URL(s)`);
  if (r.status === 200 || r.status === 202) { for (const u of changed) state[u] = hashes[u]; fs.writeFileSync(STATE, JSON.stringify(state, null, 2)); console.log('Accepted (received, not a guarantee of indexing).'); process.exit(0); }
  if (r.status === 400 || r.status === 403 || r.status === 422) { console.error('Rejected:', await r.text()); process.exit(1); }
  await new Promise(res => setTimeout(res, 2000 * attempt * attempt));
}
console.error('IndexNow failed after retries.'); process.exit(1);
