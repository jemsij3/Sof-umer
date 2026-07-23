import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { 
  CheckCircle2, Send, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FooterProps {
  onFooterLinkClick: (type: 'marketplace' | 'info', value: string) => void;
}

export default function Footer({ onFooterLinkClick }: FooterProps) {
  const { currentLanguage, t } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribeSuccess(true);
      setEmailInput('');
      setTimeout(() => setSubscribeSuccess(false), 5000);
    }, 1000);
  };

  // Translation table for footer static texts to ensure perfect 3-language capability
  const fText = {
    tagline: {
      en: "The smart way to discover, buy, sell, rent, and connect with your local community.",
      om: "Mala qaruutee qabeenya argachuu, bitachuu, gurguruu, kireeffachuu fi hawaasa naannoo kee waliin wal-qunnamuuf.",
      am: "በአካባቢዎ ማህበረሰብ ውስጥ ንብረቶችን ለማግኘት፣ ለመግዛት፣ ለመሸጥ፣ ለመከራየት እና ለመገናኘት ብልህ መንገድ።"
    },
    colAbout: {
      en: "About Sof Umer",
      om: "Waa'ee Sof Umer",
      am: "ስለ ሶፍ ኡመር"
    },
    colStayUpdated: {
      en: "Stay Updated",
      om: "Odeeffannoo Saffisaa",
      am: "ወቅታዊ መረጃዎችን ያግኙ"
    },
    subscribeDesc: {
      en: "Subscribe to receive new listings, local updates, offers, and community announcements.",
      om: "Beeksisa haaraa, odeeffannoowwan naannoo, dhiyeessii fi labsa hawaasaa dhiyoo argachuuf galmaa'aa.",
      am: "አዳዲስ ዝርዝሮችን፣ የአካባቢ ወቅታዊ መረጃዎችን፣ ቅናሾችን እና የማህበረሰብ ማስታወቂያዎችን ለማግኘት ይመዝገቡ።"
    },
    placeholderEmail: {
      en: "Enter email or contact info...",
      om: "Imeelii ykn bilbila galchi...",
      am: "ኢሜል ወይም ስልክ ቁጥር ያስገቡ..."
    },
    subscribeBtn: {
      en: "Subscribe",
      om: "Mirkaneessi",
      am: "ይመዝገቡ"
    },
    successMessage: {
      en: "Successfully subscribed!",
      om: "Milkaa'inaan galmeeffameera!",
      am: "በተሳካ ሁኔታ ተመዝግበዋል!"
    },
    rights: {
      en: "© 2026 SOF-UMER. All Rights Reserved. Fully localized safe community commerce active.",
      om: "© 2026 SOF-UMER. Mirgi Hundu Kan Eegameedha. Sirni gabaa daldala naannoo nageenyaa qabu hojjechaa jira.",
      am: "© 2026 SOF-UMER. መብቱ በህግ የተጠበቀ ነው። የተረጋገጠ እና ደህንነቱ የተጠበቀ የአካባቢ ግብይት ንቁ ነው።"
    },
    colAboutUs: {
      en: "About Us",
      om: "Waa'ee Keenya",
      am: "ስለ እኛ"
    },
    colHowItWorks: {
      en: "How It Works",
      om: "Inni Akkamitti Hojjata",
      am: "እንዴት እንደሚሰራ"
    },
    colCareers: {
      en: "Careers",
      om: "Carraa Hojii",
      am: "ስራዎች"
    },
    colContactUs: {
      en: "Contact Us",
      om: "Nu Quunnamaa",
      am: "እኛን ያግኙን"
    }
  };

  const getTranslation = (obj: any) => {
    return obj[currentLanguage] || obj['en'] || '';
  };

  return (
    <footer className="bg-[#050806] border-t border-[#10b981]/15 pt-10 pb-8 text-[#F5F5F4] relative overflow-hidden z-20">
      
      {/* Decorative vector background light */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10 text-left">
        
        {/* Collapsible Card: About Sof Umer */}
        <div className="bg-[#0a0f0c] border border-[#10b981]/15 rounded-2xl overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-white/[0.02] transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {getTranslation(fText.colAbout)}
              </h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-emerald-400/80 transition-transform duration-300 ${isAboutExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isAboutExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-t border-[#10b981]/10 bg-black/30"
              >
                <div className="p-6">
                  {/* Grid of About links */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <button 
                      onClick={() => onFooterLinkClick('info', 'about-us')}
                      className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl border border-white/5 transition text-left font-medium cursor-pointer"
                    >
                      {getTranslation(fText.colAboutUs)}
                    </button>
                    <button 
                      onClick={() => onFooterLinkClick('info', 'how-it-works')}
                      className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl border border-white/5 transition text-left font-medium cursor-pointer"
                    >
                      {getTranslation(fText.colHowItWorks)}
                    </button>
                    <button 
                      onClick={() => onFooterLinkClick('info', 'careers')}
                      className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl border border-white/5 transition text-left font-medium cursor-pointer"
                    >
                      {getTranslation(fText.colCareers)}
                    </button>
                    <button 
                      onClick={() => onFooterLinkClick('info', 'contact-us')}
                      className="p-3 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl border border-white/5 transition text-left font-medium cursor-pointer"
                    >
                      {getTranslation(fText.colContactUs)}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stay Updated Section: directly below About Sof Umer */}
        <div className="bg-[#0a0f0c] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left max-w-xl">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">
              {getTranslation(fText.colStayUpdated)}
            </h4>
            <p className="text-[11px] text-white/40 leading-relaxed font-light">
              {getTranslation(fText.subscribeDesc)}
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 min-w-[280px]">
            {subscribeSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-2.5 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{getTranslation(fText.successMessage)}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5 w-full">
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder={getTranslation(fText.placeholderEmail)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-white/25 text-left"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black px-3.5 rounded-xl transition cursor-pointer flex items-center justify-center focus:outline-none"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms Links */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
          <p className="text-center md:text-left leading-relaxed">
            {getTranslation(fText.rights)}
          </p>

          <div className="flex gap-4">
            <button 
              onClick={() => onFooterLinkClick('info', 'terms-of-service')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button 
              onClick={() => onFooterLinkClick('info', 'privacy-policy')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
