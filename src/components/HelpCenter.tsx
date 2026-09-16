import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronRight, HelpCircle, X, RefreshCw } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { FAQItem } from '../types';

export default function HelpCenter() {
  const { faqs: contextFaqs, currentLanguage, refreshData } = useApp();
  const [localFaqs, setLocalFaqs] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Directly fetch latest Admin FAQ configuration from the API
  const fetchAdminFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/faqs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocalFaqs(data);
        }
      }
    } catch (err) {
      console.error('Failed to load Admin FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminFaqs();
  }, []);

  // Synchronize with context if updated by admin operations
  useEffect(() => {
    if (Array.isArray(contextFaqs) && contextFaqs.length > 0) {
      setLocalFaqs(contextFaqs);
    }
  }, [contextFaqs]);

  // Single Source of Truth: Active Admin FAQs (exclude drafts, sort by orderIndex)
  const activeFaqs = useMemo(() => {
    const list = Array.isArray(localFaqs) && localFaqs.length > 0 ? localFaqs : contextFaqs || [];
    return list
      .filter(f => f && f.status !== 'draft')
      .sort((a, b) => (a.orderIndex || 999) - (b.orderIndex || 999));
  }, [localFaqs, contextFaqs]);

  // Helper to extract localized text from the exact same FAQ record
  const getFaqText = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[currentLanguage] || val.en || val.om || val.am || '';
    }
    return '';
  };

  // Filter FAQs based on search input
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return activeFaqs;
    const q = searchQuery.toLowerCase().trim();
    return activeFaqs.filter(item => {
      const questionText = getFaqText(item.question).toLowerCase();
      const answerText = getFaqText(item.answer).toLowerCase();
      return questionText.includes(q) || answerText.includes(q);
    });
  }, [activeFaqs, searchQuery, currentLanguage]);

  // Toggle accordion item - only one expanded at a time
  const toggleQuestion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const title = currentLanguage === 'om' 
    ? 'Gaaffilee Yeroo Baay’ee Gaafataman' 
    : currentLanguage === 'am' 
    ? 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች' 
    : 'Frequently Asked Questions';

  const subtitle = currentLanguage === 'om'
    ? 'Deebii yeroo ammaa sirna bulchiinsaan qophaa’an'
    : currentLanguage === 'am'
    ? 'ከአስተዳዳሪው የቀረቡ ይፋዊ ይዘቶች እና መልሶች'
    : 'Direct answers configured in the admin system';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left" id="user-faq-view">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-black/80 to-black border border-white/10 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-white/60 font-light mt-1">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Quick reload button */}
          <button
            type="button"
            onClick={() => {
              fetchAdminFaqs();
              refreshData();
            }}
            title="Refresh FAQs from Admin"
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/70 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{currentLanguage === 'om' ? 'Haaromsi' : currentLanguage === 'am' ? 'አድስ' : 'Refresh'}</span>
          </button>
        </div>

        {/* Clean Search Input */}
        <div className="relative w-full mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            id="faq-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              currentLanguage === 'om'
                ? 'Gaaffilee barbaadi...'
                : currentLanguage === 'am'
                ? 'ጥያቄዎችን ይፈልጉ...'
                : 'Search questions...'
            }
            className="w-full bg-black/60 hover:bg-black/80 focus:bg-black border border-white/10 focus:border-amber-500/60 rounded-xl py-3 pl-11 pr-10 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3" id="faq-accordion-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(item => {
            const isExpanded = expandedId === item.id;
            const question = getFaqText(item.question);
            const answer = getFaqText(item.answer);

            return (
              <div
                key={item.id}
                id={`faq-item-${item.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-amber-500/40 bg-white/[0.04] shadow-lg shadow-black/40'
                    : 'border-white/5 bg-black/40 hover:bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {/* Question Trigger - Initially shows ONLY the question */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(item.id)}
                  aria-expanded={isExpanded}
                  className="w-full py-4 px-5 flex items-center justify-between gap-4 text-left transition cursor-pointer group focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-amber-400/80 group-hover:text-amber-400 transition">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                    <h3 className="text-sm font-semibold text-white/90 group-hover:text-amber-400 transition leading-snug">
                      {question || 'Untitled Question'}
                    </h3>
                  </div>

                  <span className="text-[10px] text-white/30 font-mono shrink-0 uppercase">
                    {isExpanded ? 'Collapse' : ''}
                  </span>
                </button>

                {/* Answer Content - Revealed strictly on click */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`faq-answer-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-white/5">
                        <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed whitespace-pre-line pl-7">
                          {answer || 'No answer provided yet.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-black/20 border border-white/5 rounded-2xl space-y-2">
            <HelpCircle className="w-8 h-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/50">
              {searchQuery
                ? currentLanguage === 'om'
                  ? 'Gaaffiin barbaadame hin argamne.'
                  : currentLanguage === 'am'
                  ? 'የሚዛመዱ ጥያቄዎች አልተገኙም።'
                  : 'No matching questions found.'
                : currentLanguage === 'om'
                ? 'Gaaffileen ammatti hin jiran.'
                : currentLanguage === 'am'
                ? 'በአሁኑ ጊዜ የቀረቡ ጥያቄዎች የሉም።'
                : 'No frequently asked questions available at this time.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-400 hover:underline pt-1 cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
