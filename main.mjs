import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname)
const raw = process.argv.slice(2)
const serve = raw.includes('--serve')
const heal = raw.includes('--heal')
let port = undefined
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === '--port' && i + 1 < raw.length) {
    port = raw[i + 1]
  } else if (raw[i].startsWith('--port=')) {
    port = raw[i].split('=')[1]
  }
}
const intent = raw.filter(a => !a.startsWith('--')).join(' ').trim() || 'default'
if (port) process.env.PORT = String(port)

const genUrl = pathToFileURL(path.join(root, 'XANDRIA', 'tools', 'xandria', 'generate.mjs')).href
const awakenUrl = pathToFileURL(path.join(root, 'XANDRIA', 'core', 'awaken.mjs')).href
const healerUrl = pathToFileURL(path.join(root, 'XANDRIA', 'core', 'healer.mjs')).href
const sealUrl = pathToFileURL(path.join(root, 'XANDRIA', 'core', 'seal.mjs')).href
const serveUrl = pathToFileURL(path.join(root, 'XANDRIA', 'tools', 'xandria', 'serve.mjs')).href

const originalArgv = [...process.argv]
process.argv = [process.argv[0], 'generate.mjs', intent, ...(heal ? ['--heal'] : [])]
await import(genUrl)
process.argv = originalArgv

await import(awakenUrl)
await import(healerUrl)
await import(sealUrl)

if (serve) {
  await import(serveUrl)
}
