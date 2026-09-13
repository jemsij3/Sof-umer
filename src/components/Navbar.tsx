import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../lib/AppContext';
import { formatTimeAgo } from '../lib/utils';
import { 
  Bell, Languages, User, LogOut, MessageSquare, Settings, Shield, 
  Plus, Building, Heart, CheckCircle2, ChevronDown, ChevronUp, Sparkles, 
  Car, ShoppingBag, Wrench, Briefcase, Store, HelpCircle, FileText, Compass, ExternalLink 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface NavbarProps {
  onNavigate: (view: 'marketplace' | 'profile' | 'messages' | 'favorites' | 'notifications' | 'payments' | 'settings' | 'admin' | 'mylistings' | 'info-page') => void;
  activeView: string;
  onOpenCreateModal: () => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
  onSelectCategory?: (categoryName: string) => void;
}

const LANGUAGE_FLAGS: Record<string, { flag: string; label: string; name: string }> = {
  en: { flag: '🇺🇸', label: 'EN', name: 'English' },
  am: { flag: '🇪🇹', label: 'AM', name: 'አማርኛ (Amharic)' },
  om: { flag: '🇪🇹', label: 'AO', name: 'Afaan Oromoo' },
};

export default function Navbar({ onNavigate, activeView, onOpenCreateModal, onOpenAuthModal }: NavbarProps) {
  const {
    currentUser,
    currentLanguage,
    setLanguage,
    languages,
    notifications,
    logout,
    t,
    refreshData,
    systemSettings
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);

  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [notifStyle, setNotifStyle] = useState<{ left: string; width: string }>({ left: '0px', width: '320px' });

  // Compute position to keep dropdown anchored beneath bell icon and fully visible inside viewport
  const updateNotifPosition = useCallback(() => {
    if (!bellButtonRef.current) return;
    const rect = bellButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 16;
    const targetWidth = Math.min(320, viewportWidth - margin * 2);

    const bellCenter = rect.left + rect.width / 2;
    let idealLeft = bellCenter - targetWidth / 2;

    if (idealLeft < margin) {
      idealLeft = margin;
    } else if (idealLeft + targetWidth > viewportWidth - margin) {
      idealLeft = viewportWidth - margin - targetWidth;
    }

    const relativeLeft = idealLeft - rect.left;

    setNotifStyle({
      left: `${relativeLeft}px`,
      width: `${targetWidth}px`
    });
  }, []);

  useEffect(() => {
    if (notifDropdownOpen) {
      updateNotifPosition();
      window.addEventListener('resize', updateNotifPosition);
      window.addEventListener('scroll', updateNotifPosition, { passive: true });
      return () => {
        window.removeEventListener('resize', updateNotifPosition);
        window.removeEventListener('scroll', updateNotifPosition);
      };
    }
  }, [notifDropdownOpen, updateNotifPosition]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };

    if (notifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [notifDropdownOpen]);

  // Active flag display
  const activeLangConfig = LANGUAGE_FLAGS[currentLanguage] || { flag: '🇺🇸', label: 'EN', name: 'English' };

  const unreadNotifications = notifications.filter(n => n.userId === currentUser?.id && !n.isRead);

  const handleMarkNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    onNavigate('marketplace');
  };

  const closeAllDropdowns = () => {
    setLangDropdownOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setExploreDropdownOpen(false);
    setResourcesDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 text-stone-800 border-b border-stone-200/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer group" 
              onClick={() => { closeAllDropdowns(); onNavigate('marketplace'); }}
            >
              <div className="w-10 h-10 bg-[#C06853] text-white flex items-center justify-center rounded-xl font-black text-xl shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-[#A85340]">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-stone-900 font-sans leading-none">
                  Sofumer
                </span>
                <span className="text-[10px] tracking-wider text-stone-500 font-medium mt-0.5">
                  Marketplace
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links: Explore v, Resources v, List a Property */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
              
              {/* Explore ⌄ */}
              <div className="relative">
                <button
                  onClick={() => {
                    setExploreDropdownOpen(!exploreDropdownOpen);
                    setResourcesDropdownOpen(false);
                    setLangDropdownOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 py-2 px-1 hover:text-[#C06853] transition cursor-pointer ${
                    exploreDropdownOpen ? 'text-[#C06853] font-semibold' : ''
                  }`}
                >
                  <span>Explore</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${exploreDropdownOpen ? 'rotate-180 text-[#C06853]' : ''}`} />
                </button>

                <AnimatePresence>
                  {exploreDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-left"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                        Marketplace Categories
                      </div>
                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">🏠</span>
                          <span>Real Estate & Properties</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">🚗</span>
                          <span>Vehicles & Motors</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">📦</span>
                          <span>Products & Goods</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">🛠️</span>
                          <span>Professional Services</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">💼</span>
                          <span>Jobs & Careers</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('marketplace');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <span className="text-base">🏬</span>
                          <span>Local Businesses</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Resources ⌄ */}
              <div className="relative">
                <button
                  onClick={() => {
                    setResourcesDropdownOpen(!resourcesDropdownOpen);
                    setExploreDropdownOpen(false);
                    setLangDropdownOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`flex items-center gap-1.5 py-2 px-1 hover:text-[#C06853] transition cursor-pointer ${
                    resourcesDropdownOpen ? 'text-[#C06853] font-semibold' : ''
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${resourcesDropdownOpen ? 'rotate-180 text-[#C06853]' : ''}`} />
                </button>

                <AnimatePresence>
                  {resourcesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 text-left"
                    >
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                        Guides & Trust
                      </div>
                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('info-page');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-[#C06853]" />
                          <span>Buyer & Seller Safety</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('info-page');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-stone-400" />
                          <span>Listing Rules</span>
                        </button>
                        <button
                          onClick={() => {
                            closeAllDropdowns();
                            onNavigate('info-page');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:text-[#C06853] transition cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4 text-stone-400" />
                          <span>Help Center</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* List a Property */}
              <button
                onClick={() => {
                  closeAllDropdowns();
                  onOpenCreateModal();
                }}
                className="hover:text-[#C06853] transition cursor-pointer"
              >
                List a Property
              </button>
            </div>
          </div>

          {/* Right: Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Primary Terracotta CTA: [ Get Started ] */}
            <button
              onClick={() => {
                closeAllDropdowns();
                if (currentUser) {
                  onOpenCreateModal();
                } else if (onOpenAuthModal) {
                  onOpenAuthModal('signup');
                } else {
                  onNavigate('profile');
                }
              }}
              className="bg-[#C06853] hover:bg-[#A85340] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
            </button>

            {/* Language Selector dropdown displaying active selection "🇺🇸 EN ^" */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setUserDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setExploreDropdownOpen(false);
                  setResourcesDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer border border-stone-200/60"
                aria-label="Select Language"
              >
                <span className="text-base">{activeLangConfig.flag}</span>
                <span className="uppercase tracking-wider">{activeLangConfig.label}</span>
                {langDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                )}
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                      Select Language
                    </div>
                    {Object.entries(LANGUAGE_FLAGS).map(([code, item]) => {
                      const isActive = currentLanguage === code;
                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setLanguage(code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-stone-50 transition flex items-center justify-between cursor-pointer ${
                            isActive ? 'text-[#C06853] bg-[#C06853]/10' : 'text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.flag}</span>
                            <span>{item.name}</span>
                            <span className="text-[10px] font-bold text-stone-400">({item.label})</span>
                          </div>
                          {isActive && <div className="w-2 h-2 rounded-full bg-[#C06853]" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications (if logged in) */}
            {currentUser && (
              <div className="relative">
                <button
                  ref={bellButtonRef}
                  onClick={() => {
                    const nextState = !notifDropdownOpen;
                    if (nextState) {
                      updateNotifPosition();
                      handleMarkNotificationsRead();
                    }
                    setNotifDropdownOpen(nextState);
                    setUserDropdownOpen(false);
                    setLangDropdownOpen(false);
                    setExploreDropdownOpen(false);
                    setResourcesDropdownOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition relative cursor-pointer border border-stone-200/60"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#C06853] text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      ref={notifDropdownRef}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      style={{
                        left: notifStyle.left,
                        width: notifStyle.width,
                      }}
                      className="absolute mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 max-h-[400px] overflow-y-auto"
                    >
                      <div className="px-4 py-2.5 border-b border-stone-100 flex justify-between items-center gap-2">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-stone-500">
                          {t('notifications')}
                        </span>
                        {unreadNotifications.length > 0 && (
                          <span className="text-[9px] text-white bg-[#C06853] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {unreadNotifications.length} new
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-stone-100">
                        {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                          <div className="px-4 py-8 text-center text-stone-400 text-xs">
                            {t('no_notifications_yet')}
                          </div>
                        ) : (
                          notifications
                            .filter(n => n.userId === currentUser.id)
                            .slice()
                            .reverse()
                            .map(notif => (
                              <div
                                key={notif.id}
                                className={`px-4 py-3 text-xs hover:bg-stone-50 transition ${
                                  !notif.isRead ? 'bg-[#C06853]/5 font-medium' : 'text-stone-500'
                                }`}
                              >
                                <p className="font-semibold text-stone-900 mb-0.5 flex items-center gap-1.5">
                                  {!notif.isRead && <span className="w-1.5 h-1.5 bg-[#C06853] rounded-full shrink-0" />}
                                  <span className="break-words">{notif.title}</span>
                                </p>
                                <p className="leading-relaxed text-stone-600 break-words">{notif.message}</p>
                                <span className="text-[10px] text-stone-400 block mt-1 font-mono">
                                  {formatTimeAgo(notif.createdAt)}
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Avatar & Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                    setNotifDropdownOpen(false);
                    setExploreDropdownOpen(false);
                    setResourcesDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                >
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-[#C06853]/50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#C06853] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                  {currentUser.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C06853]" />
                  )}
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                        {currentUser.photoUrl ? (
                          <img
                            src={currentUser.photoUrl}
                            alt={currentUser.fullName}
                            className="w-10 h-10 object-cover rounded-xl border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#C06853] text-white font-black flex items-center justify-center text-sm shadow">
                            {currentUser.fullName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-stone-900 truncate uppercase tracking-wider">{currentUser.fullName}</p>
                          <p className="text-[10px] text-stone-500 truncate font-mono">{currentUser.email}</p>
                          <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#C06853]/15 text-[#C06853]">
                            {currentUser.role === 'admin' ? t('role_admin_badge') : t('role_agent_badge')}
                          </span>
                        </div>
                      </div>

                      {/* Common Links */}
                      <div className="py-1">
                        <button
                          onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 text-stone-700 hover:text-[#C06853] transition flex items-center gap-2.5 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-stone-400" />
                          <span>{t("nav_my_dashboard")}</span>
                        </button>

                        <button
                          onClick={() => { onNavigate('favorites'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 text-stone-700 hover:text-[#C06853] transition flex items-center gap-2.5 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-stone-400" />
                          <span>{t("favorites") || "Favorites"}</span>
                        </button>
                      </div>

                      {/* Admin Links */}
                      {currentUser.role === 'admin' && (
                        <>
                          <div className="border-t border-stone-100 my-1"></div>
                          <button
                            onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-[#C06853]/10 text-[#C06853] transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-[#C06853]" />
                            <span>{t('admin_dashboard')}</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-stone-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 transition flex items-center gap-2.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>{t('logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal('login');
                  else onNavigate('profile');
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
                title={t('profile') || 'Account'}
              >
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-700">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-xs">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
