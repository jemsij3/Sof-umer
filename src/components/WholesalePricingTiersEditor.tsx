import React from 'react';
import { WholesalePriceTier } from '../types';
import { Plus, Trash2, AlertCircle, TrendingDown, Layers, HelpCircle } from 'lucide-react';
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
  tiers,
  onTiersChange,
  onChange,
  currency,
  unit,
  isRetailAndWholesale = false
}) => {
  // Determine effective MOQ from passed props or tiers
  const derivedMoq = (moq !== undefined && moq !== '') 
    ? Number(moq) 
    : ((initialMoq !== undefined && initialMoq !== '') 
      ? Number(initialMoq) 
      : (tiers[0]?.minimumQuantity ? Number(tiers[0].minimumQuantity) : 10));

  const effectiveMoq = Math.max(1, derivedMoq || 1);

  const handleMoqChange = (newMoqVal: number) => {
    const val = Math.max(1, newMoqVal || 1);
    if (onMoqChange) onMoqChange(val);

    // If there are tiers, ensure the first tier's quantity starts at the new MOQ
    const updated = [...tiers];
    if (updated.length > 0) {
      updated[0] = { ...updated[0], minimumQuantity: val };
    } else {
      updated.push({ minimumQuantity: val, pricePerUnit: 0 });
    }
    if (onTiersChange) onTiersChange(updated);
    if (onChange) onChange(val, updated);
  };

  const handleAddTier = () => {
    if (tiers.length === 0) {
      const newTiers = [{ minimumQuantity: effectiveMoq, pricePerUnit: 0 }];
      if (onTiersChange) onTiersChange(newTiers);
      if (onChange) onChange(effectiveMoq, newTiers);
      return;
    }

    const lastTier = tiers[tiers.length - 1];
    const prevQty = Number(lastTier.minimumQuantity) || effectiveMoq;
    // Suggest a logical next quantity threshold
    const nextQty = prevQty < 50 ? prevQty + 20 : prevQty < 200 ? prevQty + 50 : prevQty * 2;
    // Suggest a slightly lower price if previous price is set
    const prevPrice = Number(lastTier.pricePerUnit) || 0;
    const nextPrice = prevPrice > 0 ? Math.max(1, Math.round(prevPrice * 0.9)) : 0;

    const newTiers = [
      ...tiers,
      { minimumQuantity: nextQty, pricePerUnit: nextPrice }
    ];
    if (onTiersChange) onTiersChange(newTiers);
    if (onChange) onChange(effectiveMoq, newTiers);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return; // Keep at least one tier
    const updated = tiers.filter((_, i) => i !== index);
    if (onTiersChange) onTiersChange(updated);
    if (onChange) onChange(effectiveMoq, updated);
  };

  const handleTierQuantityChange = (index: number, newQty: number) => {
    const updated = [...tiers];
    const cleanQty = Math.max(1, newQty || 1);
    updated[index] = { ...updated[index], minimumQuantity: cleanQty };

    // If the first tier was changed, sync MOQ with it
    let newMoq = effectiveMoq;
    if (index === 0) {
      newMoq = cleanQty;
      if (onMoqChange) onMoqChange(cleanQty);
    }

    if (onTiersChange) onTiersChange(updated);
    if (onChange) onChange(newMoq, updated);
  };

  const handleTierPriceChange = (index: number, newPrice: number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], pricePerUnit: Math.max(0, newPrice || 0) };
    if (onTiersChange) onTiersChange(updated);
    if (onChange) onChange(effectiveMoq, updated);
  };

  // Run validation
  const validation = validateWholesaleConfig(effectiveMoq, tiers);

  // Pluralized unit helpers
  const unitSingular = getPluralizedUnit(1, unit);
  const unitPlural = getPluralizedUnit(2, unit);

  return (
    <div className="bg-[#10101a] border border-amber-500/25 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Wholesale Pricing & Quantity Tiers
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

      {/* MOQ Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-white mb-1">
            Minimum Order Quantity (MOQ) *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={effectiveMoq}
              onChange={e => handleMoqChange(parseInt(e.target.value, 10) || 1)}
              placeholder="e.g. 10"
              className="w-full bg-[#181826] border border-white/10 text-white font-mono text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40">
              {getPluralizedUnit(effectiveMoq, unit)}
            </span>
          </div>
          <p className="text-[11px] text-white/50 mt-1 font-medium">
            {isRetailAndWholesale
              ? `Orders of ${effectiveMoq}+ ${getPluralizedUnit(effectiveMoq, unit)} qualify for wholesale pricing. Smaller orders use standard retail price.`
              : `Buyers must purchase at least ${effectiveMoq} ${getPluralizedUnit(effectiveMoq, unit)}.`}
          </p>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-center text-xs">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            Pricing Strategy
          </span>
          <p className="text-white/70 text-[11px] leading-relaxed">
            Wholesale pricing is quantity-based. Lower prices at higher volumes incentivize bulk orders.
          </p>
        </div>
      </div>

      {/* Pricing Tiers Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Wholesale Pricing Tiers</span>
            <span className="text-[10px] text-amber-400/80 font-normal font-mono">
              ({tiers.length} {tiers.length === 1 ? 'tier' : 'tiers'})
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
              {tiers.map((tier, idx) => {
                const isFirst = idx === 0;
                const prevTier = idx > 0 ? tiers[idx - 1] : null;
                const nextTier = idx < tiers.length - 1 ? tiers[idx + 1] : null;
                const hasOrderError = prevTier && Number(tier.minimumQuantity) <= Number(prevTier.minimumQuantity);

                // Calculate display range
                const minQ = Number(tier.minimumQuantity);
                const maxQ = nextTier ? Number(nextTier.minimumQuantity) - 1 : null;
                const rangeLabel = maxQ && maxQ >= minQ
                  ? `${minQ} – ${maxQ} ${getPluralizedUnit(maxQ, unit)}`
                  : `${minQ}+ ${getPluralizedUnit(minQ, unit)}`;

                return (
                  <tr key={idx} className={hasOrderError ? 'bg-rose-500/10' : 'hover:bg-white/[0.02]'}>
                    <td className="py-3 px-3 font-mono font-bold text-white/70">
                      #{idx + 1}
                      {isFirst && (
                        <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                          Base MOQ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={tier.minimumQuantity}
                          onChange={e => handleTierQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                          className={`w-24 bg-black/60 border ${hasOrderError ? 'border-rose-500 text-rose-300' : 'border-white/15 text-white'} rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500`}
                        />
                        <span className="text-[11px] text-white/40">+{unitPlural}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-amber-400/90 font-medium">
                      {rangeLabel}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={tier.pricePerUnit || ''}
                          onChange={e => handleTierPriceChange(idx, parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 1200"
                          className="w-32 bg-black/60 border border-white/15 text-amber-400 font-mono font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                        <span className="text-[11px] text-white/40">{currency}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {tiers.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Remove tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/30 italic">Required</span>
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
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validation.error}</span>
          </div>
        )}

        <div className="text-[10px] text-white/40 flex items-center gap-1 pt-1">
          <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            Example: 10 units = 1,200 ETB each, 50 units = 1,050 ETB each, 100 units = 950 ETB each.
          </span>
        </div>
      </div>
    </div>
  );
};
