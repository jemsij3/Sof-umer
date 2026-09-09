import React, { useState } from 'react';
import { User } from '../types';
import { 
  ShieldCheck, ShieldAlert, QrCode, Key, Copy, Check, Download, RefreshCw, 
  Lock, AlertTriangle, Smartphone, Eye, EyeOff, Shield, Clock, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/AppContext';

interface TwoFactorSecurityModuleProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
  isAdminContext?: boolean;
}

export function TwoFactorSecurityModule({ currentUser, onUserUpdated, isAdminContext = false }: TwoFactorSecurityModuleProps) {
  const { t } = useApp();
  // Setup States
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupSecret, setSetupSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [showManualKey, setShowManualKey] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Backup Codes States
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[] | null>(null);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  // Disable 2FA States
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableSubmitting, setDisableSubmitting] = useState(false);

  // Regenerate Backup Codes States
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');
  const [regenCode, setRegenCode] = useState('');
  const [regenError, setRegenError] = useState('');
  const [regenSubmitting, setRegenSubmitting] = useState(false);

  const token = localStorage.getItem('sof_umer_token') || '';

  // Start 2FA Setup Flow
  const handleStartSetup = async () => {
    setSetupError('');
    setSetupSubmitting(true);
    try {
      const res = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize 2FA setup.');
      }
      setSetupSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setOtpauthUri(data.otpauthUri);
      setIsSetupOpen(true);
      setShowManualKey(false);
      setVerificationCode('');
    } catch (err: any) {
      setSetupError(err.message || 'Could not start 2FA setup.');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Enable 2FA by verifying 6-digit code
  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setSetupError('Please enter the 6-digit Google Authenticator code.');
      return;
    }
    setSetupError('');
    setSetupSubmitting(true);

    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: verificationCode.trim(),
          secret: setupSecret
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '2FA activation failed.');
      }

      onUserUpdated(data.user);
      if (data.backupCodes && data.backupCodes.length > 0) {
        setGeneratedBackupCodes(data.backupCodes);
      }
      setIsSetupOpen(false);
    } catch (err: any) {
      setSetupError(err.message || 'Failed to activate 2FA.');
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError('Account password is required to disable 2FA.');
      return;
    }
    setDisableError('');
    setDisableSubmitting(true);

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: disablePassword,
          code: disableCode.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to disable 2FA.');
      }

      onUserUpdated(data.user);
      setIsDisableOpen(false);
      setDisablePassword('');
      setDisableCode('');
    } catch (err: any) {
      setDisableError(err.message || 'Could not disable 2FA.');
    } finally {
      setDisableSubmitting(false);
    }
  };

  // Regenerate Backup Codes
  const handleRegenerateBackupCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regenPassword || !regenCode) {
      setRegenError('Both password and current 2FA code are required.');
      return;
    }
    setRegenError('');
    setRegenSubmitting(true);

    try {
      const res = await fetch('/api/auth/2fa/regenerate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: regenPassword,
          code: regenCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to regenerate backup codes.');
      }

      onUserUpdated(data.user);
      if (data.backupCodes) {
        setGeneratedBackupCodes(data.backupCodes);
      }
      setIsRegenOpen(false);
      setRegenPassword('');
      setRegenCode('');
    } catch (err: any) {
      setRegenError(err.message || 'Could not regenerate backup codes.');
    } finally {
      setRegenSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, isBackup = false) => {
    navigator.clipboard.writeText(text);
    if (isBackup) {
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2500);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const downloadBackupCodes = () => {
    if (!generatedBackupCodes) return;
    const content = `SOF UMER MARKETPLACE - 2FA BACKUP RECOVERY CODES\n` +
      `User Account: ${currentUser.email}\n` +
      `Generated Date: ${new Date().toLocaleString()}\n` +
      `--------------------------------------------------\n\n` +
      generatedBackupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nIMPORTANT: Keep these codes secret and store them securely.\n` +
      `Each code can be used once to regain account access if you lose your phone.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sof-umer-2fa-backup-codes-${currentUser.email}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isUserAdmin = currentUser.role === 'admin' || currentUser.isEmployee === true;
  const is2FAEnabled = Boolean(currentUser.twoFactorEnabled);

  return (
    <div className="space-y-6">
      {/* 1. Main 2FA Status Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0d0d12]/90 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${
              is2FAEnabled 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif text-white font-bold">{t("two_factor_auth_title")}</h3>
                {is2FAEnabled ? (
                  <span className="px-3 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("protected_badge")}
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t("recommended_badge")}
                  </span>
                )}
                {isUserAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase font-bold tracking-wider">
                    {t("mandatory_admin_protection")}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-white/60 font-light mt-1 max-w-xl">
                Protect your Sof Umer account from stolen passwords, phishing, and unauthorized access by requiring a 6-digit code from Google Authenticator during sign-in.
              </p>

              {is2FAEnabled && currentUser.lastTwoFactorVerification && (
                <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  Last verified: {new Date(currentUser.lastTwoFactorVerification).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            {!is2FAEnabled ? (
              <button
                onClick={handleStartSetup}
                disabled={setupSubmitting}
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {setupSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                <span>{t("enable_google_authenticator")}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsRegenOpen(true)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>{t("backup_codes_count", { count: currentUser.backupRecoveryCodesCount ?? 0 })}</span>
                </button>
                
                {!isUserAdmin && (
                  <button
                    onClick={() => setIsDisableOpen(true)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>{t("disable_2fa")}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Setup Modal / Wizard */}
      <AnimatePresence>
        {isSetupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d0d12] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsSetupOpen(false)}
                className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Google Authenticator Setup</h3>
                <p className="text-xs text-white/50">Follow the steps below to link Google Authenticator to Sof Umer.</p>
              </div>

              {setupError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3.5 rounded-xl text-center">
                  {setupError}
                </div>
              )}

              {/* Option A: Scan QR Code */}
              {!showManualKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center border border-amber-500/30 shadow-xl max-w-[220px] mx-auto">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 object-contain" />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-black/50 text-xs">Generating QR...</div>
                    )}
                  </div>
                  <p className="text-center text-xs text-white/70">
                    Open <strong className="text-white">Google Authenticator</strong> app on your phone and scan the QR code above.
                  </p>
                  
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowManualKey(true)}
                      className="text-xs text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-4 cursor-pointer"
                    >
                      Can't scan QR code? Click for Manual Setup Key
                    </button>
                  </div>
                </div>
              ) : (
                /* Option B: Manual Setup Key */
                <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Manual Setup Secret Key</span>
                    <button
                      type="button"
                      onClick={() => setShowManualKey(false)}
                      className="text-xs text-white/50 hover:text-white transition"
                    >
                      Back to QR Code
                    </button>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/60 border border-white/10 rounded-xl">
                    <code className="text-amber-400 font-mono text-sm tracking-wider break-all flex-1">
                      {setupSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(setupSecret)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-[11px] text-white/70 bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="font-semibold text-white mb-1">Manual Setup Instructions for Google Authenticator:</p>
                    <ol className="list-decimal list-inside space-y-1 text-white/60">
                      <li>Open the <strong className="text-white">Google Authenticator</strong> app on your smartphone.</li>
                      <li>Tap the <strong className="text-white font-mono">(+)</strong> icon in the bottom right corner.</li>
                      <li>Select <strong className="text-white">Enter a setup key</strong>.</li>
                      <li>Account name: <strong className="text-white">Sof Umer ({currentUser.email})</strong></li>
                      <li>Paste the secret key shown above.</li>
                      <li>Ensure Type is set to <strong className="text-white">Time-based</strong> and tap <strong className="text-white">Add</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Step 3: Verify 6-digit Code */}
              <form onSubmit={handleEnable2FA} className="space-y-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                    Enter 6-Digit Google Authenticator Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3.5 bg-black/60 border border-amber-500/40 rounded-2xl text-amber-400 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSetupOpen(false)}
                    className="px-5 py-3 text-xs text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={setupSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {setupSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Verify & Activate 2FA</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Generated Backup Recovery Codes Modal */}
      <AnimatePresence>
        {generatedBackupCodes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d0d12] border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Save Backup Recovery Codes</h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto">
                  Keep these backup codes in a safe place. Each code can be used <strong className="text-amber-400">ONCE</strong> if you lose access to Google Authenticator.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-black/80 border border-white/10 rounded-2xl">
                {generatedBackupCodes.map((code, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-center font-mono text-amber-400 font-bold tracking-widest text-sm select-all">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => copyToClipboard(generatedBackupCodes.join('\n'), true)}
                  className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedBackupCodes ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-amber-500" />}
                  <span>{copiedBackupCodes ? 'Copied to Clipboard' : 'Copy All Codes'}</span>
                </button>

                <button
                  onClick={downloadBackupCodes}
                  className="w-full sm:w-auto px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .txt File</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  onClick={() => setGeneratedBackupCodes(null)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  I Have Saved My Recovery Codes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Disable 2FA Modal */}
      <AnimatePresence>
        {isDisableOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d0d12] border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsDisableOpen(false)}
                className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Disable 2FA Security</h3>
                <p className="text-xs text-white/50">Confirm your identity with your account password to disable Two-Factor Authentication.</p>
              </div>

              {disableError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl text-center">
                  {disableError}
                </div>
              )}

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Account Password</label>
                  <input
                    type="password"
                    required
                    value={disablePassword}
                    onChange={e => setDisablePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Current 2FA Code (Optional)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={disableCode}
                    onChange={e => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center font-mono text-lg py-2.5 bg-black/60 border border-white/10 rounded-xl text-amber-400 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDisableOpen(false)}
                    className="px-4 py-2.5 text-xs text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disableSubmitting}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {disableSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    <span>Confirm & Disable</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Regenerate Backup Codes Modal */}
      <AnimatePresence>
        {isRegenOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsRegenOpen(false)}
                className="absolute top-5 right-5 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">Regenerate Backup Codes</h3>
                <p className="text-xs text-white/50">Generating new backup recovery codes will invalidate all existing codes.</p>
              </div>

              {regenError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl text-center">
                  {regenError}
                </div>
              )}

              <form onSubmit={handleRegenerateBackupCodes} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Account Password</label>
                  <input
                    type="password"
                    required
                    value={regenPassword}
                    onChange={e => setRegenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Google Authenticator Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={regenCode}
                    onChange={e => setRegenCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center font-mono text-lg py-2.5 bg-black/60 border border-white/10 rounded-xl text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegenOpen(false)}
                    className="px-4 py-2.5 text-xs text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={regenSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {regenSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Issue New Codes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Security Audit Logs Table */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0d0d12]/90 border border-white/10 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-white">{t("security_audit_log_title")}</h4>
              <p className="text-xs text-white/50">Real-time log of security activations, sign-in attempts, and sensitive action verifications.</p>
            </div>
          </div>
        </div>

        {currentUser.securityLogs && currentUser.securityLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-amber-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">{t("date_and_time_th")}</th>
                  <th className="py-3 px-3">{t("security_event_th")}</th>
                  <th className="py-3 px-3">{t("ip_address_th")}</th>
                  <th className="py-3 px-3">{t("device_browser_th")}</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {currentUser.securityLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 text-white/50 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-amber-300">{log.ip || '127.0.0.1'}</td>
                    <td className="py-3 px-3 font-sans text-white/60 truncate max-w-[160px]" title={log.device}>
                      {log.device || 'Desktop / Web Browser'}
                    </td>
                    <td className="py-3 px-3 font-sans text-white/50">{log.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-2xl">
            No security audit entries logged yet.
          </div>
        )}
      </div>

      {/* 7. Login History */}
      {currentUser.loginHistory && currentUser.loginHistory.length > 0 && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0d0d12]/90 border border-white/10 shadow-xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-white">{t("recent_account_signin_history")}</h4>
              <p className="text-xs text-white/50">Recent devices and IP addresses used to log in to your Sof Umer account.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-blue-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Device Type</th>
                  <th className="py-3 px-3">{t("ip_address_th")}</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {currentUser.loginHistory.slice(0, 5).map((entry, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 inline-block">
                        {entry.deviceType || 'Desktop'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-blue-200">{entry.ip}</td>
                    <td className="py-3 px-3 text-white/50 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-3 font-sans text-white/40 truncate max-w-[200px]" title={entry.userAgent}>
                      {entry.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
