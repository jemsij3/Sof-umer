import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../lib/AppContext';
import { formatTimeAgo } from '../lib/utils';
import { Bell, Languages, User, LogOut, MessageSquare, Settings, Shield, Plus, Building, Heart, CheckCircle2, Wallet, CreditCard, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface NavbarProps {
  onNavigate: (view: 'marketplace' | 'profile' | 'messages' | 'favorites' | 'notifications' | 'payments' | 'settings' | 'admin' | 'mylistings') => void;
  activeView: string;
  onOpenCreateModal: () => void;
  onOpenAuthModal?: (mode: 'login' | 'signup') => void;
}

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

  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
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
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    if (notifDropdownOpen || userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [notifDropdownOpen, userDropdownOpen]);

  // Active languages filter with guaranteed support for EN, OM, AM
  const fallbackLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', isActive: true },
    { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo', isActive: true },
    { code: 'am', name: 'Amharic (አማርኛ)', nativeName: 'አማርኛ', isActive: true }
  ];
  const activeLanguages = languages && languages.filter(l => l.isActive).length > 0
    ? languages.filter(l => l.isActive)
    : fallbackLanguages;
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

  return (
    <nav className="sticky top-0 z-40 bg-[#060608]/85 text-[#F5F5F4] border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => onNavigate('marketplace')}>
            {systemSettings?.logoUrl ? (
              <img
                src={systemSettings.logoUrl}
                alt="App Logo"
                className="w-10 h-10 object-cover rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center rounded-xl font-black text-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition duration-300 group-hover:scale-105">
                {(systemSettings?.appLogoText || systemSettings?.appName || 'S')[0].toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold tracking-wider text-[#F5F5F4] leading-none">
                {systemSettings?.appLogoText || systemSettings?.appName || 'SOF-UMER'}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-amber-500/80 font-bold mt-1">
                Marketplace
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Listing Creator / Sell Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  onOpenCreateModal();
                } else if (onOpenAuthModal) {
                  onOpenAuthModal('login');
                } else {
                  onNavigate('profile');
                }
              }}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02]"
              title={t('list_property') || 'List Property / Sell'}
            >
              <Plus className="w-4 h-4 text-black" />
              <span>{t('list_property') || 'Post Listing'}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setUserDropdownOpen(false);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition cursor-pointer"
                aria-label="Select Language"
              >
                <Languages className="w-4.5 h-4.5" />
                <span className="text-[10px] uppercase font-bold tracking-widest hidden lg:inline">
                  {activeLanguages.find(l => l.code === currentLanguage)?.name || currentLanguage}
                </span>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0d0d12] rounded-2xl shadow-2xl border border-white/10 py-1.5 z-50 overflow-hidden"
                  >
                    {activeLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-white/5 transition flex items-center justify-between cursor-pointer ${
                          currentLanguage === lang.code ? 'text-amber-500 font-bold bg-white/5' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <span>{lang.name}</span>
                        {currentLanguage === lang.code && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* In-App Notifications Drawer Trigger */}
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
                  }}
                  className="p-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      ref={notifDropdownRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        left: notifStyle.left,
                        width: notifStyle.width,
                      }}
                      className="absolute mt-2 bg-[#0d0d12] rounded-2xl shadow-2xl border border-white/10 py-2.5 z-50 max-h-[400px] overflow-y-auto"
                    >
                      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center gap-2">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-white/50 truncate">
                          {t('notifications')}
                        </span>
                        {unreadNotifications.length > 0 && (
                          <span className="text-[9px] text-black bg-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0">
                            {unreadNotifications.length} {t('new_notification_suffix')}
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-white/5">
                        {notifications.filter(n => n.userId === currentUser.id).length === 0 ? (
                          <div className="px-4 py-8 text-center text-white/30 text-xs">
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
                                className={`px-4 py-3.5 text-xs hover:bg-white/5 transition ${
                                  !notif.isRead ? 'bg-amber-500/5 text-white font-medium' : 'text-white/40'
                                }`}
                              >
                                <p className="font-semibold text-white/95 mb-0.5 flex items-center gap-1.5">
                                  {!notif.isRead && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />}
                                  <span className="break-words">{notif.title}</span>
                                </p>
                                <p className="leading-relaxed text-white/60 break-words">{notif.message}</p>
                                <span className="text-[10px] text-white/30 block mt-1 font-mono">
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

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 px-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer text-[#F5F5F4]"
                >
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-amber-500 shadow-md shadow-amber-500/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : currentUser.role === 'admin' && systemSettings?.logoUrl ? (
                    <img
                      src={systemSettings.logoUrl}
                      alt="Admin Logo"
                      className="w-9 h-9 rounded-full object-cover border border-amber-500 shadow-md shadow-amber-500/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#050505] font-black flex items-center justify-center text-sm shadow">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                  {currentUser.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      ref={userDropdownRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 bg-[#0d0d12] rounded-2xl shadow-2xl border border-white/10 py-2 z-50 overflow-hidden"
                    >
                      {currentUser.role === 'admin' ? (
                        <>
                          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                            {currentUser.photoUrl ? (
                              <img
                                src={currentUser.photoUrl}
                                alt={currentUser.fullName}
                                className="w-10 h-10 object-cover rounded-xl border border-amber-500/30"
                                referrerPolicy="no-referrer"
                              />
                            ) : systemSettings?.logoUrl ? (
                              <img
                                src={systemSettings.logoUrl}
                                alt="Brand Logo"
                                className="w-10 h-10 object-cover rounded-xl border border-amber-500/30"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#050505] font-black flex items-center justify-center text-sm shadow">
                                {currentUser.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-white truncate uppercase tracking-wider">{currentUser.fullName}</p>
                              <p className="text-[10px] text-white/40 truncate font-mono">{currentUser.email}</p>
                              <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
                                {t('role_admin_badge')}
                              </span>
                            </div>
                          </div>

                          {/* Common Links */}
                          <button
                            onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-[11px] uppercase tracking-wider hover:bg-white/5 text-white/60 hover:text-white transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-white/50" />
                            <span>{t("nav_my_dashboard")}</span>
                          </button>

                          {/* Admin Links */}
                          <div className="border-t border-white/5 my-1.5"></div>
                          <button
                            onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-wider hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 font-bold transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span>{t('admin_dashboard')}</span>
                          </button>

                          <div className="border-t border-white/5 my-1.5"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-wider hover:bg-red-500/15 text-red-400 hover:text-red-300 transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-400/70" />
                            <span>{t('logout')}</span>
                          </button>
                        </>
                      ) : (
                        /* REGULAR USER DROPDOWN: ONLY TWO USER-LEVEL ITEMS (Settings & Log Out) */
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onNavigate('settings');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-white/5 text-white/80 hover:text-white transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-amber-400" />
                            <span>{t('settings') || 'Settings'}</span>
                          </button>

                          <div className="border-t border-white/5 my-1"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-red-500/15 text-red-400 hover:text-red-300 transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>{t('logout') || 'Log Out'}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('profile')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
                title={t('profile') || 'Account'}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:inline font-bold uppercase tracking-wider">{t('profile') || 'Account'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
