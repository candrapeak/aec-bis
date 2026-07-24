import React from 'react';
import { LayoutDashboard, Database, FileText, BrainCircuit, Settings, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'meta-ads' | 'reports' | 'ai-evaluation' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard KPI',
      icon: LayoutDashboard,
      description: 'Ringkasan Utama & Matriks',
    },
    {
      id: 'meta-ads' as ActiveTab,
      label: 'Meta Ads Data',
      icon: Database,
      description: 'Input & Kelola Kinerja Iklan',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Laporan Performa',
      icon: FileText,
      description: 'Rekap Harian, Mingguan & Bulanan',
    },
    {
      id: 'ai-evaluation' as ActiveTab,
      label: 'AI Evaluation (Gemini)',
      icon: BrainCircuit,
      description: 'Analisis Strategi & Health Score',
      badge: 'AI',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan & Target KPI',
      icon: Settings,
      description: 'Campaign, Creative & Target',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-sm">
                AEC-BIS
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                Arrohman BI
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <div className="truncate">
                    <div className="font-semibold">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <span className="ml-1.5 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-400/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Info Card */}
      {!collapsed && (
        <div className="m-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-indigo-50/50 p-3.5 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-gray-900">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            Meta Ads Intelligence
          </div>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            Sistem terintegrasi formula otomatis & rekomendasi AI Gemini 3.6.
          </p>
        </div>
      )}
    </aside>
  );
};
