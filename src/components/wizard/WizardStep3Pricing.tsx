import React from 'react';
import { Tag, Package, Truck } from 'lucide-react';
import { NormalizedSellingType, STANDARD_UNITS, getLocalizedUnit } from '../../utils/wholesalePricing';
import { WholesalePricingTiersEditor } from '../WholesalePricingTiersEditor';
import { WholesalePriceTier } from '../../types';
import { useApp } from '../../lib/AppContext';
import { getTranslatedFurnished, getTranslatedCondition } from '../../lib/categoriesData';

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
  const { t, currentLanguage } = useApp();
  const currentDelivery = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];

  const isRealEstate = 
    majorCategory === 'Properties' || 
    majorCategory?.toLowerCase() === 'properties' || 
    fieldsState?.category === 'properties' || 
    fieldsState?.category === 'Properties';

  const formData = {
    ...fieldsState,
    category: isRealEstate ? 'properties' : (fieldsState.category || majorCategory?.toLowerCase() || majorCategory)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Currency & Base Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-white/80 uppercase mb-1">
            {t('wizard.currency_label') || 'Currency'} *
          </label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
          >
            <option value="ETB" className="bg-[#0c0c0c]">ETB ({t('ethiopian_birr_unit') || 'Ethiopian Birr'})</option>
            <option value="USD" className="bg-[#0c0c0c]">USD ($)</option>
            <option value="SAR" className="bg-[#0c0c0c]">SAR ({t('saudi_riyal_unit') || 'Saudi Riyal'})</option>
            <option value="EUR" className="bg-[#0c0c0c]">EUR (€)</option>
            <option value="AED" className="bg-[#0c0c0c]">AED ({t('uae_dirham_unit') || 'UAE Dirham'})</option>
          </select>
        </div>

        {formData.category !== 'properties' && (
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              {t('pricing_unit_label') || 'Pricing Unit *'}
            </label>
            <select
              value={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
              onChange={e => {
                handleFieldChange('unit', e.target.value);
                handleFieldChange('wholesaleUnit', e.target.value);
              }}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
            >
              {STANDARD_UNITS.map(u => (
                <option key={u} value={u} className="bg-[#0c0c0c]">
                  {getLocalizedUnit(u, currentLanguage, 1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Real Estate Pricing & Condition */}
      {formData.category === 'properties' && (
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            {t('property_pricing_details_title') || 'Property Pricing & Details'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {t('priceLabel') || 'Property Price'} ({currency}) *
              </label>
              <input
                type="number"
                required
                value={fieldsState.price || ''}
                placeholder="e.g. 4500000"
                onChange={e => handleFieldChange('price', e.target.value)}
                className="w-full p-3 bg-[#0A0A0C] border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition font-mono text-base font-bold text-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {t('negotiable_label') || 'Negotiable?'}
              </label>
              <select
                value={fieldsState.negotiable || 'No'}
                onChange={e => handleFieldChange('negotiable', e.target.value)}
                className="w-full p-3 bg-[#0A0A0C] border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white"
              >
                <option value="No" className="bg-[#0A0A0C]">{t('fixed_price_option') || 'Fixed Price (Non-negotiable)'}</option>
                <option value="Yes" className="bg-[#0A0A0C]">{t('negotiable_option') || 'Negotiable'}</option>
              </select>
            </div>
          </div>

          {/* Property Condition / Status Dropdown (Real Estate Only) */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              {t('property_condition_status_label') || 'Property Condition / Status *'}
            </label>
            <select
              value={formData.condition || ''}
              onChange={e => handleFieldChange('condition', e.target.value)}
              className="w-full p-3 bg-[#0A0A0C] border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
            >
              <option value="" disabled className="bg-[#0A0A0C] text-white/40">{t('select_property_condition') || 'Select Property Condition / Status...'}</option>
              <option value="Furnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Furnished', currentLanguage)}</option>
              <option value="Unfurnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Unfurnished', currentLanguage)}</option>
              <option value="Semi-Furnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Semi-Furnished', currentLanguage)}</option>
              <option value="Under Construction" className="bg-[#0A0A0C]">{getTranslatedCondition('Under Construction', currentLanguage)}</option>
              <option value="Brand New / Newly Built" className="bg-[#0A0A0C]">{getTranslatedCondition('Brand New / Newly Built', currentLanguage)}</option>
            </select>
          </div>
        </div>
      )}

      {/* Single Units (Retail) */}
      {majorCategory !== 'Properties' && sellingType === 'Retail' && (
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {t('retail_pricing_header') || 'Retail Pricing (Single Units)'}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {t('retail_price_label') || 'Retail Price'} ({t('per_unit', { unit: getLocalizedUnit(fieldsState.unit || 'piece', currentLanguage, 1) }) || 'per ' + (fieldsState.unit || 'piece')}) *
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
                className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {t('available_stock_qty_label') || 'Available Stock Qty *'}
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
                className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {t('price_negotiable_label') || 'Price Negotiable?'}
              </label>
              <select
                value={fieldsState.negotiable || 'No'}
                onChange={e => handleFieldChange('negotiable', e.target.value)}
                className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
              >
                <option value="No">{t('fixed_no') || 'Fixed (No)'}</option>
                <option value="Yes">{t('negotiable_yes') || 'Negotiable (Yes)'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Only (Wholesale) */}
      {majorCategory !== 'Properties' && sellingType === 'Wholesale' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {t('wholesale_settings_header') || 'Wholesale Settings & Minimum Order'}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('wholesale_moq_label') || 'Minimum Order Qty (MOQ ≥ 10) *'}
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
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('available_bulk_stock_label') || 'Available Bulk Stock'}
                </label>
                <input
                  type="number"
                  value={fieldsState.availableQuantity || ''}
                  placeholder="e.g. 500"
                  onChange={e => handleFieldChange('availableQuantity', e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('supplier_business_type_label') || 'Supplier Business Type'}
                </label>
                <select
                  value={fieldsState.businessType || 'Wholesaler'}
                  onChange={e => handleFieldChange('businessType', e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                >
                  <option value="Wholesaler">{t('biz_wholesaler') || 'Wholesaler'}</option>
                  <option value="Manufacturer">{t('biz_manufacturer') || 'Manufacturer'}</option>
                  <option value="Distributor">{t('biz_distributor') || 'Distributor'}</option>
                  <option value="Importer">{t('biz_importer') || 'Importer'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wholesale Tier Cards (Vertical Stacked Cards) */}
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
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                🛍️ {t('retail_pricing_header') || 'Retail Pricing (Single Units)'}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('retail_price_label') || 'Retail Price'} ({t('per_unit', { unit: getLocalizedUnit(fieldsState.unit || 'piece', currentLanguage, 1) }) || 'per ' + (fieldsState.unit || 'piece')}) *
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
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('available_stock_qty_label') || 'Available Stock Qty *'}
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
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('price_negotiable_label') || 'Price Negotiable?'}
                </label>
                <select
                  value={fieldsState.negotiable || 'No'}
                  onChange={e => handleFieldChange('negotiable', e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                >
                  <option value="No">{t('fixed_no') || 'Fixed (No)'}</option>
                  <option value="Yes">{t('negotiable_yes') || 'Negotiable (Yes)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Distinct Header 2: Wholesale & Volume Pricing Tiers */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                📦 {t('wholesale_volume_tiers_header') || 'Wholesale & Volume Pricing Tiers'}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('wholesale_moq_label') || 'Minimum Order Qty (MOQ ≥ 10) *'}
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
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('supplier_business_type_label') || 'Supplier Business Type'}
                </label>
                <select
                  value={fieldsState.businessType || 'Wholesaler'}
                  onChange={e => handleFieldChange('businessType', e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                >
                  <option value="Wholesaler">{t('biz_wholesaler') || 'Wholesaler'}</option>
                  <option value="Manufacturer">{t('biz_manufacturer') || 'Manufacturer'}</option>
                  <option value="Distributor">{t('biz_distributor') || 'Distributor'}</option>
                  <option value="Importer">{t('biz_importer') || 'Importer'}</option>
                </select>
              </div>
            </div>

            {/* Wholesale Tier Cards (Vertical Stacked Cards) */}
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

      {/* Delivery & Logistics Options - Hidden for Real Estate */}
      {formData.category !== 'properties' && (
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F5A623]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('wholesale.delivery_options') || 'Delivery & Logistics Options'}
            </h4>
          </div>
          <p className="text-[11px] text-white/50">{t('delivery_logistics_subtext') || 'Select all fulfillment methods you provide to buyers:'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {[
              { id: 'Store/Warehouse Pickup', title: t('del_store_pickup') || 'Store / Warehouse Pickup', desc: t('delivery_pickup_desc') || 'Buyer picks up at your location' },
              { id: 'Local City Delivery', title: t('del_local_delivery') || 'Local City Delivery', desc: t('delivery_local_desc') || 'Direct courier within the same city' },
              { id: 'Freight Shipping', title: t('del_nationwide_freight') || 'Freight Shipping', desc: t('delivery_freight_desc') || 'Nationwide truck/cargo shipping' }
            ].map(delOpt => {
              const isChecked = currentDelivery.includes(delOpt.id);
              return (
                <label
                  key={delOpt.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                    isChecked
                      ? 'bg-[#F5A623]/10 border-[#F5A623]/60 text-white ring-1 ring-[#F5A623]/30'
                      : 'bg-[#0A0A0C] border-white/10 text-white/70 hover:border-white/20'
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
                    className="mt-0.5 w-4 h-4 rounded text-[#F5A623] focus:ring-[#F5A623] border-white/20 bg-[#0A0A0C]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{delOpt.title}</span>
                    <span className="text-[10px] text-white/40 block leading-tight">{delOpt.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

