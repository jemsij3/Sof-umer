import React from 'react';
import { ShoppingCart, Package, Boxes, Check } from 'lucide-react';
import { NormalizedSellingType } from '../utils/wholesalePricing';

interface SellingTypeSelectorProps {
  value: NormalizedSellingType;
  onChange: (type: NormalizedSellingType) => void;
  disabled?: boolean;
}

export const SellingTypeSelector: React.FC<SellingTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const options: {
    type: NormalizedSellingType;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'Retail',
      title: 'Retail',
      subtitle: 'Seller sells individual units to normal customers.',
      badge: 'Single Units',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      type: 'Wholesale',
      title: 'Wholesale',
      subtitle: 'Seller sells products in bulk.',
      badge: 'Bulk Only (MOQ)',
      icon: <Package className="w-5 h-5" />
    },
    {
      type: 'Retail + Wholesale',
      title: 'Retail + Wholesale',
      subtitle: 'Seller sells both individual units and bulk quantities.',
      badge: 'Dual Pricing',
      icon: <Boxes className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
          1. Selling Type *
        </label>
        <span className="text-[10px] text-white/40">Select how you intend to sell this item</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(opt => {
          const isSelected = value === opt.type;
          return (
            <div
              key={opt.type}
              onClick={() => !disabled && onChange(opt.type)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!disabled) onChange(opt.type);
                }
              }}
              className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                  : 'bg-[#12121e] border-white/10 text-white/70 hover:border-white/25 hover:text-white hover:bg-white/[0.02]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 text-black rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`p-2 rounded-xl transition ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{opt.title}</span>
                    </h4>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-white/60 leading-relaxed mt-2">
                  {opt.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
