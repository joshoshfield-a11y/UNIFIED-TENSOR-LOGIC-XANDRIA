import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');
const generatedDir = path.join(root, 'XANDRIA', 'generated');
const distDir = path.join(generatedDir, 'dist');
const sealPath = path.join(generatedDir, 'seal.json');

function listFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function sealArtifact() {
  const files = listFiles(distDir);
  const hashes = files.map(fp => ({
    file: path.relative(generatedDir, fp).replace(/\\/g, '/'),
    sha256: sha256File(fp)
  }));
  const stamp = new Date().toISOString();
  const payload = { stamp, files: hashes, count: hashes.length };
  fs.writeFileSync(sealPath, JSON.stringify(payload, null, 2));
  console.log(`Ω Seal written: ${sealPath} (${hashes.length} files)`);
}

sealArtifact();
