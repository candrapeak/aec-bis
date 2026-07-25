import { GoogleGenAI } from "@google/genai";
import { getGeminiModelName } from "../lib/gemini-model";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { summaryData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Jika API Key tidak ada, gunakan teks simulasi
    if (!apiKey) {
      return res.status(200).json({
        summary: `Kampanye Meta Ads AEC mencatatkan ROAS sebesar ${summaryData?.roas || 0}x dengan total revenue Rp ${((summaryData?.revenue || 0)/1000000).toFixed(1)}Jt.`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Berikan rangkuman ringkas (maksimal 2 kalimat singkat, bernada profesional & optimis) mengenai kinerja iklan Meta Ads Arrohman English Center dengan data berikut: Spend: Rp ${summaryData?.spend}, Revenue: Rp ${summaryData?.revenue}, ROAS: ${summaryData?.roas}x, Leads: ${summaryData?.conversations}, Closing: ${summaryData?.closings}. Bahasa Indonesia.`;

   const response = await ai.models.generateContent({
      model: getGeminiModelName(),
      contents: prompt,
      config: { temperature: 0.3 }
    });

    return res.status(200).json({
      summary: response.text?.trim() || "Performa iklan menunjukkan tren positif dengan rasio pengembalian modal iklan yang sangat baik."
    });
  } catch (error) {
    console.error("AI Summary Error:", error);
    return res.status(200).json({
      summary: "Iklan Meta Ads berjalan dengan kestabilan performa lead dan konversi closing yang konsisten."
    });
  }
}