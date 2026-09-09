export function extractString(val: any, lang: string = 'en'): string {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          if (parsed[lang]) return String(parsed[lang]);
          if (parsed.en) return String(parsed.en);
          if (parsed.om) return String(parsed.om);
          if (parsed.am) return String(parsed.am);
          return Object.values(parsed).filter(v => typeof v === 'string').join(' ');
        }
      } catch (_) {}
    }
    return val;
  }
  if (typeof val === 'object') {
    if (val[lang]) return String(val[lang]);
    if (val.en) return String(val.en);
    if (val.om) return String(val.om);
    if (val.am) return String(val.am);
    return Object.values(val).filter(v => typeof v === 'string').join(' ');
  }
  return String(val);
}

export interface Subcategory {
  id: string;
  name: string;
  translations: {
    en: string;
    om: string;
    am: string;
  };
  keywords?: string[];
}

export interface CategoryBrand {
  id: string;
  name: string;
  subcategoryId?: string;
  translations?: {
    en: string;
    om: string;
    am: string;
  };
}

export interface CategoryRedesign {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  imageUrl: string;
  bannerGradient: string;
  translations: {
    en: string;
    om: string;
    am: string;
  };
  subcategories: Subcategory[];
  brands?: CategoryBrand[];
  recommendedFilters?: string[];
  dbMapping: {
    majorCategory?: string;
    propertyTypeKeywords?: string[];
    descriptionKeywords?: string[];
    isSpecial?: 'trending' | 'recent' | 'popular' | 'free';
  };
}

export const REDESIGNED_CATEGORIES: CategoryRedesign[] = [
  {
    id: 'properties',
    name: 'Properties',
    emoji: '🏠',
    iconName: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-amber-600 to-amber-900',
    translations: {
      en: 'Properties',
      om: 'Qabeenya Lafaa',
      am: 'ቤትና ቦታዎች (ሪል እስቴት)'
    },
    subcategories: [
      { id: 'prop-houses', name: 'Houses', translations: { en: 'Houses', om: 'Manneen', am: 'ቤቶች' } },
      { id: 'prop-apartments', name: 'Apartments', translations: { en: 'Apartments', om: 'Apaartaamaa', am: 'አፓርታማዎች' } },
      { id: 'prop-villas', name: 'Villas', translations: { en: 'Villas', om: 'Viilaa', am: 'ቪላዎች' } },
      { id: 'prop-land', name: 'Land & Plots', translations: { en: 'Land & Plots', om: 'Lafa & Maasii', am: 'መሬት እና ቦታዎች' } },
      { id: 'prop-offices', name: 'Offices', translations: { en: 'Offices', om: 'Iddoo Barkumee', am: 'የቢሮ ቦታዎች' } },
      { id: 'prop-shops', name: 'Shops', translations: { en: 'Shops', om: 'Suuqii', am: 'ሱቆች' } },
      { id: 'prop-warehouse', name: 'Warehouses', translations: { en: 'Warehouses', om: 'Kuusaa', am: 'መጋዘኖች' } },
      { id: 'prop-hotels', name: 'Hotels', translations: { en: 'Hotels', om: 'Hoteela', am: 'ሆቴሎች' } },
      { id: 'prop-farms', name: 'Farms', translations: { en: 'Farms', om: 'Qonna', am: 'እርሻዎች' } },
      { id: 'prop-commercial', name: 'Commercial Buildings', translations: { en: 'Commercial Buildings', om: 'Gamoo Daldalaa', am: 'የንግድ ህንፃዎች' } },
      { id: 'prop-services', name: 'Property Services', translations: { en: 'Property Services', om: 'Tajaajila Qabeenyaa', am: 'የቤትና ቦታ አገልግሎቶች' } }
    ],
    recommendedFilters: ['Buy / Rent', 'Price', 'Region', 'City', 'Bedrooms', 'Bathrooms', 'Property Size', 'Furnished'],
    dbMapping: { majorCategory: 'Properties' }
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    emoji: '🚗',
    iconName: 'Car',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-blue-600 to-indigo-900',
    translations: {
      en: 'Vehicles',
      om: 'Konkolaattota',
      am: 'ተሽከርካሪዎች'
    },
    subcategories: [
      { id: 'veh-cars', name: 'Cars', translations: { en: 'Cars', om: 'Konkolaataa', am: 'መኪናዎች' } },
      { id: 'veh-motorcycles', name: 'Motorcycles', translations: { en: 'Motorcycles', om: 'Mootora', am: 'ሞተር ብስክሌቶች' } },
      { id: 'veh-trucks', name: 'Trucks', translations: { en: 'Trucks', om: 'Tiraakii', am: 'ጭነት መኪናዎች' } },
      { id: 'veh-buses', name: 'Buses', translations: { en: 'Buses', om: 'Baasii', am: 'አውቶቡሶች' } },
      { id: 'veh-heavy', name: 'Heavy Equipment', translations: { en: 'Heavy Equipment', om: 'Mishiniitii Ulfaatoo', am: 'ከባድ ማሽነሪዎች' } },
      { id: 'veh-parts', name: 'Vehicle Parts', translations: { en: 'Vehicle Parts', om: 'Kutaalee Konkolaataa', am: 'የመኪና መለዋወጫዎች' } },
      { id: 'veh-accessories', name: 'Vehicle Accessories', translations: { en: 'Vehicle Accessories', om: 'Meeshaalee Dabalataa', am: 'የመኪና እቃዎች' } },
      { id: 'veh-services', name: 'Vehicle Services', translations: { en: 'Vehicle Services', om: 'Tajaajila Konkolaataa', am: 'የተሽከርካሪ አገልግሎቶች' } }
    ],
    recommendedFilters: ['Brand', 'Model', 'Year', 'Fuel Type', 'Transmission', 'Condition', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Car', 'Vehicle', 'Toyota', 'Suzuki', 'Hyundai', 'Motor', 'Truck', 'Bus', 'Parts', 'Accessories'] }
  },
  {
    id: 'electronics',
    name: 'Electronics',
    emoji: '📱',
    iconName: 'Smartphone',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-purple-600 to-pink-900',
    translations: {
      en: 'Electronics',
      om: 'Meechalee Ilektirooniksii',
      am: 'ኤሌክትሮኒክስ'
    },
    subcategories: [
      { id: 'el-smartphones', name: 'Smartphones', translations: { en: 'Smartphones', om: 'Bilbila Ammayyaa', am: 'ስማርት ስልኮች' } },
      { id: 'el-tablets', name: 'Tablets', translations: { en: 'Tablets', om: 'Taableetiif', am: 'ታብሌቶች' } },
      { id: 'el-laptops', name: 'Laptops', translations: { en: 'Laptops', om: 'Laaphtoopii', am: 'ላፕቶፖች' } },
      { id: 'el-desktops', name: 'Desktop Computers', translations: { en: 'Desktop Computers', om: 'Koompuyootara Desktop', am: 'ዴስክቶፕ ኮምፒውተሮች' } },
      { id: 'el-tvs', name: 'TVs', translations: { en: 'TVs', om: 'Tiivii', am: 'ቴሌቪዥኖች' } },
      { id: 'el-cameras', name: 'Cameras', translations: { en: 'Cameras', om: 'Kaameraa', am: 'ካሜራዎች' } },
      { id: 'el-audio', name: 'Audio Devices', translations: { en: 'Audio Devices', om: 'Meeshaalee Sagaleen', am: 'የድምፅ መሳሪያዎች' } },
      { id: 'el-gaming', name: 'Gaming Devices', translations: { en: 'Gaming Devices', om: 'Meeshaalee Taphaa', am: 'የጨዋታ መሳሪያዎች' } },
      { id: 'el-comp-acc', name: 'Computer Accessories', translations: { en: 'Computer Accessories', om: 'Ufata Koompuyootaraa', am: 'የኮምፒውተር እቃዎች' } },
      { id: 'el-phone-acc', name: 'Phone Accessories', translations: { en: 'Phone Accessories', om: 'Meeshaa Bilbilaa', am: 'የስልክ እቃዎች' } },
      { id: 'el-watches', name: 'Smart Watches', translations: { en: 'Smart Watches', om: 'Sa’aatii Ammayyaa', am: 'ስማርት ሰዓቶች' } },
      { id: 'el-appliances', name: 'Home Appliances', translations: { en: 'Home Appliances', om: 'Meeshaalee Manaa', am: 'የቤት ውስጥ የኤሌክትሪክ እቃዎች' } }
    ],
    recommendedFilters: ['Brand', 'Condition', 'Storage Capacity', 'RAM', 'Screen Size', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Electronics', 'Phone', 'Tablet', 'Laptop', 'Computer', 'TV', 'Camera', 'Audio', 'Gaming', 'Watch', 'Appliance'] }
  },
  {
    id: 'fashion',
    name: 'Fashion',
    emoji: '👕',
    iconName: 'Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-rose-600 to-red-900',
    translations: {
      en: 'Fashion',
      om: 'Faashinii',
      am: 'ፋሽንና አልባሳት'
    },
    subcategories: [
      { id: 'fas-men', name: "Men's Clothing", translations: { en: "Men's Clothing", om: 'Uffata Dhiiraa', am: 'የወንዶች ልብሶች' } },
      { id: 'fas-women', name: "Women's Clothing", translations: { en: "Women's Clothing", om: 'Uffata Dubartootaa', am: 'የሴቶች ልብሶች' } },
      { id: 'fas-kids', name: 'Kids Clothing', translations: { en: 'Kids Clothing', om: 'Uffata Daa’immanii', am: 'የልጆች ልብሶች' } },
      { id: 'fas-shoes', name: 'Shoes', translations: { en: 'Shoes', om: 'Kophee', am: 'ጫማዎች' } },
      { id: 'fas-bags', name: 'Bags', translations: { en: 'Bags', om: 'Boraatii / Boorsaa', am: 'ቦርሳዎች' } },
      { id: 'fas-watches', name: 'Watches', translations: { en: 'Watches', om: 'Sa’aatii', am: 'ሰዓቶች' } },
      { id: 'fas-jewelry', name: 'Jewelry', translations: { en: 'Jewelry', om: 'Meeshaalee Faayaa', am: 'ጌጣጌጦች' } },
      { id: 'fas-accessories', name: 'Accessories', translations: { en: 'Accessories', om: 'Meeshaalee Faashinii', am: 'ተጨማሪ ፋሽኖች' } }
    ],
    brands: [
      { id: 'brand-nike', name: 'Nike', subcategoryId: 'fas-shoes' },
      { id: 'brand-adidas', name: 'Adidas', subcategoryId: 'fas-shoes' },
      { id: 'brand-puma', name: 'Puma', subcategoryId: 'fas-shoes' },
      { id: 'brand-zara', name: 'Zara', subcategoryId: 'fas-women' },
      { id: 'brand-hm', name: 'H&M', subcategoryId: 'fas-women' },
      { id: 'brand-gucci', name: 'Gucci', subcategoryId: 'fas-bags' },
      { id: 'brand-lv', name: 'Louis Vuitton', subcategoryId: 'fas-bags' },
      { id: 'brand-levis', name: "Levi's", subcategoryId: 'fas-men' },
      { id: 'brand-other', name: 'Other Brands' }
    ],
    recommendedFilters: ['Gender', 'Size', 'Brand', 'Color', 'Condition', 'Material', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Fashion', 'Clothing', 'Men', 'Women', 'Kid', 'Shoe', 'Bag', 'Watch', 'Jewelry', 'Accessory', 'Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Gucci', 'Louis Vuitton', 'Levi'] }
  },
  {
    id: 'jobs',
    name: 'Jobs',
    emoji: '💼',
    iconName: 'Briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-emerald-600 to-teal-900',
    translations: {
      en: 'Jobs',
      om: 'Hojiiwwan',
      am: 'የሥራ እድሎች'
    },
    subcategories: [
      { id: 'job-fulltime', name: 'Full Time Jobs', translations: { en: 'Full Time Jobs', om: 'Hojii Guutuu', am: 'ሙሉ ጊዜ ሥራዎች' } },
      { id: 'job-parttime', name: 'Part Time Jobs', translations: { en: 'Part Time Jobs', om: 'Hojii Yeroo', am: 'ትርፍ ጊዜ ሥራዎች' } },
      { id: 'job-freelance', name: 'Freelance Jobs', translations: { en: 'Freelance Jobs', om: 'Hojii Bilisaa', am: 'የኮንትራት/ፍሪላንስ ሥራዎች' } },
      { id: 'job-remote', name: 'Remote Jobs', translations: { en: 'Remote Jobs', om: 'Hojii Fageenyaa', am: 'የሩቅ / ኦንላይን ሥራዎች' } },
      { id: 'job-construction', name: 'Construction Jobs', translations: { en: 'Construction Jobs', om: 'Hojii Ijaarsaa', am: 'የግንባታ ሥራዎች' } },
      { id: 'job-driver', name: 'Driver Jobs', translations: { en: 'Driver Jobs', om: 'Hojii Konkolaachisaa', am: 'የአሽከርካሪነት ሥራዎች' } },
      { id: 'job-office', name: 'Office Jobs', translations: { en: 'Office Jobs', om: 'Hojii Waajjiraa', am: 'የቢሮ ሥራዎች' } },
      { id: 'job-teaching', name: 'Teaching Jobs', translations: { en: 'Teaching Jobs', om: 'Hojii Barsiisummaa', am: 'የመምህርነት ሥራዎች' } },
      { id: 'job-healthcare', name: 'Healthcare Jobs', translations: { en: 'Healthcare Jobs', om: 'Hojii Fayyaa', am: 'የጤና እና ህክምና ሥራዎች' } }
    ],
    recommendedFilters: ['Job Type', 'Experience Level', 'Salary Range', 'Location', 'Education'],
    dbMapping: { majorCategory: 'Jobs' }
  },
  {
    id: 'services',
    name: 'Services',
    emoji: '🛠️',
    iconName: 'Wrench',
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-amber-500 to-orange-800',
    translations: {
      en: 'Services',
      om: 'Tajaajiloota',
      am: 'አገልግሎቶች'
    },
    subcategories: [
      { id: 'srv-repair', name: 'Repair Services', translations: { en: 'Repair Services', om: 'Tajaajila Suphaa', am: 'የእድሳትና ጥገና አገልግሎት' } },
      { id: 'srv-cleaning', name: 'Cleaning Services', translations: { en: 'Cleaning Services', om: 'Tajaajila Qulqullinaa', am: 'የጽዳት አገልግሎት' } },
      { id: 'srv-construction', name: 'Construction Services', translations: { en: 'Construction Services', om: 'Tajaajila Ijaarsaa', am: 'የግንባታ አገልግሎት' } },
      { id: 'srv-transport', name: 'Transport Services', translations: { en: 'Transport Services', om: 'Tajaajila Geejjibaa', am: 'የትራንስፖርትና ማጓጓዝ' } },
      { id: 'srv-it', name: 'IT Services', translations: { en: 'IT Services', om: 'Tajaajila IT', am: 'የአይቲ እና ሶፍትዌር' } },
      { id: 'srv-design', name: 'Design Services', translations: { en: 'Design Services', om: 'Tajaajila Diizayinii', am: 'የዲዛይንና ግራፊክስ' } },
      { id: 'srv-marketing', name: 'Marketing Services', translations: { en: 'Marketing Services', om: 'Tajaajila Beeksisaa', am: 'የማርኬቲንግና ማስታወቂያ' } },
      { id: 'srv-photography', name: 'Photography', translations: { en: 'Photography', om: 'Suuraa Kaasuu', am: 'የፎቶ እና ቪዲዮ' } },
      { id: 'srv-events', name: 'Event Services', translations: { en: 'Event Services', om: 'Tajaajila Qophii', am: 'የዝግጅትና የሰርግ አገልግሎት' } }
    ],
    recommendedFilters: ['Service Type', 'Pricing Unit', 'Location', 'Provider Type'],
    dbMapping: { majorCategory: 'Services' }
  },
  {
    id: 'home-furniture-garden',
    name: 'Home, Furniture & Garden',
    emoji: '🪑',
    iconName: 'Armchair',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-amber-700 to-stone-900',
    translations: {
      en: 'Home, Furniture & Garden',
      om: 'Mana, Meeshaa & Boqonnaa',
      am: 'የቤት ዕቃዎች፣ ፈርኒቸርና የአትክልት ስፍራ'
    },
    subcategories: [
      { id: 'fur-furniture', name: 'Furniture', translations: { en: 'Furniture', om: 'Mi’a Manaa', am: 'ፈርኒቸር' } },
      { id: 'fur-beds', name: 'Beds', translations: { en: 'Beds', om: 'Siree', am: 'አልጋዎች' } },
      { id: 'fur-sofas', name: 'Sofas', translations: { en: 'Sofas', om: 'Soofaa', am: 'ሶፋዎች' } },
      { id: 'fur-tables', name: 'Tables', translations: { en: 'Tables', om: 'Minjaala', am: 'ጠረጴዛዎች' } },
      { id: 'fur-chairs', name: 'Chairs', translations: { en: 'Chairs', om: 'Barcuma', am: 'ወንበሮች' } },
      { id: 'fur-kitchen', name: 'Kitchen Equipment', translations: { en: 'Kitchen Equipment', om: 'Meeshaa Koshinii', am: 'የወጥ ቤት ዕቃዎች' } },
      { id: 'fur-decor', name: 'Home Decoration', translations: { en: 'Home Decoration', om: 'Midhaagsa Manaa', am: 'የቤት ጌጣጌጦች' } },
      { id: 'fur-garden', name: 'Garden Tools', translations: { en: 'Garden Tools', om: 'Meeshaa Iddoo', am: 'የአትክልት ስፍራ መሣሪያዎች' } }
    ],
    recommendedFilters: ['Type', 'Material', 'Condition', 'Color', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Furniture', 'Bed', 'Sofa', 'Table', 'Chair', 'Kitchen', 'Decoration', 'Garden'] }
  },
  {
    id: 'babies-kids',
    name: 'Babies & Kids',
    emoji: '👶',
    iconName: 'Baby',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-cyan-500 to-blue-800',
    translations: {
      en: 'Babies & Kids',
      om: "Daa'imman & Ijoollee",
      am: 'የህጻናትና ጨቅላዎች እቃዎች'
    },
    subcategories: [
      { id: 'kid-clothing', name: 'Baby Clothing', translations: { en: 'Baby Clothing', om: 'Uffata Daa’immanii', am: 'የጨቅላዎችና ልጆች ልብስ' } },
      { id: 'kid-toys', name: 'Toys', translations: { en: 'Toys', om: 'Tapha Daa’immanii', am: 'አሻንጉሊቶች' } },
      { id: 'kid-furniture', name: 'Baby Furniture', translations: { en: 'Baby Furniture', om: 'Mi’a Daa’immanii', am: 'የልጆች ፈርኒቸር' } },
      { id: 'kid-equipment', name: 'Baby Equipment', translations: { en: 'Baby Equipment', om: 'Meeshaa Daa’imaa', am: 'የህጻናት ጋሪና እቃዎች' } },
      { id: 'kid-school', name: 'School Supplies', translations: { en: 'School Supplies', om: 'Meeshaa Barumsaa', am: 'የትምህርት ቤት እቃዎች' } }
    ],
    recommendedFilters: ['Age Group', 'Category', 'Condition', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Baby', 'Kids', 'Toy', 'Children', 'School', 'Diaper', 'Stroller', 'Crib'] }
  },
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    emoji: '💄',
    iconName: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-pink-500 to-rose-900',
    translations: {
      en: 'Health & Beauty',
      om: 'Fayyaa & Miidhagina',
      am: 'ጤናና ውበት'
    },
    subcategories: [
      { id: 'hb-cosmetics', name: 'Cosmetics', translations: { en: 'Cosmetics', om: 'Kuullee & Make-up', am: 'ኮስሞቲክስ' } },
      { id: 'hb-perfumes', name: 'Perfumes', translations: { en: 'Perfumes', om: 'Kukii / Urgooftuu', am: 'ሽቶዎች' } },
      { id: 'hb-hair', name: 'Hair Products', translations: { en: 'Hair Products', om: 'Meeshaa Rifeensaa', am: 'የፀጉር እቃዎች' } },
      { id: 'hb-medical', name: 'Medical Equipment', translations: { en: 'Medical Equipment', om: 'Meeshaa Medical', am: 'የሕክምና መሳሪያዎች' } },
      { id: 'hb-fitness', name: 'Fitness Products', translations: { en: 'Fitness Products', om: 'Meeshaa Fiitnasii', am: 'የሰውነት ማጎልመሻዎች' } }
    ],
    recommendedFilters: ['Type', 'Gender', 'Brand', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Cosmetics', 'Perfume', 'Hair', 'Medical', 'Fitness', 'Beauty', 'Skin', 'Makeup'] }
  },
  {
    id: 'agriculture-food',
    name: 'Agriculture & Food',
    emoji: '🌾',
    iconName: 'Sprout',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-green-600 to-emerald-950',
    translations: {
      en: 'Agriculture & Food',
      om: 'Qonnaa & Nyata',
      am: 'እርሻና ምግብ'
    },
    subcategories: [
      { id: 'agri-equipment', name: 'Farm Equipment', translations: { en: 'Farm Equipment', om: 'Meeshaa Qonnaa', am: 'የእርሻ መሳሪያዎች' } },
      { id: 'agri-livestock', name: 'Livestock', translations: { en: 'Livestock', om: 'Beeylada', am: 'እንስሳት' } },
      { id: 'agri-crops', name: 'Crops', translations: { en: 'Crops', om: 'Midhaan', am: 'ሰብሎች' } },
      { id: 'agri-seeds', name: 'Seeds', translations: { en: 'Seeds', om: 'Sanyii', am: 'ምርጥ ዘሮች' } },
      { id: 'agri-fertilizers', name: 'Fertilizers', translations: { en: 'Fertilizers', om: 'Xaa’oo', am: 'ማዳበሪያዎች' } },
      { id: 'agri-food', name: 'Food Products', translations: { en: 'Food Products', om: 'Oomisha Nyaataa', am: 'የምግብ ምርቶች' } }
    ],
    recommendedFilters: ['Type', 'Quantity', 'Location', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Farm', 'Livestock', 'Crop', 'Seed', 'Fertilizer', 'Food', 'Agriculture', 'Tractor'] }
  },
  {
    id: 'animals-pets',
    name: 'Animals & Pets',
    emoji: '🐕',
    iconName: 'Dog',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-orange-600 to-amber-900',
    translations: {
      en: 'Animals & Pets',
      om: 'Beeyladaa & Binensota',
      am: 'ቤት እንስሳትና እንስሳት'
    },
    subcategories: [
      { id: 'pet-dogs', name: 'Dogs', translations: { en: 'Dogs', om: 'Saree', am: 'ውሾች' } },
      { id: 'pet-cats', name: 'Cats', translations: { en: 'Cats', om: 'Adurree', am: 'ድመቶች' } },
      { id: 'pet-birds', name: 'Birds', translations: { en: 'Birds', om: 'Simbirroota', am: 'ወፎች' } },
      { id: 'pet-livestock', name: 'Livestock', translations: { en: 'Livestock', om: 'Beeylada', am: 'የቤት እንስሳት (ከብቶች)' } },
      { id: 'pet-accessories', name: 'Pet Accessories', translations: { en: 'Pet Accessories', om: 'Meeshaa Beeyladaa', am: 'የእንስሳት እቃዎች' } }
    ],
    recommendedFilters: ['Animal Type', 'Age', 'Breed', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Dog', 'Cat', 'Bird', 'Pet', 'Animal', 'Puppy', 'Kitten'] }
  },
  {
    id: 'sports-outdoors',
    name: 'Sports & Outdoors',
    emoji: '🏃',
    iconName: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-red-600 to-rose-950',
    translations: {
      en: 'Sports & Outdoors',
      om: 'Ispoortii & Misooma',
      am: 'ስፖርትና ከቤት ውጭ እንቅስቃሴዎች'
    },
    subcategories: [
      { id: 'spt-fitness', name: 'Fitness Equipment', translations: { en: 'Fitness Equipment', om: 'Meeshaa Fiitnasii', am: 'የሰውነት ማጎልመሻ እቃዎች' } },
      { id: 'spt-football', name: 'Football', translations: { en: 'Football', om: 'Kubbaa Miilaa', am: 'እግር ኳስ' } },
      { id: 'spt-cycling', name: 'Cycling', translations: { en: 'Cycling', om: 'Biskeleta Ispoortii', am: 'ብስክሌት መጋለብ' } },
      { id: 'spt-outdoor', name: 'Outdoor Equipment', translations: { en: 'Outdoor Equipment', om: 'Meeshaa Dirree', am: 'የካምፒንግና ሜዳ እቃዎች' } }
    ],
    recommendedFilters: ['Sport Type', 'Condition', 'Brand', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Sport', 'Fitness', 'Football', 'Cycling', 'Outdoor', 'Gym', 'Jersey', 'Treadmill'] }
  },
  {
    id: 'education',
    name: 'Education',
    emoji: '📚',
    iconName: 'BookOpen',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-indigo-600 to-blue-900',
    translations: {
      en: 'Education',
      om: 'Barumsaa',
      am: 'ትምህርትና ስልጠና'
    },
    subcategories: [
      { id: 'edu-courses', name: 'Courses', translations: { en: 'Courses', om: 'Koorsiiwwan', am: 'ኮርሶች' } },
      { id: 'edu-books', name: 'Books', translations: { en: 'Books', om: 'Kitaabota', am: 'መጻሕፍት' } },
      { id: 'edu-training', name: 'Training', translations: { en: 'Training', om: 'Leenjii', am: 'ስልጠናዎች' } },
      { id: 'edu-materials', name: 'School Materials', translations: { en: 'School Materials', om: 'Meeshaa Barumsaa', am: 'የትምህርት መሣሪያዎች' } }
    ],
    recommendedFilters: ['Type', 'Subject', 'Format', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Course', 'Book', 'Training', 'School', 'Education', 'Tutorial', 'Class'] }
  },
  {
    id: 'commercial-equipment',
    name: 'Commercial Equipment',
    emoji: '🏢',
    iconName: 'Building2',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-slate-700 to-zinc-950',
    translations: {
      en: 'Commercial Equipment',
      om: 'Meeshaalee Daldalaa',
      am: 'የንግድና ኢንዱስትሪ እቃዎች'
    },
    subcategories: [
      { id: 'comm-restaurant', name: 'Restaurant Equipment', translations: { en: 'Restaurant Equipment', om: 'Meeshaa Hoteelaa', am: 'የሬስቶራንትና ሆቴል ዕቃዎች' } },
      { id: 'comm-office', name: 'Office Equipment', translations: { en: 'Office Equipment', om: 'Meeshaa Waajjiraa', am: 'የቢሮ እቃዎች' } },
      { id: 'comm-industrial', name: 'Industrial Equipment', translations: { en: 'Industrial Equipment', om: 'Meeshaa Indaastrii', am: 'የኢንዱስትሪ ማሽነሪዎች' } },
      { id: 'comm-shop', name: 'Shop Equipment', translations: { en: 'Shop Equipment', om: 'Meeshaa Suuqii', am: 'የሱቅ መደርደሪያዎችና እቃዎች' } }
    ],
    recommendedFilters: ['Industry', 'Condition', 'Price'],
    dbMapping: { majorCategory: 'Products', propertyTypeKeywords: ['Restaurant', 'Office Equipment', 'Industrial', 'Shop Equipment', 'Machine', 'Generator'] }
  },
  {
    id: 'community',
    name: 'Community',
    emoji: '🤝',
    iconName: 'Users',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-purple-700 to-violet-950',
    translations: {
      en: 'Community',
      om: 'Hawaasa',
      am: 'ማህበረሰብ'
    },
    subcategories: [
      { id: 'com-events', name: 'Events', translations: { en: 'Events', om: 'Qophiiwwan', am: 'ዝግጅቶች' } },
      { id: 'com-announcements', name: 'Announcements', translations: { en: 'Announcements', om: 'Beeksisa', am: 'ማስታወቂያዎች' } },
      { id: 'com-lost-found', name: 'Lost and Found', translations: { en: 'Lost and Found', om: 'Badaa & Argamaa', am: 'የጠፋና የተገኘ' } },
      { id: 'com-donations', name: 'Donations', translations: { en: 'Donations', om: 'Kennaa / Arjooma', am: 'ልገሳ' } }
    ],
    recommendedFilters: ['Type', 'Location'],
    dbMapping: { majorCategory: 'Community' }
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '📦',
    iconName: 'Package',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80',
    bannerGradient: 'from-zinc-700 to-neutral-900',
    translations: {
      en: 'Other',
      om: 'Kan Biroo',
      am: 'ሌሎች'
    },
    subcategories: [
      { id: 'oth-misc', name: 'Miscellaneous Items', translations: { en: 'Miscellaneous Items', om: 'Meeshaalee Biroo', am: 'ልዩ ልዩ እቃዎች' } }
    ],
    recommendedFilters: ['Condition', 'Price'],
    dbMapping: { majorCategory: 'Products' }
  }
];

export function isListingActiveAndPublished(p: any): boolean {
  if (!p) return false;

  // 1. Approval/Verification check: Must be verified or explicitly verified listing, and not pending/rejected
  const isApproved = (p.verificationStatus === 'verified' || p.isVerifiedListing === true || p.approvalStatus === 'approved') &&
                     p.verificationStatus !== 'rejected' &&
                     p.approvalStatus !== 'rejected' &&
                     p.verificationStatus !== 'pending' &&
                     p.approvalStatus !== 'pending';
  if (!isApproved) return false;

  // 2. Status checks
  const status = extractString(p.status).toLowerCase();
  if (['sold', 'rented', 'unavailable', 'expired', 'deleted', 'rejected', 'pending'].includes(status)) {
    return false;
  }
  if (p.isSold || p.isRented || p.isExpired || p.isDeleted) {
    return false;
  }

  // 3. Description tags check
  const desc = extractString(p.description);
  if (
    desc.includes('**SOLD**') ||
    desc.includes('**RENTED**') ||
    desc.includes('**UNAVAILABLE**') ||
    desc.includes('**COMPLETED**') ||
    desc.includes('**EXPIRED**')
  ) {
    return false;
  }

  return true;
}

export function getEffectiveMajorCategory(p: {
  majorCategory?: string;
  propertyType?: string;
  category?: string;
  title?: string;
  description?: string;
  subCategoryId?: string;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}): 'Properties' | 'Vehicles' | 'Jobs' | 'Services' | 'Products' | 'Local Businesses' | 'Community' {
  if (!p) return 'Products';

  // 1. Check explicit subCategoryId prefix if present
  if (p.subCategoryId) {
    const sub = p.subCategoryId;
    if (sub.startsWith('prop-')) return 'Properties';
    if (sub.startsWith('veh-')) return 'Vehicles';
    if (sub.startsWith('job-')) return 'Jobs';
    if (sub.startsWith('srv-')) return 'Services';
    if (sub.startsWith('com-')) return 'Community';
    if (
      sub.startsWith('el-') ||
      sub.startsWith('fas-') ||
      sub.startsWith('fur-') ||
      sub.startsWith('kid-') ||
      sub.startsWith('hb-') ||
      sub.startsWith('agri-') ||
      sub.startsWith('pet-') ||
      sub.startsWith('spt-') ||
      sub.startsWith('edu-') ||
      sub.startsWith('comm-') ||
      sub.startsWith('oth-')
    ) {
      return 'Products';
    }
  }

  // 2. Check explicit majorCategory or category if valid
  const rawMajor = (p.majorCategory || '').trim().toLowerCase();
  if (rawMajor === 'properties' || rawMajor === 'real estate') return 'Properties';
  if (rawMajor === 'vehicles' || rawMajor === 'vehicle') return 'Vehicles';
  if (rawMajor === 'jobs' || rawMajor === 'job') return 'Jobs';
  if (rawMajor === 'services' || rawMajor === 'service') return 'Services';
  if (rawMajor === 'products' || rawMajor === 'product') return 'Products';
  if (rawMajor === 'local businesses' || rawMajor === 'local business') return 'Local Businesses';
  if (rawMajor === 'community') return 'Community';

  const rawCat = extractString(p.category).trim().toLowerCase();
  if (rawCat === 'properties' || rawCat === 'real estate') return 'Properties';
  if (rawCat === 'vehicles' || rawCat === 'vehicle') return 'Vehicles';
  if (rawCat === 'jobs' || rawCat === 'job') return 'Jobs';
  if (rawCat === 'services' || rawCat === 'service') return 'Services';
  if (rawCat === 'products' || rawCat === 'product') return 'Products';
  if (rawCat === 'community') return 'Community';

  // Lowercase text fields for inspection
  const type = extractString(p.propertyType).toLowerCase();
  const cat = extractString(p.category).toLowerCase();
  const title = extractString(p.title).toLowerCase();
  const desc = extractString(p.description).toLowerCase();
  const fullText = `${type} ${cat} ${title} ${desc}`;

  // Check Property indicators first (Bedrooms, Bathrooms, or Property types like Villa, House, Apartment, Land, Office, Shop, Warehouse)
  // This prevents properties mentioning "car parking" or "car garage" from mistakenly matching Vehicles
  const propKeywords = ['villa', 'house', 'apartment', 'condo', 'land', 'plot', 'office', 'shop', 'warehouse', 'commercial', 'real estate', 'hotel', 'farm', 'building', 'penthouse', 'townhouse'];
  const hasPropTypeOrKeyword = propKeywords.some(kw => type === kw || type.includes(kw) || title.includes(kw));
  if (
    hasPropTypeOrKeyword ||
    (p.bedrooms !== undefined && Number(p.bedrooms) > 0) ||
    (p.bathrooms !== undefined && Number(p.bathrooms) > 0) ||
    (fullText.includes('villa') || fullText.includes('apartment') || fullText.includes('real estate'))
  ) {
    return 'Properties';
  }

  // 3. Keyword matching
  // Vehicles
  if (
    fullText.includes('car') ||
    fullText.includes('vehicle') ||
    fullText.includes('toyota') ||
    fullText.includes('suzuki') ||
    fullText.includes('hyundai') ||
    fullText.includes('nissan') ||
    fullText.includes('motorcycle') ||
    fullText.includes('truck') ||
    fullText.includes('bus') ||
    fullText.includes('sedan') ||
    fullText.includes('suv') ||
    fullText.includes('pickup') ||
    fullText.includes('spare part')
  ) {
    return 'Vehicles';
  }

  // Jobs
  if (
    fullText.includes('job') ||
    fullText.includes('vacancy') ||
    fullText.includes('hiring') ||
    fullText.includes('full time') ||
    fullText.includes('part time') ||
    fullText.includes('freelance') ||
    fullText.includes('salary') ||
    fullText.includes('employment')
  ) {
    return 'Jobs';
  }

  // Services
  if (
    fullText.includes('service') ||
    fullText.includes('repair') ||
    fullText.includes('cleaning') ||
    fullText.includes('plumbing') ||
    fullText.includes('electrician') ||
    fullText.includes('consulting') ||
    fullText.includes('photography')
  ) {
    return 'Services';
  }

  // Community
  if (
    fullText.includes('event') ||
    fullText.includes('announcement') ||
    fullText.includes('lost and found') ||
    fullText.includes('donation') ||
    fullText.includes('community')
  ) {
    return 'Community';
  }

  // Properties general check
  if (
    fullText.includes('house') ||
    fullText.includes('apartment') ||
    fullText.includes('villa') ||
    fullText.includes('condo') ||
    fullText.includes('land') ||
    fullText.includes('plot') ||
    fullText.includes('office') ||
    fullText.includes('shop') ||
    fullText.includes('warehouse') ||
    fullText.includes('real estate') ||
    (p.area !== undefined && Number(p.area) > 0)
  ) {
    return 'Properties';
  }

  // Default to Products
  return 'Products';
}

/**
 * Authoritative check if a listing belongs to the Properties category.
 * Recognizes all property types (Villas, Houses, Apartments, Land, Offices, Shops, Warehouses, Commercial, etc.)
 */
export function isPropertyListing(p: any): boolean {
  if (!p) return false;

  if (p.subCategoryId && typeof p.subCategoryId === 'string' && p.subCategoryId.startsWith('prop-')) {
    return true;
  }

  const major = (p.majorCategory || '').toString().trim().toLowerCase();
  if (major === 'properties' || major === 'real estate') {
    return true;
  }

  const cat = (typeof p.category === 'string' ? p.category : extractString(p.category)).trim().toLowerCase();
  if (cat === 'properties' || cat === 'real estate') {
    return true;
  }

  const type = (typeof p.propertyType === 'string' ? p.propertyType : extractString(p.propertyType)).trim().toLowerCase();
  const propertyKeywords = [
    'villa', 'villas', 'house', 'houses', 'apartment', 'apartments', 'condo', 'condominium',
    'land', 'plot', 'plots', 'office', 'offices', 'shop', 'shops', 'warehouse', 'warehouses',
    'commercial', 'building', 'buildings', 'real estate', 'hotel', 'hotels', 'farm', 'farms',
    'penthouse', 'townhouse', 'studio', 'residential'
  ];
  if (propertyKeywords.some(kw => type === kw || (type.length > 2 && type.includes(kw)))) {
    return true;
  }

  if ((p.bedrooms !== undefined && Number(p.bedrooms) > 0) || (p.bathrooms !== undefined && Number(p.bathrooms) > 0)) {
    return true;
  }

  return getEffectiveMajorCategory(p) === 'Properties';
}

/**
 * Checks if a listing is a physical product category (clothing, electronics, furniture, food, spare parts, etc.)
 * Excludes properties, whole vehicles (cars/trucks/buses), jobs, services, and community posts.
 */
export function isPhysicalProductListing(p: any): boolean {
  if (!p) return false;
  if (isPropertyListing(p)) return false;

  const eff = getEffectiveMajorCategory(p);
  if (eff === 'Properties' || eff === 'Jobs' || eff === 'Services' || eff === 'Community') {
    return false;
  }

  if (eff === 'Vehicles') {
    const sub = (p.subCategoryId || '').toLowerCase();
    const type = (typeof p.propertyType === 'string' ? p.propertyType : extractString(p.propertyType)).toLowerCase();
    const cat = (typeof p.category === 'string' ? p.category : extractString(p.category)).toLowerCase();
    const title = (typeof p.title === 'string' ? p.title : extractString(p.title)).toLowerCase();
    const combined = `${sub} ${type} ${cat} ${title}`;
    return combined.includes('part') || combined.includes('spare') || combined.includes('accessori') || combined.includes('tire') || combined.includes('rim') || combined.includes('engine');
  }

  return true;
}

export function getMatchingSubcategoryId(p: {
  majorCategory?: string;
  propertyType?: string;
  category?: string;
  title?: string;
  description?: string;
  subCategoryId?: string;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}): string {
  // Extract all known specific subcategory IDs (excluding oth-misc)
  const knownSpecificSubIds = new Set([
    'prop-houses', 'prop-apartments', 'prop-villas', 'prop-land', 'prop-offices', 'prop-shops', 'prop-warehouse', 'prop-hotels', 'prop-farms', 'prop-commercial', 'prop-services',
    'veh-cars', 'veh-motorcycles', 'veh-trucks', 'veh-buses', 'veh-heavy', 'veh-parts', 'veh-accessories', 'veh-services',
    'el-smartphones', 'el-tablets', 'el-laptops', 'el-desktops', 'el-tvs', 'el-cameras', 'el-audio', 'el-gaming', 'el-comp-acc', 'el-phone-acc', 'el-watches', 'el-appliances',
    'fas-men', 'fas-women', 'fas-kids', 'fas-shoes', 'fas-bags', 'fas-watches', 'fas-jewelry', 'fas-accessories',
    'job-fulltime', 'job-parttime', 'job-freelance', 'job-remote', 'job-construction', 'job-driver', 'job-office', 'job-teaching', 'job-healthcare',
    'srv-repair', 'srv-cleaning', 'srv-construction', 'srv-transport', 'srv-it', 'srv-design', 'srv-marketing', 'srv-photography', 'srv-events',
    'fur-furniture', 'fur-beds', 'fur-sofas', 'fur-tables', 'fur-chairs', 'fur-kitchen', 'fur-decor', 'fur-garden',
    'kid-clothing', 'kid-toys', 'kid-furniture', 'kid-equipment', 'kid-school',
    'hb-cosmetics', 'hb-perfumes', 'hb-hair', 'hb-medical', 'hb-fitness',
    'agri-equipment', 'agri-livestock', 'agri-crops', 'agri-seeds', 'agri-fertilizers', 'agri-food',
    'pet-dogs', 'pet-cats', 'pet-birds', 'pet-livestock', 'pet-accessories',
    'spt-fitness', 'spt-football', 'spt-cycling', 'spt-outdoor',
    'edu-courses', 'edu-books', 'edu-training', 'edu-materials',
    'comm-restaurant', 'comm-office', 'comm-industrial', 'comm-shop',
    'com-events', 'com-announcements', 'com-lost-found', 'com-donations'
  ]);

  if (p.subCategoryId && knownSpecificSubIds.has(p.subCategoryId)) {
    return p.subCategoryId;
  }

  const effMajor = getEffectiveMajorCategory(p);
  const type = extractString(p.propertyType).toLowerCase();
  const cat = extractString(p.category).toLowerCase();
  const title = extractString(p.title).toLowerCase();
  const desc = extractString(p.description).toLowerCase();
  const amenitiesStr = Array.isArray(p.amenities) ? p.amenities.join(' ').toLowerCase() : '';
  const fullText = `${type} ${cat} ${title} ${desc} ${amenitiesStr}`;

  // Direct subcategory name matches from propertyType / category / amenities
  if (fullText.includes("men's clothing") || fullText.includes("uffata dhiiraa") || fullText.includes("የወንዶች ልብሶች") || fullText.includes("mens clothing")) return 'fas-men';
  if (fullText.includes("women's clothing") || fullText.includes("uffata dubartootaa") || fullText.includes("የሴቶች ልብሶች") || fullText.includes("womens clothing")) return 'fas-women';
  if (fullText.includes("kids clothing") || fullText.includes("uffata daa’immanii") || fullText.includes("የልጆች ልብሶች")) return 'fas-kids';
  if (fullText.includes("shoes") || fullText.includes("kophee") || fullText.includes("ጫማዎች")) return 'fas-shoes';
  if (fullText.includes("bags") || fullText.includes("boorsaa") || fullText.includes("ቦርሳዎች")) return 'fas-bags';
  if (fullText.includes("watches") || fullText.includes("sa’aatii") || fullText.includes("ሰዓቶች")) return 'fas-watches';
  if (fullText.includes("jewelry") || fullText.includes("meeshaalee faayaa") || fullText.includes("ጌጣጌጦች")) return 'fas-jewelry';

  // 1. Properties
  if (effMajor === 'Properties') {
    if (type.includes('apartment') || title.includes('apartment') || desc.includes('apartment') || type.includes('condo')) return 'prop-apartments';
    if (type.includes('villa') || title.includes('villa') || desc.includes('villa')) return 'prop-villas';
    if (type.includes('land') || title.includes('land') || title.includes('plot') || desc.includes('land')) return 'prop-land';
    if (type.includes('office') || title.includes('office') || desc.includes('office')) return 'prop-offices';
    if (type.includes('shop') || title.includes('shop') || desc.includes('shop')) return 'prop-shops';
    if (type.includes('warehouse') || title.includes('warehouse') || desc.includes('warehouse')) return 'prop-warehouse';
    if (type.includes('hotel') || title.includes('hotel') || desc.includes('hotel')) return 'prop-hotels';
    if (type.includes('farm') || title.includes('farm') || desc.includes('farm')) return 'prop-farms';
    if (type.includes('commercial') || title.includes('commercial') || desc.includes('commercial')) return 'prop-commercial';
    return 'prop-houses';
  }

  // 2. Vehicles
  if (effMajor === 'Vehicles') {
    if (fullText.includes('motorcycle') || fullText.includes('motorbike') || fullText.includes('scooter') || fullText.includes('mootora')) return 'veh-motorcycles';
    if (fullText.includes('truck') || fullText.includes('cargo') || fullText.includes('lorry') || fullText.includes('tiraakii')) return 'veh-trucks';
    if (fullText.includes('bus') || fullText.includes('coaster') || fullText.includes('baasii')) return 'veh-buses';
    if (fullText.includes('heavy') || fullText.includes('excavator') || fullText.includes('machinery') || fullText.includes('mishiniitii')) return 'veh-heavy';
    if (fullText.includes('part') || fullText.includes('spare') || fullText.includes('engine') || fullText.includes('brake') || fullText.includes('tire')) return 'veh-parts';
    if (fullText.includes('accessory') || fullText.includes('accessories') || fullText.includes('dash cam') || fullText.includes('seat cover')) return 'veh-accessories';
    if (fullText.includes('service') || fullText.includes('repair') || fullText.includes('garage')) return 'veh-services';
    return 'veh-cars';
  }

  // 3. Jobs
  if (effMajor === 'Jobs') {
    if (fullText.includes('part time') || fullText.includes('part-time')) return 'job-parttime';
    if (fullText.includes('freelance') || fullText.includes('contract')) return 'job-freelance';
    if (fullText.includes('remote') || fullText.includes('online job')) return 'job-remote';
    if (fullText.includes('construction')) return 'job-construction';
    if (fullText.includes('driver') || fullText.includes('chauffeur')) return 'job-driver';
    if (fullText.includes('office') || fullText.includes('admin') || fullText.includes('clerk')) return 'job-office';
    if (fullText.includes('teacher') || fullText.includes('teaching') || fullText.includes('tutor') || fullText.includes('school')) return 'job-teaching';
    if (fullText.includes('doctor') || fullText.includes('nurse') || fullText.includes('health') || fullText.includes('medical')) return 'job-healthcare';
    return 'job-fulltime';
  }

  // 4. Services
  if (effMajor === 'Services') {
    if (fullText.includes('clean') || fullText.includes('janitorial')) return 'srv-cleaning';
    if (fullText.includes('construct') || fullText.includes('plumbing') || fullText.includes('electric') || fullText.includes('carpentry')) return 'srv-construction';
    if (fullText.includes('transport') || fullText.includes('move') || fullText.includes('delivery') || fullText.includes('courier')) return 'srv-transport';
    if (fullText.includes('it ') || fullText.includes('software') || fullText.includes('web ') || fullText.includes('app ')) return 'srv-it';
    if (fullText.includes('design') || fullText.includes('logo') || fullText.includes('graphics')) return 'srv-design';
    if (fullText.includes('marketing') || fullText.includes('advertising') || fullText.includes('ad ')) return 'srv-marketing';
    if (fullText.includes('photo') || fullText.includes('video') || fullText.includes('camera')) return 'srv-photography';
    if (fullText.includes('event') || fullText.includes('wedding') || fullText.includes('catering')) return 'srv-events';
    return 'srv-repair';
  }

  // 5. Community
  if (effMajor === 'Community') {
    if (fullText.includes('announcement') || fullText.includes('notice')) return 'com-announcements';
    if (fullText.includes('lost') || fullText.includes('found')) return 'com-lost-found';
    if (fullText.includes('donation') || fullText.includes('charity') || fullText.includes('fundraiser')) return 'com-donations';
    return 'com-events';
  }

  // 6. Products Sub-Classification
  // Fashion
  const isFashion = type.includes('fashion') || type.includes('clothing') || cat.includes('fashion') || cat.includes('clothing') || fullText.includes('fashion') || fullText.includes('clothing') || fullText.includes('uffata') || fullText.includes('ልብስ');
  if (isFashion) {
    if (fullText.includes('shoe') || fullText.includes('sneaker') || fullText.includes('boot') || fullText.includes('sandal') || fullText.includes('kophee') || fullText.includes('ጫማ') || fullText.includes('nike') || fullText.includes('adidas') || fullText.includes('puma') || fullText.includes('converse')) return 'fas-shoes';
    if (fullText.includes('bag') || fullText.includes('backpack') || fullText.includes('purse') || fullText.includes('handbag') || fullText.includes('wallet') || fullText.includes('boorsaa') || fullText.includes('ቦርሳ') || fullText.includes('gucci') || fullText.includes('louis vuitton')) return 'fas-bags';
    if (fullText.includes('watch') || fullText.includes('rolex') || fullText.includes('casio') || fullText.includes('sa’aatii') || fullText.includes('ሰዓት')) return 'fas-watches';
    if (fullText.includes('jewelry') || fullText.includes('ring') || fullText.includes('necklace') || fullText.includes('gold') || fullText.includes('silver') || fullText.includes('faayaa') || fullText.includes('ጌጣጌጥ')) return 'fas-jewelry';
    if (fullText.includes('accessory') || fullText.includes('sunglasses') || fullText.includes('belt') || fullText.includes('hat') || fullText.includes('cap') || fullText.includes('tie')) return 'fas-accessories';
    if (fullText.includes('women') || fullText.includes('woman') || fullText.includes('lady') || fullText.includes('ladies') || fullText.includes('dress') || fullText.includes('skirt') || fullText.includes('gown') || fullText.includes('abaya') || fullText.includes('hijab') || fullText.includes('dubartii') || fullText.includes('ሴት')) return 'fas-women';
    if (fullText.includes('kid') || fullText.includes('child') || fullText.includes('baby') || fullText.includes('boy') || fullText.includes('girl') || fullText.includes('daa’im') || fullText.includes('ልጆች')) return 'fas-kids';
    return 'fas-men';
  }

  // Electronics
  const isElectronics = type.includes('electronic') || type.includes('gadget') || type.includes('phone') || type.includes('computer') || cat.includes('electronic') || fullText.includes('electronic') || fullText.includes('ilektirooniks') || fullText.includes('ኤሌክትሮኒክስ');
  if (isElectronics) {
    if (fullText.includes('tablet') || fullText.includes('ipad') || fullText.includes('taableet') || fullText.includes('ታብሌት')) return 'el-tablets';
    if (fullText.includes('laptop') || fullText.includes('macbook') || fullText.includes('thinkpad') || fullText.includes('dell') || fullText.includes('hp') || fullText.includes('lenovo') || fullText.includes('laaphtoop') || fullText.includes('ላፕቶፕ')) return 'el-laptops';
    if (fullText.includes('desktop') || fullText.includes('pc') || fullText.includes('imac') || fullText.includes('computer') || fullText.includes('koompuyootara') || fullText.includes('ኮምፒውተር')) return 'el-desktops';
    if (fullText.includes('tv') || fullText.includes('television') || fullText.includes('tiivii') || fullText.includes('ቴሌቪዥን')) return 'el-tvs';
    if (fullText.includes('camera') || fullText.includes('canon') || fullText.includes('nikon') || fullText.includes('sony') || fullText.includes('dslr') || fullText.includes('kaameraa') || fullText.includes('ካሜራ')) return 'el-cameras';
    if (fullText.includes('audio') || fullText.includes('speaker') || fullText.includes('headphone') || fullText.includes('earphone') || fullText.includes('earbuds') || fullText.includes('airpods') || fullText.includes('soundbar') || fullText.includes('jbl') || fullText.includes('sagalee') || fullText.includes('ድምፅ')) return 'el-audio';
    if (fullText.includes('gaming') || fullText.includes('playstation') || fullText.includes('ps4') || fullText.includes('ps5') || fullText.includes('xbox') || fullText.includes('nintendo') || fullText.includes('console') || fullText.includes('game') || fullText.includes('taphaa') || fullText.includes('ጨዋታ')) return 'el-gaming';
    if (fullText.includes('smartwatch') || fullText.includes('apple watch') || fullText.includes('galaxy watch') || fullText.includes('smart watch')) return 'el-watches';
    if (fullText.includes('charger') || fullText.includes('power bank') || fullText.includes('phone case') || fullText.includes('screen protector')) return 'el-phone-acc';
    if (fullText.includes('keyboard') || fullText.includes('mouse') || fullText.includes('monitor') || fullText.includes('router') || fullText.includes('hard drive') || fullText.includes('ssd') || fullText.includes('ram')) return 'el-comp-acc';
    if (fullText.includes('appliance') || fullText.includes('refrigerator') || fullText.includes('fridge') || fullText.includes('washing machine') || fullText.includes('microwave') || fullText.includes('ac ') || fullText.includes('vacuum')) return 'el-appliances';
    return 'el-smartphones';
  }

  // Home & Furniture
  const isFurniture = type.includes('furniture') || type.includes('home') || fullText.includes('furniture') || fullText.includes('mi’a manaa') || fullText.includes('ፈርኒቸር');
  if (isFurniture) {
    if (fullText.includes('bed') || fullText.includes('mattress') || fullText.includes('siree') || fullText.includes('አልጋ')) return 'fur-beds';
    if (fullText.includes('sofa') || fullText.includes('couch') || fullText.includes('soofaa') || fullText.includes('ሶፋ')) return 'fur-sofas';
    if (fullText.includes('table') || fullText.includes('desk') || fullText.includes('minjaala') || fullText.includes('ጠረጴዛ')) return 'fur-tables';
    if (fullText.includes('chair') || fullText.includes('stool') || fullText.includes('barcuma') || fullText.includes('ወንበር')) return 'fur-chairs';
    if (fullText.includes('kitchen') || fullText.includes('cookware') || fullText.includes('pot') || fullText.includes('stove') || fullText.includes('oven') || fullText.includes('koshinii') || fullText.includes('ወጥ ቤት')) return 'fur-kitchen';
    if (fullText.includes('decor') || fullText.includes('curtain') || fullText.includes('carpet') || fullText.includes('rug') || fullText.includes('lamp') || fullText.includes('midhaagsa')) return 'fur-decor';
    if (fullText.includes('garden') || fullText.includes('lawn') || fullText.includes('plant') || fullText.includes('flower')) return 'fur-garden';
    return 'fur-furniture';
  }

  // Babies & Kids
  const isKids = type.includes('babies') || type.includes('kids') || fullText.includes('baby') || fullText.includes('daa’im') || fullText.includes('ጨቅላ');
  if (isKids) {
    if (fullText.includes('cloth') || fullText.includes('dress') || fullText.includes('onesie') || fullText.includes('uffata')) return 'kid-clothing';
    if (fullText.includes('toy') || fullText.includes('doll') || fullText.includes('lego') || fullText.includes('tapha') || fullText.includes('አሻንጉሊት')) return 'kid-toys';
    if (fullText.includes('crib') || fullText.includes('cot') || fullText.includes('high chair')) return 'kid-furniture';
    if (fullText.includes('stroller') || fullText.includes('carrier') || fullText.includes('walker') || fullText.includes('ጋሪ')) return 'kid-equipment';
    if (fullText.includes('school') || fullText.includes('notebook') || fullText.includes('pencil') || fullText.includes('stationery')) return 'kid-school';
    return 'kid-toys';
  }

  // Health & Beauty
  const isBeauty = type.includes('health') || type.includes('beauty') || fullText.includes('beauty') || fullText.includes('fayyaa') || fullText.includes('ውበት');
  if (isBeauty) {
    if (fullText.includes('perfume') || fullText.includes('fragrance') || fullText.includes('cologne') || fullText.includes('urgoo') || fullText.includes('ሽቶ')) return 'hb-perfumes';
    if (fullText.includes('hair') || fullText.includes('shampoo') || fullText.includes('wig') || fullText.includes('clipper') || fullText.includes('rifeensa') || fullText.includes('ፀጉር')) return 'hb-hair';
    if (fullText.includes('medical') || fullText.includes('thermometer') || fullText.includes('wheelchair') || fullText.includes('ሕክምና')) return 'hb-medical';
    if (fullText.includes('fitness') || fullText.includes('dumbbell') || fullText.includes('supplement') || fullText.includes('fiitnasa')) return 'hb-fitness';
    return 'hb-cosmetics';
  }

  // Agriculture & Food
  const isAgri = type.includes('agriculture') || type.includes('food') || fullText.includes('agriculture') || fullText.includes('qonnaa') || fullText.includes('እርሻ');
  if (isAgri) {
    if (fullText.includes('equipment') || fullText.includes('tractor') || fullText.includes('harvester') || fullText.includes('plow') || fullText.includes('irrigation')) return 'agri-equipment';
    if (fullText.includes('livestock') || fullText.includes('cattle') || fullText.includes('cow') || fullText.includes('sheep') || fullText.includes('goat') || fullText.includes('chicken')) return 'agri-livestock';
    if (fullText.includes('crop') || fullText.includes('grain') || fullText.includes('teff') || fullText.includes('wheat') || fullText.includes('maize') || fullText.includes('coffee') || fullText.includes('midhaan')) return 'agri-crops';
    if (fullText.includes('seed') || fullText.includes('sanyii') || fullText.includes('ዘር')) return 'agri-seeds';
    if (fullText.includes('fertilizer') || fullText.includes('xaa’oo') || fullText.includes('ማዳበሪያ')) return 'agri-fertilizers';
    return 'agri-food';
  }

  // Animals & Pets
  const isPets = type.includes('animals') || type.includes('pets') || fullText.includes('pet') || fullText.includes('binensota') || fullText.includes('እንስሳት');
  if (isPets) {
    if (fullText.includes('dog') || fullText.includes('puppy') || fullText.includes('saree') || fullText.includes('ውሻ')) return 'pet-dogs';
    if (fullText.includes('cat') || fullText.includes('kitten') || fullText.includes('adurree') || fullText.includes('ድመት')) return 'pet-cats';
    if (fullText.includes('bird') || fullText.includes('parrot') || fullText.includes('simbirroo') || fullText.includes('ወፍ')) return 'pet-birds';
    if (fullText.includes('accessory') || fullText.includes('cage') || fullText.includes('aquarium')) return 'pet-accessories';
    return 'pet-dogs';
  }

  // Sports & Outdoors
  const isSports = type.includes('sports') || type.includes('outdoors') || fullText.includes('sport') || fullText.includes('ispoortii') || fullText.includes('ስፖርት');
  if (isSports) {
    if (fullText.includes('fitness') || fullText.includes('treadmill') || fullText.includes('gym') || fullText.includes('dumbbell')) return 'spt-fitness';
    if (fullText.includes('football') || fullText.includes('soccer') || fullText.includes('jersey') || fullText.includes('kubbaa')) return 'spt-football';
    if (fullText.includes('cycling') || fullText.includes('bicycle') || fullText.includes('bike') || fullText.includes('biskeleta')) return 'spt-cycling';
    if (fullText.includes('outdoor') || fullText.includes('tent') || fullText.includes('camping') || fullText.includes('hiking')) return 'spt-outdoor';
    return 'spt-fitness';
  }

  // Education
  const isEdu = type.includes('education') || fullText.includes('education') || fullText.includes('barumsaa') || fullText.includes('ትምህርት');
  if (isEdu) {
    if (fullText.includes('course') || fullText.includes('class') || fullText.includes('tutoring') || fullText.includes('koorsii')) return 'edu-courses';
    if (fullText.includes('book') || fullText.includes('textbook') || fullText.includes('novel') || fullText.includes('kitaaba') || fullText.includes('መጽሐፍ')) return 'edu-books';
    if (fullText.includes('training') || fullText.includes('workshop') || fullText.includes('leenjii') || fullText.includes('ስልጠና')) return 'edu-training';
    return 'edu-books';
  }

  // Commercial Equipment
  const isComm = type.includes('commercial equipment') || fullText.includes('commercial equipment') || fullText.includes('meeshaalee daldalaa');
  if (isComm) {
    if (fullText.includes('restaurant') || fullText.includes('hotel') || fullText.includes('oven') || fullText.includes('fryer')) return 'comm-restaurant';
    if (fullText.includes('office') || fullText.includes('printer') || fullText.includes('photocopier') || fullText.includes('projector')) return 'comm-office';
    if (fullText.includes('industrial') || fullText.includes('generator') || fullText.includes('machine') || fullText.includes('welding')) return 'comm-industrial';
    return 'comm-shop';
  }

  // Final keyword fallbacks
  if (fullText.includes('phone') || fullText.includes('iphone') || fullText.includes('samsung') || fullText.includes('smartphone')) return 'el-smartphones';
  if (fullText.includes('laptop') || fullText.includes('macbook')) return 'el-laptops';
  if (fullText.includes('tv') || fullText.includes('television')) return 'el-tvs';
  if (fullText.includes('shirt') || fullText.includes('pant') || fullText.includes('dress') || fullText.includes('shoe') || fullText.includes('nike') || fullText.includes('adidas')) return 'fas-men';
  if (fullText.includes('sofa') || fullText.includes('bed') || fullText.includes('chair') || fullText.includes('table')) return 'fur-furniture';
  if (fullText.includes('baby') || fullText.includes('toy')) return 'kid-toys';
  if (fullText.includes('perfume') || fullText.includes('cosmetic')) return 'hb-cosmetics';

  return 'oth-misc';
}

export function getSubcategoryListingCount(
  subId: string,
  properties: any[],
  categoryMajorOrId?: string
): number {
  if (!properties || !Array.isArray(properties)) return 0;

  return properties.filter(p => {
    if (!isListingActiveAndPublished(p)) return false;

    const matchedSubId = getMatchingSubcategoryId(p);
    if (matchedSubId !== subId) return false;

    if (categoryMajorOrId) {
      const effMajor = getEffectiveMajorCategory(p);
      const target = categoryMajorOrId.toLowerCase();

      if (target === 'properties' && effMajor !== 'Properties') return false;
      if (target === 'vehicles' && effMajor !== 'Vehicles') return false;
      if (target === 'jobs' && effMajor !== 'Jobs') return false;
      if (target === 'services' && effMajor !== 'Services') return false;
      if (target === 'community' && effMajor !== 'Community') return false;
      if (
        (target === 'products' ||
          target === 'electronics' ||
          target === 'fashion' ||
          target === 'home-furniture-garden' ||
          target === 'babies-kids' ||
          target === 'health-beauty' ||
          target === 'agriculture-food' ||
          target === 'animals-pets' ||
          target === 'sports-outdoors' ||
          target === 'education' ||
          target === 'commercial-equipment') &&
        effMajor !== 'Products'
      ) {
        return false;
      }
    }

    return true;
  }).length;
}

export function getCategoryListingCount(
  category: CategoryRedesign,
  properties: any[]
): number {
  if (!properties || !Array.isArray(properties)) return 0;

  return properties.filter(p => {
    if (!isListingActiveAndPublished(p)) return false;

    const effMajor = getEffectiveMajorCategory(p);
    const catId = category.id.toLowerCase();
    const dbMajor = (category.dbMapping?.majorCategory || '').toLowerCase();

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
    if (catId === 'community' || dbMajor === 'community') {
      return effMajor === 'Community';
    }

    if (effMajor !== 'Products') return false;

    const matchedSubId = getMatchingSubcategoryId(p);
    if (!matchedSubId) return false;
    return category.subcategories.some(sub => sub.id === matchedSubId);
  }).length;
}

// ==========================================
// DYNAMIC MULTILINGUAL TRANSLATION HELPERS & ADMIN DICTIONARY CONNECTION
// ======================================================================
import { TranslationKey } from '../types';

let globalTranslationsStore: TranslationKey[] = [];

export function setGlobalTranslations(translations: TranslationKey[]) {
  if (Array.isArray(translations)) {
    globalTranslationsStore = translations;
  }
}

export function getGlobalTranslations(): TranslationKey[] {
  return globalTranslationsStore;
}

function checkDynamicDictionary(term: string, lang: string): string | null {
  if (!term) return null;
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const cleanTerm = term.replace(/\s*\*$/, '').trim();
  const lowerTerm = cleanTerm.toLowerCase();

  const dict = getGlobalTranslations();
  if (dict && dict.length > 0) {
    const match = dict.find(
      item => item.key === cleanTerm ||
              item.key.toLowerCase() === lowerTerm ||
              (item.en && item.en.toLowerCase() === lowerTerm)
    );

    if (match) {
      const val = match[langKey as keyof TranslationKey] as string;
      if (val && val.trim()) return val;
    }
  }
  return null;
}

export function getTranslatedCategoryName(catOrName: any, lang: string = 'en', dynamicDict?: TranslationKey[]): string {
  if (!catOrName) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';

  let strName = '';
  if (typeof catOrName === 'object') {
    if (catOrName.name) strName = extractString(catOrName.name, 'en');
    else if (catOrName.id) strName = String(catOrName.id);
  } else {
    strName = String(catOrName).trim();
  }

  // 1. Check Admin dynamic translation dictionary FIRST
  if (strName) {
    const dict = dynamicDict || getGlobalTranslations();
    if (dict && dict.length > 0) {
      const match = dict.find(
        t => t.key === strName ||
             t.key.toLowerCase() === strName.toLowerCase() ||
             (t.en && t.en.toLowerCase() === strName.toLowerCase())
      );
      if (match) {
        const val = match[langKey as keyof TranslationKey] as string;
        if (val && val.trim()) return val;
      }
    }
  }

  // 2. Direct object translation property check
  if (typeof catOrName === 'object') {
    if (catOrName.translations && catOrName.translations[langKey]) {
      return catOrName.translations[langKey];
    }
    if (langKey === 'om' && catOrName.nameOm) return catOrName.nameOm;
    if (langKey === 'am' && catOrName.nameAm) return catOrName.nameAm;
    if (catOrName.name) return extractString(catOrName.name, langKey);
  }

  // 3. Match REDESIGNED_CATEGORIES strictly by ID, name, or translations.en (NO dbMapping matching)
  const matched = REDESIGNED_CATEGORIES.find(
    c => c.id.toLowerCase() === strName.toLowerCase() ||
         c.name.toLowerCase() === strName.toLowerCase() ||
         (c.translations?.en && c.translations.en.toLowerCase() === strName.toLowerCase())
  );
  if (matched && matched.translations && matched.translations[langKey]) {
    return matched.translations[langKey];
  }

  const catMap: Record<string, { en: string; om: string; am: string }> = {
    'properties': { en: 'Properties', om: 'Qabeenya', am: 'ንብረት' },
    'property': { en: 'Properties', om: 'Qabeenya', am: 'ንብረት' },
    'real estate': { en: 'Properties', om: 'Qabeenya', am: 'ንብረት' },
    'vehicles': { en: 'Vehicles', om: 'Konkolaattota', am: 'ተሽከርካሪዎች' },
    'vehicle': { en: 'Vehicles', om: 'Konkolaattota', am: 'ተሽከርካሪዎች' },
    'cars': { en: 'Vehicles', om: 'Konkolaattota', am: 'ተሽከርካሪዎች' },
    'jobs': { en: 'Jobs', om: 'Carraa Hojii', am: 'ስራዎች' },
    'job': { en: 'Jobs', om: 'Carraa Hojii', am: 'ስራዎች' },
    'employment': { en: 'Jobs', om: 'Carraa Hojii', am: 'ስራዎች' },
    'services': { en: 'Services', om: 'Tajaajila', am: 'አገልግሎቶች' },
    'service': { en: 'Services', om: 'Tajaajila', am: 'አገልግሎቶች' },
    'products': { en: 'Products', om: 'Oomishaalee', am: 'ምርቶች' },
    'product': { en: 'Products', om: 'Oomishaalee', am: 'ምርቶች' },
    'electronics': { en: 'Electronics', om: 'Ilektirooniksii', am: 'ኤሌክትሮኒክስ' },
    'fashion': { en: 'Fashion & Clothing', om: 'Uffata fi Faaya', am: 'ፋሽን እና አልባሳት' },
    'home-furniture-garden': { en: 'Home & Furniture', om: 'Mi\'a Manaa', am: 'ፈርኒቸር እና የቤት እቃዎች' },
    'babies-kids': { en: 'Babies & Kids', om: 'Daa\'imman', am: 'የህጻናት እና የልጆች' },
    'health-beauty': { en: 'Health & Beauty', om: 'Fayyaa fi Miidhagina', am: 'ጤና እና ውበት' },
    'agriculture-food': { en: 'Agriculture & Food', om: 'Qonnaa fi Nyaata', am: 'እርሻ እና ምግብ' },
    'animals-pets': { en: 'Animals & Pets', om: 'Beeyladaa fi Bineensota', am: 'እንስሳት እና የቤት እንስሳት' },
    'sports-outdoors': { en: 'Sports & Outdoors', om: 'Ispoortii', am: 'ስፖርት እና ውጪ' },
    'education': { en: 'Education & Books', om: 'Barumsa fi Kitaaba', am: 'ትምህርት እና መጻሕፍት' },
    'commercial-equipment': { en: 'Commercial Equipment', om: 'Meeshaalee Daldalaa', am: 'የንግድ እቃዎች' },
    'community': { en: 'Community', om: 'Hawaasa', am: 'ማህበረሰብ' },
    'local businesses': { en: 'Local Businesses', om: 'Daldala Naannoo', am: 'የአካባቢ ንግዶች' },
    'local-businesses': { en: 'Local Businesses', om: 'Daldala Naannoo', am: 'የአካባቢ ንግዶች' }
  };

  const key = strName.toLowerCase();
  if (catMap[key]) {
    return catMap[key][langKey];
  }

  return strName;
}

export function getTranslatedSubcategoryName(subOrName: any, lang: string = 'en', dynamicDict?: TranslationKey[]): string {
  if (!subOrName) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';

  let strName = '';
  if (typeof subOrName === 'object') {
    if (subOrName.name) strName = extractString(subOrName.name, 'en');
    else if (subOrName.id) strName = String(subOrName.id);
  } else {
    strName = String(subOrName).trim();
  }

  // 1. Check Admin dynamic dictionary FIRST
  if (strName) {
    const dict = dynamicDict || getGlobalTranslations();
    if (dict && dict.length > 0) {
      const match = dict.find(
        t => t.key === strName ||
             t.key.toLowerCase() === strName.toLowerCase() ||
             (t.en && t.en.toLowerCase() === strName.toLowerCase())
      );
      if (match) {
        const val = match[langKey as keyof TranslationKey] as string;
        if (val && val.trim()) return val;
      }
    }
  }

  if (typeof subOrName === 'object') {
    if (subOrName.translations && subOrName.translations[langKey]) {
      return subOrName.translations[langKey];
    }
    if (langKey === 'om' && subOrName.nameOm) return subOrName.nameOm;
    if (langKey === 'am' && subOrName.nameAm) return subOrName.nameAm;
    if (subOrName.name) return extractString(subOrName.name, langKey);
  }

  for (const cat of REDESIGNED_CATEGORIES) {
    const sub = cat.subcategories.find(
      s => s.id.toLowerCase() === strName.toLowerCase() ||
           s.name.toLowerCase() === strName.toLowerCase() ||
           (s.translations?.en && s.translations.en.toLowerCase() === strName.toLowerCase())
    );
    if (sub && sub.translations && sub.translations[langKey]) {
      return sub.translations[langKey];
    }
  }

  return strName;
}

export function getTranslatedPropertyType(type: string, lang: string = 'en'): string {
  if (!type) return '';
  const dyn = checkDynamicDictionary(type, lang);
  if (dyn) return dyn;

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = type.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'house': { en: 'House', om: 'Mana', am: 'ቤት' },
    'houses': { en: 'Houses', om: 'Manneen', am: 'ቤቶች' },
    'apartment': { en: 'Apartment', om: 'Aparotamaa', am: 'አፓርትመንት' },
    'apartments': { en: 'Apartments', om: 'Aparotamoota', am: 'አፓርትመንቶች' },
    'villa': { en: 'Villa', om: 'Viillaa', am: 'ቪላ' },
    'villas': { en: 'Villas', om: 'Viillaawwan', am: 'ቪላዎች' },
    'modern villa': { en: 'Modern Villa', om: 'Viillaa Ammayyaa', am: 'ዘመናዊ ቪላ' },
    'modern_villa': { en: 'Modern Villa', om: 'Viillaa Ammayyaa', am: 'ዘመናዊ ቪላ' },
    'land': { en: 'Land & Plot', om: 'Lafa', am: 'መሬት' },
    'land & plot': { en: 'Land & Plot', om: 'Lafa', am: 'መሬት' },
    'plot': { en: 'Plot', om: 'Lafa Ijaarsaa', am: 'የቦታ መሬት' },
    'office': { en: 'Office', om: 'Biiroo', am: 'ቢሮ' },
    'offices': { en: 'Offices', om: 'Biiroowwan', am: 'ቢሮዎች' },
    'shop': { en: 'Shop', om: 'Suuqii', am: 'ሱቅ' },
    'shops': { en: 'Shops', om: 'Suuqota', am: 'ሱቆች' },
    'warehouse': { en: 'Warehouse', om: 'Goofta', am: 'መጋዘን' },
    'hotel': { en: 'Hotel / Resort', om: 'Hoteela', am: 'ሆቴል' },
    'farm': { en: 'Farm / Land', om: 'Farmaa', am: 'እርሻ' },
    'commercial': { en: 'Commercial Building', om: 'Gamoo Daldalaa', am: 'የንግድ ህንፃ' },
    'commercial building': { en: 'Commercial Building', om: 'Gamoo Daldalaa', am: 'የንግድ ህንፃ' },
    'residential': { en: 'Residential', om: 'Jireenyaa', am: 'መኖሪያ' }
  };

  if (map[key]) return map[key][langKey];
  return type;
}

export function getTranslatedDealType(dealType: string, lang: string = 'en'): string {
  if (!dealType) return '';
  const dyn = checkDynamicDictionary(dealType, lang);
  if (dyn) return dyn;

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = dealType.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'sale': { en: 'For Sale', om: 'Gurgurtaaf', am: 'ለሽያጭ' },
    'for sale': { en: 'For Sale', om: 'Gurgurtaaf', am: 'ለሽያጭ' },
    'rent': { en: 'For Rent', om: 'Kiraaf', am: 'ለኪራይ' },
    'for rent': { en: 'For Rent', om: 'Kiraaf', am: 'ለኪራይ' },
    'lease': { en: 'Lease', om: 'Kiraa Yeroo Dheeraa', am: 'የረጅም ጊዜ ኪራይ' },
    'buy': { en: 'Buy', om: 'Biti', am: 'ግዛ' }
  };

  if (map[key]) return map[key][langKey];
  return dealType;
}

export function getTranslatedCondition(cond: string, lang: string = 'en'): string {
  if (!cond) return '';
  const dyn = checkDynamicDictionary(cond, lang);
  if (dyn) return dyn;

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = cond.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'new': { en: 'New', om: 'Haaraa', am: 'አዲስ' },
    'brand new': { en: 'Brand New', om: 'Haaraa Guutuu', am: 'አዲስ' },
    'used - good': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used - good condition': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used(good)': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used (good)': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used-good': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used good': { en: 'Used - Good', om: 'Kan Fayyadame - Gaarii', am: 'ጥቅም ላይ የዋለ - ጥሩ' },
    'used - like new': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used - like new condition': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used(like new)': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used (like new)': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used-like new': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used like new': { en: 'Used - Like New', om: 'Kan Fayyadame - Akka Haaraa', am: 'ጥቅም ላይ የዋለ - እንደ አዲስ' },
    'used - fair': { en: 'Used - Fair', om: 'Kan Fayyadame - Gahaa', am: 'ጥቅም ላይ የዋለ - መካከለኛ' },
    'used - poor': { en: 'Used - Poor', om: 'Kan Fayyadame - Gad-aanaa', am: 'ጥቅም ላይ የዋለ - ዝቅተኛ' },
    'used - excellent': { en: 'Used - Excellent', om: 'Kan Fayyadame - Baay\'ee Gaarii', am: 'ጥቅም ላይ የዋለ - በጣም ጥሩ' },
    'used - foreign': { en: 'Used - Foreign', om: 'Kan Fayyadame - Biyya Alaa', am: 'ጥቅም ላይ የዋለ - የውጭ' },
    'used - local': { en: 'Used - Local', om: 'Kan Fayyadame - Biyya Keessaa', am: 'ጥቅም ላይ የዋለ - የሀገር ውስጥ' },
    'used - refurbished': { en: 'Used - Refurbished', om: 'Kan Fayyadame - Haaromfame', am: 'ጥቅም ላይ የዋለ - የታደሰ' },
    'like new': { en: 'Like New', om: 'Akka Haaraa', am: 'እንደ አዲስ' },
    'refurbished': { en: 'Refurbished', om: 'Haaromfame', am: 'የታደሰ' },
    'fair': { en: 'Fair Condition', om: 'Gahaa', am: 'መካከለኛ' },
    'fair condition': { en: 'Fair Condition', om: 'Gahaa', am: 'መካከለኛ' },
    'used': { en: 'Used', om: 'Kan Fayyadame', am: 'ጥቅም ላይ የዋለ' },
    'used / secondhand': { en: 'Used / Secondhand', om: 'Kan Fayyadame / Lammaffaa', am: 'ጥቅም ላይ የዋለ' },
    'new / unopened': { en: 'New / Unopened', om: 'Haaraa / Hin Banamne', am: 'አዲስ / ያልተከፈተ' },
    'used / refurbished': { en: 'Used / Refurbished', om: 'Kan Fayyadame / Haaromfame', am: 'ጥቅም ላይ የዋለ / የታደሰ' },
    'good': { en: 'Good Condition', om: 'Gaarii', am: 'ጥሩ' },
    'good condition': { en: 'Good Condition', om: 'Gaarii', am: 'ጥሩ' },
    'excellent': { en: 'Excellent', om: 'Baay\'ee Gaarii', am: 'በጣም ጥሩ' },
    'excellent condition': { en: 'Excellent', om: 'Baay\'ee Gaarii', am: 'በጣም ጥሩ' },
    'for parts': { en: 'For Parts / Not Working', om: 'Qo\'iyyaaf / Hin Hojjetu', am: 'ለመለዋወጫ / የማይሰራ' },
    'for parts or not working': { en: 'For Parts / Not Working', om: 'Qo\'iyyaaf / Hin Hojjetu', am: 'ለመለዋወጫ / የማይሰራ' },
    'any condition': { en: 'Any Condition', om: 'Haala Kamiinuu', am: 'ማንኛውም ሁኔታ' }
  };

  if (map[key]) return map[key][langKey];

  // Composite separator handling (e.g. "Used - Good", "Used / Local")
  if (key.includes('-') || key.includes('/')) {
    const isDash = key.includes('-');
    const delimiter = isDash ? ' - ' : ' / ';
    const parts = key.split(isDash ? '-' : '/').map(p => p.trim());
    const translatedParts = parts.map(part => {
      if (map[part]) return map[part][langKey];
      return part;
    });
    return translatedParts.join(delimiter);
  }

  return cond;
}

export function getTranslatedFuelType(fuel: string, lang: string = 'en'): string {
  if (!fuel) return '';
  const dyn = checkDynamicDictionary(fuel, lang);
  if (dyn) return dyn;

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = fuel.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'petrol': { en: 'Benzine / Petrol', om: 'Beenzinii', am: 'ቤንዚን' },
    'benzine': { en: 'Benzine / Petrol', om: 'Beenzinii', am: 'ቤንዚን' },
    'diesel': { en: 'Diesel', om: 'Diizela', am: 'ዲዚል' },
    'electric': { en: 'Electric', om: 'Elektiriikii', am: 'ኤሌክትሪክ' },
    'hybrid': { en: 'Hybrid', om: 'Haayibriidii', am: 'ሀይብሪድ' }
  };

  if (map[key]) return map[key][langKey];
  return fuel;
}

export function getTranslatedTransmission(trans: string, lang: string = 'en'): string {
  if (!trans) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = trans.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'automatic': { en: 'Automatic', om: 'Ootomaatiikii', am: 'አውቶማቲክ' },
    'manual': { en: 'Manual', om: 'Manuwaalii', am: 'ማኑዋል' }
  };

  if (map[key]) return map[key][langKey];
  return trans;
}

export function getTranslatedJobType(jobType: string, lang: string = 'en'): string {
  if (!jobType) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = jobType.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'full time': { en: 'Full Time', om: 'Guutuu Yeroo', am: 'ሙሉ ጊዜ' },
    'full-time': { en: 'Full Time', om: 'Guutuu Yeroo', am: 'ሙሉ ጊዜ' },
    'part time': { en: 'Part Time', om: 'Hir\'uu Yeroo', am: 'ትርፍ ጊዜ' },
    'part-time': { en: 'Part Time', om: 'Hir\'uu Yeroo', am: 'ትርፍ ጊዜ' },
    'freelance': { en: 'Freelance / Contract', om: 'Hojii Dhuunfaa', am: 'ፍሪላንስ' },
    'remote': { en: 'Remote Work', om: 'Fagoo Irraa', am: 'የሩቅ ስራ' },
    'internship': { en: 'Internship', om: 'Shaakala Hojii', am: 'ልምምድ' },
    'contract': { en: 'Contract', om: 'Waliigaltee', am: 'ኮንትራት' }
  };

  if (map[key]) return map[key][langKey];
  return jobType;
}

export function getTranslatedFurnished(fur: string, lang: string = 'en'): string {
  if (!fur) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = fur.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'furnished': { en: 'Fully Furnished', om: 'Mi\'aa Guutuu', am: 'ሙሉ የቤት እቃ ያለው' },
    'fully furnished': { en: 'Fully Furnished', om: 'Mi\'aa Guutuu', am: 'ሙሉ የቤት እቃ ያለው' },
    'unfurnished': { en: 'Unfurnished', om: 'Mi\'aa Malee', am: 'የቤት እቃ የሌለው' },
    'semi-furnished': { en: 'Semi-Furnished', om: 'Gartokkee Mi\'aa', am: 'በከፊል የተሟላ' }
  };

  if (map[key]) return map[key][langKey];
  return fur;
}

export function getTranslatedLocation(loc: string, lang: string = 'en'): string {
  if (!loc) return '';
  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';

  const locMap: Record<string, { en: string; om: string; am: string }> = {
    'addis ababa': { en: 'Addis Ababa', om: 'Finfinnee', am: 'አዲስ አበባ' },
    'finfinnee': { en: 'Addis Ababa', om: 'Finfinnee', am: 'አዲስ አበባ' },
    'oromia': { en: 'Oromia', om: 'Oromiyaa', am: 'ኦሮሚያ' },
    'amhara': { en: 'Amhara', om: 'Amaaraa', am: 'አማራ' },
    'sidama': { en: 'Sidama', om: 'Sidaamaa', am: 'ሲዳማ' },
    'somali': { en: 'Somali', om: 'Sumaalee', am: 'ሱማሌ' },
    'tigray': { en: 'Tigray', om: 'Tigraay', am: 'ትግራይ' },
    'bole': { en: 'Bole, Addis Ababa', om: 'Bolee, Finfinnee', am: 'ቦሌ፣ አዲስ አበባ' },
    'adama': { en: 'Adama', om: 'Adaamaa', am: 'አዳማ' },
    'jimma': { en: 'Jimma', om: 'Jimmaa', am: 'ጅማ' },
    'bishoftu': { en: 'Bishoftu', om: 'Bishooftuu', am: 'ቢሾፍቱ' },
    'hawassa': { en: 'Hawassa', om: 'Hawaasaa', am: 'ሀዋሳ' },
    'bahir dar': { en: 'Bahir Dar', om: 'Baahir Daar', am: 'ባሕር ዳር' },
    'gonder': { en: 'Gonder', om: 'Gondar', am: 'ጎንደር' },
    'mekelle': { en: 'Mekelle', om: 'Maqalee', am: 'መቐለ' },
    'dire dawa': { en: 'Dire Dawa', om: 'Diri Dhabaa', am: 'ድሬዳዋ' },
    'harar': { en: 'Harar', om: 'Harar', am: 'ሐረር' },
    'shashamane': { en: 'Shashamane', om: 'Shaashamannee', am: 'ሻሸመኔ' },
    'bale robe': { en: 'Bale Robe', om: 'Roobee Balee', am: 'ባሌ ሮቤ' },
    'robe': { en: 'Bale Robe', om: 'Roobee', am: 'ሮቤ' },
    'nekemte': { en: 'Nekemte', om: 'Naqamte', am: 'ነቀምቴ' },
    'asella': { en: 'Asella', om: 'Asallaa', am: 'አሰላ' },
    'ambo': { en: 'Ambo', om: 'Ambo', am: 'አምቦ' }
  };

  const key = loc.toLowerCase().trim();
  if (locMap[key]) return locMap[key][langKey];

  // Partial matches
  for (const [k, v] of Object.entries(locMap)) {
    if (key.includes(k)) {
      return loc.replace(new RegExp(k, 'gi'), v[langKey]);
    }
  }

  return loc;
}

export function getTranslatedOption(opt: string, lang: string = 'en'): string {
  if (!opt) return '';
  const dyn = checkDynamicDictionary(opt, lang);
  if (dyn) return dyn;

  // Check if it is a condition string
  const condTrans = getTranslatedCondition(opt, lang);
  if (condTrans && condTrans !== opt) {
    return condTrans;
  }

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = opt.toLowerCase().trim();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'yes': { en: 'Yes', om: 'Eeyyee', am: 'አዎ' },
    'no': { en: 'No', om: 'Lakkii', am: 'አይደለም' },
    'new': { en: 'New', om: 'Haaraa', am: 'አዲስ' },
    'used': { en: 'Used', om: 'Kan Tajaajile', am: 'ያገለገለ' },
    'used - like new': { en: 'Used - Like New', om: 'Kan Tajaajile - Akkuma Haaraa', am: 'ያገለገለ - እንደ አዲስ' },
    'used - good': { en: 'Used - Good', om: 'Kan Tajaajile - Gaarii', am: 'ያገለገለ - በጥሩ ሁኔታ ላይ' },
    'used - foreign': { en: 'Used - Foreign', om: 'Bara Biyya Alaa', am: 'ከባህር ማዶ የመጣ' },
    'used - local': { en: 'Used - Local', om: 'Bara Biyya Keessaa', am: 'የአገር ውስጥ ያገለገለ' },
    'refurbished': { en: 'Refurbished', om: 'Haareffame', am: 'የታደሰ / ሪፈርቢሽድ' },
    'rent': { en: 'For Rent', om: 'Kiraaf', am: 'ለኪራይ' },
    'sale': { en: 'For Sale', om: 'Gurgurtaaf', am: 'ለሽያጭ' },
    'buy': { en: 'Want to Buy', om: 'Bitachuuf', am: 'ለመግዛት' },
    'automatic': { en: 'Automatic', om: 'Ootomaatiikii', am: 'አውቶማቲክ' },
    'manual': { en: 'Manual', om: 'Manuwaalii', am: 'ማኑዋል' },
    'gasoline': { en: 'Gasoline / Benzine', om: 'Beenzinii', am: 'ቤንዚን' },
    'diesel': { en: 'Diesel', om: 'Diizela', am: 'ዲዚል' },
    'electric': { en: 'Electric', om: 'Elektiriikii', am: 'ኤሌክትሪክ' },
    'hybrid': { en: 'Hybrid', om: 'Haayibriidii', am: 'ሀይብሪድ' },
    'unfurnished': { en: 'Unfurnished', om: 'Mi\'aa Malee', am: 'የቤት እቃ የሌለው' },
    'furnished': { en: 'Furnished', om: 'Mi\'aa Guutuu', am: 'ሙሉ የቤት እቃ ያለው' },
    'semi-furnished': { en: 'Semi-Furnished', om: 'Gartokkee Mi\'aa', am: 'በከፊል የተሟላ' },
    'full-time': { en: 'Full-time', om: 'Yeroo Guutuu', am: 'ሙሉ ጊዜ' },
    'part-time': { en: 'Part-time', om: 'Yeroo Gabaabaa', am: 'ትርፍ ጊዜ' },
    'freelance': { en: 'Freelance / Contract', om: 'Hojii Dhuunfaa', am: 'ፍሪላንስ' },
    'remote': { en: 'Remote', om: 'Fagoo Irraa', am: 'የሩቅ ስራ' },
    'internship': { en: 'Internship', om: 'Shaakala Hojii', am: 'ልምምድ' },
    'unisex': { en: 'Unisex', om: 'Waligalaa', am: 'ለሁሉም' },
    'men': { en: 'Men', om: 'Dhiira', am: 'ወንድ' },
    'women': { en: 'Women', om: 'Dubartii', am: 'ሴት' },
    'kids': { en: 'Kids', om: 'Daa\'imman', am: 'ልጆች' },
    'title deed (carta)': { en: 'Title Deed (Carta)', om: 'Waraqaa Abbummaa (Karta)', am: 'ካርታ ያለው' },
    'map (karta)': { en: 'Map (Karta)', om: 'Kaartaa Lafa', am: 'ፕላን/ካርታ' },
    'leasehold': { en: 'Leasehold', om: 'Liizii', am: 'ሊዝ' },
    'fixed rate': { en: 'Fixed Rate', om: 'Gatii Murtaa\'aa', am: 'መደበኛ ዋጋ' },
    'hourly rate': { en: 'Hourly Rate', om: 'Kaffaltii Sa\'aatii', am: 'የሰዓት ክፍያ' },
    'daily rate': { en: 'Daily Rate', om: 'Kaffaltii Guyyaa', am: 'የቀን ክፍያ' },
    'per job / negotiable': { en: 'Per Job / Negotiable', om: 'Kaffaltii Hojiin / Waliigalteen', am: 'በስራው ብዛት / በስምምነት' }
  };

  if (map[key]) return map[key][langKey];
  return opt;
}

export function getTranslatedFieldLabel(label: string, lang: string = 'en'): string {
  if (!label) return '';
  const cleanLabel = label.replace(/\s*\*$/, '').trim();
  const hasAsterisk = label.includes('*');

  const dyn = checkDynamicDictionary(cleanLabel, lang);
  if (dyn) return hasAsterisk ? `${dyn} *` : dyn;

  const langKey = (lang === 'om' || lang === 'am') ? lang : 'en';
  const key = cleanLabel.toLowerCase();

  const map: Record<string, { en: string; om: string; am: string }> = {
    'item title': { en: 'Item Title', om: 'Mata Duree Meeshichaa', am: 'የእቃው ርዕስ' },
    'brand': { en: 'Brand', om: 'Gosa Oomishaa (Brand)', am: 'ብራንድ' },
    'brand / manufacturer': { en: 'Brand / Manufacturer', om: 'Gosa / Oomisahaa', am: 'አምራች/ብራንድ' },
    'make / brand': { en: 'Make / Brand', om: 'Gosa / Oomisahaa', am: 'አምራች/ብራንድ' },
    'model': { en: 'Model', om: 'Moodela', am: 'ሞዴል' },
    'size': { en: 'Size', om: 'Hanga / Hammangaa', am: 'መጠን' },
    'storage / spec': { en: 'Storage / Spec', om: 'Hanga Kuusaa / Akkaata', am: 'የማከማቻ መጠን/ስፔስ' },
    'color': { en: 'Color', om: 'Bifa', am: 'ቀለም' },
    'material': { en: 'Material', om: 'Gosa Meeshaa Ijaarsaa', am: 'ማቴሪያል' },
    'gender': { en: 'Gender', om: 'Saala', am: 'ፆታ' },
    'condition': { en: 'Condition', om: 'Haala Meeshichaa', am: 'ሁኔታ (ኮንዲሽን)' },
    'quantity': { en: 'Quantity', om: 'Baay\'ina', am: 'ብዛት' },
    'price (etb)': { en: 'Price (ETB)', om: 'Gatii (ETB)', am: 'ዋጋ (ብር)' },
    'price / rate (etb)': { en: 'Price / Rate (ETB)', om: 'Gatii / Kaffaltii (ETB)', am: 'ዋጋ / ክፍያ (ብር)' },
    'negotiable': { en: 'Negotiable', om: 'Waliigalteen', am: 'በስምምነት' },
    'location': { en: 'Location', om: 'Bakka / Iddoo', am: 'አድራሻ/ቦታ' },
    'description': { en: 'Description', om: 'Ibsa Guutuu', am: 'ማብራሪያ' },
    'photos': { en: 'Photos', om: 'Fakkoota', am: 'ፎቶዎች' },
    'video url': { en: 'Video URL', om: 'Linkii Viidiyoo', am: 'የቪዲዮ ሊንክ' },
    'furniture title': { en: 'Furniture Title', om: 'Mata Duree Meeshaa Manaa', am: 'የቤት እቃው ርዕስ' },
    'product title': { en: 'Product Title', om: 'Mata Duree Oomishaa', am: 'የምርቱ ርዕስ' },
    'property title': { en: 'Property Title', om: 'Mata Duree Qabeenyaa', am: 'የንብረቱ ርዕስ' },
    'purpose': { en: 'Purpose', om: 'Kaayyoo Daldalaa', am: 'ዓላማ' },
    'area (m²)': { en: 'Area (m²)', om: 'Bal\'ina (m²)', am: 'ስፋት (በካሬ ሜትር)' },
    'ownership / title deed': { en: 'Ownership / Title Deed', om: 'Waraqaa Abbummaa', am: 'የባለቤትነት ማረጋገጫ' },
    'phone number': { en: 'Phone Number', om: 'Lakk. Bilbilaa', am: 'ስልክ ቁጥር' },
    'contact phone': { en: 'Contact Phone', om: 'Bilbila Quunnamtii', am: 'የመገናኛ ስልክ' },
    'email': { en: 'Email', om: 'Teessoo Imeelii', am: 'ኢሜል' },
    'contact email': { en: 'Contact Email', om: 'Imeelii Quunnamtii', am: 'የመገናኛ ኢሜል' },
    'property type': { en: 'Property Type', om: 'Gosa Qabeenyaa', am: 'የንብረት አይነት' },
    'toilets': { en: 'Toilets', om: 'Baay\'ina Fincaanii', am: 'የመታጠቢያ ክፍሎች' },
    'parking available': { en: 'Parking Available', om: 'Iddoo Konkolaataa', am: 'የመኪና ማቆሚያ' },
    'floor Level': { en: 'Floor Level', om: 'Sadarkaa Abbaa Gamoo', am: 'ፎቅ' },
    'bedrooms': { en: 'Bedrooms', om: 'Kutaa Ciisichaa', am: 'የመኝታ ክፍሎች' },
    'beds': { en: 'Beds', om: 'Kutaalee', am: 'ክፍሎች' },
    'bathrooms': { en: 'Bathrooms', om: 'Kutaa Fincaanii', am: 'የመታጠቢያ ክፍሎች' },
    'baths': { en: 'Baths', om: 'Dhiqannaa', am: 'መታጠቢያ' },
    'area': { en: 'Area', om: 'Bal\'ina', am: 'ስፋት' },
    'furnished status': { en: 'Furnished Status', om: 'Mi\'aan Guutamuu', am: 'የቤት እቃ ያለው' },
    'part / accessory title': { en: 'Part / Accessory Title', om: 'Mata Duree Meeshaa Dabalataa', am: 'የመጋቢ እቃው ርዕስ' },
    'vehicle title': { en: 'Vehicle Title', om: 'Mata Duree Konkolaataa', am: 'የተሽከርካሪው ርዕስ' },
    'vehicle type': { en: 'Vehicle Type', om: 'Gosa Konkolaataa', am: 'የተሽከርካሪ አይነት' },
    'transmission': { en: 'Transmission', om: 'Giraasii (Transmission)', am: 'ትራንስሚሽን' },
    'fuel type': { en: 'Fuel Type', om: 'Gosa Boba\'aa', am: 'የነዳጅ አይነት' },
    'engine capacity': { en: 'Engine Capacity', om: 'Hafata Mootoraa', am: 'የሞተር መጠን' },
    'year': { en: 'Year', om: 'Bara Oomishame', am: 'የተመረተበት አመት' },
    'mileage (km)': { en: 'Mileage (km)', om: 'Kilomeetira Deeme', am: 'የተጓዘው ርቀት (ኪ.ሜ)' },
    'job title': { en: 'Job Title', om: 'Mata Duree Hojii', am: 'የስራው ርዕስ' },
    'employment type': { en: 'Employment Type', om: 'Haala Hojii', am: 'የቀጥር ሁኔታ' },
    'sector / industry': { en: 'Sector / Industry', om: 'Kutaawwan Hojii', am: 'የስራው ዘርፍ' },
    'salary range': { en: 'Salary Range', om: 'Hanga Mindaadha', am: 'የደሞዝ መጠን' },
    'education required': { en: 'Education Required', om: 'Barnoota Barbaadamu', am: 'የትምህርት ደረጃ' },
    'experience required': { en: 'Experience Required', om: 'Muuxannoo Barbaadamu', am: 'የስራ ልምድ' },
    'application deadline': { en: 'Application Deadline', om: 'Guyyaa Xumura Iyyannoo', am: 'የማመልከቻ ማብቂያ ቀን' },
    'description & requirements': { en: 'Description & Requirements', om: 'Ibsa & Ulaagaa Hojii', am: 'መግለጫ እና መስፈርቶች' },
    'company logo url': { en: 'Company Logo URL', om: 'URL Mallattoo Dhaabbataa', am: 'የድርጅቱ ሎጎ ሊንክ' },
    'service title': { en: 'Service Title', om: 'Mata Duree Tajaajilaa', am: 'የአገልግሎቱ ርዕስ' },
    'service category': { en: 'Service Category', om: 'Garee Tajaajilaa', am: 'የአገልግሎት ምድብ' },
    'pricing unit': { en: 'Pricing Unit', om: 'Safartuu Gatii', am: 'የክፍያ መስፈርት' },
    'years of experience': { en: 'Years of Experience', om: 'Waggaa Muuxannoo', am: 'የልምድ አመታት' },
    'coverage area': { en: 'Coverage Area', om: 'Iddoo Tajaajilaa', am: 'አገልግሎት የሚሸፍነው ቦታ' },
    'base location': { en: 'Base Location', om: 'Teessoo Guddaa', am: 'ዋና ቦታ' },
    'business name': { en: 'Business Name', om: 'Maqaa Daldalaa', am: 'የድርጅቱ ስም' },
    'business type': { en: 'Business Type', om: 'Gosa Daldalaa', am: 'የንግድ አይነት' },
    'opening hours': { en: 'Opening Hours', om: 'Sa\'aatii Hojii', am: 'የስራ ሰዓት' },
    'website / social link': { en: 'Website / Social Link', om: 'Website / Toora Hawaasaa', am: 'ድረ-ገጽ / ሶሻል ሚዲያ' },
    'business address / area': { en: 'Business Address / Area', om: 'Teessoo Daldalaa', am: 'የድርጅቱ አድራሻ' },
    'business email': { en: 'Business Email', om: 'Imeelii Daldalaa', am: 'የድርጅቱ ኢሜል' },
    'business description': { en: 'Business Description', om: 'Ibsa Daldalaa', am: 'የድርጅቱ መግለጫ' },
    'store & product photos': { en: 'Store & Product Photos', om: 'Fakkii Suuqii & Meeshaa', am: 'የሱቅ እና የምርት ፎቶዎች' },
    'video tour url': { en: 'Video Tour URL', om: 'URL Viidiyoo Daawwanna', am: 'የቪዲዮ ዳሰሳ ሊንክ' },
    'post / announcement title': { en: 'Post / Announcement Title', om: 'Mata Duree Beeksisaa', am: 'የማስታወቂያው ርዕስ' },
    'organizer name / group': { en: 'Organizer Name / Group', om: 'Maqaa Qopheessaa', am: 'የአዘጋጁ ስም' },
    'venue / address': { en: 'Venue / Address', om: 'Iddoo Qophii / Teessoo', am: 'የዝግጅቱ ቦታ/አድራሻ' },
    'event date & time': { en: 'Event Date & Time', om: 'Guyyaa & Sa\'aatii Qophii', am: 'የዝግጅቱ ቀን እና ሰዓት' },
    'city / region': { en: 'City / Region', om: 'Magaalaa / Naannoo', am: 'ከተማ / ክልል' },
    'full description': { en: 'Full Description', om: 'Ibsa Guutuu', am: 'ሙሉ መግለጫ' },
    'photos / banner': { en: 'Photos / Banner', om: 'Fakkoota / Baanara', am: 'ፎቶዎች / ባነር' }
  };

  const translated = map[key] ? map[key][langKey] : cleanLabel;
  return hasAsterisk ? `${translated} *` : translated;
}

// Visual icons for subcategories to match SOF-UMER design system
export function getSubcategoryVisual(subId: string, fallbackEmoji: string = '📦'): string {
  const map: Record<string, string> = {
    // Properties
    'prop-houses': '🏠',
    'prop-apartments': '🏢',
    'prop-villas': '🏡',
    'prop-land': '🌍',
    'prop-offices': '🏢',
    'prop-shops': '🛍️',
    'prop-warehouse': '📦',
    'prop-hotels': '🏨',
    'prop-farms': '🌾',
    'prop-commercial': '🏬',
    'prop-services': '🛠️',
    // Vehicles
    'veh-cars': '🚗',
    'veh-motorcycles': '🏍️',
    'veh-trucks': '🚛',
    'veh-buses': '🚌',
    'veh-heavy': '🚜',
    'veh-parts': '⚙️',
    'veh-accessories': '🪞',
    'veh-services': '🔧',
    // Electronics
    'el-smartphones': '📱',
    'el-tablets': '📟',
    'el-laptops': '💻',
    'el-desktops': '🖥️',
    'el-tvs': '📺',
    'el-cameras': '📷',
    'el-audio': '🎧',
    'el-gaming': '🎮',
    'el-comp-acc': '⌨️',
    'el-phone-acc': '🔌',
    'el-watches': '⌚',
    'el-appliances': '🧊',
    // Fashion
    'fas-men': '👔',
    'fas-women': '👗',
    'fas-kids': '🧸',
    'fas-shoes': '👟',
    'fas-bags': '👜',
    'fas-watches': '⌚',
    'fas-jewelry': '💍',
    'fas-accessories': '🕶️',
    // Jobs
    'job-accounting': '💼',
    'job-admin': '📋',
    'job-construction': '👷',
    'job-customer': '📞',
    'job-design': '🎨',
    'job-education': '📚',
    'job-engineering': '⚙️',
    'job-health': '🩺',
    'job-hotel': '🍽️',
    'job-it': '💻',
    'job-legal': '⚖️',
    'job-logistics': '🚚',
    'job-marketing': '📢',
    'job-sales': '🏷️',
    // Services
    'serv-automotive': '🔧',
    'serv-building': '🔨',
    'serv-cleaning': '🧹',
    'serv-computer': '💻',
    'serv-events': '🎉',
    'serv-health': '💆',
    'serv-legal': '⚖️',
    'serv-logistics': '📦',
    'serv-repair': '🛠️',
    // Home & Furniture
    'home-furniture': '🛋️',
    'home-appliances': '🧊',
    'home-decor': '🖼️',
    'home-garden': '🪴',
    'home-kitchen': '🍳',
    // Agriculture
    'agri-crops': '🌾',
    'agri-livestock': '🐄',
    'agri-feeds': '🌱',
    'agri-equipment': '🚜',
    // Babies & Kids
    'kid-clothing': '👶',
    'kid-toys': '🧸',
    'kid-gear': '🍼',
    // Health & Beauty
    'hb-skincare': '🧴',
    'hb-hair': '✂️',
    'hb-perfume': '✨',
    // Sports
    'sport-fitness': '🏋️',
    'sport-outdoor': '⛺',
    'sport-apparel': '👟',
  };
  return map[subId] || fallbackEmoji;
}
