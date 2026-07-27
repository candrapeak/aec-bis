import { buildFallbackSummaryResponse } from "../lib/ai-fallback.js";
import { getOpenAIApiKey, getOpenAIModelName } from "../lib/openai.js";
import { buildSummaryPrompt } from "../lib/meta-ads-prompt.js";
import callOpenAIChat from "../lib/openai-client.js";

export default async function handler(req: any, res: any) {
  // Set CORS headers for all responses (allow frontend access)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { summaryData } = req.body;
    const apiKey = getOpenAIApiKey();

    // Jika API Key tidak ada, gunakan teks simulasi
    if (!apiKey) {
      return res.status(200).json(buildFallbackSummaryResponse(summaryData));
    }

    const prompt = buildSummaryPrompt(summaryData);

    const messages = [
      { role: 'system', content: 'You are a concise marketing assistant. Respond in Indonesian.' },
      { role: 'user', content: prompt },
    ];

    const completion = await callOpenAIChat(apiKey, getOpenAIModelName(), messages, { temperature: 0.3, maxRetries: 1 });

    const rawText = completion?.choices?.[0]?.message?.content || "";
    const summaryText = rawText.trim() || "Performa iklan menunjukkan tren positif dengan rasio pengembalian modal iklan yang sangat baik.";

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ summary: summaryText });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'OpenAI gagal merespons',
      details: (error as any)?.message || String(error),
      fallback: buildFallbackSummaryResponse(req.body?.summaryData),
    });
  }
}