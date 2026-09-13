import React from 'react';
import { Tag, Package, Truck } from 'lucide-react';
import { NormalizedSellingType, STANDARD_UNITS } from '../../utils/wholesalePricing';
import { WholesalePricingTiersEditor } from '../WholesalePricingTiersEditor';
import { WholesalePriceTier } from '../../types';

interface WizardStep3PricingProps {
  majorCategory: string;
  sellingType: NormalizedSellingType;
  currency: string;
  setCurrency: (c: any) => void;
  fieldsState: Record<string, any>;
  handleFieldChange: (field: string, value: any) => void;
  wholesaleTiers: WholesalePriceTier[];
  setWholesaleTiers: React.Dispatch<React.SetStateAction<WholesalePriceTier[]>>;
}

export const WizardStep3Pricing: React.FC<WizardStep3PricingProps> = ({
  majorCategory,
  sellingType,
  currency,
  setCurrency,
  fieldsState,
  handleFieldChange,
  wholesaleTiers,
  setWholesaleTiers
}) => {
  const currentDelivery = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Currency & Base Unit */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
              Currency *
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
            >
              <option value="ETB">ETB (Ethiopian Birr)</option>
              <option value="USD">USD ($)</option>
              <option value="SAR">SAR (Saudi Riyal)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </select>
          </div>

          {majorCategory !== 'Properties' && (
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Pricing Unit *
              </label>
              <select
                value={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
                onChange={e => {
                  handleFieldChange('unit', e.target.value);
                  handleFieldChange('wholesaleUnit', e.target.value);
                }}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              >
                {STANDARD_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Real Estate Pricing */}
      {majorCategory === 'Properties' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#C06853] uppercase tracking-wider">
            Property Pricing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Property Price ({currency}) *
              </label>
              <input
                type="number"
                required
                value={fieldsState.price || ''}
                placeholder="e.g. 4500000"
                onChange={e => handleFieldChange('price', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-stone-900 focus:outline-none transition font-mono text-base font-bold shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Negotiable?
              </label>
              <select
                value={fieldsState.negotiable || 'No'}
                onChange={e => handleFieldChange('negotiable', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
              >
                <option value="No">Fixed Price (Non-negotiable)</option>
                <option value="Yes">Negotiable</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Single Units (Retail) */}
      {majorCategory !== 'Properties' && sellingType === 'Retail' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C06853]" />
            <h4 className="text-xs font-bold text-[#C06853] uppercase tracking-wider">
              Retail Pricing (Single Units)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Retail Price (per {fieldsState.unit || 'piece'}) *
              </label>
              <input
                type="number"
                required
                value={fieldsState.retailPrice || fieldsState.price || ''}
                placeholder="e.g. 1500"
                onChange={e => {
                  handleFieldChange('retailPrice', e.target.value);
                  handleFieldChange('price', e.target.value);
                }}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-stone-900 font-mono font-bold shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Available Stock Qty *
              </label>
              <input
                type="number"
                required
                value={fieldsState.availableQuantity || fieldsState.quantity || ''}
                placeholder="e.g. 25"
                onChange={e => {
                  handleFieldChange('availableQuantity', e.target.value);
                  handleFieldChange('quantity', e.target.value);
                }}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Price Negotiable?
              </label>
              <select
                value={fieldsState.negotiable || 'No'}
                onChange={e => handleFieldChange('negotiable', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
              >
                <option value="No">Fixed (No)</option>
                <option value="Yes">Negotiable (Yes)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Only (Wholesale) */}
      {majorCategory !== 'Properties' && sellingType === 'Wholesale' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C06853]" />
              <h4 className="text-xs font-bold text-[#C06853] uppercase tracking-wider">
                Wholesale Settings & Minimum Order
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Minimum Order Qty (MOQ &ge; 10) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10}
                  onChange={e => {
                    const val = Number(e.target.value);
                    handleFieldChange('minimumOrderQuantity', val);
                    setWholesaleTiers(prev => prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: val } : t));
                  }}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-stone-900 font-mono font-bold shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Available Bulk Stock
                </label>
                <input
                  type="number"
                  value={fieldsState.availableQuantity || ''}
                  placeholder="e.g. 500"
                  onChange={e => handleFieldChange('availableQuantity', e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Supplier Business Type
                </label>
                <select
                  value={fieldsState.businessType || 'Wholesaler'}
                  onChange={e => handleFieldChange('businessType', e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Importer">Importer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wholesale Tier Cards */}
          <WholesalePricingTiersEditor
            tiers={wholesaleTiers}
            onChange={setWholesaleTiers}
            currency={currency}
            unit={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
            baseMoq={Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10)}
            disabled={false}
          />
        </div>
      )}

      {/* Dual Pricing (Retail & Wholesale) */}
      {majorCategory !== 'Properties' && (sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale') && (
        <div className="space-y-5">
          {/* Distinct Header 1: Retail Pricing */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C06853]" />
              <h4 className="text-xs font-bold text-[#C06853] uppercase tracking-wider">
                🛍️ Retail Pricing (Single Units)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Retail Price (per {fieldsState.unit || 'piece'}) *
                </label>
                <input
                  type="number"
                  required
                  value={fieldsState.retailPrice || fieldsState.price || ''}
                  placeholder="e.g. 2000"
                  onChange={e => {
                    handleFieldChange('retailPrice', e.target.value);
                    handleFieldChange('price', e.target.value);
                  }}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-stone-900 font-mono font-bold shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Available Stock Qty *
                </label>
                <input
                  type="number"
                  required
                  value={fieldsState.availableQuantity || fieldsState.quantity || ''}
                  placeholder="e.g. 50"
                  onChange={e => {
                    handleFieldChange('availableQuantity', e.target.value);
                    handleFieldChange('quantity', e.target.value);
                  }}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Price Negotiable?
                </label>
                <select
                  value={fieldsState.negotiable || 'No'}
                  onChange={e => handleFieldChange('negotiable', e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                >
                  <option value="No">Fixed (No)</option>
                  <option value="Yes">Negotiable (Yes)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Distinct Header 2: Wholesale & Volume Pricing Tiers */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C06853]" />
              <h4 className="text-xs font-bold text-[#C06853] uppercase tracking-wider">
                📦 Wholesale & Volume Pricing Tiers
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Minimum Order Qty (MOQ &ge; 10) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10}
                  onChange={e => {
                    const val = Number(e.target.value);
                    handleFieldChange('minimumOrderQuantity', val);
                    setWholesaleTiers(prev => prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: val } : t));
                  }}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-stone-900 font-mono font-bold shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                  Supplier Business Type
                </label>
                <select
                  value={fieldsState.businessType || 'Wholesaler'}
                  onChange={e => handleFieldChange('businessType', e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                >
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Importer">Importer</option>
                </select>
              </div>
            </div>

            {/* Wholesale Tier Cards */}
            <WholesalePricingTiersEditor
              tiers={wholesaleTiers}
              onChange={setWholesaleTiers}
              currency={currency}
              unit={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
              baseMoq={Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10)}
              disabled={false}
            />
          </div>
        </div>
      )}

      {/* Delivery & Logistics Checkboxes */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#C06853]" />
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Delivery & Logistics Options
          </h4>
        </div>
        <p className="text-[11px] text-stone-500">Select all fulfillment methods you provide to buyers:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'Store/Warehouse Pickup', title: 'Store/Warehouse Pickup', desc: 'Buyer picks up at your location' },
            { id: 'Local City Delivery', title: 'Local City Delivery', desc: 'Direct courier within the same city' },
            { id: 'Freight Shipping', title: 'Freight Shipping', desc: 'Nationwide truck/cargo shipping' }
          ].map(delOpt => {
            const isChecked = currentDelivery.includes(delOpt.id);
            return (
              <label
                key={delOpt.id}
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  isChecked
                    ? 'bg-[#C06853]/5 border-[#C06853] text-stone-900 ring-1 ring-[#C06853]/30'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const next = isChecked
                      ? currentDelivery.filter((item: string) => item !== delOpt.id)
                      : [...currentDelivery, delOpt.id];
                    handleFieldChange('deliveryOptions', next);
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-[#C06853] focus:ring-[#C06853] border-stone-300"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">{delOpt.title}</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">{delOpt.desc}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
