import { Brand, Campaign, CampaignStatus, Platform } from "./types";

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-101',
    name: 'Summer Sprint Sale',
    advertiser: Brand.NIKE,
    budget: 50000,
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    objective: 'Drive Sales',
    platforms: [Platform.AMAZON_DSP, Platform.WALMART_CONNECT],
    targetAudience: 'Active runners aged 25-40',
    status: CampaignStatus.LIVE,
    progress: 65
  },
  {
    id: 'c-102',
    name: 'Zero Sugar Launch',
    advertiser: Brand.COCA_COLA,
    budget: 120000,
    startDate: '2024-07-15',
    endDate: '2024-08-15',
    objective: 'Brand Awareness',
    platforms: [Platform.INSTACART, Platform.TARGET_ROUNDEL],
    targetAudience: 'Health-conscious soda drinkers',
    status: CampaignStatus.PENDING_APPROVAL,
    progress: 0
  },
  {
    id: 'c-103',
    name: 'Galaxy S24 Promo',
    advertiser: Brand.SAMSUNG,
    budget: 250000,
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    objective: 'Conversions',
    platforms: [Platform.AMAZON_DSP],
    targetAudience: 'Tech enthusiasts',
    status: CampaignStatus.APPROVED,
    progress: 100
  }
];

export const BRAND_GUIDELINES = {
  [Brand.NIKE]: "Use active, inspirational language. 'Just Do It' tone. High contrast visuals.",
  [Brand.COCA_COLA]: "Happiness, sharing, refreshment. Red and White dominant colors.",
  [Brand.SAMSUNG]: "Innovation, premium technology, sleek and modern phrasing."
};

export const PLATFORM_RULES = {
  [Platform.AMAZON_DSP]: "No claims of 'Best Seller' allowed. Text overlay max 20%.",
  [Platform.WALMART_CONNECT]: "Must emphasize value/savings. Clear product imagery on white background.",
  [Platform.INSTACART]: "Focus on utility and speed. Keep copy under 50 chars.",
  [Platform.TARGET_ROUNDEL]: "Lifestyle focus. Joyful and inclusive imagery."
};

// Placeholder images for creatives
export const MOCK_IMAGES = [
  "https://picsum.photos/600/600?random=1",
  "https://picsum.photos/600/600?random=2",
  "https://picsum.photos/600/600?random=3",
  "https://picsum.photos/600/600?random=4"
];