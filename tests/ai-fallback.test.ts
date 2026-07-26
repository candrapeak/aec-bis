import test from "node:test";
import assert from "node:assert/strict";
import { buildFallbackEvaluationResponse, buildFallbackSummaryResponse } from "../lib/ai-fallback";

test("evaluation fallback returns a valid success payload", () => {
  const response = buildFallbackEvaluationResponse({ roas: 3.4 }, "30 hari");
  assert.equal(response.success, true);
  assert.equal(response.healthGrade, "A-");
  assert.ok(Array.isArray(response.campaignRankings));
});

test("summary fallback returns a human-readable summary", () => {
  const response = buildFallbackSummaryResponse({ roas: 3.4, revenue: 5000000 });
  assert.match(response.summary, /ROAS/i);
  assert.match(response.summary, /Kampanye Meta Ads AEC/i);
});
