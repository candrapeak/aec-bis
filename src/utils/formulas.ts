import { AdDailyEntry, ComputedMetrics } from '../types';

/**
 * Strict KPI Formulas for AEC Business Intelligence System
 * Adheres 100% strictly to Section 5b of PROJECT_SPEC
 */

export function calculateCTR(reach: number, impression: number): number {
  return impression > 0 ? (reach / impression) * 100 : 0;
}

export function calculateCPC(spend: number, conversation: number): number {
  return conversation > 0 ? spend / conversation : 0;
}

export function calculateCPM(spend: number, impression: number): number {
  return impression > 0 ? (spend / impression) * 1000 : 0;
}

export function calculateROAS(spend: number, revenue: number): number {
  return spend > 0 ? revenue / spend : 0;
}

export function calculateCostPerClosing(spend: number, closing: number): number {
  return closing > 0 ? spend / closing : 0;
}

export function calculateAvgRevenuePerClosing(revenue: number, closing: number): number {
  return closing > 0 ? revenue / closing : 0;
}

export function calculateMetrics(entries: AdDailyEntry[]): ComputedMetrics {
  const totals = entries.reduce(
    (acc, curr) => ({
      spend: acc.spend + curr.spend,
      reach: acc.reach + curr.reach,
      impression: acc.impression + curr.impression,
      conversations: acc.conversations + curr.conversations,
      closings: acc.closings + curr.closings,
      revenue: acc.revenue + curr.revenue,
    }),
    { spend: 0, reach: 0, impression: 0, conversations: 0, closings: 0, revenue: 0 }
  );

  const ctr = calculateCTR(totals.reach, totals.impression);
  const cpc = calculateCPC(totals.spend, totals.conversations);
  const cpm = calculateCPM(totals.spend, totals.impression);
  const roas = calculateROAS(totals.spend, totals.revenue);
  const costPerClosing = calculateCostPerClosing(totals.spend, totals.closings);
  const avgRevenuePerClosing = calculateAvgRevenuePerClosing(totals.revenue, totals.closings);
  const conversionRate = totals.conversations > 0 ? (totals.closings / totals.conversations) * 100 : 0;

  return {
    ...totals,
    ctr,
    cpc,
    cpm,
    roas,
    costPerClosing,
    avgRevenuePerClosing,
    conversionRate,
  };
}

export function formatCurrencyIDR(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}
