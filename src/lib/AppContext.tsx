import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Property, PaymentMethod, PaymentReceipt, Inquiry, Advertisement, Language, TranslationKey, AppNotification, SafetyReport, Category, AppFeature, JobOpening, SupportTicket, PropertyOffer, FAQItem, Review } from '../types';
import { staticTranslations } from './translations';
import { setGlobalTranslations, getTranslatedCategoryName, getTranslatedSubcategoryName, getTranslatedFieldLabel, getTranslatedOption, getTranslatedPropertyType } from './categoriesData';

export interface AdPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  views?: string;
  badge?: string;
  desc?: string;
}

export interface SystemSettings {
  appName: string;
  appLogoText: string;
  logoUrl: string;
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
  freeListingSettings?: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    maxFreeListingsPerUser?: number;
    campaignNotice?: string;
  };
  contactUsSettings?: {
    title: string;
    subtitle: string;
    hqTitle: string;
    hqAddress: string;
    location: string;
    email: string;
    phone: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtnText: string;
  } | null;
  howItWorksSteps?: Array<{
    id: string;
    stepNumber: string;
    title: string;
    description: string;
  }>;
  marketplaceSettings?: {
    freePlanLimit: number;
    basicBoostPrice: number;
    premiumBoostPrice: number;
    vipBoostPrice: number;
    topAdPrice: number;
    featuredAdPrice: number;
    creditPackages: Array<{
      id: string;
      credits: number;
      priceETB: number;
      bonus: number;
      label: string;
    }>;
  };
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  languages: Language[];
  translations: TranslationKey[];
  properties: Property[];
  paymentMethods: PaymentMethod[];
  receipts: PaymentReceipt[];
  inquiries: Inquiry[];
  advertisements: Advertisement[];
  notifications: AppNotification[];
  users: User[];
  reports: SafetyReport[];
  categories: Category[];
  favorites: string[];
  toggleFavorite: (propId: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  refreshData: () => Promise<void>;
  loading: boolean;
  logout: () => void;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  appFeatures: AppFeature[];
  addAppFeature: (feature: Omit<AppFeature, 'id' | 'isSystem'> & { id?: string }) => Promise<AppFeature>;
  updateAppFeature: (id: string, updates: Partial<Omit<AppFeature, 'id' | 'isSystem'>>) => Promise<AppFeature>;
  deleteAppFeature: (id: string) => Promise<boolean>;
  jobOpenings: JobOpening[];
  addJobOpening: (job: Omit<JobOpening, 'id'>) => Promise<JobOpening>;
  updateJobOpening: (id: string, updates: Partial<Omit<JobOpening, 'id'>>) => Promise<JobOpening>;
  deleteJobOpening: (id: string) => Promise<boolean>;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<SystemSettings>;
  supportTickets: SupportTicket[];
  offers: PropertyOffer[];
  submitOffer: (propertyId: string, amount: number, message?: string) => Promise<{ success: boolean; error?: string; offer?: PropertyOffer }>;
  respondToOffer: (offerId: string, status: 'Accepted' | 'Rejected' | 'Counter Offer', counterAmount?: number, counterMessage?: string) => Promise<{ success: boolean; error?: string; offer?: PropertyOffer }>;
  faqs: FAQItem[];
  addFaq: (faq: Partial<FAQItem>) => Promise<FAQItem>;
  updateFaq: (id: string, updates: Partial<FAQItem>) => Promise<FAQItem>;
  deleteFaq: (id: string) => Promise<boolean>;
  voteFaqHelpful: (id: string, type: 'yes' | 'no') => Promise<boolean>;
  reorderFaqs: (faqIds: string[]) => Promise<boolean>;

  // Wallet and Promotion Methods
  topUpWallet: (amount: number, paymentMethodId: string, paymentMethodName: string, proofUrl?: string, referenceNumber?: string) => Promise<boolean>;
  spendWallet: (amount: number, description: string, propertyId: string, promotionType: 'basic' | 'premium' | 'vip' | 'top_ad' | 'featured', durationDays?: number) => Promise<boolean>;
  approveWalletTx: (transactionId: string) => Promise<boolean>;
  rejectWalletTx: (transactionId: string, reason?: string) => Promise<boolean>;

  // Notification and Inquiry deletion methods
  deleteNotification: (id: string) => Promise<boolean>;
  deleteAllNotifications: () => Promise<boolean>;
  toggleNotificationRead: (id: string) => Promise<boolean>;
  deleteInquiry: (id: string) => Promise<boolean>;
  deleteAllInquiries: () => Promise<boolean>;

  // Reviews & Ratings
  reviews: Review[];
  submitReview: (reviewData: { propertyId?: string; sellerId: string; rating: number; title?: string; comment: string }) => Promise<{ success: boolean; error?: string; review?: Review }>;
  updateReviewStatus: (reviewId: string, status: 'active' | 'hidden' | 'flagged') => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [currentLanguage, setLanguageState] = useState<string>('en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<TranslationKey[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appFeatures, setAppFeatures] = useState<AppFeature[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [offers, setOffers] = useState<PropertyOffer[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: 'SOF-UMER',
    appLogoText: 'SOF-UMER',
    logoUrl: '',
    bannerUrl: '',
    themeName: 'cosmic-slate',
    heroTitle: 'The Smart Way to Discover, Connect & Grow',
    heroDescription: 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.',
    heroImageUrl: '',
    siteStatus: 'Online',
    maintenanceMessage: 'SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience.'
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on load & verify with backend database
  useEffect(() => {
    const savedUser = localStorage.getItem('sof_umer_user');
    const savedToken = localStorage.getItem('sof_umer_token');
    
    if (savedToken) {
      setTokenState(savedToken);
      if (savedUser) {
        try {
          setCurrentUserState(JSON.parse(savedUser));
        } catch (e) {}
      }

      // Re-verify token against backend database to load latest user state
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setCurrentUserState(data.user);
            localStorage.setItem('sof_umer_user', JSON.stringify(data.user));
          }
        } else if (res.status === 401 || res.status === 403) {
          // Only clear session if token is explicitly rejected by backend
          localStorage.removeItem('sof_umer_user');
          localStorage.removeItem('sof_umer_token');
          setCurrentUserState(null);
          setTokenState(null);
        }
      })
      .catch(err => {
        console.warn('Network check for /api/auth/me deferred, retaining active session:', err);
      });
    }
    
    const savedLang = localStorage.getItem('sof_umer_lang');
    if (savedLang) {
      setLanguageState(savedLang);
    }
    const savedFavs = localStorage.getItem('sof_umer_favs');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {}
    }
    const savedSysSettings = localStorage.getItem('sof_umer_sys_settings');
    if (savedSysSettings) {
      try {
        const parsed = JSON.parse(savedSysSettings);
        if (!parsed.siteStatus || parsed.siteStatus === 'Offline') {
          parsed.siteStatus = 'Online';
        }
        if (!parsed.heroTitle || parsed.heroTitle.includes("Connecting Ethiopia")) {
          parsed.heroTitle = 'The Smart Way to Discover, Connect & Grow';
        }
        if (!parsed.heroDescription || parsed.heroDescription.includes("Explore high-value")) {
          parsed.heroDescription = 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.';
        }
        setSystemSettings(parsed);
      } catch (e) {}
    }
  }, []);

  // Complete PWA Removal: Unregister Service Worker & Clear Caches
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name).catch(() => {});
        }
      }).catch(() => {});
    }
    const manifestLink = document.querySelector("link[rel='manifest']");
    if (manifestLink) {
      manifestLink.remove();
    }
  }, []);

  // Dynamic HTML Head Branding Syncing (Favicon, Apple Touch Icon, OG metadata)
  useEffect(() => {
    if (!systemSettings) return;

    const faviconIcon = systemSettings.faviconUrl || systemSettings.appIconUrl || systemSettings.logoUrl || '/favicon.svg';
    const appTitle = systemSettings.appName || 'SOF-UMER';

    // Update Favicon links
    let favIconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (!favIconLink) {
      favIconLink = document.createElement('link');
      favIconLink.rel = 'icon';
      document.head.appendChild(favIconLink);
    }
    if (favIconLink && faviconIcon) {
      favIconLink.href = `${faviconIcon}${faviconIcon.includes('?') ? '&' : '?'}v=${Date.now()}`;
      favIconLink.type = faviconIcon.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    }

    // Update Apple Touch Icon
    let appleTouchLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleTouchLink) {
      appleTouchLink = document.createElement('link');
      appleTouchLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchLink);
    }
    if (appleTouchLink && faviconIcon) {
      appleTouchLink.href = `${faviconIcon}${faviconIcon.includes('?') ? '&' : '?'}v=${Date.now()}`;
    }

    // Update Document Title & Application Name
    if (appTitle) {
      document.title = `${appTitle} | Real Estate & Property Marketplace`;
      const appNameMeta = document.querySelector("meta[name='application-name']");
      if (appNameMeta) appNameMeta.setAttribute('content', appTitle);
      const appleTitleMeta = document.querySelector("meta[name='apple-mobile-web-app-title']");
      if (appleTitleMeta) appleTitleMeta.setAttribute('content', appTitle);
    }
  }, [systemSettings]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('sof_umer_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sof_umer_user');
    }
  };

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem('sof_umer_token', t);
    } else {
      localStorage.removeItem('sof_umer_token');
    }
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('sof_umer_lang', lang);
  };

  const toggleFavorite = (propId: string) => {
    setFavorites(prev => {
      const next = prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId];
      localStorage.setItem('sof_umer_favs', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    if (currentUser) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      }).catch(err => console.error(err));
    }
    setCurrentUser(null);
    setToken(null);
  };

  const refreshData = async () => {
    try {
      const headers: Record<string, string> = {};
      const savedToken = localStorage.getItem('sof_umer_token') || token;
      
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
      }

      const safeFetchJson = async (url: string, defaultValue: any = []) => {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) {
            console.warn(`Fetch to ${url} returned status ${res.status}`);
            return defaultValue;
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn(`Fetch to ${url} returned non-JSON content-type for ${url}`);
            return defaultValue;
          }
          return await res.json();
        } catch (e) {
          console.error(`Failed to fetch or parse JSON from ${url}:`, e);
          return defaultValue;
        }
      };

      const [langsData, propsData, payData, receiptsData, inqsData, advsData, notifsData, usersData, reportsData, catsData, featsData, jobsData, sysSettingsData, ticketsData, offersData, faqsData, reviewsData] = await Promise.all([
        safeFetchJson('/api/languages', { languages: [], translations: [] }),
        safeFetchJson('/api/properties', []),
        safeFetchJson('/api/payment-methods', []),
        safeFetchJson('/api/receipts', []),
        safeFetchJson('/api/inquiries', []),
        safeFetchJson('/api/advertisements', []),
        safeFetchJson('/api/notifications', []),
        safeFetchJson('/api/users', []),
        safeFetchJson('/api/reports', []),
        safeFetchJson('/api/categories', []),
        safeFetchJson('/api/app-features', []),
        safeFetchJson('/api/job-openings', []),
        safeFetchJson('/api/system-settings', null),
        safeFetchJson('/api/support-tickets', []),
        safeFetchJson('/api/offers', []),
        safeFetchJson('/api/faqs', []),
        safeFetchJson('/api/reviews', [])
      ]);

      const activeProperties = propsData || [];
      const activeUsers = Array.isArray(usersData) ? usersData : [];

      setLanguages(langsData.languages || []);
      setTranslations(langsData.translations || []);
      setProperties(activeProperties);
      setPaymentMethods(payData || []);
      setReceipts(receiptsData || []);
      setInquiries(inqsData || []);
      setAdvertisements(advsData || []);
      setNotifications(notifsData || []);
      setUsers(activeUsers);
      setOffers(offersData || []);
      setFaqs(faqsData || []);
      setReviews(reviewsData || []);

      // Keep currentUser updated with latest balance & details from backend
      if (currentUser) {
        const matchingUser = activeUsers.find(u => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
        if (matchingUser) {
          const matchingStr = JSON.stringify(matchingUser);
          if (matchingStr !== JSON.stringify(currentUser)) {
            setCurrentUserState(matchingUser);
            localStorage.setItem('sof_umer_user', matchingStr);
          }
        }
      }

      setReports(reportsData || []);
      setCategories(catsData || []);
      setAppFeatures(featsData || []);
      setJobOpenings(jobsData || []);
      setSupportTickets(ticketsData || []);
      if (sysSettingsData) {
        setSystemSettings(sysSettingsData);
        localStorage.setItem('sof_umer_sys_settings', JSON.stringify(sysSettingsData));
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync global dynamic translation store whenever backend translations update
  useEffect(() => {
    if (translations && Array.isArray(translations) && translations.length > 0) {
      setGlobalTranslations(translations);
    }
  }, [translations]);

  // Re-fetch initial data and start background polling interval
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Translate helper - Single Source of Truth: Admin Translation Dictionary -> staticTranslations -> Categories / Fields Fallback
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) return '';
    const cleanKey = key.trim();
    const lowerKey = cleanKey.toLowerCase();
    const subKey = cleanKey.includes('.') ? cleanKey.split('.').pop() || cleanKey : cleanKey;
    const lowerSubKey = subKey.toLowerCase();

    let result = '';

    // 1. Try to find in backend translations state (Admin Dictionary)
    let translation = translations.find(
      item => item.key === cleanKey ||
              item.key.toLowerCase() === lowerKey ||
              item.key === subKey ||
              item.key.toLowerCase() === lowerSubKey ||
              (item.en && item.en.toLowerCase() === lowerKey) ||
              (item.en && item.en.toLowerCase() === lowerSubKey)
    );
    if (translation) {
      const val = translation[currentLanguage as keyof TranslationKey] as string;
      if (val && val.trim()) result = val;
    }

    // 2. Try to find in client-side static translations list
    if (!result) {
      let staticTrans = staticTranslations.find(
        item => item.key === cleanKey ||
                item.key.toLowerCase() === lowerKey ||
                item.key === subKey ||
                item.key.toLowerCase() === lowerSubKey ||
                (item.en && item.en.toLowerCase() === lowerKey) ||
                (item.en && item.en.toLowerCase() === lowerSubKey)
      );
      if (staticTrans) {
        const val = staticTrans[currentLanguage as keyof typeof staticTrans] as string;
        if (val && val.trim()) result = val;
      }
    }

    // 3. Category Name fallback
    if (!result) {
      const catName = getTranslatedCategoryName(subKey, currentLanguage, translations);
      if (catName && catName !== subKey) result = catName;
    }
    if (!result) {
      const catNameFull = getTranslatedCategoryName(cleanKey, currentLanguage, translations);
      if (catNameFull && catNameFull !== cleanKey) result = catNameFull;
    }

    // 4. Subcategory Name fallback
    if (!result) {
      const subName = getTranslatedSubcategoryName(subKey, currentLanguage, translations);
      if (subName && subName !== subKey) result = subName;
    }
    if (!result) {
      const subNameFull = getTranslatedSubcategoryName(cleanKey, currentLanguage, translations);
      if (subNameFull && subNameFull !== cleanKey) result = subNameFull;
    }

    // 5. Field Label fallback
    if (!result) {
      const fieldLbl = getTranslatedFieldLabel(subKey, currentLanguage);
      if (fieldLbl && fieldLbl !== subKey) result = fieldLbl;
    }

    // 6. Option Value fallback
    if (!result) {
      const optVal = getTranslatedOption(subKey, currentLanguage);
      if (optVal && optVal !== subKey) result = optVal;
    }

    // 7. Property Type fallback
    if (!result) {
      const propType = getTranslatedPropertyType(subKey, currentLanguage);
      if (propType && propType !== subKey) result = propType;
    }

    if (!result) {
      result = cleanKey;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  const addAppFeature = async (feature: Omit<AppFeature, 'id' | 'isSystem'> & { id?: string }): Promise<AppFeature> => {
    const res = await fetch('/api/app-features', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify(feature)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add feature');
    }
    const data = await res.json();
    setAppFeatures(prev => [...prev, data]);
    return data;
  };

  const updateAppFeature = async (id: string, updates: Partial<Omit<AppFeature, 'id' | 'isSystem'>>): Promise<AppFeature> => {
    const res = await fetch(`/api/app-features/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update feature');
    }
    const data = await res.json();
    setAppFeatures(prev => prev.map(f => f.id === id ? data : f));
    return data;
  };

  const deleteAppFeature = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/app-features/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete feature');
    }
    setAppFeatures(prev => prev.filter(f => f.id !== id));
    return true;
  };

  const addJobOpening = async (job: Omit<JobOpening, 'id'>): Promise<JobOpening> => {
    const res = await fetch('/api/job-openings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify(job)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add job opening');
    }
    const data = await res.json();
    setJobOpenings(prev => [...prev, data]);
    return data;
  };

  const updateJobOpening = async (id: string, updates: Partial<Omit<JobOpening, 'id'>>): Promise<JobOpening> => {
    const res = await fetch(`/api/job-openings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update job opening');
    }
    const data = await res.json();
    setJobOpenings(prev => prev.map(j => j.id === id ? data : j));
    return data;
  };

  const deleteJobOpening = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/job-openings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete job opening');
    }
    setJobOpenings(prev => prev.filter(j => j.id !== id));
    return true;
  };

  const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const res = await fetch('/api/system-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update system settings');
    }
    const data = await res.json();
    setSystemSettings(data);
    localStorage.setItem('sof_umer_sys_settings', JSON.stringify(data));
    return data;
  };

  const topUpWallet = async (amount: number, paymentMethodId: string, paymentMethodName: string, proofUrl?: string, referenceNumber?: string): Promise<boolean> => {
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify({ amount, paymentMethodId, paymentMethodName, proofUrl, referenceNumber })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
      await refreshData();
      return true;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit wallet top-up request');
    }
  };

  const spendWallet = async (amount: number, description: string, propertyId: string, promotionType: 'basic' | 'premium' | 'vip' | 'top_ad' | 'featured', durationDays?: number): Promise<boolean> => {
    const res = await fetch('/api/wallet/spend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify({ amount, description, propertyId, promotionType, durationDays })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
      await refreshData();
      return true;
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process promotion');
    }
  };

  const approveWalletTx = async (transactionId: string): Promise<boolean> => {
    const res = await fetch('/api/wallet/approve-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify({ transactionId })
    });
    if (res.ok) {
      await refreshData();
      return true;
    }
    return false;
  };

  const rejectWalletTx = async (transactionId: string, reason?: string): Promise<boolean> => {
    const res = await fetch('/api/wallet/reject-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
      },
      body: JSON.stringify({ transactionId, rejectionReason: reason })
    });
    if (res.ok) {
      await refreshData();
      return true;
    }
    return false;
  };

  const submitOffer = async (propertyId: string, amount: number, message?: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/offers', {
        method: 'POST',
        headers,
        body: JSON.stringify({ propertyId, amount, message })
      });

      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true, offer: data.offer };
      } else {
        return { success: false, error: data.error || 'Failed to submit offer' };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Error submitting offer' };
    }
  };

  const respondToOffer = async (offerId: string, status: 'Accepted' | 'Rejected' | 'Counter Offer', counterAmount?: number, counterMessage?: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status, counterAmount, counterMessage })
      });

      const data = await res.json();
      if (res.ok) {
        await refreshData();
        return { success: true, offer: data.offer };
      } else {
        return { success: false, error: data.error || 'Failed to respond to offer' };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Error responding to offer' };
    }
  };

  const addFaq = async (faq: Partial<FAQItem>): Promise<FAQItem> => {
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(faq)
      });
      if (!res.ok) throw new Error('Failed to add FAQ');
      const data = await res.json();
      await refreshData();
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const updateFaq = async (id: string, updates: Partial<FAQItem>): Promise<FAQItem> => {
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update FAQ');
      const data = await res.json();
      await refreshData();
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteFaq = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      await refreshData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const voteFaqHelpful = async (id: string, type: 'yes' | 'no'): Promise<boolean> => {
    try {
      const res = await fetch(`/api/faqs/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!res.ok) throw new Error('Failed to submit vote');
      const data = await res.json();
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, helpfulYes: data.helpfulYes, helpfulNo: data.helpfulNo } : f));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const reorderFaqs = async (faqIds: string[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/faqs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ faqIds })
      });
      if (!res.ok) throw new Error('Failed to reorder FAQs');
      await refreshData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Update Document Title when App Name changes
  useEffect(() => {
    if (systemSettings?.appName) {
      document.title = `${systemSettings.appName} - Regional Digital Marketplace`;
    }
  }, [systemSettings?.appName]);

  const deleteNotification = async (id: string): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        return true;
      }
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
    return false;
  };

  const deleteAllNotifications = async (): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        if (currentUser) {
          setNotifications(prev => prev.filter(n => n.userId !== currentUser.id));
        } else {
          setNotifications([]);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to delete all notifications:', e);
    }
    return false;
  };

  const toggleNotificationRead = async (id: string): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch(`/api/notifications/${id}/toggle-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          setNotifications(prev => prev.map(n => n.id === id ? data.notification : n));
        } else {
          await refreshData();
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to toggle notification read status:', e);
    }
    return false;
  };

  const deleteInquiry = async (id: string): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(i => i.id !== id));
        return true;
      }
    } catch (e) {
      console.error('Failed to delete inquiry thread:', e);
    }
    return false;
  };

  const deleteAllInquiries = async (): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch('/api/inquiries', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        if (currentUser) {
          setInquiries(prev => prev.filter(i => i.senderId !== currentUser.id && i.receiverId !== currentUser.id));
        } else {
          setInquiries([]);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to delete all inquiries:', e);
    }
    return false;
  };

  const submitReview = async (reviewData: { propertyId?: string; sellerId: string; rating: number; title?: string; comment: string }): Promise<{ success: boolean; error?: string; review?: Review }> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`
        },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.review) {
          setReviews(prev => [data.review, ...prev]);
        }
        return { success: true, review: data.review };
      }
      return { success: false, error: data.error || 'Failed to submit review' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'active' | 'hidden' | 'flagged'): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch(`/api/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
        return true;
      }
    } catch (e) {
      console.error('Failed to update review status:', e);
    }
    return false;
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    try {
      const authHeader = localStorage.getItem('sof_umer_token') || token;
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`
        }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        return true;
      }
    } catch (e) {
      console.error('Failed to delete review:', e);
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      token,
      setToken,
      currentLanguage,
      setLanguage,
      languages,
      translations,
      properties,
      paymentMethods,
      receipts,
      inquiries,
      advertisements,
      notifications,
      users,
      reports,
      categories,
      favorites,
      toggleFavorite,
      t,
      refreshData,
      loading,
      logout,
      sessionExpired,
      setSessionExpired,
      appFeatures,
      addAppFeature,
      updateAppFeature,
      deleteAppFeature,
      jobOpenings,
      addJobOpening,
      updateJobOpening,
      deleteJobOpening,
      systemSettings,
      updateSystemSettings,
      supportTickets,
      offers,
      submitOffer,
      respondToOffer,
      topUpWallet,
      spendWallet,
      approveWalletTx,
      rejectWalletTx,
      faqs,
      addFaq,
      updateFaq,
      deleteFaq,
      voteFaqHelpful,
      reorderFaqs,
      deleteNotification,
      deleteAllNotifications,
      toggleNotificationRead,
      deleteInquiry,
      deleteAllInquiries,
      reviews,
      submitReview,
      updateReviewStatus,
      deleteReview
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
