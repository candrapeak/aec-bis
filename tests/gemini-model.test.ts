import test from "node:test";
import assert from "node:assert/strict";
import { getGeminiModelName } from "../lib/gemini-model";

test("uses configured Gemini model override when present", () => {
  process.env.GEMINI_MODEL = "gemini-2.0-flash";
  assert.equal(getGeminiModelName(), "gemini-2.0-flash");
});

test("falls back to a supported default Gemini model", () => {
  delete process.env.GEMINI_MODEL;
  assert.equal(getGeminiModelName(), "gemini-2.0-flash");
});
