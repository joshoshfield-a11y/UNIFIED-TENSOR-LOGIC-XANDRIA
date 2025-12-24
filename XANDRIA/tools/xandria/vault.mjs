import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const vaultPath = path.join(root, 'XANDRIA', 'generated', 'vault.json');

export function readVault() {
  try {
    return JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  } catch {
    return {};
  }
}

export function writeVault(data) {
  fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
  fs.writeFileSync(vaultPath, JSON.stringify(data, null, 2));
}

