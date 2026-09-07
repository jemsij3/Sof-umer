import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Folder, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { CategoryRedesign, Subcategory, CategoryBrand, REDESIGNED_CATEGORIES, getCategoryListingCount as calcCategoryCount, getSubcategoryListingCount as calcSubCount, getSubcategoryVisual } from '../lib/categoriesData';
import { Property } from '../types';

interface AllCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  currentLanguage: string;
  onSelectCategory: (category: CategoryRedesign, subcategory?: Subcategory | null, brand?: string | null) => void;
  t: (key: string) => string;
}

export function AllCategoriesModal({
  isOpen,
  onClose,
  properties,
  currentLanguage,
  onSelectCategory,
  t
}: AllCategoriesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryView, setSelectedCategoryView] = useState<CategoryRedesign | null>(null);

  // Helper for localized category name
  const getCategoryDisplayName = (cat: CategoryRedesign): string => {
    if (currentLanguage === 'am') return cat.translations?.am || cat.name;
    if (currentLanguage === 'om') return cat.translations?.om || cat.name;
    return cat.name;
  };

  // Helper for localized subcategory name
  const getSubcategoryDisplayName = (sub: Subcategory): string => {
    if (currentLanguage === 'am') return sub.translations?.am || sub.name;
    if (currentLanguage === 'om') return sub.translations?.om || sub.name;
    return sub.name;
  };

  // Calculate real listing count for a main category
  const getCategoryListingCount = (cat: CategoryRedesign): number => {
    return calcCategoryCount(cat, properties);
  };

  // Calculate listing count for a subcategory
  const getSubcategoryListingCount = (sub: Subcategory, cat: CategoryRedesign): number => {
    return calcSubCount(sub.id, properties, cat.id);
  };

  // Reset internal view state when modal closes
  const handleClose = () => {
    setSelectedCategoryView(null);
    setSearchQuery('');
    onClose();
  };

  // Search results across categories, subcategories, and brands
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase().trim();
    const results: Array<{
      type: 'category' | 'subcategory' | 'brand';
      category: CategoryRedesign;
      subcategory?: Subcategory;
      brand?: CategoryBrand;
      displayName: string;
      path: string;
    }> = [];

    REDESIGNED_CATEGORIES.forEach(cat => {
      const catNameEn = cat.name.toLowerCase();
      const catNameAm = (cat.translations?.am || '').toLowerCase();
      const catNameOm = (cat.translations?.om || '').toLowerCase();

      // Match category
      if (catNameEn.includes(query) || catNameAm.includes(query) || catNameOm.includes(query)) {
        const translatedCat = currentLanguage === 'am' ? (cat.translations?.am || cat.name) : currentLanguage === 'om' ? (cat.translations?.om || cat.name) : cat.name;
        results.push({
          type: 'category',
          category: cat,
          displayName: `${cat.emoji} ${translatedCat}`,
          path: translatedCat
        });
      }

      // Match subcategories
      cat.subcategories.forEach(sub => {
        const subNameEn = sub.name.toLowerCase();
        const subNameAm = (sub.translations?.am || '').toLowerCase();
        const subNameOm = (sub.translations?.om || '').toLowerCase();

        if (subNameEn.includes(query) || subNameAm.includes(query) || subNameOm.includes(query)) {
          const translatedCat = currentLanguage === 'am' ? (cat.translations?.am || cat.name) : currentLanguage === 'om' ? (cat.translations?.om || cat.name) : cat.name;
          const translatedSub = currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name;
          results.push({
            type: 'subcategory',
            category: cat,
            subcategory: sub,
            displayName: `${getSubcategoryVisual(sub.id, cat.emoji)} ${translatedSub}`,
            path: `${translatedCat} → ${translatedSub}`
          });
        }
      });

      // Match brands
      if (cat.brands) {
        cat.brands.forEach(b => {
          if (b.name.toLowerCase().includes(query)) {
            const translatedCat = currentLanguage === 'am' ? (cat.translations?.am || cat.name) : currentLanguage === 'om' ? (cat.translations?.om || cat.name) : cat.name;
            results.push({
              type: 'brand',
              category: cat,
              brand: b,
              displayName: b.name,
              path: `${translatedCat} → ${b.name}`
            });
          }
        });
      }
    });

    return results;
  }, [searchQuery, currentLanguage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 overflow-y-auto px-3 py-4 sm:p-6 md:p-8 flex justify-center items-center text-left"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0d0d12] border border-white/10 w-full max-w-5xl rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500/20 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-400 to-amber-200 uppercase">
                  {t('all_categories') || 'ALL CATEGORIES'}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {selectedCategoryView
                    ? (t('select_subcategory_browse') || 'Select a subcategory to browse listings')
                    : (t('select_category_browse') || 'Select a category to browse verified listings')}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition cursor-pointer text-white/70 hover:text-white"
              aria-label="Close All Categories"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Categories Input */}
          <div className="mb-4 relative shrink-0">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={t('search_categories_placeholder') || "Search categories, subcategories & brands (e.g. Nike, Toyota, Smartphones)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-white/5 border border-white/10 focus:border-amber-500/50 focus:outline-none rounded-2xl text-sm text-white placeholder-white/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 sm:top-3.5 p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar min-h-0">
            {/* Search Mode Results */}
            {searchResults !== null ? (
              searchResults.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-white/40 text-sm">{t('no_category_matched') || 'No category, subcategory or brand matched'} "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">
                    {t('search_results') || 'Search Results'} ({searchResults.length})
                  </div>
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectCategory(res.category, res.subcategory || null, res.brand?.name || null);
                        handleClose();
                      }}
                      className="w-full text-left p-3.5 sm:p-4 bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-2xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.category.imageUrl}
                          alt={res.category.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">
                            {res.displayName}
                          </div>
                          <div className="text-xs text-white/40 font-mono mt-0.5 truncate">
                            {res.path}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )
            ) : selectedCategoryView ? (
              /* SUBCATEGORY VIEW (Selected Main Category) */
              <div className="space-y-4 animate-fade-in">
                {/* Back to All Categories Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCategoryView(null)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('all_categories') || 'All Categories'}</span>
                  </button>

                  <span className="text-xs text-white/40 font-mono">
                    {getCategoryListingCount(selectedCategoryView)} {t('items_suffix') || 'items'}
                  </span>
                </div>

                {/* Category Header Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
                      {selectedCategoryView.emoji}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-serif font-extrabold text-white tracking-wide uppercase">
                        {getCategoryDisplayName(selectedCategoryView)}
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        {selectedCategoryView.subcategories.length} {t('subcategories_label') || 'subcategories'}
                      </p>
                    </div>
                  </div>

                  {/* View All button */}
                  <button
                    onClick={() => {
                      onSelectCategory(selectedCategoryView, null, null);
                      handleClose();
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase text-xs tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('view_all') || 'View All'}</span>
                  </button>
                </div>

                {/* Subcategories List */}
                <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                  {selectedCategoryView.subcategories.map((sub) => {
                    const subCount = getSubcategoryListingCount(sub, selectedCategoryView);
                    const subName = getSubcategoryDisplayName(sub);
                    const subIcon = getSubcategoryVisual(sub.id, selectedCategoryView.emoji);

                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onSelectCategory(selectedCategoryView, sub, null);
                          handleClose();
                        }}
                        className="w-full text-left p-3.5 sm:p-4 hover:bg-amber-500/[0.06] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg shrink-0">{subIcon}</span>
                          <span className="text-sm font-medium text-white/90 group-hover:text-amber-400 transition-colors truncate">
                            {subName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/10 group-hover:border-amber-500/30 group-hover:text-amber-400 transition">
                            {subCount}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Brands if available (e.g. Fashion) */}
                {selectedCategoryView.brands && selectedCategoryView.brands.length > 0 && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-xs text-white/50 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-500" /> {t('popular_brands') || 'Popular Brands:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryView.brands.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onSelectCategory(selectedCategoryView, null, b.name);
                            handleClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black border border-white/5 text-xs text-white/70 font-semibold transition cursor-pointer"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ALL CATEGORIES: RESPONSIVE CATEGORY-CARD GRID (Desktop: 3-4 cols, Tablet: 2-3 cols, Mobile: 2 cols) */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
                {REDESIGNED_CATEGORIES.map((cat) => {
                  const catCount = getCategoryListingCount(cat);
                  const translatedCatName = getCategoryDisplayName(cat);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryView(cat)}
                      aria-label={`Browse ${translatedCatName}`}
                      className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-amber-500/[0.07] border border-white/10 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer min-h-[110px] sm:min-h-[124px] focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 active:scale-[0.98]"
                    >
                      {/* Top row: Icon + Chevron */}
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-105 group-hover:bg-amber-500/20 transition-transform shrink-0">
                          {cat.emoji}
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 text-white/30 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Bottom area: Category Name & Count */}
                      <div className="w-full">
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-tight line-clamp-2">
                          {translatedCatName}
                        </h3>
                        <p className="text-[11px] text-white/40 font-mono mt-1">
                          {catCount} {catCount === 1 ? (currentLanguage === 'am' ? 'ዕቃ' : currentLanguage === 'om' ? 'meeshaa' : 'item') : (t('items_suffix') || 'items')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

