import dotenv from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, basename, dirname } from 'path';

dotenv.config({ path: resolve('proxy/.env') });

// ── CLI Argument Parsing ──

const args = process.argv.slice(2);

if (args[0] === 'status') {
  showStatus();
  process.exit(0);
}

const pdfPath = args.find(a => !a.startsWith('--'));
if (!pdfPath) {
  console.error('Usage: node curate.mjs <pdf-path> [--subject <slug>] [--type <course|lab|seminar|test>] [--redo]');
  process.exit(1);
}

const flags = {
  subject: getFlagValue('--subject'),
  type: getFlagValue('--type'),
  redo: args.includes('--redo'),
};

// ── Auto-Detection ──

function detectSubject(filePath) {
  if (flags.subject) return flags.subject;
  const match = filePath.match(/src\/content\/([^/]+)\//);
  if (match) return match[1];
  console.error('Cannot detect subject from path. Use --subject <slug>');
  process.exit(1);
}

function detectType(filePath) {
  if (flags.type) return flags.type;
  if (/\/courses?\//i.test(filePath) || /course/i.test(basename(filePath))) return 'course';
  if (/\/labs?\//i.test(filePath) || /lab/i.test(basename(filePath))) return 'lab';
  if (/\/seminars?\//i.test(filePath) || /seminar/i.test(basename(filePath))) return 'seminar';
  if (/\/tests?\//i.test(filePath) || /test/i.test(basename(filePath))) return 'test';
  console.error('Cannot detect content type from path. Use --type <course|lab|seminar|test>');
  process.exit(1);
}

const subject = detectSubject(pdfPath);
const contentType = detectType(pdfPath);
const pdfName = basename(pdfPath, '.pdf').replace(/_raw$/, '').replace(/\.html$/, '');

// ── Checkpoint/Resume ──

const curateDir = resolve(`src/content/${subject}/.curate/${pdfName}`);
const statusPath = resolve(curateDir, 'status.json');

function ensureCurateDir() {
  mkdirSync(curateDir, { recursive: true });
}

function readStatus() {
  if (!existsSync(statusPath)) return { lastCompleted: 0, type: contentType, subject };
  return JSON.parse(readFileSync(statusPath, 'utf-8'));
}

function writeStatus(stage) {
  ensureCurateDir();
  writeFileSync(statusPath, JSON.stringify({ lastCompleted: stage, type: contentType, subject }, null, 2));
}

function stageOutputExists(filename) {
  return existsSync(resolve(curateDir, filename));
}

// ── Status Command ──

function showStatus() {
  const { readdirSync } = await import('fs');
  const contentDir = resolve('src/content');
  const subjects = readdirSync(contentDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let found = false;
  for (const subj of subjects) {
    const curatePath = resolve(contentDir, subj, '.curate');
    if (!existsSync(curatePath)) continue;
    const pipelines = readdirSync(curatePath, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const p of pipelines) {
      const sPath = resolve(curatePath, p.name, 'status.json');
      if (existsSync(sPath)) {
        const s = JSON.parse(readFileSync(sPath, 'utf-8'));
        console.log(`  ${subj}/${p.name}: stage ${s.lastCompleted}/5 (${s.type})`);
        found = true;
      }
    }
  }
  if (!found) console.log('  No active pipelines.');
}

// ── Helpers ──

function getFlagValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ── Main Pipeline ──

async function main() {
  const status = readStatus();
  console.log(`\n📄 Curating: ${pdfPath}`);
  console.log(`   Subject: ${subject} | Type: ${contentType} | Redo: ${flags.redo}`);
  console.log(`   Output: ${curateDir}`);
  console.log(`   Resuming from stage: ${status.lastCompleted}\n`);

  ensureCurateDir();

  if (status.lastCompleted < 1) {
    console.log('── Stage 1: PDF Extraction (Gemini) ──');
    await runStage1(pdfPath);
    writeStatus(1);
    console.log('✅ Stage 1 complete\n');
  } else {
    console.log('⏭️  Stage 1: skipped (cached)\n');
  }

  if (status.lastCompleted < 2) {
    console.log('── Stage 2: Bibliography Cross-Reference (Gemini) ──');
    await runStage2();
    writeStatus(2);
    console.log('✅ Stage 2 complete\n');
  } else {
    console.log('⏭️  Stage 2: skipped (cached)\n');
  }

  if (flags.redo && status.lastCompleted < 2.5) {
    console.log('── Stage 2.5: Diff Against Existing (Gemini) ──');
    await runStage2_5();
    writeStatus(2.5);
    console.log('✅ Stage 2.5 complete\n');
  }

  // Stages 3-5 are handled by Claude Code skill (Haiku/Opus agents)
  // Script outputs JSON for those stages to consume
  console.log('── Gemini stages complete ──');
  console.log('Run /curate in Claude Code to continue with stages 3-5.\n');
}

// ── Stage Stubs (implemented in later tasks) ──

async function runStage1(pdfPath) {
  throw new Error('Stage 1 not yet implemented');
}

async function runStage2() {
  throw new Error('Stage 2 not yet implemented');
}

async function runStage2_5() {
  throw new Error('Stage 2.5 not yet implemented');
}

main().catch(err => {
  console.error('❌ Pipeline error:', err.message);
  process.exit(1);
});
