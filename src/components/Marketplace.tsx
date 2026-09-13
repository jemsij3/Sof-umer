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
  Folder, ChevronDown, Plus, Map as MapIcon
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
import { MarketplaceMapWidget } from './MarketplaceMapWidget';

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
  const [showMobileMap, setShowMobileMap] = useState<boolean>(false);
  const [isMapVisibleDesktop, setIsMapVisibleDesktop] = useState<boolean>(true);

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
        <div className="mb-10 rounded-3xl overflow-hidden relative bg-white text-stone-900 min-h-[200px] flex flex-col md:flex-row items-center justify-between p-8 md:p-10 border border-stone-200 shadow-sm relative">
          <div className="z-10 max-w-xl text-left">
            <span className="bg-[#C06853] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full mb-4 inline-block tracking-widest shadow-sm">
              {t('special_promotion') || 'Special Promotion'}
            </span>
            <h3 className="text-2xl md:text-3xl font-serif text-stone-900 mb-3 leading-tight tracking-wide font-bold">
              {heroAds[0].title}
            </h3>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed font-normal">
              {heroAds[0].description}
            </p>
            <a
              href={heroAds[0].linkUrl}
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm"
            >
              {t('learn_more') || 'Learn More'} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-6 md:mt-0 z-10 w-full md:w-1/3 h-44 rounded-2xl overflow-hidden shadow-sm border border-stone-200 group">
            <img
              src={heroAds[0].imageUrl}
              alt="Promo"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#C06853] text-white font-semibold px-6 py-3.5 rounded-full shadow-xl flex items-center gap-2 border border-[#A85340]"
          >
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedRedesignedCategory ? (
        <div className="animate-fade-in text-left">
          {/* Breadcrumb Navigation & Obvious Back Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-xs w-fit">
              <button 
                onClick={handleGoBackToAllCategories}
                className="hover:text-[#C06853] transition flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[#C06853]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('all_categories') || 'All Categories'}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <button 
                onClick={handleGoBackToMainCategory}
                className={`hover:text-[#C06853] transition font-bold uppercase tracking-wider cursor-pointer ${!selectedSubcategory ? 'text-stone-900' : 'text-stone-600'}`}
              >
                {currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name}
              </button>
              {selectedSubcategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[#C06853] font-bold uppercase tracking-wider truncate">
                    {currentLanguage === 'am' ? (selectedSubcategory.translations?.am || selectedSubcategory.name) : currentLanguage === 'om' ? (selectedSubcategory.translations?.om || selectedSubcategory.name) : selectedSubcategory.name}
                  </span>
                </>
              )}
            </div>

            {/* Obvious Back Navigation Button */}
            {selectedSubcategory ? (
              <button
                onClick={handleGoBackToMainCategory}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#C06853] hover:text-[#A85340] border border-stone-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← {currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name}</span>
              </button>
            ) : (
              <button
                onClick={handleGoBackToAllCategories}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#C06853] hover:text-[#A85340] border border-stone-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← {t('all_categories') || 'All Categories'}</span>
              </button>
            )}
          </div>

          {/* Interactive Category Header Card / Banner */}
          <div className={`mb-8 rounded-3xl overflow-hidden relative border border-stone-200 shadow-md min-h-[160px] flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 ${selectedRedesignedCategory.bannerGradient}`}>
            {/* Ambient Background overlays */}
            <div className="absolute inset-0 bg-black/45 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-5 text-left w-full sm:w-auto">
              <div className="p-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl shrink-0 shadow-inner text-3xl">
                {selectedSubcategory ? getSubcategoryVisual(selectedSubcategory.id, selectedRedesignedCategory.emoji) : selectedRedesignedCategory.emoji}
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase block mb-1">
                  {selectedSubcategory
                    ? `${currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name} ›`
                    : (t('so_umer_catalogs') || 'SOF UMER CATALOGS')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide uppercase">
                  {selectedSubcategory
                    ? (currentLanguage === 'am' ? (selectedSubcategory.translations?.am || selectedSubcategory.name) : currentLanguage === 'om' ? (selectedSubcategory.translations?.om || selectedSubcategory.name) : selectedSubcategory.name)
                    : (currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name)}
                </h2>
                <p className="text-white/80 text-xs mt-1 font-medium tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {filteredProperties.length} {t('catalog.active_listings_found') || (currentLanguage === 'om' ? 'beeksisa soscho\'an argaman' : currentLanguage === 'am' ? 'ንቁ ማስታወቂያዎች ተገኝተዋል' : 'active listings found')}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="relative z-10 flex flex-wrap gap-2.5 mt-6 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
              <button
                onClick={(e) => handleToggleSaveCategory(selectedRedesignedCategory.id, e)}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md ${
                  savedCatIds.includes(selectedRedesignedCategory.id)
                    ? 'bg-[#C06853] text-white border-[#C06853]'
                    : 'bg-black/40 hover:bg-black/60 text-white border-white/20'
                }`}
                title={t('save') || 'Save Category'}
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
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md ${
                  favCatIds.includes(selectedRedesignedCategory.id)
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-black/40 hover:bg-black/60 text-white/90 border-white/20'
                }`}
                title={t('favorite') || 'Favorite Category'}
              >
                <Heart className={`w-4 h-4 ${favCatIds.includes(selectedRedesignedCategory.id) ? 'fill-white' : ''}`} />
                <span>{favCatIds.includes(selectedRedesignedCategory.id) ? (t('favorited') || 'Favorited') : (t('favorite') || 'Favorite')}</span>
              </button>

              <button
                onClick={(e) => handleShareCategory(selectedRedesignedCategory, e)}
                className="p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all duration-300 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
                title={t('share') || 'Share Category'}
              >
                <Share2 className="w-4 h-4" />
                <span>{t('share') || 'Share'}</span>
              </button>

              <button
                onClick={handleGoBackToAllCategories}
                className="p-3 rounded-2xl bg-white text-stone-900 hover:bg-stone-100 transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md ml-auto sm:ml-0"
              >
                <X className="w-4 h-4" />
                <span>{t('exit') || 'Exit'}</span>
              </button>
            </div>
          </div>

          {/* Clean Subcategory Navigation View when no subcategory is selected */}
          {!selectedSubcategory && (
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                <span>{t('explore_subcategories') || 'EXPLORE SUBCATEGORIES'}</span>
                <span className="h-[1px] bg-stone-200 flex-1" />
              </h3>

              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {selectedRedesignedCategory.subcategories.map((sub) => {
                  const subCount = getSubcategoryListingCount(sub, selectedRedesignedCategory);
                  const subName = currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name;
                  const subVisual = getSubcategoryVisual(sub.id, selectedRedesignedCategory.emoji);

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectRedesignedCategory(selectedRedesignedCategory, sub)}
                      className="w-full text-left p-3.5 sm:p-4 hover:bg-[#C06853]/5 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{subVisual}</span>
                        <span className="text-sm font-semibold text-stone-800 group-hover:text-[#C06853] transition-colors truncate">
                          {subName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 group-hover:border-[#C06853]/30 group-hover:text-[#C06853] transition">
                          {subCount}
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C06853] group-hover:translate-x-1 transition" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subcategories Horizontal Selector Pills Bar */}
          <div className="mb-8 text-left">
            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <span>{selectedSubcategory ? (t('change_subcategory') || 'CHANGE SUBCATEGORY') : (t('quick_filters') || 'QUICK FILTERS')}</span>
              <span className="h-[1px] bg-stone-200 flex-1" />
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer ${
                  !selectedSubcategory
                    ? 'bg-[#C06853] text-white border-transparent shadow-sm font-bold'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-[#C06853]/40 hover:bg-stone-50'
                }`}
              >
                {t('all_items_in_category', { category: currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name }) || `All ${selectedRedesignedCategory.name}`}
              </button>
              {selectedRedesignedCategory.subcategories.map(sub => {
                const subCount = getSubcategoryListingCount(sub, selectedRedesignedCategory);
                const subName = currentLanguage === 'am' ? (sub.translations?.am || sub.name) : currentLanguage === 'om' ? (sub.translations?.om || sub.name) : sub.name;
                const isSelected = selectedSubcategory?.id === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectRedesignedCategory(selectedRedesignedCategory, isSelected ? null : sub)}
                    className={`px-4 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm font-bold'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-[#C06853]/40 hover:bg-stone-50'
                    }`}
                  >
                    <span>{subName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-stone-400'}`}>
                      ({subCount})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tailored Search & Filters Panel */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 mb-8 text-left shadow-xs relative">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={catSearchQuery}
                  onChange={e => setCatSearchQuery(e.target.value)}
                  placeholder={t('search_inside_category', { category: currentLanguage === 'am' ? (selectedRedesignedCategory.translations?.am || selectedRedesignedCategory.name) : currentLanguage === 'om' ? (selectedRedesignedCategory.translations?.om || selectedRedesignedCategory.name) : selectedRedesignedCategory.name }) || `Search inside ${selectedRedesignedCategory.name}...`}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 focus:border-[#C06853] focus:bg-white focus:outline-none rounded-2xl text-stone-900 text-sm transition font-sans"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    showFilters
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t('filters_btn')} {selectedRedesignedCategory.recommendedFilters && `(${selectedRedesignedCategory.recommendedFilters.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={clearAllCatFilters}
                  className="px-5 py-3.5 rounded-2xl bg-stone-100 text-stone-600 hover:bg-stone-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-stone-200"
                >
                  {t('reset_btn')}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-6 border-t border-stone-100">
                    {/* Render properties specific filters */}
                    {selectedRedesignedCategory.id === 'properties' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('buy_or_rent') || 'Buy / Rent'}</label>
                          <select
                            value={filterBuyRent}
                            onChange={e => setFilterBuyRent(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('all_transactions') || 'All Transactions'}</option>
                            <option value="Buy">{t('for_sale') || 'For Sale'}</option>
                            <option value="Rent">{t('for_rent') || 'For Rent'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('min_bedrooms') || 'Min Bedrooms'}</label>
                          <select
                            value={filterBedrooms}
                            onChange={e => setFilterBedrooms(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_bedrooms') || 'Any Bedrooms'}</option>
                            <option value="1">{t('n_plus_bedrooms', { count: 1 }) || '1+ Bedrooms'}</option>
                            <option value="2">{t('n_plus_bedrooms', { count: 2 }) || '2+ Bedrooms'}</option>
                            <option value="3">{t('n_plus_bedrooms', { count: 3 }) || '3+ Bedrooms'}</option>
                            <option value="4">{t('n_plus_bedrooms', { count: 4 }) || '4+ Bedrooms'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('furnishing') || 'Furnishing Status'}</label>
                          <select
                            value={filterFurnished === null ? 'All' : filterFurnished ? 'yes' : 'no'}
                            onChange={e => setFilterFurnished(e.target.value === 'All' ? null : e.target.value === 'yes')}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_furnishing') || 'Any Furnishing'}</option>
                            <option value="yes">{t('furnished') || 'Fully Furnished'}</option>
                            <option value="no">{t('unfurnished') || 'Unfurnished'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('parking_space') || 'Parking Space'}</label>
                          <select
                            value={filterParking === null ? 'All' : filterParking ? 'yes' : 'no'}
                            onChange={e => setFilterParking(e.target.value === 'All' ? null : e.target.value === 'yes')}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_parking') || 'Any Parking'}</option>
                            <option value="yes">{t('has_parking_space') || 'Has Parking Space'}</option>
                            <option value="no">{t('no_parking') || 'No Parking'}</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Render vehicles specific filters */}
                    {selectedRedesignedCategory.id === 'vehicles' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('brand_or_make') || 'Brand / Make'}</label>
                          <input
                            type="text"
                            value={filterVehBrand}
                            onChange={e => setFilterVehBrand(e.target.value)}
                            placeholder="Toyota, Hyundai..."
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('transmission') || 'Transmission'}</label>
                          <select
                            value={filterVehTransmission}
                            onChange={e => setFilterVehTransmission(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('all_transmissions') || 'All Transmissions'}</option>
                            <option value="Automatic">{t('automatic') || 'Automatic'}</option>
                            <option value="Manual">{t('manual') || 'Manual'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('fuel_type') || 'Fuel Type'}</label>
                          <select
                            value={filterVehFuel}
                            onChange={e => setFilterVehFuel(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('all_fuels') || 'All Fuels'}</option>
                            <option value="Petrol">{t('petrol') || 'Petrol'}</option>
                            <option value="Diesel">{t('diesel') || 'Diesel'}</option>
                            <option value="Electric">{t('electric_ev') || 'Electric (EV)'}</option>
                            <option value="Hybrid">{t('hybrid') || 'Hybrid'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('condition') || 'Condition'}</label>
                          <select
                            value={filterVehCondition}
                            onChange={e => setFilterVehCondition(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_condition') || 'Any Condition'}</option>
                            <option value="New">{t('cond_new') || 'Brand New'}</option>
                            <option value="Used">{t('cond_used') || 'Used / Secondhand'}</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Render phones & electronics specific filters */}
                    {(selectedRedesignedCategory.id === 'phones' || selectedRedesignedCategory.id === 'electronics') && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('brand_or_model') || 'Brand / Model'}</label>
                          <input
                            type="text"
                            value={filterElecBrand}
                            onChange={e => setFilterElecBrand(e.target.value)}
                            placeholder="Apple, Samsung, Sony..."
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('storage_capacity') || 'Storage Capacity'}</label>
                          <select
                            value={filterElecStorage}
                            onChange={e => setFilterElecStorage(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_storage') || 'Any Storage'}</option>
                            <option value="64GB">64GB</option>
                            <option value="128GB">128GB</option>
                            <option value="256GB">256GB</option>
                            <option value="512GB">512GB+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('condition') || 'Condition'}</label>
                          <select
                            value={filterElecCondition}
                            onChange={e => setFilterElecCondition(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('any_condition') || 'Any Condition'}</option>
                            <option value="New">{t('cond_new') || 'New / Unopened'}</option>
                            <option value="Used">{t('cond_refurbished') || 'Used / Refurbished'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('verified_sellers_only') || 'Verified Sellers Only'}</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:border-stone-300 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-stone-300 text-[#C06853] focus:ring-[#C06853] focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-stone-800 font-medium select-none">{t('verified_badge') || 'Verified Badge'}</span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Render jobs specific filters */}
                    {(selectedRedesignedCategory.id === 'jobs' || selectedRedesignedCategory.id === 'seeking_work') && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('job_type') || 'Job Type'}</label>
                          <select
                            value={filterJobType}
                            onChange={e => setFilterJobType(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('all_job_types') || 'All Job Types'}</option>
                            <option value="Full-Time">{t('job_full_time') || 'Full-Time'}</option>
                            <option value="Part-Time">{t('job_part_time') || 'Part-Time'}</option>
                            <option value="Contract">{t('job_contract') || 'Contract / Project'}</option>
                            <option value="Remote">{t('job_remote') || 'Remote / WFH'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('industry_or_sector') || 'Industry / Sector'}</label>
                          <select
                            value={filterJobIndustry}
                            onChange={e => setFilterJobIndustry(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                          >
                            <option value="All">{t('all_industries') || 'All Industries'}</option>
                            <option value="IT">{t('ind_it') || 'IT & Software development'}</option>
                            <option value="Healthcare">{t('ind_health') || 'Healthcare & Medicine'}</option>
                            <option value="Engineering">{t('ind_eng') || 'Engineering & Tech'}</option>
                            <option value="Finance">{t('ind_finance') || 'Finance & Banking'}</option>
                            <option value="Sales">{t('ind_sales') || 'Sales & Marketing'}</option>
                            <option value="Other">{t('ind_other') || 'Others / Uncategorized'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('filter_location') || 'Region / City'}</label>
                          <input
                            type="text"
                            value={filterRegion}
                            onChange={e => setFilterRegion(e.target.value)}
                            placeholder="Addis Ababa, Oromia..."
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('verified_only') || 'Verified Only'}</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:border-stone-300 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-stone-300 text-[#C06853] focus:ring-[#C06853] focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-stone-800 font-medium select-none">{t('verified_matches') || 'Verified Matches'}</span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Fallback general purpose filters */}
                    {selectedRedesignedCategory.id !== 'properties' && selectedRedesignedCategory.id !== 'vehicles' && selectedRedesignedCategory.id !== 'phones' && selectedRedesignedCategory.id !== 'electronics' && selectedRedesignedCategory.id !== 'jobs' && selectedRedesignedCategory.id !== 'seeking_work' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('min_price') || 'Min Price'}</label>
                          <input
                            type="text"
                            inputMode="text"
                            value={filterPriceMin}
                            onChange={e => setFilterPriceMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                            placeholder={t('any_value') || 'Any price'}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('max_price') || 'Max Price'}</label>
                          <input
                            type="text"
                            inputMode="text"
                            value={filterPriceMax}
                            onChange={e => setFilterPriceMax(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                            placeholder={t('any_value') || 'Any price'}
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('filter_location') || 'Region / City'}</label>
                          <input
                            type="text"
                            value={filterRegion}
                            onChange={e => setFilterRegion(e.target.value)}
                            placeholder="Oromia, Harar, Addis..."
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('verified_only') || 'Verified Only'}</label>
                          <label className="relative flex items-center gap-3.5 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:border-stone-300 transition">
                            <input
                              type="checkbox"
                              checked={filterVerifiedOnly}
                              onChange={e => setFilterVerifiedOnly(e.target.checked)}
                              className="w-4 h-4 rounded border-stone-300 text-[#C06853] focus:ring-[#C06853] focus:outline-none cursor-pointer"
                            />
                            <span className="text-xs text-stone-800 font-medium select-none">{t('verified_listings') || 'Verified Listings'}</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="text-left w-full sm:w-auto">
              <p className="text-xs text-stone-500">
                {t('showing_results', { current: Math.min(visibleCount, finalFilteredProperties.length), total: finalFilteredProperties.length }) || (
                  <>Showing <span className="text-stone-900 font-bold">{Math.min(visibleCount, finalFilteredProperties.length)}</span> of <span className="text-[#C06853] font-black">{finalFilteredProperties.length}</span> verified results</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {/* Selling Type Quick Filter */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                {(['All', 'Retail', 'Wholesale'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterSellingType(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      filterSellingType === st
                        ? 'bg-[#C06853] text-white font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {st === 'All' ? (t('wholesale.all_types') || 'All Types') : st === 'Retail' ? (t('wholesale.retail') || 'Retail') : (t('wholesale.wholesale') || 'Wholesale')}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden md:inline">{t('sort_by') || 'Sort By'}</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 p-2 px-3 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] cursor-pointer font-medium"
                >
                  <option value="newest">{t('sort_newest') || 'Latest Uploads'}</option>
                  <option value="oldest">{t('sort_oldest') || 'Oldest Listings'}</option>
                  <option value="lowest">{t('sort_lowest_price') || 'Lowest Price'}</option>
                  <option value="highest">{t('sort_highest_price') || 'Highest Price'}</option>
                  <option value="popular">{t('sort_most_popular') || 'Most Popular'}</option>
                  <option value="rated">{t('sort_highly_rated') || 'Highly Rated'}</option>
                </select>
              </div>

              {/* Desktop Map Toggle */}
              <button
                onClick={() => setIsMapVisibleDesktop(!isMapVisibleDesktop)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  isMapVisibleDesktop
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{isMapVisibleDesktop ? 'Hide Map' : 'Show Map'}</span>
              </button>

              {/* View Mode Toggle */}
              <div className="h-6 w-[1px] bg-stone-200" />
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                  title={t('grid_view') || 'Grid View'}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                  title={t('list_view') || 'List View'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Map vs List Switcher */}
          <div className="lg:hidden mb-6 flex items-center justify-center">
            <div className="bg-white border border-stone-200 p-1 rounded-full shadow-sm flex items-center gap-1">
              <button
                onClick={() => setShowMobileMap(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  !showMobileMap
                    ? 'bg-[#C06853] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Listings ({finalFilteredProperties.length})</span>
              </button>
              <button
                onClick={() => setShowMobileMap(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  showMobileMap
                    ? 'bg-[#C06853] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Show Map</span>
              </button>
            </div>
          </div>

          {/* Matches List */}
          {finalFilteredProperties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs mb-12 flex flex-col items-center justify-center">
              <div className="p-4 bg-stone-100 rounded-full mb-4 text-stone-400 border border-stone-200">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-serif text-stone-900 font-bold">{t('no_listings_fit_filters') || 'No listings fit your filters'}</h4>
              <p className="text-stone-500 text-xs mt-2 max-w-sm leading-relaxed">
                {t('no_listings_fit_filters_desc') || 'Try resetting filters or expanding search words to find similar listings within this marketplace.'}
              </p>
              <button
                onClick={clearAllCatFilters}
                className="mt-6 bg-[#C06853] hover:bg-[#A85340] text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-full transition-all duration-300 shadow-sm cursor-pointer"
              >
                {t('clear_all_filters') || 'Clear All Filters'}
              </button>
            </div>
          ) : (
            <div className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 2/3 Grid or List View on Desktop */}
                <div className={`${isMapVisibleDesktop ? 'lg:col-span-8' : 'lg:col-span-12'} ${showMobileMap ? 'hidden lg:block' : 'block'}`}>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'}>
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
                        className="inline-flex items-center gap-2.5 bg-[#C06853] hover:bg-[#A85340] text-white font-extrabold uppercase tracking-widest px-8 py-4 rounded-2xl text-xs transition duration-300 shadow-md cursor-pointer hover:scale-[1.01]"
                      >
                        {t('load_more_items') || 'Load More Items'} <ArrowRight className="w-4 h-4 text-white animate-pulse" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 1/3 Interactive Sticky Map on Desktop */}
                {isMapVisibleDesktop && (
                  <div className={`lg:col-span-4 ${showMobileMap ? 'block w-full' : 'hidden lg:block'}`}>
                    <div className="sticky top-24">
                      <MarketplaceMapWidget
                        properties={finalFilteredProperties}
                        onSelectProperty={onSelectProperty}
                        currentLanguage={currentLanguage}
                        selectedLocation={selectedLocation}
                        className="h-[calc(100vh-8rem)] min-h-[520px] shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in text-left">

          {/* Recently Searched strip */}
          {recentlySearchedQueries.length > 0 && (
            <div className="mb-6 text-left">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#C06853]" /> {t('recently_searched_keywords') || 'RECENTLY SEARCHED KEYWORDS'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recentlySearchedQueries.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => { setSearchQuery(query); setCatSearchQuery(query); }}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs text-stone-700 rounded-xl transition cursor-pointer font-medium"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hero Section with Floating Multi-Category Search Card */}
          <div className="relative mb-12 rounded-3xl overflow-hidden shadow-xs border border-stone-200 bg-white">
            {/* High-res Hero Architectural/Urban Image */}
            <div className="relative h-[340px] sm:h-[380px] md:h-[420px] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
                alt="Sof Umer Marketplace Ethiopia"
                className="w-full h-full object-cover brightness-[0.88] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              {/* Soft gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />

              <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-end text-left max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold w-fit mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#C06853] animate-pulse" />
                  <span>{t('hero_badge') || 'Ethiopia\'s Verified Multi-Category Marketplace'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white leading-tight mb-3 tracking-tight">
                  {t('hero_title') || 'Discover Properties, Vehicles & Products in Ethiopia'}
                </h1>
                <p className="text-white/90 text-sm sm:text-base font-light max-w-xl leading-relaxed">
                  {t('hero_subtitle') || 'Browse verified real estate, cars, electronics, and local services across Addis Ababa and nationwide.'}
                </p>
              </div>
            </div>

            {/* Floating Multi-Category Search Card */}
            <div className="bg-white p-5 sm:p-7 border-t border-stone-200 text-left">
              {/* Multi-Category Switch Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-stone-100">
                <button
                  type="button"
                  onClick={() => { setSelectedMajorCategory('All'); setSelectedRedesignedCategory(null); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    !selectedMajorCategory || selectedMajorCategory === 'All'
                      ? 'bg-[#C06853] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t('all_categories') || 'All Categories'}
                </button>
                {PRIMARY_CATEGORIES.map(cat => {
                  const isSelected = selectedRedesignedCategory?.id === cat.id;
                  const catName = currentLanguage === 'am' ? (cat.translations?.am || cat.name) : currentLanguage === 'om' ? (cat.translations?.om || cat.name) : cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectRedesignedCategory(cat)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C06853] text-white shadow-xs font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{catName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Search Inputs Row */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                {/* Location selector modal trigger */}
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

                {/* Text search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder') || 'Search properties, cars, electronics, listings...'}
                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 focus:border-[#C06853] focus:bg-white focus:outline-none rounded-2xl text-stone-900 text-sm transition font-sans"
                  />
                </div>

                {/* Transaction type filter */}
                <div className="w-full md:w-44 shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full h-full py-3.5 px-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] cursor-pointer font-medium"
                  >
                    {transactionCategories.map(c => (
                      <option key={c} value={c}>
                        {c === 'All' ? (t('all_transactions') || 'All Status') : c === 'Buy' ? (t('cat_buy') || 'For Sale') : c === 'Rent' ? (t('cat_rent') || 'For Rent') : c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                      showFilters
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('filters_btn')}</span>
                  </button>

                  <button
                    type="button"
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
                    className="px-4 py-3.5 rounded-2xl bg-stone-100 text-stone-600 hover:bg-stone-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-stone-200"
                    title={t('reset_btn')}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6 pt-6 border-t border-stone-100">
                      {/* Property/Listing Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('filter_type')}
                        </label>
                        <select
                          value={selectedType}
                          onChange={e => setSelectedType(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                        >
                          {propertyTypes.map(pt => (
                            <option key={pt} value={pt}>
                              {pt === 'All' ? t('all_types') : t(`cat_${(pt || '').toLowerCase()}`) || pt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Location filter */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('filter_location')}
                        </label>
                        <select
                          value={selectedLocation}
                          onChange={e => {
                            setSelectedLocation(e.target.value);
                            localStorage.setItem('sof_umer_selected_location', e.target.value);
                          }}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                        >
                          <option value="All">{t('all_locations')}</option>
                          {locations.map(loc => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Currency Filter */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('currency_status')}
                        </label>
                        <select
                          value={selectedCurrency}
                          onChange={e => setSelectedCurrency(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#C06853] transition cursor-pointer font-medium"
                        >
                          <option value="All">{t('all_currencies')}</option>
                          <option value="ETB">ETB (Ethiopian Birr)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="SAR">SAR (Saudi Riyal)</option>
                          <option value="EUR">EUR (Euro)</option>
                          <option value="AED">AED (UAE Dirham)</option>
                        </select>
                      </div>

                      {/* Rooms / Beds */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('min_bedrooms')}
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          value={bedsMin}
                          onChange={e => setBedsMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                          placeholder={t('any_value')}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                        />
                      </div>

                      {/* Price Min/Max */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('min_price')}
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          value={priceMin}
                          onChange={e => setPriceMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                          placeholder={t('any_value')}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('max_price')}
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          value={priceMax}
                          onChange={e => setPriceMax(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                          placeholder={t('any_value')}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                          {t('min_area')}
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          value={areaMin}
                          onChange={e => setAreaMin(e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value as any : Number(e.target.value)))}
                          placeholder={t('any_value')}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C06853] transition font-medium"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular Searches Quick Tags */}
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
                  {t('popular_searches') || 'Popular:'}
                </span>
                {['Apartments Bole', 'Toyota Vitz', 'Commercial Office', 'Villas CMC', 'Laptops & Phones'].map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(term)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 text-[11px] transition cursor-pointer font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. CATEGORIES VISUAL ENTRY POINTS */}
          <div className="mb-14 text-left">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#C06853]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C06853] font-mono">
                    {t('explore_marketplace') || 'EXPLORE MARKETPLACE'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif text-stone-900 font-bold tracking-tight">
                  {t('browse_categories') || 'Browse by Category'}
                </h3>
              </div>

              {/* ALL CATEGORIES Overlay Trigger */}
              <button
                id="view-all-categories-link"
                onClick={() => setIsAllCategoriesOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white hover:bg-stone-50 text-stone-800 hover:text-[#C06853] border border-stone-200 hover:border-[#C06853]/40 font-bold text-xs sm:text-sm rounded-2xl transition duration-200 cursor-pointer shadow-xs group"
              >
                <span>{t('view_all_categories') || 'View All Categories'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Visual Category Cards Grid: 6 Primary Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {PRIMARY_CATEGORIES.map(cat => {
                const count = calcCategoryCount(cat, properties);
                const catName = currentLanguage === 'am' 
                  ? (cat.translations?.am || cat.name) 
                  : currentLanguage === 'om' 
                  ? (cat.translations?.om || cat.name) 
                  : cat.name;

                return (
                  <button
                    key={cat.id}
                    id={`primary-category-card-${cat.id}`}
                    onClick={() => handleSelectRedesignedCategory(cat)}
                    className="group text-left p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200 hover:border-[#C06853]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[120px] shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                        {cat.emoji}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-stone-500 group-hover:text-[#C06853] bg-stone-100 group-hover:bg-[#C06853]/10 px-2 py-0.5 rounded-full transition-colors">
                        {count}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#C06853] transition-colors line-clamp-1 leading-snug">
                        {catName}
                      </h4>
                      <span className="text-[10px] text-stone-400 block mt-0.5 group-hover:text-stone-600 transition-colors font-mono">
                        {count} {count === 1 ? (t('listing_singular') || 'listing') : (t('listings_plural') || 'listings')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* RECENTLY VIEWED CATEGORIES (only when real browsing history exists) */}
            {recentlyViewedIds.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mr-1">
                  <Clock className="w-3.5 h-3.5 text-[#C06853]" />
                  {t('recently_viewed_categories') || 'RECENTLY VIEWED'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentlyViewedIds.map(id => {
                    const matched = [...PRIMARY_CATEGORIES, ...REDESIGNED_CATEGORIES].find(c => c.id === id);
                    if (!matched) return null;
                    const catName = currentLanguage === 'am' ? (matched.translations?.am || matched.name) : currentLanguage === 'om' ? (matched.translations?.om || matched.name) : matched.name;
                    return (
                      <button
                        key={id}
                        onClick={() => handleSelectRedesignedCategory(matched)}
                        className="px-3 py-1 bg-white hover:bg-stone-100 hover:text-[#C06853] border border-stone-200 text-xs text-stone-700 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs font-medium"
                      >
                        <span>{matched.emoji}</span>
                        <span>{catName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Grid Content: Listings & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left mb-16">
            {/* Left Side: Listings */}
            <div className={`${sidebarAds.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-16 animate-fade-in`}>
              {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center shadow-xs">
                  <Building className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h4 className="text-lg font-serif text-stone-900 font-semibold">{t('no_listings_found')}</h4>
                  <p className="text-stone-500 text-sm mt-1.5 font-light">{t('no_listings_found_desc')}</p>
                </div>
              ) : (
                <>
                  {/* 1. FEATURED LISTINGS */}
                  {featuredProperties.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-serif text-stone-900 mb-8 border-b border-stone-200 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#C06853]" /> {
                          (selectedMajorCategory && selectedMajorCategory.toLowerCase().includes('propert')) || (selectedRedesignedCategory?.name && selectedRedesignedCategory.name.toLowerCase().includes('propert'))
                            ? (t('featured_properties') || 'Featured Properties')
                            : (t('featured_listings') || 'Featured Listings')
                        }</span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-stone-400 font-mono">{t('verified_select_picks')}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {featuredProperties.map(prop => (
                          <ListingCard
                            key={prop.id}
                            property={prop}
                            onSelect={onSelectProperty}
                            favorites={favorites}
                            onToggleFav={toggleFavorite}
                            onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                            t={t} currentLanguage={currentLanguage}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. POPULAR LISTINGS */}
                  {popularProperties.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-serif text-stone-900 mb-8 border-b border-stone-200 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#C06853]" /> {t('popular_listings') || 'Popular Listings'}</span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-stone-400 font-mono">{t('most_viewed_picks') || 'BASED ON VIEWS & INTEREST'}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {popularProperties.map(prop => (
                          <ListingCard
                            key={prop.id}
                            property={prop}
                            onSelect={onSelectProperty}
                            favorites={favorites}
                            onToggleFav={toggleFavorite}
                            onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                            t={t} currentLanguage={currentLanguage}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. LATEST LISTINGS */}
                  {latestProperties.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-serif text-stone-900 mb-8 border-b border-stone-200 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#C06853]" /> {
                          (selectedMajorCategory && selectedMajorCategory.toLowerCase().includes('propert')) || (selectedRedesignedCategory?.name && selectedRedesignedCategory.name.toLowerCase().includes('propert'))
                            ? (t('latest_properties') || 'Latest Properties')
                            : (t('latest_listings') || 'Latest Listings')
                        }</span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-stone-400 font-mono">{t('recent_offers')}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {latestProperties.map(prop => (
                          <ListingCard
                            key={prop.id}
                            property={prop}
                            onSelect={onSelectProperty}
                            favorites={favorites}
                            onToggleFav={toggleFavorite}
                            onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                            t={t} currentLanguage={currentLanguage}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. CATEGORY-SPECIFIC SECTIONS (Only when on home view and enough real listings exist >= 2) */}
                  {!selectedRedesignedCategory && (
                    <>
                      {/* Properties Section */}
                      {propertiesListings.length >= 2 && (
                        <div>
                          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                            <h3 className="text-2xl font-serif text-stone-900 flex items-center gap-2">
                              <span>🏠</span> {t('properties_in_ethiopia') || 'Properties in Ethiopia'}
                            </h3>
                            <button
                              onClick={() => {
                                const propCat = PRIMARY_CATEGORIES.find(c => c.id === 'properties');
                                if (propCat) handleSelectRedesignedCategory(propCat);
                              }}
                              className="text-xs font-bold text-[#C06853] hover:text-[#A85340] flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{t('view_all_in_properties') || 'View all in Properties'}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {propertiesListings.map(prop => (
                              <ListingCard
                                key={prop.id}
                                property={prop}
                                onSelect={onSelectProperty}
                                favorites={favorites}
                                onToggleFav={toggleFavorite}
                                onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                                t={t} currentLanguage={currentLanguage}
                                viewMode="grid"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vehicles Section */}
                      {vehiclesListings.length >= 2 && (
                        <div>
                          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                            <h3 className="text-2xl font-serif text-stone-900 flex items-center gap-2">
                              <span>🚗</span> {t('vehicles_in_ethiopia') || 'Vehicles in Ethiopia'}
                            </h3>
                            <button
                              onClick={() => {
                                const vehCat = PRIMARY_CATEGORIES.find(c => c.id === 'vehicles');
                                if (vehCat) handleSelectRedesignedCategory(vehCat);
                              }}
                              className="text-xs font-bold text-[#C06853] hover:text-[#A85340] flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{t('view_all_in_vehicles') || 'View all in Vehicles'}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {vehiclesListings.map(prop => (
                              <ListingCard
                                key={prop.id}
                                property={prop}
                                onSelect={onSelectProperty}
                                favorites={favorites}
                                onToggleFav={toggleFavorite}
                                onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                                t={t} currentLanguage={currentLanguage}
                                viewMode="grid"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products Section */}
                      {productsListings.length >= 2 && (
                        <div>
                          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                            <h3 className="text-2xl font-serif text-stone-900 flex items-center gap-2">
                              <span>📦</span> {t('products_in_ethiopia') || 'Products & Marketplace'}
                            </h3>
                            <button
                              onClick={() => {
                                const prodCat = PRIMARY_CATEGORIES.find(c => c.id === 'products');
                                if (prodCat) handleSelectRedesignedCategory(prodCat);
                              }}
                              className="text-xs font-bold text-[#C06853] hover:text-[#A85340] flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{t('view_all_in_products') || 'View all in Products'}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {productsListings.map(prop => (
                              <ListingCard
                                key={prop.id}
                                property={prop}
                                onSelect={onSelectProperty}
                                favorites={favorites}
                                onToggleFav={toggleFavorite}
                                onReport={() => onOpenReportModal('property', prop.id, prop.title)}
                                t={t} currentLanguage={currentLanguage}
                                viewMode="grid"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right Side: Sidebar Adverts */}
            {sidebarAds.length > 0 && (
              <div className="lg:col-span-3 space-y-8">
                {sidebarAds.map(ad => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs relative group"
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
                      <h4 className="font-serif text-base text-stone-900 mb-1.5 font-semibold">{ad.title}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed mb-5 font-light">{ad.description}</p>
                      <a
                        href={ad.linkUrl}
                        className="block text-center bg-[#C06853] hover:bg-[#A85340] text-white rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition duration-300 shadow-xs"
                      >
                        {t('visit_offer')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
