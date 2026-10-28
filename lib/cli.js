import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROFILES = {
  base: ['project-onboarding', 'documentation', 'verification'],
  frontend: ['project-onboarding', 'documentation', 'verification', 'ui-implementation'],
  backend: ['project-onboarding', 'documentation', 'verification', 'backend-feature'],
  fullstack: ['project-onboarding', 'documentation', 'verification', 'ui-implementation', 'backend-feature']
};
const MANIFEST = '.doni-ai-workflow-manifest.json';
const exists = (p) => fs.existsSync(p);
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
function parseArgs(args) {
  const out = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (['--dry-run', '--yes', '--help', '-h'].includes(a)) out[a === '-h' ? 'help' : a.slice(2)] = true;
    else if (a.startsWith('--')) out[a.slice(2)] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    else out._.push(a);
  }
  return out;
}
async function ask(q, fallback = '') {
  const rl = readline.createInterface({ input, output });
  try { const a = (await rl.question(`${q}${fallback ? ` [${fallback}]` : ''}: `)).trim(); return a || fallback; }
  finally { rl.close(); }
}
async function choose(q, items, fallback) {
  console.log(`\n${q}`); items.forEach((x, i) => console.log(`  ${i + 1}. ${x.label}${x.value === fallback ? ' (default)' : ''}`));
  const n = Number(await ask('Pilih nomor', String(items.findIndex(x => x.value === fallback) + 1)));
  if (!Number.isInteger(n) || !items[n - 1]) throw new Error('Pilihan tidak valid.'); return items[n - 1].value;
}
async function confirm(q, defaultYes = false) {
  const a = (await ask(`${q} ${defaultYes ? '[Y/n]' : '[y/N]'}`, defaultYes ? 'y' : 'n')).toLowerCase();
  return defaultYes ? !['n', 'no'].includes(a) : ['y', 'yes'].includes(a);
}
function inside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}
function sourceFiles(scope, target, profile) {
  if (!PROFILES[profile]) throw new Error(`Profil tidak dikenal: ${profile}`);
  const files = [];
  const skillRoot = scope === 'workspace' ? path.join(target, '.agents', 'skills') : path.join(os.homedir(), '.gemini', 'config', 'skills');
  for (const skill of PROFILES[profile]) {
    const dir = path.join(ROOT, 'skills', skill);
    if (!exists(dir)) throw new Error(`Skill tidak ditemukan: ${dir}`);
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) if (f.isFile()) files.push({ src: path.join(dir, f.name), dest: path.join(skillRoot, skill, f.name) });
  }
  if (scope === 'workspace') {
    files.push({ src: path.join(ROOT, 'rules/workspace/engineering-standards.md'), dest: path.join(target, '.agents/rules/engineering-standards.md') });
    const docs = path.join(ROOT, 'templates/docs');
    for (const f of fs.readdirSync(docs, { withFileTypes: true })) if (f.isFile()) files.push({ src: path.join(docs, f.name), dest: path.join(target, 'docs/ai-workflow', f.name) });
  } else files.push({ src: path.join(ROOT, 'rules/global/engineering-standards.md'), dest: path.join(os.homedir(), '.gemini/config/rules/doni-engineering-standards.md') });
  return files;
}
async function applyFiles(files, opts, manifestPath) {
  const installed = [];
  for (const f of files) {
    if (!exists(f.src)) throw new Error(`Asset toolkit hilang: ${f.src}`);
    if (opts['dry-run']) { console.log(`${exists(f.dest) ? '[CONFLICT — akan ditanya]' : '[CREATE]'} ${f.dest}`); continue; }
    if (exists(f.dest)) {
      const choice = await choose(`File sudah ada:\n${f.dest}`, [
        { label: 'Pertahankan file yang ada', value: 'keep' },
        { label: 'Backup lalu ganti dengan versi toolkit', value: 'replace' },
        { label: 'Skip file ini', value: 'skip' }
      ], 'keep');
      if (choice !== 'replace') { console.log(`[${choice.toUpperCase()}] ${f.dest}`); continue; }
      const backup = `${f.dest}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      fs.copyFileSync(f.dest, backup, fs.constants.COPYFILE_EXCL); console.log(`[BACKUP] ${backup}`);
    }
    ensureDir(path.dirname(f.dest)); fs.copyFileSync(f.src, f.dest); installed.push(f.dest); console.log(`[INSTALLED] ${f.dest}`);
  }
  if (opts['dry-run']) return console.log('\nDry-run selesai. Tidak ada file yang ditulis.');
  const manifest = { toolkit: 'doni-ai-workflow', version: '0.1.0', scope: opts.scope, profile: opts.profile, installedAt: new Date().toISOString(), paths: [...new Set(installed)] };
  ensureDir(path.dirname(manifestPath));
  if (exists(manifestPath)) {
    if (await confirm(`Manifest sudah ada. Perbarui manifest?\n${manifestPath}`)) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    else console.warn('Manifest tidak diubah; file baru mungkin tidak tercatat untuk uninstall.');
  } else fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  console.log('\nSelesai. Buka proyek di Antigravity dan pastikan skills terdeteksi.');
}
async function init(opts) {
  const scope = opts.scope || await choose('Pasang workflow di mana?', [
    { label: 'Workspace ini saja (direkomendasikan)', value: 'workspace' }, { label: 'Global untuk user ini', value: 'global' }
  ], 'workspace');
  if (!['workspace', 'global'].includes(scope)) throw new Error('Scope harus workspace atau global.');
  let target = path.resolve(opts.target || process.cwd());
  if (scope === 'workspace') {
    if (!exists(target) || !fs.statSync(target).isDirectory()) throw new Error(`Folder target tidak ditemukan: ${target}`);
    const repo = path.resolve(ROOT);
    if (inside(target, repo) || inside(repo, target)) throw new Error('Jalankan CLI dari folder proyek, bukan folder toolkit atau parent-nya.');
  } else target = path.join(os.homedir(), '.gemini', 'config');
  const profile = opts.profile || await choose('Pilih profil workflow:', [
    { label: 'Base — onboarding, dokumentasi, verification', value: 'base' },
    { label: 'Frontend — base + UI design system dan visual review', value: 'frontend' },
    { label: 'Backend — base + backend feature', value: 'backend' },
    { label: 'Fullstack — semua skills', value: 'fullstack' }
  ], 'fullstack');
  if (!PROFILES[profile]) throw new Error(`Profil tidak valid: ${profile}`);
  console.log(`\nTarget: ${target}\nScope: ${scope}\nProfil: ${profile}\nInstaller hanya menyalin workflow assets; source code aplikasi tidak diubah.`);
  if (!opts['dry-run'] && !opts.yes && !(await confirm('Lanjutkan instalasi?', true))) return console.log('Dibatalkan.');
  const manifestPath = path.join(target, scope === 'workspace' ? MANIFEST : 'doni-ai-workflow-global-manifest.json');
  await applyFiles(sourceFiles(scope, target, profile), { ...opts, scope, profile }, manifestPath);
}
async function uninstall(opts) {
  const scope = opts.scope || await choose('Uninstall dari mana?', [{ label: 'Workspace saat ini', value: 'workspace' }, { label: 'Global', value: 'global' }], 'workspace');
  const target = scope === 'global' ? path.join(os.homedir(), '.gemini/config') : path.resolve(opts.target || process.cwd());
  const manifestPath = path.join(target, scope === 'workspace' ? MANIFEST : 'doni-ai-workflow-global-manifest.json');
  if (!exists(manifestPath)) throw new Error(`Manifest tidak ditemukan: ${manifestPath}. Tidak ada file yang dihapus.`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const p of manifest.paths || []) {
    if (!exists(p)) { console.log(`[MISSING] ${p}`); continue; }
    if (opts['dry-run']) { console.log(`[DRY RUN] Akan meminta konfirmasi sebelum menghapus ${p}`); continue; }
    if (await confirm(`Hapus file yang tercatat di manifest?\n${p}`)) { fs.unlinkSync(p); console.log(`[REMOVED] ${p}`); } else console.log(`[KEPT] ${p}`);
  }
  if (!opts['dry-run'] && await confirm(`Hapus manifest?\n${manifestPath}`)) fs.unlinkSync(manifestPath);
}
function help() { console.log(`doni-ai — Antigravity workflow installer\n\nCommands:\n  doni-ai init [--target PATH] [--scope workspace|global] [--profile base|frontend|backend|fullstack]\n  doni-ai update [options]\n  doni-ai uninstall [--target PATH] [--scope workspace|global]\n  doni-ai doctor\n\nOptions:\n  --dry-run   Preview without writing files\n  --yes       Skip initial confirmation; file conflicts still prompt\n`); }
async function doctor() { console.log(`Node.js: ${process.version}\nCurrent folder: ${process.cwd()}\nWorkspace skills: ${path.join(process.cwd(), '.agents/skills')}\nGlobal skills: ${path.join(os.homedir(), '.gemini/config/skills')}`); }
export async function run(args) {
  const opts = parseArgs(args); const command = opts._[0] || 'init';
  if (opts.help || command === 'help') return help();
  if (command === 'doctor') return doctor();
  if (command === 'init' || command === 'update') return init(opts);
  if (command === 'uninstall') return uninstall(opts);
  throw new Error(`Command tidak dikenal: ${command}. Jalankan doni-ai --help.`);
}
