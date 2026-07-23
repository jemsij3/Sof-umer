import React, { useState, useMemo } from 'react';
import { MapPin, Search, ChevronDown, ChevronRight, X, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ETHIOPIA_LOCATIONS, getLocalizedLocationName, RegionOption } from '../lib/locationData';

interface LocationSelectorModalProps {
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  currentLanguage: 'en' | 'om' | 'am';
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  selectedLocation,
  onSelectLocation,
  currentLanguage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegionId, setExpandedRegionId] = useState<string | null>(null);

  const lang = (currentLanguage as 'en' | 'om' | 'am') || 'en';

  // Display label on the main button
  const displayLabel = useMemo(() => {
    return getLocalizedLocationName(selectedLocation, lang);
  }, [selectedLocation, lang]);

  // Filtered regions and cities based on searchQuery
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return ETHIOPIA_LOCATIONS;

    const q = searchQuery.toLowerCase().trim();
    const result: RegionOption[] = [];

    for (const reg of ETHIOPIA_LOCATIONS) {
      if (reg.id === 'all') {
        if ('all ethiopia'.includes(q) || 'guutuu itoophiyaa'.includes(q) || 'መላው ኢትዮጵያ'.includes(q)) {
          result.push(reg);
        }
        continue;
      }

      const regMatches =
        reg.name.en.toLowerCase().includes(q) ||
        reg.name.om.toLowerCase().includes(q) ||
        reg.name.am.toLowerCase().includes(q);

      const matchingCities = reg.cities.filter(
        c =>
          c.name.en.toLowerCase().includes(q) ||
          c.name.om.toLowerCase().includes(q) ||
          c.name.am.toLowerCase().includes(q)
      );

      if (regMatches || matchingCities.length > 0) {
        result.push({
          ...reg,
          cities: matchingCities.length > 0 ? matchingCities : reg.cities
        });
      }
    }

    return result;
  }, [searchQuery]);

  const handleSelect = (locValue: string) => {
    onSelectLocation(locValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getTranslatedTitle = () => {
    if (lang === 'om') return 'Bakka Filadhaa';
    if (lang === 'am') return 'ቦታ ይምረጡ';
    return 'Select Location';
  };

  const getSearchPlaceholder = () => {
    if (lang === 'om') return 'Bakka, magaalaa ykn kutaa magaalaa barbadii...';
    if (lang === 'am') return 'ክልል፣ ከተማ ወይም ክፍለ ከተማ ይፈልጉ...';
    return 'Search region, city, zone, or district...';
  };

  return (
    <div className="relative inline-block text-left">
      {/* Jiji-style Location Button in Searchbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto h-full px-4 py-3 bg-[#12121a] hover:bg-[#181826] border border-white/10 hover:border-amber-500/40 rounded-2xl text-xs text-white font-medium flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-sm group"
        title="Filter location"
      >
        <div className="flex items-center gap-2 truncate max-w-[180px] sm:max-w-[200px]">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate font-semibold text-white/90 group-hover:text-amber-300 transition-colors">
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>

      {/* Location Modal / Dropdown Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile & popover dismiss */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed md:absolute left-4 right-4 md:left-0 top-20 md:top-full md:mt-2 z-50 w-auto md:w-[420px] bg-[#0d0d12] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[520px]"
            >
              {/* Header */}
              <div className="p-4 bg-[#12121c] border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{getTranslatedTitle()}</h3>
                    <p className="text-[10px] text-white/50">Filter listings by region or city</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/40 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Inside Location List */}
              <div className="p-3 bg-[#0d0d12] border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-400/60" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={getSearchPlaceholder()}
                    className="w-full pl-10 pr-3 py-2 bg-[#14141f] border border-white/10 focus:border-amber-500/60 rounded-xl text-xs text-white focus:outline-none placeholder:text-white/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-white/40 hover:text-white text-xs p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Locations Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {filteredLocations.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-xs">
                    No locations match "{searchQuery}"
                  </div>
                ) : (
                  filteredLocations.map(region => {
                    const isAll = region.id === 'all';
                    const regionName = region.name[lang] || region.name.en;
                    const isRegionSelected =
                      selectedLocation === 'All' || selectedLocation === 'all'
                        ? isAll
                        : selectedLocation === region.name.en || selectedLocation === region.id;

                    const isExpanded = expandedRegionId === region.id || searchQuery.trim() !== '';

                    return (
                      <div key={region.id} className="rounded-2xl overflow-hidden border border-white/5 bg-[#12121a]/60">
                        {/* Region Item */}
                        <div
                          className={`flex items-center justify-between p-3 cursor-pointer transition ${
                            isRegionSelected
                              ? 'bg-amber-500/10 text-amber-300 font-bold border-l-2 border-amber-500'
                              : 'hover:bg-white/5 text-white/80'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(isAll ? 'All' : region.name.en)}
                            className="flex-1 flex items-center gap-2.5 text-left text-xs font-medium cursor-pointer"
                          >
                            {isAll ? (
                              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                            )}
                            <span>{isAll ? `🌍 ${regionName}` : regionName}</span>
                            {isRegionSelected && <Check className="w-4 h-4 text-amber-400 ml-auto mr-2" />}
                          </button>

                          {/* Expand arrow if region has cities */}
                          {!isAll && region.cities.length > 0 && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setExpandedRegionId(expandedRegionId === region.id ? null : region.id);
                              }}
                              className="p-1 text-white/30 hover:text-amber-400 rounded-lg hover:bg-white/10 transition cursor-pointer"
                              title="Toggle cities / districts"
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-amber-400' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Sub-locations / Cities / Districts List */}
                        {!isAll && region.cities.length > 0 && isExpanded && (
                          <div className="bg-black/40 border-t border-white/5 pl-8 pr-3 py-2 space-y-1">
                            {/* Option to select All in this region */}
                            <button
                              type="button"
                              onClick={() => handleSelect(region.name.en)}
                              className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${
                                selectedLocation === region.name.en
                                  ? 'text-amber-400 font-bold bg-amber-500/10'
                                  : 'text-white/60 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span>All {regionName}</span>
                              {selectedLocation === region.name.en && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </button>

                            {region.cities.map(city => {
                              const cityName = city.name[lang] || city.name.en;
                              const isCitySelected =
                                selectedLocation === city.name.en || selectedLocation === city.id;

                              return (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => handleSelect(city.name.en)}
                                  className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-between transition cursor-pointer ${
                                    isCitySelected
                                      ? 'text-amber-400 font-bold bg-amber-500/10'
                                      : 'text-white/50 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <span>📍 {cityName}</span>
                                  {isCitySelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer info */}
              <div className="p-3 bg-[#12121c] border-t border-white/10 flex items-center justify-between gap-2 text-[10px] text-white/40">
                <span>Selected: <strong className="text-amber-400">{displayLabel}</strong></span>
                <button
                  type="button"
                  onClick={() => handleSelect('All')}
                  className="text-amber-400/80 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Reset to All Ethiopia
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
