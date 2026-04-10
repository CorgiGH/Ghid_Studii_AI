#!/usr/bin/env node
/**
 * validate-bilingual.mjs
 * Recursively checks all {en, ro} objects in a JSON file for completeness.
 * Usage: node scripts/validate-bilingual.mjs <path-to-json>
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = process.argv[2];
if (!file) { console.error('Usage: node validate-bilingual.mjs <file>'); process.exit(1); }

const json = JSON.parse(readFileSync(resolve(file), 'utf-8'));
const issues = [];

function check(obj, path) {
  if (obj === null || obj === undefined) return;
  if (typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach((item, i) => check(item, `${path}[${i}]`)); return; }
  // Check if this is a bilingual object
  if ('en' in obj || 'ro' in obj) {
    if (!obj.en || (typeof obj.en === 'string' && obj.en.trim() === ''))
      issues.push(`${path}: missing or empty "en"`);
    if (!obj.ro || (typeof obj.ro === 'string' && obj.ro.trim() === ''))
      issues.push(`${path}: missing or empty "ro"`);
  }
  // Recurse into all keys
  for (const [key, val] of Object.entries(obj)) {
    if (key !== 'en' && key !== 'ro') check(val, `${path}.${key}`);
  }
}

check(json, '$');

if (issues.length > 0) {
  console.error(`\u274C ${issues.length} bilingual gap(s) in ${file}:`);
  issues.forEach(i => console.error(`  - ${i}`));
  process.exit(1);
} else {
  console.log(`\u2705 ${file} \u2014 all bilingual fields complete`);
  process.exit(0);
}
