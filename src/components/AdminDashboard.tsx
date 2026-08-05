import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { User, Property, PaymentMethod, PaymentReceipt, Advertisement, TranslationKey, Language, SafetyReport, JobOpening, SystemSettings } from '../types';
import { 
  Shield, Users, Languages, Volume2, Grid, HelpCircle, ShieldCheck, 
  AlertOctagon, CreditCard, ClipboardCheck, Trash2, Edit2, ToggleLeft, 
  ToggleRight, Check, X, PlusCircle, AlertCircle, Eye, EyeOff, Lock, RefreshCw, 
  CheckCircle2, Briefcase, Wrench, ShoppingBag, Store, Building, 
  TrendingUp, Settings, FileText, Landmark, ShieldAlert, BarChart3, 
  Activity, DollarSign, Percent, Clock, FileCheck, Info, Plus, 
  Calendar, MapPin, ChevronRight, HelpCircle as HelpIcon, BellRing,
  Camera, Image as ImageIcon, Folder, FolderKanban, ChevronDown,
  Mail, Phone, RotateCcw, Zap, LogOut, Gift, Monitor, Smartphone, Upload, XCircle, Save, Globe,
  Ban, PauseCircle, AlertTriangle, Download, ZoomIn, ZoomOut, History, UserX, ArrowLeft, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeAdminsModule } from './EmployeeAdminsModule';
import { APP_THEMES, getThemeCSS } from '../lib/themes';
import { extractString } from '../lib/categoriesData';
import { maskName, maskEmail } from '../lib/utils';
import { getCampaignStatusInfo } from '../utils/campaignUtils';

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
    updateFaq,
    deleteFaq
  } = useApp();

  // Selected core tab corresponding to the 12 requested sections
  const [adminTab, setAdminTab] = useState<
    'overview' | 'users' | 'listings' | 'categories' | 'ads' | 
    'verification' | 'reports' | 'support' | 'languages' | 
    'payments' | 'settings' | 'analytics' | 'employeeAdmins'
  >('overview');

  // Admin Privacy Control: Hide admin personal details by default
  const [showAdminDetails, setShowAdminDetails] = useState<boolean>(false);
  const isAuthorizedAdmin = currentUser?.role === 'admin' && currentUser?.isEmployee !== true;

  const isTabAllowed = (tab: string) => {
    if (!currentUser) return false;
    if (currentUser.role !== 'admin') return false;
    
    // Strict Security: Employees can NEVER access system settings or employee management
    if (currentUser.isEmployee === true && (tab === 'settings' || tab === 'employeeAdmins')) {
      return false;
    }

    if (currentUser.isEmployee !== true) return true; // Super Admin (Owner) has access to all

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
      const role = currentUser.employeeRole;
      let primaryRoleTab = 'overview';
      if (role === 'Content Moderator') primaryRoleTab = 'listings';
      else if (role === 'Customer Support') primaryRoleTab = 'support';
      else if (role === 'Verification Officer') primaryRoleTab = 'verification';
      else if (role === 'Advertisement Manager') primaryRoleTab = 'ads';
      else if (role === 'Finance Manager') primaryRoleTab = 'payments';
      else if (role === 'Analytics Manager') primaryRoleTab = 'analytics';

      if (isTabAllowed(primaryRoleTab)) {
        setAdminTab(primaryRoleTab as any);
      } else {
        const allTabs = ['overview', 'users', 'listings', 'categories', 'ads', 'verification', 'reports', 'support', 'languages', 'payments', 'settings', 'analytics'];
        const allowed = allTabs.filter(isTabAllowed);
        if (allowed.length > 0 && !allowed.includes(adminTab)) {
          setAdminTab(allowed[0] as any);
        }
      }
    }
  }, [currentUser?.id, currentUser?.employeeRole]);

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
  const [adImageUploading, setAdImageUploading] = useState(false);
  const [adUploadedFile, setAdUploadedFile] = useState<{ url: string; fileName: string; fileSize: number; isCloudinary?: boolean } | null>(null);
  const [adUploadError, setAdUploadError] = useState<string | null>(null);

  const [editingPay, setEditingPay] = useState<PaymentMethod | null>(null);
  const [payForm, setPayForm] = useState({ name: '', accountName: '', accountNumber: '', phoneNumber: '', instructions: '' });
  const [showPayForm, setShowPayForm] = useState(false);
  const [expandAdvanced, setExpandAdvanced] = useState(false);

  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');

  const [editingTranslationKey, setEditingTranslationKey] = useState<string | null>(null);
  const [translationEdits, setTranslationEdits] = useState({ en: '', om: '', am: '' });
  const [transSearch, setTransSearch] = useState('');
  const [newKeyForm, setNewKeyForm] = useState({ key: '', en: '', om: '', am: '', category: 'General' });
  const [showAddKeyForm, setShowAddKeyForm] = useState(false);

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
  const [adminEditorTab, setAdminEditorTab] = useState<'basic' | 'category' | 'location' | 'owner' | 'media' | 'wholesale' | 'management'>('basic');
  const [adminNewImageUrl, setAdminNewImageUrl] = useState('');
  
  const [propForm, setPropForm] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'ETB' as Property['currency'],
    negotiable: 'No',
    quantity: 1,
    condition: 'New',
    brand: '',
    model: '',
    storageSpec: '',
    color: '',
    majorCategory: 'Properties' as Property['majorCategory'],
    propertyType: '',
    location: '',
    region: '',
    city: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    ownerBusinessName: '',
    images: [] as string[],
    coverImage: '',
    videoUrl: '',
    sellingType: 'Retail',
    retailPrice: 0,
    wholesalePrice: 0,
    wholesaleUnit: 'Piece',
    minimumOrderQuantity: 1,
    availableQuantity: 1,
    businessType: 'Wholesaler',
    deliveryOptions: [] as string[],
    wholesaleNotes: '',
    verificationStatus: 'pending' as 'pending' | 'verified' | 'rejected',
    approvalStatus: 'approved' as 'approved' | 'pending' | 'rejected',
    isFeatured: false,
    isTopAd: false,
    boostPlan: 'free',
    promotionExpiresAt: '',
    isArchived: false
  });

  const handleAdminAddPhoto = () => {
    if (adminNewImageUrl.trim()) {
      setPropForm(prev => ({
        ...prev,
        images: [...prev.images, adminNewImageUrl.trim()],
        coverImage: prev.images.length === 0 ? adminNewImageUrl.trim() : prev.coverImage
      }));
      setAdminNewImageUrl('');
    }
  };

  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const res = reader.result;
        setPropForm(prev => ({
          ...prev,
          images: [...prev.images, res],
          coverImage: prev.images.length === 0 ? res : prev.coverImage
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdminMovePhoto = (index: number, direction: 'left' | 'right') => {
    setPropForm(prev => {
      const arr = [...prev.images];
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      const temp = arr[index];
      arr[index] = arr[targetIdx];
      arr[targetIdx] = temp;
      return { ...prev, images: arr };
    });
  };

  const handleAdminSetCoverPhoto = (index: number) => {
    setPropForm(prev => {
      const arr = [...prev.images];
      if (index <= 0 || index >= arr.length) return prev;
      const [selected] = arr.splice(index, 1);
      arr.unshift(selected);
      return { ...prev, images: arr, coverImage: selected };
    });
  };

  const handleAdminRemovePhoto = (index: number) => {
    setPropForm(prev => {
      const arr = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: arr, coverImage: arr[0] || '' };
    });
  };

  const handleAdminToggleDelivery = (opt: string) => {
    setPropForm(prev => {
      const current = Array.isArray(prev.deliveryOptions) ? [...prev.deliveryOptions] : [];
      if (current.includes(opt)) {
        return { ...prev, deliveryOptions: current.filter(o => o !== opt) };
      } else {
        return { ...prev, deliveryOptions: [...current, opt] };
      }
    });
  };

  // Helper to extract FAQ text regardless of string vs object localization
  const getFaqText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val.en || val.om || val.am || Object.values(val)[0] || '';
  };



  const DEFAULT_CLEAN_PACKAGES = [
    { id: 'starter', name: 'STARTER', price: 100, currency: 'ETB', duration: '3 days', daysCount: 3, views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'PREMIUM', price: 150, currency: 'ETB', duration: '7 days', daysCount: 7, views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP ELITE', price: 500, currency: 'ETB', duration: '30 days', daysCount: 30, views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
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
    appName: 'SOF-UMER',
    appLogoText: 'SOF-UMER',
    logoUrl: '',
    themeName: 'cosmic-slate',
    heroTitle: 'The Smart Way to Discover, Connect & Grow',
    heroDescription: 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.',
    heroImageUrl: '',
    siteStatus: 'Online',
    maintenanceMessage: 'SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience.'
  });

  const [settingsSubTab, setSettingsSubTab] = useState<'web' | 'branding' | 'payments' | 'contact'>('web');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Core App Name Handlers
  const [appNameError, setAppNameError] = useState('');
  const [appNameSuccess, setAppNameSuccess] = useState('');
  const [isSavingAppName, setIsSavingAppName] = useState(false);

  const handleSaveAppName = async () => {
    setAppNameError('');
    setAppNameSuccess('');
    const name = (systemSettings.appName || 'SOF-UMER').trim();
    if (!name) {
      setAppNameError('Core App Name field cannot be empty.');
      return;
    }
    setIsSavingAppName(true);
    try {
      const updated = {
        ...systemSettings,
        appName: name,
        appLogoText: systemSettings.appLogoText || name
      };
      setSystemSettings(updated);
      await updateSystemSettings(updated);
      document.title = `${name} | Admin Management Dashboard`;
      setAppNameSuccess('Core App Name saved successfully! Branding updated across all portals.');
      setTimeout(() => setAppNameSuccess(''), 4000);
    } catch (err: any) {
      setAppNameError(err.message || 'Failed to save Core App Name.');
    } finally {
      setIsSavingAppName(false);
    }
  };

  const handleResetAppName = async () => {
    setAppNameError('');
    setAppNameSuccess('');
    setIsSavingAppName(true);
    try {
      const updated = {
        ...systemSettings,
        appName: 'SOF-UMER',
        appLogoText: 'SOF-UMER'
      };
      setSystemSettings(updated);
      await updateSystemSettings(updated);
      document.title = `SOF-UMER | Admin Management Dashboard`;
      setAppNameSuccess('Reset Core App Name to default "SOF-UMER" successfully.');
      setTimeout(() => setAppNameSuccess(''), 4000);
    } catch (err: any) {
      setAppNameError('Failed to reset Core App Name.');
    } finally {
      setIsSavingAppName(false);
    }
  };

  // Site Live Status Handlers
  const [siteStatusError, setSiteStatusError] = useState('');
  const [siteStatusSuccess, setSiteStatusSuccess] = useState('');
  const [isSavingSiteStatus, setIsSavingSiteStatus] = useState(false);

  const handleSaveSiteStatus = async () => {
    setSiteStatusError('');
    setSiteStatusSuccess('');
    setIsSavingSiteStatus(true);
    try {
      const updated = {
        ...systemSettings,
        siteStatus: systemSettings.siteStatus || 'Online',
        maintenanceMessage: (systemSettings.maintenanceMessage || 'SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience.').trim()
      };
      setSystemSettings(updated);
      await updateSystemSettings(updated);
      setSiteStatusSuccess(`Site Live Status updated to "${updated.siteStatus}" successfully! Changes apply instantly.`);
      setTimeout(() => setSiteStatusSuccess(''), 4000);
    } catch (err: any) {
      setSiteStatusError(err.message || 'Failed to save Site Live Status.');
    } finally {
      setIsSavingSiteStatus(false);
    }
  };

  const handleResetSiteStatus = async () => {
    setSiteStatusError('');
    setSiteStatusSuccess('');
    setIsSavingSiteStatus(true);
    try {
      const updated = {
        ...systemSettings,
        siteStatus: 'Online'
      };
      setSystemSettings(updated);
      await updateSystemSettings(updated);
      setSiteStatusSuccess('Site Live Status reset to Live (Online) mode successfully.');
      setTimeout(() => setSiteStatusSuccess(''), 4000);
    } catch (err: any) {
      setSiteStatusError('Failed to reset Site Live Status.');
    } finally {
      setIsSavingSiteStatus(false);
    }
  };

  // Login Hero Settings States & Handlers
  const [heroPreviewMode, setHeroPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [heroError, setHeroError] = useState('');
  const [heroSuccess, setHeroSuccess] = useState('');
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  const handleSaveHeroSettings = async () => {
    setHeroError('');
    setHeroSuccess('');

    const title = (systemSettings.heroTitle || 'The Smart Way to Discover, Connect & Grow').trim();
    const description = (systemSettings.heroDescription || 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.').trim();

    if (!title) {
      setHeroError('Hero Title field cannot be empty.');
      return;
    }
    if (title.length > 200) {
      setHeroError('Hero Title must be less than 200 characters.');
      return;
    }
    if (!description) {
      setHeroError('Hero Description field cannot be empty.');
      return;
    }
    if (description.length > 1000) {
      setHeroError('Hero Description must be less than 1000 characters.');
      return;
    }

    try {
      const updated = {
        ...systemSettings,
        heroTitle: title,
        heroDescription: description,
        heroUpdatedAt: new Date().toISOString(),
        heroUpdatedBy: currentUser?.fullName || currentUser?.email || 'Administrator'
      };
      setSystemSettings(updated);
      await updateSystemSettings(updated);
      setHeroSuccess('Login Hero Settings saved successfully! Changes are live across all portals.');
      setTimeout(() => setHeroSuccess(''), 4000);
    } catch (err: any) {
      setHeroError(err.message || 'Failed to save Login Hero Settings.');
    }
  };

  const handleCancelHeroSettings = () => {
    setHeroError('');
    setHeroSuccess('');
    if (globalSystemSettings) {
      setSystemSettings(globalSystemSettings);
    }
  };

  const handleResetHeroToDefault = async () => {
    setHeroError('');
    setHeroSuccess('');
    const defaultTitle = 'The Smart Way to Discover, Connect & Grow';
    const defaultDesc = 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.';
    const updated = {
      ...systemSettings,
      heroTitle: defaultTitle,
      heroDescription: defaultDesc,
      heroImageUrl: '',
      heroUpdatedAt: new Date().toISOString(),
      heroUpdatedBy: currentUser?.fullName || currentUser?.email || 'Administrator'
    };
    setSystemSettings(updated);
    try {
      await updateSystemSettings(updated);
      setHeroSuccess('Reset Login Hero to default settings successfully.');
      setTimeout(() => setHeroSuccess(''), 4000);
    } catch (err: any) {
      setHeroError('Failed to reset Login Hero to default.');
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setHeroError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setIsUploadingHeroImage(true);
    setHeroError('');
    setHeroSuccess('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (base64) {
        let finalUrl = base64;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, folder: 'sof_umer_login_hero' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) finalUrl = data.url;
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload fallback:', uploadErr);
        }

        const updated = {
          ...systemSettings,
          heroImageUrl: finalUrl,
          heroUpdatedAt: new Date().toISOString(),
          heroUpdatedBy: currentUser?.fullName || currentUser?.email || 'Administrator'
        };
        setSystemSettings(updated);
        try {
          await updateSystemSettings(updated);
          setHeroSuccess('Login Hero image uploaded and saved successfully via Cloudinary!');
          setTimeout(() => setHeroSuccess(''), 4000);
        } catch (err) {
          setHeroError('Failed to save uploaded image.');
        }
      }
      setIsUploadingHeroImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveHeroImage = async () => {
    const updated = {
      ...systemSettings,
      heroImageUrl: '',
      heroUpdatedAt: new Date().toISOString(),
      heroUpdatedBy: currentUser?.fullName || currentUser?.email || 'Administrator'
    };
    setSystemSettings(updated);
    try {
      await updateSystemSettings(updated);
      setHeroSuccess('Hero image removed.');
      setTimeout(() => setHeroSuccess(''), 3000);
    } catch (err) {
      setHeroError('Failed to remove hero image.');
    }
  };

  useEffect(() => {
    if (globalSystemSettings) {
      setSystemSettings(globalSystemSettings);
    }
  }, [globalSystemSettings]);

  const demoAnalyticsCleared = true;
  const handleClearDemoAnalytics = () => {};
  const handleResetDemoAnalytics = () => {};

  // Multilingual FAQ State
  const [newFaqQuestion, setNewFaqQuestion] = useState({ en: '', om: '', am: '' });
  const [newFaqAnswer, setNewFaqAnswer] = useState({ en: '', om: '', am: '' });
  const [newFaqCategory, setNewFaqCategory] = useState('general');

  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqQuestion, setEditFaqQuestion] = useState({ en: '', om: '', am: '' });
  const [editFaqAnswer, setEditFaqAnswer] = useState({ en: '', om: '', am: '' });
  const [editFaqCategory, setEditFaqCategory] = useState('general');
  const [editFaqIsPopular, setEditFaqIsPopular] = useState(false);
  const [editFaqSubmitting, setEditFaqSubmitting] = useState(false);

  // User Moderation Tools State
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [warningModalUser, setWarningModalUser] = useState<User | null>(null);
  const [warningReason, setWarningReason] = useState('Policy Violation');
  const [customWarningReason, setCustomWarningReason] = useState('');
  const [warningNote, setWarningNote] = useState('');
  const [warningSubmitting, setWarningSubmitting] = useState(false);

  const [warningHistoryUser, setWarningHistoryUser] = useState<User | null>(null);

  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<'suspended' | 'banned' | 'active'>('suspended');
  const [statusReason, setStatusReason] = useState('Terms of Service Violation');
  const [customStatusReason, setCustomStatusReason] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [deletingUserModal, setDeletingUserModal] = useState<User | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [showModerationLogs, setShowModerationLogs] = useState(false);

  // Payment Receipt Verification Desk State
  const [inspectingReceipt, setInspectingReceipt] = useState<PaymentReceipt | null>(null);
  const [receiptZoomLevel, setReceiptZoomLevel] = useState<number>(1);
  const [rejectionModalReceipt, setRejectionModalReceipt] = useState<PaymentReceipt | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('Unclear receipt image / Reference number mismatch.');
  const [receiptActionSubmitting, setReceiptActionSubmitting] = useState(false);
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

  const handleBrandingUpload = (fieldKey: keyof SystemSettings & string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (base64String) {
        let finalUrl = base64String;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64String, folder: 'sof_umer_branding' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) finalUrl = data.url;
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload fallback:', uploadErr);
        }

        const newSettings = { ...systemSettings, [fieldKey]: finalUrl };
        setSystemSettings(newSettings);
        try {
          await updateSystemSettings(newSettings);
          setSaveSettingsSuccess(true);
          setTimeout(() => setSaveSettingsSuccess(false), 3000);
        } catch (err) {
          console.error(`Failed to save ${String(fieldKey)}:`, err);
          alert('Failed to save branding asset.');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Actions for Advertisements
  const compressImageForAd = (file: File, maxDimension = 1920, quality = 0.85): Promise<string> => {
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

  const handleAdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setAdUploadError('Unsupported format. Please select a JPG, JPEG, PNG, or WebP image file.');
      if (e.target) e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setAdUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      if (e.target) e.target.value = '';
      return;
    }

    setAdUploadError(null);
    setAdImageUploading(true);

    try {
      const compressedBase64 = await compressImageForAd(file, 1920, 0.85);

      let finalUrl = compressedBase64;
      let isCloudinary = false;

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: compressedBase64, folder: 'sof_umer_ads' })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            finalUrl = data.url;
            isCloudinary = !!data.isCloudinary;
          }
        }
      } catch (err) {
        console.warn('Ad upload endpoint warning, using local base64 preview:', err);
      }

      setAdForm(prev => ({ ...prev, imageUrl: finalUrl }));
      setAdUploadedFile({
        url: finalUrl,
        fileName: file.name,
        fileSize: file.size,
        isCloudinary
      });
    } catch (err: any) {
      console.error('Ad image upload error:', err);
      setAdUploadError('Upload failed: ' + (err.message || 'Error uploading file to Cloudinary'));
    } finally {
      setAdImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.imageUrl.trim()) {
      setAdUploadError('Please upload an advertisement image or provide an Image URL.');
      return;
    }
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
        setAdUploadedFile(null);
        setAdUploadError(null);
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
      const payload = {
        ...propForm,
        isNegotiable: propForm.negotiable === 'Yes',
        coverImage: propForm.images[0] || propForm.coverImage || '',
        price: Number(propForm.price || 0),
        quantity: Number(propForm.quantity || 1),
        retailPrice: Number(propForm.retailPrice || propForm.price || 0),
        wholesalePrice: Number(propForm.wholesalePrice || 0),
        minimumOrderQuantity: Number(propForm.minimumOrderQuantity || 1),
        availableQuantity: Number(propForm.availableQuantity || propForm.quantity || 1),
        video: propForm.videoUrl,
        videoUrl: propForm.videoUrl,
        isVerifiedListing: propForm.verificationStatus === 'verified',
        approvalStatus: propForm.verificationStatus === 'verified' ? 'approved' : propForm.verificationStatus === 'rejected' ? 'rejected' : propForm.approvalStatus
      };

      const res = await fetch(`/api/properties/${editingProp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify(payload)
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
          approvalStatus: status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
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

  const handleAddNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.key || !newKeyForm.en) return;
    try {
      const res = await fetch('/api/languages/translation-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify(newKeyForm)
      });
      if (res.ok) {
        setNewKeyForm({ key: '', en: '', om: '', am: '', category: 'General' });
        setShowAddKeyForm(false);
        refreshData();
      }
    } catch (err) {
      console.error(err);
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

  // Helper to check missing translations
  const getMissingFaqLanguages = (q: any, a: any) => {
    const qObj = typeof q === 'object' && q !== null ? q : { en: q || '' };
    const aObj = typeof a === 'object' && a !== null ? a : { en: a || '' };
    const missing: string[] = [];
    if (!qObj.en?.trim() || !aObj.en?.trim()) missing.push('English (EN)');
    if (!qObj.om?.trim() || !aObj.om?.trim()) missing.push('Afaan Oromoo (OM)');
    if (!qObj.am?.trim() || !aObj.am?.trim()) missing.push('Amharic (AM)');
    return missing;
  };

  // FAQ Management Handlers
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.en.trim() || !newFaqAnswer.en.trim()) {
      alert('English Question and Answer are required at minimum.');
      return;
    }
    try {
      await addFaq({
        question: {
          en: newFaqQuestion.en.trim(),
          om: newFaqQuestion.om.trim() || newFaqQuestion.en.trim(),
          am: newFaqQuestion.am.trim() || newFaqQuestion.en.trim()
        },
        answer: {
          en: newFaqAnswer.en.trim(),
          om: newFaqAnswer.om.trim() || newFaqAnswer.en.trim(),
          am: newFaqAnswer.am.trim() || newFaqAnswer.en.trim()
        },
        category: newFaqCategory || 'general',
        status: 'published'
      });
      setNewFaqQuestion({ en: '', om: '', am: '' });
      setNewFaqAnswer({ en: '', om: '', am: '' });
    } catch (err: any) {
      alert('Failed to create FAQ: ' + err.message);
    }
  };

  const startEditFaq = (f: any) => {
    setEditingFaqId(f.id);
    const qObj = typeof f.question === 'object' && f.question !== null ? f.question : { en: f.question || '', om: '', am: '' };
    const aObj = typeof f.answer === 'object' && f.answer !== null ? f.answer : { en: f.answer || '', om: '', am: '' };
    setEditFaqQuestion({
      en: qObj.en || '',
      om: qObj.om || '',
      am: qObj.am || ''
    });
    setEditFaqAnswer({
      en: aObj.en || '',
      om: aObj.om || '',
      am: aObj.am || ''
    });
    setEditFaqCategory(f.category || 'general');
    setEditFaqIsPopular(Boolean(f.isPopular));
  };

  const handleSaveFaq = async (id: string) => {
    if (!editFaqQuestion.en.trim() || !editFaqAnswer.en.trim()) {
      alert('English Question and Answer cannot be empty.');
      return;
    }
    setEditFaqSubmitting(true);
    try {
      await updateFaq(id, {
        question: {
          en: editFaqQuestion.en.trim(),
          om: editFaqQuestion.om.trim() || editFaqQuestion.en.trim(),
          am: editFaqQuestion.am.trim() || editFaqQuestion.en.trim()
        },
        answer: {
          en: editFaqAnswer.en.trim(),
          om: editFaqAnswer.om.trim() || editFaqAnswer.en.trim(),
          am: editFaqAnswer.am.trim() || editFaqAnswer.en.trim()
        },
        category: editFaqCategory,
        isPopular: editFaqIsPopular
      });
      setEditingFaqId(null);
    } catch (err: any) {
      alert('Failed to update FAQ: ' + (err.message || 'Unknown error'));
    } finally {
      setEditFaqSubmitting(false);
    }
  };

  // --- USER MODERATION HANDLERS ---
  const handleSendUserWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningModalUser) return;
    const finalReason = warningReason === 'Custom' ? customWarningReason.trim() : warningReason;
    if (!finalReason) {
      alert('Please specify a warning reason.');
      return;
    }
    setWarningSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${warningModalUser.id}/warn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ reason: finalReason, note: warningNote })
      });
      if (res.ok) {
        setWarningModalUser(null);
        setCustomWarningReason('');
        setWarningNote('');
        refreshData();
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to send warning'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setWarningSubmitting(false);
    }
  };

  const handleUpdateUserStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;
    const finalReason = statusReason === 'Custom' ? customStatusReason.trim() : statusReason;
    if (targetStatus !== 'active' && !finalReason) {
      alert('Please specify a reason for this status change.');
      return;
    }
    setStatusSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${statusModalUser.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ status: targetStatus, reason: finalReason, note: statusNote })
      });
      if (res.ok) {
        setStatusModalUser(null);
        setCustomStatusReason('');
        setStatusNote('');
        refreshData();
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to update user status'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleDeleteUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingUserModal) return;
    if (deleteConfirmInput !== deletingUserModal.email) {
      alert(`Please type "${deletingUserModal.email}" to confirm deletion.`);
      return;
    }
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUserModal.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      if (res.ok) {
        setDeletingUserModal(null);
        setDeleteConfirmInput('');
        refreshData();
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Failed to delete user'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const fetchModerationLogs = async () => {
    try {
      const res = await fetch('/api/admin/moderation-logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModerationLogs(data);
      }
    } catch (err) {
      console.error(err);
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
  const pendingListingsCount = properties.filter(p => p.verificationStatus === 'pending' || p.approvalStatus === 'pending' || !p.verificationStatus).length;
  const approvedListingsCount = properties.filter(p => (p.verificationStatus === 'verified' || p.isVerifiedListing || p.approvalStatus === 'approved') && p.verificationStatus !== 'pending' && p.approvalStatus !== 'pending').length;
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
      (listingStatusFilter === 'pending' && (p.verificationStatus === 'pending' || p.approvalStatus === 'pending' || !p.verificationStatus)) ||
      (listingStatusFilter === 'promoted' && isPromoted) ||
      (listingStatusFilter === 'promotion_requested' && hasPendingSlip) ||
      (listingStatusFilter === 'verified' && (p.verificationStatus === 'verified' || p.isVerifiedListing || p.approvalStatus === 'approved') && p.verificationStatus !== 'pending' && p.approvalStatus !== 'pending') ||
      (listingStatusFilter === 'rejected' && (p.verificationStatus === 'rejected' || p.approvalStatus === 'rejected'));
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

        <div className="flex flex-wrap gap-2 items-center">
          {/* Admin Privacy Control Button */}
          {isAuthorizedAdmin ? (
            <button
              onClick={() => setShowAdminDetails(!showAdminDetails)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                showAdminDetails 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
              }`}
              title={showAdminDetails ? "Hide private admin personal details" : "Show private admin personal details"}
            >
              {showAdminDetails ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
              <span>{showAdminDetails ? 'Hide Admin Info' : 'Show Admin Info'}</span>
            </button>
          ) : (
            <div className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 flex items-center gap-2 font-mono" title="Only authorized Super Admin can reveal personal info">
              <Lock className="w-4 h-4 text-amber-500/60" />
              <span>Admin Info Masked</span>
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchModerationLogs();
                      setShowModerationLogs(true);
                    }}
                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <FileText className="w-4 h-4" /> Moderation Audit Log
                  </button>
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
                    {filteredUsers.map(u => {
                      const isUserAdmin = u.role === 'admin' || u.isEmployee === true || u.email?.toLowerCase().includes('admin') || u.email === 'jemaljima@gmail.com';
                      const displayName = isUserAdmin ? ((showAdminDetails && isAuthorizedAdmin) ? u.fullName : maskName(u.fullName)) : u.fullName;
                      const displayEmail = isUserAdmin ? ((showAdminDetails && isAuthorizedAdmin) ? u.email : maskEmail(u.email)) : u.email;

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition">
                          <td className="py-4 px-4">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <span>{displayName}</span>
                              {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" title="Verified Seller" />}
                              {isUserAdmin && isAuthorizedAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setShowAdminDetails(!showAdminDetails)}
                                  className="p-1 hover:bg-white/10 rounded text-amber-500/80 hover:text-amber-400 transition cursor-pointer"
                                  title={showAdminDetails ? "Hide private admin details" : "Show private admin details"}
                                >
                                  {showAdminDetails ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-amber-400" />}
                                </button>
                              )}
                            </p>
                            <span className="text-[10px] text-white/40">{displayEmail}</span>
                          </td>
                        <td className="py-4 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/60'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : u.status === 'suspended' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                              {u.status || 'active'}
                            </span>
                            {u.warnings && u.warnings.length > 0 && (
                              <button
                                onClick={() => setWarningHistoryUser(u)}
                                className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[9px] font-mono flex items-center gap-0.5 cursor-pointer"
                                title="View warning history"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>{u.warnings.length} Warn</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] uppercase font-mono text-white/40">{u.verificationStatus}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => setViewingUser(u)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white cursor-pointer"
                              title="View Full User Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Info */}
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

                            {/* Warn User */}
                            <button
                              onClick={() => setWarningModalUser(u)}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg cursor-pointer"
                              title="Send Official Warning"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>

                            {/* Suspend / Ban Status */}
                            {u.status === 'active' ? (
                              <button
                                onClick={() => { setStatusModalUser(u); setTargetStatus('suspended'); }}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                                title="Suspend Account"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => { setStatusModalUser(u); setTargetStatus('active'); }}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-extrabold uppercase cursor-pointer"
                                title="Unsuspend / Reactivate Account"
                              >
                                Activate
                              </button>
                            )}

                            {u.status !== 'banned' && (
                              <button
                                onClick={() => { setStatusModalUser(u); setTargetStatus('banned'); }}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg cursor-pointer"
                                title="Ban Account"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => setDeletingUserModal(u)}
                              className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 rounded-lg cursor-pointer transition"
                              title="Permanently Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
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

              {/* Enhanced Comprehensive Admin Listing Editor Modal */}
              {editingProp && (
                <form onSubmit={handleSaveProperty} className="bg-[#12121e] p-6 border border-amber-500/30 rounded-3xl space-y-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-amber-400" />
                        <span>Admin Listing Editor & Management</span>
                      </h4>
                      <p className="text-xs text-white/50 mt-0.5 font-mono">
                        ID: {editingProp.id} • {extractString(editingProp.title)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProp(null)}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                      >
                        Save Parameters
                      </button>
                    </div>
                  </div>

                  {/* Editor Section Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                    {[
                      { id: 'basic', label: '📌 Basic Info' },
                      { id: 'category', label: '📂 Category' },
                      { id: 'location', label: '📍 Location' },
                      { id: 'owner', label: '👤 Owner Details' },
                      { id: 'media', label: `🖼️ Media (${propForm.images.length})` },
                      { id: 'wholesale', label: '📦 Wholesale & Retail' },
                      { id: 'management', label: '⚙️ Status & Moderation' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAdminEditorTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          adminEditorTab === tab.id
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Basic Info */}
                  {adminEditorTab === 'basic' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Listing Title *</label>
                        <input
                          type="text"
                          required
                          value={propForm.title}
                          onChange={e => setPropForm({ ...propForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Description</label>
                        <textarea
                          rows={4}
                          value={propForm.description}
                          onChange={e => setPropForm({ ...propForm, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Price *</label>
                        <input
                          type="text"
                          inputMode="text"
                          required
                          value={propForm.price}
                          onChange={e => setPropForm({ ...propForm, price: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Currency</label>
                        <select
                          value={propForm.currency}
                          onChange={e => setPropForm({ ...propForm, currency: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="ETB">ETB (Ethiopian Birr)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR</option>
                          <option value="SAR">SAR</option>
                          <option value="AED">AED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Negotiable</label>
                        <select
                          value={propForm.negotiable}
                          onChange={e => setPropForm({ ...propForm, negotiable: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Yes">Yes (Negotiable Badge Shown)</option>
                          <option value="No">No (Fixed Price, Badge Hidden)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Condition</label>
                        <select
                          value={propForm.condition}
                          onChange={e => setPropForm({ ...propForm, condition: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Used - Like New">Used - Like New</option>
                          <option value="Used - Good">Used - Good</option>
                          <option value="Refurbished">Refurbished</option>
                          <option value="Used - Foreign">Used - Foreign</option>
                          <option value="Used - Local">Used - Local</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Brand</label>
                        <input
                          type="text"
                          value={propForm.brand}
                          onChange={e => setPropForm({ ...propForm, brand: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Model</label>
                        <input
                          type="text"
                          value={propForm.model}
                          onChange={e => setPropForm({ ...propForm, model: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Storage / Specification</label>
                        <input
                          type="text"
                          value={propForm.storageSpec}
                          onChange={e => setPropForm({ ...propForm, storageSpec: e.target.value })}
                          placeholder="e.g. 128GB / 8GB RAM or 250m²"
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Color</label>
                        <input
                          type="text"
                          value={propForm.color}
                          onChange={e => setPropForm({ ...propForm, color: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Quantity Available</label>
                        <input
                          type="text"
                          inputMode="text"
                          value={propForm.quantity}
                          onChange={e => setPropForm({ ...propForm, quantity: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Category & Classification */}
                  {adminEditorTab === 'category' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Major Category *</label>
                        <select
                          value={propForm.majorCategory}
                          onChange={e => setPropForm({ ...propForm, majorCategory: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Properties">Properties</option>
                          <option value="Vehicles">Vehicles</option>
                          <option value="Jobs">Jobs</option>
                          <option value="Services">Services</option>
                          <option value="Products">Products</option>
                          <option value="Local Businesses">Local Businesses</option>
                          <option value="Community">Community</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Subcategory / Property Type</label>
                        <input
                          type="text"
                          value={propForm.propertyType}
                          onChange={e => setPropForm({ ...propForm, propertyType: e.target.value })}
                          placeholder="e.g. Smartphones, Apartment, SUV..."
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Location Details */}
                  {adminEditorTab === 'location' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Full Location / Address *</label>
                        <textarea
                          rows={2}
                          required
                          value={propForm.location}
                          onChange={e => setPropForm({ ...propForm, location: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Region / State</label>
                        <input
                          type="text"
                          value={propForm.region}
                          onChange={e => setPropForm({ ...propForm, region: e.target.value })}
                          placeholder="e.g. Oromia, Addis Ababa..."
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">City / Subcity</label>
                        <input
                          type="text"
                          value={propForm.city}
                          onChange={e => setPropForm({ ...propForm, city: e.target.value })}
                          placeholder="e.g. Adama, Bole..."
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Owner Information */}
                  {adminEditorTab === 'owner' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Owner Name *</label>
                        <input
                          type="text"
                          required
                          value={propForm.ownerName}
                          onChange={e => setPropForm({ ...propForm, ownerName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Owner Email *</label>
                        <input
                          type="email"
                          required
                          value={propForm.contactEmail}
                          onChange={e => setPropForm({ ...propForm, contactEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Contact Phone *</label>
                        <input
                          type="text"
                          required
                          value={propForm.contactPhone}
                          onChange={e => setPropForm({ ...propForm, contactPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Business / Company Name</label>
                        <input
                          type="text"
                          value={propForm.ownerBusinessName}
                          onChange={e => setPropForm({ ...propForm, ownerBusinessName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Media Management */}
                  {adminEditorTab === 'media' && (
                    <div className="space-y-5">
                      {/* Add Image Controls */}
                      <div className="bg-black/40 p-4 border border-white/10 rounded-2xl space-y-3">
                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          Add New Photo to Gallery
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Paste Photo URL (https://...)"
                            value={adminNewImageUrl}
                            onChange={e => setAdminNewImageUrl(e.target.value)}
                            className="flex-1 px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAdminAddPhoto}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Add URL
                          </button>
                          <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition cursor-pointer flex items-center justify-center gap-1">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAdminFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Photo Thumbnails */}
                      <div>
                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">
                          Current Photos ({propForm.images.length})
                        </label>
                        {propForm.images.length === 0 ? (
                          <p className="text-xs text-white/30 italic py-4 text-center">No photos attached to this listing.</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {propForm.images.map((img, i) => (
                              <div key={i} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black h-28 flex items-center justify-center">
                                <img src={img} alt={`Photo ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                {i === 0 ? (
                                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                                    Primary Cover
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAdminSetCoverPhoto(i)}
                                    className="absolute top-1.5 left-1.5 bg-black/80 hover:bg-amber-500 hover:text-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/20 transition cursor-pointer opacity-0 group-hover:opacity-100"
                                  >
                                    Set as Cover
                                  </button>
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition">
                                  {i > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdminMovePhoto(i, 'left')}
                                      className="p-1.5 bg-zinc-800 text-white hover:bg-amber-500 hover:text-black rounded-lg transition cursor-pointer"
                                      title="Move Left"
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {i < propForm.images.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdminMovePhoto(i, 'right')}
                                      className="p-1.5 bg-zinc-800 text-white hover:bg-amber-500 hover:text-black rounded-lg transition cursor-pointer"
                                      title="Move Right"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleAdminRemovePhoto(i)}
                                    className="p-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-lg transition cursor-pointer"
                                    title="Remove Photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video Link */}
                      <div className="bg-black/40 p-4 border border-white/10 rounded-2xl space-y-2">
                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider">
                          Video URL / Direct Video File
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/video.mp4"
                            value={propForm.videoUrl}
                            onChange={e => setPropForm({ ...propForm, videoUrl: e.target.value })}
                            className="flex-1 px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                          />
                          {propForm.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setPropForm({ ...propForm, videoUrl: '' })}
                              className="px-3 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Remove Video
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 6: Retail & Wholesale */}
                  {adminEditorTab === 'wholesale' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Selling Type</label>
                        <select
                          value={propForm.sellingType}
                          onChange={e => setPropForm({ ...propForm, sellingType: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Retail">Retail Only</option>
                          <option value="Wholesale">Wholesale Only</option>
                          <option value="Retail & Wholesale">Retail & Wholesale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Retail Price</label>
                        <input
                          type="text"
                          inputMode="text"
                          value={propForm.retailPrice || propForm.price}
                          onChange={e => setPropForm({ ...propForm, retailPrice: e.target.value as any, price: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Wholesale Price</label>
                        <input
                          type="text"
                          inputMode="text"
                          value={propForm.wholesalePrice}
                          onChange={e => setPropForm({ ...propForm, wholesalePrice: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Unit of Sale</label>
                        <select
                          value={propForm.wholesaleUnit}
                          onChange={e => setPropForm({ ...propForm, wholesaleUnit: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Piece">Piece / Single Unit</option>
                          <option value="Box">Box / Package</option>
                          <option value="Kg">Kg / Kilogram</option>
                          <option value="Dozen">Dozen (12 pcs)</option>
                          <option value="Set">Set / Pair</option>
                          <option value="Meter">Meter</option>
                          <option value="Ton">Ton / Metric Ton</option>
                          <option value="Carton">Carton / Crate</option>
                          <option value="Bag">Bag / Sack</option>
                          <option value="Other">Other Unit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Minimum Order Quantity (MOQ)</label>
                        <input
                          type="text"
                          inputMode="text"
                          value={propForm.minimumOrderQuantity}
                          onChange={e => setPropForm({ ...propForm, minimumOrderQuantity: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Business Type</label>
                        <select
                          value={propForm.businessType}
                          onChange={e => setPropForm({ ...propForm, businessType: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Manufacturer">Manufacturer</option>
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Distributor">Distributor</option>
                          <option value="Importer">Importer</option>
                          <option value="Exporter">Exporter</option>
                          <option value="Authorized Dealer">Authorized Dealer</option>
                          <option value="Local Supplier">Local Supplier</option>
                          <option value="Farmer">Farmer</option>
                          <option value="Cooperative">Cooperative</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-2">Delivery Options</label>
                        <div className="flex flex-wrap gap-2">
                          {['Pickup', 'Local Delivery', 'Nationwide Shipping', 'Express Delivery'].map(opt => {
                            const isSelected = Array.isArray(propForm.deliveryOptions) && propForm.deliveryOptions.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleAdminToggleDelivery(opt)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                                  isSelected
                                    ? 'bg-amber-500 text-black border-amber-400'
                                    : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                                }`}
                              >
                                {isSelected ? '✓' : '+'} {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Wholesale Terms & Notes</label>
                        <textarea
                          rows={2}
                          value={propForm.wholesaleNotes}
                          onChange={e => setPropForm({ ...propForm, wholesaleNotes: e.target.value })}
                          placeholder="e.g. Payment terms, bulk volume discounts, delivery lead times..."
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 7: Status & Moderation */}
                  {adminEditorTab === 'management' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Verification Status</label>
                        <select
                          value={propForm.verificationStatus}
                          onChange={e => setPropForm({ ...propForm, verificationStatus: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="pending">Pending Audit</option>
                          <option value="verified">Verified Listing</option>
                          <option value="rejected">Rejected Post</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Approval Status</label>
                        <select
                          value={propForm.approvalStatus}
                          onChange={e => setPropForm({ ...propForm, approvalStatus: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending Review</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Boost Plan</label>
                        <select
                          value={propForm.boostPlan}
                          onChange={e => setPropForm({ ...propForm, boostPlan: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#0c0c14] border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          <option value="free">Free / Normal</option>
                          <option value="starter">Starter Plan</option>
                          <option value="basic">Basic Boost</option>
                          <option value="premium">Premium Banner</option>
                          <option value="vip">VIP Elite Pin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-white/50 font-bold uppercase mb-1">Promotion Expiry Date</label>
                        <input
                          type="date"
                          value={propForm.promotionExpiresAt}
                          onChange={e => setPropForm({ ...propForm, promotionExpiresAt: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propForm.isFeatured}
                            onChange={e => setPropForm({ ...propForm, isFeatured: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                          />
                          <span>Featured Listing</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propForm.isTopAd}
                            onChange={e => setPropForm({ ...propForm, isTopAd: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                          />
                          <span>Top Ad</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={propForm.isArchived}
                            onChange={e => setPropForm({ ...propForm, isArchived: e.target.checked })}
                            className="w-4 h-4 rounded text-rose-500 accent-rose-500"
                          />
                          <span className="text-rose-400">Archived / Deactivated</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingProp(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg transition"
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
                                {((p as any).lastEditReason === 'Edited after approval' || ((p as any).editHistory && (p as any).editHistory.length > 0)) && (
                                  <span className="text-[8px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/40 uppercase animate-pulse">
                                    ⚠️ Edited After Approval - Requires Re-Approval
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/50 font-light mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {extractString(p.location)}</span>
                                <span>•</span>
                                <span className="text-white/90 font-semibold">Owner: {extractString(p.ownerName) || 'Unknown Owner'}</span>
                                <span className="text-white/40">({p.contactEmail || 'No Email'}, {p.contactPhone || 'No Phone'})</span>
                                {p.createdBy && (
                                  <span className="text-[10px] bg-white/5 text-amber-400/80 px-2 py-0.5 rounded border border-white/10 font-mono">
                                    Created By: {p.createdByName || p.createdByEmail || p.createdBy}
                                  </span>
                                )}
                                {p.postedOnBehalf && (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                                    Posted on Behalf
                                  </span>
                                )}
                              </p>
                              <p className="text-xs font-mono font-extrabold text-amber-500 mt-1.5">{p.price.toLocaleString()} {p.currency}</p>
                              {((p as any).lastEditReason === 'Edited after approval' || ((p as any).editHistory && (p as any).editHistory.length > 0)) && (
                                <div className="mt-2 text-[10px] bg-black/50 p-2.5 rounded-xl border border-amber-500/20 font-mono space-y-0.5 text-amber-400/90">
                                  <div><strong className="text-white">Audit Log:</strong> Edited after approval</div>
                                  <div><strong className="text-white">Edited At:</strong> {(p as any).updatedAt ? new Date((p as any).updatedAt).toLocaleString() : 'Recent'}</div>
                                  <div><strong className="text-white">Edited By:</strong> {(p as any).updatedBy || (p as any).ownerName || 'User'}</div>
                                  <div><strong className="text-white">Previous Approval Date:</strong> {(p as any).previousApprovalDate ? new Date((p as any).previousApprovalDate).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A')}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
                            <button
                              onClick={() => {
                                setEditingProp(p);
                                setPropForm({
                                  title: extractString(p.title),
                                  description: extractString(p.description),
                                  price: p.price || 0,
                                  currency: p.currency || 'ETB',
                                  negotiable: p.isNegotiable === true || String(p.negotiable).toLowerCase() === 'yes' ? 'Yes' : 'No',
                                  quantity: (p as any).quantity || (p as any).availableQuantity || 1,
                                  condition: p.condition || 'New',
                                  brand: p.brand || '',
                                  model: (p as any).model || '',
                                  storageSpec: (p as any).storageSpec || (p as any).specifications || '',
                                  color: (p as any).color || '',
                                  majorCategory: p.majorCategory || 'Properties',
                                  propertyType: p.propertyType || '',
                                  location: extractString(p.location),
                                  region: (p as any).region || '',
                                  city: (p as any).city || '',
                                  ownerName: p.ownerName || '',
                                  contactEmail: p.contactEmail || p.ownerEmail || '',
                                  contactPhone: p.contactPhone || p.ownerPhone || '',
                                  ownerBusinessName: p.ownerBusinessName || '',
                                  images: Array.isArray(p.images) ? [...p.images] : [],
                                  coverImage: p.coverImage || (p.images?.[0] || ''),
                                  videoUrl: p.videoUrl || p.video || '',
                                  sellingType: (p as any).sellingType || 'Retail',
                                  retailPrice: (p as any).retailPrice || p.price || 0,
                                  wholesalePrice: (p as any).wholesalePrice || 0,
                                  wholesaleUnit: (p as any).wholesaleUnit || 'Piece',
                                  minimumOrderQuantity: (p as any).minimumOrderQuantity || 1,
                                  availableQuantity: (p as any).availableQuantity || 1,
                                  businessType: (p as any).businessType || 'Wholesaler',
                                  deliveryOptions: Array.isArray((p as any).deliveryOptions) ? [...(p as any).deliveryOptions] : [],
                                  wholesaleNotes: (p as any).wholesaleNotes || '',
                                  verificationStatus: p.verificationStatus || 'pending',
                                  approvalStatus: p.approvalStatus || 'approved',
                                  isFeatured: !!p.isFeatured,
                                  isTopAd: !!p.isTopAd,
                                  boostPlan: p.boostPlan || 'free',
                                  promotionExpiresAt: p.promotionExpiresAt ? new Date(p.promotionExpiresAt).toISOString().slice(0, 10) : '',
                                  isArchived: !!(p as any).isArchived
                                });
                                setAdminEditorTab('basic');
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
                          const campaignInfo = getCampaignStatusInfo(systemSettings.freeListingSettings);
                          return (
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${campaignInfo.badgeColor}`}>
                                {campaignInfo.status}
                              </span>
                              <span className="text-[10px] text-amber-400 font-mono font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {campaignInfo.displayText}
                              </span>
                            </div>
                          );
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
                      type="text"
                      inputMode="text"
                      value={systemSettings.freeListingSettings?.maxFreeListingsPerUser ?? 5}
                      onChange={async e => {
                        const updatedFls = { ...(systemSettings.freeListingSettings || { enabled: true }), maxFreeListingsPerUser: e.target.value as any };
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
                    setAdUploadedFile(null);
                    setAdUploadError(null);
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
                    <label className="block text-xs font-bold text-white/40 mb-2">Advert Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Property Discount"
                      value={adForm.title}
                      onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-2">Display Position</label>
                    <select
                      value={adForm.position}
                      onChange={e => setAdForm({ ...adForm, position: e.target.value as any })}
                      className="w-full p-2.5 bg-[#12121a] border border-white/5 text-xs rounded-xl focus:outline-none text-white"
                    >
                      <option value="hero">Hero Top Banner</option>
                      <option value="sidebar">Sidebar Widget</option>
                      <option value="banner">Inline Footer Bar</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-white/40 mb-2">Redirect URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://example.com/promo"
                      value={adForm.linkUrl}
                      onChange={e => setAdForm({ ...adForm, linkUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/40 border border-white/5 text-xs rounded-xl focus:outline-none text-white"
                    />
                  </div>

                  {/* Advert Image Upload & URL Section */}
                  <div className="sm:col-span-2 space-y-3 bg-black/30 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                        <ImageIcon className="w-4 h-4 text-amber-500" /> Advert Image Selection *
                      </label>
                      <span className="text-[10px] text-white/40 font-mono">Upload File or Image URL</span>
                    </div>

                    {/* Method 1: Upload Advertisement Image */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white/90">Upload Advertisement Image</span>
                        <span className="text-[9px] text-white/40">JPG, JPEG, PNG, WebP • Max 10 MB</span>
                      </div>

                      {adImageUploading ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-400 animate-pulse">
                          <Upload className="w-4 h-4 animate-bounce shrink-0 text-amber-500" />
                          <span>Compressing & uploading advertisement image to Cloudinary...</span>
                        </div>
                      ) : adForm.imageUrl ? (
                        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                            <img 
                              src={adForm.imageUrl} 
                              alt="Advert Preview" 
                              className="w-16 h-16 rounded-lg object-cover border border-amber-500/30 bg-black shrink-0" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white truncate max-w-[180px]">
                                  {adUploadedFile?.fileName || 'Current Advertisement Image'}
                                </span>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold px-1.5 py-0.2 rounded font-mono">
                                  {adUploadedFile?.isCloudinary ? 'Cloudinary' : 'Ready'}
                                </span>
                              </div>
                              {adUploadedFile?.fileSize ? (
                                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                                  Size: {(adUploadedFile.fileSize / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              ) : null}
                              <p className="text-[10px] text-amber-400/80 font-mono truncate mt-0.5 max-w-[220px]">
                                {adForm.imageUrl}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <label className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Replace</span>
                              <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/webp,image/jpg" 
                                onChange={handleAdFileUpload} 
                                className="hidden" 
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setAdForm(prev => ({ ...prev, imageUrl: '' }));
                                setAdUploadedFile(null);
                                setAdUploadError(null);
                              }}
                              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1"
                              title="Remove image"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 bg-black/40 hover:bg-black/60 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
                          <Upload className="w-6 h-6 text-amber-500/70 group-hover:text-amber-500 group-hover:scale-110 transition mb-1" />
                          <span className="text-xs font-bold text-white group-hover:text-amber-400">Upload Advertisement Image</span>
                          <span className="text-[10px] text-white/40 mt-0.5">Select image from phone or computer (JPG, JPEG, PNG, WebP • Max 10 MB)</span>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp,image/jpg" 
                            onChange={handleAdFileUpload} 
                            className="hidden" 
                          />
                        </label>
                      )}

                      {adUploadError && (
                        <p className="text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{adUploadError}</span>
                        </p>
                      )}
                    </div>

                    {/* Method 2: Image URL Field */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <label className="block text-[11px] font-bold text-white/70">
                        Or Provide Image URL directly
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/banner-image.jpg"
                        value={adForm.imageUrl}
                        onChange={e => {
                          setAdForm({ ...adForm, imageUrl: e.target.value });
                          if (!e.target.value) setAdUploadedFile(null);
                        }}
                        className="w-full p-2.5 bg-black/60 border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500 font-mono placeholder-white/20"
                      />
                      <p className="text-[9px] text-white/30 font-mono">
                        Populated automatically when uploading an image file above, or paste an external image link directly.
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-white/40 mb-2">Description / Copy text *</label>
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
                        setAdUploadedFile(null);
                        setAdUploadError(null);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={adImageUploading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {adImageUploading ? 'Uploading...' : 'Save Advert'}
                  </button>
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
                                  type="text"
                                  inputMode="text"
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
                              setAdUploadedFile(ad.imageUrl ? { url: ad.imageUrl, fileName: 'Current Advert Image', fileSize: 0 } : null);
                              setAdUploadError(null);
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

                {/* Multilingual FAQ Add Form */}
                <form onSubmit={handleAddFaq} className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Create Multilingual FAQ Entry
                    </span>
                    <span className="text-[10px] text-white/40">Provide translations for EN, Afaan Oromoo, and Amharic</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* English */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">English (EN) *</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded">Required</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Question (English)..."
                        value={newFaqQuestion.en}
                        onChange={e => setNewFaqQuestion({ ...newFaqQuestion, en: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <textarea
                        required
                        rows={2}
                        placeholder="Answer (English)..."
                        value={newFaqAnswer.en}
                        onChange={e => setNewFaqAnswer({ ...newFaqAnswer, en: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Afaan Oromoo */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-teal-400 uppercase font-mono">Afaan Oromoo (OM)</span>
                        <span className="text-[9px] text-white/40">Auto-falls back if empty</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Gaaffii (Afaan Oromoo)..."
                        value={newFaqQuestion.om}
                        onChange={e => setNewFaqQuestion({ ...newFaqQuestion, om: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Deebii (Afaan Oromoo)..."
                        value={newFaqAnswer.om}
                        onChange={e => setNewFaqAnswer({ ...newFaqAnswer, om: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Amharic */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-purple-400 uppercase font-mono">Amharic (AM)</span>
                        <span className="text-[9px] text-white/40">Auto-falls back if empty</span>
                      </div>
                      <input
                        type="text"
                        placeholder="ጥያቄ (አማርኛ)..."
                        value={newFaqQuestion.am}
                        onChange={e => setNewFaqQuestion({ ...newFaqQuestion, am: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="መልስ (አማርኛ)..."
                        value={newFaqAnswer.am}
                        onChange={e => setNewFaqAnswer({ ...newFaqAnswer, am: e.target.value })}
                        className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <select
                      value={newFaqCategory}
                      onChange={e => setNewFaqCategory(e.target.value)}
                      className="w-full sm:w-auto px-3.5 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="general">Category: General Inquiries</option>
                      <option value="account">Category: Account & Profile</option>
                      <option value="listings">Category: Listings & Wholesale</option>
                      <option value="payments">Category: Payments & Wallet</option>
                      <option value="safety">Category: Safety & Verification</option>
                    </select>

                    <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shadow">
                      <Plus className="w-4 h-4" /> Save FAQ in All 3 Languages
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {faqs && faqs.map(f => {
                    const isEditing = editingFaqId === f.id;
                    const missingLangs = getMissingFaqLanguages(f.question, f.answer);

                    if (isEditing) {
                      return (
                        <div key={f.id} className="bg-[#181824] border border-amber-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit2 className="w-3.5 h-3.5" /> Edit FAQ Item (Multilingual)
                            </span>
                            <span className="text-[10px] font-mono text-white/40">ID: {f.id}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* EN Edit */}
                            <div className="p-3 bg-black/40 border border-amber-500/20 rounded-xl space-y-2">
                              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">English (EN)</span>
                              <input 
                                type="text"
                                required
                                value={editFaqQuestion.en}
                                onChange={e => setEditFaqQuestion({ ...editFaqQuestion, en: e.target.value })}
                                placeholder="Question (EN)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                              />
                              <textarea 
                                required
                                rows={3}
                                value={editFaqAnswer.en}
                                onChange={e => setEditFaqAnswer({ ...editFaqAnswer, en: e.target.value })}
                                placeholder="Answer (EN)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-sans"
                              />
                            </div>

                            {/* OM Edit */}
                            <div className="p-3 bg-black/40 border border-teal-500/20 rounded-xl space-y-2">
                              <span className="text-[10px] font-bold text-teal-400 uppercase font-mono block">Afaan Oromoo (OM)</span>
                              <input 
                                type="text"
                                value={editFaqQuestion.om}
                                onChange={e => setEditFaqQuestion({ ...editFaqQuestion, om: e.target.value })}
                                placeholder="Gaaffii (Afaan Oromoo)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                              />
                              <textarea 
                                rows={3}
                                value={editFaqAnswer.om}
                                onChange={e => setEditFaqAnswer({ ...editFaqAnswer, om: e.target.value })}
                                placeholder="Deebii (Afaan Oromoo)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-sans"
                              />
                            </div>

                            {/* AM Edit */}
                            <div className="p-3 bg-black/40 border border-purple-500/20 rounded-xl space-y-2">
                              <span className="text-[10px] font-bold text-purple-400 uppercase font-mono block">Amharic (AM)</span>
                              <input 
                                type="text"
                                value={editFaqQuestion.am}
                                onChange={e => setEditFaqQuestion({ ...editFaqQuestion, am: e.target.value })}
                                placeholder="ጥያቄ (አማርኛ)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white"
                              />
                              <textarea 
                                rows={3}
                                value={editFaqAnswer.am}
                                onChange={e => setEditFaqAnswer({ ...editFaqAnswer, am: e.target.value })}
                                placeholder="መልስ (አማርኛ)"
                                className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <div>
                              <label className="block text-[10px] font-bold text-white/50 uppercase mb-1 font-mono">Category</label>
                              <select 
                                value={editFaqCategory}
                                onChange={e => setEditFaqCategory(e.target.value)}
                                className="w-full px-3.5 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                              >
                                <option value="general">General Inquiries</option>
                                <option value="account">Account & Profile</option>
                                <option value="listings">Listings & Wholesale</option>
                                <option value="payments">Payments & Wallet</option>
                                <option value="safety">Safety & Verification</option>
                              </select>
                            </div>

                            <div className="pt-2 sm:pt-4 flex items-center gap-2">
                              <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                                <input 
                                  type="checkbox"
                                  checked={editFaqIsPopular}
                                  onChange={e => setEditFaqIsPopular(e.target.checked)}
                                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                                <span>Mark as Popular FAQ</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button 
                              type="button"
                              onClick={() => handleSaveFaq(f.id)}
                              disabled={editFaqSubmitting}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow transition uppercase tracking-wider disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>{editFaqSubmitting ? 'Saving...' : 'Save Translations'}</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setEditingFaqId(null)}
                              disabled={editFaqSubmitting}
                              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const qObj = typeof f.question === 'object' && f.question !== null ? f.question : { en: f.question || '' };
                    const aObj = typeof f.answer === 'object' && f.answer !== null ? f.answer : { en: f.answer || '' };

                    return (
                      <div key={f.id} className="bg-[#12121a] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-4 hover:border-white/10 transition">
                        <div className="space-y-2.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                              {f.category || 'general'}
                            </span>
                            {f.isPopular && (
                              <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                                Popular
                              </span>
                            )}
                            
                            {/* Language badges */}
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono ${qObj.en ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-white/30'}`}>EN</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono ${qObj.om ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-white/30'}`}>OM</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono ${qObj.am ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/30'}`}>AM</span>
                            </div>

                            {missingLangs.length > 0 && (
                              <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Missing: {missingLangs.join(', ')}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-white text-xs">EN Q: {qObj.en || <span className="text-rose-400 italic">Not set</span>}</p>
                            <p className="text-[11px] text-white/60 leading-relaxed font-light">EN A: {aObj.en || <span className="text-rose-400 italic">Not set</span>}</p>
                          </div>

                          {(qObj.om || qObj.am) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                              {qObj.om && (
                                <div className="p-2 bg-black/30 rounded-lg border border-teal-500/10">
                                  <p className="font-bold text-teal-400 text-[10px]">OM: {qObj.om}</p>
                                  <p className="text-white/50 text-[10px] truncate">{aObj.om}</p>
                                </div>
                              )}
                              {qObj.am && (
                                <div className="p-2 bg-black/30 rounded-lg border border-purple-500/10">
                                  <p className="font-bold text-purple-400 text-[10px]">AM: {qObj.am}</p>
                                  <p className="text-white/50 text-[10px] truncate">{aObj.am}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={() => startEditFaq(f)} 
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                            title="Edit FAQ Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Translations</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleDeleteFaq(f.id)} 
                            className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition"
                            title="Delete FAQ Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/40">Translation Lexicon ({translations.length} Keys)</h4>
                    <p className="text-[11px] text-white/50 mt-0.5">Admin dictionary is the single source of truth across all marketplace interfaces.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search key, English, Afaan Oromoo, Amharic..."
                      value={transSearch}
                      onChange={e => setTransSearch(e.target.value)}
                      className="p-2 bg-black/40 border border-white/10 text-xs rounded-xl focus:outline-none text-white w-full sm:w-64"
                    />
                    <button
                      onClick={() => setShowAddKeyForm(!showAddKeyForm)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2 px-3 rounded-xl cursor-pointer transition shrink-0"
                    >
                      {showAddKeyForm ? 'Cancel' : '+ Add Key'}
                    </button>
                  </div>
                </div>

                {showAddKeyForm && (
                  <form onSubmit={handleAddNewKey} className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Term / Translation Key</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Key / System ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Product"
                          value={newKeyForm.key}
                          onChange={e => setNewKeyForm({ ...newKeyForm, key: e.target.value })}
                          className="p-2 bg-black border border-white/10 text-xs rounded-lg w-full text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">English (en)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Product"
                          value={newKeyForm.en}
                          onChange={e => setNewKeyForm({ ...newKeyForm, en: e.target.value })}
                          className="p-2 bg-black border border-white/10 text-xs rounded-lg w-full text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Afaan Oromoo (om)</label>
                        <input
                          type="text"
                          placeholder="e.g. Oomishaalee"
                          value={newKeyForm.om}
                          onChange={e => setNewKeyForm({ ...newKeyForm, om: e.target.value })}
                          className="p-2 bg-black border border-white/10 text-xs rounded-lg w-full text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/50 uppercase font-bold mb-1">Amharic (am)</label>
                        <input
                          type="text"
                          placeholder="e.g. ምርቶች"
                          value={newKeyForm.am}
                          onChange={e => setNewKeyForm({ ...newKeyForm, am: e.target.value })}
                          className="p-2 bg-black border border-white/10 text-xs rounded-lg w-full text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button type="button" onClick={() => setShowAddKeyForm(false)} className="px-3 py-1.5 bg-white/5 text-white/60 text-xs rounded-lg cursor-pointer">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-amber-400">Save Translation Key</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-xs text-white">
                    <thead className="sticky top-0 bg-[#0d0d12] z-10">
                      <tr className="border-b border-white/5 bg-[#12121a] text-[9px] text-white/40 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3 text-left">Translation Key</th>
                        <th className="py-3 px-3 text-left">English (en)</th>
                        <th className="py-3 px-3 text-left">Afaan Oromoo (om)</th>
                        <th className="py-3 px-3 text-left">Amharic (am)</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {translations
                        .filter(tk => {
                          if (!transSearch.trim()) return true;
                          const q = transSearch.toLowerCase().trim();
                          return (
                            tk.key.toLowerCase().includes(q) ||
                            (tk.en && tk.en.toLowerCase().includes(q)) ||
                            (tk.om && tk.om.toLowerCase().includes(q)) ||
                            (tk.am && tk.am.toLowerCase().includes(q))
                          );
                        })
                        .map(tk => {
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
                                <button
                                  type="button"
                                  onClick={() => setInspectingReceipt(rec)}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold cursor-pointer transition inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect & Audit</span>
                                </button>
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
                                      onClick={() => setInspectingReceipt(rec)} 
                                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg cursor-pointer text-[10px] uppercase flex items-center gap-1"
                                      title="Inspect Slip Details"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Review
                                    </button>
                                    <button 
                                      onClick={() => handleVerifyReceipt(rec.id, 'Approved')} 
                                      className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-lg cursor-pointer text-[10px] uppercase flex items-center gap-1"
                                      title="Approve Receipt and Activate Promotion"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button 
                                      onClick={() => setRejectionModalReceipt(rec)} 
                                      className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold rounded-lg cursor-pointer text-[10px] uppercase flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2 items-center">
                                    <button
                                      onClick={() => setInspectingReceipt(rec)}
                                      className="text-[10px] text-amber-400 hover:underline font-bold"
                                    >
                                      View Audit Log
                                    </button>
                                    <button 
                                      onClick={() => handleVerifyReceipt(rec.id, rec.status === 'Approved' ? 'Rejected' : 'Approved')}
                                      className="text-[9px] text-white/40 font-bold hover:underline cursor-pointer uppercase"
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-500" />
                    <span>System & Web Settings Console</span>
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    Configure application identity, live status, login hero, visual branding, and payment gateways.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSavingSettings}
                  onClick={async () => {
                    setIsSavingSettings(true);
                    try {
                      await updateSystemSettings(systemSettings);
                      setSaveSettingsSuccess(true);
                      setTimeout(() => setSaveSettingsSuccess(false), 4000);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save All Settings'}</span>
                </button>
              </div>

              {saveSettingsSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>All system settings have been successfully saved to MongoDB!</span>
                </div>
              )}

              {/* Sub-Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('web')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    settingsSubTab === 'web'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>1. Web Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsSubTab('branding')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    settingsSubTab === 'branding'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>2. Branding & Visual Themes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsSubTab('payments')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    settingsSubTab === 'payments'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>3. Payment Gateways</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsSubTab('contact')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    settingsSubTab === 'contact'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>4. Contact Us Config</span>
                </button>
              </div>

              {/* TAB 1: WEB SETTINGS */}
              {settingsSubTab === 'web' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* 1. CORE APP NAME SETTING */}
                  <div className="p-6 bg-[#12121a] border border-white/10 rounded-3xl space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Core Setting
                          </span>
                          <h4 className="text-lg font-bold text-white tracking-wide font-serif">Core App Name</h4>
                        </div>
                        <p className="text-xs text-white/50">
                          Control official application name, website branding, and browser tab identity.
                        </p>
                      </div>
                    </div>

                    {appNameError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{appNameError}</span>
                        </div>
                        <button onClick={() => setAppNameError('')} className="text-rose-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {appNameSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{appNameSuccess}</span>
                        </div>
                        <button onClick={() => setAppNameSuccess('')} className="text-emerald-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                          Application Brand Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SOF-UMER"
                          value={systemSettings.appName || ''}
                          onChange={e => setSystemSettings({ ...systemSettings, appName: e.target.value })}
                          className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
                        />
                        <p className="text-[11px] text-white/40">
                          Default: <span className="text-amber-400 font-mono font-bold">SOF-UMER</span>. Controls browser tab title and site header text.
                        </p>
                      </div>

                      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-500/80 tracking-widest block mb-1">
                            Live Brand Preview
                          </span>
                          <div className="flex items-center gap-3 p-3 bg-black/80 rounded-xl border border-white/10">
                            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-black text-black text-base shadow">
                              {((systemSettings.appName || 'SOF-UMER')[0] || 'S').toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-sm text-white tracking-wider block">
                                {systemSettings.appName || 'SOF-UMER'}
                              </span>
                              <span className="text-[10px] text-white/40 font-mono block">
                                Title: {systemSettings.appName || 'SOF-UMER'} | Admin Management Dashboard
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        disabled={isSavingAppName}
                        onClick={handleResetAppName}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to Default (SOF-UMER)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSavingAppName}
                        onClick={handleSaveAppName}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingAppName ? 'Saving...' : 'Save Core App Name'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. SITE LIVE STATUS SETTING */}
                  <div className="p-6 bg-[#12121a] border border-white/10 rounded-3xl space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Access Control
                          </span>
                          <h4 className="text-lg font-bold text-white tracking-wide font-serif">Site Live Status</h4>
                        </div>
                        <p className="text-xs text-white/50">
                          Control platform availability. Toggle maintenance mode without code changes or redeployments.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          (systemSettings.siteStatus || 'Online') === 'Online'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            (systemSettings.siteStatus || 'Online') === 'Online' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                          }`} />
                          <span>{(systemSettings.siteStatus || 'Online') === 'Online' ? 'LIVE ONLINE' : 'MAINTENANCE MODE'}</span>
                        </span>
                      </div>
                    </div>

                    {siteStatusError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{siteStatusError}</span>
                        </div>
                        <button onClick={() => setSiteStatusError('')} className="text-rose-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {siteStatusSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{siteStatusSuccess}</span>
                        </div>
                        <button onClick={() => setSiteStatusSuccess('')} className="text-emerald-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                        Platform Mode Selection
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSystemSettings({ ...systemSettings, siteStatus: 'Online' })}
                          className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                            (systemSettings.siteStatus || 'Online') === 'Online'
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                              : 'bg-black/40 border-white/5 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${
                            (systemSettings.siteStatus || 'Online') === 'Online' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40'
                          }`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">ON — Website Live</span>
                            <span className="text-xs text-white/50 block mt-0.5">
                              Normal application access enabled for all users.
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSystemSettings({ ...systemSettings, siteStatus: 'Maintenance' })}
                          className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                            (systemSettings.siteStatus || 'Online') === 'Maintenance'
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                              : 'bg-black/40 border-white/5 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${
                            (systemSettings.siteStatus || 'Online') === 'Maintenance' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40'
                          }`}>
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white block">OFF — Maintenance Mode</span>
                            <span className="text-xs text-white/50 block mt-0.5">
                              Displays maintenance screen to users. Allows admin access.
                            </span>
                          </div>
                        </button>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                          Custom Maintenance Notice Message
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. SOF-UMER is currently undergoing scheduled platform maintenance. Normal operations will resume shortly. Thank you for your patience."
                          value={systemSettings.maintenanceMessage || ''}
                          onChange={e => setSystemSettings({ ...systemSettings, maintenanceMessage: e.target.value })}
                          className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition leading-relaxed"
                        />
                        <p className="text-[11px] text-white/40">
                          Displayed prominently on the maintenance landing page when Site Status is OFF.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        disabled={isSavingSiteStatus}
                        onClick={handleResetSiteStatus}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Status to Live (Online)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSavingSiteStatus}
                        onClick={handleSaveSiteStatus}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingSiteStatus ? 'Saving...' : 'Save Site Live Status'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. DEDICATED LOGIN HERO SETTINGS SECTION */}
                  <div className="p-6 bg-[#12121a] border border-amber-500/20 rounded-3xl space-y-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Web Settings
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Login Hero Settings
                          </span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-white mt-1">
                          Login Hero Single Source of Truth
                        </h4>
                        <p className="text-xs text-white/50">
                          Manage the headline, description, and visual asset displayed on the Authentication & Welcome Portal across all environments.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHeroPreviewMode('desktop')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            heroPreviewMode === 'desktop'
                              ? 'bg-amber-500 text-black shadow-lg'
                              : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Desktop View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroPreviewMode('mobile')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            heroPreviewMode === 'mobile'
                              ? 'bg-amber-500 text-black shadow-lg'
                              : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Mobile View</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Column: Form Controls */}
                      <div className="lg:col-span-7 space-y-5">
                        {/* Hero Title */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                              Hero Title <span className="text-rose-400">*</span>
                            </label>
                            <span className="text-[10px] text-white/40 font-mono">
                              {(systemSettings.heroTitle || '').length}/200
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={200}
                            value={systemSettings.heroTitle ?? ''}
                            onChange={(e) => setSystemSettings({ ...systemSettings, heroTitle: e.target.value })}
                            placeholder="The Smart Way to Discover, Connect & Grow"
                            className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-amber-500 transition"
                          />
                          <p className="text-[11px] text-white/40 mt-1">
                            Primary headline shown in bold typography on the login screen.
                          </p>
                        </div>

                        {/* Hero Description */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                              Hero Description <span className="text-rose-400">*</span>
                            </label>
                            <span className="text-[10px] text-white/40 font-mono">
                              {(systemSettings.heroDescription || '').length}/1000
                            </span>
                          </div>
                          <textarea
                            rows={4}
                            maxLength={1000}
                            value={systemSettings.heroDescription ?? ''}
                            onChange={(e) => setSystemSettings({ ...systemSettings, heroDescription: e.target.value })}
                            placeholder="Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace."
                            className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-sm text-white/90 leading-relaxed focus:outline-none focus:border-amber-500 transition resize-none"
                          />
                          <p className="text-[11px] text-white/40 mt-1">
                            Detailed subtitle text describing the Sof Umer ecosystem.
                          </p>
                        </div>

                        {/* Hero Image Management */}
                        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                          <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">
                            Hero Background Visual Asset (Cloudinary)
                          </label>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden relative group shrink-0 flex items-center justify-center">
                              {systemSettings.heroImageUrl ? (
                                <img
                                  src={systemSettings.heroImageUrl}
                                  alt="Hero Preview"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <ImageIcon className="w-6 h-6 text-white/20 mx-auto mb-1" />
                                  <span className="text-[9px] text-white/30 font-bold uppercase block">Default Slide</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              <p className="text-xs text-white/80 font-medium">
                                {systemSettings.heroImageUrl ? 'Custom Cloudinary Image active' : 'Using default rotating slideshow backdrop'}
                              </p>
                              <p className="text-[11px] text-white/40">
                                Upload high-resolution landscape image (1920x1080 recommended). Stored securely via Cloudinary CDN.
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer transition shadow">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{isUploadingHeroImage ? 'Uploading...' : systemSettings.heroImageUrl ? 'Replace Image' : 'Upload Image'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleHeroImageUpload}
                                    disabled={isUploadingHeroImage}
                                    className="hidden"
                                  />
                                </label>

                                {systemSettings.heroImageUrl && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveHeroImage}
                                    className="inline-flex items-center gap-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timestamp / Audit Log Info */}
                        {systemSettings.heroUpdatedAt && (
                          <div className="text-[11px] text-white/40 flex items-center gap-2 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              Last modified: {new Date(systemSettings.heroUpdatedAt).toLocaleString()} by {systemSettings.heroUpdatedBy || 'Administrator'}
                            </span>
                          </div>
                        )}

                        {/* Alert Notifications */}
                        {heroError && (
                          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>{heroError}</span>
                          </div>
                        )}

                        {heroSuccess && (
                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{heroSuccess}</span>
                          </div>
                        )}

                        {/* Control Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleSaveHeroSettings}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Hero Changes</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelHeroSettings}
                            className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs rounded-2xl border border-white/10 transition cursor-pointer"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={handleResetHeroToDefault}
                            className="px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs rounded-2xl border border-rose-500/30 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reset To Default</span>
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Live Interactive Preview */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>Live Login Hero Preview ({heroPreviewMode})</span>
                          </span>
                          <span className="text-[10px] text-amber-500 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Real-time
                          </span>
                        </div>

                        <div className={`mx-auto transition-all duration-300 ${
                          heroPreviewMode === 'mobile' ? 'max-w-[320px]' : 'w-full'
                        }`}>
                          <div className="bg-[#060608] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative">
                            {/* Simulated Image / Backdrop */}
                            <div className="relative h-48 w-full overflow-hidden bg-black">
                              {systemSettings.heroImageUrl ? (
                                <img
                                  src={systemSettings.heroImageUrl}
                                  alt="Hero Visual"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-amber-950/20 to-black p-4 flex flex-col justify-end">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
                                      S
                                    </div>
                                    <span className="text-xs font-bold text-white font-serif tracking-wider">SOF-UMER</span>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-transparent" />
                            </div>

                            {/* Simulated Hero Text Area */}
                            <div className="p-6 space-y-4">
                              <div className="space-y-2">
                                <h3 className="text-xl font-serif font-bold text-white leading-tight">
                                  {systemSettings.heroTitle || 'The Smart Way to Discover, Connect & Grow'}
                                </h3>
                                <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-4">
                                  {systemSettings.heroDescription || 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.'}
                                </p>
                              </div>

                              {/* Dummy Interactive Controls */}
                              <div className="pt-2 space-y-2">
                                <div className="w-full py-2.5 bg-amber-500 text-black text-center font-bold text-xs rounded-xl shadow">
                                  Sign In / Register
                                </div>
                                <div className="w-full py-2 bg-white/5 border border-white/10 text-white/50 text-center font-medium text-[11px] rounded-xl">
                                  Browse Guest Marketplace
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING & VISUAL THEMES */}
              {settingsSubTab === 'branding' && (
                <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-[#12121a] border border-white/5 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>Application Branding & PWA Visual Assets</span>
                  </h4>
                  <span className="text-[10px] text-white/40">Manage Logo, Icon, Favicon, PWA Icon, & Splash Screen</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Asset 1: App Logo */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {systemSettings.logoUrl ? (
                        <img
                          src={systemSettings.logoUrl}
                          alt="App Main Logo"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-xl shrink-0">
                          {(systemSettings.appLogoText || systemSettings.appName || 'S')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">App Main Logo</p>
                        <p className="text-[10px] text-white/40 leading-snug">Navbar, headers, and footer brand mark.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-xl cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{systemSettings.logoUrl ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrandingUpload('logoUrl')}
                        />
                      </label>
                      {systemSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, logoUrl: '' };
                            setSystemSettings(updated);
                            await updateSystemSettings(updated);
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset 2: App Icon */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {systemSettings.appIconUrl ? (
                        <img
                          src={systemSettings.appIconUrl}
                          alt="App Icon"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                          Icon
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">App Icon</p>
                        <p className="text-[10px] text-white/40 leading-snug">Used for system UI badges and app avatars.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-xl cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{systemSettings.appIconUrl ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrandingUpload('appIconUrl')}
                        />
                      </label>
                      {systemSettings.appIconUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, appIconUrl: '' };
                            setSystemSettings(updated);
                            await updateSystemSettings(updated);
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset 3: Favicon */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {systemSettings.faviconUrl ? (
                        <img
                          src={systemSettings.faviconUrl}
                          alt="Favicon"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                          Favicon
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">Browser Favicon</p>
                        <p className="text-[10px] text-white/40 leading-snug">Tab icon displayed in web browsers.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-xl cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{systemSettings.faviconUrl ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrandingUpload('faviconUrl')}
                        />
                      </label>
                      {systemSettings.faviconUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, faviconUrl: '' };
                            setSystemSettings(updated);
                            await updateSystemSettings(updated);
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset 4: PWA Icon */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {systemSettings.pwaIconUrl ? (
                        <img
                          src={systemSettings.pwaIconUrl}
                          alt="PWA Icon"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                          PWA
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">PWA Home Icon</p>
                        <p className="text-[10px] text-white/40 leading-snug">Installed mobile app launcher icon.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-xl cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{systemSettings.pwaIconUrl ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrandingUpload('pwaIconUrl')}
                        />
                      </label>
                      {systemSettings.pwaIconUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, pwaIconUrl: '' };
                            setSystemSettings(updated);
                            await updateSystemSettings(updated);
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asset 5: Splash Screen Logo */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {systemSettings.splashLogoUrl ? (
                        <img
                          src={systemSettings.splashLogoUrl}
                          alt="Splash Screen Logo"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                          Splash
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">PWA Splash Screen</p>
                        <p className="text-[10px] text-white/40 leading-snug">Startup graphic when app opens on mobile.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <label className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded-xl cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{systemSettings.splashLogoUrl ? 'Replace' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrandingUpload('splashLogoUrl')}
                        />
                      </label>
                      {systemSettings.splashLogoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = { ...systemSettings, splashLogoUrl: '' };
                            setSystemSettings(updated);
                            await updateSystemSettings(updated);
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Text Input: Brand Text */}
                  <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3">
                    <div>
                      <label className="block text-[10px] text-white/40 font-bold mb-1.5 uppercase">Navbar / Sidebar Brand Text</label>
                      <input
                        type="text"
                        placeholder="e.g. SOF-UMER"
                        value={systemSettings.appLogoText}
                        onChange={e => setSystemSettings({ ...systemSettings, appLogoText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>
                    <p className="text-[10px] text-white/40">Short brand title shown alongside logo mark in menus.</p>
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

              {/* Dedicated Login Hero Settings Section */}
              <div className="p-6 bg-[#12121a] border border-amber-500/20 rounded-3xl space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Website Settings
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Login Hero Settings
                      </span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-white mt-1">
                      Login Hero Single Source of Truth
                    </h4>
                    <p className="text-xs text-white/50">
                      Manage the headline, description, and visual asset displayed on the Authentication & Welcome Portal across all environments.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeroPreviewMode('desktop')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        heroPreviewMode === 'desktop'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroPreviewMode('mobile')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        heroPreviewMode === 'mobile'
                          ? 'bg-amber-500 text-black shadow-lg'
                          : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile View</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Form Controls */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Hero Title */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                          Hero Title <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-white/40 font-mono">
                          {(systemSettings.heroTitle || '').length}/200
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={200}
                        value={systemSettings.heroTitle ?? ''}
                        onChange={(e) => setSystemSettings({ ...systemSettings, heroTitle: e.target.value })}
                        placeholder="The Smart Way to Discover, Connect & Grow"
                        className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-amber-500 transition"
                      />
                      <p className="text-[11px] text-white/40 mt-1">
                        Primary headline shown in bold typography on the login screen.
                      </p>
                    </div>

                    {/* Hero Description */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                          Hero Description <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-white/40 font-mono">
                          {(systemSettings.heroDescription || '').length}/1000
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={1000}
                        value={systemSettings.heroDescription ?? ''}
                        onChange={(e) => setSystemSettings({ ...systemSettings, heroDescription: e.target.value })}
                        placeholder="Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace."
                        className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-sm text-white/90 leading-relaxed focus:outline-none focus:border-amber-500 transition resize-none"
                      />
                      <p className="text-[11px] text-white/40 mt-1">
                        Detailed subtitle text describing the Sof Umer ecosystem.
                      </p>
                    </div>

                    {/* Hero Image Management */}
                    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                      <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">
                        Hero Background Visual Asset (Cloudinary)
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden relative group shrink-0 flex items-center justify-center">
                          {systemSettings.heroImageUrl ? (
                            <img
                              src={systemSettings.heroImageUrl}
                              alt="Hero Preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center p-2">
                              <ImageIcon className="w-6 h-6 text-white/20 mx-auto mb-1" />
                              <span className="text-[9px] text-white/30 font-bold uppercase block">Default Slide</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <p className="text-xs text-white/80 font-medium">
                            {systemSettings.heroImageUrl ? 'Custom Cloudinary Image active' : 'Using default rotating slideshow backdrop'}
                          </p>
                          <p className="text-[11px] text-white/40">
                            Upload high-resolution landscape image (1920x1080 recommended). Stored securely via Cloudinary CDN.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl cursor-pointer transition shadow">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingHeroImage ? 'Uploading...' : systemSettings.heroImageUrl ? 'Replace Image' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleHeroImageUpload}
                                disabled={isUploadingHeroImage}
                                className="hidden"
                              />
                            </label>

                            {systemSettings.heroImageUrl && (
                              <button
                                type="button"
                                onClick={handleRemoveHeroImage}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp / Audit Log Info */}
                    {systemSettings.heroUpdatedAt && (
                      <div className="text-[11px] text-white/40 flex items-center gap-2 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Last modified: {new Date(systemSettings.heroUpdatedAt).toLocaleString()} by {systemSettings.heroUpdatedBy || 'Administrator'}
                        </span>
                      </div>
                    )}

                    {/* Alert Notifications */}
                    {heroError && (
                      <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>{heroError}</span>
                      </div>
                    )}

                    {heroSuccess && (
                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{heroSuccess}</span>
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveHeroSettings}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-2xl shadow-xl transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Hero Changes</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelHeroSettings}
                        className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs rounded-2xl border border-white/10 transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleResetHeroToDefault}
                        className="px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs rounded-2xl border border-rose-500/30 transition flex items-center gap-1.5 ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset To Default</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>Live Login Hero Preview ({heroPreviewMode})</span>
                      </span>
                      <span className="text-[10px] text-amber-500 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Real-time
                      </span>
                    </div>

                    <div className={`mx-auto transition-all duration-300 ${
                      heroPreviewMode === 'mobile' ? 'max-w-[320px]' : 'w-full'
                    }`}>
                      <div className="bg-[#060608] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Simulated Image / Backdrop */}
                        <div className="relative h-48 w-full overflow-hidden bg-black">
                          {systemSettings.heroImageUrl ? (
                            <img
                              src={systemSettings.heroImageUrl}
                              alt="Hero Visual"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-amber-950/20 to-black p-4 flex flex-col justify-end">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
                                  S
                                </div>
                                <span className="text-xs font-bold text-white font-serif tracking-wider">SOF-UMER</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-transparent" />
                        </div>

                        {/* Simulated Hero Text Area */}
                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-xl font-serif font-bold text-white leading-tight">
                              {systemSettings.heroTitle || 'The Smart Way to Discover, Connect & Grow'}
                            </h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-4">
                              {systemSettings.heroDescription || 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.'}
                            </p>
                          </div>

                          {/* Dummy Interactive Controls */}
                          <div className="pt-2 space-y-2">
                            <div className="w-full py-2.5 bg-amber-500 text-black text-center font-bold text-xs rounded-xl shadow">
                              Sign In / Register
                            </div>
                            <div className="w-full py-2 bg-white/5 border border-white/10 text-white/50 text-center font-medium text-[11px] rounded-xl">
                              Browse Guest Marketplace
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT GATEWAYS */}
          {settingsSubTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-[#12121a] border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-500" />
                  <span>Payment Gateways & Clearing Account Settings</span>
                </h4>
                <p className="text-xs text-white/50">
                  Configure bank transfer receiving accounts and verification procedures.
                </p>
                <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-white">Commercial Bank of Ethiopia (CBE)</span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-white/60">Account Number: 1000123456789 (SOF-UMER MARKETPLACE PLC)</p>
                  <p className="text-[11px] text-white/40">Manual slip uploads are verified by finance admins within 5–10 minutes.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT US CONFIG */}
          {settingsSubTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
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
            </div>
          )}

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

      {/* --- MODERATION MODALS --- */}

      {/* 1. VIEW USER PROFILE MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121a] border border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">User Profile Details</span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">{viewingUser.fullName}</h3>
                <p className="text-xs text-white/50">{viewingUser.email}</p>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-mono block">System Role</span>
                <span className="font-bold text-amber-400 capitalize">{viewingUser.role}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-mono block">Account Status</span>
                <span className={`font-bold capitalize ${viewingUser.status === 'active' ? 'text-emerald-400' : viewingUser.status === 'suspended' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {viewingUser.status || 'active'}
                </span>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-mono block">Phone Number</span>
                <span className="font-mono text-white">{viewingUser.phone || 'N/A'}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-mono block">Verification Badge</span>
                <span className="font-mono text-white uppercase">{viewingUser.verificationStatus || 'unverified'}</span>
              </div>
            </div>

            {(viewingUser.suspendReason || viewingUser.banReason) && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">Restriction Reason</span>
                <p className="text-white/80">{viewingUser.banReason || viewingUser.suspendReason}</p>
              </div>
            )}

            {/* Warnings Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Warning History ({viewingUser.warnings?.length || 0})
                </h4>
              </div>
              {viewingUser.warnings && viewingUser.warnings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewingUser.warnings.map((w: any, idx: number) => (
                    <div key={idx} className="bg-black/50 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">{w.reason}</span>
                        <span className="text-[10px] font-mono text-white/40">{w.dateIssued ? new Date(w.dateIssued).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {w.note && <p className="text-[11px] text-white/70 italic">Admin Note: {w.note}</p>}
                      <p className="text-[9px] font-mono text-white/30">Issued by: {w.adminName || 'Admin'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/30 italic">No official warnings issued to this account.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEND WARNING MODAL */}
      {warningModalUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Issue Official Warning
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{warningModalUser.fullName}</h3>
                <p className="text-xs text-white/40">{warningModalUser.email}</p>
              </div>
              <button onClick={() => setWarningModalUser(null)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendUserWarning} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Warning Reason *</label>
                <select
                  value={warningReason}
                  onChange={e => setWarningReason(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Policy Violation">Policy Violation</option>
                  <option value="Inappropriate Content / Spam">Inappropriate Content / Spam</option>
                  <option value="Misleading Listing Information">Misleading Listing Information</option>
                  <option value="Unresponsive Seller">Unresponsive Seller</option>
                  <option value="Custom">Custom Reason...</option>
                </select>
              </div>

              {warningReason === 'Custom' && (
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Specify Custom Reason *</label>
                  <input
                    type="text"
                    required
                    value={customWarningReason}
                    onChange={e => setCustomWarningReason(e.target.value)}
                    placeholder="Enter specific violation details..."
                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Optional Admin Note</label>
                <textarea
                  rows={2}
                  value={warningNote}
                  onChange={e => setWarningNote(e.target.value)}
                  placeholder="Additional context or guidance for the user..."
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300">
                ⚠️ Sending a warning will create an in-app notification for this user and record it in the warning history.
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setWarningModalUser(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={warningSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer"
                >
                  {warningSubmitting ? 'Sending...' : 'Send Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. VIEW WARNING HISTORY MODAL */}
      {warningHistoryUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Warning History Log
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{warningHistoryUser.fullName}</h3>
                <p className="text-xs text-white/40">{warningHistoryUser.email}</p>
              </div>
              <button onClick={() => setWarningHistoryUser(null)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {warningHistoryUser.warnings && warningHistoryUser.warnings.length > 0 ? (
                warningHistoryUser.warnings.map((w: any, idx: number) => (
                  <div key={idx} className="bg-black/60 border border-amber-500/20 p-4 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-300 text-sm">{w.reason}</span>
                      <span className="text-[10px] font-mono text-white/40">
                        {w.dateIssued ? new Date(w.dateIssued).toLocaleString() : 'Date N/A'}
                      </span>
                    </div>
                    {w.note && (
                      <p className="text-xs text-white/80 bg-white/5 p-2 rounded-xl">
                        <strong className="text-amber-400 font-mono">Admin Note:</strong> {w.note}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-white/30 font-mono pt-1">
                      <span>Admin: {w.adminName || 'Administrator'}</span>
                      <span>ID: {w.id || `warn-${idx}`}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/30 italic text-center py-6">No warning records found for this user.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setWarningHistoryUser(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHANGE ACCOUNT STATUS MODAL */}
      {statusModalUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                  Moderate Account Status
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{statusModalUser.fullName}</h3>
                <p className="text-xs text-white/40">{statusModalUser.email}</p>
              </div>
              <button onClick={() => setStatusModalUser(null)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserStatus} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Target Account Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('suspended')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${targetStatus === 'suspended' ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/50 text-white/60 border border-white/10'}`}
                  >
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('banned')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${targetStatus === 'banned' ? 'bg-rose-500 text-white border-rose-500' : 'bg-black/50 text-white/60 border border-white/10'}`}
                  >
                    Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetStatus('active')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${targetStatus === 'active' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/50 text-white/60 border border-white/10'}`}
                  >
                    Reactivate
                  </button>
                </div>
              </div>

              {targetStatus !== 'active' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Reason *</label>
                    <select
                      value={statusReason}
                      onChange={e => setStatusReason(e.target.value)}
                      className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="Terms of Service Violation">Terms of Service Violation</option>
                      <option value="Fraudulent Activity / Scam">Fraudulent Activity / Scam</option>
                      <option value="Multiple Spam Complaints">Multiple Spam Complaints</option>
                      <option value="Custom">Custom Reason...</option>
                    </select>
                  </div>

                  {statusReason === 'Custom' && (
                    <div>
                      <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Specify Reason *</label>
                      <input
                        type="text"
                        required
                        value={customStatusReason}
                        onChange={e => setCustomStatusReason(e.target.value)}
                        placeholder="Enter restriction reason..."
                        className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Optional Admin Note</label>
                    <textarea
                      rows={2}
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Internal moderation notes..."
                      className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              <div className={`p-3 rounded-xl text-[11px] font-mono ${targetStatus === 'active' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                {targetStatus === 'active' 
                  ? '✅ Lifting restrictions will allow this user to log back into their account.'
                  : `🛑 ${targetStatus.toUpperCase()} users will be immediately prevented from logging in with a clear status error.`}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className={`px-5 py-2 font-bold text-xs rounded-xl cursor-pointer ${targetStatus === 'active' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-400'}`}
                >
                  {statusSubmitting ? 'Updating...' : `Confirm ${targetStatus.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DELETE USER CONFIRMATION MODAL */}
      {deletingUserModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Permanent Account Deletion
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{deletingUserModal.fullName}</h3>
                <p className="text-xs text-white/40">{deletingUserModal.email}</p>
              </div>
              <button onClick={() => setDeletingUserModal(null)} className="p-1.5 text-white/50 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteUserSubmit} className="space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl text-xs text-rose-300 space-y-1">
                <p className="font-bold">⚠️ Warning: Irreversible Action</p>
                <p className="text-[11px] text-white/70">
                  This will permanently wipe this user account from the system database. Type <span className="font-mono text-amber-400 font-bold">{deletingUserModal.email}</span> to confirm.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1">Confirmation Email *</label>
                <input
                  type="text"
                  required
                  value={deleteConfirmInput}
                  onChange={e => setDeleteConfirmInput(e.target.value)}
                  placeholder={`Type "${deletingUserModal.email}"`}
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setDeletingUserModal(null); setDeleteConfirmInput(''); }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteSubmitting || deleteConfirmInput !== deletingUserModal.email}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {deleteSubmitting ? 'Deleting...' : 'Permanently Delete User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODERATION AUDIT LOG MODAL */}
      {showModerationLogs && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Moderation Audit Activity Log
                </span>
                <p className="text-xs text-white/50 mt-0.5">Record of all administrative actions, warnings, suspensions, and bans.</p>
              </div>
              <button onClick={() => setShowModerationLogs(false)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {moderationLogs && moderationLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-white">
                    <thead className="bg-white/5 text-[10px] font-mono uppercase text-white/40">
                      <tr>
                        <th className="p-2.5">Date / Time</th>
                        <th className="p-2.5">Admin</th>
                        <th className="p-2.5">Target User</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Reason / Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {moderationLogs.map((log: any, idx: number) => (
                        <tr key={log.id || idx} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-mono text-[10px] text-white/50 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-bold text-amber-400">{log.adminName || 'Admin'}</td>
                          <td className="p-2.5">
                            <span className="font-bold block">{log.targetUserName || 'User'}</span>
                            <span className="text-[10px] text-white/40 font-mono">{log.targetUserEmail}</span>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              log.action === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                              log.action === 'suspend' || log.action === 'ban' ? 'bg-rose-500/20 text-rose-300' :
                              log.action === 'unsuspend' || log.action === 'unban' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-white/10 text-white/60'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-2.5 text-white/80 max-w-xs">
                            {log.reason && <p className="font-medium">{log.reason}</p>}
                            {log.note && <p className="text-[10px] text-white/50 italic">{log.note}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-white/30 italic text-center py-10">No moderation audit entries logged yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowModerationLogs(false)}
                className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
