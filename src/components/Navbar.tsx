import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { Bell, Languages, User, LogOut, MessageSquare, Settings, Shield, Plus, Building, Heart, CheckCircle2, Wallet, CreditCard } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface NavbarProps {
  onNavigate: (view: 'marketplace' | 'profile' | 'messages' | 'notifications' | 'payments' | 'settings' | 'admin' | 'mylistings') => void;
  activeView: string;
  onOpenCreateModal: () => void;
}

export default function Navbar({ onNavigate, activeView, onOpenCreateModal }: NavbarProps) {
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

  // Active languages filter
  const activeLanguages = languages.filter(l => l.isActive);
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


            {/* Quick Listing Creator Button (Admin or Verified User) */}
            {currentUser && (currentUser.role === 'admin' || currentUser.isVerified) && (
              <button
                onClick={onOpenCreateModal}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>{t('list_property') || 'List Property'}</span>
              </button>
            )}

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
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                    setLangDropdownOpen(false);
                    if (!notifDropdownOpen) {
                      handleMarkNotificationsRead();
                    }
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-[#0d0d12] rounded-2xl shadow-2xl border border-white/10 py-2.5 z-50 max-h-[400px] overflow-y-auto"
                    >
                      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-white/50">{t('notifications')}</span>
                        {unreadNotifications.length > 0 && (
                          <span className="text-[9px] text-black bg-amber-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
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
                                  {!notif.isRead && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                                  {notif.title}
                                </p>
                                <p className="leading-relaxed text-white/60">{notif.message}</p>
                                <span className="text-[10px] text-white/30 block mt-1 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-[#0d0d12] rounded-2xl shadow-2xl border border-white/10 py-2.5 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                        {currentUser.photoUrl ? (
                          <img
                            src={currentUser.photoUrl}
                            alt={currentUser.fullName}
                            className="w-10 h-10 object-cover rounded-xl border border-amber-500/30"
                            referrerPolicy="no-referrer"
                          />
                        ) : currentUser.role === 'admin' && systemSettings?.logoUrl ? (
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
                            {currentUser.role === 'admin' ? t('role_admin_badge') : t('role_agent_badge')}
                          </span>
                        </div>
                      </div>

                      {/* Wallet Balance Summary Card inside Dropdown */}
                      <div className="mx-2 my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-amber-500" />
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-white/50 block font-bold">Wallet Balance</span>
                            <span className="text-xs font-mono font-black text-amber-400">{(currentUser.walletBalance || 0).toLocaleString()} ETB</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { onNavigate('payments'); setUserDropdownOpen(false); }}
                          className="text-[9px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Top Up</span>
                        </button>
                      </div>

                      {/* Common Links (User only) */}
                      {currentUser.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-[11px] uppercase tracking-wider hover:bg-white/5 text-white/60 hover:text-white transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-white/50" />
                            <span>My Dashboard</span>
                          </button>
                        </>
                      )}

                      {/* Admin Links */}
                      {currentUser.role === 'admin' && (
                        <>
                          <div className="border-t border-white/5 my-1.5"></div>
                          <button
                            onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-wider hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 font-bold transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-amber-500" />
                            <span>{t('admin_dashboard')}</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-white/5 my-1.5"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-[11px] uppercase tracking-wider hover:bg-red-500/15 text-red-400 hover:text-red-300 transition flex items-center gap-2.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400/70" />
                        <span>{t('logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="bg-[#F5F5F4] hover:bg-zinc-200 text-[#050505] px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {t('login')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
