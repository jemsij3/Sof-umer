import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { 
  Heart, Share2, MapPin, Building, BedDouble, Bath, Maximize, 
  ShieldAlert, CheckCircle2, Sparkles, Clock, Eye, ExternalLink, 
  ChevronRight, ChevronLeft, Package, Tag, Calendar, Gauge, 
  Fuel, Layers, Phone, MessageSquare, Zap, Briefcase, Wrench,
  Check, Copy, Camera, ShieldCheck, UserCheck
} from 'lucide-react';
import { 
  extractString,
  getTranslatedCategoryName,
  getTranslatedPropertyType,
  getTranslatedOption,
  getEffectiveMajorCategory,
  isPropertyListing
} from '../lib/categoriesData';
import { getListingCustomerPricingDisplay } from '../utils/wholesalePricing';

export interface ListingCardProps {
  key?: React.Key;
  property: Property;
  onSelect: (prop: Property) => void;
  favorites?: string[];
  onToggleFav?: (id: string) => void;
  onReport?: (prop?: Property) => void;
  t?: (key: string) => string;
  currentLanguage?: string;
  viewMode?: 'grid' | 'list' | 'compact';
  showQuickActions?: boolean;
}

export function ListingCard({
  property,
  onSelect,
  favorites = [],
  onToggleFav,
  onReport,
  t = (k: string) => k,
  currentLanguage = 'en',
  viewMode = 'grid',
  showQuickActions = true
}: ListingCardProps) {
  const isFavorite = favorites.includes(property.id);
  const isVerifiedSupplier = property.verificationStatus === 'verified' || property.isVerifiedListing === true || property.ownerId === 'usr-admin';
  const isFeatured = property.isFeatured || property.isRecommended || property.isTopAd || property.boostPlan === 'vip' || property.boostPlan === 'premium';
  const sellingType = (property as any).sellingType || 'Retail';
  const pricingInfo = useMemo(() => getListingCustomerPricingDisplay(property), [property]);
  const isNegotiable = (property as any).isNegotiable === true || 
                       String((property as any).negotiable).toLowerCase() === 'yes' ||
                       property.amenities?.some(a => a.toLowerCase() === 'negotiable: yes' || a.toLowerCase() === 'negotiable: true');

  // Multi-image state handling
  const allImages = useMemo(() => {
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images.filter(Boolean);
    }
    if ((property as any).imageUrl) {
      return [(property as any).imageUrl];
    }
    return ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'];
  }, [property.images, (property as any).imageUrl]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeImageUrl = allImages[activeImgIndex] || allImages[0];

  // Category specific spec extraction
  const majorCategory = getEffectiveMajorCategory(property);
  const specs = useMemo(() => {
    const list: { icon: React.ReactNode; label: string; value: string }[] = [];
    const amenities = property.amenities || [];

    // Helper to find amenity by key
    const findAmenity = (key: string): string | null => {
      const target = key.toLowerCase();
      for (const item of amenities) {
        if (!item || typeof item !== 'string') continue;
        if (item.toLowerCase().startsWith(`${target}:`)) {
          return item.split(':')[1]?.trim() || null;
        }
      }
      return null;
    };

    const isProp = isPropertyListing(property);

    if (isProp) {
      if (property.bedrooms && property.bedrooms > 0) {
        list.push({
          icon: <BedDouble className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Beds',
          value: `${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`
        });
      }
      if (property.bathrooms && property.bathrooms > 0) {
        list.push({
          icon: <Bath className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Baths',
          value: `${property.bathrooms} ${property.bathrooms === 1 ? 'Bath' : 'Baths'}`
        });
      }
      if (property.area && property.area > 0) {
        list.push({
          icon: <Maximize className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Area',
          value: `${property.area} m²`
        });
      }
    } else if (majorCategory === 'Vehicles') {
      const year = findAmenity('year') || (property as any).year;
      const mileage = findAmenity('mileage') || findAmenity('mileage (km)') || (property as any).mileage;
      const fuel = findAmenity('fuel type') || findAmenity('fuel') || (property as any).fuelType;
      const trans = findAmenity('transmission') || (property as any).transmission;

      if (year) {
        list.push({
          icon: <Calendar className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Year',
          value: String(year)
        });
      }
      if (mileage) {
        list.push({
          icon: <Gauge className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Mileage',
          value: `${Number(mileage).toLocaleString()} km`
        });
      }
      if (trans) {
        list.push({
          icon: <Layers className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Transmission',
          value: String(trans)
        });
      } else if (fuel) {
        list.push({
          icon: <Fuel className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Fuel',
          value: String(fuel)
        });
      }
    } else if (majorCategory === 'Jobs') {
      const jobType = findAmenity('job type') || findAmenity('employment type') || property.category;
      const exp = findAmenity('experience') || findAmenity('experience required');
      if (jobType && jobType !== 'All') {
        list.push({
          icon: <Briefcase className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Type',
          value: String(jobType)
        });
      }
      if (exp) {
        list.push({
          icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Experience',
          value: String(exp)
        });
      }
    } else if (majorCategory === 'Services') {
      const unit = findAmenity('pricing unit') || (property as any).pricingUnit;
      const exp = findAmenity('years of experience') || findAmenity('experience');
      if (unit) {
        list.push({
          icon: <Tag className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Rate',
          value: String(unit)
        });
      }
      if (exp) {
        list.push({
          icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Experience',
          value: `${exp} yrs`
        });
      }
    } else {
      // Products / Electronics / Goods / General
      const condition = property.condition || findAmenity('condition');
      const brand = property.brand || findAmenity('brand');
      const moq = (property as any).minimumOrderQuantity;

      if (condition) {
        list.push({
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Condition',
          value: String(condition)
        });
      }
      if (brand) {
        list.push({
          icon: <Tag className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Brand',
          value: String(brand)
        });
      }
    }

    return list.slice(0, 3); // Max 3 clean highlights
  }, [property, majorCategory, sellingType]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?property=${property.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: extractString(property.title, currentLanguage),
          text: `Check out this listing on Sof Umer Marketplace: ${extractString(property.title, currentLanguage)}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (_) {}
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Format currency display cleanly
  const formattedPrice = (property.price || 0).toLocaleString();
  const currencyCode = property.currency || 'ETB';
  const titleText = extractString(property.title, currentLanguage) || 'Untitled Listing';
  const rawLocation = (typeof property.location === 'string' ? property.location : extractString(property.location, currentLanguage))?.trim();
  const locationText = rawLocation || 'Location not provided';
  const categoryLabel = property.propertyType 
    ? getTranslatedPropertyType(extractString(property.propertyType, currentLanguage), currentLanguage) 
    : getTranslatedCategoryName(extractString(property.majorCategory || 'Properties', currentLanguage), currentLanguage);

  const sellerName = (property as any).ownerBusinessName || property.ownerName || 'Sof Umer Seller';

  // ----------------------------------------------------
  // COMPACT MODE (Ideal for Similar Listings, Saved drawer, Mobile widgets)
  // ----------------------------------------------------
  if (viewMode === 'compact') {
    return (
      <div 
        onClick={() => onSelect(property)}
        className="group bg-[#0e0e15] hover:bg-[#14141e] border border-white/[0.07] hover:border-amber-500/40 rounded-2xl p-3 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer flex gap-3.5 items-center relative overflow-hidden"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80' : activeImageUrl}
            alt={titleText}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {isVerifiedSupplier && (
            <div className="absolute bottom-1 right-1 bg-emerald-500/90 text-white p-0.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 truncate">
              {categoryLabel}
            </span>
            {isFeatured && (
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-wider">
                ★
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
            {titleText}
          </h4>
          <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 truncate">
            {pricingInfo.hasRetailPrice
              ? pricingInfo.retailPriceFormatted
              : (pricingInfo.wholesaleTiers[0]?.label || (pricingInfo.hasMoq ? pricingInfo.moqFormatted : `${formattedPrice} ${currencyCode}`))}
          </div>
          <p className="text-[11px] text-white/45 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 text-amber-500/80 shrink-0" />
            <span className="truncate">{locationText}</span>
          </p>
        </div>

        {onToggleFav && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(property.id);
            }}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-rose-500 transition shrink-0"
            aria-label="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // LIST MODE (Wide horizontal layout for desktop / tablet)
  // ----------------------------------------------------
  if (viewMode === 'list') {
    return (
      <article 
        className="group bg-[#0d0d14] hover:bg-[#12121c] border border-white/[0.08] hover:border-amber-500/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col md:flex-row text-left relative"
      >
        {/* Left image column */}
        <div 
          onClick={() => onSelect(property)}
          className="md:w-72 lg:w-80 h-56 md:h-auto min-h-[220px] relative overflow-hidden bg-[#08080c] shrink-0 cursor-pointer"
        >
          <img
            src={imgError ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' : activeImageUrl}
            alt={titleText}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none md:hidden" />

          {/* Top badges */}
          <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap gap-1.5 items-center max-w-[80%]">
            {isFeatured && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}

            {isVerifiedSupplier && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
              </span>
            )}
          </div>

          {/* Image counter pill */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-medium text-white/90 border border-white/10 flex items-center gap-1">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>{activeImgIndex + 1}/{allImages.length}</span>
            </div>
          )}

          {/* Image slider arrows on desktop hover */}
          {allImages.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <button
                onClick={handlePrevImage}
                className="pointer-events-auto p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="pointer-events-auto p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Center/Right Information */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            {/* Top metadata line: Category, Negotiable, and Quick actions */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  {categoryLabel}
                </span>

                {isNegotiable && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                    🤝 {getTranslatedOption('Negotiable', currentLanguage) || 'Negotiable'}
                  </span>
                )}
              </div>

              {/* Action buttons (Fav + Share) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition relative"
                  title="Share listing"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                {onToggleFav && (
                  <button
                    onClick={() => onToggleFav(property.id)}
                    className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-rose-500 transition"
                    title="Save to favorites"
                  >
                    <Heart className={`w-4 h-4 transition ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Title */}
            <h3
              onClick={() => onSelect(property)}
              className="text-lg md:text-xl font-bold text-[#F5F5F4] hover:text-amber-400 leading-snug cursor-pointer transition-colors duration-200 line-clamp-1 mb-2"
            >
              {titleText}
            </h3>

            {/* Pure Data-Driven Pricing & Quantity Section */}
            <div className="space-y-1 mb-3">
              {/* Retail price line if present */}
              {pricingInfo.hasRetailPrice && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                    {pricingInfo.retailPriceFormatted}
                  </span>
                </div>
              )}

              {/* Available quantity line if present */}
              {pricingInfo.hasAvailableQuantity && (
                <div className="text-xs font-medium text-emerald-400 font-mono">
                  {pricingInfo.availableQuantityFormatted}
                </div>
              )}

              {/* MOQ line if present */}
              {pricingInfo.hasMoq && (
                <div className="text-xs font-bold text-amber-400 font-mono pt-0.5">
                  {pricingInfo.moqFormatted}
                </div>
              )}

              {/* Tier lines if present */}
              {pricingInfo.hasWholesaleTiers && (
                <div className="space-y-0.5 pt-0.5 font-mono text-xs text-white/90">
                  {pricingInfo.wholesaleTiers.slice(0, 3).map((tier, idx) => (
                    <div key={idx} className="text-white/80">
                      {tier.label}
                    </div>
                  ))}
                  {pricingInfo.wholesaleTiers.length > 3 && (
                    <span className="text-[10px] text-amber-400/80 font-sans block">
                      +{pricingInfo.wholesaleTiers.length - 3} more tiers
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Specs row */}
            {specs.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {specs.map((s, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg text-xs text-white/80 font-medium"
                  >
                    {s.icon}
                    <span>{s.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Short Description */}
            <p className="text-white/50 text-xs line-clamp-2 leading-relaxed font-light mb-4">
              {extractString(property.description, currentLanguage)}
            </p>
          </div>

          {/* Bottom Row: Location, Seller, and Action */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
              <div className="flex items-center gap-1.5 text-white/80 font-medium">
                <Building className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate max-w-[140px]">{sellerName}</span>
                {isVerifiedSupplier && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
              </div>

              <div className="flex items-center gap-1.5 text-white/50">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate max-w-[180px]">{locationText}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onReport && (
                <button
                  onClick={() => onReport(property)}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-red-400 transition"
                  title="Report listing"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onSelect(property)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-md shadow-amber-500/10 flex items-center gap-1.5"
              >
                <span>{t('view_details') || 'View Details'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ----------------------------------------------------
  // GRID MODE (Default high-craft visual card)
  // ----------------------------------------------------
  return (
    <article className="group bg-[#0d0d14] hover:bg-[#11111a] rounded-3xl overflow-hidden border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300 flex flex-col relative shadow-lg hover:shadow-2xl hover:-translate-y-1">
      {/* Visual Image Header */}
      <div 
        onClick={() => onSelect(property)}
        className="h-60 sm:h-64 overflow-hidden relative bg-[#07070b] cursor-pointer"
      >
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' : activeImageUrl}
          alt={titleText}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Subtle optical vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30 pointer-events-none" />

        {/* Floating Badges (Top-Left) */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap gap-1.5 items-center max-w-[75%]">
          {isFeatured && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}

          {isVerifiedSupplier && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
            </span>
          )}

          {isNegotiable && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
              🤝 {getTranslatedOption('Negotiable', currentLanguage) || 'Negotiable'}
            </span>
          )}
        </div>

        {/* Floating Actions (Top-Right: Favorite & Share) */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5">
          {onToggleFav && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFav(property.id);
              }}
              className="p-2.5 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition duration-200 shadow-md cursor-pointer"
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 transition duration-300 ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : ''}`} />
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition duration-200 shadow-md cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Share listing"
            title="Share"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Multi-image indicators (Bottom-Left) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-3.5 z-10 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-medium text-white/90 border border-white/10 flex items-center gap-1.5 shadow-sm">
            <Camera className="w-3 h-3 text-amber-400" />
            <span>{activeImgIndex + 1}/{allImages.length}</span>
          </div>
        )}

        {/* Arrow Navigation on Desktop Hover */}
        {allImages.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              onClick={handlePrevImage}
              className="pointer-events-auto p-1.5 rounded-full bg-black/75 hover:bg-black text-white backdrop-blur-md border border-white/10 transition shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="pointer-events-auto p-1.5 rounded-full bg-black/75 hover:bg-black text-white backdrop-blur-md border border-white/10 transition shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Micro image navigation dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {allImages.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeImgIndex ? 'bg-amber-400 w-3.5' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Category Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl uppercase tracking-wider">
              {categoryLabel}
            </span>
          </div>

          {/* Pure Data-Driven Pricing & Quantity Block */}
          <div className="space-y-1 mb-2.5 min-h-[50px]">
            {/* Retail Price line if present */}
            {pricingInfo.hasRetailPrice && (
              <div className="text-xl font-extrabold text-white font-mono tracking-tight leading-tight">
                {pricingInfo.retailPriceFormatted}
              </div>
            )}

            {/* Available quantity line if present */}
            {pricingInfo.hasAvailableQuantity && (
              <div className="text-xs font-medium text-emerald-400 font-mono">
                {pricingInfo.availableQuantityFormatted}
              </div>
            )}

            {/* MOQ line if present */}
            {pricingInfo.hasMoq && (
              <div className="text-xs font-bold text-amber-400 font-mono">
                {pricingInfo.moqFormatted}
              </div>
            )}

            {/* Tier lines if present */}
            {pricingInfo.hasWholesaleTiers && (
              <div className="space-y-0.5 font-mono text-[11px] text-white/85">
                {pricingInfo.wholesaleTiers.slice(0, 3).map((tier, idx) => (
                  <div key={idx} className="truncate">
                    {tier.label}
                  </div>
                ))}
                {pricingInfo.wholesaleTiers.length > 3 && (
                  <span className="text-[10px] text-amber-400/80 font-sans block">
                    +{pricingInfo.wholesaleTiers.length - 3} more tiers
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelect(property)}
            className="font-semibold text-base text-[#F5F5F4] hover:text-amber-400 leading-snug mb-3 cursor-pointer line-clamp-2 transition-colors duration-200"
            title={titleText}
          >
            {titleText}
          </h4>

          {/* Category-Smart Key Specs Highlights */}
          {specs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
              {specs.map((s, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-lg text-[11px] text-white/75 font-medium"
                >
                  {s.icon}
                  <span>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Seller & Location Trust Line */}
          <div className="space-y-1.5 mb-4 text-xs">
            <div className="flex items-center gap-1.5 text-white/80 font-medium">
              <Building className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{sellerName}</span>
              {isVerifiedSupplier && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </div>

            <div className="flex items-center gap-1.5 text-white/50 font-light">
              <MapPin className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        {showQuickActions && (
          <div className="border-t border-white/[0.06] pt-3.5 mt-auto flex items-center justify-between gap-2">
            {onReport && (
              <button
                onClick={() => onReport(property)}
                className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-white/[0.05] transition cursor-pointer shrink-0"
                title="Report listing"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <button
                onClick={() => onSelect(property)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer truncate"
              >
                <span>{t('view_listing') || 'View Listing'}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// Re-export PropertyCard alias for backward compatibility
export const PropertyCard = ListingCard;
export default ListingCard;
