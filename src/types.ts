export interface WalletTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'topup' | 'spend' | 'refund';
  amount: number; // in ETB / Credits
  creditsAmount?: number;
  description: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
  proofUrl?: string;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  relatedPropertyId?: string;
  relatedPropertyTitle?: string;
  promotionType?: 'basic' | 'premium' | 'vip' | 'top_ad' | 'featured';
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'disabled';
  isVerified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocument?: string;
  verificationNotes?: string;
  createdAt: string;

  // Wallet
  walletBalance?: number; // In ETB / Credits
  walletTransactions?: WalletTransaction[];

  // Optional Employee Admins fields
  isEmployee?: boolean;
  employeeId?: string;
  phone?: string;
  username?: string;
  department?: string;
  employeeRole?: string;
  permissions?: string[];
  notes?: string;
  photoUrl?: string;
  temporaryPassword?: string;
  lastLogin?: string;

  // Two-Factor Authentication (2FA) & Security
  twoFactorEnabled?: boolean;
  backupRecoveryCodesCount?: number;
  lastTwoFactorVerification?: string;
  securityLogs?: Array<{
    id: string;
    action: string;
    timestamp: string;
    ip?: string;
    device?: string;
    details?: string;
  }>;
  loginHistory?: Array<{
    ip: string;
    userAgent: string;
    timestamp: string;
    deviceType?: string;
  }>;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  images: string[];
  location: string;
  propertyType: string; // Sub-category/type, e.g. Apartments, Houses, Full-time, Tech, Electronics
  category: string; // e.g. Buy, Rent, Full-time, Remote, For Sale, Hourly
  majorCategory?: 'Properties' | 'Vehicles' | 'Jobs' | 'Services' | 'Products' | 'Local Businesses' | 'Community';
  price: number;
  currency: 'ETB' | 'USD' | 'SAR' | 'EUR' | 'AED';
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // sq meters, size, etc.
  amenities: string[]; // generic tags/features
  ownerId: string;
  ownerName: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  isRecommended: boolean;
  createdAt: string;
  isVerifiedListing?: boolean; // badge
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  verificationDocument?: string;
  subCategoryId?: string;

  // Additional fields for Owner attribution & Admin Audit
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerBusinessName?: string;
  ownerAvatar?: string;
  ownerType?: 'Individual' | 'Business' | string;
  postedOnBehalf?: boolean;

  // Post Ad & Promotion extensions
  brand?: string;
  condition?: 'New' | 'Used - Like New' | 'Used - Good' | 'Refurbished' | string;
  boostPlan?: 'free' | 'basic' | 'premium' | 'vip';
  isTopAd?: boolean;
  promotionExpiresAt?: string; // ISO date string
  approvalStatus?: 'approved' | 'pending' | 'rejected';
}

export interface PaymentMethod {
  id: string;
  name: string;
  accountName: string;
  accountNumber: string;
  phoneNumber: string;
  qrCode?: string;
  instructions: string;
  isActive: boolean;
}

export interface PaymentReceipt {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  relatedPropertyId: string;
  relatedPropertyTitle: string;
  receiptUrlOrFile: string; // base64 or custom filename
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes?: string;
  rejectionReason?: string;
  submittedAt: string;
}

export interface Message {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  messages: Message[];
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  position: 'hero' | 'sidebar' | 'banner';
}

export interface Language {
  code: string;
  name: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface TranslationKey {
  key: string;
  en: string;
  om: string;
  am: string;
  category: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterEmail: string;
  targetType: 'property' | 'user';
  targetId: string;
  targetName: string; // Title of property or name of user
  reason: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppFeature {
  id: string;
  titleEn: string;
  titleOm: string;
  titleAm: string;
  contentEn: string;
  contentOm: string;
  contentAm: string;
  iconName?: string;
  isSystem?: boolean;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  department: string;
  salary: string;
  description: string;
}

export interface PropertyOffer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Counter Offer' | 'Expired';
  counterAmount?: number;
  counterMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'Closed';
  reply: string;
  date: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: {
    en: string;
    om: string;
    am: string;
  };
  answer: {
    en: string;
    om: string;
    am: string;
  };
  isPopular?: boolean;
  status?: 'published' | 'draft';
  orderIndex?: number;
  helpfulYes?: number;
  helpfulNo?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FreeListingSettings {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  maxFreeListingsPerUser?: number;
  campaignNotice?: string;
}

export interface AdPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  daysCount?: number;
  views?: string;
  badge?: string;
  desc?: string;
}

export interface SystemSettings {
  appName: string;
  appLogoText: string;
  logoUrl: string;
  appIconUrl?: string;
  faviconUrl?: string;
  pwaIconUrl?: string;
  splashLogoUrl?: string;
  bannerUrl?: string;
  themeName: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImageUrl?: string;
  heroUpdatedAt?: string;
  heroUpdatedBy?: string;
  siteStatus: string;
  maintenanceMessage?: string;
  adPackages?: AdPackage[];
  freeListingSettings?: FreeListingSettings;
  contactUsSettings?: {
    title: string;
    subtitle: string;
    hqTitle: string;
    hqAddress: string;
    location: string;
    email: string;
    phone: string;
  };
}



