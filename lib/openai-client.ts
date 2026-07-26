type Message = { role: string; content: string };

export async function callOpenAIChat(apiKey: string, model: string, messages: Message[], opts?: { temperature?: number; maxRetries?: number; extra?: Record<string, any> }) {
  const temperature = opts?.temperature ?? 0.2;
  const maxRetries = opts?.maxRetries ?? 1;

  let lastErr: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature,
          messages,
          ...(opts?.extra || {}),
        }),
      });

      const raw = await res.text();

      if (!res.ok) {
        // include status and raw body for debugging
        const err = new Error(`OpenAI request failed: ${res.status} - ${raw}`);
        (err as any).status = res.status;
        throw err;
      }

      if (!raw || raw.trim().length === 0) {
        throw new Error("OpenAI returned empty body");
      }

      try {
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (e) {
        const err = new Error(`Failed to parse OpenAI JSON response: ${(e as Error).message}`);
        (err as any).raw = raw;
        throw err;
      }
    } catch (err) {
      lastErr = err;
      // simple retry for transient network / parse errors
      if (attempt < maxRetries) {
        const backoff = 200 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

export default callOpenAIChat;
