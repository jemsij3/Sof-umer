import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, ChevronDown, Folder, Sparkles, Tag } from 'lucide-react';
import { CategoryRedesign, Subcategory, CategoryBrand, REDESIGNED_CATEGORIES, getCategoryListingCount as calcCategoryCount, getSubcategoryListingCount as calcSubCount } from '../lib/categoriesData';
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
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Calculate real listing count for a main category
  const getCategoryListingCount = (cat: CategoryRedesign): number => {
    return calcCategoryCount(cat, properties);
  };

  // Calculate listing count for a subcategory
  const getSubcategoryListingCount = (sub: Subcategory, cat: CategoryRedesign): number => {
    return calcSubCount(sub.id, properties, cat.id);
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
        const translatedCat = currentLanguage === 'am' ? cat.translations.am : currentLanguage === 'om' ? cat.translations.om : cat.name;
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
          const translatedCat = currentLanguage === 'am' ? cat.translations.am : currentLanguage === 'om' ? cat.translations.om : cat.name;
          const translatedSub = currentLanguage === 'am' ? sub.translations.am : currentLanguage === 'om' ? sub.translations.om : sub.name;
          results.push({
            type: 'subcategory',
            category: cat,
            subcategory: sub,
            displayName: translatedSub,
            path: `${translatedCat} → ${translatedSub}`
          });
        }
      });

      // Match brands
      if (cat.brands) {
        cat.brands.forEach(b => {
          if (b.name.toLowerCase().includes(query)) {
            const translatedCat = currentLanguage === 'am' ? cat.translations.am : currentLanguage === 'om' ? cat.translations.om : cat.name;
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
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 overflow-y-auto px-3 py-6 sm:p-8 flex justify-center text-left"
      >
        <motion.div
          initial={{ scale: 0.96, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-[#0d0d12] border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl p-5 sm:p-8 flex flex-col my-auto h-fit max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                <Folder className="w-6 h-6 fill-amber-500/20 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-400 to-amber-200 uppercase">
                  {t('all_categories') || 'ALL CATEGORIES'}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">
                  {t('select_category_browse') || 'Select a category to browse verified listings'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition cursor-pointer text-white/70 hover:text-white"
              aria-label="Close All Categories"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Categories Input */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={t('search_categories_placeholder') || "Search categories, subcategories & brands (e.g. Nike, Toyota, Smartphones)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-white/5 border border-white/10 focus:border-amber-500/50 focus:outline-none rounded-2xl text-sm text-white placeholder-white/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto max-h-[65vh] pr-1 space-y-3 custom-scrollbar">
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
                        onClose();
                      }}
                      className="w-full text-left p-4 bg-white/[0.03] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-2xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.category.imageUrl}
                          alt={res.category.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                            {res.displayName}
                          </div>
                          <div className="text-xs text-white/40 font-mono mt-0.5">
                            {res.path}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* Main Categories Accordion List */
              <div className="space-y-2.5">
                {REDESIGNED_CATEGORIES.map((cat) => {
                  const isExpanded = expandedCategoryId === cat.id;
                  const catCount = getCategoryListingCount(cat);
                  const translatedCatName = currentLanguage === 'am' ? cat.translations.am : currentLanguage === 'om' ? cat.translations.om : cat.name;

                  return (
                    <div
                      key={cat.id}
                      className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'bg-white/[0.04] border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Main Category Row */}
                      <button
                        onClick={() => {
                          setExpandedCategoryId(isExpanded ? null : cat.id);
                        }}
                        className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Category Picture Thumbnail */}
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-amber-500/50 transition">
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30" />
                            <span className="absolute inset-0 flex items-center justify-center text-lg drop-shadow-md">
                              {cat.emoji}
                            </span>
                          </div>

                          {/* Category Name & Items Count */}
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide flex items-center gap-2">
                              <span>{translatedCatName}</span>
                            </h3>
                            <p className="text-xs text-white/40 font-mono mt-0.5">
                              {catCount} {catCount === 1 ? (currentLanguage === 'am' ? 'ዕቃ' : currentLanguage === 'om' ? 'meeshaa' : 'item') : (t('items_suffix') || 'items')}
                            </p>
                          </div>
                        </div>

                        {/* Arrow > / Chevron */}
                        <div className={`p-2 rounded-xl transition-all ${
                          isExpanded ? 'bg-amber-500/20 text-amber-400 rotate-90' : 'bg-white/5 text-white/40'
                        }`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>

                      {/* Expandable Subcategories Accordion Content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="border-t border-white/5 bg-black/40 p-4 sm:p-5 space-y-4"
                          >
                            {/* All [Category] button */}
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                              <span className="text-xs text-white/50 font-medium">{t('subcategories_label') || 'Subcategories:'}</span>
                              <button
                                onClick={() => {
                                  onSelectCategory(cat, null, null);
                                  onClose();
                                }}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                              >
                                {t('view_all') || 'View All'} {translatedCatName}
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Subcategories Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {cat.subcategories.map((sub) => {
                                const subCount = getSubcategoryListingCount(sub, cat);
                                const translatedSubName = currentLanguage === 'am' ? sub.translations.am : currentLanguage === 'om' ? sub.translations.om : sub.name;

                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      onSelectCategory(cat, sub, null);
                                      onClose();
                                    }}
                                    className="text-left p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-xs text-white/80 hover:text-amber-400 font-medium transition flex items-center justify-between gap-2 group cursor-pointer"
                                  >
                                    <span className="truncate">{translatedSubName}</span>
                                    <span className="text-[11px] font-bold text-amber-400/90 font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition">
                                      {subCount}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Brands if available (e.g., Fashion) */}
                            {cat.brands && cat.brands.length > 0 && (
                              <div className="pt-3 border-t border-white/5 space-y-2">
                                <span className="text-xs text-white/50 font-medium flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-amber-500" /> {t('popular_brands') || 'Popular Brands:'}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {cat.brands.map((b) => (
                                    <button
                                      key={b.id}
                                      onClick={() => {
                                        onSelectCategory(cat, null, b.name);
                                        onClose();
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-black border border-white/5 text-xs text-white/70 font-semibold transition cursor-pointer"
                                    >
                                      {b.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
