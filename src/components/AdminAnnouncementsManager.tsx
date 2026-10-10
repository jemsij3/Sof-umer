import React, { useState, useEffect } from 'react';
import { Announcement, AnnouncementType, AnnouncementAudience, AnnouncementStatus } from '../types';
import { useApp } from '../lib/AppContext';
import { 
  toEthiopiaInputDateTime, 
  fromEthiopiaInputDateTime, 
  getEthiopiaCurrentInputDateTime,
  formatEthiopiaDateTime,
  formatEthiopiaDateRange,
  ETHIOPIA_TIMEZONE
} from '../utils/ethiopiaTime';
import { 
  Megaphone, Plus, Edit2, Trash2, CheckCircle2, Clock, 
  AlertTriangle, ShieldAlert, Sparkles, Zap, Wrench, Eye, 
  Calendar, Check, X, Bell, RefreshCw, Send, AlertCircle, 
  Volume2, Users, Globe, UserCheck, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AmharicInput } from './AmharicInput';

export const AdminAnnouncementsManager: React.FC = () => {
  const { currentUser, t, refreshData } = useApp();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'scheduled' | 'draft' | 'expired'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form Fields
  const [titleEn, setTitleEn] = useState<string>('');
  const [messageEn, setMessageEn] = useState<string>('');
  const [titleOm, setTitleOm] = useState<string>('');
  const [messageOm, setMessageOm] = useState<string>('');
  const [titleAm, setTitleAm] = useState<string>('');
  const [messageAm, setMessageAm] = useState<string>('');

  const [type, setType] = useState<AnnouncementType>('general');
  const [targetAudience, setTargetAudience] = useState<AnnouncementAudience>('all');
  const [showHomeBanner, setShowHomeBanner] = useState<boolean>(true);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [isImportantAlert, setIsImportantAlert] = useState<boolean>(false);
  const [isDismissible, setIsDismissible] = useState<boolean>(true);

  // Scheduling in Ethiopia local time format (YYYY-MM-DDTHH:mm)
  const [startDateInput, setStartDateInput] = useState<string>('');
  const [endDateInput, setEndDateInput] = useState<string>('');
  const [enableReminder, setEnableReminder] = useState<boolean>(false);
  const [reminderLeadTimeHours, setReminderLeadTimeHours] = useState<number>(24);

  // Publishing action choice: 'draft' | 'publish' | 'schedule'
  const [submitIntent, setSubmitIntent] = useState<'draft' | 'publish' | 'schedule'>('draft');

  // Multi-language tab inside modal
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'om' | 'am'>('en');

  // Preview panel toggle inside modal
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const getAuthToken = () => {
    return localStorage.getItem('sof_umer_token') || localStorage.getItem('sof_umer_auth_token') || '';
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load admin announcements');
      }
    } catch (err) {
      console.error('Error fetching admin announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = (defaultType: AnnouncementType = 'general') => {
    setEditingAnnouncement(null);
    setTitleEn('');
    setMessageEn('');
    setTitleOm('');
    setMessageOm('');
    setTitleAm('');
    setMessageAm('');

    setType(defaultType);
    setTargetAudience('all');
    setShowHomeBanner(true);
    setShowNotificationCenter(defaultType === 'scheduled_maintenance');
    setIsImportantAlert(defaultType === 'scheduled_maintenance');
    setIsDismissible(true);

    // Initialize start time with Ethiopia current time
    setStartDateInput(getEthiopiaCurrentInputDateTime());
    setEndDateInput('');
    setEnableReminder(defaultType === 'scheduled_maintenance');
    setReminderLeadTimeHours(24);

    setSubmitIntent(defaultType === 'scheduled_maintenance' ? 'schedule' : 'publish');
    setActiveLangTab('en');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setTitleEn(a.titleEn || '');
    setMessageEn(a.messageEn || '');
    setTitleOm(a.titleOm || '');
    setMessageOm(a.messageOm || '');
    setTitleAm(a.titleAm || '');
    setMessageAm(a.messageAm || '');

    setType(a.type);
    setTargetAudience(a.targetAudience);
    setShowHomeBanner(a.showHomeBanner !== false);
    setShowNotificationCenter(Boolean(a.showNotificationCenter));
    setIsImportantAlert(Boolean(a.isImportantAlert));
    setIsDismissible(a.isDismissible !== false);

    setStartDateInput(toEthiopiaInputDateTime(a.startDate));
    setEndDateInput(a.endDate ? toEthiopiaInputDateTime(a.endDate) : '');
    setEnableReminder(Boolean(a.enableReminder));
    setReminderLeadTimeHours(a.reminderLeadTimeHours || 24);

    setSubmitIntent(a.status === 'scheduled' ? 'schedule' : (a.status === 'published' ? 'publish' : 'draft'));
    setActiveLangTab('en');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!titleEn.trim()) {
      setActiveLangTab('en');
      setFormError('English Title is required.');
      return;
    }
    if (!messageEn.trim()) {
      setActiveLangTab('en');
      setFormError('English Announcement Message is required.');
      return;
    }

    if (!startDateInput) {
      setFormError('Start date and time (Ethiopia Time) is required.');
      return;
    }

    const startIso = fromEthiopiaInputDateTime(startDateInput);
    if (!startIso) {
      setFormError('Invalid start date/time specified.');
      return;
    }

    let endIso: string | undefined = undefined;
    if (endDateInput) {
      endIso = fromEthiopiaInputDateTime(endDateInput);
      if (!endIso) {
        setFormError('Invalid expiration / end date format.');
        return;
      }
      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        setFormError('End / expiration date must be strictly after the start date.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = getAuthToken();

      let targetStatus: AnnouncementStatus = 'draft';
      if (submitIntent === 'publish') {
        targetStatus = 'published';
      } else if (submitIntent === 'schedule') {
        targetStatus = 'scheduled';
      }

      const payload = {
        titleEn: titleEn.trim(),
        messageEn: messageEn.trim(),
        titleOm: titleOm.trim() || undefined,
        messageOm: messageOm.trim() || undefined,
        titleAm: titleAm.trim() || undefined,
        messageAm: messageAm.trim() || undefined,
        type,
        targetAudience,
        showHomeBanner,
        showNotificationCenter,
        isImportantAlert,
        isDismissible,
        startDate: startIso,
        endDate: endIso,
        enableReminder,
        reminderLeadTimeHours: Number(reminderLeadTimeHours) || 24,
        status: targetStatus
      };

      const url = editingAnnouncement 
        ? `/api/admin/announcements/${editingAnnouncement.id}` 
        : '/api/admin/announcements';
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save announcement');
      }

      setIsModalOpen(false);
      setActionSuccessMessage(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
      setTimeout(() => setActionSuccessMessage(''), 4000);
      await fetchAnnouncements();
      refreshData();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/announcements/${id}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionSuccessMessage('Announcement published immediately!');
        setTimeout(() => setActionSuccessMessage(''), 4000);
        await fetchAnnouncements();
        refreshData();
      }
    } catch (err) {
      console.error('Error publishing:', err);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/announcements/${id}/unpublish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionSuccessMessage('Announcement unpublished and reverted to Draft.');
        setTimeout(() => setActionSuccessMessage(''), 4000);
        await fetchAnnouncements();
        refreshData();
      }
    } catch (err) {
      console.error('Error unpublishing:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/announcements/${deletingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletingId(null);
        setActionSuccessMessage('Announcement deleted permanently.');
        setTimeout(() => setActionSuccessMessage(''), 4000);
        await fetchAnnouncements();
        refreshData();
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter announcements
  const filteredList = announcements.filter(a => {
    const eff = (a as any).effectiveStatus || a.status;
    if (filterStatus !== 'all' && eff !== filterStatus) return false;
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = a.titleEn.toLowerCase().includes(q) || a.messageEn.toLowerCase().includes(q);
      const matchOm = a.titleOm?.toLowerCase().includes(q) || a.messageOm?.toLowerCase().includes(q);
      const matchAm = a.titleAm?.toLowerCase().includes(q) || a.messageAm?.toLowerCase().includes(q);
      if (!matchEn && !matchOm && !matchAm) return false;
    }
    return true;
  });

  const getTypeMeta = (tType: AnnouncementType) => {
    switch (tType) {
      case 'scheduled_maintenance':
        return { label: 'Scheduled Maintenance', icon: <Wrench className="w-4 h-4 text-amber-400" />, badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'service_interruption':
        return { label: 'Service Interruption', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'security_notice':
        return { label: 'Security Notice', icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'new_feature':
        return { label: 'New Feature', icon: <Zap className="w-4 h-4 text-emerald-400" />, badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      case 'important_update':
        return { label: 'Important Update', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      case 'general':
      default:
        return { label: 'General Announcement', icon: <Megaphone className="w-4 h-4 text-amber-400" />, badge: 'bg-white/10 text-white/80 border-white/20' };
    }
  };

  const getStatusBadge = (a: Announcement) => {
    const eff = (a as any).effectiveStatus || a.status;
    switch (eff) {
      case 'published':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Published</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Scheduled</span>;
      case 'expired':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">Expired</span>;
      case 'draft':
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white/60 border border-white/20">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/30 via-[#0d0d12] to-[#0d0d12] p-6 rounded-3xl border border-amber-500/20 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-inner">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-white tracking-wide">
                Announcements & Notifications
              </h3>
              <p className="text-xs text-white/50">
                Create, schedule, and broadcast important notices, scheduled maintenance alerts, and service updates.
              </p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
              <Clock className="w-3 h-3 text-amber-400" />
              Time Zone: <strong className="text-white ml-1 font-mono">Ethiopia (Addis Ababa, EAT UTC+3)</strong>
            </span>
            <span className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
              <Shield className="w-3 h-3 text-emerald-400" />
              Maintenance Safety: Announcements <strong>never</strong> trigger maintenance mode automatically.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openCreateModal('scheduled_maintenance')}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Wrench className="w-4 h-4" />
            <span>Announce Maintenance</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateModal('general')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xl shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'published', label: 'Published' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'draft', label: 'Drafts' },
            { id: 'expired', label: 'Expired' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === s.id
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {s.label}
              <span className="ml-1.5 text-[10px] opacity-70">
                {s.id === 'all' 
                  ? announcements.length 
                  : announcements.filter(a => ((a as any).effectiveStatus || a.status) === s.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search input & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="p-2 px-3 rounded-xl bg-[#12121a] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 w-full sm:w-60"
          />
          <button
            type="button"
            onClick={fetchAnnouncements}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition cursor-pointer"
            title="Refresh announcements list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Announcement List */}
      <div className="space-y-3">
        {isLoading && announcements.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs bg-[#0d0d12]/90 border border-white/5 rounded-3xl space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Loading announcements...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs bg-[#0d0d12]/90 border border-white/5 rounded-3xl space-y-3">
            <Megaphone className="w-8 h-8 mx-auto text-white/20" />
            <p className="font-semibold text-white/60">No announcements found matching the selected filter.</p>
            <p className="text-[11px] text-white/40">Click "New Announcement" or "Announce Maintenance" above to draft a notice.</p>
          </div>
        ) : (
          filteredList.map(a => {
            const meta = getTypeMeta(a.type);
            const dateStr = formatEthiopiaDateRange(a.startDate, a.endDate);
            const effStatus = (a as any).effectiveStatus || a.status;

            return (
              <div
                key={a.id}
                className="bg-[#0d0d12]/90 border border-white/5 hover:border-white/10 p-5 rounded-3xl transition space-y-3 shadow-lg relative group"
              >
                {/* Header row: Type badge, Status badge, Audience, Dates, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${meta.badge}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                    {getStatusBadge(a)}

                    {a.isImportantAlert && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Important Alert
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white/50 bg-black/40 border border-white/5">
                      Audience: <strong className="text-white capitalize">{a.targetAudience}</strong>
                    </span>
                  </div>

                  {/* Actions: Edit, Publish Now / Unpublish, Delete */}
                  <div className="flex items-center gap-2">
                    {effStatus === 'published' ? (
                      <button
                        type="button"
                        onClick={() => handleUnpublish(a.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 text-[11px] font-bold transition cursor-pointer"
                        title="Revert to Draft"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(a.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Publish this notice immediately"
                      >
                        <Send className="w-3 h-3" />
                        Publish Now
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(a)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 transition cursor-pointer"
                      title="Edit announcement"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(a.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      title="Delete announcement permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content area: Multilingual title & preview */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h4 className="text-base font-bold text-white">
                      {a.titleEn}
                    </h4>
                    {a.titleOm && (
                      <span className="text-xs text-amber-400/80 font-medium">
                        [OM: {a.titleOm}]
                      </span>
                    )}
                    {a.titleAm && (
                      <span className="text-xs text-amber-400/80 font-medium">
                        [AM: {a.titleAm}]
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-light whitespace-pre-line">
                    {a.messageEn}
                  </p>
                </div>

                {/* Footer metadata: Display locations, Ethiopia dates, Acknowledgement count */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/50 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-3">
                    {dateStr && (
                      <span className="flex items-center gap-1 text-white/70 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                        <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        {dateStr}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      Placements:
                      {a.showHomeBanner && <strong className="text-white ml-1">Home Banner</strong>}
                      {a.showNotificationCenter && <strong className="text-white ml-1">Notification Center</strong>}
                      {a.isImportantAlert && <strong className="text-amber-400 ml-1">Important Alert</strong>}
                    </span>

                    {a.enableReminder && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Reminder: {a.reminderLeadTimeHours}h before start ({a.reminderSent ? 'Sent' : 'Pending'})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {a.acknowledgedCount !== undefined && (
                      <span>
                        Dismissed/Acknowledged: <strong className="text-white">{a.acknowledgedCount}</strong>
                      </span>
                    )}
                    <span>
                      Created: {new Date(a.createdAt).toLocaleDateString()} by {a.createdByName || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0e0e14] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 text-left"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-black to-black">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                    </h3>
                    <p className="text-xs text-white/50">
                      Configure multilingual content, placement, and Ethiopian schedule.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Multilingual Tabs (English, Afaan Oromoo, Amharic) */}
                <div className="space-y-4 bg-[#12121a] p-4.5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Multilingual Notice Content
                    </span>

                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setActiveLangTab('en')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeLangTab === 'en' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        English *
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLangTab('om')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeLangTab === 'om' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Afaan Oromoo {titleOm && '✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLangTab('am')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeLangTab === 'am' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        አማርኛ (Amharic) {titleAm && '✓'}
                      </button>
                    </div>
                  </div>

                  {/* English Tab */}
                  {activeLangTab === 'en' && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          Announcement Title (English) <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={titleEn}
                          onChange={e => setTitleEn(e.target.value)}
                          placeholder="e.g. Scheduled System Maintenance"
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          Message Body (English) <span className="text-amber-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={messageEn}
                          onChange={e => setMessageEn(e.target.value)}
                          placeholder="e.g. Dear Sof Umer Users, we will perform scheduled maintenance on October 15, 2026, from 10:00 PM to 11:30 PM Ethiopia time. Some services may be temporarily unavailable."
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Afaan Oromoo Tab */}
                  {activeLangTab === 'om' && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          Mata Duree Beeksisaa (Afaan Oromoo)
                        </label>
                        <input
                          type="text"
                          value={titleOm}
                          onChange={e => setTitleOm(e.target.value)}
                          placeholder="e.g. Tajaajila Fooyyessuu Karoorfame"
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          Ergaa Beeksisaa (Afaan Oromoo)
                        </label>
                        <textarea
                          rows={4}
                          value={messageOm}
                          onChange={e => setMessageOm(e.target.value)}
                          placeholder="e.g. Kabajamoo maamiltoota Sof Umer, Onkololeessa 15, 2026 sa'a 10:00 PM hanga 11:30 PM tajaajilli fooyyessuu ni adeemsifama."
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Amharic Tab with Ge'ez support */}
                  {activeLangTab === 'am' && (
                    <div className="space-y-3 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          የማስታወቂያ ርዕስ (አማርኛ)
                        </label>
                        <AmharicInput
                          value={titleAm}
                          onChange={val => setTitleAm(val)}
                          placeholder="ለምሳሌ፡ የታቀደ የጥገና ማስታወቂያ"
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-1.5">
                          የማስታወቂያ መልዕክት (አማርኛ)
                        </label>
                        <AmharicInput
                          value={messageAm}
                          onChange={val => setMessageAm(val)}
                          isTextArea={true}
                          placeholder="ለምሳሌ፡ ውድ የሶፍ ኡመር ተጠቃሚዎች፣ በጥቅምት 15፣ 2026 ከምሽቱ 10:00 እስከ 11:30 የኢትዮጵያ ሰዓት የታቀደ የጥገና ስራ እናከናውናለን።"
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 leading-relaxed font-sans min-h-[96px]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Announcement Type & Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Announcement Type
                    </label>
                    <select
                      value={type}
                      onChange={e => {
                        const newType = e.target.value as AnnouncementType;
                        setType(newType);
                        if (newType === 'scheduled_maintenance') {
                          setIsImportantAlert(true);
                          setShowNotificationCenter(true);
                          setEnableReminder(true);
                        }
                      }}
                      className="w-full p-3 bg-[#12121a] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="general">General Announcement</option>
                      <option value="scheduled_maintenance">Scheduled Maintenance</option>
                      <option value="important_update">Important Update</option>
                      <option value="new_feature">New Feature</option>
                      <option value="service_interruption">Service Interruption</option>
                      <option value="security_notice">Security Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Target Audience
                    </label>
                    <select
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value as AnnouncementAudience)}
                      className="w-full p-3 bg-[#12121a] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="all">All Visitors & Logged-in Users</option>
                      <option value="users">Logged-in Users Only</option>
                      <option value="public">Public Visitors Only (Guest Users)</option>
                    </select>
                  </div>
                </div>

                {/* Ethiopian Scheduling (Africa/Addis_Ababa) */}
                <div className="bg-[#12121a] p-4.5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Scheduling (Ethiopia Local Time — EAT, UTC+3)
                    </span>
                    <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded font-mono">
                      {ETHIOPIA_TIMEZONE}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        Start Date & Time (Addis Ababa Time) <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={startDateInput}
                        onChange={e => setStartDateInput(e.target.value)}
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">
                        End / Expiration Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={endDateInput}
                        onChange={e => setEndDateInput(e.target.value)}
                        className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Reminder Settings */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableReminder}
                        onChange={e => setEnableReminder(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-black/40"
                      />
                      <span className="text-xs text-white/80 font-medium">
                        Enable automatic upcoming reminder notification
                      </span>
                    </label>

                    {enableReminder && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60">Lead Time:</span>
                        <select
                          value={reminderLeadTimeHours}
                          onChange={e => setReminderLeadTimeHours(Number(e.target.value))}
                          className="p-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                        >
                          <option value={1}>1 hour before</option>
                          <option value={2}>2 hours before</option>
                          <option value={6}>6 hours before</option>
                          <option value={12}>12 hours before</option>
                          <option value={24}>24 hours (1 day) before</option>
                          <option value={48}>48 hours (2 days) before</option>
                          <option value={72}>72 hours (3 days) before</option>
                          <option value={168}>1 week before</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display Options & Placements */}
                <div className="bg-[#12121a] p-4.5 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Display Options & Placements
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition">
                      <input
                        type="checkbox"
                        checked={showHomeBanner}
                        onChange={e => setShowHomeBanner(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-black/40"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Home Page Banner</span>
                        <span className="text-[10px] text-white/50">Prominent top notice on marketplace</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition">
                      <input
                        type="checkbox"
                        checked={showNotificationCenter}
                        onChange={e => setShowNotificationCenter(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-black/40"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Notification Center</span>
                        <span className="text-[10px] text-white/50">Send to user bell icon notifications</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition">
                      <input
                        type="checkbox"
                        checked={isImportantAlert}
                        onChange={e => setIsImportantAlert(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-black/40"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Important Alert Badge</span>
                        <span className="text-[10px] text-white/50">Highlighted alert banner styling</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition">
                      <input
                        type="checkbox"
                        checked={isDismissible}
                        onChange={e => setIsDismissible(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 bg-black/40"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">Allow Users to Dismiss</span>
                        <span className="text-[10px] text-white/50">Shows close (X) button with ack tracking</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Safety Guarantee Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Safety Guarantee:</strong> Publishing or scheduling this announcement will <em>never</em> automatically enable Maintenance Mode. Maintenance Mode remains independently controlled via System Settings.
                  </span>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={() => setSubmitIntent('draft')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={() => setSubmitIntent('schedule')}
                      className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Schedule
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={() => setSubmitIntent('publish')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xl shadow-amber-500/10 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Immediately</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0e14] border border-rose-500/20 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Delete Announcement?</h3>
                <p className="text-xs text-white/60 mt-1">
                  Are you sure you want to delete this announcement? This action is permanent and cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
