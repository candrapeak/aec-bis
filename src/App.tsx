import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { supabase } from './lib/supabase';

// Views
import { DashboardView } from './features/dashboard/DashboardView';
import { MetaAdsView } from './features/meta-ads/MetaAdsView';
import { ReportsView } from './features/reports/ReportsView';
import { AiEvaluationView } from './features/ai-evaluation/AiEvaluationView';
import { SettingsView } from './features/settings/SettingsView';
import { KPITargets } from './types';

const DEFAULT_TARGETS: KPITargets = {
  targetRoas: 3.5,
  targetCpc: 8500,
  targetCpm: 25000,
  targetCtr: 2.5,
  targetMonthlySpend: 10000000,
  targetMonthlyRevenue: 35000000,
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // State Data
  const [entries, setEntries] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creatives, setCreatives] = useState<any[]>([]);
  
  // State untuk menyimpan ID Settings agar mudah saat di-update (karena menggunakan UUID)
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [targets, setTargets] = useState<KPITargets>(DEFAULT_TARGETS);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // ==========================================
  // 1. FUNGSI TARIK DATA
  // ==========================================
  useEffect(() => {
    const fetchDatabaseData = async () => {
      setIsFetchingData(true);
      try {
        const [entriesRes, campaignsRes, creativesRes, settingsRes] = await Promise.all([
          supabase.from('ads_daily').select('*').order('date', { ascending: false }),
          supabase.from('campaigns').select('*').order('created_at', { ascending: true }),
          supabase.from('creatives').select('*').order('created_at', { ascending: true }),
          supabase.from('settings').select('*').limit(1).maybeSingle()
        ]);

        let fetchedCampaigns: any[] = [];
        let fetchedCreatives: any[] = [];

        if (campaignsRes.data) {
          fetchedCampaigns = campaignsRes.data.map(c => ({
            ...c,
            budgetDaily: c.budget_daily || 0,
            targetAudience: c.target_audience || '-'
          }));
          setCampaigns(fetchedCampaigns);
        }

        if (creativesRes.data) {
          fetchedCreatives = creativesRes.data.map(cr => ({
            ...cr,
            formatType: cr.format
          }));
          setCreatives(fetchedCreatives);
        }

        if (entriesRes.data) {
          const mappedEntries = entriesRes.data.map(e => {
            const campObj = fetchedCampaigns.find(c => c.id === e.campaign_id);
            const creaObj = fetchedCreatives.find(cr => cr.id === e.creative_id);
            
            return {
              ...e,
              campaignId: e.campaign_id,
              creativeId: e.creative_id,
              campaignName: campObj ? campObj.name : 'Unknown Campaign',
              creativeTitle: creaObj ? creaObj.title : 'Unknown Creative',
              platform: 'Meta Ads (FB/IG)' // Hardcode sementara karena ads_daily tidak punya kolom platform
            };
          });
          setEntries(mappedEntries);
        }

        if (settingsRes.data) {
          setSettingsId(settingsRes.data.id);
          setTargets({
            targetRoas: settingsRes.data.target_roas ?? DEFAULT_TARGETS.targetRoas,
            targetCpc: settingsRes.data.target_cpc ?? DEFAULT_TARGETS.targetCpc,
            targetCpm: settingsRes.data.target_cpm ?? DEFAULT_TARGETS.targetCpm,
            targetCtr: settingsRes.data.target_ctr ?? DEFAULT_TARGETS.targetCtr,
            targetMonthlySpend: settingsRes.data.target_monthly_spend ?? DEFAULT_TARGETS.targetMonthlySpend,
            targetMonthlyRevenue: settingsRes.data.target_monthly_revenue ?? DEFAULT_TARGETS.targetMonthlyRevenue,
          });
        } else {
          setTargets(DEFAULT_TARGETS);
        }

      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchDatabaseData();
  }, []);

  // ==========================================
  // 2. FUNGSI SIMPAN DATA 
  // ==========================================
  
  const handleAddEntry = async (newEntry: any) => {
    try {
      // Menyesuaikan dengan kolom di tabel ads_daily (tanpa kolom platform)
      const payload = {
        date: newEntry.date,
        campaign_id: newEntry.campaignId,
        creative_id: newEntry.creativeId,
        spend: newEntry.spend,
        reach: newEntry.reach,
        impression: newEntry.impression,
        conversations: newEntry.conversations,
        closings: newEntry.closings,
        revenue: newEntry.revenue
      };

      const { data, error } = await supabase.from('ads_daily').insert([payload]).select();
      if (error) throw error;
      
      const campObj = campaigns.find(c => c.id === newEntry.campaignId);
      const creaObj = creatives.find(cr => cr.id === newEntry.creativeId);
      
      const savedFrontendEntry = {
        ...data[0],
        campaignId: newEntry.campaignId,
        creativeId: newEntry.creativeId,
        campaignName: campObj ? campObj.name : 'Unknown',
        creativeTitle: creaObj ? creaObj.title : 'Unknown',
        platform: newEntry.platform
      };

      setEntries(prev => [savedFrontendEntry, ...prev]);
      alert("Data harian berhasil disimpan!");
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error.message);
    }
  };

  const handleAddCampaign = async (newCampaign: any) => {
    try {
      const payload = {
        name: newCampaign.name,
        objective: newCampaign.objective,
        budget_daily: newCampaign.budgetDaily || 0,
        target_audience: newCampaign.targetAudience || '-',
        status: newCampaign.status || 'Active'
      };

      const { data, error } = await supabase.from('campaigns').insert([payload]).select();
      if (error) throw error;
      
      const savedCampaign = { ...data[0], budgetDaily: data[0].budget_daily };
      setCampaigns(prev => [...prev, savedCampaign]);
      alert("Campaign baru berhasil ditambahkan!");
    } catch (error: any) {
      alert("Gagal menambah campaign: " + error.message);
    }
  };

  const handleAddCreative = async (newCreative: any) => {
    try {
      const payload = {
        title: newCreative.title,
        format: newCreative.format || 'Image',
        status: newCreative.status || 'Active'
      };
      
      const { data, error } = await supabase.from('creatives').insert([payload]).select();
      if (error) throw error;
      
      setCreatives(prev => [...prev, data[0]]);
      alert("Creative baru berhasil ditambahkan!");
    } catch (error: any) {
      alert("Gagal menambah creative: " + error.message);
    }
  };

  // ==========================================
  // 3. FUNGSI HAPUS & UPDATE 
  // ==========================================
  
  const handleDeleteEntry = async (id: string) => {
    const confirmDelete = window.confirm("Hapus data ini?");
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from('ads_daily').delete().eq('id', id);
      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error: any) {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  const handleUpdateTargets = async (newTargets: any) => {
    try {
      // Menerjemahkan format React ke format kolom tabel 'settings'
      const payload = {
        target_roas: newTargets.targetRoas,
        target_cpc: newTargets.targetCpc,
        target_cpm: newTargets.targetCpm,
        target_ctr: newTargets.targetCtr,
        target_monthly_spend: newTargets.targetMonthlySpend,
        target_monthly_revenue: newTargets.targetMonthlyRevenue,
      };

      if (settingsId) {
        // Jika data setting sudah ada, lakukan update
        const { error } = await supabase.from('settings').update(payload).eq('id', settingsId);
        if (error) throw error;
      } else {
        // Jika tabel settings masih kosong melompong, lakukan insert pertama kali
        const { data, error } = await supabase.from('settings').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) setSettingsId(data[0].id);
      }

      setTargets(newTargets);
      alert("Target KPI berhasil diperbarui!");
    } catch (error: any) {
      alert("Gagal update target KPI: " + error.message);
    }
  };

  return (
    <div className={`min-h-screen font-sans bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col`}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} dateRange="30d" setDateRange={() => {}} activeModuleTitle={isFetchingData ? "Sinkronisasi..." : "AEC Dashboard"} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">
            {activeTab === 'dashboard' && <DashboardView entries={entries} targets={targets} onNavigateToAiEval={() => setActiveTab('ai-evaluation')} />}
            
            {activeTab === 'meta-ads' && <MetaAdsView 
              entries={entries} 
              campaigns={campaigns} 
              creatives={creatives} 
              onAddEntry={handleAddEntry} 
              onEditEntry={()=>{}} 
              onDeleteEntry={handleDeleteEntry} 
              onImportEntries={()=>{}} 
            />}
            
            {activeTab === 'reports' && <ReportsView entries={entries} />}
            {activeTab === 'ai-evaluation' && <AiEvaluationView entries={entries} />}
            
            {activeTab === 'settings' && <SettingsView 
              campaigns={campaigns} 
              creatives={creatives} 
              targets={targets} 
              onUpdateTargets={handleUpdateTargets} 
              onAddCampaign={handleAddCampaign} 
              onToggleCampaignStatus={()=>{}} 
              onAddCreative={handleAddCreative} 
            />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainLayout />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}