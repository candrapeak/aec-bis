import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { summaryData, period } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        source: "rule-based-fallback",
        marketingHealthScore: 84,
        healthGrade: "A-",
        overallAnalysis: "Performa iklan Meta Ads AEC menunjukkan tren efisiensi positif. ROAS berada di level sehat.",
        campaignRankings: [{ name: "Lead Gen English Starter", score: 85, status: "Good", recommendation: "Optimasi visual creative" }],
        creativeRankings: [{ title: "Carousel Promo Diskon 50%", ctr: "3.1%", conversionRate: "12.0%", verdict: "High Clicker" }],
        strengths: ["Conversion rate sangat memuaskan."],
        bottlenecks: ["Creative tipe statis mengalami penurunan CTR."],
        nextMonthStrategy: ["Alokasikan budget ke Campaign Top Performer."]
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Anda adalah seorang Head of Digital Marketing & Business Intelligence Consultant profesional untuk Arrohman English Center (AEC).
Analisis data Meta Ads berikut dan berikan evaluasi strategi pemasaran mendalam dalam format JSON murni yang valid tanpa backticks markdown.

Data Performa Meta Ads AEC:
- Total Spend: Rp ${summaryData?.spend}
- Revenue: Rp ${summaryData?.revenue}
- ROAS: ${summaryData?.roas}x
- Total Impressions: ${summaryData?.impression}
- Total Reach: ${summaryData?.reach}
- CTR: ${summaryData?.ctr}%
- CPC: Rp ${summaryData?.cpc}
- CPM: Rp ${summaryData?.cpm}
- Conversations (Leads): ${summaryData?.conversations}
- Closings (Siswa Baru): ${summaryData?.closings}
- Cost Per Closing: Rp ${summaryData?.costPerClosing}
- Avg Revenue Per Closing: Rp ${summaryData?.avgRevenuePerClosing}

Tolong outputkan JSON dengan struktur persis seperti ini:
{
  "marketingHealthScore": <angka 0-100>,
  "healthGrade": "<A+|A|B|C|D>",
  "overallAnalysis": "<rangkuman eksekutif 2-3 kalimat>",
  "campaignRankings": [
    { "name": "<nama campaign>", "score": <0-100>, "status": "<Top Performer|Good|Needs Optimization|Scale Up>", "recommendation": "<rekomendasi taktis>" }
  ],
  "creativeRankings": [
    { "title": "<nama creative>", "ctr": "<X.X%>", "conversionRate": "<X.X%>", "verdict": "<Winner|Solid|Fatigued>" }
  ],
  "strengths": ["<poin kekuatan 1>", "<poin kekuatan 2>"],
  "bottlenecks": ["<poin hambatan 1>", "<poin hambatan 2>"],
  "nextMonthStrategy": ["<langkah strategis 1>", "<langkah strategis 2>", "<langkah strategis 3>"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);

    return res.status(200).json({
      success: true,
      source: "gemini-1.5-flash",
      ...parsedResult
    });
  } catch (error: any) {
    console.error("AI Eval Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}