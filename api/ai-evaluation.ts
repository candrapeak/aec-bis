import { buildFallbackEvaluationResponse } from "../lib/ai-fallback";
import { getOpenAIApiKey, getOpenAIModelName } from "../lib/openai";
import { buildEvaluationPrompt } from "../lib/meta-ads-prompt";
import callOpenAIChat from "../lib/openai-client";

export default async function handler(req: any, res: any) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { summaryData, period } = req.body;
    const apiKey = getOpenAIApiKey();

    // Jika API Key tidak ada, gunakan teks simulasi
    if (!apiKey) {
      return res.status(200).json(buildFallbackEvaluationResponse(summaryData, period));
    }

    const prompt = buildEvaluationPrompt(summaryData, period);

    const messages = [
      { role: "system", content: "You are a senior digital marketing consultant. Return only valid JSON." },
      { role: "user", content: prompt },
    ];

    const completion = await callOpenAIChat(apiKey, getOpenAIModelName(), messages, { temperature: 0.2, maxRetries: 1, extra: { response_format: { type: "json_object" } } });

    const rawResultText = completion?.choices?.[0]?.message?.content || "{}";
    const resultText = rawResultText.replace(/```json\n?/g, '').replace(/```/g, '').trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse resultText from OpenAI:', { resultText, err: e });
      throw e;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      source: getOpenAIModelName(),
      ...parsedResult
    });
  } catch (error: any) {
    console.error("AI Eval Error:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'OpenAI gagal merespons',
      details: error?.message || String(error),
      fallback: buildFallbackEvaluationResponse(req.body?.summaryData, req.body?.period),
    });
  }
}