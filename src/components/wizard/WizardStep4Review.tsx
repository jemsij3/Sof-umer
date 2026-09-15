import React, { useState } from 'react';
import { 
  Camera, MapPin, Phone, User as UserIcon, Sparkles, Loader2,
  BedDouble, Bath, Maximize, Truck, ShieldCheck, Tag, Zap, Check, Copy, AlertCircle, CreditCard
} from 'lucide-react';
import { NormalizedSellingType, getPluralizedUnit } from '../../utils/wholesalePricing';
import { getTranslatedCategoryName, getTranslatedSubcategoryName } from '../../lib/categoriesData';
import { WholesalePriceTier } from '../../types';
import { ReceiptUploadInput } from '../ReceiptUploadInput';
import { useApp } from '../../lib/AppContext';

interface WizardStep4ReviewProps {
  majorCategory: string;
  subcategory: string;
  sellingType: NormalizedSellingType;
  currency: string;
  fieldsState: Record<string, any>;
  imagesList: string[];
  wholesaleTiers: WholesalePriceTier[];
  isFeaturedAddon: boolean;
  setIsFeaturedAddon: (val: boolean) => void;
  submitting: boolean;
  onPublish: () => void;
  onBackToPricing: () => void;
  paymentMethods: any[];
  selectedDirectMethodId: string;
  setSelectedDirectMethodId: (id: string) => void;
  receiptRefNumber: string;
  setReceiptRefNumber: (ref: string) => void;
  receiptFileData: any;
  setReceiptFileData: (data: any) => void;
  currentUser: any;
  currentLanguage: string;
  selectedPlan?: string;
  setSelectedPlan?: (plan: string) => void;
  adminPromotionPackages?: any[];
}

export const WizardStep4Review: React.FC<WizardStep4ReviewProps> = ({
  majorCategory,
  subcategory,
  sellingType,
  currency,
  fieldsState,
  imagesList,
  wholesaleTiers,
  isFeaturedAddon,
  setIsFeaturedAddon,
  submitting,
  onPublish,
  onBackToPricing,
  paymentMethods,
  selectedDirectMethodId,
  setSelectedDirectMethodId,
  receiptRefNumber,
  setReceiptRefNumber,
  receiptFileData,
  setReceiptFileData,
  currentUser,
  currentLanguage,
  selectedPlan,
  setSelectedPlan,
  adminPromotionPackages: propAdminPackages
}) => {
  const { systemSettings } = useApp();

  // Dynamic admin-defined promotion packages stored in state/context
  const defaultAdminPackages = [
    { id: 'basic', name: 'Basic Boost', price: 49, currency: 'ETB', duration: '3 Days', badge: 'BASIC', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'Premium Boost', price: 149, currency: 'ETB', duration: '7 Days', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP Elite Boost', price: 399, currency: 'ETB', duration: '30 Days', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
  ];

  const liveAdminPackages = (propAdminPackages && propAdminPackages.length > 0)
    ? propAdminPackages
    : (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
    ? systemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'))
    : defaultAdminPackages;

  const adminPromotionPackages = liveAdminPackages.length > 0 ? liveAdminPackages : defaultAdminPackages;

  const isFreeCampaignActive = Boolean(
    systemSettings?.freeListingSettings?.isCampaignActive || 
    systemSettings?.freeListingSettings?.enabled
  );

  const freeOption = {
    id: 'free',
    name: 'Free Listing / Standard',
    price: 0,
    currency: 'ETB',
    duration: 'Standard',
    badge: isFreeCampaignActive ? 'FREE PROMO' : 'STANDARD',
    desc: isFreeCampaignActive
      ? 'Standard free listing included under the active Free Listing Campaign.'
      : 'Standard catalog listing with organic search ranking and direct buyer inquiries.'
  };

  const allPromotionPackages = [freeOption, ...adminPromotionPackages];

  const [internalPlan, setInternalPlan] = useState<string>(
    selectedPlan || (isFeaturedAddon ? 'vip' : 'free')
  );
  const [showPaymentStep, setShowPaymentStep] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const effectivePlanId = selectedPlan !== undefined ? selectedPlan : internalPlan;
  const activePackage = allPromotionPackages.find(p => p.id === effectivePlanId) || freeOption;
  const isPaidBoost = activePackage.price > 0 && activePackage.id !== 'free';

  const handleSelectPackage = (pkg: any) => {
    setInternalPlan(pkg.id);
    setSelectedPlan?.(pkg.id);
    setPaymentError('');

    if (pkg.id === 'free' || pkg.price === 0) {
      setIsFeaturedAddon(false);
      setShowPaymentStep(false);
    } else {
      setIsFeaturedAddon(true);
    }
  };

  const handlePublishAction = () => {
    setPaymentError('');

    if (isPaidBoost) {
      // 1. If manual payment step/modal is not yet open, trigger it so customer views accounts & submits receipt
      if (!showPaymentStep) {
        setShowPaymentStep(true);
        return;
      }

      // 2. If payment step is open, validate that an official payment channel has been chosen
      if (!selectedDirectMethodId) {
        setPaymentError('Please select an official payment account (Telebirr or CBE Bank) to proceed.');
        return;
      }

      // Proceed with paid listing creation and receipt submission
      onPublish();
    } else {
      // Free Listing / Standard or Free Campaign ON -> directly complete publishing without manual payment
      onPublish();
    }
  };

  const handleCopyAccount = (accountNum: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(accountNum);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const activeMethods = paymentMethods.filter(m => m.isActive !== false);
  const deliveryOptions: string[] = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];

  const isRealEstate = 
    majorCategory === 'Properties' || 
    majorCategory?.toLowerCase() === 'properties' || 
    fieldsState?.category === 'properties' || 
    fieldsState?.category === 'Properties';

  const isVehicles = 
    majorCategory === 'Vehicles' || 
    majorCategory?.toLowerCase() === 'vehicles';

  const isProducts = 
    majorCategory === 'Products' || 
    majorCategory?.toLowerCase() === 'products';

  // Normalize numeric fields safely
  const bedroomsNum = fieldsState?.bedrooms !== undefined && fieldsState?.bedrooms !== '' ? Number(fieldsState.bedrooms) : undefined;
  const bathroomsNum = fieldsState?.bathrooms !== undefined && fieldsState?.bathrooms !== '' ? Number(fieldsState.bathrooms) : undefined;
  const areaNum = fieldsState?.area !== undefined && fieldsState?.area !== '' ? Number(fieldsState.area) : undefined;

  const hasPhysicalSpecs = isRealEstate && (
    (bedroomsNum !== undefined && bedroomsNum > 0) || 
    (bathroomsNum !== undefined && bathroomsNum > 0) || 
    (areaNum !== undefined && areaNum > 0)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Preview Listing Card */}
      <div className="bg-[#141418] rounded-2xl border border-[#22242E] overflow-hidden shadow-xl max-w-xl mx-auto">
        {/* 1. HEADER & MEDIA PREVIEW */}
        <div className="relative h-56 bg-zinc-800">
          <img
            src={imagesList[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'}
            alt="Listing Cover Preview"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#F5A623] uppercase tracking-wider border border-white/10">
            {getTranslatedCategoryName(majorCategory, currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
          </div>
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#F5A623]" />
              <span>{imagesList.length} photos</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                {fieldsState.title || 'Untitled Listing'}
              </h3>
              <div className="text-xs text-white/70 flex items-start gap-1.5 mt-1.5 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap break-words flex-1 text-white/90 leading-snug">
                  {fieldsState.location || 'Location not specified'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              {isRealEstate ? (
                <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                  {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                </span>
              ) : sellingType === 'Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                    {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : (fieldsState.wholesalePrice ? `${Number(fieldsState.wholesalePrice).toLocaleString()} ${currency}` : 'Contact for Price')}
                    <span className="text-xs font-normal text-amber-300/80 ml-1">/ {fieldsState.unit || 'Piece'}</span>
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-bold block mt-0.5">
                    MOQ: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 10), fieldsState.unit || 'Piece')}
                  </span>
                </>
              ) : sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                    {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
                    Bulk: {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : 'Tiered'} (MOQ: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10})
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                  {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                </span>
              )}
            </div>
          </div>

          {/* 2. SPECIFICATIONS & CONDITION GRID */}
          {/* Top Primary Physical Specs for Real Estate (Bedrooms, Bathrooms, Area) */}
          {hasPhysicalSpecs && (
            <div className="grid grid-cols-3 gap-2 text-center my-3 border-y border-[#22242E] py-3 bg-[#0A0A0C]/50 rounded-xl">
              {bedroomsNum !== undefined && bedroomsNum > 0 && (
                <div className="bg-[#1A1B22] rounded-xl p-2.5 border border-[#22242E]">
                  <BedDouble className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span className="text-sm font-bold text-white block">{bedroomsNum}</span>
                  <span className="text-[9px] font-bold text-[#F5A623] uppercase tracking-wider">
                    BEDROOMS
                  </span>
                </div>
              )}
              {bathroomsNum !== undefined && bathroomsNum > 0 && (
                <div className="bg-[#1A1B22] rounded-xl p-2.5 border border-[#22242E]">
                  <Bath className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span className="text-sm font-bold text-white block">{bathroomsNum}</span>
                  <span className="text-[9px] font-bold text-[#F5A623] uppercase tracking-wider">
                    BATHROOMS
                  </span>
                </div>
              )}
              {areaNum !== undefined && areaNum > 0 && (
                <div className="bg-[#1A1B22] rounded-xl p-2.5 border border-[#22242E]">
                  <Maximize className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span className="text-sm font-bold text-white block">{areaNum} m²</span>
                  <span className="text-[9px] font-bold text-[#F5A623] uppercase tracking-wider">
                    TOTAL AREA
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Specs & Condition Preview Grid (Deduped - No area/bedrooms/bathrooms repeated) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
            {/* Condition / Furnishing */}
            {fieldsState.condition && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {isRealEstate ? 'Condition / Furnishing' : 'Condition'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.condition}
                </span>
              </div>
            )}

            {/* Subcategory */}
            {subcategory && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Subcategory
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                </span>
              </div>
            )}

            {/* Purpose (Real Estate) */}
            {isRealEstate && fieldsState.purpose && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Purpose
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.purpose === 'Rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            )}

            {/* Brand (Vehicles & Goods) */}
            {fieldsState.brand && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Brand
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.brand}
                </span>
              </div>
            )}

            {/* Model (Vehicles & Goods) */}
            {fieldsState.model && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Model
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.model}
                </span>
              </div>
            )}

            {/* Year (Vehicles) */}
            {fieldsState.year && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Year
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.year}
                </span>
              </div>
            )}

            {/* Storage / Specs (Products) */}
            {fieldsState.storageSpec && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Specs
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.storageSpec}
                </span>
              </div>
            )}

            {/* Selling Mode / Intent (Products & Non-Properties) */}
            {!isRealEstate && (sellingType || fieldsState.sellingMode) && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Selling Mode
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {sellingType === 'Retail' ? 'Single Units (Retail)' : 
                   sellingType === 'Wholesale' ? 'Bulk Only (Wholesale)' : 
                   sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale' ? 'Dual Pricing (Retail + Bulk)' :
                   fieldsState.sellingMode || sellingType}
                </span>
              </div>
            )}

            {/* Available Stock */}
            {!isRealEstate && fieldsState.stockQuantity !== undefined && fieldsState.stockQuantity !== '' && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Available Stock
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.stockQuantity} {fieldsState.unit || 'Units'}
                </span>
              </div>
            )}

            {/* Minimum Order Quantity (MOQ) */}
            {!isRealEstate && (sellingType === 'Wholesale' || sellingType === 'Retail + Wholesale' || fieldsState.minimumOrderQuantity) && (
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  Min. Order (MOQ)
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 10), fieldsState.unit || 'Piece')}
                </span>
              </div>
            )}
          </div>

          {/* 3. DESCRIPTION & LOGISTICS PREVIEW */}
          {/* Configured Delivery & Logistics Preferences (Non-Properties) */}
          {!isRealEstate && deliveryOptions.length > 0 && (
            <div className="pt-2 border-t border-[#22242E]">
              <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1.5">
                Delivery & Logistics Options
              </span>
              <div className="flex flex-wrap gap-1.5">
                {deliveryOptions.map((opt: string) => (
                  <span key={opt} className="bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>{opt}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Description text */}
          <div className="pt-2 border-t border-[#22242E]">
            <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1">
              Description
            </span>
            <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed bg-[#0A0A0C]/40 p-3 rounded-xl border border-[#22242E]/60 max-h-36 overflow-y-auto">
              {fieldsState.description || 'No description provided'}
            </p>
          </div>

          {/* Seller Info Badge */}
          <div className="bg-[#1A1B22] p-3 rounded-xl border border-[#22242E] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#F5A623]" />
              <span className="text-white/80 font-medium">{fieldsState.ownerName || currentUser?.fullName || 'Seller'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#F5A623] font-mono font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>{fieldsState.contactPhone || '+251 91 123 4567'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Boost Packages & Monetization Flow */}
      <div className="max-w-xl mx-auto space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            Promotion & Visibility Packages
          </span>
          <span className="text-[11px] text-white/50 font-mono">
            {activePackage.price === 0 ? 'Standard Listing' : `${activePackage.price} ETB Boost`}
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed -mt-1">
          Spotlight your listing on top of searches and homepage feeds, or publish as a standard listing.
        </p>

        {/* Dynamic Admin-Defined Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {allPromotionPackages.map(pkg => {
            const isSelected = effectivePlanId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#F5A623]/10 border-[#F5A623] ring-1 ring-[#F5A623]/40 shadow-lg shadow-[#F5A623]/10'
                    : 'bg-[#141418] border-[#22242E] hover:border-[#F5A623]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/30 bg-black/40'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-[#F5A623] text-black'
                          : 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30'
                      }`}>
                        {pkg.badge || 'PROMO'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">{pkg.duration}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white mb-1">{pkg.name}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-2 line-clamp-2">{pkg.desc}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
                  <span className="text-[10px] uppercase font-bold text-white/40">Price</span>
                  <span className={`font-mono text-sm font-black ${
                    isSelected ? 'text-[#F5A623]' : 'text-white/80'
                  }`}>
                    {pkg.price > 0 ? `${pkg.price} ETB` : 'FREE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Payment Step / Modal for Paid Boosts */}
        {isPaidBoost && showPaymentStep && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#F5A623]/30 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F5A623]/20 rounded-xl border border-[#F5A623]/30 text-[#F5A623]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    Manual Payment Verification
                  </span>
                  <span className="text-[11px] text-white/60">
                    Selected: <strong className="text-[#F5A623]">{activePackage.name}</strong> ({activePackage.price} ETB for {activePackage.duration})
                  </span>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-1 rounded-lg border border-[#F5A623]/20">
                {activePackage.price} ETB
              </span>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Transfer the exact amount (<strong className="text-[#F5A623]">{activePackage.price} ETB</strong>) to one of our official accounts below via Mobile Banking or Branch Deposit, then select your account and attach your reference number or transfer slip:
            </p>

            {/* Official Accounts Cards */}
            {activeMethods.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block font-mono">
                  Official Sofumer Accounts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMethods.map(m => (
                    <div key={m.id} className="p-3 bg-black/50 rounded-xl border border-white/10 text-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-[11px]">{m.name}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(m.accountNumber, m.id)}
                            className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px]"
                            title="Copy Account Number"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-[#F5A623]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#F5A623] mb-0.5">
                          {m.accountNumber}
                        </div>
                        {m.accountName && (
                          <div className="text-[10px] text-white/60 truncate">
                            Holder: {m.accountName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Select Payment Method */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-white/80 uppercase font-mono">
                Select Payment Method Used *
              </label>
              <select
                value={selectedDirectMethodId}
                onChange={e => {
                  setSelectedDirectMethodId(e.target.value);
                  setPaymentError('');
                }}
                className="w-full p-2.5 bg-black border border-white/15 focus:border-[#F5A623] rounded-xl text-xs text-white cursor-pointer font-mono"
              >
                <option value="">-- Choose Transfer Account --</option>
                {activeMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.accountNumber ? `(${m.accountNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt Reference and File Upload */}
            <ReceiptUploadInput
              referenceNumber={receiptRefNumber}
              onReferenceChange={setReceiptRefNumber}
              onFileUploaded={data => setReceiptFileData(data)}
              onFileRemoved={() => setReceiptFileData(null)}
              uploadedFile={receiptFileData}
            />

            {paymentError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}
          </div>
        )}

        {/* Final Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={handlePublishAction}
            className="w-full py-3.5 bg-[#F5A623] text-black font-extrabold text-sm rounded-xl hover:bg-[#F5A623]/90 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-[#F5A623]/10 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                <span>
                  {isPaidBoost
                    ? showPaymentStep
                      ? `🚀 SUBMIT RECEIPT & PUBLISH LISTING (${activePackage.price} ETB)`
                      : `🚀 PROCEED TO PAYMENT (${activePackage.price} ETB) & PUBLISH`
                    : '🚀 PUBLISH LISTING NOW'}
                </span>
              </>
            )}
          </button>

          {isPaidBoost && showPaymentStep && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  handleSelectPackage(freeOption);
                }}
                className="text-xs text-[#F5A623] hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
              >
                <span>Switch back to Standard Free Listing (0 ETB)</span>
              </button>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToPricing}
              className="text-xs text-white/50 hover:text-white underline underline-offset-4 cursor-pointer transition font-medium"
            >
              🡠 Back to Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
