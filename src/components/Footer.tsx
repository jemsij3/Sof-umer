import React from 'react';
import { useApp } from '../lib/AppContext';

interface FooterProps {
  onFooterLinkClick: (type: 'marketplace' | 'info', value: string) => void;
}

export default function Footer({ onFooterLinkClick }: FooterProps) {
  const { currentLanguage } = useApp();

  const rightsText: Record<string, string> = {
    en: "© 2026 SOF-UMER. All Rights Reserved.",
    om: "© 2026 SOF-UMER. Mirgi Hundu Kan Eegameedha.",
    am: "© 2026 SOF-UMER. መብቱ በህግ የተጠበቀ ነው።"
  };

  const currentRights = rightsText[currentLanguage] || rightsText.en;

  return (
    <footer className="bg-white border-t border-stone-200/80 py-8 text-stone-600 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
        <p className="text-center sm:text-left font-normal">
          {currentRights}
        </p>

        <div className="flex items-center gap-4 font-medium">
          <button 
            onClick={() => onFooterLinkClick('info', 'terms-of-service')}
            className="hover:text-[#C06853] transition cursor-pointer"
          >
            Terms
          </button>
          <span>·</span>
          <button 
            onClick={() => onFooterLinkClick('info', 'privacy-policy')}
            className="hover:text-[#C06853] transition cursor-pointer"
          >
            Privacy
          </button>
        </div>
      </div>
    </footer>
  );
}
