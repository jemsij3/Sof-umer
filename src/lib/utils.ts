export function formatTimeAgo(dateInput?: string | Date | number): string {
  if (!dateInput) return 'Just now';
  try {
    const past = new Date(dateInput);
    if (isNaN(past.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return 'Just now';

    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 45) return 'Just now';

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

export function formatListingAge(
  dateInput?: any,
  lang: string = 'en',
  t?: (key: string) => string
): string {
  if (!dateInput) return t ? t('listed_today') : 'Listed today';
  try {
    let resolvedDate: Date;
    if (typeof dateInput?.toDate === 'function') {
      resolvedDate = dateInput.toDate();
    } else if (typeof dateInput?.seconds === 'number') {
      resolvedDate = new Date(dateInput.seconds * 1000);
    } else {
      resolvedDate = new Date(dateInput);
    }

    if (isNaN(resolvedDate.getTime())) return t ? t('listed_today') : 'Listed today';
    const now = new Date();
    const diffMs = now.getTime() - resolvedDate.getTime();
    if (diffMs < 0) return t ? t('listed_today') : 'Listed today';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      if (t && t('listed_today')) return t('listed_today');
      if (lang === 'om') return "Har'a maxxanfame";
      if (lang === 'am') return 'ዛሬ የተለጠፈ';
      return 'Listed today';
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      if (t && t('listed_yesterday')) return t('listed_yesterday');
      if (lang === 'om') return 'Kaleessa maxxanfame';
      if (lang === 'am') return 'ትናንት የተለጠፈ';
      return 'Listed yesterday';
    }

    if (diffDays < 7) {
      if (lang === 'om') return `Guyyoota ${diffDays} dura`;
      if (lang === 'am') return `ከ${diffDays} ቀናት በፊት`;
      return `${diffDays} days ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      if (lang === 'om') return `Torbanoota ${diffWeeks} dura`;
      if (lang === 'am') return `ከ${diffWeeks} ሳምንታት በፊት`;
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      const count = Math.max(1, diffMonths);
      if (lang === 'om') return `Ji'oota ${count} dura`;
      if (lang === 'am') return `ከ${count} ወራት በፊት`;
      return `${count} ${count === 1 ? 'month' : 'months'} ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    const countY = Math.max(1, diffYears);
    if (lang === 'om') return `Waggaha ${countY} dura`;
    if (lang === 'am') return `ከ${countY} ዓመታት በፊት`;
    return `${countY} ${countY === 1 ? 'year' : 'years'} ago`;
  } catch {
    return t ? t('listed_today') : 'Listed today';
  }
}

export function maskName(name?: string): string {
  if (!name || !name.trim()) return 'J***** J****';
  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 1) return part;
    return part[0] + '*'.repeat(Math.max(part.length - 1, 4));
  }).join(' ');
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'j*****@gmail.com';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 1 ? local[0] + '*'.repeat(Math.max(local.length - 1, 5)) : 'j*****';
  return `${maskedLocal}@${domain}`;
}

