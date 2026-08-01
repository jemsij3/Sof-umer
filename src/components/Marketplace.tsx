import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { Property, Advertisement } from '../types';
import { 
  Search, MapPin, Building, BedDouble, Bath, Maximize, Heart, ArrowRight, 
  SlidersHorizontal, Sparkles, ShieldAlert, Briefcase, Wrench, ShoppingBag, 
  Store, Users, Grid, List, Share2, Bookmark, BookmarkCheck, ChevronRight, 
  X, AlertCircle, Home, Car, Smartphone, Laptop, Sofa, Shirt, FileText, 
  Hammer, Factory, Wheat, Footprints, GraduationCap, Activity, Utensils, 
  CalendarDays, Gamepad2, Baby, Recycle, TrendingUp, Clock, Flame, Info, CheckCircle2,
  Folder, ChevronDown, Wallet, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  REDESIGNED_CATEGORIES, 
  CategoryRedesign, 
  Subcategory, 
  getMatchingSubcategoryId, 
  getEffectiveMajorCategory, 
  isListingActiveAndPublished, 
  getSubcategoryListingCount as calcSubCount, 
  getCategoryListingCount as calcCategoryCount, 
  extractString,
  getTranslatedCategoryName,
  getTranslatedSubcategoryName,
  getTranslatedPropertyType,
  getTranslatedOption
} from '../lib/categoriesData';
import { AllCategoriesModal } from './AllCategoriesModal';
import { LocationSelectorModal } from './LocationSelectorModal';
import { matchesLocationFilter } from '../lib/locationData';

function SofUmerCaveLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      <defs>
        {/* Gold limestone and arch gradient */}
        <linearGradient id="caveGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="35%" stopColor="#D97706" />
          <stop offset="70%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Emerald green river and interior gradient */}
        <linearGradient id="caveGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#064E3B" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Glow for cave background */}
        <radialGradient id="caveInnerGlow" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stopColor="#022C22" stopOpacity={0.8} />
          <stop offset="70%" stopColor="#061512" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#020403" stopOpacity={1} />
        </radialGradient>
      </defs>

      {/* Hexagonal Outer Shield representing safety, community, and quality */}
      <polygon
        points="50,4 92,25 92,75 50,96 8,75 8,25"
        fill="#080c0a"
        stroke="url(#caveGoldGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Deep dark cave opening/arch (radial depth) */}
      <path
        d="M 22,74 C 22,35 34,16 50,16 C 66,16 78,35 78,74 Z"
        fill="url(#caveInnerGlow)"
        stroke="url(#caveGoldGrad)"
        strokeWidth="1.5"
      />

      {/* Sinuous Emerald Green Web River flowing from deep cave center */}
      <path
        d="M 50,42 C 46,50 53,58 45,67 C 39,73 31,74 23,74 L 23,74 C 33,74 41,70 47,63 C 53,55 47,48 50,42 Z"
        fill="url(#caveGreenGrad)"
        opacity="0.95"
      />
      <path
        d="M 50,42 C 54,49 47,56 55,64 C 61,70 69,73 77,74 L 77,74 C 67,74 59,71 53,65 C 47,57 53,50 50,42 Z"
        fill="url(#caveGreenGrad)"
        opacity="0.8"
      />

      {/* Stalactites (hanging rock formations) at the top of the cave */}
      <path d="M 36,17 L 40,32 L 42,17 Z" fill="url(#caveGoldGrad)" />
      <path d="M 44,17 L 47,38 L 50,17 Z" fill="url(#caveGoldGrad)" />
      <path d="M 50,17 L 53,40 L 56,17 Z" fill="url(#caveGoldGrad)" />
      <path d="M 58,17 L 61,31 L 64,17 Z" fill="url(#caveGoldGrad)" />

      {/* Stalagmites / Columns meeting stalactites */}
      <path d="M 62,74 Q 65,45 61,40 Q 64,36 67,74 Z" fill="url(#caveGoldGrad)" opacity="0.9" />
      <path d="M 32,74 Q 28,52 32,48 Q 30,46 36,74 Z" fill="url(#caveGoldGrad)" opacity="0.9" />

      {/* Sparkle/Glow at the cave's heart representing the discovery / smart way */}
      <path
        d="M 50,23 L 51.5,26.5 L 55,28 L 51.5,29.5 L 50,33 L 48.5,29.5 L 45,28 L 48.5,26.5 Z"
        fill="#FBBF24"
        className="animate-pulse"
      />
    </svg>
  );
}

const matchesSubcategory = (p: Property, sub: Subcategory, cat: CategoryRedesign): boolean => {
  if (!isListingActiveAndPublished(p)) return false;

  // Verify major category strictly
  const effMajor = getEffectiveMajorCategory(p);
  const catId = cat.id.toLowerCase();
  const dbMajor = (cat.dbMapping?.majorCategory || '').toLowerCase();

  if (catId === 'properties' || dbMajor === 'properties') {
    if (effMajor !== 'Properties') return false;
  } else if (catId === 'vehicles' || dbMajor === 'vehicles') {
    if (effMajor !== 'Vehicles') return false;
  } else if (catId === 'jobs' || dbMajor === 'jobs') {
    if (effMajor !== 'Jobs') return false;
  } else if (catId === 'services' || dbMajor === 'services') {
    if (effMajor !== 'Services') return false;
  } else if (catId === 'community' || dbMajor === 'community') {
    if (effMajor !== 'Community') return false;
  } else {
    if (effMajor !== 'Products') return false;
  }

  // Computed subcategory ID check
  const computedSubId = getMatchingSubcategoryId(p);
  return computedSubId === sub.id;
};

interface MarketplaceProps {
  onSelectProperty: (prop: Property) => void;
  onOpenReportModal: (targetType: 'property' | 'user', targetId: string, targetName: string) => void;
  onNavigateToPayments?: () => void;
  initialMajorCategory?: string;
  initialType?: string;
  initialFeaturedOnly?: boolean;
  filterKey?: number;
}

export default function Marketplace({ 
  onSelectProperty, 
  onOpenReportModal,
  onNavigateToPayments,
  initialMajorCategory,
  initialType,
  initialFeaturedOnly,
  filterKey
}: MarketplaceProps) {
  const { currentLanguage,
    properties,
    advertisements,
    favorites,
    toggleFavorite,
    currentUser,
    categories,
    t,
    systemSettings
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // Buy or Rent
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    return localStorage.getItem('sof_umer_selected_location') || 'All';
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [bedsMin, setBedsMin] = useState<number | ''>('');
  const [bathsMin, setBathsMin] = useState<number | ''>('');
  const [areaMin, setAreaMin] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [featuredOnlyFilter, setFeaturedOnlyFilter] = useState(false);

  // Redesigned category states
  const [selectedRedesignedCategory, setSelectedRedesignedCategory] = useState<CategoryRedesign | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const filteredRedesignedCategories = useMemo(() => {
    if (!categorySearchText) return REDESIGNED_CATEGORIES;
    const q = (categorySearchText || '').toLowerCase();
    return REDESIGNED_CATEGORIES.map(rc => {
      const catMatches = (rc.name || '').toLowerCase().includes(q) ||
        (rc.translations?.en && rc.translations.en.toLowerCase().includes(q)) ||
        (rc.translations?.am && rc.translations.am.toLowerCase().includes(q)) ||
        (rc.translations?.om && rc.translations.om.toLowerCase().includes(q));

      const filteredSubs = rc.subcategories.filter(sub => 
        (sub.name || '').toLowerCase().includes(q) ||
        (sub.translations?.en && sub.translations.en.toLowerCase().includes(q)) ||
        (sub.translations?.am && sub.translations.am.toLowerCase().includes(q)) ||
        (sub.translations?.om && sub.translations.om.toLowerCase().includes(q))
      );

      if (catMatches || filteredSubs.length > 0) {
        return {
          ...rc,
          subcategories: catMatches ? rc.subcategories : filteredSubs
        };
      }
      return null;
    }).filter((rc): rc is CategoryRedesign => rc !== null);
  }, [categorySearchText]);
  
  // Advanced custom category filter states
  const [filterBuyRent, setFilterBuyRent] = useState<string>('All');
  const [filterPriceMin, setFilterPriceMin] = useState<number | ''>('');
  const [filterPriceMax, setFilterPriceMax] = useState<number | ''>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterBedrooms, setFilterBedrooms] = useState<string>('All');
  const [filterBathrooms, setFilterBathrooms] = useState<string>('All');
  const [filterArea, setFilterArea] = useState<number | ''>('');
  const [filterFurnished, setFilterFurnished] = useState<boolean | null>(null);
  const [filterParking, setFilterParking] = useState<boolean | null>(null);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  
  // Custom states for other categories
  const [filterVehBrand, setFilterVehBrand] = useState<string>('');
  const [filterVehTransmission, setFilterVehTransmission] = useState<string>('All');
  const [filterVehFuel, setFilterVehFuel] = useState<string>('All');
  const [filterVehCondition, setFilterVehCondition] = useState<string>('All');
  const [filterElecBrand, setFilterElecBrand] = useState<string>('');
  const [filterElecCondition, setFilterElecCondition] = useState<string>('All');
  const [filterElecStorage, setFilterElecStorage] = useState<string>('All');
  const [filterJobType, setFilterJobType] = useState<string>('All');
  const [filterJobIndustry, setFilterJobIndustry] = useState<string>('All');

  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Local storage structures for Saved, Favorite, Recently Viewed, Recently Searched
  const [savedCatIds, setSavedCatIds] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('sof_umer_saved_categories');
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });
  const [favCatIds, setFavCatIds] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('sof_umer_favorite_categories');
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('sof_umer_recently_viewed');
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });
  const [recentlySearchedQueries, setRecentlySearchedQueries] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('sof_umer_recently_searched');
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });

  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  React.useEffect(() => {
    if (initialMajorCategory !== undefined) {
      setSelectedMajorCategory(initialMajorCategory);
      const found = REDESIGNED_CATEGORIES.find(c => 
        c.name && initialMajorCategory && c.name.toLowerCase() === initialMajorCategory.toLowerCase() ||
        c.id && initialMajorCategory && c.id.toLowerCase() === initialMajorCategory.toLowerCase()
      );
      if (found) {
        setSelectedRedesignedCategory(found);
        setSelectedSubcategory(null);
      }
    }
    if (initialType !== undefined) {
      setSelectedType(initialType);
    } else {
      setSelectedType('All');
    }
    if (initialFeaturedOnly !== undefined) {
      setFeaturedOnlyFilter(initialFeaturedOnly);
    } else {
      setFeaturedOnlyFilter(false);
    }
  }, [initialMajorCategory, initialType, initialFeaturedOnly, filterKey]);

  // Sync selectedRedesignedCategory with selectedMajorCategory if clicked elsewhere
  React.useEffect(() => {
    if (selectedMajorCategory && selectedMajorCategory !== 'All') {
      const found = REDESIGNED_CATEGORIES.find(c => 
        c.name && selectedMajorCategory && c.name.toLowerCase() === selectedMajorCategory.toLowerCase() ||
        c.id && selectedMajorCategory && c.id.toLowerCase() === selectedMajorCategory.toLowerCase()
      );
      if (found && selectedRedesignedCategory?.id !== found.id) {
        setSelectedRedesignedCategory(found);
        setSelectedSubcategory(null);
      }
    } else if (selectedMajorCategory === 'All') {
      if (selectedRedesignedCategory !== null) {
        setSelectedRedesignedCategory(null);
        setSelectedSubcategory(null);
      }
    }
  }, [selectedMajorCategory]);

  // Extract unique locations for the filter
  const locations = useMemo(() => {
    const list = properties.map(p => {
      const parts = (p.location || '').split(',');
      return parts[parts.length - 1].trim();
    });
    return Array.from(new Set(list));
  }, [properties]);

  // Types list
  const propertyTypes = ['All', 'Apartments', 'Houses', 'Offices', 'Commercial', 'Land'];

  // Transaction categories list
  const transactionCategories = ['All', 'Buy', 'Rent'];

  // Filter properties dynamically
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      if ((prop as any).isArchived) return false;
      if (prop.approvalStatus === 'rejected' || prop.approvalStatus === 'pending' || prop.verificationStatus === 'pending') return false;

      // Search text
      const matchesSearch =
        extractString(prop.title, currentLanguage).toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        extractString(prop.description, currentLanguage).toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        extractString(prop.location, currentLanguage).toLowerCase().includes((searchQuery || '').toLowerCase());

      // Major category filter
      const matchesMajorCategory =
        selectedMajorCategory === 'All' ||
        prop.majorCategory === selectedMajorCategory ||
        (selectedMajorCategory === 'Properties' && (!prop.majorCategory || prop.majorCategory === 'Properties'));

      // Type filter
      const matchesType = selectedType === 'All' || prop.propertyType === selectedType;

      // Category filter (Buy / Rent) is only applicable for Properties category
      const matchesCategory =
        selectedCategory === 'All' ||
        prop.category === selectedCategory;

      // Location filter
      const matchesLocation = matchesLocationFilter(prop.location, selectedLocation);

      // Currency filter
      const matchesCurrency = selectedCurrency === 'All' || prop.currency === selectedCurrency;

      // Price filter
      const matchesMinPrice = priceMin === '' || prop.price >= priceMin;
      const matchesMaxPrice = priceMax === '' || prop.price <= priceMax;

      // Beds filter
      const matchesBeds = bedsMin === '' || prop.bedrooms >= bedsMin;

      // Baths filter
      const matchesBaths = bathsMin === '' || prop.bathrooms >= bathsMin;

      // Area filter
      const matchesArea = areaMin === '' || prop.area >= areaMin;

      // Featured only filter from footer
      const matchesFeaturedOnly = !featuredOnlyFilter || prop.isFeatured;

      // Only display approved/verified properties to the public
      const isApproved = prop.verificationStatus === 'verified' || prop.isVerifiedListing === true;

      return (
        isApproved &&
        matchesSearch &&
        matchesMajorCategory &&
        matchesType &&
        matchesCategory &&
        matchesLocation &&
        matchesCurrency &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBeds &&
        matchesBaths &&
        matchesArea &&
        matchesFeaturedOnly
      );
    });
  }, [
    properties,
    searchQuery,
    selectedMajorCategory,
    selectedType,
    selectedCategory,
    selectedLocation,
    selectedCurrency,
    priceMin,
    priceMax,
    bedsMin,
    bathsMin,
    areaMin,
    featuredOnlyFilter
  ]);

  // Separate properties into sections
  const featuredProperties = useMemo(() => {
    return filteredProperties.filter(p => p.isFeatured);
  }, [filteredProperties]);

  const recommendedProperties = useMemo(() => {
    return filteredProperties.filter(p => p.isRecommended && !p.isFeatured);
  }, [filteredProperties]);

  const latestProperties = useMemo(() => {
    // Sort by date/id descending, excluding featured and recommended to avoid double displaying
    return [...filteredProperties]
      .filter(p => !p.isFeatured && !p.isRecommended)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filteredProperties]);

  // Helper to count listings matching our redesigned categories
  const getCategoryListingCount = (cat: CategoryRedesign) => {
    return calcCategoryCount(cat, properties);
  };

  // Properties within active redesigned category
  const categoryProperties = useMemo(() => {
    if (!selectedRedesignedCategory) return properties;

    return properties.filter(p => {
      const isApproved = p.verificationStatus === 'verified' || p.isVerifiedListing === true;
      if (!isApproved) return false;

      const mapping = selectedRedesignedCategory.dbMapping;
      
      // If special category like free, trending, etc.
      if (mapping.isSpecial) {
        if (mapping.isSpecial === 'free') {
          return p.price === 0 || extractString(p.title, currentLanguage).toLowerCase().includes('free') || extractString(p.description, currentLanguage).toLowerCase().includes('free');
        }
        if (mapping.isSpecial === 'trending') {
          return p.isFeatured || p.isRecommended || p.price > 100000;
        }
        if (mapping.isSpecial === 'recent') {
          return true;
        }
        if (mapping.isSpecial === 'popular') {
          return p.isRecommended || p.isVerifiedListing;
        }
      }

      // Match majorCategory
      let matchesMajor = true;
      if (mapping.majorCategory) {
        matchesMajor = p.majorCategory === mapping.majorCategory;
        if (mapping.majorCategory === 'Properties') {
          matchesMajor = p.majorCategory === 'Properties' || !p.majorCategory;
        }
      }

      // Match keywords in propertyType, title or description
      let matchesKeywords = true;
      if (mapping.propertyTypeKeywords && mapping.propertyTypeKeywords.length > 0) {
        const titleLower = extractString(p.title, currentLanguage).toLowerCase();
        const descLower = extractString(p.description, currentLanguage).toLowerCase();
        const typeLower = extractString(p.propertyType, currentLanguage).toLowerCase();
        
        matchesKeywords = mapping.propertyTypeKeywords.some(keyword => {
          const kw = (keyword || '').toLowerCase();
          return titleLower.includes(kw) || descLower.includes(kw) || typeLower.includes(kw);
        });
      }

      return matchesMajor && matchesKeywords;
    });
  }, [properties, selectedRedesignedCategory]);

  // Subcategory filter within redesigned category
  const subcategoryProperties = useMemo(() => {
    if (!selectedSubcategory || !selectedRedesignedCategory) return categoryProperties;
    
    return categoryProperties.filter(p => matchesSubcategory(p, selectedSubcategory, selectedRedesignedCategory));
  }, [categoryProperties, selectedSubcategory, selectedRedesignedCategory]);

  const getSubcategoryListingCount = (sub: Subcategory, rc: CategoryRedesign) => {
    return calcSubCount(sub.id, properties, rc.id);
  };

  // Final filtered list including search query, specific filters, sorting
  const finalFilteredProperties = useMemo(() => {
    let list = [...subcategoryProperties];

    // 1. Search text within category
    if (catSearchQuery) {
      const q = (catSearchQuery || '').toLowerCase();
      list = list.filter(p => 
        extractString(p.title, currentLanguage).toLowerCase().includes(q) || 
        extractString(p.description, currentLanguage).toLowerCase().includes(q) || 
        extractString(p.location, currentLanguage).toLowerCase().includes(q)
      );
    }

    // 2. Buy / Rent filter (applicable to Properties and general)
    if (filterBuyRent !== 'All') {
      list = list.filter(p => p.category === filterBuyRent);
    }

    // 3. Price min
    if (filterPriceMin !== '') {
      list = list.filter(p => p.price >= filterPriceMin);
    }

    // 4. Price max
    if (filterPriceMax !== '') {
      list = list.filter(p => p.price <= filterPriceMax);
    }

    // 5. Region / City
    if (filterRegion) {
      const reg = (filterRegion || '').toLowerCase();
      list = list.filter(p => extractString(p.location, currentLanguage).toLowerCase().includes(reg));
    }
    if (filterCity) {
      const city = (filterCity || '').toLowerCase();
      list = list.filter(p => extractString(p.location, currentLanguage).toLowerCase().includes(city));
    }

    // 6. Bedrooms
    if (filterBedrooms !== 'All') {
      const beds = Number(filterBedrooms);
      list = list.filter(p => p.bedrooms !== undefined && p.bedrooms >= beds);
    }

    // 7. Bathrooms
    if (filterBathrooms !== 'All') {
      const baths = Number(filterBathrooms);
      list = list.filter(p => p.bathrooms !== undefined && p.bathrooms >= baths);
    }

    // 8. Area/Size
    if (filterArea !== '') {
      list = list.filter(p => p.area !== undefined && p.area >= filterArea);
    }

    // 9. Furnished
    if (filterFurnished !== null) {
      list = list.filter(p => p.amenities && p.amenities.some(a => extractString(a, currentLanguage).toLowerCase().includes('furnish') === filterFurnished));
    }

    // 10. Parking
    if (filterParking !== null) {
      list = list.filter(p => p.amenities && p.amenities.some(a => extractString(a, currentLanguage).toLowerCase().includes('parking') === filterParking));
    }

    // 11. Verified only
    if (filterVerifiedOnly) {
      list = list.filter(p => p.isVerifiedListing || p.verificationStatus === 'verified');
    }

    // 12. Vehicles - Brand, Transmission, Fuel, Condition
    if (filterVehBrand) {
      const brand = (filterVehBrand || '').toLowerCase();
      list = list.filter(p => extractString(p.title, currentLanguage).toLowerCase().includes(brand) || extractString(p.description, currentLanguage).toLowerCase().includes(brand));
    }
    if (filterVehTransmission !== 'All') {
      const trans = (filterVehTransmission || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(trans) || extractString(p.title, currentLanguage).toLowerCase().includes(trans));
    }
    if (filterVehFuel !== 'All') {
      const fuel = (filterVehFuel || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(fuel) || extractString(p.title, currentLanguage).toLowerCase().includes(fuel));
    }
    if (filterVehCondition !== 'All') {
      const cond = (filterVehCondition || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(cond) || extractString(p.title, currentLanguage).toLowerCase().includes(cond));
    }

    // 13. Phones & Electronics - Brand, Condition, Storage
    if (filterElecBrand) {
      const brand = (filterElecBrand || '').toLowerCase();
      list = list.filter(p => extractString(p.title, currentLanguage).toLowerCase().includes(brand) || extractString(p.description, currentLanguage).toLowerCase().includes(brand));
    }
    if (filterElecCondition !== 'All') {
      const cond = (filterElecCondition || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(cond) || extractString(p.title, currentLanguage).toLowerCase().includes(cond));
    }
    if (filterElecStorage !== 'All') {
      const stor = (filterElecStorage || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(stor) || extractString(p.title, currentLanguage).toLowerCase().includes(stor));
    }

    // 14. Jobs - Type, Industry
    if (filterJobType !== 'All') {
      const jt = (filterJobType || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(jt) || extractString(p.title, currentLanguage).toLowerCase().includes(jt) || extractString(p.category, currentLanguage).toLowerCase().includes(jt));
    }
    if (filterJobIndustry !== 'All') {
      const ind = (filterJobIndustry || '').toLowerCase();
      list = list.filter(p => extractString(p.description, currentLanguage).toLowerCase().includes(ind) || extractString(p.title, currentLanguage).toLowerCase().includes(ind));
    }

    // Sort options: Newest, Oldest, Lowest Price, Highest Price, Most Popular, Best Rated
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      if (sortBy === 'lowest') {
        return a.price - b.price;
      }
      if (sortBy === 'highest') {
        return b.price - a.price;
      }
      if (sortBy === 'popular') {
        const valA = (a.isFeatured ? 2 : 0) + (a.isRecommended ? 1 : 0);
        const valB = (b.isFeatured ? 2 : 0) + (b.isRecommended ? 1 : 0);
        return valB - valA;
      }
      if (sortBy === 'rated') {
        const valA = (a.isVerifiedListing ? 2 : 0) + (a.isFeatured ? 1 : 0);
        const valB = (b.isVerifiedListing ? 2 : 0) + (b.isFeatured ? 1 : 0);
        return valB - valA;
      }
      return 0;
    });

    return list;
  }, [
    subcategoryProperties,
    catSearchQuery,
    filterBuyRent,
    filterPriceMin,
    filterPriceMax,
    filterRegion,
    filterCity,
    filterBedrooms,
    filterBathrooms,
    filterArea,
    filterFurnished,
    filterParking,
    filterVerifiedOnly,
    filterVehBrand,
    filterVehTransmission,
    filterVehFuel,
    filterVehCondition,
    filterElecBrand,
    filterElecCondition,
    filterElecStorage,
    filterJobType,
    filterJobIndustry,
    sortBy
  ]);

  // Handlers for our premium interactive features
  const handleSelectRedesignedCategory = (cat: CategoryRedesign) => {
    setSelectedRedesignedCategory(cat);
    setSelectedSubcategory(null);
    setCatSearchQuery('');
    setVisibleCount(6);
    setSelectedMajorCategory(cat.name); // Keeps 100% back-compatibility sync
    
    // Add to recently viewed list
    const updated = [cat.id, ...recentlyViewedIds.filter(id => id !== cat.id)].slice(0, 5);
    setRecentlyViewedIds(updated);
    localStorage.setItem('sof_uploader_recently_viewed', JSON.stringify(updated));
  };

  const handleToggleSaveCategory = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedCatIds.includes(catId)) {
      updated = savedCatIds.filter(id => id !== catId);
      showToast(currentLanguage === 'am' ? 'ምድብ ተሰርዟል' : currentLanguage === 'om' ? 'Koreen haqameera' : 'Category removed from saved');
    } else {
      updated = [...savedCatIds, catId];
      showToast(currentLanguage === 'am' ? 'ምድብ ተቀምጧል' : currentLanguage === 'om' ? 'Koreen saved ta’eera' : 'Category saved successfully!');
    }
    setSavedCatIds(updated);
    localStorage.setItem('sof_umer_saved_categories', JSON.stringify(updated));
  };

  const handleToggleFavoriteCategory = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (favCatIds.includes(catId)) {
      updated = favCatIds.filter(id => id !== catId);
      showToast(currentLanguage === 'am' ? 'ምድብ ከምርጦች ተወግዷል' : currentLanguage === 'om' ? 'Koreen jaallatame haqameera' : 'Category removed from favorites');
    } else {
      updated = [...favCatIds, catId];
      showToast(currentLanguage === 'am' ? 'ምድብ ወደ ምርጦች ተጨምሯል' : currentLanguage === 'om' ? 'Koreen jaallatame dabalameera' : 'Category added to favorites!');
    }
    setFavCatIds(updated);
    localStorage.setItem('sof_umer_favorite_categories', JSON.stringify(updated));
  };

  const handleShareCategory = (cat: CategoryRedesign, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?category=${cat.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast(currentLanguage === 'am' ? 'ሊንኩ ተገልብጧል!' : currentLanguage === 'om' ? 'Liinkiin kooppii ta’eera!' : 'Category link copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy link');
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (catSearchQuery.trim()) {
      const query = catSearchQuery.trim();
      const updated = [query, ...recentlySearchedQueries.filter(q => q !== query)].slice(0, 5);
      setRecentlySearchedQueries(updated);
      localStorage.setItem('sof_umer_recently_searched', JSON.stringify(updated));
    }
  };

  const clearAllCatFilters = () => {
    setCatSearchQuery('');
    setFilterBuyRent('All');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setFilterRegion('');
    setFilterCity('');
    setFilterBedrooms('All');
    setFilterBathrooms('All');
    setFilterArea('');
    setFilterFurnished(null);
    setFilterParking(null);
    setFilterVerifiedOnly(false);
    setFilterVehBrand('');
    setFilterVehTransmission('All');
    setFilterVehFuel('All');
    setFilterVehCondition('All');
    setFilterElecBrand('');
    setFilterElecCondition('All');
    setFilterElecStorage('All');
    setFilterJobType('All');
    setFilterJobIndustry('All');
    setSelectedSubcategory(null);
  };

  const renderCategoryIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Home': return <Home className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Sofa': return <Sofa className={className} />;
      case 'Shirt': return <Shirt className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      case 'Hammer': return <Hammer className={className} />;
      case 'Factory': return <Factory className={className} />;
      case 'Wheat': return <Wheat className={className} />;
      case 'Footprint': return <Footprints className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'CalendarDays': return <CalendarDays className={className} />;
      case 'Gamepad2': return <Gamepad2 className={className} />;
      case 'Baby': return <Baby className={className} />;
      case 'Recycle': return <Recycle className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      default: return <Grid className={className} />;
    }
  };

  // Active advertisements matching positions
  const heroAds = advertisements.filter(a => a.isActive && a.position === 'hero');
  const sidebarAds = advertisements.filter(a => a.isActive && a.position === 'sidebar');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Wallet Balance & Quick Top Up Banner for Logged-In Users */}
      {currentUser && (
        <div className="mb-6 p-4.5 rounded-2xl bg-gradient-to-r from-[#0d0d14] via-[#141522] to-[#0d0d14] border border-amber-500/25 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">{t('marketplace_wallet_balance') || 'Marketplace Wallet Balance'}</span>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black font-mono text-amber-400">
                  {(currentUser.walletBalance || 0).toLocaleString()} ETB
                </span>
                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                  {t('active_credits') || 'Active Credits'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onNavigateToPayments && (
              <button
                onClick={onNavigateToPayments}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 transition duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('top_up_wallet') || 'Top Up Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Hero Advertisement / Welcome Banner */}
      {heroAds.length > 0 ? (
        <div className="mb-10 rounded-3xl overflow-hidden relative bg-[#0e0e13] text-[#F5F5F4] min-h-[220px] flex flex-col md:flex-row items-center justify-between p-8 md:p-10 border border-white/5 shadow-2xl relative">
          <div className="z-10 max-w-xl text-left">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-full mb-4 inline-block tracking-widest shadow-md">
              Special Promotion
            </span>
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-3 leading-tight tracking-wide">
              {heroAds[0].title}
            </h3>
            <p className="text-[#F5F5F4]/70 text-sm mb-6 leading-relaxed font-light">
              {heroAds[0].description}
            </p>
            <a
              href={heroAds[0].linkUrl}
              className="inline-flex items-center gap-2 bg-[#F5F5F4] hover:bg-zinc-200 text-[#050505] font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-6 md:mt-0 z-10 w-full md:w-1/3 h-44 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src={heroAds[0].imageUrl}
              alt="Promo"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="mb-6 flex justify-start animate-fade-in">
          <button
            id="all-categories-trigger"
            onClick={() => setIsAllCategoriesOpen(true)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-350 hover:to-amber-550 text-black font-extrabold uppercase tracking-widest text-xs rounded-2xl transition duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/25 cursor-pointer border border-amber-300/10"
          >
            <Folder className="w-4 h-4 fill-black" />
            <span>{t('all_categories') || 'ALL CATEGORIES'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-black font-semibold px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5 text-black animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedRedesignedCategory ? (
        <div className="animate-fade-in text-left">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-white/50 bg-[#0d0d12]/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 w-fit">
            <button 
              onClick={() => { setSelectedRedesignedCategory(null); setSelectedSubcategory(null); setSelectedMajorCategory('All'); }}
              className="hover:text-amber-400 transition flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
            >
              <Home className="w-3.5 h-3.5" /> {t('home_tab') || 'Home'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 text-amber-500" />
            <button 
              onClick={() => setSelectedSubcategory(null)}
              className={`hover:text-amber-400 transition font-bold uppercase tracking-wider cursor-pointer ${!selectedSubcategory ? 'text-amber-400' : ''}`}
            >
              {currentLanguage === 'am' ? selectedRedesignedCategory.nameAm : currentLanguage === 'om' ? selectedRedesignedCategory.nameOm : selectedRedesignedCategory.name}
            </button>
            {selectedSubcategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-60 text-amber-500" />
                <span className="text-white/80 font-bold uppercase tracking-wider truncate">
                  {currentLanguage === 'am' ? selectedSubcategory.nameAm : currentLanguage === 'om' ? selectedSubcategory.nameOm : selectedSubcategory.name}
                </span>
              </>
            )}
          </div>

          {/* Interactive Category Header Card / Banner */}
          <div className={`mb-8 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl min-h-[160px] flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 ${selectedRedesignedCategory.bannerGradient}`}>
            {/* Ambient Background overlays */}
            <div className="absolute inset-0 bg-black/45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-5 text-left w-full sm:w-auto">
              <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shrink-0 shadow-inner">
                {renderCategoryIcon(selectedRedesignedCategory.icon, "w-8 h-8 text-white")}
              </div>
              <div>
                <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase block mb-1">{t('so_umer_catalogs') || 'SOF UMER CATALOGS'}</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide">
                  {currentLanguage === 'am' ? selectedRedesignedCategory.nameAm : currentLanguage === 'om' ? selectedRedesignedCategory.nameOm : selectedRedesignedCategory.name}
                </h2>
                <p className="text-white/70 text-xs mt-1 font-light tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block animate-pulse" />
                  {subcategoryProperties.length} {currentLanguage === 'om' ? 'beeksisa soscho\'an argaman' : currentLanguage === 'am' ? 'ንቁ ማስታወቂያዎች ተገኝተዋል' : 'active listings found'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="relative z-10 flex flex-wrap gap-2.5 mt-6 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
              <button
                onClick={(e) => handleToggleSaveCategory(selectedRedesignedCategory.id, e)}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-lg ${
                  savedCatIds.includes(selectedRedesignedCategory.id)
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-black/40 hover:bg-black/60 text-white border-white/10'
                }`}
                title="Save Category"
              >
                {savedCatIds.includes(selectedRedesignedCategory.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>{t('saved') || 'Saved'}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>{t('save') || 'Save'}</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => handleToggleFavoriteCategory(selectedRedesignedCategory.id, e)}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-lg ${
                  favCatIds.includes(selectedRedesignedCategory.id)
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-black/40 hover:bg-black/60 text-white/90 border-white/10'
                }`}
                title="Favorite Category"
              >
                <Heart className={`w-4 h-4 ${favCatIds.includes(selectedRedesignedCategory.id) ? 'fill-white' : ''}`} />
                <span>{favCatIds.includes(selectedRedesignedCategory.id) ? (t('favorited') || 'Favorited') : (t('favorite') || 'Favorite')}</span>
              </button>

              <button
                onClick={(e) => handleShareCategory(selectedRedesignedCategory, e)}
                className="p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-lg"
                title="Share Category"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('share') || 'Share'}</span>
              </button>

              <button
                onClick={() => { setSelectedRedesignedCategory(null); setSelectedSubcategory(null); setSelectedMajorCategory('All'); }}
                className="p-3 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg ml-auto sm:ml-0"
              >
                <X className="w-4 h-4" />
                <span>{t('exit') || 'Exit'}</span>
              </button>
            </div>
          </div>

          {/* Subcategories Selector Bar */}
          <div className="mb-8 text-left">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <span>EXPLORE SUBCATEGORIES</span>
              <span className="h-[1px] bg-white/5 flex-1" />
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
                  !selectedSubcategory
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black border-transparent shadow-lg shadow-amber-500/10'
                    : 'bg-[#0d0d12]/50 text-white/70 border-white/5 hover:border-white/15 hover:bg-[#12121b]'
                }`}
              >
                All {currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name}
              </button>
              {selectedRedesignedCategory.subcategories.map(sub => {
                const subCount = getSubcategoryListingCount(sub, selectedRedesignedCategory);

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(selectedSubcategory?.id === sub.id ? null : sub)}
                    className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      selectedSubcategory?.id === sub.id
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#0d0d12]/50 text-white/70 border-white/5 hover:border-white/15 hover:bg-[#12121b]'
                    }`}
                  >
                    <span>{currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name}</span>
                    <span className={`text-[10px] ${selectedSubcategory?.id === sub.id ? 'text-black/60' : 'text-white/30'}`}>
                      ({subCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tailored Search & Filters Panel */}
          <div className="bg-[#0e0e13]/95 rounded-3xl border border-white/5 p-6 md:p-8 mb-8 text-left backdrop-blur-2xl relative shadow-xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={catSearchQuery}
                  onChange={e => setCatSearchQuery(e.target.value)}
                  placeholder={`Search inside ${currentLanguage === 'am' ? selectedRedesignedCategory.nameAm : currentLanguage === 'om' ? selectedRedesignedCategory.nameOm : selectedRedesignedCategory.name}...`}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#12121a] border border-white/5 focus:border-amber-500/50 focus:outline-none rounded-2xl text-[#F5F5F4] text-sm transition font-sans"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    showFilters
                      ? 'bg-white text-[#050505] border-white shadow-lg'
                      : 'bg-[#12121a] border-white/5 text-[#F5F5F4]/80 hover:bg-[#161622] hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters {selectedRedesignedCategory.recommendedFilters && `(${selectedRedesignedCategory.recommendedFilters.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={clearAllCatFilters}
                  className="px-5 py-3.5 rounded-2xl bg-white/5 text-[#F5F5F4]/70 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-white/5"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Custom Interactive Drawer for tailored filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-6 border-t border-white/5">
                    {/* Render properties specific filters */}
                    {selectedRedesignedCategory.id === 'properties' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Buy / Rent</label>
                          <select
                            value={filterBuyRent}
                            onChange={e => setFilterBuyRent(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">All Transactions</option>
                            <option value="Buy" className="bg-[#0c0c0c]">For Sale</option>
                            <option value="Rent" className="bg-[#0c0c0c]">For Rent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Min Bedrooms</label>
                          <select
                            value={filterBedrooms}
                            onChange={e => setFilterBedrooms(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Bedrooms</option>
                            <option value="1" className="bg-[#0c0c0c]">1+ Bedrooms</option>
                            <option value="2" className="bg-[#0c0c0c]">2+ Bedrooms</option>
                            <option value="3" className="bg-[#0c0c0c]">3+ Bedrooms</option>
                            <option value="4" className="bg-[#0c0c0c]">4+ Bedrooms</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Furnishing Status</label>
                          <select
                            value={filterFurnished === null ? 'All' : filterFurnished ? 'yes' : 'no'}
                            onChange={e => setFilterFurnished(e.target.value === 'All' ? null : e.target.value === 'yes')}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Furnishing</option>
                            <option value="yes" className="bg-[#0c0c0c]">Fully Furnished</option>
                            <option value="no" className="bg-[#0c0c0c]">Unfurnished</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Parking Space</label>
                          <select
                            value={filterParking === null ? 'All' : filterParking ? 'yes' : 'no'}
                            onChange={e => setFilterParking(e.target.value === 'All' ? null : e.target.value === 'yes')}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Parking</option>
                            <option value="yes" className="bg-[#0c0c0c]">Has Parking Space</option>
                            <option value="no" className="bg-[#0c0c0c]">No Parking</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Render vehicles specific filters */}
                    {selectedRedesignedCategory.id === 'vehicles' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Brand / Make</label>
                          <input
                            type="text"
                            value={filterVehBrand}
                            onChange={e => setFilterVehBrand(e.target.value)}
                            placeholder="Toyota, Hyundai..."
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Transmission</label>
                          <select
                            value={filterVehTransmission}
                            onChange={e => setFilterVehTransmission(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">All Transmissions</option>
                            <option value="Automatic" className="bg-[#0c0c0c]">Automatic</option>
                            <option value="Manual" className="bg-[#0c0c0c]">Manual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Fuel Type</label>
                          <select
                            value={filterVehFuel}
                            onChange={e => setFilterVehFuel(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">All Fuels</option>
                            <option value="Petrol" className="bg-[#0c0c0c]">Petrol</option>
                            <option value="Diesel" className="bg-[#0c0c0c]">Diesel</option>
                            <option value="Electric" className="bg-[#0c0c0c]">Electric (EV)</option>
                            <option value="Hybrid" className="bg-[#0c0c0c]">Hybrid</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Condition</label>
                          <select
                            value={filterVehCondition}
                            onChange={e => setFilterVehCondition(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Condition</option>
                            <option value="New" className="bg-[#0c0c0c]">Brand New</option>
                            <option value="Used" className="bg-[#0c0c0c]">Used / Secondhand</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Render phones & electronics specific filters */}
                    {(selectedRedesignedCategory.id === 'phones' || selectedRedesignedCategory.id === 'electronics') && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Brand / Model</label>
                          <input
                            type="text"
                            value={filterElecBrand}
                            onChange={e => setFilterElecBrand(e.target.value)}
                            placeholder="Apple, Samsung, Sony..."
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Storage Capacity</label>
                          <select
                            value={filterElecStorage}
                            onChange={e => setFilterElecStorage(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Storage</option>
                            <option value="64GB" className="bg-[#0c0c0c]">64GB</option>
                            <option value="128GB" className="bg-[#0c0c0c]">128GB</option>
                            <option value="256GB" className="bg-[#0c0c0c]">256GB</option>
                            <option value="512GB" className="bg-[#0c0c0c]">512GB+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Condition</label>
                          <select
                            value={filterElecCondition}
                            onChange={e => setFilterElecCondition(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">Any Condition</option>
                            <option value="New" className="bg-[#0c0c0c]">New / Unopened</option>
                            <option value="Used" className="bg-[#0c0c0c]">Used / Refurbished</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Verified Sellers Only</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-[#12121a] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-white/10 bg-[#12121a] text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-white/80 font-medium select-none">Verified Badge</span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Render jobs specific filters */}
                    {(selectedRedesignedCategory.id === 'jobs' || selectedRedesignedCategory.id === 'seeking_work') && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Job Type</label>
                          <select
                            value={filterJobType}
                            onChange={e => setFilterJobType(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">All Job Types</option>
                            <option value="Full-Time" className="bg-[#0c0c0c]">Full-Time</option>
                            <option value="Part-Time" className="bg-[#0c0c0c]">Part-Time</option>
                            <option value="Contract" className="bg-[#0c0c0c]">Contract / Project</option>
                            <option value="Remote" className="bg-[#0c0c0c]">Remote / WFH</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Industry / Sector</label>
                          <select
                            value={filterJobIndustry}
                            onChange={e => setFilterJobIndustry(e.target.value)}
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                          >
                            <option value="All" className="bg-[#0c0c0c]">All Industries</option>
                            <option value="IT" className="bg-[#0c0c0c]">IT & Software development</option>
                            <option value="Healthcare" className="bg-[#0c0c0c]">Healthcare & Medicine</option>
                            <option value="Engineering" className="bg-[#0c0c0c]">Engineering & Tech</option>
                            <option value="Finance" className="bg-[#0c0c0c]">Finance & Banking</option>
                            <option value="Sales" className="bg-[#0c0c0c]">Sales & Marketing</option>
                            <option value="Other" className="bg-[#0c0c0c]">Others / Uncategorized</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Region / City</label>
                          <input
                            type="text"
                            value={filterRegion}
                            onChange={e => setFilterRegion(e.target.value)}
                            placeholder="Addis Ababa, Oromia..."
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Verified Only</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-[#12121a] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-white/10 bg-[#12121a] text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-white/80 font-medium select-none">Verified Matches</span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Fallback general purpose filters */}
                    {selectedRedesignedCategory.id !== 'properties' && selectedRedesignedCategory.id !== 'vehicles' && selectedRedesignedCategory.id !== 'phones' && selectedRedesignedCategory.id !== 'electronics' && selectedRedesignedCategory.id !== 'jobs' && selectedRedesignedCategory.id !== 'seeking_work' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Min Price</label>
                          <input
                            type="number"
                            value={filterPriceMin}
                            onChange={e => setFilterPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Any price"
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Max Price</label>
                          <input
                            type="number"
                            value={filterPriceMax}
                            onChange={e => setFilterPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Any price"
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Region / City</label>
                          <input
                            type="text"
                            value={filterRegion}
                            onChange={e => setFilterRegion(e.target.value)}
                            placeholder="Oromia, Harar, Addis..."
                            className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Verified Only</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-[#12121a] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-white/10 bg-[#12121a] text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-white/80 font-medium select-none">Verified Listings</span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Toolbar with Sort and View Toggle options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#0d0d12]/30 p-4 rounded-2xl border border-white/5">
            <div className="text-left w-full sm:w-auto">
              <p className="text-xs text-white/50">
                Showing <span className="text-white font-bold">{Math.min(visibleCount, finalFilteredProperties.length)}</span> of <span className="text-amber-400 font-black">{finalFilteredProperties.length}</span> verified results
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden md:inline">Sort By</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-[#12121a] border border-white/5 p-2 px-3 rounded-xl text-xs text-white/80 focus:outline-none focus:border-amber-500/30 cursor-pointer"
                >
                  <option value="newest">Latest Uploads</option>
                  <option value="oldest">Oldest Listings</option>
                  <option value="lowest">Lowest Price</option>
                  <option value="highest">Highest Price</option>
                  <option value="popular">Most Popular</option>
                  <option value="rated">Highly Rated</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Matches List */}
          {finalFilteredProperties.length === 0 ? (
            <div className="bg-[#0d0d12]/60 rounded-3xl border border-white/5 p-16 text-center shadow-lg mb-12 flex flex-col items-center justify-center">
              <div className="p-4 bg-white/5 rounded-full mb-4 text-white/30 border border-white/5">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-serif text-white font-semibold">No listings fit your filters</h4>
              <p className="text-white/40 text-xs mt-2 max-w-sm leading-relaxed">
                Try resetting filters or expanding search words to find similar listings within this marketplace.
              </p>
              <button
                onClick={clearAllCatFilters}
                className="mt-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="mb-12">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8' : 'grid grid-cols-1 gap-6'}>
                {finalFilteredProperties.slice(0, visibleCount).map(prop => {
                  const isPremium = prop.isFeatured || prop.isRecommended;
                  if (viewMode === 'list') {
                    return (
                      <div key={prop.id} className="bg-[#0d0d12]/50 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden shadow-xl flex flex-col md:flex-row text-left">
                        <div className="md:w-1/3 relative h-56 md:h-auto overflow-hidden group shrink-0">
                          <img
                            src={prop.imageUrl}
                            alt={extractString(prop.title, currentLanguage)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {isPremium && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                              Premium
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-wider mb-2">
                              <span className="bg-white/5 px-2 py-1 rounded">{prop.propertyType || 'Item'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> {extractString(prop.location, currentLanguage)}</span>
                            </div>
                            <h4 className="text-lg font-bold font-serif text-white hover:text-amber-400 cursor-pointer transition line-clamp-1" onClick={() => onSelectProperty(prop)}>
                              {extractString(prop.title, currentLanguage)}
                            </h4>
                            <p className="text-white/60 text-xs mt-2 line-clamp-2 leading-relaxed font-light">
                              {extractString(prop.description, currentLanguage)}
                            </p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="text-amber-400 font-extrabold text-lg tracking-wide">
                              {prop.currency} {prop.price.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleFavorite(prop.id)}
                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 transition cursor-pointer"
                              >
                                <Heart className={`w-4 h-4 ${favorites.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </button>
                              <button
                                onClick={() => onSelectProperty(prop)}
                                className="px-4 py-2 bg-[#F5F5F4] hover:bg-zinc-200 text-[#050505] text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1"
                              >
                                Details <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onSelect={onSelectProperty}
                      favorites={favorites}
                      onToggleFav={toggleFavorite}
                      onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                      t={t}
                      currentLanguage={currentLanguage}
                    />
                  );
                })}
              </div>

              {/* Load More Button */}
              {visibleCount < finalFilteredProperties.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold uppercase tracking-widest px-8 py-4 rounded-2xl text-xs transition duration-300 hover:opacity-95 cursor-pointer shadow-lg hover:scale-[1.01]"
                  >
                    Load More Items <ArrowRight className="w-4 h-4 text-black animate-pulse" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in text-left">

          {/* Recently Viewed & Searched strip */}
          {(recentlyViewedIds.length > 0 || recentlySearchedQueries.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
              {recentlyViewedIds.length > 0 && (
                <div className="bg-[#0c0c11]/50 border border-white/5 rounded-3xl p-5">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {t('recently_viewed_categories')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentlyViewedIds.map(id => {
                      const matched = REDESIGNED_CATEGORIES.find(c => c.id === id);
                      if (!matched) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => handleSelectRedesignedCategory(matched)}
                          className="px-3 py-1.5 bg-[#12121a] hover:bg-amber-500 hover:text-black border border-white/5 hover:border-transparent text-xs text-white/70 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {renderCategoryIcon(matched.iconName, "w-3.5 h-3.5")}
                          <span>{currentLanguage === 'am' ? matched.translations.am : currentLanguage === 'om' ? matched.translations.om : matched.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {recentlySearchedQueries.length > 0 && (
                <div className="bg-[#0c0c11]/50 border border-white/5 rounded-3xl p-5">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-500" /> RECENTLY SEARCHED KEYWORDS
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentlySearchedQueries.map((query, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearchQuery(query); setCatSearchQuery(query); }}
                        className="px-3 py-1.5 bg-[#12121a] hover:bg-zinc-800 border border-white/5 text-xs text-white/70 rounded-xl transition-all cursor-pointer"
                      >
                        "{query}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search bar and default advanced drawer */}
          <div className="bg-[#0e0e13]/90 rounded-3xl border border-white/5 p-6 md:p-8 mb-10 text-left backdrop-blur-xl relative shadow-xl">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* Jiji-Style Location Selector before main search field */}
              <div className="shrink-0">
                <LocationSelectorModal
                  selectedLocation={selectedLocation}
                  onSelectLocation={loc => {
                    setSelectedLocation(loc);
                    localStorage.setItem('sof_umer_selected_location', loc);
                  }}
                  currentLanguage={currentLanguage}
                />
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder') || 'Search properties, offices, listings...'}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#12121a] border border-white/5 focus:border-amber-500/50 focus:outline-none rounded-2xl text-[#F5F5F4] text-sm transition font-sans"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    showFilters
                      ? 'bg-white text-[#050505] border-white shadow-lg'
                      : 'bg-[#12121a] border-white/5 text-[#F5F5F4]/80 hover:bg-[#161622] hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t('filters_btn')}</span>
                </button>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('All');
                    setSelectedCategory('All');
                    setSelectedLocation('All');
                    localStorage.removeItem('sof_umer_selected_location');
                    setSelectedCurrency('All');
                    setPriceMin('');
                    setPriceMax('');
                    setBedsMin('');
                    setBathsMin('');
                    setAreaMin('');
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-white/5 text-[#F5F5F4]/70 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-white/5"
                >
                  {t('reset_btn')}
                </button>
              </div>
            </div>

            {/* Expandable Advanced Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-6 border-t border-white/5">
                    {/* Category Buy/Rent */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('filter_category')}
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                      >
                        {transactionCategories.map(c => (
                          <option key={c} value={c} className="bg-[#0c0c0c]">
                            {c === 'All' ? t('all_transactions') : c === 'Buy' ? t('cat_buy') : c === 'Rent' ? t('cat_rent') : c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('filter_type')}
                      </label>
                      <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                      >
                        {propertyTypes.map(pt => (
                          <option key={pt} value={pt} className="bg-[#0c0c0c]">
                            {pt === 'All' ? t('all_types') : t(`cat_${(pt || '').toLowerCase()}`) || pt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('filter_location')}
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={e => {
                          setSelectedLocation(e.target.value);
                          localStorage.setItem('sof_umer_selected_location', e.target.value);
                        }}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                      >
                        <option value="All" className="bg-[#0c0c0c]">{t('all_locations')}</option>
                        {locations.map(loc => (
                          <option key={loc} value={loc} className="bg-[#0c0c0c]">
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Currency Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('currency_status')}
                      </label>
                      <select
                        value={selectedCurrency}
                        onChange={e => setSelectedCurrency(e.target.value)}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white/80 focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                      >
                        <option value="All" className="bg-[#0c0c0c]">{t('all_currencies')}</option>
                        <option value="ETB" className="bg-[#0c0c0c]">ETB (Ethiopian Birr)</option>
                        <option value="USD" className="bg-[#0c0c0c]">USD (US Dollar)</option>
                        <option value="SAR" className="bg-[#0c0c0c]">SAR (Saudi Riyal)</option>
                        <option value="EUR" className="bg-[#0c0c0c]">EUR (Euro)</option>
                        <option value="AED" className="bg-[#0c0c0c]">AED (UAE Dirham)</option>
                      </select>
                    </div>

                    {/* Price Min/Max */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('min_price')}
                      </label>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={e => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={t('any_value')}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('max_price')}
                      </label>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={e => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={t('any_value')}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>

                    {/* Rooms & Area */}
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('min_bedrooms')}
                      </label>
                      <input
                        type="number"
                        value={bedsMin}
                        onChange={e => setBedsMin(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={t('any_value')}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                        {t('min_area')}
                      </label>
                      <input
                        type="number"
                        value={areaMin}
                        onChange={e => setAreaMin(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={t('any_value')}
                        className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Side: Listings */}
        <div className="lg:col-span-9 space-y-16 animate-fade-in">
          {filteredProperties.length === 0 ? (
            <div className="bg-[#0d0d12]/60 rounded-3xl border border-white/5 p-16 text-center shadow-lg">
              <Building className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h4 className="text-lg font-serif text-white font-semibold">{t('no_listings_found')}</h4>
              <p className="text-white/40 text-sm mt-1.5 font-light">{t('no_listings_found_desc')}</p>
            </div>
          ) : (
            <>
              {/* FEATURED PROPERTIES ROW */}
              {featuredProperties.length > 0 && (
                <div>
                  <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> {t('featured_properties')}</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/30">{t('verified_select_picks')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {featuredProperties.map(prop => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={onSelectProperty}
                        favorites={favorites}
                        onToggleFav={toggleFavorite}
                        onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                        t={t} currentLanguage={currentLanguage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDED FOR YOU */}
              {recommendedProperties.length > 0 && (
                <div>
                  <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">{t('personalized_recommendation')}</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/30">{t('curated_match')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {recommendedProperties.map(prop => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={onSelectProperty}
                        favorites={favorites}
                        onToggleFav={toggleFavorite}
                        onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                        t={t} currentLanguage={currentLanguage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* LATEST LISTINGS */}
              {latestProperties.length > 0 && (
                <div>
                  <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/5 pb-4 flex items-center justify-between">
                    <span>{t('latest_properties') || 'All Listings'}</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/30">{t('recent_offers')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {latestProperties.map(prop => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={onSelectProperty}
                        favorites={favorites}
                        onToggleFav={toggleFavorite}
                        onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                        t={t} currentLanguage={currentLanguage}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Sidebar Adverts & Safety Info */}
        <div className="lg:col-span-3 space-y-8">
          {/* Active Sidebar Advertisements */}
          {sidebarAds.map(ad => (
            <div
              key={ad.id}
              className="bg-[#0d0d12]/80 rounded-3xl overflow-hidden border border-white/5 shadow-2xl text-white relative group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-[#F5F5F4] font-black uppercase tracking-widest text-[8px] px-2.5 py-1.5 rounded-full border border-white/10">
                  {t('sponsored')}
                </span>
              </div>
              <div className="p-6 text-left">
                <h4 className="font-serif text-base text-white mb-1.5 font-semibold">{ad.title}</h4>
                <p className="text-xs text-[#F5F5F4]/60 leading-relaxed mb-5 font-light">{ad.description}</p>
                <a
                  href={ad.linkUrl}
                  className="block text-center bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition duration-300 hover:scale-[1.01]"
                >
                  {t('visit_offer')}
                </a>
              </div>
            </div>
          ))}

          {/* Guidelines info card removed to clear static words from screen */}
        </div>
      </div>

      {/* ALL CATEGORIES Overlay Modal */}
      <AllCategoriesModal
        isOpen={isAllCategoriesOpen}
        onClose={() => setIsAllCategoriesOpen(false)}
        properties={properties}
        currentLanguage={currentLanguage}
        onSelectCategory={(cat, sub, brand) => {
          setSelectedRedesignedCategory(cat);
          setSelectedSubcategory(sub || null);
          setSelectedMajorCategory(cat.name);
          setVisibleCount(6);
          if (brand) {
            setSearchQuery(brand);
          } else {
            setSearchQuery('');
          }
          const updated = [cat.id, ...recentlyViewedIds.filter(id => id !== cat.id)].slice(0, 5);
          setRecentlyViewedIds(updated);
          try {
            localStorage.setItem('sof_umer_recently_viewed', JSON.stringify(updated));
          } catch (e) {}
        }}
        t={t}
      />
    </div>
  );
}

// PropertyCard Subcomponent
interface PropertyCardProps {
  key?: React.Key;
  property: Property;
  onSelect: (prop: Property) => void;
  favorites: string[];
  onToggleFav: (id: string) => void;
  onReport: () => void;
  t: (key: string) => string;
  currentLanguage: string;
}

function PropertyCard({ property, onSelect, favorites, onToggleFav, onReport, t, currentLanguage }: PropertyCardProps) {
  const isFavorite = favorites.includes(property.id);

  return (
    <div className="bg-[#0d0d12]/80 rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col group relative shadow-lg hover:shadow-2xl">
      {/* Category Tag overlay */}
      {(() => {
        if (!property.category) return null;
        const catLower = (property.category || '').toLowerCase().trim();
        let badgeText = '';
        if (catLower === 'buy' || catLower === 'for sale' || catLower === 'sale') {
          badgeText = t('cat_buy') || 'For Sale';
        } else if (catLower === 'rent' || catLower === 'for rent') {
          badgeText = t('cat_rent') || 'For Rent';
        } else if (
          catLower !== (property.propertyType || '').toLowerCase().trim() &&
          catLower !== (property.majorCategory || '').toLowerCase().trim()
        ) {
          badgeText = property.category;
        }
        if (!badgeText) return null;
        return (
          <span className="absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-md bg-[#050505]/80 backdrop-blur-md text-amber-500 border border-white/10">
            {badgeText}
          </span>
        );
      })()}

      {/* Save favorite toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(property.id);
        }}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/5 transition duration-300 group cursor-pointer"
        aria-label="Toggle Favorite"
      >
        <Heart className={`w-4 h-4 transition duration-300 ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white/60 group-hover:text-white'}`} />
      </button>

      {/* Listing Image */}
      <div className="h-56 overflow-hidden relative bg-[#0c0c10] cursor-pointer" onClick={() => onSelect(property)}>
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
          alt={extractString(property.title, currentLanguage) || 'Listing Image'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Property Details Text */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Currency */}
          <div className="flex justify-between items-baseline mb-3">
            <p className="text-xl font-bold text-[#F5F5F4] tracking-tight font-mono">
              {(property.price || 0).toLocaleString()} <span className="text-amber-500/80 text-xs font-bold uppercase tracking-wider ml-1">{property.currency || 'ETB'}</span>
            </p>
            <span className="text-[9px] font-black text-white/50 border border-white/5 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {property.propertyType 
                ? getTranslatedPropertyType(extractString(property.propertyType, currentLanguage), currentLanguage) 
                : getTranslatedCategoryName(extractString(property.majorCategory, currentLanguage), currentLanguage)}
            </span>
          </div>

          {/* Title */}
          <h4
            onClick={() => onSelect(property)}
            className="font-serif text-lg text-[#F5F5F4] hover:text-amber-500 leading-snug mb-2.5 cursor-pointer line-clamp-1 transition duration-300 font-semibold"
          >
            {extractString(property.title, currentLanguage)}
          </h4>

          {/* Location */}
          <p className="text-xs text-[#F5F5F4]/50 flex items-center gap-1.5 mb-5 font-light">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{extractString(property.location, currentLanguage)}</span>
          </p>
        </div>

        {/* Specs row */}
        <div className="border-t border-white/5 pt-4.5 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/60 text-xs font-light">
              {(() => {
                const effMajor = getEffectiveMajorCategory(property);
                if (effMajor === 'Properties') {
                  return (
                    <>
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1 text-[#F5F5F4]/70">
                          <BedDouble className="w-4 h-4 text-white/30" />
                          {property.bedrooms} {t('bed')}
                        </span>
                      )}
                      {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1 text-[#F5F5F4]/70">
                          <Bath className="w-4 h-4 text-white/30" />
                          {property.bathrooms} {t('bath')}
                        </span>
                      )}
                      {property.area > 0 && (
                        <span className="flex items-center gap-1 text-[#F5F5F4]/70">
                          <Maximize className="w-4 h-4 text-white/30" />
                          {property.area} m²
                        </span>
                      )}
                    </>
                  );
                } else {
                  return (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      {getTranslatedPropertyType(property.propertyType || effMajor, currentLanguage)}
                    </span>
                  );
                }
              })()}
            </div>

            {/* View Details Button / Flag Report Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onReport}
                className="p-2 text-white/40 hover:text-red-400 rounded-xl hover:bg-white/5 transition cursor-pointer"
                title="Report listing"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelect(property)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-4.5 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] cursor-pointer shadow-md shadow-amber-500/5"
              >
                {t('details_btn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
