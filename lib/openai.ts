const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export function getOpenAIModelName(): string {
  const configuredModel = process.env.OPENAI_MODEL?.trim();
  if (configuredModel) {
    return configuredModel;
  }

  return DEFAULT_OPENAI_MODEL;
}

export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim();
}
