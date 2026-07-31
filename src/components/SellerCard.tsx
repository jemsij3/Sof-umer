import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { ShieldCheck, MessageSquare, Handshake, Phone, Briefcase } from 'lucide-react';

interface SellerCardProps {
  ownerName: string;
  contactPhone?: string;
  contactEmail?: string;
  activeAdsCount?: number;
  memberSince?: string;
  onViewAllAds?: () => void;
  onChat?: () => void;
  onMakeOffer?: () => void;
  onShowContact?: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({
  ownerName,
  contactPhone,
  contactEmail,
  activeAdsCount = 1,
  memberSince = '2024',
  onViewAllAds,
  onChat,
  onMakeOffer,
  onShowContact
}) => {
  const { t } = useApp();
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="bg-[#0d0d12]/90 rounded-3xl p-6 border border-white/5 shadow-xl text-center text-[#F5F5F4] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block mb-4 font-mono">
        {t('seller.seller_information')}
      </span>

      <div className="relative inline-block mb-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl border-2 border-amber-500/20">
          {ownerName ? ownerName.charAt(0).toUpperCase() : 'S'}
        </div>
      </div>

      <h4 className="font-extrabold text-white text-xl flex items-center justify-center gap-2">
        <span>{ownerName || 'Seller'}</span>
      </h4>

      <div className="mt-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 px-3 py-0.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('seller.verified_seller')}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/5 text-left">
        <div className="bg-[#12121a] p-3 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-white/40 block uppercase">{t('seller.active_ads')}</span>
          <span className="text-base font-extrabold text-white">{activeAdsCount}</span>
        </div>
        <div className="bg-[#12121a] p-3 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-white/40 block uppercase">{t('seller.member_since')}</span>
          <span className="text-xs font-bold text-amber-500">{memberSince}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3 pt-5 border-t border-white/5">
        {onViewAllAds && (
          <button
            onClick={onViewAllAds}
            className="w-full bg-[#12121a] hover:bg-white/10 text-white font-bold py-3 px-4 rounded-2xl border border-white/10 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <Briefcase className="w-4 h-4 text-amber-500" />
            <span>{t('seller.view_all_ads')}</span>
          </button>
        )}

        {onChat && (
          <button
            onClick={onChat}
            className="w-full bg-[#12121a] hover:bg-white/10 text-white font-bold py-3 px-4 rounded-2xl border border-white/10 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>{t('seller.chat_with_seller')}</span>
          </button>
        )}

        {onMakeOffer && (
          <button
            onClick={onMakeOffer}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <Handshake className="w-4.5 h-4.5" />
            <span>{t('seller.make_offer')}</span>
          </button>
        )}

        {!showContact ? (
          <button
            onClick={() => {
              setShowContact(true);
              if (onShowContact) onShowContact();
            }}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3.5 px-4 rounded-2xl border border-emerald-500/30 transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{t('seller.show_contact')}</span>
          </button>
        ) : (
          <div className="bg-[#12121a] p-4 rounded-2xl border border-emerald-500/30 space-y-2 text-left">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="text-sm font-bold text-white hover:text-amber-500 block">
                📞 {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="text-xs font-semibold text-white/80 hover:text-amber-500 block truncate">
                ✉️ {contactEmail}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerCard;
