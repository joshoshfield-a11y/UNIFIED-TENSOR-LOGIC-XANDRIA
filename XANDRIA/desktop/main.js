const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const fsp = require('fs/promises')
const { spawn } = require('child_process')
const os = require('os')

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('disable-gpu-program-cache')
app.setPath('userData', path.join(os.tmpdir(), 'XANDRIA-Desktop'))

const single = app.requestSingleInstanceLock()
if (!single) {
  app.quit()
}
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

let win
function createWindow() {
  win = new BrowserWindow({ width: 1000, height: 700, webPreferences: { preload: path.join(__dirname, 'preload.js') } })
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

ipcMain.handle('generate:start', async (event, payload) => {
  const root = path.resolve(__dirname, '..', '..')
  const genPath = path.join(root, 'XANDRIA', 'tools', 'xandria', 'generate.mjs')
  const args = [genPath, payload.intent]
  if (payload.solo) args.push('--solo')
  let proc
  try {
    proc = spawn('node', args, { cwd: root, windowsHide: true })
  } catch (e) {
    proc = spawn(process.execPath, args, { cwd: root, windowsHide: true, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } })
  }
  proc.stdout.on('data', d => { win.webContents.send('generate:log', d.toString()) })
  proc.stderr.on('data', d => { win.webContents.send('generate:log', d.toString()) })
  proc.on('close', code => { win.webContents.send('generate:done', { code }) })
  return true
})

ipcMain.handle('open:path', async (event, p) => {
  const root = path.resolve(__dirname, '..', '..')
  const target = path.join(root, 'XANDRIA', 'generated', 'dist')
  await shell.openPath(target)
  return true
})

function run(cmd, args, cwd, onData) {
  const proc = spawn(cmd, args, { cwd, shell: false })
  proc.stdout.on('data', d => onData && onData(d.toString()))
  proc.stderr.on('data', d => onData && onData(d.toString()))
  return new Promise(res => proc.on('close', code => res(code)))
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true })
  const entries = await fsp.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const s = path.join(src, e.name)
    const d = path.join(dest, e.name)
    if (e.isDirectory()) await copyDir(s, d)
    else await fsp.copyFile(s, d)
  }
}

ipcMain.handle('export:start', async (event, payload) => {
  const root = path.resolve(__dirname, '..', '..')
  const genDist = path.join(root, 'XANDRIA', 'generated', 'dist')
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  win.webContents.send('export:log', `Starting export in ${genDist}\n`)
  const code1 = await run(npmCmd, ['install'], genDist, (m) => win.webContents.send('export:log', m))
  win.webContents.send('export:log', `npm install exited with code ${code1}\n`)
  const code2 = await run(npmCmd, ['run', 'build'], genDist, (m) => win.webContents.send('export:log', m))
  win.webContents.send('export:log', `npm run build exited with code ${code2}\n`)
  const outDir = path.join(genDist, 'dist')
  const exportsBase = path.join(root, 'XANDRIA', 'exports')
  const targetDir = path.join(exportsBase, payload.kind === 'game' ? 'game' : 'app')
  await copyDir(outDir, targetDir)
  win.webContents.send('export:log', `Copied build to ${targetDir}\n`)
  await shell.openPath(targetDir)
  win.webContents.send('export:done', { code: code2 })
  return true
})
