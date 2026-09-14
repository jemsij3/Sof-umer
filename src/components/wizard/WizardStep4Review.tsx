import React from 'react';
import { 
  Camera, MapPin, Phone, User as UserIcon, Sparkles, Loader2 
} from 'lucide-react';
import { NormalizedSellingType, getPluralizedUnit } from '../../utils/wholesalePricing';
import { getTranslatedCategoryName, getTranslatedSubcategoryName } from '../../lib/categoriesData';
import { WholesalePriceTier } from '../../types';
import { ReceiptUploadInput } from '../ReceiptUploadInput';

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
  const deliveryOptions: string[] = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Preview Listing Card */}
      <div className="bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl max-w-xl mx-auto">
        <div className="relative h-56 bg-zinc-800">
          <img
            src={imagesList[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'}
            alt="Listing Cover Preview"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
            {getTranslatedCategoryName(majorCategory, currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
          </div>
          {imagesList.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
              <Camera className="w-3 h-3 text-amber-400" />
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
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap break-words flex-1 text-white/90 leading-snug">
                  {fieldsState.location || 'Location not specified'}
                </span>
              </div>
            </div>
            <div className="text-right">
              {majorCategory === 'Properties' ? (
                <span className="text-lg font-extrabold text-amber-400 font-mono block">
                  {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                </span>
              ) : sellingType === 'Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-amber-400 font-mono block">
                    {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : (fieldsState.wholesalePrice ? `${Number(fieldsState.wholesalePrice).toLocaleString()} ${currency}` : 'Contact for Price')}
                    <span className="text-xs font-normal text-amber-300/80 ml-1">/ {fieldsState.unit || 'Piece'}</span>
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-bold block mt-0.5">
                    MOQ: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 10), fieldsState.unit || 'Piece')}
                  </span>
                </>
              ) : sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale' ? (
                <>
                  <span className="text-lg font-extrabold text-amber-400 font-mono block">
                    {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
                    Bulk: {wholesaleTiers[0]?.pricePerUnit ? `${Number(wholesaleTiers[0]?.pricePerUnit).toLocaleString()} ${currency}` : 'Tiered'} (MOQ: {fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10})
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-amber-400 font-mono block">
                  {fieldsState.retailPrice || fieldsState.price ? `${Number(fieldsState.retailPrice || fieldsState.price).toLocaleString()} ${currency}` : 'Contact for Price'}
                </span>
              )}
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 text-[11px]">
            {fieldsState.brand && (
              <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/80">
                Brand: <strong>{fieldsState.brand}</strong>
              </span>
            )}
            {fieldsState.model && (
              <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/80">
                Model: <strong>{fieldsState.model}</strong>
              </span>
            )}
            {fieldsState.condition && (
              <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/80">
                Condition: <strong>{fieldsState.condition}</strong>
              </span>
            )}
            {fieldsState.storageSpec && (
              <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/80">
                Specs: <strong>{fieldsState.storageSpec}</strong>
              </span>
            )}
            {majorCategory !== 'Properties' && majorCategory?.toLowerCase() !== 'properties' && fieldsState?.category !== 'properties' && deliveryOptions.map((opt: string) => (
              <span key={opt} className="bg-[#F5A623]/10 border border-[#F5A623]/20 text-[#F5A623] px-2.5 py-1 rounded-lg">
                🚚 {opt}
              </span>
            ))}
          </div>

          {/* Description snippet */}
          <div className="text-xs text-white/60 line-clamp-2 pt-1 border-t border-white/5">
            {fieldsState.description || 'No description provided'}
          </div>

          {/* Seller Info Badge */}
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span className="text-white/80 font-medium">{fieldsState.ownerName || currentUser?.fullName || 'Seller'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-mono">
              <Phone className="w-3.5 h-3.5" />
              <span>{fieldsState.contactPhone || '+251 91 123 4567'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Boost: Optional Checkbox */}
      <div className="max-w-xl mx-auto space-y-4">
        <label className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition ${
          isFeaturedAddon
            ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30'
            : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
        }`}>
          <input
            type="checkbox"
            checked={isFeaturedAddon}
            onChange={(e) => setIsFeaturedAddon(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-white/20 bg-black cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Feature this listing on top of searches (+ ETB 500)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                +500 ETB
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              Pin your listing to the top of category feeds, unlock gold VIP badge, and reach up to 10x more prospective buyers across Ethiopia.
            </p>
          </div>
        </label>

        {/* Direct Payment details if Boost is selected */}
        {isFeaturedAddon && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Monetization & Direct Payment
              </span>
              <span className="text-xs font-bold text-white font-mono">500 ETB</span>
            </div>

            <p className="text-[11px] text-white/60">
              Transfer to Telebirr or Commercial Bank of Ethiopia (CBE) and attach the receipt or transaction reference number:
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-white/80 uppercase">
                Select Payment Method *
              </label>
              <select
                value={selectedDirectMethodId}
                onChange={e => setSelectedDirectMethodId(e.target.value)}
                className="w-full p-2.5 bg-black/60 border border-white/15 focus:border-amber-500 rounded-xl text-xs text-white"
              >
                <option value="">-- Choose Payment Channel --</option>
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
            disabled={submitting || (isFeaturedAddon && !selectedDirectMethodId)}
            onClick={onPublish}
            className="w-full py-3.5 bg-amber-500 text-black font-extrabold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
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
                  {isFeaturedAddon ? '🚀 PAY 500 ETB & PUBLISH LISTING NOW' : '🚀 PUBLISH LISTING NOW'}
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
