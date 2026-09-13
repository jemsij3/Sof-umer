import React, { useState } from 'react';
import { 
  Camera, ArrowLeft, ArrowRight, Trash2, Film, AlertCircle, Loader2 
} from 'lucide-react';

interface WizardStep2DetailsProps {
  majorCategory: string;
  fieldsState: Record<string, any>;
  handleFieldChange: (field: string, value: any) => void;
  imagesList: string[];
  setImagesList: React.Dispatch<React.SetStateAction<string[]>>;
  handleSetCoverPhoto: (idx: number) => void;
  handleMovePhoto: (idx: number, direction: 'left' | 'right') => void;
  handleMediaUpload: (files: FileList | null) => Promise<void>;
  handleRemoveVideo: () => void;
  isCompressingPhotos: boolean;
  isVideoUploading: boolean;
  photoError: string;
  videoError: string;
}

export const WizardStep2Details: React.FC<WizardStep2DetailsProps> = ({
  majorCategory,
  fieldsState,
  handleFieldChange,
  imagesList,
  setImagesList,
  handleSetCoverPhoto,
  handleMovePhoto,
  handleMediaUpload,
  handleRemoveVideo,
  isCompressingPhotos,
  isVideoUploading,
  photoError,
  videoError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  const handleAddMediaUrl = () => {
    if (!mediaUrlInput || !mediaUrlInput.trim()) return;
    const url = mediaUrlInput.trim();
    if (url.match(/\.(mp4|mov|webm)$/i) || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
      handleFieldChange('video', url);
      setMediaUrlInput('');
      setShowUrlInput(false);
    } else {
      if (imagesList.length >= 10) return;
      setImagesList(prev => [...prev, url]);
      setMediaUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dynamic Inputs */}
      {majorCategory === 'Products' ? (
        <div className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="border-l-2 border-[#C06853] pl-3">
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Product Specifications
            </h4>
            <p className="text-[10px] text-stone-500">Enter accurate specifications for your product</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder="e.g., iPhone 15 Pro Max 256GB Natural Titanium"
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Brand
              </label>
              <input
                type="text"
                value={fieldsState.brand || ''}
                placeholder="e.g. Apple, Samsung, Nike"
                onChange={e => handleFieldChange('brand', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Model
              </label>
              <input
                type="text"
                value={fieldsState.model || ''}
                placeholder="e.g. A2849, Galaxy S24"
                onChange={e => handleFieldChange('model', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Specs / Storage
              </label>
              <input
                type="text"
                value={fieldsState.storageSpec || ''}
                placeholder="e.g. 256GB SSD, 16GB RAM, 100% Cotton"
                onChange={e => handleFieldChange('storageSpec', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Condition *
              </label>
              <select
                value={fieldsState.condition || 'New'}
                onChange={e => handleFieldChange('condition', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              >
                <option value="New">New (Brand new sealed in box)</option>
                <option value="Refurbished">Refurbished (Tested & certified)</option>
                <option value="Used - Like New">Used - Like New (Mint condition)</option>
                <option value="Used - Good">Used - Good (Normal signs of wear)</option>
                <option value="For Parts / Not Working">For Parts / Not Working</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={fieldsState.location || ''}
                placeholder="e.g. Bole Medhanialem, Addis Ababa"
                onChange={e => handleFieldChange('location', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
              Product Description *
            </label>
            <textarea
              required
              rows={3}
              value={fieldsState.description || ''}
              placeholder="Describe your item, key features, warranty terms, and packaging..."
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
              Contact Phone Number *
            </label>
            <input
              type="text"
              required
              value={fieldsState.contactPhone || ''}
              placeholder="+251 91 123 4567"
              onChange={e => handleFieldChange('contactPhone', e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="border-l-2 border-[#C06853] pl-3">
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              {majorCategory} Details
            </h4>
            <p className="text-[10px] text-stone-500">Provide accurate information for {majorCategory}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={`e.g. ${majorCategory === 'Properties' ? 'Modern 3 Bedroom Apartment in Bole' : majorCategory === 'Vehicles' ? 'Toyota RAV4 2022 Hybrid' : 'Professional Listing'}`}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
            />
          </div>

          {majorCategory === 'Properties' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Purpose *</label>
                <select
                  value={fieldsState.purpose || 'Sale'}
                  onChange={e => handleFieldChange('purpose', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={fieldsState.bedrooms || ''}
                  placeholder="3"
                  onChange={e => handleFieldChange('bedrooms', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={fieldsState.bathrooms || ''}
                  placeholder="2"
                  onChange={e => handleFieldChange('bathrooms', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Area (m²)</label>
                <input
                  type="number"
                  value={fieldsState.area || ''}
                  placeholder="150"
                  onChange={e => handleFieldChange('area', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
            </div>
          )}

          {majorCategory === 'Vehicles' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Make / Brand</label>
                <input
                  type="text"
                  value={fieldsState.brand || ''}
                  placeholder="Toyota"
                  onChange={e => handleFieldChange('brand', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Model</label>
                <input
                  type="text"
                  value={fieldsState.model || ''}
                  placeholder="RAV4"
                  onChange={e => handleFieldChange('model', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Year</label>
                <input
                  type="number"
                  value={fieldsState.year || ''}
                  placeholder="2022"
                  onChange={e => handleFieldChange('year', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Condition</label>
                <select
                  value={fieldsState.condition || 'Used'}
                  onChange={e => handleFieldChange('condition', e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 shadow-xs"
                >
                  <option value="New">Brand New</option>
                  <option value="Used">Used</option>
                  <option value="Classic">Classic</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Location *</label>
              <input
                type="text"
                required
                value={fieldsState.location || ''}
                placeholder="e.g. Bole, Addis Ababa"
                onChange={e => handleFieldChange('location', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={fieldsState.contactPhone || ''}
                placeholder="+251 91 123 4567"
                onChange={e => handleFieldChange('contactPhone', e.target.value)}
                className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={fieldsState.description || ''}
              placeholder="Detailed description of your listing..."
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-white border border-stone-200 focus:border-[#C06853] rounded-xl text-xs text-stone-900 focus:outline-none transition shadow-xs font-sans"
            />
          </div>
        </div>
      )}

      {/* Combined Media Upload Drop Zone */}
      <div className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-widest">
            Media Upload (Photos & Video) *
          </label>
          <span className="text-[11px] font-mono text-stone-500 font-medium">
            {imagesList.length} / 10 photos
          </span>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleMediaUpload(e.dataTransfer.files);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-[#C06853] bg-[#C06853]/5'
              : 'border-stone-300 bg-stone-50/70 hover:border-[#C06853]/50 hover:bg-stone-50'
          }`}
        >
          <input
            type="file"
            id="media-file-input"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleMediaUpload(e.target.files);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#C06853]/10 border border-[#C06853]/20 flex items-center justify-center text-[#C06853]">
              <Camera className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={() => document.getElementById('media-file-input')?.click()}
              disabled={isCompressingPhotos || isVideoUploading}
              className="px-5 py-2.5 bg-[#C06853] hover:bg-[#A85340] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              {isCompressingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing Photos...</span>
                </>
              ) : isVideoUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload Photos / Video</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-500 mt-1">
              Drag & drop photos or short video (JPG, PNG, WebP up to 10MB; MP4/MOV up to 50MB)
            </p>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-[#C06853] hover:text-[#A85340] underline underline-offset-4 font-medium transition cursor-pointer mt-1"
            >
              {showUrlInput ? 'Hide URL paste input' : 'or paste image/video URL'}
            </button>
          </div>

          {showUrlInput && (
            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
              <input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg or video link"
                className="flex-1 bg-white border border-stone-200 focus:border-[#C06853] text-stone-900 rounded-xl px-3 py-2 text-xs focus:outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-4 py-2 bg-[#C06853]/10 hover:bg-[#C06853]/20 text-[#C06853] text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap border border-[#C06853]/30"
              >
                Add URL
              </button>
            </div>
          )}
        </div>

        {photoError && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{photoError}</span>
          </div>
        )}

        {videoError && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{videoError}</span>
          </div>
        )}

        {/* Photos Thumbnail Grid */}
        {imagesList.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] text-stone-600 font-medium">
              Uploaded Photos ({imagesList.length}) &bull; First photo is Cover Photo
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {imagesList.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-xs">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#C06853] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                      ⭐ Cover Photo
                    </span>
                  )}
                  <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverPhoto(idx)}
                        className="bg-[#C06853] text-white text-[9px] font-bold px-2 py-1 rounded hover:bg-[#A85340] transition"
                        title="Make Cover"
                      >
                        Cover
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'left')}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white text-[10px]"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < imagesList.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'right')}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white text-[10px]"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setImagesList(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 bg-rose-600 hover:bg-rose-700 rounded text-white text-[10px]"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fieldsState.video && (
          <div className="p-3 bg-[#C06853]/10 border border-[#C06853]/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#C06853] font-medium truncate">
              <Film className="w-4 h-4 text-[#C06853] shrink-0" />
              <span className="truncate">Video attached: {fieldsState.video.slice(0, 40)}...</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0 ml-2 font-semibold"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
