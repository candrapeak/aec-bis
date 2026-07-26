import test from "node:test";
import assert from "node:assert/strict";
import { buildEvaluationPrompt, buildSummaryPrompt } from "../lib/meta-ads-prompt";

test("evaluation prompt includes explicit JSON schema and grounding rules", () => {
  const prompt = buildEvaluationPrompt({ roas: 3.4, spend: 1200000, revenue: 4000000 }, "30 hari");
  assert.match(prompt, /marketingHealthScore/);
  assert.match(prompt, /Use only the data provided/);
  assert.match(prompt, /30 hari/);
});

test("summary prompt asks for concise grounded output", () => {
  const prompt = buildSummaryPrompt({ roas: 3.4, revenue: 4000000, spend: 1200000, conversations: 42, closings: 6 });
  assert.match(prompt, /maksimal 2 kalimat/);
  assert.match(prompt, /ROAS/);
});
