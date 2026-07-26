import test from "node:test";
import assert from "node:assert/strict";
import { getOpenAIModelName } from "../lib/openai";

test("uses configured OpenAI model override when present", () => {
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  assert.equal(getOpenAIModelName(), "gpt-4.1-mini");
});

test("falls back to a default OpenAI model", () => {
  delete process.env.OPENAI_MODEL;
  assert.equal(getOpenAIModelName(), "gpt-4.1-mini");
});
