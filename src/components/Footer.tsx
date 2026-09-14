import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Folder, FolderOpen, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../lib/AppContext';

interface FooterProps {
  onFooterLinkClick: (type: 'marketplace' | 'info', value: string) => void;
}

export default function Footer({ onFooterLinkClick }: FooterProps) {
  const { currentLanguage } = useApp();
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');

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

  // Exactly the 5 requested features under ABOUT SOF-UMER
  const aboutSofUmerLinks = [
    {
      id: 'about-us',
      titleEn: 'About SOF-UMER',
      titleOm: "Waa'ee SOF-UMER",
      titleAm: 'ስለ SOF-UMER'
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

  const stayUpdatedTitle: Record<string, string> = {
    en: 'Stay Updated',
    om: 'Odeeffannoo Haaraa Argadhaa',
    am: 'ወቅታዊ መረጃ ያግኙ'
  };

  const stayUpdatedSubtitle: Record<string, string> = {
    en: 'Get updates, new listings, offers, and important SOF-UMER information.',
    om: 'Odeeffannoo haarawa, beeksisa dhiheenyaa, carraafi odeeffannoo barbaachisaa SOF-UMER argadhaa.',
    am: 'አዳዲስ ማስታወቂያዎችን፣ ልዩ ቅናሾችን እና አስፈላጊ የ SOF-UMER መረጃዎችን በኢሜልዎ ያግኙ።'
  };

  const emailPlaceholder: Record<string, string> = {
    en: 'Enter your email',
    om: 'Imeelii keessan galchaa',
    am: 'ኢሜይልዎን ያስገቡ'
  };

  const subscribeButtonText: Record<string, string> = {
    en: 'Subscribe',
    om: "Galmaa'i",
    am: 'ይመዝገቡ'
  };

  const successMessage: Record<string, string> = {
    en: "Thank you for subscribing! You'll receive the latest SOF-UMER updates.",
    om: 'Galatoomaa! Odeeffannoo haaraa SOF-UMER ni argattu.',
    am: 'እናመሰግናለን! የቅርብ ጊዜ የ SOF-UMER መረጃዎች ይደርስዎታል።'
  };

  const getTitle = (item: { titleEn: string; titleOm: string; titleAm: string }) => {
    if (currentLanguage === 'om') return item.titleOm || item.titleEn;
    if (currentLanguage === 'am') return item.titleAm || item.titleEn;
    return item.titleEn;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setSubError(currentLanguage === 'om' ? 'Imeelii sirrii galchaa' : currentLanguage === 'am' ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ' : 'Please enter a valid email address');
      return;
    }

    try {
      const stored = localStorage.getItem('sof_umer_subscribers');
      const subscribers = stored ? JSON.parse(stored) : [];
      if (!subscribers.includes(trimmed)) {
        subscribers.push(trimmed);
        localStorage.setItem('sof_umer_subscribers', JSON.stringify(subscribers));
      }
    } catch {
      // safe fallback
    }

    setSubscribed(true);
    setEmail('');
  };

  const currentRights = rightsText[currentLanguage] || rightsText.en;
  const currentAboutHeader = aboutHeaderTitle[currentLanguage] || aboutHeaderTitle.en;

  return (
    <footer className="bg-[#050806] border-t border-white/10 text-[#F5F5F4] relative z-20 transition-colors pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 text-center space-y-10">
        
        {/* 1. Expandable / Folder-style ABOUT SOF-UMER Section */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/30 transition-all duration-200 cursor-pointer group text-left"
            aria-expanded={isAboutExpanded}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition">
                {isAboutExpanded ? (
                  <FolderOpen className="w-5 h-5" />
                ) : (
                  <Folder className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition">
                  {currentAboutHeader}
                </h3>
                <span className="text-[11px] text-white/40 font-light">
                  {isAboutExpanded 
                    ? (currentLanguage === 'om' ? 'Cufi' : currentLanguage === 'am' ? 'ዝጋ' : 'Click to close')
                    : (currentLanguage === 'om' ? 'Bani' : currentLanguage === 'am' ? 'ክፈት' : 'Click to explore')}
                </span>
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover:text-amber-400 transition">
              {isAboutExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Expanded 5 Items */}
          {isAboutExpanded && (
            <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {aboutSofUmerLinks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onFooterLinkClick('info', item.id)}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs text-white/70 hover:text-amber-400 transition-all duration-150 cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <span className="font-medium group-hover:translate-x-1 transition-transform">
                      {getTitle(item)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-amber-400 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Subscription Area (Stay Updated) */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 space-y-4 text-center">
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-medium mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{stayUpdatedTitle[currentLanguage] || stayUpdatedTitle.en}</span>
            </div>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              {stayUpdatedSubtitle[currentLanguage] || stayUpdatedSubtitle.en}
            </p>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage[currentLanguage] || successMessage.en}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder[currentLanguage] || emailPlaceholder.en}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition duration-150 cursor-pointer shadow-md hover:shadow-amber-500/20 shrink-0"
                >
                  {subscribeButtonText[currentLanguage] || subscribeButtonText.en}
                </button>
              </div>
              {subError && (
                <p className="text-[11px] text-red-400 text-left pl-1">{subError}</p>
              )}
            </form>
          )}
        </div>

        {/* 3. Existing Copyright Text */}
        <div className="pt-2 text-xs text-white/40 font-light">
          <p>{currentRights}</p>
        </div>

      </div>
    </footer>
  );
}

