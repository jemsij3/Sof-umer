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
  const isApproved = (p.verificationStatus === 'verified' || p.isVerifiedListing === true) &&
                     p.verificationStatus !== 'rejected' &&
                     p.approvalStatus !== 'rejected' &&
                     p.verificationStatus !== 'pending';
  if (!isApproved) return false;

  // 2. Status checks
  const status = (p.status || '').toLowerCase();
  if (['sold', 'rented', 'unavailable', 'expired', 'deleted', 'rejected', 'pending'].includes(status)) {
    return false;
  }
  if (p.isSold || p.isRented || p.isExpired || p.isDeleted) {
    return false;
  }

  // 3. Description tags check
  const desc = p.description || '';
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

  // 2. Check explicit majorCategory if valid
  const major = (p.majorCategory || '').trim();
  if (major === 'Properties' || major === 'Vehicles' || major === 'Jobs' || major === 'Services' || major === 'Products' || major === 'Local Businesses' || major === 'Community') {
    return major as any;
  }

  // Lowercase text fields for inspection
  const type = (p.propertyType || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const fullText = `${type} ${cat} ${title} ${desc}`;

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

  // Properties
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
    (p.bedrooms !== undefined && p.bedrooms > 0) ||
    (p.bathrooms !== undefined && p.bathrooms > 0) ||
    (p.area !== undefined && p.area > 0)
  ) {
    return 'Properties';
  }

  // Default to Products
  return 'Products';
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
  const type = (p.propertyType || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
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

