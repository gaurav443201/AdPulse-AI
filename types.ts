export enum Platform {
  AMAZON_DSP = 'Amazon DSP',
  WALMART_CONNECT = 'Walmart Connect',
  INSTACART = 'Instacart',
  TARGET_ROUNDEL = 'Target Roundel'
}

export enum Brand {
  NIKE = 'Nike',
  COCA_COLA = 'Coca-Cola',
  SAMSUNG = 'Samsung'
}

export enum CampaignStatus {
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  LIVE = 'Live',
  PAUSED = 'Paused'
}

export interface Campaign {
  id: string;
  name: string;
  advertiser: Brand;
  budget: number;
  startDate: string;
  endDate: string;
  objective: string;
  platforms: Platform[];
  targetAudience: string;
  status: CampaignStatus;
  progress: number; // 0-100
}

export interface CreativeAsset {
  id: string;
  campaignId: string;
  platform: Platform;
  type: 'Banner' | 'Sponsored Product' | 'Video';
  headline: string;
  description: string;
  cta: string;
  imageUrl: string;
  complianceScore: number; // 0-100
  complianceIssues: string[];
  status: 'Generated' | 'Approved' | 'Rejected';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface DashboardStats {
  totalSpend: number;
  activeCampaigns: number;
  avgRoas: number;
  impressions: number;
}

export interface ActivityLog {
  id: string;
  text: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}