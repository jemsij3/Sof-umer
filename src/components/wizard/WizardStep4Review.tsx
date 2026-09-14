import React from 'react';
import { 
  Camera, MapPin, Phone, User as UserIcon, Sparkles, Loader2,
  BedDouble, Bath, Maximize, Truck, ShieldCheck, Tag, CreditCard, CheckCircle2
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
  currentLanguage
}) => {
  const { systemSettings } = useApp();

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

  // Dynamic Admin-Defined Promotion Packages from Context with fallback defaults
  const dynamicAdminPackages = (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
    ? systemSettings.adPackages.map(p => ({
        id: p.id || p.name.toLowerCase().replace(/\s+/g, '_'),
        name: p.name.toLowerCase().includes('boost') ? p.name : `${p.name} Boost`,
        price: Number(p.price) || 0,
        currency: p.currency || 'ETB',
        duration: p.duration || '7 days',
        desc: p.desc || `Promotional ad boost package: ${p.name}`,
        badge: p.badge || p.name.toUpperCase()
      }))
    : [
        { id: 'basic', name: 'Basic Boost', price: 49, currency: 'ETB', duration: '7 days', desc: 'Category top placement + Basic Verified Badge', badge: 'BASIC' },
        { id: 'premium', name: 'Premium Boost', price: 149, currency: 'ETB', duration: '15 days', desc: 'Featured hero slider placement + High priority ranking', badge: 'PREMIUM' },
        { id: 'vip', name: 'VIP Elite Boost', price: 399, currency: 'ETB', duration: '30 days', desc: 'Top search billboard pin + Full site promotion + Gold Badge', badge: 'VIP ELITE' }
      ];

  const adminPromotionPackages = [
    {
      id: 'free',
      name: 'Free Listing / Standard',
      price: 0,
      currency: 'ETB',
      duration: 'Standard',
      desc: 'Standard catalog listing with basic search visibility across Ethiopia',
      badge: 'FREE'
    },
    ...dynamicAdminPackages
  ];

  const [selectedPkgId, setSelectedPkgId] = React.useState<string>(() => {
    if (isFeaturedAddon) {
      const paidPkg = adminPromotionPackages.find(p => p.price > 0);
      return paidPkg ? paidPkg.id : 'basic';
    }
    return 'free';
  });

  const handleSelectPackage = (pkg: typeof adminPromotionPackages[0]) => {
    setSelectedPkgId(pkg.id);
    const isPaid = pkg.price > 0;
    setIsFeaturedAddon(isPaid);
  };

  const activePackage = adminPromotionPackages.find(p => p.id === selectedPkgId) || adminPromotionPackages[0];
  const isPaidPackage = activePackage.price > 0;

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

          {/* Dynamic Specs & Condition Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
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

      {/* Dynamic Admin Promotion Packages & Manual Payment Flow */}
      <div className="max-w-xl mx-auto space-y-4">
        {/* Promotion Packages Header */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5A623]" />
            <span>Select Promotion / Boost Package</span>
          </h4>
          <p className="text-xs text-white/60">
            Choose a promotion package to maximize your listing's visibility or proceed with standard free listing.
          </p>
        </div>

        {/* Dynamic Admin Promotion Packages Options */}
        <div className="space-y-2.5">
          {adminPromotionPackages.map((pkg) => {
            const isSelected = selectedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#141418] border-[#F5A623] shadow-lg shadow-[#F5A623]/10 ring-1 ring-[#F5A623]'
                    : 'bg-[#141418]/60 border-[#22242E] hover:border-white/20 hover:bg-[#141418]'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/30 bg-transparent'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{pkg.name}</span>
                      {pkg.badge && (
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          pkg.price === 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30'
                        }`}>
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{pkg.desc}</p>
                    <div className="text-[10px] text-white/40 font-mono pt-0.5">
                      Duration: {pkg.duration}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-extrabold block ${
                    pkg.price === 0 ? 'text-emerald-400' : 'text-[#F5A623]'
                  }`}>
                    {pkg.price === 0 ? 'FREE' : `${pkg.price} ${pkg.currency}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Payment details if a Paid Boost Package is selected */}
        {isPaidPackage && (
          <div className="p-4 rounded-2xl bg-[#141418] border border-[#F5A623]/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#22242E]">
              <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Manual Payment ({activePackage.name})</span>
              </span>
              <span className="text-xs font-bold text-[#F5A623] font-mono">
                {activePackage.price} {activePackage.currency}
              </span>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed">
              Transfer payment via Telebirr or Commercial Bank of Ethiopia (CBE) and attach the receipt or transaction reference number:
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#F5A623] uppercase tracking-wider">
                Select Payment Method *
              </label>
              <select
                value={selectedDirectMethodId}
                onChange={e => setSelectedDirectMethodId(e.target.value)}
                className="w-full p-2.5 bg-[#0A0A0C] border border-[#22242E] focus:border-[#F5A623] rounded-xl text-xs text-white outline-none transition"
              >
                <option value="">-- Choose Payment Channel (CBE / Telebirr) --</option>
                {paymentMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.accountNumber ? `(${m.accountNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <ReceiptUploadInput
              referenceNumber={receiptRefNumber}
              onReferenceChange={setReceiptRefNumber}
              onFileUploaded={data => setReceiptFileData(data)}
              onFileRemoved={() => setReceiptFileData(null)}
              uploadedFile={receiptFileData}
            />
          </div>
        )}

        {/* Final Action Button */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={submitting || (isPaidPackage && !selectedDirectMethodId)}
            onClick={onPublish}
            className="w-full py-3.5 bg-[#F5A623] text-black font-extrabold text-sm rounded-xl hover:bg-[#f5b342] disabled:opacity-50 transition cursor-pointer shadow-lg shadow-[#F5A623]/10 flex items-center justify-center gap-2"
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
                  {isPaidPackage
                    ? `🚀 PAY ${activePackage.price} ${activePackage.currency} & PUBLISH LISTING NOW`
                    : '🚀 PUBLISH LISTING NOW'}
                </span>
              </>
            )}
          </button>

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
