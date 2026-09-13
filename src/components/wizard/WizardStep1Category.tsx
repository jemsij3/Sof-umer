import React from 'react';
import { 
  Building, Car, ShoppingBag, Briefcase, Wrench, Store, Tag, Package, Layers, Check 
} from 'lucide-react';
import { NormalizedSellingType } from '../../utils/wholesalePricing';
import { getTranslatedCategoryName, getTranslatedSubcategoryName } from '../../lib/categoriesData';
import { SUBCATEGORIES } from '../CreateListingModal';

export const CATEGORY_ITEMS = [
  { id: 'Properties', name: 'Real Estate / Properties', icon: Building },
  { id: 'Vehicles', name: 'Vehicles & Motors', icon: Car },
  { id: 'Products', name: 'Products & Goods', icon: ShoppingBag },
  { id: 'Services', name: 'Services & Trades', icon: Wrench },
  { id: 'Jobs', name: 'Jobs & Hiring', icon: Briefcase },
  { id: 'Local Businesses', name: 'Local Business', icon: Store }
];

interface WizardStep1CategoryProps {
  majorCategory: string;
  setMajorCategory: (cat: any) => void;
  subcategory: string;
  setSubcategory: (sub: string) => void;
  sellingType: NormalizedSellingType;
  onSelectSellingType: (type: NormalizedSellingType) => void;
  currentLanguage: string;
}

export const WizardStep1Category: React.FC<WizardStep1CategoryProps> = ({
  majorCategory,
  setMajorCategory,
  subcategory,
  setSubcategory,
  sellingType,
  onSelectSellingType,
  currentLanguage
}) => {
  const currentSubs = SUBCATEGORIES[majorCategory as keyof typeof SUBCATEGORIES] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Category Grid */}
      <div className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-widest">
            1. Select Main Category *
          </label>
          <span className="text-[11px] font-semibold text-[#C06853] bg-[#C06853]/10 px-2.5 py-0.5 rounded-full border border-[#C06853]/20">
            {majorCategory}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORY_ITEMS.map(cat => {
            const Icon = cat.icon;
            const isActive = majorCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setMajorCategory(cat.id);
                  const subs = SUBCATEGORIES[cat.id as keyof typeof SUBCATEGORIES];
                  if (subs && subs.length > 0) {
                    setSubcategory(subs[0].id);
                  }
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#C06853]/10 border-[#C06853] text-[#C06853] font-bold shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#C06853]' : 'text-stone-500'}`} />
                <span className="text-[11px] truncate w-full text-center font-medium">
                  {getTranslatedCategoryName(cat.name, currentLanguage)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategory Dropdown */}
        {currentSubs.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Subcategory ({majorCategory}) *
            </label>
            <select
              value={subcategory}
              onChange={e => setSubcategory(e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
            >
              {currentSubs.map(sub => (
                <option key={sub.id} value={sub.id} className="bg-white text-stone-900">
                  {getTranslatedSubcategoryName(sub.name, currentLanguage)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Selling Intent Radio Group (Hidden for Real Estate/Properties) */}
      {majorCategory !== 'Properties' && (
        <div className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
              2. Selling Intent / Mode *
            </label>
            <span className="text-[10px] text-stone-500 font-medium">Select how you want to sell</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                type: 'Retail' as const,
                title: 'Option A: Single Units (Retail)',
                badge: 'Retail Buyers',
                subtitle: 'Sell individual pieces directly to consumers at a standard fixed unit retail price.',
                icon: Tag
              },
              {
                type: 'Wholesale' as const,
                title: 'Option B: Bulk Only (Wholesale / MOQ)',
                badge: 'B2B Wholesale',
                subtitle: 'B2B bulk orders with minimum order quantities (MOQ >= 10) and tiered volume discounts.',
                icon: Package
              },
              {
                type: 'Retail + Wholesale' as const,
                title: 'Option C: Dual Pricing (Retail & Wholesale)',
                badge: 'Highest Reach',
                subtitle: 'Sell single units to retail buyers AND offer tiered bulk discounts to wholesale buyers.',
                icon: Layers
              }
            ].map(opt => {
              const isSelected = sellingType === opt.type;
              const OptIcon = opt.icon;
              return (
                <div
                  key={opt.type}
                  onClick={() => onSelectSellingType(opt.type)}
                  role="button"
                  tabIndex={0}
                  className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#C06853]/5 border-[#C06853] text-stone-900 shadow-sm ring-2 ring-[#C06853]/20'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#C06853] text-white rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#C06853] text-white' : 'bg-stone-200/70 text-stone-700'}`}>
                        <OptIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C06853] bg-[#C06853]/10 px-2 py-0.5 rounded-full border border-[#C06853]/20">
                        {opt.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-stone-600 leading-snug">{opt.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
