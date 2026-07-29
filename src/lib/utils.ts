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

