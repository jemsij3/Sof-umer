import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { getCampaignStatusInfo } from '../utils/campaignUtils';
import { ReceiptUploadInput } from './ReceiptUploadInput';
import { 
  getMatchingSubcategoryId, 
  getTranslatedCategoryName, 
  getTranslatedSubcategoryName, 
  getTranslatedOption,
  getTranslatedFieldLabel
} from '../lib/categoriesData';
import { 
  X, Building, DollarSign, Plus, Trash2, Camera, Upload, Car, ShoppingBag, 
  Briefcase, Wrench, Calendar, Info, Check, ArrowRight, ArrowLeft, Eye, 
  Zap, Crown, ShieldCheck, CreditCard, Sparkles, Star, Tag, MapPin, Phone, User as UserIcon, Store, Package,
  Video, Film, Play, AlertCircle, Loader2, CheckCircle2, ArrowUp, ArrowDown
} from 'lucide-react';

interface CreateListingModalProps {
  onClose: () => void;
}

const DICTIONARY: Record<'en' | 'om' | 'am', Record<string, string>> = {
  en: {
    guideTitle: "Category Guidance",
    subcatTitle: "Subcategory Explanation",
    yes: "Yes",
    no: "No",
    catLabel: "Listing Category",
    catDesc: "Select the major category that matches what you are creating.",
    
    propGuide: "List houses, apartments, land, commercial buildings, offices, and rental properties.",
    vehGuide: "List cars, motorcycles, trucks, buses, agricultural vehicles, spare parts, and accessories.",
    prodGuide: "List new or used items available for sale.",
    jobGuide: "Create job vacancies, internships, freelance work, and recruitment listings.",
    srvGuide: "Advertise professional or local services offered by individuals or businesses.",
    bizGuide: "Register and promote verified businesses, shops, restaurants, hotels, and companies.",
    commGuide: "Share community announcements, local events, educational activities, charity programs, and public notices.",

    step1: "1. Category",
    step2: "2. Subcategory",
    step3: "3. Details & Photos",
    step4: "4. Preview Ad",
    step5: "5. Boost & Pay",

    subcatLabel: "Subcategory Type *",
    subcatDesc: "Choose the exact classification for your listing.",

    specHeader: "Specifications & Listing Details",
    specSubtext: "Please fill out all required attributes accurately to attract buyers.",

    adminOwnerTitle: "Property Owner Contact Details (Admin Entry)",
    adminOwnerDesc: "Enter the property owner's phone number and email so buyers contact the owner directly instead of admin.",
    ownerNameLabel: "Property Owner Name *",
    ownerPhoneLabel: "Property Owner Phone *",
    ownerEmailLabel: "Property Owner Email *",

    deviceUpload: "Device File Upload",
    deviceUploadSub: "Select JPEG/PNG photographs.",
    needStock: "Need stock photo?",
    addedPhotos: "Added Photos",

    previewHeader: "Live Ad Card Preview",
    previewSubtext: "Verify how buyers will view your listing.",
    untitled: "Untitled Listing",
    noLocation: "Location Not Specified",
    contactPrice: "Contact for Price",
    photosCount: "Photos",
    noDesc: "No description provided.",
    verifiedPublisher: "Verified Publisher",
    propOwnerRole: "Property Owner",

    boostTitle: "Select Promotion Boost Plan",
    boostSubtext: "Boost your ad visibility to sell or rent 5x faster on Sof Umer Marketplace.",

    addonsTitle: "Optional Visibility Add-ons",
    topAd: "Top Ad Placement",
    topAdDesc: "Pin to top of search results",
    spotlight: "Homepage Spotlight",
    spotlightDesc: "Featured on main home banner",

    totalInvestment: "Total Promotion Investment",
    totalInvestmentSub: "Includes plan duration and active add-ons.",

    payMethodLabel: "Select Payment Method *",
    accWallet: "Account Wallet",
    walletBal: "Balance:",
    directBank: "Direct Bank Transfer / Telebirr",
    directSub: "Upload transaction reference",
    yourBal: "Your Wallet Balance:",
    deduction: "Deduction Amount:",
    insufficientBal: "Insufficient wallet balance! Please switch to Direct Bank Transfer or Top Up your wallet.",
    sufficientBal: "Sufficient wallet balance. Payment will be processed instantly upon posting.",
    payChannel: "Select Payment Channel",
    payChannelPlaceholder: "Select Bank / Mobile Money Account...",
    txnRefLabel: "Transaction Reference Number / Receipt Ref *",
    txnRefPlaceholder: "e.g. TXN-89410294 or Telebirr Ref",
    txnRefSub: "Provide your mobile banking or Telebirr reference code for instant verification.",

    backBtn: "Back",
    chooseSubBtn: "Choose Subcategory",
    fillSpecsBtn: "Fill Specifications",
    previewAdBtn: "Preview Ad Card",
    selectPromoBtn: "Select Promotion & Post",
    pubFreeBtn: "Publish Ad For Free",
    payAndPostBtn: "Pay {cost} ETB & Post Ad",
    pubProgress: "Publishing Ad...",

    ownerNameVal: "Please enter the Property Owner's full name.",
    ownerPhoneVal: "Please enter the Property Owner's contact phone number.",
    ownerEmailVal: "Please enter the Property Owner's email address.",
    fieldReqVal: "Please fill in the required field:",

    titleLabel: "Listing Title",
    titleDesc: "Enter a short, clear, and descriptive title for your listing.",
    titlePlaceholder: "e.g., 3 Bedroom Modern House for Rent",
    titleVal: "Please enter a listing title.",

    descLabel: "Description",
    descDesc: "Provide comprehensive details about what you are listing.",
    descPlaceholder: "Describe key features, condition, benefits, and special terms...",
    descVal: "Please enter a description.",

    locLabel: "Location",
    locDesc: "Specify the exact address, neighborhood, or city location.",
    locPlaceholder: "e.g., Bole, Addis Ababa, Ethiopia",
    locVal: "Please specify the location.",

    priceLabel: "Price",
    priceDesc: "Set the monetary value or rate for the listing.",
    pricePlaceholder: "e.g., 15000",
    priceVal: "Please specify a price.",

    currLabel: "Currency",
    currDesc: "Select the primary billing currency.",

    phoneLabel: "Contact Phone Number",
    phoneDesc: "The primary phone number for inquiries.",
    phonePlaceholder: "e.g., +251911223344",
    phoneVal: "Please enter a contact phone number.",

    ownerLabel: "Contact Full Name",
    ownerDesc: "Enter the full name of the primary contact person.",
    ownerPlaceholder: "e.g., Jemal Jimma",
    ownerVal: "Please enter the contact name.",

    emailLabel: "Contact Email Address",
    emailDesc: "The email address for communications.",
    emailPlaceholder: "e.g., contact@sofumer.com",
    emailVal: "Please enter a valid email address.",

    dealLabel: "Transaction Type",
    dealDesc: "Are you selling or renting this property?",
    bedLabel: "Number of Bedrooms",
    bedDesc: "Count of sleep-ready rooms.",
    bathLabel: "Number of Bathrooms",
    bathDesc: "Count of bathrooms available.",
    areaLabel: "Total Area Size (m²)",
    areaDesc: "Total land or floor area in square meters.",
    areaVal: "Please enter the area size.",
    furLabel: "Furnished Status",
    furDesc: "Does it include furniture?",
    parkLabel: "Parking",
    parkDesc: "Is dedicated parking available?",
    ownLabel: "Ownership Status",
    ownDesc: "Status of the listing publisher.",

    brandLabel: "Brand",
    brandDesc: "The manufacturer of the item.",
    brandPlaceholder: "e.g., Toyota, Samsung, Nike",
    brandVal: "Please enter the brand.",
    modelLabel: "Model",
    modelDesc: "Specific model name or number.",
    modelPlaceholder: "e.g., Corolla, Galaxy S24, Air Max",
    modelVal: "Please enter the model.",
    yearLabel: "Year",
    yearDesc: "Manufacturing year.",
    yearPlaceholder: "e.g., 2024",
    yearVal: "Please enter the year.",
    mileLabel: "Mileage (km)",
    mileDesc: "Odometer reading of the vehicle.",
    milePlaceholder: "e.g., 15000",
    mileVal: "Please enter the mileage.",
    fuelLabel: "Fuel Type",
    fuelDesc: "Primary fuel source.",
    transLabel: "Transmission",
    transDesc: "Gearbox type.",
    engLabel: "Engine Size / CC",
    engDesc: "Engine displacement.",
    engPlaceholder: "e.g., 1.6L",
    engVal: "Please enter the engine size.",
    colLabel: "Color",
    colDesc: "Exterior or body color.",
    colPlaceholder: "e.g., Black",
    colVal: "Please enter the color.",
    condLabel: "Condition",
    condDesc: "Physical and functional state.",
    qtyLabel: "Quantity",
    qtyDesc: "Units currently in stock.",
    qtyPlaceholder: "e.g., 5",
    qtyVal: "Please enter the quantity.",
    warLabel: "Warranty",
    warDesc: "Is active warranty included?",

    compLabel: "Company Name",
    compDesc: "Hiring organization name.",
    compPlaceholder: "e.g., Sof Umer Real Estate",
    compVal: "Please enter the company name.",
    empLabel: "Employment Type",
    empDesc: "Schedule format.",
    salLabel: "Salary / Compensation",
    salDesc: "Proposed pay details.",
    salPlaceholder: "e.g., 40000 ETB",
    expLabel: "Experience Required",
    expDesc: "Required experience level.",
    expPlaceholder: "e.g., 2+ years",
    expVal: "Please enter required experience.",
    eduLabel: "Education",
    eduDesc: "Minimum qualification required.",
    eduPlaceholder: "e.g., Bachelor's Degree",
    eduVal: "Please enter education requirement.",
    deadLabel: "Application Deadline",
    deadDesc: "Final date to apply.",
    deadVal: "Please enter application deadline.",

    covLabel: "Coverage Area",
    covDesc: "Cities or regions served.",
    covPlaceholder: "e.g., Addis Ababa",
    covVal: "Please specify coverage area.",
    avLabel: "Availability",
    avDesc: "Working schedule format.",

    hoursLabel: "Opening Hours",
    hoursDesc: "Regular working schedule hours.",
    hoursPlaceholder: "e.g., Mon - Sat 8:00 AM - 6:00 PM",
    hoursVal: "Please enter opening hours.",
    webLabel: "Website (Optional)",
    webDesc: "Official website URL.",
    webPlaceholder: "e.g., https://sofumer.com",

    orgLabel: "Organizer",
    orgDesc: "Entity hosting the activity.",
    orgPlaceholder: "e.g., Bale Committee",
    orgVal: "Please enter the organizer.",
    venueLabel: "Venue",
    venueDesc: "Specific location of the activity.",
    venuePlaceholder: "e.g., Millennium Hall",
    venueVal: "Please enter the venue.",
    dateLabel: "Date",
    dateDesc: "Calendar day of the event.",
    dateVal: "Please enter the date.",
    timeLabel: "Time",
    timeDesc: "Activities start time.",
    timePlaceholder: "e.g., 10:00 AM",
    timeVal: "Please enter the time.",

    imgLabel: "Showcase Images",
    imgDesc: "Add photographs of the item/location.",
    imgUrlLabel: "Image Web URL",
    imgUrlPlaceholder: "Paste direct image link...",
    addBtn: "Add URL",
    uploadBtn: "From Device",
    quickBtn: "Stock Photo",
    cancelBtn: "Cancel",
    submitBtn: "Publish Listing",
    publishing: "Publishing Listing...",
    saving: "Saving Listing...",

    sub_properties_houses: "Residential single-family homes, multi-family homes, and townhouses.",
    sub_properties_apartments: "Rental apartments, flats, condominiums, and studios.",
    sub_properties_offices: "Commercial office spaces, corporate suites, and coworking locations.",
    sub_properties_commercial: "Retail shops, showrooms, warehouses, and factories.",
    sub_properties_land: "Residential, commercial, and agricultural plots of land.",
    sub_vehicles_cars: "Passenger cars, sedans, SUVs, hatchbacks, and coupes.",
    sub_vehicles_motorcycles: "Motorbikes, scooters, sports bikes, and three-wheelers.",
    sub_vehicles_trucks: "Cargo trucks, delivery vehicles, and heavy-duty logistics.",
    sub_vehicles_spareparts: "Engine parts, brakes, suspension, tires, and components.",
    sub_vehicles_accessories: "Car audio, seat covers, dash cams, and styling.",
    sub_products_electronics: "Laptops, computers, TVs, cameras, and audio equipment.",
    sub_products_phonesandtablets: "Smartphones, tablets, smartwatches, and accessories.",
    sub_products_furniture: "Home furniture, office desks, beds, and appliances.",
    sub_products_clothingandfashion: "Apparel, footwear, fashion accessories, and jewelry.",
    sub_products_others: "Books, toys, sports gear, and consumer goods.",
    sub_jobs_fulltime: "Standard full-time employment roles (35-40 hours per week).",
    sub_jobs_parttime: "Flexible part-time jobs with variable or fixed hours.",
    sub_jobs_internship: "Internship positions for students or recent graduates.",
    sub_jobs_freelance: "Contract-based, project-driven, or freelancer roles.",
    sub_services_homeservices: "Plumbing, electrical, painting, masonry, and carpentry.",
    sub_services_cleaningservices: "Residential cleaning, deep-cleaning, and sanitation.",
    sub_services_deliverymoving: "Courier services, package delivery, and moving.",
    sub_services_professionalservices: "Consulting, accounting, legal services, and translations.",
    sub_services_educationtraining: "Private tutors, school tutoring, and skills training.",
    sub_businesses_fooddrink: "Restaurants, cafes, bars, bakery shops, and food stalls.",
    sub_businesses_lodginghotels: "Hotels, guest houses, resort stays, and pensions.",
    sub_businesses_shoppingretail: "Supermarkets, retail stores, boutiques, and centers.",
    sub_businesses_others: "Local salons, workshops, travel agencies, and offices.",
    sub_community_events: "Concerts, conferences, local events, and exhibitions.",
    sub_community_announcements: "Public notices, community announcements, lost & found.",
    sub_community_charityvolunteering: "Fundraisers, charity programs, and volunteering."
  },
  om: {
    guideTitle: "Qajeelfama Garee",
    subcatTitle: "Ibsa Garee Xiqqaa",
    yes: "Eeyyee",
    no: "Lakki",
    catLabel: "Garee Beeksisaa",
    catDesc: "Garee guddaa beeksisa keetii wajjiin wal-simu filadhu.",

    propGuide: "Manneen, kireeffamu, lafa, ijaarsota daldalaa fi manneen qabeenyaa galmeessi.",
    vehGuide: "Konkolaattota, mootoroota, kutaalee mii'aa dabalataa fi konkolaattota qonnaa galmeessi.",
    prodGuide: "Meeshaalee haaraa ykn fayyadaman kan gurgurtaaf dhiyaatan galmeessi.",
    jobGuide: "Carraa hojii, shaakala, hojii dhuunfaa fi qaxara uumi.",
    srvGuide: "Tajaajila dhuunfaa ykn daldalaa beeksisi.",
    bizGuide: "Daldala, suuqota, nyaataa, hoteelota fi dhaabbata mirkanaa'an galmeessi.",
    commGuide: "Beeksisa hawaasaa, qophii, barumsaa fi gargaarsa hawaasaa ergi.",

    step1: "1. Garee Guddaa",
    step2: "2. Garee Xiqqaa",
    step3: "3. Tarreeffama & Fakkii",
    step4: "4. Beeksisa Ilaali",
    step5: "5. Beeksisa Guddisi & Kaffali",

    subcatLabel: "Gosa Garee Xiqqaa *",
    subcatDesc: "Akaakuu beeksisa keetii sirrii ta'e filadhu.",

    specHeader: "Tarreeffama & Ibsa Beeksisaa",
    specSubtext: "Bitoota harkisuudhaaf ulaagaalee barbaachisan guutuu galchi.",

    adminOwnerTitle: "Odeeffannoo Abbaa Qabeenyaa (Admin)",
    adminOwnerDesc: "Bitoonni abbaa qabeenyaa dhiyootti akka quunnamaniif lakk. bilbilaa fi imeelii galchi.",
    ownerNameLabel: "Maqaa Abbaa Qabeenyaa *",
    ownerPhoneLabel: "Bilbila Abbaa Qabeenyaa *",
    ownerEmailLabel: "Imeelii Abbaa Qabeenyaa *",

    deviceUpload: "Fakkii Moobaayilaa irraa Fe'i",
    deviceUploadSub: "Fakkoota JPEG/PNG filadhu.",
    needStock: "Fakkii naamuunaa barbaadaa?",
    addedPhotos: "Fakkoota Dabalaman",

    previewHeader: "Gargarsa Beeksisaa Qulqulluu",
    previewSubtext: "Bitoonni akkamitti beeksisa kee akka argan mirkaneeffadhu.",
    untitled: "Mata duree Malee",
    noLocation: "Iddoon Hin Murtaa'in",
    contactPrice: "Gatiidhaaf Quunnamii",
    photosCount: "Fakkoota",
    noDesc: "Ibsi Hin Kennamne.",
    verifiedPublisher: "Galmeessaa Mirkanaa'e",
    propOwnerRole: "Abbaa Qabeenyaa",

    boostTitle: "Karoora Beeksisa Guddisuu Filadhu",
    boostSubtext: "Argaamuu beeksisa keetii guddisuun dafee akka gurguramu ykn kireeffamu godhi.",

    addonsTitle: "Filannoo Dabaltaa Mul'inaa",
    topAd: "Gubaarra Maxxansuu",
    topAdDesc: "Barbaacha gubaarratti rarraasi",
    spotlight: "Fuula Jalqabaarratti Agarsiisi",
    spotlightDesc: "Banner fuula guddaarratti agarsiisi",

    totalInvestment: "Ida'ama Kaffaltii Beeksisaa",
    totalInvestmentSub: "Yeroo karooraa fi dabalata mul'inaa dabalata.",

    payMethodLabel: "Mala Kaffaltii Filadhu *",
    accWallet: "Kaffaltii Waletii",
    walletBal: "Hafee:",
    directBank: "Baankii ykn Telebirr Direct",
    directSub: "Koodii kaffaltii galchuun",
    yourBal: "Hafee Waletii Keetii:",
    deduction: "Hanga Hir'ifamu:",
    insufficientBal: "Hafteen saanduqa maallaqaa gahaa miti! Maaloo kaffaltii Baankii filadhu ykn Waletii kee gutadhu.",
    sufficientBal: "Hafteen saanduqa maallaqaa gahaadha. Kaffaltiin yeruma sana raawwatama.",
    payChannel: "Sarara Kaffaltii Filadhu",
    payChannelPlaceholder: "Akkaantaa Baankii ykn Mobile Money filadhu...",
    txnRefLabel: "Lakk. Koodii Kaffaltii / Telebirr Ref *",
    txnRefPlaceholder: "fkn TXN-89410294 ykn Telebirr Ref",
    txnRefSub: "Koodii kaffaltii baankii ykn Telebirr kee mirkaneessaaf galchi.",

    backBtn: "Deebi'i",
    chooseSubBtn: "Garee Xiqqaa Filadhu",
    fillSpecsBtn: "Tarreeffama Galchi",
    previewAdBtn: "Beeksisa Ilaali",
    selectPromoBtn: "Beeksisa Guddisi & Maxxansi",
    pubFreeBtn: "Beeksisa Bilisaan Maxxansi",
    payAndPostBtn: "{cost} ETB Kaffali & Maxxansi",
    pubProgress: "Maxxansaa Jira...",

    ownerNameVal: "Maaloo maqaa guutuu abbaa qabeenyaa galchi.",
    ownerPhoneVal: "Maaloo lakk. bilbila abbaa qabeenyaa galchi.",
    ownerEmailVal: "Maaloo imeelii abbaa qabeenyaa galchi.",
    fieldReqVal: "Maaloo dirree dirqamaa galchi:",

    titleLabel: "Mata duree Beeksisaa",
    titleDesc: "Mata duree gabaabaa, ifa ta'e fi ibsu galchi.",
    titlePlaceholder: "fkn, Mana Kireessu Kutta 3 qabu Boleetti",
    titleVal: "Maaloo mata duree beeksisaa galchi.",

    descLabel: "Ibsa Guutuu",
    descDesc: "Waa'ee meeshaa ykn qabeenya keetii ibsa bal'aa kenni.",
    descPlaceholder: "Haala meeshichaa, amala isaa, fi haalawwan addaa ibsi...",
    descVal: "Maaloo ibsa beeksisaa galchi.",

    locLabel: "Bakka Jireenyaa / Iddoo",
    locDesc: "Teessoo sirrii, naannoo, ykn magaalaa adda baasi.",
    locPlaceholder: "fkn, Bolee, Finfinnee, Itoophiyaa",
    locVal: "Maaloo iddoo beeksisaa galchi.",

    priceLabel: "Gatii",
    priceDesc: "Gatii ykn kaffaltii beeksisa kanaa murteessi.",
    pricePlaceholder: "fkn, 15000",
    priceVal: "Maaloo gatii galchi.",

    currLabel: "Maallaqa",
    currDesc: "Gosa maallaqaa kaffaltii filadhu.",

    phoneLabel: "Lakk. Bilbila Quunnamtii",
    phoneDesc: "Bilbila quunnamtii jalqabaa (koodii biyyaa wajjiin).",
    phonePlaceholder: "fkn, +251911223344",
    phoneVal: "Maaloo lakk. bilbila quunnamtii galchi.",

    ownerLabel: "Maqaa Guutuu Quunnamtii",
    ownerDesc: "Maqaa guutuu abbaa qabeenyaa ykn quunnamtii galchi.",
    ownerPlaceholder: "fkn, Jemal Jimma",
    ownerVal: "Maaloo maqaa guutuu galchi.",

    emailLabel: "Imeelii Quunnamtii",
    emailDesc: "Teessoo imeelii quunnamtiidhaaf gargaaru galchi.",
    emailPlaceholder: "fkn, contact@sofumer.com",
    emailVal: "Maaloo imeelii sirrii galchi.",

    dealLabel: "Gosa Daldalaa",
    dealDesc: "Qabeenya kana gurguruuf moo kireessuuf dhiyeessite?",
    bedLabel: "Baay'ina Kutaa Ciisichaa",
    bedDesc: "Baay'ina kutaa ciisichaa adda baasi (0 lafaaf).",
    bathLabel: "Baay'ina Kutaa Fincaanii",
    bathDesc: "Baay'ina kutaa fincaanii sirrii ta'e galchi.",
    areaLabel: "Bal'ina Lafa/Manaa (m²)",
    areaDesc: "Bal'ina guutuu iskuweer meetiriin galchi.",
    areaVal: "Maaloo bal'ina lafaa galchi.",
    furLabel: "Mi'aan Guutamuu",
    furDesc: "Manichi mi'a mana keessaa qabaa?",
    parkLabel: "Iddoo Konkolaataa",
    parkDesc: "Iddoon dhaabbannaa konkolaataa jiraa?",
    ownLabel: "Haala Abbummaa",
    ownDesc: "Gahee namicha beeksisa kana galche.",

    brandLabel: "Gosa Konkolaataa (Brand)",
    brandDesc: "Maqaa dhaabbata konkolaatichaa oomishe.",
    brandPlaceholder: "fkn, Toyota, Suzuki, Hyundai",
    brandVal: "Maaloo gosa konkolaatichaa galchi.",
    modelLabel: "Moodela Konkolaataa",
    modelDesc: "Maqaa moodela konkolaataa addaa.",
    modelPlaceholder: "fkn, Corolla, Swift, Tucson",
    modelVal: "Maaloo moodela konkolaataa galchi.",
    yearLabel: "Bara Oomishame",
    yearDesc: "Bara konkolaatichi itti oomishame.",
    yearPlaceholder: "fkn, 2024",
    yearVal: "Maaloo bara oomishame galchi.",
    mileLabel: "Kilomeetira Deeme (Mileage)",
    mileDesc: "Baay'ina kilomeetira konkolaatichi deeme.",
    milePlaceholder: "fkn, 12500",
    mileVal: "Maaloo kilomeetira deeme galchi.",
    fuelLabel: "Gosa Bifa Inerjii (Fuel)",
    fuelDesc: "Mootorri gosa boba'aa kam fayyadama?",
    transLabel: "Giraasii (Transmission)",
    transDesc: "Gosa daddabarsa humna konkolaatichaa.",
    engLabel: "Hafata Mootoraa (Engine Size)",
    engDesc: "Bal'ina mootora konkolaataa (fkn, 1.6L, 2000cc).",
    engPlaceholder: "fkn, 1.6L",
    engVal: "Maaloo hafata mootoraa galchi.",
    colLabel: "Bifa Konkolaataa alaa",
    colDesc: "Bifa guddaa qaama konkolaatichaa.",
    colPlaceholder: "fkn, Diimaa, Adii",
    colVal: "Maaloo bifa konkolaatichaa galchi.",
    condLabel: "Haala Meeshichaa",
    condDesc: "Meeshichi haaraa dhaa moo kan hojjetame?",
    qtyLabel: "Baay'ina Meeshichaa",
    qtyDesc: "Meeshaalee ammaan tana jiran kiyya.",
    qtyPlaceholder: "fkn, 5",
    qtyVal: "Maaloo baay'ina galchi.",
    warrantyLabel: "Wabii (Warranty)",
    warrantyDesc: "Wabiin gurgurataa ykn oomishaa jiraa?",

    compLabel: "Maqaa Dhaabbataa",
    compDesc: "Maqaa dhaabbata qaxaruu barbaaduu.",
    compPlaceholder: "fkn, Sof Umer Real Estate",
    compVal: "Maaloo maqaa dhaabbataa galchi.",
    empLabel: "Haala Hojii (Employment)",
    empDesc: "Gosa yeroo hojichaa.",
    salLabel: "Kaffaltii / Mindaa",
    salDesc: "Mindaa ji'aa ykn pirojektiidhaan kaffalamu.",
    salPlaceholder: "fkn, mindaa 40,000 ETB / ji'a",
    expLabel: "Yeroo Muuxannoo",
    expDesc: "Waggaa muuxannoo hojichaa barbaadamu.",
    expPlaceholder: "fkn, Waggaa 2+ muuxannoo",
    expVal: "Maaloo yeroo muuxannoo galchi.",
    eduLabel: "Sajataa Barnootaa",
    eduDesc: "Barnoota gadi aanaa barbaadamu.",
    eduPlaceholder: "fkn, Digrii marketing dhaan",
    eduVal: "Maaloo sajataa barnootaa galchi.",
    deadLabel: "Guyyaa Xumuraa Beeksisaa",
    deadDesc: "Guyyaa dhumaa iyyannoo fudhatamu.",
    deadVal: "Maaloo guyyaa xumuraa murteessi.",

    covLabel: "Iddoo Tajaajilichaa",
    covDesc: "Magaalota tajaajilli kee itti kennamu.",
    covPlaceholder: "fkn, Finfinnee fi naannoo ishee",
    covVal: "Maaloo iddoo tajaajilichaa galchi.",
    avLabel: "Yeroo Tajaajilaa",
    avDesc: "Yeroo hoji tajaajila keetii murteessi.",

    hoursLabel: "Yeroo Banamaa",
    hoursDesc: "Sa'aatii hojii daldala keetii.",
    hoursPlaceholder: "fkn, Wiixata - Sanbata (8:00 AM - 9:00 PM)",
    hoursVal: "Maaloo yeroo banamaa galchi.",
    webLabel: "Toora Website (Optional)",
    webDesc: "Linkii website daldala keetii.",
    webPlaceholder: "fkn, https://www.mybusiness.com",

    orgLabel: "Qopheessituu Sagantichaa",
    orgDesc: "Qaama saganticha qopheesse galchi.",
    orgPlaceholder: "fkn, Koree Seenaa Bale",
    orgVal: "Maaloo maqaa qopheessituu galchi.",
    venueLabel: "Iddoo Qophii (Venue)",
    venueDesc: "Gamoo ykn iddoo qophiin itti godhamu.",
    venuePlaceholder: "fkn, Millennium Hall, Finfinnee",
    venueVal: "Maaloo iddoo qophii galchi.",
    dateLabel: "Guyyaa Sagantichaa",
    dateDesc: "Guyyaa sagantichi itti ta'u.",
    dateVal: "Maaloo guyyaa sagantichaa galchi.",
    timeLabel: "Sa'aatii Sagantichaa",
    timeDesc: "Sa'aatii sagantichi itti jalqabu.",
    timePlaceholder: "fkn, 10:00 AM",
    timeVal: "Maaloo sa'aatii sagantichaa galchi.",

    imgLabel: "Fakkii Beeksisaa",
    imgDesc: "Fakkoota qulqullina qaban dabaladhaa.",
    imgUrlLabel: "URL Fakkii",
    imgUrlPlaceholder: "Linkii fakkichaa toora intarneetii irraa...",
    addBtn: "Dabaladhu",
    uploadBtn: "Moobaayila irraa",
    quickBtn: "Fakkii Naamuunaa",
    cancelBtn: "Haqi",
    submitBtn: "Beeksisa Maxxansi",
    publishing: "Maxxansaa jira...",
    saving: "Olkaa'aa jira...",

    sub_properties_houses: "Manneen jireenyaa dhuunfaa ykn maatii hedduuf ta'an.",
    sub_properties_apartments: "Apaartaamota kireeffaman fi manneen fooyya'an.",
    sub_properties_offices: "Iddoo barkumee daldalaa fi gamoo biroo.",
    sub_properties_commercial: "Suuqota, kuusaa meeshaa, fi warshaalee daldalaa.",
    sub_properties_land: "Iddoo jireenyaa, daldalaa, fi lafa qonnaa.",
    sub_vehicles_cars: "Konkolaattota dhuunfaa, sedan, SUV, fi kanneen biroo.",
    sub_vehicles_motorcycles: "Mootoroota, iskuutaroota fi saayikilii.",
    sub_vehicles_trucks: "Konkolaattota fe'umsaa, meeshaa geessan, fi gurguddaa.",
    sub_vehicles_spareparts: "Maashinaroota, taayirra, fi kutaalee mootoraa.",
    sub_vehicles_accessories: "Sagalee, uffata teessumaa, fi mi'a dabalataa.",
    sub_products_electronics: "Laaptooppii, kompiitara, TV, fi meeshaa sagalee.",
    sub_products_phonesandtablets: "Bilbiloota zamaanbillee, taableetii fi chaarjeroota.",
    sub_products_furniture: "Kofaa, siree, minjaala fi meeshaalee mana keessaa.",
    sub_products_clothingandfashion: "Uffata, kophee, fi faayoota adda addaa.",
    sub_products_others: "Kitaabota, taphoota mucoolii, fi meeshaalee biroo.",
    sub_jobs_fulltime: "Hojii yeroo guutuu (torbanitti sa'aatii 35-40).",
    sub_jobs_parttime: "Hojii yeroo gabaabaa sa'aatii muraasa qabu.",
    sub_jobs_internship: "Shaakala hojii barattoota ykn eebbifamtoota haaraaf.",
    sub_jobs_freelance: "Hojii dhuunfaa koontiraataan ykn pirojektiin hojjetamu.",
    sub_services_homeservices: "Tajaajila suuphaa ujummoo, elektiriikii, fi kkf.",
    sub_services_cleaningservices: "Qulqullina mana jireenyaa fi dhaabbata daldalaa.",
    sub_services_deliverymoving: "Ergama saffisaa, geessituu meeshaa fi geejjiba.",
    sub_services_professionalservices: "Gorsa seeraa, herregaa, hiikkaa, fi pirofeeshinaala.",
    sub_services_educationtraining: "Barsiisaa dhuunfaa, leenjii adda addaa fi kofii.",
    sub_businesses_fooddrink: "Nyaata, kaaffee, daabboo, fi suuqii nyaataa.",
    sub_businesses_lodginghotels: "Hoteelota, manneen keessummaa fi bultii.",
    sub_businesses_shoppingretail: "Suupermallii, suuqii uffataa, fi gabaalee daldalaa.",
    sub_businesses_others: "Saallonii bareedinaa, garaajii, fi biiroolee.",
    sub_community_events: "Qophii muuziqaa, konfiraansii, walga'ii, fi agarsiisa.",
    sub_community_announcements: "Beeksisa hawaasaa, meeshaa bade argame, fi of-eeggannoo.",
    sub_community_charityvolunteering: "Gargaarsa gandaa, arjooma, fi hojii tola ooltummaa."
  },
  am: {
    guideTitle: "የምድብ መመሪያ",
    subcatTitle: "የንዑስ ምድብ ማብራሪያ",
    yes: "አዎ",
    no: "አይደለም",
    catLabel: "የማስታወቂያ ምድብ",
    catDesc: "ለሚፈጥሩት ማስታወቂያ ትክክለኛውን ዋና ምድብ ይምረጡ።",

    propGuide: "ቤቶች፣ አፓርታማዎች፣ መሬቶች፣ የንግድ ህንፃዎች፣ ቢሮዎች እና የሚከራዩ ንብረቶችን ይዘርዝሩ።",
    vehGuide: "መኪናዎች፣ ሞተር ብስክሌቶች፣ የጭነት መኪናዎች፣ አውቶቡሶች፣ የእርሻ ተሽከርካሪዎች እና መለዋወጫዎችን ይዘርዝሩ።",
    prodGuide: "ለሽያጭ የሚቀርቡ አዳዲስ ወይም ያገለገሉ እቃዎችን ይዘርዝሩ።",
    jobGuide: "ክፍት የስራ መደቦች፣ የልምምድ ስራዎች፣ የፍሪላንስ ስራዎች እና የቀጥር ማስታወቂያዎችን ይፍጠሩ።",
    srvGuide: "በግለሰቦች ወይም በድርጅቶች የሚቀርቡ ሙያዊ ወይም የአካባቢ አገልግሎቶችን ያስተዋውቁ።",
    bizGuide: "የተረጋገጡ የንግድ ድርጅቶችን፣ ሱቆችን፣ ምግብ ቤቶችን፣ ሆቴሎችን እና ኩባንያዎችን ይመዝግቡ እና ያስተዋውቁ።",
    commGuide: "የማህበረሰብ ማስታወቂያዎችን፣ የአካባቢ ዝግጅቶችን፣ የትምህርት እንቅስቃሴዎችን፣ የበጎ አድራጎት ፕሮግራሞችን እና የህዝብ ማስታወቂያዎችን ያጋሩ።",

    step1: "1. ዋና ምድብ",
    step2: "2. ንዑስ ምድብ",
    step3: "3. ዝርዝር እና ፎቶ",
    step4: "4. ቅድመ እይታ",
    step5: "5. ማስተዋወቅ እና ክፍያ",

    subcatLabel: "የንዑስ ምድብ አይነት *",
    subcatDesc: "ለማስታወቂያዎ ትክክለኛውን ምድብ ይምረጡ።",

    specHeader: "ዝርዝሮች እና የማስታወቂያ መረጃ",
    specSubtext: "ገዢዎችን ለመሳብ ሁሉንም አስፈላጊ መረጃዎች በትክክል ይሙሉ::",

    adminOwnerTitle: "የንብረቱ ባለቤት መረጃ (የአድሚን መመዝገቢያ)",
    adminOwnerDesc: "ገዢዎች ባለቤቱን በቀጥታ እንዲያገኙት የባለቤቱን ስልክ እና ኢሜል ያስገቡ።",
    ownerNameLabel: "የባለቤቱ ሙሉ ስም *",
    ownerPhoneLabel: "የባለቤቱ ስልክ ቁጥር *",
    ownerEmailLabel: "የባለቤቱ ኢሜል አድራሻ *",

    deviceUpload: "ምስሎችን ከስልክዎ ይጫኑ",
    deviceUploadSub: "የJPEG/PNG ምስሎችን ይምረጡ።",
    needStock: "ናሙና ፎቶ ይፈልጋሉ?",
    addedPhotos: "የተጨመሩ ፎቶዎች",

    previewHeader: "የማስታወቂያው ቅድመ እይታ",
    previewSubtext: "ገዢዎች ማስታወቂያዎን እንዴት እንደሚያዩ ያረጋግጡ።",
    untitled: "ርዕስ የሌለው",
    noLocation: "ቦታ አልተጠቀሰም",
    contactPrice: "ለዋጋ ያነጋግሩ",
    photosCount: "ፎቶዎች",
    noDesc: "መግለጫ አልተሰጠም።",
    verifiedPublisher: "የተረጋገጠ አውጪ",
    propOwnerRole: "የንብረቱ ባለቤት",

    boostTitle: "የማስታወቂያ ማስተዋወቂያ ፕላን ይምረጡ",
    boostSubtext: "ማስታወቂያዎ በፍጥነት እንዲሸጥ ወይም እንዲከራይ እይታውን ያሳድጉ።",

    addonsTitle: "ተጨማሪ የመታየት አማራጮች",
    topAd: "በአናት ላይ የሚቀመጥ",
    topAdDesc: "በፍለጋ ውጤቶች አናት ላይ ያስቀምጡ",
    spotlight: "በመነሻ ገጽ ላይ አሳይ",
    spotlightDesc: "በዋናው መነሻ ባነር ላይ አሳይ",

    totalInvestment: "ጠቅላላ የማስተዋወቂያ ክፍያ",
    totalInvestmentSub: "የፕላኑን ጊዜ እና ተጨማሪ አማራጮችን ያካትታል።",

    payMethodLabel: "የክፍያ ዘዴ ይምረጡ *",
    accWallet: "የመለያ ቦርሳ (Wallet)",
    walletBal: "ቀሪ ሂሳብ:",
    directBank: "በቀጥታ በባንክ / በቴሌብር",
    directSub: "የክፍያ ማረጋገጫ ቁጥር ያስገቡ",
    yourBal: "የቦርሳዎ ቀሪ ሂሳብ:",
    deduction: "የሚቀነሰው መጠን:",
    insufficientBal: "በቂ የቦርሳ ሂሳብ የለም! እባክዎ በቀጥታ በባንክ ይክፈሉ::",
    sufficientBal: "በቂ ሂሳብ አለዎት። ክፍያው ወዲያውኑ ይፈጸማል።",
    payChannel: "የክፍያ መስመር ይምረጡ",
    payChannelPlaceholder: "የባንክ ወይም ሞባይል ባንኪንግ መለያ ይምረጡ...",
    txnRefLabel: "የክፍያ ማረጋገጫ ቁጥር (Reference) *",
    txnRefPlaceholder: "ምሳሌ: TXN-89410294 ወይም የቴሌብር ቁጥር",
    txnRefSub: "የሞባይል ባንኪንግ ወይም የቴሌብር ማረጋገጫ ቁጥር ያስገቡ።",

    backBtn: "ተመለስ",
    chooseSubBtn: "ንዑስ ምድብ ይምረጡ",
    fillSpecsBtn: "ዝርዝሮችን ያስገቡ",
    previewAdBtn: "ማስታወቂያውን ይመልከቱ",
    selectPromoBtn: "ማስተዋወቂያ ይምረጡ & ይለጥፉ",
    pubFreeBtn: "ማስታወቂያውን በነጻ ይለጥፉ",
    payAndPostBtn: "{cost} ብር ከፍለው ይለጥፉ",
    pubProgress: "በመለጠፍ ላይ...",

    ownerNameVal: "እባክዎ የንብረቱን ባለቤት ሙሉ ስም ያስገቡ።",
    ownerPhoneVal: "እባክዎ የንብረቱን ባለቤት ስልክ ቁጥር ያስገቡ።",
    ownerEmailVal: "እባክዎ የንብረቱን ባለቤት ኢሜል ያስገቡ።",
    fieldReqVal: "እባክዎ የሚፈለገውን ቦታ ይሙሉ:",

    titleLabel: "የማስታወቂያው ርዕስ",
    titleDesc: "አጭር፣ ግልጽ እና ገላጭ የሆነ የማስታወቂያ ርዕስ ያስገቡ።",
    titlePlaceholder: "ምሳሌ: ባለ 3 መኝታ ክፍል የሚከራይ ዘመናዊ ቤት ቦሌ",
    titleVal: "እባክዎ የማስታወቂያ ርዕስ ያስገቡ።",

    descLabel: "ማብራሪያ/ዝርዝር መግለጫ",
    descDesc: "ስለ ንብረቱ ወይም ስለ ማስታወቂያው ሙሉ ዝርዝር መረጃ ይስጡ።",
    descPlaceholder: "ቁልፍ ባህሪያትን፣ ሁኔታውን፣ ጥቅሞቹን እና ልዩ ቅድመ ሁኔታዎችን ይግለጹ...",
    descVal: "እባክዎ ዝርዝር ማብራሪያ ያስገቡ።",

    locLabel: "አድራሻ / ቦታ",
    locDesc: "ትክክለኛውን ሰፈር፣ አድራሻ ወይም ከተማ ይግለጹ።",
    locPlaceholder: "ምሳሌ: ቦሌ፣ አዲስ አበባ፣ ኢትዮጵያ",
    locVal: "እባክዎ አድራሻ ያስገቡ።",

    priceLabel: "ዋጋ",
    priceDesc: "ለዚህ ማስታወቂያ የሚፈልጉትን ዋጋ ያስገቡ።",
    pricePlaceholder: "ምሳሌ: 15000",
    priceVal: "እባክዎ ዋጋ ያስገቡ።",

    currLabel: "የገንዘብ አይነት",
    currDesc: "ክፍያ የሚፈጸምበትን የገንዘብ አይነት ይምረጡ።",

    phoneLabel: "የመገናኛ ስልክ ቁጥር",
    phoneDesc: "ለመገናኛ የሚሆን ዋና የስልክ ቁጥር (ከነአገር መለያ ኮዱ)።",
    phonePlaceholder: "ምሳሌ: +251911223344",
    phoneVal: "እባክዎ የስልክ ቁጥር ያስገቡ።",

    ownerLabel: "የባለቤቱ/አገናኙ ሙሉ ስም",
    ownerDesc: "የማስታወቂያውን ባለቤት ወይም ተጠሪ ሙሉ ስም ያስገቡ።",
    ownerPlaceholder: "ምሳሌ: ጀማል ጅማ",
    ownerVal: "እባክዎ ሙሉ ስም ያስገቡ።",

    emailLabel: "የመገናኛ ኢሜል አድራሻ",
    emailDesc: "የስርዓቱን ግንኙነቶች ለመቀበል የሚጠቅም የኢሜል አድራሻ።",
    emailPlaceholder: "ምሳሌ: contact@sofumer.com",
    emailVal: "እባክዎ ትክክለኛ የኢሜል አድራሻ ያስገቡ።",

    dealLabel: "የስምምነት አይነት",
    dealDesc: "ይህን ንብረት የሚሸጡት ነው ወይስ የሚያከራዩት?",
    bedLabel: "የመኝታ ክፍሎች ብዛት",
    bedDesc: "ለመኝታ የተዘጋጁ ክፍሎች ብዛት ያስገቡ (ለመሬት 0 ያስገቡ)።",
    bathLabel: "የመታጠቢያ ክፍሎች ብዛት",
    bathDesc: "የመታጠቢያ ክፍሎችን ብዛት ይጥቀሱ።",
    areaLabel: "ጠቅላላ ስፋት (በካሬ ሜትር)",
    areaDesc: "ጠቅላላ ስፋቱን በካሬ ሜትር ያስገቡ።",
    areaVal: "እባክዎ ስፋት ያስገቡ።",
    furLabel: "የቤት እቃዎች ያሉት (ፈርኒሽድ)",
    furDesc: "ንብረቱ የቤት እቃዎች ተሟልተውለታል?",
    parkLabel: "የመኪና ማቆሚያ (ፓርኪንግ)",
    parkDesc: "የተለየ የመኪና ማቆሚያ ቦታ አለው?",
    ownLabel: "የባለቤትነት ሁኔታ",
    ownDesc: "ማስታወቂያውን ያወጣው ሰው የስራ ድርሻ።",

    brandLabel: "የተሽከርካሪው ብራንድ (አምራች)",
    brandDesc: "የተሽከርካሪውን አምራች ኩባንያ ስም።",
    brandPlaceholder: "ምሳሌ: ቶዮታ፣ ሱዙኪ፣ ሃዩንዳይ",
    brandVal: "እባክዎ የተሽከርካሪውን ብራንድ ያስገቡ።",
    modelLabel: "የተሽከርካሪው ሞዴል",
    modelDesc: "የተሽከርካሪውን የተለየ የሞዴል ስም ያስገቡ።",
    modelPlaceholder: "ምሳሌ: ኮሮላ፣ ስዊፍት፣ ቱክሰን",
    modelVal: "እባክዎ ሞዴሉን ያስገቡ።",
    yearLabel: "የተመረተበት አመት",
    yearDesc: "ተሽከርካሪው የተመረተበት አመተ ምህረት።",
    yearPlaceholder: "ምሳሌ: 2024",
    yearVal: "እባክዎ የተመረተበትን አመት ያስገቡ።",
    mileLabel: "የተጓዘው ርቀት (ኪሎሜትር)",
    mileDesc: "ተሽከርካሪው እስካሁን የተጓዘው ጠቅላላ ኪሎሜትር።",
    milePlaceholder: "ምሳሌ: 12500",
    mileVal: "እባክዎ የተጓዘበትን ርቀት ያስገቡ።",
    fuelLabel: "የነዳጅ አይነት",
    fuelDesc: "ተሽከርካሪው የሚጠቀመው የሃይል/ነዳጅ አይነት።",
    transLabel: "ማስተላለፊያ (ትራንስሚሽን)",
    transDesc: "የማርሽ አይነት (አውቶማቲክ ወይም ማኑዋል)።",
    engLabel: "የሞተር መጠን / ሲሲ",
    engDesc: "የተሽከርካሪው የሞተር አቅም (ምሳሌ: 1.6L, 2000cc)።",
    engPlaceholder: "ምሳሌ: 1.6L",
    engVal: "እባክዎ የሞተር መጠን ያስገቡ።",
    colLabel: "የውጪ ቀለም",
    colDesc: "የተሽከርካሪው አካል ዋና ቀለም።",
    colPlaceholder: "ምሳሌ: ብርማ ቀለም፣ ነጭ",
    colVal: "እባክዎ የተሽከርካሪውን ቀለም ያስገቡ።",
    condLabel: "ሁኔታ (ኮንዲሽን)",
    condDesc: "የእቃው ወይም የተሽከርካሪው የአሁኑ ሁኔታ።",
    qtyLabel: "የሚገኝ ብዛት",
    qtyDesc: "በአሁኑ ሰዓት በክምችት ውስጥ የሚገኘው የእቃ ብዛት።",
    qtyPlaceholder: "ምሳሌ: 5",
    qtyVal: "እባክዎ የምርት ብዛት ያስገቡ።",
    warrantyLabel: "ዋስትና አለው?",
    warrantyDesc: "ከሻጭ ወይም ከአምራች የተሰጠ ዋስትና መኖሩን ይግለጹ።",

    compLabel: "የድርጅቱ ስም",
    compDesc: "ቀጣሪው ድርጅት ወይም ኩባንያ ስም።",
    compPlaceholder: "ምሳሌ: ሶፍ ኡመር ሪል እስቴት",
    compVal: "እባክዎ የድርጅቱን ስም ያስገቡ።",
    empLabel: "የቀጥር ሁኔታ",
    empDesc: "የስራው ሰዓት አወቃቀር።",
    salLabel: "ደሞዝ / ክፍያ",
    salDesc: "ለስራው የሚከፈለው ወርሃዊ ወይም በኮንትራት የሚወሰን ክፍያ።",
    salPlaceholder: "ምሳሌ: 40,000 ETB / በወር",
    expLabel: "የስራ ልምድ",
    expDesc: "የሚጠየቀው አነስተኛ የስራ ልምድ አመታት።",
    expPlaceholder: "ምሳሌ: 2+ አመት የስራ ልምድ",
    expVal: "እባክዎ የስራ ልምድ ያስገቡ።",
    eduLabel: "የትምህርት ደረጃ",
    eduDesc: "ለስራው የሚጠየቀው ዝቅተኛ የትምህርት ዝግጅት።",
    eduPlaceholder: "ምሳሌ: የመጀመሪያ ዲግሪ በማርኬቲንግ",
    eduVal: "እባክዎ የትምህርት ደረጃ ያስገቡ።",
    deadLabel: "የማመልከቻው ማብቂያ ቀን",
    deadDesc: "ማመልከቻዎችን ለመቀበል የመጨረሻው ቀን።",
    deadVal: "እባክዎ የማመልከቻ ማብቂያ ቀን ያስገቡ።",

    covLabel: "አገልግሎት የሚሸፍነው ቦታ",
    covDesc: "አገልግሎቱን የሚያቀርቡባቸው ከተሞች ወይም ክልሎች።",
    covPlaceholder: "ምሳሌ: አዲስ አበባ እና አከባቢዋ",
    covVal: "እባክዎ የሚሸፍነውን ቦታ ያስገቡ።",
    avLabel: "የአገልግሎት ሰዓት",
    avDesc: "አገልግሎቱን የሚሰጡበትን የጊዜ ሰሌዳ ይግለጹ።",

    hoursLabel: "የስራ ሰዓት",
    hoursDesc: "ድርጅቱ ለደንበኞች ክፍት የሚሆንበት ሰዓት።",
    hoursPlaceholder: "ምሳሌ: ከሰኞ - ቅዳሜ (ከሰዓት 2:00 - ማታ 3:00)",
    hoursVal: "እባክዎ የስራ ሰዓት ያስገቡ።",
    webLabel: "ድረ-ገጽ (አማራጭ)",
    webDesc: "የንግድ ድርጅቱ ይፋዊ ድረ-ገጽ ካለ ሊንኩን ያስገቡ።",
    webPlaceholder: "ምሳሌ: https://www.mybusiness.com",

    orgLabel: "አዘጋጅ",
    orgDesc: "ዝግጅቱን የሚያስተናግደው አካል ወይም ግለሰብ ስም።",
    orgPlaceholder: "ምሳሌ: የባሌ ቅርስ ኮሚቴ",
    orgVal: "እባክዎ የአዘጋጁን ስም ያስገቡ።",
    venueLabel: "የዝግጅቱ ቦታ (አዳራሽ/ሜዳ)",
    venueDesc: "ዝግጅቱ የሚካሄድበት ህንፃ፣ አዳራሽ ወይም ድረ-ገጽ።",
    venuePlaceholder: "ምሳሌ: ሚሊኒየም አዳራሽ፣ አዲስ አበባ",
    venueVal: "እባክዎ የዝግጅቱን ቦታ ያስገቡ።",
    dateLabel: "የዝግጅቱ ቀን",
    dateDesc: "ዝግጅቱ የሚካሄድበት የተወሰነው ቀን።",
    dateVal: "እባክዎ ቀኑን ያስገቡ።",
    timeLabel: "የመጀመሪያ ሰዓት",
    timeDesc: "ዝግጅቱ የሚጀመርበት ሰዓት።",
    timePlaceholder: "ምሳሌ: ከጠዋቱ 4:00 ሰዓት",
    timeVal: "እባክዎ ሰዓቱን ያስገቡ።",

    imgLabel: "የማሳያ ምስሎች",
    imgDesc: "ለማስታወቂያው የሚሆኑ ጥራት ያላቸውን ፎቶዎች ያክሉ።",
    imgUrlLabel: "የምስሉ ድረ-ገጽ አድራሻ (URL)",
    imgUrlPlaceholder: "የምስሉን ሊንክ እዚህ ይለጥፉ...",
    addBtn: "አክል",
    uploadBtn: "ከስልክዎ ይጫኑ",
    quickBtn: "ናሙና ፎቶ",
    cancelBtn: "ይቅር",
    submitBtn: "ማስታወቂያውን አውጣ",
    publishing: "በማውጣት ላይ...",
    saving: "በማስቀመጥ ላይ...",

    sub_properties_houses: "ለነጠላ ወይም ለብዙ ቤተሰብ መኖሪያ የሚሆኑ ቤቶች እና ቪላዎች።",
    sub_properties_apartments: "የሚከራዩ አፓርታማዎች፣ ኮንዶሚኒየሞች እና ስቱዲዮዎች።",
    sub_properties_offices: "የንግድ ቢሮዎች፣ የጋራ የስራ ቦታዎች እና የንግድ ክፍሎች።",
    sub_properties_commercial: "ሱቆች፣ ማሳያ ክፍሎች፣ መጋዘኖች እና ፋብሪካዎች።",
    sub_properties_land: "ለመኖሪያ፣ ለንግድ ወይም ለእርሻ የሚውሉ መሬቶች/ቦታዎች።",
    sub_vehicles_cars: "የቤት መኪናዎች፣ ሰዳኖች፣ ጆፎች/ኤስዩቪ፣ ሃችባኮች እና ኩፔዎች።",
    sub_vehicles_motorcycles: "ሞተር ብስክሌቶች፣ ስኩተሮች እና ባለሶስት እግር ተሽከርካሪዎች (ባጃጅ)።",
    sub_vehicles_trucks: "የጭነት መኪናዎች፣ የቤት እቃ ማጓጓዣዎች እና ከባድ ተሽከርካሪዎች።",
    sub_vehicles_spareparts: "የሞተር መለዋወጫዎች፣ ፍሬኖች፣ ጎማዎች እና ሜካኒካል እቃዎች።",
    sub_vehicles_accessories: "የመኪና ድምጽ ማጉያዎች፣ የውስጥ ወንበር ልብሶች እና ተጨማሪ እቃዎች።",
    sub_products_electronics: "ላፕቶፖች፣ ኮምፒውተሮች፣ ቲቪዎች፣ ካሜራዎች እና የድምጽ እቃዎች።",
    sub_products_phonesandtablets: "ስማርት ስልኮች፣ ታብሌቶች፣ ስማርት ሰዓቶች እና መለዋወጫዎች።",
    sub_products_furniture: "የቤት እቃዎች፣ ወንበሮች፣ አልጋዎች፣ ጠረጴዛዎች እና የቤት ውስጥ ኤሌክትሮኒክስ።"
  }
};

const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  Properties: [
    { id: 'Houses', name: 'Houses' },
    { id: 'Apartments', name: 'Apartments' },
    { id: 'Villas', name: 'Villas' },
    { id: 'Land', name: 'Land & Plots' },
    { id: 'Offices', name: 'Offices' },
    { id: 'Shops', name: 'Shops' },
    { id: 'Warehouses', name: 'Warehouses' },
    { id: 'Commercial', name: 'Commercial Buildings' }
  ],
  Vehicles: [
    { id: 'Cars', name: 'Cars' },
    { id: 'Motorcycles', name: 'Motorcycles' },
    { id: 'Trucks', name: 'Trucks' },
    { id: 'Buses', name: 'Buses' },
    { id: 'Heavy Equipment', name: 'Heavy Equipment' },
    { id: 'Spare Parts', name: 'Vehicle Parts' },
    { id: 'Accessories', name: 'Vehicle Accessories' }
  ],
  Products: [
    { id: 'Electronics', name: 'Electronics & Gadgets' },
    { id: 'Phones & Tablets', name: 'Phones & Tablets' },
    { id: 'Computers & Laptops', name: 'Computers & Laptops' },
    { id: 'Furniture', name: 'Furniture & Home' },
    { id: 'Clothing & Fashion', name: 'Clothing & Fashion' },
    { id: 'Babies & Kids', name: 'Babies & Kids' },
    { id: 'Health & Beauty', name: 'Health & Beauty' },
    { id: 'Agriculture & Food', name: 'Agriculture & Food' },
    { id: 'Animals & Pets', name: 'Animals & Pets' },
    { id: 'Sports & Outdoors', name: 'Sports & Outdoors' },
    { id: 'Commercial Equipment', name: 'Commercial Equipment' },
    { id: 'Others', name: 'Other Products' }
  ],
  Jobs: [
    { id: 'Full-time', name: 'Full-time Jobs' },
    { id: 'Part-time', name: 'Part-time Jobs' },
    { id: 'Freelance', name: 'Freelance / Contract' },
    { id: 'Remote', name: 'Remote Jobs' },
    { id: 'Construction', name: 'Construction Jobs' },
    { id: 'Driver', name: 'Driver Jobs' },
    { id: 'Office', name: 'Office Jobs' },
    { id: 'Teaching', name: 'Teaching Jobs' },
    { id: 'Healthcare', name: 'Healthcare Jobs' },
    { id: 'Internship', name: 'Internships' }
  ],
  Services: [
    { id: 'Repair Services', name: 'Repair & Maintenance' },
    { id: 'Cleaning Services', name: 'Cleaning Services' },
    { id: 'Construction Services', name: 'Construction & Renovation' },
    { id: 'Transport & Moving', name: 'Transport & Moving' },
    { id: 'IT Services', name: 'IT & Software Services' },
    { id: 'Design & Marketing', name: 'Design & Marketing' },
    { id: 'Photography & Video', name: 'Photography & Media' },
    { id: 'Event Services', name: 'Event Services' },
    { id: 'Education & Tutoring', name: 'Education & Tutoring' }
  ],
  'Local Businesses': [
    { id: 'Restaurants & Cafes', name: 'Restaurants & Cafes' },
    { id: 'Shops & Supermarkets', name: 'Shops & Supermarkets' },
    { id: 'Salons & Beauty', name: 'Salons & Beauty Shops' },
    { id: 'Auto Repair & Garage', name: 'Auto Repair & Garage' },
    { id: 'Pharmacies & Health', name: 'Pharmacies & Clinics' },
    { id: 'Agencies & Consultancy', name: 'Agencies & Consultancy' },
    { id: 'Hotels & Lodging', name: 'Hotels & Guest Houses' }
  ],
  Community: [
    { id: 'Events', name: 'Events & Gathering' },
    { id: 'Announcements', name: 'Announcements' },
    { id: 'Lost & Found', name: 'Lost and Found' },
    { id: 'Charity & Volunteering', name: 'Charity & Volunteering' }
  ]
};

const CATEGORY_OPTIONS = [
  { id: 'Properties', name: 'Properties', icon: Building },
  { id: 'Vehicles', name: 'Vehicles', icon: Car },
  { id: 'Products', name: 'Products', icon: ShoppingBag },
  { id: 'Jobs', name: 'Jobs', icon: Briefcase },
  { id: 'Services', name: 'Services', icon: Wrench },
  { id: 'Local Businesses', name: 'Local Business', icon: Store },
  { id: 'Community', name: 'Community', icon: Calendar }
];

interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'images';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  colSpan?: 'half' | 'full';
}

// Clean helper to extract all user-filled specifications without duplication or empty fields
function buildCleanAmenities(
  majorCategory: string,
  subcategory: string,
  fieldsState: Record<string, any>,
  activeFields: FieldConfig[]
): string[] {
  const labelMap: Record<string, string> = {
    propertyType: majorCategory === 'Vehicles' ? 'Vehicle Type' : majorCategory === 'Services' ? 'Service Type' : majorCategory === 'Local Businesses' ? 'Business Type' : 'Property Type',
    purpose: 'Purpose',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    toilet: 'Toilets',
    area: 'Area (m²)',
    furnished: 'Furnished',
    parking: 'Parking',
    floorLevel: 'Floor Level',
    ownershipStatus: 'Ownership / Title Deed',
    transmission: 'Transmission',
    fuelType: 'Fuel Type',
    engineSize: 'Engine Capacity',
    year: 'Year',
    mileage: 'Mileage',
    color: 'Color',
    clothingType: 'Clothing Type',
    gender: 'Gender',
    brand: 'Brand',
    model: 'Model',
    size: 'Size',
    material: 'Material',
    condition: 'Condition',
    quantity: 'Quantity',
    negotiable: 'Negotiable',
    jobType: 'Job Type',
    sector: 'Sector / Industry',
    salaryRange: 'Salary Range',
    qualification: 'Qualification',
    experience: 'Experience Required',
    deadline: 'Deadline',
    pricingUnit: 'Pricing Unit',
    providerType: 'Provider Type',
    coverageArea: 'Coverage Area',
    availability: 'Availability',
    openingHours: 'Opening Hours',
    website: 'Website',
    organizer: 'Organizer',
    venue: 'Venue',
    eventDate: 'Date',
    eventTime: 'Time',
    video: 'Video Tour'
  };

  const skipKeys = new Set(['title', 'description', 'location', 'price', 'images', 'contactPhone', 'contactEmail', 'ownerName', 'logo']);
  const result: string[] = [];
  const addedKeys = new Set<string>();

  if (subcategory) {
    result.push(`Subcategory: ${subcategory}`);
    addedKeys.add('subcategory');
  }

  // Iterate strictly over activeFields for the selected category & subcategory
  for (const field of activeFields) {
    if (skipKeys.has(field.id)) continue;
    const rawVal = fieldsState[field.id];
    
    // Skip negotiable if 'No' or false
    if (field.id === 'negotiable') {
      const negStr = String(rawVal || '').toLowerCase().trim();
      if (!rawVal || negStr === 'no' || negStr === 'false') continue;
    }

    if (rawVal === undefined || rawVal === null) continue;
    const valStr = String(rawVal).trim();
    if (!valStr || (valStr === '0' && ['bedrooms', 'bathrooms', 'toilet', 'area'].includes(field.id))) continue;

    const label = labelMap[field.id] || field.label || field.id;
    let formattedVal = valStr;
    if (field.id === 'mileage' && !valStr.toLowerCase().includes('km')) {
      formattedVal = `${Number(valStr) ? Number(valStr).toLocaleString() : valStr} km`;
    }

    const normKey = label.toLowerCase().trim();
    if (!addedKeys.has(normKey)) {
      addedKeys.add(normKey);
      result.push(`${label}: ${formattedVal}`);
    }
  }

  return result;
}

// Configuration-driven Dynamic Fields based on Category & Subcategory selection
function getFieldsForSelection(majorCategory: string, subcategory: string): FieldConfig[] {
  // 1. PRODUCTS
  if (majorCategory === 'Products') {
    if (subcategory === 'Clothing & Fashion') {
      return [
        { id: 'title', label: 'Item Title', type: 'text', placeholder: 'e.g., Men\'s Leather Jacket / Summer Dress', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Zara, Nike, Adidas, Gucci', colSpan: 'half' },
        { id: 'size', label: 'Size', type: 'text', placeholder: 'e.g., S, M, L, XL, 42', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black, Blue, Red, White', colSpan: 'half' },
        { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Cotton, Leather, Denim, Silk', colSpan: 'half' },
        { id: 'gender', label: 'Gender', type: 'select', options: ['Unisex', 'Men', 'Women', 'Kids'], colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 1500', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, style...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., YouTube video URL (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Electronics' || subcategory === 'Phones & Tablets' || subcategory === 'Computers & Laptops') {
      return [
        { id: 'title', label: 'Item Title', type: 'text', placeholder: 'e.g., iPhone 15 Pro Max 256GB / Dell XPS 15', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Apple, Samsung, Dell, HP, Sony', required: true, colSpan: 'half' },
        { id: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Galaxy S24 Ultra, ThinkPad T14', colSpan: 'half' },
        { id: 'size', label: 'Storage / Spec', type: 'text', placeholder: 'e.g., 256GB, 1TB SSD, 16GB RAM', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Space Gray, Titanium, Black', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Refurbished', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 85000', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Mexico, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe specifications, battery health, accessories included...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video demo URL (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Furniture') {
      return [
        { id: 'title', label: 'Furniture Title', type: 'text', placeholder: 'e.g., 6-Seater Modern Leather Sofa Set', required: true, colSpan: 'full' },
        { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Oak Wood, Leather, Fabric, Steel', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Beige, Brown, Black', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 45000', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., CMC, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe dimensions, style, comfort, condition...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Product Title', type: 'text', placeholder: 'e.g., Product Name / Item Title', required: true, colSpan: 'full' },
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Brand name', colSpan: 'half' },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2500', required: true, colSpan: 'half' },
      { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, benefits...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
    ];
  }

  // 2. PROPERTIES
  if (majorCategory === 'Properties') {
    if (subcategory === 'Land') {
      return [
        { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., 500 m² Prime Plot for Sale in Bole', required: true, colSpan: 'full' },
        { id: 'purpose', label: 'Purpose', type: 'select', options: ['Sale', 'Rent', 'Buy'], colSpan: 'half' },
        { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 500', required: true, colSpan: 'half' },
        { id: 'ownershipStatus', label: 'Ownership / Title Deed', type: 'select', options: ['Title Deed (Carta)', 'Map (Karta)', 'Leasehold'], colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2500000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe land features, soil type, location advantages, access road...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Offices' || subcategory === 'Shops' || subcategory === 'Warehouses' || subcategory === 'Commercial') {
      return [
        { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., Commercial Office Space in City Center', required: true, colSpan: 'full' },
        { id: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'e.g., Office, Showroom, Warehouse, Shop', required: true, colSpan: 'half' },
        { id: 'purpose', label: 'Purpose', type: 'select', options: ['Rent', 'Sale', 'Buy'], colSpan: 'half' },
        { id: 'toilet', label: 'Toilets', type: 'number', placeholder: 'e.g., 2', colSpan: 'half' },
        { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 200', required: true, colSpan: 'half' },
        { id: 'parking', label: 'Parking Available', type: 'select', options: ['Yes', 'No'], colSpan: 'half' },
        { id: 'floorLevel', label: 'Floor Level', type: 'text', placeholder: 'e.g., Ground Floor, 3rd Floor', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 50000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Kazanchis, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe facility, floor level, parking, security...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., 3 Bedroom Modern House for Rent in Bole', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'e.g., House, Apartment, Villa', required: true, colSpan: 'half' },
      { id: 'purpose', label: 'Purpose', type: 'select', options: ['Rent', 'Sale', 'Buy'], colSpan: 'half' },
      { id: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: 'e.g., 3', colSpan: 'half' },
      { id: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: 'e.g., 2', colSpan: 'half' },
      { id: 'furnished', label: 'Furnished Status', type: 'select', options: ['Unfurnished', 'Furnished', 'Semi-Furnished'], colSpan: 'half' },
      { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 150', required: true, colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 25000', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, compound, security...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
    ];
  }

  // 3. VEHICLES
  if (majorCategory === 'Vehicles') {
    if (subcategory === 'Vehicle Parts' || subcategory === 'Vehicle Accessories' || subcategory === 'Spare Parts' || subcategory === 'Accessories') {
      return [
        { id: 'title', label: 'Part / Accessory Title', type: 'text', placeholder: 'e.g., Toyota Engine Belt / Alloy Rims 17"', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'e.g., Toyota, Michelin, Bosch', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Foreign', 'Used - Local'], colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 5000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Kera, Addis Ababa', required: true, colSpan: 'half' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., seller@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Specify fitment, part numbers, compatibility...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Vehicle Title', type: 'text', placeholder: 'e.g., Toyota Corolla 2022 in Excellent Condition', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Vehicle Type', type: 'text', placeholder: 'e.g., Sedan, SUV, Motorcycle, Truck, Bus', required: true, colSpan: 'half' },
      { id: 'brand', label: 'Make / Brand', type: 'text', placeholder: 'e.g., Toyota, Suzuki, Hyundai, Isuzu', required: true, colSpan: 'half' },
      { id: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual'], colSpan: 'half' },
      { id: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'], colSpan: 'half' },
      { id: 'engineSize', label: 'Engine Capacity', type: 'text', placeholder: 'e.g., 1.6L, 2000cc', colSpan: 'half' },
      { id: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2022', colSpan: 'half' },
      { id: 'mileage', label: 'Mileage (km)', type: 'number', placeholder: 'e.g., 45000', colSpan: 'half' },
      { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black, Silver, White', colSpan: 'half' },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Foreign', 'Used - Local'], colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2800000', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe vehicle features, accident history, service records...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
    ];
  }

  // 4. JOBS
  if (majorCategory === 'Jobs') {
    return [
      { id: 'title', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Full Stack Developer / Accountant', required: true, colSpan: 'full' },
      { id: 'jobType', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Remote'], colSpan: 'half' },
      { id: 'sector', label: 'Sector / Industry', type: 'text', placeholder: 'e.g., Technology, Banking, Hospitality, Construction', required: true, colSpan: 'half' },
      { id: 'salaryRange', label: 'Salary Range', type: 'text', placeholder: 'e.g., 20,000 - 35,000 / month (Negotiable)', colSpan: 'half' },
      { id: 'qualification', label: 'Education Required', type: 'text', placeholder: 'e.g., Bachelor\'s Degree in Computer Science', colSpan: 'half' },
      { id: 'experience', label: 'Experience Required', type: 'text', placeholder: 'e.g., 2-4 years', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'deadline', label: 'Application Deadline', type: 'text', placeholder: 'YYYY-MM-DD', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., hr@company.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description & Requirements', type: 'textarea', placeholder: 'Describe job responsibilities, required skills, benefits...', required: true, colSpan: 'full' },
      { id: 'logo', label: 'Company Logo URL', type: 'text', placeholder: 'Paste company logo image URL (optional)', colSpan: 'full' }
    ];
  }

  // 5. SERVICES
  if (majorCategory === 'Services') {
    return [
      { id: 'title', label: 'Service Title', type: 'text', placeholder: 'e.g., Professional House Cleaning & Gardening Service', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Service Category', type: 'text', placeholder: 'e.g., Cleaning, Repair, Moving, Tutoring, Plumbing', required: true, colSpan: 'half' },
      { id: 'pricingUnit', label: 'Pricing Unit', type: 'select', options: ['Fixed Rate', 'Hourly Rate', 'Daily Rate', 'Per Job / Negotiable'], colSpan: 'half' },
      { id: 'price', label: 'Price / Rate', type: 'number', placeholder: 'e.g., 500', colSpan: 'half' },
      { id: 'experience', label: 'Years of Experience', type: 'text', placeholder: 'e.g., 5+ Years', colSpan: 'half' },
      { id: 'coverageArea', label: 'Coverage Area', type: 'text', placeholder: 'e.g., All Addis Ababa', colSpan: 'half' },
      { id: 'location', label: 'Base Location', type: 'text', placeholder: 'e.g., Sarbet, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@service.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe services offered, equipment used, reliability guarantee...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Showcase video URL (optional)', colSpan: 'full' }
    ];
  }

  // 6. LOCAL BUSINESSES
  if (majorCategory === 'Local Businesses') {
    return [
      { id: 'title', label: 'Business Name', type: 'text', placeholder: 'e.g., Habesha Gourmet Restaurant & Cafe', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Business Type', type: 'text', placeholder: 'e.g., Restaurant, Supermarket, Salon, Pharmacy, Garage', required: true, colSpan: 'half' },
      { id: 'openingHours', label: 'Opening Hours', type: 'text', placeholder: 'e.g., Mon-Sat 8:00 AM - 10:00 PM', colSpan: 'half' },
      { id: 'website', label: 'Website / Social Link', type: 'text', placeholder: 'e.g., https://facebook.com/mybusiness', colSpan: 'half' },
      { id: 'location', label: 'Business Address / Area', type: 'text', placeholder: 'e.g., Bole Medhanialem, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Business Email', type: 'text', placeholder: 'e.g., info@business.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Business Description', type: 'textarea', placeholder: 'Describe your business products, services, specialty...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Store & Product Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video Tour URL', type: 'text', placeholder: 'e.g., Store tour video URL (optional)', colSpan: 'full' }
    ];
  }

  // 7. COMMUNITY
  if (majorCategory === 'Community') {
    return [
      { id: 'title', label: 'Post / Announcement Title', type: 'text', placeholder: 'e.g., Annual Tech Community Meetup 2026', required: true, colSpan: 'full' },
      { id: 'organizer', label: 'Organizer Name / Group', type: 'text', placeholder: 'e.g., Oromia Tech Youth Club', colSpan: 'half' },
      { id: 'venue', label: 'Venue / Address', type: 'text', placeholder: 'e.g., Skylight Hotel, Addis Ababa', colSpan: 'half' },
      { id: 'eventDate', label: 'Event Date & Time', type: 'text', placeholder: 'e.g., August 15, 2026 at 2:00 PM', colSpan: 'half' },
      { id: 'location', label: 'City / Region', type: 'text', placeholder: 'e.g., Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Contact Phone', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'e.g., info@community.org', required: true, colSpan: 'half' },
      { id: 'description', label: 'Full Description', type: 'textarea', placeholder: 'Provide complete details about this notice, event, or cause...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos / Banner', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
    ];
  }

  // Default Fallback
  return [
    { id: 'title', label: 'Listing Title', type: 'text', placeholder: 'e.g., Title of your listing', required: true, colSpan: 'full' },
    { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 500', colSpan: 'half' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'half' },
    { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
    { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
    { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, benefits...', required: true, colSpan: 'full' },
    { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
    { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
  ];
}

export default function CreateListingModal({ onClose }: CreateListingModalProps) {
  const { currentUser, refreshData, t, currentLanguage, paymentMethods, spendWallet, topUpWallet, systemSettings } = useApp();

  const lang: 'en' | 'om' | 'am' = (currentLanguage === 'om' || currentLanguage === 'am') ? currentLanguage : 'en';
  const rawD = DICTIONARY[lang];

  // Proxy to prioritize dynamic Admin Translation Dictionary values via t()
  const d = new Proxy(rawD, {
    get(target, prop: string) {
      if (typeof prop === 'string') {
        const defaultVal = target[prop as keyof typeof target];
        if (typeof defaultVal === 'string') {
          const dynamicVal = t(defaultVal);
          if (dynamicVal && dynamicVal !== defaultVal) return dynamicVal;
          const keyVal = t(prop);
          if (keyVal && keyVal !== prop) return keyVal;
          return defaultVal;
        }
        return defaultVal;
      }
      return (target as any)[prop];
    }
  });

  // 5-Step Flow State: 1 = Category, 2 = Subcategory, 3 = Details, 4 = Preview, 5 = Choose Plan
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [majorCategory, setMajorCategory] = useState<'Properties' | 'Vehicles' | 'Products' | 'Jobs' | 'Services' | 'Local Businesses' | 'Community'>('Properties');
  const [subcategory, setSubcategory] = useState('Houses');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'SAR' | 'EUR' | 'AED'>('ETB');

  // Plan & Monetization State
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | 'vip'>('free');
  const [isTopAdAddon, setIsTopAdAddon] = useState(false);
  const [isFeaturedAddon, setIsFeaturedAddon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'direct'>('wallet');
  const [selectedDirectMethodId, setSelectedDirectMethodId] = useState('');
  const [receiptRefNumber, setReceiptRefNumber] = useState('');
  const [receiptFileData, setReceiptFileData] = useState<{ url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null>(null);

  // Clean form state initialized with base fields only
  const [fieldsState, setFieldsState] = useState<Record<string, any>>({
    title: '',
    description: '',
    location: '',
    price: '',
    contactPhone: '',
    ownerName: '',
    contactEmail: '',
    video: ''
  });

  // Reset subcategory and clear category-specific fields when majorCategory changes
  useEffect(() => {
    const subcats = SUBCATEGORIES[majorCategory];
    if (subcats && subcats.length > 0) {
      setSubcategory(subcats[0].id);
    }
    setFieldsState(prev => ({
      title: prev.title || '',
      description: prev.description || '',
      location: prev.location || '',
      price: prev.price || '',
      contactPhone: prev.contactPhone || '',
      ownerName: prev.ownerName || '',
      contactEmail: prev.contactEmail || '',
      video: prev.video || ''
    }));
  }, [majorCategory]);

  // Pre-fill owner details from authenticated user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setFieldsState(prev => ({
          ...prev,
          ownerName: prev.ownerName || '',
          contactEmail: prev.contactEmail || '',
          contactPhone: prev.contactPhone || ''
        }));
      } else {
        setFieldsState(prev => ({
          ...prev,
          ownerName: prev.ownerName || currentUser.fullName || '',
          contactEmail: prev.contactEmail || currentUser.email || '',
          contactPhone: prev.contactPhone || currentUser.phone || ''
        }));
      }
    }
  }, [currentUser]);

  const activeFields = getFieldsForSelection(majorCategory, subcategory);

  // Pre-fill default option for select fields (such as condition and negotiable) if not explicitly set
  useEffect(() => {
    if (activeFields && activeFields.length > 0) {
      setFieldsState(prev => {
        let changed = false;
        const next = { ...prev };
        for (const f of activeFields) {
          if (f.type === 'select' && f.options && f.options.length > 0) {
            if (next[f.id] === undefined || next[f.id] === '') {
              next[f.id] = f.options[0];
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }
  }, [subcategory, majorCategory]);

  const handleFieldChange = (id: string, value: any) => {
    setFieldsState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageInput.trim() && !imagesList.includes(imageInput.trim())) {
      setImagesList([...imagesList, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImagesList(imagesList.filter((_, i) => i !== idx));
  };

  const handleQuickAddImagePlaceholder = () => {
    const urls = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ];
    const pick = urls[Math.floor(Math.random() * urls.length)];
    if (!imagesList.includes(pick)) {
      setImagesList([...imagesList, pick]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handlePhotoFilesChange(e.target.files);
    }
    e.target.value = '';
  };

  // Photo Optimization & Handlers
  const [photoError, setPhotoError] = useState('');
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);

  const compressImage = (file: File, maxDimension = 1920, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoFilesChange = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setPhotoError('');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    const maxPhotos = 10;
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    const filesArray = Array.from(filesList);

    if (imagesList.length + filesArray.length > maxPhotos) {
      setPhotoError(t('media.max_photos_exceeded') || `Maximum ${maxPhotos} photos allowed per listing.`);
      return;
    }

    for (const file of filesArray) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(file.type) && !validExts.includes(ext || '')) {
        setPhotoError(t('media.image_format_invalid') || 'Invalid image format. Supported formats: JPG, JPEG, PNG, WebP.');
        return;
      }
      if (file.size > maxSizeBytes) {
        setPhotoError(t('media.image_size_exceeded') || 'Image file size exceeds 10 MB limit.');
        return;
      }
    }

    setIsCompressingPhotos(true);
    try {
      const compressedResults = await Promise.all(
        filesArray.map(file => compressImage(file))
      );
      const validCompressed = compressedResults.filter(Boolean);
      setImagesList(prev => [...prev, ...validCompressed].slice(0, maxPhotos));
    } catch (err) {
      console.error('Error compressing photos:', err);
      setPhotoError('Failed to process one or more photo files.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleSetCoverPhoto = (idx: number) => {
    if (idx === 0) return;
    setImagesList(prev => {
      const copy = [...prev];
      const selected = copy.splice(idx, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleMovePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= imagesList.length) return;
    setImagesList(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Video Optimization & Handlers
  const [videoError, setVideoError] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const handleVideoFileChange = async (file: File | null) => {
    setVideoError('');
    if (!file) return;

    const validFormats = ['video/mp4', 'video/quicktime', 'video/webm'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'mov', 'webm'];

    if (!validFormats.includes(file.type) && !validExts.includes(ext || '')) {
      setVideoError(t('media.video_format_invalid') || 'Unsupported video format. Supported: MP4, MOV, WebM.');
      return;
    }

    const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSizeBytes) {
      setVideoError(t('media.video_max_size_exceeded') || 'Video file size exceeds maximum limit of 50 MB.');
      return;
    }

    setIsVideoUploading(true);
    try {
      const tempUrl = URL.createObjectURL(file);
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.src = tempUrl;

      await new Promise<void>((resolve, reject) => {
        videoEl.onloadedmetadata = () => {
          URL.revokeObjectURL(tempUrl);
          if (videoEl.duration > 30.5) {
            reject(new Error(t('media.video_max_duration_exceeded') || 'Video duration exceeds maximum allowed limit of 30 seconds.'));
          } else {
            resolve();
          }
        };
        videoEl.onerror = () => {
          URL.revokeObjectURL(tempUrl);
          reject(new Error('Unable to read video metadata. Please select a valid video file.'));
        };
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Vid = reader.result as string;
        setFieldsState(prev => ({
          ...prev,
          video: base64Vid,
          videoUrl: base64Vid
        }));
        setIsVideoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsVideoUploading(false);
      setVideoError(err.message || 'Error processing video file.');
    }
  };

  const handleRemoveVideo = () => {
    setVideoError('');
    setFieldsState(prev => ({
      ...prev,
      video: '',
      videoUrl: ''
    }));
  };

  const getSubcatDesc = (cat: string, sub: string) => {
    const normalizedSub = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `sub_${cat.toLowerCase()}_${normalizedSub}`;
    return d[key] || sub;
  };

  // Calculate pricing & dynamic Admin Ad Packages
  const topAdPrice = systemSettings?.marketplaceSettings?.topAdPrice ?? 150;
  const featuredPrice = systemSettings?.marketplaceSettings?.featuredAdPrice ?? 300;

  const DEFAULT_AD_PACKAGES = [
    { id: 'starter', name: 'STARTER', price: 100, currency: 'ETB', duration: '3 days', daysCount: 3, views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'PREMIUM', price: 150, currency: 'ETB', duration: '7 days', daysCount: 7, views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP ELITE', price: 500, currency: 'ETB', duration: '30 days', daysCount: 30, views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
  ];

  const checkFreeListingActive = (fls: any) => {
    if (!fls || fls.enabled === false) return false;
    const now = new Date();
    if (fls.startDate) {
      const start = new Date(fls.startDate);
      if (!isNaN(start.getTime()) && now < start) return false;
    }
    if (fls.endDate) {
      const end = new Date(fls.endDate);
      end.setHours(23, 59, 59, 999);
      if (!isNaN(end.getTime()) && now > end) return false;
    }
    return true;
  };

  const campaignInfo = getCampaignStatusInfo(systemSettings?.freeListingSettings);
  const isFreeListingEnabled = campaignInfo.isActive;

  const rawPackages = (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
    ? systemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'))
    : DEFAULT_AD_PACKAGES;

  const dynamicPackages = rawPackages.length > 0 ? rawPackages : DEFAULT_AD_PACKAGES;

  const flsConfig = systemSettings?.freeListingSettings;
  const maxFree = campaignInfo.maxListings;
  const freeDurationText = campaignInfo.displayText;

  const allPromotionPlans = [
    ...(isFreeListingEnabled ? [{ 
      id: 'free', 
      name: 'Standard Free Listing', 
      cost: 0, 
      days: freeDurationText, 
      daysCount: 0, 
      desc: `Standard catalog listing (Campaign: ${campaignInfo.displayText}, limit ${maxFree} free listings)`, 
      badge: campaignInfo.isLastDay ? 'LAST DAY' : 'FREE' 
    }] : []),
    ...dynamicPackages.map((pkg: any) => ({
      id: pkg.id || pkg.name,
      name: pkg.name,
      cost: Number(pkg.price) || 0,
      days: pkg.duration || '7 Days',
      daysCount: pkg.daysCount || (pkg.duration?.includes('30') ? 30 : pkg.duration?.includes('3') ? 3 : 7),
      badge: pkg.badge || 'PROMO',
      desc: pkg.desc || `Promotional ad package: ${pkg.name} (${pkg.duration || '7 days'})`
    }))
  ];

  const effectiveSelectedPlan = (selectedPlan === 'free' && !isFreeListingEnabled)
    ? (allPromotionPlans[0]?.id || 'starter')
    : selectedPlan;

  const selectedPlanObj = allPromotionPlans.find(p => p.id === effectiveSelectedPlan) || allPromotionPlans[0];
  const baseCost = selectedPlanObj ? selectedPlanObj.cost : 0;
  const addonTopCost = isTopAdAddon ? topAdPrice : 0;
  const addonFeaturedCost = isFeaturedAddon ? featuredPrice : 0;
  const totalCost = baseCost + addonTopCost + addonFeaturedCost;

  const walletBalance = currentUser?.walletBalance || 0;

    const st = fieldsState.sellingType || 'Retail';
    
    // Step 3 Validation before previewing
    const handleValidateStep3 = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (currentUser?.role === 'admin' && st !== 'Wholesale') {
        if (!fieldsState.ownerName || String(fieldsState.ownerName).trim() === '') {
          setError(d.ownerNameVal);
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError(d.ownerPhoneVal);
          return;
        }
        if (!fieldsState.contactEmail || String(fieldsState.contactEmail).trim() === '') {
          setError(d.ownerEmailVal);
          return;
        }
      }

      for (const field of activeFields) {
        if (field.type !== 'images') {
          if (currentUser?.role === 'admin' && (field.id === 'contactPhone' || field.id === 'contactEmail' || field.id === 'ownerName')) {
            continue;
          }
          if (st === 'Wholesale') {
            const excludeForWholesale = [
              'price', 'negotiable', 'bedrooms', 'bathrooms', 'toilet', 'area', 
              'floorLevel', 'parking', 'ownershipStatus', 'furnished', 'propertyType',
              'contactPhone', 'contactEmail', 'ownerName'
            ];
            if (excludeForWholesale.includes(field.id)) continue;
          }

          const val = fieldsState[field.id];
          if (field.required && (!val || String(val).trim() === '')) {
            const translatedLabel = getTranslatedFieldLabel(field.label, currentLanguage);
            setError(`${d.fieldReqVal} ${translatedLabel}`);
            return;
          }
        }
      }

      // Photos validation
      if (!imagesList || imagesList.length === 0) {
        setError('Please upload or add at least one photo for your listing.');
        return;
      }

      // Wholesale validation
      if (st === 'Wholesale' || st === 'Retail & Wholesale') {
        if (!fieldsState.wholesalePrice || Number(fieldsState.wholesalePrice) <= 0) {
          setError('Please enter a valid Wholesale Price.');
          return;
        }
        if (!fieldsState.minimumOrderQuantity || Number(fieldsState.minimumOrderQuantity) < 1) {
          setError('Please enter a valid Minimum Order Quantity (MOQ >= 1).');
          return;
        }
      }

      if (st === 'Wholesale') {
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError('Please enter a Contact Phone Number for supplier inquiries.');
          return;
        }
      }

      setError('');
      setCurrentStep(4); // Advance to Preview
    };

  // Final submission of listing and promotion purchase
  const handleFinalPublish = async () => {
    if (!currentUser) return;
    setError('');
    setSubmitting(true);

    try {
      const finalAmenities = buildCleanAmenities(majorCategory, subcategory, fieldsState, activeFields);
      let finalPropertyType = subcategory;
      let dbMajorCategory: any = majorCategory;
      let finalCategory = 'Buy';

      if (majorCategory === 'Properties') {
        finalPropertyType = subcategory;
        finalCategory = fieldsState.purpose || 'Sale';
      } else if (majorCategory === 'Vehicles') {
        dbMajorCategory = 'Products';
        finalPropertyType = 'Vehicles';
        finalCategory = subcategory;
      } else if (majorCategory === 'Products') {
        dbMajorCategory = 'Products';
        finalPropertyType = subcategory;
        finalCategory = 'For Sale';
      } else if (majorCategory === 'Jobs') {
        finalPropertyType = subcategory;
        finalCategory = fieldsState.jobType || 'Full-time';
      } else {
        finalPropertyType = subcategory;
        finalCategory = subcategory;
      }

      const computedSubcatId = getMatchingSubcategoryId({
        majorCategory: dbMajorCategory,
        propertyType: finalPropertyType,
        category: finalCategory,
        title: fieldsState.title,
        description: fieldsState.description,
        amenities: finalAmenities
      });

      const days = selectedPlan === 'basic' ? 3 : selectedPlan === 'premium' ? 7 : selectedPlan === 'vip' ? 30 : 0;
      const expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : undefined;

      const propertyData = {
        title: fieldsState.title,
        description: fieldsState.description,
        location: fieldsState.location,
        majorCategory: dbMajorCategory,
        propertyType: finalPropertyType,
        category: finalCategory,
        price: fieldsState.price === '' ? 0 : Number(fieldsState.price || 0),
        currency,
        brand: fieldsState.brand || '',
        condition: (fieldsState.condition !== undefined && fieldsState.condition !== '') ? fieldsState.condition : (activeFields.find(f => f.id === 'condition')?.options?.[0] || 'New'),
        negotiable: fieldsState.negotiable || 'No',
        isNegotiable: (fieldsState.negotiable || 'No') === 'Yes',
        model: fieldsState.model || '',
        color: fieldsState.color || '',
        storageSpec: fieldsState.storageSpec || fieldsState.specifications || '',
        region: fieldsState.region || '',
        city: fieldsState.city || '',
        quantity: fieldsState.quantity ? Number(fieldsState.quantity) : 1,
        bedrooms: majorCategory === 'Properties' ? Number(fieldsState.bedrooms || 0) : 0,
        bathrooms: majorCategory === 'Properties' ? Number(fieldsState.bathrooms || 0) : 0,
        area: majorCategory === 'Properties' ? Number(fieldsState.area || 0) : 0,
        amenities: finalAmenities,
        images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'],
        coverImage: imagesList[0] || '',
        video: fieldsState.video || fieldsState.videoUrl || '',
        videoUrl: fieldsState.video || fieldsState.videoUrl || '',
        ownerId: currentUser.role === 'admin' ? (fieldsState.ownerId || '') : currentUser.id,
        ownerName: currentUser.role === 'admin' ? (fieldsState.ownerName || 'Property Owner') : (fieldsState.ownerName || currentUser.fullName || 'Anonymous'),
        contactPhone: fieldsState.contactPhone || (currentUser.role === 'admin' ? '' : '+251911223344'),
        contactEmail: fieldsState.contactEmail || (currentUser.role === 'admin' ? '' : (currentUser.email || '')),
        ownerBusinessName: fieldsState.ownerBusinessName || '',
        ownerAvatar: fieldsState.ownerAvatar || '',
        postedOnBehalf: currentUser.role === 'admin',
        boostPlan: selectedPlan,
        isTopAd: isTopAdAddon,
        isFeatured: isFeaturedAddon || selectedPlan === 'vip',
        promotionExpiresAt: expiresAt,
        approvalStatus: currentUser?.role === 'admin' ? 'approved' : 'pending',
        verificationStatus: currentUser?.role === 'admin' ? 'verified' : 'pending',
        isVerifiedListing: currentUser?.role === 'admin',
        subCategoryId: computedSubcatId || undefined,
        sellingType: fieldsState.sellingType || 'Retail',
        businessType: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') ? (fieldsState.businessType || 'Wholesaler') : undefined,
        wholesalePrice: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') && fieldsState.wholesalePrice ? Number(fieldsState.wholesalePrice) : undefined,
        minimumOrderQuantity: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') && fieldsState.minimumOrderQuantity ? Number(fieldsState.minimumOrderQuantity) : undefined,
        wholesaleUnit: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') ? (fieldsState.wholesaleUnit || 'Piece') : undefined,
        availableQuantity: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') && fieldsState.availableQuantity ? Number(fieldsState.availableQuantity) : undefined,
        deliveryOptions: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') && Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [],
        wholesaleNotes: (fieldsState.sellingType === 'Wholesale' || fieldsState.sellingType === 'Retail & Wholesale') ? (fieldsState.wholesaleNotes || '') : undefined
      };

      const authToken = localStorage.getItem('sof_umer_token') || '';
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(propertyData)
      });

      const responseText = await res.text();
      let createdProp: any = null;
      let errData: any = null;

      if (responseText && responseText.trim()) {
        try {
          const parsed = JSON.parse(responseText);
          if (res.ok) {
            createdProp = parsed.listing || parsed;
          } else {
            errData = parsed;
          }
        } catch (parseErr) {
          console.error('[CreateListing] Response is not valid JSON:', responseText.substring(0, 250));
          throw new Error(`Server returned HTTP ${res.status}, but response was not valid JSON.`);
        }
      }

      if (!res.ok) {
        const errorMsg = errData?.error || errData?.message || `Failed to create listing (Server status ${res.status}).`;
        throw new Error(errorMsg);
      }

      if (!createdProp) {
        throw new Error('Listing was created but server returned empty response data.');
      }

      // Handle monetization payment if totalCost > 0
      if (totalCost > 0) {
        if (paymentMethod === 'wallet') {
          await spendWallet(
            totalCost,
            `${selectedPlan.toUpperCase()} Boost & Promotion for "${createdProp.title}"`,
            createdProp.id,
            selectedPlan,
            days || 7
          );
        } else if (paymentMethod === 'direct') {
          const directMethod = paymentMethods.find(m => m.id === selectedDirectMethodId);
          await fetch('/api/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              userEmail: currentUser.email,
              userName: currentUser.fullName,
              amount: totalCost,
              paymentMethodId: selectedDirectMethodId || 'direct-transfer',
              paymentMethodName: directMethod?.name || 'Direct Bank / Telebirr',
              relatedPropertyId: createdProp.id,
              relatedPropertyTitle: createdProp.title,
              referenceNumber: receiptRefNumber.trim() || undefined,
              receiptUrlOrFile: receiptFileData?.url || receiptRefNumber || 'Payment Reference Submitted',
              fileType: receiptFileData?.fileType || 'image',
              fileName: receiptFileData?.fileName,
              fileSize: receiptFileData?.fileSize
            })
          });
        }
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-[#0c0c0c] rounded-2xl w-full max-w-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 create-modal-view text-[#F5F5F4] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#08080a] shrink-0">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-serif text-lg tracking-wider uppercase font-medium text-white">
              {t('create_listing_title') || 'Create New Listing'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition duration-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs py-3.5 px-5 text-center font-semibold shrink-0">
            ⚠️ {error}
          </div>
        )}

        {/* Stepper Navigation Bar */}
        <div className="bg-zinc-900/80 border-b border-white/5 px-6 py-3 flex items-center justify-between overflow-x-auto text-[11px] shrink-0 scrollbar-none">
          {[
            { step: 1, label: `1. ${t('wizard.step_category')}` },
            { step: 2, label: `2. ${t('wizard.step_subcategory')}` },
            { step: 3, label: `3. ${t('wizard.step_details_photos')}` },
            { step: 4, label: `4. ${t('wizard.step_preview_ad')}` },
            { step: 5, label: `5. ${t('wizard.step_boost_pay')}` }
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step as any);
                }}
                disabled={s.step > currentStep}
                className={`flex items-center gap-1.5 font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    : isCompleted
                    ? 'text-emerald-400 hover:text-white'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body Wrap */}
        <div className="flex-1 flex flex-col overflow-hidden text-left">
          
          {/* Scrollable Step Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">

            {/* STEP 1: CATEGORY SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                    {d.catLabel} *
                  </label>
                  <p className="text-xs text-[#F5F5F4]/50 font-light">{d.catDesc}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  {CATEGORY_OPTIONS.map(cat => {
                    const Icon = cat.icon;
                    const isActive = majorCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setMajorCategory(cat.id as any);
                          // Auto set subcategory default
                          const subs = SUBCATEGORIES[cat.id as keyof typeof SUBCATEGORIES];
                          if (subs && subs.length > 0) setSubcategory(subs[0].id);
                        }}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold shadow-lg shadow-amber-500/5'
                            : 'bg-zinc-900/50 border-white/5 text-white/60 hover:border-white/15 hover:bg-zinc-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-amber-400" />
                        <span className="text-[11px] truncate w-full text-center font-medium">
                          {getTranslatedCategoryName(cat.name, currentLanguage)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Category Guideline Helper Description */}
                <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-200/80 leading-relaxed font-light">
                  <span className="font-bold text-amber-400 mr-2 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    {d.guideTitle}: {majorCategory}
                  </span>
                  <p className="italic">
                    {majorCategory === 'Properties' && d.propGuide}
                    {majorCategory === 'Vehicles' && d.vehGuide}
                    {majorCategory === 'Products' && d.prodGuide}
                    {majorCategory === 'Jobs' && d.jobGuide}
                    {majorCategory === 'Services' && d.srvGuide}
                    {majorCategory === 'Community' && d.commGuide}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SUBCATEGORY & CURRENCY */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {d.subcatLabel}
                    </label>
                    <p className="text-[11px] text-[#F5F5F4]/40 font-light">{d.subcatDesc}</p>
                    <select
                      value={subcategory}
                      onChange={e => setSubcategory(e.target.value)}
                      className="w-full p-3.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                    >
                      {SUBCATEGORIES[majorCategory]?.map(sub => (
                        <option key={sub.id} value={sub.id} className="bg-[#0c0c0c]">
                          {getTranslatedSubcategoryName(sub.name, currentLanguage)}
                        </option>
                      ))}
                    </select>

                    {subcategory && (
                      <div className="mt-3 p-3.5 bg-white/5 border border-white/5 rounded-xl text-[11px] text-[#F5F5F4]/70 leading-relaxed font-light">
                        <span className="font-bold text-white mr-1">📌 {d.subcatTitle}:</span>
                        {getSubcatDesc(majorCategory, subcategory)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                      {d.currLabel} *
                    </label>
                    <p className="text-[11px] text-[#F5F5F4]/40 font-light">{d.currDesc}</p>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value as any)}
                      className="w-full p-3.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                    >
                      <option value="ETB" className="bg-[#0c0c0c]">ETB (Ethiopian Birr)</option>
                      <option value="USD" className="bg-[#0c0c0c]">USD (United States Dollar)</option>
                      <option value="SAR" className="bg-[#0c0c0c]">SAR (Saudi Riyal)</option>
                      <option value="EUR" className="bg-[#0c0c0c]">EUR (Euro)</option>
                      <option value="AED" className="bg-[#0c0c0c]">AED (UAE Dirham)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SPECIFICATIONS & FIELDS */}
            {currentStep === 3 && (
              <form id="listing-details-form" onSubmit={handleValidateStep3} className="space-y-5 animate-in fade-in duration-300">
                <div className="border-l-2 border-amber-500 pl-3">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                    {d.specHeader} ({getTranslatedCategoryName(majorCategory, currentLanguage)} &rarr; {getTranslatedSubcategoryName(subcategory, currentLanguage)})
                  </h4>
                  <p className="text-[10px] text-white/40 font-light">{d.specSubtext}</p>
                </div>

                {/* Selling Type Selector - Prominently placed at top of Step 3 */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span>{t('wholesale.selling_type') || 'Selling Type'} *</span>
                    </label>
                    <span className="text-[10px] text-amber-300/70">Select listing format</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['Retail', 'Wholesale', 'Retail & Wholesale'] as const).map(st => {
                      const labelKey = st === 'Retail' ? 'wholesale.retail' : st === 'Wholesale' ? 'wholesale.wholesale' : 'wholesale.retail_and_wholesale';
                      const isSelected = (fieldsState.sellingType || 'Retail') === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleFieldChange('sellingType', st)}
                          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-500 shadow-md scale-[1.01]'
                              : 'bg-zinc-900 border-white/10 text-white/80 hover:border-amber-500/40 hover:text-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sellingType"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-black pointer-events-none hidden sm:inline"
                          />
                          <span className="text-center">{t(labelKey) || st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Admin-only Property Owner Contact Details (Hidden for Wholesale) */}
                {currentUser?.role === 'admin' && (fieldsState.sellingType || 'Retail') !== 'Wholesale' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {d.adminOwnerTitle}
                      </h4>
                    </div>
                    <p className="text-[11px] text-white/60">
                      {d.adminOwnerDesc}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerNameLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={fieldsState.ownerName || ''}
                          placeholder="e.g. Abebe Bikila"
                          onChange={e => handleFieldChange('ownerName', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerPhoneLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={fieldsState.contactPhone || ''}
                          placeholder="e.g. +251911223344"
                          onChange={e => handleFieldChange('contactPhone', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerEmailLabel} *
                        </label>
                        <input
                          type="email"
                          required
                          value={fieldsState.contactEmail || ''}
                          placeholder="e.g. owner@sofumer.com"
                          onChange={e => handleFieldChange('contactEmail', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          Owner Business / Company
                        </label>
                        <input
                          type="text"
                          value={fieldsState.ownerBusinessName || ''}
                          placeholder="e.g. Bikila Real Estate"
                          onChange={e => handleFieldChange('ownerBusinessName', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          Owner Photo / Logo URL
                        </label>
                        <input
                          type="url"
                          value={fieldsState.ownerAvatar || ''}
                          placeholder="https://..."
                          onChange={e => handleFieldChange('ownerAvatar', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-zinc-900/20 p-5 rounded-2xl border border-white/5">
                  {activeFields
                    .filter(field => {
                      const selType = fieldsState.sellingType || 'Retail';
                      if (selType === 'Wholesale') {
                        const excludeForWholesale = [
                          'price', 'negotiable', 'bedrooms', 'bathrooms', 'toilet', 'area', 
                          'floorLevel', 'parking', 'ownershipStatus', 'furnished', 'propertyType',
                          'contactPhone', 'contactEmail', 'ownerName'
                        ];
                        if (excludeForWholesale.includes(field.id)) return false;
                      }
                      if (currentUser?.role === 'admin' && (field.id === 'contactPhone' || field.id === 'contactEmail' || field.id === 'ownerName')) {
                        return false;
                      }
                      return true;
                    })
                    .map(field => {
                    const val = fieldsState[field.id] !== undefined ? fieldsState[field.id] : '';
                    const spanClass = field.colSpan === 'full' ? 'col-span-full' : 'col-span-1';

                    // Photo uploader
                    if (field.type === 'images') {
                      return (
                        <div key={field.id} className="col-span-full space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider">
                                {t('media.photos_limit_title') || 'Photos & Media (Max 10 Photos, 1 Video)'} *
                              </label>
                              <p className="text-[10px] text-[#F5F5F4]/40 font-light mt-0.5">
                                {t('media.reorder_hint') || 'The first photo is your Cover Photo. Reorder or set any photo as cover.'}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${imagesList.length >= 10 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {imagesList.length} / 10 {t('photos') || 'Photos'}
                            </span>
                          </div>

                          {/* Error Banner */}
                          {photoError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{photoError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Device File Picker Dropzone */}
                            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-center items-center text-center group hover:border-amber-500/40 transition duration-300 relative">
                              {isCompressingPhotos ? (
                                <div className="flex flex-col items-center py-4">
                                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                                  <span className="text-xs font-bold text-amber-400">Optimizing & compressing photos...</span>
                                </div>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-amber-500/60 group-hover:text-amber-500 transition mb-2" />
                                  <span className="text-xs font-bold text-white/90 block mb-1">{d.deviceUpload || 'Upload Photos'}</span>
                                  <span className="text-[10px] text-white/40 block mb-3">JPG, JPEG, PNG, WebP (Max 10MB each)</span>
                                  
                                  <label className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-xs font-bold transition duration-200 cursor-pointer inline-flex items-center gap-2">
                                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{d.uploadBtn || 'Select Photos'}</span>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/jpeg,image/jpg,image/png,image/webp"
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                  </label>
                                </>
                              )}
                            </div>

                            {/* URL & Stock Photo Input */}
                            <div className="space-y-3 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                              <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider">
                                {d.imgUrlLabel || 'Or Add Photo URL'}
                              </label>
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={imageInput}
                                  onChange={e => setImageInput(e.target.value)}
                                  placeholder={d.imgUrlPlaceholder || 'https://...'}
                                  className="flex-1 p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500/60 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddImage}
                                  className="px-3.5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
                                >
                                  {d.addBtn || 'Add'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[10px] text-white/40 italic">{d.needStock || 'Need sample images?'}</span>
                                <button
                                  type="button"
                                  onClick={handleQuickAddImagePlaceholder}
                                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-amber-400 transition cursor-pointer"
                                >
                                  ⚡ {d.quickBtn || 'Quick Add'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Thumbnail Previews with Cover Badge & Reordering */}
                          {imagesList.length > 0 && (
                            <div className="pt-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                  {d.addedPhotos || 'Selected Photos'} ({imagesList.length}/10)
                                </label>
                                <span className="text-[10px] text-amber-400/80">★ First photo is Cover Photo</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {imagesList.map((img, i) => (
                                  <div 
                                    key={i} 
                                    className={`relative rounded-2xl overflow-hidden border transition shadow-lg group bg-zinc-950 ${
                                      i === 0 ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-white/10 hover:border-white/30'
                                    }`}
                                  >
                                    <div className="h-24 w-full overflow-hidden">
                                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                                    </div>

                                    {/* Cover Badge */}
                                    {i === 0 ? (
                                      <div className="absolute top-1.5 left-1.5 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 shadow">
                                        <Star className="w-2.5 h-2.5 fill-black" />
                                        <span>{t('media.cover_photo') || 'Cover Photo'}</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSetCoverPhoto(i)}
                                        className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-amber-500 hover:text-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/20 transition cursor-pointer"
                                      >
                                        {t('media.set_as_cover') || 'Set as Cover'}
                                      </button>
                                    )}

                                    {/* Control Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition duration-200">
                                      {i > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => handleMovePhoto(i, 'left')}
                                          title="Move Left"
                                          className="p-1.5 bg-zinc-800/90 hover:bg-amber-500 hover:text-black text-white rounded-lg transition cursor-pointer"
                                        >
                                          <ArrowLeft className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {i < imagesList.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleMovePhoto(i, 'right')}
                                          title="Move Right"
                                          className="p-1.5 bg-zinc-800/90 hover:bg-amber-500 hover:text-black text-white rounded-lg transition cursor-pointer"
                                        >
                                          <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(i)}
                                        title="Remove"
                                        className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Dedicated Video Showcase Uploader
                    if (field.id === 'video' || field.id === 'videoUrl') {
                      const currentVid = fieldsState.video || fieldsState.videoUrl || '';
                      return (
                        <div key={field.id} className="col-span-full space-y-3 bg-zinc-900/40 border border-white/10 p-5 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-[#F5F5F4]/80 uppercase tracking-wider flex items-center gap-2">
                              <Video className="w-4 h-4 text-amber-500" />
                              <span>Video Tour / Showcase (Optional, Max 30s, 50MB)</span>
                            </label>
                            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              MP4, MOV, WebM
                            </span>
                          </div>

                          {/* Video Error Banner */}
                          {videoError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{videoError}</span>
                            </div>
                          )}

                          {isVideoUploading ? (
                            <div className="p-6 bg-zinc-950 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                              <span className="text-xs font-bold text-white">{t('media.video_uploading') || 'Processing & Uploading Video...'}</span>
                              <span className="text-[10px] text-white/40">Validating duration (max 30s) & preparing stream...</span>
                            </div>
                          ) : currentVid ? (
                            <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-amber-500/30 p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span>Video Uploaded & Ready</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-white/10">
                                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{t('media.replace_video') || 'Replace'}</span>
                                    <input
                                      type="file"
                                      accept="video/mp4,video/quicktime,video/webm"
                                      onChange={e => e.target.files?.[0] && handleVideoFileChange(e.target.files[0])}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t('media.remove_video') || 'Remove'}</span>
                                  </button>
                                </div>
                              </div>
                              <div className="rounded-xl overflow-hidden bg-black max-h-64 flex justify-center">
                                <video
                                  src={currentVid}
                                  controls
                                  className="max-h-64 w-full object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Direct File Selector */}
                              <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 bg-zinc-950/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center group transition">
                                <Film className="w-8 h-8 text-amber-500/60 group-hover:text-amber-500 transition mb-2" />
                                <span className="text-xs font-bold text-white mb-0.5">Upload Video File</span>
                                <span className="text-[10px] text-white/40 mb-3">Max 30s duration, 50MB file size</span>
                                
                                <label className="px-4 py-2 bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-lg">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{t('media.upload_video_btn') || 'Select Video File'}</span>
                                  <input
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/webm"
                                    onChange={e => e.target.files?.[0] && handleVideoFileChange(e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              {/* Video URL Fallback Input */}
                              <div className="space-y-2 flex flex-col justify-center">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                                  Or Paste Direct Video URL
                                </label>
                                <input
                                  type="text"
                                  value={currentVid}
                                  placeholder="https://example.com/video.mp4"
                                  onChange={e => {
                                    setVideoError('');
                                    handleFieldChange(field.id, e.target.value);
                                  }}
                                  className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-mono"
                                />
                                <span className="text-[10px] text-white/30 italic">Supports direct MP4/WebM video links.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Select input
                    if (field.type === 'select') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                            {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                          </label>
                          <select
                            value={val}
                            required={field.required}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            {field.options?.map(opt => (
                              <option key={opt} value={opt} className="bg-[#0c0c0c]">
                                {getTranslatedOption(opt, currentLanguage)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // Textarea input
                    if (field.type === 'textarea') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                            {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                          </label>
                          <textarea
                            rows={3}
                            value={val}
                            required={field.required}
                            placeholder={field.placeholder}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light resize-none"
                          />
                        </div>
                      );
                    }

                    // Location input enhancement for long addresses
                    if (field.id === 'location') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-normal normal-case">Full address (multi-line auto-wrap)</span>
                          </label>
                          <textarea
                            rows={2}
                            required={field.required}
                            value={val}
                            placeholder={field.placeholder || 'e.g., Bole Sub City, Woreda 03, Near Edna Mall, Addis Ababa'}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light resize-y min-h-[52px] leading-relaxed break-words whitespace-pre-wrap"
                          />
                        </div>
                      );
                    }

                    // Standard text / number inputs
                    return (
                      <div key={field.id} className={spanClass}>
                        <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                          {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                        </label>
                        <input
                          type={field.type === 'number' ? 'text' : field.type}
                          inputMode="text"
                          required={field.required}
                          value={val}
                          placeholder={field.placeholder}
                          onChange={e => handleFieldChange(field.id, e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Wholesale Information Section - Rendered when Selling Type is Wholesale or Retail & Wholesale */}
                {((fieldsState.sellingType || 'Retail') === 'Wholesale' || (fieldsState.sellingType || 'Retail') === 'Retail & Wholesale') && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span>{t('wholesale.wholesale_config_title') || '📦 Wholesale Information'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Business Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          🏢 {t('wholesale.business_type') || 'Business Type'} *
                        </label>
                        <select
                          value={fieldsState.businessType || 'Wholesaler'}
                          onChange={e => handleFieldChange('businessType', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        >
                          {[
                            { value: 'Manufacturer', key: 'wholesale.manufacturer' },
                            { value: 'Wholesaler', key: 'wholesale.wholesaler' },
                            { value: 'Distributor', key: 'wholesale.distributor' },
                            { value: 'Importer', key: 'wholesale.importer' },
                            { value: 'Exporter', key: 'wholesale.exporter' },
                            { value: 'Authorized Dealer', key: 'wholesale.authorized_dealer' },
                            { value: 'Local Supplier', key: 'wholesale.local_supplier' },
                            { value: 'Farmer', key: 'wholesale.farmer' },
                            { value: 'Cooperative', key: 'wholesale.cooperative' },
                            { value: 'Other', key: 'wholesale.other' }
                          ].map(bt => (
                            <option key={bt.value} value={bt.value}>
                              {t(bt.key) || bt.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Unit of Sale */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          📏 {t('wholesale.unit_of_sale') || 'Unit of Sale'} *
                        </label>
                        <select
                          value={fieldsState.wholesaleUnit || 'Piece'}
                          onChange={e => handleFieldChange('wholesaleUnit', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        >
                          {[
                            { value: 'Piece', key: 'wholesale.unit_piece' },
                            { value: 'Box', key: 'wholesale.unit_box' },
                            { value: 'Carton', key: 'wholesale.unit_carton' },
                            { value: 'Pack', key: 'wholesale.unit_pack' },
                            { value: 'Dozen', key: 'wholesale.unit_dozen' },
                            { value: 'Pair', key: 'wholesale.unit_pair' },
                            { value: 'Bag', key: 'wholesale.unit_bag' },
                            { value: 'Sack', key: 'wholesale.unit_sack' },
                            { value: 'Bundle', key: 'wholesale.unit_bundle' },
                            { value: 'Roll', key: 'wholesale.unit_roll' },
                            { value: 'Bottle', key: 'wholesale.unit_bottle' },
                            { value: 'Kilogram (Kg)', key: 'wholesale.unit_kg' },
                            { value: 'Gram', key: 'wholesale.unit_gram' },
                            { value: 'Liter', key: 'wholesale.unit_liter' },
                            { value: 'Meter', key: 'wholesale.unit_meter' },
                            { value: 'Ton', key: 'wholesale.unit_ton' },
                            { value: 'Other', key: 'wholesale.unit_other' }
                          ].map(u => (
                            <option key={u.value} value={u.value}>
                              {t(u.key) || u.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Wholesale Price */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          💰 {t('wholesale.wholesale_price') || 'Wholesale Price (Per Unit)'} ({currency}) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs text-amber-500 font-bold">{currency}</span>
                          <input
                            type="text"
                            inputMode="text"
                            required
                            placeholder="e.g. 500"
                            value={fieldsState.wholesalePrice !== undefined ? fieldsState.wholesalePrice : ''}
                            onChange={e => handleFieldChange('wholesalePrice', e.target.value)}
                            className="w-full pl-12 pr-3 py-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition font-medium"
                          />
                        </div>
                      </div>

                      {/* Minimum Order Quantity */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          📦 {t('wholesale.minimum_order_quantity') || 'Minimum Order Quantity (MOQ)'} *
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          required
                          placeholder="e.g. 10"
                          value={fieldsState.minimumOrderQuantity !== undefined ? fieldsState.minimumOrderQuantity : ''}
                          onChange={e => handleFieldChange('minimumOrderQuantity', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition font-medium"
                        />
                      </div>

                      {/* Available Quantity */}
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          📊 {t('wholesale.available_quantity') || 'Available Quantity (Optional)'}
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          placeholder="e.g. 500"
                          value={fieldsState.availableQuantity !== undefined ? fieldsState.availableQuantity : ''}
                          onChange={e => handleFieldChange('availableQuantity', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                        <span className="text-[10px] text-white/40 italic mt-1 block">e.g., 500 Pieces, 100 Kg, 50 Cartons</span>
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="space-y-2 pt-2 border-t border-amber-500/15">
                      <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider">
                        🚚 {t('wholesale.delivery_options') || 'Delivery Options'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Store Pickup', key: 'wholesale.delivery_pickup', label: 'Store Pickup' },
                          { id: 'Local Delivery', key: 'wholesale.delivery_local', label: 'Local Delivery' },
                          { id: 'Nationwide Delivery', key: 'wholesale.delivery_nationwide', label: 'Nationwide Delivery' }
                        ].map(item => {
                          const currentDel: string[] = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];
                          const isChecked = currentDel.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition ${
                                isChecked
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-zinc-900/80 border-white/10 text-white/70 hover:border-white/20'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    handleFieldChange('deliveryOptions', [...currentDel, item.id]);
                                  } else {
                                    handleFieldChange('deliveryOptions', currentDel.filter(d => d !== item.id));
                                  }
                                }}
                                className="accent-amber-500 rounded"
                              />
                              <span>{t(item.key) || item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Supplier Contact Info for Wholesale listings */}
                    {fieldsState.sellingType === 'Wholesale' && (
                      <div className="space-y-3 pt-3 border-t border-amber-500/15">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                          <Store className="w-4 h-4 text-amber-500" />
                          <span>Supplier Contact Information *</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                              Business / Company Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Biftu Bari Wholesale Trading"
                              value={fieldsState.ownerBusinessName || ''}
                              onChange={e => handleFieldChange('ownerBusinessName', e.target.value)}
                              className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                              Contact Phone Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. +251911223344"
                              value={fieldsState.contactPhone || ''}
                              onChange={e => handleFieldChange('contactPhone', e.target.value)}
                              className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wholesale Terms (Optional) */}
                    <div className="space-y-1 pt-1 border-t border-amber-500/15">
                      <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider">
                        📝 {t('wholesale.wholesale_notes') || 'Wholesale Terms (Optional)'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t('wholesale.notes_placeholder') || 'Example: Wholesale price applies to orders of 20 cartons or more.'}
                        value={fieldsState.wholesaleNotes || ''}
                        onChange={e => handleFieldChange('wholesaleNotes', e.target.value)}
                        className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition resize-none font-light placeholder-zinc-600"
                      />
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* STEP 4: LIVE PREVIEW MODE */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>{d.previewHeader}</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70">{d.previewSubtext}</span>
                </div>

                <div className="bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl max-w-xl mx-auto">
                  <div className="relative h-52 bg-zinc-800">
                    <img 
                      src={imagesList[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'} 
                      alt="Listing Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                      {getTranslatedCategoryName(majorCategory, currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                    </div>
                    {imagesList.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>{imagesList.length} {d.photosCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                          {fieldsState.title || d.untitled}
                        </h3>
                        <div className="text-xs text-white/70 flex items-start gap-1.5 mt-1.5 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="whitespace-pre-wrap break-words flex-1 text-white/90 leading-snug">
                            {fieldsState.location || d.noLocation}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {(fieldsState.sellingType || 'Retail') === 'Wholesale' ? (
                          <>
                            <span className="text-lg font-extrabold text-amber-400 font-mono block">
                              {fieldsState.wholesalePrice ? `${Number(fieldsState.wholesalePrice).toLocaleString()} ${currency}` : d.contactPrice}
                              <span className="text-xs font-normal text-amber-300/80 ml-1">/ {fieldsState.wholesaleUnit || 'Piece'}</span>
                            </span>
                            <span className="text-[10px] text-amber-300/90 font-bold block mt-0.5">
                              MOQ: {fieldsState.minimumOrderQuantity || 1} {fieldsState.wholesaleUnit || 'Piece'}s
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-extrabold text-amber-400 font-mono block">
                              {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : d.contactPrice}
                            </span>
                            {(fieldsState.sellingType || 'Retail') === 'Retail & Wholesale' && fieldsState.wholesalePrice && (
                              <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
                                Wholesale: {Number(fieldsState.wholesalePrice).toLocaleString()} {currency} / {fieldsState.wholesaleUnit || 'Piece'} (MOQ: {fieldsState.minimumOrderQuantity || 1})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {((fieldsState.sellingType || 'Retail') === 'Wholesale' || (fieldsState.sellingType || 'Retail') === 'Retail & Wholesale') && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-amber-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{fieldsState.sellingType} &bull; {fieldsState.businessType || 'Wholesaler'}</span>
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-mono text-right">
                          <span>MOQ: {fieldsState.minimumOrderQuantity || 1} {fieldsState.wholesaleUnit || 'Piece'}</span>
                          {fieldsState.availableQuantity ? (
                            <span className="ml-2 font-semibold text-amber-300">
                              &bull; Stock: {fieldsState.availableQuantity} {fieldsState.wholesaleUnit || 'Piece'}s
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                      {buildCleanAmenities(majorCategory, subcategory, fieldsState, activeFields).map((spec, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] text-white/80 font-medium truncate">
                          ✨ {spec}
                        </div>
                      ))}
                    </div>

                    {/* Description Snippet */}
                    <div className="text-xs text-white/60 line-clamp-2 pt-1 border-t border-white/5">
                      {fieldsState.description || d.noDesc}
                    </div>

                    {/* Seller Contact Info Preview */}
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {fieldsState.ownerAvatar ? (
                          <img src={fieldsState.ownerAvatar} alt={fieldsState.ownerName || 'Owner'} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs border border-amber-500/30">
                            {(fieldsState.ownerName || currentUser?.fullName || 'O').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white block text-[11px]">
                            {fieldsState.ownerName || (currentUser?.role === 'admin' ? 'Property Owner' : currentUser?.fullName)}
                          </span>
                          <span className="text-[10px] text-amber-400/80 block font-mono">
                            {fieldsState.ownerBusinessName || (currentUser?.role === 'admin' ? 'Public Listing Owner' : d.verifiedPublisher)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <Phone className="w-3.5 h-3.5" />
                        <span>
                          {fieldsState.contactPhone || (currentUser?.role === 'admin' ? 'Owner Phone' : (currentUser?.phone || '+251911...'))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BOOST PLAN & PAYMENT METHOD */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>{d.boostTitle}</span>
                  </h4>
                  <p className="text-[11px] text-[#F5F5F4]/50 font-light">{d.boostSubtext}</p>
                </div>

                {/* Free Listing Campaign Notice Card */}
                <div className="bg-zinc-900/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${campaignInfo.badgeColor}`}>
                        {campaignInfo.status}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {campaignInfo.displayText}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 font-medium">
                      <span className="text-amber-400 font-bold">Campaign Period:</span> {campaignInfo.startDateFormatted} → {campaignInfo.endDateFormatted}
                    </p>
                  </div>
                  {campaignInfo.isActive && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        🎁 Free Listing Eligible ({campaignInfo.maxListings} per user limit)
                      </span>
                    </div>
                  )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {allPromotionPlans.map(p => {
                    const isSel = selectedPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition cursor-pointer ${
                          isSel 
                            ? 'bg-amber-500/15 border-amber-500 shadow-lg text-white' 
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/10 text-white/70'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                              {p.badge}
                            </span>
                            <span className="text-[10px] text-white/40">{p.days}</span>
                          </div>
                          <h5 className="font-bold text-sm text-white mb-1">{p.name}</h5>
                          <p className="text-[10px] text-white/50 mb-3">{p.desc}</p>
                        </div>
                        <div className="pt-2 border-t border-white/5 font-mono text-base font-extrabold text-amber-400">
                          {p.cost === 0 ? '0 ETB' : `${p.cost} ETB`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add-ons Selection */}
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">{d.addonsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${isTopAdAddon ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                      <div className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={isTopAdAddon}
                          onChange={e => setIsTopAdAddon(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{d.topAd}</span>
                          <span className="text-[10px] text-white/40">{d.topAdDesc}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">+{topAdPrice} ETB</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${isFeaturedAddon ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                      <div className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={isFeaturedAddon}
                          onChange={e => setIsFeaturedAddon(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{d.spotlight}</span>
                          <span className="text-[10px] text-white/40">{d.spotlightDesc}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">+{featuredPrice} ETB</span>
                    </label>
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white uppercase block">{d.totalInvestment}</span>
                    <span className="text-[10px] text-amber-300/70">{d.totalInvestmentSub}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">{totalCost} ETB</span>
                  </div>
                </div>

                {/* Payment Options (If totalCost > 0) */}
                {totalCost > 0 && (
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {d.payMethodLabel}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                          paymentMethod === 'wallet' 
                            ? 'bg-amber-500/15 border-amber-500 text-white' 
                            : 'bg-zinc-900/40 border-white/5 text-white/60 hover:bg-zinc-900'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">{d.accWallet}</span>
                          <span className="text-[10px] text-white/50 block font-mono">
                            {d.walletBal} {walletBalance.toLocaleString()} ETB
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('direct')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                          paymentMethod === 'direct' 
                            ? 'bg-amber-500/15 border-amber-500 text-white' 
                            : 'bg-zinc-900/40 border-white/5 text-white/60 hover:bg-zinc-900'
                        }`}
                      >
                        <Building className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">{d.directBank}</span>
                          <span className="text-[10px] text-white/50 block">{d.directSub}</span>
                        </div>
                      </button>
                    </div>

                    {/* Wallet Details View */}
                    {paymentMethod === 'wallet' && (
                      <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">{d.yourBal}</span>
                          <span className="font-mono font-bold text-white">{walletBalance.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">{d.deduction}</span>
                          <span className="font-mono font-bold text-amber-400">-{totalCost} ETB</span>
                        </div>
                        {walletBalance < totalCost ? (
                          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg mt-2 font-medium">
                            ⚠️ {d.insufficientBal}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-lg mt-2 font-medium">
                            ✅ {d.sufficientBal}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Direct Transfer View */}
                    {paymentMethod === 'direct' && (
                      <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-white/70 uppercase mb-1.5">
                            {d.payChannel}
                          </label>
                          <select
                            value={selectedDirectMethodId}
                            onChange={e => setSelectedDirectMethodId(e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            <option value="">{d.payChannelPlaceholder}</option>
                            {paymentMethods.map(m => (
                              <option key={m.id} value={m.id} className="bg-[#0c0c0c]">
                                {m.name} ({m.accountNumber})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2">
                          <ReceiptUploadInput
                            referenceNumber={receiptRefNumber}
                            onReferenceChange={setReceiptRefNumber}
                            receiptFile={receiptFileData?.url || ''}
                            fileName={receiptFileData?.fileName}
                            fileType={receiptFileData?.fileType}
                            fileSize={receiptFileData?.fileSize}
                            onFileChange={(data) => setReceiptFileData(data)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Dynamic Footer Actions */}
          <div className="p-5 border-t border-white/10 bg-[#08080a] flex justify-between items-center gap-3 shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-bold transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{d.backBtn}</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white/50 hover:text-white text-xs font-bold transition duration-200 cursor-pointer"
              >
                {d.cancelBtn}
              </button>

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{d.chooseSubBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{d.fillSpecsBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={(e) => handleValidateStep3(e)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{d.previewAdBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{d.selectPromoBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 5 && (
                <button
                  type="button"
                  disabled={submitting || (totalCost > 0 && paymentMethod === 'wallet' && walletBalance < totalCost)}
                  onClick={handleFinalPublish}
                  className="px-6 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition duration-200 cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <span>{d.pubProgress}</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>{totalCost === 0 ? d.pubFreeBtn : d.payAndPostBtn.replace('{cost}', String(totalCost))}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
