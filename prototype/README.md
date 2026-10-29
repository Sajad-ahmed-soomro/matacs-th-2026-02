# Prototype

Runs the extraction prompt, rules gate and deterministic scoring on the sample set.

```bash
npm run mock    # no API key: uses hand-made structured fixtures
npm test        # unit tests, no network
cp .env.example .env && npm start   # real extraction; needs samples.local.json (gitignored)
```

`samples.local.json` format: `[{ "id": "A", "text": "..." }]`. Never commit it.
