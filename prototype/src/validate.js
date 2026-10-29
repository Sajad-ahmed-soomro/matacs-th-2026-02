// Rule: verify evidence quotes really exist in the source text (anti-hallucination).
const norm = (s) => s.replace(/\s+/g, " ").toLowerCase().trim();

export function verifyEvidence(extracted, sourceText) {
  const src = norm(sourceText);
  const bad = [];
  for (const [field, quote] of Object.entries(extracted.evidence ?? {})) {
    if (quote && !src.includes(norm(quote))) bad.push(field);
  }
  return bad;
}
