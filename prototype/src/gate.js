// Rule: mandatory pass/fail criteria. Unknown (null) is never treated as a pass.
const MANDATORY = {
  licence_held_by_bidder: "Ontario electrical contractor licence held by bidder",
  wsib_confirmed: "WSIB clearance",
  insurance_5m_confirmed: "$5M liability insurance",
};

export function mandatoryGate(x) {
  const failed = [];
  const unknown = [];
  for (const [field, label] of Object.entries(MANDATORY)) {
    if (x[field] === false) failed.push(label);
    else if (x[field] == null) unknown.push(label);
  }
  if (failed.length) return { status: "ineligible", reason: `Fails mandatory: ${failed.join("; ")}` };
  if (unknown.length) return { status: "flagged", reason: `Mandatory criteria unclear: ${unknown.join("; ")}` };
  return { status: "ok" };
}
