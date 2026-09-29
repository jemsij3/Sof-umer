import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { useApp } from '../lib/AppContext';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t, systemSettings } = useApp();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('sof_umer_pwa_dismissed') === 'true';
    if (isDismissed) setDismissed(true);
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  // Only show banner if browser triggers installable event or on mobile iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('sof_umer_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await install();
    }
  };

  const appIcon = systemSettings?.logoUrl || '/pwa-192x192.png';

  return (
    <>
      {/* Bottom Floating Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-[#0f0f16]/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={appIcon}
              alt="SOF-UMER"
              className="w-11 h-11 rounded-xl object-cover border border-amber-500/40 shadow-md flex-shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold font-serif text-white tracking-wide truncate">
                {systemSettings?.appName || 'SOF-UMER'}
              </h4>
              <p className="text-[10px] text-white/60 line-clamp-1">
                {t('pwa_install_desc') || 'Install app for faster browsing & instant access.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('pwa_install_app') || 'Install'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Guided Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f0f16] border border-amber-500/30 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {t('pwa_ios_title') || 'Install on iPhone / iPad'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-white/80 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  {t('pwa_ios_instructions') || 'Tap the Share icon in Safari toolbar at the bottom of your screen.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Scroll down the menu and tap <strong className="text-amber-400 font-semibold">&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Tap <strong className="text-amber-400 font-semibold">&ldquo;Add&rdquo;</strong> in the top right to complete installation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-2 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {t('pwa_ios_close') || 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useApp();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await install();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 text-xs font-semibold tracking-wide transition cursor-pointer"
        title={t('pwa_install_app') || 'Install App'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t('pwa_install_app') || 'Install App'}</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f0f16] border border-amber-500/30 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {t('pwa_ios_title') || 'Install on iPhone / iPad'}
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="py-4 text-xs text-white/80 leading-relaxed">
              {t('pwa_ios_instructions') || "Tap Safari's Share button, then choose 'Add to Home Screen'."}
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-2.5 text-xs font-bold transition cursor-pointer"
            >
              {t('pwa_ios_close') || 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
