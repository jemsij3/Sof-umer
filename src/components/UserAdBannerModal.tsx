import React, { useState } from 'react';
import { 
  X, Megaphone, Video, Image as ImageIcon, Upload, CheckCircle2, 
  AlertTriangle, DollarSign, Calendar, ArrowRight, ArrowLeft, 
  ExternalLink, ShieldCheck, Film, Globe, Sparkles 
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { AdPlacement, AdCategoryType } from '../types';
import { 
  getEffectiveBannerPricing, 
  validatePromoUrl, 
  validateVideoFile 
} from '../lib/advertisements';

interface UserAdBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlacement?: AdPlacement;
  onSuccess?: () => void;
}

export const UserAdBannerModal: React.FC<UserAdBannerModalProps> = ({
  isOpen,
  onClose,
  initialPlacement = 'hero',
  onSuccess
}) => {
  const { systemSettings, paymentMethods, currentUser, refreshData, t } = useApp();
  const bannerPricing = getEffectiveBannerPricing(systemSettings);

  const [step, setStep] = useState<number>(1);
  const [placement, setPlacement] = useState<AdPlacement>(initialPlacement);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(() => {
    return bannerPricing[initialPlacement]?.packages[0]?.id || 'hero-7';
  });

  const [adType, setAdType] = useState<AdCategoryType>('website');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Selected package details
  const currentPlacementConfig = bannerPricing[placement] || bannerPricing.hero;
  const currentPackage = currentPlacementConfig.packages.find(p => p.id === selectedPackageId) || currentPlacementConfig.packages[0] || {
    id: `${placement}-7`,
    name: '7 Days Standard',
    durationDays: 7,
    price: currentPlacementConfig.price || 1000
  };

  const handlePlacementChange = (newPlacement: AdPlacement) => {
    setPlacement(newPlacement);
    const firstPkg = bannerPricing[newPlacement]?.packages[0];
    if (firstPkg) {
      setSelectedPackageId(firstPkg.id);
    }
    setErrorMsg(null);
  };

  // Upload video handler with duration check (<= 30s)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsUploadingMedia(true);

    try {
      const validation = await validateVideoFile(file);
      if (!validation.isValid) {
        setErrorMsg(validation.error || 'Video validation failed.');
        setIsUploadingMedia(false);
        return;
      }

      setVideoDuration(validation.duration || 15);
      setUploadedFileName(file.name);

      // Upload via backend /api/upload
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
          if (res.ok && (data.url || data.videoUrl)) {
            const finalUrl = data.url || data.videoUrl;
            setVideoUrl(finalUrl);
            setImageUrl(finalUrl);
          } else {
            // Local fallback data URL for preview
            setVideoUrl(base64Data);
            setImageUrl(base64Data);
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Error processing video.');
        } finally {
          setIsUploadingMedia(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading video.');
      setIsUploadingMedia(false);
    }
  };

  // Upload image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsUploadingMedia(true);

    try {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 10 MB limit.');
        setIsUploadingMedia(false);
        return;
      }

      setUploadedFileName(file.name);
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
          if (res.ok && data.url) {
            setImageUrl(data.url);
          } else {
            setImageUrl(base64Data);
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Error uploading image.');
        } finally {
          setIsUploadingMedia(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading image.');
      setIsUploadingMedia(false);
    }
  };

  // Upload payment receipt
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    setErrorMsg(null);

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
          body: JSON.stringify({ image: base64Data, fileName: file.name })
        });
        const data = await res.json();
        setReceiptFileName(file.name);
        if (res.ok && data.url) {
          setReceiptUrl(data.url);
        } else {
          setReceiptUrl(base64Data);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error uploading receipt.');
      } finally {
        setIsUploadingReceipt(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 2 validation
  const handleValidateStep2 = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter an advertisement title.');
      return false;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter an advertisement description.');
      return false;
    }
    const urlValidation = validatePromoUrl(linkUrl);
    if (!urlValidation.isValid) {
      setErrorMsg(urlValidation.error || 'Please enter a valid destination URL.');
      return false;
    }
    setLinkUrl(urlValidation.normalizedUrl || linkUrl);
    setErrorMsg(null);
    return true;
  };

  // Step 3 validation
  const handleValidateStep3 = () => {
    if (mediaType === 'video') {
      if (!videoUrl) {
        setErrorMsg('Please upload a promotional video (Max 30 seconds).');
        return false;
      }
      if (videoDuration > 30) {
        setErrorMsg(`Video exceeds 30 seconds limit (${videoDuration}s).`);
        return false;
      }
    } else {
      if (!imageUrl) {
        setErrorMsg('Please upload a banner image or provide an image link.');
        return false;
      }
    }
    setErrorMsg(null);
    return true;
  };

  // Final submission
  const handleSubmit = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        linkUrl: linkUrl.trim(),
        position: placement,
        mediaType,
        imageUrl: mediaType === 'video' ? (videoUrl || imageUrl) : imageUrl,
        videoUrl: mediaType === 'video' ? videoUrl : undefined,
        videoDuration: mediaType === 'video' ? videoDuration : undefined,
        adType,
        packageId: currentPackage.id,
        durationDays: currentPackage.durationDays,
        price: currentPackage.price,
        currency: 'ETB',
        receiptUrl: receiptUrl || undefined,
        paymentReference: paymentReference.trim() || undefined,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.fullName
      };

      const res = await fetch('/api/advertisements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit advertisement request.');
      }

      setIsSuccess(true);
      refreshData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error submitting advertisement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMethods = paymentMethods.filter(m => m.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0e14] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#13131c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {t('advertise_with_us') || 'Advertise on SOF-UMER'}
              </h3>
              <p className="text-[11px] text-white/50">
                Promote your YouTube, TikTok, events, products, or business across Ethiopia.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        {!isSuccess && (
          <div className="px-6 py-3 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 1 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/50'
              }`}>1</span>
              <span className={step === 1 ? 'text-amber-400 font-bold' : 'text-white/40'}>Placement</span>
            </div>
            <div className="h-[1px] w-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/50'
              }`}>2</span>
              <span className={step === 2 ? 'text-amber-400 font-bold' : 'text-white/40'}>Content</span>
            </div>
            <div className="h-[1px] w-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 3 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/50'
              }`}>3</span>
              <span className={step === 3 ? 'text-amber-400 font-bold' : 'text-white/40'}>Media</span>
            </div>
            <div className="h-[1px] w-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 4 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/50'
              }`}>4</span>
              <span className={step === 4 ? 'text-amber-400 font-bold' : 'text-white/40'}>Payment</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-serif font-bold text-white">Advertisement Submitted Successfully!</h4>
              <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                Thank you! Your advertising campaign request has been received. Our review team will verify your media content and payment receipt. You will be notified once it goes live.
              </p>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl max-w-sm mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-white/40">Placement:</span>
                  <span className="font-bold text-white capitalize">{placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Duration:</span>
                  <span className="font-bold text-white">{currentPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Status:</span>
                  <span className="font-bold text-amber-400">Pending Review</span>
                </div>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: CHOOSE PLACEMENT & PRICING */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      1. Select Advertising Placement
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Hero */}
                      <button
                        type="button"
                        onClick={() => handlePlacementChange('hero')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          placement === 'hero'
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">BILLBOARD</span>
                          {placement === 'hero' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h5 className="font-bold text-xs text-white">Hero Top Banner</h5>
                        <p className="text-[10px] text-white/50 mt-1 line-clamp-2">
                          Top placement at the head of SOF-UMER. Highest visibility.
                        </p>
                      </button>

                      {/* Sidebar */}
                      <button
                        type="button"
                        onClick={() => handlePlacementChange('sidebar')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          placement === 'sidebar'
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">WIDGET</span>
                          {placement === 'sidebar' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h5 className="font-bold text-xs text-white">Sidebar Widgets</h5>
                        <p className="text-[10px] text-white/50 mt-1 line-clamp-2">
                          Featured promotional card placed alongside marketplace listings.
                        </p>
                      </button>

                      {/* Footer */}
                      <button
                        type="button"
                        onClick={() => handlePlacementChange('banner')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          placement === 'banner'
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">FOOTER</span>
                          {placement === 'banner' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h5 className="font-bold text-xs text-white">Inline Footer Bar</h5>
                        <p className="text-[10px] text-white/50 mt-1 line-clamp-2">
                          Prominent horizontal banner positioned directly above the platform footer.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      2. Choose Advertising Duration Package
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentPlacementConfig.packages.map(pkg => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedPackageId === pkg.id
                              ? 'bg-amber-500/10 border-amber-500 shadow-md'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs font-bold text-white block">{pkg.name}</span>
                          <span className="text-base font-extrabold text-amber-400 font-mono mt-1 block">
                            {pkg.price.toLocaleString()} ETB
                          </span>
                          <span className="text-[10px] text-white/40 block mt-0.5">{pkg.durationDays} Days Duration</span>
                          {pkg.desc && <span className="text-[9px] text-white/50 line-clamp-1 mt-1 block">{pkg.desc}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTENT & DESTINATION URL */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      What are you promoting? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'youtube', label: 'YouTube Video/Channel', icon: '📺' },
                        { id: 'tiktok', label: 'TikTok Account/Video', icon: '📱' },
                        { id: 'event', label: 'Event or Occasion', icon: '🎉' },
                        { id: 'website', label: 'Website or Business', icon: '🌐' },
                        { id: 'other', label: 'Other Promotion', icon: '📢' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAdType(cat.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                            adType === cat.id
                              ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                              : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white'
                          }`}
                        >
                          <span className="text-base block mb-0.5">{cat.icon}</span>
                          <span className="text-[10px] leading-tight block">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Advertisement Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Subscribe to Addis Vibes YouTube Channel"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Promotional Copy / Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Watch exclusive interviews, travel vlogs, and music videos. New episodes every Friday!"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Destination Link / Target URL *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="https://youtube.com/@channel or https://mybusiness.et"
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        className="w-full p-3 pr-10 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <Globe className="w-4 h-4 text-white/30 absolute right-3 top-3.5" />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">
                      Visitors who click your advertisement will be taken directly to this address.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: MEDIA (VIDEO OR IMAGE) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      Select Media Format
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setMediaType('image'); setErrorMsg(null); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          mediaType === 'image' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Image Banner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMediaType('video'); setErrorMsg(null); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          mediaType === 'video' ? 'bg-amber-500 text-black shadow' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        <span>Short Video (Max 30s)</span>
                      </button>
                    </div>
                  </div>

                  {mediaType === 'video' ? (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-amber-500" /> Upload Promotional Video
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">MP4, WebM • Max 30s • Max 30 MB</span>
                      </div>

                      {videoUrl ? (
                        <div className="space-y-3">
                          <div className="rounded-xl overflow-hidden bg-black border border-amber-500/30 max-h-56 flex items-center justify-center">
                            <video
                              src={videoUrl}
                              controls
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full max-h-56 object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/70 font-mono text-[11px] truncate max-w-[200px]">{uploadedFileName || 'Uploaded Video'}</span>
                            <span className="text-emerald-400 font-bold font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Duration: {videoDuration}s (≤ 30s)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-black/40 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                          <Upload className="w-8 h-8 text-amber-500/70 group-hover:text-amber-500 mb-2 transition" />
                          <span className="text-xs font-bold text-white group-hover:text-amber-400">
                            {isUploadingMedia ? 'Validating & Uploading...' : 'Click to Upload Video (Max 30s)'}
                          </span>
                          <span className="text-[10px] text-white/40 mt-1">MP4 or WebM format • Max 30 MB</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={handleVideoUpload}
                            className="hidden"
                            disabled={isUploadingMedia}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-500" /> Upload Banner Image
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">JPG, PNG, WebP • Max 10 MB</span>
                      </div>

                      {imageUrl ? (
                        <div className="space-y-3">
                          <div className="rounded-xl overflow-hidden bg-black border border-amber-500/30 max-h-56 flex items-center justify-center">
                            <img
                              src={imageUrl}
                              alt="Advert Preview"
                              className="w-full max-h-56 object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/70 font-mono text-[11px] truncate max-w-[200px]">{uploadedFileName || 'Uploaded Image'}</span>
                            <span className="text-emerald-400 font-bold font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Image Ready
                            </span>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-black/40 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                          <Upload className="w-8 h-8 text-amber-500/70 group-hover:text-amber-500 mb-2 transition" />
                          <span className="text-xs font-bold text-white group-hover:text-amber-400">
                            {isUploadingMedia ? 'Uploading...' : 'Click to Upload Banner Image'}
                          </span>
                          <span className="text-[10px] text-white/40 mt-1">JPG, PNG, WebP • Up to 10 MB</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploadingMedia}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: PAYMENT & RECEIPT UPLOAD */}
              {step === 4 && (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Order Summary</span>
                      <h5 className="font-bold text-white text-sm mt-0.5">
                        {currentPackage.name} ({placement.toUpperCase()})
                      </h5>
                      <span className="text-[11px] text-white/60">{currentPackage.durationDays} Days Duration</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/40 block">Total Due</span>
                      <span className="text-lg font-mono font-extrabold text-amber-400">
                        {currentPackage.price.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Payment Accounts */}
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                      SOF-UMER Official Payment Accounts
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activeMethods.length > 0 ? (
                        activeMethods.slice(0, 4).map(m => (
                          <div key={m.id} className="p-3 bg-black/40 border border-white/5 rounded-xl">
                            <span className="font-bold text-white block">{m.name}</span>
                            <span className="text-amber-400 font-mono text-[11px] font-bold block">{m.accountNumber}</span>
                            <span className="text-white/40 text-[10px] block">{m.accountHolder}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl sm:col-span-2">
                          <span className="font-bold text-white block">Commercial Bank of Ethiopia (CBE)</span>
                          <span className="text-amber-400 font-mono text-[11px] font-bold block">1000123456789</span>
                          <span className="text-white/40 text-[10px] block">SOF-UMER Digital Media</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Upload */}
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Upload Bank or Telebirr Receipt Slip *
                    </label>
                    {receiptUrl ? (
                      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-mono text-[11px] truncate max-w-[200px]">{receiptFileName || 'Receipt Uploaded'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceiptUrl('')}
                          className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-white/15 hover:border-amber-500/50 bg-black/40 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer text-center group">
                        <Upload className="w-5 h-5 text-white/40 group-hover:text-amber-400 mb-1" />
                        <span className="text-xs font-bold text-white group-hover:text-amber-400">
                          {isUploadingReceipt ? 'Uploading Receipt...' : 'Select Payment Receipt Screenshot / Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                          disabled={isUploadingReceipt}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1">
                      Transaction Reference Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CBE FT2610199482 or Telebirr Trans ID"
                      value={paymentReference}
                      onChange={e => setPaymentReference(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isSuccess && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#13131c] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => { setStep(step - 1); setErrorMsg(null); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && !handleValidateStep2()) return;
                  if (step === 3 && !handleValidateStep3()) return;
                  setStep(step + 1);
                  setErrorMsg(null);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploadingReceipt}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Campaign...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Advertisement</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
