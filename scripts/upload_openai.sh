#!/usr/bin/env bash
# Upload training data to OpenAI (examples). Two options: OpenAI CLI (recommended) or curl.
# Usage: ./scripts/upload_openai.sh <path-to-jsonl> [model]

set -euo pipefail
FILE=${1:-data/openai-training-examples.jsonl}
MODEL=${2:-gpt-4.1-mini}

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "Please set OPENAI_API_KEY in your environment (do NOT commit to repo)."
  exit 2
fi

if command -v openai >/dev/null 2>&1; then
  echo "Using OpenAI CLI to upload and create fine-tune (if supported)"
  echo "Uploading file..."
  openai api files.upload -f "$FILE" -p "training_examples"
  echo "To create a fine-tune (if supported by your model), run:"
  echo "  openai api fine_tunes.create -t $FILE -m $MODEL"
  exit 0
fi

# Fallback: curl to files endpoint (may vary depending on OpenAI API version)
echo "OpenAI CLI not found; using curl to upload file as raw content (may not be supported on all accounts)."
RESP=$(curl -s -X POST "https://api.openai.com/v1/files" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "file=@$FILE" \
  -F "purpose=fine-tune")

echo "$RESP"

echo "If your account/model doesn't support fine-tuning, prefer prompt engineering + few-shot examples instead."