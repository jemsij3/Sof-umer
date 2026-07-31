export interface TranslationKey {
  key: string;
  en: string;
  om: string;
  am: string;
  category: string;
}

export const staticTranslations: TranslationKey[] = [
  // Wizard Namespace Keys
  { key: "wizard.step_category", en: "Category", om: "Garee", am: "ምድብ", category: "Wizard" },
  { key: "wizard.step_subcategory", en: "Subcategory", om: "Garee Xiqqaa", am: "ንኡስ ምድብ", category: "Wizard" },
  { key: "wizard.step_details_photos", en: "Details & Photos", om: "Odeeffannoo & Suuraa", am: "መረጃ እና ፎቶዎች", category: "Wizard" },
  { key: "wizard.step_preview_ad", en: "Preview Ad", om: "Beeksisa Dura Ilaali", am: "ማስታወቂያ ቅድመ-እይታ", category: "Wizard" },
  { key: "wizard.step_boost_pay", en: "Boost & Pay", om: "Guddisi & Kaffali", am: "አሳድግ እና ክፈል", category: "Wizard" },
  { key: "wizard.title_add_new", en: "ADD NEW PROPERTY", om: "QABEENYA HAARAA GALMEESSI", am: "አዲስ ንብረት መዝግብ", category: "Wizard" },
  { key: "wizard.currency_label", en: "CURRENCY", om: "MAALLAQA", am: "ገንዘብ", category: "Wizard" },
  { key: "wizard.currency_subtext", en: "Select payment currency type.", om: "Gosa maallaqaa kaffaltii filadhu.", am: "የክፍያ ገንዘብ አይነት ይምረጡ።", category: "Wizard" },
  { key: "wizard.btn_back", en: "Back", om: "Dee bi'i", am: "ተመለስ", category: "Wizard" },
  { key: "wizard.btn_clear", en: "Clear", om: "Ha qi", am: "አጽዳ", category: "Wizard" },
  { key: "wizard.btn_submit", en: "Submit Listing", om: "Tarreeffama Galchi", am: "ዝርዝር ያስገቡ", category: "Wizard" },

  // Catalog Namespace Keys
  { key: "catalog.all_categories", en: "ALL CATEGORIES", om: "GAREEWWAN HUNDA", am: "ሁሉንም ምድቦች", category: "Catalog" },
  { key: "catalog.home", en: "Home", om: "Fuula Duraa", am: "መነሻ", category: "Catalog" },
  { key: "catalog.explore_subcategories", en: "EXPLORE SUBCATEGORIES", om: "GAREEWWAN XIQQAA EXPLORE GODHI", am: "ንኡስ ምድቦችን ያስሱ", category: "Catalog" },
  { key: "catalog.active_listings_found", en: "active listings found", om: "beeksisa soscho'an argaman", am: "ንቁ ማስታወቂያዎች ተገኝተዋል", category: "Catalog" },
  { key: "catalog.save", en: "Save", om: "Olkaa'i", am: "አስቀምጥ", category: "Catalog" },
  { key: "catalog.favorite", en: "Favorite", om: "Jaallatamoo", am: "ወደዱት", category: "Catalog" },
  { key: "catalog.share", en: "Share", om: "Qoodi", am: "አጋራ", category: "Catalog" },
  { key: "catalog.exit", en: "Exit", om: "Ba'i", am: "ውጣ", category: "Catalog" },

  // Listing Namespace Keys
  { key: "listing.title", en: "Listing Details", om: "Tarreeffama Oomishaa", am: "የእቃ ዝርዝር", category: "Listing" },
  { key: "listing.products", en: "Products", om: "Oomishaalee", am: "ምርቶች", category: "Listing" },
  { key: "listing.price", en: "Price", om: "Gatii", am: "ዋጋ", category: "Listing" },
  { key: "listing.agreement", en: "Agreement", om: "Waliigalteen", am: "ስምምነት", category: "Listing" },
  { key: "listing.product_details", en: "Product Details", om: "Tarreeffama Oomishaa", am: "የምርት ዝርዝር", category: "Listing" },
  { key: "listing.brand", en: "Brand", om: "Gosa Oomishaa (Brand)", am: "የምርት ስም (ብራንድ)", category: "Listing" },
  { key: "listing.condition", en: "Condition", om: "Haala Meeshichaa", am: "የእቃው ሁኔታ", category: "Listing" },
  { key: "listing.subcategory", en: "Subcategory", om: "Garee Xiqqaa", am: "ንኡስ ምድብ", category: "Listing" },
  { key: "listing.size_quantity", en: "Size / Quantity", om: "Hanga / Hammangaa", am: "መጠን / ብዛት", category: "Listing" },
  { key: "listing.color", en: "Color", om: "Bifa / Halluu", am: "ቀለም", category: "Listing" },
  { key: "listing.material", en: "Material", om: "Gosa Meeshaa", am: "የዕቃው ዓይነት", category: "Listing" },
  { key: "listing.gender", en: "Gender", om: "Saala", am: "ፆታ", category: "Listing" },
  { key: "listing.about_product", en: "About This Product", om: "Waa'ee Oomisha Kanaa", am: "ስለዚህ ምርት", category: "Listing" },
  { key: "listing.map_location", en: "Map Location", om: "Bakka Kaartaa Irratti", am: "በካርታ ላይ ያለው ቦታ", category: "Listing" },
  { key: "listing.send_inquiry", en: "Send Inquiry", om: "Gaaffii Ergi", am: "ጥያቄ ላክ", category: "Listing" },
  { key: "listing.inquiry_prompt", en: "Contact the owner directly regarding this item.", om: "Abbaa qabeenyaatti dhimma kana irratti battalatti barreessi.", am: "ስለዚህ እቃ ለባለቤቱ በቀጥታ ይጻፉ።", category: "Listing" },
  { key: "listing.used_like_new", en: "Used - Like New", om: "Kan Fayyadame - Akka Haaraa", am: "ጥቅም ላይ የዋለ - እንደ አዲስ", category: "Listing" },
  { key: "listing.used_good", en: "Used - Good", om: "Kan Fayyadame - Gaarii", am: "ጥቅም ላይ የዋለ - ጥሩ", category: "Listing" },
  { key: "listing.used_fair", en: "Used - Fair", om: "Kan Fayyadame - Gahaa", am: "ጥቅም ላይ የዋለ - መካከለኛ", category: "Listing" },
  { key: "listing.used_foreign", en: "Used - Foreign", om: "Kan Fayyadame - Biyya Alaa", am: "ጥቅም ላይ የዋለ - የውጭ", category: "Listing" },
  { key: "listing.used_local", en: "Used - Local", om: "Kan Fayyadame - Biyya Keessaa", am: "ጥቅም ላይ የዋለ - የሀገር ውስጥ", category: "Listing" },
  { key: "listing.brand_new", en: "Brand New", om: "Haaraa Guutuu", am: "አዲስ", category: "Listing" },
  { key: "listing.refurbished", en: "Refurbished", om: "Haaromfame", am: "የታደሰ", category: "Listing" },
  { key: "Used - Good", en: "Used - Good", om: "Kan Fayyadame - Gaarii", am: "ጥቅም ላይ የዋለ - ጥሩ", category: "Listing" },
  { key: "Used - Like New", en: "Used - Like New", om: "Kan Fayyadame - Akka Haaraa", am: "ጥቅም ላይ የዋለ - እንደ አዲስ", category: "Listing" },
  { key: "Used - Fair", en: "Used - Fair", om: "Kan Fayyadame - Gahaa", am: "ጥቅም ላይ የዋለ - መካከለኛ", category: "Listing" },
  { key: "Used - Foreign", en: "Used - Foreign", om: "Kan Fayyadame - Biyya Alaa", am: "ጥቅም ላይ የዋለ - የውጭ", category: "Listing" },
  { key: "Used - Local", en: "Used - Local", om: "Kan Fayyadame - Biyya Keessaa", am: "ጥቅም ላይ የዋለ - የሀገር ውስጥ", category: "Listing" },
  { key: "Used - Refurbished", en: "Used - Refurbished", om: "Kan Fayyadame - Haaromfame", am: "ጥቅም ላይ የዋለ - የታደሰ", category: "Listing" },
  { key: "Refurbished", en: "Refurbished", om: "Haaromfame", am: "የታደሰ", category: "Listing" },
  { key: "listing.men", en: "Men", om: "Dhiira", am: "ወንድ", category: "Listing" },
  { key: "listing.clothing_fashion", en: "Clothing & Fashion", om: "Uffata & Faashinii", am: "ልብስ እና ፋሽን", category: "Listing" },

  // Seller Namespace Keys
  { key: "seller.seller_information", en: "SELLER INFORMATION", om: "ODEEFFANNOO GURGURTAA", am: "የሻጭ መረጃ", category: "Seller" },
  { key: "seller.verified_seller", en: "Verified Seller", om: "Gurguraa Mirkanaa'e", am: "የተረጋገጠ ሻጭ", category: "Seller" },
  { key: "seller.active_ads", en: "Active Ads", om: "Beeksisa Hooggana Irra Jiran", am: "ንቁ ማስታወቂያዎች", category: "Seller" },
  { key: "seller.member_since", en: "Member Since", om: "Membara Ture", am: "አባል የሆኑበት ጊዜ", category: "Seller" },
  { key: "seller.joined_this_year", en: "Joined this year", om: "Barana Makame", am: "በዚህ ዓመት የተቀላቀሉ", category: "Seller" },
  { key: "seller.view_all_ads", en: "View All Seller Ads", om: "Beeksisa Gurguraa Hundaa Ilaali", am: "ሁሉንም የሻጭ ማስታወቂያዎች ይመልከቱ", category: "Seller" },
  { key: "seller.chat_with_seller", en: "Chat with Seller", om: "Gurguraa Wajjin Haasawii", am: "ከሻጩ ጋር ይወያዩ", category: "Seller" },
  { key: "seller.make_offer", en: "Make Offer", om: "Gatii Dhiyeessi", am: "ዋጋ ያቅርቡ", category: "Seller" },
  { key: "seller.show_contact", en: "Show Contact", om: "Lakkoofsa Bilbilaa Agarsiisi", am: "ስልክ ቁጥር አሳይ", category: "Seller" },

  // Safety Namespace Keys
  { key: "safety.safety_tips_title", en: "Safety Tips for Buyers", om: "Odeeffannoo Nageenyaa Bittootaaf", am: "ለገዢዎች የደህንነት ምክሮች", category: "Safety" },
  { key: "safety.tip_meet_public", en: "Meet the seller in a safe public place.", om: "Bakka ummataa nagaa ta'etti gurguraa waliin walqunnamaa.", am: "ሻጩን ደህንነቱ በተጠበቀ பொது ቦታ ያግኙ።", category: "Safety" },
  { key: "safety.tip_inspect_item", en: "Inspect the property before making payment.", om: "Kaffaltii raawwachuun dura meeshicha sirriitti qoradhaa.", am: "ክፍያ ከመፈጸምዎ በፊት እቃውን በጥንቃቄ ይመልከቱ።", category: "Safety" },
  { key: "safety.tip_confirm_ownership", en: "Never pay before confirming ownership.", om: "Abbummaa meeshichaa osoo hin mirkaneessin kaffaltii hin raawwatinaa.", am: "የእቃውን ባለቤትነት ሳያረጋግጡ ክፍያ አይክፈሉ።", category: "Safety" },
  { key: "safety.tip_verify_docs", en: "Verify all documents carefully.", om: "Sanadoota hunda of-eeggannoon mirkaneessaa.", am: "ሁሉንም ሰነዶች በጥንቃቄ ያረጋግጡ።", category: "Safety" },
  { key: "safety.tip_trusted_payment", en: "Use trusted payment methods whenever possible.", om: "Malleen kaffaltii amanamoo ta'an fayyadamaa.", am: "በተቻለ መጠን አስተማማኝ የክፍያ መንገዶችን ይጠቀሙ።", category: "Safety" },
  { key: "safety.tip_report_suspicious", en: "Report suspicious listings or fraudulent activity immediately.", om: "Beeksisa mamachiisaa ykn gocha gowwoomsaa battalatti gabaasaa.", am: "አጠራጣሪ ማስታወቂያዎችን ወይም የማጭበርበር ድርጊቶችን ወዲያውኑ ሪፖርት ያድርጉ።", category: "Safety" },
  { key: "safety.report_listing", en: "Report Suspicious Listing", om: "Beeksisa Mamachiisaa Gabaasi", am: "አጠራጣሪ ማስታወቂያ ሪፖርት ያድርጉ", category: "Safety" },

  // Categories Namespace Keys
  { key: "categories.properties", en: "Properties", om: "Qabeenya", am: "ንብረቶች", category: "Categories" },
  { key: "categories.vehicles", en: "Vehicles", om: "Konkolaattota", am: "ተሽከርካሪዎች", category: "Categories" },
  { key: "categories.products", en: "Products", om: "Oomishaalee", am: "ምርቶች", category: "Categories" },
  { key: "categories.jobs", en: "Jobs", om: "Hojiiwwan", am: "ስራዎች", category: "Categories" },
  { key: "categories.services", en: "Services", om: "Tajaajiloota", am: "አገልግሎቶች", category: "Categories" },
  { key: "categories.local_business", en: "Local Business", om: "Daldala Naannoo", am: "የሀገር ውስጥ ንግድ", category: "Categories" },
  { key: "categories.community", en: "Community", om: "Hawaasa", am: "ማህበረሰብ", category: "Categories" },
  { key: "categories.electronics_gadgets", en: "Electronics & Gadgets", om: "Meeshaalee Elektirooniksii", am: "ኤሌክትሮኒክስ እና እቃዎች", category: "Categories" },
  { key: "categories.phones_tablets", en: "Phones & Tablets", om: "Bilbiloota & Taableetiwwan", am: "ስልኮች እና ታብሌቶች", category: "Categories" },
  { key: "categories.computers_laptops", en: "Computers & Laptops", om: "Koompiyuutaroota & Laaptooppii", am: "ኮምፒውተሮች እና ላፕቶፖች", category: "Categories" },
  { key: "categories.furniture_home", en: "Furniture & Home", om: "Meeshaalee Manaa & Mi'a", am: "የቤት እቃዎች እና ማስጌጫዎች", category: "Categories" },
  { key: "categories.clothing_fashion", en: "Clothing & Fashion", om: "Uffata & Faashinii", am: "ልብስ እና ፋሽን", category: "Categories" },
  { key: "categories.babies_kids", en: "Babies & Kids", om: "Daa'imman & Ijoollee", am: "ህጻናት እና ልጆች", category: "Categories" },
  { key: "categories.health_beauty", en: "Health & Beauty", om: "Fayyaa & Miidhagina", am: "ጤና እና ውበት", category: "Categories" },
  { key: "categories.agriculture_food", en: "Agriculture & Food", om: "Qonnaa & Nyata", am: "እርሻ እና ምግብ", category: "Categories" },
  { key: "categories.animals_pets", en: "Animals & Pets", om: "Beeylada & Beeylada Manaa", am: "እንስሳት እና የቤት እንስሳት", category: "Categories" },
  { key: "categories.sports_outdoors", en: "Sports & Outdoors", om: "Ispoortii & Misooma Ala", am: "ስፖርት እና ውጭ እንቅስቃሴዎች", category: "Categories" },
  { key: "categories.commercial_equipment", en: "Commercial Equipment", om: "Meeshaalee Daldalaa", am: "የንግድ መሳሪያዎች", category: "Categories" },
  { key: "categories.other_products", en: "Other Products", om: "Oomishaalee Biroo", am: "ሌሎች ምርቶች", category: "Categories" },

  // Subcategories Namespace Keys
  { key: "subcategories.repair_maintenance", en: "Repair & Maintenance", om: "Suphaa & Suphaa", am: "ጥገና እና ጥገና", category: "Subcategories" },
  { key: "subcategories.construction_renovation", en: "Construction & Renovation", om: "Ijaarsa & Haaromsa", am: "ግንባታ እና እድሳት", category: "Subcategories" },
  { key: "subcategories.transport_moving", en: "Transport & Moving", om: "Geessituu & Geejjiba", am: "ትራንስፖርት እና ማዛወር", category: "Subcategories" },
  { key: "subcategories.it_software", en: "IT & Software Services", om: "Tajaajila IT & Softweerii", am: "የአይቲ እና ሶፍትዌር አገልግሎቶች", category: "Subcategories" },
  { key: "subcategories.design_marketing", en: "Design & Marketing", om: "Diizaayinii & Beeksisa", am: "ዲዛይን እና ማርኬቲንግ", category: "Subcategories" },
  { key: "subcategories.photography_media", en: "Photography & Media", om: "Suuraa & Miidiyaa", am: "ፎቶግራፍ እና ሚዲያ", category: "Subcategories" },
  { key: "subcategories.education_tutoring", en: "Education & Tutoring", om: "Barnoota & Barsiisuu", am: "ትምህርት እና ማስተማር", category: "Subcategories" },
  { key: "subcategories.events_gathering", en: "Events & Gathering", om: "Qophiilee & Walgahii", am: "ሁነቶች እና ስብሰባዎች", category: "Subcategories" },
  { key: "subcategories.charity_volunteering", en: "Charity & Volunteering", om: "Arjooma & Arjooma Tola Ooltummaa", am: "በጎ አድራጎት እና በጎ ፈቃደኝነት", category: "Subcategories" },
  { key: "subcategories.full_time", en: "Full-time Jobs", om: "Hojii Guutuu", am: "ሙሉ ጊዜ ስራ", category: "Subcategories" },
  { key: "subcategories.part_time", en: "Part-time Jobs", om: "Hojii Yeroo Xiqqaa", am: "ትርፍ ጊዜ ስራ", category: "Subcategories" },
  { key: "subcategories.freelance_contract", en: "Freelance / Contract", om: "Hojii Kontraata / Birmaduu", am: "ኮንትራት / ነፃ ስራ", category: "Subcategories" },
  { key: "subcategories.internships", en: "Internships", om: "Shaakala Hojii (Internship)", am: "የስራ ልምድ (ኢንተርንሺፕ)", category: "Subcategories" },
  { key: "subcategories.restaurants_cafes", en: "Restaurants & Cafes", om: "Manneen Nyataa & Kaafii", am: "ምግብ ቤቶች እና ካፌዎች", category: "Subcategories" },
  { key: "subcategories.shops_supermarkets", en: "Shops & Supermarkets", om: "Suuqota & Suuppermaarketiwwan", am: "ሱቆች እና ሱፐርማርኬቶች", category: "Subcategories" },
  { key: "subcategories.salons_beauty", en: "Salons & Beauty Shops", om: "Manooma & Faaya Miidhaginaa", am: "ሳሎኖች እና የውበት ሳሎኖች", category: "Subcategories" },
  { key: "subcategories.auto_repair_garage", en: "Auto Repair & Garage", om: "Garaajii & Suphaa Konkolaataa", am: "የመኪና ጥገና እና ጋራዥ", category: "Subcategories" },
  { key: "subcategories.pharmacies_clinics", en: "Pharmacies & Clinics", om: "Faarmaasii & Kiliinika", am: "ፋርማሲዎች እና ክሊኒኮች", category: "Subcategories" },
  { key: "subcategories.agencies_consultancy", en: "Agencies & Consultancy", om: "Eejensii & Gorsaa", am: "ኤጀንሲዎች እና ማማከር", category: "Subcategories" },
  { key: "subcategories.hotels_guest_houses", en: "Hotels & Guest Houses", om: "Hoteelota & Manneen Keessummootaa", am: "ሆቴሎች እና የእንግዳ ማረፊያዎች", category: "Subcategories" },

  // Core Marketplace Categories
  { key: "Product", en: "Product", om: "Oomishaalee", am: "ምርቶች", category: "Categories" },
  { key: "Products", en: "Products", om: "Oomishaalee", am: "ምርቶች", category: "Categories" },
  { key: "Property", en: "Property", om: "Qabeenya", am: "ንብረት", category: "Categories" },
  { key: "Properties", en: "Properties", om: "Qabeenya", am: "ንብረት", category: "Categories" },
  { key: "Vehicle", en: "Vehicle", om: "Konkolaattota", am: "ተሽከርካሪዎች", category: "Categories" },
  { key: "Vehicles", en: "Vehicles", om: "Konkolaattota", am: "ተሽከርካሪዎች", category: "Categories" },
  { key: "Job", en: "Job", om: "Carraa Hojii", am: "ስራዎች", category: "Categories" },
  { key: "Jobs", en: "Jobs", om: "Carraa Hojii", am: "ስራዎች", category: "Categories" },
  { key: "Service", en: "Service", om: "Tajaajila", am: "አገልግሎቶች", category: "Categories" },
  { key: "Services", en: "Services", om: "Tajaajila", am: "አገልግሎቶች", category: "Categories" },
  { key: "Local Businesses", en: "Local Businesses", om: "Daldala Naannoo", am: "የአካባቢ ንግዶች", category: "Categories" },
  { key: "Community", en: "Community", om: "Hawaasa", am: "ማህበረሰብ", category: "Categories" },

  // Create Listing Wizard Navigation & Step Headers
  { key: "Category", en: "Category", om: "Garee Guddaa", am: "ምድብ", category: "CreateListing" },
  { key: "Subcategory", en: "Subcategory", om: "Garee Xiqqaa", am: "ንዑስ ምድብ", category: "CreateListing" },
  { key: "Details & Photos", en: "Details & Photos", om: "Tarreeffama & Fakkii", am: "ዝርዝሮች እና ፎቶዎች", category: "CreateListing" },
  { key: "Preview Ad", en: "Preview Ad", om: "Beeksisa Ilaali", am: "ማስታወቂያ ቅድመ እይታ", category: "CreateListing" },
  { key: "Boost & Pay", en: "Boost & Pay", om: "Beeksisa Guddisi & Kaffali", am: "ያሳድጉ እና ይክፈሉ", category: "CreateListing" },
  { key: "Specifications & Listing Details", en: "Specifications & Listing Details", om: "Tarreeffama & Ibsa Beeksisaa", am: "ዝርዝሮች እና የማስታወቂያ መረጃ", category: "CreateListing" },
  { key: "Property Owner Contact Details", en: "Property Owner Contact Details", om: "Odeeffannoo Quunnamtii Abbaa Qabeenyaa", am: "የንብረት ባለቤት የመገናኛ መረጃ", category: "CreateListing" },

  // Attributes & Field Labels
  { key: "Item Title", en: "Item Title", om: "Mata Duree Meeshichaa", am: "የእቃው ርዕስ", category: "Fields" },
  { key: "Brand", en: "Brand", om: "Gosa Oomishaa (Brand)", am: "ብራንድ", category: "Fields" },
  { key: "brand", en: "Brand", om: "Gosa Oomishaa (Brand)", am: "ብራንድ", category: "Fields" },
  { key: "Size", en: "Size", om: "Hanga / Hammangaa", am: "መጠን", category: "Fields" },
  { key: "size", en: "Size", om: "Hanga / Hammangaa", am: "መጠን", category: "Fields" },
  { key: "Color", en: "Color", om: "Bifa / Halluu", am: "ቀለም", category: "Fields" },
  { key: "color", en: "Color", om: "Bifa / Halluu", am: "ቀለም", category: "Fields" },
  { key: "Material", en: "Material", om: "Gosa Meeshaa", am: "ቁሳቁስ", category: "Fields" },
  { key: "material", en: "Material", om: "Gosa Meeshaa", am: "ቁሳቁስ", category: "Fields" },
  { key: "Gender", en: "Gender", om: "Saala", am: "ጾታ", category: "Fields" },
  { key: "gender", en: "Gender", om: "Saala", am: "ጾታ", category: "Fields" },
  { key: "Condition", en: "Condition", om: "Haala Meeshichaa", am: "ሁኔታ", category: "Fields" },
  { key: "condition", en: "Condition", om: "Haala Meeshichaa", am: "ሁኔታ", category: "Fields" },
  { key: "Quantity", en: "Quantity", om: "Baay'ina", am: "ብዛት", category: "Fields" },
  { key: "quantity", en: "Quantity", om: "Baay'ina", am: "ብዛት", category: "Fields" },
  { key: "Price", en: "Price", om: "Gatii", am: "ዋጋ", category: "Fields" },
  { key: "price", en: "Price", om: "Gatii", am: "ዋጋ", category: "Fields" },
  { key: "Location", en: "Location", om: "Bakka / Iddoo", am: "አድራሻ / ቦታ", category: "Fields" },
  { key: "location", en: "Location", om: "Bakka / Iddoo", am: "አድራሻ / ቦታ", category: "Fields" },
  { key: "Description", en: "Description", om: "Ibsa Guutuu", am: "ማብራሪያ", category: "Fields" },
  { key: "description", en: "Description", om: "Ibsa Guutuu", am: "ማብራሪያ", category: "Fields" },
  { key: "Subcategory", en: "Subcategory", om: "Garee Xiqqaa", am: "ንዑስ ምድብ", category: "Fields" },
  { key: "subcategory", en: "Subcategory", om: "Garee Xiqqaa", am: "ንዑስ ምድብ", category: "Fields" },
  { key: "Negotiable", en: "Negotiable", om: "Waliigalteen", am: "በስምምነት", category: "Fields" },
  { key: "negotiable", en: "Negotiable", om: "Waliigalteen", am: "በስምምነት", category: "Fields" },
  { key: "product_specifications", en: "Product Specifications", om: "Tarreeffama Oomishaa", am: "የምርት ዝርዝሮች", category: "ListingDetails" },
  { key: "vehicle_specifications", en: "Vehicle Specifications", om: "Tarreeffama Konkolaataa", am: "የተሽከርካሪ ዝርዝሮች", category: "ListingDetails" },
  { key: "job_details", en: "Job Details", om: "Tarreeffama Hojii", am: "የስራ ዝርዝሮች", category: "ListingDetails" },
  { key: "service_information", en: "Service Information", om: "Odeeffannoo Tajaajilaa", am: "የአገልግሎት መረጃ", category: "ListingDetails" },
  { key: "post_information", en: "Post Information", om: "Odeeffannoo Beeksisaa", am: "የማስታወቂያ መረጃ", category: "ListingDetails" },
  { key: "property_specifications", en: "Property Information & Specifications", om: "Odeeffannoo & Tarreeffama Qabeenyaa", am: "የንብረት መረጃ እና ዝርዝሮች", category: "ListingDetails" },
  { key: "about_product", en: "About this product", om: "Waa'ee Oomisha Kanaa", am: "ስለዚህ ምርት", category: "ListingDetails" },
  { key: "about_vehicle", en: "About this vehicle", om: "Waa'ee Konkolaataa Kanaa", am: "ስለዚህ ተሽከርካሪ", category: "ListingDetails" },
  { key: "about_job", en: "About this job", om: "Waa'ee Hojii Kanaa", am: "ስለዚህ ስራ", category: "ListingDetails" },
  { key: "about_service", en: "About this service", om: "Waa'ee Tajaajila Kanaa", am: "ስለዚህ አገልግሎት", category: "ListingDetails" },
  { key: "about_business", en: "About this business", om: "Waa'ee Daldala Kanaa", am: "ስለዚህ ንግድ", category: "ListingDetails" },
  { key: "about_post", en: "About this post", om: "Waa'ee Beeksisa Kanaa", am: "ስለዚህ ማስታወቂያ", category: "ListingDetails" },
  { key: "about_property", en: "About this property", om: "Waa'ee Qabeenya Kanaa", am: "ስለዚህ ንብረት", category: "ListingDetails" },
  { key: "seller_information", en: "SELLER INFORMATION", om: "ODEEFFANNOO GURGURTAA", am: "የሻጭ መረጃ", category: "ListingDetails" },
  { key: "verified_seller", en: "Verified Seller", om: "Gurguraa Mirkanaa'e", am: "የተረጋገጠ ሻጭ", category: "ListingDetails" },
  { key: "active_ads", en: "Active Ads", om: "Beeksisa Hooggana Irra Jiran", am: "ነቁ ማስታወቂያዎች", category: "ListingDetails" },
  { key: "member_since", en: "Member Since", om: "Membara Ture Turee", am: "አባል ከሆነበት ጊዜ", category: "ListingDetails" },
  { key: "joined_this_year", en: "Joined this year", om: "Barana Makame", am: "በዚህ ዓመት የተቀላቀሉ", category: "ListingDetails" },
  { key: "view_all_seller_ads", en: "View All Seller Ads", om: "Beeksisa Gurguraa Hundaa Ilaali", am: "ሁሉንም የሻጭ ማስታወቂያዎች ይመልከቱ", category: "ListingDetails" },
  { key: "chat_with_seller", en: "Chat with Seller", om: "Gurguraa Wajjin Hasawii", am: "ከሻጩ ጋር ያውሩ", category: "ListingDetails" },
  { key: "make_offer", en: "Make Offer", om: "Gati Dhiyeessi", am: "ዋጋ ያቅርቡ", category: "ListingDetails" },
  { key: "show_contact", en: "Show Contact", om: "Lakkoofsa Bilbilaa Agarsiisi", am: "መገናኛ አሳይ", category: "ListingDetails" },
  { key: "contact_info_revealed", en: "Contact Information Revealed", om: "Odeeffannoo Quunnamtii Mul'ateera", am: "የመገናኛ መረጃ ተገልጧል", category: "ListingDetails" },
  { key: "hide", en: "Hide", om: "Dhoksi", am: "ደብቅ", category: "ListingDetails" },
  { key: "safety_tips_buyers", en: "Safety Tips for Buyers", om: "Odeeffannoo Nageenyaa Bittootaaf", am: "ለገዢዎች የደህንነት ምክሮች", category: "ListingDetails" },
  { key: "safety_tip_1", en: "Meet the seller in a safe public place.", om: "Bakka ummataa nagaa ta'etti gurguraa waliin walqunnamaa.", am: "በአስተማማኝ የህዝብ ቦታ ከሻጩ ጋር ይገናኙ።", category: "ListingDetails" },
  { key: "safety_tip_2", en: "Inspect the property before making payment.", om: "Kaffaltii raawwachuun dura meeshicha sirriitti qoradhaa.", am: "ክፍያ ከፈፀሙ በፊት ንብረቱን/እቃውን በጥንቃቄ ይመልከቱ።", category: "ListingDetails" },
  { key: "safety_tip_3", en: "Never pay before confirming ownership.", om: "Aabbummaa meeshichaa osoo hin mirkaneessin kaffaltii hin raawwatinaa.", am: "ባለቤትነቱን ሳያረጋግጡ በፍጹም ክፍያ አይክፈሉ።", category: "ListingDetails" },
  { key: "safety_tip_4", en: "Verify all documents carefully.", om: "Sanadoota hunda of-eeggannoon mirkaneessaa.", am: "ሁሉንም ሰነዶች በጥንቃቄ ያረጋግጡ።", category: "ListingDetails" },
  { key: "safety_tip_5", en: "Use trusted payment methods whenever possible.", om: "Malleen kaffaltii amanamoo ta'an fayyadamaa.", am: "ከተቻለ አስተማማኝ የክፍያ ዘዴዎችን ይጠቀሙ።", category: "ListingDetails" },
  { key: "safety_tip_6", en: "Report suspicious listings or fraudulent activity immediately.", om: "Beeksisa mamachiisaa ykn gocha gowwoomsaa battalatti gabaasaa.", am: "አጠራጣሪ ማስታወቂያዎችን ወይም የማጭበርበር ድርጊቶችን ወዲያውኑ ሪፖርት ያድርጉ።", category: "ListingDetails" },
  { key: "report_suspicious_listing", en: "Report Suspicious Listing", om: "Beeksisa Mamachiisaa Gabaasi", am: "አጠራጣሪ ማስታወቂያ ሪፖርት ያድርጉ", category: "ListingDetails" },
  { key: "discover_more", en: "DISCOVER MORE", om: "HUNDAA DONGORSI", am: "ተጨማሪ ያስሱ", category: "ListingDetails" },
  { key: "similar_properties", en: "Similar Properties & Listings", om: "Qabeenya & Beeksisa Wal-fakkaatan", am: "ተመሳሳይ ንብረቶች እና ማስታወቂያዎች", category: "ListingDetails" },
  { key: "ad", en: "Ad", om: "Beeksisa", am: "ማስታወቂያ", category: "ListingDetails" },
  { key: "ads", en: "Ads", om: "Beeksisa", am: "ማስታወቂያዎች", category: "ListingDetails" },
  { key: "all_categories", en: "ALL CATEGORIES", om: "GAREEWWAN HUNDA", am: "ሁሉም ምድቦች", category: "Catalog" },
  { key: "select_category_browse", en: "Select a category to browse verified listings", om: "Beeksisa mirkanaa'e filachuuf garee filadhu", am: "የተረጋገጡ ማስታወቂያዎችን ለመመልከት ምድብ ይምረጡ", category: "Catalog" },
  { key: "search_categories_placeholder", en: "Search categories, subcategories & brands (e.g. Nike, Toyota, Smartphones)...", om: "Gareewwan, garee xiqqaa & brandoota barbaadi...", am: "ምድቦችን፣ ንዑስ ምድቦችን እና ብራንዶችን ይፈልጉ...", category: "Catalog" },
  { key: "no_category_matched", en: "No category, subcategory or brand matched", om: "Gareen, gareen xiqqaan ykn brandiin walsimatu hin argamne", am: "ምንም የሚዛመድ ምድብ፣ ንዑስ ምድብ ወይም ብራንድ አልተገኘም", category: "Catalog" },
  { key: "search_results", en: "Search Results", om: "Bu'aa Barbaacha", am: "የፍለጋ ውጤቶች", category: "Catalog" },
  { key: "subcategories_label", en: "Subcategories:", om: "GAREEWWAN XIQQAA:", am: "ንዑስ ምድቦች፦", category: "Catalog" },
  { key: "view_all", en: "View All", om: "Hunda Ilaali", am: "ሁሉንም ይመልከቱ", category: "Catalog" },
  { key: "popular_brands", en: "Popular Brands:", om: "Brandoota Beekamoo:", am: "ታዋቂ ብራንዶች፦", category: "Catalog" },
  { key: "items_suffix", en: "items", om: "beeksisa", am: "እቃዎች", category: "Catalog" },
  { key: "Price", en: "Price", om: "Gatii", am: "ዋጋ", category: "Fields" },
  { key: "Location", en: "Location", om: "Bakka / Iddoo", am: "አድራሻ / ቦታ", category: "Fields" },
  { key: "Description", en: "Description", om: "Ibsa Guutuu", am: "ማብራሪያ", category: "Fields" },

  // Uploads & Action Buttons
  { key: "Upload photos", en: "Upload photos", om: "Fakkoota Fe'i", am: "ፎቶዎችን ይስቀሉ", category: "Actions" },
  { key: "Upload video", en: "Upload video", om: "Viidiyoo Fe'i", am: "ቪዲዮ ይስቀሉ", category: "Actions" },
  { key: "Publish Listing", en: "Publish Listing", om: "Beeksisa Maxxansi", am: "ማስታወቂያ ይለጥፉ", category: "Actions" },
  { key: "Save Changes", en: "Save Changes", om: "Jijjiirama Galmeessi", am: "ለዉጦችን ያስቀምጡ", category: "Actions" },
  { key: "Next", en: "Next", om: "Kan Itti Aanu", am: "ቀጣይ", category: "Actions" },
  { key: "Back", en: "Back", om: "Deebi'i", am: "ተመለስ", category: "Actions" },
  { key: "Cancel", en: "Cancel", om: "Haqui", am: "ሰርዝ", category: "Actions" },

  // Welcome & Auth Screen
  {
    key: "welcome_title",
    en: "Welcome to SOF-UMER",
    om: "Baga Gara SOF-UMER Hapiin Dhuftan",
    am: "ወደ SOF-UMER በደህና መጡ",
    category: "Welcome"
  },
  {
    key: "welcome_subtitle",
    en: "Find, buy, rent, and manage properties with confidence.",
    om: "Amanannaan qabeenya barbaadi, bitadhu, kireeffadhu, akkasumas bulchi.",
    am: "ንብረቶችን በልበ ሙሉነት ይፈልጉ፣ ይግዙ፣ ያከራዩ እና ያስተዳድሩ።",
    category: "Welcome"
  },
  {
    key: "homepage_title",
    en: "Sof Umer",
    om: "Sof Umer",
    am: "ሶፍ ኡመር",
    category: "Welcome"
  },
  {
    key: "homepage_tagline",
    en: "The smart way to discover, buy, sell, rent, and connect with your local community.",
    om: "Mala qaruutee qabeenya argachuu, bitachuu, gurguruu, kireeffachuu fi hawaasa naannoo kee waliin wal-qunnamuuf.",
    am: "በአካባቢዎ ማህበረሰብ ውስጥ ንብረቶችን ለማግኘት፣ ለመግዛት፣ ለመሸጥ፣ ለመከራየት እና ለመገናኘት ብልህ መንገድ።",
    category: "Welcome"
  },
  {
    key: "login",
    en: "Login",
    om: "Seeni",
    am: "ይግቡ",
    category: "General"
  },
  {
    key: "signup",
    en: "Sign Up",
    om: "Galmee",
    am: "ይመዝገቡ",
    category: "General"
  },
  {
    key: "logout",
    en: "Logout",
    om: "Ba'i",
    am: "ውጡ",
    category: "General"
  },
  {
    key: "email",
    en: "Email Address",
    om: "Teessoo Imeelii",
    am: "የኢሜል አድራሻ",
    category: "General"
  },
  {
    key: "password",
    en: "Password",
    om: "Jecha Icchitii",
    am: "የይለፍ ቃል",
    category: "General"
  },
  {
    key: "login_title",
    en: "Sign In to Sof Umer",
    om: "Sof Umeritti Seeni",
    am: "ወደ ሶፍ ኡመር ይግቡ",
    category: "Auth"
  },
  {
    key: "login_subtitle",
    en: "Enter your credentials to access the premier real estate marketplace.",
    om: "Gabaa qabeenyaa olaanaa argachuuf ragaalee kee galchi.",
    am: "የሪል እስቴት ገበያውን ለመጠቀም መለያዎን ያስገቡ።",
    category: "Auth"
  },
  {
    key: "sign_in",
    en: "Sign In",
    om: "Seeni",
    am: "ይግቡ",
    category: "Auth"
  },
  {
    key: "dont_have_account",
    en: "Don't have an account?",
    om: "Mila/akawuntii hin qabduu?",
    am: "መለያ የለዎትም?",
    category: "Auth"
  },
  {
    key: "register_now",
    en: "Register Now",
    om: "Amma Galmee",
    am: "አሁን ይመዝገቡ",
    category: "Auth"
  },
  {
    key: "already_have_account",
    en: "Already have an account?",
    om: "Duraan akawuntii qabduu?",
    am: "በፊት መለያ አለዎት?",
    category: "Auth"
  },
  {
    key: "full_name",
    en: "Full Name",
    om: "Maqaa Guutuu",
    am: "ሙሉ ስም",
    category: "Auth"
  },
  {
    key: "role_buyer_seller",
    en: "Account Role (Buyer/Seller)",
    om: "Gahee Akawuntii (Bitaa/Gurguraa)",
    am: "የመለያ ሚና (ገዥ/ሻጭ)",
    category: "Auth"
  },
  {
    key: "role_user",
    en: "Buyer / Standard User",
    om: "Bitaa / Fayyadamaa Idilee",
    am: "ገዢ / መደበኛ ተጠቃሚ",
    category: "Auth"
  },
  {
    key: "role_agent",
    en: "Seller / Agent / Landlord",
    om: "Gurguraa / Ejentii / Abbaa Qabeenyaa",
    am: "ሻጭ / ወኪል / አከራይ",
    category: "Auth"
  },
  {
    key: "register_btn",
    en: "Create Profile",
    om: "Profaayilii Uumi",
    am: "መገለጫ ፍጠር",
    category: "Auth"
  },
  {
    key: "forgot_password",
    en: "Forgot Password?",
    om: "Jecha icchitii dagattee?",
    am: "የይለፍ ቃል ረስተዋል?",
    category: "Auth"
  },
  {
    key: "reset_password_title",
    en: "Reset Password",
    om: "Jecha Icchitii Haaromsi",
    am: "የይለፍ ቃል መልሰው ያግኙ",
    category: "Auth"
  },
  {
    key: "reset_password_desc",
    en: "Enter your email to receive a temporary recovery code.",
    om: "Koodii bafannaa yeroo gabaabaa argachuuf imeeli kee galchi.",
    am: "ጊዜያዊ መልሶ ማግኛ ኮድ ለመቀበል ኢሜልዎን ያስገቡ።",
    category: "Auth"
  },
  {
    key: "send_reset_code",
    en: "Send Reset Code",
    om: "Koodii Haaromsaa Ergi",
    am: "የመልሶ ማግኛ ኮድ ላክ",
    category: "Auth"
  },
  {
    key: "back_to_login",
    en: "Back to Login",
    om: "Gara Seensatti Deebi'i",
    am: "ወደ መግቢያ ይመለሱ",
    category: "Auth"
  },
  {
    key: "enter_reset_code",
    en: "Verification Code",
    om: "Koodii Mirkaneessaa",
    am: "የማረጋገጫ ኮድ",
    category: "Auth"
  },
  {
    key: "new_password",
    en: "New Password",
    om: "Jecha Icchitii Haaraa",
    am: "አዲስ የይለፍ ቃል",
    category: "Auth"
  },
  {
    key: "confirm_new_password",
    en: "Confirm New Password",
    om: "Jecha Icchitii Haaraa Mirkaneessi",
    am: "አዲሱን የይለፍ ቃል ያረጋግጡ",
    category: "Auth"
  },
  {
    key: "update_password_btn",
    en: "Update Password",
    om: "Jecha Icchitii Haaromsi",
    am: "የይለፍ ቃል አዘምን",
    category: "Auth"
  },
  {
    key: "register_success",
    en: "Registration successful! Use the dev verification code below to verify.",
    om: "Galmeen milkaa'eera! Mirkaneessuuf koodii gadii fayyadami.",
    am: "ምዝገባው ተሳክቷል! ለማረጋገጥ ከታች ያለውን ኮድ ይጠቀሙ።",
    category: "Auth"
  },
  {
    key: "verify_account",
    en: "Verify Account",
    om: "Akawuntii Mirkaneessi",
    am: "መለያ ያረጋግጡ",
    category: "Auth"
  },
  {
    key: "verify_btn",
    en: "Verify & Login",
    om: "Mirkaneessi & Seeni",
    am: "አረጋግጥ እና ግባ",
    category: "Auth"
  },
  {
    key: "custom_login_header",
    en: "Instant Developer Logins",
    om: "Seensa Injinarootaa Saffisaa",
    am: "ፈጣን የገንቢዎች መግቢያ",
    category: "Auth"
  },
  {
    key: "custom_login_desc",
    en: "Select one of the pre-configured accounts below for testing purposes.",
    om: "Kanneen gadii keessaa tokko filachuun qorannoodhaaf fayyadami.",
    am: "ለመሞከር ከታች ካሉት መለያዎች አንዱን ይምረጡ።",
    category: "Auth"
  },
  {
    key: "verification_code_placeholder",
    en: "Enter 6-digit code",
    om: "Koodii digitii 6 galchi",
    am: "ባለ 6 አሃዝ ኮድ ያስገቡ",
    category: "Auth"
  },
  {
    key: "resend_code",
    en: "Resend Code",
    om: "Koodii Ergi Deebisi",
    am: "ኮድ ድጋሚ ላክ",
    category: "Auth"
  },
  {
    key: "guest_login",
    en: "Browse App as Guest",
    om: "Akka Keessummaatti Ilaali",
    am: "በእንግድነት ይግቡ",
    category: "Auth"
  },

  // Marketplace & Search Filters
  {
    key: "search_placeholder",
    en: "Search properties by location, title or features...",
    om: "Qabeenya bakkaan, mata dureen ykn amalaan barbaadi...",
    am: "ንብረቶችን በቦታ፣ በርዕስ ወይም በባህሪያት ይፈልጉ...",
    category: "Marketplace"
  },
  {
    key: "filter_location",
    en: "Location",
    om: "Bakka",
    am: "ቦታ",
    category: "Marketplace"
  },
  {
    key: "filter_category",
    en: "Category",
    om: "Ramaddii",
    am: "ምድብ",
    category: "Marketplace"
  },
  {
    key: "filter_price",
    en: "Price Range",
    om: "Gatiin",
    am: "የዋጋ ክልል",
    category: "Marketplace"
  },
  {
    key: "filter_type",
    en: "Property Type",
    om: "Gosa Qabeenyaa",
    am: "የንብረት አይነት",
    category: "Marketplace"
  },
  {
    key: "filter_bedrooms",
    en: "Bedrooms",
    om: "Kutaalee Ciisichaa",
    am: "መኝታ ክፍሎች",
    category: "Marketplace"
  },
  {
    key: "filter_bathrooms",
    en: "Bathrooms",
    om: "Kutaalee Dhiqannaa",
    am: "የመታጠቢያ ክፍሎች",
    category: "Marketplace"
  },
  {
    key: "filter_area",
    en: "Area Size (sqm)",
    om: "Bal'ina Imeeraa",
    am: "የቦታ ስፋት (በካሬ ሜትር)",
    category: "Marketplace"
  },
  {
    key: "filter_btn",
    en: "Apply Filters",
    om: "Filtaroota Fayyadami",
    am: "ማጣሪያዎችን ተግብር",
    category: "Marketplace"
  },
  {
    key: "featured_properties",
    en: "Featured Properties",
    om: "Qabeenya Filataman",
    am: "ልዩ ትኩረት የተሰጣቸው ንብረቶች",
    category: "Marketplace"
  },
  {
    key: "latest_properties",
    en: "Latest Listings",
    om: "Galmeewwan Haaraa",
    am: "አዳዲስ ንብረቶች",
    category: "Marketplace"
  },
  {
    key: "recommended_properties",
    en: "Recommended for You",
    om: "Sitti Kan Agarsiifamu",
    am: "ለእርስዎ የሚመከሩ",
    category: "Marketplace"
  },
  {
    key: "view_details",
    en: "View Details",
    om: "Bal'inaan Ilaali",
    am: "ዝርዝሩን ይመልከቱ",
    category: "Marketplace"
  },
  {
    key: "no_properties_found",
    en: "No properties found matching your filters.",
    om: "Qabeenyi filatame argamuu hin dandeenye.",
    am: "ከማጣሪያዎ ጋር የሚስማማ ንብረት አልተገኘም።",
    category: "Marketplace"
  },
  {
    key: "clear_filters",
    en: "Clear Filters",
    om: "Filtaroota qulqulleessi",
    am: "ማጣሪያዎችን አጽዳ",
    category: "Marketplace"
  },
  {
    key: "property_price",
    en: "Price",
    om: "Gatii",
    am: "ዋጋ",
    category: "Marketplace"
  },
  {
    key: "property_area",
    en: "Area",
    om: "Bal'ina",
    am: "ስፋት",
    category: "Marketplace"
  },
  {
    key: "property_beds",
    en: "Beds",
    om: "Kutaalee",
    am: "ክፍሎች",
    category: "Marketplace"
  },
  {
    key: "property_baths",
    en: "Baths",
    om: "Dhiqannaa",
    am: "መታጠቢያ",
    category: "Marketplace"
  },

  // Categories
  {
    key: "cat_buy",
    en: "Buy",
    om: "Bituuf",
    am: "ለመግዛት",
    category: "Categories"
  },
  {
    key: "cat_rent",
    en: "Rent",
    om: "Kireeffachuu",
    am: "ለመከራየት",
    category: "Categories"
  },
  {
    key: "cat_commercial",
    en: "Commercial",
    om: "Daldalaa",
    am: "ለንግድ",
    category: "Categories"
  },
  {
    key: "cat_land",
    en: "Land",
    om: "Lafa",
    am: "መሬት",
    category: "Categories"
  },
  {
    key: "cat_apartments",
    en: "Apartments",
    om: "Epartimantii",
    am: "አፓርታማዎች",
    category: "Categories"
  },
  {
    key: "cat_houses",
    en: "Houses",
    om: "Manneen",
    am: "ቤቶች",
    category: "Categories"
  },
  {
    key: "cat_offices",
    en: "Offices",
    om: "Ofisoota",
    am: "ቢሮዎች",
    category: "Categories"
  },
  {
    key: "cat_properties",
    en: "Properties",
    om: "Qabeenya",
    am: "ንብረቶች",
    category: "Categories"
  },
  {
    key: "cat_jobs",
    en: "Jobs",
    om: "Hojiiwwan",
    am: "ስራዎች",
    category: "Categories"
  },
  {
    key: "cat_services",
    en: "Services",
    om: "Tajaajiloota",
    am: "አገልግሎቶች",
    category: "Categories"
  },
  {
    key: "cat_products",
    en: "Products",
    om: "Oomishaalee",
    am: "ምርቶች",
    category: "Categories"
  },
  {
    key: "cat_localbusinesses",
    en: "Local Businesses",
    om: "Daldala Naannoo",
    am: "የአካባቢ ንግዶች",
    category: "Categories"
  },
  {
    key: "cat_community",
    en: "Community",
    om: "Hawaasa",
    am: "ማህበረሰብ",
    category: "Categories"
  },

  // Dashboard Tabs & Navigation
  {
    key: "my_profile",
    en: "My Profile",
    om: "Profaayilii Koo",
    am: "የእኔ መገለጫ",
    category: "Dashboard"
  },
  {
    key: "messages",
    en: "Messages",
    om: "Ergaawwan",
    am: "መልዕክቶች",
    category: "Dashboard"
  },
  {
    key: "notifications",
    en: "Notifications",
    om: "Beeksisa",
    am: "ማሳወቂያዎች",
    category: "Dashboard"
  },
  {
    key: "payment_methods",
    en: "Payment Methods",
    om: "Malleen Kafaltii",
    am: "የክፍያ ዘዴዎች",
    category: "Dashboard"
  },
  {
    key: "settings",
    en: "Settings",
    om: "Sajatoo",
    am: "ቅንብሮች",
    category: "Dashboard"
  },
  {
    key: "my_listings",
    en: "My Listings",
    om: "Qabeenyawwan Koo",
    am: "የእኔ ንብረቶች",
    category: "Dashboard"
  },
  {
    key: "admin_dashboard",
    en: "Administrative Dashboard",
    om: "Daashboordii Bulchiinsaa",
    am: "የአስተዳደር ዳሽቦርድ",
    category: "Dashboard"
  },
  {
    key: "list_property",
    en: "List Property",
    om: "Qabeenya Galmeessi",
    am: "ንብረት ይመዝግቡ",
    category: "Dashboard"
  },
  {
    key: "favorites",
    en: "Favorites",
    om: "Filataman",
    am: "ተወዳጆች",
    category: "Dashboard"
  },

  // Property Details
  {
    key: "back_to_marketplace",
    en: "Back to Marketplace",
    om: "Gara Gabaatti Deebi'i",
    am: "ወደ ገበያ ይመለሱ",
    category: "Details"
  },
  {
    key: "contact_agent",
    en: "Contact Agent",
    om: "Ejentii Quunnami",
    am: "ወኪሉን ያነጋግሩ",
    category: "Details"
  },
  {
    key: "property_description",
    en: "Description",
    om: "Ibsa",
    am: "መግለጫ",
    category: "Details"
  },
  {
    key: "property_features",
    en: "Key Features",
    om: "Amala Ijjoo",
    am: "ዋና ዋና ባህሪያት",
    category: "Details"
  },
  {
    key: "property_location",
    en: "Location Context",
    om: "Haala Bakkaa",
    am: "የቦታው ሁኔታ",
    category: "Details"
  },
  {
    key: "payment_verification_required",
    en: "Payment Verification Required",
    om: "Mirkaneessaan Kafaltii Barbaachisaadha",
    am: "የክፍያ ማረጋገጫ ያስፈልጋል",
    category: "Details"
  },
  {
    key: "payment_instructions",
    en: "Please upload your bank transaction slip (CBE, Awash, or Telebirr) to activate this listing.",
    om: "Galmeessuu mirkaneessuuf kofaltii baankii keessan (CBE, Awash ykn Telebirr) ol-fehaa.",
    am: "ይህን ንብረት ለማንቀሳቀስ እባክዎ የባንክ ማስተላለፊያ ደረሰኝዎን (CBE፣ አዋሽ ወይም ቴሌብር) ይስቀሉ።",
    category: "Details"
  },
  {
    key: "upload_receipt",
    en: "Upload Receipt Slip",
    om: "Slip Kafaltii Ol-fehi",
    am: "ደረሰኝ ይስቀሉ",
    category: "Details"
  },
  {
    key: "submitting_receipt",
    en: "Uploading Receipt...",
    om: "Slip Ol-fuhamaa jira...",
    am: "ደረሰኝ በመጫን ላይ...",
    category: "Details"
  },
  {
    key: "receipt_approved",
    en: "Receipt Approved & Verified",
    om: "Slip Kafaltii Mirkanaa'era",
    am: "ደረሰኝ ጸድቋል እና ተረጋግጧል",
    category: "Details"
  },
  {
    key: "receipt_pending",
    en: "Verification Receipt Pending Review",
    om: "Slip Kafaltii Ilaalamaa Jira",
    am: "የማረጋገጫ ደረሰኝ በመጠባበቅ ላይ",
    category: "Details"
  },
  {
    key: "report_listing",
    en: "Report Listing",
    om: "Qabeenya Gabaasi",
    am: "ንብረቱን ያሳውቁ",
    category: "Details"
  },
  {
    key: "chat_agent_title",
    en: "Chat with Landlord",
    om: "Abbaa Qabeenyaa Waliin Haasawi",
    am: "ከአከራዩ ጋር ይወያዩ",
    category: "Details"
  },
  {
    key: "send_message_placeholder",
    en: "Type your inquiry...",
    om: "Ergaa kee barreessi...",
    am: "መልዕክትዎን እዚህ ይጻፉ...",
    category: "Details"
  },
  {
    key: "send_btn",
    en: "Send",
    om: "Ergi",
    am: "ላክ",
    category: "Details"
  },

  // Create Listing Modal
  {
    key: "create_listing_title",
    en: "Create New Property Listing",
    om: "Qabeenya Haaraa Galmeessi",
    am: "አዲስ ንብረት ይመዝግቡ",
    category: "CreateListing"
  },
  {
    key: "property_title_label",
    en: "Property Title",
    om: "Mata Duree Qabeenyaa",
    am: "የንብረት ርዕስ",
    category: "CreateListing"
  },
  {
    key: "property_desc_label",
    en: "Description",
    om: "Ibsa",
    am: "መግለጫ",
    category: "CreateListing"
  },
  {
    key: "property_price_label",
    en: "Price (ETB)",
    om: "Gatii (ETB)",
    am: "ዋጋ (በኢትዮጵያ ብር)",
    category: "CreateListing"
  },
  {
    key: "property_location_label",
    en: "Location / Address",
    om: "Bakka / Teessoo",
    am: "ቦታ / አድራሻ",
    category: "CreateListing"
  },
  {
    key: "property_major_cat_label",
    en: "Major Category",
    om: "Ramaddii Guddaa",
    am: "ዋና ምድብ",
    category: "CreateListing"
  },
  {
    key: "property_sub_cat_label",
    en: "Sub Category",
    om: "Ramaddii Xiqqaa",
    am: "ንዑስ ምድብ",
    category: "CreateListing"
  },
  {
    key: "property_image_url_label",
    en: "Image URL",
    om: "Teessoo Fakkii (Image URL)",
    am: "የምስል አድራሻ (URL)",
    category: "CreateListing"
  },
  {
    key: "property_features_placeholder",
    en: "e.g. Modern kitchen, Balcony, Parking (comma separated)",
    om: "fkn. Kushiina Haaraa, Balkoonii, Paarkingii",
    am: "ምሳሌ፦ ዘመናዊ ወጥ ቤት፣ በረንዳ፣ ማቆሚያ (በኮማ የተለዩ)",
    category: "CreateListing"
  },
  {
    key: "save_listing_btn",
    en: "Publish Listing",
    om: "Qabeenya Gabaatti Baasi",
    am: "ንብረቱን ያውጡ",
    category: "CreateListing"
  },
  {
    key: "cancel_btn",
    en: "Cancel",
    om: "Dhiisi",
    am: "ሰርዝ",
    category: "General"
  },
  {
    key: "validation_title",
    en: "Title is required",
    om: "Mata dureen barbaachisaadha",
    am: "ርዕስ ያስፈልጋል",
    category: "CreateListing"
  },
  {
    key: "validation_price",
    en: "Price must be a positive number",
    om: "Gatiin lakkoofsa sirrii ta'uu qaba",
    am: "ዋጋ ትክክለኛ ቁጥር መሆን አለበት",
    category: "CreateListing"
  },

  // Admin Dashboard
  {
    key: "admin_panel_title",
    en: "Administrator Administrative Console",
    om: "Konsoolii Bulchiinsa Admin",
    am: "የአስተዳዳሪ መቆጣጠሪያ ሰሌዳ",
    category: "Admin"
  },
  {
    key: "admin_users_tab",
    en: "Users Management",
    om: "Bulchiinsa Fayyadamtootaa",
    am: "የተጠቃሚዎች አስተዳደር",
    category: "Admin"
  },
  {
    key: "admin_listings_tab",
    en: "Manage Listings",
    om: "Qabeenya Bulchi",
    am: "ንብረቶችን ማስተዳደር",
    category: "Admin"
  },
  {
    key: "admin_slips_tab",
    en: "Payment Slips Audit",
    om: "Kafaltii Slip Gamgami",
    am: "የክፍያ ደረሰኞች ኦዲት",
    category: "Admin"
  },
  {
    key: "admin_inquiries_tab",
    en: "Inquiries Support",
    om: "Gargaarsa Gaaffii",
    am: "የጥያቄዎች ድጋፍ",
    category: "Admin"
  },
  {
    key: "admin_ads_tab",
    en: "Advertisements",
    om: "Beeksisa",
    am: "ማስታወቂያዎች",
    category: "Admin"
  },
  {
    key: "admin_reports_tab",
    en: "Safety Reports",
    om: "Gabaasa Nageenyaa",
    am: "የደህንነት ሪፖርቶች",
    category: "Admin"
  },
  {
    key: "admin_analytics_tab",
    en: "Advanced Analytics",
    om: "Xiinxala Olaanaa",
    am: "የላቀ ትንታኔ",
    category: "Admin"
  },
  {
    key: "verify_user_btn",
    en: "Verify",
    om: "Mirkaneessi",
    am: "አረጋግጥ",
    category: "Admin"
  },
  {
    key: "unverify_user_btn",
    en: "Unverify",
    om: "Mirkaneessa Kaasi",
    am: "ማረጋገጫውን አንሳ",
    category: "Admin"
  },
  {
    key: "delete_user_btn",
    en: "Delete",
    om: "Haqi",
    am: "ሰርዝ",
    category: "Admin"
  },
  {
    key: "approve_listing_btn",
    en: "Approve",
    om: "Mirkaneessi",
    am: "አጽድቅ",
    category: "Admin"
  },
  {
    key: "reject_listing_btn",
    en: "Reject",
    om: "Didi",
    am: "ውድቅ አድርግ",
    category: "Admin"
  },
  {
    key: "delete_listing_btn",
    en: "Delete Listing",
    om: "Qabeenya Haqi",
    am: "ንብረቱን ሰርዝ",
    category: "Admin"
  },
  {
    key: "total_revenue",
    en: "Total Confirmed Revenue",
    om: "Kafaltii Guutuu Mirkaneessame",
    am: "ጠቅላላ የተረጋገጠ ገቢ",
    category: "Admin"
  },
  {
    key: "total_listings",
    en: "Total Active Listings",
    om: "Qabeenya Hojirra Jiran",
    am: "ጠቅላላ ንቁ ንብረቶች",
    category: "Admin"
  },
  {
    key: "pending_verifications",
    en: "Pending Verifications",
    om: "Mirkaneessaan Kan Eegamu",
    am: "በመጠባበቅ ላይ ያሉ ማረጋገጫዎች",
    category: "Admin"
  },

  // Profile, Support, Settings
  {
    key: "profile_details_title",
    en: "Profile Details",
    om: "Ragaa Profaayilii",
    am: "የመገለጫ ዝርዝሮች",
    category: "Profile"
  },
  {
    key: "account_verification_status",
    en: "Verification Status",
    om: "Haala Mirkaneessaa",
    am: "የማረጋገጫ ሁኔታ",
    category: "Profile"
  },
  {
    key: "verified",
    en: "Verified Account",
    om: "Akawuntii Mirkaneessame",
    am: "የተረጋገጠ መለያ",
    category: "Profile"
  },
  {
    key: "not_verified",
    en: "Not Verified",
    om: "Kan Hin Mirkaneessamne",
    am: "ያልተረጋገጠ",
    category: "Profile"
  },
  {
    key: "support_ticket_title",
    en: "Support & Ticket Center",
    om: "Giddugala Gargaarsaa",
    am: "የድጋፍ ማዕከል",
    category: "Profile"
  },
  {
    key: "subject_label",
    en: "Subject",
    om: "Dhimma",
    am: "ጉዳይ",
    category: "Profile"
  },
  {
    key: "message_label",
    en: "Message",
    om: "Ergaa",
    am: "መልዕክት",
    category: "Profile"
  },
  {
    key: "submit_ticket_btn",
    en: "Submit Ticket",
    om: "Tikettii Ergi",
    am: "ጥያቄውን ላክ",
    category: "Profile"
  },
  {
    key: "save_profile_btn",
    en: "Save Profile",
    om: "Profaayilii Ol-kaahi",
    am: "መገለጫውን አስቀምጥ",
    category: "Profile"
  },
  {
    key: "payment_methods_title",
    en: "Saved Payment Methods",
    om: "Malleen Kafaltii Ol-kaahame",
    am: "የተቀመጡ የክፍያ ዘዴዎች",
    category: "Profile"
  },
  {
    key: "add_payment_method",
    en: "Add Payment Method",
    om: "Malla Kafaltii Dabali",
    am: "የክፍያ ዘዴ ያክሉ",
    category: "Profile"
  },
  {
    key: "account_number_label",
    en: "Account Number",
    om: "Lakkoofsa Akawuntii",
    am: "የሂሳብ ቁጥር",
    category: "Profile"
  },
  {
    key: "bank_name_label",
    en: "Bank Name",
    om: "Maqaa Baankii",
    am: "የባንክ ስም",
    category: "Profile"
  },
  {
    key: "save_btn",
    en: "Save",
    om: "Ol-kaahi",
    am: "አስቀምጥ",
    category: "General"
  },

  // Chat & Inquiries
  {
    key: "no_conversations",
    en: "No active conversations yet.",
    om: "Haasawi hojirra jiru hin jiru.",
    am: "እስካሁን ምንም ንቁ ውይይት የለም።",
    category: "Chat"
  },
  {
    key: "chat_history",
    en: "Chat History",
    om: "Seenaa Haasawaa",
    am: "የውይይት ታሪክ",
    category: "Chat"
  },
  {
    key: "support_history",
    en: "Your Support Tickets",
    om: "Tikettii Gargaarsa Keessan",
    am: "የእርስዎ የድጋፍ ጥያቄዎች",
    category: "Chat"
  },
  {
    key: "all_categories",
    en: "All Categories",
    om: "Kategorii Hundumaa",
    am: "ሁሉም ምድቦች",
    category: "Marketplace"
  },
  {
    key: "items",
    en: "items",
    om: "meeshotta",
    am: "ዕቃዎች",
    category: "Marketplace"
  },
  {
    key: "filters",
    en: "Filters",
    om: "Gingilchaa",
    am: "ማጣሪያዎች",
    category: "Marketplace"
  },
  {
    key: "reset",
    en: "Reset",
    om: "Deebisi",
    am: "ዳግም አስጀምር",
    category: "Marketplace"
  },
  {
    key: "all_transactions",
    en: "All Transactions",
    om: "Daldala Hundumaa",
    am: "ሁሉም ግብይቶች",
    category: "Marketplace"
  },
  {
    key: "all_types",
    en: "All Types",
    om: "Gosoota Hundumaa",
    am: "ሁሉም ዓይነቶች",
    category: "Marketplace"
  },
  {
    key: "all_cities_regions",
    en: "All Cities / Regions",
    om: "Magaalota / Naannolee Hundumaa",
    am: "ሁሉም ከተሞች / ክልሎች",
    category: "Marketplace"
  },
  {
    key: "currency_status",
    en: "Currency Status",
    om: "Haala Maallaqaa",
    am: "የገንዘብ ሁኔታ",
    category: "Marketplace"
  },
  {
    key: "all_currencies",
    en: "All Currencies",
    om: "Maallaqa Hundumaa",
    am: "ሁሉም የገንዘብ ዓይነቶች",
    category: "Marketplace"
  },
  {
    key: "min_price",
    en: "Min Price",
    om: "Gatii Xiqqaa",
    am: "ዝቅተኛ ዋጋ",
    category: "Marketplace"
  },
  {
    key: "any_value",
    en: "Any",
    om: "Kamiyyuu",
    am: "ማንኛውም",
    category: "Marketplace"
  },
  {
    key: "max_price",
    en: "Max Price",
    om: "Gatii Guddaa",
    am: "ከፍተኛ ዋጋ",
    category: "Marketplace"
  },
  {
    key: "min_bedrooms",
    en: "Min Bedrooms",
    om: "Kutaa Ciisichaa",
    am: "ዝቅተኛ የመኝታ ክፍሎች",
    category: "Marketplace"
  },
  {
    key: "min_area",
    en: "Min Area (sqm)",
    om: "Bal'ina Xiqqaa (sqm)",
    am: "ዝቅተኛ ስፋት (ካሬ ሜትር)",
    category: "Marketplace"
  },
  {
    key: "no_listings_matching",
    en: "No listings found matching parameters",
    om: "Beeksisa dhiyaate tokkollee hin argamne",
    am: "ከተመረጡት አማራጮች ጋር የሚዛመድ ንብረት አልተገኘም",
    category: "Marketplace"
  },
  {
    key: "reset_filters_helper",
    en: "Try resetting search filters or using a broader area name.",
    om: "Gingilchaa barbaaddii deebisi ykn maqaa bal'aa dhimma bahi.",
    am: "እባክዎን ማጣሪያዎቹን ዳግም አስጀምሩ ወይም ሌላ ቦታ ይፈልጉ።",
    category: "Marketplace"
  },
  {
    key: "verified_picks",
    en: "Verified Select Picks",
    om: "Filannoowwan Mirkanaa'an",
    am: "የተረጋገጡ ምርጥ ምርጫዎች",
    category: "Marketplace"
  },
  {
    key: "personalized_recs",
    en: "Personalized Recommendation",
    om: "Yaada Profaayilii Keetiin",
    am: "የግል ምክሮች",
    category: "Marketplace"
  },
  {
    key: "curated_match",
    en: "Curated Match",
    om: "Waliin Deemu",
    am: "የተመረጠ ግጥሚያ",
    category: "Marketplace"
  },
  {
    key: "recent_offers",
    en: "Recent offers",
    om: "Dhiyeessii dhiyoo",
    am: "የቅርብ ጊዜ ቅናሾች",
    category: "Marketplace"
  },
  {
    key: "sponsored",
    en: "Sponsored",
    om: "Ispeensar kan godhame",
    am: "ስፖንሰር የተደረገ",
    category: "Marketplace"
  },
  {
    key: "visit_offer",
    en: "Visit Offer",
    om: "Dhiyeessii Daawwadhu",
    am: "ቅናሹን ይጎብኙ",
    category: "Marketplace"
  },
  {
    key: "safety_guidelines",
    en: "Safety Guidelines",
    om: "Qajeelfama Nageenyaa",
    am: "የደህንነት መመሪያዎች",
    category: "Marketplace"
  },
  {
    key: "safety_tip_1",
    en: "Always meet owners/sellers in secure, public, and well-lit coordinates.",
    om: "Yeroo mara abbootii qabeenyaa/gurgurtoota naannoo nageenya qabuu fi ifa ta'etti walargaa.",
    am: "ሁልጊዜ ከባለቤቶች/ሻጮች ጋር ደህንነቱ በተጠቀቀ፣ ይፋዊ እና በቂ ብርሃን ባለበት ቦታ ይገናኙ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_2",
    en: "Verify official government owner certificates, registration papers, and identity documents before wire transfer payments.",
    om: "Waraqaa eenyummaa fi ragaawwan seeraa abbaa qabeenyummaa mirkaneeffadhaa.",
    am: "ከክፍያ በፊት ይፋዊ የመንግስት የባለቤትነት ማረጋገጫ ምስክር ወረቀቶችን፣ የምዝገባ ወረቀቶችን እና የማንነት ሰነዶችን ያረጋግጡ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_3_html",
    en: "Utilize our Administrative Receipt Verification Desk for fully tracked premium services.",
    om: "Kafaltii dhiyeessii keessaniif Mana Mirkaneessaa Risiitii keenya dhimma bahaa.",
    am: "ለተሟላ ክትትል የእኛን የክፍያ ደረሰኝ ማረጋገጫ ክፍል ይጠቀሙ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_4",
    en: "Report suspicious postings, duplicate profiles, or user activities instantly via the reporting console flag.",
    om: "Beeksisa ykn gocha shakkisiisaa ta'e battalatti gabaasaa.",
    am: "አጠራጣሪ ማስታወቂያዎችን፣ የተደገሙ መገለጫዎችን ወይም የተጠቃሚ እንቅስቃሴዎችን ወዲያውኑ ሪፖርት ያድርጉ።",
    category: "Marketplace"
  },
  {
    key: "bed_unit",
    en: "Bed",
    om: "Siree",
    am: "አልጋ",
    category: "Marketplace"
  },
  {
    key: "bath_unit",
    en: "Bath",
    om: "Kutaa Dhiqannaa",
    am: "መታጠቢያ",
    category: "Marketplace"
  },
  {
    key: "share_listing",
    en: "Share listing",
    om: "Beeksisa Qoodi",
    am: "ማስታወቂያ ያጋሩ",
    category: "Details"
  },
  {
    key: "copied",
    en: "Copied!",
    om: "Garagalfameera!",
    am: "ተገልብጧል!",
    category: "Details"
  },
  {
    key: "copy_link",
    en: "Copy Link",
    om: "Liinkii Garagalchi",
    am: "ሊንክ ኮፒ አድርግ",
    category: "Details"
  },
  {
    key: "share_whatsapp",
    en: "Share on WhatsApp",
    om: "WhatsApp irratti qoodi",
    am: "በዋትስአፕ ያጋሩ",
    category: "Details"
  },
  {
    key: "about_property",
    en: "About this property",
    om: "Waa'ee qabeenya kanaa",
    am: "ስለዚህ ንብረት",
    category: "Details"
  },
  {
    key: "amenities_features",
    en: "Amenities & Features",
    om: "Tajaajiloota & Amaloota",
    am: "መገልገያዎች እና ባህሪያት",
    category: "Details"
  },
  {
    key: "location_on_map",
    en: "Location on Map",
    om: "Bakka Kaartaa Irratti",
    am: "ቦታ በካርታ ላይ",
    category: "Details"
  },
  {
    key: "owner_contact",
    en: "Owner Contact",
    om: "Quunnamtii Abbaa Qabeenyaa",
    am: "የንብረቱ ባለቤት እውቂያ",
    category: "Details"
  },
  {
    key: "registered_partner",
    en: "Registered Partner",
    om: "Michuu Galmeeffame",
    am: "የተመዘገበ አጋር",
    category: "Details"
  },
  {
    key: "send_inquiry",
    en: "Send Inquiry",
    om: "Gaaffii Ergi",
    am: "ጥያቄ ይላኩ",
    category: "Details"
  },
  {
    key: "inquiry_helper",
    en: "Direct message the property manager or request a callback.",
    om: "Abbaa qabeenyaatti dhimma kana irratti battalatti barreessi.",
    am: "ለንብረቱ አስተዳዳሪ ቀጥታ መልዕክት ይላኩ ወይም ስልክ እንዲደወልልዎ ይጠይቁ።",
    category: "Details"
  },
  {
    key: "inquiry_success",
    en: "Inquiry sent successfully! The owner will be notified.",
    om: "Gaaffiin kee milkiidhaan ergameera! Abbaan qabeenichaa ni beeksifama.",
    am: "ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ባለቤቱ ማሳወቂያ ይደርሰዋል።",
    category: "Details"
  },
  {
    key: "inquiry_placeholder",
    en: "I am interested in this listing. Can we schedule a physical visit?",
    om: "Waa'ee beeksisa kanaa beekuu barbaada. Bakka qabeenichaa deemnee arguuf yoom mijata?",
    am: "ስለዚህ ማስታወቂያ ማወቅ እፈልጋለሁ። ንብረቱን በአካል መጎብኘት እንችላለን?",
    category: "Details"
  },
  {
    key: "sending",
    en: "Sending...",
    om: "Ergamaa jira...",
    am: "በመላክ ላይ...",
    category: "General"
  },
  {
    key: "submit_inquiry",
    en: "Submit Inquiry",
    om: "Gaaffii Ergi",
    am: "ጥያቄ ያስገቡ",
    category: "Details"
  },
  {
    key: "login_to_message",
    en: "Please register or log in to message the seller.",
    om: "Gurguricha quunnamuuf maaloo dura galmee ykn seenaa taasisaa.",
    am: "ሻጩን ለማነጋገር እባክዎ አስቀድመው ይመዝገቡ ወይም ይግቡ።",
    category: "Details"
  },
  {
    key: "report_suspicious",
    en: "Report suspicious listing",
    om: "Beeksisa shakki qabu gabaasi",
    am: "አጠራጣሪ ማስታወቂያ ሪፖርት ያድርጉ",
    category: "Details"
  },
  {
    key: "new_notification_suffix",
    en: "new",
    om: "haaraa",
    am: "አዲስ",
    category: "Dashboard"
  },
  {
    key: "no_notifications_yet",
    en: "No notifications yet",
    om: "Beeksisa haaraa hin qabdu",
    am: "እስካሁን ምንም ማሳወቂያ የለም",
    category: "Dashboard"
  },
  {
    key: "role_admin_badge",
    en: "Admin",
    om: "Bulchaa",
    am: "አስተዳዳሪ",
    category: "Dashboard"
  },
  {
    key: "role_agent_badge",
    en: "Agent / User",
    om: "Ejentii / Fayyadamaa",
    am: "ወኪል / ተጠቃሚ",
    category: "Dashboard"
  },
  {
    key: "report_listing_user",
    en: "Report Listing / User",
    om: "Gabaasa Qabeenyaa / Fayyadamaa",
    am: "ንብረት / ተጠቃሚ ሪፖርት ያድርጉ",
    category: "General"
  },
  {
    key: "select_reason",
    en: "Select Reason",
    om: "Sababa Filadhu",
    am: "ምክንያት ይምረጡ",
    category: "General"
  },
  {
    key: "fraudulent_fake",
    en: "Fraudulent / Fake Listing",
    om: "Qabeenya Soba",
    am: "የማጭበርበር / የሐሰት ንብረት",
    category: "General"
  },
  {
    key: "incorrect_specs",
    en: "Incorrect Price / Specifications",
    om: "Gatii ykn Ibsa Soba",
    am: "ትክክለኛ ያልሆነ ዋጋ / ዝርዝር",
    category: "General"
  },
  {
    key: "inappropriate_behavior",
    en: "Inappropriate / Unsafe messaging behavior",
    om: "Ergaa Amala Hin Taane",
    am: "ተገቢ ያልሆነ / አደገኛ የመልዕክት ባህሪ",
    category: "General"
  },
  {
    key: "other_violations",
    en: "Other Violations",
    om: "Cabsa Biroo",
    am: "ሌሎች ጥሰቶች",
    category: "General"
  },
  {
    key: "describe_violation",
    en: "Describe violation context *",
    om: "Haala Cabsa Ibsi *",
    am: "የጥሰቱን ሁኔታ ይግለጹ *",
    category: "General"
  },
  {
    key: "violation_placeholder",
    en: "Provide specific parameters of fraudulent behaviors.",
    om: "Qunnamtii fi amala sobaa ibsi.",
    am: "ስለ ማጭበርበሩ ዝርዝር ሁኔታዎችን ያቅርቡ።",
    category: "General"
  },
  {
    key: "submitting_report",
    en: "Logging...",
    om: "Ergamaa Jira...",
    am: "በመመዝገብ ላይ...",
    category: "General"
  },
  {
    key: "submit_report",
    en: "Submit",
    om: "Ergi",
    am: "ላክ",
    category: "General"
  },
  {
    key: "splash_tagline",
    en: "Explore high-value real estate properties, premium jobs, and certified legal & home services. Verified secure payments with instant receipt tracking.",
    om: "Qabeenya, hojiiwwan gaarii, fi tajaajila seeraa fi manaa beekamtii qaban hordofaa. Kafaltiiwwan amansiisoo risiitii hordofni battalatti qabaniin.",
    am: "ከፍተኛ ዋጋ ያላቸውን የሪል እስቴት ንብረቶች፣ ምርጥ ስራዎችን እና የተረጋገጡ የህግ እና የቤት አገልግሎቶችን ያስሱ። ፈጣን የደረሰኝ ክትትል ያላቸው የተረጋገጡ አስተማማኝ ክፍያዎች።",
    category: "Welcome"
  },
  {
    key: "verified_listings_title",
    en: "Verified Listings",
    om: "Galmeewwan Mirkanaa'an",
    am: "የተረጋገጡ ንብረቶች",
    category: "Welcome"
  },
  {
    key: "verified_listings_desc",
    en: "Only authenticated and moderated listings allowed.",
    om: "Galmeewwan mirkanaa’anii fi to’ataman qofatu hayyamama.",
    am: "የተረጋገጡ እና በአወያይ የተፈቀዱ ንብረቶች ብቻ ይፈቀዳሉ።",
    category: "Welcome"
  },
  {
    key: "secure_payments_title",
    en: "Escrow System",
    om: "Sirna Kafaltii Amansiisaa",
    am: "የአስተማማኝ ክፍያ ስርዓት",
    category: "Welcome"
  },
  {
    key: "secure_payments_desc",
    en: "Payment receipts are approved directly by admin board.",
    om: "Risiitiwwan kafaltii kallattiin koree bulchiinsaan mirkanaa’u.",
    am: "የክፍያ ደረሰኞች በቀጥታ በአስተዳዳሪ ቦርድ ይጸድቃሉ።",
    category: "Welcome"
  },
  {
    key: "sign_in_account_title",
    en: "Sign In to Your Account",
    om: "Gara Akawuntii Keetti Seeni",
    am: "ወደ መለያዎ ይግቡ",
    category: "Auth"
  },
  {
    key: "create_new_profile_title",
    en: "Create New Profile",
    om: "Profaayilii Haaraa Uumi",
    am: "አዲስ መገለጫ ይፍጠሩ",
    category: "Auth"
  },
  {
    key: "register_uppercase",
    en: "Register",
    om: "Galmee",
    am: "ይመዝገቡ",
    category: "Auth"
  },
  {
    key: "all_rights_reserved",
    en: "Sof-Umer Ecosystem • All Rights Reserved",
    om: "Sirna Sof-Umer • Mirgi Hundu Kan Eegameedha",
    am: "ሶፍ-ኡመር ስነ-ምህዳር • መብቱ በህግ የተጠበቀ ነው",
    category: "Welcome"
  },
  {
    key: "remember_me",
    en: "Remember me on this device",
    om: "Meeshaa kana irratti na yaadadhu",
    am: "በዚህ መሣሪያ ላይ አስታውሰኝ",
    category: "Auth"
  },
  {
    key: "authenticating",
    en: "Authenticating...",
    om: "Mirkaneessaa Jira...",
    am: "እያረጋገጠ ነው...",
    category: "Auth"
  },
  {
    key: "password_strength_label",
    en: "Password Strength:",
    om: "Cimina Jecha Icchitii:",
    am: "የይለፍ ቃል ጥንካሬ:",
    category: "Auth"
  },
  {
    key: "password_strength_requirement",
    en: "Requires at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.",
    om: "Yoo xiqqaate qubee 8, qubee guddaa 1, qubee xiqqaa 1, lakkoofsa 1 fi mallattoo addaa 1 gaafata.",
    am: "ቢያንስ 8 ቁምፊዎች፣ 1 ታላቅ ፊደል፣ 1 ታናሽ ፊደል፣ 1 ቁጥር እና 1 ልዩ ምልክት ያስፈልጋል።",
    category: "Auth"
  },
  {
    key: "creating_profile",
    en: "Creating Profile...",
    om: "Profaayilii Uumaa Jira...",
    am: "መገለጫ በመፍጠር ላይ...",
    category: "Auth"
  },
  {
    key: "developer_code",
    en: "Developer Code",
    om: "Koodii Developeraa",
    am: "የገንቢ ኮድ",
    category: "Auth"
  },
  {
    key: "developer_code_desc",
    en: "Use this code directly to verify this profile instantly.",
    om: "Koodii kanaan kallattiin dhiyeenyatti profaayilii kee mirkaneessi.",
    am: "ይህንን ኮድ በመጠቀም መለያዎን ወዲያውኑ ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "digit_6_code_label",
    en: "6-Digit Verification Code",
    om: "Koodii Mirkaneessaa Digit-6",
    am: "ባለ 6-አሃዝ የማረጋገጫ ኮድ",
    category: "Auth"
  },
  {
    key: "activating_account",
    en: "Activating account...",
    om: "Akawuntii banaa jira...",
    am: "መለያ በመክፈት ላይ...",
    category: "Auth"
  },
  {
    key: "verify_and_activate",
    en: "Verify & Activate",
    om: "Mirkaneessi & Bani",
    am: "አረጋግጥ & አንቃ",
    category: "Auth"
  },
  {
    key: "registered_email_address",
    en: "Registered Email Address",
    om: "Imeelii Galmeeffame",
    am: "የተመዘገበ የኢሜል አድራሻ",
    category: "Auth"
  },
  {
    key: "generating_code",
    en: "Generating...",
    om: "Koodii Ergaa Jira...",
    am: "በማመንጨት ላይ...",
    category: "Auth"
  },
  {
    key: "dev_reset_code",
    en: "Developer Reset Code",
    om: "Koodii Haaromsaa Developeraa",
    am: "የገንቢ የይለፍ ቃል ማስreset ኮድ",
    category: "Auth"
  },
  {
    key: "dev_reset_code_desc",
    en: "Use this code directly in the code box below to reset password.",
    om: "Koodii kanaan gadiitti fayyadamanii jecha icchiitii haaromsi.",
    am: "የይለፍ ቃልዎን ለመቀየር ይህንን ኮድ ከታች ባለው ሳጥን ውስጥ በቀጥታ ይጠቀሙ።",
    category: "Auth"
  },
  {
    key: "reset_code_label",
    en: "Reset Code",
    om: "Koodii Haaromsaa",
    am: "የይለፍ ቃል መቀየሪያ ኮድ",
    category: "Auth"
  },
  {
    key: "saving",
    en: "Saving...",
    om: "Ol-kaayaa Jira...",
    am: "በማስቀመጥ ላይ...",
    category: "General"
  },
  {
    key: "report_success_msg",
    en: "Report logged successfully! Our moderator board will take corrective actions.",
    om: "Gabaasni kee milkaa'inaan galmaa'eera! Koreen keenya sirreessaa ni taasisa.",
    am: "ሪፖርቱ በተሳካ ሁኔታ ተመዝግቧል! የእኛ አወያይ ቦርድ የማስተካከያ እርምጃዎችን ይወስዳል።",
    category: "General"
  },
  {
    key: "report_intro_1",
    en: "You are filing an official safety complaint against {type} \"{name}\".",
    om: "Eebba nageenyaa seeraa irratti gabaasa dhiyeessaa jirta {type} \"{name}\" irratti.",
    am: "በዚህ {type} \"{name}\" ላይ ይፋዊ የደህንነት አቤቱታ እያቀረቡ ነው::",
    category: "General"
  },
  {
    key: "back_to_marketplace",
    en: "Back to Marketplace",
    om: "Gara Gabaatti Deebi'i",
    am: "ወደ ገበያ ይመለሱ",
    category: "General"
  },
  {
    key: "price",
    en: "Price",
    om: "Gatii",
    am: "ዋጋ",
    category: "General"
  },
  {
    key: "bedrooms",
    en: "Bedrooms",
    om: "Kuta Ciisichaa",
    am: "መኝታ ክፍሎች",
    category: "General"
  },
  {
    key: "bathrooms",
    en: "Bathrooms",
    om: "Kuta Dhiqannaa",
    am: "መታጠቢያ ክፍሎች",
    category: "General"
  },
  {
    key: "total_area",
    en: "Total Area",
    om: "Bal'ina Guutuu",
    am: "ጠቅላላ ስፋት",
    category: "General"
  },
  {
    key: "chat_reply_placeholder",
    en: "Type your reply...",
    om: "Ergaa kee asitti barreessi...",
    am: "መልስዎን እዚህ ይጻፉ...",
    category: "Dashboard"
  },
  {
    key: "select_chat_thread",
    en: "Select a conversation thread on the left to start chatting.",
    om: "Haasaa jalqabuuf bitaa irraa nama filadhu.",
    am: "ማውራት ለመጀመር በስተግራ ካሉት ንግግሮች አንዱን ይምረጡ።",
    category: "Dashboard"
  },
  {
    key: "notification_logs_desc",
    en: "Alert logs regarding approvals, chats, and listings.",
    om: "Gabaasa beeksisa mirkaneessaa, haasaa fi galmeewwanii.",
    am: "የማጽደቆች፣ ውይይቶች እና ማስታወቂያዎች ማሳወቂያዎች።",
    category: "Dashboard"
  },
  {
    key: "no_notifications_found",
    en: "No notifications found",
    om: "Beeksisi argame hin jiru",
    am: "ምንም ማሳወቂያ አልተገኘም",
    category: "Dashboard"
  },
  {
    key: "active_admin_payment_methods",
    en: "Active Administrative Payment Methods",
    om: "Tarkaanfii Kafaltii Bulchiinsaa Hojjetan",
    am: "ንቁ የአስተዳደር ክፍያ ዘዴዎች",
    category: "Dashboard"
  },
  {
    key: "active_payment_methods_desc",
    en: "Showcasing payment configurations dynamically activated by our platform administrators. Unconfigured systems are hidden automatically.",
    om: "Kafaltiiwwan bulchiinsaan banaman dhiyeeffama. Isaan hin qophoofne ni dhokatu.",
    am: "በአስተዳዳሪዎቻችን በኩል የነቁ የክፍያ አማራጮችን ያሳያል። ያልተዋቀሩ አማራጮች ወዲያውኑ ይደብቃሉ።",
    category: "Dashboard"
  },
  {
    key: "no_active_payment_methods",
    en: "No active payment methods found. Please contact the administrator.",
    om: "Kafaltii hojjetu hin argamne. Maaloo bulchaa qunnamaa.",
    am: "ምንም ንቁ የክፍያ ዘዴዎች አልተገኙም። እባክዎን አስተዳዳሪውን ያነጋግሩ።",
    category: "Dashboard"
  },
  {
    key: "account_name_label",
    en: "Account Name",
    om: "Maqaa Akkaawuntii",
    am: "የአካውንት ስም",
    category: "Dashboard"
  },
  {
    key: "account_wallet_id_label",
    en: "Account / Wallet ID",
    om: "Akkaawuntii / Koodii Wallet",
    am: "የሂሳብ / የኪስ ቁጥር",
    category: "Dashboard"
  },
  {
    key: "admin_phone_label",
    en: "Admin Phone",
    om: "Bilbila Bulchaa",
    am: "የአስተዳዳሪ ስልክ",
    category: "Dashboard"
  },
  {
    key: "instructions_label",
    en: "Instructions:",
    om: "Qajeelfama:",
    am: "መመሪያዎች፡",
    category: "Dashboard"
  },
  {
    key: "submit_receipt_title",
    en: "Submit Transaction receipt / Proof",
    om: "Risiitii Kafaltii / Ragaa Ergi",
    am: "የክፍያ ደረሰኝ / ማስረጃ ያስገቡ",
    category: "Dashboard"
  },
  {
    key: "submit_receipt_desc",
    en: "Once submitted, our manual receipt desk will verify the slip and trigger approvals.",
    om: "Yoo ergite, mana mirkaneessaa keenyaan qoratamee ni mirkana'a.",
    am: "አንዴ ከገቡ በኋላ፣ የእኛ ደረሰኝ ማረጋገጫ ክፍል ደረሰኙን በማጣራት ያጸድቃል።",
    category: "Dashboard"
  },
  {
    key: "receipt_success_msg",
    en: "Payment receipt submitted successfully! Pending admin verification.",
    om: "Risiitiin kafaltii milkiidhaan dhiyaateera! Mirkaneessaa bulchaa eeggachaa jira.",
    am: "የክፍያ ደረሰኝ በተሳካ ሁኔታ ገብቷል! የአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ።",
    category: "Dashboard"
  },
  {
    key: "select_payment_method_label",
    en: "Select Payment Method",
    om: "Mala Kafaltii Filadhu",
    am: "የክፍያ ዘዴ ይምረጡ",
    category: "Dashboard"
  },
  {
    key: "select_active_wallet_option",
    en: "-- Select Active Bank/Wallet --",
    om: "-- Bankii/Wallet dammaqaa filadhu --",
    am: "-- ንቁ ባንክ/ዋሌት ይምረጡ --",
    category: "Dashboard"
  },
  {
    key: "select_target_property_label",
    en: "Select Target Property",
    om: "Beeksisa Targetii Filadhu",
    am: "ዒላማ ንብረት ይምረጡ",
    category: "Dashboard"
  },
  {
    key: "select_listing_context_option",
    en: "-- Select Listing context --",
    om: "-- Beeksisa filadhu --",
    am: "-- የማስታወቂያ አውድ ይምረጡ --",
    category: "Dashboard"
  },
  {
    key: "transferred_amount_label",
    en: "Transferred Amount",
    om: "Maallaqa Ergamu",
    am: "የተላለፈው የገንዘብ መጠን",
    category: "Dashboard"
  },
  {
    key: "receipt_screenshot_label",
    en: "Receipt reference slip screenshot",
    om: "Screenshot Risiitii Kafaltii",
    am: "የክፍያ ደረሰኝ ቅጽበታዊ ገጽ እይታ (Screenshot)",
    category: "Dashboard"
  },
  {
    key: "receipt_link_placeholder",
    en: "Paste Receipt Link or type CBE-TRX-1029472",
    om: "Liinkii Risiitii deebisi ykn barreessi CBE-TRX-1029472",
    am: "የደረሰኝ ሊንክ ያስገቡ ወይም CBE-TRX-1029472 ይጻፉ",
    category: "Dashboard"
  },
  {
    key: "simulate_upload_btn",
    en: "Simulate Upload",
    om: "Ol-feesa fakkeessi",
    am: "መጫንን አስመስል",
    category: "Dashboard"
  },
  {
    key: "uploading_proof_msg",
    en: "Uploading Proof...",
    om: "Ragaa Ol-feesaajira...",
    am: "ማስረጃ በመጫን ላይ...",
    category: "Dashboard"
  },
  {
    key: "submit_receipt_btn",
    en: "Submit Receipt to Verification Desk",
    om: "Risiitii Mana Mirkaneessaa Ergi",
    am: "ደረሰኝ ወደ ማረጋገጫ ክፍል ያስገቡ",
    category: "Dashboard"
  },
  {
    key: "payment_history_title",
    en: "Your Payment transaction history",
    om: "Gabaasa Kafaltii Keetii",
    am: "የእርስዎ የክፍያ ግብይት ታሪክ",
    category: "Dashboard"
  },
  {
    key: "method_name_th",
    en: "Method Name",
    om: "Maqaa Mala Kafaltii",
    am: "የአሰራር ዘዴ ስም",
    category: "Dashboard"
  },
  {
    key: "target_property_th",
    en: "Target Property",
    om: "Beeksisa Targetii",
    am: "ዒላማ ንብረት",
    category: "Dashboard"
  },
  {
    key: "amount_th",
    en: "Amount",
    om: "Gatii",
    am: "ገንዘብ መጠን",
    category: "Dashboard"
  },
  {
    key: "status_th",
    en: "Status",
    om: "Haala",
    am: "ሁኔታ",
    category: "Dashboard"
  },
  {
    key: "date_th",
    en: "Date",
    om: "Guyyaa",
    am: "ቀን",
    category: "Dashboard"
  },
  {
    key: "desk_notes_th",
    en: "Desk notes",
    om: "Yaada Mana Mirkaneessaa",
    am: "የቢሮ ማስታወሻዎች",
    category: "Dashboard"
  },
  {
    key: "no_transactions_msg",
    en: "No transactions yet. Complete transfers and submit screenshots.",
    om: "Kafaltii raawwatame hin jiru. Maaloo kafaltii raawwadhuu screenshot ergi.",
    am: "እስካሁን ምንም ግብይቶች የሉም። ዝውውሮችን ያጠናቅቁ እና ቅጽበታዊ ገጽ እይታዎችን ያስገቡ።",
    category: "Dashboard"
  },
  {
    key: "waiting_review_notes",
    en: "Waiting for review",
    om: "Mirkaneessaa eeggachaa jira",
    am: "ማረጋገጫ በመጠባበቅ ላይ",
    category: "Dashboard"
  },
  {
    key: "settings_tab_desc",
    en: "Manage notifications and regional parameters.",
    om: "Beeksisa fi dhimmoota naannoo to'adhu.",
    am: "ማሳወቂያዎችን እና አካባቢያዊ መለኪያዎችን ያስተዳድሩ።",
    category: "Dashboard"
  },
  {
    key: "email_notifications_setting",
    en: "Email Notifications",
    om: "Beeksisa Imeelii",
    am: "የኢሜይል ማሳወቂያዎች",
    category: "Dashboard"
  },
  {
    key: "receive_digests_setting",
    en: "Receive digests of inquiries",
    om: "Gabaasa gaaffiiwwanii fudhadhu",
    am: "የጥያቄዎችን ማጠቃለያ ይቀበሉ",
    category: "Dashboard"
  },
  {
    key: "two_factor_auth_setting",
    en: "Two-Factor Authentication",
    om: "Mirkaneessa Madaallii Lama",
    am: "ባለ ሁለት ደረጃ ማረጋገጫ",
    category: "Dashboard"
  },
  {
    key: "secure_logins_setting",
    en: "Secure logins with mobile code",
    om: "Seensa amansiisaa koodii bilbilaatiin",
    am: "በሞባይል ኮድ ደህንነቱ የተጠበቀ መግቢያ",
    category: "Dashboard"
  },
  {
    key: "auth_required_title",
    en: "Authentication Required",
    om: "Mirkaneessi Barbaachisaadha",
    am: "ማረጋገጫ ያስፈልጋል",
    category: "Dashboard"
  },
  {
    key: "auth_required_desc",
    en: "Please register or log in to view your user dashboard.",
    om: "Maaloo daashboordii fayyadamaa kee arguuf galmee uumi ykn seeni.",
    am: "እባክዎ የተጠቃሚ ዳሽቦርድዎን ለማየት ይመዝገቡ ወይም ይግቡ።",
    category: "Dashboard"
  },
  {
    key: "sign_in_now_btn",
    en: "Sign In Now",
    om: "Amma Seeni",
    am: "አሁን ይግቡ",
    category: "Dashboard"
  },
  {
    key: "profile_details_desc",
    en: "Keep your account listing coordinates accurate.",
    om: "Oof-gariinsa akakaawuntii kee sirrii taasisi.",
    am: "የመለያ መረጃዎን ትክክለኛነት ይጠብቁ።",
    category: "Dashboard"
  },
  {
    key: "profile_success_msg",
    en: "Profile updated successfully!",
    om: "Profaayiliin milkiidhaan haaromfameera!",
    am: "መገለጫው በተሳካ ሁኔታ ተሻሽሏል!",
    category: "Dashboard"
  },
  {
    key: "registered_email_label",
    en: "Registered Email",
    om: "Imeelii Galmeeffame",
    am: "የተመዘገበ ኢሜይል",
    category: "Dashboard"
  },
  {
    key: "full_name_label",
    en: "Full Name",
    om: "Maqaa Guutuu",
    am: "ሙሉ ስም",
    category: "Dashboard"
  },
  {
    key: "save_profile_updates_btn",
    en: "Save Profile Updates",
    om: "Oof-gariinsa Profaayilii Ol-kaa'i",
    am: "የመገለጫ ማሻሻያዎችን አስቀምጥ",
    category: "Dashboard"
  },
  {
    key: "verification_title",
    en: "Ownership & Seller Verification Badge",
    om: "Waraqaa Eenyummaa fi Mirkaneessa Abbaa Qabeenyummaa",
    am: "የባለቤትነት እና የሻጭ ማረጋገጫ ባጅ",
    category: "Dashboard"
  },
  {
    key: "verification_desc",
    en: "Submit your real estate credentials, land deed ownership ID, or corporate license. Once approved, you will get a Verified Badge on your listings and profile.",
    om: "Ragaa abbaa qabeenyummaa lafaa ykn hayyama daldalaa kee galchi. Yoo mirkanaa'e, mallattoo mirkanaa'aa ni argatta.",
    am: "የሪል እስቴት ማስረጃዎችን፣ የይዞታ ማረጋገጫ ካርታ ወይም የንግድ ፈቃድዎን ያስገቡ። አንዴ ሲፈቀድ፣ በማስታወቂያዎችዎ እና በመገለጫዎ ላይ የተረጋገጠ ባጅ ያገኛሉ።",
    category: "Dashboard"
  },
  {
    key: "account_verified_title",
    en: "Account Fully Verified",
    om: "Akkaawuntii Guutummaatti Mirkanaa'eera",
    am: "መለያው ሙሉ በሙሉ ተረጋግጧል",
    category: "Dashboard"
  },
  {
    key: "account_verified_desc",
    en: "Your official verified partner badge is active on the marketplace.",
    om: "Mallattoon hiriyummaa mirkanaa'aa kee gabaa irratti dammaqadha.",
    am: "የእርስዎ ይፋዊ የተረጋገጠ አጋር ባጅ በገበያው ላይ ገባሪ ነው።",
    category: "Dashboard"
  },
  {
    key: "documents_pending_title",
    en: "Documents Pending Verification",
    om: "Sanadoonni Mirkaneessaa Eeggachaa Jiru",
    am: "ሰነዶች ማረጋገጫ በመጠባበቅ ላይ ናቸው",
    category: "Dashboard"
  },
  {
    key: "documents_pending_desc",
    en: "Our admins are currently auditing your uploaded certificates.",
    om: "Bulchitoonni keenya ragaalee kee qorachaa jiru.",
    am: "አስተዳዳሪዎቻችን በአሁኑ ጊዜ የሰቀሏቸውን የምስክር ወረቀቶች እየገመገሙ ነው።",
    category: "Dashboard"
  },
  {
    key: "verif_success_msg",
    en: "Verification documents submitted. Our admins will review them shortly.",
    om: "Sanadoonni dhiyaatanii jiru. Bulchitoonni keenya dhiyootti ni qoratu.",
    am: "የማረጋገጫ ሰነዶች ገብተዋል። አስተዳዳሪዎቻችን በቅርቡ ይገመግሟቸዋል።",
    category: "Dashboard"
  },
  {
    key: "describe_ownership_label",
    en: "Describe Ownership Credentials & Paste Links/IDs",
    om: "Ragaalee Abbaa Qabeenyummaa Ibsi & Koodii/ID Barreessi",
    am: "የባለቤትነት ማረጋገጫዎችን ይግለጹ እና ሊንኮችን/መታወቂያዎችን ያስገቡ",
    category: "Dashboard"
  },
  {
    key: "describe_ownership_placeholder",
    en: "Addis Ababa Bole Deed Registration ID: 10928/3429. Attached property is listed under my registered company.",
    om: "Koodii galmee Deed Finfinnee Bole: 10928/3429. Qabeenyi kun maqaa kubbayya kiyyaatiin galmeeffameera.",
    am: "የአዲስ አበባ ቦሌ የካርታ ምዝገባ ቁጥር፡ 10928/3429። ንብረቱ በተመዘገበው ድርጅቴ ስር የተመዘገበ ነው።",
    category: "Dashboard"
  },
  {
    key: "uploading_docs_msg",
    en: "Uploading Documents...",
    om: "Sanadoota Ol-feesaajira...",
    am: "ሰነዶችን በመጫን ላይ...",
    category: "Dashboard"
  },
  {
    key: "submit_credentials_btn",
    en: "Submit Credentials",
    om: "Ragaalee Ergi",
    am: "ማስረጃዎችን ያስገቡ",
    category: "Dashboard"
  },
  {
    key: "your_conversations_title",
    en: "Your Conversations",
    om: "Waliin Haasaa Kee",
    am: "የእርስዎ ንግግሮች",
    category: "Dashboard"
  },
  {
    key: "no_messages_msg",
    en: "No messages yet",
    om: "Ergaan hin jiru",
    am: "እስካሁን ምንም መልእክት የለም",
    category: "Dashboard"
  },
  {
    key: "contact_prefix",
    en: "Contact: ",
    om: "Qunnamtii: ",
    am: "ዕውቂያ: ",
    category: "Dashboard"
  },
  {
    key: "owner_label",
    en: "Owner",
    om: "Abbaa Qabeenyaa",
    am: "ባለቤት",
    category: "Dashboard"
  },
  {
    key: "chat_session_prefix",
    en: "Chat Session: ",
    om: "Yeroo Haasaa: ",
    am: "የውይይት ክፍለ ጊዜ: ",
    category: "Dashboard"
  },
  {
    key: "auth_intro_desc",
    en: "Explore high-value real estate properties, premium jobs, and certified legal & home services. Verified secure payments with instant receipt tracking.",
    om: "Qabeenya manneen dhuunfaa fi bittaa, carraawwan hojii gaarii fi tajaajiloota seeraa fi mana keessaa mirkanaa’an tajaajiloota explore godhi. Kafaltii amansiisaa qorannoo risiitii saffisaa waliin.",
    am: "ከፍተኛ ዋጋ ያላቸውን የሪል እስቴት ንብረቶች፣ ዋና ዋና ስራዎች እና የተረጋገጡ የህግ እና የቤት አገልግሎቶችን ያስሱ። ፈጣን የደረሰኝ ክትትል ያላቸው የተረጋገጡ አስተማማኝ ክፍያዎች።",
    category: "Auth"
  },
  {
    key: "auth_regional_gateway",
    en: "Regional Gateway of East Africa",
    om: "Kellaa Naannoo Baha Afrikaa",
    am: "የምስራቅ አፍሪካ ቀጣናዊ መግቢያ በር",
    category: "Auth"
  },
  {
    key: "auth_connecting_markets",
    en: "Connecting Ethiopia's Finest Markets",
    om: "Gabaawwan Filatamoof Itiyoophiyaa Walitti Qabsiisuu",
    am: "የኢትዮጵያን ምርጥ ገበያዎች ማገናኘት",
    category: "Auth"
  },
  {
    key: "auth_verified_listings_title",
    en: "Verified Listings",
    om: "Galmeewwan Mirkanaa'an",
    am: "የተረጋገጡ ንብረቶች",
    category: "Auth"
  },
  {
    key: "auth_verified_listings_desc",
    en: "Only authenticated and moderated listings allowed.",
    om: "Galmeewwan mirkanaa’anii fi to’ataman qofatu hayyamama.",
    am: "የተረጋገጡ እና በአወያይ የተፈቀዱ ንብረቶች ብቻ ይፈቀዳሉ።",
    category: "Auth"
  },
  {
    key: "auth_secure_payment_title",
    en: "Escrow System",
    om: "Sirna Kafaltii Amansiisaa",
    am: "የአስተማማኝ ክፍያ ስርዓት",
    category: "Auth"
  },
  {
    key: "auth_secure_payment_desc",
    en: "Payment receipts are approved directly by admin board.",
    om: "Risiitiwwan kafaltii kallattiin koree bulchiinsaan mirkanaa’u.",
    am: "የክፍያ ደረሰኞች በቀጥታ በአስተዳዳሪ ቦርድ ይጸድቃሉ።",
    category: "Auth"
  },
  {
    key: "auth_sign_in_header",
    en: "Sign In to Your Account",
    om: "Gara Akawuntii Keetti Seeni",
    am: "ወደ መለያዎ ይግቡ",
    category: "Auth"
  },
  {
    key: "auth_create_profile_header",
    en: "Create New Profile",
    om: "Profaayilii Haaraa Uumi",
    am: "አዲስ መገለጫ ይፍጠሩ",
    category: "Auth"
  },
  {
    key: "auth_register_label",
    en: "Register",
    om: "Galmee",
    am: "ይመዝገቡ",
    category: "Auth"
  },
  {
    key: "auth_ecosystem_footer",
    en: "Sof-Umer Ecosystem • All Rights Reserved",
    om: "Sirna Sof-Umer • Mirgi Hundu Kan Eegameedha",
    am: "ሶፍ-ኡመር ስነ-ምህዳር • መብቱ በህግ የተጠበቀ ነው",
    category: "Auth"
  },
  {
    key: "auth_create_account_title",
    en: "Create Account",
    om: "Akawuntii Uumi",
    am: "መለያ ፍጠር",
    category: "Auth"
  },
  {
    key: "auth_verify_email_title",
    en: "Verify Your Email",
    om: "Imeelii Keetti Mirkaneessi",
    am: "ኢሜልዎን ያረጋግጡ",
    category: "Auth"
  },
  {
    key: "auth_verification_email_sent_prefix",
    en: "A secure 6-digit verification code was sent to ",
    om: "Koodiin mirkaneessaa digit-6 icciitii gara ",
    am: "ባለ 6 አሃዝ የደህንነት ማረጋገጫ ኮድ ወደ ",
    category: "Auth"
  },
  {
    key: "auth_verification_email_sent_suffix",
    en: ". Please enter it below to activate your account.",
    om: " ergameera. Akawuntii kee banuuf gadiitti galchi.",
    am: " ተልኳል። እባክዎን መለያዎን ለማንቃት ከታች ያስገቡት።",
    category: "Auth"
  },
  {
    key: "auth_set_new_password_title",
    en: "Set New Password",
    om: "Jecha Icchitii Haaraa Toftadhu",
    am: "አዲስ የይለፍ ቃል ያዘጋጁ",
    category: "Auth"
  },
  {
    key: "auth_join_desc",
    en: "Join Sof Umer regional digital marketplace",
    om: "Gabaa dijitaalaa naannoo Sof Umeritti makami",
    am: "የሶፍ ኡመር ቀጣናዊ ዲጂታል የገበያ ቦታን ይቀላቀሉ",
    category: "Auth"
  },
  {
    key: "auth_secure_code_desc",
    en: "Verify your registration with the secure code",
    om: "Koodii amanamaadhaan galmee kee mirkaneessi",
    am: "ምዝገባዎን በአስተማማኝ ኮድ ያረጋግጡ",
    category: "Auth"
  },
  {
    key: "auth_strong_password_desc",
    en: "Choose a strong, new password",
    om: "Jecha icciitii cimaa, haaraa filadhu",
    am: "ጠንካራ እና አዲስ የይለፍ ቃል ይምረጡ",
    category: "Auth"
  },
  {
    key: "auth_remember_me",
    en: "Remember me on this device",
    om: "Meeshaa kana irratti na yaadadhu",
    am: "በዚህ መሣሪያ ላይ አስታውሰኝ",
    category: "Auth"
  },
  {
    key: "auth_authenticating",
    en: "Authenticating...",
    om: "Mirkaneessaa Jira...",
    am: "እያረጋገጠ ነው...",
    category: "Auth"
  },
  {
    key: "auth_password_strength",
    en: "Password Strength:",
    om: "Cimina Jecha Icchitii:",
    am: "የይለፍ ቃል ጥንካሬ:",
    category: "Auth"
  },
  {
    key: "auth_password_requirements",
    en: "Requires at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.",
    om: "Yoo xiqqaate qubee 8, qubee guddaa 1, qubee xiqqaa 1, lakkoofsa 1 fi mallattoo addaa 1 gaafata.",
    am: "ቢያንስ 8 ቁምፊዎች፣ 1 ታላቅ ፊደል፣ 1 ታናሽ ፊደል፣ 1 ቁጥር እና 1 ልዩ ምልክት ያስፈልጋል።",
    category: "Auth"
  },
  {
    key: "auth_creating_profile",
    en: "Creating Profile...",
    om: "Profaayilii Uumaa Jira...",
    am: "መገለጫ በመፍጠር ላይ...",
    category: "Auth"
  },
  {
    key: "auth_dev_code_title",
    en: "Developer Code",
    om: "Koodii Developeraa",
    am: "የገንቢ ኮድ",
    category: "Auth"
  },
  {
    key: "auth_dev_code_desc",
    en: "Use this code directly to verify this profile instantly.",
    om: "Koodii kanaan kallattiin dhiyeenyatti profaayilii kee mirkaneessi.",
    am: "ይህንን ኮድ በመጠቀም መለያዎን ወዲያውኑ ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "auth_verification_code_label",
    en: "6-Digit Verification Code",
    om: "Koodii Mirkaneessaa Digit-6",
    am: "ባለ 6-አሃዝ የማረጋገጫ ኮድ",
    category: "Auth"
  },
  {
    key: "auth_activating_account",
    en: "Activating account...",
    om: "Akawuntii banaa jira...",
    am: "መለያ በመክፈት ላይ...",
    category: "Auth"
  },
  {
    key: "auth_verify_activate_btn",
    en: "Verify & Activate",
    om: "Mirkaneessi & Bani",
    am: "አረጋግጥ & አንቃ",
    category: "Auth"
  },
  {
    key: "auth_registered_email_address",
    en: "Registered Email Address",
    om: "Imeelii Galmeeffame",
    am: "የተመዘገበ የኢሜል አድራሻ",
    category: "Auth"
  },
  {
    key: "auth_cancel_btn",
    en: "Cancel",
    om: "Dhiisi",
    am: "ሰርዝ",
    category: "Auth"
  },
  {
    key: "auth_generating_code",
    en: "Generating...",
    om: "Koodii Ergaa Jira...",
    am: "በማመንጨት ላይ...",
    category: "Auth"
  },
  {
    key: "auth_dev_reset_code_title",
    en: "Developer Reset Code",
    om: "Koodii Haaromsaa Developeraa",
    am: "የገንቢ የይለፍ ቃል ማስreset ኮድ",
    category: "Auth"
  },
  {
    key: "auth_dev_reset_code_desc",
    en: "Use this code directly in the code box below to reset password.",
    om: "Koodii kanaan gadiitti fayyadamanii jecha icchiitii haaromsi.",
    am: "የይለፍ ቃልዎን ለመቀየር ይህንን ኮድ ከታች ባለው ሳጥን ውስጥ በቀጥታ ይጠቀሙ።",
    category: "Auth"
  },
  {
    key: "auth_reset_code_label",
    en: "Reset Code",
    om: "Koodii Haaromsaa",
    am: "የይለፍ ቃል መቀየሪያ ኮድ",
    category: "Auth"
  },
  {
    key: "auth_saving_btn",
    en: "Saving...",
    om: "Ol-kaayaa Jira...",
    am: "በማስቀመጥ ላይ...",
    category: "Auth"
  },
  {
    key: "auth_reset_password_btn",
    en: "Reset Password",
    om: "Jecha Icchitii Haaromsi",
    am: "የይለፍ ቃል ቀይር",
    category: "Auth"
  },
  {
    key: "auth_dont_have_account",
    en: "Don't have an account?",
    om: "Akawuntii hin qabduu?",
    am: "መለያ የለዎትም?",
    category: "Auth"
  },
  {
    key: "auth_create_one",
    en: "Create one",
    om: "Haaraa uumi",
    am: "አንድ ይፍጠሩ",
    category: "Auth"
  },
  {
    key: "auth_already_have_account",
    en: "Already have an account?",
    om: "Duraan akawuntii qabdaa?",
    am: "ቀደም ሲል መለያ አለዎት?",
    category: "Auth"
  },
  {
    key: "auth_sign_in_link",
    en: "Sign in",
    om: "Seeni",
    am: "ይግቡ",
    category: "Auth"
  },
  {
    key: "auth_back_to_sign_in",
    en: "Back to Sign In",
    om: "Gara Seensaa Deebi'i",
    am: "ወደ መግቢያው ይመለሱ",
    category: "Auth"
  },
  {
    key: "all_categories",
    en: "All Categories",
    om: "Kategorii Hundumaa",
    am: "ሁሉም ምድቦች",
    category: "Marketplace"
  },
  {
    key: "items_suffix",
    en: "items",
    om: "meeshotta",
    am: "ዕቃዎች",
    category: "Marketplace"
  },
  {
    key: "filters_btn",
    en: "Filters",
    om: "Gingilchaa",
    am: "ማጣሪያዎች",
    category: "Marketplace"
  },
  {
    key: "reset_btn",
    en: "Reset",
    om: "Deebisi",
    am: "ዳግም አስጀምር",
    category: "Marketplace"
  },
  {
    key: "all_transactions",
    en: "All Transactions",
    om: "Daldala Hundumaa",
    am: "ሁሉም ግብይቶች",
    category: "Marketplace"
  },
  {
    key: "all_types",
    en: "All Types",
    om: "Gosoota Hundumaa",
    am: "ሁሉም ዓይነቶች",
    category: "Marketplace"
  },
  {
    key: "all_locations",
    en: "All Cities / Regions",
    om: "Magaalota / Naannolee Hundumaa",
    am: "ሁሉም ከተሞች / ክልሎች",
    category: "Marketplace"
  },
  {
    key: "currency_status",
    en: "Currency Status",
    om: "Haala Maallaqaa",
    am: "የገንዘብ ሁኔታ",
    category: "Marketplace"
  },
  {
    key: "all_currencies",
    en: "All Currencies",
    om: "Maallaqa Hundumaa",
    am: "ሁሉም የገንዘብ ዓይነቶች",
    category: "Marketplace"
  },
  {
    key: "min_price",
    en: "Min Price",
    om: "Gatii Xiqqaa",
    am: "ዝቅተኛ ዋጋ",
    category: "Marketplace"
  },
  {
    key: "max_price",
    en: "Max Price",
    om: "Gatii Guddaa",
    am: "ከፍተኛ ዋጋ",
    category: "Marketplace"
  },
  {
    key: "any_value",
    en: "Any",
    om: "Kamiyyuu",
    am: "ማንኛውም",
    category: "Marketplace"
  },
  {
    key: "min_bedrooms",
    en: "Min Bedrooms",
    om: "Kutaa Ciisichaa",
    am: "ዝቅተኛ የመኝታ ክፍሎች",
    category: "Marketplace"
  },
  {
    key: "min_area",
    en: "Min Area (sqm)",
    om: "Bal'ina Xiqqaa (sqm)",
    am: "ዝቅተኛ ስፋት (ካሬ ሜትር)",
    category: "Marketplace"
  },
  {
    key: "no_listings_found",
    en: "No listings found matching parameters",
    om: "Beeksisa dhiyaate tokkollee hin argamne",
    am: "ከተመረጡት አማራጮች ጋር የሚዛመድ ንብረት አልተገኘም",
    category: "Marketplace"
  },
  {
    key: "no_listings_found_desc",
    en: "Try resetting search filters or using a broader area name.",
    om: "Gingilchaa barbaaddii deebisi ykn maqaa bal'aa dhimma bahi.",
    am: "እባክዎን ማጣሪያዎቹን ዳግም ያስጀምሩ ወይም ሌላ ቦታ ይፈልጉ።",
    category: "Marketplace"
  },
  {
    key: "verified_select_picks",
    en: "Verified Select Picks",
    om: "Filannoowwan Mirkanaa'an",
    am: "የተረጋገጡ ምርጥ ምርጫዎች",
    category: "Marketplace"
  },
  {
    key: "personalized_recommendation",
    en: "Personalized Recommendation",
    om: "Yaada Profaayilii Keetiin",
    am: "የግል ምክሮች",
    category: "Marketplace"
  },
  {
    key: "curated_match",
    en: "Curated Match",
    om: "Waliin Deemu",
    am: "የተመረጠ ግጥሚያ",
    category: "Marketplace"
  },
  {
    key: "recent_offers",
    en: "Recent offers",
    om: "Dhiyeessii dhiyoo",
    am: "የቅርብ ጊዜ ቅናሾች",
    category: "Marketplace"
  },
  {
    key: "sponsored",
    en: "Sponsored",
    om: "Ispeensar kan godhame",
    am: "ስፖንሰር የተደረገ",
    category: "Marketplace"
  },
  {
    key: "visit_offer",
    en: "Visit Offer",
    om: "Dhiyeessii Daawwadhu",
    am: "ቅናሹን ይጎብኙ",
    category: "Marketplace"
  },
  {
    key: "safety_guidelines",
    en: "Safety Guidelines",
    om: "Qajeelfama Nageenyaa",
    am: "የደህንነት መመሪያዎች",
    category: "Marketplace"
  },
  {
    key: "safety_tip_1",
    en: "Always meet owners/sellers in secure, public, and well-lit coordinates.",
    om: "Yeroo mara abbootii qabeenyaa/gurgurtoota naannoo nageenya qabuu fi ifa ta'etti walargaa.",
    am: "ሁልጊዜ ከባለቤቶች/ሻጮች ጋር ደህንነቱ በተጠቀቀ፣ ይፋዊ እና በቂ ብርሃን ባለበት ቦታ ይገናኙ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_2",
    en: "Verify official government owner certificates, registration papers, and identity documents before wire transfer payments.",
    om: "Waraqaa eenyummaa fi ragaawwan seeraa abbaa qabeenyummaa mirkaneeffadhaa.",
    am: "ከክፍያ በፊት ይፋዊ የመንግስት የባለቤትነት ማረጋገጫ ምስክር ወረቀቶችን፣ የምዝገባ ወረቀቶችን እና የማንነት ሰነዶችን ያረጋግጡ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_3_prefix",
    en: "Utilize our ",
    om: "Kafaltii dhiyeessii keessaniif ",
    am: "ለተሟላ ክትትል የእኛን ",
    category: "Marketplace"
  },
  {
    key: "safety_tip_3_highlight",
    en: "Administrative Receipt Verification Desk",
    om: "Mana Mirkaneessaa Risiitii",
    am: "የክፍያ ደረሰኝ ማረጋገጫ ክፍል",
    category: "Marketplace"
  },
  {
    key: "safety_tip_3_suffix",
    en: " for fully tracked premium services.",
    om: " keenya dhimma bahaa.",
    am: " ይጠቀሙ።",
    category: "Marketplace"
  },
  {
    key: "safety_tip_4",
    en: "Report suspicious postings, duplicate profiles, or user activities instantly via the reporting console flag.",
    om: "Beeksisa ykn gocha shakkisiisaa ta'e battalatti gabaasaa.",
    am: "አጠራጣሪ ማስታወቂያዎችን፣ የተደገሙ መገለጫዎችን ወይም የተጠቃሚ እንቅስቃሴዎችን ወዲያውኑ ሪፖርት ያድርጉ።",
    category: "Marketplace"
  },
  {
    key: "bed",
    en: "Bed",
    om: "Siree",
    am: "አልጋ",
    category: "Marketplace"
  },
  {
    key: "bath",
    en: "Bath",
    om: "Kutaa Dhiqannaa",
    am: "መታጠቢያ",
    category: "Marketplace"
  },
  {
    key: "details_btn",
    en: "Details",
    om: "Bal'ina",
    am: "ዝርዝሮች",
    category: "Marketplace"
  },
  {
    key: "weak_password",
    en: "Weak password",
    om: "Jecha Icchitii Lallafaa",
    am: "ደካማ የይለፍ ቃል",
    category: "Auth"
  },
  {
    key: "medium_password",
    en: "Medium strength password",
    om: "Jecha Icchitii Giddu-galeessa",
    am: "መካከለኛ የይለፍ ቃል",
    category: "Auth"
  },
  {
    key: "strong_password",
    en: "Strong, cryptographically secure password",
    om: "Jecha Icchitii Cimaa",
    am: "ጠንካራ የይለፍ ቃል",
    category: "Auth"
  },
  {
    key: "fill_all_fields",
    en: "Please fill in all fields.",
    om: "Maaloo maggaalota hundaa guutaa.",
    am: "እባክዎ ሁሉንም መስኮች ይሙሉ::",
    category: "Auth"
  },
  {
    key: "captcha_required",
    en: "CAPTCHA verification is required due to multiple failed login attempts.",
    om: "Mirkaneessi CAPTCHA yeroo baay'ee galmee dadhabuun dhufeef ni barbaachisa.",
    am: "በተደጋጋሚ በተሳሳተ ሙከራ ምክንያት የCAPTCHA ማረጋገጫ ያስፈልጋል።",
    category: "Auth"
  },
  {
    key: "verify_email_first",
    en: "Please verify your email address to log in.",
    om: "Maaloo seenuuf dura imeelii kee mirkaneessi.",
    am: "እባክዎ ለመግባት መጀመሪያ ኢሜልዎን ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "login_failed",
    en: "Login failed.",
    om: "Seenni hin milkoofne.",
    am: "መግባት አልተሳካም።",
    category: "Auth"
  },
  {
    key: "server_error_retry",
    en: "Server error. Please try again.",
    om: "Rakkina tajaajilaa. Maaloo irra deebi'ii yaali.",
    am: "የአገልጋይ ስህተት። እባክዎ እንደገና ይሞክሩ።",
    category: "Auth"
  },
  {
    key: "password_weak_error",
    en: "Your password is too weak. Please ensure it is at least 8 characters long and contains an uppercase letter, lowercase letter, number, and a special character.",
    om: "Jechi icciitii kee baay'ee lallafaadha. Maaloo yoo xiqqaate qubee 8, qubee guddaa 1, qubee xiqqaa 1, lakkoofsa 1 fi mallattoo addaa 1 qabaachuu mirkaneessi.",
    am: "የይለፍ ቃልዎ በጣም ደካማ ነው። እባክዎ ቢያንስ 8 ቁምፊዎች፣ 1 ታላቅ ፊደል፣ 1 ታናሽ ፊደል፣ 1 ቁጥር እና 1 ልዩ ምልክት መያዙን ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "registration_failed",
    en: "Registration failed.",
    om: "Galmeen hin milkoofne.",
    am: "ምዝገባ አልተሳካም።",
    category: "Auth"
  },
  {
    key: "profile_registered_success",
    en: "Profile registered successfully! A 6-digit verification code has been generated.",
    om: "Profaayiliin milkiidhaan galmeeffameera! Koodiin mirkaneessaa digit-6 uumameera.",
    am: "መገለጫው በተሳካ ሁኔታ ተመዝግቧል! ባለ 6-አሃዝ የማረጋገጫ ኮድ ተፈጥሯል።",
    category: "Auth"
  },
  {
    key: "server_error",
    en: "Server error.",
    om: "Rakkina tajaajilaa.",
    am: "የአገልጋይ ስህተት።",
    category: "Auth"
  },
  {
    key: "enter_verification_code",
    en: "Please enter the 6-digit verification code.",
    om: "Maaloo koodii mirkaneessaa digit-6 galchi.",
    am: "እባክዎ ባለ 6-አሃዝ የማረጋገጫ ኮዱን ያስገቡ።",
    category: "Auth"
  },
  {
    key: "verification_failed",
    en: "Verification failed. Please check your code.",
    om: "Mirkaneessi hin milkoofne. Maaloo koodii kee deebisii ilaali.",
    am: "ማረጋገጫው አልተሳካም። እባክዎ ኮዱን ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "email_verified_success",
    en: "Email verified successfully! Logging in...",
    om: "Imeeliin milkiidhaan mirkanaa'eera! Seenaa taasisaa jira...",
    am: "ኢሜልዎ በተሳካ ሁኔታ ተረጋግጧል! እየገባ ነው...",
    category: "Auth"
  },
  {
    key: "invalid_verification_code",
    en: "Invalid or expired verification code.",
    om: "Koodii mirkaneessaa sirrii hin taane ykn yeroon isaa darbe.",
    am: "ልክ ያልሆነ ወይም ጊዜው ያለፈበት የማረጋገጫ ኮድ።",
    category: "Auth"
  },
  {
    key: "enter_registered_email",
    en: "Please enter your registered email address.",
    om: "Maaloo imeelii kee isa galmeeffame galchi.",
    am: "እባክዎ የተመዘገበበትን የኢሜል አድራሻ ያስገቡ።",
    category: "Auth"
  },
  {
    key: "recovery_code_failed",
    en: "Requesting recovery code failed.",
    om: "Koodii haaromsaa gaafachuun hin milkoofne.",
    am: "የመልሶ ማግኛ ኮድ መጠየቅ አልተሳካም።",
    category: "Auth"
  },
  {
    key: "recovery_code_sent",
    en: "If this email exists in our records, a password reset code has been sent.",
    om: "Yoo imeeliin kun galmeeffamee jiraate, koodiin icciitii jijjiiruu itti ergameera.",
    am: "ይህ ኢሜይል በመዝገባችን ውስጥ ካለ፣ የይለፍ ቃል መቀየሪያ ኮድ ተልኳል።",
    category: "Auth"
  },
  {
    key: "passwords_dont_match",
    en: "Passwords do not match.",
    om: "Jechi icciitii lamaan wal hin fudhanne.",
    am: "የይለፍ ቃላቱ አይዛመዱም።",
    category: "Auth"
  },
  {
    key: "new_password_weak",
    en: "The new password is too weak. Please ensure it meets all complexity criteria.",
    om: "Jechi icciitii haaraan baay'ee lallafaadha. Amaloota barbaachisoo hundaa qabaachuu mirkaneessi.",
    am: "አዲሱ የይለፍ ቃል በጣም ደካማ ነው። ሁሉንም መስፈርቶች ማሟላቱን ያረጋግጡ።",
    category: "Auth"
  },
  {
    key: "password_reset_failed",
    en: "Resetting password failed.",
    om: "Jecha icciitii jijjiiruun hin milkoofne.",
    am: "የይለፍ ቃል መቀየር አልተሳካም።",
    category: "Auth"
  },
  {
    key: "password_reset_success",
    en: "Your password has been changed successfully! Redirecting to login...",
    om: "Jechi icciitii jijjiirameera! Gara seensatti dabarsaa jira...",
    am: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! ወደ መግቢያው እየመራንዎት ነው...",
    category: "Auth"
  },
  {
    key: "google_login_failed",
    en: "Google Sign-In failed.",
    om: "Seenni Google hin milkoofne.",
    am: "በGoogle መግባት አልተሳካም።",
    category: "Auth"
  },
  {
    key: "google_login_attempt_failed",
    en: "Google login attempt failed.",
    om: "Milkii seensa Google hin milkoofne.",
    am: "የGoogle መግባት ሙከራ አልተሳካም።",
    category: "Auth"
  },
  {
    key: "premier_portal_ethiopia",
    en: "The Premier Portal of Ethiopia",
    om: "Portali Olaanaa Itiyoophiyaa",
    am: "የኢትዮጵያ ቀዳሚ መግቢያ በር",
    category: "Welcome"
  },
  {
    key: "discover_refined_spaces",
    en: "Discover refined spaces, premium services, and curated job listings.",
    om: "Iddoowwan filatamoof qulqullina qaban, tajaajiloota ol’aanoof beeksisa hojii filataman argadhu.",
    am: "የተመረጡ ቦታዎችን፣ ከፍተኛ ጥራት ያላቸውን አገልግሎቶች እና የተመረጡ የስራ ማስታዋቂያዎችን ያግኙ።",
    category: "Welcome"
  },
  {
    key: "marketplace_category_label",
    en: "Marketplace Category *",
    om: "Ramaddii Gabaa *",
    am: "የገበያ ምድብ *",
    category: "CreateListing"
  },
  {
    key: "guideline_label",
    en: "Guideline:",
    om: "Hubachiisa:",
    am: "መመሪያ፦",
    category: "CreateListing"
  },
  {
    key: "guideline_properties",
    en: "Use this to list real estate: houses, villas, apartments, commercial offices, or land. Do not use this for jobs, services, or products.",
    om: "Gurgurtaa ykn kireessa manneenii, epartimantootaa fi lafaaf fayyadami. Hojii, tajaajila ykn meeshaaleef hin fayyadamin.",
    am: "ሪል እስቴትን ለመዘርዘር ይህንን ይጠቀሙ፡ ቤቶች፣ ቪላዎች፣ አፓርታማዎች፣ የንግድ ቢሮዎች ወይም መሬት። ለስራዎች፣ አገልግሎቶች ወይም ምርቶች አይጠቀሙበት።",
    category: "CreateListing"
  },
  {
    key: "guideline_jobs",
    en: "Use this to list job vacancies, career openings, employment, or freelance gigs. Do not use property/housing terms here.",
    om: "Barsiisa, carraa hojii ykn hojii dhuunfaa galchuuf fayyadami. Jechoota mana ykn qabeenyaa asitti hin fayyadamin.",
    am: "የስራ ክፍተቶችን፣ የስራ እድሎችን፣ ቅጥርን ወይም ፍሪላንስ ስራዎችን ለመዘርዘር ይህንን ይጠቀሙ። እዚህ የቤት ወይም የንብረት ቃላትን አይጠቀሙ።",
    category: "CreateListing"
  },
  {
    key: "guideline_services",
    en: "Use this to list professional services like plumbing, consulting, tech support, or tutoring. Explain the service scope.",
    om: "Tajaajiloota ogummaa kan akka bishaan hojjechuu, gorsa, deeggarsa teeknoolojii ykn barsiisa galchi. Scope tajaajilaa ibsi.",
    am: "እንደ ቧንቧ ስራ፣ ማማከር፣ የቴክኖሎጂ ድጋፍ ወይም ትምህርት ያሉ ሙያዊ አገልግሎቶችን ለመዘርዘር ይህንን ይጠቀሙ። የአገልግሎቱን ወሰን ያብራሩ።",
    category: "CreateListing"
  },
  {
    key: "guideline_products",
    en: "Use this to list goods, electronics, clothing, vehicles, crafts, or furniture. Specify the item's condition and price clearly.",
    om: "Meeshaalee, elektironiksii, uffata, konkolaataa ykn miyoota daldalaa galchuuf fayyadami. Haala fi gatii meeshichaa addaan baasi.",
    am: "እቃዎችን፣ ኤሌክትሮኒክስን፣ አልባሳትን፣ ተሽከርካሪዎችን፣ ጥበቦችን ወይም የቤት እቃዎችን ለመዘርዘር ይህንን ይጠቀሙ። የእቃውን ሁኔታ እና ዋጋ በግልፅ ይግለጹ።",
    category: "CreateListing"
  },
  {
    key: "guideline_local_businesses",
    en: "Use this to list local shops, restaurants, cafes, agencies, or retail centers. Provide address and business hours.",
    om: "Suuqii, mana nyaataa, kaaffee, ejensii ykn giddugala daldalaa naannoo galchi. Teessoo fi sa'aatii hojii dhiyeessi.",
    am: "የአካባቢ ሱቆችን፣ ሬስቶራንቶችን፣ ካፌዎችን፣ ኤጀንሲዎችን ወይም የችርቻሮ ማእከላትን ለመዘርዘር ይህንን ይጠቀሙ። አድራሻ እና የስራ ሰዓት ያቅርቡ።",
    category: "CreateListing"
  },
  {
    key: "guideline_community",
    en: "Use this to list events, social groups, local announcements, or community activities. Mention dates and locations.",
    om: "Taateewwan, gareewwan hawaasaa, beeksisa naannoo ykn sochiiwwan hawaasummaa galchi. Guyyaa fi bakka ibsi.",
    am: "ክስተቶችን፣ ማህበራዊ ቡድኖችን፣ የአካባቢ ማስታወቂያዎችን ወይም የማህበረሰብ እንቅስቃሴዎችን ለመዘርዘር ይህንን ይጠቀሙ። ቀኖችን እና ቦታዎችን ይጠቅሱ።",
    category: "CreateListing"
  },
  {
    key: "title_property_label",
    en: "Property Title *",
    om: "Mata Duree Qabeenyaa *",
    am: "የንብረት ርዕስ *",
    category: "CreateListing"
  },
  {
    key: "title_listing_label",
    en: "Listing Title *",
    om: "Mata Duree Beeksisaa *",
    am: "የማስታወቂያ ርዕስ *",
    category: "CreateListing"
  },
  {
    key: "placeholder_property_title",
    en: "e.g. Beautiful 4-Bedroom Villa in Bole",
    om: "fkn. Villa Bareedaa Kutaalee 4 Bolee",
    am: "ምሳሌ፦ ቦሌ የሚገኝ ባለ 4 መኝታ ክፍል የሚያምር ቪላ",
    category: "CreateListing"
  },
  {
    key: "placeholder_listing_title",
    en: "e.g. Graphic Design Services / Toyota Corolla 2022",
    om: "fkn. Tajaajila Diizaayinii ykn Toyota Corolla 2022",
    am: "ምሳሌ፦ የግራፊክስ ዲዛይን አገልግሎት / ቶዮታ ኮሮላ 2022",
    category: "CreateListing"
  },
  {
    key: "full_description_label",
    en: "Full Description *",
    om: "Ibsa Guutuu *",
    am: "ሙሉ መግለጫ *",
    category: "CreateListing"
  },
  {
    key: "placeholder_property_desc",
    en: "Provide a detailed layout of bedrooms, bathrooms, compounds, location and safety attributes.",
    om: "Ibsa guutuu kutaalee ciisichaa, kutaalee dhiqannaa, gadi-lakkisaa, bakka fi nageenya galchi.",
    am: "ስለ መኝታ ክፍሎች፣ መታጠቢያዎች፣ ግቢ፣ ቦታ እና ደህንነት ዝርዝር መግለጫ ያስገቡ።",
    category: "CreateListing"
  },
  {
    key: "placeholder_listing_desc",
    en: "Provide a detailed layout, features, specifications, or details about what is offered.",
    om: "Ibsa guutuu amala, specifications, ykn dhimma dhiyaate irratti galchi.",
    am: "ስለሚቀርበው ነገር ዝርዝር መግለጫ፣ ባህሪያት、 ዝርዝሮች ወይም መረጃዎችን ያስገቡ።",
    category: "CreateListing"
  },
  {
    key: "property_type_label",
    en: "Property Type *",
    om: "Gosa Qabeenyaa *",
    am: "የንብረት ዓይነት *",
    category: "CreateListing"
  },
  {
    key: "option_apartments",
    en: "Apartments",
    om: "Epartimantoota",
    am: "አፓርታማዎች",
    category: "CreateListing"
  },
  {
    key: "option_houses",
    en: "Houses",
    om: "Manneen",
    am: "ቤቶች",
    category: "CreateListing"
  },
  {
    key: "option_offices",
    en: "Offices",
    om: "Waajjiroota",
    am: "ቢሮዎች",
    category: "CreateListing"
  },
  {
    key: "option_commercial",
    en: "Commercial",
    om: "Daldalaa",
    am: "ንግድ ቤቶች",
    category: "CreateListing"
  },
  {
    key: "option_land",
    en: "Land",
    om: "Lafa",
    am: "መሬት",
    category: "CreateListing"
  },
  {
    key: "listing_category_label",
    en: "Listing Category *",
    om: "Ramaddii Beeksisaa *",
    am: "የማስታወቂያ ምድብ *",
    category: "CreateListing"
  },
  {
    key: "option_for_sale",
    en: "For Sale",
    om: "Gurgurtaadhaaf",
    am: "ለሽያጭ",
    category: "CreateListing"
  },
  {
    key: "option_for_rent",
    en: "For Rent",
    om: "Kiraayidhaaf",
    am: "ለኪራይ",
    category: "CreateListing"
  },
  {
    key: "price_label",
    en: "Price *",
    om: "Gatii *",
    am: "ዋጋ *",
    category: "CreateListing"
  },
  {
    key: "pricing_currency_label",
    en: "Pricing Currency *",
    om: "Gosa Maallaqaa *",
    am: "የክፍያ ገንዘብ አይነት *",
    category: "CreateListing"
  },
  {
    key: "currency_etb",
    en: "ETB (Ethiopian Birr)",
    om: "ETB (Birrii Itoophiyaa)",
    am: "ETB (የኢትዮጵያ ብር)",
    category: "CreateListing"
  },
  {
    key: "currency_usd",
    en: "USD (US Dollar)",
    om: "USD (Doolaarii)",
    am: "USD (የአሜሪካ ዶላር)",
    category: "CreateListing"
  },
  {
    key: "currency_sar",
    en: "SAR (Saudi Riyal)",
    om: "SAR (Riyaala)",
    am: "SAR (የሳዑዲ ሪያል)",
    category: "CreateListing"
  },
  {
    key: "currency_eur",
    en: "EUR (Euro)",
    om: "EUR (Yuuroo)",
    am: "EUR (ዩሮ)",
    category: "CreateListing"
  },
  {
    key: "currency_aed",
    en: "AED (UAE Dirham)",
    om: "AED (Dirhaamii)",
    am: "AED (የተባበሩት አረብ ኤምሬትስ ድርሃም)",
    category: "CreateListing"
  },
  {
    key: "bedrooms_label",
    en: "Bedrooms",
    om: "Kutaalee Ciisichaa",
    am: "መኝታ ክፍሎች",
    category: "CreateListing"
  },
  {
    key: "bathrooms_label",
    en: "Bathrooms",
    om: "Kutaalee Dhiqannaa",
    am: "የመታጠቢያ ክፍሎች",
    category: "CreateListing"
  },
  {
    key: "area_size_label",
    en: "Area Size (sqm) *",
    om: "Bal'ina Imeeraa (sqm) *",
    am: "የቦታ ስፋት (በካሬ ሜትር) *",
    category: "CreateListing"
  },
  {
    key: "specific_location_label",
    en: "Specific Location *",
    om: "Bakka Murtaa'e *",
    am: "የተወሰነ ቦታ *",
    category: "CreateListing"
  },
  {
    key: "placeholder_location",
    en: "e.g. Bole, Addis Ababa",
    om: "fkn. Bolee, Finfinnee",
    am: "ምሳሌ፦ ቦሌ፣ አዲስ አበባ",
    category: "CreateListing"
  },
  {
    key: "contact_phone_label",
    en: "Contact Phone *",
    om: "Bilbila Quunnamtii *",
    am: "የእውቂያ ስልክ ቁጥር *",
    category: "CreateListing"
  },
  {
    key: "owner_fullname_label",
    en: "Property Owner Full Name *",
    om: "Maqaa Guutuu Abbaa Qabeenyaa *",
    am: "የንብረት ባለቤት ሙሉ ስም *",
    category: "CreateListing"
  },
  {
    key: "placeholder_owner_name",
    en: "e.g. Lalisa Addisu",
    om: "fkn. Lalisaa Addisuu",
    am: "ምሳሌ፦ ላሊሳ አዲሱ",
    category: "CreateListing"
  },
  {
    key: "owner_email_label",
    en: "Property Owner Email *",
    om: "Imeeli Abbaa Qabeenyaa *",
    am: "የንብረት ባለቤት ኢሜይል *",
    category: "CreateListing"
  },
  {
    key: "images_showcase_label",
    en: "Property Images Showcase *",
    om: "Agarsiisa Fakkii Qabeenyaa *",
    am: "የንብረት ምስሎች ማሳያ *",
    category: "CreateListing"
  },
  {
    key: "add_image_device_btn",
    en: "Add Image from Phone or Camera",
    om: "Bilbila ykn Kaameraa irraa Fakkii Dabali",
    am: "ከስልክ ወይም ከካሜራ ምስል ያክሉ",
    category: "CreateListing"
  },
  {
    key: "quick_add_image_btn",
    en: "Quick Add Premium Image",
    om: "Fakkii Bareedaa Saffisaan Dabali",
    am: "ጥራት ያለው ምስል በፍጥነት ያክሉ",
    category: "CreateListing"
  },
  {
    key: "placeholder_image_url",
    en: "Paste Unsplash Image URL here",
    om: "Teessoo Fakkii Unsplash asitti barreessi",
    am: "የUnsplash ምስል አድራሻ እዚህ ይለጥፉ",
    category: "CreateListing"
  },
  {
    key: "add_image_btn",
    en: "Add Image",
    om: "Fakkii Dabali",
    am: "ምስል ያክሉ",
    category: "CreateListing"
  },
  {
    key: "publishing_progress",
    en: "Publishing...",
    om: "Gabaatti Bahaa jira...",
    am: "በማውጣት ላይ...",
    category: "CreateListing"
  },
  {
    key: "publish_listing_online",
    en: "Publish Listing Online",
    om: "Beeksisa Sarara Irratti Baasi",
    am: "ማስታወቂያውን በቀጥታ ያውጡ",
    category: "CreateListing"
  },
  {
    key: "publish_listing_instant_hint",
    en: "Clicking this button will instantly publish this property listing live on the Sof Umer digital marketplace.",
    om: "Fayyadama kana cuqaasuun beeksisa qabeenya keetii battalatti gabaa dijitaalaa Sof Umer irratti baasa.",
    am: "ይህን ቁልፍ ሲጫኑ የንብረትዎ ማስታወቂያ ወዲያውኑ በሶፍ ኡመር ዲጂታል ገበያ ላይ በቀጥታ ይወጣል።",
    category: "CreateListing"
  },
  {
    key: "saving_progress",
    en: "Publishing...",
    om: "Maxxanfamaa jira...",
    am: "በማውጣት ላይ...",
    category: "CreateListing"
  },
  {
    key: "cancel_btn",
    en: "Cancel",
    om: "Dhiisi",
    am: "ሰርዝ",
    category: "CreateListing"
  },
  {
    key: "publish_listing_btn",
    en: "Publish Listing",
    om: "Gabaatti Baasi",
    am: "ንብረቱን ያውጡ",
    category: "CreateListing"
  }
];

