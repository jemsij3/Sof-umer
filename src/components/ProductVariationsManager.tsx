import React, { useState } from 'react';
import { ProductVariation } from '../types';
import { Plus, Trash2, Layers, Check, Sparkles } from 'lucide-react';
import { useApp } from '../lib/AppContext';

interface ProductVariationsManagerProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
  currency: string;
}

const COMMON_ATTRIBUTES = [
  'Color',
  'Size',
  'Model',
  'Capacity',
  'Material'
] as const;

export const ProductVariationsManager: React.FC<ProductVariationsManagerProps> = ({
  variations,
  onChange,
  currency
}) => {
  const { t } = useApp();
  const [enabled, setEnabled] = useState(variations.length > 0);
  const [selectedAttrType, setSelectedAttrType] = useState<string>('Color');
  const [customAttrName, setCustomAttrName] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [variationStock, setVariationStock] = useState<number | ''>(10);
  const [variationPrice, setVariationPrice] = useState<number | ''>('');

  const getAttributeLabel = (attr: string) => {
    switch (attr) {
      case 'Color': return t('attr_color');
      case 'Size': return t('attr_size');
      case 'Model': return t('attr_model');
      case 'Capacity': return t('attr_capacity');
      case 'Material': return t('attr_material');
      default: return attr;
    }
  };

  const handleToggle = (active: boolean) => {
    setEnabled(active);
    if (!active) {
      onChange([]);
    } else if (variations.length === 0) {
      // Add a clean starter row
      onChange([
        {
          id: 'var-' + Date.now(),
          attributes: { Color: 'Black' },
          stock: 10
        }
      ]);
    }
  };

  const handleAddVariation = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAttr = selectedAttrType === 'Custom' ? customAttrName.trim() : selectedAttrType;
    if (!effectiveAttr || !attrValue.trim()) return;

    const newVar: ProductVariation = {
      id: 'var-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: `${effectiveAttr}: ${attrValue.trim()}`,
      attributes: {
        [effectiveAttr]: attrValue.trim()
      },
      stock: typeof variationStock === 'number' && variationStock >= 0 ? variationStock : 1,
      price: typeof variationPrice === 'number' && variationPrice > 0 ? variationPrice : undefined
    };

    onChange([...variations, newVar]);
    setAttrValue('');
    if (selectedAttrType === 'Custom') setCustomAttrName('');
  };

  const handleRemove = (id: string) => {
    onChange(variations.filter(v => v.id !== id));
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    onChange(
      variations.map(v => (v.id === id ? { ...v, stock: Math.max(0, newStock) } : v))
    );
  };

  return (
    <div className="bg-[#0e0e16] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{t('product_variations_sku')}</span>
            <span className="text-[10px] text-white/50">
              {t('product_variations_desc')}
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-white/5 animate-in fade-in duration-200">
          {/* Add Variation Form */}
          <div className="bg-black/30 border border-white/5 p-3.5 rounded-xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
              + {t('add_new_variation')}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">{t('attribute_type')}</label>
                <select
                  value={selectedAttrType}
                  onChange={e => setSelectedAttrType(e.target.value)}
                  className="w-full bg-[#161622] border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
                >
                  {COMMON_ATTRIBUTES.map(attr => (
                    <option key={attr} value={attr}>{getAttributeLabel(attr)}</option>
                  ))}
                  <option value="Custom">{t('custom_attribute')}</option>
                </select>
              </div>

              {selectedAttrType === 'Custom' ? (
                <div>
                  <label className="block text-[10px] text-white/40 mb-1">{t('attribute_name')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Storage"
                    value={customAttrName}
                    onChange={e => setCustomAttrName(e.target.value)}
                    className="w-full bg-[#161622] border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : null}

              <div className={selectedAttrType === 'Custom' ? 'sm:col-span-2' : 'sm:col-span-2'}>
                <label className="block text-[10px] text-white/40 mb-1">
                  {t('attribute_value_label')}
                </label>
                <input
                  type="text"
                  placeholder={t('enter_attribute_value')}
                  value={attrValue}
                  onChange={e => setAttrValue(e.target.value)}
                  className="w-full bg-[#161622] border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 mb-1">{t('variation_stock')}</label>
                <input
                  type="number"
                  min="0"
                  placeholder="10"
                  value={variationStock}
                  onChange={e => setVariationStock(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full bg-[#161622] border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddVariation}
                disabled={!attrValue.trim() || (selectedAttrType === 'Custom' && !customAttrName.trim())}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold px-3.5 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('add_variation')}</span>
              </button>
            </div>
          </div>

          {/* Existing Variations List */}
          {variations.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider font-mono block">
                {t('configured_variations', { count: variations.length })}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variations.map((v, idx) => {
                  const label = v.name || Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ') || `Variation #${idx + 1}`;
                  return (
                    <div
                      key={v.id || idx}
                      className="bg-[#12121c] border border-white/5 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-white truncate block">{label}</span>
                        <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                          <span>{t('stock_label')}</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock ?? 0}
                            onChange={e => handleUpdateStock(v.id, parseInt(e.target.value, 10) || 0)}
                            className="w-16 bg-black border border-white/10 text-white font-mono text-[10px] rounded px-1.5 py-0.5"
                          />
                          {v.price ? (
                            <span className="text-amber-400 font-mono">
                              &bull; {v.price.toLocaleString()} {currency}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(v.id)}
                        className="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                        title={t('remove_variation')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-white/40 italic">
              {t('no_variations_added')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
