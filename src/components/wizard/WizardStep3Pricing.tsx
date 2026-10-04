import React from 'react';
import { Tag, Package, Truck, DollarSign, Briefcase, Calendar } from 'lucide-react';
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

  // Single authoritative MOQ
  const authoritativeMoq = Math.max(1, Math.floor(Number(fieldsState.minimumOrderQuantity ?? wholesaleTiers[0]?.minimumQuantity ?? 10) || 10));
  const [moqInputStr, setMoqInputStr] = React.useState<string>(() => String(authoritativeMoq));

  React.useEffect(() => {
    const propMoq = fieldsState.minimumOrderQuantity ?? wholesaleTiers[0]?.minimumQuantity;
    if (propMoq !== undefined && propMoq !== null && propMoq !== '') {
      const parsed = Number(propMoq);
      if (!isNaN(parsed) && parsed > 0 && String(parsed) !== moqInputStr.trim()) {
        setMoqInputStr(String(parsed));
      }
    }
  }, [fieldsState.minimumOrderQuantity]);

  const handleMoqInputChange = (raw: string) => {
    setMoqInputStr(raw);
    if (raw.trim() === '') {
      handleFieldChange('minimumOrderQuantity', '');
      return;
    }
    const parsed = parseInt(raw.trim(), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      handleFieldChange('minimumOrderQuantity', parsed);
      setWholesaleTiers(prev => {
        if (!prev || prev.length === 0) return [{ minimumQuantity: parsed, pricePerUnit: 0 }];
        return prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: parsed } : t);
      });
    }
  };

  const handleMoqInputBlur = () => {
    const parsed = parseInt(moqInputStr.trim(), 10);
    const cleanMoq = isNaN(parsed) || parsed < 10 ? 10 : parsed;
    setMoqInputStr(String(cleanMoq));
    handleFieldChange('minimumOrderQuantity', cleanMoq);
    setWholesaleTiers(prev => {
      if (!prev || prev.length === 0) return [{ minimumQuantity: cleanMoq, pricePerUnit: 0 }];
      return prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: cleanMoq } : t);
    });
  };

  const isRealEstate = 
    majorCategory === 'Properties' || 
    majorCategory?.toLowerCase() === 'properties' || 
    fieldsState?.category === 'properties' || 
    fieldsState?.category === 'Properties';

  const isNoSellingMode = 
    isRealEstate || 
    ['Jobs', 'Vehicles', 'Services'].includes(majorCategory) ||
    ['jobs', 'vehicles', 'services'].includes(majorCategory?.toLowerCase());

  const formData = {
    ...fieldsState,
    category: isRealEstate ? 'properties' : (fieldsState.category || majorCategory?.toLowerCase() || majorCategory)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Currency & Base Unit (Hidden for Jobs since Jobs has integrated salary currency) */}
      {majorCategory !== 'Jobs' && (
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

          {!isNoSellingMode && (
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
      )}

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

      {/* Jobs & Hiring: Compensation & Application */}
      {majorCategory === 'Jobs' && (
        <div className="space-y-6">
          {/* Section 1: Compensation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <DollarSign className="w-4 h-4 text-[#F5A623]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t('job_compensation_title') || 'Compensation'}
              </h4>
            </div>

            {/* 1. Salary / Pay* */}
            {(fieldsState.payType || 'Fixed amount') === 'Fixed amount' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-white/80 uppercase">
                    1. {t('salary_pay_label') || 'Salary / Pay'} *
                  </label>
                  <span className="text-[10px] text-white/40">{currency}</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white font-bold shrink-0 focus:outline-none"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD ($)</option>
                    <option value="SAR">SAR</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={fieldsState.salary ?? fieldsState.price ?? ''}
                    placeholder="e.g. 25000"
                    onChange={e => {
                      handleFieldChange('salary', e.target.value);
                      handleFieldChange('price', e.target.value);
                      handleFieldChange('salaryRange', `${e.target.value} ${currency} / ${fieldsState.payPeriod || 'Per month'}`);
                    }}
                    className="w-full p-3 bg-black/50 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white font-mono font-bold text-[#F5A623]"
                  />
                </div>
              </div>
            )}

            {fieldsState.payType === 'Salary range' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-white/80 uppercase">
                    1. {t('salary_pay_label') || 'Salary / Pay'} *
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="px-2.5 py-1 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-lg text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD ($)</option>
                    <option value="SAR">SAR</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-white/60 mb-1">
                      {t('min_salary_label') || 'Minimum Amount'} ({currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={fieldsState.salaryMin || ''}
                      placeholder="e.g. 20000"
                      onChange={e => {
                        const minVal = e.target.value;
                        handleFieldChange('salaryMin', minVal);
                        handleFieldChange('salaryRange', `${minVal} - ${fieldsState.salaryMax || ''} ${currency} / ${fieldsState.payPeriod || 'Per month'}`);
                      }}
                      className="w-full p-3 bg-black/50 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white font-mono font-bold text-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/60 mb-1">
                      {t('max_salary_label') || 'Maximum Amount'} ({currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={fieldsState.salaryMax || ''}
                      placeholder="e.g. 35000"
                      onChange={e => {
                        const maxVal = e.target.value;
                        handleFieldChange('salaryMax', maxVal);
                        handleFieldChange('price', maxVal);
                        handleFieldChange('salaryRange', `${fieldsState.salaryMin || ''} - ${maxVal} ${currency} / ${fieldsState.payPeriod || 'Per month'}`);
                      }}
                      className="w-full p-3 bg-black/50 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white font-mono font-bold text-[#F5A623]"
                    />
                  </div>
                </div>
              </div>
            )}

            {fieldsState.payType === 'Negotiable' && (
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  1. {t('salary_pay_label') || 'Salary / Pay'} *
                </label>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <span>{t('salary_negotiable_hint') || 'Salary is negotiable upon interview. No specific amount is required.'}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2. Pay Type* */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  2. {t('pay_type_label') || 'Pay Type'} *
                </label>
                <select
                  value={fieldsState.payType || 'Fixed amount'}
                  onChange={e => {
                    const newPayType = e.target.value;
                    handleFieldChange('payType', newPayType);
                    if (newPayType === 'Negotiable') {
                      handleFieldChange('salary', '');
                      handleFieldChange('price', '');
                      handleFieldChange('salaryMin', '');
                      handleFieldChange('salaryMax', '');
                      handleFieldChange('salaryRange', 'Negotiable');
                    }
                  }}
                  className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
                >
                  <option value="Fixed amount">{t('pay_type_fixed') || 'Fixed amount'}</option>
                  <option value="Salary range">{t('pay_type_range') || 'Salary range'}</option>
                  <option value="Negotiable">{t('pay_type_negotiable') || 'Negotiable'}</option>
                </select>
              </div>

              {/* 3. Pay Period* */}
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  3. {t('pay_period_label') || 'Pay Period'} *
                </label>
                <select
                  value={fieldsState.payPeriod || 'Per month'}
                  onChange={e => handleFieldChange('payPeriod', e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
                >
                  <option value="Per hour">{t('pay_period_hour') || 'Per hour'}</option>
                  <option value="Per day">{t('pay_period_day') || 'Per day'}</option>
                  <option value="Per week">{t('pay_period_week') || 'Per week'}</option>
                  <option value="Per month">{t('pay_period_month') || 'Per month'}</option>
                  <option value="Per year">{t('pay_period_year') || 'Per year'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Application */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Briefcase className="w-4 h-4 text-[#F5A623]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t('job_application_title') || 'Application'}
              </h4>
            </div>

            {/* 4. Application Method* */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                4. {t('application_method_label') || 'Application Method'} *
              </label>
              <select
                value={fieldsState.applicationMethod || 'Apply through SOF-UMER'}
                onChange={e => {
                  const method = e.target.value;
                  handleFieldChange('applicationMethod', method);
                  if (method === 'Phone' && !fieldsState.applicationContact) {
                    handleFieldChange('applicationContact', fieldsState.contactPhone || '');
                  } else if (method === 'Email' && !fieldsState.applicationContact) {
                    handleFieldChange('applicationContact', fieldsState.contactEmail || '');
                  }
                }}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
              >
                <option value="Apply through SOF-UMER">{t('app_method_sofumer') || 'Apply through SOF-UMER'}</option>
                <option value="Phone">{t('app_method_phone') || 'Phone'}</option>
                <option value="Email">{t('app_method_email') || 'Email'}</option>
                <option value="External link">{t('app_method_link') || 'External link'}</option>
              </select>
            </div>

            {/* 5. Application Contact */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                5. {fieldsState.applicationMethod === 'Phone'
                  ? (t('app_contact_phone_label') || 'Application Contact Phone *')
                  : fieldsState.applicationMethod === 'Email'
                  ? (t('app_contact_email_label') || 'Application Email Address *')
                  : fieldsState.applicationMethod === 'External link'
                  ? (t('app_contact_link_label') || 'Application Website / URL Link *')
                  : (t('app_contact_label') || 'Application Contact')}
              </label>
              {(!fieldsState.applicationMethod || fieldsState.applicationMethod === 'Apply through SOF-UMER') ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 flex items-center justify-between">
                  <span>{t('sofumer_app_info') || 'Candidates will apply directly via SOF-UMER in-app messaging and candidate contact channels.'}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">In-App</span>
                </div>
              ) : (
                <input
                  type={fieldsState.applicationMethod === 'Email' ? 'email' : fieldsState.applicationMethod === 'External link' ? 'url' : 'tel'}
                  required
                  value={fieldsState.applicationContact || ''}
                  placeholder={
                    fieldsState.applicationMethod === 'Phone'
                      ? (fieldsState.contactPhone || '+251 91 123 4567')
                      : fieldsState.applicationMethod === 'Email'
                      ? 'jobs@company.com'
                      : 'https://company.com/careers/apply'
                  }
                  onChange={e => handleFieldChange('applicationContact', e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
                />
              )}
            </div>

            {/* 6. Application Deadline */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                6. {t('deadline') || 'Application Deadline'}
              </label>
              <input
                type="date"
                value={fieldsState.applicationDeadline || fieldsState.deadline || ''}
                onChange={e => {
                  handleFieldChange('applicationDeadline', e.target.value);
                  handleFieldChange('deadline', e.target.value);
                }}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Single Units (Retail) */}
      {!isNoSellingMode && sellingType === 'Retail' && (
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
      {!isNoSellingMode && sellingType === 'Wholesale' && (
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
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    step="1"
                    required
                    value={moqInputStr}
                    onChange={e => handleMoqInputChange(e.target.value)}
                    onBlur={handleMoqInputBlur}
                    placeholder="e.g. 10"
                    className="w-full p-3 pr-14 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/40 pointer-events-none select-none">
                    {getLocalizedUnit(fieldsState.unit || 'piece', currentLanguage, Number(moqInputStr) || 10)}
                  </span>
                </div>
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
            moq={authoritativeMoq}
            tiers={wholesaleTiers}
            onTiersChange={setWholesaleTiers}
            onChange={setWholesaleTiers}
            currency={currency}
            unit={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
            isRetailAndWholesale={false}
          />
        </div>
      )}

      {/* Dual Pricing (Retail & Wholesale) */}
      {!isNoSellingMode && (sellingType === 'Retail + Wholesale' || (sellingType as string) === 'Retail & Wholesale') && (
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
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    step="1"
                    required
                    value={moqInputStr}
                    onChange={e => handleMoqInputChange(e.target.value)}
                    onBlur={handleMoqInputBlur}
                    placeholder="e.g. 10"
                    className="w-full p-3 pr-14 bg-black/50 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold text-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/40 pointer-events-none select-none">
                    {getLocalizedUnit(fieldsState.unit || 'piece', currentLanguage, Number(moqInputStr) || 10)}
                  </span>
                </div>
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
              moq={authoritativeMoq}
              tiers={wholesaleTiers}
              onTiersChange={setWholesaleTiers}
              onChange={setWholesaleTiers}
              currency={currency}
              unit={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
              isRetailAndWholesale={true}
            />
          </div>
        </div>
      )}

      {/* Delivery & Logistics Options - Hidden for Real Estate, Jobs, Vehicles, and Services */}
      {!isNoSellingMode && (
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

