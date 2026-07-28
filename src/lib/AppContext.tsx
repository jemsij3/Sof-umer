import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Property, PaymentMethod, PaymentReceipt, Inquiry, Advertisement, Language, TranslationKey, AppNotification, SafetyReport, Category, AppFeature, JobOpening, SupportTicket, PropertyOffer, FAQItem } from '../types';
import { staticTranslations } from './translations';

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
  homepageHeading: string;
  homepageSubheading: string;
  termsAndPrivacy: string;
  notificationsEnabled: boolean;
  siteStatus: string;
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
  t: (key: string) => string;
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
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: 'Sof Umer',
    appLogoText: 'SOF-UMER',
    logoUrl: '',
    bannerUrl: '',
    themeName: 'cosmic-slate',
    homepageHeading: 'Discover Premium Verified Listings in East Africa',
    homepageSubheading: 'Properties, Jobs, Local Businesses, and Community events. Clean, manual-receipt audited, and fully verified.',
    termsAndPrivacy: 'Sof Umer guarantees user security. All listed properties are audited for legal compliance before publishing. Transactions are processed manually by our finance team.',
    notificationsEnabled: true,
    siteStatus: 'Online'
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
        setSystemSettings(JSON.parse(savedSysSettings));
      } catch (e) {}
    }
  }, []);

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

      const [langsData, propsData, payData, receiptsData, inqsData, advsData, notifsData, usersData, reportsData, catsData, featsData, jobsData, sysSettingsData, ticketsData, offersData, faqsData] = await Promise.all([
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
        safeFetchJson('/api/faqs', [])
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

      // Keep currentUser updated with latest balance & details from backend
      if (currentUser) {
        const matchingUser = activeUsers.find(u => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
        if (matchingUser) {
          setCurrentUserState(matchingUser);
          localStorage.setItem('sof_umer_user', JSON.stringify(matchingUser));
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

  // Re-fetch when user changes
  useEffect(() => {
    refreshData();
    // Poll notifications/receipts every 10 seconds for real-time feel
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Translate helper
  const t = (key: string): string => {
    // 1. Try to find in backend translations state
    const translation = translations.find(item => item.key === key);
    if (translation) {
      const val = translation[currentLanguage as keyof TranslationKey] as string;
      if (val) return val;
    }
    // 2. Try to find in client-side static translations list
    const staticTrans = staticTranslations.find(item => item.key === key);
    if (staticTrans) {
      const val = staticTrans[currentLanguage as keyof typeof staticTrans] as string;
      return val || staticTrans.en || key;
    }
    return key;
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
      reorderFaqs
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
