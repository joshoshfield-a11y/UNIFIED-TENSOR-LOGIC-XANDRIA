import fs from 'fs';
import path from 'path';

console.log("DEBUG: Loading operators.mjs v2");

// Helper to ensure dir exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Helper to write if missing
const writeIfMissing = (filePath, content) => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
};

export const OPERATORS = [
  // --- I. GENESIS (Creation) ---
  { id: 1, name: 'Void', action: (ctx) => console.log('  [OP-01] Void: Clearing context...') },
  { id: 2, name: 'Spark', action: (ctx) => console.log('  [OP-02] Spark: Initializing sequence...') },
  { id: 3, name: 'Intent', action: (ctx) => console.log(`  [OP-03] Intent: Parsing "${ctx.intent}"...`) },
  { id: 4, name: 'Seed', action: (ctx) => console.log('  [OP-04] Seed: Loading templates...') },
  { id: 5, name: 'Root', action: (ctx) => console.log(`  [OP-05] Root: Binding to ${ctx.outDir}`) },
  { id: 6, name: 'Stem', action: (ctx) => console.log('  [OP-06] Stem: Establishing core logic trunk...') },
  { id: 7, name: 'Leaf', action: (ctx) => console.log('  [OP-07] Leaf: Preparing output nodes...') },
  { 
    id: 8, name: 'Bloom', 
    action: (ctx) => {
       const intentLower = ctx.intent.toLowerCase();
       // Game Assets (Textures & Icons)
      if (intentLower.includes('game') || intentLower.includes('rpg') || intentLower.includes('fps')) {
          if (ctx.distDir) {
            const assetsDir = path.join(ctx.distDir, 'public/assets'); 
            ensureDir(assetsDir);
            
            // Texture Gen (Keep existing logic)
            const createTexture = (r, g, b, noise = 20) => {
                 const width = 64;
                 const height = 64;
                 const headerSize = 54;
                 const dataSize = width * height * 3;
                 const fileSize = headerSize + dataSize;
                 const buffer = Buffer.alloc(fileSize);
                 buffer.write('BM');
                 buffer.writeUInt32LE(fileSize, 2);
                 buffer.writeUInt32LE(54, 10);
                 buffer.writeUInt32LE(40, 14);
                 buffer.writeUInt32LE(width, 18);
                 buffer.writeUInt32LE(height, 22);
                 buffer.writeUInt16LE(1, 26);
                 buffer.writeUInt16LE(24, 28);
                 let offset = 54;
                 for (let i = 0; i < width * height; i++) {
                     const n = (Math.random() - 0.5) * noise;
                     buffer[offset] = Math.max(0, Math.min(255, b + n));
                     buffer[offset + 1] = Math.max(0, Math.min(255, g + n));
                     buffer[offset + 2] = Math.max(0, Math.min(255, r + n));
                     offset += 3;
                 }
                 return buffer;
            };

            const landscape = (ctx.custom && ctx.custom.landscape) || '';
            const textures = landscape.includes('desert') ? {
                'sand.bmp': createTexture(237, 201, 175, 25),
                'rock.bmp': createTexture(120, 110, 100, 30),
                'sky.bmp': createTexture(135, 206, 235, 10)
            } : landscape.includes('snow') ? {
                'snow.bmp': createTexture(240, 240, 240, 10),
                'ice.bmp': createTexture(180, 220, 255, 10),
                'sky.bmp': createTexture(180, 220, 255, 10)
            } : landscape.includes('forest') ? {
                'grass.bmp': createTexture(34, 139, 34, 40),
                'wood.bmp': createTexture(139, 69, 19, 30),
                'sky.bmp': createTexture(135, 206, 235, 10)
            } : {
                'grass.bmp': createTexture(34, 139, 34, 40),
                'stone.bmp': createTexture(128, 128, 128, 30),
                'dirt.bmp': createTexture(101, 67, 33, 40),
                'sky.bmp': createTexture(135, 206, 235, 10),
                'metal.bmp': createTexture(192, 192, 192, 10),
                'wood.bmp': createTexture(139, 69, 19, 30)
            };

            for (const [name, buffer] of Object.entries(textures)) {
              const p = path.join(assetsDir, name);
              if (!fs.existsSync(p)) fs.writeFileSync(p, buffer);
            }
          }
      }
      
      // App Assets (Logos/Icons)
       if (intentLower.includes('app') || intentLower.includes('ui') || intentLower.includes('dashboard')) {
          if (ctx.distDir) {
            // Generate a simple SVG Logo
            const color = (ctx.brand && ctx.brand.palette && ctx.brand.palette.primary) || '#00ff41';
            const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8">
              <rect x="10" y="10" width="80" height="80" rx="20" stroke="${color}" />
              <path d="M30 30 L70 70 M70 30 L30 70" stroke="${color}" />
            </svg>`;
            const publicDir = path.join(ctx.distDir, 'public');
            ensureDir(publicDir);
            writeIfMissing(path.join(publicDir, 'logo.svg'), logoSvg);
          }
      }

      if (ctx.custom && Array.isArray(ctx.custom.items) && ctx.custom.items.length && ctx.distDir) {
        const itemsDir = path.join(ctx.distDir, 'public', 'items')
        ensureDir(itemsDir)
        for (const it of ctx.custom.items) {
          const d = it.descriptor || {}
          const name = String(it.name || it.id).toLowerCase().replace(/[^a-z0-9]+/g,'-')
          const stroke = (ctx.brand && ctx.brand.palette && ctx.brand.palette.primary) || '#00ff41'
          let svg = ''
          if (d.kind === 'sword') {
            const curve = d.curved ? 'Q 50 20 80 80' : 'L 80 80'
            svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 ${curve}" stroke="${stroke}" stroke-width="6" fill="none"/></svg>`
          } else if (d.kind === 'gun' || d.kind === 'rifle') {
            const barrels = Math.max(1, d.barrels || 1)
            let paths = ''
            for (let i=0;i<barrels;i++){ const y = 20 + i*10; paths += `<rect x="20" y="${y}" width="60" height="6" fill="${stroke}"/>` }
            svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${paths}</svg>`
          } else {
            svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" stroke="${stroke}" stroke-width="6" fill="none"/></svg>`
          }
          const p = path.join(itemsDir, `${name}.svg`)
          if (!fs.existsSync(p)) fs.writeFileSync(p, svg)
        }
      }
    } 
  },
  { id: 9, name: 'Wither', action: (ctx) => console.log('  [OP-09] Wither: Cleaning temporary artifacts...') },
  { 
    id: 10, name: 'Structure', 
    action: (ctx) => {
      console.log('  [OP-10] Structure: Enforcing directory schema...');
      if (ctx.distDir) {
        ['assets', 'lib', 'src', 'config', 'tests', 'public', 'scripts', 'docs', path.join('.github','workflows')]
          .forEach(d => ensureDir(path.join(ctx.distDir, d)));
      }
    } 
  },

  // --- II. FABRIC (Logic & Flow) ---
  { id: 11, name: 'Link', action: (ctx) => console.log('  [OP-11] Link: Resolving dependencies...') },
  { 
    id: 12, name: 'Weave', 
    action: (ctx) => {
      console.log('  [OP-12] Weave: Composing function modules...');
      if (ctx.distDir && ctx.intent.toLowerCase().includes('llm')) {
        const envPath = path.join(ctx.distDir, '.env');
        // Inject current env vars if available, or placeholder
        const content = `OPENAI_API_KEY=${process.env.OPENAI_API_KEY || 'sk-placeholder'}\nANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY || 'sk-ant-placeholder'}`;
        writeIfMissing(envPath, content);
      }
    } 
  },
  { id: 13, name: 'Knot', action: (ctx) => console.log('  [OP-13] Knot: Binding state management...') },
  { id: 14, name: 'Thread', action: (ctx) => console.log('  [OP-14] Thread: Initializing async workers...') },
  { 
    id: 15, name: 'Patch', 
    action: (ctx) => {
      console.log('  [OP-15] Patch: Injecting error boundaries...');
      if (ctx.distDir) writeIfMissing(path.join(ctx.distDir, 'src/error.js'), 'export const handleError = (err) => console.error("[Xandria Patch]", err);');
    }
  },
  { id: 16, name: 'Stitch', action: (ctx) => console.log('  [OP-16] Stitch: Bundling modules...') },
  { id: 17, name: 'Pattern', action: (ctx) => console.log('  [OP-17] Pattern: Detecting repetition...') },
  { id: 18, name: 'Texture', action: (ctx) => console.log('  [OP-18] Texture: Applying data types...') },
  { 
    id: 19, name: 'Dye', 
    action: (ctx) => {
      console.log('  [OP-19] Dye: Configuring environment...');
      if (ctx.distDir) writeIfMissing(path.join(ctx.distDir, '.env.example'), 'PORT=3000\nNODE_ENV=development');
    }
  },
  { id: 20, name: 'Cut', action: (ctx) => console.log('  [OP-20] Cut: Pruning dead code branch...') },

  // --- III. TENSOR (Data & Math) ---
  { id: 21, name: 'Vector', action: (ctx) => console.log('  [OP-21] Vector: Allocating arrays...') },
  { 
    id: 22, name: 'Matrix', 
    action: (ctx) => {
      console.log('  [OP-22] Matrix: Configuring 3D scene graph...');
      if (ctx.distDir && ctx.intent.toLowerCase().includes('3d')) {
        const sceneConfig = {
          gravity: [0, -9.8, 0],
          fog: { color: "#000000", density: 0.05 },
          physics: true
        };
        writeIfMissing(path.join(ctx.distDir, 'src/world.config.json'), JSON.stringify(sceneConfig, null, 2));
      }
    }
  },
  { id: 23, name: 'Scalar', action: (ctx) => console.log('  [OP-23] Scalar: Setting constants...') },
  { 
    id: 24, name: 'Tensor', 
    action: (ctx) => {
      console.log('  [OP-24] Tensor: Analyzing intent for hyper-configuration...');
      if (ctx.distDir) {
        const intent = ctx.intent.toLowerCase();
        
        // --- DEEP PARSING LOGIC ---
        
        // 1. Theme & Atmosphere
        let theme = 'default';
        let sky = 'day';
        let groundTexture = 'grass.bmp';
        let groundColor = '#101010';
        let fogColor = '#cccccc';
        let fogDistance = 50;
        let ambience = 'peaceful';
        
        if (intent.includes('space') || intent.includes('scifi') || intent.includes('cyber') || intent.includes('future')) {
            theme = 'space';
            sky = 'space';
            groundTexture = 'metal.bmp';
            groundColor = '#000000';
            fogColor = '#000000';
            ambience = 'scifi_drone';
        } else if (intent.includes('forest') || intent.includes('nature') || intent.includes('jungle')) {
            theme = 'forest';
            sky = 'cloudy';
            groundTexture = 'grass.bmp';
            groundColor = '#002200';
            fogColor = '#001100';
            ambience = 'birds_chirping';
        } else if (intent.includes('desert') || intent.includes('sand') || intent.includes('wasteland')) {
            theme = 'desert';
            sky = 'day';
            groundTexture = 'dirt.bmp';
            groundColor = '#332200';
            fogColor = '#ccaa66';
            ambience = 'wind_blowing';
        } else if (intent.includes('dungeon') || intent.includes('dark') || intent.includes('cave')) {
            theme = 'dungeon';
            sky = 'none'; 
            groundTexture = 'stone.bmp';
            groundColor = '#111111';
            fogColor = '#000000';
            fogDistance = 20; 
            ambience = 'water_drips';
        } else if (intent.includes('winter') || intent.includes('snow') || intent.includes('ice')) {
            theme = 'winter';
            sky = 'cloudy';
            groundTexture = 'stone.bmp'; 
            groundColor = '#eeeeee';
            fogColor = '#ffffff';
            ambience = 'cold_wind';
        }

        // 2. Colors & Visual Style
        let playerColor = '#00ff41'; 
        let enemyColor = '#ff0055';
        let lightColor = '#ffffff';
        let ambientIntensity = 0.5;
        let uiStyle = 'modern'; // modern, retro, minimal

        if (intent.includes('red')) { playerColor = 'red'; lightColor = '#ffaaaa'; }
        if (intent.includes('blue')) { playerColor = 'cyan'; lightColor = '#aaccff'; }
        if (intent.includes('purple')) { playerColor = '#aa00ff'; lightColor = '#eebbff'; }
        if (intent.includes('neon')) { playerColor = '#ff00ff'; enemyColor = '#00ffff'; ambientIntensity = 0.2; }
        if (intent.includes('dark') || intent.includes('horror')) { ambientIntensity = 0.1; lightColor = '#555555'; uiStyle = 'minimal'; }
        if (intent.includes('retro') || intent.includes('pixel') || intent.includes('arcade')) { uiStyle = 'retro'; }

        // 3. Gameplay Mechanics & Physics
        let playerSpeed = 5;
        let enemySpeed = 2;
        let enemyCount = 5;
        let jumpHeight = 10;
        let gravity = -9.8;
        let difficulty = 'normal';

        if (intent.includes('fast') || intent.includes('hyper')) { playerSpeed = 15; enemySpeed = 8; jumpHeight = 15; }
        if (intent.includes('slow') || intent.includes('heavy')) { playerSpeed = 3; enemySpeed = 1; jumpHeight = 5; }
        if (intent.includes('hard') || intent.includes('nightmare')) { enemyCount = 20; enemySpeed = 4; difficulty = 'hard'; }
        if (intent.includes('easy') || intent.includes('casual')) { enemyCount = 3; enemySpeed = 1; difficulty = 'easy'; }
        if (intent.includes('low grav') || intent.includes('moon')) { gravity = -2.0; jumpHeight = 20; }
        if (intent.includes('horde')) { enemyCount = 50; }

        // 4. Entities & Items
        const customEnemies = (ctx.custom && ctx.custom.enemies) || [];
        const enemyType = customEnemies[0] ? String(customEnemies[0]).charAt(0).toUpperCase() + String(customEnemies[0]).slice(1) : (
                          intent.includes('zombie') ? 'Zombie' : 
                          intent.includes('robot') ? 'Robot' : 
                          intent.includes('alien') ? 'Alien' : 
                          intent.includes('demon') ? 'Demon' : 
                          intent.includes('soldier') ? 'Soldier' : 'Goblin');

        const weaponType = intent.includes('sword') ? 'sword' :
                           intent.includes('gun') ? 'gun' :
                           intent.includes('magic') ? 'staff' : 'fist';
        
        // 5. Story & Narrative
        let title = "Xandria World";
        let questTitle = "Survive";
        let questDesc = `Defeat the ${enemyType}s.`;
        
        if (intent.includes('save')) { questTitle = "Rescue Mission"; questDesc = "Find and save the target."; }
        if (intent.includes('explore')) { questTitle = "Exploration"; questDesc = "Map out the unknown territory."; }
        if (intent.includes('kill') || intent.includes('hunt')) { questTitle = "Bounty Hunt"; questDesc = `Eliminate ${enemyCount} ${enemyType}s.`; }
        if (intent.includes('escape')) { questTitle = "Escape"; questDesc = "Find the exit before time runs out."; }
        
        // 6. Player Capabilities (Infinite Possibility)
        const playerAbilities = {
            canFly: intent.includes('fly') || intent.includes('bird') || intent.includes('wing') || intent.includes('angel'),
            canResize: intent.includes('size') || intent.includes('shrink') || intent.includes('grow') || intent.includes('morph') || intent.includes('ant') || intent.includes('giant'),
            canClimb: intent.includes('climb') || intent.includes('spider') || intent.includes('wall'),
            hasJetpack: intent.includes('jetpack') || intent.includes('thrust') || intent.includes('rocket'),
            hasMinigun: intent.includes('minigun') || intent.includes('gatling'),
            morphs: [],
            size: { min: 0.5, max: 3, default: 1, speed: 0.1 },
            weapons: []
        };

        if (intent.includes('bird')) playerAbilities.morphs.push('bird');
        if (intent.includes('spider')) playerAbilities.morphs.push('spider');
        if (intent.includes('ball')) playerAbilities.morphs.push('ball');
        
        if (ctx.custom && ctx.custom.player) {
            const p = ctx.custom.player;
            if (Array.isArray(p.morphs)) playerAbilities.morphs = Array.from(new Set([...(playerAbilities.morphs||[]), ...p.morphs]));
            if (p.flight) playerAbilities.canFly = true;
            if (p.wallClimb) playerAbilities.canClimb = true;
            if (p.jetpack) playerAbilities.hasJetpack = true;
            if (p.sizeControl) playerAbilities.canResize = true;
            if (p.size && typeof p.size === 'object') {
                playerAbilities.size = {
                    min: typeof p.size.min === 'number' ? p.size.min : playerAbilities.size.min,
                    max: typeof p.size.max === 'number' ? p.size.max : playerAbilities.size.max,
                    default: typeof p.size.default === 'number' ? p.size.default : playerAbilities.size.default,
                    speed: typeof p.size.speed === 'number' ? p.size.speed : playerAbilities.size.speed
                };
            }
            if (Array.isArray(p.weapons)) {
                for (const w of p.weapons) {
                    playerAbilities.weapons.push({ name: w.name || 'weapon', rateOfFire: w.rateOfFire || 1, damage: w.damage || 5 });
                    if ((w.name || '').toLowerCase().includes('minigun')) playerAbilities.hasMinigun = true;
                }
            }
        }

        // --- Config Assembly ---
        const config = {
          gameTitle: title,
          version: "1.0.0",
          theme,
          sky,
          ambience,
          // Visuals
          groundTexture,
          groundColor,
          fogColor,
          fogDistance,
          playerColor,
          enemyColor,
          lightColor,
          ambientIntensity,
          uiStyle,
          // Mechanics
          playerSpeed,
          enemySpeed,
          jumpHeight,
          gravity,
          difficulty,
          // Capabilities
          player: playerAbilities,
          // Entities
          enemies: [],
          items: [],
          quests: []
        };

        // If minigun, add to items
        if (playerAbilities.hasMinigun) {
            config.items.push({
                id: 'w_minigun', name: 'Minigun', type: 'weapon', value: 5, rateOfFire: 0.05, x: 0, z: 0
            });
        }

        // Generate Enemies
        for(let i=0; i<enemyCount; i++) {
            const typeVar = (ctx.custom && ctx.custom.enemies && ctx.custom.enemies.length) ? String(ctx.custom.enemies[i % ctx.custom.enemies.length]).charAt(0).toUpperCase() + String(ctx.custom.enemies[i % ctx.custom.enemies.length]).slice(1) : enemyType;
            config.enemies.push({
                id: i,
                type: typeVar,
                hp: difficulty === 'hard' ? 200 : 100,
                x: (Math.random() - 0.5) * (intent.includes('small') ? 20 : 60),
                z: (Math.random() - 0.5) * (intent.includes('small') ? 20 : 60)
            });
        }

        // Generate Items
        const itemCount = 5;
        for(let i=0; i<itemCount; i++) {
            const isWeapon = Math.random() > 0.5;
            config.items.push({
                id: `item_${i}`,
                name: isWeapon ? `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${weaponType}` : 'Health Potion',
                type: isWeapon ? 'weapon' : 'consumable',
                value: isWeapon ? 10 + Math.floor(Math.random() * 10) : 20,
                x: (Math.random() - 0.5) * 40,
                z: (Math.random() - 0.5) * 40
            });
        }
        if (ctx.custom && ctx.custom.items && ctx.custom.items.length) {
          for (const it of ctx.custom.items) {
            const d = it.descriptor || {}
            const type = (d.kind && (d.kind === 'sword' || d.kind === 'gun' || d.kind === 'rifle' || d.kind === 'axe' || d.kind === 'dagger' || d.kind === 'bow' || d.kind === 'staff')) ? 'weapon' : 'custom'
            const value = d.damage || 0
            const rof = d.rateOfFire || 1
            const behavior = d.projectileBehavior || 'straight'
            config.items.push({ id: it.id, name: it.name, type, value, x: 0, z: 0, barrels: d.barrels || 0, adjectives: d.adjectives || [], abilities: d.abilities || [], rateOfFire: rof, projectileBehavior: behavior })
          }
        }
        
        // Generate Quests
        if (ctx.custom && ctx.custom.quests && ctx.custom.quests.length) {
          config.quests = ctx.custom.quests.map((q, i) => ({ id: `q_${i+1}`, title: q, desc: q, target: enemyCount, reward: 1000 }))
        } else {
          config.quests.push({ id: 'main_quest', title: questTitle, desc: questDesc, target: enemyCount, reward: 1000 })
        }

        const configPath = path.join(ctx.distDir, 'src/gameConfig.json');
        ensureDir(path.dirname(configPath));
        writeIfMissing(configPath, JSON.stringify(config, null, 2));

        // Legacy Support for rpg-three (ensuring it reads this new data)
        if (intent.includes('rpg') || intent.includes('game')) {
             const rpgData = {
                stats: { hp: 100, mp: 50, str: 10, dex: 10 },
                inventory: (ctx.custom && ctx.custom.items && ctx.custom.items.length) ? ctx.custom.items.map(it => ({ id: it.id, name: it.name })) : config.items.filter(i => i.type === 'weapon').slice(0, 2),
                quests: config.quests,
                story: (ctx.custom && ctx.custom.story) || ''
              };
             // Overwrite data.json to ensure it syncs with gameConfig
             fs.writeFileSync(path.join(ctx.distDir, 'src/data.json'), JSON.stringify(rpgData, null, 2));
        }
        
        // UI Config for Apps
        if (intent.includes('app') || intent.includes('ui')) {
            const uiConfig = {
                theme: uiStyle,
                primaryColor: playerColor, // Reuse as primary brand color
                secondaryColor: enemyColor, // Reuse as accent
                borderRadius: uiStyle === 'retro' ? '0px' : '8px',
                fontFamily: uiStyle === 'retro' ? '"Press Start 2P", monospace' : 'Segoe UI, sans-serif'
            };
            const uiPath = path.join(ctx.distDir, 'src/uiConfig.json');
            ensureDir(path.dirname(uiPath));
            writeIfMissing(uiPath, JSON.stringify(uiConfig, null, 2));
        }
      }
    } 
  },
  { id: 25, name: 'Flux', action: (ctx) => console.log('  [OP-25] Flux: Opening data streams...') },
  { id: 26, name: 'Delta', action: (ctx) => console.log('  [OP-26] Delta: Tracking changes...') },
  { id: 27, name: 'Sigma', action: (ctx) => console.log('  [OP-27] Sigma: Aggregating metrics...') },
  { id: 28, name: 'Pi', action: (ctx) => console.log('  [OP-28] Pi: Calculating cycles...') },
  { id: 29, name: 'Alpha', action: (ctx) => console.log('  [OP-29] Alpha: Sorting start points...') },
  { id: 30, name: 'Omega', action: (ctx) => console.log('  [OP-30] Omega: Defining end states...') },

  // --- IV. INTERFACE (Interaction) ---
  { id: 31, name: 'View', action: (ctx) => console.log('  [OP-31] View: Rendering layout...') },
  { id: 32, name: 'Click', action: (ctx) => console.log('  [OP-32] Click: Binding events...') },
  { 
    id: 33, name: 'Touch', 
    action: (ctx) => {
      console.log('  [OP-33] Touch: Enabling mobile gestures...');
      if (ctx.distDir && ctx.intent.toLowerCase().includes('mobile')) {
        const manifest = {
          name: (ctx.brand && ctx.brand.name) || "Xandria App",
          short_name: (ctx.brand && ctx.brand.slug) || "Xandria",
          start_url: "/",
          display: "standalone",
          background_color: (ctx.brand && ctx.brand.palette && ctx.brand.palette.bg) || "#000000",
          theme_color: (ctx.brand && ctx.brand.palette && ctx.brand.palette.primary) || "#00ff00",
          icons: [{ src: "assets/icon.png", sizes: "192x192", type: "image/png" }]
        };
        const p = path.join(ctx.distDir, 'public/manifest.json');
        ensureDir(path.dirname(p));
        writeIfMissing(p, JSON.stringify(manifest, null, 2));
      }
    }
  },
  { 
    id: 34, name: 'Key', 
    action: (ctx) => {
      console.log('  [OP-34] Key: Mapping input controls...');
      if (ctx.distDir) {
        const base = {
          forward: "KeyW",
          backward: "KeyS",
          left: "KeyA",
          right: "KeyD",
          jump: "Space",
          fire: "Mouse0",
          reload: "KeyR"
        };
        const p = path.join(ctx.distDir, 'src/controls.json');
        const current = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
        const controls = Object.assign({}, base, current);
        if (ctx.custom && ctx.custom.player) {
          controls.MorphBird = controls.MorphBird || "KeyB";
          controls.MorphSpider = controls.MorphSpider || "KeyV";
          controls.ToggleFlight = controls.ToggleFlight || "KeyF";
          controls.JetpackToggle = controls.JetpackToggle || "KeyJ";
          controls.Grow = controls.Grow || "Equal";
          controls.Shrink = controls.Shrink || "Minus";
        }
        ensureDir(path.dirname(p));
        writeIfMissing(p, JSON.stringify(controls, null, 2));
      }
    } 
  },
  { id: 35, name: 'Scroll', action: (ctx) => console.log('  [OP-35] Scroll: Configuring navigation...') },
  { id: 36, name: 'Focus', action: (ctx) => console.log('  [OP-36] Focus: Managing attention states...') },
  { id: 37, name: 'Blur', action: (ctx) => console.log('  [OP-37] Blur: Handling backgrounding...') },
  { id: 38, name: 'Hover', action: (ctx) => console.log('  [OP-38] Hover: Adding interactive cues...') },
  { id: 39, name: 'Drag', action: (ctx) => console.log('  [OP-39] Drag: Enabling mechanics...') },
  { 
    id: 40, name: 'Interface', 
    action: (ctx) => {
      console.log('  [OP-40] Interface: Optimizing UX layer...');
      if (ctx.distDir) {
        const cssPath = path.join(ctx.distDir, 'base.css');
        const p = (ctx.brand && ctx.brand.palette) || { primary: '#00ff41', bg: '#0d0208', text: '#e0e0e0', secondary: '#008F11' };
        const neonTheme = `
/* Xandria Neon UI */
:root { 
  --primary: ${p.primary}; 
  --secondary: ${p.secondary || '#008F11'};
  --bg: ${p.bg}; 
  --surface: #1a1a1a;
  --text: ${p.text};
}
body { 
  background: var(--bg); 
  color: var(--text); 
  font-family: 'Segoe UI', system-ui, sans-serif; 
  margin: 0;
}
button {
  background: var(--surface);
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 2px;
}
button:hover {
  background: var(--primary);
  color: var(--bg);
  box-shadow: 0 0 15px var(--primary);
}
        `;
        writeIfMissing(cssPath, neonTheme.trim());
      }
    } 
  },

  // --- V. NETWORK (Communication) ---
  { id: 41, name: 'Signal', action: (ctx) => console.log('  [OP-41] Signal: Emitting events...') },
  { id: 42, name: 'Echo', action: (ctx) => console.log('  [OP-42] Echo: Setting up responses...') },
  { id: 43, name: 'Pulse', action: (ctx) => console.log('  [OP-43] Pulse: checking heartbeats...') },
  { id: 44, name: 'Wave', action: (ctx) => console.log('  [OP-44] Wave: Broadcasting state...') },
  { id: 45, name: 'Sync', action: (ctx) => console.log('  [OP-45] Sync: Awaiting consistency...') },
  { id: 46, name: 'Push', action: (ctx) => console.log('  [OP-46] Push: Uploading logic...') },
  { id: 47, name: 'Pull', action: (ctx) => console.log('  [OP-47] Pull: Fetching resources...') },
  { 
    id: 48, name: 'Bind', 
    action: (ctx) => {
      console.log('  [OP-48] Bind: Opening sockets...');
      if (ctx.distDir && ctx.intent.toLowerCase().includes('multiplayer')) {
        // Generate Client-Side Socket Logic
        const clientSocket = `
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
socket.on("connect", () => { console.log("Connected:", socket.id); });
export default socket;
        `;
        const p = path.join(ctx.distDir, 'src/socket.js');
        ensureDir(path.dirname(p));
        writeIfMissing(p, clientSocket.trim());
      }
    } 
  },
  { 
    id: 49, name: 'Route', 
    action: (ctx) => {
      console.log('  [OP-49] Route: Defining paths...');
      if (ctx.distDir) writeIfMissing(path.join(ctx.distDir, 'routes.json'), JSON.stringify({ "/": "index.html", "/api": "server.js" }, null, 2));
    }
  },
  { id: 50, name: 'Gate', action: (ctx) => console.log('  [OP-50] Gate: Configuring firewall...') },

  // --- VI. SECURITY (Guardians) ---
  { 
    id: 51, name: 'Lock', 
    action: (ctx) => {
      console.log('  [OP-51] Lock: Applying security headers...');
      if (ctx.distDir) writeIfMissing(path.join(ctx.distDir, 'security.headers'), 'X-Frame-Options: DENY\nX-Content-Type-Options: nosniff');
    }
  },
  { id: 52, name: 'Key', action: (ctx) => console.log('  [OP-52] Key: Generating secrets...') },
  { id: 53, name: 'Wall', action: (ctx) => console.log('  [OP-53] Wall: Blocking intruders...') },
  { id: 54, name: 'Pass', action: (ctx) => console.log('  [OP-54] Pass: Whitelisting access...') },
  { id: 55, name: 'Mask', action: (ctx) => console.log('  [OP-55] Mask: Obfuscating data...') },
  { id: 56, name: 'Trace', action: (ctx) => console.log('  [OP-56] Trace: Enabling audit logs...') },
  { id: 57, name: 'Audit', action: (ctx) => console.log('  [OP-57] Audit: Verifying integrity...') },
  { id: 58, name: 'Purge', action: (ctx) => console.log('  [OP-58] Purge: Sanitizing inputs...') },
  { id: 59, name: 'Shield', action: (ctx) => console.log('  [OP-59] Shield: Scanning for vulnerabilities...') },
  { id: 60, name: 'Vault', action: (ctx) => console.log('  [OP-60] Vault: Accessing knowledge base...') },

  // --- VII. SEAL (Finalization) ---
  { id: 61, name: 'Measure', action: (ctx) => console.log('  [OP-61] Measure: Quantifying entropy...') },
  { id: 62, name: 'Reflect', action: (ctx) => console.log('  [OP-62] Reflect: Analyzing self...') },
  { id: 63, name: 'Heal', action: (ctx) => console.log('  [OP-63] Heal: Repairing defects...') },
  { id: 64, name: 'Optimize', action: (ctx) => console.log('  [OP-64] Optimize: Minifying assets...') },
  { id: 65, name: 'Cache', action: (ctx) => console.log('  [OP-65] Cache: Persisting state...') },
  { 
    id: 66, name: 'Deploy', 
    action: (ctx) => {
      console.log('  [OP-66] Deploy: Preparing artifact for export...');
      if (ctx.distDir) {
        // Mock deployment script
        const deployScript = `
#!/bin/bash
echo "Deploying Artifact..."
echo "1. Installing dependencies..."
echo "2. Building..."
echo "3. Exporting to /dist/build..."
echo "Deploy Complete!"
        `;
        writeIfMissing(path.join(ctx.distDir, 'deploy.sh'), deployScript.trim());
      }
    } 
  },
  { id: 67, name: 'Archive', action: (ctx) => console.log('  [OP-67] Archive: Backing up source...') },
  { id: 68, name: 'Cycle', action: (ctx) => console.log('  [OP-68] Cycle: Restarting loop...') },
  { id: 69, name: 'Awaken', action: (ctx) => console.log('  [OP-69] Awaken: System is conscious.') },
  { id: 70, name: 'Ascend', action: (ctx) => console.log('  [OP-70] Ascend: Version bump...') },
  { id: 71, name: 'Eternal', action: (ctx) => console.log('  [OP-71] Eternal: Immutable lock...') },
  { id: 72, name: 'Seal', action: (ctx) => console.log('  [OP-72] Seal: Finalizing artifact...') },
];

export function applyOperators(intent, ctx) {
  console.log('\n--- INVOKING OPERATORS ---');
  const lower = String(intent).toLowerCase();
  
  // Always run Genesis ops (1-4)
  OPERATORS.find(o => o.id === 1)?.action(ctx);
  OPERATORS.find(o => o.id === 3)?.action(ctx);

  // Auto-trigger Logic for Games & Apps
  if (lower.includes('rpg') || lower.includes('fps') || lower.includes('game') || lower.includes('shooter') || lower.includes('character') || lower.includes('player') || lower.includes('playable')) {
      OPERATORS.find(o => o.id === 8)?.action(ctx);  // Bloom (Assets)
      OPERATORS.find(o => o.id === 24)?.action(ctx); // Tensor (Config)
      OPERATORS.find(o => o.id === 40)?.action(ctx); // Interface (CSS)
  }
  
  // Auto-trigger for Apps/Services
  if (lower.includes('app') || lower.includes('dashboard') || lower.includes('api') || lower.includes('service') || lower.includes('cli')) {
       OPERATORS.find(o => o.id === 8)?.action(ctx);  // Bloom (Assets - Logo)
       OPERATORS.find(o => o.id === 19)?.action(ctx); // Dye (Env Vars)
       OPERATORS.find(o => o.id === 10)?.action(ctx); // Structure (Folders)
  }

  const hits = [];
  for (const op of OPERATORS) {
    if (!op.action) continue; 
    const tag = `op-${op.id}`;
    if (lower.includes(tag) || lower.includes(op.name.toLowerCase())) {
      hits.push(op);
    }
  }

  for (const op of hits) {
    op.action(ctx);
  }
  
  console.log('--------------------------\n');
  return hits.map(o => o.id);
}
