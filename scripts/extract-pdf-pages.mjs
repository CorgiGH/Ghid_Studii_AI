#!/usr/bin/env node
/**
 * extract-pdf-pages.mjs
 *
 * Rasterize each page of a PDF into a PNG and save to public/course-media/
 * so the site can render them as static <img> assets under the Pages base URL.
 *
 * Usage:
 *   node scripts/extract-pdf-pages.mjs <pdf-path> <out-slug>
 *
 * Example:
 *   node scripts/extract-pdf-pages.mjs "src/content/alo/source/ALO curs 01.pdf" alo/c01
 *   → writes public/course-media/alo/c01/page-01.png ... page-NN.png
 *
 * Images referenced from course JSON as "course-media/alo/c01/page-05.png".
 */

import { pdf } from 'pdf-to-img';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/extract-pdf-pages.mjs <pdf-path> <out-slug>');
  console.error('Example: node scripts/extract-pdf-pages.mjs "src/content/alo/source/ALO curs 01.pdf" alo/c01');
  process.exit(1);
}

const pdfPath = resolve(args[0]);
const outSlug = args[1].replace(/^\/+|\/+$/g, '');
const outDir = resolve('public', 'course-media', outSlug);

if (!existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

console.log(`📄 Rasterizing ${pdfPath}`);
console.log(`   → ${outDir}`);

const document = await pdf(pdfPath, { scale: 1.5 });
let n = 0;
for await (const page of document) {
  n++;
  const fname = `page-${String(n).padStart(2, '0')}.png`;
  writeFileSync(resolve(outDir, fname), page);
  process.stdout.write(`\r  page ${n}`);
}
console.log(`\n✅ Wrote ${n} pages`);
console.log(`   Reference in JSON as: course-media/${outSlug}/page-NN.png`);
