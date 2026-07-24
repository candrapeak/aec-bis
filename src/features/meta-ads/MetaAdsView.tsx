import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Download, Upload, Trash2, Edit2, Filter, 
  ArrowUpDown, ChevronLeft, ChevronRight, X, Calendar, DollarSign 
} from 'lucide-react';
import { AdDailyEntry, Campaign, Creative, PlatformType } from '../../types';
import { calculateCTR, calculateCPC, calculateCPM, calculateROAS, calculateCostPerClosing, formatCurrencyIDR, formatNumber } from '../../utils/formulas';

interface MetaAdsViewProps {
  entries: AdDailyEntry[];
  campaigns: Campaign[];
  creatives: Creative[];
  onAddEntry: (entry: AdDailyEntry) => void;
  onEditEntry: (entry: AdDailyEntry) => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: AdDailyEntry[]) => void;
}

export const MetaAdsView: React.FC<MetaAdsViewProps> = ({
  entries,
  campaigns,
  creatives,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onImportEntries,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof AdDailyEntry>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AdDailyEntry | null>(null);

  // Form State (Dimulai dengan nilai kosong/reset)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    campaignId: '', 
    creativeId: '', 
    platform: 'Meta Ads (FB/IG)' as PlatformType,
    spend: 0,
    reach: 0,
    impression: 0,
    conversations: 0,
    closings: 0,
    revenue: 0,
  });

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormData({
      date: new Date().toISOString().substring(0, 10),
      campaignId: campaigns.length > 0 ? campaigns[0].id : '',
      creativeId: creatives.length > 0 ? creatives[0].id : '',
      platform: 'Meta Ads (FB/IG)',
      spend: 0,
      reach: 0,
      impression: 0,
      conversations: 0,
      closings: 0,
      revenue: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: AdDailyEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      campaignId: entry.campaignId,
      creativeId: entry.creativeId,
      platform: entry.platform,
      spend: entry.spend,
      reach: entry.reach,
      impression: entry.impression,
      conversations: entry.conversations,
      closings: entry.closings,
      revenue: entry.revenue,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Ekstra: Pastikan Campaign & Creative sudah dipilih
    if (!formData.campaignId || !formData.creativeId) {
      alert("Mohon pilih Campaign dan Creative dari daftar. Jika kosong, tambahkan terlebih dahulu di menu Pengaturan!");
      return;
    }

    const campObj = campaigns.find((c) => c.id === formData.campaignId);
    const crObj = creatives.find((cr) => cr.id === formData.creativeId);

    const campaignName = campObj ? campObj.name : 'Unassigned Campaign';
    const creativeTitle = crObj ? crObj.title : 'Unassigned Creative';

    if (editingEntry) {
      onEditEntry({
        ...editingEntry,
        ...formData,
        campaignName,
        creativeTitle,
      });
    } else {
      onAddEntry({
        id: `entry-${Date.now()}`,
        ...formData,
        campaignName,
        creativeTitle,
      });
    }
    setIsModalOpen(false);
  };

  // Filter & Sort
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch =
        e.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.creativeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.date.includes(searchTerm);
      const matchCampaign = selectedCampaign === 'all' || e.campaignId === selectedCampaign;
      return matchSearch && matchCampaign;
    });
  }, [entries, searchTerm, selectedCampaign]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredEntries, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEntries.slice(start, start + pageSize);
  }, [sortedEntries, currentPage]);

  const handleSort = (field: keyof AdDailyEntry) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Campaign', 'Creative', 'Platform', 'Spend (IDR)', 'Reach', 'Impression', 'CTR (%)', 'CPC (IDR)', 'Conversations', 'Closings', 'Revenue (IDR)', 'ROAS'];
    const rows = filteredEntries.map((e) => {
      const ctr = calculateCTR(e.reach, e.impression).toFixed(2);
      const cpc = calculateCPC(e.spend, e.conversations).toFixed(0);
      const roas = calculateROAS(e.spend, e.revenue).toFixed(2);
      return [
        e.date,
        `"${e.campaignName}"`,
        `"${e.creativeTitle}"`,
        e.platform,
        e.spend,
        e.reach,
        e.impression,
        ctr,
        cpc,
        e.conversations,
        e.closings,
        e.revenue,
        roas,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AEC_MetaAds_Performance_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Kelola Data Kinerja Meta Ads
          </h2>
          <p className="text-xs text-gray-500">
            Catatan performa harian iklan Facebook & Instagram Arrohman English Center
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Ekspor CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-md shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Data Harian
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari campaign, creative, atau tanggal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs font-medium text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Campaign Select Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="all">Semua Campaign ({campaigns.length})</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    Tanggal <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Campaign & Creative</th>
                <th className="px-4 py-3 cursor-pointer text-right" onClick={() => handleSort('spend')}>
                  <div className="flex items-center justify-end gap-1">
                    Spend <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Reach / Impression</th>
                <th className="px-4 py-3 text-right">CTR / CPC</th>
                <th className="px-4 py-3 cursor-pointer text-right" onClick={() => handleSort('conversations')}>
                  <div className="flex items-center justify-end gap-1">
                    Leads <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer text-right" onClick={() => handleSort('closings')}>
                  <div className="flex items-center justify-end gap-1">
                    Closing <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer text-right" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1">
                    Revenue <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">ROAS</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    Tidak ada data kinerja Meta Ads. Silakan tambah data baru.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((e) => {
                  const ctr = calculateCTR(e.reach, e.impression);
                  const cpc = calculateCPC(e.spend, e.conversations);
                  const roas = calculateROAS(e.spend, e.revenue);

                  return (
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {e.date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">
                          {e.campaignName}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          🎨 {e.creativeTitle}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrencyIDR(e.spend)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                        <div>{formatNumber(e.reach)} reach</div>
                        <div className="text-[10px] text-gray-400">{formatNumber(e.impression)} imp</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {ctr.toFixed(2)}%
                        </span>
                        <div className="text-[10px] text-gray-400">{formatCurrencyIDR(cpc)}/lead</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-200">
                        {e.conversations}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {e.closings}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyIDR(e.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                        {roas.toFixed(2)}x
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(e)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(e.id)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/30">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {sortedEntries.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, sortedEntries.length)} dari {sortedEntries.length} data
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingEntry ? 'Edit Data Iklan Meta Ads' : 'Tambah Data Iklan Harian'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                  >
                    <option value="Meta Ads (FB/IG)">Meta Ads (FB/IG)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Pilih Campaign <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.campaignId}
                  onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Campaign --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.objective})
                    </option>
                  ))}
                </select>
                {campaigns.length === 0 && (
                  <p className="mt-1 text-[10px] text-amber-600">Belum ada Campaign. Silakan buat di menu Pengaturan.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Pilih Creative / Materi Iklan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.creativeId}
                  onChange={(e) => setFormData({ ...formData, creativeId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Creative --</option>
                  {creatives.map((cr) => (
                    <option key={cr.id} value={cr.id}>
                      {cr.title} ({cr.format})
                    </option>
                  ))}
                </select>
                {creatives.length === 0 && (
                  <p className="mt-1 text-[10px] text-amber-600">Belum ada Creative. Silakan buat di menu Pengaturan.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Spend (Biaya - IDR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Reach (Jangkauan)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Impression (Impresi)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.impression}
                    onChange={(e) => setFormData({ ...formData, impression: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Conversations (Leads WA)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.conversations}
                    onChange={(e) => setFormData({ ...formData, conversations: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Closings (Siswa Daftar)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.closings}
                    onChange={(e) => setFormData({ ...formData, closings: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Revenue (Omzet - IDR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Formula Real-time Preview */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
                <div className="font-bold mb-1">Pratinjau Hasil Formula Otomatis:</div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>CTR: <strong>{calculateCTR(formData.reach, formData.impression).toFixed(2)}%</strong></div>
                  <div>CPC: <strong>{formatCurrencyIDR(calculateCPC(formData.spend, formData.conversations))}</strong></div>
                  <div>ROAS: <strong>{calculateROAS(formData.spend, formData.revenue).toFixed(2)}x</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={campaigns.length === 0 || creatives.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEntry ? 'Simpan Perubahan' : 'Tambah Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};