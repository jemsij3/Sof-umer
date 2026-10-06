/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './lib/AppContext';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import Marketplace from './components/Marketplace';
import PropertyDetails from './components/PropertyDetails';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateListingModal from './components/CreateListingModal';
import ListingCard from './components/ListingCard';
import Footer from './components/Footer';
import InfoPage from './components/InfoPage';
import { Property } from './types';
import { ShieldAlert, RefreshCw, X, Send, Compass, Heart, Plus, Search, User as UserIcon, Home, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getThemeCSS } from './lib/themes';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function MainAppLayout() {
  const {
    currentUser,
    properties,
    favorites,
    toggleFavorite,
    refreshData,
    currentLanguage,
    t,
    systemSettings
  } = useApp();

  const [view, setView] = useState<'marketplace' | 'profile' | 'messages' | 'favorites' | 'notifications' | 'payments' | 'settings' | 'admin' | 'info-page'>('marketplace');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Check Site Live Status (Maintenance or Offline) - Single Source of Truth
  // Temporarily overridden to always return false to ensure site stays live
  const isMaintenanceMode = false;


  const isAuthorizedAdmin = Boolean(
    currentUser && 
    (currentUser.role === 'admin' || currentUser.role === 'owner' || currentUser.role === 'superadmin' || (currentUser as any).isAdmin || (currentUser.email && currentUser.email.toLowerCase() === 'jemaljima@gmail.com')) &&
    currentUser.status !== 'suspended' &&
    currentUser.status !== 'banned'
  );

  const isSiteInactive = isMaintenanceMode && !isAuthorizedAdmin;

  // Check if current URL path or search parameters point to the administrator portal or admin login
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path === '/admin/login' ||
      path === '/admin-login' ||
      path.startsWith('/admin/') ||
      path === '/login' ||
      path === '/auth' ||
      path === '/auth/login' ||
      search.includes('view=admin') ||
      search.includes('view=login') ||
      search.includes('admin=true') ||
      search.includes('mode=admin') ||
      search.includes('login=true') ||
      hash.includes('#admin') ||
      hash.includes('#login')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  // Key combination (Ctrl+Shift+A or Alt+A) to enable admin login during maintenance without public UI buttons
  React.useEffect(() => {
    if (!isSiteInactive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        setIsAdminRoute(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSiteInactive]);

  React.useEffect(() => {
    const handleLocationChange = () => {
      const adminNav = checkIsAdminRoute();
      setIsAdminRoute(adminNav);

      const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase().replace(/\/+$/, '') : '';
      const search = typeof window !== 'undefined' ? window.location.search.toLowerCase() : '';
      const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';

      const isAdminUrl = path === '/admin' || path === '/admin/login' || path === '/admin-login' || path.startsWith('/admin/') || search.includes('view=admin') || hash.includes('#admin');
      const isLoginUrl = path === '/login' || path === '/auth' || path === '/auth/login' || search.includes('view=login') || search.includes('login=true') || hash.includes('#login');

      if (isAdminUrl) {
        setView('admin');
      } else if (isLoginUrl) {
        if (!currentUser) {
          setAuthScreenOpen(true);
        }
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [currentUser]);

  // If authorized admin and on admin route or under maintenance, ensure admin view is active
  React.useEffect(() => {
    if (isAuthorizedAdmin) {
      if (isAdminRoute && view !== 'admin') {
        setView('admin');
      } else if (isMaintenanceMode && view !== 'admin') {
        setView('admin');
      }
    }
  }, [isAdminRoute, isAuthorizedAdmin, isMaintenanceMode, view]);
  
  React.useEffect(() => {
    if (selectedProperty) {
      document.title = `${selectedProperty.title} | SOF-UMER`;
    } else if (view === 'admin') {
      document.title = `Admin Management Dashboard | SOF-UMER`;
    } else if (view === 'profile' || view === 'settings' || view === 'messages' || view === 'favorites' || view === 'notifications' || view === 'payments') {
      document.title = `User Dashboard | SOF-UMER`;
    } else {
      document.title = `SOF-UMER | Real Estate & Property Marketplace`;
    }
  }, [view, selectedProperty]);

  React.useEffect(() => {
    if (selectedProperty) {
      const stored = localStorage.getItem('sof_umer_recently_viewed_properties');
      let list: string[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {}
      }
      const updated = [selectedProperty.id, ...list.filter(id => id !== selectedProperty.id)].slice(0, 10);
      localStorage.setItem('sof_umer_recently_viewed_properties', JSON.stringify(updated));
    }
  }, [selectedProperty]);
  
  // Info page ID state
  const [activeInfoPageId, setActiveInfoPageId] = useState<string>('about-us');

  // Marketplace filter state
  const [marketplaceFilter, setMarketplaceFilter] = useState<{ majorCategory?: string; propertyType?: string; featuredOnly?: boolean; key?: number }>({});

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Unified Authentication state & destination tracking
  const [authScreenOpen, setAuthScreenOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authDestination, setAuthDestination] = useState<'profile' | 'messages' | 'favorites' | 'create' | 'admin' | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login', destination: 'profile' | 'messages' | 'favorites' | 'create' | 'admin' | null = null) => {
    setAuthMode(mode);
    setAuthDestination(destination);
    setAuthScreenOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthScreenOpen(false);
    setAuthDestination(null);
    if (!currentUser && (view === 'profile' || view === 'messages' || view === 'favorites')) {
      setView('marketplace');
    }
  };

  // When user successfully authenticates, navigate to their intended destination
  React.useEffect(() => {
    if (currentUser && authScreenOpen) {
      setAuthScreenOpen(false);
      if (authDestination === 'admin') {
        setView('admin');
        setAuthDestination(null);
      } else if (authDestination === 'create') {
        setCreateModalOpen(true);
        setAuthDestination(null);
      } else if (authDestination) {
        setView(authDestination);
        setAuthDestination(null);
      } else if ((currentUser.role === 'admin' || (currentUser as any).isAdmin) && view === 'admin') {
        setView('admin');
      }
    }
  }, [currentUser, authScreenOpen, authDestination, view]);

  // Report modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'property' | 'user'; id: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState('Fraudulent Listing');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [returnViewFromInfo, setReturnViewFromInfo] = useState<string>('marketplace');

  const handleNavigate = (newView: typeof view) => {
    setSelectedProperty(null);
    setView(newView);
  };

  const handleFooterLinkClick = (type: 'marketplace' | 'info', value: string) => {
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (type === 'marketplace') {
      setSelectedProperty(null);
      if (value === 'Featured') {
        setMarketplaceFilter({
          majorCategory: 'All',
          featuredOnly: true,
          key: Date.now()
        });
      } else if (value === 'Vehicles') {
        setMarketplaceFilter({
          majorCategory: 'Products',
          propertyType: 'Vehicles',
          featuredOnly: false,
          key: Date.now()
        });
      } else {
        setMarketplaceFilter({
          majorCategory: value,
          featuredOnly: false,
          key: Date.now()
        });
      }
      setView('marketplace');
    } else if (type === 'info') {
      setReturnViewFromInfo(view);
      setActiveInfoPageId(value);
      setView('info-page');
    }
  };

  const handleOpenReportModal = (type: 'property' | 'user', id: string, name: string) => {
    if (!currentUser) {
      alert('Please log in to report listings.');
      return;
    }
    setReportTarget({ type, id, name });
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget || !currentUser) return;
    setReportSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: currentUser.id,
          reporterEmail: currentUser.email,
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          targetName: reportTarget.name,
          reason: reportReason,
          description: reportDesc
        })
      });

      if (res.ok) {
        setReportSuccess(true);
        setReportDesc('');
        refreshData();
        setTimeout(() => {
          setReportSuccess(false);
          setReportModalOpen(false);
          setReportTarget(null);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportSubmitting(false);
    }
  };

  // If site is set to Maintenance or Offline, render system maintenance screen for non-admins
  if (isSiteInactive) {
    if (isAdminRoute && !currentUser) {
      // Direct Admin portal navigation: allow authorized administrators to log in securely
      return (
        <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4">
          <AuthScreen
            initialMode="login"
            onClose={() => {
              window.location.href = '/';
            }}
            onSuccess={() => {
              setView('admin');
            }}
          />
        </div>
      );
    }

    const appTitle = systemSettings?.appName || 'SOF-UMER';
    const rawMessage = systemSettings?.maintenanceMessage?.trim();
    const defaultMaintenanceMessage = 
      `${appTitle} is temporarily under maintenance.\n\n` +
      `We are making improvements to provide you with a better and more reliable experience. Please check back soon.\n\n` +
      `Thank you for your patience.`;
    const displayMessage = rawMessage || defaultMaintenanceMessage;

    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-6 text-center relative font-sans select-none">
        <style>{getThemeCSS(systemSettings?.themeName || 'cosmic-slate')}</style>
        <div className="max-w-md w-full bg-[#12121a] border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6 animate-fade-in relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">
              {appTitle} is Temporarily Under Maintenance
            </h2>
            <div className="text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line text-center">
              {displayMessage}
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Page</span>
            </button>
            <p className="text-[11px] text-white/40">
              Platform availability will resume automatically once scheduled updates conclude.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active view fallback
  const activeView = selectedProperty ? 'details' : view;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-between relative overflow-hidden font-sans text-[#F5F5F4]">
      <style>{getThemeCSS(systemSettings?.themeName || 'cosmic-slate')}</style>
      
      {/* Top Universal Header Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(v) => {
          if (v === 'admin' || v === 'profile' || v === 'messages' || v === 'favorites' || v === 'notifications' || v === 'payments' || v === 'settings') {
            if (!currentUser) {
              if (v === 'admin') {
                setView('admin');
              } else if (v === 'profile' || v === 'messages' || v === 'favorites') {
                handleOpenAuth('login', v as any);
              } else {
                handleOpenAuth('login', null);
              }
            } else {
              setView(v as any);
              setSelectedProperty(null);
            }
          } else {
            handleNavigate(v as any);
          }
        }}
        onOpenCreateModal={() => {
          if (!currentUser) {
            handleOpenAuth('login', 'create');
          } else {
            setCreateModalOpen(true);
          }
        }}
        onOpenAuthModal={(mode) => {
          handleOpenAuth(mode, null);
        }}
      />

      {/* Main Body Switcher Layout */}
      <main className="flex-1 pb-20 md:pb-16">
        <AnimatePresence mode="wait">
          
          {/* PROPERTY DETAILS VIEWS */}
          {selectedProperty ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <PropertyDetails
                property={selectedProperty}
                onBack={() => setSelectedProperty(null)}
                onOpenReportModal={handleOpenReportModal}
                onNavigateToAuth={() => handleOpenAuth('login', null)}
              />
            </motion.div>
          ) : view === 'marketplace' ? (
            /* MARKETPLACE VIEW */
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Marketplace
                onSelectProperty={(prop) => setSelectedProperty(prop)}
                onOpenReportModal={handleOpenReportModal}
                onNavigateToPayments={() => handleNavigate('payments')}
                initialMajorCategory={marketplaceFilter.majorCategory}
                initialType={marketplaceFilter.propertyType}
                initialFeaturedOnly={marketplaceFilter.featuredOnly}
                filterKey={marketplaceFilter.key}
              />
            </motion.div>
          ) : view === 'info-page' ? (
            /* INFO PAGE VIEWS */
            <motion.div
              key="infopage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <InfoPage
                pageId={activeInfoPageId}
                returnView={returnViewFromInfo}
                onBack={() => setView((returnViewFromInfo as any) || 'marketplace')}
                onOpenReportModalFromInfo={() => {
                  handleOpenReportModal('property', 'info-contact', 'Report Department / User Support');
                }}
              />
            </motion.div>
          ) : (view === 'admin' || isMaintenanceMode) && isAuthorizedAdmin ? (
            /* COMPREHENSIVE ADMIN ADMINISTRATIVE VIEW */
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="admin-console"
            >
              <AdminDashboard
                onBackToMarketplace={() => {
                  if (!isMaintenanceMode) {
                    handleNavigate('marketplace');
                  }
                }}
                onOpenCreateModal={() => setCreateModalOpen(true)}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </motion.div>
          ) : currentUser ? (
            /* STANDARD DASHBOARD TABS (Profile, Payments, Messages, Notifications, Settings) */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <UserDashboard
                initialTab={view as any}
                onNavigate={(v) => {
                  if (v === 'profile') {
                    handleOpenAuth('login', 'profile');
                  } else {
                    handleNavigate('marketplace');
                  }
                }}
                onNavigateToInfo={(pageId) => handleFooterLinkClick('info', pageId)}
                onOpenCreateModal={() => setCreateModalOpen(true)}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </motion.div>
          ) : !currentUser ? (
            /* UNIFIED AUTHENTICATION FOR ALL PROTECTED TABS */
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-12 px-4 flex justify-center items-center min-h-[60vh]"
            >
              <div className="w-full max-w-md">
                <AuthScreen
                  initialMode={authMode}
                  onClose={() => setView('marketplace')}
                  onSuccess={() => {
                    if (view === 'admin' || authDestination === 'admin') {
                      setView('admin');
                      setAuthDestination(null);
                    } else if (authDestination === 'create') {
                      setCreateModalOpen(true);
                      setAuthDestination(null);
                    } else if (authDestination) {
                      setView(authDestination);
                      setAuthDestination(null);
                    }
                  }}
                />
              </div>
            </motion.div>
          ) : null}

        </AnimatePresence>
      </main>

      {/* Universal Footer */}
      <Footer onFooterLinkClick={handleFooterLinkClick} />

      {/* Mobile Bottom Navigation Bar: Home | Messages | Sell (+) | Favorites | Profile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07070a]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => {
            setSelectedProperty(null);
            setView('marketplace');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition cursor-pointer min-w-0 ${
            (view === 'marketplace' || view === 'info-page') && !selectedProperty ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {t('home') || 'Home'}
          </span>
        </button>

        {/* 2. Messages */}
        <button
          onClick={() => {
            setSelectedProperty(null);
            if (!currentUser) {
              handleOpenAuth('login', 'messages');
            } else {
              setView('messages');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition cursor-pointer min-w-0 ${
            view === 'messages' ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {t('messages') || 'Messages'}
          </span>
        </button>

        {/* 3. Sell (+) - Prominent Centered Circular Gold Button */}
        <button
          onClick={() => {
            if (currentUser) {
              setCreateModalOpen(true);
            } else {
              handleOpenAuth('login', 'create');
            }
          }}
          className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black p-3.5 rounded-full shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer border-2 border-[#07070a] shrink-0 mx-1"
          title={t('sell') || t('list_property') || 'Sell'}
          aria-label={t('sell') || t('list_property') || 'Sell'}
        >
          <Plus className="w-5 h-5 text-black" strokeWidth={3} />
        </button>

        {/* 4. Favorites */}
        <button
          onClick={() => {
            setSelectedProperty(null);
            if (!currentUser) {
              handleOpenAuth('login', 'favorites');
            } else {
              setView('favorites');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition cursor-pointer min-w-0 ${
            view === 'favorites' ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {t('favorites') || 'Favorites'}
          </span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => {
            setSelectedProperty(null);
            if (!currentUser) {
              handleOpenAuth('login', 'profile');
            } else {
              setView('profile');
            }
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition cursor-pointer min-w-0 ${
            view === 'profile' || view === 'admin' || (currentUser && (view === 'settings' || view === 'payments' || view === 'notifications')) ? 'text-amber-400 font-bold' : 'text-white/60 hover:text-white'
          }`}
        >
          <UserIcon className="w-5 h-5 shrink-0" />
          <span className="text-[10px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {t('profile') || 'Profile'}
          </span>
        </button>
      </nav>

      {/* UNIFIED AUTH SCREEN MODAL OVERLAY */}
      <AnimatePresence>
        {authScreenOpen && !currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07070a]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseAuth();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md my-auto"
            >
              <AuthScreen
                initialMode={authMode}
                onClose={handleCloseAuth}
                onSuccess={() => {
                  if (authDestination === 'admin') {
                    setView('admin');
                    setAuthDestination(null);
                  } else if (authDestination === 'create') {
                    setCreateModalOpen(true);
                    setAuthDestination(null);
                  } else if (authDestination) {
                    setView(authDestination);
                    setAuthDestination(null);
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE PROPERTY LISTINGS MODAL OVERLAY */}
      {createModalOpen && (
        <CreateListingModal onClose={() => setCreateModalOpen(false)} />
      )}

      {/* SAFETY / COMPLAINT REPORT MODAL OVERLAY */}
      {reportModalOpen && reportTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#0c0c0c] rounded-sm max-w-md w-full overflow-hidden border border-white/10 shadow-2xl p-6 text-left animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2 text-white/80">
                <ShieldAlert className="w-5 h-5 text-white/60" />
                <h3 className="font-serif text-base font-normal uppercase tracking-wide">
                  {t('report_listing_user')}
                </h3>
              </div>
              <button onClick={() => { setReportModalOpen(false); setReportTarget(null); }} className="p-1 rounded-sm hover:bg-white/5 text-white/40 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="bg-white/5 text-white border border-white/10 text-xs p-4 rounded-sm font-bold text-center">
                {t('report_success_msg')}
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {t('report_intro_1')
                    .replace('{type}', reportTarget.type === 'property' 
                      ? (currentLanguage === 'om' ? 'qabeenya' : currentLanguage === 'am' ? 'ንብረት' : 'property') 
                      : (currentLanguage === 'om' ? 'fayyadamaa' : currentLanguage === 'am' ? 'ተጠቃሚ' : 'user'))
                    .replace('{name}', reportTarget.name)}
                </p>

                <div>
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-widest mb-1.5">
                    {t('select_reason')}
                  </label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full p-2.5 bg-black border border-white/10 text-xs rounded-sm text-white focus:outline-none focus:border-white transition"
                  >
                    <option value="Fraudulent Listing" className="bg-black">
                      {t('fraudulent_fake')}
                    </option>
                    <option value="Incorrect Specifications" className="bg-black">
                      {t('incorrect_specs')}
                    </option>
                    <option value="Inappropriate Messages" className="bg-black">
                      {t('inappropriate_behavior')}
                    </option>
                    <option value="Other" className="bg-black">
                      {t('other_violations')}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-white/50 uppercase tracking-widest mb-1.5">
                    {t('describe_violation')}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    placeholder={t('violation_placeholder')}
                    className="w-full p-2.5 bg-black border border-white/10 text-xs rounded-sm text-white focus:outline-none focus:border-white transition font-sans"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => { setReportModalOpen(false); setReportTarget(null); }}
                    className="bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs py-2 px-4 rounded-sm uppercase tracking-widest transition"
                  >
                    {t('cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="bg-white hover:bg-zinc-200 text-black font-bold text-xs py-2 px-5 rounded-sm uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {reportSubmitting ? t('submitting_report') : t('submit_report')}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* In-App PWA Install Banner */}
      <PWAInstallPrompt />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
