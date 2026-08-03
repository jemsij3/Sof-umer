import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

// Configure authenticator options (window: 1 allows 30-sec clock drift tolerance)
authenticator.options = { window: 1 };

// Cloudinary File Storage Configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Storage] Cloudinary file storage initialized successfully! Remote media assets will be uploaded directly to Cloudinary.');
} else {
  console.log('[Storage] Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not set. System running with direct URI fallback.');
}

// Utility to upload base64 images and videos to Cloudinary and return secure URL
async function uploadToCloudinaryIfConfigured(mediaStr: string, folder: string = 'sof_umer'): Promise<string> {
  if (!mediaStr || typeof mediaStr !== 'string') return mediaStr;

  // Preserve existing remote HTTP/HTTPS URLs
  if (mediaStr.startsWith('http://') || mediaStr.startsWith('https://')) {
    return mediaStr;
  }

  // Upload base64 image or video data to Cloudinary if configured
  if (isCloudinaryConfigured && (mediaStr.startsWith('data:image/') || mediaStr.startsWith('data:video/'))) {
    try {
      const isVideo = mediaStr.startsWith('data:video/');
      const uploadRes = await cloudinary.uploader.upload(mediaStr, {
        folder: folder,
        resource_type: isVideo ? 'video' : 'auto',
      });
      console.log(`[Cloudinary] Media uploaded successfully (${isVideo ? 'video' : 'image'}): ${uploadRes.secure_url}`);
      return uploadRes.secure_url;
    } catch (err) {
      console.error('[Cloudinary] Media upload failed, preserving original input:', err);
      return mediaStr;
    }
  }

  return mediaStr;
}
import {
  User,
  Property,
  PaymentMethod,
  PaymentReceipt,
  Inquiry,
  Advertisement,
  Language,
  TranslationKey,
  SafetyReport,
  AppNotification,
  Category,
  AppFeature,
  JobOpening,
  SupportTicket,
  PropertyOffer,
  FAQItem,
  Review
} from './src/types';
import { staticTranslations } from './src/lib/translations';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function resolveDbFilePath(): { dbPath: string; isPersistent: boolean } {
  // Check explicit environment variables first
  const customDir = process.env.STORAGE_PATH || process.env.DATA_DIR || process.env.PERSISTENT_DIR;
  if (customDir) {
    try {
      if (!fsSync.existsSync(customDir)) {
        fsSync.mkdirSync(customDir, { recursive: true });
      }
      fsSync.accessSync(customDir, fsSync.constants.W_OK);
      return { dbPath: path.join(customDir, 'sof_umer_db.json'), isPersistent: true };
    } catch (e) {
      console.warn(`[Storage] Custom directory ${customDir} is not writable:`, e);
    }
  }

  // Check system persistent volume paths (/data or /var/data or local data dir)
  const candidateDirs = ['/data', '/var/data', path.join(process.cwd(), 'data')];
  for (const dir of candidateDirs) {
    try {
      if (dir.startsWith('/') && !fsSync.existsSync(dir)) {
        try {
          fsSync.mkdirSync(dir, { recursive: true });
        } catch (_) {}
      } else if (!fsSync.existsSync(dir) && dir === path.join(process.cwd(), 'data')) {
        fsSync.mkdirSync(dir, { recursive: true });
      }
      if (fsSync.existsSync(dir)) {
        fsSync.accessSync(dir, fsSync.constants.W_OK);
        return { dbPath: path.join(dir, 'sof_umer_db.json'), isPersistent: true };
      }
    } catch (err) {
      // Not available or not writable
    }
  }

  // Fallback to workspace root
  return { dbPath: path.join(process.cwd(), 'sof_umer_db.json'), isPersistent: false };
}

const { dbPath: DB_FILE, isPersistent: IS_PERSISTENT_STORAGE } = resolveDbFilePath();
console.log(`[Storage] Resolved DB_FILE: ${DB_FILE} (Persistent Storage: ${IS_PERSISTENT_STORAGE ? 'YES' : 'NO - Ephemeral Workspace'})`);

// --- MONGODB PERSISTENCE LAYER ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
let isMongoConnected = false;

// Mongoose Schemas (strict: false allows dynamic properties while using MongoDB as persistent single source of truth)
const userSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const propertySchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const paymentMethodSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const receiptSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const inquirySchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const advertisementSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const reportSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const notificationSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const categorySchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const appFeatureSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const jobOpeningSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const supportTicketSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const offerSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const languageSchema = new mongoose.Schema({ code: { type: String, required: true, unique: true } }, { strict: false });
const translationSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true } }, { strict: false });
const faqSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const reviewSchema = new mongoose.Schema({ id: { type: String, required: true, unique: true } }, { strict: false });
const appSettingsSchema = new mongoose.Schema({ key: { type: String, required: true, unique: true } }, { strict: false });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const PropertyModel = mongoose.models.Property || mongoose.model('Property', propertySchema);
export const PaymentMethodModel = mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', paymentMethodSchema);
export const ReceiptModel = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);
export const InquiryModel = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
export const AdvertisementModel = mongoose.models.Advertisement || mongoose.model('Advertisement', advertisementSchema);
export const ReportModel = mongoose.models.Report || mongoose.model('Report', reportSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const AppFeatureModel = mongoose.models.AppFeature || mongoose.model('AppFeature', appFeatureSchema);
export const JobOpeningModel = mongoose.models.JobOpening || mongoose.model('JobOpening', jobOpeningSchema);
export const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
export const OfferModel = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
export const LanguageModel = mongoose.models.Language || mongoose.model('Language', languageSchema);
export const TranslationModel = mongoose.models.Translation || mongoose.model('Translation', translationSchema);
export const FaqModel = mongoose.models.Faq || mongoose.model('Faq', faqSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const AppSettingsModel = mongoose.models.AppSettings || mongoose.model('AppSettings', appSettingsSchema);

async function connectMongo(): Promise<boolean> {
  if (!MONGODB_URI) {
    console.log('[Storage] MONGODB_URI is not set. Using persistent disk file storage fallback.');
    return false;
  }
  try {
    console.log('[Storage] Connecting to MongoDB instance...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[Storage] Successfully connected to MongoDB database as primary source of truth!');
    return true;
  } catch (err) {
    console.error('[Storage] Error connecting to MongoDB:', err);
    isMongoConnected = false;
    return false;
  }
}

export interface ServerUser extends User {
  passwordHash?: string;
  passwordHistory?: string[];
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  resetPasswordCode?: string;
  resetPasswordCodeExpiresAt?: string;
  phoneOtp?: string;
  phoneOtpExpiresAt?: string;
  failedLoginAttempts?: number;
  lockoutUntil?: string;
  twoFactorEnabled?: boolean;
  encryptedTwoFactorSecret?: string;
  tempTwoFactorSecret?: string;
  backupRecoveryCodes?: string[];
  failed2FAAttempts?: number;
  lockout2FAUntil?: string;
  lastTwoFactorVerification?: string;
  loginHistory?: {
    ip: string;
    userAgent: string;
    timestamp: string;
    deviceType: string;
  }[];
  tokenVersion?: number;
}

// Default initial data for database
const getInitialData = () => {
  const users: ServerUser[] = [
    {
      id: 'usr-jemal',
      email: 'jemaljima@gmail.com',
      fullName: 'Jemal jimma',
      role: 'admin',
      status: 'active',
      isVerified: true,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
      loginHistory: [],
      passwordHash: '$2b$10$8M.OZ7bfDTd8e724T1tSneytfS2iE4nLdSr27YVOBgkIJVdL7ENvC' // Default hashed password: Password123!
    }
  ];

  const properties: Property[] = [
    {
      id: 'prop-sample-1',
      title: JSON.stringify({
        en: 'Modern Luxury Villa with Garden in Bole',
        om: 'Viillaa Ammayyaa Boodo Qabu Bole Keessatti',
        am: 'ዘመናዊ የቅንጦት ቪላ ከጓሮ ጋር ቦሌ'
      }),
      description: JSON.stringify({
        en: 'Beautiful 4-bedroom villa with master suite, modern kitchen, private parking for 3 cars, and lush garden located in prime Bole area.',
        om: 'Viillaa bareeda ciisa 4 qabu, kuffana ammayyaa, mooraa konkolaataa 3 fi boqonnaa qabu Bole keessatti.',
        am: 'አራት መኝታ ቤት ያለው ቪላ፣ ዘመናዊ ወጥ ቤት፣ የ3 መኪና ማቆሚያ እና ውብ ጓሮ ያለው ቦሌ።'
      }),
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
      location: 'Bole, Addis Ababa',
      propertyType: 'Houses & Villas',
      category: 'For Sale',
      majorCategory: 'Properties',
      price: 28500000,
      currency: 'ETB',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      amenities: ['Garden', 'Parking', 'Security System', 'Balcony'],
      ownerId: 'usr-jemal',
      ownerName: 'Jemal jimma',
      contactPhone: '+251911000000',
      contactEmail: 'jemaljima@gmail.com',
      isFeatured: true,
      isRecommended: true,
      isVerifiedListing: true,
      verificationStatus: 'verified',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prop-sample-2',
      title: JSON.stringify({
        en: 'Toyota Land Cruiser V8 2023 - Executive Edition',
        om: 'Konkolaataa Toyota Land Cruiser V8 2023',
        am: 'ቶዮታ ላንድ ክሩዘር V8 2023 - ኤክስኪዩቲቭ'
      }),
      description: JSON.stringify({
        en: 'Brand new Toyota Land Cruiser V8, zero mileage, automatic transmission, fully loaded leather seats, sun roof, and local custom clearance.',
        om: 'Konkolaataa V8 haaraa, kaffaltii qophii guutuu, ootomaatiikii, seera biyyooleessaa guutuu.',
        am: 'አዲስ ቶዮታ ላንድ ክሩዘር V8፣ ዜሮ ኪሎሜትር፣ አውቶማቲክ፣ የቆዳ ወንበር፣ የፀሐይ ጣሪያ።'
      }),
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
      location: 'Kazanchis, Addis Ababa',
      propertyType: 'Cars',
      category: 'For Sale',
      majorCategory: 'Vehicles',
      price: 35000000,
      currency: 'ETB',
      amenities: ['Automatic', 'Leather Seats', 'Sunroof', '4WD'],
      brand: 'Toyota',
      condition: 'New',
      ownerId: 'usr-jemal',
      ownerName: 'Jemal jimma',
      contactPhone: '+251911000000',
      contactEmail: 'jemaljima@gmail.com',
      isFeatured: true,
      isRecommended: true,
      isVerifiedListing: true,
      verificationStatus: 'verified',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prop-sample-3',
      title: JSON.stringify({
        en: 'Senior Full-Stack Engineer (React & Node.js)',
        om: 'Injiniera Saftweerii Ol-aanaa (Full-Stack)',
        am: 'ከፍተኛ የሶፍትዌር መሐንዲስ (Full-Stack)'
      }),
      description: JSON.stringify({
        en: 'SOF-UMER Tech team is hiring a Senior Full-Stack Software Engineer to build scalable Ethiopian cloud services. Competitive salary in USD/ETB.',
        om: 'Garee SOF-UMER Tech Injiniera Saftweerii ol-aanaa barbaada. Mindaa gaarii fi faayidaa addaa waliin.',
        am: 'ሶፍ ኡመር ቴክ ከፍተኛ የሶፍትዌር መሐንዲስ ይፈልጋል። ተወዳዳሪ ደሞዝ እና ጥቅማጥቅሞች።'
      }),
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'],
      location: 'Addis Ababa',
      propertyType: 'IT & Software',
      category: 'Full Time',
      majorCategory: 'Jobs',
      price: 120000,
      currency: 'ETB',
      amenities: ['Full Time', 'Remote Allowed', 'Health Insurance'],
      ownerId: 'usr-jemal',
      ownerName: 'Jemal jimma',
      contactPhone: '+251911000000',
      contactEmail: 'jemaljima@gmail.com',
      isFeatured: false,
      isRecommended: true,
      isVerifiedListing: true,
      verificationStatus: 'verified',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prop-sample-4',
      title: JSON.stringify({
        en: 'iPhone 15 Pro Max 512GB Natural Titanium',
        om: 'Bilbila iPhone 15 Pro Max 512GB Haaraa',
        am: 'አይፎን 15 ፕሮ ማክስ 512ጂቢ አዲስ'
      }),
      description: JSON.stringify({
        en: 'Original iPhone 15 Pro Max 512GB in sealed box, global version with 1 year Apple warranty included.',
        om: 'Bilbila iPhone 15 Pro Max guutuu fi haaraa sanduuqa keessatti, waraqaa waadaa waggaa 1 waliin.',
        am: 'ኦሪጅናል አይፎን 15 ፕሮ ማክስ 512ጂቢ በታሸገ ሳጥን ውስጥ፣ ከ1 ዓመት ዋስትና ጋር።'
      }),
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'],
      location: 'Bole Medhanealem, Addis Ababa',
      propertyType: 'Mobile Phones & Tablets',
      category: 'For Sale',
      majorCategory: 'Products',
      price: 175000,
      currency: 'ETB',
      amenities: ['Brand New', 'Sealed', 'Apple Warranty'],
      brand: 'Apple',
      condition: 'New',
      ownerId: 'usr-jemal',
      ownerName: 'Jemal jimma',
      contactPhone: '+251911000000',
      contactEmail: 'jemaljima@gmail.com',
      isFeatured: false,
      isRecommended: false,
      isVerifiedListing: true,
      verificationStatus: 'verified',
      approvalStatus: 'approved',
      createdAt: new Date().toISOString()
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pay-cbe',
      name: 'CBE Bank (Commercial Bank of Ethiopia)',
      accountName: 'SOF-UMER Real Estate PLC',
      accountNumber: '1000345672819',
      phoneNumber: '+251911000000',
      instructions: 'Please transfer the required amount to our CBE account. Make sure to enter your full name as the transfer reference and upload a clear screenshot of the completed transaction receipt.',
      isActive: true,
    },
    {
      id: 'pay-telebirr',
      name: 'Telebirr Wallet',
      accountName: 'SOF-UMER MARKETPLACE',
      accountNumber: '0911000000',
      phoneNumber: '0911000000',
      instructions: 'Pay directly using Telebirr Pay. Select "Send Money" or "Pay Merchant" to our registered number 0911000000. Take a screenshot of the payment SMS/receipt and upload it here.',
      isActive: true,
    },
    {
      id: 'pay-awash',
      name: 'Awash Bank',
      accountName: 'SOF-UMER PLATFORMS',
      accountNumber: '01320492837400',
      phoneNumber: '+251911000000',
      instructions: 'Transfer to Awash Bank. Include your property ID or user email in the transaction remarks. Upload transaction slip.',
      isActive: false,
    }
  ];

  const receipts: PaymentReceipt[] = [];

  const inquiries: Inquiry[] = [];

  const advertisements: Advertisement[] = [];

  const languages: Language[] = [
    { code: 'en', name: 'English', isActive: true },
    { code: 'om', name: 'Afaan Oromoo', isActive: true },
    { code: 'am', name: 'Amharic (አማርኛ)', isActive: true }
  ];

  // Core translations mapping
  const translations: TranslationKey[] = staticTranslations;

  const reports: SafetyReport[] = [];
  const notifications: AppNotification[] = [];
  const supportTickets: SupportTicket[] = [];

  const categories: Category[] = [
    { id: 'cat-properties', name: 'Properties', description: 'Real Estate, Housing, Offices, Land', iconName: 'Building' },
    { id: 'cat-jobs', name: 'Jobs', description: 'Employment, Careers, Freelance gigs', iconName: 'Briefcase' },
    { id: 'cat-services', name: 'Services', description: 'Plumbing, Tech support, Consulting', iconName: 'Wrench' },
    { id: 'cat-products', name: 'Products', description: 'Goods, Electronics, Clothing, Crafts', iconName: 'ShoppingBag' },
    { id: 'cat-community', name: 'Community', description: 'Events, Groups, Local Announcements', iconName: 'Users' }
  ];

  const appFeatures: AppFeature[] = [
    {
      id: 'careers',
      titleEn: 'Careers',
      titleOm: 'Carraa Hojii',
      titleAm: 'ስራዎች',
      contentEn: 'Join our growing team and shape the future of Ethiopian marketplace. We are looking for talented developers, marketers, and operations managers.',
      contentOm: 'Garee keenya dabalataa jiruun dabalamaa fi egeree daldala Itoophiyaa ijaaraa. Ogeeyyii bilisa ta\'an, gurgurtoota fi bulchitoota barbaanna.',
      contentAm: 'እያደገ ካለው ቡድናችን ጋር ይቀላቀሉ እና የኢትዮጵያን የገበያ ቦታ የወደፊት እጣ ፈንታ ይቅረጹ። ጎበዝ ገንቢዎችን፣ ገበያተኞችን እና የስራ ማስኬጃ አስተዳዳሪዎችን እንፈልጋለን።',
      iconName: 'Briefcase',
      isSystem: true
    },
    {
      id: 'contact-us',
      titleEn: 'Contact Us',
      titleOm: 'Nu Quunnamaa',
      titleAm: 'እኛን ያግኙን',
      contentEn: 'Have questions, feedback, or need premium advertising deals? Reach out to us directly through this contact portal or our physical head office in Addis Ababa.',
      contentOm: 'Gaaffii, yaada qabdu ykn beeksisa dabalataa barbaaddaa? Toora quunnamtii kanaan ykn biiroo keenya guddaa Finfinnee jiruun quunnamaa.',
      contentAm: 'ጥያቄዎች፣ አስተያየቶች አሉዎት ወይስ ልዩ የማስታወቂያ ስምምነቶች ይፈልጋሉ? በዚህ የግንኙነት ፖርታል ወይም በአዲስ አበባ በሚገኘው ዋና መሥሪያ ቤታችን በኩል በቀጥታ ያግኙን።',
      iconName: 'Mail',
      isSystem: true
    },
    {
      id: 'about-us',
      titleEn: 'About Us',
      titleOm: "Waa'ee Keenya",
      titleAm: 'ስለ እኛ',
      contentEn: "Named after the legendary Sof Omar Caves in Bale, Ethiopia, Sof Umer represents depth, safety, connectivity, and robust local heritage. Established in 2026, we serve as Ethiopia's premier multi-lingual property and product marketplace.",
      contentOm: "Eenyummaan keenya holqa beekamaa Sof Omar Bale keessa jiru irraa kan moggaafame yoo ta'u, daldala amansiisaa, nageenya, fi seenaa naannoo keenyaa calaqqisiisa. Bara 2026 keessatti hundeeffame.",
      contentAm: "ስሙ በባሌ፣ ኢትዮጵያ ከሚገኘው ታዋቂው የሶፍ ኡመር ዋሻዎች የተወሰደ ሲሆን፥ ጥልቀትን፣ ደህንነትን እና ጠንካራ የአካባቢ ቅርሶችን ይወክላል። በ2026 የተመሰረተ።",
      iconName: 'Globe',
      isSystem: true
    },
    {
      id: 'how-it-works',
      titleEn: 'How It Works',
      titleOm: 'Inni Akkamitti Hojjata',
      titleAm: 'እንዴት እንደሚሰራ',
      contentEn: 'A simple 3-step guide to get started: 1. Create an Account in seconds. 2. Publish your property or products with custom attributes. 3. Connect with verified buyers or tenants safely.',
      contentOm: 'Adeemsa salphaa sadii: 1. Herrega banadhu. 2. Beeksisa kee qabeenyaan galchi. 3. Bittoota amansiisoo ta\'anii fi kireeffattoota waliin wal-qunnami.',
      contentAm: 'ለመጀመር ቀላል ባለ 3-ደረጃ መመሪያ፦ 1. በሰከንዶች ውስጥ መለያ ይፍጠሩ። 2. ንብረትዎን ወይም ምርቶችዎን ያትሙ። 3. ከተረጋገጡ ገዢዎች ወይም ተከራዮች ጋር በደህና ይገናኙ።',
      iconName: 'HelpCircle',
      isSystem: true
    },
    {
      id: 'marketplace-rules',
      titleEn: 'Marketplace Rules',
      titleOm: 'Seera Gabaa',
      titleAm: 'የገበያ ቦታ ደንቦች',
      contentEn: 'Rules everyone must follow to keep our community safe, clean, and trusted: 1. Authentic & Accurate Listings. 2. Property Ownership Verification. 3. Respectful Communication.',
      contentOm: 'Hawaasa amansiisaa fi qulqulluu ijaaruuf seera hordofamuu qabu: 1. Dhugummaa Beeksisaa. 2. Mirkaneessa Abbummaa. 3. Qunnamtii Kabaja Qabu.',
      contentAm: 'ደህንነቱ የተጠበቀ እና እውነተኛ ማህበረሰብ ለመፍጠር ሁሉም ሰው መከተል ያለበት ህጎች፦ 1. እውነተኛ እና ትክክለኛ መረጃ። 2. የባለቤትነት ማረጋገጫ። 3. መልካም ስነ-ምግባር እና ክብር።',
      iconName: 'Shield',
      isSystem: true
    },
    {
      id: 'verify-ownership',
      titleEn: 'Verify Ownership',
      titleOm: 'Mirkaneessa Abbummaa',
      titleAm: 'ባለቤትነትን ያረጋግጡ',
      contentEn: 'Get the trusted green check badge on your listings by verifying your property ownership with valid deeds and government-issued ID card photocopies.',
      contentOm: 'Beeksisa keessan irratti mallattoo mirkanaa\'aa argachuuf waraqaa kaartaa fi eenyummaa keessan nuuf ergaa.',
      contentAm: 'የባለቤትነት ማረጋገጫ ካርታ እና መታወቂያ ለአስተዳዳሪው በማጋራት የተረጋገጠ አረንጓዴ ባጅ ያግኙ።',
      iconName: 'UserCheck',
      isSystem: true
    },
    {
      id: 'safety-tips',
      titleEn: 'Safety Tips',
      titleOm: 'Gorsa Nageenyaa',
      titleAm: 'የደህንነት ምክሮች',
      contentEn: 'Best practices for safe trading: 1. Inspect properties in person before any cash transfer. 2. Meet in busy public places. 3. Beware of upfront payment requests.',
      contentOm: 'Nageenya keessaniif: 1. Maallaqa kaffaluun dura ijaan sakatta\'aa. 2. Iddoo ummataatti wal-argaa. 3. Kaffaltii dursaa irraa of-eeggadhaa.',
      contentAm: 'ለደህንነቱ የተጠበቀ ንግድ ምርጥ ልምዶች፦ 1. ማንኛውንም ክፍያ ከመፈጸምዎ በፊት ንብረቱን በአካል ያረጋግጡ። 2. በሕዝብ ቦታዎች ይገናኙ። 3. ከቅድሚያ ክፍያ ይጠንቀቁ።',
      iconName: 'AlertTriangle',
      isSystem: true
    }
  ];

  const jobOpenings: JobOpening[] = [];

  const initialFaqs: FAQItem[] = [
    {
      id: 'faq-pop-1',
      category: 'account',
      isPopular: true,
      status: 'published',
      orderIndex: 1,
      helpfulYes: 48,
      helpfulNo: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'What is Sof Umer marketplace?',
        om: 'Gabaan Sof Umer maali?',
        am: 'ሶፍ ኡመር ገበያ ምንድነው?'
      },
      answer: {
        en: 'Sof Umer is Ethiopia\'s premier trusted digital marketplace where individuals, businesses, and communities buy, sell, rent, and discover properties, vehicles, jobs, services, products, and community events.',
        om: 'Sof Umer gabaa naannoo Itoophiyaa amansiisaa fi ammayyaa ta\'eedha, daldaltoonni, bitattoonni fi hawaasni manneen, konkolaattota, meeshota, hojii fi tajaajiloota adda addaa itti wal-qunnamaniidha.',
        am: 'ሶፍ ኡመር ሰዎች ንብረቶችን፣ ተሽከርካሪዎችን፣ ስራዎችን፣ ምርቶችን፣ አገልግሎቶችን እና የአካባቢ ንግዶችን የሚያገኙበት፣ የሚገዙበት፣ የሚሸጡበት እና የሚከራዩበት የታመነ የኢትዮጵያ የገበያ ቦታ ነው።'
      }
    },
    {
      id: 'faq-pop-2',
      category: 'account',
      isPopular: true,
      status: 'published',
      orderIndex: 2,
      helpfulYes: 35,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How do I create an account and complete verification?',
        om: 'Herrega akkamitti banna fi eenyummaa mirkaneessina?',
        am: 'መለያ እንዴት እፈጥራለሁ እና ማረጋገጫ አጠናቅቃለሁ?'
      },
      answer: {
        en: 'Click Sign Up at the top right, select Email, Phone Number, or Google login, complete your personal details, and verify your phone or email to gain trusted seller status.',
        om: 'Cilika "Sign Up" garagala mirga gubbaa, Imeelii, Bilbila ykn Google filadhu, odaffannoo guutii mirkaneessi.',
        am: 'በቀኝ በኩል "ይመዝገቡ" የሚለውን ይጫኑ፣ በኢሜል፣ በስልክ ቁጥር ወይም በጉግል ይግቡ፣ መረጃዎን ያጠናቅቁ እና ያረጋግጡ።'
      }
    },
    {
      id: 'faq-prop-1',
      category: 'properties',
      isPopular: true,
      status: 'published',
      orderIndex: 3,
      helpfulYes: 62,
      helpfulNo: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How do I post a property listing for sale or rent?',
        om: 'Beeksisa mana ykn lafaa akkamitti gurgurtaa ykn kireessaaf dhiyeessina?',
        am: 'የቤት ወይም የመሬት ማስታወቂያ ለሽያጭ ወይም ለኪራይ እንዴት እለጥፋለሁ?'
      },
      answer: {
        en: 'Click "Post Listing", select Properties, enter the precise location, price, property type (Villa, Apartment, Office, Commercial, Land), upload clear photos, and submit for instant publishing.',
        om: '"Post Listing" cuqaasi, Properties filadhu, iddoo, gatii, gosa mana (Viillaa, Appaartamaa, Lafa) galchi, suuraa qulqulluu irratti fe\'i.',
        am: '"ማስታወቂያ ይለጥፉ" የሚለውን ይጫኑ፣ ንብረቶችን ይምረጡ፣ ቦታ፣ ዋጋ፣ የንብረት አይነት (ቪላ፣ አፓርታማ፣ መሬት) ያስገቡ እና ምስሎችን ያክሉ።'
      }
    },
    {
      id: 'faq-prop-2',
      category: 'properties',
      isPopular: false,
      status: 'published',
      orderIndex: 4,
      helpfulYes: 19,
      helpfulNo: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'What documents are needed for Verified Property badge?',
        om: 'Mallattoo Mirkanaa\'aa Manaa (Verified Badge) argachuuf sanadiin maal barbaachisa?',
        am: 'የተረጋገጠ የንብረት ባጅ ለማግኘት ምን ሰነዶች ያስፈልጋሉ?'
      },
      answer: {
        en: 'To obtain a verified green checkmark badge, upload a clear photograph of your site title deed (Kaarta) and your national ID. Admin inspects and approves within 24 hours.',
        om: 'Mallattoo qulqulluu argachuuf sanada abbummaa (Kaarta) fi waraqaa eenyummaa keessan admin-iif ergaa. Sa\'aatii 24 keessatti mirkanaa\'a.',
        am: 'የተረጋገጠ አረንጓዴ ባጅ ለማግኘት የካርታ እና የመታወቂያ ፎቶ ለአስተዳዳሪው ያጋሩ። በ24 ሰዓት ውስጥ ይረጋገጣል።'
      }
    },
    {
      id: 'faq-job-1',
      category: 'jobs',
      isPopular: true,
      status: 'published',
      orderIndex: 5,
      helpfulYes: 29,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How do I post job vacancies and recruit candidates?',
        om: 'Beeksisa hojii akkamitti baasna fi kandidaatota qacarta?',
        am: 'የስራ ማስታወቂያዎችን እንዴት እለጥፋለሁ እና አመልካቾችን እቀጥራለሁ?'
      },
      answer: {
        en: 'Select the "Jobs" category when creating a new listing, provide the job title, company name, required qualifications, salary range, and candidate application instructions.',
        om: 'Yeroo beeksisa baastu "Jobs" filadhu, maqaa hojii, maqaa dhaabbataa, dandeettii barbaachisu fi mindaa galchi.',
        am: 'ማስታወቂያ በሚፈጥሩበት ጊዜ "ስራዎች" ምድብ ይምረጡ፣ የስራ መደብ፣ የድርጅት ስም፣ አስፈላጊ ክህሎቶችን እና ደሞዝ ያስገቡ።'
      }
    },
    {
      id: 'faq-prod-1',
      category: 'products',
      isPopular: false,
      status: 'published',
      orderIndex: 6,
      helpfulYes: 22,
      helpfulNo: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'Can I sell electronics, furniture, or personal goods?',
        om: 'Meeshaalee ellektirooniksi, mi\'a mana fi meeshaa dhuunfaa gurguruu danda\'aa?',
        am: 'ኤሌክትሮኒክስ፣ የቤት እቃዎችን ወይም የግል እቃዎችን መሸጥ እችላለሁ?'
      },
      answer: {
        en: 'Yes! Sof Umer supports selling new and pre-owned items including smartphones, laptops, clothing, home furniture, and vehicle accessories with clear pricing and photo galleries.',
        om: 'Eeyyee! Meeshaalee haaraa fi tajaajilaman kanneen akka bilbilaa, kompiyuutara, uffata fi mi\'a mana gurguruu dandeessu.',
        am: 'አዎ! አዳዲስ እና ያገለገሉ ስልኮችን፣ ላፕቶፖችን፣ አልባሳትን እና የቤት እቃዎችን መሸጥ ይችላሉ።'
      }
    },
    {
      id: 'faq-serv-1',
      category: 'services',
      isPopular: false,
      status: 'published',
      orderIndex: 7,
      helpfulYes: 18,
      helpfulNo: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How do freelancers and technicians list their services?',
        om: 'Ogeeyyiin fi teekniishinoonni tajaajila isaanii akkamitti galmeessisu?',
        am: 'ባለሙያዎች እና ቴክኒሺያኖች አገልግሎታቸውን እንዴት ይዘረዝራሉ?'
      },
      answer: {
        en: 'Create a listing under "Services", select your specialty (Plumbing, Electrical, IT, Legal, Moving, Design), set hourly or fixed pricing, and publish your direct contact details.',
        om: 'Tajaajila keessan "Services" jalatti galcheera, gosa dandaettii keessanii (Pulaambingii, Elektirika, IT, Seera) filadhaa.',
        am: 'አገልግሎትዎን "አገልግሎቶች" ስር ይዘርዝሩ፣ የሙያ ዘርፍዎን ይምረጡ፣ የሰዓት ወይም የቋሚ ዋጋ ያስገቡ።'
      }
    },
    {
      id: 'faq-biz-1',
      category: 'businesses',
      isPopular: false,
      status: 'published',
      orderIndex: 8,
      helpfulYes: 15,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How can local businesses feature their enterprise on Sof Umer?',
        om: 'Dhaabbileen naannoo daldala isaanii akkamitti beeksifatu?',
        am: 'የአካባቢ ንግዶች ድርጅታቸውን በሶፍ ኡመር ላይ እንዴት ማስተዋወቅ ይችላሉ?'
      },
      answer: {
        en: 'Register your store under "Local Businesses". Include your physical address, Google Maps location link, opening hours, business phone numbers, and official logo.',
        om: '"Local Businesses" jalatti suuqii ykn dhaabbata keessan galmeessisaa, teessoo, kaffaltii fi lakkoofsa bilbilaa qopheessaa.',
        am: 'ድርጅትዎን "የአካባቢ ንግዶች" ስር ያስመዝግቡ። አድራሻዎን፣ የስራ ሰዓትዎን እና የስልክ ቁጥርዎን ያካቱ።'
      }
    },
    {
      id: 'faq-comm-1',
      category: 'community',
      isPopular: false,
      status: 'published',
      orderIndex: 9,
      helpfulYes: 14,
      helpfulNo: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'What community announcements and notices are allowed?',
        om: 'Beeksisa hawaasaa fi beeksisa kamtu eeyyamamaa?',
        am: 'ምን አይነት የማህበረሰብ ማስታወቂያዎች ይፈቀዳሉ?'
      },
      answer: {
        en: 'You can share local charity events, public gatherings, neighbourhood notices, educational workshops, and community lost-and-found items for free.',
        om: 'Qophii tola-ooltummaa, beeksisa naannoo, barumsa fi walga\'ii hawaasaa bilisaan qoodachuu dandeessu.',
        am: 'የበጎ አድራጎት ዝግጅቶችን፣ የማህበረሰብ ማስታወቂያዎችን እና ትምህርታዊ ስልጠናዎችን በነፃ ማጋራት ይችላሉ።'
      }
    },
    {
      id: 'faq-chat-1',
      category: 'chat_offer',
      isPopular: true,
      status: 'published',
      orderIndex: 10,
      helpfulYes: 51,
      helpfulNo: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How does the Make Offer and Chat system work?',
        om: 'Sirni "Make Offer" fi Chaatii akkamitti hojjata?',
        am: 'የዋጋ እቅረብ (Make Offer) እና የቻት ስርዓት እንዴት ይሰራሉ?'
      },
      answer: {
        en: 'On any listing detail page, click "Make Offer" to propose your purchase price, or click "Chat" to send an instant direct message. Sellers receive immediate notifications to accept, counter, or reject.',
        om: 'Fuula beeksisaa irratti "Make Offer" cuqaasuun gatii dhiyeessaa, ykn "Chat" cuqaasuun ergaa kallattii ergaa. Gurguraan counter/accept gochuu danda\'a.',
        am: 'በማስታወቂያው ገጽ ላይ "Make Offer" በመጫን የገዢ ዋጋ ያቅርቡ ወይም "Chat" በመጫን ቀጥታ መልእክት ይላኩ።'
      }
    },
    {
      id: 'faq-prem-1',
      category: 'premium',
      isPopular: true,
      status: 'published',
      orderIndex: 11,
      helpfulYes: 40,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How do I boost or feature my listing with Telebirr or CBE?',
        om: 'Telebirr ykn CBE-n beeksisa koo akkamitti ol-kaasa (boost)?',
        am: 'በቴሌብር ወይም በንግድ ባንክ ማስታወቂያዬን እንዴት ላስተዋውቅ (Boost)?'
      },
      answer: {
        en: 'Go to your Dashboard or listing options, select "Boost Listing", choose your package (Basic, Featured, or VIP), transfer payment to our registered CBE/Telebirr account, and upload the transaction receipt screenshot for instant activation.',
        om: 'Kellaa keessaniin "Boost Listing" filadhaa, Telebirr ykn CBE kaffalaa, risiiti kaffaltii fe\'aa.',
        am: 'ከዳሽቦርድዎ "Boost Listing" ይምረጡ፣ ጥቅሉን ይምረጡ፣ በቴሌብር ወይም በንግድ ባንክ ይክፈሉ እና ደረሰኙን ይስቀሉ።'
      }
    },
    {
      id: 'faq-safe-1',
      category: 'safety',
      isPopular: true,
      status: 'published',
      orderIndex: 12,
      helpfulYes: 73,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'What safety precautions should I take during transactions?',
        om: 'Tarkaanfii nageenyaa maal fudhachuu qaba?',
        am: 'በግዢ እና ሽያጭ ወቅት ምን አይነት የደህንነት ጥንቃቄዎችን ማድረግ አለብኝ?'
      },
      answer: {
        en: 'Never send advance money transfers to unknown sellers. Inspect properties or physical items in person in busy public locations before making payments. Report any fraudulent activity immediately.',
        om: 'Kaffaltii dursaa eenyummaa isaanii kan hin beekamneef maallaqa hin ergininaa. Iddoo ummataatti wal-argaa maallaqa kaffaluun dura ijaan sakatta\'aa.',
        am: 'ለማያውቁት ሰው በቅድሚያ ገንዘብ አይላኩ። ክፍያ ከመፈጸምዎ በፊት ንብረቱን በሕዝብ ቦታዎች በአካል ያረጋግጡ።'
      }
    },
    {
      id: 'faq-pol-1',
      category: 'policies',
      isPopular: false,
      status: 'published',
      orderIndex: 13,
      helpfulYes: 16,
      helpfulNo: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'What content or listings are strictly prohibited on Sof Umer?',
        om: 'Qabiyyee fi beeksisi kamtu dhorkamaa ta\'ee?',
        am: 'በሶፍ ኡመር ላይ በጥብቅ የተከለከሉ ይዘቶች ምንድን ናቸው?'
      },
      answer: {
        en: 'Illegal drugs, weapons, counterfeit goods, fraudulent investments, deceptive prices, duplicate listings, and abusive content are strictly prohibited and result in permanent account termination.',
        om: 'Dawaa seeraan ala ta\'e, meeshaa waraanaa, beeksisa fakkaattii fi sobaa fayyadamuun dhorkamaadha.',
        am: 'ህገ-ወጥ እቃዎች፣ መሳሪያዎች፣ የሃሰት ማስታወቂያዎች እና አታላይ መረጃዎች በጥብቅ የተከለከሉ ናቸው።'
      }
    },
    {
      id: 'faq-supp-1',
      category: 'support',
      isPopular: true,
      status: 'published',
      orderIndex: 14,
      helpfulYes: 38,
      helpfulNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      question: {
        en: 'How can I contact Sof Umer support team directly?',
        om: 'Garee deggarsa Sof Umer akkamitti kallattiin quunnama?',
        am: 'የሶፍ ኡመር የድጋፍ ቡድንን በቀጥታ እንዴት ማግኘት እችላለሁ?'
      },
      answer: {
        en: 'You can submit a ticket on this page under "Send a Support Inquiry", email support@sofumer.com, call +251 911 000 000 during office hours (Monday to Saturday, 8:00 AM - 6:00 PM), or visit our head office in Addis Ababa.',
        om: 'Ergaa deggarsaa "Send a Support Inquiry" kanaan ergaa, support@sofumer.com ykn bilbila +251 911 000 000 fayyadamaa.',
        am: 'በዚህ ገጽ ላይ መልእክት ይላኩ፣ ወደ support@sofumer.com ኢሜል ያድርጉ ወይም በ +251 911 000 000 ይደውሉ።'
      }
    }
  ];

  return {
    users,
    properties,
    paymentMethods,
    receipts,
    inquiries,
    advertisements,
    languages,
    translations,
    reports,
    notifications,
    categories,
    appFeatures,
    jobOpenings,
    supportTickets,
    faqs: initialFaqs,
    offers: [] as PropertyOffer[],
    reviews: [] as Review[]
  };
};

// Sync and calculate wallet balances based on approved top-up receipts and transactions
const syncAllWalletBalances = () => {
  if (!localDb || !localDb.users) return;
  if (!localDb.receipts) localDb.receipts = [];

  for (const user of localDb.users) {
    if (!user.walletTransactions) user.walletTransactions = [];

    // Match receipts belonging to this user
    const userReceipts = localDb.receipts.filter(r => 
      r.userId === user.id || (r.userEmail && user.email && r.userEmail.toLowerCase() === user.email.toLowerCase())
    );

    for (const receipt of userReceipts) {
      if (receipt.status === 'Approved') {
        let tx = user.walletTransactions.find(t => t.id === receipt.relatedPropertyId);
        const isWalletTopup = receipt.paymentMethodId === 'wallet-topup' ||
                              receipt.relatedPropertyTitle?.toLowerCase().includes('wallet') ||
                              (tx && tx.type === 'topup');
        if (isWalletTopup) {
          if (tx) {
            tx.status = 'completed';
          } else {
            tx = {
              id: receipt.relatedPropertyId || ('wtx-' + Date.now()),
              userId: user.id,
              userEmail: user.email,
              type: 'topup',
              amount: Number(receipt.amount) || 0,
              creditsAmount: Number(receipt.amount) || 0,
              description: `Wallet Top-Up (${receipt.amount} ETB)`,
              status: 'completed',
              createdAt: receipt.submittedAt || new Date().toISOString()
            };
            user.walletTransactions.unshift(tx);
          }
        }
      } else if (receipt.status === 'Rejected') {
        let tx = user.walletTransactions.find(t => t.id === receipt.relatedPropertyId);
        if (tx) {
          tx.status = 'rejected';
        }
      }
    }

    // Recalculate total wallet balance for this user (completed top-ups minus completed spends)
    let topupTotal = 0;
    let spendTotal = 0;
    for (const tx of user.walletTransactions) {
      if (tx.status === 'completed') {
        if (tx.type === 'topup') {
          topupTotal += Number(tx.amount) || 0;
        } else if (tx.type === 'spend') {
          spendTotal += Number(tx.amount) || 0;
        }
      }
    }

    if (topupTotal > 0 || user.walletTransactions.length > 0) {
      user.walletBalance = Math.max(0, topupTotal - spendTotal);
    }
  }
};

// Initialize file DB
let localDb: ReturnType<typeof getInitialData>;

const createDatabaseBackup = async (reason = 'startup') => {
  try {
    if (!fsSync.existsSync(DB_FILE)) return;
    const backupDir = path.join(path.dirname(DB_FILE), 'backups');
    if (!fsSync.existsSync(backupDir)) {
      await fs.mkdir(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `sof_umer_db_${timestamp}_${reason}.json`);
    const primaryBakPath = `${DB_FILE}.bak`;
    
    // Copy to primary .bak file and timestamped backup
    await fs.copyFile(DB_FILE, primaryBakPath);
    await fs.copyFile(DB_FILE, backupPath);

    // Keep up to 10 latest timestamped backups
    const files = await fs.readdir(backupDir);
    const dbBackups = files
      .filter(f => f.startsWith('sof_umer_db_') && f.endsWith('.json'))
      .map(f => path.join(backupDir, f));

    if (dbBackups.length > 10) {
      dbBackups.sort();
      const toDelete = dbBackups.slice(0, dbBackups.length - 10);
      for (const file of toDelete) {
        await fs.unlink(file).catch(() => {});
      }
    }
    console.log(`[Backup] Database backup created successfully (${reason}): ${backupPath}`);
  } catch (err) {
    console.warn('Warning: Could not create database backup:', err);
  }
};

async function syncCollectionToMongo<T extends Record<string, any>>(
  model: mongoose.Model<any>,
  items: T[],
  idKey: string = 'id'
) {
  if (!isMongoConnected || !items) return;
  try {
    if (items.length > 0) {
      const bulkOps = items.map(item => {
        const filter: Record<string, any> = {};
        filter[idKey] = item[idKey];
        return {
          updateOne: {
            filter,
            update: { $set: item },
            upsert: true
          }
        };
      });
      await model.bulkWrite(bulkOps as any);

      const validKeys = items.map(i => i[idKey]).filter(Boolean);
      const deleteFilter: Record<string, any> = {};
      deleteFilter[idKey] = { $nin: validKeys };
      await model.deleteMany(deleteFilter);
    } else {
      await model.deleteMany({});
    }
  } catch (err) {
    console.error(`[Storage] Error syncing collection ${model.modelName} to MongoDB:`, err);
  }
}

async function saveToMongo() {
  if (!isMongoConnected) return;
  try {
    await Promise.all([
      syncCollectionToMongo(UserModel, localDb.users || [], 'id'),
      syncCollectionToMongo(PropertyModel, localDb.properties || [], 'id'),
      syncCollectionToMongo(PaymentMethodModel, localDb.paymentMethods || [], 'id'),
      syncCollectionToMongo(ReceiptModel, localDb.receipts || [], 'id'),
      syncCollectionToMongo(InquiryModel, localDb.inquiries || [], 'id'),
      syncCollectionToMongo(AdvertisementModel, localDb.advertisements || [], 'id'),
      syncCollectionToMongo(ReportModel, localDb.reports || [], 'id'),
      syncCollectionToMongo(NotificationModel, localDb.notifications || [], 'id'),
      syncCollectionToMongo(CategoryModel, localDb.categories || [], 'id'),
      syncCollectionToMongo(AppFeatureModel, localDb.appFeatures || [], 'id'),
      syncCollectionToMongo(JobOpeningModel, localDb.jobOpenings || [], 'id'),
      syncCollectionToMongo(SupportTicketModel, localDb.supportTickets || [], 'id'),
      syncCollectionToMongo(OfferModel, (localDb as any).offers || [], 'id'),
      syncCollectionToMongo(LanguageModel, localDb.languages || [], 'code'),
      syncCollectionToMongo(TranslationModel, localDb.translations || [], 'key'),
      syncCollectionToMongo(FaqModel, (localDb as any).faqs || [], 'id'),
      syncCollectionToMongo(ReviewModel, (localDb as any).reviews || [], 'id'),
      (async () => {
        if ((localDb as any).appSettings) {
          await AppSettingsModel.updateOne(
            { key: 'appSettings' },
            { $set: { key: 'appSettings', data: (localDb as any).appSettings } },
            { upsert: true }
          );
        }
      })()
    ]);
  } catch (err) {
    console.error('[Storage] CRITICAL Error during saveToMongo:', err);
  }
}

async function fetchCollection<T = any>(model: mongoose.Model<any>): Promise<T[]> {
  const docs = await model.find({}).lean().exec();
  return docs.map((doc: any) => {
    delete doc._id;
    delete doc.__v;
    return doc;
  }) as T[];
}

async function fetchAppSettings(): Promise<any> {
  const doc: any = await AppSettingsModel.findOne({ key: 'appSettings' } as any).lean().exec();
  if (doc) {
    delete doc._id;
    delete doc.__v;
  }
  return doc;
}

async function loadFromMongo(): Promise<boolean> {
  if (!isMongoConnected) return false;
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[Storage] MongoDB database is empty. Initializing and seeding MongoDB from baseline seed...');
      await loadFromFileSeed();
      await saveToMongo();
      console.log('[Storage] MongoDB initial seed completed successfully.');
      return true;
    }

    console.log('[Storage] Loading database records directly from MongoDB...');
    const [
      users,
      properties,
      paymentMethods,
      receipts,
      inquiries,
      advertisements,
      reports,
      notifications,
      categories,
      appFeatures,
      jobOpenings,
      supportTickets,
      offers,
      languages,
      translations,
      faqs,
      reviews,
      appSettingsDoc
    ] = await Promise.all([
      fetchCollection(UserModel),
      fetchCollection(PropertyModel),
      fetchCollection(PaymentMethodModel),
      fetchCollection(ReceiptModel),
      fetchCollection(InquiryModel),
      fetchCollection(AdvertisementModel),
      fetchCollection(ReportModel),
      fetchCollection(NotificationModel),
      fetchCollection(CategoryModel),
      fetchCollection(AppFeatureModel),
      fetchCollection(JobOpeningModel),
      fetchCollection(SupportTicketModel),
      fetchCollection(OfferModel),
      fetchCollection(LanguageModel),
      fetchCollection(TranslationModel),
      fetchCollection(FaqModel),
      fetchCollection(ReviewModel),
      fetchAppSettings()
    ]);

    localDb = {
      users: users as any,
      properties: properties as any,
      paymentMethods: paymentMethods as any,
      receipts: receipts as any,
      inquiries: inquiries as any,
      advertisements: advertisements as any,
      reports: reports as any,
      notifications: notifications as any,
      categories: categories as any,
      appFeatures: appFeatures as any,
      jobOpenings: jobOpenings as any,
      supportTickets: supportTickets as any,
      offers: offers as any,
      languages: languages as any,
      translations: translations as any,
      faqs: faqs as any,
      reviews: reviews as any,
      appSettings: appSettingsDoc ? (appSettingsDoc as any).data : (getInitialData() as any).appSettings
    } as any;

    console.log(`[Storage] Successfully loaded from MongoDB: ${localDb.users.length} users, ${localDb.properties.length} properties.`);
    return true;
  } catch (err) {
    console.error('[Storage] Error loading from MongoDB:', err);
    return false;
  }
}

const loadFromFileSeed = async () => {
  try {
    if (!fsSync.existsSync(DB_FILE)) {
      const workspaceSeed = path.join(process.cwd(), 'sof_umer_db.json');
      if (DB_FILE !== workspaceSeed && fsSync.existsSync(workspaceSeed)) {
        console.log(`[Storage] Copying initial seed database to persistent location: ${workspaceSeed} -> ${DB_FILE}`);
        const targetDir = path.dirname(DB_FILE);
        if (!fsSync.existsSync(targetDir)) {
          await fs.mkdir(targetDir, { recursive: true });
        }
        await fs.copyFile(workspaceSeed, DB_FILE);
      }
    }

    const content = await fs.readFile(DB_FILE, 'utf-8');
    await createDatabaseBackup('premigration');
    localDb = JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`[Storage] Database file not found at target location ${DB_FILE}. Initializing with default initial data.`);
      const workspaceSeed = path.join(process.cwd(), 'sof_umer_db.json');
      if (DB_FILE !== workspaceSeed && fsSync.existsSync(workspaceSeed)) {
        try {
          const content = await fs.readFile(workspaceSeed, 'utf-8');
          localDb = JSON.parse(content);
          return;
        } catch (e) {}
      }
      localDb = getInitialData();
    } else {
      console.error('CRITICAL: Error reading database file:', error);
      if (!localDb) {
        localDb = getInitialData();
      }
    }
  }
};

function normalizeEmail(email: string): string {
  return email ? email.trim().toLowerCase() : '';
}

function normalizePhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (/^0[79]\d{8}$/.test(cleaned)) {
    cleaned = '+251' + cleaned.substring(1);
  }
  return cleaned;
}

const applyDataSanityAndMigrations = () => {
  if (!localDb.appFeatures || !Array.isArray(localDb.appFeatures)) {
    localDb.appFeatures = getInitialData().appFeatures;
  }
  if (!localDb.jobOpenings || !Array.isArray(localDb.jobOpenings)) {
    localDb.jobOpenings = [];
  } else {
    localDb.jobOpenings = localDb.jobOpenings.filter(j => !['job-1', 'job-2', 'job-3'].includes(j.id));
  }
  if (!localDb.categories || !Array.isArray(localDb.categories)) {
    localDb.categories = getInitialData().categories;
  }
  if (!localDb.users || !Array.isArray(localDb.users)) {
    localDb.users = getInitialData().users;
  }

  // 1. Normalize user fields
  localDb.users.forEach(u => {
    if (u.email) u.email = normalizeEmail(u.email);
    if (u.phone) u.phone = normalizePhone(u.phone);
    if (u.username) u.username = u.username.trim();
    if (!u.passwordHistory || !Array.isArray(u.passwordHistory)) {
      u.passwordHistory = u.passwordHash ? [u.passwordHash] : [];
    }
  });

  // 2. Safely deduplicate users by normalized email, merging fields to preserve updated passwords and verification status
  const uniqueUsersMap = new Map<string, ServerUser>();
  const usersWithoutEmail: ServerUser[] = [];

  for (const u of localDb.users) {
    if (u.email) {
      const existing = uniqueUsersMap.get(u.email);
      if (!existing) {
        uniqueUsersMap.set(u.email, u);
      } else {
        // Merge user details: preserve passwordHash if present in either
        if (!existing.passwordHash && u.passwordHash) {
          existing.passwordHash = u.passwordHash;
        }
        if (u.passwordHistory && u.passwordHistory.length > 0) {
          existing.passwordHistory = Array.from(new Set([...(existing.passwordHistory || []), ...u.passwordHistory]));
        }
        if (u.isVerified && !existing.isVerified) {
          existing.isVerified = true;
          existing.verificationStatus = 'verified';
        }
        if (u.role === 'admin') existing.role = 'admin';
        if (u.tokenVersion && u.tokenVersion > (existing.tokenVersion || 1)) {
          existing.tokenVersion = u.tokenVersion;
        }
        if (u.loginHistory && u.loginHistory.length > 0) {
          existing.loginHistory = [...(u.loginHistory || []), ...(existing.loginHistory || [])].slice(0, 20);
        }
      }
    } else {
      usersWithoutEmail.push(u);
    }
  }

  localDb.users = [...Array.from(uniqueUsersMap.values()), ...usersWithoutEmail];

  // 3. Ensure Jemal (Owner Admin) remains active & admin without wiping custom password!
  const jemalEmail = 'jemaljima@gmail.com';
  let jemalUser = localDb.users.find(u => u.email && u.email === jemalEmail);
  if (!jemalUser) {
    jemalUser = getInitialData().users[0];
    localDb.users.unshift(jemalUser);
  }
  if (jemalUser) {
    if (!jemalUser.passwordHash) {
      jemalUser.passwordHash = '$2b$10$8M.OZ7bfDTd8e724T1tSneytfS2iE4nLdSr27YVOBgkIJVdL7ENvC';
    }
    jemalUser.failedLoginAttempts = 0;
    jemalUser.lockoutUntil = undefined;
    jemalUser.role = 'admin';
    jemalUser.status = 'active';
    jemalUser.isVerified = true;
    jemalUser.verificationStatus = 'verified';
  }

  if (!localDb.properties || !Array.isArray(localDb.properties)) {
    localDb.properties = [];
  } else {
    localDb.properties.forEach(p => {
      if (!p.verificationStatus) {
        p.verificationStatus = 'pending';
      }
      if (!p.approvalStatus) {
        p.approvalStatus = 'pending';
      }
      if ((p as any).isArchived === undefined) {
        (p as any).isArchived = false;
      }

      if (!p.createdBy) {
        p.createdBy = (p as any).createdBy || (p.ownerId && p.ownerId.startsWith('usr-admin') ? p.ownerId : 'usr-jemal');
      }
      if (!p.createdByName) {
        p.createdByName = (p as any).createdByName || 'Admin Jemal';
      }
      if (!p.createdByEmail) {
        p.createdByEmail = (p as any).createdByEmail || 'jemaljima@gmail.com';
      }

      // Determine owner matching
      let matchedUser = localDb.users.find(u => u.id === p.ownerId && u.role !== 'admin');
      if (!matchedUser && (p as any).ownerEmail) {
        const pEmail = ((p as any).ownerEmail || '').trim().toLowerCase();
        if (pEmail) {
          matchedUser = localDb.users.find(u => u.email && u.email.trim().toLowerCase() === pEmail);
        }
      }
      if (!matchedUser && p.contactEmail) {
        const cEmail = (p.contactEmail || '').trim().toLowerCase();
        if (cEmail) {
          matchedUser = localDb.users.find(u => u.email && u.email.trim().toLowerCase() === cEmail);
        }
      }
      if (!matchedUser && p.contactPhone) {
        const cPhone = p.contactPhone.trim().replace(/[^\d+]/g, '');
        if (cPhone && cPhone.length >= 7) {
          const shortDigits = cPhone.slice(-9);
          matchedUser = localDb.users.find(u => u.phone && u.phone.trim().replace(/[^\d+]/g, '').endsWith(shortDigits));
        }
      }

      if (matchedUser) {
        p.ownerId = matchedUser.id;
        (p as any).ownerEmail = matchedUser.email;
        (p as any).ownerPhone = matchedUser.phone || p.contactPhone || '';
        if (!p.ownerName) p.ownerName = matchedUser.fullName || 'Property Owner';
        if (!(p as any).ownerAvatar) (p as any).ownerAvatar = (matchedUser as any).avatar || '';
        if (!(p as any).ownerBusinessName) (p as any).ownerBusinessName = (matchedUser as any).businessName || '';
      } else {
        // Unregistered owner or admin posted on behalf
        if (!p.ownerId || p.ownerId === 'usr-jemal' || p.ownerId === 'usr-admin') {
          if (p.contactEmail && p.contactEmail.toLowerCase() !== 'jemaljima@gmail.com') {
            p.ownerId = 'usr-owner-' + p.id;
            (p as any).postedOnBehalf = true;
          } else {
            p.ownerId = p.createdBy || 'usr-jemal';
          }
        }
        if (!(p as any).ownerEmail) (p as any).ownerEmail = p.contactEmail || '';
        if (!(p as any).ownerPhone) (p as any).ownerPhone = p.contactPhone || '';
        if (!p.ownerName) p.ownerName = 'Property Owner';
      }
    });
  }

  if (!localDb.paymentMethods || !Array.isArray(localDb.paymentMethods)) {
    localDb.paymentMethods = getInitialData().paymentMethods;
  }
  if (!localDb.receipts || !Array.isArray(localDb.receipts)) localDb.receipts = [];
  if (!localDb.inquiries || !Array.isArray(localDb.inquiries)) localDb.inquiries = [];
  if (!localDb.advertisements || !Array.isArray(localDb.advertisements)) localDb.advertisements = [];
  if (!localDb.supportTickets || !Array.isArray(localDb.supportTickets)) localDb.supportTickets = [];
  if (!(localDb as any).offers || !Array.isArray((localDb as any).offers)) (localDb as any).offers = [];
  if (!localDb.languages || !Array.isArray(localDb.languages)) {
    localDb.languages = getInitialData().languages;
  }

  const defaultData = getInitialData();
  if (!localDb.translations || !Array.isArray(localDb.translations) || localDb.translations.length === 0) {
    localDb.translations = defaultData.translations;
  } else {
    const existingKeys = new Set(localDb.translations.map(t => t.key));
    for (const t of defaultData.translations) {
      if (!existingKeys.has(t.key)) {
        localDb.translations.push(t);
      }
    }
  }
  if (!localDb.reports || !Array.isArray(localDb.reports)) localDb.reports = [];
  if (!localDb.notifications || !Array.isArray(localDb.notifications)) localDb.notifications = [];
  if (!(localDb as any).faqs || !Array.isArray((localDb as any).faqs) || (localDb as any).faqs.length === 0) {
    (localDb as any).faqs = defaultData.faqs;
  }
  if (!(localDb as any).customRoles || !Array.isArray((localDb as any).customRoles)) (localDb as any).customRoles = [];
  if (!(localDb as any).activityLogs || !Array.isArray((localDb as any).activityLogs)) (localDb as any).activityLogs = [];
  if (!(localDb as any).loginHistory || !Array.isArray((localDb as any).loginHistory)) (localDb as any).loginHistory = [];
  if (!(localDb as any).appSettings) {
    (localDb as any).appSettings = {
      appName: 'SOF-UMER',
      appLogoText: 'SOF-UMER',
      logoUrl: '',
      themeName: 'cosmic-slate',
      heroTitle: 'The Smart Way to Discover, Connect & Grow',
      heroDescription: 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.',
      heroImageUrl: '',
      siteStatus: 'Online',
      maintenanceMessage: 'SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience.'
    };
  }

  // Sanitize and ensure Hero settings and translations are scrubbed of old strings
  const appSet = (localDb as any).appSettings;
  if (!appSet.appName || appSet.appName === 'Sof Umer') {
    appSet.appName = 'SOF-UMER';
  }
  if (!appSet.heroTitle || appSet.heroTitle.includes("Connecting Ethiopia")) {
    appSet.heroTitle = 'The Smart Way to Discover, Connect & Grow';
  }
  if (!appSet.heroDescription || appSet.heroDescription.includes("Explore high-value")) {
    appSet.heroDescription = 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.';
  }
  if (appSet.heroImageUrl === undefined) appSet.heroImageUrl = '';
  delete appSet.homepageHeading;
  delete appSet.homepageSubheading;
  delete appSet.termsAndPrivacy;
  delete appSet.notificationsEnabled;

  if (Array.isArray(localDb.translations)) {
    for (const tr of localDb.translations) {
      if (tr.key === 'auth_connecting_markets' || tr.key === 'splash_tagline' || (tr.en && tr.en.includes("Connecting Ethiopia"))) {
        tr.en = 'The Smart Way to Discover, Connect & Grow';
      }
      if (tr.key === 'auth_intro_desc') {
        tr.en = 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.';
      }
    }
  }

  syncAllWalletBalances();
};

const loadDb = async () => {
  const mongoConnected = await connectMongo();
  if (mongoConnected) {
    const loaded = await loadFromMongo();
    if (loaded) {
      applyDataSanityAndMigrations();
      await saveDb();
      return;
    }
  }

  console.log('[Storage] Operating on persistent file database source.');
  await loadFromFileSeed();
  applyDataSanityAndMigrations();
  await saveDb();
};

let savePromise: Promise<void> = Promise.resolve();

const saveDb = (): Promise<void> => {
  savePromise = savePromise.then(async () => {
    if (isMongoConnected) {
      await saveToMongo();
      // sof_umer_db.json is NEVER read or written when MongoDB is connected!
      return;
    }

    try {
      const jsonString = JSON.stringify(localDb, null, 2);
      const tempFile = `${DB_FILE}.tmp`;
      await fs.writeFile(tempFile, jsonString, 'utf-8');
      await fs.rename(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed atomic saveDb, falling back to direct write:', err);
      try {
        await fs.writeFile(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
      } catch (e2) {
        console.error('CRITICAL: Fallback saveDb failed:', e2);
      }
    }
  }).catch(err => {
    console.error('Error in saveDb queue:', err);
  });
  return savePromise;
};

startServer();

async function startServer() {
  await loadDb();
  const app = express();

  // Trust proxy for Render / Cloudflare reverse proxies
  app.set('trust proxy', 1);

  // Global CORS Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token, X-Requested-By');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health check routes for Render load balancer
  app.get(['/healthz', '/health'], (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Ensure all /api responses default to application/json
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Support JSON & URL-encoded payloads with 50MB body limit
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Centralized body parser error handling (catches entity.too.large or malformed JSON payloads)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      console.error('[BodyParserError]', err.message);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(err.status || 400).json({
        success: false,
        error: err.type === 'entity.too.large'
          ? 'Payload too large. Please reduce image file sizes or upload fewer images.'
          : 'Invalid or malformed JSON request body.',
        message: err.message
      });
    }
    next();
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'secure-sof-umer-default-secret-2026-xyz';

  const ENCRYPTION_KEY = crypto.createHash('sha256').update(JWT_SECRET).digest();

  function encryptSecret(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  function decryptSecret(encryptedText: string): string {
    if (!encryptedText) return '';
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText;
    try {
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      return encryptedText;
    }
  }

  function generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  function stripSecrets(user: ServerUser): User {
    const {
      passwordHash,
      passwordHistory,
      verificationCode,
      verificationCodeExpiresAt,
      resetPasswordCode,
      resetPasswordCodeExpiresAt,
      phoneOtp,
      phoneOtpExpiresAt,
      encryptedTwoFactorSecret,
      tempTwoFactorSecret,
      backupRecoveryCodes,
      failed2FAAttempts,
      lockout2FAUntil,
      ...rest
    } = user;
    return {
      ...rest,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      backupRecoveryCodesCount: backupRecoveryCodes ? backupRecoveryCodes.length : 0,
    } as User;
  }

  // Temporary store for unassigned phone OTPs
  const phoneOtpStore: Record<string, { otp: string; expiresAt: number }> = {};

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPassword(pass: string): boolean {
    if (!pass || pass.length < 8) return false;
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    return hasLower && hasUpper && hasNumber && hasSpecial;
  }

  async function isPasswordReused(user: ServerUser, newPassword: string): Promise<boolean> {
    if (user.passwordHash) {
      const matchesCurrent = await bcrypt.compare(newPassword, user.passwordHash);
      if (matchesCurrent) return true;
    }
    if (user.passwordHistory && Array.isArray(user.passwordHistory)) {
      for (const oldHash of user.passwordHistory) {
        if (oldHash) {
          const matchesOld = await bcrypt.compare(newPassword, oldHash);
          if (matchesOld) return true;
        }
      }
    }
    return false;
  }

  function pushPasswordToHistory(user: ServerUser) {
    if (!user.passwordHistory || !Array.isArray(user.passwordHistory)) {
      user.passwordHistory = [];
    }
    if (user.passwordHash) {
      if (!user.passwordHistory.includes(user.passwordHash)) {
        user.passwordHistory.push(user.passwordHash);
      }
      if (user.passwordHistory.length > 5) {
        user.passwordHistory.shift();
      }
    }
  }

  // --- EMAIL SERVICE & BEAUTIFUL HTML TEMPLATES ---
  let etherealTransporter: nodemailer.Transporter | null = null;
  const recentEmailLogs: Array<{
    timestamp: string;
    to: string;
    subject: string;
    provider: string;
    success: boolean;
    details?: any;
  }> = [];

  function logEmailAttempt(entry: { to: string; subject: string; provider: string; success: boolean; details?: any }) {
    recentEmailLogs.unshift({
      timestamp: new Date().toISOString(),
      ...entry
    });
    if (recentEmailLogs.length > 30) {
      recentEmailLogs.pop();
    }
  }

  async function sendEmail({
    to,
    subject,
    html,
    text
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'Sof Umer Marketplace <noreply@sofumer.com>';
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const resendFromEnv = (process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.SMTP_FROM || '').trim();

    console.log(`[Email Service] Dispatching email to: "${to}" | Subject: "${subject}"`);

    // 1. Send via Resend API if configured
    if (resendApiKey) {
      try {
        let primaryFrom = resendFromEnv;
        if (!primaryFrom) {
          primaryFrom = 'Sof Umer Marketplace <noreply@sofumerapp.com>';
        } else if (!primaryFrom.includes('<')) {
          primaryFrom = `Sof Umer Marketplace <${primaryFrom}>`;
        }

        console.log(`[Email Service] Resend API: Attempting send with sender "${primaryFrom}" to "${to}"`);

        let res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: primaryFrom,
            to: [to],
            subject,
            html,
            text: text || html.replace(/<[^>]*>?/gm, '')
          })
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch (e) {
          data = { parseError: true };
        }

        // Fallback to onboarding@resend.dev if custom domain is unverified or returns validation error
        if (!res.ok && primaryFrom !== 'Sof Umer Marketplace <onboarding@resend.dev>') {
          console.warn(`[Email Service] Resend API primary sender (${primaryFrom}) returned status ${res.status}: ${JSON.stringify(data)}. Retrying with "Sof Umer Marketplace <onboarding@resend.dev>"...`);
          const fallbackFrom = 'Sof Umer Marketplace <onboarding@resend.dev>';
          res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: fallbackFrom,
              to: [to],
              subject,
              html,
              text: text || html.replace(/<[^>]*>?/gm, '')
            })
          });
          try {
            data = await res.json();
          } catch (e) {
            data = { parseError: true };
          }
        }

        if (res.ok) {
          console.log(`[Email Service] Delivered successfully via Resend API to ${to}: ID=${data.id}`);
          logEmailAttempt({ to, subject, provider: 'resend', success: true, details: { id: data.id } });
          return { success: true, provider: 'resend', id: data.id };
        } else {
          console.error(`[Email Service] Resend API failed (${res.status}):`, JSON.stringify(data));
          logEmailAttempt({ to, subject, provider: 'resend', success: false, details: { status: res.status, error: data } });
        }
      } catch (err: any) {
        console.error('[Email Service] Exception sending via Resend API:', err.message || err);
        logEmailAttempt({ to, subject, provider: 'resend', success: false, details: { exception: err.message || err } });
      }
    }

    // 2. Send via SMTP if credentials are configured
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const info = await transporter.sendMail({
          from: smtpFrom,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        });

        console.log(`[Email Service] Delivered via SMTP (${smtpHost}) to ${to}: MessageID=${info.messageId}`);
        return { success: true, provider: 'smtp', messageId: info.messageId };
      } catch (err: any) {
        console.error(`[Email Service] Failed to send email via SMTP (${smtpHost}):`, err.message || err);
      }
    }

    // 3. Fallback to Ethereal Test Mailer / Server Console Logging
    try {
      if (!etherealTransporter) {
        try {
          const testAcc = await nodemailer.createTestAccount();
          etherealTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAcc.user,
              pass: testAcc.pass
            }
          });
          console.log(`[Email Service] Initialized Ethereal test inbox for fallback: ${testAcc.user}`);
        } catch (e) {
          console.warn('[Email Service] Ethereal test account setup skipped.');
        }
      }

      if (etherealTransporter) {
        const info = await etherealTransporter.sendMail({
          from: smtpFrom,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service] Delivered to Ethereal Mailbox for ${to}`);
        if (previewUrl) {
          console.log(`[Email Service] Preview Mail Online: ${previewUrl}`);
        }
        return { success: true, provider: 'ethereal', previewUrl: previewUrl || undefined };
      }
    } catch (err: any) {
      console.warn('[Email Service] Ethereal send warning:', err.message || err);
    }

    // Always log full email details to server console for debugging and logs inspection
    console.log(`=======================================================`);
    console.log(`[EMAIL DISPATCH - SERVER LOG CAPTURE]`);
    console.log(`RECIPIENT: ${to}`);
    console.log(`SUBJECT:   ${subject}`);
    console.log(`CONTENT:\n${text || html.replace(/<[^>]*>?/gm, '')}`);
    console.log(`=======================================================`);

    return { success: true, provider: 'log' };
  }

  async function sendVerificationEmail(toEmail: string, fullName: string, code: string, appUrl: string) {
    const verifyLink = `${appUrl}/?mode=verify&email=${encodeURIComponent(toEmail)}&code=${code}`;
    const subject = `Verify Your Sof Umer Account (${code})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0a09; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
        <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
          <h1 style="color: #eab308; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">SOF UMER</h1>
          <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 13px;">Premier Ethiopian Marketplace</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #f5f5f4; margin-top: 0;">Welcome, ${fullName || 'Valued Member'}!</h2>
          <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6;">Thank you for joining Sof Umer Marketplace. To complete your account activation, please enter the 6-digit verification code below or click the verification button:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #eab308; background: #18181b; border: 2px dashed #eab308; padding: 16px 32px; border-radius: 8px;">
              ${code}
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyLink}" target="_blank" style="display: inline-block; background-color: #eab308; color: #000000; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px;">Verify Email Address Now</a>
          </div>

          <p style="color: #a1a1aa; font-size: 13px;">If you didn't create a Sof Umer account, you can safely ignore this email. This verification code expires in 15 minutes.</p>
        </div>
        <div style="background-color: #18181b; padding: 16px; text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a;">
          &copy; ${new Date().getFullYear()} Sof Umer Marketplace. All rights reserved.
        </div>
      </div>
    `;
    return sendEmail({ to: toEmail, subject, html });
  }

  async function sendPasswordResetEmail(toEmail: string, fullName: string, code: string, appUrl: string) {
    const resetLink = `${appUrl}/?mode=reset&email=${encodeURIComponent(toEmail)}&code=${code}`;
    const subject = `Password Reset Code (${code}) - Sof Umer`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0a09; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
        <div style="background-color: #18181b; padding: 24px; text-align: center; border-bottom: 1px solid #27272a;">
          <h1 style="color: #ef4444; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">SOF UMER</h1>
          <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 13px;">Security & Password Recovery</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #f5f5f4; margin-top: 0;">Password Reset Requested</h2>
          <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6;">Hello ${fullName || 'User'}, we received a request to reset the password for your Sof Umer account. Use the security code below or click the reset button:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ef4444; background: #18181b; border: 2px dashed #ef4444; padding: 16px 32px; border-radius: 8px;">
              ${code}
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px;">Reset Password Now</a>
          </div>

          <p style="color: #a1a1aa; font-size: 13px;">This security reset code is valid for 15 minutes. If you did not request a password reset, please secure your account immediately or disregard this message.</p>
        </div>
        <div style="background-color: #18181b; padding: 16px; text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #27272a;">
          &copy; ${new Date().getFullYear()} Sof Umer Marketplace. All rights reserved.
        </div>
      </div>
    `;
    return sendEmail({ to: toEmail, subject, html });
  }

  // Helper to determine if a user has administrator / owner / employee admin permissions
  function isUserAdmin(user: any): boolean {
    if (!user) return false;
    if (user.status === 'suspended') return false;
    if (user.email && user.email.toLowerCase() === 'jemaljima@gmail.com') return true;
    const role = (user.role || '').toLowerCase();
    const adminRoles = ['admin', 'owner', 'superadmin'];
    if (adminRoles.includes(role)) return true;
    if (user.isAdmin || user.isOwner || user.isSuperAdmin || user.isEmployee) return true;
    return false;
  }

  // Secure Helper middleware to verify real secure user JWT
  app.use(async (req, res, next) => {
    let token: string | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.purpose === '2fa_login') {
          // Temporary 2FA token cannot be used to authenticate general endpoints
          (req as any).user = undefined;
          return next();
        }
        const targetUserId = decoded.userId || decoded.id;
        const user = localDb.users.find(u => u.id === targetUserId);
        if (user) {
          if (user.status === 'suspended') {
            return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
          }
          if (user.tokenVersion && user.tokenVersion !== decoded.tokenVersion) {
            (req as any).user = undefined;
          } else {
            (req as any).user = user;
          }
        }
      } catch (e) {
        (req as any).user = undefined;
      }
    }
    next();
  });

  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!isUserAdmin(user)) {
      return res.status(403).json({ error: 'Access denied. Admin access required.' });
    }
    next();
  };

  // --- API ROUTES ---

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // CAPTCHA Endpoint
  app.get('/api/auth/captcha', (req, res) => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const solvedValue = String(num1 + num2);
    const captchaId = jwt.sign({ solution: solvedValue }, JWT_SECRET, { expiresIn: '5m' });
    res.json({
      captchaId,
      question: `What is ${num1} + ${num2}?`
    });
  });

  // Auth Endpoints
  app.post('/api/auth/login', async (req, res) => {
    const { email, phone, username, password, captchaId, captchaAnswer, rememberMe } = req.body;
    const rawInput = (username || email || phone || '').trim();

    if (!rawInput || !password) {
      return res.status(400).json({ error: 'Username, email, or phone number and password are required.' });
    }

    const normEmail = normalizeEmail(rawInput);
    const normPhone = normalizePhone(rawInput);
    const normUsername = rawInput.toLowerCase();

    const user = localDb.users.find(u => 
      (u.username && u.username.toLowerCase() === normUsername) ||
      (u.email && u.email.toLowerCase() === normEmail) ||
      (u.phone && normalizePhone(u.phone) === normPhone)
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your username, email, or password.' });
    }


    // Check temporary lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remaining = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 60000);
      return res.status(403).json({ error: `Too many failed login attempts. This account is temporarily locked. Please try again in ${remaining} minutes.` });
    }

    // CAPTCHA check if failed login attempts >= 3
    if (user.failedLoginAttempts && user.failedLoginAttempts >= 3) {
      if (!captchaId || !captchaAnswer) {
        return res.status(400).json({ error: 'captcha_required', message: 'CAPTCHA verification is required.' });
      }
      try {
        const decodedCaptcha = jwt.verify(captchaId, JWT_SECRET) as any;
        if (String(captchaAnswer).trim() !== String(decodedCaptcha.solution)) {
          return res.status(400).json({ error: 'Invalid CAPTCHA solution.' });
        }
      } catch (e) {
        return res.status(400).json({ error: 'CAPTCHA has expired. Please request a new one.' });
      }
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Please sign in using Google, Phone OTP, or set a password via Password Reset.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      await saveDb();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'unverified',
        email: user.email,
        phone: user.phone,
        message: 'Please verify your account to log in.'
      });
    }

    // Login success - Reset lockout & failed attempts
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.tokenVersion = user.tokenVersion || 1;

    // Login History & Security Device Notifications
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const loginEntry = { ip, userAgent, timestamp: new Date().toISOString(), deviceType };
    
    if (!user.loginHistory) user.loginHistory = [];
    const seenDevices = user.loginHistory.slice(0, 10).map(h => h.userAgent);
    const isNewDevice = seenDevices.length > 0 && !seenDevices.includes(userAgent);
    
    user.loginHistory.unshift(loginEntry);
    if (user.loginHistory.length > 20) {
      user.loginHistory.pop();
    }

    if (isNewDevice) {
      const newNotif = {
        id: 'notif-' + Date.now(),
        userId: user.id,
        title: 'New Device Login Detected',
        message: `A new login was detected from a ${deviceType} device (${userAgent}). If this wasn't you, please change your password or log out of all devices immediately.`,
        type: 'security',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      if (!localDb.notifications) {
        localDb.notifications = [];
      }
      localDb.notifications.push(newNotif as any);
    }

    // 2FA Security Check (Mandatory for Admin accounts, or accounts with twoFactorEnabled: true)
    const isAdmin = isUserAdmin(user);
    const has2FA = Boolean(user.twoFactorEnabled);

    if (has2FA || isAdmin) {
      const temp2faToken = jwt.sign(
        { userId: user.id, purpose: '2fa_login', rememberMe: Boolean(rememberMe) },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      let setupData = null;
      if (isAdmin && !has2FA) {
        let rawSecret = decryptSecret(user.tempTwoFactorSecret || '');
        if (!rawSecret) {
          rawSecret = authenticator.generateSecret();
          user.tempTwoFactorSecret = encryptSecret(rawSecret);
        }
        const otpauth = authenticator.keyuri(user.email, 'Sof Umer Admin', rawSecret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);
        setupData = {
          secret: rawSecret,
          qrCodeUrl,
          otpauthUri: otpauth
        };
      }

      await saveDb();

      return res.json({
        requires2FA: true,
        requires2FASetup: isAdmin && !has2FA,
        tempToken: temp2faToken,
        email: user.email,
        setupData,
        message: isAdmin && !has2FA
          ? 'Two-Factor Authentication (2FA) is mandatory for Administrator accounts. Please scan the QR code and enter the 6-digit code to complete sign-in.'
          : 'Google Authenticator 2FA verification is required.'
      });
    }

    await saveDb();

    const token = jwt.sign({
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    }, JWT_SECRET, { expiresIn: '365d' });

    res.json({ token, user: stripSecrets(user) });
  });

  // --- GOOGLE AUTHENTICATOR (2FA) API ENDPOINTS ---

  // 1. Generate 2FA Secret & QR Code Data URL
  app.post('/api/auth/2fa/generate', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user as ServerUser;
      const dbUser = localDb.users.find(u => u.id === user.id);
      if (!dbUser) return res.status(404).json({ error: 'User not found.' });

      const secret = authenticator.generateSecret();
      dbUser.tempTwoFactorSecret = encryptSecret(secret);
      await saveDb();

      const otpauth = authenticator.keyuri(dbUser.email, 'Sof Umer Marketplace', secret);
      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      res.json({
        secret,
        qrCodeUrl,
        otpauthUri: otpauth,
        email: dbUser.email
      });
    } catch (err: any) {
      console.error('[2FA] Error generating secret:', err);
      res.status(500).json({ error: 'Failed to generate 2FA setup details.' });
    }
  });

  // 2. Enable Two-Factor Authentication
  app.post('/api/auth/2fa/enable', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user as ServerUser;
      const { token, secret } = req.body;
      const dbUser = localDb.users.find(u => u.id === user.id);
      if (!dbUser) return res.status(404).json({ error: 'User not found.' });

      const secretToVerify = secret || decryptSecret(dbUser.tempTwoFactorSecret || '');
      if (!secretToVerify) {
        return res.status(400).json({ error: 'No pending 2FA setup found. Please generate a new setup QR code.' });
      }

      const inputCode = String(token || '').trim();
      if (inputCode.length !== 6) {
        return res.status(400).json({ error: 'Please enter a valid 6-digit Google Authenticator code.' });
      }

      authenticator.options = { window: 1 };
      const isValid = authenticator.verify({ token: inputCode, secret: secretToVerify });

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your Google Authenticator app and device time.' });
      }

      // Enable 2FA
      dbUser.twoFactorEnabled = true;
      dbUser.encryptedTwoFactorSecret = encryptSecret(secretToVerify);
      dbUser.tempTwoFactorSecret = undefined;

      // Generate 8 Single-use Backup Recovery Codes
      const rawBackupCodes = generateBackupCodes(8);
      dbUser.backupRecoveryCodes = await Promise.all(
        rawBackupCodes.map(c => bcrypt.hash(c.replace('-', '').toUpperCase(), 10))
      );

      // Record Security Event
      if (!dbUser.securityLogs) dbUser.securityLogs = [];
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      dbUser.securityLogs.unshift({
        id: 'sec-' + Date.now(),
        action: '2FA Activated',
        timestamp: new Date().toISOString(),
        ip,
        device: req.headers['user-agent'] || 'Unknown',
        details: 'Google Authenticator TOTP enabled successfully'
      });

      await saveDb();

      res.json({
        success: true,
        backupCodes: rawBackupCodes,
        user: stripSecrets(dbUser),
        message: 'Two-Factor Authentication (2FA) enabled successfully!'
      });
    } catch (err: any) {
      console.error('[2FA] Error enabling 2FA:', err);
      res.status(500).json({ error: 'Failed to enable Two-Factor Authentication.' });
    }
  });

  // 3. Verify 2FA Code during Login Step
  app.post('/api/auth/2fa/verify-login', async (req, res) => {
    try {
      const { tempToken, code, isBackupCode } = req.body;

      if (!tempToken || !code) {
        return res.status(400).json({ error: 'Session token and 2FA code are required.' });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
        if (decoded.purpose !== '2fa_login') throw new Error('Invalid token purpose');
      } catch (e) {
        return res.status(401).json({ error: '2FA session expired. Please sign in with your email and password again.' });
      }

      const user = localDb.users.find(u => u.id === decoded.userId);
      if (!user) return res.status(404).json({ error: 'User profile not found.' });

      // Check 2FA lockout
      if (user.lockout2FAUntil && new Date(user.lockout2FAUntil) > new Date()) {
        const remaining = Math.ceil((new Date(user.lockout2FAUntil).getTime() - Date.now()) / 60000);
        return res.status(403).json({ error: `Too many failed 2FA attempts. Account locked for 2FA verification. Please try again in ${remaining} minutes.` });
      }

      const inputCode = String(code).trim();
      let verified = false;
      let usedBackupCode = false;
      let generatedBackupCodes: string[] | undefined = undefined;

      if (isBackupCode) {
        const cleanBackupCode = inputCode.replace('-', '').toUpperCase();
        if (user.backupRecoveryCodes && user.backupRecoveryCodes.length > 0) {
          for (let i = 0; i < user.backupRecoveryCodes.length; i++) {
            const isMatch = await bcrypt.compare(cleanBackupCode, user.backupRecoveryCodes[i]);
            if (isMatch) {
              verified = true;
              usedBackupCode = true;
              user.backupRecoveryCodes.splice(i, 1);
              break;
            }
          }
        }
      } else {
        const rawSecret = decryptSecret(user.encryptedTwoFactorSecret || user.tempTwoFactorSecret || '');
        if (!rawSecret) {
          return res.status(400).json({ error: '2FA secret not found on account. Please contact support.' });
        }

        authenticator.options = { window: 1 };
        verified = authenticator.verify({ token: inputCode, secret: rawSecret });

        // If this was mandatory admin setup during login, activate 2FA now
        if (verified && user.tempTwoFactorSecret && !user.twoFactorEnabled) {
          user.twoFactorEnabled = true;
          user.encryptedTwoFactorSecret = user.tempTwoFactorSecret;
          user.tempTwoFactorSecret = undefined;
          if (!user.backupRecoveryCodes || user.backupRecoveryCodes.length === 0) {
            generatedBackupCodes = generateBackupCodes(8);
            user.backupRecoveryCodes = await Promise.all(
              generatedBackupCodes.map(c => bcrypt.hash(c.replace('-', '').toUpperCase(), 10))
            );
          }
        }
      }

      if (!verified) {
        user.failed2FAAttempts = (user.failed2FAAttempts || 0) + 1;
        if (user.failed2FAAttempts >= 5) {
          user.lockout2FAUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        }
        await saveDb();
        return res.status(401).json({
          error: isBackupCode
            ? 'Invalid or already used backup recovery code.'
            : 'Invalid 6-digit Google Authenticator code. Please check your app and try again.'
        });
      }

      // Verification Success
      user.failed2FAAttempts = 0;
      user.lockout2FAUntil = undefined;
      user.lastTwoFactorVerification = new Date().toISOString();

      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop';

      if (!user.securityLogs) user.securityLogs = [];
      user.securityLogs.unshift({
        id: 'sec-' + Date.now(),
        action: usedBackupCode ? '2FA Backup Code Login' : '2FA Login Verified',
        timestamp: new Date().toISOString(),
        ip,
        device: userAgent,
        details: usedBackupCode ? 'LoggedIn using single-use backup code' : 'Google Authenticator TOTP verified'
      });

      if (!user.loginHistory) user.loginHistory = [];
      user.loginHistory.unshift({ ip, userAgent, timestamp: new Date().toISOString(), deviceType });

      await saveDb();

      const token = jwt.sign({
        userId: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion || 1
      }, JWT_SECRET, { expiresIn: decoded.rememberMe ? '30d' : '7d' });

      res.json({
        token,
        user: stripSecrets(user),
        backupCodes: generatedBackupCodes,
        message: 'Two-Factor Authentication verified successfully!'
      });
    } catch (err: any) {
      console.error('[2FA] Error verifying 2FA login:', err);
      res.status(500).json({ error: 'Internal server error during 2FA verification.' });
    }
  });

  // 4. Disable Two-Factor Authentication (User optional, blocked for Admin)
  app.post('/api/auth/2fa/disable', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user as ServerUser;
      const { password, code } = req.body;

      const dbUser = localDb.users.find(u => u.id === user.id);
      if (!dbUser) return res.status(404).json({ error: 'User not found.' });

      // Admin 2FA mandatory rule
      if (dbUser.role === 'admin' || dbUser.isEmployee) {
        return res.status(403).json({ error: 'Two-Factor Authentication is mandatory for Administrators and cannot be disabled.' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Account password is required to disable 2FA.' });
      }

      const isPassMatch = await bcrypt.compare(password, dbUser.passwordHash || '');
      if (!isPassMatch) {
        return res.status(400).json({ error: 'Incorrect password entered.' });
      }

      if (code) {
        const inputCode = String(code).trim();
        const rawSecret = decryptSecret(dbUser.encryptedTwoFactorSecret || '');
        authenticator.options = { window: 1 };
        const isCodeValid = authenticator.verify({ token: inputCode, secret: rawSecret });
        if (!isCodeValid) {
          return res.status(400).json({ error: 'Invalid 6-digit Google Authenticator code.' });
        }
      }

      dbUser.twoFactorEnabled = false;
      dbUser.encryptedTwoFactorSecret = undefined;
      dbUser.tempTwoFactorSecret = undefined;
      dbUser.backupRecoveryCodes = [];

      if (!dbUser.securityLogs) dbUser.securityLogs = [];
      dbUser.securityLogs.unshift({
        id: 'sec-' + Date.now(),
        action: '2FA Disabled',
        timestamp: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
        device: req.headers['user-agent'] || 'Unknown',
        details: 'Two-Factor Authentication disabled'
      });

      await saveDb();

      res.json({
        success: true,
        user: stripSecrets(dbUser),
        message: 'Two-Factor Authentication disabled.'
      });
    } catch (err: any) {
      console.error('[2FA] Error disabling 2FA:', err);
      res.status(500).json({ error: 'Failed to disable 2FA.' });
    }
  });

  // 5. Verify 2FA for Sensitive Actions
  app.post('/api/auth/2fa/verify-action', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user as ServerUser;
      const { code, isBackupCode } = req.body;
      const dbUser = localDb.users.find(u => u.id === user.id);
      if (!dbUser) return res.status(404).json({ error: 'User not found.' });

      if (!dbUser.twoFactorEnabled) {
        return res.json({ verified: true, message: '2FA is not enabled on this account.' });
      }

      if (!code) {
        return res.status(400).json({ error: '2FA 6-digit verification code is required for sensitive operations.' });
      }

      const inputCode = String(code).trim();
      let verified = false;

      if (isBackupCode) {
        const cleanBackupCode = inputCode.replace('-', '').toUpperCase();
        if (dbUser.backupRecoveryCodes && dbUser.backupRecoveryCodes.length > 0) {
          for (let i = 0; i < dbUser.backupRecoveryCodes.length; i++) {
            const isMatch = await bcrypt.compare(cleanBackupCode, dbUser.backupRecoveryCodes[i]);
            if (isMatch) {
              verified = true;
              dbUser.backupRecoveryCodes.splice(i, 1);
              break;
            }
          }
        }
      } else {
        const rawSecret = decryptSecret(dbUser.encryptedTwoFactorSecret || '');
        authenticator.options = { window: 1 };
        verified = authenticator.verify({ token: inputCode, secret: rawSecret });
      }

      if (!verified) {
        return res.status(400).json({ error: 'Invalid 2FA verification code. Action blocked.' });
      }

      dbUser.lastTwoFactorVerification = new Date().toISOString();
      await saveDb();

      res.json({ verified: true, message: '2FA verification successful.' });
    } catch (err: any) {
      console.error('[2FA] Error verifying sensitive action:', err);
      res.status(500).json({ error: 'Failed to verify 2FA code.' });
    }
  });

  // 6. Regenerate Backup Recovery Codes
  app.post('/api/auth/2fa/regenerate-backup-codes', requireAuth, async (req, res) => {
    try {
      const user = (req as any).user as ServerUser;
      const { password, code } = req.body;
      const dbUser = localDb.users.find(u => u.id === user.id);
      if (!dbUser || !dbUser.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA must be enabled to regenerate backup codes.' });
      }

      const isPassMatch = await bcrypt.compare(password, dbUser.passwordHash || '');
      if (!isPassMatch) {
        return res.status(400).json({ error: 'Incorrect password entered.' });
      }

      const rawSecret = decryptSecret(dbUser.encryptedTwoFactorSecret || '');
      authenticator.options = { window: 1 };
      const isCodeValid = authenticator.verify({ token: String(code).trim(), secret: rawSecret });
      if (!isCodeValid) {
        return res.status(400).json({ error: 'Invalid 6-digit Google Authenticator code.' });
      }

      const rawBackupCodes = generateBackupCodes(8);
      dbUser.backupRecoveryCodes = await Promise.all(
        rawBackupCodes.map(c => bcrypt.hash(c.replace('-', '').toUpperCase(), 10))
      );

      if (!dbUser.securityLogs) dbUser.securityLogs = [];
      dbUser.securityLogs.unshift({
        id: 'sec-' + Date.now(),
        action: 'Backup Codes Regenerated',
        timestamp: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
        details: 'Old recovery codes invalidated, 8 new codes issued'
      });

      await saveDb();

      res.json({
        success: true,
        backupCodes: rawBackupCodes,
        user: stripSecrets(dbUser),
        message: 'New backup recovery codes generated successfully.'
      });
    } catch (err: any) {
      console.error('[2FA] Error regenerating backup codes:', err);
      res.status(500).json({ error: 'Failed to regenerate backup codes.' });
    }
  });

  // Phone OTP Routes (Disabled)
  app.post('/api/auth/phone/send-otp', async (req, res) => {
    return res.status(400).json({ error: 'Phone OTP login/registration is currently disabled. Please use email and password.' });
  });

  app.post('/api/auth/phone/verify-otp', async (req, res) => {
    return res.status(400).json({ error: 'Phone OTP login/registration is currently disabled. Please use email and password.' });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { email, fullName, password, phone, role, username } = req.body;
    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);

    if (!normEmail || !fullName || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required.' });
    }

    if (!isValidEmail(normEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    if (username && username.trim()) {
      const normU = username.trim().toLowerCase();
      const existingUser = localDb.users.find(u => u.username && u.username.toLowerCase() === normU);
      if (existingUser) {
        return res.status(400).json({ error: 'This username is already taken. Please choose a different username.' });
      }
    }

    let existing = localDb.users.find(u => u.email && u.email.toLowerCase() === normEmail);
    if (!existing && normPhone) {
      existing = localDb.users.find(u => u.phone && normalizePhone(u.phone) === normPhone);
    }

    if (existing) {
      if (!existing.passwordHash) {
        if (await isPasswordReused(existing, password)) {
          return res.status(400).json({ error: 'You cannot reuse a previous password. Please choose a new password.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        existing.passwordHash = passwordHash;
        pushPasswordToHistory(existing);
        existing.fullName = fullName || existing.fullName;
        if (normPhone) existing.phone = normPhone;
        existing.isVerified = true;
        existing.verificationStatus = 'verified';
        existing.tokenVersion = existing.tokenVersion || 1;
        await saveDb();
        const token = jwt.sign({
          userId: existing.id,
          id: existing.id,
          email: existing.email,
          role: existing.role,
          tokenVersion: existing.tokenVersion
        }, JWT_SECRET, { expiresIn: '365d' });
        return res.json({ token, user: stripSecrets(existing) });
      }
      return res.status(400).json({ error: 'An account with this email address or phone number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const isJemal = normEmail === 'jemaljima@gmail.com';
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newUser: ServerUser = {
      id: 'usr-' + Date.now(),
      email: normEmail,
      phone: normPhone || undefined,
      username: username ? username.trim() : undefined,
      fullName,
      role: isJemal ? 'admin' : (role || 'user'),
      status: 'active',
      isVerified: isJemal ? true : false,
      verificationStatus: isJemal ? 'verified' : 'unverified',
      createdAt: new Date().toISOString(),
      passwordHash,
      passwordHistory: [passwordHash],
      verificationCode,
      verificationCodeExpiresAt,
      tokenVersion: 1,
      loginHistory: []
    };

    localDb.users.push(newUser);
    await saveDb();

    // Dispatch verification email
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    let emailResult = { success: false };
    if (newUser.email) {
      emailResult = await sendVerificationEmail(newUser.email, newUser.fullName, verificationCode, appUrl);
    }

    res.json({
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      email: newUser.email,
      userId: newUser.id,
      emailSent: emailResult.success,
      devVerificationCode: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
    });
  });

  app.post('/api/auth/resend-verification', async (req, res) => {
    const { email } = req.body;
    const normEmail = normalizeEmail(email);
    if (!normEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = localDb.users.find(u => u.email && u.email.toLowerCase() === normEmail);
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'This account is already verified.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await saveDb();

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const emailResult = await sendVerificationEmail(user.email, user.fullName, verificationCode, appUrl);

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
      emailSent: emailResult.success,
      devVerificationCode: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
    });
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    const { email, code } = req.body;
    const normEmail = normalizeEmail(email);
    if (!normEmail || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const user = localDb.users.find(u => u.email && u.email.toLowerCase() === normEmail);
    if (!user || user.verificationCode !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid email or verification code.' });
    }

    if (user.verificationCodeExpiresAt && new Date(user.verificationCodeExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please register again or request a new code.' });
    }

    user.isVerified = true;
    user.verificationStatus = 'verified';
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    user.tokenVersion = user.tokenVersion || 1;

    await saveDb();

    const token = jwt.sign({
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    }, JWT_SECRET, { expiresIn: '365d' });

    res.json({ token, user: stripSecrets(user) });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email, phone, identifier } = req.body;
    const target = normalizeEmail(identifier || email) || normalizePhone(identifier || phone);

    if (!target) {
      return res.status(400).json({ error: 'Email or Phone number is required.' });
    }

    const user = localDb.users.find(u => 
      (u.email && u.email.toLowerCase() === target) ||
      (u.phone && normalizePhone(u.phone) === target)
    );

    if (!user) {
      return res.json({
        success: true,
        message: 'If the account exists, a password reset code has been sent.'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await saveDb();

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    let emailResult = { success: false };
    if (user.email) {
      emailResult = await sendPasswordResetEmail(user.email, user.fullName || 'Valued Member', resetCode, appUrl);
    }

    res.json({
      success: true,
      message: 'Password reset code has been sent to your email address.',
      emailSent: emailResult.success,
      devResetCode: process.env.NODE_ENV !== 'production' ? resetCode : undefined
    });
  });


  app.post('/api/auth/reset-password', async (req, res) => {
    const { email, phone, identifier, code, newPassword } = req.body;
    const target = normalizeEmail(identifier || email) || normalizePhone(identifier || phone);

    if (!target || !code || !newPassword) {
      return res.status(400).json({ error: 'Account identifier, reset code, and new password are required.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    const user = localDb.users.find(u => 
      (u.email && u.email.toLowerCase() === target) ||
      (u.phone && normalizePhone(u.phone) === target)
    );

    if (!user || user.resetPasswordCode !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid account identifier or password reset code.' });
    }

    if (user.resetPasswordCodeExpiresAt && new Date(user.resetPasswordCodeExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new reset code.' });
    }

    // Check Password History Re-use Protection
    if (await isPasswordReused(user, newPassword)) {
      return res.status(400).json({ error: 'You cannot reuse a previous password. Please choose a new password.' });
    }

    pushPasswordToHistory(user);
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpiresAt = undefined;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.tokenVersion = (user.tokenVersion || 1) + 1;

    await saveDb();
    res.json({ success: true, message: 'Password has been reset successfully.' });
  });

  // Authenticated Change Password Endpoint
  app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    const user = (req as any).user as ServerUser;
    const { currPassword, newPassword } = req.body;

    if (!currPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const dbUser = localDb.users.find(u => u.id === user.id);
    if (!dbUser || !dbUser.passwordHash) {
      return res.status(400).json({ error: 'User profile not found or password not set.' });
    }

    const isMatch = await bcrypt.compare(currPassword, dbUser.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    if (await isPasswordReused(dbUser, newPassword)) {
      return res.status(400).json({ error: 'You cannot reuse a previous password. Please choose a new password.' });
    }

    pushPasswordToHistory(dbUser);
    dbUser.passwordHash = await bcrypt.hash(newPassword, 10);
    await saveDb();

    res.json({ success: true, message: 'Password updated successfully.' });
  });

  app.post('/api/auth/logout-all', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const dbUser = localDb.users.find(u => u.id === user.id);
    if (dbUser) {
      dbUser.tokenVersion = (dbUser.tokenVersion || 1) + 1;
      await saveDb();
    }
    res.json({ success: true, message: 'Successfully logged out of all devices.' });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: stripSecrets((req as any).user) });
  });

  app.post('/api/auth/google', async (req, res) => {
    const { email, fullName, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google authentication.' });
    }
    
    // Check if the user already exists by email (case-insensitive)
    const normAuthEmail = normalizeEmail(email);
    let user = localDb.users.find(u => u.email && normalizeEmail(u.email) === normAuthEmail);
    let isNew = false;
    
    if (user) {
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
      }
      if (normAuthEmail === 'jemaljima@gmail.com') {
        let updated = false;
        if (user.role !== 'admin') {
          user.role = 'admin';
          updated = true;
        }
        if (!user.isVerified) {
          user.isVerified = true;
          updated = true;
        }
        if (user.verificationStatus !== 'verified') {
          user.verificationStatus = 'verified';
          updated = true;
        }
        if (updated) {
          await saveDb();
        }
      }
    } else {
      isNew = true;
      const isJemal = email.toLowerCase() === 'jemaljima@gmail.com';
      user = {
        id: 'usr-' + Date.now(),
        email: email.toLowerCase(),
        fullName: fullName || (isJemal ? 'Jemal jimma' : 'Google User'),
        role: isJemal ? 'admin' : (role || 'user'),
        status: 'active',
        isVerified: true, // Google auth is verified
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        tokenVersion: 1,
        loginHistory: []
      };
      localDb.users.push(user);
    }

    // Login History & Security Device Notifications
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const loginEntry = { ip, userAgent, timestamp: new Date().toISOString(), deviceType };
    
    if (!user.loginHistory) user.loginHistory = [];
    const seenDevices = user.loginHistory.slice(0, 10).map(h => h.userAgent);
    const isNewDevice = seenDevices.length > 0 && !seenDevices.includes(userAgent);
    
    user.loginHistory.unshift(loginEntry);
    if (user.loginHistory.length > 20) {
      user.loginHistory.pop();
    }

    if (isNewDevice) {
      const newNotif = {
        id: 'notif-' + Date.now(),
        userId: user.id,
        title: 'New Device Login Detected',
        message: `A new login was detected from a ${deviceType} device (${userAgent}). If this wasn't you, please change your password or log out of all devices immediately.`,
        type: 'security',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      if (!localDb.notifications) {
        localDb.notifications = [];
      }
      localDb.notifications.push(newNotif as any);
    }

    user.tokenVersion = user.tokenVersion || 1;

    // 2FA Security Check (Mandatory for Admin accounts, or accounts with twoFactorEnabled: true)
    const isAdmin = isUserAdmin(user);
    const has2FA = Boolean(user.twoFactorEnabled);

    if (has2FA || isAdmin) {
      const temp2faToken = jwt.sign(
        { userId: user.id, purpose: '2fa_login' },
        JWT_SECRET,
        { expiresIn: '10m' }
      );

      let setupData = null;
      if (isAdmin && !has2FA) {
        let rawSecret = decryptSecret(user.tempTwoFactorSecret || '');
        if (!rawSecret) {
          rawSecret = authenticator.generateSecret();
          user.tempTwoFactorSecret = encryptSecret(rawSecret);
        }
        const otpauth = authenticator.keyuri(user.email, 'Sof Umer Admin', rawSecret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);
        setupData = {
          secret: rawSecret,
          qrCodeUrl,
          otpauthUri: otpauth
        };
      }

      await saveDb();

      return res.json({
        requires2FA: true,
        requires2FASetup: isAdmin && !has2FA,
        tempToken: temp2faToken,
        email: user.email,
        setupData,
        message: isAdmin && !has2FA
          ? 'Two-Factor Authentication (2FA) is mandatory for Administrator accounts. Please scan the QR code and enter the 6-digit code to complete sign-in.'
          : 'Google Authenticator 2FA verification is required.'
      });
    }

    await saveDb();

    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    }, JWT_SECRET, { expiresIn: '365d' });

    res.json({ token, user: stripSecrets(user), isNew });
  });

  app.post('/api/upload', async (req, res) => {
    try {
      const { image, media, video, folder } = req.body;
      const mediaPayload = media || image || video;
      if (!mediaPayload) {
        return res.status(400).json({ error: 'Media payload is required.' });
      }
      const mediaUrl = await uploadToCloudinaryIfConfigured(mediaPayload, folder || 'sof_umer_uploads');
      return res.json({
        url: mediaUrl,
        isCloudinary: isCloudinaryConfigured && mediaUrl.startsWith('http')
      });
    } catch (err: any) {
      console.error('[Upload] Error processing media upload:', err);
      return res.status(500).json({ error: err.message || 'Media upload failed' });
    }
  });

  app.put('/api/users/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== id && !isUserAdmin(currentUser)) {
      return res.status(403).json({ error: 'You are not authorized to update this user profile.' });
    }

    const idx = localDb.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      if (updates.username && updates.username.trim()) {
        const normU = updates.username.trim().toLowerCase();
        const existingUser = localDb.users.find(u => u.id !== id && u.username && u.username.toLowerCase() === normU);
        if (existingUser) {
          return res.status(400).json({ error: 'This username is already taken by another user.' });
        }
      }

      // If profile picture is being uploaded/updated as base64, process through Cloudinary
      if (updates.photoUrl && typeof updates.photoUrl === 'string') {
        updates.photoUrl = await uploadToCloudinaryIfConfigured(updates.photoUrl, 'sof_umer/avatars');
      }

      // Prevent non-admins from changing their role or status
      if (!isUserAdmin(currentUser)) {
        delete updates.role;
        delete updates.status;
        delete updates.isVerified;
        delete updates.verificationStatus;
        delete updates.passwordHash;
      } else {
        // If password is updated by admin, check history and hash it
        if (updates.password || updates.temporaryPassword) {
          const newPass = updates.password || updates.temporaryPassword;
          if (!isValidPassword(newPass)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
          }
          if (await isPasswordReused(localDb.users[idx], newPass)) {
            return res.status(400).json({ error: 'You cannot reuse a previous password. Please choose a new password.' });
          }
          pushPasswordToHistory(localDb.users[idx]);
          updates.passwordHash = await bcrypt.hash(newPass, 10);
          delete updates.password;
          delete updates.temporaryPassword;
        }
      }

      localDb.users[idx] = { ...localDb.users[idx], ...updates };
      await saveDb();
      return res.json(stripSecrets(localDb.users[idx]));
    }
    res.status(404).json({ error: 'User not found' });
  });

  app.get('/api/users', requireAdmin, async (req, res) => {
    res.json(localDb.users.map(stripSecrets));
  });

  // Properties Endpoints
  app.get('/api/properties', async (req, res) => {
    res.json(localDb.properties);
  });

  app.get('/api/properties/my-listings', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const userEmailLower = user.email ? user.email.toLowerCase() : '';
    const normPhone = user.phone ? normalizePhone(user.phone) : '';

    const myListings = localDb.properties.filter(p => {
      if (p.ownerId === user.id) return true;
      if (userEmailLower && (((p as any).ownerEmail && (p as any).ownerEmail.toLowerCase() === userEmailLower) || (p.contactEmail && p.contactEmail.toLowerCase() === userEmailLower))) return true;
      if (normPhone && (((p as any).ownerPhone && normalizePhone((p as any).ownerPhone) === normPhone) || (p.contactPhone && normalizePhone(p.contactPhone) === normPhone))) return true;
      return false;
    });

    res.json(myListings);
  });

  app.post('/api/properties', async (req, res) => {
    let authUser: ServerUser | undefined = undefined;
    const propertyData = req.body || {};

    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        console.warn('[POST /api/properties] Validation Error: Invalid request body', req.body);
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Object expected.'
        });
      }

      // Optional auth token resolution for seamless creation from client
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const targetUserId = decoded ? (decoded.userId || decoded.id) : undefined;
          if (targetUserId) {
            authUser = localDb.users.find(u => u.id === targetUserId);
          }
        } catch (e) {
          // Ignore invalid token and fall back to guest/ownerId
        }
      }

      // Fallback owner matching if no valid token
      if (!authUser && propertyData.ownerId) {
        authUser = localDb.users.find(u => u.id === propertyData.ownerId);
      }
      if (!authUser && propertyData.contactEmail) {
        const cEmail = propertyData.contactEmail.trim().toLowerCase();
        authUser = localDb.users.find(u => u.email && u.email.toLowerCase() === cEmail);
      }

      // Validate required fields
      const rawTitle = propertyData.title;
      if (!rawTitle || typeof rawTitle !== 'string' || !rawTitle.trim()) {
        console.warn('[POST /api/properties] Validation Error: Missing required field title', {
          userId: authUser?.id || 'guest',
          title: rawTitle,
          category: propertyData.category
        });
        return res.status(400).json({
          success: false,
          error: 'Title is required for listing creation.'
        });
      }

      const categoryAllowedKeys: Record<string, string[]> = {
        Products: ['subcategory', 'brand', 'model', 'size', 'dimensions', 'color', 'material', 'condition', 'quantity', 'negotiable', 'gender', 'clothing type', 'storage / spec'],
        Properties: ['subcategory', 'property type', 'purpose', 'bedrooms', 'bathrooms', 'toilets', 'toilet', 'area', 'area (m²)', 'furnished', 'furnished status', 'parking', 'parking available', 'floor level', 'ownership', 'ownership / title deed', 'title deed', 'zoning'],
        Vehicles: ['subcategory', 'vehicle type', 'make / brand', 'transmission', 'fuel type', 'engine capacity', 'year', 'mileage', 'mileage (km)', 'color', 'brand', 'condition', 'model'],
        Jobs: ['subcategory', 'job type', 'employment type', 'sector', 'sector / industry', 'industry', 'salary range', 'qualification', 'education required', 'experience', 'experience required', 'deadline', 'application deadline'],
        Services: ['subcategory', 'service type', 'service category', 'pricing unit', 'years of experience', 'coverage area', 'availability', 'opening hours'],
        'Local Businesses': ['subcategory', 'business category', 'business type', 'opening hours', 'website', 'website / social link', 'services offered'],
        Community: ['subcategory', 'post type', 'organizer', 'organizer name / group', 'venue', 'venue / address', 'date', 'time', 'event date & time']
      };

      const majorCat = propertyData.majorCategory || 'Properties';
      const allowedKeys = categoryAllowedKeys[majorCat];
      let cleanAmenities = Array.isArray(propertyData.amenities) ? propertyData.amenities : [];
      if (allowedKeys && cleanAmenities.length > 0) {
        cleanAmenities = cleanAmenities.filter((item: any) => {
          if (typeof item !== 'string') return false;
          if (!item.includes(':')) return true;
          const key = item.split(':')[0].trim().toLowerCase();
          return allowedKeys.includes(key);
        });
      }

      // Check if free listing campaign is active
      const fls = (localDb as any).appSettings?.freeListingSettings || {};
      const isFreeListingEnabled = (() => {
        if (fls.enabled === false) return false;
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
      })();

      const requestedPlan = propertyData.boostPlan || 'free';
      if (!isFreeListingEnabled && requestedPlan === 'free') {
        if (!authUser || !isUserAdmin(authUser)) {
          return res.status(400).json({
            success: false,
            error: 'Free listing campaign is currently disabled or expired. Please select a promotion boost package to list your item.'
          });
        }
      }

      // Safe image processing
      let processedImages: string[] = [];
      if (propertyData.images && Array.isArray(propertyData.images)) {
        try {
          processedImages = await Promise.all(
            propertyData.images.map(async (img: string) => {
              if (typeof img !== 'string') return '';
              try {
                return await uploadToCloudinaryIfConfigured(img, 'sof_umer/properties');
              } catch (imgErr) {
                console.error('[CloudinaryUploadError] Failed image upload, returning raw image string:', imgErr);
                return img;
              }
            })
          );
          processedImages = processedImages.filter(Boolean);
        } catch (imgArrayErr) {
          console.error('[ImageProcessingError] Error uploading property images array:', imgArrayErr);
          processedImages = Array.isArray(propertyData.images) ? propertyData.images.filter((i: any) => typeof i === 'string') : [];
        }
      }

      let processedCoverImage = propertyData.coverImage || '';
      if (processedCoverImage && typeof processedCoverImage === 'string') {
        try {
          processedCoverImage = await uploadToCloudinaryIfConfigured(processedCoverImage, 'sof_umer/properties');
        } catch (coverErr) {
          console.error('[CloudinaryUploadError] Cover image upload failed:', coverErr);
        }
      }

      let processedVideo = propertyData.video || propertyData.videoUrl || '';
      if (processedVideo && typeof processedVideo === 'string') {
        try {
          processedVideo = await uploadToCloudinaryIfConfigured(processedVideo, 'sof_umer/properties');
        } catch (videoErr) {
          console.error('[CloudinaryUploadError] Video upload failed:', videoErr);
        }
      }

      const planDays = (requestedPlan === 'starter' || requestedPlan === 'basic') ? 3 : requestedPlan === 'premium' ? 7 : requestedPlan === 'vip' ? 30 : 0;
      const computedExpiresAt = planDays > 0 ? new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString() : (propertyData.promotionExpiresAt || undefined);

      const isAdmin = isUserAdmin(authUser);
      const createdBy = authUser ? authUser.id : 'usr-guest';
      const createdByName = authUser ? (authUser.fullName || authUser.email) : 'Guest';
      const createdByEmail = authUser ? authUser.email : '';

      let finalOwnerId = '';
      let finalOwnerName = propertyData.ownerName || '';
      let finalOwnerEmail = propertyData.contactEmail || propertyData.ownerEmail || '';
      let finalOwnerPhone = propertyData.contactPhone || propertyData.ownerPhone || '';
      let finalOwnerBusinessName = propertyData.ownerBusinessName || '';
      let finalOwnerAvatar = propertyData.ownerAvatar || '';
      let finalOwnerType = propertyData.ownerType || 'Individual';
      let postedOnBehalf = false;

      // Look up if entered owner email or phone matches a registered user account
      let matchedOwnerUser: ServerUser | undefined = undefined;
      if (finalOwnerEmail) {
        matchedOwnerUser = localDb.users.find(u => u.email && u.email.trim().toLowerCase() === finalOwnerEmail.trim().toLowerCase());
      }
      if (!matchedOwnerUser && finalOwnerPhone) {
        const normPhone = normalizePhone(finalOwnerPhone);
        if (normPhone) {
          matchedOwnerUser = localDb.users.find(u => u.phone && normalizePhone(u.phone) === normPhone);
        }
      }

      if (isAdmin) {
        const isPostingForSelf = !propertyData.postedOnBehalf && (
          (matchedOwnerUser && matchedOwnerUser.id === authUser.id) ||
          (!matchedOwnerUser && (!finalOwnerName || finalOwnerName === authUser.fullName) && (!finalOwnerEmail || finalOwnerEmail.toLowerCase() === authUser.email.toLowerCase()))
        );

        if (isPostingForSelf) {
          finalOwnerId = authUser.id;
          finalOwnerName = authUser.fullName || 'Property Owner';
          finalOwnerEmail = authUser.email;
          finalOwnerPhone = authUser.phone || finalOwnerPhone || '';
          finalOwnerAvatar = (authUser as any).avatar || finalOwnerAvatar || '';
          postedOnBehalf = false;
        } else {
          postedOnBehalf = true;
          if (matchedOwnerUser) {
            finalOwnerId = matchedOwnerUser.id;
            finalOwnerName = finalOwnerName || matchedOwnerUser.fullName || 'Property Owner';
            finalOwnerEmail = finalOwnerEmail || matchedOwnerUser.email;
            finalOwnerPhone = finalOwnerPhone || matchedOwnerUser.phone || '';
            finalOwnerAvatar = finalOwnerAvatar || (matchedOwnerUser as any).avatar || '';
            finalOwnerBusinessName = finalOwnerBusinessName || (matchedOwnerUser as any).businessName || '';
            finalOwnerType = finalOwnerType || (matchedOwnerUser as any).accountType || 'Individual';
          } else {
            finalOwnerId = (propertyData.ownerId && propertyData.ownerId !== authUser.id) ? propertyData.ownerId : ('usr-owner-' + Date.now());
            finalOwnerName = finalOwnerName || 'Property Owner';
          }
        }
      } else {
        if (authUser) {
          finalOwnerId = authUser.id;
          finalOwnerName = authUser.fullName || finalOwnerName || 'Property Owner';
          finalOwnerEmail = authUser.email || finalOwnerEmail;
          finalOwnerPhone = authUser.phone || finalOwnerPhone;
          finalOwnerAvatar = (authUser as any).avatar || finalOwnerAvatar;
        } else {
          finalOwnerId = matchedOwnerUser ? matchedOwnerUser.id : ('usr-guest-' + Date.now());
        }
      }

      const newProperty: Property = {
        id: 'prop-' + Date.now(),
        ...propertyData,
        images: processedImages,
        coverImage: processedCoverImage,
        video: processedVideo,
        videoUrl: processedVideo,
        createdBy,
        createdByName,
        createdByEmail,
        ownerId: finalOwnerId,
        ownerName: finalOwnerName,
        contactEmail: finalOwnerEmail,
        contactPhone: finalOwnerPhone,
        ownerEmail: finalOwnerEmail,
        ownerPhone: finalOwnerPhone,
        ownerBusinessName: finalOwnerBusinessName,
        ownerAvatar: finalOwnerAvatar,
        ownerType: finalOwnerType,
        postedOnBehalf,
        amenities: cleanAmenities,
        brand: propertyData.brand || '',
        condition: propertyData.condition || 'Used - Like New',
        boostPlan: requestedPlan,
        isTopAd: propertyData.isTopAd === true || requestedPlan === 'starter' || requestedPlan === 'basic' || requestedPlan === 'vip',
        isFeatured: propertyData.isFeatured === true || requestedPlan === 'premium' || requestedPlan === 'vip',
        promotionExpiresAt: computedExpiresAt,
        approvalStatus: isAdmin ? (propertyData.approvalStatus || 'approved') : 'pending',
        verificationStatus: isAdmin ? (propertyData.verificationStatus || 'verified') : 'pending',
        isVerifiedListing: isAdmin ? (propertyData.isVerifiedListing !== undefined ? propertyData.isVerifiedListing : true) : false,
        createdAt: new Date().toISOString()
      };

      (newProperty as any).ownerEmail = finalOwnerEmail;
      (newProperty as any).ownerPhone = finalOwnerPhone;
      (newProperty as any).isArchived = false;

      localDb.properties.push(newProperty);
      await saveDb();

      console.log(`[ListingCreated] ID: ${newProperty.id}, Title: "${newProperty.title}", Category: ${newProperty.category}, Images: ${processedImages.length}`);

      return res.status(201).json({
        success: true,
        message: 'Listing created successfully.',
        listing: newProperty,
        ...newProperty
      });
    } catch (err: any) {
      console.error('[ListingCreationError] Detailed failure log:', {
        endpoint: 'POST /api/properties',
        authenticatedUserId: authUser?.id || 'none',
        title: propertyData?.title || 'N/A',
        category: propertyData?.category || 'N/A',
        imageCount: Array.isArray(propertyData?.images) ? propertyData.images.length : 0,
        errorMessage: err.message,
        stackTrace: err.stack
      });

      return res.status(500).json({
        success: false,
        error: err.message || 'An unexpected server error occurred while creating the listing.',
        message: 'Internal server error'
      });
    }
  });

  app.put('/api/properties/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const currentUser = (req as any).user;
    const idx = localDb.properties.findIndex(p => p.id === id);
    if (idx !== -1) {
      const property = localDb.properties[idx];
      const isOwner = property.ownerId === currentUser.id ||
        (currentUser.email && (((property as any).ownerEmail && (property as any).ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) || (property.contactEmail && property.contactEmail.toLowerCase() === currentUser.email.toLowerCase()))) ||
        (currentUser.phone && (((property as any).ownerPhone && normalizePhone((property as any).ownerPhone) === normalizePhone(currentUser.phone)) || (property.contactPhone && normalizePhone(property.contactPhone) === normalizePhone(currentUser.phone))));

      if (!isUserAdmin(currentUser) && !isOwner) {
        return res.status(403).json({ error: 'You are not authorized to edit this listing.' });
      }

      // Auto-heal ownerId if matched by email or phone
      if (isOwner && property.ownerId !== currentUser.id) {
        property.ownerId = currentUser.id;
        (property as any).ownerEmail = currentUser.email;
      }
      
      const prevApproval = property.approvalStatus;
      const prevVerification = property.verificationStatus;
      const isAdmin = isUserAdmin(currentUser);

      // Non-admins editing ANY property information automatically triggers re-approval requirement
      if (!isAdmin) {
        delete updates.verificationStatus;
        delete updates.approvalStatus;
        delete updates.isVerifiedListing;
        delete updates.ownerId;
        delete updates.id;
        delete updates.createdAt;
        delete updates.viewsCount;
        delete updates.favoritesCount;

        // Force re-approval status
        updates.approvalStatus = 'pending';
        updates.verificationStatus = 'pending';
        updates.isVerifiedListing = false;

        const nowIso = new Date().toISOString();
        updates.updatedAt = nowIso;
        updates.updatedBy = currentUser.email || currentUser.fullName || currentUser.id;
        const previousApproveDate = (property as any).lastApprovedAt || (property as any).approvedAt || property.createdAt;
        updates.previousApprovalDate = previousApproveDate;
        updates.lastEditReason = "Edited after approval";

        // Audit Log entry
        const editRecord = {
          id: 'edithist-' + Date.now(),
          editedBy: currentUser.email || currentUser.fullName || currentUser.id,
          editedAt: nowIso,
          reason: "Edited after approval",
          previousApprovalDate: previousApproveDate,
          previousVersion: {
            title: property.title,
            description: property.description,
            price: property.price,
            currency: property.currency,
            category: property.category,
            propertyType: property.propertyType,
            majorCategory: property.majorCategory,
            images: property.images,
            location: property.location,
            contactPhone: property.contactPhone,
            contactEmail: property.contactEmail,
            amenities: property.amenities,
            brand: property.brand,
            condition: property.condition
          },
          newVersion: {
            title: updates.title !== undefined ? updates.title : property.title,
            description: updates.description !== undefined ? updates.description : property.description,
            price: updates.price !== undefined ? updates.price : property.price,
            currency: updates.currency !== undefined ? updates.currency : property.currency,
            category: updates.category !== undefined ? updates.category : property.category,
            propertyType: updates.propertyType !== undefined ? updates.propertyType : property.propertyType,
            majorCategory: updates.majorCategory !== undefined ? updates.majorCategory : property.majorCategory,
            images: updates.images || property.images,
            location: updates.location !== undefined ? updates.location : property.location,
            contactPhone: updates.contactPhone !== undefined ? updates.contactPhone : property.contactPhone,
            contactEmail: updates.contactEmail !== undefined ? updates.contactEmail : property.contactEmail,
            amenities: updates.amenities || property.amenities,
            brand: updates.brand !== undefined ? updates.brand : property.brand,
            condition: updates.condition !== undefined ? updates.condition : property.condition
          }
        };

        const currentEditHistory = Array.isArray((property as any).editHistory) ? (property as any).editHistory : [];
        updates.editHistory = [editRecord, ...currentEditHistory];

        // Notify admins of updated listing requiring review
        if (!localDb.notifications) localDb.notifications = [];
        localDb.notifications.unshift({
          id: 'notif-edit-' + Date.now(),
          userId: 'admin-all',
          title: `Listing Edited: "${updates.title || property.title}"`,
          message: `Listing "${updates.title || property.title}" (ID: ${property.id}) was edited by ${currentUser.fullName || currentUser.email} and requires admin review before publication.`,
          isRead: false,
          createdAt: nowIso
        });
      } else {
        if (updates.verificationStatus !== undefined) {
          updates.isVerifiedListing = updates.verificationStatus === 'verified';
          if (updates.verificationStatus === 'verified') {
            updates.approvalStatus = 'approved';
            updates.lastApprovedAt = new Date().toISOString();
            updates.approvedBy = currentUser.email || currentUser.id;

            // Audit record update for re-approval
            if (Array.isArray((property as any).editHistory) && (property as any).editHistory.length > 0) {
              updates.editHistory = (property as any).editHistory.map((h: any, i: number) => {
                if (i === 0 && !h.approvedAgainAt) {
                  return {
                    ...h,
                    approvedAgainBy: currentUser.email || currentUser.id,
                    approvedAgainAt: new Date().toISOString()
                  };
                }
                return h;
              });
            }
          } else if (updates.verificationStatus === 'rejected') {
            updates.approvalStatus = 'rejected';
          }
        }
      }

      // Process updated listing images through Cloudinary if base64 images are submitted
      if (updates.images && Array.isArray(updates.images)) {
        updates.images = await Promise.all(
          updates.images.map((img: string) => uploadToCloudinaryIfConfigured(img, 'sof_umer/properties'))
        );
      }
      if (updates.coverImage && typeof updates.coverImage === 'string') {
        updates.coverImage = await uploadToCloudinaryIfConfigured(updates.coverImage, 'sof_umer/properties');
      }
      if (updates.video && typeof updates.video === 'string') {
        updates.video = await uploadToCloudinaryIfConfigured(updates.video, 'sof_umer/properties');
        updates.videoUrl = updates.video;
      } else if (updates.videoUrl && typeof updates.videoUrl === 'string') {
        updates.videoUrl = await uploadToCloudinaryIfConfigured(updates.videoUrl, 'sof_umer/properties');
        updates.video = updates.videoUrl;
      }

      localDb.properties[idx] = { ...property, ...updates };

      // Notify listing owner if admin changed verification or approval status
      if (isUserAdmin(currentUser)) {
        const newApproval = localDb.properties[idx].approvalStatus;
        const newVerification = localDb.properties[idx].verificationStatus;

        if ((newApproval && newApproval !== prevApproval) || (newVerification && newVerification !== prevVerification)) {
          if (!localDb.notifications) localDb.notifications = [];
          localDb.notifications.unshift({
            id: 'notif-' + Date.now(),
            userId: property.ownerId,
            title: `Listing Review Update: "${property.title}"`,
            message: `Your listing "${property.title}" has been updated by the Admin team. Status: ${newApproval || 'Approved'} | Verification: ${newVerification || 'Verified'}.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }

      await saveDb();
      return res.json(localDb.properties[idx]);
    }
    res.status(404).json({ error: 'Property not found' });
  });

  // Wallet Endpoints
  app.post('/api/wallet/topup', requireAuth, async (req, res) => {
    const { amount, paymentMethodId, paymentMethodName, proofUrl, referenceNumber } = req.body;
    const currentUser = (req as any).user;
    const userIdx = localDb.users.findIndex(u => u.id === currentUser.id);
    if (userIdx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const txId = 'wtx-' + Date.now();
    const newTx = {
      id: txId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      type: 'topup' as const,
      amount: Number(amount) || 0,
      creditsAmount: Number(amount) || 0,
      description: `Wallet Credit Top-Up via ${paymentMethodName || 'Direct Transfer'}`,
      paymentMethodId,
      paymentMethodName,
      proofUrl,
      referenceNumber,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    const user = localDb.users[userIdx];
    if (!user.walletTransactions) user.walletTransactions = [];
    user.walletTransactions.unshift(newTx);

    // Also add to Receipts for Admin Approval
    const newReceipt: PaymentReceipt = {
      id: 'rec-' + Date.now(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      amount: Number(amount) || 0,
      paymentMethodId: paymentMethodId || 'wallet-topup',
      paymentMethodName: paymentMethodName || 'Bank / Telebirr Top-Up',
      relatedPropertyId: txId,
      relatedPropertyTitle: `Wallet Credits Top-Up (${amount} ETB)`,
      receiptUrlOrFile: proofUrl || referenceNumber || 'Payment Reference Submitted',
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };
    localDb.receipts.unshift(newReceipt);

    await saveDb();
    res.json({ success: true, transaction: newTx, user: stripSecrets(user) });
  });

  app.post('/api/wallet/spend', requireAuth, async (req, res) => {
    const { amount, description, propertyId, promotionType, durationDays } = req.body;
    const currentUser = (req as any).user;
    const userIdx = localDb.users.findIndex(u => u.id === currentUser.id);
    if (userIdx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = localDb.users[userIdx];
    const currentBalance = user.walletBalance || 0;
    const cost = Number(amount) || 0;

    if (currentBalance < cost) {
      return res.status(400).json({ error: `Insufficient wallet balance. You need ${cost} ETB / Credits but have ${currentBalance} Credits.` });
    }

    // Deduct credits
    user.walletBalance = currentBalance - cost;
    if (!user.walletTransactions) user.walletTransactions = [];

    const propIdx = localDb.properties.findIndex(p => p.id === propertyId);
    let propTitle = 'Marketplace Listing';
    if (propIdx !== -1) {
      const prop = localDb.properties[propIdx];
      propTitle = prop.title;

      const days = Number(durationDays) || (promotionType === 'starter' || promotionType === 'basic' ? 3 : promotionType === 'premium' ? 7 : promotionType === 'vip' ? 30 : 7);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      prop.boostPlan = (promotionType === 'starter' || promotionType === 'basic') ? 'starter' : (promotionType === 'premium' ? 'premium' : (promotionType === 'vip' ? 'vip' : promotionType));
      if (promotionType === 'starter' || promotionType === 'basic' || promotionType === 'top_ad' || promotionType === 'vip') {
        prop.isTopAd = true;
      }
      if (promotionType === 'premium' || promotionType === 'featured' || promotionType === 'vip') {
        prop.isFeatured = true;
      }
      (prop as any).promotionStartDate = new Date().toISOString();
      prop.promotionExpiresAt = expiresAt;
    }

    const newTx = {
      id: 'wtx-' + Date.now(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      type: 'spend' as const,
      amount: cost,
      creditsAmount: cost,
      description: description || `Promotion (${promotionType}) for "${propTitle}"`,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      relatedPropertyId: propertyId,
      relatedPropertyTitle: propTitle,
      promotionType
    };

    user.walletTransactions.unshift(newTx);
    await saveDb();

    res.json({ success: true, newBalance: user.walletBalance, transaction: newTx, user: stripSecrets(user) });
  });

  app.post('/api/wallet/approve-tx', requireAdmin, async (req, res) => {
    const { transactionId } = req.body;
    let foundUser = false;

    for (const u of localDb.users) {
      if (!u.walletTransactions) continue;
      const tx = u.walletTransactions.find(t => t.id === transactionId);
      if (tx) {
        tx.status = 'completed';
        u.walletBalance = (u.walletBalance || 0) + (tx.amount || 0);
        foundUser = true;
        break;
      }
    }

    // Update related receipt if any
    const receipt = localDb.receipts.find(r => r.relatedPropertyId === transactionId);
    if (receipt) {
      receipt.status = 'Approved';
    }

    await saveDb();
    res.json({ success: foundUser });
  });

  app.post('/api/wallet/reject-tx', requireAdmin, async (req, res) => {
    const { transactionId, rejectionReason } = req.body;
    let foundUser = false;

    for (const u of localDb.users) {
      if (!u.walletTransactions) continue;
      const tx = u.walletTransactions.find(t => t.id === transactionId);
      if (tx) {
        tx.status = 'rejected';
        foundUser = true;
        break;
      }
    }

    const receipt = localDb.receipts.find(r => r.relatedPropertyId === transactionId);
    if (receipt) {
      receipt.status = 'Rejected';
      if (rejectionReason) receipt.rejectionReason = rejectionReason;
    }

    await saveDb();
    res.json({ success: foundUser });
  });

  app.delete('/api/properties/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;
    const idx = localDb.properties.findIndex(p => p.id === id);
    if (idx !== -1) {
      const property = localDb.properties[idx];
      const isOwner = property.ownerId === currentUser.id ||
        (currentUser.email && (((property as any).ownerEmail && (property as any).ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) || (property.contactEmail && property.contactEmail.toLowerCase() === currentUser.email.toLowerCase()))) ||
        (currentUser.phone && (((property as any).ownerPhone && normalizePhone((property as any).ownerPhone) === normalizePhone(currentUser.phone)) || (property.contactPhone && normalizePhone(property.contactPhone) === normalizePhone(currentUser.phone))));

      if (!isUserAdmin(currentUser) && !isOwner) {
        return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
      }
      localDb.properties = localDb.properties.filter(p => p.id !== id);
      await saveDb();
      return res.json({ success: true, id });
    }
    res.status(404).json({ error: 'Property not found' });
  });

  // Categories Endpoints
  app.get('/api/categories', async (req, res) => {
    res.json(localDb.categories || []);
  });

  app.post('/api/categories', async (req, res) => {
    const { name, description, iconName } = req.body;
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      description: description || '',
      iconName: iconName || 'Grid'
    };
    if (!localDb.categories) {
      localDb.categories = [];
    }
    localDb.categories.push(newCategory);
    await saveDb();
    res.json(newCategory);
  });

  app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, iconName } = req.body;
    if (!localDb.categories) {
      return res.status(404).json({ error: 'Categories not initialized' });
    }
    const idx = localDb.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (name !== undefined) localDb.categories[idx].name = name;
      if (description !== undefined) localDb.categories[idx].description = description;
      if (iconName !== undefined) localDb.categories[idx].iconName = iconName;
      await saveDb();
      return res.json(localDb.categories[idx]);
    }
    res.status(404).json({ error: 'Category not found' });
  });

  app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    if (localDb.categories) {
      localDb.categories = localDb.categories.filter(c => c.id !== id);
    }
    await saveDb();
    res.json({ success: true });
  });

  // App Features / Info Pages Endpoints
  app.get('/api/app-features', async (req, res) => {
    res.json(localDb.appFeatures || []);
  });

  app.post('/api/app-features', requireAdmin, async (req, res) => {
    const { id, titleEn, titleOm, titleAm, contentEn, contentOm, contentAm, iconName } = req.body;
    if (!titleEn || !contentEn) {
      return res.status(400).json({ error: 'Title and content in English are required.' });
    }
    const featureId = id ? id.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : 'feat-' + Date.now();
    const existing = localDb.appFeatures.find(f => f.id === featureId);
    if (existing) {
      return res.status(400).json({ error: 'A feature with this key/ID already exists.' });
    }
    const newFeature: AppFeature = {
      id: featureId,
      titleEn,
      titleOm: titleOm || titleEn,
      titleAm: titleAm || titleEn,
      contentEn,
      contentOm: contentOm || contentEn,
      contentAm: contentAm || contentEn,
      iconName: iconName || 'FileText',
      isSystem: false
    };
    localDb.appFeatures.push(newFeature);
    await saveDb();
    res.json(newFeature);
  });

  app.put('/api/app-features/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { titleEn, titleOm, titleAm, contentEn, contentOm, contentAm, iconName } = req.body;
    const idx = localDb.appFeatures.findIndex(f => f.id === id);
    if (idx !== -1) {
      const feat = localDb.appFeatures[idx];
      if (titleEn !== undefined) feat.titleEn = titleEn;
      if (titleOm !== undefined) feat.titleOm = titleOm;
      if (titleAm !== undefined) feat.titleAm = titleAm;
      if (contentEn !== undefined) feat.contentEn = contentEn;
      if (contentOm !== undefined) feat.contentOm = contentOm;
      if (contentAm !== undefined) feat.contentAm = contentAm;
      if (iconName !== undefined) feat.iconName = iconName;
      await saveDb();
      return res.json(feat);
    }
    res.status(404).json({ error: 'Feature not found.' });
  });

  app.delete('/api/app-features/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const feat = localDb.appFeatures.find(f => f.id === id);
    if (!feat) {
      return res.status(404).json({ error: 'Feature not found.' });
    }
    localDb.appFeatures = localDb.appFeatures.filter(f => f.id !== id);
    await saveDb();
    res.json({ success: true });
  });

  // Job Openings Endpoints
  app.get('/api/job-openings', async (req, res) => {
    res.json(localDb.jobOpenings || []);
  });

  app.post('/api/job-openings', requireAdmin, async (req, res) => {
    const { title, location, department, salary, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
    const newJob: JobOpening = {
      id: 'job-' + Date.now(),
      title,
      location: location || 'Remote (Ethiopia)',
      department: department || 'Operations',
      salary: salary || 'Negotiable',
      description
    };
    localDb.jobOpenings.push(newJob);
    await saveDb();
    res.json(newJob);
  });

  app.put('/api/job-openings/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, location, department, salary, description } = req.body;
    const idx = localDb.jobOpenings.findIndex(j => j.id === id);
    if (idx !== -1) {
      const job = localDb.jobOpenings[idx];
      if (title !== undefined) job.title = title;
      if (location !== undefined) job.location = location;
      if (department !== undefined) job.department = department;
      if (salary !== undefined) job.salary = salary;
      if (description !== undefined) job.description = description;
      await saveDb();
      return res.json(job);
    }
    res.status(404).json({ error: 'Job opening not found.' });
  });

  app.delete('/api/job-openings/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const job = localDb.jobOpenings.find(j => j.id === id);
    if (!job) {
      return res.status(404).json({ error: 'Job opening not found.' });
    }
    localDb.jobOpenings = localDb.jobOpenings.filter(j => j.id !== id);
    await saveDb();
    res.json({ success: true });
  });

  // Payment Methods Endpoints
  app.get('/api/payment-methods', async (req, res) => {
    res.json(localDb.paymentMethods);
  });

  app.post('/api/payment-methods', async (req, res) => {
    const methodData = req.body;
    const newMethod: PaymentMethod = {
      id: 'pay-' + Date.now(),
      isActive: true,
      ...methodData
    };
    localDb.paymentMethods.push(newMethod);
    await saveDb();
    res.json(newMethod);
  });

  app.put('/api/payment-methods/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = localDb.paymentMethods.findIndex(m => m.id === id);
    if (idx !== -1) {
      localDb.paymentMethods[idx] = { ...localDb.paymentMethods[idx], ...updates };
      await saveDb();
      return res.json(localDb.paymentMethods[idx]);
    }
    res.status(404).json({ error: 'Payment method not found' });
  });

  app.delete('/api/payment-methods/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    localDb.paymentMethods = localDb.paymentMethods.filter(m => m.id !== id);
    await saveDb();
    res.json({ success: true });
  });

  // Receipts Endpoints (Manual Receipt Verification Desk)
  // Reviews & Ratings Endpoints
  app.get('/api/reviews', async (req, res) => {
    try {
      if (!localDb.reviews) localDb.reviews = [];
      const { propertyId, sellerId, status } = req.query;
      let list = localDb.reviews;

      if (propertyId) {
        list = list.filter(r => r.propertyId === String(propertyId));
      }
      if (sellerId) {
        list = list.filter(r => r.sellerId === String(sellerId));
      }

      // Check if caller is admin
      const authHeader = req.headers.authorization;
      let isAdminUser = false;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded && (decoded.role === 'admin' || decoded.email === 'jemaljima@gmail.com')) {
            isAdminUser = true;
          }
        } catch (_) {}
      }

      if (!isAdminUser) {
        list = list.filter(r => !r.status || r.status === 'active');
      } else if (status) {
        list = list.filter(r => r.status === String(status));
      }

      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
      if (!localDb.reviews) localDb.reviews = [];
      const currentUser = (req as any).user;
      const { propertyId, sellerId, rating, title, comment } = req.body;

      if (!sellerId) {
        return res.status(400).json({ error: 'sellerId is required.' });
      }

      const parsedRating = Number(rating);
      if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
      }

      if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
        return res.status(400).json({ error: 'Comment is required.' });
      }

      // Prevent self-reviewing
      if (currentUser.id === sellerId) {
        return res.status(400).json({ error: 'You cannot review your own listing or seller profile.' });
      }

      // Check duplicate review by same buyer for same property
      if (propertyId) {
        const existingPropertyReview = localDb.reviews.find(r => r.buyerId === currentUser.id && r.propertyId === propertyId && r.status !== 'hidden');
        if (existingPropertyReview) {
          return res.status(400).json({ error: 'You have already submitted a review for this listing.' });
        }
      }

      let propertyTitle = '';
      if (propertyId) {
        const prop = localDb.properties.find(p => p.id === propertyId);
        if (prop) {
          propertyTitle = typeof prop.title === 'string' ? prop.title : JSON.stringify(prop.title);
        }
      }

      const seller = localDb.users.find(u => u.id === sellerId);
      const sellerName = seller?.fullName || 'Seller';

      const newReview: Review = {
        id: 'rev-' + Date.now(),
        propertyId: propertyId || '',
        propertyTitle: propertyTitle || '',
        sellerId,
        sellerName,
        buyerId: currentUser.id,
        buyerName: currentUser.fullName || 'Verified Buyer',
        buyerEmail: currentUser.email || '',
        rating: parsedRating,
        title: title || '',
        comment: comment.trim(),
        status: 'active',
        createdAt: new Date().toISOString()
      };

      localDb.reviews.unshift(newReview);
      await saveDb();

      return res.status(201).json({ success: true, review: newReview });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to submit review' });
    }
  });

  app.put('/api/reviews/:id/status', requireAdmin, async (req, res) => {
    try {
      if (!localDb.reviews) localDb.reviews = [];
      const { id } = req.params;
      const { status } = req.body;

      const idx = localDb.reviews.findIndex(r => r.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (!['active', 'hidden', 'flagged'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      localDb.reviews[idx].status = status;
      await saveDb();

      return res.json({ success: true, review: localDb.reviews[idx] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update review status' });
    }
  });

  app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
    try {
      if (!localDb.reviews) localDb.reviews = [];
      const { id } = req.params;

      const review = localDb.reviews.find(r => r.id === id);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      localDb.reviews = localDb.reviews.filter(r => r.id !== id);
      await saveDb();

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete review' });
    }
  });

  // Receipts Endpoints (Manual Receipt Verification Desk)
  app.get('/api/receipts', async (req, res) => {
    res.json(localDb.receipts);
  });

  app.post('/api/receipts', async (req, res) => {
    const receiptData = req.body;
    const newReceipt: PaymentReceipt = {
      id: 'rcpt-' + Date.now(),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      ...receiptData
    };
    localDb.receipts.push(newReceipt);

    // Create a notification for the admin about a new receipt submission
    localDb.notifications.push({
      id: 'notif-' + Date.now(),
      userId: 'usr-admin',
      title: 'New Payment Receipt Submitted',
      message: `${receiptData.userEmail} submitted a receipt of ${receiptData.amount} ETB/USD for ${receiptData.relatedPropertyTitle}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json(newReceipt);
  });

  app.put('/api/receipts/:id', async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;
    const idx = localDb.receipts.findIndex(r => r.id === id);
    if (idx !== -1) {
      const receipt = localDb.receipts[idx];
      receipt.status = status;
      if (adminNotes !== undefined) receipt.adminNotes = adminNotes;
      if (rejectionReason !== undefined) receipt.rejectionReason = rejectionReason;
      
      // Automatically sync wallet balances and transactions for topup approvals/rejections
      syncAllWalletBalances();

      // If this receipt is linked to a property promotion/listing, activate promotion & verify property!
      if (receipt.relatedPropertyId && status === 'Approved') {
        const prop = localDb.properties.find(p => p.id === receipt.relatedPropertyId);
        if (prop) {
          prop.isFeatured = true;
          prop.verificationStatus = 'verified';
          prop.isVerifiedListing = true;
          if (!prop.boostPlan) prop.boostPlan = 'vip';
          prop.isTopAd = true;
        }
      }

      // Find user to include updated balance in notification
      const targetUser = localDb.users.find(u => u.id === receipt.userId || (u.email && receipt.userEmail && u.email.toLowerCase() === receipt.userEmail.toLowerCase()));
      const userBalance = targetUser ? (targetUser.walletBalance || 0) : 0;

      // Notify the user about their payment status update
      localDb.notifications.push({
        id: 'notif-' + Date.now() + '-user',
        userId: receipt.userId,
        title: `Payment Receipt ${status}`,
        message: status === 'Approved' 
          ? `Your payment receipt for "${receipt.relatedPropertyTitle}" has been approved! ${receipt.amount ? receipt.amount + ' ETB has been processed successfully.' : ''}`
          : `Your payment receipt for "${receipt.relatedPropertyTitle}" was rejected. Reason: ${rejectionReason || 'Receipt was invalid.'}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      await saveDb();
      return res.json({ ...receipt, userBalance });
    }
    res.status(404).json({ error: 'Receipt not found' });
  });

  // Batch approve pending receipts
  app.post('/api/receipts/approve-all', requireAdmin, async (req, res) => {
    let count = 0;
    for (const receipt of localDb.receipts) {
      if (receipt.status === 'Pending') {
        receipt.status = 'Approved';
        receipt.adminNotes = 'Batch approved by Administrator.';
        count++;

        if (receipt.relatedPropertyId) {
          const prop = localDb.properties.find(p => p.id === receipt.relatedPropertyId);
          if (prop) {
            prop.isFeatured = true;
            prop.verificationStatus = 'verified';
            prop.isVerifiedListing = true;
            if (!prop.boostPlan) prop.boostPlan = 'vip';
            prop.isTopAd = true;
          }
        }
      }
    }
    syncAllWalletBalances();
    await saveDb();
    res.json({ success: true, count });
  });

  // Batch approve pending listings
  app.post('/api/properties/approve-all', requireAdmin, async (req, res) => {
    let count = 0;
    for (const prop of localDb.properties) {
      if (!prop.verificationStatus || prop.verificationStatus === 'pending') {
        prop.verificationStatus = 'verified';
        prop.isVerifiedListing = true;
        count++;
      }
    }
    await saveDb();
    res.json({ success: true, count });
  });

  // Inquiries / Chats
  app.get('/api/inquiries', async (req, res) => {
    res.json(localDb.inquiries);
  });

  app.post('/api/inquiries', async (req, res) => {
    const { propertyId, propertyTitle, senderId, senderName, receiverId, messageText } = req.body;
    
    // Check if there is an existing inquiry between this user and this property
    let inquiry = localDb.inquiries.find(
      i => i.propertyId === propertyId && i.senderId === senderId
    );

    const newMessage = {
      senderId,
      senderName,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    if (inquiry) {
      inquiry.messages.push(newMessage);
    } else {
      inquiry = {
        id: 'inq-' + Date.now(),
        propertyId,
        propertyTitle,
        senderId,
        senderName,
        receiverId,
        messages: [newMessage],
        createdAt: new Date().toISOString()
      };
      localDb.inquiries.push(inquiry);
    }

    // Push notification to the receiver/property owner
    localDb.notifications.push({
      id: 'notif-' + Date.now() + '-inq',
      userId: receiverId,
      title: 'New Property Inquiry',
      message: `${senderName} sent a message regarding "${propertyTitle}": "${messageText.substring(0, 40)}${messageText.length > 40 ? '...' : ''}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json(inquiry);
  });

  // Delete a single inquiry thread
  app.delete('/api/inquiries/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const index = localDb.inquiries.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry conversation not found.' });
    }
    const targetInquiry = localDb.inquiries[index];
    if (user.role !== 'admin' && targetInquiry.senderId !== user.id && targetInquiry.receiverId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this conversation.' });
    }
    localDb.inquiries.splice(index, 1);
    await saveDb();
    res.json({ success: true, message: 'Inquiry conversation deleted successfully.' });
  });

  // Delete all inquiries for the authenticated user
  app.delete('/api/inquiries', requireAuth, async (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin' && req.query.all === 'true') {
      localDb.inquiries = [];
    } else {
      localDb.inquiries = localDb.inquiries.filter(
        i => i.senderId !== user.id && i.receiverId !== user.id
      );
    }
    await saveDb();
    res.json({ success: true, message: 'All message threads deleted successfully.' });
  });

  // Advertisements
  app.get('/api/advertisements', async (req, res) => {
    res.json(localDb.advertisements);
  });

  app.post('/api/advertisements', async (req, res) => {
    const advData = req.body;
    const authUser = (req as any).user;
    const isAdmin = authUser?.role === 'admin';

    const newAdv: Advertisement = {
      id: 'adv-' + Date.now(),
      ...advData,
      isActive: isAdmin ? (advData.isActive !== undefined ? advData.isActive : true) : false
    };
    localDb.advertisements.push(newAdv);
    await saveDb();
    res.json(newAdv);
  });

  app.put('/api/advertisements/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const authUser = (req as any).user;
    const isAdmin = authUser?.role === 'admin';

    const idx = localDb.advertisements.findIndex(a => a.id === id);
    if (idx !== -1) {
      if (!isAdmin) {
        delete updates.isActive;
      }
      localDb.advertisements[idx] = { ...localDb.advertisements[idx], ...updates };
      await saveDb();
      return res.json(localDb.advertisements[idx]);
    }
    res.status(404).json({ error: 'Advertisement not found' });
  });

  app.delete('/api/advertisements/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    localDb.advertisements = localDb.advertisements.filter(a => a.id !== id);
    await saveDb();
    res.json({ success: true });
  });

  // System Version & Metrics Endpoint (Feature Update v2.5.0)
  app.get('/api/version', (req, res) => {
    res.json({
      version: '2.5.0-production',
      appName: 'Sof Umer Marketplace',
      dataProtection: 'Persistent Storage Active',
      backupStrategy: 'Automated Pre-Migration Backups',
      nodeEnv: process.env.NODE_ENV || 'development',
      renderVolume: DB_FILE.startsWith('/data'),
      timestamp: new Date().toISOString()
    });
  });

  // Languages & Translations
  app.get('/api/languages', async (req, res) => {
    res.json({
      languages: localDb.languages,
      translations: localDb.translations
    });
  });

  app.post('/api/languages', async (req, res) => {
    const lang = req.body; // { code, name }
    const exists = localDb.languages.find(l => l.code === lang.code);
    if (!exists) {
      localDb.languages.push({ ...lang, isActive: true });
      // Add the language empty field to all translation keys
      localDb.translations = localDb.translations.map(t => ({
        ...t,
        [lang.code]: t.en // default to English
      }));
      await saveDb();
    }
    res.json(localDb.languages);
  });

  app.put('/api/languages/translations', async (req, res) => {
    const { translations } = req.body; // Full updated translations list
    if (translations && Array.isArray(translations)) {
      localDb.translations = translations;
      await saveDb();
    }
    res.json({ success: true, translations: localDb.translations });
  });

  app.post('/api/languages/translation-key', requireAdmin, async (req, res) => {
    const { key, en, om, am, category } = req.body;
    if (!key || !en) {
      return res.status(400).json({ error: 'Key and English translation are required.' });
    }
    const cleanKey = key.trim();
    const existingIdx = localDb.translations.findIndex(t => t.key.toLowerCase() === cleanKey.toLowerCase());
    const newEntry = {
      key: cleanKey,
      en: en.trim(),
      om: (om || en).trim(),
      am: (am || en).trim(),
      category: category || 'Custom'
    };
    if (existingIdx !== -1) {
      localDb.translations[existingIdx] = { ...localDb.translations[existingIdx], ...newEntry };
    } else {
      localDb.translations.unshift(newEntry);
    }
    await saveDb();
    res.json({ success: true, translation: newEntry, translations: localDb.translations });
  });

  app.put('/api/languages/:code', async (req, res) => {
    const { code } = req.params;
    const { isActive } = req.body;
    const idx = localDb.languages.findIndex(l => l.code === code);
    if (idx !== -1) {
      localDb.languages[idx].isActive = isActive;
      await saveDb();
      return res.json(localDb.languages[idx]);
    }
    res.status(404).json({ error: 'Language not found' });
  });

  // System Settings
  app.get('/api/system-settings', async (req, res) => {
    if (!(localDb as any).appSettings) {
      (localDb as any).appSettings = {};
    }
    const defaults = {
      appName: 'SOF-UMER',
      appLogoText: 'SOF-UMER',
      logoUrl: '',
      themeName: 'cosmic-slate',
      heroTitle: 'The Smart Way to Discover, Connect & Grow',
      heroDescription: 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.',
      heroImageUrl: '',
      siteStatus: 'Online',
      maintenanceMessage: 'SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience.',
      freeListingSettings: {
        enabled: true,
        startDate: '2026-07-01',
        endDate: '2026-12-31',
        maxFreeListingsPerUser: 5,
        campaignNotice: 'Free Listing Campaign is currently Active! Post your property or product for free.'
      },
      adPackages: [
        {
          id: 'starter',
          name: 'Basic Boost',
          price: 50,
          currency: 'ETB',
          duration: '3 days',
          daysCount: 3,
          views: 'Category top placement',
          badge: 'STARTER',
          desc: 'Category top placement + Basic Verified Badge'
        },
        {
          id: 'premium',
          name: 'Premium Boost',
          price: 150,
          currency: 'ETB',
          duration: '7 days',
          daysCount: 7,
          views: 'Featured hero slider',
          badge: 'PREMIUM',
          desc: 'Featured hero slider + High priority ranking'
        },
        {
          id: 'vip',
          name: 'VIP Elite Boost',
          price: 500,
          currency: 'ETB',
          duration: '30 days',
          daysCount: 30,
          views: 'Top search billboard pin',
          badge: 'VIP ELITE',
          desc: 'Top search billboard pin + Full site promotion'
        }
      ]
    };

    (localDb as any).appSettings = {
      ...defaults,
      ...(localDb as any).appSettings,
      freeListingSettings: {
        ...defaults.freeListingSettings,
        ...((localDb as any).appSettings.freeListingSettings || {})
      },
      adPackages: ((localDb as any).appSettings.adPackages && (localDb as any).appSettings.adPackages.length > 0)
        ? (localDb as any).appSettings.adPackages
        : defaults.adPackages
    };

    // Ensure siteStatus defaults to Online if invalid or empty
    if (!(localDb as any).appSettings.siteStatus) {
      (localDb as any).appSettings.siteStatus = 'Online';
    }

    res.json((localDb as any).appSettings);
  });

  app.post('/api/system-settings/reset-online', async (req, res) => {
    if (!(localDb as any).appSettings) {
      (localDb as any).appSettings = {};
    }
    (localDb as any).appSettings.siteStatus = 'Online';
    await saveDb();
    res.json({ success: true, siteStatus: 'Online', appSettings: (localDb as any).appSettings });
  });

  app.put('/api/system-settings', requireAdmin, async (req, res) => {
    const settings = req.body;
    if (!(localDb as any).appSettings) {
      (localDb as any).appSettings = {};
    }
    (localDb as any).appSettings = {
      ...(localDb as any).appSettings,
      ...settings
    };
    await saveDb();
    res.json((localDb as any).appSettings);
  });

  // Database Backup and Safety Routes
  app.get('/api/admin/database/status', requireAdmin, async (req, res) => {
    try {
      const backupDir = path.join(path.dirname(DB_FILE), 'backups');
      let backups: string[] = [];
      if (fsSync.existsSync(backupDir)) {
        backups = (await fs.readdir(backupDir)).filter(f => f.endsWith('.json'));
      }
      res.json({
        dbPath: DB_FILE,
        isRenderVolume: DB_FILE.startsWith('/data'),
        exists: fsSync.existsSync(DB_FILE),
        userCount: localDb.users ? localDb.users.length : 0,
        propertyCount: localDb.properties ? localDb.properties.length : 0,
        backupsCount: backups.length,
        availableBackups: backups
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/database/backup', requireAdmin, async (req, res) => {
    try {
      await createDatabaseBackup('manual_admin_request');
      res.json({ success: true, message: 'On-demand database backup created successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Email Configuration & Diagnostic Testing Routes
  app.get('/api/admin/email/status', requireAdmin, async (req, res) => {
    res.json({
      resendConfigured: !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()),
      resendSender: process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Sof Umer Marketplace <noreply@sofumerapp.com>',
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      smtpHost: process.env.SMTP_HOST || 'Not Configured',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpFrom: process.env.SMTP_FROM || 'Sof Umer Marketplace <noreply@sofumer.com>',
      activeProvider: (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) ? 'Resend API' : ((process.env.SMTP_HOST && process.env.SMTP_USER) ? 'SMTP' : 'Ethereal Test Inbox / Server Log Capture'),
      recentLogs: recentEmailLogs
    });
  });

  app.post('/api/admin/email/test', requireAdmin, async (req, res) => {
    try {
      const { to } = req.body;
      const targetEmail = normalizeEmail(to || (req as any).user?.email || 'jemaljima@gmail.com');
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const result = await sendEmail({
        to: targetEmail,
        subject: 'Sof Umer Email System Diagnostic Test',
        html: `
          <div style="font-family: Arial; padding: 20px; background: #0c0a09; color: #fff; border-radius: 8px;">
            <h2 style="color: #eab308;">Sof Umer Email System Diagnostic Passed</h2>
            <p>This diagnostic test email was successfully dispatched to <strong>${targetEmail}</strong>.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>App URL: ${appUrl}</p>
          </div>
        `
      });
      res.json({ success: true, targetEmail, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // Reports
  app.get('/api/reports', async (req, res) => {
    res.json(localDb.reports);
  });

  // Support Tickets (User complaints and helpdesk)
  app.get('/api/support-tickets', async (req, res) => {
    res.json(localDb.supportTickets || []);
  });

  app.post('/api/support-tickets', async (req, res) => {
    const { email, subject, message } = req.body;
    const newTicket: SupportTicket = {
      id: 'tkt-' + Date.now(),
      email: email || 'anonymous@sofumer.com',
      subject: subject || 'General Complaint',
      message: message || '',
      status: 'Open',
      reply: '',
      date: new Date().toISOString()
    };
    if (!localDb.supportTickets) localDb.supportTickets = [];
    localDb.supportTickets.push(newTicket);

    // Notify administrators of a new complaint
    localDb.notifications.push({
      id: 'notif-' + Date.now() + '-tkt',
      userId: 'usr-admin',
      title: 'New User Complaint Submitted',
      message: `A new ticket was opened by ${email || 'Anonymous'}: "${subject}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json(newTicket);
  });

  app.put('/api/support-tickets/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (!localDb.supportTickets) localDb.supportTickets = [];
    const idx = localDb.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      localDb.supportTickets[idx] = { ...localDb.supportTickets[idx], ...updates };
      await saveDb();
      return res.json(localDb.supportTickets[idx]);
    }
    res.status(404).json({ error: 'Ticket not found' });
  });

  app.delete('/api/support-tickets/:id', async (req, res) => {
    const { id } = req.params;
    if (!localDb.supportTickets) localDb.supportTickets = [];
    localDb.supportTickets = localDb.supportTickets.filter(t => t.id !== id);
    await saveDb();
    res.json({ success: true });
  });



  app.post('/api/reports', async (req, res) => {
    const reportData = req.body;
    const newReport: SafetyReport = {
      id: 'rep-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...reportData
    };
    localDb.reports.push(newReport);

    // Notify administrator
    localDb.notifications.push({
      id: 'notif-' + Date.now() + '-rep',
      userId: 'usr-admin',
      title: 'New Safety/Support Report',
      message: `A complaint was lodged against ${reportData.targetType} "${reportData.targetName}": ${reportData.reason}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json(newReport);
  });

  app.put('/api/reports/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = localDb.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localDb.reports[idx].status = status;
      await saveDb();
      return res.json(localDb.reports[idx]);
    }
    res.status(404).json({ error: 'Report not found' });
  });

  // Notifications Endpoints
  app.get('/api/notifications', async (req, res) => {
    res.json(localDb.notifications);
  });

  app.put('/api/notifications/read', async (req, res) => {
    const { userId } = req.body;
    const targetUserId = userId || ((req as any).user ? (req as any).user.id : undefined);
    localDb.notifications = localDb.notifications.map(n => {
      if (!targetUserId || n.userId === targetUserId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    await saveDb();
    res.json({ success: true });
  });

  app.put('/api/notifications/:id/toggle-read', requireAuth, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const notif = localDb.notifications.find(n => n.id === id);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    if (user.role !== 'admin' && notif.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this notification' });
    }
    notif.isRead = !notif.isRead;
    await saveDb();
    res.json({ success: true, notification: notif });
  });

  app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const index = localDb.notifications.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const targetNotif = localDb.notifications[index];
    if (user.role !== 'admin' && targetNotif.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this notification' });
    }
    localDb.notifications.splice(index, 1);
    await saveDb();
    res.json({ success: true, message: 'Notification deleted successfully' });
  });

  app.delete('/api/notifications', requireAuth, async (req, res) => {
    const user = (req as any).user;
    if (user.role === 'admin' && req.query.all === 'true') {
      localDb.notifications = [];
    } else {
      localDb.notifications = localDb.notifications.filter(n => n.userId !== user.id);
    }
    await saveDb();
    res.json({ success: true, message: 'All notifications deleted successfully' });
  });

  // Offers & Negotiation Endpoints
  app.get('/api/offers', async (req, res) => {
    if (!(localDb as any).offers) (localDb as any).offers = [];
    const user = (req as any).user;
    if (!user) {
      return res.json([]);
    }
    if (user.role === 'admin') {
      return res.json((localDb as any).offers);
    }
    const userOffers = (localDb as any).offers.filter((o: PropertyOffer) => 
      o.buyerId === user.id || o.sellerId === user.id || o.buyerName === user.fullName
    );
    res.json(userOffers);
  });

  app.post('/api/offers', requireAuth, async (req, res) => {
    if (!(localDb as any).offers) (localDb as any).offers = [];
    const { propertyId, amount, message } = req.body;
    const user = (req as any).user;

    if (!propertyId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Property ID and a valid numerical offer amount are required.' });
    }

    const prop = localDb.properties.find(p => p.id === propertyId);
    if (!prop) {
      return res.status(404).json({ error: 'Property listing not found.' });
    }

    if (prop.ownerId === user.id) {
      return res.status(400).json({ error: 'You cannot make an offer on your own listing.' });
    }

    // Check for existing active offer from this buyer for this property
    const existingActiveOffer = (localDb as any).offers.find((o: PropertyOffer) => 
      o.propertyId === propertyId &&
      o.buyerId === user.id &&
      ['Pending', 'Counter Offer'].includes(o.status)
    );

    if (existingActiveOffer) {
      return res.status(400).json({ 
        error: 'You already have an active offer for this property. Please wait for the seller to respond.' 
      });
    }

    const newOffer: PropertyOffer = {
      id: `off-${Date.now()}`,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyImage: prop.images?.[0] || '',
      buyerId: user.id,
      buyerName: user.fullName || user.email,
      sellerId: prop.ownerId,
      sellerName: prop.ownerName,
      amount: Number(amount),
      currency: prop.currency || 'ETB',
      message: message ? String(message).trim() : '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (localDb as any).offers.unshift(newOffer);

    // Create In-App Notification for Seller
    if (!localDb.notifications) localDb.notifications = [];
    localDb.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: prop.ownerId,
      title: 'New Offer Received!',
      message: `${user.fullName || user.email} submitted an offer of ${Number(amount).toLocaleString()} ${prop.currency || 'ETB'} on "${prop.title}".`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json({ success: true, offer: newOffer });
  });

  app.post('/api/offers/:id/respond', requireAuth, async (req, res) => {
    if (!(localDb as any).offers) (localDb as any).offers = [];
    const { id } = req.params;
    const { status, counterAmount, counterMessage } = req.body;
    const user = (req as any).user;

    const offer = (localDb as any).offers.find((o: PropertyOffer) => o.id === id);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found.' });
    }

    if (offer.sellerId !== user.id && offer.buyerId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to respond to this offer.' });
    }

    if (!['Accepted', 'Rejected', 'Counter Offer', 'Expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid offer status.' });
    }

    offer.status = status;
    if (status === 'Counter Offer') {
      if (!counterAmount || Number(counterAmount) <= 0) {
        return res.status(400).json({ error: 'Counter offer amount is required.' });
      }
      offer.counterAmount = Number(counterAmount);
      offer.counterMessage = counterMessage ? String(counterMessage).trim() : '';
    }
    offer.updatedAt = new Date().toISOString();

    const notifyUserId = user.id === offer.sellerId ? offer.buyerId : offer.sellerId;
    const responderName = user.fullName || user.email;

    if (!localDb.notifications) localDb.notifications = [];
    let notifTitle = 'Offer Update';
    let notifMsg = `Your offer on "${offer.propertyTitle}" was updated to ${status}.`;

    if (status === 'Accepted') {
      notifTitle = 'Offer Accepted!';
      notifMsg = `Great news! ${responderName} accepted your offer of ${offer.amount.toLocaleString()} ${offer.currency} on "${offer.propertyTitle}".`;
    } else if (status === 'Rejected') {
      notifTitle = 'Offer Declined';
      notifMsg = `${responderName} declined your offer on "${offer.propertyTitle}".`;
    } else if (status === 'Counter Offer') {
      notifTitle = 'Counter Offer Received';
      notifMsg = `${responderName} sent a counter offer of ${Number(counterAmount).toLocaleString()} ${offer.currency} on "${offer.propertyTitle}".`;
    }

    localDb.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: notifyUserId,
      title: notifTitle,
      message: notifMsg,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    await saveDb();
    res.json({ success: true, offer });
  });

  // Employee Admins & Staff Management APIs
  app.get('/api/employee/custom-roles', async (req, res) => {
    res.json((localDb as any).customRoles || []);
  });

  app.post('/api/employee/custom-roles', async (req, res) => {
    const role = req.body;
    if (!role || !role.name) {
      return res.status(400).json({ error: 'Role name is required.' });
    }
    if (!(localDb as any).customRoles) (localDb as any).customRoles = [];
    (localDb as any).customRoles = (localDb as any).customRoles.filter((r: any) => r.name !== role.name);
    (localDb as any).customRoles.push(role);
    await saveDb();
    res.json({ success: true, customRoles: (localDb as any).customRoles });
  });

  app.delete('/api/employee/custom-roles/:name', async (req, res) => {
    const { name } = req.params;
    if (!(localDb as any).customRoles) (localDb as any).customRoles = [];
    (localDb as any).customRoles = (localDb as any).customRoles.filter((r: any) => r.name !== name);
    await saveDb();
    res.json({ success: true, customRoles: (localDb as any).customRoles });
  });

  app.get('/api/employee/activity-logs', async (req, res) => {
    res.json((localDb as any).activityLogs || []);
  });

  app.post('/api/employee/activity-logs', async (req, res) => {
    const log = req.body;
    if (!log || !log.fullName || !log.action) {
      return res.status(400).json({ error: 'FullName and action are required.' });
    }
    const newLog = {
      id: 'al-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      status: 'success',
      ...log
    };
    if (!(localDb as any).activityLogs) (localDb as any).activityLogs = [];
    (localDb as any).activityLogs.unshift(newLog);
    if ((localDb as any).activityLogs.length > 1000) {
      (localDb as any).activityLogs.pop();
    }
    await saveDb();
    res.json(newLog);
  });

  app.get('/api/employee/login-history', async (req, res) => {
    res.json((localDb as any).loginHistory || []);
  });

  app.post('/api/auth/logout', async (req, res) => {
    const { email } = req.body;
    if (email) {
      const normLogoutEmail = normalizeEmail(email);
      const user = localDb.users.find(u => u.email && normalizeEmail(u.email) === normLogoutEmail);
      if (user && user.isEmployee) {
        if (!(localDb as any).loginHistory) (localDb as any).loginHistory = [];
        const lastEntry = (localDb as any).loginHistory.find((h: any) => h.email === user.email && h.logoutTime === null);
        if (lastEntry) {
          lastEntry.logoutTime = new Date().toISOString();
          await saveDb();
        }
      }
    }
    res.json({ success: true });
  });

  // FAQs Endpoints
  app.get('/api/faqs', async (req, res) => {
    let items = (localDb as any).faqs || [];
    const isAdmin = (req as any).user && (req as any).user.role === 'admin';
    if (!isAdmin) {
      items = items.filter((f: any) => f.status !== 'draft');
    }
    items = [...items].sort((a: any, b: any) => (a.orderIndex || 999) - (b.orderIndex || 999));
    res.json(items);
  });

  app.post('/api/faqs', requireAdmin, async (req, res) => {
    const { category, question, answer, isPopular, status } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ error: 'Category, question, and answer are required.' });
    }
    const newFaq: FAQItem = {
      id: 'faq-' + Date.now(),
      category: category || 'account',
      question: typeof question === 'string' ? { en: question, om: question, am: question } : question,
      answer: typeof answer === 'string' ? { en: answer, om: answer, am: answer } : answer,
      isPopular: Boolean(isPopular),
      status: status || 'published',
      orderIndex: ((localDb as any).faqs?.length || 0) + 1,
      helpfulYes: 0,
      helpfulNo: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!(localDb as any).faqs) (localDb as any).faqs = [];
    (localDb as any).faqs.push(newFaq);
    await saveDb();
    res.json(newFaq);
  });

  app.put('/api/faqs/reorder', requireAdmin, async (req, res) => {
    const { faqIds } = req.body;
    if (Array.isArray(faqIds) && (localDb as any).faqs) {
      const faqMap = new Map((localDb as any).faqs.map((f: any) => [f.id, f]));
      const newFaqs: any[] = [];
      faqIds.forEach((id: string, index: number) => {
        const item = faqMap.get(id) as any;
        if (item) {
          item.orderIndex = index + 1;
          newFaqs.push(item);
          faqMap.delete(id);
        }
      });
      faqMap.forEach(item => newFaqs.push(item));
      (localDb as any).faqs = newFaqs;
      await saveDb();
    }
    res.json({ success: true, faqs: (localDb as any).faqs });
  });

  app.put('/api/faqs/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { category, question, answer, isPopular, status, orderIndex } = req.body;
    const items = (localDb as any).faqs || [];
    const idx = items.findIndex((f: any) => f.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'FAQ item not found.' });
    }
    const faq = items[idx];
    if (category !== undefined) faq.category = category;
    if (question !== undefined) faq.question = typeof question === 'string' ? { en: question, om: question, am: question } : question;
    if (answer !== undefined) faq.answer = typeof answer === 'string' ? { en: answer, om: answer, am: answer } : answer;
    if (isPopular !== undefined) faq.isPopular = Boolean(isPopular);
    if (status !== undefined) faq.status = status;
    if (orderIndex !== undefined) faq.orderIndex = orderIndex;
    faq.updatedAt = new Date().toISOString();

    await saveDb();
    res.json(faq);
  });

  app.post('/api/faqs/:id/vote', async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'yes' or 'no'
    const items = (localDb as any).faqs || [];
    const faq = items.find((f: any) => f.id === id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ item not found.' });
    }
    if (type === 'yes') {
      faq.helpfulYes = (faq.helpfulYes || 0) + 1;
    } else if (type === 'no') {
      faq.helpfulNo = (faq.helpfulNo || 0) + 1;
    }
    await saveDb();
    res.json({ success: true, helpfulYes: faq.helpfulYes, helpfulNo: faq.helpfulNo });
  });

  app.delete('/api/faqs/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    if ((localDb as any).faqs) {
      (localDb as any).faqs = (localDb as any).faqs.filter((f: any) => f.id !== id);
      await saveDb();
    }
    res.json({ success: true });
  });

  // API Fallback 404 Handler
  app.all('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(404).json({
      success: false,
      error: `API endpoint ${req.method} ${req.path} not found.`
    });
  });

  // Global Unhandled Error Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[UnhandledExpressError]', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(err.status || err.statusCode || 500).json({
        success: false,
        error: typeof err === 'string' ? err : (err.message || 'An unexpected error occurred on the server.'),
        message: 'Internal Server Error'
      });
    }
  });

  // PWA Manifest explicitly disabled
  app.get('/manifest.json', (req, res) => {
    res.status(404).json({ error: 'PWA manifest is disabled.' });
  });

  // Service Worker Endpoint (serves self-unregistering script)
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const unregisterScript = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});
`;
    res.send(unregisterScript);
  });

  // Vite Integration for Front-end serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
