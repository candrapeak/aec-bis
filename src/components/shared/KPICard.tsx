import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  targetValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  colorScheme?: 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  tooltip?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  targetValue,
  trend,
  trendText,
  colorScheme = 'blue',
  tooltip,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900',
    slate: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  }[colorScheme];

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {title}
          </span>
          {tooltip && (
            <div className="group relative cursor-pointer">
              <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              <div className="absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg whitespace-nowrap group-hover:block z-20 dark:bg-gray-800">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colorClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Main Value */}
      <div className="my-2">
        <div className="text-xl font-bold tracking-tight text-gray-900 dark:text-white md:text-2xl">
          {value}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer / Trend & Target */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-800 text-[11px]">
        {targetValue ? (
          <span className="text-gray-500 dark:text-gray-400">
            Target: <strong className="text-gray-800 dark:text-gray-200">{targetValue}</strong>
          </span>
        ) : (
          <span className="text-gray-400">Target Meta Ads</span>
        )}

        {trendText && (
          <div className="flex items-center font-semibold">
            {trend === 'up' && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {trendText}
              </span>
            )}
            {trend === 'down' && (
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                <TrendingDown className="h-3 w-3" />
                {trendText}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="text-gray-500 dark:text-gray-400">
                {trendText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
