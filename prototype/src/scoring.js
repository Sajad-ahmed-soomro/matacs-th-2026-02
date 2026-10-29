// Rule: deterministic scoring. Same inputs + same criteria version = same output.
const clamp = (n) => Math.max(0, Math.min(100, n));
const round1 = (n) => Math.round(n * 10) / 10;

export function experienceScore(installs) {
  if (installs >= 12) return 100;
  if (installs >= 8) return 75;
  if (installs >= 5) return 50;
  return 25;
}

export function scoreProposal(x, ctx, weights) {
  const warranty =
    0.5 * clamp(((x.panel_warranty_years ?? 0) / 25) * 100) +
    0.5 * clamp(((x.workmanship_warranty_years ?? 0) / 12) * 100);
  const team = (x.named_lead ? 40 : 0) + (x.safety_plan ? 30 : 0) + (x.monitoring_plan ? 30 : 0);

  const parts = {
    experience: experienceScore(x.qualifying_installs ?? 0),
    price: clamp((ctx.minPrice / x.price_cad) * 100),
    timeline: clamp((ctx.minWeeks / x.timeline_weeks) * 100),
    warranty,
    team,
  };
  const total = Object.entries(weights).reduce((s, [k, w]) => s + (parts[k] * w) / 100, 0);
  const rounded = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, round1(v)]));
  return { parts: rounded, total: Math.round(total) };
}
