export function buildEvaluationPrompt(summaryData: any, period = "30 hari") {
  return `
Anda adalah konsultan pemasaran digital senior untuk Arrohman English Center (AEC).
Tugas Anda: analisis performa Meta Ads berdasarkan data yang diberikan.

Instruksi penting:
- Use only the data provided in the input. Do not invent campaign names, audience segments, or metrics.
- If a metric is missing, use 0 or "N/A" rather than assuming.
- Prioritize factual interpretation over marketing fluff.
- Return only valid JSON with the exact structure below.
- Keep the output grounded in real numbers and ratios.
- Do not include markdown fences or commentary.

Periode analisis: ${period}

Data input:
- Total Spend: Rp ${summaryData?.spend ?? 0}
- Revenue: Rp ${summaryData?.revenue ?? 0}
- ROAS: ${summaryData?.roas ?? 0}x
- Total Impressions: ${summaryData?.impression ?? 0}
- Total Reach: ${summaryData?.reach ?? 0}
- CTR: ${summaryData?.ctr ?? 0}%
- CPC: Rp ${summaryData?.cpc ?? 0}
- CPM: Rp ${summaryData?.cpm ?? 0}
- Conversations (Leads): ${summaryData?.conversations ?? 0}
- Closings (Siswa Baru): ${summaryData?.closings ?? 0}
- Cost Per Closing: Rp ${summaryData?.costPerClosing ?? 0}
- Avg Revenue Per Closing: Rp ${summaryData?.avgRevenuePerClosing ?? 0}

Output format JSON:
{
  "marketingHealthScore": 0,
  "healthGrade": "C",
  "overallAnalysis": "",
  "campaignRankings": [
    { "name": "", "score": 0, "status": "Needs Optimization", "recommendation": "" }
  ],
  "creativeRankings": [
    { "title": "", "ctr": "0%", "conversionRate": "0%", "verdict": "Fatigued" }
  ],
  "strengths": [""],
  "bottlenecks": [""],
  "nextMonthStrategy": [""]
}
`;
}

export function buildSummaryPrompt(summaryData: any) {
  return `
Anda adalah assistant marketing yang menulis ringkasan performa Meta Ads untuk eksekutif bisnis.
Instruksi:
- Tulis maksimal 2 kalimat singkat.
- Gunakan bahasa Indonesia yang profesional.
- Berbasis pada data nyata yang diberikan.
- Jangan mengarang angka di luar data input.
- Fokus pada insight performa, ROAS, lead, closing, dan efisiensi biaya.

Data input:
- Spend: Rp ${summaryData?.spend ?? summaryData?.totalSpend ?? 0}
- Revenue: Rp ${summaryData?.revenue ?? summaryData?.totalRevenue ?? 0}
- ROAS: ${summaryData?.roas ?? 0}x
- Leads: ${summaryData?.conversations ?? summaryData?.totalConversations ?? 0}
- Closing: ${summaryData?.closings ?? summaryData?.totalClosings ?? 0}
- CTR: ${summaryData?.ctr ?? 0}%
- CPC: Rp ${summaryData?.cpc ?? 0}
- CPM: Rp ${summaryData?.cpm ?? 0}

Jawaban hanya 1 paragraf singkat.
`;
}
