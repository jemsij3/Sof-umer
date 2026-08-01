import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PwaInstallBanner() {
  const { isAppInstalled, promptPwaInstall, systemSettings } = useApp();
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    // If installed, never show
    if (isAppInstalled) {
      setDismissed(true);
      return;
    }

    // Check localStorage for dismissal memory
    const storedDismissal = localStorage.getItem('sof_umer_pwa_banner_dismissed');
    if (!storedDismissal) {
      // Delay prompt slightly so it's not jarring immediately on load
      const timer = setTimeout(() => {
        setDismissed(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAppInstalled]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('sof_umer_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    await promptPwaInstall();
    setDismissed(true);
  };

  if (isAppInstalled || dismissed) return null;

  const logoMark = systemSettings?.pwaIconUrl || systemSettings?.appIconUrl || systemSettings?.logoUrl;
  const appTitle = systemSettings?.appName || 'SOF-UMER';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-[#12121a]/95 backdrop-blur-xl border border-amber-500/30 p-4 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {logoMark ? (
              <img
                src={logoMark}
                alt={appTitle}
                className="w-11 h-11 object-cover rounded-xl border border-amber-500/40 shrink-0 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
            )}

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-wide truncate">
                  Install {appTitle} App
                </h4>
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full uppercase">
                  <Sparkles className="w-2.5 h-2.5" /> PWA
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-snug truncate">
                Install {appTitle} App for a faster and better experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Dismiss reminder"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
