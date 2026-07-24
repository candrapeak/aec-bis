import React from 'react';
import { Sparkles, Calendar, Search, Moon, Sun, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  activeModuleTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  dateRange,
  setDateRange,
  activeModuleTitle,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 md:px-6">
      {/* Left Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white md:text-lg">
            {activeModuleTitle}
          </h1>
          <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
            Arrohman English Center — Business Intelligence System
          </p>
        </div>
      </div>

      {/* Right Tools & Controls */}
      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <Calendar className="mr-2 h-3.5 w-3.5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent font-medium focus:outline-none dark:bg-gray-800 cursor-pointer"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="this_month">Bulan Ini (Juli 2026)</option>
            <option value="all">Semua Data</option>
          </select>
        </div>

        {/* Live Status Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400 sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Meta API Connected</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            AEC
          </div>
          <span className="hidden text-xs font-medium text-gray-700 dark:text-gray-300 md:inline">
            Admin Marketing
          </span>
        </div>
      </div>
    </header>
  );
};
