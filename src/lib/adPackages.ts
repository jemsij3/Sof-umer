export interface AdPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  daysCount?: number;
  views?: string;
  badge?: string;
  desc?: string;
}

export const DEFAULT_SYSTEM_AD_PACKAGES: AdPackage[] = [
  {
    id: 'starter',
    name: 'Basic Boost',
    price: 50,
    currency: 'ETB',
    duration: '3 days',
    daysCount: 3,
    views: 'Category top placement',
    badge: 'STARTER',
    desc: 'Category top placement + Basic Verified Badge'
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    price: 150,
    currency: 'ETB',
    duration: '7 days',
    daysCount: 7,
    views: 'Featured hero slider',
    badge: 'PREMIUM',
    desc: 'Featured hero slider + High priority ranking'
  },
  {
    id: 'vip',
    name: 'VIP Elite Boost',
    price: 399,
    currency: 'ETB',
    duration: '30 days',
    daysCount: 30,
    views: 'Top search billboard pin',
    badge: 'VIP ELITE',
    desc: 'Top search billboard pin + Full site promotion'
  }
];

export function getEffectiveAdPackages(systemSettings?: any): AdPackage[] {
  if (systemSettings?.adPackages && Array.isArray(systemSettings.adPackages) && systemSettings.adPackages.length > 0) {
    const activeOnly = systemSettings.adPackages.filter((p: any) => 
      p && p.name && p.isActive !== false
    );
    if (activeOnly.length > 0) {
      return activeOnly.map((p: any, idx: number) => ({
        id: p.id || (idx === 0 ? 'starter' : idx === 1 ? 'premium' : 'vip'),
        name: p.name || `Boost Package ${idx + 1}`,
        price: Number(p.price) >= 0 ? Number(p.price) : (idx === 0 ? 50 : idx === 1 ? 150 : 399),
        currency: p.currency || 'ETB',
        duration: p.duration || (idx === 0 ? '3 days' : idx === 1 ? '7 days' : '30 days'),
        daysCount: p.daysCount || (p.duration?.includes('30') ? 30 : p.duration?.includes('7') ? 7 : 3),
        views: p.views || (idx === 0 ? 'Category top placement' : idx === 1 ? 'Featured hero slider' : 'Top search billboard pin'),
        badge: p.badge || (idx === 0 ? 'STARTER' : idx === 1 ? 'PREMIUM' : 'VIP ELITE'),
        desc: p.desc || ''
      }));
    }
  }
  return DEFAULT_SYSTEM_AD_PACKAGES;
}

export function findPackage(packages: AdPackage[], idOrName?: string): AdPackage | undefined {
  if (!idOrName) return packages[0];
  const query = idOrName.toLowerCase();
  return packages.find(p => 
    p.id.toLowerCase() === query || 
    p.name.toLowerCase() === query ||
    (query === 'basic' && p.id.toLowerCase() === 'starter') ||
    (query === 'starter' && p.id.toLowerCase() === 'basic')
  );
}
