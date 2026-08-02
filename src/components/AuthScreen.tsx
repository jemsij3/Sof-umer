import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Building2, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Compass, RefreshCw, Key, Copy, Check, QrCode, Smartphone, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
}

export default function AuthScreen({ initialMode }: AuthScreenProps) {
  const { setCurrentUser, setToken, t, sessionExpired, setSessionExpired, currentLanguage, systemSettings } = useApp();
  
  // Use 'splash' as default if no initial mode is provided
  const [mode, setMode] = useState<'splash' | 'welcome' | 'login' | 'signup' | 'forgot' | 'verify' | 'reset' | 'twoFactor'>(
    initialMode || 'splash'
  );
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 2FA Authentication states
  const [twoFactorTempToken, setTwoFactorTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isBackupCodeMode, setIsBackupCodeMode] = useState(false);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [adminSetupData, setAdminSetupData] = useState<{ secret: string; qrCodeUrl: string; otpauthUri: string } | null>(null);
  const [showManualSecretKey, setShowManualSecretKey] = useState(false);
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[] | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Security features states
  const [rememberMe, setRememberMe] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Email verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [devVerificationCode, setDevVerificationCode] = useState('');

  // Password reset state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [devResetCode, setDevResetCode] = useState('');

  // Google Account Chooser simulation states
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isUsingCustomGoogle, setIsUsingCustomGoogle] = useState(false);
  
  // Carousel images for welcome slide
  const welcomeImages = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Premium interior
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Business/building
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'  // Professional workforce
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Evaluate password strength score (1 to 5)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'No Password Entered', color: 'bg-white/10', barWidth: 'w-0' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, text: t('weak_password'), color: 'bg-red-500', barWidth: 'w-1/3' };
    if (score <= 4) return { score, text: t('medium_password'), color: 'bg-amber-500', barWidth: 'w-2/3' };
    return { score, text: t('strong_password'), color: 'bg-green-500', barWidth: 'w-full' };
  };

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaId(data.captchaId);
        setCaptchaQuestion(data.question);
        setCaptchaAnswer('');
      }
    } catch (e) {
      console.error('Failed to load CAPTCHA:', e);
    }
  };

  // Auto slide effect
  useEffect(() => {
    if (mode === 'welcome') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % welcomeImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Handle splash screen timer
  useEffect(() => {
    if (mode === 'splash' && !initialMode) {
      const timer = setTimeout(() => {
        setMode('welcome');
      }, 2200);
      return () => clearTimeout(timer);
    } else if (mode === 'splash' && initialMode) {
      setMode(initialMode);
    }
  }, [mode, initialMode]);

  // Parse direct email link parameters (?mode=reset&email=...&code=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const urlEmail = params.get('email');
      const urlCode = params.get('code');

      if (urlMode === 'verify' || urlMode === 'reset') {
        setMode(urlMode);
        if (urlEmail) {
          setEmail(urlEmail);
          setVerifyEmailAddress(urlEmail);
        }
        if (urlCode) {
          if (urlMode === 'verify') setVerificationCode(urlCode);
          if (urlMode === 'reset') setResetCode(urlCode);
        }
      }
    } catch (e) {
      console.warn('Could not parse location search params:', e);
    }
  }, []);

  // Show session expiration warning
  useEffect(() => {
    if (sessionExpired) {
      setError('Your session has expired due to 15 minutes of inactivity. Please sign in again.');
      setMode('login');
    }
  }, [sessionExpired]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('fill_all_fields'));
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, captchaId, captchaAnswer, rememberMe })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'captcha_required') {
          setRequiresCaptcha(true);
          await fetchCaptcha();
          throw new Error(t('captcha_required'));
        }
        if (data.error === 'unverified') {
          setVerifyEmailAddress(data.email || email);
          setDevVerificationCode(data.devVerificationCode || '');
          setMode('verify');
          throw new Error(t('verify_email_first'));
        }
        if (requiresCaptcha) {
          await fetchCaptcha();
        }
        throw new Error(data.error || t('login_failed'));
      }
      
      if (data.requires2FA) {
        setTwoFactorTempToken(data.tempToken);
        setRequires2FASetup(Boolean(data.requires2FASetup));
        setAdminSetupData(data.setupData || null);
        setTwoFactorCode('');
        setIsBackupCodeMode(false);
        setShowManualSecretKey(false);
        setMode('twoFactor');
        if (data.message) {
          setSuccess(data.message);
        } else {
          setSuccess('');
        }
        return;
      }

      // Clear any legacy cached admin items to maintain strict security
      localStorage.removeItem('sof_umer_cached_admin');
      localStorage.removeItem('sof_umer_admin_pass');

      setToken(data.token);
      setCurrentUser(data.user);
      setSessionExpired(false);
    } catch (err: any) {
      setError(err.message || t('server_error_retry'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyTwoFactorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setError(isBackupCodeMode ? 'Please enter a backup recovery code.' : 'Please enter the 6-digit Google Authenticator code.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken: twoFactorTempToken,
          code: twoFactorCode.trim(),
          isBackupCode: isBackupCodeMode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '2FA verification failed.');
      }

      if (data.backupCodes && data.backupCodes.length > 0) {
        setGeneratedBackupCodes(data.backupCodes);
      }

      // Clear any legacy cached admin items
      localStorage.removeItem('sof_umer_cached_admin');
      localStorage.removeItem('sof_umer_admin_pass');

      setToken(data.token);
      setCurrentUser(data.user);
      setSessionExpired(false);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !fullName || !password) {
      setError(t('fill_all_fields'));
      return;
    }

    // Client-side criteria check
    const strength = getPasswordStrength(password);
    if (strength.score < 5) {
      setError(t('password_weak_error'));
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, password, role: 'user' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('registration_failed'));
      }
      
      setVerifyEmailAddress(email);
      setDevVerificationCode(data.devVerificationCode || '');
      setSuccess(t('profile_registered_success'));
      setTimeout(() => {
        setMode('verify');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('server_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError(t('enter_verification_code'));
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmailAddress || email, code: verificationCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('verification_failed'));
      }
      
      setSuccess(t('email_verified_success'));
      setToken(data.token);
      setTimeout(() => {
        setCurrentUser(data.user);
        setSessionExpired(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('invalid_verification_code'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerificationCode = async () => {
    const targetEmail = verifyEmailAddress || email;
    if (!targetEmail) {
      setError(t('enter_registered_email'));
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }
      setDevVerificationCode(data.devVerificationCode || '');
      setSuccess(data.message || 'A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || t('server_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('enter_registered_email'));
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('recovery_code_failed'));
      }
      
      setDevResetCode(data.devResetCode || '');
      setSuccess(t('recovery_code_sent'));
      setTimeout(() => {
        setMode('reset');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('server_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmNewPassword) {
      setError(t('fill_all_fields'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('passwords_dont_match'));
      return;
    }

    const strength = getPasswordStrength(newPassword);
    if (strength.score < 5) {
      setError(t('new_password_weak'));
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('password_reset_failed'));
      }
      
      setSuccess(t('password_reset_success'));
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('server_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setShowGoogleChooser(true);
  };

  const executeGoogleLogin = async (selectedEmail: string, selectedName: string) => {
    setError('');
    setSubmitting(true);
    setShowGoogleChooser(false);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          fullName: selectedName,
          role: 'user'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('google_login_failed'));
      }
      setToken(data.token);
      setCurrentUser(data.user);
      setSessionExpired(false);
    } catch (err: any) {
      setError(err.message || t('google_login_attempt_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center relative overflow-hidden text-[#F5F5F4] font-sans">
      
      {/* Background elegant gradient elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-amber-500/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-amber-600/5 blur-[180px] pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* 1. SPLASH SCREEN */}
        {mode === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center space-y-6 text-center z-10 p-6"
          >
            {systemSettings?.logoUrl ? (
              <img
                src={systemSettings.logoUrl}
                alt="App Logo"
                className="h-20 w-20 object-cover rounded-3xl shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <img
                src={systemSettings?.appIconUrl || systemSettings?.logoUrl || '/favicon.svg'}
                alt="App Logo"
                className="h-20 w-20 object-cover rounded-3xl border border-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.35)]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.svg';
                }}
              />
            )}
            
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-serif text-[#F5F5F4] tracking-wider font-semibold uppercase">
                {systemSettings?.appName || 'SOF-UMER'}
              </h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.3em]">
                {systemSettings?.appLogoText || 'Regional Digital Marketplace'}
              </p>
            </div>

            {/* Sleek Progress Bar */}
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"
              />
            </div>
            
            <p className="text-xs text-white/40 font-mono pt-4">v2.1 Premium Active</p>
          </motion.div>
        )}

        {/* 2. WELCOME SCREEN */}
        {mode === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen flex flex-col md:flex-row relative"
          >
            {/* Visual Slideshow Side (Visible on desktop, beautiful top on mobile) */}
            <div className="md:w-1/2 relative h-[300px] md:h-auto overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={systemSettings?.heroImageUrl || currentSlide}
                  src={systemSettings?.heroImageUrl || welcomeImages[currentSlide]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#060608] via-transparent to-transparent md:from-[#060608]/90 md:via-[#060608]/40" />
              
              {/* Brand Floating on visual side */}
              <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                <img
                  src={systemSettings?.logoUrl || systemSettings?.appIconUrl || '/favicon.svg'}
                  alt="Logo"
                  className="w-10 h-10 object-cover rounded-xl border border-amber-500/30 shadow-lg bg-[#0d0d12]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
                <span className="text-xl font-serif text-white font-bold tracking-wider uppercase">
                  {systemSettings?.appName || 'SOF-UMER'}
                </span>
              </div>

              {/* Taglines inside image */}
              <div className="absolute bottom-12 left-8 md:left-12 z-20 max-w-md hidden md:block">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-semibold mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{systemSettings?.appName || 'SOF-UMER'} Marketplace</span>
                </div>
                <h2 className="text-3xl font-serif text-white font-normal leading-snug">
                  {systemSettings?.heroTitle || 'The Smart Way to Discover, Connect & Grow'}
                </h2>
              </div>
            </div>

            {/* Actions Side */}
            <div className="md:w-1/2 flex flex-col justify-center px-6 py-12 md:p-16 lg:p-24 z-10 bg-[#060608]">
              <div className="max-w-md w-full mx-auto space-y-10">
                
                {/* Mobile-only header block */}
                <div className="md:hidden text-center space-y-2 flex flex-col items-center">
                  {systemSettings?.logoUrl && (
                    <img
                      src={systemSettings.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-cover rounded-xl mb-1"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h1 className="text-3xl font-serif text-white font-bold uppercase">{systemSettings?.appName || 'SOF-UMER'}</h1>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">{systemSettings?.appLogoText || t('auth_regional_gateway')}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-serif font-semibold text-white tracking-tight leading-tight">
                    {systemSettings?.heroTitle || 'The Smart Way to Discover, Connect & Grow'}
                  </h3>
                  <p className="text-sm md:text-base text-white/50 leading-relaxed font-light">
                    {systemSettings?.heroDescription || 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.'}
                  </p>
                </div>

                {/* Features Highlights Bento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <p className="font-bold text-xs text-white uppercase tracking-wider">{t('auth_verified_listings_title')}</p>
                    <p className="text-[11px] text-white/40">{t('auth_verified_listings_desc')}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <p className="font-bold text-xs text-white uppercase tracking-wider">{t('auth_secure_payment_title')}</p>
                    <p className="text-[11px] text-white/40">{t('auth_secure_payment_desc')}</p>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => setMode('login')}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-sm uppercase tracking-wider font-bold">{t('auth_sign_in_header')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => setMode('signup')}
                    className="w-full bg-[#121216] hover:bg-[#181820] text-white font-medium py-4 px-6 rounded-2xl border border-white/10 transition-all duration-300 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm">{t('auth_create_profile_header')}</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest">{t('auth_register_label')}</span>
                  </button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{t('auth_ecosystem_footer')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. AUTH FORMS */}
        {mode !== 'splash' && mode !== 'welcome' && (
          <motion.div 
            key="auth-forms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full space-y-8 bg-[#0d0d12]/90 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.18)] relative z-10 m-4"
          >
            {/* Header */}
            <div className="text-center relative">
              <button 
                onClick={() => setMode('welcome')}
                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="mx-auto h-16 w-16 p-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center">
                <img
                  src={systemSettings?.logoUrl || systemSettings?.appIconUrl || '/favicon.svg'}
                  alt={systemSettings?.appName || 'SOF-UMER Logo'}
                  className="w-full h-full object-cover rounded-xl bg-[#0d0d12]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.svg';
                  }}
                />
              </div>
              
              <h2 className="mt-6 text-2xl md:text-3xl font-serif text-[#F5F5F4] tracking-tight font-semibold">
                {mode === 'login' 
                  ? t('login_title') 
                  : mode === 'signup' 
                    ? t('auth_create_account_title') 
                    : mode === 'verify' 
                      ? t('auth_verify_email_title') 
                      : mode === 'reset' 
                        ? t('auth_set_new_password_title') 
                        : t('reset_password_title')}
              </h2>
              <p className="mt-2 text-xs md:text-sm text-[#F5F5F4]/50 font-light">
                {mode === 'login' 
                  ? t('login_subtitle') 
                  : mode === 'signup' 
                    ? t('auth_join_desc') 
                    : mode === 'verify'
                      ? t('auth_secure_code_desc')
                      : mode === 'reset'
                        ? t('auth_strong_password_desc')
                        : t('reset_password_desc')}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-200 text-xs p-4 rounded-xl text-center font-medium"
              >
                {success}
              </motion.div>
            )}

            {/* Login Mode */}
            {mode === 'login' && (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition focus:border-amber-500/50"
                        placeholder="name@domain.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest">{t('password')}</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-medium text-amber-500 hover:text-amber-400 transition"
                      >
                        {t('forgot_password')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-[#F5F5F4]/40 hover:text-[#F5F5F4]/70 transition"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* CAPTCHA Protection */}
                  {requiresCaptcha && (
                    <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-amber-500 uppercase tracking-wider">Security CAPTCHA Check</label>
                        <button type="button" onClick={fetchCaptcha} className="text-[10px] text-white/50 hover:text-amber-500 flex items-center gap-1 transition">
                          <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                      </div>
                      <p className="text-sm font-medium text-white mb-2">{captchaQuestion || 'Loading security challenge...'}</p>
                      <input
                        type="text"
                        required
                        value={captchaAnswer}
                        onChange={e => setCaptchaAnswer(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#121216] border border-white/5 rounded-xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="Enter the math answer"
                      />
                    </div>
                  )}

                  {/* Remember Me checkbox */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#121216] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2.5 block text-xs font-medium text-[#F5F5F4]/70 cursor-pointer selection:bg-transparent">
                      {t('auth_remember_me')}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-4 px-4 rounded-2xl shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
                >
                  {submitting ? t('auth_authenticating') : t('login')}
                </button>
              </form>
            )}

            {/* Register Mode */}
            {mode === 'signup' && (
              <form className="space-y-5" onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('full_name')}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="First Last"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="name@domain.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-[#F5F5F4]/40 hover:text-[#F5F5F4]/70 transition"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1.5 pt-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/40">{t('auth_password_strength')}</span>
                          <span className="font-semibold text-[#F5F5F4]/80">{getPasswordStrength(password).text}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${getPasswordStrength(password).color} ${getPasswordStrength(password).barWidth} transition-all duration-300`} />
                        </div>
                        <p className="text-[10px] text-white/30 leading-normal">
                          {t('auth_password_requirements')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-4 px-4 rounded-2xl shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
                >
                  {submitting ? t('auth_creating_profile') : t('signup')}
                </button>
              </form>
            )}

            {/* Email Verification Mode */}
            {mode === 'verify' && (
              <form className="space-y-5" onSubmit={handleVerifyEmail}>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs rounded-2xl leading-relaxed">
                    {t('auth_verification_email_sent_prefix')}
                    <span className="font-bold text-white">{verifyEmailAddress || email}</span>
                    {t('auth_verification_email_sent_suffix')}
                  </div>

                  {devVerificationCode && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">{t('auth_dev_code_title')}</p>
                      <p className="text-xl font-mono font-bold text-white tracking-widest text-center bg-[#07070a] py-2 rounded-xl border border-white/5">{devVerificationCode}</p>
                      <p className="text-[9px] text-blue-400 mt-1 text-center">{t('auth_dev_code_desc')}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('auth_verification_code_label')}</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-base tracking-[0.5em] text-center font-mono focus:outline-none transition font-bold"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-4 px-4 rounded-2xl shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
                >
                  {submitting ? t('auth_activating_account') : t('auth_verify_activate_btn')}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendVerificationCode}
                    disabled={submitting}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium transition cursor-pointer"
                  >
                    Didn't receive code? Resend verification email
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password Mode */}
            {mode === 'forgot' && (
              <form className="space-y-5" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('auth_registered_email_address')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                      placeholder="name@domain.com"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 px-4 rounded-2xl border border-white/10 text-center transition cursor-pointer text-sm uppercase tracking-wider"
                  >
                    {t('auth_cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-3.5 px-4 rounded-2xl shadow-xl text-center transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
                  >
                    {submitting ? t('auth_generating_code') : t('send_reset_code')}
                  </button>
                </div>
              </form>
            )}

            {/* Set New Password Mode */}
            {mode === 'reset' && (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  {devResetCode && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                      <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">{t('auth_dev_reset_code_title')}</p>
                      <p className="text-xl font-mono font-bold text-white tracking-widest text-center bg-[#07070a] py-2 rounded-xl border border-white/5">{devResetCode}</p>
                      <p className="text-[9px] text-blue-400 mt-1 text-center">{t('auth_dev_reset_code_desc')}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-[#F5F5F4]/60 font-semibold uppercase tracking-widest mb-2">{t('auth_reset_code_label')}</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-base tracking-[0.5em] text-center font-mono focus:outline-none transition font-bold"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('new_password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-[#F5F5F4]/40 hover:text-[#F5F5F4]/70 transition"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {newPassword && (
                      <div className="space-y-1.5 pt-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/40">Strength:</span>
                          <span className="font-semibold text-[#F5F5F4]/80">{getPasswordStrength(newPassword).text}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full ${getPasswordStrength(newPassword).color} ${getPasswordStrength(newPassword).barWidth} transition-all duration-300`} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F4]/60 uppercase tracking-widest mb-2">{t('confirm_new_password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-[#121216] border border-white/5 rounded-2xl text-[#F5F5F4] placeholder-white/20 text-sm focus:outline-none transition"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 px-4 rounded-2xl border border-white/10 text-center transition cursor-pointer text-sm uppercase tracking-wider"
                  >
                    {t('auth_cancel_btn')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-3.5 px-4 rounded-2xl shadow-xl text-center transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50"
                  >
                    {submitting ? t('auth_saving_btn') : t('auth_reset_password_btn')}
                  </button>
                </div>
              </form>
            )}

            {/* Two-Factor Authentication (2FA) Verification Mode */}
            {mode === 'twoFactor' && (
              <form className="space-y-5" onSubmit={handleVerifyTwoFactorLogin}>
                {requires2FASetup && adminSetupData ? (
                  /* Admin Mandatory 2FA Initial Setup Flow */
                  <div className="space-y-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Mandatory 2FA Setup Required</span>
                    </div>
                    <p className="text-xs text-white/70">
                      All administrator and staff accounts must enable Google Authenticator 2FA before accessing Sof Umer system tools.
                    </p>

                    {!showManualSecretKey ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-xl flex items-center justify-center max-w-[200px] mx-auto border border-amber-500/30">
                          <img src={adminSetupData.qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain" />
                        </div>
                        <p className="text-center text-[11px] text-white/60">
                          Scan this QR code using the <strong className="text-white">Google Authenticator</strong> app on your smartphone.
                        </p>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setShowManualSecretKey(true)}
                            className="text-xs text-amber-500 hover:underline font-semibold cursor-pointer"
                          >
                            Can't scan QR code? View Manual Setup Key
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 bg-black/60 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-amber-500 font-bold uppercase">Manual Setup Key</span>
                          <button
                            type="button"
                            onClick={() => setShowManualSecretKey(false)}
                            className="text-white/50 hover:text-white"
                          >
                            Show QR Code
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-amber-400 font-mono text-xs tracking-wider flex-1 break-all">
                            {adminSetupData.secret}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(adminSetupData.secret);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1"
                          >
                            {copiedKey ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          Open Google Authenticator → Tap (+) → Enter setup key → Account: Sof Umer ({email}) → Paste key.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Verification Code Input */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-widest">
                        {isBackupCodeMode ? 'Backup Recovery Code' : 'Google Authenticator 6-Digit Code'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBackupCodeMode(!isBackupCodeMode);
                          setTwoFactorCode('');
                          setError('');
                        }}
                        className="text-xs text-amber-500 hover:text-amber-400 font-medium transition cursor-pointer"
                      >
                        {isBackupCodeMode ? 'Use Google Authenticator' : 'Use Backup Code'}
                      </button>
                    </div>

                    <div className="relative">
                      {isBackupCodeMode ? (
                        <Key className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      ) : (
                        <Smartphone className="absolute left-4 top-4 w-4 h-4 text-[#F5F5F4]/30" />
                      )}
                      
                      <input
                        type="text"
                        required
                        autoFocus
                        maxLength={isBackupCodeMode ? 10 : 6}
                        value={twoFactorCode}
                        onChange={e => {
                          const val = isBackupCodeMode ? e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') : e.target.value.replace(/\D/g, '');
                          setTwoFactorCode(val);
                        }}
                        className="w-full pl-12 pr-4 py-3.5 bg-[#121216] border border-amber-500/30 rounded-2xl text-amber-400 font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:border-amber-500 font-bold"
                        placeholder={isBackupCodeMode ? 'A1B2C3D4' : '123456'}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-white/50 text-center font-light">
                    {isBackupCodeMode 
                      ? 'Enter one of your 8-character single-use recovery backup codes.' 
                      : 'Open the Google Authenticator app on your smartphone to view your current 6-digit verification code.'}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setTwoFactorCode('');
                      setTwoFactorTempToken('');
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3.5 px-4 rounded-2xl border border-white/10 text-center transition cursor-pointer text-sm uppercase tracking-wider"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-3.5 px-4 rounded-2xl shadow-xl text-center transition cursor-pointer text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify & Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* Google SignIn Option */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-[#121216] hover:bg-[#181820] text-white font-medium py-3.5 px-4 rounded-2xl shadow border border-white/5 flex items-center justify-center gap-3 transition cursor-pointer text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}

            {/* Bottom Toggle links */}
            <div className="text-center text-xs md:text-sm text-[#F5F5F4]/40 mt-6">
              {mode === 'login' ? (
                <>
                  {t('auth_dont_have_account')}{' '}
                  <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="font-semibold text-amber-500 hover:text-amber-400 transition">
                    {t('auth_create_one')}
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  {t('auth_already_have_account')}{' '}
                  <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="font-semibold text-[#F5F5F4] hover:text-amber-400 transition">
                    {t('auth_sign_in_link')}
                  </button>
                </>
              ) : (
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="font-semibold text-amber-500 hover:text-amber-400 transition flex items-center gap-1.5 mx-auto text-xs uppercase tracking-wider">
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('auth_back_to_sign_in')}
                </button>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Simulated Google Account Chooser Modal */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121216] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              <div className="flex flex-col items-center text-center space-y-4 pb-4">
                {/* Google Logo Icon */}
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-white">Choose an account</h3>
                  <p className="text-xs text-white/50">to continue to <span className="font-semibold text-amber-500">SOF-UMER</span></p>
                </div>
              </div>

              {!isUsingCustomGoogle ? (
                <div className="space-y-3 my-4">
                  {/* Account options */}
                  
                  {/* Option 1: If user typed their email, show it first */}
                  {email && email.includes('@') && (
                    <button
                      type="button"
                      onClick={() => executeGoogleLogin(email, fullName || email.split('@')[0])}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-bold uppercase">
                          {(fullName || email)[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{fullName || email.split('@')[0]}</p>
                          <p className="text-xs text-white/40">{email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Entered Email</span>
                    </button>
                  )}

                  {/* Option 2: jemaljima@gmail.com */}
                  <button
                    type="button"
                    onClick={() => executeGoogleLogin('jemaljima@gmail.com', 'Jemal jimma')}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold uppercase">
                      J
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Jemal jimma</p>
                      <p className="text-xs text-white/40">jemaljima@gmail.com</p>
                    </div>
                  </button>

                  {/* Option 4: Use another account */}
                  <button
                    type="button"
                    onClick={() => setIsUsingCustomGoogle(true)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-dashed border-white/10 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-lg font-light">
                      +
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Use another account</p>
                      <p className="text-xs text-white/30">Enter your Google account email address</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 my-4 text-left">
                  <div>
                    <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Google Email</label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={e => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0d0d12] border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-500 transition"
                      placeholder="e.g. jemaljima@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={e => setCustomGoogleName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0d0d12] border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-500 transition"
                      placeholder="e.g. Jemal jimma"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUsingCustomGoogle(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-xl text-sm transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customGoogleEmail) {
                          executeGoogleLogin(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0]);
                        }
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-xl text-sm transition cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[11px] text-white/30">
                <span>Simulated Google Authentication</span>
                <button 
                  type="button"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    setIsUsingCustomGoogle(false);
                  }}
                  className="text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
