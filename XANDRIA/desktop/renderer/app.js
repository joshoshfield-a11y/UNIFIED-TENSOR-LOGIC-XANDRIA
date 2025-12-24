const intentEl=document.getElementById('intent')
const soloEl=document.getElementById('solo')
const form=document.getElementById('form')
const logEl=document.getElementById('log')
const genBtn=document.getElementById('gen')
const openBtn=document.getElementById('open')
const exportAppBtn=document.getElementById('export-app')
const exportGameBtn=document.getElementById('export-game')
const exportLog=document.getElementById('export-log')

function append(text){ logEl.textContent+=text; logEl.scrollTop=logEl.scrollHeight }

window.api.onLog(msg=>append(msg))
window.api.onDone(({code})=>{ append(`\nProcess exited with code ${code}\n`); genBtn.disabled=false })
window.api.onExportLog(msg=>{ exportLog.textContent+=msg; exportLog.scrollTop=exportLog.scrollHeight })
window.api.onExportDone(({code})=>{ exportLog.textContent+=`\nExport finished with code ${code}\n` })

form.addEventListener('submit',async(e)=>{ e.preventDefault(); genBtn.disabled=true; logEl.textContent=''; const intent=intentEl.value.trim(); const solo=soloEl.checked; await window.api.generate(intent,solo) })
openBtn.addEventListener('click',()=>{ window.api.openDist() })
exportAppBtn.addEventListener('click',async()=>{ exportLog.textContent=''; await window.api.exportApp() })
exportGameBtn.addEventListener('click',async()=>{ exportLog.textContent=''; await window.api.exportGame() })
