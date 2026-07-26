import { buildFallbackEvaluationResponse } from "../lib/ai-fallback";
import { getOpenAIApiKey, getOpenAIModelName } from "../lib/openai";
import { buildEvaluationPrompt } from "../lib/meta-ads-prompt";

export default async function handler(req: any, res: any) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { summaryData, period } = req.body;
    const apiKey = getOpenAIApiKey();

    // Jika API Key tidak ada, gunakan teks simulasi
    if (!apiKey) {
      return res.status(200).json(buildFallbackEvaluationResponse(summaryData, period));
    }

    const prompt = buildEvaluationPrompt(summaryData, period);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: getOpenAIModelName(),
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a senior digital marketing consultant. Return only valid JSON."
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
    const rawResultText = completion?.choices?.[0]?.message?.content || "{}";
    const resultText = rawResultText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    
    const parsedResult = JSON.parse(resultText);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      source: getOpenAIModelName(),
      ...parsedResult
    });
  } catch (error: any) {
    console.error("AI Eval Error:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(buildFallbackEvaluationResponse(req.body?.summaryData, req.body?.period));
  }
}