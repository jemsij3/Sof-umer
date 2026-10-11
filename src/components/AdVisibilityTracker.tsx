import React, { useEffect, useRef } from 'react';
import { Advertisement } from '../types';

interface AdVisibilityTrackerProps {
  ad: Advertisement;
  children: React.ReactNode;
  className?: string;
  onViewRecorded?: (adId: string) => void;
}

// In-memory set to prevent double-tracking during fast component lifecycle re-renders
const memoryTrackedAdIds = new Set<string>();

/**
 * AdVisibilityTracker
 * 
 * Ensures accurate view counting:
 * - Only counts when the advertisement is actually visible in the viewport (>= 50% visible).
 * - Requires continuous visibility dwell time (800ms) to ensure real impressions vs quick scroll-past.
 * - Deduplicates per session in sessionStorage to prevent inflation on re-renders, reloads, or duplicate components.
 * - Immediately disconnects the observer upon firing.
 */
export const AdVisibilityTracker: React.FC<AdVisibilityTrackerProps> = ({
  ad,
  children,
  className = '',
  onViewRecorded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!ad?.id) return;

    // Check if already viewed in this browser session
    const getSessionId = () => {
      let sId = sessionStorage.getItem('sof_umer_ad_session_id');
      if (!sId) {
        sId = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
        sessionStorage.setItem('sof_umer_ad_session_id', sId);
      }
      return sId;
    };

    const isAlreadyTracked = () => {
      if (hasTriggeredRef.current || memoryTrackedAdIds.has(ad.id)) {
        return true;
      }
      try {
        const stored = sessionStorage.getItem('sof_umer_viewed_ads');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed[ad.id]) {
            return true;
          }
        }
      } catch (_) {}
      return false;
    };

    if (isAlreadyTracked()) {
      return;
    }

    const recordView = async () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      memoryTrackedAdIds.add(ad.id);

      try {
        // Save in sessionStorage
        const stored = sessionStorage.getItem('sof_umer_viewed_ads');
        const map = stored ? JSON.parse(stored) : {};
        map[ad.id] = Date.now();
        sessionStorage.setItem('sof_umer_viewed_ads', JSON.stringify(map));
      } catch (_) {}

      try {
        const sessionId = getSessionId();
        await fetch(`/api/advertisements/${ad.id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId,
            placement: ad.position
          })
        });

        if (onViewRecorded) {
          onViewRecorded(ad.id);
        }
      } catch (err) {
        console.warn(`[AdTracker] Error reporting view for ad ${ad.id}:`, err);
      }
    };

    // IntersectionObserver setup
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        // Requirement: at least 50% of the advertisement is in view
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Start dwell timer (800ms)
          if (!dwellTimerRef.current && !hasTriggeredRef.current) {
            dwellTimerRef.current = setTimeout(() => {
              recordView();
              observer.disconnect();
            }, 800);
          }
        } else {
          // Cancel dwell timer if user scrolled away before 800ms
          if (dwellTimerRef.current) {
            clearTimeout(dwellTimerRef.current);
            dwellTimerRef.current = null;
          }
        }
      },
      {
        root: null,
        threshold: [0.2, 0.5, 0.8]
      }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      observer.disconnect();
    };
  }, [ad?.id, ad?.position, onViewRecorded]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
