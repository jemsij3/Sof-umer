import { Advertisement, BannerAdPricingSettings, SystemSettings } from '../types';

export const DEFAULT_BANNER_AD_PRICING: BannerAdPricingSettings = {
  hero: {
    enabled: true,
    title: 'Hero Top Banner',
    description: 'High-visibility billboard placement at the very top of SOF-UMER marketplace.',
    price: 1500,
    durationDays: 7,
    currency: 'ETB',
    maxSlots: 3,
    packages: [
      { id: 'hero-7', name: '7 Days Hero Banner', durationDays: 7, price: 1500, desc: 'Top full-width billboard for 7 days' },
      { id: 'hero-15', name: '15 Days Hero Banner', durationDays: 15, price: 2800, desc: 'Top full-width billboard for 15 days' },
      { id: 'hero-30', name: '30 Days Hero Banner', durationDays: 30, price: 5000, desc: 'Top full-width billboard for 30 days' }
    ]
  },
  sidebar: {
    enabled: true,
    title: 'Sidebar Widgets',
    description: 'Engaging promotional cards displayed alongside listings in the marketplace sidebar.',
    price: 1000,
    durationDays: 7,
    currency: 'ETB',
    maxSlots: 5,
    packages: [
      { id: 'sidebar-7', name: '7 Days Sidebar Widget', durationDays: 7, price: 1000, desc: 'Sidebar promotional card for 7 days' },
      { id: 'sidebar-15', name: '15 Days Sidebar Widget', durationDays: 15, price: 1800, desc: 'Sidebar promotional card for 15 days' },
      { id: 'sidebar-30', name: '30 Days Sidebar Widget', durationDays: 30, price: 3200, desc: 'Sidebar promotional card for 30 days' }
    ]
  },
  banner: {
    enabled: true,
    title: 'Inline Footer Bar',
    description: 'Wide horizontal promotional banner positioned directly above the platform footer.',
    price: 800,
    durationDays: 7,
    currency: 'ETB',
    maxSlots: 3,
    packages: [
      { id: 'footer-7', name: '7 Days Inline Footer Bar', durationDays: 7, price: 800, desc: 'Inline footer banner for 7 days' },
      { id: 'footer-15', name: '15 Days Inline Footer Bar', durationDays: 15, price: 1400, desc: 'Inline footer banner for 15 days' },
      { id: 'footer-30', name: '30 Days Inline Footer Bar', durationDays: 30, price: 2500, desc: 'Inline footer banner for 30 days' }
    ]
  }
};

/**
 * Returns the effective banner advertising pricing configured in SystemSettings, falling back to defaults.
 */
export function getEffectiveBannerPricing(systemSettings?: SystemSettings): BannerAdPricingSettings {
  if (systemSettings?.bannerAdPricing) {
    return {
      hero: {
        ...DEFAULT_BANNER_AD_PRICING.hero,
        ...(systemSettings.bannerAdPricing.hero || {}),
        packages: systemSettings.bannerAdPricing.hero?.packages?.length
          ? systemSettings.bannerAdPricing.hero.packages
          : DEFAULT_BANNER_AD_PRICING.hero.packages
      },
      sidebar: {
        ...DEFAULT_BANNER_AD_PRICING.sidebar,
        ...(systemSettings.bannerAdPricing.sidebar || {}),
        packages: systemSettings.bannerAdPricing.sidebar?.packages?.length
          ? systemSettings.bannerAdPricing.sidebar.packages
          : DEFAULT_BANNER_AD_PRICING.sidebar.packages
      },
      banner: {
        ...DEFAULT_BANNER_AD_PRICING.banner,
        ...(systemSettings.bannerAdPricing.banner || {}),
        packages: systemSettings.bannerAdPricing.banner?.packages?.length
          ? systemSettings.bannerAdPricing.banner.packages
          : DEFAULT_BANNER_AD_PRICING.banner.packages
      }
    };
  }
  return DEFAULT_BANNER_AD_PRICING;
}

/**
 * Determines whether an advertisement is currently approved, paid, and within its active schedule
 * to be displayed publicly to marketplace visitors.
 */
export function isAdPubliclyActive(ad: Advertisement): boolean {
  if (!ad || !ad.isActive) return false;

  // Status check: if explicit status is set, only 'approved' and 'active' are allowed
  if (ad.status && !['approved', 'active'].includes(ad.status)) {
    return false;
  }

  // Payment check: if explicit paymentStatus is set, only 'verified', 'paid', or 'exempt' are allowed
  if (ad.paymentStatus && !['verified', 'paid', 'exempt'].includes(ad.paymentStatus)) {
    return false;
  }

  // Scheduling check: start date and end date
  const now = new Date();
  if (ad.startDate) {
    const start = new Date(ad.startDate);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  if (ad.endDate) {
    const end = new Date(ad.endDate);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

/**
 * Returns remaining days for an active advertisement, or null if indefinite.
 */
export function getAdDaysRemaining(ad: Advertisement): number | null {
  if (!ad.endDate) return null;
  const end = new Date(ad.endDate);
  if (isNaN(end.getTime())) return null;
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Validates promotional destination URLs to ensure safe HTTP/HTTPS protocol
 * and prevent unsafe javascript:, data:, or malformed links.
 */
export function validatePromoUrl(rawUrl: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
  if (!rawUrl || !rawUrl.trim()) {
    return { isValid: false, error: 'Destination URL is required.' };
  }

  let trimmed = rawUrl.trim();
  // If user pasted something like youtube.com/@channel or tiktok.com/@user, prepend https://
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only secure HTTP/HTTPS web links are allowed.' };
    }
    // Check hostname
    if (!parsed.hostname || parsed.hostname.length < 3 || !parsed.hostname.includes('.')) {
      return { isValid: false, error: 'Please enter a valid website, YouTube, or TikTok URL.' };
    }
    return { isValid: true, normalizedUrl: trimmed };
  } catch {
    return { isValid: false, error: 'Please enter a valid web URL format.' };
  }
}

/**
 * Validates video file size (<= 30MB) and duration (<= 30 seconds).
 */
export function validateVideoFile(file: File): Promise<{ isValid: boolean; duration?: number; error?: string }> {
  return new Promise(resolve => {
    // 1. Format check
    const validMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const validExts = ['.mp4', '.webm', '.ogg', '.mov'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => lowerName.endsWith(ext));
    if (!validMimes.includes(file.type) && !hasValidExt) {
      return resolve({
        isValid: false,
        error: 'Invalid video format. Please upload an MP4 or WebM video.'
      });
    }

    // 2. File size check (Max 30 MB)
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return resolve({
        isValid: false,
        error: `Video size exceeds limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 30 MB.`
      });
    }

    // 3. Duration check (Max 30s)
    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      tempVideo.remove();
    };

    tempVideo.onloadedmetadata = () => {
      const duration = Math.round(tempVideo.duration);
      cleanUp();
      if (duration > 30) {
        return resolve({
          isValid: false,
          duration,
          error: `Video duration is ${duration} seconds. Maximum allowed duration is 30 seconds.`
        });
      }
      return resolve({ isValid: true, duration });
    };

    tempVideo.onerror = () => {
      cleanUp();
      // If browser can't decode metadata, accept file if size matches
      return resolve({ isValid: true, duration: 15 });
    };

    tempVideo.src = objectUrl;
  });
}
