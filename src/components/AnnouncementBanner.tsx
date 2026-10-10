import React, { useState } from 'react';
import { Announcement, AnnouncementType } from '../types';
import { useApp } from '../lib/AppContext';
import { formatEthiopiaDateRange } from '../utils/ethiopiaTime';
import { 
  Megaphone, 
  Wrench, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnnouncementBannerProps {
  // If true, only render announcements marked as isImportantAlert
  importantAlertOnly?: boolean;
  // If true, render home page banner announcements (showHomeBanner: true)
  homeBannerOnly?: boolean;
  className?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  importantAlertOnly = false,
  homeBannerOnly = false,
  className = ''
}) => {
  const { announcements, dismissAnnouncement, currentLanguage, t } = useApp();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [dismissingIds, setDismissingIds] = useState<string[]>([]);

  // Filter relevant active announcements
  const displayedAnnouncements = (announcements || []).filter(a => {
    if (a.status !== 'published') return false;
    if (importantAlertOnly) {
      return a.isImportantAlert === true;
    }
    if (homeBannerOnly) {
      return a.showHomeBanner !== false && !a.isImportantAlert;
    }
    return true;
  });

  if (displayedAnnouncements.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissingIds(prev => [...prev, id]);
    await dismissAnnouncement(id);
    setDismissingIds(prev => prev.filter(i => i !== id));
  };

  // Helper to pick localized string
  const getLocalizedTitle = (a: Announcement) => {
    if (currentLanguage === 'am' && a.titleAm) return a.titleAm;
    if (currentLanguage === 'om' && a.titleOm) return a.titleOm;
    return a.titleEn;
  };

  const getLocalizedMessage = (a: Announcement) => {
    if (currentLanguage === 'am' && a.messageAm) return a.messageAm;
    if (currentLanguage === 'om' && a.messageOm) return a.messageOm;
    return a.messageEn;
  };

  const getTypeConfig = (type: AnnouncementType) => {
    switch (type) {
      case 'scheduled_maintenance':
        return {
          icon: <Wrench className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          containerBg: 'from-amber-950/40 via-black to-black border-amber-500/30',
          accentText: 'text-amber-400',
          label: t('announcement_type_maintenance') || 'Scheduled Maintenance'
        };
      case 'service_interruption':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          containerBg: 'from-rose-950/40 via-black to-black border-rose-500/30',
          accentText: 'text-rose-400',
          label: t('announcement_type_interruption') || 'Service Interruption'
        };
      case 'security_notice':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          containerBg: 'from-amber-950/40 via-black to-black border-amber-500/30',
          accentText: 'text-amber-400',
          label: t('announcement_type_security') || 'Security Notice'
        };
      case 'new_feature':
        return {
          icon: <Zap className="w-5 h-5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          containerBg: 'from-emerald-950/40 via-black to-black border-emerald-500/30',
          accentText: 'text-emerald-400',
          label: t('announcement_type_feature') || 'New Feature'
        };
      case 'important_update':
        return {
          icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          containerBg: 'from-cyan-950/40 via-black to-black border-cyan-500/30',
          accentText: 'text-cyan-400',
          label: t('announcement_type_update') || 'Important Update'
        };
      case 'general':
      default:
        return {
          icon: <Megaphone className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          containerBg: 'from-[#14141d] via-black to-black border-white/10',
          accentText: 'text-amber-400',
          label: t('announcement_type_general') || 'Official Announcement'
        };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {displayedAnnouncements.map(announcement => {
          const config = getTypeConfig(announcement.type);
          const title = getLocalizedTitle(announcement);
          const message = getLocalizedMessage(announcement);
          const isExpanded = expandedIds.includes(announcement.id);
          const isDismissing = dismissingIds.includes(announcement.id);
          const dateRangeStr = formatEthiopiaDateRange(announcement.startDate, announcement.endDate);
          const isLongMessage = message.length > 160;

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border p-4 sm:p-5 relative shadow-xl bg-gradient-to-r ${config.containerBg} backdrop-blur-md overflow-hidden`}
            >
              {/* Top Row: Type Badge, Time Info, Dismiss Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                    {config.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${config.badgeBg}`}>
                    {config.label}
                  </span>
                  {announcement.isImportantAlert && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                      {t('important_alert_tag') || 'IMPORTANT ALERT'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {dateRangeStr && (
                    <div className="flex items-center gap-1.5 text-[11px] text-white/60 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                      <Clock className="w-3 h-3 text-amber-400/80 shrink-0" />
                      <span className="font-mono">{dateRangeStr}</span>
                    </div>
                  )}

                  {announcement.isDismissible && (
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(announcement.id, e)}
                      disabled={isDismissing}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 hover:border-white/20 transition cursor-pointer disabled:opacity-50"
                      title={t('dismiss_announcement') || 'Dismiss notice'}
                      aria-label="Dismiss announcement"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <div className="text-left space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {title}
                </h4>

                <div className="text-xs sm:text-sm text-white/80 leading-relaxed font-light whitespace-pre-line">
                  {isLongMessage && !isExpanded ? (
                    <>
                      {message.slice(0, 150)}...
                    </>
                  ) : (
                    message
                  )}
                </div>

                {isLongMessage && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(announcement.id)}
                    className="mt-1 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{isExpanded ? (t('show_less') || 'Show Less') : (t('read_full_announcement') || 'Read Full Announcement')}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
