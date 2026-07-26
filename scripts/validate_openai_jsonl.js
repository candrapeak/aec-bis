#!/usr/bin/env node
// Simple validator for data/openai-training-examples.jsonl
// Checks each line is valid JSON with `prompt` and `completion`, and that completion parses
// into the expected evaluation fields.

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../data/openai-training-examples.jsonl');
if (!fs.existsSync(file)) {
  console.error('File not found:', file);
  process.exit(2);
}

const requiredFields = [
  'marketingHealthScore',
  'healthGrade',
  'overallAnalysis',
  'campaignRankings',
  'creativeRankings',
  'strengths',
  'bottlenecks',
  'nextMonthStrategy'
];

const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
let errors = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let parsed;
  try {
    parsed = JSON.parse(line);
  } catch (e) {
    console.error(`Line ${i + 1}: invalid JSONL - ${e.message}`);
    errors++;
    continue;
  }
  if (!parsed.prompt || !parsed.completion) {
    console.error(`Line ${i + 1}: missing 'prompt' or 'completion' field`);
    errors++;
    continue;
  }
  // completion may be a string containing JSON; try to parse
  const compRaw = parsed.completion.trim();
  let compJson;
  try {
    compJson = JSON.parse(compRaw);
  } catch (e) {
    console.error(`Line ${i + 1}: completion is not valid JSON - ${e.message}`);
    errors++;
    continue;
  }
  // check required fields exist (top-level)
  for (const f of requiredFields) {
    if (!(f in compJson)) {
      console.error(`Line ${i + 1}: completion missing required field '${f}'`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log(`OK: ${lines.length} examples validated`);
  process.exit(0);
} else {
  console.error(`Validation failed: ${errors} problem(s) found`);
  process.exit(3);
}
