import { readFile, readdir, writeFile } from "node:fs/promises";
import { extract } from "./extract.js";
import { scanForInjection } from "./injection.js";
import { verifyEvidence } from "./validate.js";
import { rankProposals } from "./pipeline.js";

const useMock = process.argv.includes("--mock");
const criteria = JSON.parse(await readFile(new URL("../criteria.json", import.meta.url), "utf8"));

async function loadExtracted() {
  if (useMock) {
    return JSON.parse(await readFile(new URL("../fixtures/extracted.mock.json", import.meta.url), "utf8"));
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Set GEMINI_API_KEY in .env (or run with --mock)");
  const model = process.env.MODEL || "gemini-2.5-flash";

  // samples.local/A.txt, B.txt ... (gitignored, never commit)
  const dir = new URL("../samples.local/", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".txt")).sort();
  if (!files.length) throw new Error("Put A.txt ... E.txt in the samples.local/ folder");

  const out = [];
  for (const f of files) {
    const text = await readFile(new URL(f, dir), "utf8");
    const x = await extract(text, { apiKey, model });
    x.id = f.replace(/\.txt$/, "");
    x.suspicious_instructions = [...(x.suspicious_instructions ?? []), ...scanForInjection(text)];
    const badQuotes = verifyEvidence(x, text);
    if (badQuotes.length) x.ambiguities = [...(x.ambiguities ?? []), `Unverified evidence: ${badQuotes.join(", ")}`];
    out.push(x);
  }
  return out;
}

const ranking = rankProposals(await loadExtracted(), criteria);
console.log(JSON.stringify(ranking, null, 2));
await writeFile("output.local.json", JSON.stringify({ criteriaVersion: criteria.version, ranking }, null, 2));
