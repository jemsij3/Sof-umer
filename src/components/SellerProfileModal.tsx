import React, { useMemo } from 'react';
import { Property, User } from '../types';
import { useApp } from '../lib/AppContext';
import { X, ShieldCheck, MapPin, Calendar, Briefcase, Phone, MessageSquare, Building2, Package } from 'lucide-react';
import ListingCard from './ListingCard';
import { motion, AnimatePresence } from 'motion/react';

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerAvatar?: string;
  sellerBusinessName?: string;
  sellerLocation?: string;
  sellerId?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  isVerified?: boolean;
  memberSince?: string;
  onSelectProperty: (property: Property) => void;
  onContactSeller?: () => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  sellerAvatar,
  sellerBusinessName,
  sellerLocation,
  sellerId,
  sellerEmail,
  sellerPhone,
  isVerified = true,
  memberSince = '2023',
  onSelectProperty,
  onContactSeller
}) => {
  const { properties, t } = useApp();

  // Find all active listings by this seller
  const sellerListings = useMemo(() => {
    return properties.filter(p => {
      if (sellerId && p.ownerId === sellerId) return true;
      if (sellerEmail && p.contactEmail && p.contactEmail.toLowerCase() === sellerEmail.toLowerCase()) return true;
      if (sellerName && p.ownerName && p.ownerName.toLowerCase() === sellerName.toLowerCase()) return true;
      return false;
    });
  }, [properties, sellerId, sellerEmail, sellerName]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#09090d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-[#F5F5F4]"
        >
          {/* Header Banner with Close Button */}
          <div className="relative bg-gradient-to-r from-amber-500/15 via-black/40 to-transparent p-6 sm:p-8 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {sellerAvatar ? (
                  <img
                    src={sellerAvatar}
                    alt={sellerName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl border-2 border-amber-500/40">
                    {(sellerName || 'S')[0].toUpperCase()}
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow" title={t('verified_seller_badge') || 'Verified Seller'}>
                    <ShieldCheck className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {sellerName || 'Marketplace Seller'}
                  </h2>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{t('verified_seller_badge') || 'Verified Seller'}</span>
                    </span>
                  )}
                </div>

                {sellerBusinessName && (
                  <p className="text-sm font-semibold text-amber-400/90 flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{sellerBusinessName}</span>
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/60">
                  {sellerLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{sellerLocation}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t('member_since') || 'Member since'} {memberSince}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-bold text-white">{sellerListings.length}</span> {t('active_ads') || 'active listings'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                {sellerPhone && (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t('call_now') || 'Call'}</span>
                  </a>
                )}
                {onContactSeller && (
                  <button
                    onClick={onContactSeller}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-amber-500/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('message_seller') || 'Message'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body: Listings Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>{t('seller_active_listings') || 'Active Listings by this Seller'}</span>
                <span className="text-xs font-mono text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {sellerListings.length}
                </span>
              </h3>
            </div>

            {sellerListings.length === 0 ? (
              <div className="p-12 text-center text-white/40 bg-white/[0.02] rounded-2xl border border-white/5">
                <Package className="w-10 h-10 mx-auto mb-2 text-white/20" />
                <p className="text-sm">No active public listings found for this seller currently.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellerListings.map(prop => (
                  <ListingCard
                    key={prop.id}
                    property={prop}
                    onSelect={(p) => {
                      onClose();
                      onSelectProperty(p);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SellerProfileModal;
