import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { Property, Advertisement } from '../types';
import { 
  Search, MapPin, Building, BedDouble, Bath, Maximize, Heart, ArrowRight, ArrowLeft,
  SlidersHorizontal, Sparkles, ShieldAlert, Briefcase, Wrench, ShoppingBag, 
  Store, Users, Grid, List, Share2, Bookmark, BookmarkCheck, ChevronRight, 
  X, AlertCircle, Home, Car, Smartphone, Laptop, Sofa, Shirt, FileText, 
  Hammer, Factory, Wheat, Footprints, GraduationCap, Activity, Utensils, 
  CalendarDays, Gamepad2, Baby, Recycle, TrendingUp, Clock, Flame, Info, CheckCircle2,
  Folder, ChevronDown, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PRIMARY_CATEGORIES,
  REDESIGNED_CATEGORIES, 
  CategoryRedesign, 
  Subcategory, 
  getMatchingSubcategoryId, 
  getEffectiveMajorCategory, 
  isListingActiveAndPublished, 
  getSubcategoryListingCount as calcSubCount, 
  getCategoryListingCount as calcCategoryCount, 
  getSubcategoryVisual,
  extractString,
  getTranslatedCategoryName,
  getTranslatedSubcategoryName,
  getTranslatedPropertyType,
  getTranslatedOption
} from '../lib/categoriesData';
import { AllCategoriesModal } from './AllCategoriesModal';
import { LocationSelectorModal } from './LocationSelectorModal';
import { matchesLocationFilter } from '../lib/locationData';
import { ListingCard, PropertyCard } from './ListingCard';

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
  } else if (catId === 'businesses' || catId === 'commercial-equipment' || dbMajor === 'local businesses') {
    if (effMajor !== 'Local Businesses' && effMajor !== 'Products' && !p.subCategoryId?.startsWith('comm-')) return false;
  } else if (catId === 'community' || dbMajor === 'community') {
    if (effMajor !== 'Community') return false;
  } else {
    if (effMajor !== 'Products') return false;
  }

  // Handle product group subcategories under Products
  if (sub.id.startsWith('sub-prod-')) {
    const computedSubId = getMatchingSubcategoryId(p);
    if (sub.id === 'sub-prod-electronics') return computedSubId.startsWith('el-');
    if (sub.id === 'sub-prod-fashion') return computedSubId.startsWith('fas-');
    if (sub.id === 'sub-prod-furniture') return computedSubId.startsWith('fur-');
    if (sub.id === 'sub-prod-kids') return computedSubId.startsWith('kid-');
    if (sub.id === 'sub-prod-beauty') return computedSubId.startsWith('hb-');
    if (sub.id === 'sub-prod-agri') return computedSubId.startsWith('agri-');
    if (sub.id === 'sub-prod-pets') return computedSubId.startsWith('pet-');
    if (sub.id === 'sub-prod-sports') return computedSubId.startsWith('spt-');
    if (sub.id === 'sub-prod-edu') return computedSubId.startsWith('edu-');
    if (sub.id === 'sub-prod-other') {
      return (
        computedSubId.startsWith('oth-') ||
        (!computedSubId.startsWith('el-') &&
         !computedSubId.startsWith('fas-') &&
         !computedSubId.startsWith('fur-') &&
         !computedSubId.startsWith('kid-') &&
         !computedSubId.startsWith('hb-') &&
         !computedSubId.startsWith('agri-') &&
         !computedSubId.startsWith('pet-') &&
         !computedSubId.startsWith('spt-') &&
         !computedSubId.startsWith('edu-'))
      );
    }
    return false;
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
  const [filterSellingType, setFilterSellingType] = useState<string>('All');

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

  const popularProperties = useMemo(() => {
    // Popular listings based on real views / interest only
    return [...filteredProperties]
      .filter(p => (Number(p.viewsCount) || 0) > 0)
      .sort((a, b) => (Number(b.viewsCount) || 0) - (Number(a.viewsCount) || 0))
      .slice(0, 6);
  }, [filteredProperties]);

  // Category-specific listings for homepage (only shown when enough real listings exist, count >= 2)
  const propertiesListings = useMemo(() => {
    return properties.filter(p => isListingActiveAndPublished(p) && getEffectiveMajorCategory(p) === 'Properties').slice(0, 6);
  }, [properties]);

  const vehiclesListings = useMemo(() => {
    return properties.filter(p => isListingActiveAndPublished(p) && getEffectiveMajorCategory(p) === 'Vehicles').slice(0, 6);
  }, [properties]);

  const productsListings = useMemo(() => {
    return properties.filter(p => isListingActiveAndPublished(p) && getEffectiveMajorCategory(p) === 'Products').slice(0, 6);
  }, [properties]);

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

      const effMajor = getEffectiveMajorCategory(p);
      const catId = selectedRedesignedCategory.id.toLowerCase();
      const dbMajor = (selectedRedesignedCategory.dbMapping?.majorCategory || '').toLowerCase();

      if (catId === 'properties' || dbMajor === 'properties') {
        return effMajor === 'Properties';
      }
      if (catId === 'vehicles' || dbMajor === 'vehicles') {
        return effMajor === 'Vehicles';
      }
      if (catId === 'jobs' || dbMajor === 'jobs') {
        return effMajor === 'Jobs';
      }
      if (catId === 'services' || dbMajor === 'services') {
        return effMajor === 'Services';
      }
      if (catId === 'businesses' || catId === 'commercial-equipment' || dbMajor === 'local businesses') {
        return (
          effMajor === 'Local Businesses' ||
          (p.subCategoryId && p.subCategoryId.startsWith('comm-')) ||
          ((selectedRedesignedCategory.subcategories || []).some(sub => sub.id === getMatchingSubcategoryId(p)))
        );
      }
      if (catId === 'products' || dbMajor === 'products') {
        return effMajor === 'Products';
      }
      if (catId === 'community' || dbMajor === 'community') {
        return effMajor === 'Community';
      }

      const mapping = selectedRedesignedCategory.dbMapping;
      if (mapping?.isSpecial) {
        if (mapping.isSpecial === 'free') {
          return p.price === 0 || extractString(p.title, currentLanguage).toLowerCase().includes('free');
        }
        if (mapping.isSpecial === 'trending') {
          return p.isFeatured || p.isRecommended || p.price > 100000;
        }
      }

      if (effMajor !== 'Products') return false;

      const matchedSubId = getMatchingSubcategoryId(p);
      if (!matchedSubId) return false;
      return selectedRedesignedCategory.subcategories.some(sub => sub.id === matchedSubId);
    });
  }, [properties, selectedRedesignedCategory, currentLanguage]);

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

    // 15. Selling Type (Retail / Wholesale / Retail & Wholesale)
    if (filterSellingType !== 'All') {
      if (filterSellingType === 'Wholesale') {
        list = list.filter(p => p.sellingType === 'Wholesale' || p.sellingType === 'Retail & Wholesale');
      } else if (filterSellingType === 'Retail') {
        list = list.filter(p => !p.sellingType || p.sellingType === 'Retail' || p.sellingType === 'Retail & Wholesale');
      }
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

  // Handlers for category navigation with browser history support
  const handleSelectRedesignedCategory = (cat: CategoryRedesign, sub: Subcategory | null = null) => {
    setSelectedRedesignedCategory(cat);
    setSelectedSubcategory(sub);
    setCatSearchQuery('');
    setVisibleCount(6);
    setSelectedMajorCategory(cat.name); // Keeps 100% back-compatibility sync

    try {
      window.history.pushState({ sofCatNav: true, catId: cat.id, subId: sub?.id || null }, '');
    } catch (_) {}
    
    // Add to recently viewed list
    const updated = [cat.id, ...recentlyViewedIds.filter(id => id !== cat.id)].slice(0, 5);
    setRecentlyViewedIds(updated);
    try {
      localStorage.setItem('sof_uploader_recently_viewed', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleGoBackToMainCategory = () => {
    setSelectedSubcategory(null);
    try {
      if (selectedRedesignedCategory) {
        window.history.pushState({ sofCatNav: true, catId: selectedRedesignedCategory.id, subId: null }, '');
      }
    } catch (_) {}
  };

  const handleGoBackToAllCategories = () => {
    setSelectedRedesignedCategory(null);
    setSelectedSubcategory(null);
    setSelectedMajorCategory('All');
    try {
      window.history.pushState({ sofCatNav: true, catId: null, subId: null }, '');
    } catch (_) {}
  };

  // Browser back-button event listener for category navigation
  React.useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state && e.state.sofCatNav) {
        const { catId, subId } = e.state;
        if (catId) {
          const matched = [...PRIMARY_CATEGORIES, ...REDESIGNED_CATEGORIES].find(c => c.id === catId);
          if (matched) {
            setSelectedRedesignedCategory(matched);
            setSelectedMajorCategory(matched.name);
            if (subId) {
              const matchedSub = matched.subcategories.find(s => s.id === subId);
              setSelectedSubcategory(matchedSub || null);
            } else {
              setSelectedSubcategory(null);
            }
            return;
          }
        }
        setSelectedRedesignedCategory(null);
        setSelectedSubcategory(null);
        setSelectedMajorCategory('All');
      } else {
        if (selectedSubcategory) {
          setSelectedSubcategory(null);
        } else if (selectedRedesignedCategory) {
          setSelectedRedesignedCategory(null);
          setSelectedMajorCategory('All');
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [selectedRedesignedCategory, selectedSubcategory]);

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
    setFilterSellingType('All');
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

      {/* Dynamic Hero Advertisement / Welcome Banner */}
      {heroAds.length > 0 && (
        <div className="mb-10 rounded-3xl overflow-hidden relative bg-[#0e0e13] text-[#F5F5F4] min-h-[220px] flex flex-col md:flex-row items-center justify-between p-8 md:p-10 border border-white/5 shadow-2xl relative">
          <div className="z-10 max-w-xl text-left">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-full mb-4 inline-block tracking-widest shadow-md">
              {t('special_promotion') || 'Special Promotion'}
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
              {t('learn_more') || 'Learn More'} <ArrowRight className="w-4 h-4" />
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

      <div className="animate-fade-in text-left">
        {/* 1. MAIN CATEGORIES — HORIZONTAL SCROLL ROW */}
        <div className="mb-3 overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-2 flex-nowrap w-max">
            {/* First Main Category Tab: ALL */}
            <button
              onClick={() => handleGoBackToAllCategories()}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 border ${
                !selectedRedesignedCategory
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-[#0e0e15] text-white/80 border-white/10 hover:border-amber-500/40 hover:text-white hover:bg-[#151522]'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span className="uppercase tracking-wider">ALL</span>
            </button>

            {/* Main Categories List */}
            {REDESIGNED_CATEGORIES.map(cat => {
              const isSelected = selectedRedesignedCategory?.id === cat.id;
              const translatedName = currentLanguage === 'am'
                ? (cat.translations?.am || cat.name)
                : currentLanguage === 'om'
                ? (cat.translations?.om || cat.name)
                : cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectRedesignedCategory(cat)}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-[#0e0e15] text-white/80 border-white/10 hover:border-amber-500/40 hover:text-white hover:bg-[#151522]'
                  }`}
                >
                  <span className="text-base shrink-0">{cat.emoji}</span>
                  <span className="whitespace-nowrap">{translatedName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SUBCATEGORIES — HORIZONTAL SCROLL ROW */}
        <div className="mb-6 overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-2 flex-nowrap w-max">
            {/* Available subcategories depending on active category selection */}
            {selectedRedesignedCategory ? (
              <>
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer shrink-0 border ${
                    !selectedSubcategory
                      ? 'bg-white text-black border-white shadow-md font-bold'
                      : 'bg-[#0d0d12]/60 text-white/70 border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {t('all_items_in_category', { category: currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name }) || `All ${selectedRedesignedCategory.name}`}
                </button>

                {selectedRedesignedCategory.subcategories.map(sub => {
                  const subCount = getSubcategoryListingCount(sub, selectedRedesignedCategory);
                  const subName = currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name;
                  const isSubSelected = selectedSubcategory?.id === sub.id;
                  const subVisual = getSubcategoryVisual(sub.id, selectedRedesignedCategory.emoji);

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(isSubSelected ? null : sub)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                        isSubSelected
                          ? 'bg-white text-black border-white shadow-md font-bold'
                          : 'bg-[#0d0d12]/60 text-white/70 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-sm shrink-0">{subVisual}</span>
                      <span className="whitespace-nowrap">{subName}</span>
                      <span className={`text-[10px] font-mono ${isSubSelected ? 'text-black/60' : 'text-white/40'}`}>
                        ({subCount})
                      </span>
                    </button>
                  );
                })}
              </>
            ) : (
              /* When ALL is selected, show top popular subcategories across all categories */
              REDESIGNED_CATEGORIES.flatMap(cat =>
                cat.subcategories.slice(0, 3).map(sub => ({ sub, cat }))
              ).map(({ sub, cat }) => {
                const subCount = getSubcategoryListingCount(sub, cat);
                const subName = currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name;
                const subVisual = getSubcategoryVisual(sub.id, cat.emoji);
                const isSubSelected = selectedSubcategory?.id === sub.id;

                return (
                  <button
                    key={`${cat.id}-${sub.id}`}
                    onClick={() => {
                      setSelectedRedesignedCategory(cat);
                      setSelectedSubcategory(sub);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                      isSubSelected
                        ? 'bg-white text-black border-white shadow-md font-bold'
                        : 'bg-[#0d0d12]/60 text-white/70 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">{subVisual}</span>
                    <span className="whitespace-nowrap">{subName}</span>
                    <span className={`text-[10px] font-mono ${isSubSelected ? 'text-black/60' : 'text-white/40'}`}>
                      ({subCount})
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3. SEARCH BAR & LOCATION SELECTOR */}
        <div className="bg-[#0e0e13]/90 rounded-3xl border border-white/5 p-6 md:p-8 mb-8 text-left backdrop-blur-xl relative shadow-xl">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {/* Location Selector */}
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

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={selectedRedesignedCategory ? catSearchQuery : searchQuery}
                onChange={e => {
                  if (selectedRedesignedCategory) {
                    setCatSearchQuery(e.target.value);
                  } else {
                    setSearchQuery(e.target.value);
                  }
                }}
                placeholder={
                  selectedRedesignedCategory
                    ? (t('search_inside_category', { category: currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name }) || `Search inside ${selectedRedesignedCategory.name}...`)
                    : (t('search_placeholder') || 'Search properties, vehicles, electronics, listings...')
                }
                className="w-full pl-12 pr-4 py-3.5 bg-[#12121a] border border-white/5 focus:border-amber-500/50 focus:outline-none rounded-2xl text-[#F5F5F4] text-sm transition font-sans"
              />
            </div>

            {/* Filters & Reset Buttons */}
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
                <span>{t('filters_btn')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedRedesignedCategory) {
                    clearAllCatFilters();
                  } else {
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
                  }
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
                      type="text"
                      inputMode="text"
                      value={priceMin}
                      onChange={e => setPriceMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                      placeholder={t('any_value')}
                      className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                      {t('max_price')}
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      value={priceMax}
                      onChange={e => setPriceMax(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
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
                      type="text"
                      inputMode="text"
                      value={bedsMin}
                      onChange={e => setBedsMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                      placeholder={t('any_value')}
                      className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                      {t('min_area')}
                    </label>
                    <input
                      type="text"
                      inputMode="text"
                      value={areaMin}
                      onChange={e => setAreaMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                      placeholder={t('any_value')}
                      className="w-full p-3 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-[#F5F5F4] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. RESULTS TOOLBAR WITH SORT & VIEW TOGGLE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#0d0d12]/30 p-4 rounded-2xl border border-white/5">
          <div className="text-left w-full sm:w-auto">
            <p className="text-xs text-white/50">
              {t('showing_results', { current: Math.min(visibleCount, finalFilteredProperties.length), total: finalFilteredProperties.length }) || (
                <>Showing <span className="text-white font-bold">{Math.min(visibleCount, finalFilteredProperties.length)}</span> of <span className="text-amber-400 font-black">{finalFilteredProperties.length}</span> verified results</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Selling Type Quick Filter */}
            <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-white/5">
              {(['All', 'Retail', 'Wholesale'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterSellingType(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterSellingType === st
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {st === 'All' ? (t('wholesale.all_types') || 'All Types') : st === 'Retail' ? (t('wholesale.retail') || 'Retail') : (t('wholesale.wholesale') || 'Wholesale')}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest hidden md:inline">{t('sort_by') || 'Sort By'}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#12121a] border border-white/5 p-2 px-3 rounded-xl text-xs text-white/80 focus:outline-none focus:border-amber-500/30 cursor-pointer"
              >
                <option value="newest">{t('sort_newest') || 'Latest Uploads'}</option>
                <option value="oldest">{t('sort_oldest') || 'Oldest Listings'}</option>
                <option value="lowest">{t('sort_lowest_price') || 'Lowest Price'}</option>
                <option value="highest">{t('sort_highest_price') || 'Highest Price'}</option>
                <option value="popular">{t('sort_most_popular') || 'Most Popular'}</option>
                <option value="rated">{t('sort_highly_rated') || 'Highly Rated'}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex items-center bg-[#12121a] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                title={t('grid_view') || 'Grid View'}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                title={t('list_view') || 'List View'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. MATCHES / LISTINGS GRID */}
        {finalFilteredProperties.length === 0 ? (
          <div className="bg-[#0d0d12]/60 rounded-3xl border border-white/5 p-16 text-center shadow-lg mb-12 flex flex-col items-center justify-center">
            <div className="p-4 bg-white/5 rounded-full mb-4 text-white/30 border border-white/5">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-serif text-white font-semibold">{t('no_listings_fit_filters') || 'No listings fit your filters'}</h4>
            <p className="text-white/40 text-xs mt-2 max-w-sm leading-relaxed">
              {t('no_listings_fit_filters_desc') || 'Try resetting filters or expanding search words to find similar listings within this marketplace.'}
            </p>
            <button
              onClick={() => {
                clearAllCatFilters();
                setSearchQuery('');
              }}
              className="mt-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md cursor-pointer"
            >
              {t('clear_all_filters') || 'Clear All Filters'}
            </button>
          </div>
        ) : (
          <div className="mb-12">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8' : 'grid grid-cols-1 gap-6'}>
              {finalFilteredProperties.slice(0, visibleCount).map(prop => (
                <ListingCard
                  key={prop.id}
                  property={prop}
                  onSelect={onSelectProperty}
                  favorites={favorites}
                  onToggleFav={toggleFavorite}
                  onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                  t={t}
                  currentLanguage={currentLanguage}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < finalFilteredProperties.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold uppercase tracking-widest px-8 py-4 rounded-2xl text-xs transition duration-300 hover:opacity-95 cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.01]"
                >
                  {t('load_more_items') || 'Load More Items'} <ArrowRight className="w-4 h-4 text-black animate-pulse" />
                </button>
              </div>
            )}
          </div>
        )}
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
