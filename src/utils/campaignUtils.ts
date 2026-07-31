export interface FreeListingSettings {
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  maxFreeListingsPerUser?: number;
  campaignNotice?: string;
  showDuration?: boolean;
}

export interface CampaignStatusInfo {
  status: 'Upcoming' | 'Active' | 'Expired';
  daysLeft: number;
  daysUntilStart: number;
  isLastDay: boolean;
  startDateFormatted: string;
  endDateFormatted: string;
  maxListings: number;
  displayText: string;
  badgeText: string;
  badgeColor: string;
  isActive: boolean;
  isUpcoming: boolean;
  isExpired: boolean;
}

export function getCampaignStatusInfo(fls?: FreeListingSettings): CampaignStatusInfo {
  const enabled = fls?.enabled !== false;
  const maxListings = fls?.maxFreeListingsPerUser ?? 5;
  const now = new Date();
  const currentRealTime = new Date();

  // Normalize now to midnight for date arithmetic
  const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (fls?.startDate) {
    const s = new Date(fls.startDate);
    if (!isNaN(s.getTime())) startDate = s;
  }
  if (fls?.endDate) {
    const e = new Date(fls.endDate);
    if (!isNaN(e.getTime())) endDate = e;
  }

  const startDateFormatted = startDate
    ? startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '1 Aug 2026';
  const endDateFormatted = endDate
    ? endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '31 Aug 2026';

  if (!enabled) {
    return {
      status: 'Expired',
      daysLeft: 0,
      daysUntilStart: 0,
      isLastDay: false,
      startDateFormatted,
      endDateFormatted,
      maxListings,
      displayText: 'Free Listing Campaign has ended.',
      badgeText: 'Expired / Disabled',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      isActive: false,
      isUpcoming: false,
      isExpired: true
    };
  }

  // 1. Upcoming Check
  if (startDate) {
    const startOfDayStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (currentRealTime < startOfDayStart) {
      const diffMs = startOfDayStart.getTime() - midnightNow.getTime();
      const daysUntilStart = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        status: 'Upcoming',
        daysLeft: 0,
        daysUntilStart,
        isLastDay: false,
        startDateFormatted,
        endDateFormatted,
        maxListings,
        displayText: `Starts in ${daysUntilStart} ${daysUntilStart === 1 ? 'day' : 'days'}`,
        badgeText: `Upcoming (Starts in ${daysUntilStart} ${daysUntilStart === 1 ? 'day' : 'days'})`,
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        isActive: false,
        isUpcoming: true,
        isExpired: false
      };
    }
  }

  // 2. Expired Check
  if (endDate) {
    const endOfDayEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
    if (currentRealTime > endOfDayEnd) {
      return {
        status: 'Expired',
        daysLeft: 0,
        daysUntilStart: 0,
        isLastDay: false,
        startDateFormatted,
        endDateFormatted,
        maxListings,
        displayText: 'Free Listing Campaign has ended.',
        badgeText: 'Expired',
        badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        isActive: false,
        isUpcoming: false,
        isExpired: true
      };
    }

    // Active with End Date
    const diffMs = endOfDayEnd.getTime() - currentRealTime.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const midnightEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const isLastDay = daysLeft <= 1 || midnightNow.getTime() === midnightEndDate.getTime();

    return {
      status: 'Active',
      daysLeft,
      daysUntilStart: 0,
      isLastDay,
      startDateFormatted,
      endDateFormatted,
      maxListings,
      displayText: isLastDay ? 'Expires today' : `${daysLeft} days left`,
      badgeText: isLastDay ? 'Last Day!' : `${daysLeft} days left`,
      badgeColor: isLastDay ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      isActive: true,
      isUpcoming: false,
      isExpired: false
    };
  }

  // Active without End Date
  return {
    status: 'Active',
    daysLeft: 999,
    daysUntilStart: 0,
    isLastDay: false,
    startDateFormatted,
    endDateFormatted: 'Ongoing',
    maxListings,
    displayText: 'Active Campaign',
    badgeText: 'Active',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    isActive: true,
    isUpcoming: false,
    isExpired: false
  };
}
