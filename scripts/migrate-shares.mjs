#!/usr/bin/env node
/**
 * Migration script: imports shares-export.json into Upstash Redis.
 * 
 * Usage:
 *   KV_REST_API_URL=... KV_REST_API_TOKEN=... node scripts/migrate-shares.mjs
 */
import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const data = JSON.parse(readFileSync(resolve(__dirname, '../shares-export.json'), 'utf-8'));
const ids = Object.keys(data);

console.log(`Importing ${ids.length} share documents...`);

const pipeline = redis.pipeline();
for (const id of ids) {
  pipeline.set(`share:${id}`, JSON.stringify(data[id]));
}
await pipeline.exec();

console.log(`Done. ${ids.length} documents imported.`);
