import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Sparkles, Trophy, ShieldAlert, CheckCircle2, 
  RefreshCw, Flame, Lightbulb 
} from 'lucide-react';
import { AdDailyEntry, AiEvaluationResponse } from '../../types';
import { calculateMetrics, formatCurrencyIDR } from '../../utils/formulas';

interface AiEvaluationViewProps {
  entries: AdDailyEntry[];
}

export const AiEvaluationView: React.FC<AiEvaluationViewProps> = ({ entries }) => {
  const metrics = calculateMetrics(entries);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AiEvaluationResponse | null>(null);

  const buildFallbackEvaluation = () => {
    const campaignMap: any = {};
    const creativeMap: any = {};

    entries.forEach(e => {
      if (!campaignMap[e.campaignName]) campaignMap[e.campaignName] = { spend: 0, revenue: 0 };
      campaignMap[e.campaignName].spend += e.spend;
      campaignMap[e.campaignName].revenue += e.revenue;

      if (!creativeMap[e.creativeTitle]) creativeMap[e.creativeTitle] = { impression: 0, reach: 0, conversations: 0, closings: 0 };
      creativeMap[e.creativeTitle].impression += e.impression;
      creativeMap[e.creativeTitle].reach += e.reach;
      creativeMap[e.creativeTitle].conversations += e.conversations;
      creativeMap[e.creativeTitle].closings += e.closings;
    });

    const campaignRankings = Object.entries(campaignMap).map(([name, data]: any) => {
      const roas = data.spend > 0 ? (data.revenue / data.spend) : 0;
      let score = Math.min(99, Math.max(50, Math.round(roas * 10)));
      if (data.spend === 0) score = 0;
      const status = score >= 80 ? 'Top Performer' : (score >= 65 ? 'Good' : 'Needs Optimization');
      return {
        name,
        score,
        status,
        recommendation: roas > 4 ? `Pertahankan budget & pertimbangkan scale up (ROAS ${roas.toFixed(1)}x)` : 'Evaluasi ulang penawaran / audiens.'
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    if (campaignRankings.length === 0) campaignRankings.push({ name: 'Belum ada data', score: 0, status: '-', recommendation: '-' });

    const creativeRankings = Object.entries(creativeMap).map(([title, data]: any) => {
      const ctr = data.impression > 0 ? (data.reach / data.impression) * 100 : 0;
      const conv = data.conversations > 0 ? (data.closings / data.conversations) * 100 : 0;
      const verdict = ctr >= 50 ? 'Winner Creative' : (ctr >= 20 ? 'High Clicker' : 'Fatigued');
      return { title, ctr: ctr.toFixed(2) + '%', conversionRate: conv.toFixed(1) + '%', verdict };
    }).sort((a, b) => parseFloat(b.ctr) - parseFloat(a.ctr)).slice(0, 3);

    if (creativeRankings.length === 0) creativeRankings.push({ title: 'Belum ada data', ctr: '0%', conversionRate: '0%', verdict: '-' });

    const overallAnalysis = metrics.roas > 3
      ? `Performa iklan Meta Ads menunjukkan tren efisiensi positif. ROAS berada di level sehat dengan Return On Ad Spend mencapai ${metrics.roas.toFixed(2)}x. Fokus bulan depan adalah scaling.`
      : `Performa iklan Meta Ads mencatatkan ROAS ${metrics.roas.toFixed(2)}x. Diperlukan penyesuaian materi iklan atau penargetan audiens agar akuisisi siswa lebih murah.`;

    return {
      marketingHealthScore: metrics.roas > 3 ? 88 : (metrics.roas > 0 ? 65 : 0),
      healthGrade: metrics.roas > 3 ? 'A' : 'C',
      overallAnalysis,
      campaignRankings,
      creativeRankings,
      strengths: [
        `ROAS mencapai ${metrics.roas.toFixed(2)}x yang menghasilkan margin profit yang sangat baik.`,
        `Konversi closing pendaftaran berada di tingkat ${metrics.conversionRate.toFixed(1)}%.`,
      ],
      bottlenecks: [
        `Biaya per closing (CPA) tercatat ${formatCurrencyIDR(metrics.costPerClosing)}, pantau agar tidak melebihi margin.`,
        'Pastikan CTR kampanye tetap di atas standar industri edukasi.'
      ],
      nextMonthStrategy: [
        `Alokasikan budget lebih besar ke Campaign Top Performer: ${campaignRankings[0].name}.`,
        `Eksplorasi pembuatan asset visual baru berdasarkan gaya "${creativeRankings[0].title}".`,
        'Optimasi alur pendaftaran WhatsApp untuk meningkatkan persentase konversi (Conv Rate).',
      ],
    };
  };

  const runEvaluation = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/ai-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData: {
            totalSpend: metrics.spend,
            totalRevenue: metrics.revenue,
            roas: metrics.roas,
            totalImpressions: metrics.impression,
            totalReach: metrics.reach,
            ctr: metrics.ctr,
            cpc: metrics.cpc,
            cpm: metrics.cpm,
            totalConversations: metrics.conversations,
            totalClosings: metrics.closings,
            costPerClosing: metrics.costPerClosing,
            avgRevenuePerClosing: metrics.avgRevenuePerClosing,
          },
          period: '30 hari',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'AI evaluation failed');
      }

      setEvaluation({
        marketingHealthScore: data.marketingHealthScore ?? 0,
        healthGrade: data.healthGrade ?? 'C',
        overallAnalysis: data.overallAnalysis ?? 'Evaluasi AI belum tersedia.',
        campaignRankings: data.campaignRankings ?? [],
        creativeRankings: data.creativeRankings ?? [],
        strengths: data.strengths ?? [],
        bottlenecks: data.bottlenecks ?? [],
        nextMonthStrategy: data.nextMonthStrategy ?? [],
      });
    } catch (error) {
      console.error('Gagal menjalankan evaluasi AI:', error);
      setEvaluation(buildFallbackEvaluation());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runEvaluation();
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Header & Trigger */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              AI Evaluation & Strategic Advisor
            </h2>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Gemini 3.6 Flash
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Analisis tingkat kesehatan pemasaran Meta Ads & rekomendasi strategi bisnis
          </p>
        </div>

        <button
          onClick={runEvaluation}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-blue-500 hover:to-indigo-500 cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Menganalisis Data...' : 'Jalankan Evaluasi Baru AI'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
            <BrainCircuit className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
            Gemini Sedang Memproses Data
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md">
            Mengkalkulasi Marketing Health Score, mengevaluasi peringkat campaign & merumuskan strategi pemasaran...
          </p>
        </div>
      ) : evaluation ? (
        <div className="space-y-6">
          {/* Top Score & Overall Analysis Card */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Health Score Gauge Box */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6 text-white shadow-xl dark:border-indigo-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Marketing Health Score
              </span>

              <div className="relative my-4 flex h-32 w-32 items-center justify-center rounded-full border-8 border-indigo-500/30 bg-indigo-950/50 shadow-inner">
                <div className="text-center">
                  <div className="text-3xl font-extrabold tracking-tight text-white">
                    {evaluation.marketingHealthScore}
                  </div>
                  <div className="text-[10px] text-indigo-300">/ 100 Poin</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-200 border border-indigo-400/30">
                  Grade: {evaluation.healthGrade}
                </span>
              </div>
            </div>

            {/* Executive Analysis Box */}
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  Rangkuman Eksekutif Konsultan AI
                </div>
                <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                  Evaluasi Strategis Pemasaran
                </h3>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {evaluation.overallAnalysis}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-gray-400">Total Revenue Evaluasi:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyIDR(metrics.revenue)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Pencapaian ROAS:</span>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">{metrics.roas.toFixed(2)}x</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rankings: Campaign & Creative */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Campaign Rankings */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Trophy className="h-4 w-4 text-amber-500" />
                Peringkat & Evaluasi Campaign
              </div>

              <div className="space-y-3">
                {evaluation.campaignRankings.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white">
                          #{i + 1} {c.name}
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          {c.status}
                        </span>
                      </div>
                      <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        Score: {c.score}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-300 border-t border-gray-200/60 pt-2 dark:border-gray-700">
                      💡 <strong>Rekomendasi:</strong> {c.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Creative Asset Rankings */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Flame className="h-4 w-4 text-rose-500" />
                Peringkat Content Creative
              </div>

              <div className="space-y-3">
                {evaluation.creativeRankings.map((cr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-800/50 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white max-w-xs truncate">
                        {cr.title}
                      </div>
                      <div className="mt-1 flex gap-3 text-[11px] text-gray-500">
                        <span>CTR: <strong className="text-amber-600">{cr.ctr}</strong></span>
                        <span>Conv: <strong className="text-emerald-600">{cr.conversionRate}</strong></span>
                      </div>
                    </div>

                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      {cr.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Bottlenecks */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Poin Kekuatan Utama
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-900 dark:text-rose-300">
                <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                Hambatan & Area Risiko
              </div>
              <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                {evaluation.bottlenecks.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Month Strategic Action Plan */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Rencana Langkah Strategis Selanjutnya
                </h3>
                <p className="text-xs text-gray-500">Panduan eksekusi untuk memaksimalkan ROI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {evaluation.nextMonthStrategy.map((strat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-800/50 text-xs"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                    {strat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};