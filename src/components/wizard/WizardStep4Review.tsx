import React, { useState, useEffect } from 'react';
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

  const adminSettings = (systemSettings as any) || {};
  const rawFreeCampaign = adminSettings.freeListingCampaign || adminSettings.freeListingSettings;
  const isCampaignEnabled = Boolean(rawFreeCampaign?.enabled);

  const freeListingCampaign = {
    enabled: isCampaignEnabled,
    startDate: rawFreeCampaign?.startDate || '',
    endDate: rawFreeCampaign?.endDate || 'Active Campaign Period',
    maxListings: rawFreeCampaign?.maxListings || rawFreeCampaign?.maxFreeListingsPerUser || 30
  };

  const safeAdminSettings = {
    ...adminSettings,
    freeListingCampaign
  };

  const defaultPromotionPackages = [
    { id: 'basic', name: 'Basic Boost', price: 49, currency: 'ETB', duration: '3 Days', badge: 'BASIC', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'Premium Boost', price: 149, currency: 'ETB', duration: '7 Days', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP Elite Boost', price: 399, currency: 'ETB', duration: '30 Days', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
  ];

  const rawPackages = (propAdminPackages && propAdminPackages.length > 0)
    ? propAdminPackages
    : (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
    ? systemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'))
    : defaultPromotionPackages;

  const promotionPackages = rawPackages.map((pkg: any, idx: number) => ({
    id: pkg.id || (idx === 0 ? 'basic' : idx === 1 ? 'premium' : 'vip'),
    name: pkg.name || `Boost Package ${idx + 1}`,
    price: Number(pkg.price) || (idx === 0 ? 49 : idx === 1 ? 149 : 399),
    currency: pkg.currency || 'ETB',
    duration: pkg.duration || (idx === 0 ? '3 Days' : idx === 1 ? '7 Days' : '30 Days'),
    badge: pkg.badge || (idx === 0 ? 'BASIC' : idx === 1 ? 'PREMIUM' : 'VIP ELITE'),
    desc: pkg.desc || ''
  }));

  const [selectedPackage, setSelectedPackageState] = useState<any>(() => {
    if (isCampaignEnabled && (!selectedPlan || selectedPlan === 'free')) {
      return { id: 'free', price: 0, name: 'Free Listing / Standard' };
    }
    const found = promotionPackages.find((p: any) => p.id === selectedPlan || (p.id === 'basic' && selectedPlan === 'starter'));
    return found || (isCampaignEnabled ? { id: 'free', price: 0, name: 'Free Listing / Standard' } : promotionPackages[0]);
  });

  // Keep selectedPackage synchronized if selectedPlan changes externally
  useEffect(() => {
    if (selectedPlan === 'free' && isCampaignEnabled) {
      setSelectedPackageState({ id: 'free', price: 0, name: 'Free Listing / Standard' });
    } else if (selectedPlan) {
      const found = promotionPackages.find((p: any) => p.id === selectedPlan || (p.id === 'basic' && selectedPlan === 'starter'));
      if (found) setSelectedPackageState(found);
    }
  }, [selectedPlan, isCampaignEnabled]);

  const setSelectedPackage = (pkg: any) => {
    setSelectedPackageState(pkg);
    setSelectedPlan?.(pkg.id);
    if (pkg.id === 'free' || pkg.price === 0) {
      setIsFeaturedAddon(false);
      setShowManualPaymentModal(false);
    } else {
      setIsFeaturedAddon(true);
    }
    setPaymentError('');
  };

  const [showManualPaymentModal, setShowManualPaymentModal] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDirectPublish = () => {
    onPublish();
  };

  const handleManualPaymentSubmit = () => {
    if (!selectedDirectMethodId) {
      setPaymentError('Please select the payment method you used (CBE, Telebirr, or Awash Bank).');
      return;
    }
    if (!receiptRefNumber.trim() && !receiptFileData?.url) {
      setPaymentError('Please provide a transfer reference number or upload your payment receipt screenshot before submitting.');
      return;
    }
    setPaymentError('');
    onPublish();
  };

  const handleCopyAccount = (accountNum: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(accountNum);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Authoritative admin-configured manual payment methods
  const resolvedPaymentMethods = (() => {
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      return paymentMethods;
    }
    try {
      const saved = localStorage.getItem('sof_umer_payment_methods');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  })();

  // Filter only active / live payment methods configured by admin
  const activeMethods = resolvedPaymentMethods.length > 0
    ? resolvedPaymentMethods.filter((m: any) => m.isActive === true || m.isActive === 'true')
    : [
        {
          id: 'pay-cbe',
          name: 'CBE Bank (Commercial Bank of Ethiopia)',
          accountName: 'SOF-UMER Real Estate PLC',
          accountNumber: '1000345672819',
          phoneNumber: '+251911000000',
          instructions: 'Please transfer the required amount to our CBE account. Make sure to enter your full name as the transfer reference and upload a clear screenshot of the completed transaction receipt.',
          isActive: true
        },
        {
          id: 'pay-telebirr',
          name: 'Telebirr Wallet',
          accountName: 'SOF-UMER MARKETPLACE',
          accountNumber: '0911000000',
          phoneNumber: '0911000000',
          instructions: 'Pay directly using Telebirr Pay. Select "Send Money" or "Pay Merchant" to our registered number 0911000000. Take a screenshot of the payment SMS/receipt and upload it here.',
          isActive: true
        },
        {
          id: 'pay-awash',
          name: 'Awash Bank',
          accountName: 'SOF-UMER PLATFORMS',
          accountNumber: '01320492837400',
          phoneNumber: '+251911000000',
          instructions: 'Transfer to Awash Bank. Include your property ID or user email in the transaction remarks. Upload transaction slip.',
          isActive: false
        }
      ].filter(m => m.isActive);

  // Auto-select first active payment method if none selected
  useEffect(() => {
    if ((!selectedDirectMethodId || !activeMethods.some((m: any) => m.id === selectedDirectMethodId)) && activeMethods.length > 0) {
      setSelectedDirectMethodId(activeMethods[0].id);
    }
  }, [activeMethods, selectedDirectMethodId, setSelectedDirectMethodId]);

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
            {selectedPackage?.price === 0 ? 'Standard Listing' : `${selectedPackage?.price} ETB Boost`}
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed -mt-1">
          Spotlight your listing on top of searches and homepage feeds, or publish as a standard listing.
        </p>

        {/* 1. CONDITIONAL FREE LISTING CAMPAIGN CARD (HIDE WHEN ADMIN TOGGLE IS OFF) */}
        {safeAdminSettings?.freeListingCampaign?.enabled && (
          <div 
            onClick={() => setSelectedPackage({ id: 'free', price: 0, name: 'Free Listing / Standard' })}
            className={`p-4 rounded-xl border cursor-pointer mb-3 transition-all ${
              selectedPackage?.id === 'free' ? 'border-[#F5A623] bg-[#1A1B22]' : 'border-[#22242E] bg-[#141418]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold bg-[#F5A623]/20 text-[#F5A623] px-2 py-0.5 rounded">CAMPAIGN ACTIVE</span>
              <span className="text-xs text-gray-400">
                Ends: {safeAdminSettings.freeListingCampaign.endDate}
              </span>
            </div>
            <div className="text-white font-bold text-sm mt-1">Free Listing / Standard</div>
            <p className="text-xs text-gray-400 mt-1">
              Max free listings allowed per user: {safeAdminSettings.freeListingCampaign.maxListings || 30}
            </p>
          </div>
        )}

        {/* 2. DYNAMICALLY CLICKABLE BOOST PACKAGES LOOP */}
        <div className="flex flex-col gap-3 my-3">
          {promotionPackages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected ? 'border-[#F5A623] bg-[#1A1B22]' : 'border-[#22242E] bg-[#141418]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded uppercase">
                    {pkg.badge || pkg.name}
                  </span>
                  <span className="text-xs text-gray-400">{pkg.duration}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white font-semibold text-sm">{pkg.name}</span>
                  <span className="text-[#F5A623] font-bold text-sm">{pkg.price} ETB</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Payment Step / Modal for Paid Boosts (Without Unmounting or Black Screen) */}
        {selectedPackage?.price > 0 && showManualPaymentModal && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#F5A623]/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#F5A623]/20 rounded-xl border border-[#F5A623]/30 text-[#F5A623]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                      Manual Payment Verification
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Live Admin Methods
                    </span>
                  </div>
                  <span className="text-[11px] text-white/60">
                    Selected: <strong className="text-[#F5A623]">{selectedPackage.name}</strong> ({selectedPackage.duration})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-lg border border-[#F5A623]/20 block">
                  {selectedPackage.price} ETB
                </span>
                <span className="text-[10px] text-white/40 font-mono mt-0.5 block">Total Payable</span>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              Transfer the exact package amount (<strong className="text-[#F5A623] font-mono">{selectedPackage.price} ETB</strong>) to any of our official admin-configured accounts below via Mobile Banking or Branch Deposit, then attach your transaction reference or receipt screenshot:
            </p>

            {/* Official Accounts Cards */}
            {activeMethods.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block font-mono">
                    Select Transfer Account ({activeMethods.length} Active):
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    Click to select account
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {activeMethods.map((m: any) => {
                    const isSelected = selectedDirectMethodId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedDirectMethodId(m.id);
                          setPaymentError('');
                        }}
                        className={`p-3.5 rounded-xl border text-xs transition cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'border-[#F5A623] bg-[#1A1B22] shadow-md shadow-[#F5A623]/5'
                            : 'border-white/10 bg-black/50 hover:border-white/20 hover:bg-black/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/30 bg-transparent'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            <span className="font-bold text-white text-xs">{m.name}</span>
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            Active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div>
                            <span className="text-[10px] text-white/40 block font-mono">Account / Number:</span>
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              <span className="font-mono text-xs font-bold text-[#F5A623] truncate">
                                {m.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAccount(m.accountNumber, m.id);
                                }}
                                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] shrink-0 font-mono"
                                title="Copy Account Number"
                              >
                                {copiedId === m.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#F5A623]" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {m.accountName && (
                            <div>
                              <span className="text-[10px] text-white/40 block font-mono">Account Holder:</span>
                              <span className="text-xs text-white/80 font-medium truncate block mt-0.5">
                                {m.accountName}
                              </span>
                            </div>
                          )}

                          {m.phoneNumber && (
                            <div className="sm:col-span-2 flex items-center gap-1.5 text-[11px] text-white/60 pt-0.5">
                              <Phone className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                              <span className="font-mono">Hotline / Support: <strong className="text-white">{m.phoneNumber}</strong></span>
                            </div>
                          )}
                        </div>

                        {m.instructions && (
                          <div className="text-[11px] text-white/70 bg-white/[0.02] p-2 rounded-lg border border-white/5 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-[#F5A623] font-bold shrink-0 font-mono text-[10px] uppercase">Instructions:</span>
                            <span>{m.instructions}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl">
                No active manual payment methods found in admin configuration. Please contact admin.
              </div>
            )}

            {/* Receipt Reference and File Upload */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block font-mono mb-2">
                Submit Payment Verification:
              </span>
              <ReceiptUploadInput
                referenceNumber={receiptRefNumber}
                onReferenceChange={setReceiptRefNumber}
                receiptFile={receiptFileData?.url || ''}
                fileName={receiptFileData?.fileName}
                fileType={receiptFileData?.fileType}
                fileSize={receiptFileData?.fileSize}
                onFileChange={data => setReceiptFileData(data)}
              />
            </div>

            {paymentError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. SAFE SUBMIT & MANUAL PAYMENT ACTION (PREVENT BLACK SCREEN) */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            if (!selectedPackage) return;
            if (selectedPackage.price === 0) {
              handleDirectPublish();
            } else {
              if (!showManualPaymentModal) {
                // Open existing Manual Payment Modal / Step safely without unmounting parent state
                setShowManualPaymentModal(true);
              } else {
                handleManualPaymentSubmit();
              }
            }
          }}
          className="w-full bg-[#F5A623] text-black font-bold py-3.5 rounded-xl text-center text-sm uppercase tracking-wider mt-4 cursor-pointer hover:bg-[#F5A623]/90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/10"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Listing...</span>
            </>
          ) : (
            selectedPackage?.price > 0 
              ? (showManualPaymentModal
                  ? `SUBMIT PAYMENT RECEIPT & PUBLISH (${selectedPackage.price} ETB)`
                  : `PROCEED TO PAYMENT`)
              : 'PUBLISH LISTING NOW'
          )}
        </button>

        {selectedPackage?.price > 0 && showManualPaymentModal && (
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              type="button"
              onClick={() => setShowManualPaymentModal(false)}
              className="text-white/60 hover:text-white cursor-pointer font-medium"
            >
              🡠 Change Boost Package
            </button>
            {safeAdminSettings?.freeListingCampaign?.enabled && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPackage({ id: 'free', price: 0, name: 'Free Listing / Standard' });
                  setShowManualPaymentModal(false);
                }}
                className="text-[#F5A623] hover:underline cursor-pointer font-medium"
              >
                Switch to Free Listing (0 ETB)
              </button>
            )}
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
  );
};
