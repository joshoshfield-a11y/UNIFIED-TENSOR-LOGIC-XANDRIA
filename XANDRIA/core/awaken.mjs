import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Memory } from './memory.mjs';
import { measure } from './reflector.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../');
const artifactPath = path.join(root, 'XANDRIA', 'generated', 'artifact.json');

let payload = {};
try {
  payload = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
} catch {}

const metrics = measure(payload);
const mem = new Memory();
mem.set('lastMetrics', metrics).save();

