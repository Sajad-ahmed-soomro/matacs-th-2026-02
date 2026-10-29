# Design write-up

## 1. AI vs. rules
**AI:** (a) turning messy PDF text into structured fields with evidence quotes, (b) writing the one-line reason.
**Rules/code:** PDF parsing, mandatory pass/fail gates, weighted scoring, ranking, validation, logging.
Line drawn: AI is good at reading unstructured text; code is better at maths and policy. Scoring in code means the admin's weights are applied exactly and identically every time.
The prototype implements extraction, gating and scoring. The one-line reason writer is in PROMPTS.md but not built; reasons in ranking.json are written by hand.

## 2. Consistency and explainability
- Temperature 0, fixed model version (`gemini-2.5-flash`), versioned prompt, JSON schema output.
- Scores are computed by formula, not by the LLM: experience via rubric bands, price = lowest/price, timeline = shortest/weeks, warranty = panel + workmanship bands, team = checklist.
- Same extracted data + same criteria version = identical ranking. The only variance is extraction, so the design caches extraction results per file hash and re-runs extraction twice in testing, flagging any disagreement.
- The reviewer sees a per-criterion score table with the evidence quote and page for each value, plus the criteria version used.
Sample result: A 99, E 91; B ineligible; C and D flagged.

## 3. Human in the loop
- Reviewer sees flagged items first (missing data, injection, low-confidence extraction) and can request clarification, correct a value, or override a rank, with a mandatory reason.
- Ineligible proposals are listed with the failed criterion so a human can verify them.
- A human makes the final award; the tool only recommends.
- Audit log: file hash, extracted JSON, model and prompt version, criteria version, scores, ranking, every override (who, when, why), and the final decision.

## 4. Changing criteria
Criteria are versioned and immutable once used. Existing results stay tied to their old version. After an edit, affected proposals are marked "stale". Because scoring is deterministic code on stored extractions, re-scoring is cheap and needs no new AI call, unless a new criterion needs new fields (then re-extract only that). The reviewer sees old vs new rank side by side; nothing is overwritten silently.

## 5. Risks
| Risk | Safeguard |
|---|---|
| Wrong extraction | Evidence quotes verified against source text; null over guessing; schema validation; human can correct |
| Made-up facts | "Extract only stated facts" rule; quote check rejects invented evidence |
| Prompt injection (C) | Proposal text treated as data; injection scan; LLM never sets scores; flagged for review |
| Missing data (D) | Not guessed; flagged and clarification requested |
| Mandatory-criteria evasion (B) | Strict rule: bidder must hold the licence, subcontracting fails |
| Bias | LLM sees no company-name-based scoring; fixed rubric; reviewers can audit score tables; periodic spot checks |
| Cost | Cheap model for extraction, one call per proposal, cached by hash; no LLM calls for scoring |
| Privacy | Only fictional/approved data; no keys in repo; logs access-controlled |

**Assumption:** a proposal with a missing criterion is flagged rather than scored zero, so one gap does not silently reorder the ranking.