export function measure(payload) {
  const intent = typeof payload.intent === 'string' ? payload.intent : '';
  const files = Array.isArray(payload.generatedFiles) ? payload.generatedFiles : [];
  
  // Base score: 1 if intent exists
  let score = intent.length > 0 ? 1 : 0;
  
  // Boost score if files were actually generated
  if (files.length > 0) {
    score += 1;
  }
  
  return { score, fileCount: files.length, template: payload.templateUsed };
}