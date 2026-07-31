import React from 'react';
import { useApp } from '../lib/AppContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface SafetyTipsProps {
  onReportListing?: () => void;
}

export const SafetyTips: React.FC<SafetyTipsProps> = ({ onReportListing }) => {
  const { t } = useApp();

  return (
    <div className="bg-[#0d0d12]/90 rounded-3xl p-6 border border-amber-500/20 shadow-lg text-left text-[#F5F5F4] space-y-4">
      <div className="flex items-center gap-2.5 text-amber-500">
        <Shield className="w-5 h-5 shrink-0" />
        <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider">
          {t('safety.safety_tips_title')}
        </h4>
      </div>

      <ul className="space-y-2.5 text-xs text-white/70">
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_meet_public')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_inspect_item')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_confirm_ownership')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_verify_docs')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_trusted_payment')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-amber-500 font-bold">•</span>
          <span>{t('safety.tip_report_suspicious')}</span>
        </li>
      </ul>

      {onReportListing && (
        <button
          onClick={onReportListing}
          className="w-full mt-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 px-4 rounded-xl border border-red-500/20 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t('safety.report_listing')}</span>
        </button>
      )}
    </div>
  );
};

export default SafetyTips;
