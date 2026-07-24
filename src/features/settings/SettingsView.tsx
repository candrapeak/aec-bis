import React, { useState } from 'react';
import { 
  Settings, Target, Megaphone, Image as ImageIcon, Plus, 
  Save, Check, Trash2, Edit2, Play, Pause 
} from 'lucide-react';
import { Campaign, Creative, KPITargets } from '../../types';
import { formatCurrencyIDR } from '../../utils/formulas';

interface SettingsViewProps {
  campaigns: Campaign[];
  creatives: Creative[];
  targets: KPITargets;
  onUpdateTargets: (newTargets: KPITargets) => void;
  onAddCampaign: (campaign: Campaign) => void;
  onToggleCampaignStatus: (id: string) => void;
  onAddCreative: (creative: Creative) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  campaigns,
  creatives,
  targets,
  onUpdateTargets,
  onAddCampaign,
  onToggleCampaignStatus,
  onAddCreative,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kpi' | 'campaigns' | 'creatives'>('kpi');
  const [targetForm, setTargetForm] = useState<KPITargets>({ ...targets });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Campaign Form
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    platform: 'Meta Ads (FB/IG)',
    objective: 'Leads',
    status: 'Active',
    targetAudience: 'Mahasiswa & Umum',
    startDate: new Date().toISOString().substring(0, 10),
    budgetDaily: 250000,
  });

  // New Creative Form
  const [newCreative, setNewCreative] = useState<Partial<Creative>>({
    title: '',
    campaignId: campaigns[0]?.id || '',
    format: 'Video',
    status: 'Active',
  });

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargets(targetForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;
    onAddCampaign({
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      platform: newCampaign.platform || 'Meta Ads (FB/IG)',
      objective: newCampaign.objective || 'Leads',
      status: newCampaign.status || 'Active',
      targetAudience: newCampaign.targetAudience || 'Umum',
      startDate: newCampaign.startDate || new Date().toISOString().substring(0, 10),
      budgetDaily: newCampaign.budgetDaily || 200000,
    });
    setNewCampaign({
      name: '',
      platform: 'Meta Ads (FB/IG)',
      objective: 'Leads',
      status: 'Active',
      targetAudience: 'Mahasiswa & Umum',
      startDate: new Date().toISOString().substring(0, 10),
      budgetDaily: 250000,
    });
  };

  const handleCreateCreative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreative.title) return;
    const camp = campaigns.find((c) => c.id === newCreative.campaignId);
    onAddCreative({
      id: `cr-${Date.now()}`,
      campaignId: newCreative.campaignId || campaigns[0]?.id || 'camp-1',
      campaignName: camp ? camp.name : 'General Campaign',
      title: newCreative.title,
      format: newCreative.format || 'Video',
      status: newCreative.status || 'Active',
    });
    setNewCreative({
      title: '',
      campaignId: campaigns[0]?.id || '',
      format: 'Video',
      status: 'Active',
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Sub Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Pengaturan Master Data & Target KPI
          </h2>
          <p className="text-xs text-gray-500">
            Kelola target acuan bisnis, pendaftaran kampanye, dan materi kreatif
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-800 dark:bg-gray-800">
          <button
            onClick={() => setActiveSubTab('kpi')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'kpi'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            Target KPI
          </button>

          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'campaigns'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            Campaigns ({campaigns.length})
          </button>

          <button
            onClick={() => setActiveSubTab('creatives')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'creatives'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Creatives ({creatives.length})
          </button>
        </div>
      </div>

      {/* KPI TARGETS FORM */}
      {activeSubTab === 'kpi' && (
        <form onSubmit={handleSaveTargets} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Acuan Target Kinerja Utama (KPI Targets)
              </h3>
              <p className="text-xs text-gray-500">Target ini digunakan sebagai tolok ukur indikator warna & evaluasi AI</p>
            </div>

            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                <Check className="h-4 w-4" /> Target Berhasil Disimpan!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target ROAS (x Multiplier)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={targetForm.targetRoas}
                onChange={(e) => setTargetForm({ ...targetForm, targetRoas: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target CPC Maksimal (IDR/Conversation)
              </label>
              <input
                type="number"
                required
                value={targetForm.targetCpc}
                onChange={(e) => setTargetForm({ ...targetForm, targetCpc: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target CPM Maksimal (IDR/1.000 Impresi)
              </label>
              <input
                type="number"
                required
                value={targetForm.targetCpm}
                onChange={(e) => setTargetForm({ ...targetForm, targetCpm: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target CTR Minimal (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={targetForm.targetCtr}
                onChange={(e) => setTargetForm({ ...targetForm, targetCtr: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target Spend Bulanan (IDR)
              </label>
              <input
                type="number"
                required
                value={targetForm.targetMonthlySpend}
                onChange={(e) => setTargetForm({ ...targetForm, targetMonthlySpend: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Target Revenue Bulanan (IDR)
              </label>
              <input
                type="number"
                required
                value={targetForm.targetMonthlyRevenue}
                onChange={(e) => setTargetForm({ ...targetForm, targetMonthlyRevenue: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Simpan Target KPI
            </button>
          </div>
        </form>
      )}

      {/* CAMPAIGNS TAB */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Add Campaign Form */}
          <form onSubmit={handleCreateCampaign} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Tambah Campaign Meta Ads Baru
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Nama Campaign</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Gen - Kelas Speaking Malam"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Objective</label>
                <select
                  value={newCampaign.objective}
                  onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value="Leads">Leads (Message/WA)</option>
                  <option value="Sales">Sales (Conversion)</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Traffic">Traffic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Budget Harian (IDR)</label>
                <input
                  type="number"
                  required
                  value={newCampaign.budgetDaily}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budgetDaily: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Tambah Campaign
              </button>
            </div>
          </form>

          {/* List of Campaigns */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Nama Campaign</th>
                  <th className="px-4 py-3">Platform & Objective</th>
                  <th className="px-4 py-3">Target Audience</th>
                  <th className="px-4 py-3 text-right">Budget Harian</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {c.platform} • <span className="font-semibold text-blue-600">{c.objective}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.targetAudience}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrencyIDR(c.budgetDaily)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onToggleCampaignStatus(c.id)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                      >
                        {c.status === 'Active' ? 'Jeda' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATIVES TAB */}
      {activeSubTab === 'creatives' && (
        <div className="space-y-6">
          {/* Add Creative Form */}
          <form onSubmit={handleCreateCreative} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Daftarkan Material Creative Baru
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Judul Creative</label>
                <input
                  type="text"
                  placeholder="e.g. Video Testimonial Beasiswa LPDP 2026"
                  required
                  value={newCreative.title}
                  onChange={(e) => setNewCreative({ ...newCreative, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Campaign Terkait</label>
                <select
                  value={newCreative.campaignId}
                  onChange={(e) => setNewCreative({ ...newCreative, campaignId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Format</label>
                <select
                  value={newCreative.format}
                  onChange={(e) => setNewCreative({ ...newCreative, format: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value="Video">Video Ads</option>
                  <option value="Image">Single Image Banner</option>
                  <option value="Carousel">Carousel Image</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> Tambah Creative
              </button>
            </div>
          </form>

          {/* List of Creatives */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Judul Creative</th>
                  <th className="px-4 py-3">Campaign Terkait</th>
                  <th className="px-4 py-3 text-center">Format</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {creatives.map((cr) => (
                  <tr key={cr.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                      🎨 {cr.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{cr.campaignName}</td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                      {cr.format}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {cr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
