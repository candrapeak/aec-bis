import { buildFallbackSummaryResponse } from "../lib/ai-fallback";
import { getOpenAIApiKey, getOpenAIModelName } from "../lib/openai";
import { buildSummaryPrompt } from "../lib/meta-ads-prompt";

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: getOpenAIModelName(),
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a concise marketing assistant. Respond in Indonesian."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const completion = await response.json();

    return res.status(200).json({
      summary: completion?.choices?.[0]?.message?.content?.trim() || "Performa iklan menunjukkan tren positif dengan rasio pengembalian modal iklan yang sangat baik."
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    return res.status(200).json(buildFallbackSummaryResponse(req.body?.summaryData));
  }
}