import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { User, Property, PaymentMethod, PaymentReceipt, Advertisement, TranslationKey, Language, SafetyReport, JobOpening } from '../types';
import { 
  Shield, Users, Languages, Volume2, Grid, HelpCircle, ShieldCheck, 
  AlertOctagon, CreditCard, ClipboardCheck, Trash2, Edit2, ToggleLeft, 
  ToggleRight, Check, X, PlusCircle, AlertCircle, Eye, RefreshCw, 
  CheckCircle2, Briefcase, Wrench, ShoppingBag, Store, Building, 
  TrendingUp, Settings, FileText, Landmark, ShieldAlert, BarChart3, 
  Activity, DollarSign, Percent, Clock, FileCheck, Info, Plus, 
  Calendar, MapPin, ChevronRight, HelpCircle as HelpIcon, BellRing,
  Camera, Image as ImageIcon, Folder, FolderKanban, ChevronDown,
  Mail, Phone, RotateCcw, Zap, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeAdminsModule } from './EmployeeAdminsModule';
import { APP_THEMES, getThemeCSS } from '../lib/themes';
import { extractString } from '../lib/categoriesData';

interface AdminDashboardProps {
  onBackToMarketplace: () => void;
  onOpenCreateModal: () => void;
  onSelectProperty: (prop: Property) => void;
}

export default function AdminDashboard({ onBackToMarketplace, onOpenCreateModal, onSelectProperty }: AdminDashboardProps) {
  const {
    currentUser,
    logout,
    users,
    properties,
    paymentMethods,
    receipts,
    inquiries,
    advertisements,
    languages,
    translations,
    reports,
    categories,
    t,
    refreshData,
    appFeatures,
    addAppFeature,
    updateAppFeature,
    deleteAppFeature,
    jobOpenings,
    addJobOpening,
    updateJobOpening,
    deleteJobOpening,
    systemSettings: globalSystemSettings,
    updateSystemSettings,
    supportTickets,
    faqs,
    addFaq,
    deleteFaq
  } = useApp();

  // Selected core tab corresponding to the 12 requested sections
  const [adminTab, setAdminTab] = useState<
    'overview' | 'users' | 'listings' | 'categories' | 'ads' | 
    'verification' | 'reports' | 'support' | 'languages' | 
    'payments' | 'settings' | 'analytics' | 'employeeAdmins'
  >('overview');

  const isTabAllowed = (tab: string) => {
    if (!currentUser) return false;
    if (currentUser.role !== 'admin') return false;
    if (currentUser.isEmployee !== true) return true; // Super Admin has access to all

    const role = currentUser.employeeRole;
    if (role === 'Content Moderator') {
      return ['listings', 'reports', 'support'].includes(tab);
    } else if (role === 'Customer Support') {
      return ['support', 'reports'].includes(tab);
    } else if (role === 'Verification Officer') {
      return ['verification', 'users', 'listings'].includes(tab);
    } else if (role === 'Advertisement Manager') {
      return ['ads', 'listings'].includes(tab);
    } else if (role === 'Finance Manager') {
      return ['payments', 'analytics'].includes(tab);
    } else if (role === 'Analytics Manager') {
      return ['overview', 'analytics'].includes(tab);
    } else {
      // Custom Role
      const perms = currentUser.permissions || [];
      const allowed: string[] = [];
      if (perms.some(p => ['Review Listings', 'Approve Listings', 'Reject Listings', 'Remove Spam', 'Manage Featured Listings', 'Manage Sponsored Ads'].includes(p))) allowed.push('listings');
      if (perms.some(p => ['Handle Reports', 'Moderate Reviews', 'Resolve Complaints'].includes(p))) allowed.push('reports');
      if (perms.some(p => ['Reply to Users', 'Manage Support Tickets', 'Assist Account Recovery', 'Help Listing Owners'].includes(p))) allowed.push('support');
      if (perms.some(p => ['Verify Users', 'Verify Businesses', 'Verify Property Ownership', 'Review Documents', 'Approve Verification', 'Reject Verification'].includes(p))) allowed.push('verification');
      if (perms.some(p => ['Create Banner Ads', 'Manage Banner Ads', 'Advertisement Reports'].includes(p))) allowed.push('ads');
      if (perms.some(p => ['Review Payments', 'Verify Manual Payments', 'View Transactions', 'Process Refund Requests'].includes(p))) allowed.push('payments');
      if (perms.some(p => ['Dashboard Statistics', 'Revenue Analytics', 'User Analytics', 'Listing Analytics', 'Generate Reports', 'Export Reports', 'Financial Reports'].includes(p))) {
        allowed.push('overview');
        allowed.push('analytics');
      }
      return allowed.includes(tab);
    }
  };

  useEffect(() => {
    if (currentUser?.isEmployee === true) {
      const allTabs = ['overview', 'users', 'listings', 'categories', 'ads', 'verification', 'reports', 'support', 'languages', 'payments', 'settings', 'analytics'];
      const allowed = allTabs.filter(isTabAllowed);
      if (allowed.length > 0 && !allowed.includes(adminTab)) {
        setAdminTab(allowed[0] as any);
      }
    }
  }, [currentUser]);

  // Dynamic App Features State
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [featureForm, setFeatureForm] = useState({
    id: '',
    titleEn: '',
    titleOm: '',
    titleAm: '',
    contentEn: '',
    contentOm: '',
    contentAm: ''
  });

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeature) {
        await updateAppFeature(editingFeature.id, {
          titleEn: featureForm.titleEn,
          titleOm: featureForm.titleOm,
          titleAm: featureForm.titleAm,
          contentEn: featureForm.contentEn,
          contentOm: featureForm.contentOm,
          contentAm: featureForm.contentAm
        });
        alert('App feature updated successfully!');
      } else {
        const customId = featureForm.id.trim().toLowerCase().replace(/\s+/g, '-');
        if (!customId) {
          alert('Please provide a unique feature URL slug / ID');
          return;
        }
        await addAppFeature({
          id: customId,
          titleEn: featureForm.titleEn,
          titleOm: featureForm.titleOm,
          titleAm: featureForm.titleAm,
          contentEn: featureForm.contentEn,
          contentOm: featureForm.contentOm,
          contentAm: featureForm.contentAm
        });
        alert('App feature created successfully!');
      }
      setShowFeatureForm(false);
      setEditingFeature(null);
      setFeatureForm({ id: '', titleEn: '', titleOm: '', titleAm: '', contentEn: '', contentOm: '', contentAm: '' });
      refreshData();
    } catch (err: any) {
      alert('Error saving app feature: ' + err.message);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${id}" feature page?`)) return;
    try {
      const ok = await deleteAppFeature(id);
      if (ok) {
        refreshData();
      } else {
        alert('Failed to delete feature.');
      }
    } catch (err: any) {
      alert('Error deleting feature: ' + err.message);
    }
  };

  // Dynamic Careers Hiring state & handlers
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: '',
    department: '',
    salary: '',
    description: ''
  });

  const handleEditJob = (job: JobOpening) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      location: job.location || '',
      department: job.department || '',
      salary: job.salary || '',
      description: job.description || ''
    });
    setShowJobForm(true);
  };

  const handleNewJob = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      location: 'Addis Ababa (On-site)',
      department: 'Operations',
      salary: 'Negotiable',
      description: ''
    });
    setShowJobForm(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await updateJobOpening(editingJob.id, jobForm);
        alert('Job opening updated successfully!');
      } else {
        await addJobOpening(jobForm);
        alert('Job opening created successfully!');
      }
      setShowJobForm(false);
      setEditingJob(null);
      setJobForm({ title: '', location: '', department: '', salary: '', description: '' });
      refreshData();
    } catch (err: any) {
      alert('Error saving job opening: ' + err.message);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await deleteJobOpening(id);
      refreshData();
    } catch (err: any) {
      alert('Error deleting job opening: ' + err.message);
    }
  };

  // Interactive Sub-States & Modals
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adForm, setAdForm] = useState({ title: '', description: '', imageUrl: '', linkUrl: '', position: 'sidebar' as Advertisement['position'] });

  const [editingPay, setEditingPay] = useState<PaymentMethod | null>(null);
  const [payForm, setPayForm] = useState({ name: '', accountName: '', accountNumber: '', phoneNumber: '', instructions: '' });
  const [showPayForm, setShowPayForm] = useState(false);
  const [expandAdvanced, setExpandAdvanced] = useState(false);

  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');

  const [editingTranslationKey, setEditingTranslationKey] = useState<string | null>(null);
  const [translationEdits, setTranslationEdits] = useState({ en: '', om: '', am: '' });

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', iconName: 'Grid' });

  // Custom User Search/Filter/Edit States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', role: 'user' as 'admin' | 'user', status: 'active' as 'active' | 'suspended' });

  // Custom Listing Filters/Edit States
  const [listingSearch, setListingSearch] = useState('');
  const [listingCatFilter, setListingCatFilter] = useState<string>('all');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'pending' | 'promoted' | 'promotion_requested' | 'verified' | 'rejected'>('all');
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [propForm, setPropForm] = useState({
    title: '', description: '', price: 0, currency: 'ETB' as Property['currency'],
    location: '', propertyType: '', majorCategory: 'Properties' as Property['majorCategory'],
    ownerName: '', contactPhone: '', contactEmail: '',
    verificationStatus: 'pending' as 'pending' | 'verified' | 'rejected'
  });

  // Helper to extract FAQ text regardless of string vs object localization
  const getFaqText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.en || val.om || val.am || Object.values(val)[0] || '';
  };



  const DEFAULT_CLEAN_PACKAGES = [
    { id: 'starter', name: 'Basic Boost', price: 50, currency: 'ETB', duration: '3 days', daysCount: 3, views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'Premium Boost', price: 150, currency: 'ETB', duration: '7 days', daysCount: 7, views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP Elite Boost', price: 500, currency: 'ETB', duration: '30 days', daysCount: 30, views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
  ];

  const [adPackages, setAdPackages] = useState<any[]>(() => {
    if (globalSystemSettings?.adPackages && Array.isArray(globalSystemSettings.adPackages) && globalSystemSettings.adPackages.length > 0) {
      const filtered = globalSystemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'));
      return filtered.length > 0 ? filtered : DEFAULT_CLEAN_PACKAGES;
    }
    return DEFAULT_CLEAN_PACKAGES;
  });

  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editingPkgPrice, setEditingPkgPrice] = useState<number>(0);
  const [editingPkgName, setEditingPkgName] = useState('');
  const [editingPkgDuration, setEditingPkgDuration] = useState('');
  const [editingPkgViews, setEditingPkgViews] = useState('');
  const [editingPkgBadge, setEditingPkgBadge] = useState('');
  const [editingPkgDesc, setEditingPkgDesc] = useState('');

  const handleStartEditPackage = (pkg: any) => {
    setEditingPkgId(pkg.id);
    setEditingPkgPrice(pkg.price);
    setEditingPkgName(pkg.name);
    setEditingPkgDuration(pkg.duration);
    setEditingPkgViews(pkg.views || '');
    setEditingPkgBadge(pkg.badge || 'POPULAR');
    setEditingPkgDesc(pkg.desc || '');
  };

  const handleSaveAdPackage = (pkgId: string) => {
    const updated = adPackages.map(p => {
      if (p.id === pkgId) {
        return {
          ...p,
          price: Number(editingPkgPrice),
          name: editingPkgName,
          duration: editingPkgDuration,
          views: editingPkgViews,
          badge: editingPkgBadge,
          desc: editingPkgDesc
        };
      }
      return p;
    });
    setAdPackages(updated);
    setEditingPkgId(null);
    updateSystemSettings({
      ...(globalSystemSettings || {}),
      adPackages: updated
    }).catch(() => {});
  };

  const handleAddAdPackage = () => {
    const newPkg = {
      id: `pkg-${Date.now()}`,
      name: 'New Custom Promotion Package',
      price: 500,
      currency: 'ETB',
      duration: '7 days',
      views: '3k target',
      badge: 'NEW',
      desc: 'Custom ad & promotion package configured by site admin'
    };
    const updated = [...adPackages, newPkg];
    setAdPackages(updated);
    handleStartEditPackage(newPkg);
    updateSystemSettings({
      ...(globalSystemSettings || {}),
      adPackages: updated
    }).catch(() => {});
  };

  const handleDeleteAdPackage = (pkgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (adPackages.length <= 1) {
      alert('Must maintain at least 1 promotion package.');
      return;
    }
    if (confirm('Delete this promotion package?')) {
      const updated = adPackages.filter(p => p.id !== pkgId);
      setAdPackages(updated);
      if (editingPkgId === pkgId) setEditingPkgId(null);
      updateSystemSettings({
        ...(globalSystemSettings || {}),
        adPackages: updated
      }).catch(() => {});
    }
  };

  const [systemSettings, setSystemSettings] = useState<any>(globalSystemSettings || {
    appName: 'Sof Umer',
    appLogoText: 'SOF-UMER',
    logoUrl: '',
    themeName: 'cosmic-slate',
    homepageHeading: 'Discover Premium Verified Listings in East Africa',
    homepageSubheading: 'Properties, Jobs, Local Businesses, and Community events. Clean, manual-receipt audited, and fully verified.',
    termsAndPrivacy: 'Sof Umer guarantees user security. All listed properties are audited for legal compliance before publishing. Transactions are processed manually by our finance team.',
    notificationsEnabled: true,
    siteStatus: 'Online'
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  useEffect(() => {
    if (globalSystemSettings) {
      setSystemSettings(globalSystemSettings);
    }
  }, [globalSystemSettings]);

  const demoAnalyticsCleared = true;
  const handleClearDemoAnalytics = () => {};
  const handleResetDemoAnalytics = () => {};

  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [ticketReplyId, setTicketReplyId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Contact Us Manager State
  const defaultContactUs = {
    title: 'Contact Us',
    subtitle: 'Have questions or feedback? Send us an inquiry directly.',
    hqTitle: 'Sof Umer Headquarters',
    hqAddress: '6th Floor, Premium Plaza Building, Churchill Road, Addis Ababa, Ethiopia.',
    location: 'Churchill Road, Addis Ababa',
    email: 'info@sofumer.com',
    phone: '+251 911 000 000',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'e.g. Jemal Jimma',
    emailLabel: 'Email Address *',
    emailPlaceholder: 'e.g. jemal@sofumer.com',
    messageLabel: 'Message / Inquiry *',
    messagePlaceholder: 'Describe your inquiry, error or collaboration suggestion here...',
    submitBtnText: 'Send Message'
  };

  const [contactUsData, setContactUsData] = useState<any>(() => {
    if (globalSystemSettings?.contactUsSettings !== undefined) {
      return globalSystemSettings.contactUsSettings;
    }
    try {
      const saved = localStorage.getItem('sof_umer_contact_us_settings');
      return saved ? JSON.parse(saved) : defaultContactUs;
    } catch {
      return defaultContactUs;
    }
  });

  const [editingContactUs, setEditingContactUs] = useState(false);
  const [contactUsForm, setContactUsForm] = useState<any>(() => ({ ...defaultContactUs, ...(contactUsData || {}) }));

  useEffect(() => {
    if (globalSystemSettings?.contactUsSettings !== undefined) {
      setContactUsData(globalSystemSettings.contactUsSettings);
    }
  }, [globalSystemSettings?.contactUsSettings]);

  useEffect(() => {
    if (contactUsData) {
      localStorage.setItem('sof_umer_contact_us_settings', JSON.stringify(contactUsData));
    } else {
      localStorage.removeItem('sof_umer_contact_us_settings');
    }
  }, [contactUsData]);

  const handleSaveContactUs = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      title: contactUsForm.title || defaultContactUs.title,
      subtitle: contactUsForm.subtitle || defaultContactUs.subtitle,
      hqTitle: contactUsForm.hqTitle || defaultContactUs.hqTitle,
      hqAddress: contactUsForm.hqAddress || defaultContactUs.hqAddress,
      location: contactUsForm.location || defaultContactUs.location,
      email: contactUsForm.email || defaultContactUs.email,
      phone: contactUsForm.phone || defaultContactUs.phone,
      fullNameLabel: contactUsForm.fullNameLabel || defaultContactUs.fullNameLabel,
      fullNamePlaceholder: contactUsForm.fullNamePlaceholder || defaultContactUs.fullNamePlaceholder,
      emailLabel: contactUsForm.emailLabel || defaultContactUs.emailLabel,
      emailPlaceholder: contactUsForm.emailPlaceholder || defaultContactUs.emailPlaceholder,
      messageLabel: contactUsForm.messageLabel || defaultContactUs.messageLabel,
      messagePlaceholder: contactUsForm.messagePlaceholder || defaultContactUs.messagePlaceholder,
      submitBtnText: contactUsForm.submitBtnText || defaultContactUs.submitBtnText
    };

    setContactUsData(updated);
    setEditingContactUs(false);

    const newSysSettings = {
      ...systemSettings,
      contactUsSettings: updated
    };
    setSystemSettings(newSysSettings);

    try {
      await updateSystemSettings(newSysSettings);
    } catch (err) {
      console.error('Failed to sync contact us settings:', err);
    }
  };

  const handleDeleteContactUs = async () => {
    if (window.confirm('Are you sure you want to delete/disable the Contact Us card?')) {
      setContactUsData(null);
      setEditingContactUs(false);

      const newSysSettings = {
        ...systemSettings,
        contactUsSettings: null
      };
      setSystemSettings(newSysSettings);

      try {
        await updateSystemSettings(newSysSettings);
      } catch (err) {
        console.error('Failed to sync contact us deletion:', err);
      }
    }
  };

  const handleResetContactUs = async () => {
    setContactUsData(defaultContactUs);
    setContactUsForm(defaultContactUs);

    const newSysSettings = {
      ...systemSettings,
      contactUsSettings: defaultContactUs
    };
    setSystemSettings(newSysSettings);

    try {
      await updateSystemSettings(newSysSettings);
    } catch (err) {
      console.error('Failed to sync contact us reset:', err);
    }
  };

  // How It Works Steps State
  const defaultHowItWorksSteps = [
    {
      id: 'step-01',
      stepNumber: 'Step 01',
      title: 'Create an Account',
      description: 'Sign up in seconds using your email address. Toggle your preferred language (English, Afaan Oromoo, Amharic) from the top language panel.'
    },
    {
      id: 'step-02',
      stepNumber: 'Step 02',
      title: 'Publish or Explore',
      description: 'Post your property, vehicle, product, or job listing using our streamlined form with custom attributes and local coordinates. Or filter thousands of listings.'
    },
    {
      id: 'step-03',
      stepNumber: 'Step 03',
      title: 'Connect & Deal',
      description: 'Use our live chat or contact the seller directly using verified phone numbers. Arrange safe physical inspections, secure legal deals, and trade with peace of mind.'
    }
  ];

  const [howItWorksSteps, setHowItWorksSteps] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sof_umer_how_it_works_steps');
      return saved ? JSON.parse(saved) : defaultHowItWorksSteps;
    } catch {
      return defaultHowItWorksSteps;
    }
  });

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState({ stepNumber: '', title: '', description: '' });
  const [showAddStepForm, setShowAddStepForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('sof_umer_how_it_works_steps', JSON.stringify(howItWorksSteps));
  }, [howItWorksSteps]);

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStepId) {
      setHowItWorksSteps(howItWorksSteps.map(s => s.id === editingStepId ? { ...s, ...stepForm } : s));
      setEditingStepId(null);
    } else {
      const newStep = {
        id: `step-${Date.now()}`,
        stepNumber: stepForm.stepNumber || `Step 0${howItWorksSteps.length + 1}`,
        title: stepForm.title,
        description: stepForm.description
      };
      setHowItWorksSteps([...howItWorksSteps, newStep]);
      setShowAddStepForm(false);
    }
    setStepForm({ stepNumber: '', title: '', description: '' });
  };

  const handleDeleteStep = (id: string) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      setHowItWorksSteps(howItWorksSteps.filter(s => s.id !== id));
    }
  };



  // Whenever paymentMethods change, if they are NOT the default demo ones, save them to localStorage as the active real configuration
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      const isDemo = paymentMethods.some(m => 
        (m.id === 'pay-cbe' && m.accountNumber === '1000345672819') ||
        (m.id === 'pay-telebirr' && m.accountNumber === '0911000000')
      );
      if (!isDemo) {
        localStorage.setItem('sof_umer_payment_methods', JSON.stringify(paymentMethods));
      }
    }
  }, [paymentMethods]);

  // Sync local cache with authoritative server settings
  useEffect(() => {
    if (globalSystemSettings) {
      localStorage.setItem('sof_umer_sys_settings', JSON.stringify(globalSystemSettings));
    }
  }, [globalSystemSettings]);

  useEffect(() => {
    localStorage.setItem('sof_umer_ad_packages', JSON.stringify(adPackages));
  }, [adPackages]);

  const handleSaveSystemSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setSaveSettingsSuccess(false);
    try {
      const payload = {
        ...systemSettings,
        contactUsSettings: contactUsData
      };
      await updateSystemSettings(payload);
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save brand and appearance settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (base64String) {
        const newSettings = { ...systemSettings, logoUrl: base64String };
        setSystemSettings(newSettings);
        try {
          await updateSystemSettings(newSettings);
          setSaveSettingsSuccess(true);
          setTimeout(() => setSaveSettingsSuccess(false), 3000);
        } catch (err) {
          console.error('Failed to auto-save application logo:', err);
          alert('Failed to save application logo.');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Actions for Advertisements
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAd ? `/api/advertisements/${editingAd.id}` : '/api/advertisements';
      const method = editingAd ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        setEditingAd(null);
        setAdForm({ title: '', description: '', imageUrl: '', linkUrl: '', position: 'sidebar' });
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await fetch(`/api/advertisements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAd = async (ad: Advertisement) => {
    try {
      await fetch(`/api/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '', iconName: 'Grid' });
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Payment Methods
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPay ? `/api/payment-methods/${editingPay.id}` : '/api/payment-methods';
      const method = editingPay ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify(payForm)
      });
      if (res.ok) {
        setEditingPay(null);
        setPayForm({ name: '', accountName: '', accountNumber: '', phoneNumber: '', instructions: '' });
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePaymentMethod = async (pm: PaymentMethod) => {
    try {
      await fetch(`/api/payment-methods/${pm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pm.isActive })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for User Management
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setEditingUser(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserSuspension = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserRole = async (user: User) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Listings (Moderation & Editing)
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    try {
      const res = await fetch(`/api/properties/${editingProp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify(propForm)
      });
      if (res.ok) {
        setEditingProp(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyProperty = async (id: string, status: 'verified' | 'rejected' | 'pending') => {
    try {
      await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({
          verificationStatus: status,
          isVerifiedListing: status === 'verified'
        })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePropertyFeatured = async (prop: Property) => {
    try {
      await fetch(`/api/properties/${prop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ isFeatured: !prop.isFeatured })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      
      // Update local storage backup to respect explicit admin deletion
      const cached = localStorage.getItem('sof_umer_backup_properties');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((p: any) => p.id !== id);
            localStorage.setItem('sof_umer_backup_properties', JSON.stringify(filtered));
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Languages & Translation Dictionary
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangCode || !newLangName) return;
    try {
      const res = await fetch('/api/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newLangCode.toLowerCase(), name: newLangName })
      });
      if (res.ok) {
        setNewLangCode('');
        setNewLangName('');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLanguage = async (lang: Language) => {
    try {
      await fetch(`/api/languages/${lang.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !lang.isActive })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTranslation = async (key: string) => {
    const updated = translations.map(tk => {
      if (tk.key === key) {
        return { ...tk, ...translationEdits };
      }
      return tk;
    });
    try {
      const res = await fetch('/api/languages/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: updated })
      });
      if (res.ok) {
        setEditingTranslationKey(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Actions for Manual Receipt Audit Desk
  const handleVerifyReceipt = async (id: string, status: 'Approved' | 'Rejected', rejectReason?: string) => {
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({
          status,
          adminNotes: 'Audited via receipt verification panel.',
          rejectionReason: status === 'Rejected' ? rejectReason : undefined
        })
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveAllReceipts = async () => {
    if (!window.confirm('Are you sure you want to approve all pending receipts and activate all property promotions?')) return;
    try {
      const res = await fetch('/api/receipts/approve-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveAllListings = async () => {
    if (!window.confirm('Are you sure you want to approve all pending property listings?')) return;
    try {
      const res = await fetch('/api/properties/approve-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Verification center approval
  const handleVerifyOwnerDoc = async (user: User, status: 'verified' | 'rejected', notes?: string) => {
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: status,
          isVerified: status === 'verified',
          verificationNotes: notes || 'Reviewed'
        })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Safety Reports Action
  const handleResolveReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // FAQ Add
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    try {
      await addFaq({
        question: { en: newFaqQuestion, om: newFaqQuestion, am: newFaqQuestion },
        answer: { en: newFaqAnswer, om: newFaqAnswer, am: newFaqAnswer },
        category: 'general',
        status: 'published'
      });
      setNewFaqQuestion('');
      setNewFaqAnswer('');
    } catch (err: any) {
      alert('Failed to create FAQ: ' + err.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ item?')) return;
    try {
      await deleteFaq(id);
    } catch (err: any) {
      alert('Failed to delete FAQ: ' + err.message);
    }
  };

  // Ticket reply
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyId || !ticketReplyText) return;
    try {
      const res = await fetch(`/api/support-tickets/${ticketReplyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({
          reply: ticketReplyText,
          status: 'Closed'
        })
      });
      if (res.ok) {
        await refreshData();
      } else {
        alert('Failed to send reply to the support ticket.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while replying to support ticket.');
    } finally {
      setTicketReplyId(null);
      setTicketReplyText('');
    }
  };

  // Stat Calculations
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const totalListingsCount = properties.length;
  const pendingListingsCount = properties.filter(p => p.verificationStatus === 'pending' || !p.verificationStatus).length;
  const approvedListingsCount = properties.filter(p => p.verificationStatus === 'verified' || p.isVerifiedListing).length;
  const promotedListingsCount = properties.filter(p => p.isFeatured || p.isTopAd || !!p.boostPlan).length;
  const pendingPromotionRequestsCount = properties.filter(p => receipts.some(r => r.relatedPropertyId === p.id && r.status === 'Pending')).length;
  const reportedCount = reports.filter(r => r.status === 'pending').length;
  const pendingReceiptsCount = receipts.filter(r => r.status === 'Pending').length;
  const pendingUserVerifications = users.filter(u => u.verificationStatus === 'pending').length;

  // Search and filter users logic
  const filteredUsers = users.filter(u => {
    const searchLower = (userSearch || '').toLowerCase();
    const matchesSearch = (u.fullName || '').toLowerCase().includes(searchLower) || (u.email || '').toLowerCase().includes(searchLower);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Search and filter listings logic
  const filteredProperties = properties.filter(p => {
    const searchLower = (listingSearch || '').toLowerCase();
    const matchesSearch = extractString(p.title).toLowerCase().includes(searchLower) || 
                          extractString(p.location).toLowerCase().includes(searchLower) ||
                          extractString(p.ownerName).toLowerCase().includes(searchLower);
    const matchesCat = listingCatFilter === 'all' || p.majorCategory === listingCatFilter;
    
    const hasPendingSlip = receipts.some(r => r.relatedPropertyId === p.id && r.status === 'Pending');
    const isPromoted = p.isFeatured || p.isTopAd || !!p.boostPlan;

    const matchesStatus = listingStatusFilter === 'all' || 
      (listingStatusFilter === 'pending' && (p.verificationStatus === 'pending' || !p.verificationStatus)) ||
      (listingStatusFilter === 'promoted' && isPromoted) ||
      (listingStatusFilter === 'promotion_requested' && hasPendingSlip) ||
      (listingStatusFilter === 'verified' && (p.verificationStatus === 'verified' || p.isVerifiedListing)) ||
      (listingStatusFilter === 'rejected' && p.verificationStatus === 'rejected');
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-fade-in text-white">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-5 mb-8">
        <div>
          <span className="text-amber-500 font-extrabold uppercase text-[10px] tracking-widest block mb-1">Administrative Center</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            {systemSettings?.logoUrl ? (
              <img
                src={systemSettings.logoUrl}
                alt="App Logo"
                className="w-8 h-8 object-cover rounded-xl border border-amber-500/50 shadow-md shadow-amber-500/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Shield className="w-7 h-7 text-amber-500" />
            )}
            <span>{systemSettings.appName} Control Console</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onBackToMarketplace}
            className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl shadow transition duration-300 cursor-pointer"
          >
            Marketplace Home
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs rounded-xl shadow-lg hover:from-amber-400 hover:to-amber-500 transition duration-300 cursor-pointer"
          >
            Create New Listing
          </button>
          <button
            onClick={refreshData}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl border border-white/10 transition duration-300 shrink-0 cursor-pointer"
            title="Reload backend state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              logout();
              onBackToMarketplace();
            }}
            className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl shadow transition duration-300 cursor-pointer flex items-center gap-2"
            title="Log out immediately in 1 click"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 12-Section Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION PANEL (12 Sections) */}
        <div className="lg:col-span-3">
          <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl shadow-2xl space-y-1.5 backdrop-blur-md sticky top-6">
            <div className="px-3.5 pb-2.5 border-b border-white/5 mb-2.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">CORE CONTROLS ({systemSettings.siteStatus})</span>
            </div>

            {isTabAllowed('overview') && (
              <button
                onClick={() => setAdminTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'overview' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>1. Overview & Activity</span>
              </button>
            )}

            {isTabAllowed('users') && (
              <button
                onClick={() => setAdminTab('users')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'users' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>2. User Management</span>
              </button>
            )}

            {isTabAllowed('listings') && (
              <button
                onClick={() => setAdminTab('listings')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  adminTab === 'listings' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 shrink-0" />
                  <span>3. Listing Moderation</span>
                </div>
                {pendingListingsCount > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                    {pendingListingsCount}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed('categories') && (
              <button
                onClick={() => setAdminTab('categories')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'categories' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Grid className="w-4 h-4 shrink-0" />
                <span>4. Category Manager</span>
              </button>
            )}

            {isTabAllowed('ads') && (
              <button
                onClick={() => setAdminTab('ads')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'ads' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span>5. Ads & Campaigns</span>
              </button>
            )}

            {isTabAllowed('verification') && (
              <button
                onClick={() => setAdminTab('verification')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  adminTab === 'verification' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>6. Verification Center</span>
                </div>
                {pendingUserVerifications > 0 && (
                  <span className="bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                    {pendingUserVerifications}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed('reports') && (
              <button
                onClick={() => setAdminTab('reports')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  adminTab === 'reports' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>7. Reports & Safety</span>
                </div>
                {reportedCount > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                    {reportedCount}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed('support') && (
              <button
                onClick={() => setAdminTab('support')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  adminTab === 'support' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>8. Support & FAQs</span>
                </div>
                {supportTickets.filter(t => t.status === 'Open').length > 0 && (
                  <span className="bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                    {supportTickets.filter(t => t.status === 'Open').length}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed('languages') && (
              <button
                onClick={() => setAdminTab('languages')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'languages' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Languages className="w-4 h-4 shrink-0" />
                <span>9. Languages & Texts</span>
              </button>
            )}

            {isTabAllowed('payments') && (
              <button
                onClick={() => setAdminTab('payments')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  adminTab === 'payments' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>10. Payment & Receipts</span>
                </div>
                {pendingReceiptsCount > 0 && (
                  <span className="bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                    {pendingReceiptsCount}
                  </span>
                )}
              </button>
            )}

            {isTabAllowed('settings') && (
              <button
                onClick={() => setAdminTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'settings' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>11. System Settings</span>
              </button>
            )}

            {isTabAllowed('analytics') && (
              <button
                onClick={() => setAdminTab('analytics')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'analytics' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>12. Advanced Analytics</span>
              </button>
            )}

            {/* 13. Employee Admins & Staff Management (Super Admin only) */}
            {currentUser?.role === 'admin' && currentUser?.isEmployee !== true && (
              <button
                onClick={() => setAdminTab('employeeAdmins')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  adminTab === 'employeeAdmins' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                <span>13. Employee Admins</span>
              </button>
            )}
          </div>
        </div>

        {/* CORE WORKSPACE PANEL */}
        <div className="lg:col-span-9 space-y-6">

          {/* SECURITY ACCESS GATE */}
          {!isTabAllowed(adminTab) && (
            <div className="bg-[#0d0d12]/90 border border-rose-500/10 p-8 rounded-3xl text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-serif font-bold text-white">Administrative Access Denied</h3>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                Your employee account role does not possess permissions to view or edit this platform module. Please contact the Super Administrator if you require access expansion.
              </p>
            </div>
          )}

          {/* 1. DASHBOARD OVERVIEW SECTION */}
          {adminTab === 'overview' && isTabAllowed('overview') && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xl font-serif font-bold text-white mb-2">Platform Overview Dashboard</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">Real-time indicators mapping registration traffic, pending actions, and financial slips submitted across East African nodes.</p>
              </div>

              {/* Statistics Counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0d0d12] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest block">TOTAL USERS</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{totalUsersCount}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-1">● {activeUsersCount} Active Profiles</p>
                  <Users className="absolute right-3 bottom-3 text-white/5 w-10 h-10" />
                </div>
                <div className="bg-[#0d0d12] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest block">TOTAL LISTINGS</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{totalListingsCount}</p>
                  <p className="text-[10px] text-amber-500 font-medium mt-1">● {pendingListingsCount} Pending Audit</p>
                  <Building className="absolute right-3 bottom-3 text-white/5 w-10 h-10" />
                </div>
                <div className="bg-[#0d0d12] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest block">REPORTED CONTENT</span>
                  <p className="text-2xl font-extrabold text-rose-400 mt-1">{reports.length}</p>
                  <p className="text-[10px] text-rose-500 font-medium mt-1">● {reportedCount} Unresolved Reports</p>
                  <AlertOctagon className="absolute right-3 bottom-3 text-white/5 w-10 h-10" />
                </div>
                <div className="bg-[#0d0d12] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest block">PENDING SLIPS</span>
                  <p className="text-2xl font-extrabold text-amber-500 mt-1">{pendingReceiptsCount}</p>
                  <p className="text-[10px] text-amber-400 font-medium mt-1">● CBE/Telebirr verification</p>
                  <CreditCard className="absolute right-3 bottom-3 text-white/5 w-10 h-10" />
                </div>
              </div>

              {/* Quick Actions & Promotion Operations Desk */}
              {(pendingListingsCount > 0 || pendingReceiptsCount > 0 || promotedListingsCount > 0) && (
                <div className="bg-[#12121a] border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Moderation & Promotion Quick Desk
                    </span>
                    <p className="text-xs text-white/80 font-medium">
                      {pendingListingsCount} pending listings • {pendingReceiptsCount} pending payment receipts • {promotedListingsCount} active boosted listings
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pendingListingsCount > 0 && (
                      <button
                        onClick={handleApproveAllListings}
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[11px] uppercase rounded-xl transition cursor-pointer"
                      >
                        Approve All Listings ({pendingListingsCount})
                      </button>
                    )}
                    {pendingReceiptsCount > 0 && (
                      <button
                        onClick={handleApproveAllReceipts}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] uppercase rounded-xl transition cursor-pointer"
                      >
                        Approve All Slips ({pendingReceiptsCount})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAdminTab('listings');
                        setListingStatusFilter('promoted');
                      }}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase rounded-xl border border-white/10 transition cursor-pointer"
                    >
                      View Promoted ({promotedListingsCount})
                    </button>
                  </div>
                </div>
              )}

              {/* Simple Chart / Platform Activity visualization */}
              <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" /> 
                    Platform Transaction & Post Activity Weekly (Live Production)
                  </h4>
                </div>

                {(() => {
                  const weeklyData = [
                    { day: 'Mon', posts: 0, receipts: 0 },
                    { day: 'Tue', posts: 0, receipts: 0 },
                    { day: 'Wed', posts: 0, receipts: 0 },
                    { day: 'Thu', posts: 0, receipts: 0 },
                    { day: 'Fri', posts: 0, receipts: 0 },
                    { day: 'Sat', posts: 0, receipts: 0 },
                    { day: 'Sun', posts: 0, receipts: 0 }
                  ];

                  const dayMap: { [key: number]: number } = {
                    1: 0, // Mon
                    2: 1, // Tue
                    3: 2, // Wed
                    4: 3, // Thu
                    5: 4, // Fri
                    6: 5, // Sat
                    0: 6  // Sun
                  };

                  properties.forEach(prop => {
                    try {
                      const date = new Date(prop.createdAt);
                      const day = date.getDay();
                      const idx = dayMap[day];
                      if (idx !== undefined) {
                        weeklyData[idx].posts += 1;
                      }
                    } catch (e) {}
                  });

                  receipts.forEach(rec => {
                    try {
                      const date = new Date(rec.submittedAt);
                      const day = date.getDay();
                      const idx = dayMap[day];
                      if (idx !== undefined) {
                        weeklyData[idx].receipts += 1;
                      }
                    } catch (e) {}
                  });

                  const maxPosts = Math.max(...weeklyData.map(d => d.posts), 1);
                  const maxReceipts = Math.max(...weeklyData.map(d => d.receipts), 1);

                  return (
                    <>
                      <div className="h-44 flex items-end justify-between gap-2.5 pt-6 border-b border-white/5 pb-2">
                        {weeklyData.map((d, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <div className="w-full flex gap-1 items-end justify-center h-full">
                              {/* Posts bar */}
                              <div 
                                className="w-2 rounded-t bg-amber-500 hover:bg-amber-400 transition-all duration-300"
                                style={{ height: d.posts > 0 ? `${(d.posts / maxPosts) * 100}%` : '2px' }}
                                title={`${d.posts} Listings Created`}
                              />
                              {/* Receipts bar */}
                              <div 
                                className="w-2 rounded-t bg-teal-500 hover:bg-teal-400 transition-all duration-300"
                                style={{ height: d.receipts > 0 ? `${(d.receipts / maxReceipts) * 100}%` : '2px' }}
                                title={`${d.receipts} Slips Logged`}
                              />
                            </div>
                            <span className="text-[9px] text-white/40 font-mono font-bold uppercase">{d.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 items-center justify-center text-[10px] mt-4 text-white/40">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-sm" /> Listings Published</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded-sm" /> Audited Payments</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Recent Activity Log */}
              <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Administrative Audit & Activity Logs
                </h4>
                <div className="divide-y divide-white/5 text-xs text-white/80 font-light space-y-3">
                  {(() => {
                      const formatTimeAgo = (dateString: string) => {
                        try {
                          const now = new Date();
                          const past = new Date(dateString);
                          const diffMs = now.getTime() - past.getTime();
                          if (diffMs < 0) return 'Just now';
                          const diffMins = Math.floor(diffMs / 60000);
                          if (diffMins < 1) return 'Just now';
                          if (diffMins < 60) return `${diffMins}m ago`;
                          const diffHours = Math.floor(diffMins / 60);
                          if (diffHours < 24) return `${diffHours}h ago`;
                          const diffDays = Math.floor(diffHours / 24);
                          if (diffDays === 1) return 'Yesterday';
                          return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        } catch (e) {
                          return 'Recently';
                        }
                      };

                      const liveLogs = [
                        ...users.map(u => ({
                          text: `New profile created for `,
                          boldText: u.fullName,
                          subText: ` (${u.email})`,
                          time: formatTimeAgo(u.createdAt),
                          statusColor: 'text-white/30',
                          rawDate: new Date(u.createdAt)
                        })),
                        ...properties.map(p => ({
                          text: `New listing `,
                          boldText: `"${extractString(p.title)}"`,
                          subText: ` submitted under ${p.majorCategory || 'Properties'}`,
                          time: formatTimeAgo(p.createdAt),
                          statusColor: 'text-white/30',
                          rawDate: new Date(p.createdAt)
                        })),
                        ...receipts.map(r => ({
                          text: `Payment slip of ETB ${r.amount} for `,
                          boldText: `"${r.relatedPropertyTitle}"`,
                          subText: ` is ${r.status}`,
                          time: formatTimeAgo(r.submittedAt),
                          statusColor: r.status === 'Approved' ? 'text-emerald-400' : r.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400',
                          rawDate: new Date(r.submittedAt)
                        })),
                        ...reports.map(rep => ({
                          text: `Complaint filed against ${rep.targetType} `,
                          boldText: `"${rep.targetName}"`,
                          subText: ` for ${rep.reason}`,
                          time: formatTimeAgo(rep.createdAt),
                          statusColor: 'text-rose-400',
                          rawDate: new Date(rep.createdAt)
                        }))
                      ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

                      if (liveLogs.length === 0) {
                        return (
                          <div className="py-4 text-center text-white/30 italic">
                            No live production activities logged in the database yet.
                          </div>
                        );
                      }

                      return liveLogs.slice(0, 5).map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center pt-3">
                          <span className="text-white/60">
                            {log.text}
                            <strong className="font-semibold text-white">{log.boldText}</strong>
                            {log.subText}
                          </span>
                          <span className={`text-[10px] font-mono ${log.statusColor}`}>{log.time}</span>
                        </div>
                      ));
                    })()}
                </div>
              </div>
            </div>
          )}

          {/* 2. USER MANAGEMENT SECTION */}
          {adminTab === 'users' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">User Accounts Control Desk</h3>
                  <p className="text-xs text-white/40 mt-1">Search, audit profiles, adjust roles, verify documentation, and toggle active status.</p>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="user">Seller / Buyer</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={e => setUserStatusFilter(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Inline Editing Form */}
              {editingUser && (
                <form onSubmit={handleSaveUser} className="bg-white/5 p-5 border border-white/10 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Modify User Credentials ({editingUser.fullName})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={userForm.fullName}
                        onChange={e => setUserForm({ ...userForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={userForm.email}
                        onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Apply Updates
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-white">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#12121a] text-[9px] text-white/40 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-left">User Profile</th>
                      <th className="py-3 px-4 text-left">System Role</th>
                      <th className="py-3 px-4 text-left">State</th>
                      <th className="py-3 px-4 text-left">Verification Badge</th>
                      <th className="py-3 px-4 text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" title="Verified Seller" />}
                          </p>
                          <span className="text-[10px] text-white/40">{u.email}</span>
                        </td>
                        <td className="py-4 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/60'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] uppercase font-mono text-white/40">{u.verificationStatus}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({ fullName: u.fullName, email: u.email, role: u.role, status: u.status });
                              }}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-amber-500 cursor-pointer"
                              title="Edit Info"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleUserSuspension(u)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer ${u.status === 'active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              className="px-2.5 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white/70 cursor-pointer"
                              title="Change Role"
                            >
                              Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. LISTING MANAGEMENT SECTION */}
          {adminTab === 'listings' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Central Listings Moderation Desk</h3>
                  <p className="text-xs text-white/40 mt-1">Review user-submitted property, job, and service entries. Set featured flags or remove non-compliant records.</p>
                </div>
                {pendingListingsCount > 0 && (
                  <button
                    onClick={handleApproveAllListings}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 shrink-0"
                  >
                    <Check className="w-4 h-4" /> Approve All ({pendingListingsCount}) Pending Listings
                  </button>
                )}
              </div>

              {/* Filtering */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Filter by title/location/owner..."
                  value={listingSearch}
                  onChange={e => setListingSearch(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs focus:outline-none"
                />
                <select
                  value={listingCatFilter}
                  onChange={e => setListingCatFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-xs focus:outline-none text-white"
                >
                  <option value="all">All Category Modules</option>
                  <option value="Properties">Properties</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Services">Services</option>
                  <option value="Products">Products</option>
                  <option value="Local Businesses">Local Businesses</option>
                  <option value="Community">Community</option>
                </select>
                <select
                  value={listingStatusFilter}
                  onChange={e => setListingStatusFilter(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-xs focus:outline-none text-white font-medium"
                >
                  <option value="all">All Verification States ({properties.length})</option>
                  <option value="pending">Pending Audit ({pendingListingsCount})</option>
                  <option value="promotion_requested">Promotion Requested ({pendingPromotionRequestsCount})</option>
                  <option value="promoted">Promoted / Boosted ({promotedListingsCount})</option>
                  <option value="verified">Verified Listings ({approvedListingsCount})</option>
                  <option value="rejected">Rejected Posts</option>
                </select>
              </div>

              {/* Listing Editing Modal */}
              {editingProp && (
                <form onSubmit={handleSaveProperty} className="bg-white/5 p-5 border border-white/10 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Modify Listing Parameters ({extractString(editingProp.title)})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Listing Title</label>
                      <input
                        type="text"
                        required
                        value={propForm.title}
                        onChange={e => setPropForm({ ...propForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Price</label>
                      <input
                        type="number"
                        required
                        value={propForm.price}
                        onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Currency</label>
                      <select
                        value={propForm.currency}
                        onChange={e => setPropForm({ ...propForm, currency: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#12121a] border border-white/5 rounded-xl text-xs"
                      >
                        <option value="ETB">ETB (Ethiopian Birr)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={propForm.location}
                        onChange={e => setPropForm({ ...propForm, location: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Major Category</label>
                      <select
                        value={propForm.majorCategory}
                        onChange={e => setPropForm({ ...propForm, majorCategory: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#12121a] border border-white/5 rounded-xl text-xs"
                      >
                        <option value="Properties">Properties</option>
                        <option value="Jobs">Jobs</option>
                        <option value="Services">Services</option>
                        <option value="Products">Products</option>
                        <option value="Local Businesses">Local Businesses</option>
                        <option value="Community">Community</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Owner Name</label>
                      <input
                        type="text"
                        required
                        value={propForm.ownerName}
                        onChange={e => setPropForm({ ...propForm, ownerName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Owner Email</label>
                      <input
                        type="email"
                        required
                        value={propForm.contactEmail}
                        onChange={e => setPropForm({ ...propForm, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={propForm.contactPhone}
                        onChange={e => setPropForm({ ...propForm, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1">Verification Status</label>
                      <select
                        value={propForm.verificationStatus}
                        onChange={e => setPropForm({ ...propForm, verificationStatus: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#12121a] border border-white/5 rounded-xl text-xs text-white"
                      >
                        <option value="pending">Pending Audit</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingProp(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Parameters
                    </button>
                  </div>
                </form>
              )}

              {/* Listings Loop */}
              <div className="space-y-4">
                {filteredProperties.length === 0 ? (
                  <p className="py-12 text-center text-white/30 font-light text-xs">No listings match the selection parameters.</p>
                ) : (
                  filteredProperties.map(p => {
                    const pendingRec = receipts.find(r => r.relatedPropertyId === p.id && r.status === 'Pending');
                    return (
                      <div key={p.id} className="bg-[#12121a] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex gap-4">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt="Post" className="w-16 h-16 rounded-xl object-cover border border-white/5 shrink-0" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/20 shrink-0"><Building className="w-6 h-6" /></div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-bold text-white text-sm">{extractString(p.title)}</h4>
                                <span className="text-[8px] bg-amber-500/15 text-amber-400 font-extrabold px-1.5 py-0.5 rounded uppercase">{p.majorCategory}</span>
                                {p.isFeatured && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase">Featured</span>}
                                {p.isTopAd && <span className="text-[8px] bg-purple-500/20 text-purple-300 font-extrabold px-1.5 py-0.5 rounded border border-purple-500/30 uppercase">Top Ad</span>}
                                {p.boostPlan && <span className="text-[8px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded uppercase">BOOST: {p.boostPlan.toUpperCase()}</span>}
                              </div>
                              <p className="text-xs text-white/50 font-light mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {extractString(p.location)} • <span className="text-white/70">{extractString(p.ownerName) || 'Unknown Owner'}</span> ({p.contactEmail || 'No Email'})</p>
                              <p className="text-xs font-mono font-extrabold text-amber-500 mt-1.5">{p.price.toLocaleString()} {p.currency}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                            <button
                              onClick={() => {
                                setEditingProp(p);
                                setPropForm({
                                  title: extractString(p.title),
                                  description: extractString(p.description),
                                  price: p.price,
                                  currency: p.currency,
                                  location: extractString(p.location),
                                  propertyType: p.propertyType || '',
                                  majorCategory: p.majorCategory || 'Properties',
                                  ownerName: p.ownerName || '',
                                  contactPhone: p.contactPhone || '',
                                  contactEmail: p.contactEmail || '',
                                  verificationStatus: p.verificationStatus || 'pending'
                                });
                              }}
                              className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-amber-500 rounded-xl transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleTogglePropertyFeatured(p)}
                              className={`text-[10px] font-extrabold px-3 py-2 rounded-xl border transition cursor-pointer ${p.isFeatured ? 'bg-amber-500 text-black border-amber-600' : 'bg-white/5 text-white/50 border-white/10'}`}
                            >
                              {p.isFeatured ? 'Promoted' : 'Promote'}
                            </button>

                            {(!p.verificationStatus || p.verificationStatus === 'pending') ? (
                              <>
                                <button
                                  onClick={() => handleVerifyProperty(p.id, 'verified')}
                                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] uppercase rounded-xl cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerifyProperty(p.id, 'rejected')}
                                  className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] uppercase rounded-xl cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleVerifyProperty(p.id, 'pending')}
                                className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded border cursor-pointer hover:bg-white/5 transition duration-200 active:scale-95 ${p.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/10 hover:border-rose-500/30'}`}
                                title="Click to change verification status"
                              >
                                {p.verificationStatus}
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteProperty(p.id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Pending Promotion Request Banner */}
                        {pendingRec && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5" /> Customer Promotion Requested (Payment Pending Audit)
                              </span>
                              <p className="text-xs text-white/80 font-medium mt-0.5">
                                Amount: <span className="font-extrabold text-amber-400">{pendingRec.amount.toLocaleString()} ETB</span> via {pendingRec.paymentMethodName} ({pendingRec.userEmail})
                              </p>
                              <p className="text-[10px] text-white/50 font-mono">Receipt Ref/Slip: {pendingRec.receiptUrlOrFile}</p>
                            </div>
                            <button
                              onClick={() => handleVerifyReceipt(pendingRec.id, 'Approved')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1 shrink-0"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve Receipt & Activate Promotion
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. CATEGORY MANAGEMENT PANEL */}
          {adminTab === 'categories' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Marketplace Category Management</h3>
                  <p className="text-xs text-white/40 mt-1">Configure structural sub-types, assign vector markers, and dynamic classifications.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', iconName: 'Grid' });
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Create Category
                </button>
              </div>

              {/* Form Category */}
              <form onSubmit={handleSaveCategory} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 max-w-xl">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{editingCategory ? 'Edit Category Parameters' : 'Add New Category Node'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Category Label</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Visual Vector Icon</label>
                    <select
                      value={categoryForm.iconName}
                      onChange={e => setCategoryForm({ ...categoryForm, iconName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#12121a] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Building">Building (Properties)</option>
                      <option value="Briefcase">Briefcase (Jobs)</option>
                      <option value="Wrench">Wrench (Services)</option>
                      <option value="ShoppingBag">ShoppingBag (Products)</option>
                      <option value="Store">Store (Local Businesses)</option>
                      <option value="Users">Users (Community)</option>
                      <option value="Grid">Grid (Default)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-white/40 font-bold uppercase mb-1">Brief Description</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.description}
                      onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', description: '', iconName: 'Grid' });
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>

              {/* Grid categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-[#12121a] border border-white/5 p-4 rounded-2xl flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center gap-3 pl-1">
                      <div className="w-10 h-10 bg-black/40 border border-white/5 text-amber-500 flex items-center justify-center rounded-xl shrink-0">
                        {cat.iconName === 'Building' && <Building className="w-5 h-5 text-amber-500" />}
                        {cat.iconName === 'Briefcase' && <Briefcase className="w-5 h-5 text-amber-500" />}
                        {cat.iconName === 'Wrench' && <Wrench className="w-5 h-5 text-amber-500" />}
                        {cat.iconName === 'ShoppingBag' && <ShoppingBag className="w-5 h-5 text-amber-500" />}
                        {cat.iconName === 'Store' && <Store className="w-5 h-5 text-amber-500" />}
                        {cat.iconName === 'Users' && <Users className="w-5 h-5 text-amber-500" />}
                        {cat.iconName !== 'Building' && cat.iconName !== 'Briefcase' && cat.iconName !== 'Wrench' && cat.iconName !== 'ShoppingBag' && cat.iconName !== 'Store' && cat.iconName !== 'Users' && <Grid className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{cat.name}</h5>
                        <p className="text-[10px] text-white/50 leading-tight font-light mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({ name: cat.name, description: cat.description, iconName: cat.iconName });
                        }}
                        className="p-1.5 text-white/40 hover:text-amber-500 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-white/40 hover:text-rose-500 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ADVERTISEMENT MANAGEMENT */}
          {adminTab === 'ads' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              {/* FREE LISTING AVAILABILITY CONTROL PANEL */}
              <div className="p-6 bg-[#12121c] border border-amber-500/20 rounded-3xl space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                        <span>Free Listing Availability & Campaign</span>
                        {(() => {
                          const fls = systemSettings.freeListingSettings || { enabled: true };
                          if (fls.enabled === false) return <span className="text-[10px] bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded-full border border-red-500/30">OFF (Disabled)</span>;
                          const now = new Date();
                          if (fls.startDate && new Date(fls.startDate) > now) return <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-500/30">Scheduled</span>;
                          if (fls.endDate) {
                            const end = new Date(fls.endDate);
                            end.setHours(23, 59, 59, 999);
                            if (now > end) return <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">Expired</span>;
                          }
                          return <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">ON (Active)</span>;
                        })()}
                      </h3>
                      <p className="text-xs text-white/40 mt-0.5">Control whether standard marketplace users can post listings for free or if paid promotion boost is required.</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold uppercase text-white/60">Free Listing:</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const currentFls = systemSettings.freeListingSettings || { enabled: true };
                        const updatedFls = { ...currentFls, enabled: currentFls.enabled === false ? true : false };
                        const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                        setSystemSettings(updatedSys);
                        await updateSystemSettings(updatedSys);
                      }}
                      className="cursor-pointer transition hover:scale-105"
                    >
                      {systemSettings.freeListingSettings?.enabled !== false ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                          <ToggleRight className="w-6 h-6 text-emerald-400" /> ON
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/30">
                          <ToggleLeft className="w-6 h-6 text-red-400" /> OFF
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Campaign Start Date</label>
                    <input
                      type="date"
                      value={systemSettings.freeListingSettings?.startDate || '2026-07-01'}
                      onChange={async e => {
                        const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), startDate: e.target.value };
                        const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                        setSystemSettings(updatedSys);
                        await updateSystemSettings(updatedSys);
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Campaign End Date</label>
                    <input
                      type="date"
                      value={systemSettings.freeListingSettings?.endDate || '2026-12-31'}
                      onChange={async e => {
                        const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), endDate: e.target.value };
                        const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                        setSystemSettings(updatedSys);
                        await updateSystemSettings(updatedSys);
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Max Free Listings / User</label>
                    <input
                      type="number"
                      value={systemSettings.freeListingSettings?.maxFreeListingsPerUser ?? 5}
                      onChange={async e => {
                        const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), maxFreeListingsPerUser: Number(e.target.value) };
                        const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                        setSystemSettings(updatedSys);
                        await updateSystemSettings(updatedSys);
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">Free Listing Campaign Notice / Banner Message</label>
                  <input
                    type="text"
                    value={systemSettings.freeListingSettings?.campaignNotice || 'Free Listing Campaign is currently Active! Post your property or product for free.'}
                    onChange={async e => {
                      const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), campaignNotice: e.target.value };
                      const updatedSys = { ...systemSettings, freeListingSettings: updatedFls };
                      setSystemSettings(updatedSys);
                      await updateSystemSettings(updatedSys);
                    }}
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Free Listing Campaign active for a limited time!"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Manage Advertisements</h3>
                  <p className="text-xs text-white/40 mt-1">Publish promotional banners, track marketing campaigns, and configure packages.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAd(null);
                    setAdForm({ title: '', description: '', imageUrl: '', linkUrl: '', position: 'sidebar' });
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Create Advert Banner
                </button>
              </div>

              {/* Form editing ads */}
              <form onSubmit={handleSaveAd} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 max-w-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">{editingAd ? 'Edit Banner Configuration' : 'Configure New Advert'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2">Advert Title</label>
                    <input
                      type="text"
                      required
                      value={adForm.title}
                      onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2">Display Position</label>
                    <select
                      value={adForm.position}
                      onChange={e => setAdForm({ ...adForm, position: e.target.value as any })}
                      className="w-full p-2.5 bg-[#12121a] border border-white/5 text-xs rounded-xl focus:outline-none"
                    >
                      <option value="hero">Hero Top Banner</option>
                      <option value="sidebar">Sidebar Widget</option>
                      <option value="banner">Inline Footer Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2">Image URL</label>
                    <input
                      type="text"
                      required
                      value={adForm.imageUrl}
                      onChange={e => setAdForm({ ...adForm, imageUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2">Redirect URL</label>
                    <input
                      type="text"
                      required
                      value={adForm.linkUrl}
                      onChange={e => setAdForm({ ...adForm, linkUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-white/40 mb-2">Description / Copy text</label>
                    <textarea
                      required
                      rows={2}
                      value={adForm.description}
                      onChange={e => setAdForm({ ...adForm, description: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingAd && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAd(null);
                        setAdForm({ title: '', description: '', imageUrl: '', linkUrl: '', position: 'sidebar' });
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl">Save Advert</button>
                </div>
              </form>

              {/* Active Packages */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-500" /> Dynamic Ads & Promotion Packages Pricing
                    <span className="text-[9px] lowercase font-normal text-white/30">(Used directly in User Dashboard & Listing Promotions)</span>
                  </h4>
                  <button
                    onClick={handleAddAdPackage}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1 w-fit cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Promotion Package
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {adPackages.map(pkg => {
                    const isEditing = editingPkgId === pkg.id;
                    return (
                      <div 
                        key={pkg.id} 
                        className={`bg-[#12121a] border rounded-2xl p-4 transition-all duration-200 relative ${
                          isEditing 
                            ? 'border-amber-500 shadow-lg shadow-amber-500/5' 
                            : 'border-white/5 hover:border-amber-500/50 hover:bg-[#161622] cursor-pointer group'
                        }`}
                        onClick={() => {
                          if (!isEditing) {
                            handleStartEditPackage(pkg);
                          }
                        }}
                      >
                        {isEditing ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Package Name</label>
                              <input
                                type="text"
                                value={editingPkgName}
                                onChange={e => setEditingPkgName(e.target.value)}
                                className="w-full px-2 py-1 bg-black/40 border border-white/10 text-xs text-white rounded focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Badge Text</label>
                                <input
                                  type="text"
                                  value={editingPkgBadge}
                                  onChange={e => setEditingPkgBadge(e.target.value)}
                                  className="w-full px-2 py-1 bg-black/40 border border-white/10 text-xs text-amber-400 rounded focus:outline-none focus:border-amber-500"
                                  placeholder="POPULAR"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Duration</label>
                                <input
                                  type="text"
                                  value={editingPkgDuration}
                                  onChange={e => setEditingPkgDuration(e.target.value)}
                                  className="w-full px-2 py-1 bg-black/40 border border-white/10 text-xs text-white rounded focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Views Target</label>
                                <input
                                  type="text"
                                  value={editingPkgViews}
                                  onChange={e => setEditingPkgViews(e.target.value)}
                                  className="w-full px-2 py-1 bg-black/40 border border-white/10 text-xs text-white rounded focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Price ({pkg.currency || 'ETB'})</label>
                                <input
                                  type="number"
                                  value={editingPkgPrice}
                                  onChange={e => setEditingPkgPrice(Number(e.target.value))}
                                  className="w-full px-2 py-1 bg-black/40 border border-white/10 text-xs text-amber-400 font-bold font-mono rounded focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase tracking-wider text-white/40 font-bold mb-0.5">Package Description</label>
                              <textarea
                                rows={2}
                                value={editingPkgDesc}
                                onChange={e => setEditingPkgDesc(e.target.value)}
                                className="w-full px-2 py-1 bg-black/40 border border-white/10 text-[11px] text-white/80 rounded focus:outline-none focus:border-amber-500"
                                placeholder="Summary of benefits for property promotion"
                              />
                            </div>
                            <div className="flex gap-2 pt-1 justify-between items-center">
                              <button
                                type="button"
                                onClick={e => handleDeleteAdPackage(pkg.id, e)}
                                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[10px] font-bold rounded transition"
                              >
                                Delete
                              </button>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingPkgId(null)}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[10px] text-white/60 hover:text-white font-bold rounded transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveAdPackage(pkg.id)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-[10px] text-black font-bold rounded transition"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute top-0 right-0 flex items-center gap-1">
                              <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold px-1.5 py-0.5 rounded uppercase">
                                {pkg.badge || 'PROMO'}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors duration-200 pr-12">{pkg.name}</h5>
                            <p className="text-[10px] text-white/40 mt-1">Duration: {pkg.duration}</p>
                            {pkg.views && <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">Estimated Views: {pkg.views}</p>}
                            {pkg.desc && <p className="text-[10px] text-white/60 mt-1 line-clamp-2 leading-tight">{pkg.desc}</p>}
                            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-sm font-extrabold text-amber-500 font-mono">
                                {pkg.price} {pkg.currency || 'ETB'}
                              </span>
                              <span className="text-[9px] text-white/30 group-hover:text-amber-400 transition font-bold uppercase">Click to edit →</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ad lists */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Active Campaigns</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advertisements.map(ad => (
                    <div key={ad.id} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="p-4 flex gap-3">
                        <img src={ad.imageUrl} alt="Promo" className="w-14 h-14 rounded-xl object-cover border border-white/5 shrink-0" referrerPolicy="no-referrer" />
                        <div>
                          <h5 className="font-bold text-xs text-white flex items-center gap-1">
                            <span>{extractString(ad.title)}</span>
                            <span className="text-[8px] bg-amber-500/15 text-amber-400 font-extrabold px-1.5 rounded uppercase">{ad.position}</span>
                          </h5>
                          <p className="text-[10px] text-white/50 leading-tight mt-1 line-clamp-2">{ad.description}</p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-black/40 border-t border-white/5 flex justify-between items-center px-4">
                        <span className="text-[9px] text-white/30 font-mono">Views: {(ad as any).viewsCount || 0}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleAd(ad)} className="cursor-pointer">
                            {ad.isActive ? <ToggleRight className="w-5.5 h-5.5 text-amber-500" /> : <ToggleLeft className="w-5.5 h-5.5 text-white/20" />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingAd(ad);
                              setAdForm({ title: ad.title, description: ad.description, imageUrl: ad.imageUrl, linkUrl: ad.linkUrl, position: ad.position });
                            }}
                            className="p-1 text-white/40 hover:text-amber-500 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteAd(ad.id)} className="p-1 text-white/40 hover:text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. VERIFICATION CENTER */}
          {adminTab === 'verification' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Trust & Verification Center</h3>
                <p className="text-xs text-white/40 mt-1">Audit official credentials, land deeds, and corporate registry requests to assign verified trust badges.</p>
              </div>

              <div className="divide-y divide-white/5">
                {users.filter(u => u.verificationStatus === 'pending').length === 0 ? (
                  <p className="py-12 text-center text-white/30 font-light text-xs">No pending verification credentials in queue.</p>
                ) : (
                  users.filter(u => u.verificationStatus === 'pending').map(user => (
                    <div key={user.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm">{user.fullName}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                        <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[11px] text-white/80 font-mono mt-2">
                          <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block mb-1">Uploaded Credential Reference:</span>
                          {user.verificationDocument || 'Business License No. 98421-Addis'}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const notes = prompt('Enter approval notes (optional):');
                            handleVerifyOwnerDoc(user, 'verified', notes || 'Approved');
                          }}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Verify Seller
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Specify rejection reason:');
                            if (reason) {
                              handleVerifyOwnerDoc(user, 'rejected', reason);
                            }
                          }}
                          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject Document
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 7. REPORTS AND SAFETY CENTER */}
          {adminTab === 'reports' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Safety, Fraud, & Moderation Desk</h3>
                <p className="text-xs text-white/40 mt-1">Review spam, scam, fake listing reports, or user complaints. Moderate instantly.</p>
              </div>

              <div className="divide-y divide-white/5">
                {reports.length === 0 ? (
                  <p className="py-12 text-center text-white/30 font-light text-xs">No active complaints logged.</p>
                ) : (
                  reports.map(rep => (
                    <div key={rep.id} className="py-4.5 space-y-2 text-xs">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${rep.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/10 animate-pulse'}`}>
                              {rep.status}
                            </span>
                            <h4 className="font-bold text-white text-sm">Reason: {rep.reason}</h4>
                          </div>
                          <p className="text-[10px] text-white/40 mt-1">Reporter: {rep.reporterEmail} | Flagged Target: {rep.targetType} "{rep.targetName}" (ID: {rep.targetId})</p>
                        </div>

                        {rep.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Find user and suspend
                                const targetUser = users.find(u => u.id === rep.targetId || u.email === rep.targetName);
                                if (targetUser) handleToggleUserSuspension(targetUser);
                                handleResolveReport(rep.id);
                              }}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                            >
                              Suspend Target
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                            >
                              Dismiss Report
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-white/80 font-light leading-relaxed">{rep.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 8. SUPPORT CENTER */}
          {adminTab === 'support' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-8">
              
              {/* Help & Tickets */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Administrative Helpdesk</h3>
                  <p className="text-xs text-white/40 mt-1">Manage submitted support queries, user complaints, and respond directly.</p>
                </div>

                {/* Reply inline form */}
                {ticketReplyId && (
                  <form onSubmit={handleReplyTicket} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Send Support Reply</h5>
                    <textarea
                      required
                      rows={2}
                      placeholder="Type your response to the user ticket..."
                      value={ticketReplyText}
                      onChange={e => setTicketReplyText(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setTicketReplyId(null)} className="px-3 py-1.5 bg-white/5 rounded-xl text-[11px]">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 bg-amber-500 text-black font-bold rounded-xl text-[11px]">Dispatch Response</button>
                    </div>
                  </form>
                )}

                <div className="divide-y divide-white/5">
                  {supportTickets.map(tkt => (
                    <div key={tkt.id} className="py-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{tkt.subject}</p>
                          <span className="text-[10px] text-white/40">From: {tkt.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${tkt.status === 'Open' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10 animate-pulse' : 'bg-white/5 text-white/40'}`}>
                            {tkt.status}
                          </span>
                          {tkt.status === 'Open' && (
                            <button
                              onClick={() => { setTicketReplyId(tkt.id); setTicketReplyText(''); }}
                              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-[10px] hover:bg-amber-400"
                            >
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-white/70 italic font-light">"{tkt.message}"</p>
                      {tkt.reply && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl text-[11px] text-emerald-400 mt-1 flex gap-1.5 items-start">
                          <Check className="w-4 h-4 shrink-0 mt-0.5" />
                          <p><strong>Admin Response:</strong> {tkt.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Manager */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-amber-500" /> FAQ Knowledgebase Manager</h4>
                  <p className="text-xs text-white/40 mt-1">Configure questions and answers served on user-facing FAQ panels.</p>
                </div>

                {/* FAQ Add Form */}
                <form onSubmit={handleAddFaq} className="bg-black/40 border border-white/5 p-4.5 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Frequently Asked Question..."
                      value={newFaqQuestion}
                      onChange={e => setNewFaqQuestion(e.target.value)}
                      className="px-3.5 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Knowledge Answer..."
                      value={newFaqAnswer}
                      onChange={e => setNewFaqAnswer(e.target.value)}
                      className="px-3.5 py-2 bg-black/40 border border-white/5 rounded-xl text-xs"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> Add FAQ Item
                  </button>
                </form>

                <div className="space-y-3">
                  {faqs && faqs.map(f => (
                    <div key={f.id} className="bg-[#12121a] border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-white text-xs">Q: {getFaqText(f.question)}</p>
                        <p className="text-[11px] text-white/50 leading-relaxed font-light mt-1.5">A: {getFaqText(f.answer)}</p>
                        {f.category && (
                          <span className="inline-block mt-2 text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded uppercase">
                            Category: {f.category}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteFaq(f.id)} className="p-1.5 text-white/30 hover:text-rose-500 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. LANGUAGE MANAGEMENT */}
          {adminTab === 'languages' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Manage Languages & Translation Key dictionary</h3>
                  <p className="text-xs text-white/40 mt-1">Translate terminology seamlessly for English, Afaan Oromoo (Oromiffa), and Amharic.</p>
                </div>
              </div>

              {/* Add Language Form */}
              <form onSubmit={handleAddLanguage} className="bg-white/5 p-4 border border-white/10 rounded-2xl flex flex-wrap gap-4 items-end max-w-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">ISO Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. om"
                    value={newLangCode}
                    onChange={e => setNewLangCode(e.target.value)}
                    className="p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">Display Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afaan Oromoo"
                    value={newLangName}
                    onChange={e => setNewLangName(e.target.value)}
                    className="p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none"
                  />
                </div>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition">Add Language</button>
              </form>

              {/* Active list */}
              <div className="flex gap-3 flex-wrap">
                {languages.map(l => (
                  <div key={l.code} className="bg-[#12121a] border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                    <div>
                      <p className="font-bold text-xs text-white">{l.name}</p>
                      <p className="text-[9px] text-white/40 uppercase font-mono mt-0.5">ISO: {l.code}</p>
                    </div>
                    <button className="cursor-pointer" onClick={() => handleToggleLanguage(l)}>
                      {l.isActive ? <ToggleRight className="w-6.5 h-6.5 text-amber-500" /> : <ToggleLeft className="w-6.5 h-6.5 text-white/20" />}
                    </button>
                  </div>
                ))}
              </div>

              {/* Dictionary Table */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Translation Lexicon</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-white">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#12121a] text-[9px] text-white/40 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3 text-left">Translation Key</th>
                        <th className="py-3 px-3 text-left">English (en)</th>
                        <th className="py-3 px-3 text-left">Afaan Oromoo (om)</th>
                        <th className="py-3 px-3 text-left">Amharic (am)</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {translations.map(tk => {
                        const isEditing = editingTranslationKey === tk.key;
                        return (
                          <tr key={tk.key} className="hover:bg-white/[0.01]">
                            <td className="py-3 px-3 font-mono font-bold text-amber-500/85">{tk.key}</td>
                            <td className="py-3 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={translationEdits.en}
                                  onChange={e => setTranslationEdits({ ...translationEdits, en: e.target.value })}
                                  className="p-1.5 bg-black border border-white/5 text-xs rounded-lg w-full text-white"
                                />
                              ) : (
                                <span className="font-medium text-white/95">{tk.en}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={translationEdits.om}
                                  onChange={e => setTranslationEdits({ ...translationEdits, om: e.target.value })}
                                  className="p-1.5 bg-black border border-white/5 text-xs rounded-lg w-full text-white"
                                />
                              ) : (
                                <span className="text-white/60">{tk.om}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={translationEdits.am}
                                  onChange={e => setTranslationEdits({ ...translationEdits, am: e.target.value })}
                                  className="p-1.5 bg-black border border-white/5 text-xs rounded-lg w-full text-white"
                                />
                              ) : (
                                <span className="text-white/60">{tk.am}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isEditing ? (
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => handleSaveTranslation(tk.key)} className="bg-amber-500 text-black font-bold p-1 px-2.5 rounded-lg text-[9px] cursor-pointer">Save</button>
                                  <button onClick={() => setEditingTranslationKey(null)} className="bg-white/5 text-white/50 p-1 px-2.5 rounded-lg text-[9px] cursor-pointer border border-white/5">X</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingTranslationKey(tk.key);
                                    setTranslationEdits({ en: tk.en, om: tk.om || '', am: tk.am || '' });
                                  }}
                                  className="text-amber-500 font-bold hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 10. PAYMENT MANAGEMENT */}
          {adminTab === 'payments' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-8">
              
              {/* Receipt Desk */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white">Manual Bank Deposit / Telebirr Slips Desk</h3>
                    <p className="text-xs text-white/40 mt-1">Audit uploaded manual CBE receipt images, verify against banking logs, and approve property promotions and wallet top-ups.</p>
                  </div>
                  {pendingReceiptsCount > 0 && (
                    <button
                      onClick={handleApproveAllReceipts}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 shrink-0"
                    >
                      <Check className="w-4 h-4" /> Batch Approve All ({pendingReceiptsCount}) Slips & Activate Promotions
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-white">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#12121a] text-[9px] text-white/40 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 text-left">Sender Info</th>
                        <th className="py-3 px-4 text-left">Payment Method</th>
                        <th className="py-3 px-4 text-left">Listing / Purpose</th>
                        <th className="py-3 px-4 text-left">Amount (ETB)</th>
                        <th className="py-3 px-4 text-left">Receipt Document</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {receipts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-white/30 font-light text-xs">No payment receipts in queue.</td>
                        </tr>
                      ) : (
                        receipts.map(rec => {
                          const linkedProp = properties.find(p => p.id === rec.relatedPropertyId);
                          return (
                            <tr key={rec.id} className="hover:bg-white/[0.01]">
                              <td className="py-3 px-4">
                                <p className="font-bold text-white">{rec.userEmail}</p>
                                <span className="text-[10px] text-white/30 font-mono">ID: {rec.userId}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">{rec.paymentMethodName}</span>
                              </td>
                              <td className="py-3 px-4">
                                {linkedProp ? (
                                  <div className="flex items-center gap-2">
                                    {linkedProp.images && linkedProp.images[0] ? (
                                      <img src={linkedProp.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center shrink-0"><Building className="w-4 h-4 text-white/30" /></div>
                                    )}
                                    <div className="max-w-[180px] truncate">
                                      <p className="font-bold text-amber-400 truncate text-xs">{linkedProp.title}</p>
                                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Property Promotion Boost</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-medium text-white/80 truncate max-w-[160px]">{rec.relatedPropertyTitle || 'Wallet Balance Top-Up'}</p>
                                    <span className="text-[9px] text-amber-400/80 font-mono">Account Deposit</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-extrabold text-amber-500 font-mono text-sm">{rec.amount.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                {rec.receiptUrlOrFile.startsWith('http') ? (
                                  <a href={rec.receiptUrlOrFile} target="_blank" rel="noreferrer" className="text-amber-500 font-bold hover:underline flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> View Slip
                                  </a>
                                ) : (
                                  <span className="font-mono bg-black/40 px-2 py-1 rounded text-white/70 text-[10px] border border-white/5">{rec.receiptUrlOrFile}</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase tracking-wider ${rec.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : rec.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {rec.status === 'Pending' ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button 
                                      onClick={() => handleVerifyReceipt(rec.id, 'Approved')} 
                                      className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-lg cursor-pointer text-[10px] uppercase flex items-center gap-1"
                                      title="Approve Receipt and Activate Promotion"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const r = prompt('Rejection reason:');
                                        if (r) handleVerifyReceipt(rec.id, 'Rejected', r);
                                      }} 
                                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold rounded-lg cursor-pointer text-[10px] uppercase flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2 items-center">
                                    <span className="text-[10px] text-white/30 font-mono">Audited</span>
                                    <button 
                                      onClick={() => handleVerifyReceipt(rec.id, rec.status === 'Approved' ? 'Rejected' : 'Approved')}
                                      className="text-[9px] text-amber-500 font-bold hover:underline cursor-pointer uppercase"
                                    >
                                      Re-audit
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods Config */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 
                    onClick={() => setShowPayForm(!showPayForm)}
                    className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:text-amber-500 transition-colors"
                  >
                    <Landmark className="w-4 h-4 text-amber-500" /> Manual Payment Method Configurator
                  </h4>
                  <button
                    onClick={() => {
                      setEditingPay(null);
                      setPayForm({ name: '', accountName: '', accountNumber: '', phoneNumber: '', instructions: '' });
                      setShowPayForm(!showPayForm);
                    }}
                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 border border-white/10 rounded-xl flex items-center gap-1 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" /> {showPayForm ? 'Hide Form' : 'Add Bank Config'}
                  </button>
                </div>

                {showPayForm && (
                  <form 
                    onSubmit={async (e) => {
                      await handleSavePaymentMethod(e);
                      setShowPayForm(false);
                    }} 
                    className="bg-white/5 p-4.5 rounded-2xl border border-white/10 space-y-4 max-w-xl animate-fadeIn"
                  >
                    <p className="text-[11px] text-amber-400/80 uppercase font-bold tracking-wider">
                      {editingPay ? 'Edit Payment Method' : 'Add New Payment Method'}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-semibold">1. Bank / Wallet Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CBE, Telebirr, Awash Bank"
                          value={payForm.name}
                          onChange={e => setPayForm({ ...payForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-semibold">2. Account Holder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Abebe Kebede"
                          value={payForm.accountName}
                          onChange={e => setPayForm({ ...payForm, accountName: e.target.value })}
                          className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-semibold">3. Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1000123456789"
                          value={payForm.accountNumber}
                          onChange={e => setPayForm({ ...payForm, accountNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Expandable Section for Support Hotline & User Instructions */}
                      <div className="pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setExpandAdvanced(!expandAdvanced)}
                          className="text-[10px] text-amber-500/70 hover:text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          {expandAdvanced ? 'Hide' : 'Show'} Support Hotline & Instructions (Optional)
                        </button>
                        
                        {expandAdvanced && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-semibold">Support Hotline</label>
                              <input
                                type="text"
                                placeholder="e.g. +251911000000"
                                value={payForm.phoneNumber}
                                onChange={e => setPayForm({ ...payForm, phoneNumber: e.target.value })}
                                className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-semibold">Instructions for Users</label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Transfer to CBE, take screenshot of transaction receipt and upload here."
                                value={payForm.instructions}
                                onChange={e => setPayForm({ ...payForm, instructions: e.target.value })}
                                className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPayForm(false);
                          setEditingPay(null);
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer"
                      >
                        {editingPay ? 'Apply Changes' : 'Create Payment Method'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Gateways loop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="bg-[#12121a] border border-white/5 p-4 rounded-xl flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-white text-xs flex items-center gap-1">
                          <span>{pm.name}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 rounded ${pm.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>{pm.isActive ? 'Live' : 'Off'}</span>
                        </h5>
                        <p className="text-[10px] text-white/40 mt-1">Holder: {pm.accountName}</p>
                        <p className="text-[10px] text-amber-500 font-mono mt-0.5">Acc: {pm.accountNumber}</p>
                        {(pm.phoneNumber || pm.instructions) && (
                          <div className="mt-2 pt-1.5 border-t border-white/5 text-[9px] text-white/30 space-y-0.5">
                            {pm.phoneNumber && <p>Hotline: {pm.phoneNumber}</p>}
                            {pm.instructions && <p className="truncate max-w-[180px]">Steps: {pm.instructions}</p>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <button 
                          onClick={() => {
                            setEditingPay(pm);
                            setPayForm({
                              name: pm.name,
                              accountName: pm.accountName,
                              accountNumber: pm.accountNumber,
                              phoneNumber: pm.phoneNumber || '',
                              instructions: pm.instructions || ''
                            });
                            setShowPayForm(true);
                          }} 
                          className="text-white/40 hover:text-amber-500 p-1 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleTogglePaymentMethod(pm)} className="cursor-pointer">
                          {pm.isActive ? <ToggleRight className="w-5.5 h-5.5 text-amber-500" /> : <ToggleLeft className="w-5.5 h-5.5 text-white/20" />}
                        </button>
                        <button onClick={() => handleDeletePaymentMethod(pm.id)} className="text-white/30 hover:text-rose-400 p-1 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Settings Structure (Future-Ready) */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5"><Percent className="w-4 h-4 text-amber-500" /> Future Commission & Seller Payout Settings (Statically Configured)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light">
                  <div className="bg-[#12121a] border border-white/5 p-4 rounded-xl space-y-1">
                    <p className="text-white/40 text-[9px] uppercase font-bold tracking-wider">PLATFORM COMMISSION</p>
                    <p className="text-xl font-extrabold text-white">2.5%</p>
                    <p className="text-[10px] text-white/30">Assessed on verified properties matching escrow</p>
                  </div>
                  <div className="bg-[#12121a] border border-white/5 p-4 rounded-xl space-y-1">
                    <p className="text-white/40 text-[9px] uppercase font-bold tracking-wider">REFUND SLA PERIOD</p>
                    <p className="text-xl font-extrabold text-white">48 Hours</p>
                    <p className="text-[10px] text-white/30">Standard investigation buffer for disputed slips</p>
                  </div>
                  <div className="bg-[#12121a] border border-white/5 p-4 rounded-xl space-y-1">
                    <p className="text-white/40 text-[9px] uppercase font-bold tracking-wider">PAYOUT SETTLEMENT</p>
                    <p className="text-xl font-extrabold text-white">Every Friday</p>
                    <p className="text-[10px] text-white/30">Bulk CBE clearing transfers to agency bank nodes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. SYSTEM SETTINGS */}
          {adminTab === 'settings' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              {/* Dynamic Theme Injector for live, instant settings preview */}
              {systemSettings?.themeName && (
                <style dangerouslySetInnerHTML={{ __html: getThemeCSS(systemSettings.themeName) }} />
              )}

              <div>
                <h3 className="text-xl font-serif font-bold text-white">System Brand & Parameter Adjustments</h3>
                <p className="text-xs text-white/40 mt-1">Rebrand application nodes, edit terms & conditions, or trigger system status.</p>
              </div>

              {/* Branding Section */}
              <div className="p-4 bg-[#12121a] border border-white/5 rounded-2xl space-y-6">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Application Branding & Visual Assets</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center gap-5">
                    {systemSettings.logoUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={systemSettings.logoUrl}
                          alt="App Brand Logo"
                          className="w-20 h-20 object-cover rounded-2xl border-2 border-amber-500/50 shadow-lg shadow-amber-500/15"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, logoUrl: '' };
                            setSystemSettings(updated);
                            try {
                              await updateSystemSettings(updated);
                              setSaveSettingsSuccess(true);
                              setTimeout(() => setSaveSettingsSuccess(false), 3000);
                            } catch (err) {
                              console.error('Failed to delete logo:', err);
                            }
                          }}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[9px] font-extrabold rounded-lg border border-rose-500/25 cursor-pointer transition flex items-center gap-1 uppercase tracking-wider"
                          title="Remove brand logo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-3xl shadow-lg shadow-amber-500/10 shrink-0">
                        {(systemSettings.appLogoText || systemSettings.appName || 'S')[0].toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold text-white">Application Profile Logo</p>
                      <p className="text-[10px] text-white/40 leading-relaxed max-w-sm">Select an image to represent your application branding across navbar, menus, and profile slots.</p>
                      
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-extrabold rounded-xl cursor-pointer transition shadow shadow-amber-500/15">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{systemSettings.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Navbar / Sidebar Brand Text</label>
                    <input
                      type="text"
                      placeholder="e.g. SOF-UMER"
                      value={systemSettings.appLogoText}
                      onChange={e => setSystemSettings({ ...systemSettings, appLogoText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Theme Selection (10 Modern Options) */}
              <div className="p-4 bg-[#12121a] border border-white/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-amber-500" />
                    <span>Select Visual Theme (10 Premium Options)</span>
                  </h4>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                    Active: {APP_THEMES.find(t => t.id === systemSettings.themeName)?.name || systemSettings.themeName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {APP_THEMES.map((theme) => {
                    const isActive = systemSettings.themeName === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSystemSettings({ ...systemSettings, themeName: theme.id })}
                        className={`flex flex-col text-left p-3 rounded-2xl border transition relative cursor-pointer overflow-hidden group ${
                          isActive
                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                            : 'border-white/5 bg-black/30 hover:border-white/15 hover:bg-white/5'
                        }`}
                      >
                        {/* Theme color circle previews */}
                        <div className="flex gap-1.5 mb-2.5">
                          {/* Accent Circle */}
                          <div 
                            className="w-4 h-4 rounded-full border border-white/10 shadow"
                            style={{ backgroundColor: theme.accent }}
                            title="Accent Color"
                          />
                          {/* Card/BG Circle */}
                          <div 
                            className="w-4 h-4 rounded-full border border-white/10 shadow -ml-1"
                            style={{ backgroundColor: theme.card }}
                            title="Card/BG"
                          />
                          {/* Hover Accent Circle */}
                          {theme.gradientTo && (
                            <div 
                              className="w-4 h-4 rounded-full border border-white/10 shadow -ml-1"
                              style={{ backgroundColor: theme.gradientTo }}
                              title="Gradient Accents"
                            />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <p className="text-[11px] font-bold text-white group-hover:text-amber-400 transition truncate">
                            {theme.name.replace(' (Original)', '')}
                          </p>
                          <p className="text-[9px] text-white/40 leading-relaxed line-clamp-2">
                            {theme.description}
                          </p>
                        </div>

                        {isActive && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-black rounded-full p-0.5 shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Core App Name</label>
                  <input
                    type="text"
                    value={systemSettings.appName}
                    onChange={e => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Site Live Status</label>
                  <select
                    value={systemSettings.siteStatus}
                    onChange={e => setSystemSettings({ ...systemSettings, siteStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-xl text-xs animate-none"
                  >
                    <option value="Online">Online & Active</option>
                    <option value="Maintenance">Under Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Homepage Big Heading</label>
                  <input
                    type="text"
                    value={systemSettings.homepageHeading}
                    onChange={e => setSystemSettings({ ...systemSettings, homepageHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Homepage Subheading description</label>
                  <textarea
                    rows={2}
                    value={systemSettings.homepageSubheading}
                    onChange={e => setSystemSettings({ ...systemSettings, homepageSubheading: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Legal Terms of Use & Privacy</label>
                  <textarea
                    rows={3}
                    value={systemSettings.termsAndPrivacy}
                    onChange={e => setSystemSettings({ ...systemSettings, termsAndPrivacy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs">Simulated Notifications Dispatcher</h5>
                  <p className="text-[10px] text-white/40">Toggle real-time alerts on user dashboard nodes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemSettings({ ...systemSettings, notificationsEnabled: !systemSettings.notificationsEnabled })}
                  className="cursor-pointer"
                >
                  {systemSettings.notificationsEnabled ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/20" />}
                </button>
              </div>

              {/* Contact Us Management Section */}
              <div className="pt-6 border-t border-white/5 space-y-4 text-left">
                <div className="bg-[#12121c] border border-amber-500/20 rounded-2xl p-5 space-y-5 shadow-xl">
                  {/* Contact Us Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <Mail className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white tracking-wide font-serif flex items-center gap-2">
                          <span>{contactUsData?.title || 'Contact Us'}</span>
                          {!contactUsData && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                              Deleted / Hidden
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-white/50 mt-0.5">
                          {contactUsData?.subtitle || 'Have questions or feedback? Send us an inquiry directly.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {contactUsData ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setContactUsForm({ ...defaultContactUs, ...(contactUsData || {}) });
                              setEditingContactUs(!editingContactUs);
                            }}
                            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/25 px-3 py-1.5 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> {editingContactUs ? 'Close Edit' : 'Edit Contact Us'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteContactUs}
                            className="text-xs bg-rose-500/10 hover:bg-rose-500/25 px-3 py-1.5 border border-rose-500/20 text-rose-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Card
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResetContactUs}
                          className="text-xs bg-amber-500/10 hover:bg-amber-500/25 px-3 py-1.5 border border-amber-500/20 text-amber-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore Default Contact Us
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit Contact Us Form */}
                  {editingContactUs && contactUsData && (
                    <form onSubmit={handleSaveContactUs} className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 space-y-4 max-w-2xl animate-fade-in">
                      <p className="text-xs text-emerald-400 uppercase font-extrabold tracking-wider">
                        Edit Contact Us Settings
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Section Heading</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.title}
                            onChange={e => setContactUsForm({ ...contactUsForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Section Subtitle</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.subtitle}
                            onChange={e => setContactUsForm({ ...contactUsForm, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Headquarters Title</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.hqTitle}
                            onChange={e => setContactUsForm({ ...contactUsForm, hqTitle: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Location Landmark</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.location}
                            onChange={e => setContactUsForm({ ...contactUsForm, location: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Full Address</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.hqAddress}
                            onChange={e => setContactUsForm({ ...contactUsForm, hqAddress: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Official Email</label>
                          <input
                            type="email"
                            required
                            value={contactUsForm.email}
                            onChange={e => setContactUsForm({ ...contactUsForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Official Phone</label>
                          <input
                            type="text"
                            required
                            value={contactUsForm.phone}
                            onChange={e => setContactUsForm({ ...contactUsForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Name Field Placeholder</label>
                          <input
                            type="text"
                            value={contactUsForm.fullNamePlaceholder}
                            onChange={e => setContactUsForm({ ...contactUsForm, fullNamePlaceholder: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Email Field Placeholder</label>
                          <input
                            type="text"
                            value={contactUsForm.emailPlaceholder}
                            onChange={e => setContactUsForm({ ...contactUsForm, emailPlaceholder: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Message Field Placeholder</label>
                          <input
                            type="text"
                            value={contactUsForm.messagePlaceholder}
                            onChange={e => setContactUsForm({ ...contactUsForm, messagePlaceholder: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingContactUs(false)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Contact Us Preview Display */}
                  {contactUsData && !editingContactUs && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/40 p-5 rounded-2xl border border-white/10">
                      {/* Left: HQ Details */}
                      <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-white/10 pr-0 md:pr-4 pb-4 md:pb-0">
                        <div>
                          <h5 className="font-bold text-white text-sm font-serif">{contactUsData.hqTitle}</h5>
                          <p className="text-xs text-white/60 leading-relaxed mt-1">{contactUsData.hqAddress}</p>
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{contactUsData.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{contactUsData.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{contactUsData.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Inquiry Form Preview */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-wider">
                          Inquiry Form Preview
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-white/50 mb-1 font-bold">{contactUsData.fullNameLabel || 'Full Name *'}</label>
                            <input
                              type="text"
                              disabled
                              readOnly
                              value={contactUsData.fullNamePlaceholder}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/50 mb-1 font-bold">{contactUsData.emailLabel || 'Email Address *'}</label>
                            <input
                              type="text"
                              disabled
                              readOnly
                              value={contactUsData.emailPlaceholder}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-white/50 mb-1 font-bold">{contactUsData.messageLabel || 'Message / Inquiry *'}</label>
                            <textarea
                              disabled
                              readOnly
                              rows={2}
                              value={contactUsData.messagePlaceholder}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl cursor-default"
                        >
                          {contactUsData.submitBtnText || 'Send Message'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* How It Works Management Section */}
              <div className="pt-6 border-t border-white/5 space-y-4 text-left">
                <div className="bg-[#12121c] border border-amber-500/20 rounded-2xl p-5 space-y-5 shadow-xl">
                  {/* How It Works Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <HelpIcon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white tracking-wide font-serif">
                          How It Works
                        </h4>
                        <p className="text-xs text-white/50 mt-0.5">
                          A simple 3-step guide to buy, sell, rent, or trade.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingStepId(null);
                        setStepForm({ stepNumber: `Step 0${howItWorksSteps.length + 1}`, title: '', description: '' });
                        setShowAddStepForm(!showAddStepForm);
                      }}
                      className="text-xs bg-emerald-500/10 hover:bg-emerald-500/25 px-3.5 py-2 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0"
                    >
                      <Plus className="w-4 h-4" /> {showAddStepForm ? 'Close Form' : 'Add Step'}
                    </button>
                  </div>

                  {/* Add / Edit Step Form */}
                  {(showAddStepForm || editingStepId) && (
                    <form onSubmit={handleSaveStep} className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 space-y-4 max-w-2xl animate-fade-in">
                      <p className="text-xs text-emerald-400 uppercase font-extrabold tracking-wider">
                        {editingStepId ? 'Edit Step Details' : 'Add New Step'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Step Badge Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Step 01"
                            value={stepForm.stepNumber}
                            onChange={e => setStepForm({ ...stepForm, stepNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Step Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Create an Account"
                            value={stepForm.title}
                            onChange={e => setStepForm({ ...stepForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1 font-bold">Step Description *</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Provide detailed instructions for this step..."
                          value={stepForm.description}
                          onChange={e => setStepForm({ ...stepForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddStepForm(false);
                            setEditingStepId(null);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl cursor-pointer"
                        >
                          {editingStepId ? 'Save Step Changes' : 'Save Step'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Steps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {howItWorksSteps.map((step) => (
                      <div key={step.id} className="bg-black/40 border border-white/10 hover:border-amber-500/30 p-4 rounded-xl space-y-3 flex flex-col justify-between transition">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                              {step.stepNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStepId(step.id);
                                  setStepForm({
                                    stepNumber: step.stepNumber,
                                    title: step.title,
                                    description: step.description
                                  });
                                  setShowAddStepForm(false);
                                }}
                                className="p-1 bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 rounded-lg border border-white/5 transition cursor-pointer"
                                title="Edit Step"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStep(step.id)}
                                className="p-1 bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 rounded-lg border border-white/5 transition cursor-pointer"
                                title="Delete Step"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h5 className="font-bold text-white text-sm font-serif">{step.title}</h5>
                          <p className="text-xs text-white/50 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Careers & Job Openings Management Section */}
              <div className="pt-6 border-t border-white/5 space-y-4 text-left">
                <div className="bg-[#12121c] border border-amber-500/20 rounded-2xl p-5 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <Briefcase className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white tracking-wide font-serif flex items-center gap-2">
                          <span>Careers & Job Openings Manager</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            {jobOpenings ? jobOpenings.length : 0} Active
                          </span>
                        </h4>
                        <p className="text-xs text-white/50 mt-0.5">
                          Create, edit, or remove job listings for the public Careers page. Only admin-approved openings appear.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNewJob}
                      className="text-xs bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-black font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow shadow-amber-500/20 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Job Opening
                    </button>
                  </div>

                  {/* Job Opening Form */}
                  {showJobForm && (
                    <form onSubmit={handleSaveJob} className="bg-black/60 border border-amber-500/30 p-4.5 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {editingJob ? `Edit Position: ${editingJob.title}` : 'Create New Job Opening'}
                        </h5>
                        <button
                          type="button"
                          onClick={() => { setShowJobForm(false); setEditingJob(null); }}
                          className="text-white/40 hover:text-white p-1 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Job Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Customer Support Officer"
                            value={jobForm.title}
                            onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Department *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Operations, Engineering, Sales"
                            value={jobForm.department}
                            onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Location *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Addis Ababa (On-site), Remote"
                            value={jobForm.location}
                            onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Salary Range</label>
                          <input
                            type="text"
                            placeholder="e.g., 25,000 - 35,000 ETB / month"
                            value={jobForm.salary}
                            onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Job Description & Requirements *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Describe roles, responsibilities, and qualifications..."
                            value={jobForm.description}
                            onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => { setShowJobForm(false); setEditingJob(null); }}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer shadow"
                        >
                          {editingJob ? 'Save Job Changes' : 'Create Job Opening'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of active job openings */}
                  <div className="space-y-3">
                    {!jobOpenings || jobOpenings.length === 0 ? (
                      <div className="p-8 text-center bg-black/40 border border-white/5 rounded-2xl">
                        <Briefcase className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-xs text-white/50 font-medium">No job openings available.</p>
                        <p className="text-[11px] text-white/30 mt-1">Demo job openings have been deleted. Click "Add Job Opening" above to allow and publish careers.</p>
                      </div>
                    ) : (
                      jobOpenings.map(job => (
                        <div key={job.id} className="bg-[#12121a] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/20 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-xs">{job.title}</h5>
                              <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-2 py-0.5 rounded uppercase font-bold">
                                {job.department}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 font-mono flex items-center gap-3">
                              <span>📍 {job.location}</span>
                              <span>💰 {job.salary}</span>
                            </p>
                            <p className="text-xs text-white/70 font-light mt-1.5 line-clamp-2 max-w-2xl">
                              {job.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditJob(job)}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 text-white/30 hover:text-rose-500 rounded cursor-pointer transition"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2 border-t border-white/5">
                {saveSettingsSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Brand & Appearance settings saved successfully!</span>
                  </span>
                )}
                <button
                  type="button"
                  disabled={isSavingSettings}
                  onClick={() => handleSaveSystemSettings()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-extrabold text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving branding settings...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save Brand & Appearance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 12. ANALYTICS */}
          {adminTab === 'analytics' && (
            <div className="bg-[#0d0d12]/90 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Advanced Regional Analytics</h3>
                  <p className="text-xs text-white/40 mt-1">
                    Real-time database analytics compiled dynamically from active property records.
                  </p>
                </div>
              </div>

              {/* Bento cards for analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Popular locations */}
                <div className="bg-[#12121a] border border-white/5 p-5 rounded-2xl">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-amber-500" /> Active Listing Geographic Nodes
                  </h5>
                  
                    <div className="space-y-2.5">
                      {properties.length === 0 ? (
                        <p className="text-xs text-white/30 italic py-4">No live properties in the database to compile geographic analytics.</p>
                      ) : (
                        (() => {
                          const locationCounts = properties.reduce((acc: { [key: string]: number }, prop) => {
                            const loc = prop.location || 'Unknown';
                            acc[loc] = (acc[loc] || 0) + 1;
                            return acc;
                          }, {});
                          const total = properties.length;
                          return Object.entries(locationCounts).map(([area, count], idx) => {
                            const countNum = Number(count);
                            const share = Math.round((countNum / total) * 100);
                            return (
                              <div key={idx} className="text-xs space-y-1 text-white">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span>{area}</span>
                                  <span className="font-bold text-amber-500 font-mono">{share}% ({countNum} {countNum === 1 ? 'Post' : 'Posts'})</span>
                                </div>
                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full" style={{ width: `${share}%` }} />
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                </div>

                {/* Listing category density */}
                <div className="bg-[#12121a] border border-white/5 p-5 rounded-2xl">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1">
                    <Grid className="w-4 h-4 text-teal-500" /> Marketplace Category Breakdown
                  </h5>
                  
                    <div className="space-y-2.5">
                      {properties.length === 0 ? (
                        <p className="text-xs text-white/30 italic py-4">No live properties in the database to compile category analytics.</p>
                      ) : (
                        (() => {
                          const catCounts = properties.reduce((acc: { [key: string]: number }, prop) => {
                            const cat = prop.majorCategory || 'Properties';
                            acc[cat] = (acc[cat] || 0) + 1;
                            return acc;
                          }, {});
                          const total = properties.length;
                          return Object.entries(catCounts).map(([label, count], idx) => {
                            const countNum = Number(count);
                            const percentage = Math.round((countNum / total) * 100);
                            return (
                              <div key={idx} className="text-xs space-y-1 text-white">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span>{label}</span>
                                  <span className="font-bold text-teal-400 font-mono">{percentage}% ({countNum})</span>
                                </div>
                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                </div>

                {/* Additional KPI charts */}
                <div className="sm:col-span-2 bg-[#12121a] border border-white/5 p-5 rounded-2xl">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-white/40 mb-4 flex items-center gap-1">
                    <Users className="w-4 h-4 text-purple-500" /> Platform Registration & Traction Growth Matrix
                  </h5>
                  
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Live Users Node</p>
                        <p className="text-lg font-mono font-extrabold text-amber-500 mt-1">{users.length}</p>
                        <span className="text-[8px] text-emerald-400">Active profiles logged</span>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Total Properties</p>
                        <p className="text-lg font-mono font-extrabold text-amber-500 mt-1">{properties.length}</p>
                        <span className="text-[8px] text-emerald-400">Published online</span>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/[0.02]">
                        <p className="text-[10px] text-white/40 uppercase font-bold">Pending Audits</p>
                        <p className="text-lg font-mono font-extrabold text-amber-500 mt-1">
                          {properties.filter(p => p.verificationStatus === 'pending').length}
                        </p>
                        <span className="text-[8px] text-emerald-400">Awaiting visual review</span>
                      </div>
                    </div>
                </div>

              </div>
            </div>
          )}

          {adminTab === 'employeeAdmins' && (
            <EmployeeAdminsModule
              currentUser={currentUser}
              onNavigateToTab={setAdminTab}
              users={users}
              onRefreshData={refreshData}
            />
          )}

        </div>
      </div>
    </div>
  );
}
