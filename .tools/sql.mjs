// Reusable admin SQL runner for Diragon. Reads creds from ../../.secrets/supabase.env.
// Usage: node .tools/sql.mjs "SELECT ..."   |   echo "SELECT ..." | node .tools/sql.mjs
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(dir, '../../.secrets/supabase.env');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (!m) continue;
  env[m[1]] = m[2].replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
}
const sql = process.argv[2] || fs.readFileSync(0, 'utf8');
const c = new pg.Client({
  host: env.SUPABASE_POOLER_HOST, port: 6543,
  user: env.SUPABASE_POOLER_USER || `postgres.${env.SUPABASE_PROJECT_REF}`,
  password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
  ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000,
});
await c.connect();
try { const r = await c.query(sql); console.log(JSON.stringify(r.rows, null, 2)); }
finally { await c.end(); }
