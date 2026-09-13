import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Folder, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import { 
  PRIMARY_CATEGORIES,
  PRODUCT_CATEGORIES,
  CategoryRedesign, 
  Subcategory, 
  CategoryBrand, 
  REDESIGNED_CATEGORIES, 
  getCategoryListingCount as calcCategoryCount, 
  getSubcategoryListingCount as calcSubCount, 
  getSubcategoryVisual 
} from '../lib/categoriesData';
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

    // Search in primary categories and redesigned categories
    const allCategoriesToSearch = [
      ...PRIMARY_CATEGORIES,
      ...REDESIGNED_CATEGORIES.filter(rc => !PRIMARY_CATEGORIES.some(pc => pc.id === rc.id))
    ];

    allCategoriesToSearch.forEach(cat => {
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto px-3 py-4 sm:p-6 md:p-8 flex justify-center items-center text-left"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white border border-stone-200 w-full max-w-5xl rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-[#C06853]/10 text-[#C06853] rounded-2xl border border-[#C06853]/20">
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-[#C06853]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-serif font-black tracking-wide text-stone-900 uppercase">
                  {t('all_categories') || 'ALL CATEGORIES'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  {selectedCategoryView
                    ? (t('select_subcategory_browse') || 'Select a subcategory to browse listings')
                    : (t('select_category_browse') || 'Select a category to browse verified listings')}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 sm:p-2.5 bg-stone-100 hover:bg-stone-200 rounded-2xl border border-stone-200 transition cursor-pointer text-stone-600 hover:text-stone-900"
              aria-label="Close All Categories"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Categories Input */}
          <div className="mb-4 relative shrink-0">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={t('search_categories_placeholder') || "Search categories, subcategories & brands (e.g. Nike, Toyota, Smartphones)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-stone-50 border border-stone-200 focus:border-[#C06853] focus:bg-white focus:outline-none rounded-2xl text-sm text-stone-900 placeholder-stone-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 sm:top-3.5 p-1 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
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
                <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-2xl">
                  <p className="text-stone-400 text-sm">{t('no_category_matched') || 'No category, subcategory or brand matched'} "{searchQuery}".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">
                    {t('search_results') || 'Search Results'} ({searchResults.length})
                  </div>
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectCategory(res.category, res.subcategory || null, res.brand?.name || null);
                        handleClose();
                      }}
                      className="w-full text-left p-3.5 sm:p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-[#C06853]/40 rounded-2xl transition flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.category.imageUrl}
                          alt={res.category.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-stone-900 group-hover:text-[#C06853] transition truncate">
                            {res.displayName}
                          </div>
                          <div className="text-xs text-stone-400 font-mono mt-0.5 truncate">
                            {res.path}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C06853] group-hover:translate-x-1 transition shrink-0 ml-2" />
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
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('all_categories') || 'All Categories'}</span>
                  </button>

                  <span className="text-xs text-stone-400 font-mono">
                    {getCategoryListingCount(selectedCategoryView)} {t('items_suffix') || 'items'}
                  </span>
                </div>

                {/* Category Header Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#C06853]/10 border border-[#C06853]/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-xs">
                      {selectedCategoryView.emoji}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-xl font-serif font-extrabold text-stone-900 tracking-wide uppercase">
                        {getCategoryDisplayName(selectedCategoryView)}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5 font-medium">
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
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C06853] text-white hover:bg-[#A85340] font-bold uppercase text-xs tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('view_all') || 'View All'}</span>
                  </button>
                </div>

                {/* Subcategories List */}
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
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
                        className="w-full text-left p-3.5 sm:p-4 hover:bg-stone-50 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg shrink-0">{subIcon}</span>
                          <span className="text-sm font-medium text-stone-800 group-hover:text-[#C06853] transition-colors truncate">
                            {subName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200 group-hover:border-[#C06853]/30 group-hover:text-[#C06853] transition">
                            {subCount}
                          </span>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C06853] group-hover:translate-x-1 transition" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Brands if available (e.g. Fashion) */}
                {selectedCategoryView.brands && selectedCategoryView.brands.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C06853]" /> {t('popular_brands') || 'Popular Brands:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryView.brands.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onSelectCategory(selectedCategoryView, null, b.name);
                            handleClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#C06853] hover:text-white border border-stone-200 text-xs text-stone-700 font-semibold transition cursor-pointer shadow-xs"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. PRIMARY MARKETPLACE CATEGORIES */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#C06853]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C06853]">
                      {t('primary_categories') || 'PRIMARY MARKETPLACE CATEGORIES'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                    {PRIMARY_CATEGORIES.map((cat) => {
                      const catCount = getCategoryListingCount(cat);
                      const translatedCatName = getCategoryDisplayName(cat);

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryView(cat)}
                          aria-label={`Browse ${translatedCatName}`}
                          className="w-full text-left p-3.5 rounded-2xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-[#C06853]/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer min-h-[110px] focus:outline-none focus:ring-2 focus:ring-[#C06853]/50 shadow-xs hover:shadow-md active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-between w-full mb-2.5">
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                              {cat.emoji}
                            </span>
                            <div className="p-1 rounded-lg bg-stone-100 text-stone-400 group-hover:text-[#C06853] group-hover:translate-x-0.5 transition-all">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#C06853] transition-colors leading-tight line-clamp-1">
                              {translatedCatName}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-mono mt-1">
                              {catCount} {catCount === 1 ? (t('listing_singular') || 'listing') : (t('listings_plural') || 'listings')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PRODUCT DEPARTMENTS & GOODS */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                      {t('browse_product_departments') || 'PRODUCT DEPARTMENTS & GOODS'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const catCount = getCategoryListingCount(cat);
                      const translatedCatName = getCategoryDisplayName(cat);

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryView(cat)}
                          aria-label={`Browse ${translatedCatName}`}
                          className="w-full text-left p-3.5 rounded-2xl bg-stone-50 hover:bg-white border border-stone-200 hover:border-[#C06853]/30 transition-all duration-200 flex flex-col justify-between group cursor-pointer min-h-[96px] focus:outline-none focus:ring-2 focus:ring-[#C06853]/50 shadow-xs active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {cat.emoji}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#C06853] group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-[#C06853] transition-colors leading-tight line-clamp-1">
                              {translatedCatName}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                              {catCount} {catCount === 1 ? (t('item_singular') || 'item') : (t('items_suffix') || 'items')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

