import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw, Building, ExternalLink, X, Eye, Sparkles } from 'lucide-react';
import { extractString } from '../lib/categoriesData';

interface MarketplaceMapWidgetProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onSelectProperty: (property: Property) => void;
  currentLanguage?: string;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  className?: string;
}

// Coordinate mapping for Ethiopian regions & Addis Ababa districts (normalized percentage positions 0-100)
const KNOWN_LOCATIONS: { [key: string]: { x: number; y: number } } = {
  'bole': { x: 55, y: 52 },
  'kazanchis': { x: 50, y: 46 },
  'sarbet': { x: 44, y: 54 },
  'cmc': { x: 65, y: 45 },
  'piassa': { x: 46, y: 42 },
  'mexico': { x: 45, y: 48 },
  'ayat': { x: 72, y: 44 },
  'megenagna': { x: 58, y: 45 },
  'addis ababa': { x: 50, y: 50 },
  'hawassa': { x: 52, y: 76 },
  'adama': { x: 62, y: 58 },
  'bahir dar': { x: 38, y: 28 },
  'dire dawa': { x: 78, y: 46 },
  'bishoftu': { x: 58, y: 55 },
  'oromia': { x: 56, y: 58 },
  'amhara': { x: 42, y: 32 }
};

export function MarketplaceMapWidget({
  properties,
  selectedProperty,
  onSelectProperty,
  currentLanguage = 'en',
  selectedLocation = 'All',
  onLocationChange,
  className = ''
}: MarketplaceMapWidgetProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [hoveredProp, setHoveredProp] = useState<Property | null>(null);
  const [activePinProp, setActivePinProp] = useState<Property | null>(null);

  // Map properties to coordinates on our interactive Ethiopia/Addis vector map
  const mappedProperties = useMemo(() => {
    return properties.map((prop, idx) => {
      const locStr = (typeof prop.location === 'string' ? prop.location : extractString(prop.location, currentLanguage))?.toLowerCase() || '';
      
      let baseCoord = { x: 50, y: 50 };
      for (const [key, coord] of Object.entries(KNOWN_LOCATIONS)) {
        if (locStr.includes(key)) {
          baseCoord = coord;
          break;
        }
      }

      // Add deterministic jitter so multiple pins in the same neighborhood do not completely overlap
      const seed = (prop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + idx * 7);
      const jitterX = ((seed % 19) - 9) * 1.4;
      const jitterY = (((seed * 3) % 19) - 9) * 1.4;

      const finalX = Math.max(12, Math.min(88, baseCoord.x + jitterX));
      const finalY = Math.max(12, Math.min(88, baseCoord.y + jitterY));

      return {
        property: prop,
        x: finalX,
        y: finalY
      };
    });
  }, [properties, currentLanguage]);

  const activeProp = activePinProp || hoveredProp;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 2.2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.8));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`relative bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Map Header Controls */}
      <div className="p-3.5 bg-white/90 backdrop-blur-md border-b border-stone-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C06853]/10 text-[#C06853] rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 leading-tight">Interactive Map</h4>
            <p className="text-[10px] text-stone-500">{properties.length} listings in this area</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200/60">
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white text-stone-700 rounded-md transition shadow-xs cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white text-stone-700 rounded-md transition shadow-xs cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-white text-stone-700 rounded-md transition shadow-xs cursor-pointer"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative flex-1 min-h-[360px] overflow-hidden bg-[#F4F1EA]">
        {/* Architectural grid and topography lines */}
        <div 
          className="absolute inset-0 transition-transform duration-300 origin-center pointer-events-none"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Subtle stylized topography / district roads */}
          <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
            <defs>
              <pattern id="road-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2DDD5" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-grid)" />
            
            {/* Soft green parks / geographical zones */}
            <path d="M 60,80 Q 90,60 140,90 T 200,120 Q 160,180 100,160 Z" fill="#E3EBE0" opacity="0.7" />
            <path d="M 220,190 Q 280,160 340,210 T 380,290 Q 310,340 240,280 Z" fill="#E3EBE0" opacity="0.6" />
            <path d="M 120,260 Q 180,240 210,310 T 170,380 Q 110,360 80,300 Z" fill="#E8F0E4" opacity="0.7" />

            {/* Major Arteries / Ring Roads */}
            <circle cx="200" cy="200" r="110" fill="none" stroke="#D5CEC2" strokeWidth="2.5" strokeDasharray="6 3" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#D5CEC2" strokeWidth="1.5" />
            
            {/* Expressways */}
            <path d="M 20,200 L 380,200" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M 200,20 L 200,380" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M 60,60 L 340,340" stroke="#F0ECE4" strokeWidth="2.5" />
            <path d="M 340,60 L 60,340" stroke="#F0ECE4" strokeWidth="2.5" />

            {/* District Labels */}
            <text x="215" y="195" fill="#A89F91" fontSize="9" fontWeight="bold" letterSpacing="0.05em">ADDIS ABABA</text>
            <text x="245" y="215" fill="#B4ABA0" fontSize="7.5" fontWeight="600">BOLE</text>
            <text x="160" y="180" fill="#B4ABA0" fontSize="7.5" fontWeight="600">PIASSA</text>
            <text x="260" y="170" fill="#B4ABA0" fontSize="7.5" fontWeight="600">CMC</text>
            <text x="145" y="225" fill="#B4ABA0" fontSize="7.5" fontWeight="600">SARBET</text>
            <text x="220" y="315" fill="#B4ABA0" fontSize="7.5" fontWeight="600">HAWASSA</text>
            <text x="120" y="90" fill="#B4ABA0" fontSize="7.5" fontWeight="600">BAHIR DAR</text>
            <text x="310" y="150" fill="#B4ABA0" fontSize="7.5" fontWeight="600">DIRE DAWA</text>
          </svg>
        </div>

        {/* Interactive Property Pin Markers */}
        <div 
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {mappedProperties.map(({ property, x, y }) => {
            const isHovered = activeProp?.id === property.id;
            const isSelected = selectedProperty?.id === property.id;
            const formattedPrice = property.price >= 1000000 
              ? `${(property.price / 1000000).toFixed(1)}M`
              : property.price >= 1000 
              ? `${(property.price / 1000).toFixed(0)}k` 
              : property.price.toLocaleString();
            const currency = property.currency || 'ETB';

            return (
              <div
                key={property.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActivePinProp(property);
                    onSelectProperty(property);
                  }}
                  onMouseEnter={() => setHoveredProp(property)}
                  onMouseLeave={() => setHoveredProp(null)}
                  className={`group relative flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold shadow-md transition-all duration-200 cursor-pointer ${
                    isSelected || isHovered
                      ? 'bg-[#C06853] text-white scale-110 ring-4 ring-[#C06853]/25 z-30 shadow-lg'
                      : 'bg-white text-stone-800 hover:bg-[#C06853] hover:text-white border border-stone-300'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{currency} {formattedPrice}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Floating Quick Preview Card when a Pin is Hovered or Clicked */}
        {activeProp && (
          <div className="absolute bottom-3 inset-x-3 z-40 animate-fade-in pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-stone-200 shadow-xl flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 relative">
                <img
                  src={activeProp.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80'}
                  alt={extractString(activeProp.title, currentLanguage)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[9px] font-bold text-[#C06853] uppercase tracking-wider bg-[#C06853]/10 px-1.5 py-0.5 rounded">
                    {activeProp.propertyType || activeProp.category || 'Listing'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePinProp(null);
                      setHoveredProp(null);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="text-xs font-bold text-stone-900 truncate leading-tight">
                  {extractString(activeProp.title, currentLanguage)}
                </h5>
                <p className="text-[11px] font-mono font-bold text-[#C06853] mt-0.5">
                  {(activeProp.price || 0).toLocaleString()} {activeProp.currency || 'ETB'}
                </p>
                <p className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-[#C06853]" />
                  {extractString(activeProp.location, currentLanguage)}
                </p>
              </div>

              <button
                onClick={() => onSelectProperty(activeProp)}
                className="px-3 py-2 bg-[#C06853] hover:bg-[#A85340] text-white text-[11px] font-bold uppercase rounded-lg shadow-sm transition shrink-0"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Location Quick Legend / Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-stone-200/80 shadow-xs text-[10px] text-stone-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C06853] animate-pulse" />
          <span>Showing listings in Ethiopia</span>
        </div>
      </div>
    </div>
  );
}
export default MarketplaceMapWidget;
