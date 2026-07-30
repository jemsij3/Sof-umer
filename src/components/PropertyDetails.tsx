import React, { useState, useMemo } from 'react';
import { Property, PropertyOffer } from '../types';
import { useApp } from '../lib/AppContext';
import { 
  getEffectiveMajorCategory,
  getTranslatedCategoryName,
  getTranslatedSubcategoryName,
  getTranslatedFieldLabel,
  getTranslatedOption,
  getTranslatedCondition,
  getTranslatedLocation,
  getTranslatedPropertyType,
  extractString
} from '../lib/categoriesData';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Shield, 
  Calendar, 
  UserCheck, 
  Eye, 
  Handshake, 
  AlertCircle, 
  X, 
  ExternalLink,
  DollarSign,
  Clock,
  Briefcase,
  Layers,
  Building,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
  onOpenReportModal: (targetType: 'property' | 'user', targetId: string, targetName: string) => void;
  onSelectProperty?: (property: Property) => void;
  onNavigateToAuth?: () => void;
}

export default function PropertyDetails({ 
  property, 
  onBack, 
  onOpenReportModal,
  onSelectProperty,
  onNavigateToAuth
}: PropertyDetailsProps) {
  const {
    favorites,
    toggleFavorite,
    currentUser,
    t,
    refreshData,
    properties,
    offers,
    submitOffer,
    respondToOffer,
    currentLanguage
  } = useApp();

  const [activeImage, setActiveImage] = useState(property.images[0] || '');
  const [messageText, setMessageText] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Seller Contact reveal state
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Make Offer Modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number | ''>(Math.round(property.price * 0.9));
  const [offerNote, setOfferNote] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');

  // Counter offer state inside offer view
  const [counterSubmitting, setCounterSubmitting] = useState(false);

  // Seller Ads Modal state
  const [sellerAdsModalOpen, setSellerAdsModalOpen] = useState(false);

  const isFavorite = favorites.includes(property.id);

  // Compute seller active listings
  const sellerListings = useMemo(() => {
    return properties.filter(p => 
      p.ownerId === property.ownerId || 
      (p.contactEmail && property.contactEmail && p.contactEmail.toLowerCase() === property.contactEmail.toLowerCase()) ||
      (p.ownerName && property.ownerName && p.ownerName.toLowerCase() === property.ownerName.toLowerCase())
    );
  }, [properties, property]);

  // Compute seller registration / membership details
  const sellerMemberSince = useMemo(() => {
    // If property created date exists, or default to a realistic join date
    const dateStr = property.createdAt || '2023-01-15T00:00:00.000Z';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return { monthYear: 'Jan 2023', yearsAgo: '2 years ago' };
    
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    const currentYear = new Date().getFullYear();
    const diffYears = Math.max(0, currentYear - year);

    let yearsAgoText = 'Joined this year';
    if (diffYears === 1) yearsAgoText = 'Joined 1 year ago';
    else if (diffYears > 1) yearsAgoText = `Joined ${diffYears} years ago`;

    return {
      monthYear: `${month} ${year}`,
      yearsAgo: yearsAgoText
    };
  }, [property]);

  // Compute existing active offer by current user for this property
  const existingOffer = useMemo(() => {
    if (!currentUser) return null;
    return offers.find(o => o.propertyId === property.id && o.buyerId === currentUser.id);
  }, [offers, property.id, currentUser]);

  // Compute Similar Properties
  const similarProperties = useMemo(() => {
    return properties
      .filter(p => p.id !== property.id)
      .filter(p => 
        p.majorCategory === property.majorCategory || 
        p.propertyType === property.propertyType ||
        p.location === property.location
      )
      .slice(0, 4);
  }, [properties, property]);

  // Extract and deduplicate listing specifications & features
  const rawAmenities = Array.from(new Set(property.amenities || []));
  const parsedSpecs: { label: string; value: string }[] = [];
  const generalFeatures: string[] = [];
  const addedKeys = new Set<string>();

  const categoryAllowedKeys: Record<string, string[]> = {
    Products: ['subcategory', 'brand', 'model', 'size', 'dimensions', 'color', 'material', 'condition', 'quantity', 'negotiable', 'gender', 'clothing type', 'storage / spec'],
    Properties: ['subcategory', 'property type', 'purpose', 'bedrooms', 'bathrooms', 'toilets', 'toilet', 'area', 'area (m²)', 'furnished', 'furnished status', 'parking', 'parking available', 'floor level', 'ownership', 'ownership / title deed', 'title deed', 'zoning'],
    Vehicles: ['subcategory', 'vehicle type', 'make / brand', 'transmission', 'fuel type', 'engine capacity', 'year', 'mileage', 'mileage (km)', 'color', 'brand', 'condition', 'model'],
    Jobs: ['subcategory', 'job type', 'employment type', 'sector', 'sector / industry', 'industry', 'salary range', 'qualification', 'education required', 'experience', 'experience required', 'deadline', 'application deadline'],
    Services: ['subcategory', 'service type', 'service category', 'pricing unit', 'years of experience', 'coverage area', 'availability', 'opening hours'],
    'Local Businesses': ['subcategory', 'business category', 'business type', 'opening hours', 'website', 'website / social link', 'services offered'],
    Community: ['subcategory', 'post type', 'organizer', 'organizer name / group', 'venue', 'venue / address', 'date', 'time', 'event date & time']
  };

  const currentCategory = getEffectiveMajorCategory(property);
  const allowedKeys = categoryAllowedKeys[currentCategory];

  const addSpec = (label: string, value: string | number | undefined) => {
    if (value === undefined || value === null) return;
    const valStr = String(value).trim();
    if (!valStr || (valStr === '0' && ['Bedrooms', 'Bathrooms', 'Toilet'].includes(label))) return;
    const normKey = label.toLowerCase().trim();

    if (allowedKeys && !allowedKeys.includes(normKey)) return;

    if (!addedKeys.has(normKey)) {
      addedKeys.add(normKey);
      parsedSpecs.push({ label, value: valStr });
    }
  };

  if (currentCategory === 'Properties') {
    if (property.bedrooms && property.bedrooms > 0) addSpec('Bedrooms', property.bedrooms);
    if (property.bathrooms && property.bathrooms > 0) addSpec('Bathrooms', property.bathrooms);
    if (property.area && property.area > 0) addSpec('Area (m²)', `${property.area} m²`);
  }
  if (property.brand) addSpec('Brand', property.brand);
  if (property.condition) addSpec('Condition', property.condition);
  if ((property as any).size) addSpec('Size', (property as any).size);
  if ((property as any).color) addSpec('Color', (property as any).color);
  if ((property as any).material) addSpec('Material', (property as any).material);

  for (const item of rawAmenities) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      const label = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (label && value) {
        addSpec(label, value);
      }
    } else {
      if (!generalFeatures.includes(trimmed) && !addedKeys.has(trimmed.toLowerCase())) {
        generalFeatures.push(trimmed);
      }
    }
  }

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onNavigateToAuth) onNavigateToAuth();
      else alert('Please log in to contact the property owner.');
      return;
    }
    if (!messageText.trim()) return;

    setSendingInquiry(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          receiverId: property.ownerId,
          messageText: messageText.trim()
        })
      });

      if (res.ok) {
        setInquirySuccess(true);
        setMessageText('');
        refreshData();
        setTimeout(() => setInquirySuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/property/' + property.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenOfferModal = () => {
    if (!currentUser) {
      if (onNavigateToAuth) onNavigateToAuth();
      else alert('Please log in to make an offer.');
      return;
    }
    setOfferError('');
    setOfferSuccess('');
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || Number(offerAmount) <= 0) {
      setOfferError('Please enter a valid numerical offer amount.');
      return;
    }

    setOfferSubmitting(true);
    setOfferError('');
    setOfferSuccess('');

    const res = await submitOffer(property.id, Number(offerAmount), offerNote);
    setOfferSubmitting(false);

    if (res.success) {
      setOfferSuccess('Your offer has been submitted successfully! The seller has been notified.');
      setOfferNote('');
    } else {
      setOfferError(res.error || 'Failed to submit offer.');
    }
  };

  const handleRespondToCounter = async (status: 'Accepted' | 'Rejected') => {
    if (!existingOffer) return;
    setCounterSubmitting(true);
    const res = await respondToOffer(existingOffer.id, status);
    setCounterSubmitting(false);
    if (res.success) {
      setOfferSuccess(`You have ${status.toLowerCase()} the counter offer.`);
    } else {
      setOfferError(res.error || 'Failed to update offer status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left details-view animate-fade-in font-sans">
      
      {/* Top Back & Share/Fav Row */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white font-bold text-sm transition-all duration-300 cursor-pointer hover:translate-x-[-2px]"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>{t('back_to_marketplace')}</span>
        </button>

        <div className="flex gap-2.5">
          <button
            onClick={() => toggleFavorite(property.id)}
            className="p-3 rounded-2xl border border-white/5 bg-[#0d0d12]/80 text-[#F5F5F4]/70 hover:text-rose-500 hover:bg-[#12121b] transition duration-300 shadow-md cursor-pointer"
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-5 h-5 transition duration-300 ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="p-3 rounded-2xl border border-white/5 bg-[#0d0d12]/80 text-[#F5F5F4]/70 hover:text-white hover:bg-[#12121b] transition duration-300 shadow-md cursor-pointer"
              aria-label="Share property"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {shareOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-56 bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl p-4 z-30"
                >
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3.5">
                    {t('share_listing')}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-white/5 transition flex items-center justify-between font-semibold text-white/80 cursor-pointer"
                    >
                      <span>{copiedLink ? t('copied') : t('copy_link')}</span>
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=Check%20out%20this%20listing%20on%20SOF-UMER:%2520${encodeURIComponent(property.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-white/5 transition flex items-center justify-between font-semibold text-white/80 block"
                    >
                      <span>{t('share_whatsapp')}</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Primary Property Content (Order 1 to 7) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ORDER 1: Property Images */}
          <div className="space-y-3">
            <div className="bg-[#0c0c10] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative h-[380px] sm:h-[480px] group">
              <img
                src={activeImage}
                alt={property.title}
                className="w-full h-full object-cover transition duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono text-white/80 border border-white/10 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>{property.images.length > 0 ? `${property.images.indexOf(activeImage) + 1} / ${property.images.length} Photos` : '1 Photo'}</span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-24 h-18 rounded-2xl overflow-hidden border-2 transition duration-300 shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-amber-500 scale-95 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ORDER 2: Property Title */}
          <div className="bg-[#0d0d12]/90 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg text-[#F5F5F4] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase bg-amber-500/15 text-amber-500 px-3.5 py-1 rounded-full inline-block border border-amber-500/10">
                {property.majorCategory === 'Properties' ? (
                  getTranslatedPropertyType(property.propertyType, currentLanguage) || t(`cat_${(property.propertyType || '').toLowerCase()}`) || property.propertyType || ''
                ) : (
                  getTranslatedCategoryName(property.majorCategory, currentLanguage) || t(`cat_${(property.majorCategory || '').toLowerCase().replace(/\s+/g, '')}`) || property.majorCategory || ''
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wide leading-tight">
              {extractString(property.title, currentLanguage)}
            </h1>

            <p className="text-sm text-[#F5F5F4]/60 flex items-center gap-1.5 pt-1">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{getTranslatedLocation(property.location, currentLanguage)}</span>
            </p>
          </div>

          {/* ORDER 3: Price */}
          <div className="bg-gradient-to-r from-[#0d0d12] via-[#12121a] to-[#0d0d12] rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-mono">
                {getTranslatedFieldLabel('Price', currentLanguage) || t('price')}
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 font-mono">
                {property.price.toLocaleString()}{' '}
                <span className="text-amber-500 text-lg font-bold uppercase ml-1">{property.currency || 'ETB'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="w-4 h-4" />
                <span>{getTranslatedOption('Negotiable', currentLanguage) || t('negotiable')}</span>
              </span>
              {property.area > 0 && (
                <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/5 text-xs font-mono">
                  ~{Math.round(property.price / property.area).toLocaleString()} {property.currency}/m²
                </span>
              )}
            </div>
          </div>

          {/* ORDER 4: Property Information (Specifications) */}
          {parsedSpecs.length > 0 || currentCategory === 'Properties' ? (
            <div className="bg-[#0d0d12]/90 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg text-left text-[#F5F5F4]">
              <h3 className="text-lg font-serif font-bold text-white mb-5 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>
                  {currentCategory === 'Products' ? (t('product_specifications') || getTranslatedFieldLabel('Product Specifications', currentLanguage)) :
                   currentCategory === 'Vehicles' ? (t('vehicle_specifications') || getTranslatedFieldLabel('Vehicle Specifications', currentLanguage)) :
                   currentCategory === 'Jobs' ? (t('job_details') || getTranslatedFieldLabel('Job Details', currentLanguage)) :
                   currentCategory === 'Services' ? (t('service_information') || getTranslatedFieldLabel('Service Information', currentLanguage)) :
                   currentCategory === 'Community' ? (t('post_information') || getTranslatedFieldLabel('Post Information', currentLanguage)) :
                   (t('property_specifications') || getTranslatedFieldLabel('Property Information & Specifications', currentLanguage))}
                </span>
              </h3>

              {/* Core bed/bath/area summary if Properties */}
              {currentCategory === 'Properties' && (
                <div className="grid grid-cols-3 gap-4 text-center mb-6 border-b border-white/5 pb-6">
                  {property.bedrooms > 0 && (
                    <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5">
                      <BedDouble className="w-5 h-5 text-amber-500/80 mx-auto mb-2" />
                      <span className="text-base font-bold text-[#F5F5F4] block">{property.bedrooms}</span>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                        {getTranslatedFieldLabel('Bedrooms', currentLanguage) || t('bedrooms')}
                      </span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5">
                      <Bath className="w-5 h-5 text-amber-500/80 mx-auto mb-2" />
                      <span className="text-base font-bold text-[#F5F5F4] block">{property.bathrooms}</span>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                        {getTranslatedFieldLabel('Bathrooms', currentLanguage) || t('bathrooms')}
                      </span>
                    </div>
                  )}
                  {property.area > 0 && (
                    <div className="bg-[#12121a] rounded-2xl p-4 border border-white/5">
                      <Maximize className="w-5 h-5 text-amber-500/80 mx-auto mb-2" />
                      <span className="text-base font-bold text-[#F5F5F4] block">{property.area} m²</span>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                        {getTranslatedFieldLabel('Area (m²)', currentLanguage) || t('total_area')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {parsedSpecs.map((spec, idx) => {
                  const translatedLabel = getTranslatedFieldLabel(spec.label, currentLanguage) || t(spec.label) || spec.label;

                  let translatedValue = spec.value;
                  const normKey = spec.label.toLowerCase().trim();

                  if (normKey === 'subcategory') {
                    translatedValue = getTranslatedSubcategoryName(spec.value, currentLanguage);
                  } else if (normKey === 'condition') {
                    translatedValue = getTranslatedCondition(spec.value, currentLanguage);
                  } else if (normKey === 'negotiable') {
                    translatedValue = getTranslatedOption(spec.value, currentLanguage);
                  } else {
                    const optVal = getTranslatedOption(spec.value, currentLanguage);
                    if (optVal && optVal !== spec.value) {
                      translatedValue = optVal;
                    } else {
                      const catVal = getTranslatedCategoryName(spec.value, currentLanguage);
                      if (catVal && catVal !== spec.value) {
                        translatedValue = catVal;
                      } else {
                        translatedValue = extractString(t(spec.value) || spec.value, currentLanguage);
                      }
                    }
                  }

                  return (
                    <div key={idx} className="bg-[#12121a] p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider block font-mono">{translatedLabel}</span>
                      <span className="text-xs font-bold text-white mt-1.5 break-words">{translatedValue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ORDER 5: Description */}
          <div className="bg-[#0d0d12]/90 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg text-left text-[#F5F5F4]">
            <h3 className="text-lg font-serif font-bold text-white mb-3.5">
              {currentCategory === 'Products' ? (t('about_product') || 'About this product') :
               currentCategory === 'Vehicles' ? (t('about_vehicle') || 'About this vehicle') :
               currentCategory === 'Jobs' ? (t('about_job') || 'About this job') :
               currentCategory === 'Services' ? (t('about_service') || 'About this service') :
               currentCategory === 'Local Businesses' ? (t('about_business') || 'About this business') :
               currentCategory === 'Community' ? (t('about_post') || 'About this post') :
               (t('about_property') || 'About this property')}
            </h3>
            <p className="text-sm text-[#F5F5F4]/70 leading-relaxed whitespace-pre-line font-light">{extractString(property.description, currentLanguage)}</p>
          </div>

          {/* ORDER 6: Property Features */}
          {generalFeatures.length > 0 && (
            <div className="bg-[#0d0d12]/90 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg text-left text-[#F5F5F4]">
              <h3 className="text-lg font-serif font-bold text-white mb-4">
                {t('amenities_features')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {generalFeatures.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-white/80 text-xs font-semibold bg-[#12121a] px-3.5 py-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-light">{getTranslatedOption(amenity, currentLanguage) || t(amenity) || amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDER 7: Location */}
          <div className="bg-[#0d0d12]/90 rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg text-left text-[#F5F5F4]">
            <h3 className="text-lg font-serif font-bold text-white mb-3.5">
              {t('location_on_map')}
            </h3>
            <div className="w-full h-64 bg-[#12121a] rounded-2xl overflow-hidden border border-white/5 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5F5F4_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="absolute top-1/3 left-0 w-full h-4 bg-white/5"></div>
              <div className="absolute left-1/3 top-0 w-4 h-full bg-white/5"></div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-gradient-to-tr from-amber-500 to-amber-600 text-black p-3 rounded-full shadow-2xl border-2 border-[#0d0d12] animate-bounce">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <span className="bg-black text-amber-500 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow mt-2.5 whitespace-nowrap">
                  {getTranslatedLocation(property.location, currentLanguage)}
                </span>
              </div>
            </div>
          </div>/div>

        </div>

        {/* Right Column: Seller Info, Actions, Safety Tips (Orders 8, 9, 10) */}
        <div className="lg:col-span-4 space-y-6">

          {/* ORDER 8: Seller Information Card */}
          <div className="bg-[#0d0d12]/90 rounded-3xl p-6 border border-white/5 shadow-xl text-center text-[#F5F5F4] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block mb-4 font-mono">
              SELLER INFORMATION
            </span>

            {/* Seller Avatar */}
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl border-2 border-amber-500/20">
                {property.ownerName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-[#0d0d12] rounded-full" title="Active Seller" />
            </div>

            {/* Seller Name */}
            <h4 className="font-extrabold text-white text-xl flex items-center justify-center gap-2">
              <span>{property.ownerName}</span>
              <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" title="Verified Seller Badge" />
            </h4>

            {/* Verified Badge */}
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 px-3 py-0.5 rounded-full border border-amber-500/20">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>Verified Seller</span>
              </span>
            </div>

            {/* Seller Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/5 text-left">
              <div className="bg-[#12121a] p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-white/40 block uppercase">Active Ads</span>
                <span className="text-base font-extrabold text-white">{sellerListings.length} {sellerListings.length === 1 ? 'Ad' : 'Ads'}</span>
              </div>
              <div className="bg-[#12121a] p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-white/40 block uppercase">Member Since</span>
                <span className="text-xs font-bold text-amber-500">{sellerMemberSince.monthYear}</span>
              </div>
            </div>

            <p className="text-[11px] text-white/40 mt-3 font-mono text-center">
              {sellerMemberSince.yearsAgo}
            </p>

            {/* ORDER 9: Seller Action Buttons */}
            <div className="mt-6 space-y-3 pt-5 border-t border-white/5">
              
              {/* Button 1: View All Seller Ads */}
              <button
                onClick={() => setSellerAdsModalOpen(true)}
                className="w-full bg-[#12121a] hover:bg-white/10 text-white font-bold py-3 px-4 rounded-2xl border border-white/10 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>View All Seller Ads ({sellerListings.length})</span>
              </button>

              {/* Button 2: Chat with Seller */}
              <button
                onClick={() => {
                  const el = document.getElementById('inquiry-form-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-[#12121a] hover:bg-white/10 text-white font-bold py-3 px-4 rounded-2xl border border-white/10 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Chat with Seller</span>
              </button>

              {/* Button 3: Make Offer */}
              <button
                onClick={handleOpenOfferModal}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <Handshake className="w-4.5 h-4.5" />
                <span>
                  {existingOffer ? `Offer: ${existingOffer.status}` : 'Make Offer'}
                </span>
              </button>

              {/* Button 4: Show Contact */}
              {!showContactDetails ? (
                <button
                  onClick={() => setShowContactDetails(true)}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3.5 px-4 rounded-2xl border border-emerald-500/30 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Show Contact</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#12121a] p-4 rounded-2xl border border-emerald-500/30 space-y-3 text-left animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Contact Information Revealed</span>
                    <button 
                      onClick={() => setShowContactDetails(false)}
                      className="text-white/40 hover:text-white text-xs"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <a
                    href={`tel:${property.contactPhone}`}
                    className="flex items-center gap-3 text-sm font-bold text-white hover:text-amber-500 transition block"
                  >
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{property.contactPhone}</span>
                  </a>

                  {property.contactEmail && (
                    <a
                      href={`mailto:${property.contactEmail}`}
                      className="flex items-center gap-3 text-xs font-semibold text-white/80 hover:text-amber-500 transition block truncate"
                    >
                      <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="truncate">{property.contactEmail}</span>
                    </a>
                  )}
                </motion.div>
              )}

            </div>
          </div>

          {/* Inquiries / Direct Messaging Form */}
          <div id="inquiry-form-section" className="bg-[#0d0d12]/90 rounded-3xl p-6 border border-white/5 shadow-lg text-left text-[#F5F5F4]">
            <h4 className="font-serif text-lg text-white font-bold mb-1.5 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span>{t('send_inquiry')}</span>
            </h4>
            <p className="text-xs text-white/40 leading-relaxed mb-4">
              {t('inquiry_helper')}
            </p>

            {inquirySuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-2xl text-center font-semibold mb-4 animate-pulse">
                {t('inquiry_success')}
              </div>
            )}

            {currentUser ? (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <textarea
                  required
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 bg-[#12121a] border border-white/5 focus:border-amber-500/50 text-xs text-[#F5F5F4] rounded-2xl focus:outline-none placeholder-white/20 transition duration-300"
                  placeholder={t('inquiry_placeholder')}
                />

                <button
                  type="submit"
                  disabled={sendingInquiry || !messageText.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3.5 px-4 rounded-2xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {sendingInquiry ? t('sending') : t('submit_inquiry')}
                  </span>
                </button>
              </form>
            ) : (
              <div className="text-center py-5 bg-white/5 rounded-2xl border border-dashed border-white/10 p-4">
                <p className="text-xs text-white/40 mb-3.5">
                  {t('login_to_message')}
                </p>
                {onNavigateToAuth && (
                  <button
                    onClick={onNavigateToAuth}
                    className="bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Log In / Sign Up
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ORDER 10: Safety Tips */}
          <div className="bg-[#0d0d12]/90 rounded-3xl p-6 border border-amber-500/20 shadow-lg text-left text-[#F5F5F4] space-y-4">
            <div className="flex items-center gap-2.5 text-amber-500">
              <Shield className="w-5 h-5 shrink-0" />
              <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider">
                Safety Tips for Buyers
              </h4>
            </div>

            <ul className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Meet the seller in a safe public place.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Inspect the property before making payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Never pay before confirming ownership.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Verify all documents carefully.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Use trusted payment methods whenever possible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Report suspicious listings or fraudulent activity immediately.</span>
              </li>
            </ul>

            <button
              onClick={() => onOpenReportModal('property', property.id, property.title)}
              className="w-full mt-2 py-2.5 hover:bg-red-500/10 text-red-400 border border-dashed border-red-500/20 hover:border-red-500/40 rounded-2xl text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Report Suspicious Listing</span>
            </button>
          </div>

        </div>
      </div>

      {/* ORDER 11: Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="mt-16 pt-12 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-500 tracking-widest block font-mono">DISCOVER MORE</span>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">
                Similar Properties & Listings
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map((simProp) => (
              <div
                key={simProp.id}
                onClick={() => {
                  if (onSelectProperty) onSelectProperty(simProp);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#0d0d12]/90 rounded-3xl border border-white/5 overflow-hidden hover:border-amber-500/30 transition duration-300 shadow-xl cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={simProp.images[0] || ''}
                      alt={simProp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-amber-500 border border-amber-500/20 uppercase">
                      {simProp.propertyType}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-500 transition">
                      {simProp.title}
                    </h4>

                    <p className="text-xs font-mono text-amber-500 font-extrabold">
                      {simProp.price.toLocaleString()} {simProp.currency || 'ETB'}
                    </p>

                    <p className="text-[11px] text-white/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">{simProp.location}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <span className="text-[10px] font-bold text-white/40 group-hover:text-amber-500 uppercase tracking-wider flex items-center justify-between">
                    <span>View Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAKE OFFER MODAL */}
      <AnimatePresence>
        {offerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-left text-[#F5F5F4]"
            >
              <button
                onClick={() => setOfferModalOpen(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Make an Offer
                  </h3>
                  <p className="text-xs text-white/40 truncate max-w-xs">
                    {property.title}
                  </p>
                </div>
              </div>

              {/* Price comparison header */}
              <div className="bg-[#12121a] p-4 rounded-2xl border border-white/5 mb-6 flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-white/40 block uppercase">Listed Price</span>
                  <span className="text-sm font-bold text-white">{property.price.toLocaleString()} {property.currency || 'ETB'}</span>
                </div>
                {existingOffer && (
                  <div className="text-right">
                    <span className="text-[10px] text-amber-500 block uppercase">Your Current Offer</span>
                    <span className="text-sm font-bold text-amber-500">{existingOffer.amount.toLocaleString()} {existingOffer.currency}</span>
                  </div>
                )}
              </div>

              {/* Existing offer status card */}
              {existingOffer ? (
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-[#12121a] rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/60">Status:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        existingOffer.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        existingOffer.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        existingOffer.status === 'Counter Offer' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {existingOffer.status}
                      </span>
                    </div>

                    {existingOffer.status === 'Counter Offer' && existingOffer.counterAmount && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                        <p className="text-xs text-amber-500 font-bold">
                          Seller Counter Offer: {existingOffer.counterAmount.toLocaleString()} {existingOffer.currency}
                        </p>
                        {existingOffer.counterMessage && (
                          <p className="text-xs text-white/70 italic">
                            "{existingOffer.counterMessage}"
                          </p>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleRespondToCounter('Accepted')}
                            disabled={counterSubmitting}
                            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-xl text-xs hover:bg-emerald-400 cursor-pointer"
                          >
                            Accept Counter
                          </button>
                          <button
                            onClick={() => handleRespondToCounter('Rejected')}
                            disabled={counterSubmitting}
                            className="flex-1 bg-red-500/20 text-red-400 font-bold py-2 rounded-xl text-xs hover:bg-red-500/30 cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Offer Submission Form */}
              {(!existingOffer || ['Rejected', 'Expired'].includes(existingOffer.status)) && (
                <form onSubmit={handleSubmitOffer} className="space-y-4">
                  {offerError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl font-semibold">
                      {offerError}
                    </div>
                  )}

                  {offerSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl font-semibold">
                      {offerSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase">
                      Your Offer Amount ({property.currency || 'ETB'}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={offerAmount}
                      onChange={e => setOfferAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3.5 bg-[#12121a] border border-white/10 rounded-2xl text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-500"
                      placeholder="e.g. 500000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase">
                      Optional Note for Seller
                    </label>
                    <textarea
                      value={offerNote}
                      onChange={e => setOfferNote(e.target.value)}
                      rows={3}
                      className="w-full p-3.5 bg-[#12121a] border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. I am ready to close this week with instant payment..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={offerSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {offerSubmitting ? 'Submitting Offer...' : 'Submit Official Offer'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SELLER ADS OVERLAY MODAL */}
      <AnimatePresence>
        {sellerAdsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-left text-[#F5F5F4]"
            >
              <button
                onClick={() => setSellerAdsModalOpen(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-black text-lg flex items-center justify-center shadow">
                  {property.ownerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Listings by {property.ownerName}
                  </h3>
                  <p className="text-xs text-white/40">
                    {sellerListings.length} Total Active Ads
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sellerListings.map(ad => (
                  <div
                    key={ad.id}
                    onClick={() => {
                      if (onSelectProperty) onSelectProperty(ad);
                      setSellerAdsModalOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#12121a] rounded-2xl p-4 border border-white/5 hover:border-amber-500/40 transition cursor-pointer flex gap-4 group"
                  >
                    <img
                      src={ad.images[0] || ''}
                      alt={ad.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[9px] font-bold text-amber-500 uppercase block font-mono">
                        {ad.propertyType}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-500 transition">
                        {ad.title}
                      </h4>
                      <p className="text-xs font-bold text-white font-mono">
                        {ad.price.toLocaleString()} {ad.currency || 'ETB'}
                      </p>
                      <p className="text-[10px] text-white/40 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{ad.location}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
