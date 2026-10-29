// Rule: cheap pre-scan for instruction-like text aimed at automated reviewers.
const PATTERNS = [
  /note to (automated|ai|llm)/i,
  /ignore (all |any )?(previous|prior|above)/i,
  /(rank|place|put) (it|this|us)[^.]{0,30}first/i,
  /full marks/i,
  /pre-?approved/i,
  /assign (the )?(highest|maximum|full)/i,
];

export function scanForInjection(text) {
  return PATTERNS.filter((p) => p.test(text)).map((p) => p.source);
}
