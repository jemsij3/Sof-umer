import React, { useState, useEffect } from 'react';
import { WholesalePriceTier } from '../types';
import { Plus, Trash2, AlertCircle, TrendingDown, Layers, HelpCircle, Lock } from 'lucide-react';
import { validateWholesaleConfig, getPluralizedUnit, getLocalizedUnit } from '../utils/wholesalePricing';
import { useApp } from '../lib/AppContext';

export interface WholesalePricingTiersEditorProps {
  moq?: number | string;
  initialMoq?: number | string;
  onMoqChange?: (moq: number) => void;
  tiers: WholesalePriceTier[];
  onTiersChange?: (tiers: WholesalePriceTier[]) => void;
  onChange?: (moq: number, tiers: WholesalePriceTier[]) => void;
  currency: string;
  unit: string;
  isRetailAndWholesale?: boolean;
}

export const WholesalePricingTiersEditor: React.FC<WholesalePricingTiersEditorProps> = ({
  moq,
  initialMoq,
  onMoqChange,
  tiers = [],
  onTiersChange,
  onChange,
  currency,
  unit,
  isRetailAndWholesale = false
}) => {
  const { t, currentLanguage } = useApp();
  // Resolve starting MOQ (defaults to 1 for standard new listings if unspecified)
  const resolveStartingMoq = (): number => {
    if (moq !== undefined && moq !== null && moq !== '') {
      const parsed = Number(moq);
      if (!isNaN(parsed) && parsed >= 1) return Math.floor(parsed);
    }
    if (initialMoq !== undefined && initialMoq !== null && initialMoq !== '') {
      const parsed = Number(initialMoq);
      if (!isNaN(parsed) && parsed >= 1) return Math.floor(parsed);
    }
    if (tiers.length > 0 && tiers[0]?.minimumQuantity) {
      const parsed = Number(tiers[0].minimumQuantity);
      if (!isNaN(parsed) && parsed >= 1) return Math.floor(parsed);
    }
    return 1;
  };

  // Local state for the MOQ text input to allow free typing/clearing without UI fighting back
  const [moqInputStr, setMoqInputStr] = useState<string>(() => String(resolveStartingMoq()));

  // Active numeric MOQ value derived from valid input or resolved prop
  const currentMoqNum = (() => {
    const parsed = parseInt(moqInputStr.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1) {
      return parsed;
    }
    return resolveStartingMoq();
  })();

  // Keep local MOQ string in sync when external moq prop changes (e.g. form load or reset)
  useEffect(() => {
    if (moq !== undefined && moq !== null && moq !== '') {
      const propNum = Number(moq);
      if (!isNaN(propNum) && propNum >= 1) {
        const currentInputParsed = parseInt(moqInputStr.trim(), 10);
        if (currentInputParsed !== propNum) {
          setMoqInputStr(String(propNum));
        }
      }
    }
  }, [moq]);

  // Centralized change dispatcher ensuring Tier #1 minimumQuantity ALWAYS derives from MOQ
  const dispatchChanges = (newMoq: number, baseTiers: WholesalePriceTier[]) => {
    const cleanMoq = Math.max(1, Math.floor(newMoq));
    
    // Ensure Tier #1 exists and its minimum quantity matches newMoq
    let synchronizedTiers: WholesalePriceTier[];
    if (baseTiers.length === 0) {
      synchronizedTiers = [{ minimumQuantity: cleanMoq, pricePerUnit: 0 }];
    } else {
      synchronizedTiers = baseTiers.map((t, idx) => 
        idx === 0 ? { ...t, minimumQuantity: cleanMoq } : { ...t }
      );
    }

    if (onChange) {
      onChange(cleanMoq, synchronizedTiers);
    } else {
      if (onMoqChange) onMoqChange(cleanMoq);
      if (onTiersChange) onTiersChange(synchronizedTiers);
    }
  };

  // Handle typing in the MOQ input field
  const handleMoqInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setMoqInputStr(rawVal);

    // If user temporarily cleared the input (empty string), do NOT force '1'
    if (rawVal.trim() === '') {
      return;
    }

    const parsed = parseInt(rawVal.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1) {
      // Valid positive whole number: automatically update Tier #1 to match
      dispatchChanges(parsed, tiers);
    }
  };

  // Handle blur on the MOQ input: validate and clean up formatting
  const handleMoqBlur = () => {
    const parsed = parseInt(moqInputStr.trim(), 10);
    if (isNaN(parsed) || parsed < 1) {
      // Reset to current valid MOQ if left blank or invalid
      const fallback = Math.max(1, currentMoqNum);
      setMoqInputStr(String(fallback));
      dispatchChanges(fallback, tiers);
    } else {
      // Format cleanly (e.g. strips leading zeroes like "026" -> "26")
      setMoqInputStr(String(parsed));
      dispatchChanges(parsed, tiers);
    }
  };

  // Add a new wholesale pricing tier
  const handleAddTier = () => {
    // If no tiers exist, start with Tier #1 derived from current MOQ
    if (tiers.length === 0) {
      dispatchChanges(currentMoqNum, [{ minimumQuantity: currentMoqNum, pricePerUnit: 0 }]);
      return;
    }

    const lastTier = tiers[tiers.length - 1];
    const prevQty = Number(lastTier.minimumQuantity) || currentMoqNum;
    
    // Suggest a logical next quantity threshold strictly greater than the previous tier
    let nextQty = prevQty < 50 ? 50 : prevQty < 100 ? 100 : prevQty < 500 ? prevQty + 50 : prevQty * 2;
    if (nextQty <= prevQty) {
      nextQty = prevQty + 10;
    }

    // Suggest a slightly discounted unit price if previous price was entered
    const prevPrice = Number(lastTier.pricePerUnit) || 0;
    const nextPrice = prevPrice > 0 ? Math.max(1, Math.round(prevPrice * 0.9)) : 0;

    const newTiers = [
      ...tiers.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: currentMoqNum } : { ...t }),
      { minimumQuantity: nextQty, pricePerUnit: nextPrice }
    ];

    dispatchChanges(currentMoqNum, newTiers);
  };

  // Remove an additional tier (Tier #1 is permanent / required)
  const handleRemoveTier = (index: number) => {
    if (index === 0 || tiers.length <= 1) return; // Cannot delete Tier #1 ({t('base_moq')})
    const updated = tiers.filter((_, i) => i !== index);
    dispatchChanges(currentMoqNum, updated);
  };

  // Edit quantity for additional tiers (Tier #2, #3, etc.)
  const handleAdditionalTierQtyChange = (index: number, rawVal: string) => {
    if (index === 0) return; // Tier #1 is strictly derived from MOQ

    const updated = tiers.map((t, idx) => {
      if (idx === 0) return { ...t, minimumQuantity: currentMoqNum };
      if (idx === index) {
        const parsed = parseInt(rawVal, 10);
        return { ...t, minimumQuantity: isNaN(parsed) ? (rawVal as any) : parsed };
      }
      return { ...t };
    });

    if (onChange) {
      onChange(currentMoqNum, updated);
    } else {
      if (onTiersChange) onTiersChange(updated);
    }
  };

  // Edit price per unit for any tier (including Tier #1)
  const handleTierPriceChange = (index: number, rawVal: string) => {
    const parsedPrice = parseFloat(rawVal);
    const cleanPrice = isNaN(parsedPrice) ? 0 : Math.max(0, parsedPrice);

    const updated = (tiers.length > 0 ? tiers : [{ minimumQuantity: currentMoqNum, pricePerUnit: 0 }]).map((t, idx) => {
      if (idx === 0 && index !== 0) {
        return { ...t, minimumQuantity: currentMoqNum };
      }
      if (idx === index) {
        return { ...t, pricePerUnit: cleanPrice, minimumQuantity: idx === 0 ? currentMoqNum : t.minimumQuantity };
      }
      return { ...t };
    });

    if (onChange) {
      onChange(currentMoqNum, updated);
    } else {
      if (onTiersChange) onTiersChange(updated);
    }
  };

  // Ensure tiers array always has at least Tier #1 synchronized with current MOQ
  const normalizedTiers = tiers.length > 0
    ? tiers.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: currentMoqNum } : t)
    : [{ minimumQuantity: currentMoqNum, pricePerUnit: 0 }];

  // Validation
  const validation = validateWholesaleConfig(currentMoqNum, normalizedTiers);

  // Pluralized unit helpers
  const unitSingular = getPluralizedUnit(1, unit);
  const unitPlural = getPluralizedUnit(2, unit);
  const moqUnitLabel = getPluralizedUnit(currentMoqNum, unit);

  // Check if input is temporarily empty or invalid for instant visual warning
  const isInputEmpty = moqInputStr.trim() === '';
  const parsedInputMoq = parseInt(moqInputStr.trim(), 10);
  const isMoqInvalid = isInputEmpty || isNaN(parsedInputMoq) || parsedInputMoq < 1;

  return (
    <div className="bg-[#F8F7F4] border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C06853]/10 text-[#C06853] rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#C06853] uppercase tracking-wider block">
              {t('wholesale_pricing_quantity_tiers')}
            </span>
            <span className="text-[11px] text-stone-500">
              {t('set_volume_discount_tiers_desc')}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-[#C06853]/10 text-[#C06853] border border-[#C06853]/20 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          {t('unit_of_sale')}: {getLocalizedUnit(unitSingular, currentLanguage, 1)}
        </span>
      </div>

      {/* MOQ Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1">
            {t('wholesale.minimum_order_quantity')} *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={moqInputStr}
              onChange={handleMoqInputChange}
              onBlur={handleMoqBlur}
              placeholder="e.g. 26"
              className={`w-full bg-white border ${isMoqInvalid ? 'border-rose-500 text-rose-600' : 'border-stone-200 text-stone-900'} font-mono text-sm rounded-xl px-3.5 py-2.5 pr-20 focus:outline-none focus:border-[#C06853] transition shadow-xs`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 pointer-events-none select-none">
              {getLocalizedUnit(moqUnitLabel, currentLanguage, currentMoqNum)}
            </span>
          </div>

          {/* Dynamic buyer purchase message */}
          <p className="text-[11px] text-stone-600 mt-1.5 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C06853] shrink-0 inline-block" />
            {isRetailAndWholesale
              ? (t('wholesale.qualify_wholesale_pricing', { quantity: currentMoqNum, unit: getLocalizedUnit(unit, currentLanguage, currentMoqNum) }) || `Orders of ${currentMoqNum}+ ${moqUnitLabel} qualify for wholesale pricing. Smaller orders use standard retail price.`)
              : (t('wholesale.buyers_must_purchase', { quantity: currentMoqNum, unit: getLocalizedUnit(unit, currentLanguage, currentMoqNum) }) || `Buyers must purchase at least ${currentMoqNum} ${moqUnitLabel}.`)}
          </p>

          {isMoqInvalid && (
            <p className="text-[10px] text-rose-600 font-semibold mt-1">
              {t('wholesale.moq_invalid')}
            </p>
          )}
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col justify-center text-xs shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            {t('pricing_strategy')}
          </span>
          <p className="text-stone-600 text-[11px] leading-relaxed">
            {t('set_volume_discount_tiers_desc')}
          </p>
        </div>
      </div>

      {/* Mobile-First Tier Cards (Replaces Squeezed Horizontal Table) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <span>{t('wholesale_pricing_quantity_tiers')}</span>
            <span className="text-[10px] text-[#C06853] font-normal font-mono">
              ({normalizedTiers.length} {normalizedTiers.length === 1 ? (t('wholesale.tier') || 'tier') : (t('wholesale.tiers') || 'tiers')})
            </span>
          </label>
        </div>

        <div className="space-y-2.5">
          {normalizedTiers.map((tier, idx) => {
            const isFirst = idx === 0;
            const prevTier = idx > 0 ? normalizedTiers[idx - 1] : null;
            const nextTier = idx < normalizedTiers.length - 1 ? normalizedTiers[idx + 1] : null;
            
            // Determine if quantity sequence has an ordering error
            const prevQty = isFirst ? 0 : (Number(prevTier?.minimumQuantity) || currentMoqNum);
            const currentQty = Number(tier.minimumQuantity);
            const hasOrderError = !isFirst && (isNaN(currentQty) || currentQty <= prevQty);

            // Automatic Effective Range calculation
            const minQ = isFirst ? currentMoqNum : currentQty;
            const nextMinQ = nextTier ? Number(nextTier.minimumQuantity) : null;
            let rangeLabel = '';
            if (nextMinQ && nextMinQ > minQ) {
              const maxQ = nextMinQ - 1;
              rangeLabel = maxQ === minQ
                ? `${minQ} ${getPluralizedUnit(minQ, unit)}`
                : `${minQ} to ${maxQ} ${getPluralizedUnit(maxQ, unit)}`;
            } else {
              rangeLabel = `${minQ}+ ${getPluralizedUnit(minQ, unit)}`;
            }

            return (
              <div 
                key={idx} 
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  hasOrderError
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-white border-stone-200 hover:border-[#C06853]/40 shadow-xs'
                }`}
              >
                {/* Top bar: Tier Title and Trash/Delete or Lock */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C06853]">
                      {isFirst ? `Tier 1 (Base MOQ)` : `Tier ${idx + 1}`}
                    </span>
                    {isFirst && (
                      <span className="text-[9px] bg-[#C06853]/10 text-[#C06853] border border-[#C06853]/20 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Base MOQ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#C06853] font-medium bg-[#C06853]/10 px-2.5 py-0.5 rounded-lg border border-[#C06853]/20">
                      {rangeLabel}
                    </span>
                    {!isFirst ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-stone-400 italic select-none">
                        {t('required')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Quantity Range */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                      {isFirst ? 'Minimum Order Quantity' : 'Starting Quantity Threshold'}
                    </label>
                    {isFirst ? (
                      <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-[#C06853] font-bold">
                        <Lock className="w-3.5 h-3.5 text-[#C06853]/70" />
                        <span>{currentMoqNum} {getPluralizedUnit(currentMoqNum, unit)}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={prevQty + 1}
                            step="1"
                            value={tier.minimumQuantity ?? ''}
                            onChange={e => handleAdditionalTierQtyChange(idx, e.target.value)}
                            placeholder={`e.g. ${prevQty + 20}`}
                            className={`w-full bg-white border ${hasOrderError ? 'border-rose-400 text-rose-600' : 'border-stone-200 text-stone-900'} rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#C06853] transition shadow-xs`}
                          />
                          <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
                            {unitPlural}
                          </span>
                        </div>
                        {hasOrderError && (
                          <span className="text-[10px] text-rose-600 font-medium block">
                            Must be &gt; {idx === 1 ? `MOQ (${currentMoqNum})` : `Tier #${idx} (${prevQty})`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                      Unit Price ({currency}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.pricePerUnit ? tier.pricePerUnit : ''}
                        onChange={e => handleTierPriceChange(idx, e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full bg-white border border-stone-200 text-stone-900 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C06853] transition pr-24 shadow-xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-stone-400 pointer-events-none select-none">
                        {currency} / {unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full-width Add Tier Button */}
        <button
          type="button"
          onClick={handleAddTier}
          className="w-full py-3 bg-[#C06853]/10 hover:bg-[#C06853]/15 text-[#C06853] border border-dashed border-[#C06853]/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Another Price Tier</span>
        </button>

        {/* Validation error display */}
        {!validation.isValid && validation.error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validation.error}</span>
          </div>
        )}

        <div className="text-[10px] text-stone-500 flex items-center gap-1.5 pt-1">
          <HelpCircle className="w-3 h-3 text-[#C06853] shrink-0" />
          <span>
            Example: 10 to 49 {unitPlural} = 1,200 {currency}, 50 to 99 {unitPlural} = 1,050 {currency}, 100+ {unitPlural} = 950 {currency}.
          </span>
        </div>
      </div>
    </div>
  );
};
