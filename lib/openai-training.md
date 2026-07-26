OpenAI Training Guide — Meta Ads Evaluation

Goal
- Teach OpenAI to produce consistent, factual, and structured evaluations for Meta Ads campaigns based on provided data.

1) Evaluation schema (ground truth)
- marketingHealthScore: integer 0-100
- healthGrade: one of ["A+","A","B","C","D"]
- overallAnalysis: short 1-3 sentence executive summary (Indonesian)
- campaignRankings: list of {name, score (0-100), status, recommendation}
- creativeRankings: list of {title, ctr, conversionRate, verdict}
- strengths: list of strings
- bottlenecks: list of strings
- nextMonthStrategy: list of strings

2) Prompting rules
- System message: set role (senior digital marketing consultant)
- User message: provide explicit JSON schema, require "Use only the data provided"
- Example-driven: include 4-8 few-shot examples for varied ROAS, CTR, sample sizes
- Output constraints: return valid JSON only, no markdown, no commentary

3) Training / Tuning options
- Option A: Instruction / prompt engineering (fast, no fine-tune)
  - Keep strong system message, use few-shot examples and JSON schema.
  - Use function-calling or `response_format` if model supports structured output.
- Option B: Fine-tune (if OpenAI model supports it)
  - Prepare JSONL of {"prompt":"<instruction+input>","completion":"<expected JSON>"}
  - Validate outputs with automated JSON schema checks

4) Validation & Metrics
- Schema validity rate (% of responses that parse as JSON)
- Field-level accuracy: numeric closeness for scores/ROAS-derived fields
- Human review sample: 50 random outputs for quality
- Regression tests: enforce identical outputs for canonical examples

5) Real-time considerations
- Avoid heavy fine-tuning for up-to-the-minute data; use prompt + retrieval with latest metrics
- For real-time: load latest aggregated metrics into the prompt or pass via function payload

6) Safety & Guardrails
- If key metrics missing, return explicit N/A or 0 according to schema
- Limit list sizes (e.g., campaignRankings max 6)

7) Deployment checklist
- Add monitoring: log prompt, response, parse errors
- Add rate-limiting and retry logic
- Store gold-standard examples and test on each deploy

References
- Keep `lib/meta-ads-prompt.ts` as canonical prompt builder used at runtime.