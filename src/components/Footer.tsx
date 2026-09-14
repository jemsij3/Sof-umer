import React from 'react';
import { ShieldCheck, MapPin, Mail, Globe, ArrowUpRight } from 'lucide-react';
import { useApp } from '../lib/AppContext';

interface FooterProps {
  onFooterLinkClick: (type: 'marketplace' | 'info', value: string) => void;
}

export default function Footer({ onFooterLinkClick }: FooterProps) {
  const { currentLanguage, appFeatures, t } = useApp();

  const rightsText: Record<string, string> = {
    en: "© 2026 SOF-UMER. All Rights Reserved.",
    om: "© 2026 SOF-UMER. Mirgi Hundu Kan Eegameedha.",
    am: "© 2026 SOF-UMER. መብቱ በህግ የተጠበቀ ነው።"
  };

  const aboutHeaderTitle: Record<string, string> = {
    en: "ABOUT SOF-UMER",
    om: "WAA'EE SOF-UMER",
    am: "ስለ SOF-UMER"
  };

  const marketplaceHeaderTitle: Record<string, string> = {
    en: "MARKETPLACE",
    om: "GABAA",
    am: "የገበያ ቦታ"
  };

  const safetyHeaderTitle: Record<string, string> = {
    en: "TRUST & SAFETY",
    om: "AMANAMUMMAA & NAGEENYA",
    am: "እምነት እና ደህንነት"
  };

  const taglineText: Record<string, string> = {
    en: "Ethiopia's premier multi-category marketplace connecting people, businesses, and opportunities.",
    om: "Gabaa dhiyeessii hedduu Itoophiyaa isa duraa kan namoota, daldalaafi carraawwan walitti hidhu.",
    am: "ሰዎችን፣ ንግዶችን እና እድሎችን የሚያገናኝ የኢትዮጵያ ግንባር ቀደም ባለብዙ-ምድብ ገበያ።"
  };

  // The original ABOUT SOF-UMER sub-sections in their exact order in the app
  const aboutSofUmerLinks = [
    {
      id: 'about-us',
      titleEn: 'About Us',
      titleOm: "Waa'ee Keenya",
      titleAm: 'ስለ እኛ'
    },
    {
      id: 'how-it-works',
      titleEn: 'How It Works',
      titleOm: 'Inni Akkamitti Hojjata',
      titleAm: 'እንዴት እንደሚሰራ'
    },
    {
      id: 'contact-us',
      titleEn: 'Contact Us',
      titleOm: 'Nu Quunnamaa',
      titleAm: 'ያግኙን'
    },
    {
      id: 'careers',
      titleEn: 'Careers',
      titleOm: 'Carraa Hojii',
      titleAm: 'ስራዎች'
    },
    {
      id: 'help-center',
      titleEn: 'Help Center',
      titleOm: 'Giddugala Deggarsaa',
      titleAm: 'የእርዳታ ማዕከል'
    },
    {
      id: 'marketplace-rules',
      titleEn: 'Marketplace Rules',
      titleOm: 'Seera Gabaa',
      titleAm: 'የገበያ ቦታ ደንቦች'
    },
    {
      id: 'safety-tips',
      titleEn: 'Safety Tips',
      titleOm: 'Gorsa Nageenyaa',
      titleAm: 'የደህንነት ምክሮች'
    },
    {
      id: 'verify-ownership',
      titleEn: 'Verify Ownership',
      titleOm: 'Mirkaneessa Abbummaa',
      titleAm: 'ባлеቤትነትን ያረጋግጡ'
    },
    {
      id: 'terms-of-service',
      titleEn: 'Terms of Service',
      titleOm: 'Waliigaltee Tajaajilaa',
      titleAm: 'የአጠቃቀም ስምምነት'
    },
    {
      id: 'privacy-policy',
      titleEn: 'Privacy Policy',
      titleOm: 'Ibsa Iccitii',
      titleAm: 'የግላዊነት ፖሊሲ'
    }
  ];

  // Any dynamic custom features added by admin
  const knownIds = new Set(aboutSofUmerLinks.map(l => l.id));
  const customFeatures = (appFeatures || []).filter(f => !knownIds.has(f.id));

  const marketplaceLinks = [
    {
      type: 'marketplace' as const,
      value: 'Featured',
      titleEn: 'Featured Listings',
      titleOm: 'Beeksisa Filatamaa',
      titleAm: 'ተለይተው የቀረቡ'
    },
    {
      type: 'marketplace' as const,
      value: 'Properties',
      titleEn: 'Properties & Real Estate',
      titleOm: 'Qabeenya Manaa & Lafaa',
      titleAm: 'ሪል እስቴት እና ቤቶች'
    },
    {
      type: 'marketplace' as const,
      value: 'Vehicles',
      titleEn: 'Cars & Vehicles',
      titleOm: 'Konkolaattota & Geejjiba',
      titleAm: 'መኪኖች እና ተሽከርካሪዎች'
    },
    {
      type: 'marketplace' as const,
      value: 'Products',
      titleEn: 'Electronics & Goods',
      titleOm: 'Elektirooniksii & Meeshaalee',
      titleAm: 'ኤሌክትሮኒክስ እና እቃዎች'
    },
    {
      type: 'marketplace' as const,
      value: 'Services',
      titleEn: 'Professional Services',
      titleOm: 'Tajaajiloota Ogeessummaa',
      titleAm: 'ሙያዊ አገልግሎቶች'
    },
    {
      type: 'marketplace' as const,
      value: 'Jobs',
      titleEn: 'Jobs & Careers',
      titleOm: 'Hojii & Carraawwan',
      titleAm: 'ስራዎች እና ቅጥር'
    }
  ];

  const getTitle = (item: { titleEn: string; titleOm: string; titleAm: string }) => {
    if (currentLanguage === 'om') return item.titleOm || item.titleEn;
    if (currentLanguage === 'am') return item.titleAm || item.titleEn;
    return item.titleEn;
  };

  const currentRights = rightsText[currentLanguage] || rightsText.en;
  const currentAboutHeader = aboutHeaderTitle[currentLanguage] || aboutHeaderTitle.en;
  const currentMarketplaceHeader = marketplaceHeaderTitle[currentLanguage] || marketplaceHeaderTitle.en;
  const currentSafetyHeader = safetyHeaderTitle[currentLanguage] || safetyHeaderTitle.en;
  const currentTagline = taglineText[currentLanguage] || taglineText.en;

  return (
    <footer className="bg-[#050806] border-t border-white/10 text-[#F5F5F4] relative z-20 transition-colors">
      {/* Main Footer Links & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 text-left">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xl tracking-wider text-amber-400 font-black">
                SOF-UMER
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Ethiopia
              </span>
            </div>

            <p className="text-xs text-white/60 leading-relaxed font-light pr-4 max-w-sm">
              {currentTagline}
            </p>

            <div className="pt-2 space-y-2 text-xs text-white/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Churchill Road, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>info@sofumer.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-white/40">English • Afaan Oromoo • አማርኛ</span>
              </div>
            </div>
          </div>

          {/* Restored Native "ABOUT SOF-UMER" Section */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {currentAboutHeader}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
              {aboutSofUmerLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onFooterLinkClick('info', item.id)}
                  className="group text-left text-xs text-white/65 hover:text-amber-400 transition-colors duration-150 flex items-center justify-between cursor-pointer py-1"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                    {getTitle(item)}
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity shrink-0 ml-1" />
                </button>
              ))}

              {/* Dynamic custom features if any */}
              {customFeatures.map((feat) => {
                const title = currentLanguage === 'om' ? feat.titleOm : currentLanguage === 'am' ? feat.titleAm : feat.titleEn;
                return (
                  <button
                    key={feat.id}
                    onClick={() => onFooterLinkClick('info', feat.id)}
                    className="group text-left text-xs text-white/65 hover:text-amber-400 transition-colors duration-150 flex items-center justify-between cursor-pointer py-1"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                      {title}
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marketplace Categories Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {currentMarketplaceHeader}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {marketplaceLinks.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => onFooterLinkClick(cat.type, cat.value)}
                  className="group text-left text-xs text-white/65 hover:text-amber-400 transition-colors duration-150 flex items-center justify-between cursor-pointer py-0.5"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                    {getTitle(cat)}
                  </span>
                  <span className="text-[10px] text-white/20 group-hover:text-amber-400/60 transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar with Copyright, Legal & Safety Status */}
      <div className="border-t border-white/5 bg-black/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p className="text-center sm:text-left font-light">
            {currentRights}
          </p>

          <div className="flex items-center gap-4 font-medium">
            <button 
              onClick={() => onFooterLinkClick('info', 'terms-of-service')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              {getTitle({ titleEn: 'Terms', titleOm: 'Waliigaltee', titleAm: 'ስምምነት' })}
            </button>
            <span>·</span>
            <button 
              onClick={() => onFooterLinkClick('info', 'privacy-policy')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              {getTitle({ titleEn: 'Privacy', titleOm: 'Iccitii', titleAm: 'ግላዊነት' })}
            </button>
            <span>·</span>
            <button 
              onClick={() => onFooterLinkClick('info', 'marketplace-rules')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              {getTitle({ titleEn: 'Rules', titleOm: 'Seera', titleAm: 'ደንቦች' })}
            </button>
            <span>·</span>
            <button 
              onClick={() => onFooterLinkClick('info', 'help-center')}
              className="hover:text-amber-400 transition cursor-pointer"
            >
              {getTitle({ titleEn: 'Help', titleOm: 'Gargaarsa', titleAm: 'እርዳታ' })}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
