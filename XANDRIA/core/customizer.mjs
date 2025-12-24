function readList(s) {
  return String(s || '')
    .replace(/[\[\]]/g, '')
    .split(/[,|]/)
    .map(x => x.trim())
    .filter(Boolean)
}

function extract(key, text) {
  const re = new RegExp(`${key}\s*:\s*([^;\n]+)`, 'i')
  const m = text.match(re)
  return m ? m[1].trim() : ''
}

function parseItemDescriptor(text) {
  const s = String(text || '')
  const lower = s.toLowerCase()
  const kind = (lower.match(/\b(sword|gun|rifle|bow|staff|shield|axe|dagger)\b/) || [])[1] || 'item'
  const barrels = (() => { const m = lower.match(/(\d+)\s*barrel/) ; return m ? parseInt(m[1], 10) : 0 })()
  const curved = /curved|arc|bend/.test(lower)
  const oversized = /oversized|massive|huge|giant|colossal|heavy/.test(lower)
  const long = /long|extended|lengthy/.test(lower)
  const shootsAroundCorners = /shoots\s+around\s+corners|around\s+corners|curve\s+shot|homing/.test(lower)
  const adjectives = []
  if (curved) adjectives.push('curved')
  if (oversized) adjectives.push('oversized')
  if (long) adjectives.push('long')
  const abilities = []
  if (shootsAroundCorners) abilities.push('curve-shot')
  const length = long ? 2 : 1
  const weight = oversized ? 2 : 1
  const damage = (kind === 'sword' || kind === 'axe' || kind === 'dagger') ? (10 * length + 5 * weight) : (kind === 'gun' || kind === 'rifle' ? (8 * (barrels || 1)) : 5)
  const rateOfFire = (kind === 'gun' || kind === 'rifle') ? Math.max(1, (barrels || 1)) : 1
  const projectileBehavior = shootsAroundCorners ? 'curve' : 'straight'
  return { kind, barrels, curved, oversized, long, adjectives, abilities, length, weight, damage, rateOfFire, projectileBehavior, raw: s }
}

export function parseCustomDirectives(intent) {
  const raw = String(intent)
  const itemsRaw = extract('items', raw)
  const enemiesRaw = extract('enemies', raw)
  const mapRaw = extract('map', raw)
  const storyRaw = extract('story', raw)
  const uiRaw = extract('ui', raw)
  const settingsRaw = extract('settings', raw)
  const landscapeRaw = extract('landscape', raw)
  const questsRaw = extract('quests', raw)
  const inventoryRaw = extract('inventory', raw)
  const playerRaw = extract('player', raw) || raw

  function parsePlayer(text) {
    const s = String(text || '').toLowerCase()
    const morphs = []
    const morphMatches = Array.from(s.matchAll(/morphs?\s+into\s+(\w+)/g)).map(m => m[1])
    const turnMatches = Array.from(s.matchAll(/turns?\s+into\s+(\w+)/g)).map(m => m[1])
    for (const m of [...morphMatches, ...turnMatches]) morphs.push(m)
    const nounMorphs = ['bird','eagle','hawk','spider','wolf','dragon']
    for (const n of nounMorphs) { if (s.includes(n)) morphs.push(n) }
    const flight = /fly|flight|glide|jetpack/.test(s)
    const jetpack = /jetpack/.test(s)
    const wallClimb = /climb\s+walls|wall\s*climb|stick\s+to\s+walls/.test(s)
    const sizeControl = /control[s]?\s+(his|her|their)?\s*size|grow|shrink|resize/.test(s)
    const size = { min: 0.5, max: 3, default: 1, speed: 0.1 }
    const minMatch = s.match(/min\s*size\s*=?\s*(\d+(?:\.\d+)?)x?/)
    const maxMatch = s.match(/max\s*size\s*=?\s*(\d+(?:\.\d+)?)x?/)
    if (minMatch) size.min = parseFloat(minMatch[1])
    if (maxMatch) size.max = parseFloat(maxMatch[1])
    const weapons = []
    if (s.includes('minigun')) weapons.push({ name: 'minigun', rateOfFire: 10, damage: 6 })
    if (s.includes('laser')) weapons.push({ name: 'laser', rateOfFire: 2, damage: 12 })
    if (s.includes('rocket')) weapons.push({ name: 'rocket', rateOfFire: 1, damage: 25 })
    return { morphs: Array.from(new Set(morphs)), flight, jetpack, wallClimb, sizeControl, size, weapons }
  }

  const mapSize = (() => {
    const m = (mapRaw || '').match(/(\d+)\s*x\s*(\d+)/i)
    return m ? { width: parseInt(m[1], 10), height: parseInt(m[2], 10) } : null
  })()

  const difficulty = (() => {
    const m = (settingsRaw || '').match(/difficulty\s*=\s*(\w+)/i)
    return m ? m[1].toLowerCase() : undefined
  })()

  const controls = (() => {
    const m = (settingsRaw || '').match(/controls\s*=\s*([^;\n]+)/i)
    return m ? readList(m[1]) : []
  })()

  return {
    items: readList(itemsRaw).map((name, i) => ({ id: `item_${i}`, name, descriptor: parseItemDescriptor(name) })),
    enemies: readList(enemiesRaw),
    map: mapSize || (mapRaw ? { name: mapRaw } : null),
    story: storyRaw || '',
    ui: uiRaw || '',
    settings: { difficulty, controls },
    landscape: (landscapeRaw || '').toLowerCase(),
    quests: readList(questsRaw),
    inventory: readList(inventoryRaw),
    player: parsePlayer(playerRaw)
  }
}
