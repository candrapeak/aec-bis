import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Eye, Users, MousePointer, 
  MessageSquare, UserCheck, Award, Zap, BrainCircuit, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, Legend 
} from 'recharts';
import { AdDailyEntry, KPITargets } from '../../types';
import { calculateMetrics, formatCurrencyIDR, formatNumber } from '../../utils/formulas';
import { KPICard } from '../../components/shared/KPICard';

interface DashboardViewProps {
  entries: AdDailyEntry[];
  targets: KPITargets;
  onNavigateToAiEval: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  targets,
  onNavigateToAiEval,
}) => {
  const metrics = calculateMetrics(entries);
  const [aiSummary, setAiSummary] = useState<string>('Memuat ringkasan kecerdasan buatan...');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const fetchAiSummary = async () => {
    setLoadingAi(true);

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData: {
            totalSpend: metrics.spend,
            totalRevenue: metrics.revenue,
            roas: metrics.roas,
            totalConversations: metrics.conversations,
            totalClosings: metrics.closings,
            ctr: metrics.ctr,
            cpm: metrics.cpm,
          },
        }),
      });

      const data = await response.json();
      setAiSummary(
        data?.summary || 'Belum ada data performa iklan yang cukup untuk dianalisis.'
      );
    } catch (error) {
      console.error('Gagal mengambil ringkasan AI:', error);
      setAiSummary('Ringkasan AI tidak tersedia saat ini, tetapi performa iklan tetap dapat dipantau dari KPI utama.');
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiSummary();
  }, [entries]);

  // Group entries by date for trend chart
  const chartData = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const ctr = e.impression > 0 ? (e.reach / e.impression) * 100 : 0;
      const roas = e.spend > 0 ? e.revenue / e.spend : 0;
      return {
        date: e.date.substring(5), // MM-DD
        spend: e.spend,
        revenue: e.revenue,
        roas: parseFloat(roas.toFixed(2)),
        ctr: parseFloat(ctr.toFixed(2)),
        conversations: e.conversations,
        closings: e.closings,
      };
    });

  return (
    <div className="space-y-6">
      {/* AI Intelligence Summary Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white shadow-xl dark:border-indigo-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-400 text-white shadow-md">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Ringkasan AI OpenAI
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
                  Real-time Insight
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-blue-50 leading-relaxed max-w-3xl">
                {loadingAi ? 'Sedang menganalisis matriks terkini...' : aiSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAiSummary}
              disabled={loadingAi}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
            <button
              onClick={onNavigateToAiEval}
              className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition-all cursor-pointer"
            >
              Evaluasi Lengkap AI &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (10 Core Metrics) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Matriks Utama Kinerja Meta Ads
          </h2>
          <span className="text-xs font-medium text-gray-500">
            Diperbarui secara otomatis berdasarkan data harian
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* 1. Total Spend */}
          <KPICard
            title="Total Spend (Pengeluaran)"
            value={formatCurrencyIDR(metrics.spend)}
            subtitle="Anggaran iklan terpakai"
            icon={DollarSign}
            colorScheme="blue"
            targetValue={formatCurrencyIDR(targets.targetMonthlySpend)}
            trend={metrics.spend <= targets.targetMonthlySpend ? 'up' : 'down'}
            trendText="On Budget"
            tooltip="Total modal iklan Meta Ads yang telah dibelanjakan."
          />

          {/* 2. Total Revenue */}
          <KPICard
            title="Total Revenue (Omzet)"
            value={formatCurrencyIDR(metrics.revenue)}
            subtitle="Pendapatan dari siswa baru"
            icon={TrendingUp}
            colorScheme="emerald"
            targetValue={formatCurrencyIDR(targets.targetMonthlyRevenue)}
            trend={metrics.revenue >= targets.targetMonthlyRevenue ? 'up' : 'neutral'}
            trendText="High Yield"
            tooltip="Total estimasi pendapatan pendaftaran kelas dari konversi iklan."
          />

          {/* 3. ROAS */}
          <KPICard
            title="ROAS (Return On Ad Spend)"
            value={`${metrics.roas.toFixed(2)}x`}
            subtitle="Formulir: Revenue / Spend"
            icon={Award}
            colorScheme="indigo"
            targetValue={`${targets.targetRoas}x`}
            trend={metrics.roas >= targets.targetRoas ? 'up' : 'down'}
            trendText={metrics.roas >= targets.targetRoas ? 'Target Surpassed' : 'Below Target'}
            tooltip="Rasio kembalian investasi iklan. Setiap Rp 1 spend menghasilkan Rp ROAS."
          />

          {/* 4. Conversations (Leads) */}
          <KPICard
            title="Total Conversations (Leads)"
            value={formatNumber(metrics.conversations)}
            subtitle="Prospek chat WhatsApp"
            icon={MessageSquare}
            colorScheme="amber"
            trend="up"
            trendText="Leads Masuk"
            tooltip="Banyaknya calon siswa yang memulai percakapan pesan via WhatsApp."
          />

          {/* 5. Closings */}
          <KPICard
            title="Total Closings (Siswa Baru)"
            value={formatNumber(metrics.closings)}
            subtitle="Siswa daftar & bayar"
            icon={UserCheck}
            colorScheme="emerald"
            trend="up"
            trendText={`${metrics.conversionRate.toFixed(1)}% Conv Rate`}
            tooltip="Jumlah calon siswa yang berhasil mendaftar kelas AEC."
          />

          {/* 6. CTR */}
          <KPICard
            title="CTR (Click-Through Rate)"
            value={`${metrics.ctr.toFixed(2)}%`}
            subtitle="Formulir: (Reach / Impression) * 100"
            icon={MousePointer}
            colorScheme="blue"
            targetValue={`${targets.targetCtr}%`}
            trend={metrics.ctr >= targets.targetCtr ? 'up' : 'neutral'}
            trendText="Efektivitas Iklan"
            tooltip="Persentase jangkauan audiens terhadap impresi."
          />

          {/* 7. CPC */}
          <KPICard
            title="CPC (Cost Per Conversation)"
            value={formatCurrencyIDR(metrics.cpc)}
            subtitle="Formulir: Spend / Conversation"
            icon={Zap}
            colorScheme="amber"
            targetValue={formatCurrencyIDR(targets.targetCpc)}
            trend={metrics.cpc <= targets.targetCpc ? 'up' : 'down'}
            trendText="Cost/Lead"
            tooltip="Biaya per percakapan pesan calon siswa baru."
          />

          {/* 8. CPM */}
          <KPICard
            title="CPM (Cost Per 1.000 Impressions)"
            value={formatCurrencyIDR(metrics.cpm)}
            subtitle="Formulir: (Spend / Impression) * 1000"
            icon={Eye}
            colorScheme="slate"
            targetValue={formatCurrencyIDR(targets.targetCpm)}
            trend={metrics.cpm <= targets.targetCpm ? 'up' : 'down'}
            trendText="Biaya Penayangan"
            tooltip="Biaya tayang per 1.000 impresi di platform Meta."
          />

          {/* 9. Cost Per Closing */}
          <KPICard
            title="Cost Per Closing (CPA)"
            value={formatCurrencyIDR(metrics.costPerClosing)}
            subtitle="Formulir: Spend / Closing"
            icon={DollarSign}
            colorScheme="rose"
            trend="up"
            trendText="Efisien"
            tooltip="Biaya akuisisi per 1 siswa baru terdaftar."
          />

          {/* 10. Avg Revenue Per Closing */}
          <KPICard
            title="Avg Revenue / Closing"
            value={formatCurrencyIDR(metrics.avgRevenuePerClosing)}
            subtitle="Formulir: Revenue / Closing"
            icon={TrendingUp}
            colorScheme="indigo"
            trend="neutral"
            trendText="Rata-rata Paket"
            tooltip="Rata-rata nilai paket pendaftaran per siswa."
          />
        </div>
      </div>

      {/* Visual Analytics Section (Charts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trend Spend vs Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tren Pengeluaran vs Omzet (Spend vs Revenue)
              </h3>
              <p className="text-xs text-gray-500">Perbandingan harian modal iklan dan omzet</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Perbandingan IDR
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrencyIDR(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (Omzet)" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="spend" name="Spend (Modal Iklan)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROAS vs CTR Trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Fluktuasi ROAS & CTR Iklan
              </h3>
              <p className="text-xs text-gray-500">Evaluasi efisiensi kampanye & minat konten</p>
            </div>
            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Rasio % & Multiplier
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}x`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="roas" name="ROAS (Multiplier)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};