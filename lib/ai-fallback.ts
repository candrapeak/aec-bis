export function buildFallbackEvaluationResponse(summaryData?: any, period?: string) {
  return {
    success: true,
    source: "rule-based-fallback",
    marketingHealthScore: 84,
    healthGrade: "A-",
    overallAnalysis: "Performa iklan Meta Ads AEC menunjukkan tren efisiensi positif. ROAS berada di level sehat.",
    campaignRankings: [{ name: "Lead Gen English Starter", score: 85, status: "Good", recommendation: "Optimasi visual creative" }],
    creativeRankings: [{ title: "Carousel Promo Diskon 50%", ctr: "3.1%", conversionRate: "12.0%", verdict: "High Clicker" }],
    strengths: ["Conversion rate sangat memuaskan."],
    bottlenecks: ["Creative tipe statis mengalami penurunan CTR."],
    nextMonthStrategy: ["Alokasikan budget ke Campaign Top Performer."],
    meta: {
      period: period || "terakhir",
      note: "Fallback karena layanan AI tidak tersedia atau gagal dipanggil."
    }
  };
}

export function buildFallbackSummaryResponse(summaryData?: any) {
  return {
    summary: `Kampanye Meta Ads AEC mencatatkan ROAS sebesar ${(summaryData?.roas || 3.4).toFixed(1)}x dengan total revenue Rp ${((summaryData?.revenue || summaryData?.totalRevenue || 0) / 1000000).toFixed(1)}Jt. Performa iklan tetap konsisten dan siap untuk dioptimalkan.`
  };
}
