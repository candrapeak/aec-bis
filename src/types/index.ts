export type PlatformType = 'Meta Ads (FB/IG)' | 'Google Ads' | 'TikTok Ads';

export interface Campaign {
  id: string;
  name: string;
  platform: PlatformType;
  objective: 'Leads' | 'Sales' | 'Awareness' | 'Traffic';
  status: 'Active' | 'Paused' | 'Completed';
  targetAudience: string;
  startDate: string;
  budgetDaily: number;
}

export interface Creative {
  id: string;
  campaignId: string;
  campaignName: string;
  title: string;
  format: 'Video' | 'Image' | 'Carousel';
  thumbnailUrl?: string;
  status: 'Active' | 'Testing' | 'Archived';
}

export interface AdDailyEntry {
  id: string;
  date: string;
  campaignId: string;
  campaignName: string;
  creativeId: string;
  creativeTitle: string;
  platform: PlatformType;
  spend: number;
  reach: number;
  impression: number;
  conversations: number; // Leads / Conversations
  closings: number;      // Successful Closings
  revenue: number;       // Sales Revenue generated
}

export interface ComputedMetrics {
  spend: number;
  reach: number;
  impression: number;
  conversations: number;
  closings: number;
  revenue: number;
  ctr: number;              // Formula: (Impression > 0) ? (Reach / Impression) * 100 : 0
  cpc: number;              // Formula: (Conversation > 0) ? Spend / Conversation : 0
  cpm: number;              // Formula: (Impression > 0) ? (Spend / Impression) * 1000 : 0
  roas: number;             // Formula: (Spend > 0) ? Revenue / Spend : 0
  costPerClosing: number;   // Formula: (Closing > 0) ? Spend / Closing : 0
  avgRevenuePerClosing: number; // Formula: (Closing > 0) ? Revenue / Closing : 0
  conversionRate: number;   // Formula: (Conversations > 0) ? (Closings / Conversations) * 100 : 0
}

export interface KPITargets {
  targetRoas: number;
  targetCpc: number;
  targetCpm: number;
  targetCtr: number;
  targetMonthlySpend: number;
  targetMonthlyRevenue: number;
}

export interface AiEvaluationResponse {
  marketingHealthScore: number;
  healthGrade: string;
  overallAnalysis: string;
  campaignRankings: Array<{
    name: string;
    score: number;
    status: string;
    recommendation: string;
  }>;
  creativeRankings: Array<{
    title: string;
    ctr: string;
    conversionRate: string;
    verdict: string;
  }>;
  strengths: string[];
  bottlenecks: string[];
  nextMonthStrategy: string[];
}
