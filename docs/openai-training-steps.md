OpenAI Training & Upload — Steps

Prerequisites
- Set `OPENAI_API_KEY` in your environment (do NOT commit to repo).
- Node.js available for the validator script.

1) Validate JSONL examples

Run the validator to ensure each line has `prompt` and `completion`, and that `completion` is parseable JSON containing required fields:

```bash
node scripts/validate_openai_jsonl.js
```

2) Upload examples to OpenAI

Option A — OpenAI CLI (recommended):

```bash
# upload file
openai api files.upload -f data/openai-training-examples.jsonl -p training_examples
# create fine-tune (if your model supports it)
openai api fine_tunes.create -t data/openai-training-examples.jsonl -m gpt-4.1-mini
```

Option B — curl (fallback):

```bash
curl -X POST "https://api.openai.com/v1/files" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "file=@data/openai-training-examples.jsonl" \
  -F "purpose=fine-tune"
```

3) Use prompt-first approach (recommended)
- Many production use-cases are better served with strong instruction prompts + few-shot examples and schema validation, rather than fine-tuning.
- Keep `lib/meta-ads-prompt.ts` and `lib/openai-training.md` as canonical references.

4) CI Integration
- Add a CI job to run `node scripts/validate_openai_jsonl.js` before deploy to prevent broken examples from reaching prod.

5) Monitoring and regression tests
- Log prompts and responses (redact sensitive data) and run daily schema-validation checks to measure drift.

Notes
- If fine-tuning is not available for your chosen model, use the prompt-engineering + retrieval approach.
- Keep gold-standard examples for regression tests in `data/` and protect them from accidental edits.
