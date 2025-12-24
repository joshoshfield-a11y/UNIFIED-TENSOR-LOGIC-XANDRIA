import { Memory } from './memory.mjs';

const mem = new Memory();
const metrics = mem.get('lastMetrics', { score: 0 });

if (metrics.score < 2) { // Expecting score >= 2 (Intent + Files)
  console.log('XANDRIA HEALER: Artifact integrity low. Marking for regeneration...');
  mem.set('status', 'NEEDS_REGENERATION').save();
} else {
  console.log('XANDRIA HEALER: System Stable. Artifact Sealed.');
  mem.set('status', 'HEALED').save();
}