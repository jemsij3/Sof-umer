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
import Footer from './components/Footer';
import InfoPage from './components/InfoPage';
import { Property } from './types';
import { ShieldAlert, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getThemeCSS } from './lib/themes';

function MainAppLayout() {
  const {
    currentUser,
    refreshData,
    currentLanguage,
    t,
    systemSettings
  } = useApp();

  const [view, setView] = useState<'marketplace' | 'profile' | 'messages' | 'notifications' | 'payments' | 'settings' | 'admin' | 'info-page'>('marketplace');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Check Site Live Status (Maintenance or Offline)
  const isSiteInactive = systemSettings?.siteStatus && 
    systemSettings.siteStatus !== 'Online' && 
    systemSettings.siteStatus !== 'Online & Active' && 
    currentUser?.role !== 'admin';
  
  React.useEffect(() => {
    if (selectedProperty) {
      document.title = `${selectedProperty.title} | SOF-UMER`;
    } else if (view === 'admin') {
      document.title = `Admin Management Dashboard | SOF-UMER`;
    } else if (view === 'profile' || view === 'settings' || view === 'messages' || view === 'notifications' || view === 'payments') {
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
  const [activeInfoPageId, setActiveInfoPageId] = useState<string>('marketplace-rules');

  // Marketplace filter state
  const [marketplaceFilter, setMarketplaceFilter] = useState<{ majorCategory?: string; propertyType?: string; featuredOnly?: boolean; key?: number }>({});

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Authentication mode switcher inside AuthScreen
  const [authScreenOpen, setAuthScreenOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Report modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'property' | 'user'; id: string; name: string } | null>(null);
  const [reportReason, setReportReason] = useState('Fraudulent Listing');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

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
    const isOffline = systemSettings.siteStatus === 'Offline';
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-6 text-center relative font-sans">
        <style>{getThemeCSS(systemSettings?.themeName || 'cosmic-slate')}</style>
        <div className="max-w-md w-full bg-[#12121a] border border-amber-500/20 p-8 rounded-3xl shadow-2xl space-y-6 animate-fade-in relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">
              {isOffline ? 'System Offline' : 'Under Scheduled Maintenance'}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              {isOffline 
                ? `${systemSettings?.appName || 'SOF-UMER'} is currently offline. System operations will resume shortly.`
                : `${systemSettings?.appName || 'SOF-UMER'} is undergoing essential system maintenance to enhance security and platform performance. We will return online shortly.`
              }
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={() => {
                // If user clicks Admin Portal, allow admin login modal/screen
                const pass = prompt('Enter Administrator Access Key or Password:');
                if (pass && pass.trim()) {
                  window.location.reload();
                }
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg cursor-pointer"
            >
              Administrator Login Portal
            </button>
            <p className="text-[10px] text-white/40 font-mono">Current Live Mode: <span className="text-amber-400 font-bold">{systemSettings.siteStatus}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, immediately show the login screen
  if (!currentUser) {
    return (
      <>
        <style>{getThemeCSS(systemSettings?.themeName || 'cosmic-slate')}</style>
        <AuthScreen />
      </>
    );
  }

  // Fallback if welcome was bypassed but user logged in
  const activeView = selectedProperty ? 'details' : view;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-between relative overflow-hidden font-sans text-[#F5F5F4]">
      <style>{getThemeCSS(systemSettings?.themeName || 'cosmic-slate')}</style>
      
      {/* Top Universal Header Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(v) => {
          if (v === 'admin' || v === 'profile' || v === 'messages' || v === 'notifications' || v === 'payments' || v === 'settings') {
            setView(v as any);
            setSelectedProperty(null);
          } else {
            handleNavigate(v as any);
          }
        }}
        onOpenCreateModal={() => setCreateModalOpen(true)}
      />

      {/* Main Body Switcher Layout */}
      <main className="flex-1 pb-16">
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
                onBack={() => setView('marketplace')}
                onOpenReportModalFromInfo={() => {
                  handleOpenReportModal('property', 'info-contact', 'Report Department / User Support');
                }}
              />
            </motion.div>
          ) : currentUser?.role === 'admin' ? (
            /* COMPREHENSIVE ADMIN ADMINISTRATIVE VIEW */
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="admin-console"
            >
              <AdminDashboard
                onBackToMarketplace={() => handleNavigate('marketplace')}
                onOpenCreateModal={() => setCreateModalOpen(true)}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </motion.div>
          ) : (
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
                    setAuthMode('login');
                    setAuthScreenOpen(true);
                  } else {
                    handleNavigate('marketplace');
                  }
                }}
                onNavigateToInfo={(pageId) => handleFooterLinkClick('info', pageId)}
                onOpenCreateModal={() => setCreateModalOpen(true)}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Universal Footer */}
      <Footer onFooterLinkClick={handleFooterLinkClick} />

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

      {/* Safety / Complaint report modal overlay */}

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
