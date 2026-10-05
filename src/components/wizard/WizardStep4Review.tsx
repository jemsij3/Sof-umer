import React, { useState, useEffect } from 'react';
import { 
  Camera, MapPin, Phone, User as UserIcon, Sparkles, Loader2,
  BedDouble, Bath, Maximize, Truck, ShieldCheck, Tag, Zap, Check, Copy, AlertCircle, CreditCard, Film, Wrench
} from 'lucide-react';
import { NormalizedSellingType, getPluralizedUnit, getLocalizedUnit } from '../../utils/wholesalePricing';
import { 
  getTranslatedCategoryName, 
  getTranslatedSubcategoryName, 
  getTranslatedFurnished, 
  getTranslatedCondition,
  getTranslatedFieldLabel,
  getTranslatedOption
} from '../../lib/categoriesData';
import { WholesalePriceTier } from '../../types';
import { ReceiptUploadInput } from '../ReceiptUploadInput';
import { useApp } from '../../lib/AppContext';
import { getEffectiveAdPackages } from '../../lib/adPackages';

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
  onPublish: (selectedPkg?: any) => void;
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
  const { systemSettings, t } = useApp();

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

  const effectiveAdPackages = getEffectiveAdPackages(systemSettings);
  const rawPackages = (propAdminPackages && propAdminPackages.length > 0)
    ? propAdminPackages
    : effectiveAdPackages;

  const promotionPackages = rawPackages.map((pkg: any, idx: number) => ({
    id: pkg.id || (idx === 0 ? 'starter' : idx === 1 ? 'premium' : 'vip'),
    name: pkg.name || `Boost Package ${idx + 1}`,
    price: Number.isFinite(Number(pkg.price)) && Number(pkg.price) >= 0 ? Number(pkg.price) : (idx === 0 ? 49 : idx === 1 ? 149 : 399),
    currency: pkg.currency || 'ETB',
    duration: pkg.duration || (idx === 0 ? '3 days' : idx === 1 ? '7 days' : '30 days'),
    badge: pkg.badge || (idx === 0 ? 'STARTER' : idx === 1 ? 'PREMIUM' : 'VIP ELITE'),
    desc: pkg.desc || ''
  }));

  const [selectedPackage, setSelectedPackageState] = useState<any>(() => {
    if (isCampaignEnabled && (!selectedPlan || selectedPlan === 'free')) {
      return { id: 'free', price: 0, name: 'Free Listing / Standard' };
    }
    const found = promotionPackages.find((p: any) => p.id === selectedPlan || (p.id === 'basic' && selectedPlan === 'starter') || (p.id === 'starter' && selectedPlan === 'basic'));
    return found || (isCampaignEnabled ? { id: 'free', price: 0, name: 'Free Listing / Standard' } : promotionPackages[0]);
  });

  // Keep selectedPackage synchronized if selectedPlan changes externally
  useEffect(() => {
    if (selectedPlan === 'free' && isCampaignEnabled) {
      setSelectedPackageState({ id: 'free', price: 0, name: 'Free Listing / Standard' });
    } else if (selectedPlan) {
      const found = promotionPackages.find((p: any) => p.id === selectedPlan || (p.id === 'basic' && selectedPlan === 'starter') || (p.id === 'starter' && selectedPlan === 'basic'));
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
    onPublish(selectedPackage);
  };

  const handleManualPaymentSubmit = () => {
    if (!selectedDirectMethodId) {
      setPaymentError(t('select_payment_account_error') || 'Please select the payment method/account you transferred funds to (e.g. CBE, Telebirr, or Awash Bank).');
      return;
    }
    if (!receiptRefNumber.trim() && !receiptFileData?.url) {
      setPaymentError(t('provide_ref_or_receipt_error') || 'Please provide a transfer reference number or upload your payment receipt screenshot before submitting.');
      return;
    }
    setPaymentError('');
    onPublish(selectedPackage);
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

  // Note: We do NOT auto-select the first payment method so the user explicitly chooses the account used.

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
        {/* 1. HEADER & MEDIA PREVIEW (Appears FIRST at the top for all categories) */}
        <div className="relative h-56 bg-zinc-800 overflow-hidden">
          {imagesList.length > 0 ? (
            <img
              src={imagesList[0]}
              alt="Listing Cover Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1B22] to-[#0A0A0C] text-white/40 p-4 text-center">
              <Camera className="w-8 h-8 mb-2 text-[#F5A623]/50" />
              <span className="text-xs font-medium text-white/60">{t('no_media_uploaded') || 'No photos uploaded (optional)'}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#F5A623] uppercase tracking-wider border border-white/10">
            {getTranslatedCategoryName(majorCategory, currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
          </div>
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#F5A623]" />
              <span>{imagesList.length} {t('photosCount') || 'photos'}</span>
            </div>
          )}
          {fieldsState.video && (
            <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
              <Film className="w-3 h-3 text-[#F5A623]" />
              <span className="truncate max-w-[150px]">{t('video') || 'Video'}</span>
            </div>
          )}
        </div>

        {/* Thumbnail strip if multiple images */}
        {imagesList.length > 1 && (
          <div className="px-5 pt-3 pb-2 flex gap-2 overflow-x-auto border-b border-[#22242E] bg-[#0A0A0C]/40">
            {imagesList.map((img, i) => (
              <div key={i} className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border ${i === 0 ? 'border-[#F5A623]' : 'border-white/10'} bg-zinc-800`}>
                <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-[#F5A623] text-[8px] px-1 rounded font-bold">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              {majorCategory === 'Jobs' ? (
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block mb-0.5">
                  1. {t('job_title_label') || 'Job Title'}
                </span>
              ) : majorCategory === 'Vehicles' ? (
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block mb-0.5">
                  1. {t('titleLabel') || 'Listing Title'}
                </span>
              ) : majorCategory === 'Services' ? (
                <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block mb-0.5">
                  1. {t('service_title_label') || 'Service Title'}
                </span>
              ) : null}
              <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                {fieldsState.title || t('untitled') || 'Untitled Listing'}
              </h3>
              {majorCategory !== 'Vehicles' && majorCategory !== 'Services' && (
                <div className="text-xs text-white/70 flex items-start gap-1.5 mt-1.5 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {majorCategory === 'Jobs' && (
                      <span className="text-[10px] font-bold text-[#F5A623] uppercase tracking-wider block mb-0.5">
                        2. {t('locLabel') || 'Location'}
                      </span>
                    )}
                    <span className="whitespace-pre-wrap break-words text-white/90 leading-snug">
                      {fieldsState.location || t('noLocation') || 'Location not specified'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              {majorCategory === 'Jobs' ? (
                <span className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider block">
                  {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                </span>
              ) : majorCategory === 'Vehicles' ? (
                <span className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider block">
                  {getTranslatedCategoryName('Vehicles', currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                </span>
              ) : majorCategory === 'Services' ? (
                <div>
                  <span className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {getTranslatedCategoryName('Services', currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                  </span>
                  <span className="text-base font-extrabold text-[#F5A623] font-mono block">
                    {fieldsState.pricingType === 'Negotiable / Get a Quote'
                      ? (t('pricing_negotiable_quote') || 'Negotiable')
                      : fieldsState.pricingType === 'Price Range'
                      ? `${fieldsState.priceMin ? Number(fieldsState.priceMin).toLocaleString() : '0'} - ${fieldsState.priceMax ? Number(fieldsState.priceMax).toLocaleString() : '...'} ${currency}`
                      : fieldsState.pricingType === 'Starting From'
                      ? `${t('pricing_starting_from') || 'From'} ${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency}`
                      : fieldsState.pricingType === 'Hourly Rate'
                      ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / hr`
                      : fieldsState.pricingType === 'Daily Rate'
                      ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / day`
                      : fieldsState.pricingType === 'Project-Based'
                      ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / proj`
                      : fieldsState.price
                      ? `${Number(fieldsState.price).toLocaleString()} ${currency}`
                      : (t('contactPrice') || 'Contact for Price')}
                  </span>
                </div>
              ) : isRealEstate ? (
                <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                  {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : (t('contactPrice') || 'Contact for Price')}
                </span>
              ) : sellingType === 'Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                    {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : (fieldsState.wholesalePrice ? `${Number(fieldsState.wholesalePrice).toLocaleString()} ${currency}` : (t('contactPrice') || 'Contact for Price'))}
                    <span className="text-xs font-normal text-amber-300/80 ml-1">/ {getLocalizedUnit(fieldsState.unit || 'Piece', currentLanguage, 1)}</span>
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-bold block mt-0.5">
                    {t('wholesale_moq_label') || 'MOQ'}: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 10), fieldsState.unit || 'Piece')}
                  </span>
                </>
              ) : sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                    {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : (t('contactPrice') || 'Contact for Price')}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
                    {t('wholesale.tier') || 'Bulk'}: {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : (t('pricing_strategy') || 'Tiered')} ({t('wholesale_moq_label') || 'MOQ'}: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10})
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-[#F5A623] font-mono block">
                  {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : (t('contactPrice') || 'Contact for Price')}
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
                    {t('bedrooms') || 'BEDROOMS'}
                  </span>
                </div>
              )}
              {bathroomsNum !== undefined && bathroomsNum > 0 && (
                <div className="bg-[#1A1B22] rounded-xl p-2.5 border border-[#22242E]">
                  <Bath className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span className="text-sm font-bold text-white block">{bathroomsNum}</span>
                  <span className="text-[9px] font-bold text-[#F5A623] uppercase tracking-wider">
                    {t('bathrooms') || 'BATHROOMS'}
                  </span>
                </div>
              )}
              {areaNum !== undefined && areaNum > 0 && (
                <div className="bg-[#1A1B22] rounded-xl p-2.5 border border-[#22242E]">
                  <Maximize className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span className="text-sm font-bold text-white block">{areaNum} m²</span>
                  <span className="text-[9px] font-bold text-[#F5A623] uppercase tracking-wider">
                    {t('area') || 'TOTAL AREA'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Specs & Condition Preview Grid */}
          {majorCategory === 'Jobs' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
              {/* 3. Employment Skill */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {t('employment_skill_label') || 'Employment Skill'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.employmentSkill || fieldsState.qualification || t('not_specified') || 'Not specified'}
                </span>
              </div>

              {/* 4. Work Arrangement */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {t('work_arrangement_label') || 'Work Arrangement'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.workArrangement || 'On-site'}
                </span>
              </div>

              {/* 5. Salary / Pay */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {t('salary_pay_label') || 'Salary / Pay'}
                </span>
                <span className="text-white text-xs font-medium truncate block font-mono text-[#F5A623]">
                  {fieldsState.payType === 'Negotiable'
                    ? (t('pay_type_negotiable') || 'Negotiable')
                    : fieldsState.payType === 'Salary range' && (fieldsState.salaryMin || fieldsState.salaryMax)
                    ? `${fieldsState.salaryMin ? Number(fieldsState.salaryMin).toLocaleString() : ''} - ${fieldsState.salaryMax ? Number(fieldsState.salaryMax).toLocaleString() : ''} ${currency}`
                    : (fieldsState.salary || fieldsState.price)
                    ? `${Number(fieldsState.salary || fieldsState.price).toLocaleString()} ${currency}`
                    : (t('not_specified') || 'Not specified')}
                </span>
              </div>

              {/* 6. Pay Type / Pay Period */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {t('pay_type_period_label') || 'Pay Type / Pay Period'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {(fieldsState.payType || 'Fixed amount')} &bull; {(fieldsState.payPeriod || 'Per month')}
                </span>
              </div>

              {/* 7. Description */}
              <div className="pt-2 border-t border-[#22242E] sm:col-span-2">
                <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1">
                  7. {t('descLabel') || 'Description'}
                </span>
                <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed bg-[#0A0A0C]/40 p-3 rounded-xl border border-[#22242E]/60 max-h-40 overflow-y-auto">
                  {fieldsState.description || t('noDesc') || 'No description provided'}
                </p>
              </div>

              {/* 8. Application Deadline */}
              {(fieldsState.applicationDeadline || fieldsState.deadline) && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('deadline') || 'Application Deadline'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {fieldsState.applicationDeadline || fieldsState.deadline}
                  </span>
                </div>
              )}

              {/* 9. Application Method */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  {t('application_method_label') || 'Application Method'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.applicationMethod || 'Apply through SOF-UMER'}
                </span>
              </div>

              {/* 10. Application Contact */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E] sm:col-span-2">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  10. {t('app_contact_label') || 'Application Contact'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.applicationContact || (fieldsState.applicationMethod === 'Apply through SOF-UMER' ? (t('sofumer_app_contact') || 'Direct in-app application') : (fieldsState.contactPhone || t('not_specified') || 'Not specified'))}
                </span>
              </div>
            </div>
          ) : majorCategory === 'Vehicles' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
              {/* 2. Brand */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  2. {t('brand') || 'Brand'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.brand || t('not_specified') || 'Not specified'}
                </span>
              </div>

              {/* 3. Model */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  3. {t('model') || 'Model'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.model || t('not_specified') || 'Not specified'}
                </span>
              </div>

              {/* 4. Year */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  4. {t('year') || 'Year'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.year || t('not_specified') || 'Not specified'}
                </span>
              </div>

              {/* 5. Condition */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  5. {t('condition') || 'Condition'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {getTranslatedCondition(fieldsState.condition || 'Used', currentLanguage) || fieldsState.condition || 'Used'}
                </span>
              </div>

              {/* 6. Location */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E] col-span-2 sm:col-span-1">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  6. {t('locLabel') || 'Location'}
                </span>
                <div className="flex items-center gap-1.5 text-white text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                  <span className="truncate">{fieldsState.location || t('noLocation') || 'Location not specified'}</span>
                </div>
              </div>

              {/* 7. Price */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  7. {t('vehicle_price_label') || 'Price'}
                </span>
                <span className="text-white text-xs font-medium truncate block font-mono text-[#F5A623]">
                  {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : (t('contactPrice') || 'Contact for Price')}
                </span>
              </div>

              {/* 8. Price Type */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  8. {t('price_type_label') || 'Price Type'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.priceType === 'Negotiable' || fieldsState.negotiable === 'Yes'
                    ? (t('price_type_negotiable') || 'Negotiable')
                    : (t('price_type_fixed') || 'Fixed Price')}
                </span>
              </div>

              {/* 9. Payment Method */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  9. {t('vehicle_payment_method_label') || 'Payment Method'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.paymentMethod === 'Bank Transfer'
                    ? (t('pay_method_bank') || 'Bank Transfer')
                    : fieldsState.paymentMethod === 'Financing Available'
                    ? (t('pay_method_financing') || 'Financing Available')
                    : (t('pay_method_cash') || fieldsState.paymentMethod || 'Cash')}
                </span>
              </div>

              {/* 10. Handover Method */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  10. {t('handover_method_label') || 'Handover Method'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.handoverMethod === 'Seller Delivery'
                    ? (t('handover_seller_delivery') || 'Seller Delivery')
                    : fieldsState.handoverMethod === 'Pickup or Delivery'
                    ? (t('handover_pickup_or_delivery') || 'Pickup or Delivery')
                    : (t('handover_buyer_pickup') || fieldsState.handoverMethod || 'Buyer Pickup')}
                </span>
              </div>

              {/* 11. Handover Location */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E] col-span-2 sm:col-span-1">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  11. {t('handover_location_label') || 'Handover Location'}
                </span>
                <span className="text-white text-xs font-medium truncate block">
                  {fieldsState.handoverLocationType === 'Different location'
                    ? (fieldsState.handoverLocation || fieldsState.location || t('not_specified') || 'Not specified')
                    : `${t('handover_loc_same') || 'Same as listing location'}${fieldsState.location ? ` (${fieldsState.location})` : ''}`}
                </span>
              </div>

              {/* 12. Delivery Fee, when applicable */}
              {(fieldsState.handoverMethod === 'Seller Delivery' || fieldsState.handoverMethod === 'Pickup or Delivery') && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E] col-span-2 sm:col-span-1">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    12. {t('delivery_fee_label') || 'Delivery Fee'}
                  </span>
                  <span className="text-white text-xs font-medium block">
                    {fieldsState.deliveryFeeType === 'Paid'
                      ? `${fieldsState.deliveryFee ? Number(fieldsState.deliveryFee).toLocaleString() : '0'} ${currency}`
                      : (t('fee_free') || 'Free')}
                  </span>
                </div>
              )}

              {/* 14. Contact Phone */}
              <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E] col-span-2 sm:col-span-1">
                <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                  14. {t('contact_phone_label') || 'Contact Phone'}
                </span>
                <div className="flex items-center gap-1.5 text-white text-xs font-mono font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span className="truncate">{fieldsState.contactPhone || '+251 91 123 4567'}</span>
                </div>
              </div>

              {/* 13. Description */}
              <div className="pt-2 border-t border-[#22242E] col-span-2 sm:col-span-3">
                <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1">
                  13. {t('descLabel') || 'Description'}
                </span>
                <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed bg-[#0A0A0C]/40 p-3 rounded-xl border border-[#22242E]/60 max-h-40 overflow-y-auto">
                  {fieldsState.description || t('noDesc') || 'No description provided'}
                </p>
              </div>
            </div>
          ) : majorCategory === 'Services' ? (
            <div className="space-y-4 my-3">
              {/* Section Header */}
              <div className="flex items-center gap-2 border-b border-[#22242E] pb-2">
                <Wrench className="w-4 h-4 text-[#F5A623]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('service_information_specs') || 'Service Information & Specifications'}
                </h4>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. Service Category */}
                {subcategory && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('wizard.step_subcategory') || 'Service Category'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                    </span>
                  </div>
                )}

                {/* 2. Base Location */}
                {fieldsState.location && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('locLabel') || 'Location'}
                    </span>
                    <div className="flex items-center gap-1.5 text-white text-xs font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                      <span className="truncate">{fieldsState.location}</span>
                    </div>
                  </div>
                )}

                {/* 3. Pricing */}
                {fieldsState.pricingType && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('pricing_type_label') || 'Pricing'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block font-mono text-[#F5A623]">
                      {fieldsState.pricingType === 'Negotiable / Get a Quote'
                        ? (t('pricing_negotiable_quote') || 'Negotiable / Get a Quote')
                        : fieldsState.pricingType === 'Price Range'
                        ? `${fieldsState.priceMin ? Number(fieldsState.priceMin).toLocaleString() : '0'} - ${fieldsState.priceMax ? Number(fieldsState.priceMax).toLocaleString() : '...'} ${currency}`
                        : fieldsState.pricingType === 'Starting From'
                        ? `${t('pricing_starting_from') || 'From'} ${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency}`
                        : fieldsState.pricingType === 'Hourly Rate'
                        ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / hr`
                        : fieldsState.pricingType === 'Daily Rate'
                        ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / day`
                        : fieldsState.pricingType === 'Project-Based'
                        ? `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency} / proj`
                        : `${fieldsState.price ? Number(fieldsState.price).toLocaleString() : '0'} ${currency}`}
                    </span>
                  </div>
                )}

                {/* 4. Service Duration */}
                {fieldsState.serviceDuration && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('service_duration_label') || 'Service Duration'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.serviceDuration}
                    </span>
                  </div>
                )}

                {/* 5. Service Location */}
                {fieldsState.serviceLocation && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('service_location_label') || 'Service Location'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.serviceLocation}
                    </span>
                  </div>
                )}

                {/* 6. Service Area / Coverage */}
                {fieldsState.serviceArea && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('service_area_label') || 'Service Area / Coverage'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.serviceArea}
                    </span>
                  </div>
                )}

                {/* 7. Availability */}
                {fieldsState.availability && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('availability') || 'Availability'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.availability}
                    </span>
                  </div>
                )}

                {/* 8. Travel / Call-Out Fee */}
                {fieldsState.travelFeeType && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('travel_fee_label') || 'Travel / Call-Out Fee'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.travelFeeType === 'Yes'
                        ? `${fieldsState.travelFee ? Number(fieldsState.travelFee).toLocaleString() : '0'} ${currency}`
                        : (t('option_no') || 'No')}
                    </span>
                  </div>
                )}

                {/* 9. Category-Specific Fields */}
                {/* Transport & Moving */}
                {fieldsState.transportType && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('transport_type_label') || 'Transport Type'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.transportType}
                    </span>
                  </div>
                )}
                {fieldsState.equipmentAvailable && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('equipment_avail_label') || 'Vehicle / Equipment'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.equipmentAvailable}
                    </span>
                  </div>
                )}
                {fieldsState.pickupDropoff && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('pickup_dropoff_label') || 'Pickup & Drop-off'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.pickupDropoff}
                    </span>
                  </div>
                )}

                {/* Education & Tutoring */}
                {fieldsState.lessonFormat && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('lesson_format_label') || 'Lesson Format'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.lessonFormat}
                    </span>
                  </div>
                )}

                {/* Photography & Media */}
                {fieldsState.serviceFormat && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('service_format_label') || 'Service Format'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.serviceFormat}
                    </span>
                  </div>
                )}

                {/* IT & Software Services */}
                {fieldsState.serviceDelivery && (
                  <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                    <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                      {t('service_delivery_label') || 'Service Delivery'}
                    </span>
                    <span className="text-white text-xs font-medium truncate block">
                      {fieldsState.serviceDelivery}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-[#22242E]">
                <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1">
                  {t('descLabel') || 'Description'}
                </span>
                <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed bg-[#0A0A0C]/40 p-3 rounded-xl border border-[#22242E]/60 max-h-40 overflow-y-auto">
                  {fieldsState.description || t('noDesc') || 'No description provided'}
                </p>
              </div>

              {/* Contact Phone */}
              {fieldsState.contactPhone && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('contact_phone_label') || 'Contact Phone'}
                  </span>
                  <div className="flex items-center gap-1.5 text-white text-xs font-mono font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{fieldsState.contactPhone}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
              {/* Condition / Furnishing */}
              {fieldsState.condition && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {isRealEstate ? (t('property_condition_status_label') || 'Condition / Furnishing') : (t('condition') || 'Condition')}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {getTranslatedFurnished(fieldsState.condition, currentLanguage) || getTranslatedCondition(fieldsState.condition, currentLanguage) || fieldsState.condition}
                  </span>
                </div>
              )}

              {/* Subcategory */}
              {subcategory && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('wizard.step_subcategory') || 'Subcategory'}
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
                    {t('purpose') || getTranslatedFieldLabel('purpose', currentLanguage) || 'Purpose'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {fieldsState.purpose === 'Rent'
                      ? (t('option_for_rent') || getTranslatedOption('Rent', currentLanguage) || 'For Rent')
                      : (t('option_for_sale') || getTranslatedOption('Sale', currentLanguage) || 'For Sale')}
                  </span>
                </div>
              )}

              {/* Brand (Vehicles & Goods) */}
              {fieldsState.brand && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('brand') || 'Brand'}
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
                    {t('model') || 'Model'}
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
                    {t('year') || 'Year'}
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
                    {t('specs_storage_label') || 'Specs'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {fieldsState.storageSpec}
                  </span>
                </div>
              )}

              {/* Selling Mode / Intent (Products & Non-Properties) */}
              {!isRealEstate && !['Jobs', 'Vehicles', 'Services'].includes(majorCategory) && (sellingType || fieldsState.sellingMode) && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('selling_type_intent_label') || 'Selling Mode'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {sellingType === 'Retail' ? (t('selling_type_opt_a') || 'Single Units (Retail)') : 
                     sellingType === 'Wholesale' ? (t('selling_type_opt_b') || 'Bulk Only (Wholesale)') : 
                     sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale' ? (t('selling_type_opt_c') || 'Dual Pricing (Retail + Bulk)') :
                     fieldsState.sellingMode || sellingType}
                  </span>
                </div>
              )}

              {/* Available Stock */}
              {!isRealEstate && !['Jobs', 'Vehicles', 'Services'].includes(majorCategory) && fieldsState.stockQuantity !== undefined && fieldsState.stockQuantity !== '' && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('available_stock_qty_label') || 'Available Stock'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {fieldsState.stockQuantity} {getLocalizedUnit(fieldsState.unit || 'Units', currentLanguage, Number(fieldsState.stockQuantity) || 1)}
                  </span>
                </div>
              )}

              {/* Minimum Order Quantity (MOQ) */}
              {!isRealEstate && !['Jobs', 'Vehicles', 'Services'].includes(majorCategory) && (sellingType === 'Wholesale' || sellingType === 'Retail + Wholesale' || fieldsState.minimumOrderQuantity) && (
                <div className="bg-[#1A1B22] p-2.5 rounded-xl border border-[#22242E]">
                  <span className="text-[#F5A623] text-[10px] font-semibold uppercase block mb-0.5 tracking-wider">
                    {t('wholesale_moq_label') || 'Min. Order (MOQ)'}
                  </span>
                  <span className="text-white text-xs font-medium truncate block">
                    {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 10), fieldsState.unit || 'Piece')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3. DESCRIPTION & LOGISTICS PREVIEW */}
          {/* Configured Delivery & Logistics Preferences (Non-Properties) */}
          {!isRealEstate && !['Jobs', 'Vehicles', 'Services'].includes(majorCategory) && deliveryOptions.length > 0 && (
            <div className="pt-2 border-t border-[#22242E]">
              <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1.5">
                {t('wholesale.delivery_options') || 'Delivery & Logistics Options'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {deliveryOptions.map((opt: string) => {
                  const localizedDelTitle = opt === 'Store/Warehouse Pickup' 
                    ? (t('del_store_pickup') || opt)
                    : opt === 'Local City Delivery'
                    ? (t('del_local_delivery') || opt)
                    : opt === 'Freight Shipping'
                    ? (t('del_nationwide_freight') || opt)
                    : opt;
                  return (
                    <span key={opt} className="bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>{localizedDelTitle}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Description text (Non-Jobs, Non-Vehicles & Non-Services only; Jobs, Vehicles & Services display Description in their ordered lists) */}
          {majorCategory !== 'Jobs' && majorCategory !== 'Vehicles' && majorCategory !== 'Services' && (
            <div className="pt-2 border-t border-[#22242E]">
              <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-wider block mb-1">
                {t('descLabel') || 'Description'}
              </span>
              <p className="text-xs text-white/70 whitespace-pre-line leading-relaxed bg-[#0A0A0C]/40 p-3 rounded-xl border border-[#22242E]/60 max-h-36 overflow-y-auto">
                {fieldsState.description || t('noDesc') || 'No description provided'}
              </p>
            </div>
          )}

          {/* Seller / Employer Info Badge */}
          {majorCategory !== 'Jobs' && majorCategory !== 'Vehicles' && majorCategory !== 'Services' ? (
            <div className="bg-[#1A1B22] p-3 rounded-xl border border-[#22242E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#F5A623]" />
                <span className="text-white/80 font-medium">{fieldsState.ownerName || currentUser?.fullName || t('seller') || 'Seller'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F5A623] font-mono font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>{fieldsState.contactPhone || '+251 91 123 4567'}</span>
              </div>
            </div>
          ) : (fieldsState.ownerName && (currentUser?.role === 'admin' || currentUser?.isAdmin)) ? (
            <div className="bg-[#1A1B22] p-3 rounded-xl border border-[#22242E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#F5A623]" />
                <span className="text-white/80 font-medium">{majorCategory === 'Jobs' ? (t('employerNameLabel') || 'Employer') : majorCategory === 'Services' ? (t('ownerNameLabel') || 'Service Provider') : (t('ownerNameLabel') || 'Owner')}: {fieldsState.ownerName}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Promotional Boost Packages & Monetization Flow */}
      <div className="max-w-xl mx-auto space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            {t('promotion_packages_title') || 'Promotion & Visibility Packages'}
          </span>
          <span className="text-[11px] text-white/50 font-mono">
            {selectedPackage?.price === 0 ? (t('standard_listing_badge') || 'Standard Listing') : `${selectedPackage?.price} ETB Boost`}
          </span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed -mt-1">
          {t('promotion_packages_desc') || 'Spotlight your listing on top of searches and homepage feeds, or publish as a standard listing.'}
        </p>

        {/* 1. CONDITIONAL FREE LISTING CAMPAIGN CARD (HIDE WHEN ADMIN TOGGLE IS OFF) */}
        {safeAdminSettings?.freeListingCampaign?.enabled && (
          <div 
            onClick={() => setSelectedPackage({ id: 'free', price: 0, name: t('free_listing_standard') || 'Free Listing / Standard' })}
            className={`p-4 rounded-xl border cursor-pointer mb-3 transition-all ${
              selectedPackage?.id === 'free' ? 'border-[#F5A623] bg-[#1A1B22]' : 'border-[#22242E] bg-[#141418]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold bg-[#F5A623]/20 text-[#F5A623] px-2 py-0.5 rounded">
                {t('campaign_active_badge') || 'CAMPAIGN ACTIVE'}
              </span>
              <span className="text-xs text-gray-400">
                {(t('campaign_ends_at') || 'Ends: {date}').replace('{date}', safeAdminSettings.freeListingCampaign.endDate)}
              </span>
            </div>
            <div className="text-white font-bold text-sm mt-1">
              {t('free_listing_standard') || 'Free Listing / Standard'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {(t('max_free_listings_allowed') || 'Max free listings allowed per user: {count}').replace('{count}', String(safeAdminSettings.freeListingCampaign.maxListings || 30))}
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
                      {t('manual_payment_verification_title') || 'Manual Payment Verification'}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {t('live_admin_methods_badge') || 'Live Admin Methods'}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/60">
                    {(t('selected_package_summary') || 'Selected: {name} ({duration})').replace('{name}', selectedPackage.name).replace('{duration}', selectedPackage.duration)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black font-mono text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-lg border border-[#F5A623]/20 block">
                  {selectedPackage.price} ETB
                </span>
                <span className="text-[10px] text-white/40 font-mono mt-0.5 block">
                  {t('total_payable_label') || 'Total Payable'}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              {(t('manual_payment_instruction_text') || 'Transfer the exact package amount ({price} ETB) to any of our official admin-configured accounts below via Mobile Banking or Branch Deposit, then attach your transaction reference or receipt screenshot:').replace('{price}', selectedPackage.price)}
            </p>

            {/* Official Accounts Cards */}
            {activeMethods.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block font-mono">
                    {(t('select_transfer_account_label') || 'Select Transfer Account ({count} Active):').replace('{count}', String(activeMethods.length))}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {t('click_to_select_account_hint') || 'Click to select account'}
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
                            {t('active') || 'Active'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div>
                            <span className="text-[10px] text-white/40 block font-mono">
                              {t('account_or_number_label') || 'Account / Number:'}
                            </span>
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
                                title={t('copy') || 'Copy Account Number'}
                              >
                                {copiedId === m.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">{t('copied') || 'Copied'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#F5A623]" />
                                    <span>{t('copy') || 'Copy'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {m.accountName && (
                            <div>
                              <span className="text-[10px] text-white/40 block font-mono">
                                {t('account_holder_label') || 'Account Holder:'}
                              </span>
                              <span className="text-xs text-white/80 font-medium truncate block mt-0.5">
                                {m.accountName}
                              </span>
                            </div>
                          )}

                          {m.phoneNumber && (
                            <div className="sm:col-span-2 flex items-center gap-1.5 text-[11px] text-white/60 pt-0.5">
                              <Phone className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                              <span className="font-mono">{t('support_hotline_label') || 'Hotline / Support:'} <strong className="text-white">{m.phoneNumber}</strong></span>
                            </div>
                          )}
                        </div>

                        {m.instructions && (
                          <div className="text-[11px] text-white/70 bg-white/[0.02] p-2 rounded-lg border border-white/5 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-[#F5A623] font-bold shrink-0 font-mono text-[10px] uppercase">
                              {t('payment_instructions_label') || 'Instructions:'}
                            </span>
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
                {t('no_payment_methods') || 'No active manual payment methods found in admin configuration. Please contact admin.'}
              </div>
            )}

            {/* Receipt Reference and File Upload */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block font-mono mb-2">
                {t('submit_payment_verification_label') || 'Submit Payment Verification:'}
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
              <span>{t('publishing_progress') || 'Publishing Listing...'}</span>
            </>
          ) : (
            selectedPackage?.price > 0 
              ? (showManualPaymentModal
                  ? (t('submit_receipt_and_publish_btn') || 'SUBMIT PAYMENT RECEIPT & PUBLISH ({price} ETB)').replace('{price}', String(selectedPackage.price))
                  : (t('proceed_to_payment_btn') || 'PROCEED TO PAYMENT'))
              : (t('Publish Listing') || 'PUBLISH LISTING NOW')
          )}
        </button>

        {selectedPackage?.price > 0 && showManualPaymentModal && (
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              type="button"
              onClick={() => setShowManualPaymentModal(false)}
              className="text-white/60 hover:text-white cursor-pointer font-medium"
            >
              {t('change_boost_package_btn') || '🡠 Change Boost Package'}
            </button>
            {safeAdminSettings?.freeListingCampaign?.enabled && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPackage({ id: 'free', price: 0, name: t('free_listing_standard') || 'Free Listing / Standard' });
                  setShowManualPaymentModal(false);
                }}
                className="text-[#F5A623] hover:underline cursor-pointer font-medium"
              >
                {t('switch_to_free_listing_btn') || 'Switch to Free Listing (0 ETB)'}
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
            {t('back_to_pricing_btn') || '🡠 Back to Pricing'}
          </button>
        </div>
      </div>
    </div>
  );
};
