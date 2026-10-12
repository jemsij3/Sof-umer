import React, { useState, useEffect } from 'react';
import {
  Megaphone, DollarSign, Clock, CheckCircle2, XCircle, AlertTriangle,
  Play, Pause, Trash2, Edit2, Plus, ExternalLink, Calendar, Eye,
  Video, Image as ImageIcon, ShieldCheck, Tag, Sparkles, Filter,
  ArrowRight, Check, Zap, Layers, Upload, Globe, ChevronRight, ToggleLeft, ToggleRight, X, BarChart3
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { Advertisement, AdPlacement, AdPackage, SystemSettings } from '../types';
import {
  DEFAULT_BANNER_AD_PRICING,
  getEffectiveBannerPricing,
  calculateDisplayInterval,
  isAdPubliclyActive,
  getAdDaysRemaining,
  validateVideoFile
} from '../lib/advertisements';
import { AmharicInput } from './AmharicInput';

interface AdminAdsManagerProps {
  onRefresh?: () => void;
}

export const AdminAdsManager: React.FC<AdminAdsManagerProps> = () => {
  const {
    advertisements,
    systemSettings,
    setSystemSettings,
    updateSystemSettings,
    refreshData,
    currentUser,
    hasPermission,
    t
  } = useApp();

  // Active top-level subtab in Ads & Campaigns
  const [activeSubTab, setActiveSubTab] = useState<
    'placements' | 'pricing' | 'requests' | 'campaigns' | 'listing_promotions'
  >('placements');

  // Placement filter inside Placements tab
  const [selectedPlacementTab, setSelectedPlacementTab] = useState<AdPlacement | 'all'>('all');
  const [placementStatusFilter, setPlacementStatusFilter] = useState<'all' | 'active' | 'pending' | 'paused' | 'expired'>('all');

  // Pricing edit state
  const effectivePricing = getEffectiveBannerPricing(systemSettings);
  const [pricingForm, setPricingForm] = useState(() => JSON.parse(JSON.stringify(effectivePricing)));
  const [activePricingTab, setActivePricingTab] = useState<AdPlacement>('hero');
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Review modal / dialog state
  const [reviewingAd, setReviewingAd] = useState<Advertisement | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewStartDate, setReviewStartDate] = useState('');
  const [reviewEndDate, setReviewEndDate] = useState('');
  const [reviewPaymentStatus, setReviewPaymentStatus] = useState<'verified' | 'rejected' | 'pending'>('verified');
  const [isProcessingReview, setIsProcessingReview] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Create / Edit Ad Banner form state (admin)
  const [isAdFormOpen, setIsAdFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    linkUrl: '',
    position: 'hero' as AdPlacement,
    mediaType: 'image' as 'image' | 'video',
    imageUrl: '',
    videoUrl: '',
    videoDuration: 0,
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [adUploading, setAdUploading] = useState(false);
  const [adFormError, setAdFormError] = useState<string | null>(null);

  // Listing Promotions state (preserves existing listing boost system)
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editingPkgName, setEditingPkgName] = useState('');
  const [editingPkgBadge, setEditingPkgBadge] = useState('');
  const [editingPkgDuration, setEditingPkgDuration] = useState('');
  const [editingPkgViews, setEditingPkgViews] = useState('');
  const [editingPkgPrice, setEditingPkgPrice] = useState(0);
  const [editingPkgDesc, setEditingPkgDesc] = useState('');

  const rawAdPackages: AdPackage[] = systemSettings.adPackages || [];
  const adPackages = rawAdPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'));

  // Local synchronized advertisements state for instant real-time view updates
  const [localAds, setLocalAds] = useState<Advertisement[]>(advertisements || []);

  useEffect(() => {
    setLocalAds(advertisements || []);
  }, [advertisements]);

  // Real-time EventSource connection + active polling for live view counting
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/advertisements/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'ad_view' && data.adId) {
            setLocalAds(prev =>
              prev.map(a => a.id === data.adId ? { ...a, viewsCount: data.viewsCount } : a)
            );
          } else if (data && data.type === 'ad_click' && data.adId) {
            setLocalAds(prev =>
              prev.map(a => a.id === data.adId ? { ...a, clicksCount: data.clicksCount } : a)
            );
          }
        } catch (_) {}
      };
    } catch (_) {}

    // Polling interval (every 4 seconds) to ensure real-time consistency
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/advertisements', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLocalAds(data);
          }
        }
      } catch (_) {}
    }, 4000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(pollInterval);
    };
  }, []);

  // Counts & stats based on live synchronized localAds
  const pendingRequests = localAds.filter(a => a.status === 'pending');
  const activeAds = localAds.filter(a => isAdPubliclyActive(a));
  const heroAds = localAds.filter(a => a.position === 'hero');
  const sidebarAds = localAds.filter(a => a.position === 'sidebar');
  const footerAds = localAds.filter(a => a.position === 'banner');

  // Placement-specific view metrics (isolated from listing-boosting statistics)
  const heroTotalViews = heroAds.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const heroTotalClicks = heroAds.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
  const sidebarTotalViews = sidebarAds.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const sidebarTotalClicks = sidebarAds.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
  const footerTotalViews = footerAds.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const footerTotalClicks = footerAds.reduce((sum, a) => sum + (a.clicksCount || 0), 0);
  const totalBannerViews = localAds.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalBannerClicks = localAds.reduce((sum, a) => sum + (a.clicksCount || 0), 0);

  // --- Handlers for Pricing ---
  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    setPricingSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/banner-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        },
        body: JSON.stringify(pricingForm)
      });
      if (res.ok) {
        setPricingSuccessMsg('Banner advertising pricing and packages updated successfully!');
        const updatedSys = { ...systemSettings, bannerAdPricing: pricingForm };
        setSystemSettings(updatedSys);
        refreshData();
        setTimeout(() => setPricingSuccessMsg(null), 4000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to save pricing.');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving pricing.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleAddPackageTier = (plc: AdPlacement) => {
    const currentPkgs = pricingForm[plc]?.packages || [];
    const newId = `${plc}-${Date.now()}`;
    const newPkg = {
      id: newId,
      name: 'Custom Duration Tier',
      durationDays: 14,
      price: pricingForm[plc]?.price ? Math.round(pricingForm[plc].price * 1.8) : 2000,
      desc: `${plc === 'hero' ? 'Top hero' : plc === 'sidebar' ? 'Sidebar' : 'Inline footer'} banner placement`
    };
    setPricingForm({
      ...pricingForm,
      [plc]: {
        ...pricingForm[plc],
        packages: [...currentPkgs, newPkg]
      }
    });
  };

  const handleDeletePackageTier = (plc: AdPlacement, pkgId: string) => {
    const currentPkgs = pricingForm[plc]?.packages || [];
    if (currentPkgs.length <= 1) {
      alert('You must keep at least one duration package tier for each placement.');
      return;
    }
    setPricingForm({
      ...pricingForm,
      [plc]: {
        ...pricingForm[plc],
        packages: currentPkgs.filter((p: any) => p.id !== pkgId)
      }
    });
  };

  // --- Handlers for Review & Approval ---
  const handleOpenReview = (ad: Advertisement, action: 'approve' | 'reject') => {
    setReviewingAd(ad);
    setReviewAction(action);
    setRejectionReason(ad.rejectionReason || 'Content does not meet promotional guidelines.');
    setReviewPaymentStatus(ad.paymentStatus === 'unpaid' ? 'verified' : (ad.paymentStatus || 'verified') as any);
    const today = new Date().toISOString().split('T')[0];
    setReviewStartDate(ad.startDate || today);
    if (ad.endDate) {
      setReviewEndDate(ad.endDate);
    } else {
      const days = ad.durationDays || 7;
      const endD = new Date();
      endD.setDate(endD.getDate() + days);
      setReviewEndDate(endD.toISOString().split('T')[0]);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewingAd || !reviewAction) return;
    setIsProcessingReview(true);
    try {
      const res = await fetch(`/api/advertisements/${reviewingAd.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        },
        body: JSON.stringify({
          action: reviewAction,
          paymentStatus: reviewPaymentStatus,
          startDate: reviewStartDate,
          endDate: reviewEndDate,
          rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
          isActive: reviewAction === 'approve'
        })
      });
      if (res.ok) {
        setReviewingAd(null);
        setReviewAction(null);
        refreshData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update advertisement review status.');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing review.');
    } finally {
      setIsProcessingReview(false);
    }
  };

  // --- Toggle Active / Pause Campaign ---
  const handleToggleAdStatus = async (ad: Advertisement) => {
    try {
      const newActive = !ad.isActive;
      await fetch(`/api/advertisements/${ad.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        },
        body: JSON.stringify({
          action: newActive ? 'resume' : 'pause',
          isActive: newActive
        })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) return;
    try {
      await fetch(`/api/advertisements/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        }
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Admin Save / Edit Banner Form ---
  const handleOpenCreateForm = (placementOverride?: AdPlacement) => {
    setEditingAd(null);
    setAdForm({
      title: '',
      description: '',
      linkUrl: '',
      position: placementOverride || 'hero',
      mediaType: 'image',
      imageUrl: '',
      videoUrl: '',
      videoDuration: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
      })(),
      isActive: true
    });
    setAdFormError(null);
    setIsAdFormOpen(true);
  };

  const handleOpenEditForm = (ad: Advertisement) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title || '',
      description: ad.description || '',
      linkUrl: ad.linkUrl || '',
      position: ad.position || 'hero',
      mediaType: ad.mediaType === 'video' || ad.videoUrl ? 'video' : 'image',
      imageUrl: ad.imageUrl || '',
      videoUrl: ad.videoUrl || '',
      videoDuration: ad.videoDuration || 0,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      isActive: ad.isActive !== false
    });
    setAdFormError(null);
    setIsAdFormOpen(true);
  };

  const handleAdminVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdFormError(null);
    setAdUploading(true);

    try {
      const validation = await validateVideoFile(file);
      if (!validation.isValid) {
        setAdFormError(validation.error || 'Video validation failed. Maximum duration allowed is 30 seconds.');
        setAdUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
            },
            body: JSON.stringify({
              video: base64Data,
              media: base64Data,
              fileName: file.name
            })
          });

          const data = await res.json();
          const finalUrl = (res.ok && (data.url || data.videoUrl)) ? (data.url || data.videoUrl) : base64Data;
          setAdForm(prev => ({
            ...prev,
            videoUrl: finalUrl,
            imageUrl: finalUrl,
            videoDuration: validation.duration || 15
          }));
        } catch (err: any) {
          setAdFormError(err.message || 'Error uploading video file.');
        } finally {
          setAdUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setAdFormError(err.message || 'Error validating video.');
      setAdUploading(false);
    }
  };

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdFormError(null);
    setAdUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
          },
          body: JSON.stringify({
            image: base64Data,
            fileName: file.name
          })
        });

        const data = await res.json();
        const finalUrl = (res.ok && data.url) ? data.url : base64Data;
        setAdForm(prev => ({
          ...prev,
          imageUrl: finalUrl
        }));
      } catch (err: any) {
        setAdFormError(err.message || 'Error uploading image.');
      } finally {
        setAdUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdFormError(null);

    // Validate destination link
    let trimmedLink = (adForm.linkUrl || '').trim();
    if (!trimmedLink) {
      setAdFormError('Destination URL is required.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmedLink)) {
      trimmedLink = 'https://' + trimmedLink;
    }
    try {
      const parsed = new URL(trimmedLink);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setAdFormError('Only secure HTTP and HTTPS destination links are allowed.');
        return;
      }
    } catch {
      setAdFormError('Please enter a valid destination URL.');
      return;
    }

    if (adForm.mediaType === 'video') {
      if (!adForm.videoUrl && !adForm.imageUrl) {
        setAdFormError('Please upload a video file or provide a video URL.');
        return;
      }
      if (adForm.videoDuration && adForm.videoDuration > 30) {
        setAdFormError(`Video exceeds maximum allowed duration of 30 seconds (${adForm.videoDuration}s).`);
        return;
      }
    } else {
      if (!adForm.imageUrl) {
        setAdFormError('Please upload a banner image or provide an image URL.');
        return;
      }
    }

    try {
      const url = editingAd ? `/api/advertisements/${editingAd.id}` : '/api/advertisements';
      const method = editingAd ? 'PUT' : 'POST';
      const payload = {
        ...adForm,
        linkUrl: trimmedLink,
        status: adForm.isActive ? 'active' : 'paused',
        paymentStatus: 'verified',
        imageUrl: adForm.mediaType === 'video' ? (adForm.imageUrl || adForm.videoUrl) : adForm.imageUrl,
        videoUrl: adForm.mediaType === 'video' ? adForm.videoUrl : undefined,
        videoDuration: adForm.mediaType === 'video' ? adForm.videoDuration : undefined
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAdFormOpen(false);
        setEditingAd(null);
        refreshData();
      } else {
        const err = await res.json().catch(() => ({}));
        setAdFormError(err.error || 'Failed to save advertisement.');
      }
    } catch (err: any) {
      setAdFormError(err.message || 'Network error saving advertisement.');
    }
  };

  // Helper for listing boost packages
  const handleSaveListingPackage = async (pkgId: string) => {
    const updated = adPackages.map(p => {
      if (p.id === pkgId) {
        return {
          ...p,
          name: editingPkgName,
          badge: editingPkgBadge,
          duration: editingPkgDuration,
          views: editingPkgViews,
          price: editingPkgPrice,
          desc: editingPkgDesc
        };
      }
      return p;
    });
    setEditingPkgId(null);
    const updatedSys = { ...systemSettings, adPackages: updated };
    setSystemSettings(updatedSys);
    await updateSystemSettings(updatedSys);
  };

  // Filter ads for Placements tab
  const filteredPlacementAds = localAds.filter(ad => {
    if (selectedPlacementTab !== 'all' && ad.position !== selectedPlacementTab) return false;
    if (placementStatusFilter === 'active' && !isAdPubliclyActive(ad)) return false;
    if (placementStatusFilter === 'pending' && ad.status !== 'pending') return false;
    if (placementStatusFilter === 'paused' && (ad.isActive !== false && ad.status !== 'paused')) return false;
    if (placementStatusFilter === 'expired' && (ad.status !== 'expired' && (ad.endDate && new Date(ad.endDate) < new Date()))) return false;
    return true;
  });

  return (
    <div className="bg-[#0d0d12]/90 border border-white/5 p-4 sm:p-6 rounded-3xl space-y-6">
      
      {/* Top Header & Reorganized Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-1">
            <span>Marketplace Operations</span>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-white/70">Ads & Campaigns</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-serif font-bold text-white">Ads & Campaigns Control Center</h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Manage banner placements, track verified view counters in real-time, customize pricing, and review user campaigns.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateForm()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer shadow-lg w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create Advert Banner</span>
        </button>
      </div>

      {/* ORGANIZED SECTIONS (Segmented Controls) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#12121a] rounded-2xl border border-white/5">
        <button
          type="button"
          onClick={() => setActiveSubTab('placements')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'placements'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Ad Placement Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. Active Campaigns Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pricing')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pricing'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. Advertising Pricing & Packages</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'requests'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. User Advertisement Requests</span>
          {pendingRequests.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'requests' ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'
            }`}>
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('listing_promotions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'listing_promotions'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>5. Listing Promotions (Existing)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. AD PLACEMENT MANAGEMENT                               */}
      {/* ======================================================== */}
      {activeSubTab === 'placements' && (
        <div className="space-y-6">
          {/* Real-time Banner Performance Overview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#161626] to-emerald-500/10 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                  Live View Counter Active • Real-Time Stats
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm text-white">
                Banner Advertisements Verified View Statistics
              </h4>
              <p className="text-[11px] text-white/50">
                Views are accurately counted when banners are visible on screen (≥ 50% in view). Deduplication prevents false counts on reloads or re-renders.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
              <div className="p-2.5 sm:p-3 bg-black/50 border border-white/5 rounded-xl text-center min-w-[100px]">
                <span className="text-[9px] uppercase font-mono font-bold text-white/40 block">Total Views</span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  {totalBannerViews.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-black/50 border border-white/5 rounded-xl text-center min-w-[90px]">
                <span className="text-[9px] uppercase font-mono font-bold text-white/40 block">Total Clicks</span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-white mt-0.5">
                  {totalBannerClicks.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-black/50 border border-white/5 rounded-xl text-center min-w-[90px]">
                <span className="text-[9px] uppercase font-mono font-bold text-white/40 block">Avg CTR</span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-400 mt-0.5">
                  {totalBannerViews > 0 ? ((totalBannerClicks / totalBannerViews) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          {/* 3 Placements Capacity & Views Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hero Top Banner Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              selectedPlacementTab === 'hero' ? 'bg-amber-500/10 border-amber-500' : 'bg-[#12121a] border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  TOP BILLBOARD
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">Hero Top Banner</h4>
              <p className="text-[11px] text-white/50 mt-1">High-visibility position at the very top of SOF-UMER marketplace.</p>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/40 text-[10px] block">Occupied / Capacity</span>
                  <span className="font-extrabold text-white font-mono">
                    {heroAds.filter(a => isAdPubliclyActive(a)).length} / {effectivePricing.hero.maxSlots || 3} spaces
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber-400 font-bold font-mono text-[11px] flex items-center gap-1">
                      <Eye className="w-3 h-3 text-amber-400" /> {heroTotalViews.toLocaleString()} Views
                    </span>
                    <span className="text-white/30 text-[10px]">•</span>
                    <span className="text-white/50 font-mono text-[10px]">
                      {heroTotalClicks.toLocaleString()} Clicks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlacementTab('hero')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-amber-400 text-[11px] font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Manage Hero →
                </button>
              </div>
            </div>

            {/* Sidebar Widgets Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              selectedPlacementTab === 'sidebar' ? 'bg-amber-500/10 border-amber-500' : 'bg-[#12121a] border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  SIDEBAR WIDGETS
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">Sidebar Widgets</h4>
              <p className="text-[11px] text-white/50 mt-1">Engaging promotional cards displayed alongside listings in the sidebar.</p>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/40 text-[10px] block">Occupied / Capacity</span>
                  <span className="font-extrabold text-white font-mono">
                    {sidebarAds.filter(a => isAdPubliclyActive(a)).length} / {effectivePricing.sidebar.maxSlots || 5} spaces
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sky-400 font-bold font-mono text-[11px] flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sky-400" /> {sidebarTotalViews.toLocaleString()} Views
                    </span>
                    <span className="text-white/30 text-[10px]">•</span>
                    <span className="text-white/50 font-mono text-[10px]">
                      {sidebarTotalClicks.toLocaleString()} Clicks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlacementTab('sidebar')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-amber-400 text-[11px] font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Manage Sidebar →
                </button>
              </div>
            </div>

            {/* Inline Footer Bar Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              selectedPlacementTab === 'banner' ? 'bg-amber-500/10 border-amber-500' : 'bg-[#12121a] border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRE-FOOTER BAR
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">Inline Footer Bar</h4>
              <p className="text-[11px] text-white/50 mt-1">Wide horizontal banner positioned directly above the platform footer.</p>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/40 text-[10px] block">Occupied / Capacity</span>
                  <span className="font-extrabold text-white font-mono">
                    {footerAds.filter(a => isAdPubliclyActive(a)).length} / {effectivePricing.banner.maxSlots || 3} spaces
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-400" /> {footerTotalViews.toLocaleString()} Views
                    </span>
                    <span className="text-white/30 text-[10px]">•</span>
                    <span className="text-white/50 font-mono text-[10px]">
                      {footerTotalClicks.toLocaleString()} Clicks
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlacementTab('banner')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-amber-400 text-[11px] font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Manage Footer →
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar for Placements List */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#12121a] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider mr-1">Placement:</span>
              {(['all', 'hero', 'sidebar', 'banner'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlacementTab(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer capitalize ${
                    selectedPlacementTab === p
                      ? 'bg-amber-500 text-black'
                      : 'text-white/60 hover:text-white bg-white/5'
                  }`}
                >
                  {p === 'all' ? 'All Placements' : p === 'hero' ? 'Hero Top' : p === 'sidebar' ? 'Sidebar' : 'Inline Footer'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={placementStatusFilter}
                onChange={e => setPlacementStatusFilter(e.target.value as any)}
                className="bg-black/50 border border-white/10 text-xs text-white rounded-lg p-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active & Running</option>
                <option value="pending">Pending Review</option>
                <option value="paused">Paused / Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Advertisements List for Selected Placement */}
          <div className="space-y-3">
            {filteredPlacementAds.length === 0 ? (
              <div className="py-12 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <Megaphone className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40 font-medium">No advertisements found matching this filter.</p>
                <button
                  onClick={() => handleOpenCreateForm(selectedPlacementTab === 'all' ? 'hero' : selectedPlacementTab)}
                  className="mt-3 px-3.5 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl hover:bg-amber-500 hover:text-black transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Advert for this Placement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlacementAds.map(ad => {
                  const isLive = isAdPubliclyActive(ad);
                  const daysLeft = getAdDaysRemaining(ad);

                  return (
                    <div key={ad.id} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="p-4 flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/5 shrink-0 relative flex items-center justify-center">
                          {ad.mediaType === 'video' || ad.videoUrl ? (
                            <>
                              <video src={ad.videoUrl || ad.imageUrl} muted playsInline className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                <Video className="w-4 h-4 text-amber-400" />
                              </div>
                            </>
                          ) : (
                            <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                              {ad.position}
                            </span>
                            {isLive ? (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE LIVE
                              </span>
                            ) : ad.status === 'pending' ? (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PENDING REVIEW
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                {ad.status?.toUpperCase() || 'PAUSED'}
                              </span>
                            )}
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>{(ad.viewsCount || 0).toLocaleString()} Views</span>
                            </span>
                            {daysLeft !== null && isLive && (
                              <span className="text-[9px] text-white/40 font-mono">
                                {daysLeft}d left
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-xs text-white truncate">{ad.title}</h5>
                          <p className="text-[10px] text-white/50 line-clamp-2 mt-0.5">{ad.description}</p>
                          
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-400/80 font-mono truncate">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="truncate hover:underline">
                              {ad.linkUrl}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions & Real-Time Views Stats */}
                      <div className="p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-bold text-xs">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Views: {(ad.viewsCount || 0).toLocaleString()}</span>
                          </div>
                          <span className="text-[11px] text-white/50 font-mono">
                            Clicks: {(ad.clicksCount || 0).toLocaleString()}
                          </span>
                          {ad.viewsCount ? (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              CTR: {(((ad.clicksCount || 0) / (ad.viewsCount || 1)) * 100).toFixed(1)}%
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAdStatus(ad)}
                            className="p-1 text-white/60 hover:text-white cursor-pointer"
                            title={ad.isActive ? 'Pause' : 'Activate'}
                          >
                            {ad.isActive ? <ToggleRight className="w-5 h-5 text-amber-500" /> : <ToggleLeft className="w-5 h-5 text-white/30" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(ad)}
                            className="p-1 text-white/40 hover:text-amber-400 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1 text-white/40 hover:text-rose-500 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ADVERTISING PRICING & PACKAGES                        */}
      {/* ======================================================== */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-500" /> Dynamic Placement Pricing Configuration
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                Configure prices and duration packages for Hero, Sidebar, and Inline Footer placements. Changes apply instantly without redeploying code.
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              disabled={isSavingPricing}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 shrink-0"
            >
              {isSavingPricing ? 'Saving Changes...' : 'Save All Pricing Changes'}
            </button>
          </div>

          {pricingSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pricingSuccessMsg}</span>
            </div>
          )}

          {/* Placement Switcher */}
          <div className="flex gap-2 border-b border-white/5 pb-2">
            {[
              { id: 'hero', label: 'Hero Top Banner' },
              { id: 'sidebar', label: 'Sidebar Widgets' },
              { id: 'banner', label: 'Inline Footer Bar' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePricingTab(p.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activePricingTab === p.id
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/60 hover:text-white bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Current Placement Configuration */}
          {(() => {
            const currentSetting = pricingForm[activePricingTab] || effectivePricing[activePricingTab];
            const packages = currentSetting.packages || [];

            return (
              <div className="space-y-6 bg-[#12121a] border border-white/5 p-5 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-1">Placement Title</label>
                    <input
                      type="text"
                      value={currentSetting.title}
                      onChange={e => {
                        setPricingForm({
                          ...pricingForm,
                          [activePricingTab]: { ...currentSetting, title: e.target.value }
                        });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-1">Default Base Price ({currentSetting.currency || 'ETB'})</label>
                    <input
                      type="text"
                      inputMode="text"
                      value={currentSetting.price}
                      onChange={e => {
                        setPricingForm({
                          ...pricingForm,
                          [activePricingTab]: { ...currentSetting, price: Number(e.target.value) || 0 }
                        });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-1">Max Available Spaces / Slots</label>
                    <input
                      type="text"
                      inputMode="text"
                      value={currentSetting.maxSlots || 3}
                      onChange={e => {
                        setPricingForm({
                          ...pricingForm,
                          [activePricingTab]: { ...currentSetting, maxSlots: Number(e.target.value) || 1 }
                        });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Duration Packages Tiers */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs uppercase text-white/60 tracking-wider">
                      Duration Packages for {currentSetting.title}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleAddPackageTier(activePricingTab)}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold rounded-xl hover:bg-amber-500 hover:text-black transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Package Option
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {packages.map((pkg: any, idx: number) => (
                      <div key={pkg.id || idx} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Package Name</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={e => {
                              const updated = [...packages];
                              updated[idx] = { ...pkg, name: e.target.value };
                              setPricingForm({
                                ...pricingForm,
                                [activePricingTab]: { ...currentSetting, packages: updated }
                              });
                            }}
                            className="w-full p-2 bg-black/60 border border-white/5 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Duration (Days)</label>
                            <input
                              type="text"
                              inputMode="text"
                              value={pkg.durationDays}
                              onChange={e => {
                                const updated = [...packages];
                                updated[idx] = { ...pkg, durationDays: Number(e.target.value) || 1 };
                                setPricingForm({
                                  ...pricingForm,
                                  [activePricingTab]: { ...currentSetting, packages: updated }
                                });
                              }}
                              className="w-full p-2 bg-black/60 border border-white/5 rounded-lg text-xs text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Price (ETB)</label>
                            <input
                              type="text"
                              inputMode="text"
                              value={pkg.price}
                              onChange={e => {
                                const updated = [...packages];
                                updated[idx] = { ...pkg, price: Number(e.target.value) || 0 };
                                setPricingForm({
                                  ...pricingForm,
                                  [activePricingTab]: { ...currentSetting, packages: updated }
                                });
                              }}
                              className="w-full p-2 bg-black/60 border border-white/5 rounded-lg text-xs text-amber-400 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Description</label>
                          <input
                            type="text"
                            value={pkg.desc || ''}
                            onChange={e => {
                              const updated = [...packages];
                              updated[idx] = { ...pkg, desc: e.target.value };
                              setPricingForm({
                                ...pricingForm,
                                [activePricingTab]: { ...currentSetting, packages: updated }
                              });
                            }}
                            className="w-full p-2 bg-black/60 border border-white/5 rounded-lg text-xs text-white/70"
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleDeletePackageTier(activePricingTab, pkg.id)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                          >
                            Remove Tier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* Daily Advertisement Display Scheduling                   */}
                {/* ======================================================== */}
                <div className="pt-5 border-t border-white/5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-sm text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Daily Advertisement Display Scheduling</span>
                      </h5>
                      <p className="text-xs text-white/50 mt-0.5">
                        Configure independent daily display limits and automatic interval pacing for <strong className="text-white">{currentSetting.title}</strong>.
                      </p>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const newEnabled = !currentSetting.dailySchedulingEnabled;
                        const limit = Number(currentSetting.dailyDisplayLimit) || 24;
                        const opHours = Number(currentSetting.operatingHoursPerDay) || 24;
                        const interval = calculateDisplayInterval(limit, opHours);
                        setPricingForm({
                          ...pricingForm,
                          [activePricingTab]: {
                            ...currentSetting,
                            dailySchedulingEnabled: newEnabled,
                            dailyDisplayLimit: limit,
                            operatingHoursPerDay: opHours,
                            calculatedIntervalMinutes: interval
                          }
                        });
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                        currentSetting.dailySchedulingEnabled
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                      }`}
                    >
                      {currentSetting.dailySchedulingEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>Scheduling Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-white/40" />
                          <span>Scheduling Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Daily display limit */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-white/50 mb-1">
                          Daily Display Limit
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={currentSetting.dailyDisplayLimit || 24}
                          onChange={e => {
                            const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                            const opHours = Number(currentSetting.operatingHoursPerDay) || 24;
                            const calculatedInterval = calculateDisplayInterval(val, opHours);
                            setPricingForm({
                              ...pricingForm,
                              [activePricingTab]: {
                                ...currentSetting,
                                dailyDisplayLimit: val,
                                calculatedIntervalMinutes: calculatedInterval
                              }
                            });
                          }}
                          placeholder="e.g. 24 or 48"
                          className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-white/40 mt-1 block">
                          Maximum times this placement will render per day.
                        </span>
                      </div>

                      {/* Operating Hours per day */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-white/50 mb-1">
                          Operating Hours per Day
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={currentSetting.operatingHoursPerDay || 24}
                          onChange={e => {
                            const val = Math.max(1, Math.min(24, parseInt(e.target.value, 10) || 24));
                            const limit = Number(currentSetting.dailyDisplayLimit) || 24;
                            const calculatedInterval = calculateDisplayInterval(limit, val);
                            setPricingForm({
                              ...pricingForm,
                              [activePricingTab]: {
                                ...currentSetting,
                                operatingHoursPerDay: val,
                                calculatedIntervalMinutes: calculatedInterval
                              }
                            });
                          }}
                          placeholder="Default: 24 hours"
                          className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-white/40 mt-1 block">
                          Total active operating hours per day (default: 24h = 1440 min).
                        </span>
                      </div>

                      {/* Automatic interval between displays */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-white/50 mb-1">
                          Automatic Interval Between Displays
                        </label>
                        <div className="w-full p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono font-bold flex items-center justify-between">
                          <span>
                            {calculateDisplayInterval(
                              Number(currentSetting.dailyDisplayLimit) || 24,
                              Number(currentSetting.operatingHoursPerDay) || 24
                            )} minutes
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Auto Calculated
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40 mt-1 block">
                          Formula: {(Number(currentSetting.operatingHoursPerDay) || 24) * 60}m ÷ {Number(currentSetting.dailyDisplayLimit) || 24} limit
                        </span>
                      </div>
                    </div>

                    {/* Informative description block */}
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-white/70 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-300">
                          Automatic Frequency Scheduling Logic
                        </p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          When daily scheduling is enabled, advertisements under <strong>{currentSetting.title}</strong> will automatically pace displays so they do not exceed {currentSetting.dailyDisplayLimit || 24} impressions per day, spacing out impressions evenly every {calculateDisplayInterval(Number(currentSetting.dailyDisplayLimit) || 24, Number(currentSetting.operatingHoursPerDay) || 24)} minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. USER ADVERTISEMENT REQUESTS                           */}
      {/* ======================================================== */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h4 className="font-bold text-sm text-white">Submitted User Advertisements</h4>
              <p className="text-xs text-white/50">
                Review promotional video/image content, verify destination links, check payment slips, and approve or reject campaigns.
              </p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-xl">
              {pendingRequests.length} Pending Approval
            </span>
          </div>

          {advertisements.filter(a => a.status === 'pending' || a.paymentStatus === 'pending').length === 0 ? (
            <div className="py-16 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
              <ShieldCheck className="w-10 h-10 text-emerald-400/40 mx-auto mb-3" />
              <h5 className="font-serif font-bold text-base text-white">No Pending Advertisement Requests</h5>
              <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
                All submitted advertisement requests have been reviewed. When users submit campaigns, they will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {advertisements
                .filter(a => a.status === 'pending' || a.paymentStatus === 'pending')
                .map(ad => (
                  <div
                    key={ad.id}
                    className="p-5 bg-[#12121a] border border-amber-500/30 rounded-2xl space-y-4 shadow-lg shadow-amber-500/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                            {ad.position}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">
                            {ad.adType || 'Promotion'}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {ad.price ? `${ad.price.toLocaleString()} ETB` : 'Paid'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{ad.title}</h4>
                        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{ad.description}</p>
                        
                        <div className="mt-2 text-xs flex items-center gap-2 text-white/40">
                          <span>By: {ad.userName || ad.userEmail || 'User'}</span>
                          <span>•</span>
                          <span>Target: <a href={ad.linkUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{ad.linkUrl}</a></span>
                        </div>
                      </div>

                      {/* Review Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenReview(ad, 'reject')}
                          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleOpenReview(ad, 'approve')}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Schedule
                        </button>
                      </div>
                    </div>

                    {/* Media Preview & Payment Receipt Split */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                      {/* Media Preview */}
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                          Campaign Media Preview {ad.mediaType === 'video' ? '(Video ≤ 30s)' : '(Image Banner)'}
                        </span>
                        <div className="rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center border border-white/10">
                          {ad.mediaType === 'video' || ad.videoUrl ? (
                            <video
                              src={ad.videoUrl || ad.imageUrl}
                              controls
                              playsInline
                              className="w-full max-h-48 object-contain"
                            />
                          ) : (
                            <img
                              src={ad.imageUrl}
                              alt="Promo"
                              className="w-full max-h-48 object-contain"
                            />
                          )}
                        </div>
                      </div>

                      {/* Payment Slip Preview */}
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                          Payment Slip & Verification
                        </span>
                        {ad.receiptUrl ? (
                          <div className="space-y-2">
                            <div
                              onClick={() => setViewingReceiptUrl(ad.receiptUrl || null)}
                              className="rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center border border-white/10 cursor-pointer group relative"
                            >
                              <img
                                src={ad.receiptUrl}
                                alt="Receipt"
                                className="w-full max-h-48 object-contain group-hover:opacity-80 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition pointer-events-none">
                                Click to Expand Receipt
                              </div>
                            </div>
                            {ad.paymentReference && (
                              <p className="text-[11px] text-white/60 font-mono">
                                Ref No: <span className="text-amber-400 font-bold">{ad.paymentReference}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="py-10 text-center text-xs text-white/40">
                            No payment receipt uploaded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ACTIVE CAMPAIGNS                                      */}
      {/* ======================================================== */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-white/5">
            <div>
              <h4 className="font-bold text-sm text-white">All Campaigns Overview</h4>
              <p className="text-xs text-white/50">
                Track running, scheduled, paused, and expired advertisements across all placements with real-time verified view statistics.
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono flex-wrap">
              <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Views: {totalBannerViews.toLocaleString()}</span>
              </span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeAds.length} Running Live</span>
              </span>
            </div>
          </div>

          {/* Placement Statistics Overview Cards in Active Campaigns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Hero Top Banner</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm sm:text-base font-bold font-mono text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  {heroTotalViews.toLocaleString()} Views
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  {heroAds.filter(a => isAdPubliclyActive(a)).length} live
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">Sidebar Widgets</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm sm:text-base font-bold font-mono text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  {sidebarTotalViews.toLocaleString()} Views
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  {sidebarAds.filter(a => isAdPubliclyActive(a)).length} live
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Inline Footer Bar</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm sm:text-base font-bold font-mono text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {footerTotalViews.toLocaleString()} Views
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  {footerAds.filter(a => isAdPubliclyActive(a)).length} live
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAds.map(ad => {
              const isLive = isAdPubliclyActive(ad);
              const daysLeft = getAdDaysRemaining(ad);

              return (
                <div key={ad.id} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div className="p-4 flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/5 shrink-0 relative flex items-center justify-center">
                      {ad.mediaType === 'video' || ad.videoUrl ? (
                        <>
                          <video src={ad.videoUrl || ad.imageUrl} muted playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                            <Video className="w-4 h-4 text-amber-400" />
                          </div>
                        </>
                      ) : (
                        <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          {ad.position}
                        </span>
                        {isLive ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            RUNNING
                          </span>
                        ) : ad.status === 'pending' ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            PENDING
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                            PAUSED / EXPIRED
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>{(ad.viewsCount || 0).toLocaleString()} Views</span>
                        </span>
                        {daysLeft !== null && isLive && (
                          <span className="text-[9px] text-white/40 font-mono">
                            {daysLeft} days remaining
                          </span>
                        )}
                      </div>

                      <h5 className="font-bold text-xs text-white truncate">{ad.title}</h5>
                      <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{ad.description}</p>
                      
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                        {ad.startDate && <span>Starts: {ad.startDate}</span>}
                        {ad.endDate && <span>Ends: {ad.endDate}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Views: {(ad.viewsCount || 0).toLocaleString()}</span>
                      </span>
                      <span className="text-[10px] text-white/50 font-mono">
                        Clicks: {(ad.clicksCount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleAdStatus(ad)}
                        className="p-1 text-white/60 hover:text-white cursor-pointer"
                        title={ad.isActive ? 'Pause' : 'Resume'}
                      >
                        {ad.isActive ? <ToggleRight className="w-5 h-5 text-amber-500" /> : <ToggleLeft className="w-5 h-5 text-white/30" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditForm(ad)}
                        className="p-1 text-white/40 hover:text-amber-400 cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-1 text-white/40 hover:text-rose-500 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. LISTING PROMOTIONS (EXISTING SYSTEM PRESERVED!)       */}
      {/* ======================================================== */}
      {activeSubTab === 'listing_promotions' && (
        <div className="space-y-6">
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
            <h4 className="font-bold text-sm text-sky-400 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Marketplace Listing Boost & Promotion System
            </h4>
            <p className="text-xs text-white/60 mt-1">
              This system configures promotion boost packages used by sellers during the <strong>Create Listing</strong> wizard. It operates completely independently of website banner advertisements.
            </p>
          </div>

          {/* FREE LISTING AVAILABILITY CONTROL PANEL */}
          <div className="p-6 bg-[#12121c] border border-amber-500/20 rounded-3xl space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                    <span>Free Listing Availability & Campaign</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Control whether marketplace users can post listings for free or if paid boost is required.</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                <span className="text-xs font-bold uppercase text-white/60">Free Listing:</span>
                <button
                  type="button"
                  onClick={async () => {
                    const currentFls = systemSettings.freeListingSettings || { enabled: true };
                    const updatedFls = { ...currentFls, enabled: currentFls.enabled === false ? true : false };
                    const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                    setSystemSettings(updatedSys);
                    await updateSystemSettings(updatedSys);
                  }}
                  className="cursor-pointer transition hover:scale-105"
                >
                  {systemSettings.freeListingSettings?.enabled !== false ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                      <ToggleRight className="w-6 h-6 text-emerald-400" /> ON
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/30">
                      <ToggleLeft className="w-6 h-6 text-red-400" /> OFF
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Campaign Start Date</label>
                <input
                  type="date"
                  value={systemSettings.freeListingSettings?.startDate || '2026-07-01'}
                  onChange={async e => {
                    const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), startDate: e.target.value };
                    const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                    setSystemSettings(updatedSys);
                    await updateSystemSettings(updatedSys);
                  }}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Campaign End Date</label>
                <input
                  type="date"
                  value={systemSettings.freeListingSettings?.endDate || '2026-12-31'}
                  onChange={async e => {
                    const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), endDate: e.target.value };
                    const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                    setSystemSettings(updatedSys);
                    await updateSystemSettings(updatedSys);
                  }}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Max Free Listings / User</label>
                <input
                  type="text"
                  inputMode="text"
                  value={systemSettings.freeListingSettings?.maxFreeListingsPerUser ?? 5}
                  onChange={async e => {
                    const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), maxFreeListingsPerUser: Number(e.target.value) || 0 };
                    const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                    setSystemSettings(updatedSys);
                    await updateSystemSettings(updatedSys);
                  }}
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Campaign Notice Message</label>
              <input
                type="text"
                value={systemSettings.freeListingSettings?.campaignNotice || 'Free Listing Campaign is currently Active! Post your property or product for free.'}
                onChange={async e => {
                  const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), campaignNotice: e.target.value };
                  const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                  setSystemSettings(updatedSys);
                  await updateSystemSettings(updatedSys);
                }}
                className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* DYNAMIC LISTING PROMOTION PACKAGES */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-500" /> Listing Boost Packages (Basic, Premium, VIP)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {adPackages.map(pkg => {
                const isEditing = editingPkgId === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className={`bg-[#12121a] border rounded-2xl p-4 transition-all ${
                      isEditing ? 'border-amber-500 shadow-md' : 'border-white/5 hover:border-amber-500/50'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Package Name</label>
                          <input
                            type="text"
                            value={editingPkgName}
                            onChange={e => setEditingPkgName(e.target.value)}
                            className="w-full p-1.5 bg-black/40 border border-white/10 rounded text-xs text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Badge</label>
                            <input
                              type="text"
                              value={editingPkgBadge}
                              onChange={e => setEditingPkgBadge(e.target.value)}
                              className="w-full p-1.5 bg-black/40 border border-white/10 rounded text-xs text-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Price ({pkg.currency || 'ETB'})</label>
                            <input
                              type="text"
                              inputMode="text"
                              value={editingPkgPrice}
                              onChange={e => setEditingPkgPrice(Number(e.target.value))}
                              className="w-full p-1.5 bg-black/40 border border-white/10 rounded text-xs text-amber-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Duration</label>
                          <input
                            type="text"
                            value={editingPkgDuration}
                            onChange={e => setEditingPkgDuration(e.target.value)}
                            className="w-full p-1.5 bg-black/40 border border-white/10 rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-white/40 mb-0.5">Description</label>
                          <input
                            type="text"
                            value={editingPkgDesc}
                            onChange={e => setEditingPkgDesc(e.target.value)}
                            className="w-full p-1.5 bg-black/40 border border-white/10 rounded text-xs text-white/70"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingPkgId(null)}
                            className="px-2.5 py-1 bg-white/5 text-white/60 text-xs rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveListingPackage(pkg.id)}
                            className="px-3 py-1 bg-amber-500 text-black font-bold text-xs rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                            {pkg.badge || 'BOOST'}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-amber-400">
                            {pkg.price} {pkg.currency || 'ETB'}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-white">{pkg.name}</h5>
                        <p className="text-[10px] text-white/50 mt-0.5">Duration: {pkg.duration}</p>
                        {pkg.desc && <p className="text-[10px] text-white/70 mt-1 line-clamp-2">{pkg.desc}</p>}
                        
                        <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPkgId(pkg.id);
                              setEditingPkgName(pkg.name);
                              setEditingPkgBadge(pkg.badge || '');
                              setEditingPkgDuration(pkg.duration);
                              setEditingPkgViews(pkg.views || '');
                              setEditingPkgPrice(pkg.price);
                              setEditingPkgDesc(pkg.desc || '');
                            }}
                            className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
                          >
                            Edit Package →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REVIEW & APPROVAL MODAL DIALOG                           */}
      {/* ======================================================== */}
      {reviewingAd && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#12121c] border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-serif font-bold text-base text-white flex items-center gap-2">
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Approve & Schedule Advertisement</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Reject Advertisement Request</span>
                  </>
                )}
              </h4>
              <button onClick={() => setReviewingAd(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-white/70">
                Campaign: <strong className="text-white">{reviewingAd.title}</strong> ({reviewingAd.position.toUpperCase()})
              </p>
              <p className="text-[11px] text-white/40 mt-0.5">
                Target URL: {reviewingAd.linkUrl}
              </p>
            </div>

            {reviewAction === 'approve' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Scheduled Start Date</label>
                    <input
                      type="date"
                      value={reviewStartDate}
                      onChange={e => setReviewStartDate(e.target.value)}
                      className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Scheduled End Date</label>
                    <input
                      type="date"
                      value={reviewEndDate}
                      onChange={e => setReviewEndDate(e.target.value)}
                      className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Payment Verification Status</label>
                  <select
                    value={reviewPaymentStatus}
                    onChange={e => setReviewPaymentStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="verified">Verified (Payment Confirmed)</option>
                    <option value="pending">Pending Payment Verification</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Explain why this ad was rejected (e.g. invalid payment slip, video exceeds duration, broken link)..."
                  className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReviewingAd(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isProcessingReview}
                className={`px-5 py-2 font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                {isProcessingReview ? 'Processing...' : reviewAction === 'approve' ? 'Confirm & Publish' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL RECEIPT VIEWER POPUP                                */}
      {/* ======================================================== */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#12121c] border border-white/10 rounded-3xl max-w-2xl w-full p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h5 className="font-bold text-sm text-white">Payment Receipt Inspection</h5>
              <button onClick={() => setViewingReceiptUrl(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black rounded-xl p-2">
              <img src={viewingReceiptUrl} alt="Receipt Slip" className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN CREATE / EDIT ADVERT BANNER MODAL                  */}
      {/* ======================================================== */}
      {isAdFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#12121c] border border-white/10 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-serif font-bold text-base text-white">
                {editingAd ? 'Edit Advert Banner' : 'Create New Advert Banner'}
              </h4>
              <button onClick={() => setIsAdFormOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adFormError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminAd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-1">Advert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Property Discount"
                  value={adForm.title}
                  onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1">Display Placement *</label>
                  <select
                    value={adForm.position}
                    onChange={e => setAdForm({ ...adForm, position: e.target.value as any })}
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="hero">Hero Top Banner</option>
                    <option value="sidebar">Sidebar Widget</option>
                    <option value="banner">Inline Footer Bar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1">Media Type *</label>
                  <select
                    value={adForm.mediaType}
                    onChange={e => setAdForm({ ...adForm, mediaType: e.target.value as any })}
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="image">Image Banner</option>
                    <option value="video">Short Video (≤ 30s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1">Redirect / Destination URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/promo"
                  value={adForm.linkUrl}
                  onChange={e => setAdForm({ ...adForm, linkUrl: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {adForm.mediaType === 'video' ? (
                <div className="space-y-3 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-amber-500" /> Promotional Video (Max 30s) *
                    </label>
                    <span className="text-[10px] text-white/40 font-mono">MP4, WebM • Max 30s • Max 30 MB</span>
                  </div>

                  {/* Video Live Preview in Admin Form */}
                  {adForm.videoUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden bg-black border border-amber-500/30 max-h-52 flex items-center justify-center">
                        <video
                          src={adForm.videoUrl}
                          controls
                          playsInline
                          className="w-full max-h-52 object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70 font-mono text-[11px] truncate max-w-[220px]">
                          {adForm.videoUrl.startsWith('data:') ? 'Uploaded Video File' : adForm.videoUrl}
                        </span>
                        {adForm.videoDuration ? (
                          <span className="text-emerald-400 font-bold font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Duration: {adForm.videoDuration}s (≤ 30s)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Upload Button */}
                  <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-black/30 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <Upload className="w-6 h-6 text-amber-500/70 group-hover:text-amber-500 mb-1 transition" />
                    <span className="text-xs font-bold text-white group-hover:text-amber-400">
                      {adUploading ? 'Validating & Uploading Video...' : 'Upload Video File (MP4, WebM ≤ 30s)'}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5">Strictly 30s max duration limit</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={adUploading}
                      onChange={handleAdminVideoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Alternative Video URL input */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/40 mb-1">Or paste direct Video URL:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/banner-video.mp4"
                      value={adForm.videoUrl}
                      onChange={e => setAdForm({ ...adForm, videoUrl: e.target.value, imageUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" /> Banner Image *
                    </label>
                    <span className="text-[10px] text-white/40 font-mono">JPG, PNG, WebP</span>
                  </div>

                  {/* Image Live Preview */}
                  {adForm.imageUrl ? (
                    <div className="rounded-xl overflow-hidden bg-black border border-white/10 max-h-44 flex items-center justify-center">
                      <img
                        src={adForm.imageUrl}
                        alt="Preview"
                        className="w-full max-h-44 object-contain"
                      />
                    </div>
                  ) : null}

                  {/* Upload Button */}
                  <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-black/30 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                    <Upload className="w-6 h-6 text-amber-500/70 group-hover:text-amber-500 mb-1 transition" />
                    <span className="text-xs font-bold text-white group-hover:text-amber-400">
                      {adUploading ? 'Uploading Image...' : 'Upload Image File'}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5">High resolution recommended</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={adUploading}
                      onChange={handleAdminImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Alternative Image URL input */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/40 mb-1">Or paste Image URL:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/banner-image.jpg"
                      value={adForm.imageUrl}
                      onChange={e => setAdForm({ ...adForm, imageUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/50 mb-1">Description / Copy Text *</label>
                <textarea
                  required
                  rows={2}
                  value={adForm.description}
                  onChange={e => setAdForm({ ...adForm, description: e.target.value })}
                  className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={adForm.startDate}
                    onChange={e => setAdForm({ ...adForm, startDate: e.target.value })}
                    className="w-full p-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1">End Date</label>
                  <input
                    type="date"
                    value={adForm.endDate}
                    onChange={e => setAdForm({ ...adForm, endDate: e.target.value })}
                    className="w-full p-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdFormOpen(false)}
                  className="px-4 py-2 bg-white/5 text-white/70 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingAd ? 'Update Advert' : 'Publish Advert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
