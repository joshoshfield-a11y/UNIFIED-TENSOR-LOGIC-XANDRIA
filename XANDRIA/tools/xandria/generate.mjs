import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyOperators } from '../../core/operators.mjs';
import { synthesizeSpec, toPRD, toArchitecture } from '../../core/solocoder.mjs';
import { parseCustomDirectives } from '../../core/customizer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');

const rawArgs = process.argv.slice(2);
const heal = rawArgs.includes('--heal');
const useSolo = rawArgs.includes('--solocoder') || rawArgs.includes('--solo') || process.env.SOLOCODER === '1' || (rawArgs.filter(a => !a.startsWith('--')).join(' ').toLowerCase().includes('solocoder'));

// Parse Intent and Output Directory
// Heuristic: If the last argument looks like a path (contains '/' or '\'), treat it as outDir
let intentArgs = rawArgs.filter(a => !a.startsWith('--'));
let customOutDir = null;

if (intentArgs.length > 0) {
    const lastArg = intentArgs[intentArgs.length - 1];
    if (lastArg.includes('/') || lastArg.includes('\\')) {
        customOutDir = lastArg;
        intentArgs.pop();
    }
}

const intent = intentArgs.join(' ').trim() || 'default';

// Determine Output Directory
const outDir = customOutDir 
    ? path.resolve(process.cwd(), customOutDir) 
    : path.join(root, 'XANDRIA', 'generated');

if (!customOutDir) {
    // Legacy behavior: use internal generated/dist
    fs.mkdirSync(outDir, { recursive: true });
} else {
    // New behavior: user specified path
    fs.mkdirSync(outDir, { recursive: true });
}

// Full Stack Mode Detection
if (intent.toLowerCase().includes('full stack')) {
    console.log('\n🚀 FULL STACK MODE ACTIVATED');
    
    // 1. Generate Client
    console.log('\n[1/2] Generating Client...');
    const clientIntent = intent.replace('full stack', '').trim() + ' frontend';
    const clientOutDir = path.join(outDir, 'client');
    
    const { execSync } = await import('child_process');
    const selfPath = process.argv[1];
    
    try {
        execSync(`node "${selfPath}" "${clientIntent}" "${clientOutDir}"`, { stdio: 'inherit' });
    } catch (e) { process.exit(1); }

    // 2. Generate Server
    console.log('\n[2/2] Generating Server...');
    const serverIntent = intent.replace('full stack', '').trim() + ' backend api';
    const serverOutDir = path.join(outDir, 'server');
    
    try {
        execSync(`node "${selfPath}" "${serverIntent}" "${serverOutDir}"`, { stdio: 'inherit' });
    } catch (e) { process.exit(1); }

    console.log(`\n✅ Full Stack Project Generated at ${outDir}`);
    process.exit(0);
}

const kbDir = path.join(root, 'XANDRIA', 'kb', 'xandria');
let axioms = [];
let templates = [];
try {
  const j = JSON.parse(fs.readFileSync(path.join(kbDir, 'axioms.json'), 'utf8'));
  axioms = Array.isArray(j.axioms) ? j.axioms : [];
} catch {}
try {
  const j = JSON.parse(fs.readFileSync(path.join(kbDir, 'templates.json'), 'utf8'));
  templates = Array.isArray(j.templates) ? j.templates : [];
} catch {}

// --- TEMPLATE SELECTION ---
let selectedTemplate = templates.find(t => t.name === 'default') || { files: {} };

const intentLower = intent.toLowerCase();
if (intentLower.includes('llm') || intentLower.includes('ai') || intentLower.includes('gpt') || intentLower.includes('bot')) {
  selectedTemplate = templates.find(t => t.name === 'llm-chatbot') || selectedTemplate;
} else if (intentLower.includes('rpg') || intentLower.includes('role') || intentLower.includes('adventure')) {
  selectedTemplate = templates.find(t => t.name === 'rpg-three') || selectedTemplate;
} else if (intentLower.includes('fps') || intentLower.includes('shooter') || intentLower.includes('gun') || intentLower.includes('first person')) {
  selectedTemplate = templates.find(t => t.name === 'fps-three') || selectedTemplate;
} else if (intentLower.includes('multiplayer') || intentLower.includes('socket') || intentLower.includes('mmo')) {
  selectedTemplate = templates.find(t => t.name === 'multiplayer-server') || selectedTemplate;
} else if (intentLower.includes('react') || intentLower.includes('frontend') || intentLower.includes('ui') || intentLower.includes('dashboard') || (intentLower.includes('app') && intentLower.includes('web'))) {
  selectedTemplate = templates.find(t => t.name === 'react-app') || selectedTemplate;
} else if (intentLower.includes('mobile') || intentLower.includes('ios') || intentLower.includes('android') || (intentLower.includes('app') && !intentLower.includes('web'))) {
  selectedTemplate = templates.find(t => t.name === 'mobile-app') || selectedTemplate;
} else if (intentLower.includes('3d') || intentLower.includes('three') || intentLower.includes('world') || intentLower.includes('open world')) {
  selectedTemplate = templates.find(t => t.name === 'three-game') || selectedTemplate;
} else if (intentLower.includes('phaser') || (intentLower.includes('game') && intentLower.includes('scale'))) {
  selectedTemplate = templates.find(t => t.name === 'phaser-game') || selectedTemplate;
} else if (intentLower.includes('next') || (intentLower.includes('app') && intentLower.includes('scale'))) {
  selectedTemplate = templates.find(t => t.name === 'next-app') || selectedTemplate;
} else if (intentLower.includes('game') || intentLower.includes('canvas') || intentLower.includes('play')) {
  selectedTemplate = templates.find(t => t.name === 'game-canvas') || selectedTemplate;
} else if (intentLower.includes('react') || intentLower.includes('frontend') || intentLower.includes('ui')) {
  selectedTemplate = templates.find(t => t.name === 'react-app') || selectedTemplate;
} else if (intentLower.includes('web') || intentLower.includes('site') || intentLower.includes('html')) {
  selectedTemplate = templates.find(t => t.name === 'web-app') || selectedTemplate;
} else if (intentLower.includes('api') || intentLower.includes('server') || intentLower.includes('node')) {
  selectedTemplate = templates.find(t => t.name === 'node-api') || selectedTemplate;
} else if (intentLower.includes('cli') || intentLower.includes('tool')) {
  selectedTemplate = templates.find(t => t.name === 'cli-tool') || selectedTemplate;
}

// --- SOLOcoder SPEC SYNTHESIS ---
let spec = null;
if (useSolo) {
  spec = synthesizeSpec(intent);
  // Refine template by spec.type if no strong match
  if (selectedTemplate.name === 'default') {
    if (spec.type === 'web-app') selectedTemplate = templates.find(t => t.name === 'react-app') || selectedTemplate;
    else if (spec.type === 'api') selectedTemplate = templates.find(t => t.name === 'node-api') || selectedTemplate;
    else if (spec.type === 'game') selectedTemplate = templates.find(t => t.name === 'three-game') || selectedTemplate;
    else if (spec.type === 'cli') selectedTemplate = templates.find(t => t.name === 'cli-tool') || selectedTemplate;
    else if (spec.type === 'mobile') selectedTemplate = templates.find(t => t.name === 'mobile-app') || selectedTemplate;
  }
}

// --- CLI AESTHETICS ---
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
};

const log = (msg, color = colors.white) => console.log(`${color}${msg}${colors.reset}`);
const banner = () => {
  log(`\n${colors.magenta}🔮 UTL-XANDRIA FORGE v2.0${colors.reset}`);
  log(`${colors.cyan}=================================${colors.reset}`);
};

// --- FILE GENERATION ---
const distDir = path.join(outDir, 'dist');
// Clean dist if it exists (Genesis principle)
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

banner();
log(`Intent:   "${colors.yellow}${intent}${colors.reset}"`);
log(`Template: ${colors.green}${selectedTemplate.name}${colors.reset}`);
if (useSolo) log(`SOLOcoder: ${colors.magenta}enabled${colors.reset}`);
log(`${colors.cyan}=================================${colors.reset}\n`);

// Custom directives
const custom = parseCustomDirectives(intent)
{ const cfgDir = path.join(distDir, 'config'); if (!fs.existsSync(cfgDir)) fs.mkdirSync(cfgDir, { recursive: true }); }
fs.writeFileSync(path.join(distDir, 'config', 'custom.json'), JSON.stringify(custom, null, 2))

// --- OPERATOR LOGIC ---
// Pass active context to Fabric
applyOperators(intent, { outDir, distDir, kbDir, intent, brand: spec ? spec.brand : undefined, custom });

// --- QUALITY SCAFFOLDING ---
const ensure = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
ensure(path.join(distDir, 'docs'));
ensure(path.join(distDir, '.github', 'workflows'));
ensure(path.join(distDir, 'src'));
ensure(path.join(distDir, 'config'));
ensure(path.join(distDir, 'tests'));

const gitignore = `node_modules\n.dist\ndist\n.env\n*.log\n`;
if (!fs.existsSync(path.join(distDir, '.gitignore'))) fs.writeFileSync(path.join(distDir, '.gitignore'), gitignore);

const editorconfig = `root = true\n\n[*]\nindent_style = space\nindent_size = 2\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\n`;
if (!fs.existsSync(path.join(distDir, '.editorconfig'))) fs.writeFileSync(path.join(distDir, '.editorconfig'), editorconfig);

const ci = `name: CI\n\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n      - run: npm ci || echo 'no package.json yet'\n      - run: npm run build || echo 'no build script'\n      - run: npm test || echo 'no tests'\n`;
const ciPath = path.join(distDir, '.github', 'workflows', 'ci.yml');
if (!fs.existsSync(ciPath)) fs.writeFileSync(ciPath, ci);

// Write docs via SOLOcoder if enabled
if (useSolo && spec) {
  const prd = toPRD(spec);
  const arch = toArchitecture(spec);
  fs.writeFileSync(path.join(distDir, 'docs', 'PRD.md'), prd);
  fs.writeFileSync(path.join(distDir, 'docs', 'ARCHITECTURE.md'), arch);
  const branding = { name: spec.brand.name, slug: spec.brand.slug, palette: spec.brand.palette, tagline: spec.brand.tagline };
  fs.writeFileSync(path.join(distDir, 'config', 'branding.json'), JSON.stringify(branding, null, 2));
}

// README summary
const readmePath = path.join(distDir, 'README.md');
if (!fs.existsSync(readmePath)) {
  const readme = `# XANDRIA Artifact\n\nIntent: ${intent}\n\nTemplate: ${selectedTemplate.name}\nSOLOcoder: ${useSolo ? 'enabled' : 'disabled'}\n\n- See docs/PRD.md and docs/ARCHITECTURE.md for details.\n- Edit .github/workflows/ci.yml to customize CI.\n`;
  fs.writeFileSync(readmePath, readme);
}

// Extended quality: ESLint, Prettier, tests, Docker, husky
const eslintCfg = `module.exports = { env: { browser: true, node: true, es2022: true }, extends: ['eslint:recommended'], parserOptions: { ecmaVersion: 2022, sourceType: 'module' } }`;
const prettierCfg = `{ "printWidth": 100, "singleQuote": true, "semi": false }`;
const npmrc = `save-exact=true`;
const nvmrc = `20`;
const huskyPreCommit = `#!/usr/bin/env sh\nnpm run lint || exit 1\nnpm run format:check || exit 1\nnpm test || exit 0`;

fs.writeFileSync(path.join(distDir, '.eslintrc.cjs'), eslintCfg);
fs.writeFileSync(path.join(distDir, '.prettierrc.json'), prettierCfg);
fs.writeFileSync(path.join(distDir, '.npmrc'), npmrc);
fs.writeFileSync(path.join(distDir, '.nvmrc'), nvmrc);
ensure(path.join(distDir, '.husky'));
fs.writeFileSync(path.join(distDir, '.husky', 'pre-commit'), huskyPreCommit);

const pkgPath = path.join(distDir, 'package.json');
const hasPkg = fs.existsSync(pkgPath);
const pkg = hasPkg ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { name: 'xandria-artifact', type: 'module', scripts: {}, devDependencies: {} };

pkg.scripts = Object.assign({}, pkg.scripts, {
  lint: 'eslint .',
  format: 'prettier -w .',
  'format:check': 'prettier -c .',
  test: pkg.scripts && pkg.scripts.test ? pkg.scripts.test : (selectedTemplate.name.includes('react') ? 'vitest' : 'node --test')
});

pkg.devDependencies = Object.assign({}, pkg.devDependencies || {}, selectedTemplate.name.includes('react') ? { vitest: '^1.6.0' } : {});

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

const license = `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${process.env.USERNAME || 'Xandria'}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...`;
fs.writeFileSync(path.join(distDir, 'LICENSE'), license);
fs.writeFileSync(path.join(distDir, 'CODE_OF_CONDUCT.md'), '# Code of Conduct\n\nBe respectful. Collaborate. Report issues responsibly.');
fs.writeFileSync(path.join(distDir, 'SECURITY.md'), '# Security Policy\n\nReport vulnerabilities via issues or email. Avoid public disclosure before fix.');

if (selectedTemplate.name.includes('api')) {
  const dockerfile = `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nENV PORT=3000\nEXPOSE 3000\nCMD ["npm","start"]`;
  const compose = `services:\n  api:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production`;
  fs.writeFileSync(path.join(distDir, 'Dockerfile'), dockerfile);
  fs.writeFileSync(path.join(distDir, 'docker-compose.yml'), compose);
}

const reactTest = `import { describe, it, expect } from 'vitest'\ndescribe('smoke', () => { it('works', () => { expect(1 + 1).toBe(2) }) })`;
const nodeTest = `import { test } from 'node:test'\nimport assert from 'node:assert/strict'\ntest('smoke', () => { assert.equal(1 + 1, 2) })`;
fs.writeFileSync(path.join(distDir, 'tests', selectedTemplate.name.includes('react') ? 'smoke.test.jsx' : 'smoke.test.js'), selectedTemplate.name.includes('react') ? reactTest : nodeTest);

// Personalization: brand and palette applied to templates
if (useSolo && spec) {
  try {
    const brand = spec.brand
    const brandTitle = brand.name
    const brandSlug = brand.slug
    const palette = brand.palette

    const pkgPath3 = path.join(distDir, 'package.json')
    if (fs.existsSync(pkgPath3)) {
      const pkg3 = JSON.parse(fs.readFileSync(pkgPath3, 'utf8'))
      pkg3.name = brandSlug || pkg3.name
      fs.writeFileSync(pkgPath3, JSON.stringify(pkg3, null, 2))
    }

    const indexHtml = path.join(distDir, 'index.html')
    if (fs.existsSync(indexHtml)) {
      let content = fs.readFileSync(indexHtml, 'utf8')
      content = content.replace(/<title>[^<]*<\/title>/i, `<title>${brandTitle}</title>`)
      fs.writeFileSync(indexHtml, content)
    }

    const layoutPath = path.join(distDir, 'src', 'components', 'Layout.jsx')
    if (fs.existsSync(layoutPath)) {
      let content = fs.readFileSync(layoutPath, 'utf8')
      content = content.replace(/XANDRIA/g, brandTitle)
      fs.writeFileSync(layoutPath, content)
    }

    const cssPath = path.join(distDir, 'src', 'index.css')
    if (fs.existsSync(cssPath)) {
      let css = fs.readFileSync(cssPath, 'utf8')
      const inject = `:root{--primary:${palette.primary};--background:${palette.bg};--foreground:${palette.text}}\n`
      css = inject + css
      fs.writeFileSync(cssPath, css)
    }

    const publicDir2 = path.join(distDir, 'public')
    if (fs.existsSync(publicDir2)) {
      const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200"><rect x="0" y="0" width="600" height="200" fill="${palette.bg}"/><text x="50" y="120" font-size="72" font-family="Segoe UI, Arial, sans-serif" fill="${palette.primary}" letter-spacing="2">${brandTitle}</text><rect x="50" y="130" width="300" height="6" fill="${palette.accent}"/></svg>`
      fs.writeFileSync(path.join(publicDir2, 'logo.svg'), logoSvg)
    }

    const entities = spec.intent.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean).filter(w => !['app','api','service','tool','game','web','site','mobile','dashboard'].includes(w))
    fs.writeFileSync(path.join(distDir, 'config', 'entities.json'), JSON.stringify({ entities }, null, 2))
  } catch {}
}

// Additional game extras
if (selectedTemplate.name.includes('rpg') || selectedTemplate.name.includes('fps') || selectedTemplate.name.includes('three') || intentLower.includes('game')) {
  const data = {
    story: custom.story || 'Explore the world and defeat enemies.',
    quests: (custom.quests || []).map((q, i) => ({ id: `q_${i + 1}`, title: q, desc: q })),
    inventory: (custom.items || []).map(it => ({ id: it.id, name: it.name }))
  }
  const gameExtrasPath = path.join(distDir, 'src', 'data.json')
  ensure(path.dirname(gameExtrasPath))
  fs.writeFileSync(gameExtrasPath, JSON.stringify(data, null, 2))
  if (custom.player) {
    const controls = {
      forward: "KeyW",
      backward: "KeyS",
      left: "KeyA",
      right: "KeyD",
      jump: "Space",
      fire: "Mouse0",
      reload: "KeyR",
      MorphBird: "KeyB",
      MorphSpider: "KeyV",
      ToggleFlight: "KeyF",
      JetpackToggle: "KeyJ",
      Grow: "Equal",
      Shrink: "Minus"
    }
    const ctrlPath = path.join(distDir, 'src', 'controls.json')
    ensure(path.dirname(ctrlPath))
    if (!fs.existsSync(ctrlPath)) fs.writeFileSync(ctrlPath, JSON.stringify(controls, null, 2))
  }
}

// Operators already invoked with custom above

let generatedFiles = [];
if (selectedTemplate && selectedTemplate.files) {
  for (const [filename, content] of Object.entries(selectedTemplate.files)) {
    const filePath = path.join(distDir, filename);
    
    // Ensure nested directories exist
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    let finalContent = String(content).replace(/{{INTENT}}/g, intent);
    
    // Advanced Variable Injection
    finalContent = finalContent.replace(/{{TIMESTAMP}}/g, new Date().toISOString());
    finalContent = finalContent.replace(/{{YEAR}}/g, new Date().getFullYear());
    finalContent = finalContent.replace(/{{AUTHOR}}/g, process.env.USERNAME || 'Xandria Forge');
    
    fs.writeFileSync(filePath, finalContent);
    generatedFiles.push(filename);
    log(`✨ Forge: ${colors.blue}${filename}${colors.reset}`);
  }
}

// Post-process package.json after template writes
try {
  const pkgPath2 = path.join(distDir, 'package.json');
  if (fs.existsSync(pkgPath2)) {
    const pkg2 = JSON.parse(fs.readFileSync(pkgPath2, 'utf8'));
    pkg2.scripts = Object.assign({}, pkg2.scripts || {}, {
      lint: 'eslint .',
      format: 'prettier -w .',
      'format:check': 'prettier -c .',
      test: pkg2.scripts && pkg2.scripts.test ? pkg2.scripts.test : (selectedTemplate.name.includes('react') ? 'vitest' : 'node --test')
    });
    if (selectedTemplate.name.includes('react')) {
      pkg2.devDependencies = Object.assign({}, pkg2.devDependencies || {}, { vitest: '^1.6.0' });
    }
    fs.writeFileSync(pkgPath2, JSON.stringify(pkg2, null, 2));
  }
} catch {}

const stamp = new Date().toISOString();
const payload = { 
  intent, 
  heal, 
  stamp, 
  templateUsed: selectedTemplate.name || 'none',
  generatedFiles,
  axiomsCount: axioms.length,
  soloEnabled: !!useSolo,
  spec: spec ? { id: spec.id, type: spec.type, wantsLLM: spec.wantsLLM } : null
};
fs.writeFileSync(path.join(outDir, 'artifact.json'), JSON.stringify(payload, null, 2));
