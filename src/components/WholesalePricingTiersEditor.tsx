import React, { useState, useEffect } from 'react';
import { WholesalePriceTier } from '../types';
import { Plus, Trash2, AlertCircle, TrendingDown, Layers, HelpCircle, Lock } from 'lucide-react';
import { validateWholesaleConfig, getPluralizedUnit } from '../utils/wholesalePricing';

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
    if (index === 0 || tiers.length <= 1) return; // Cannot delete Tier #1 (Base MOQ)
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
    <div className="bg-[#10101a] border border-amber-500/25 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Wholesale Pricing &amp; Quantity Tiers
            </span>
            <span className="text-[11px] text-white/50">
              Set volume-based wholesale discounts. Buyers who purchase larger quantities unlock lower unit prices.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          Unit: {unitSingular}
        </span>
      </div>

      {/* MOQ Input Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-white mb-1">
            Minimum Order Quantity (MOQ) *
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
              className={`w-full bg-[#181826] border ${isMoqInvalid ? 'border-rose-500 text-rose-300' : 'border-white/10 text-white'} font-mono text-sm rounded-xl px-3.5 py-2.5 pr-20 focus:outline-none focus:border-amber-500 transition`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/50 pointer-events-none select-none">
              {moqUnitLabel}
            </span>
          </div>

          {/* Dynamic buyer purchase message */}
          <p className="text-[11px] text-white/70 mt-1.5 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 inline-block" />
            {isRetailAndWholesale
              ? `Orders of ${currentMoqNum}+ ${moqUnitLabel} qualify for wholesale pricing. Smaller orders use standard retail price.`
              : `Buyers must purchase at least ${currentMoqNum} ${moqUnitLabel}.`}
          </p>

          {isMoqInvalid && (
            <p className="text-[10px] text-rose-400 font-semibold mt-1">
              MOQ must be a positive whole number (at least 1).
            </p>
          )}
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-center text-xs">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            Pricing Strategy
          </span>
          <p className="text-white/70 text-[11px] leading-relaxed">
            Wholesale pricing is quantity-based. Lower prices at higher volumes incentivize bulk orders. The first pricing tier is automatically locked to your MOQ.
          </p>
        </div>
      </div>

      {/* Pricing Tiers Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Wholesale Pricing Tiers</span>
            <span className="text-[10px] text-amber-400/80 font-normal font-mono">
              ({normalizedTiers.length} {normalizedTiers.length === 1 ? 'tier' : 'tiers'})
            </span>
          </label>

          <button
            type="button"
            onClick={handleAddTier}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pricing Tier</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141420]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1a1a2c] text-white/60 text-[10px] font-mono uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Min. Quantity ({unitPlural})</th>
                <th className="py-2.5 px-3">Effective Range</th>
                <th className="py-2.5 px-3">Price Per Unit ({currency})</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
                    : `${minQ}–${maxQ} ${getPluralizedUnit(maxQ, unit)}`;
                } else {
                  rangeLabel = `${minQ}+ ${getPluralizedUnit(minQ, unit)}`;
                }

                return (
                  <tr key={idx} className={hasOrderError ? 'bg-rose-500/10 border-l-2 border-rose-500' : 'hover:bg-white/[0.02]'}>
                    {/* Tier Number & Base MOQ Badge */}
                    <td className="py-3 px-3 font-mono font-bold text-white/70 whitespace-nowrap">
                      #{idx + 1}
                      {isFirst && (
                        <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                          Base MOQ
                        </span>
                      )}
                    </td>

                    {/* Min. Quantity */}
                    <td className="py-3 px-3">
                      {isFirst ? (
                        /* Tier #1 is strictly derived from MOQ and NOT independently editable */
                        <div className="flex items-center gap-1.5" title="Derived directly from Minimum Order Quantity (MOQ)">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-amber-400/70" />
                            {currentMoqNum}+ {getPluralizedUnit(currentMoqNum, unit)}
                          </span>
                        </div>
                      ) : (
                        /* Additional tiers remain editable */
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={idx === 1 ? currentMoqNum + 1 : prevQty + 1}
                              step="1"
                              value={tier.minimumQuantity ?? ''}
                              onChange={e => handleAdditionalTierQtyChange(idx, e.target.value)}
                              className={`w-24 bg-black/60 border ${hasOrderError ? 'border-rose-500 text-rose-300' : 'border-white/15 text-white'} rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500`}
                            />
                            <span className="text-[11px] text-white/40">+{unitPlural}</span>
                          </div>
                          {hasOrderError && (
                            <span className="text-[10px] text-rose-400 font-medium">
                              Must be &gt; {idx === 1 ? `MOQ (${currentMoqNum})` : `Tier #${idx} (${prevQty})`}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Effective Range (Auto-calculated) */}
                    <td className="py-3 px-3 font-mono text-[11px] text-amber-400/90 font-medium whitespace-nowrap">
                      {rangeLabel}
                    </td>

                    {/* Price Per Unit (Editable for all tiers) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={tier.pricePerUnit ? tier.pricePerUnit : ''}
                          onChange={e => handleTierPriceChange(idx, e.target.value)}
                          placeholder="e.g. 1200"
                          className="w-32 bg-black/60 border border-white/15 text-amber-400 font-mono font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[11px] text-white/40">{currency}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      {idx > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Remove tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/30 italic select-none">Required</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Validation error display */}
        {!validation.isValid && validation.error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validation.error}</span>
          </div>
        )}

        <div className="text-[10px] text-white/40 flex items-center gap-1 pt-1">
          <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            Example: 26+ {unitPlural} = 1,200 {currency} each, 50+ {unitPlural} = 1,050 {currency} each, 100+ {unitPlural} = 950 {currency} each.
          </span>
        </div>
      </div>
    </div>
  );
};
