const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export function getGeminiModelName(): string {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  if (configuredModel) {
    return configuredModel;
  }

  return DEFAULT_GEMINI_MODEL;
}
