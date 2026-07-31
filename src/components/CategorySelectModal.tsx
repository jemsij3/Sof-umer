import React from 'react';
import { useApp } from '../lib/AppContext';
import { formatDynamicKey } from '../utils/formatTranslation';
import { X, Layers } from 'lucide-react';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySelectModal: React.FC<CategorySelectModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-lg p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-lg uppercase tracking-wide">
              {t('catalog.all_categories')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const translatedName = formatDynamicKey(t, 'categories', cat);
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-[#12121a] border-white/5 hover:border-white/20 text-white/80 hover:text-white'
                }`}
              >
                <span>{translatedName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySelectModal;
