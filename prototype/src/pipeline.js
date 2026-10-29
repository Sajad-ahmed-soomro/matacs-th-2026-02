import { mandatoryGate } from "./gate.js";
import { scoreProposal } from "./scoring.js";

function triage(x, criteria) {
  const gate = mandatoryGate(x);
  if (gate.status !== "ok") return gate;
  if (x.suspicious_instructions?.length)
    return { status: "flagged", reason: "Embedded instructions to reviewers detected (ignored); needs human review" };
  if (x.price_cad == null || x.timeline_weeks == null)
    return { status: "flagged", reason: "Missing price or timeline; needs clarification before ranking" };
  if (x.price_cad > criteria.budgetCeilingCad)
    return { status: "flagged", reason: "Price exceeds budget ceiling; needs human review" };
  if (x.timeline_weeks > criteria.maxWeeks)
    return { status: "flagged", reason: "Timeline exceeds maximum weeks; needs human review" };
  return { status: "ok" };
}

export function rankProposals(extracted, criteria) {
  const results = extracted.map((x) => ({ x, ...triage(x, criteria) }));
  const scorable = results.filter((r) => r.status === "ok");

  if (scorable.length) {
    const ctx = {
      minPrice: Math.min(...scorable.map((r) => r.x.price_cad)),
      minWeeks: Math.min(...scorable.map((r) => r.x.timeline_weeks)),
    };
    for (const r of scorable) Object.assign(r, scoreProposal(r.x, ctx, criteria.weights));
    scorable.sort((a, b) => b.total - a.total || a.x.id.localeCompare(b.x.id));
    scorable.forEach((r, i) => (r.rank = i + 1));
  }

  const order = { ok: 0, flagged: 1, ineligible: 2 };
  return results
    .sort((a, b) => order[a.status] - order[b.status] || (a.rank ?? 0) - (b.rank ?? 0))
    .map((r) =>
      r.status === "ok"
        ? { proposal: r.x.id, rank: r.rank, status: "ranked", score: r.total,
            reason: `Criteria ${criteria.version}; breakdown ${JSON.stringify(r.parts)}` }
        : { proposal: r.x.id, rank: null, status: r.status, score: null, reason: r.reason }
    );
}
