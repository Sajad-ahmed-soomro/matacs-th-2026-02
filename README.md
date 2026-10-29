# MATACS-TH-2026-02: AI Proposal Triage Design

**Name:** Sajad Ahmed
**Reference:** MATACS-TH-2026-02
**Time spent:** ~2 hours total
- Core deliverables (design, write-up, prompts, diagram, ranking): ~1 h
- Optional prototype (Node.js, Gemini, tests): ~0.5 h
- Git/GitHub setup and fixing a blocked push: ~0.5 h

## Files
- [WRITEUP.md](WRITEUP.md)
- [PROMPTS.md](PROMPTS.md)
- [ranking.json](ranking.json)
- [diagram/flow.png](diagram/flow.png)
- [prototype/](prototype/) (optional, `npm test` and `npm run mock` run offline; `npm start` needs a Gemini key)

## How I used AI
I used Claude to draft the design, prompts and prototype, and switched the prototype to Gemini for extraction. <Write one real disagreement.> Example: Claude estimated scores of 98 and 90 by hand; I ran the scoring code and used its actual output (99 and 91) instead.
