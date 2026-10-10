/**
 * Ethiopia (Africa/Addis_Ababa) Time Utilities
 * Standard Time: East Africa Time (EAT), UTC+3 (No Daylight Saving Time)
 */

export const ETHIOPIA_TIMEZONE = 'Africa/Addis_Ababa';
export const ETHIOPIA_UTC_OFFSET_HOURS = 3;

/**
 * Format an ISO date string into human-friendly Ethiopia Local Time
 * Example: "Oct 15, 2026, 10:00 PM (EAT)"
 */
export function formatEthiopiaDateTime(
  isoDateString?: string,
  options?: {
    includeSeconds?: boolean;
    includeTime?: boolean;
    short?: boolean;
  }
): string {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return '';

  const includeTime = options?.includeTime !== false;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ETHIOPIA_TIMEZONE,
      month: options?.short ? 'short' : 'short',
      day: 'numeric',
      year: 'numeric',
      hour: includeTime ? 'numeric' : undefined,
      minute: includeTime ? '2-digit' : undefined,
      second: options?.includeSeconds && includeTime ? '2-digit' : undefined,
      hour12: true
    });

    const formatted = formatter.format(date);
    return includeTime ? `${formatted} (EAT)` : formatted;
  } catch (err) {
    // Fallback if Intl timeZone fails
    const utcTime = date.getTime();
    const eatDate = new Date(utcTime + ETHIOPIA_UTC_OFFSET_HOURS * 3600000);
    return eatDate.toUTCString().replace('GMT', '(EAT)');
  }
}

/**
 * Formats a start and optional end date range in Ethiopia local time
 * Example: "Oct 15, 2026, 10:00 PM – 11:30 PM (EAT)"
 */
export function formatEthiopiaDateRange(startIso: string, endIso?: string): string {
  if (!startIso) return '';
  const startStr = formatEthiopiaDateTime(startIso);
  if (!endIso) return startStr;

  const startDate = new Date(startIso);
  const endDate = new Date(endIso);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return startStr;

  // Check if same calendar day in Ethiopia time
  const getDayKey = (d: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: ETHIOPIA_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(d);
  };

  const sameDay = getDayKey(startDate) === getDayKey(endDate);

  if (sameDay) {
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ETHIOPIA_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const startTime = timeFormatter.format(startDate);
    const endTime = timeFormatter.format(endDate);
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ETHIOPIA_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const dateStr = dateFormatter.format(startDate);

    return `${dateStr}, ${startTime} – ${endTime} (EAT)`;
  }

  const endStr = formatEthiopiaDateTime(endIso);
  return `${startStr} – ${endStr}`;
}

/**
 * Converts an ISO date string into an HTML <input type="datetime-local"> value
 * representing Ethiopia local time ("YYYY-MM-DDTHH:mm")
 */
export function toEthiopiaInputDateTime(isoDateString?: string): string {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return '';

  // Shift UTC by +3 hours to read year/month/date/hours in UTC methods
  const eatDate = new Date(date.getTime() + ETHIOPIA_UTC_OFFSET_HOURS * 3600000);
  const year = eatDate.getUTCFullYear();
  const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(eatDate.getUTCDate()).padStart(2, '0');
  const hours = String(eatDate.getUTCHours()).padStart(2, '0');
  const minutes = String(eatDate.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts an HTML <input type="datetime-local"> value (which the administrator
 * entered in Ethiopia local time) into a standard UTC ISO 8601 string
 */
export function fromEthiopiaInputDateTime(datetimeLocalValue: string): string {
  if (!datetimeLocalValue || !datetimeLocalValue.includes('T')) return '';

  // Clean value (format: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
  const trimmed = datetimeLocalValue.trim();
  const fullWithSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed;

  // Append fixed Ethiopia UTC offset +03:00
  const dateWithOffset = new Date(`${fullWithSeconds}+03:00`);
  if (isNaN(dateWithOffset.getTime())) {
    return '';
  }
  return dateWithOffset.toISOString();
}

/**
 * Returns current Ethiopia local time ready for <input type="datetime-local">
 */
export function getEthiopiaCurrentInputDateTime(addMinutes: number = 0): string {
  const targetDate = new Date(Date.now() + addMinutes * 60000);
  return toEthiopiaInputDateTime(targetDate.toISOString());
}
