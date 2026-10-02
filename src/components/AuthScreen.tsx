import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Key,
  Copy,
  Check,
  Smartphone,
  Globe,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AuthScreen({ initialMode = 'login', onClose, onSuccess }: AuthScreenProps) {
  const {
    setCurrentUser,
    setToken,
    t,
    sessionExpired,
    setSessionExpired,
    currentLanguage,
    setLanguage,
    systemSettings
  } = useApp();

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Active authentication mode
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify' | 'reset' | 'twoFactor'>(
    initialMode || 'login'
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

  // Sync mode if initialMode changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

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

      if (onSuccess) onSuccess();
      else if (onClose) onClose();
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

      // Clear any legacy cached admin items
      localStorage.removeItem('sof_umer_cached_admin');
      localStorage.removeItem('sof_umer_admin_pass');

      setToken(data.token);
      setCurrentUser(data.user);
      setSessionExpired(false);

      if (onSuccess) onSuccess();
      else if (onClose) onClose();
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
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim(), password, role: 'user' })
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
      }, 1500);
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
        body: JSON.stringify({ email: verifyEmailAddress || email, code: verificationCode.trim() })
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
        if (onSuccess) onSuccess();
        else if (onClose) onClose();
      }, 1200);
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
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('password_reset_request_failed'));
      }

      setDevResetCode(data.devResetCode || '');
      setSuccess(t('password_reset_code_sent'));
      setTimeout(() => {
        setMode('reset');
        setSuccess('');
      }, 1500);
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
      setError(t('password_weak_error'));
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: resetCode.trim(), newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('password_reset_failed'));
      }

      setSuccess(t('password_reset_successful'));
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setPassword('');
        setResetCode('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('server_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    setSuccess('');
    setShowGoogleChooser(true);
  };

  const executeGoogleLogin = async (selectedEmail: string, selectedName: string) => {
    setShowGoogleChooser(false);
    setError('');
    setSuccess('');
    setSubmitting(true);

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

      if (onSuccess) onSuccess();
      else if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || t('google_login_attempt_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full relative text-[#F5F5F4] font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-md mx-auto bg-[#0d0d14] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left overflow-hidden"
        >
          {/* Subtle warm gold ambient glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Navigation Row: Back / Language Pill / Close */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div>
              {mode !== 'login' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-amber-400 transition cursor-pointer p-1.5 -ml-1 rounded-lg hover:bg-white/5"
                  title={t('auth_back_to_sign_in') || 'Back to Sign In'}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{t('auth_back_to_sign_in') || 'Sign In'}</span>
                </button>
              ) : onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition cursor-pointer p-1.5 -ml-1 rounded-lg hover:bg-white/5"
                  title={t('back') || 'Back'}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">{t('back') || 'Back'}</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-semibold text-white/80 transition cursor-pointer"
                  title="Switch Language"
                >
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span className="uppercase tracking-wider">{currentLanguage}</span>
                  <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-[#14141e] border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden z-50 py-1 backdrop-blur-xl">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'om', label: 'Afaan Oromoo' },
                      { code: 'am', label: 'አማርኛ' }
                    ].map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition flex items-center justify-between cursor-pointer ${
                          currentLanguage === l.code ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{l.label}</span>
                        {currentLanguage === l.code && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Centered Brand Badge & Unified Header */}
          <div className="text-center relative z-10 mb-6">
            <div className="w-14 h-14 p-1 bg-gradient-to-tr from-amber-500/30 to-amber-600/15 border border-amber-500/40 rounded-2xl shadow-xl shadow-amber-500/15 mx-auto mb-3.5 flex items-center justify-center">
              <img
                src={systemSettings?.logoUrl || systemSettings?.appIconUrl || '/favicon.svg'}
                alt={systemSettings?.appName || 'SOF-UMER'}
                className="w-full h-full object-cover rounded-xl bg-[#0c0c12]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.svg';
                }}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-bold">
              {mode === 'login'
                ? (t('login_title') || 'Welcome to Sof Umer')
                : mode === 'signup'
                  ? (t('auth_create_account_title') || 'Create your Account')
                  : mode === 'verify'
                    ? (t('auth_verify_email_title') || 'Verify Your Email')
                    : mode === 'reset'
                      ? (t('auth_set_new_password_title') || 'Set New Password')
                      : mode === 'twoFactor'
                        ? 'Two-Factor Authentication'
                        : (t('reset_password_title') || 'Reset Password')}
            </h2>

            <p className="mt-1.5 text-xs text-white/50 font-light max-w-sm mx-auto">
              {mode === 'login'
                ? (t('login_subtitle') || 'Buy, sell, rent, hire, and connect with confidence through verified listings, trusted businesses, and secure services—all in one modern marketplace.')
                : mode === 'signup'
                  ? (t('auth_join_desc') || 'Join SOF-UMER regional digital marketplace.')
                  : mode === 'verify'
                    ? (t('auth_secure_code_desc') || 'Enter verification code.')
                    : mode === 'reset'
                      ? (t('auth_strong_password_desc') || 'Enter your new secure password.')
                      : (t('reset_password_desc') || 'Enter your email to receive recovery instructions.')}
            </p>

            {/* Integrated Welcome Bullets (from Screen 1) */}
            {mode === 'signup' && (
              <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-3 pt-3 border-t border-white/5 text-[11px] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{t('perk_post_free') || 'Post listings for free'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{t('perk_direct_chat') || 'Chat directly with sellers'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{t('perk_sync_favorites') || 'Sync your favorites'}</span>
                </span>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3.5 rounded-xl text-center font-medium relative z-10"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-green-500/10 border border-green-500/20 text-green-200 text-xs p-3.5 rounded-xl text-center font-medium relative z-10"
            >
              {success}
            </motion.div>
          )}

          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form className="space-y-4 relative z-10" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('email') || 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider">
                    {t('password') || 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition cursor-pointer"
                  >
                    {t('forgot_password') || 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA Protection */}
              {requiresCaptcha && (
                <div className="space-y-2 p-3.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      {t('security_captcha_check')}
                    </label>
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="text-[11px] text-white/50 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> {t('refresh')}
                    </button>
                  </div>
                  <p className="text-sm font-medium text-white mb-2">{captchaQuestion || t('loading_security_challenge')}</p>
                  <input
                    type="text"
                    required
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#121218] border border-white/10 rounded-lg text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-500 transition"
                    placeholder={t('enter_math_answer')}
                  />
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#121218] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer accent-amber-500"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-xs font-medium text-white/70 cursor-pointer select-none">
                  {t('auth_remember_me') || 'Remember me on this device'}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider mt-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('auth_authenticating') || 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{t('login') || 'LOGIN'}</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="grow border-t border-white/10" />
                <span className="shrink-0 px-3 text-[11px] uppercase tracking-widest text-white/35 font-medium">or</span>
                <div className="grow border-t border-white/10" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full bg-[#14141e] hover:bg-[#1a1a28] text-white font-medium py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition cursor-pointer text-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {/* Switch to Register */}
              <div className="text-center text-xs text-white/50 pt-3">
                {t('dont_have_account') || "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccess('');
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 ml-1 transition underline cursor-pointer"
                >
                  {t('register_now') || t('auth_register_label') || 'Register'}
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGNUP MODE */}
          {mode === 'signup' && (
            <form className="space-y-4 relative z-10" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('full_name') || 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('email') || 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('password') || 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/40">{t('auth_password_strength')}</span>
                      <span className="font-semibold text-white/80">{getPasswordStrength(password).text}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrength(password).color} ${getPasswordStrength(password).barWidth} transition-all duration-300`}
                      />
                    </div>
                    <p className="text-[10px] text-white/40 leading-normal">
                      {t('auth_password_requirements')}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider mt-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('auth_creating_profile') || 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{t('signup') || 'CREATE ACCOUNT'}</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="grow border-t border-white/10" />
                <span className="shrink-0 px-3 text-[11px] uppercase tracking-widest text-white/35 font-medium">or</span>
                <div className="grow border-t border-white/10" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full bg-[#14141e] hover:bg-[#1a1a28] text-white font-medium py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition cursor-pointer text-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

              {/* Switch to Login */}
              <div className="text-center text-xs text-white/50 pt-3">
                {t('already_have_account') || 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 ml-1 transition underline cursor-pointer"
                >
                  {t('login') || t('auth_sign_in_link') || 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* 3. EMAIL VERIFICATION MODE */}
          {mode === 'verify' && (
            <form className="space-y-4 relative z-10" onSubmit={handleVerifyEmail}>
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs rounded-xl leading-relaxed">
                {t('auth_verification_email_sent_prefix')}
                <span className="font-bold text-white mx-1">{verifyEmailAddress || email}</span>
                {t('auth_verification_email_sent_suffix')}
              </div>

              {devVerificationCode && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">{t('auth_dev_code_title')}</p>
                  <p className="text-xl font-mono font-bold text-white tracking-widest text-center bg-[#07070a] py-2 rounded-lg border border-white/5">
                    {devVerificationCode}
                  </p>
                  <p className="text-[9px] text-blue-400 mt-1 text-center">{t('auth_dev_code_desc')}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('auth_verification_code_label')}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/20 text-base tracking-[0.4em] text-center font-mono focus:outline-none focus:border-amber-500 transition font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
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

          {/* 4. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form className="space-y-4 relative z-10" onSubmit={handleForgotPassword}>
              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('auth_registered_email_address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 transition"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl border border-white/10 text-center transition cursor-pointer text-xs uppercase tracking-wider"
                >
                  {t('auth_cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-center transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? t('auth_generating_code') : t('send_reset_code')}
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD MODE */}
          {mode === 'reset' && (
            <form className="space-y-4 relative z-10" onSubmit={handleResetPassword}>
              {devResetCode && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">{t('auth_dev_reset_code_title')}</p>
                  <p className="text-xl font-mono font-bold text-white tracking-widest text-center bg-[#07070a] py-2 rounded-lg border border-white/5">
                    {devResetCode}
                  </p>
                  <p className="text-[9px] text-blue-400 mt-1 text-center">{t('auth_dev_reset_code_desc')}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('auth_reset_code_label')}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/20 text-base tracking-[0.4em] text-center font-mono focus:outline-none focus:border-amber-500 transition font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="space-y-1.5 pt-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/40">Strength:</span>
                      <span className="font-semibold text-white/80">{getPasswordStrength(newPassword).text}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrength(newPassword).color} ${getPasswordStrength(newPassword).barWidth} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider mb-2">
                  {t('confirm_new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-[#121218] border border-white/10 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-amber-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl border border-white/10 text-center transition cursor-pointer text-xs uppercase tracking-wider"
                >
                  {t('auth_cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-center transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? t('auth_saving_btn') : t('auth_reset_password_btn')}
                </button>
              </div>
            </form>
          )}

          {/* 6. TWO-FACTOR AUTHENTICATION (2FA) MODE */}
          {mode === 'twoFactor' && (
            <form className="space-y-4 relative z-10" onSubmit={handleVerifyTwoFactorLogin}>
              {requires2FASetup && adminSetupData ? (
                <div className="space-y-3.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('admin_2fa_required')}</span>
                  </div>
                  <p className="text-xs text-white/70">
                    {t('admin_2fa_desc')}
                  </p>

                  {!showManualSecretKey ? (
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-white rounded-xl flex items-center justify-center max-w-[180px] mx-auto border border-amber-500/30">
                        <img src={adminSetupData.qrCodeUrl} alt="2FA QR Code" className="w-36 h-36 object-contain" />
                      </div>
                      <p className="text-center text-[11px] text-white/60">
                        {t('scan_qr_code_desc')}
                      </p>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowManualSecretKey(true)}
                          className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          {t('cant_scan_qr_view_key')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 p-3 bg-black/60 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-amber-400 font-bold uppercase">{t('manual_setup_key')}</span>
                        <button
                          type="button"
                          onClick={() => setShowManualSecretKey(false)}
                          className="text-white/50 hover:text-white"
                        >
                          {t('show_qr_code')}
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
                          <span>{copiedKey ? t('copied') : t('copy')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-[#F5F5F4]/70 uppercase tracking-wider">
                    {isBackupCodeMode ? 'Backup Recovery Code' : 'Google Authenticator Code'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBackupCodeMode(!isBackupCodeMode);
                      setTwoFactorCode('');
                      setError('');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
                  >
                    {isBackupCodeMode ? 'Use Authenticator' : 'Use Backup Code'}
                  </button>
                </div>

                <div className="relative">
                  {isBackupCodeMode ? (
                    <Key className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  ) : (
                    <Smartphone className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
                  )}

                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={isBackupCodeMode ? 10 : 6}
                    value={twoFactorCode}
                    onChange={e => {
                      const val = isBackupCodeMode
                        ? e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                        : e.target.value.replace(/\D/g, '');
                      setTwoFactorCode(val);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-[#121218] border border-amber-500/40 rounded-xl text-amber-400 font-mono text-xl tracking-[0.4em] text-center focus:outline-none focus:border-amber-500 font-bold"
                    placeholder={isBackupCodeMode ? 'A1B2C3D4' : '123456'}
                  />
                </div>

                <p className="text-xs text-white/50 text-center font-light mt-2">
                  {isBackupCodeMode
                    ? 'Enter one of your 8-character single-use recovery backup codes.'
                    : 'Open your Google Authenticator app to view your 6-digit code.'}
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
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl border border-white/10 text-center transition cursor-pointer text-xs uppercase tracking-wider"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-center transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify & Sign In</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Simulated Google Account Chooser Modal */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121216] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden relative"
            >
              <div className="flex flex-col items-center text-center space-y-3 pb-4">
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
                  <h3 className="text-lg font-semibold text-white">{t('choose_an_account')}</h3>
                  <p className="text-xs text-white/50">
                    {t('to_continue_to')}{' '}
                    <span className="font-semibold text-amber-500">{systemSettings?.appName || 'SOF-UMER'}</span>
                  </p>
                </div>
              </div>

              {!isUsingCustomGoogle ? (
                <div className="space-y-2 py-2">
                  <button
                    type="button"
                    onClick={() => executeGoogleLogin('admin@sofumer.com', 'Administrator')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">Administrator</p>
                      <p className="text-xs text-white/40 truncate">admin@sofumer.com</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeGoogleLogin('mohammed.seller@gmail.com', 'Mohammed Kebede')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                      M
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">Mohammed Kebede</p>
                      <p className="text-xs text-white/40 truncate">mohammed.seller@gmail.com</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeGoogleLogin('fatima.user@gmail.com', 'Fatima Zahra')}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/5 hover:bg-white/5 transition text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      F
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-amber-400 transition">Fatima Zahra</p>
                      <p className="text-xs text-white/40 truncate">fatima.user@gmail.com</p>
                    </div>
                  </button>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUsingCustomGoogle(true)}
                      className="w-full text-center py-2.5 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                    >
                      {t('use_another_google_account')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">{t('full_name')}</label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={e => setCustomGoogleName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0a0a0d] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="e.g., Alex Johnson"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">{t('google_email_address')}</label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={e => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0a0a0d] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="e.g., alex@gmail.com"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUsingCustomGoogle(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2 rounded-xl text-sm transition cursor-pointer"
                    >
                      {t('back')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customGoogleEmail && customGoogleName) {
                          executeGoogleLogin(customGoogleEmail, customGoogleName);
                        }
                      }}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-xl text-sm transition cursor-pointer"
                    >
                      {t('sign_in')}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[11px] text-white/30">
                <span>{t('simulated_google_auth')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    setIsUsingCustomGoogle(false);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
