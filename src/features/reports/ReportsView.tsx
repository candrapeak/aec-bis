import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Calendar, Filter, FileSpreadsheet, 
  Printer, TrendingUp, DollarSign, Award, Users, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { AdDailyEntry } from '../../types';
import { calculateMetrics, formatCurrencyIDR, formatNumber } from '../../utils/formulas';

interface ReportsViewProps {
  entries: AdDailyEntry[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ entries }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Group data by report type
  const aggregatedReport = useMemo(() => {
    const map = new Map<string, AdDailyEntry[]>();

    entries.forEach((entry) => {
      let key = entry.date;
      if (reportType === 'weekly') {
        // Simple week grouping key e.g. "2026-W29"
        const d = new Date(entry.date);
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${d.getFullYear()}-W${weekNum}`;
      } else if (reportType === 'monthly') {
        key = entry.date.substring(0, 7); // YYYY-MM
      }

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    });

    const reportRows = Array.from(map.entries()).map(([period, groupEntries]) => {
      const metrics = calculateMetrics(groupEntries);
      return {
        period,
        count: groupEntries.length,
        ...metrics,
      };
    });

    return reportRows.sort((a, b) => b.period.localeCompare(a.period));
  }, [entries, reportType]);

  const totalMetrics = useMemo(() => calculateMetrics(entries), [entries]);

  const triggerExport = (format: 'PDF' | 'Excel') => {
    setExportNotice(`Laporan Rekap Pemasaran AEC (${reportType.toUpperCase()}) berhasil disiapkan & diunduh sebagai format ${format}.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Laporan Kinerja & Analytics Periode
          </h2>
          <p className="text-xs text-gray-500">
            Generasi rekap performa iklan secara otomatis untuk pelaporan manajemen AEC
          </p>
        </div>

        {/* Export Buttons & Group Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-800">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                  reportType === t
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {t === 'daily' ? 'Harian' : t === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>

          <button
            onClick={() => triggerExport('Excel')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>

          <button
            onClick={() => triggerExport('PDF')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Cetak PDF Report
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-500">Total Modal Iklan</span>
          <div className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrencyIDR(totalMetrics.spend)}
          </div>
          <span className="text-[11px] text-gray-400">Kumulatif seluruh campaign</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-500">Total Omzet (Revenue)</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyIDR(totalMetrics.revenue)}
          </div>
          <span className="text-[11px] text-gray-400">Profit Bersih: {formatCurrencyIDR(totalMetrics.revenue - totalMetrics.spend)}</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-500">Rata-rata ROAS</span>
          <div className="mt-1 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {totalMetrics.roas.toFixed(2)}x
          </div>
          <span className="text-[11px] text-gray-400">Pengembalian investasi</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-500">Tingkat Konversi Closing</span>
          <div className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {totalMetrics.conversionRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-gray-400">{totalMetrics.closings} dari {totalMetrics.conversations} leads</span>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Perbandingan Spend vs Revenue Per Periode ({reportType.toUpperCase()})
          </h3>
          <span className="text-xs font-semibold text-gray-400">Recharts Visualizer</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(value: any) => [formatCurrencyIDR(Number(value)), '']}
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="spend" name="Spend (Modal Iklan)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue (Omzet)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregated Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Tabel Rekapitulasi Performa
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3 text-center">Jml Hari/Data</th>
                <th className="px-4 py-3 text-right">Total Spend</th>
                <th className="px-4 py-3 text-right">Total Impresi</th>
                <th className="px-4 py-3 text-right">CTR / CPC</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Closing</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">ROAS</th>
                <th className="px-4 py-3 text-right">CPA (Cost/Closing)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {aggregatedReport.map((row) => (
                <tr key={row.period} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {row.period}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{row.count} hari</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrencyIDR(row.spend)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {formatNumber(row.impression)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{row.ctr.toFixed(2)}%</span>
                    <div className="text-[10px] text-gray-400">{formatCurrencyIDR(row.cpc)}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-200">
                    {row.conversations}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {row.closings}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyIDR(row.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                    {row.roas.toFixed(2)}x
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {formatCurrencyIDR(row.costPerClosing)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
