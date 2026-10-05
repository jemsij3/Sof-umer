import React, { useState } from 'react';
import { 
  Camera, ArrowLeft, ArrowRight, Trash2, Film, AlertCircle, Loader2 
} from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { 
  getTranslatedCategoryName, 
  getTranslatedSubcategoryName,
  getTranslatedFurnished, 
  getTranslatedCondition,
  getTranslatedFieldLabel,
  getTranslatedOption
} from '../../lib/categoriesData';

interface ProductCategoryConfig {
  titlePlaceholder: string;
  brandLabel: string;
  brandPlaceholder: string;
  modelLabel: string;
  modelPlaceholder: string;
}

const PRODUCT_CATEGORY_CONFIGS: Record<string, ProductCategoryConfig> = {
  'Electronics & Gadgets': {
    titlePlaceholder: 'e.g., Samsung 55" 4K Smart TV',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Samsung, LG, Sony',
    modelLabel: 'Model / Specifications',
    modelPlaceholder: 'e.g., QLED 55-inch, 4K UHD, 120Hz'
  },
  'Phones & Tablets': {
    titlePlaceholder: 'e.g., iPhone 15 Pro Max 256GB',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Apple, Samsung, Xiaomi',
    modelLabel: 'Model / Storage',
    modelPlaceholder: 'e.g., iPhone 15 Pro Max, 256GB'
  },
  'Computers & Laptops': {
    titlePlaceholder: 'e.g., Dell Latitude 5420 Core i5 16GB RAM',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Dell, HP, Lenovo, Apple',
    modelLabel: 'Model / Specifications',
    modelPlaceholder: 'e.g., Latitude 5420, Core i5, 16GB RAM, 512GB SSD'
  },
  'Furniture & Home': {
    titlePlaceholder: 'e.g., Modern 6-Seater Dining Table',
    brandLabel: 'Brand / Maker',
    brandPlaceholder: 'e.g., IKEA, Local Maker, Custom Made',
    modelLabel: 'Material / Dimensions',
    modelPlaceholder: 'e.g., Solid Wood, 180 × 90 cm'
  },
  'Clothing & Fashion': {
    titlePlaceholder: "e.g., Men's Cotton Casual Shirt",
    brandLabel: 'Brand / Designer',
    brandPlaceholder: 'e.g., Nike, Adidas, Zara, Local Brand',
    modelLabel: 'Size / Material',
    modelPlaceholder: 'e.g., L, XL, 100% Cotton, Denim'
  },
  'Babies & Kids': {
    titlePlaceholder: 'e.g., Baby Stroller with Adjustable Seat',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Chicco, Graco, Local Brand',
    modelLabel: 'Age / Size / Details',
    modelPlaceholder: 'e.g., 6–24 months, Adjustable, Foldable'
  },
  'Health & Beauty': {
    titlePlaceholder: 'e.g., CeraVe Moisturizing Cream 454g',
    brandLabel: 'Brand',
    brandPlaceholder: "e.g., CeraVe, Nivea, L'Oréal",
    modelLabel: 'Size / Product Details',
    modelPlaceholder: 'e.g., 454g, Moisturizer, Original'
  },
  'Agriculture & Food': {
    titlePlaceholder: 'e.g., Premium Teff Grain 50kg',
    brandLabel: 'Brand / Producer',
    brandPlaceholder: 'e.g., Local Farm, Producer Name',
    modelLabel: 'Quantity / Weight',
    modelPlaceholder: 'e.g., 50kg, 25kg, 10 bags'
  },
  'Animals & Pets': {
    titlePlaceholder: 'e.g., Healthy German Shepherd Puppy',
    brandLabel: 'Breed / Type',
    brandPlaceholder: 'e.g., German Shepherd, Labrador, Local Breed',
    modelLabel: 'Age / Gender / Details',
    modelPlaceholder: 'e.g., 4 months, Male, Vaccinated'
  },
  'Sports & Outdoors': {
    titlePlaceholder: 'e.g., Nike Football Boots Size 42',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Nike, Adidas, Puma',
    modelLabel: 'Size / Type / Details',
    modelPlaceholder: 'e.g., Size 42, FG Boots, Synthetic Leather'
  },
  'Commercial Equipment': {
    titlePlaceholder: 'e.g., Commercial 2-Group Coffee Machine',
    brandLabel: 'Brand',
    brandPlaceholder: 'e.g., Rancilio, La Marzocco, Local Brand',
    modelLabel: 'Model / Specifications',
    modelPlaceholder: 'e.g., 2-group, 220V, Stainless Steel'
  },
  'Other Products': {
    titlePlaceholder: 'e.g., Premium Product for Sale',
    brandLabel: 'Brand / Maker',
    brandPlaceholder: 'e.g., Brand Name, Local Maker',
    modelLabel: 'Product Details',
    modelPlaceholder: 'e.g., Size, Material, Model, Key Features'
  }
};

PRODUCT_CATEGORY_CONFIGS['Electronics'] = PRODUCT_CATEGORY_CONFIGS['Electronics & Gadgets'];
PRODUCT_CATEGORY_CONFIGS['Furniture'] = PRODUCT_CATEGORY_CONFIGS['Furniture & Home'];
PRODUCT_CATEGORY_CONFIGS['Others'] = PRODUCT_CATEGORY_CONFIGS['Other Products'];

function getProductCategoryConfig(subcat?: string): ProductCategoryConfig {
  if (!subcat) return PRODUCT_CATEGORY_CONFIGS['Other Products'];
  const s = subcat.trim().toLowerCase();

  if (s.includes('electronic')) return PRODUCT_CATEGORY_CONFIGS['Electronics & Gadgets'];
  if (s.includes('phone') || s.includes('tablet')) return PRODUCT_CATEGORY_CONFIGS['Phones & Tablets'];
  if (s.includes('computer') || s.includes('laptop')) return PRODUCT_CATEGORY_CONFIGS['Computers & Laptops'];
  if (s.includes('furniture') || s.includes('home')) return PRODUCT_CATEGORY_CONFIGS['Furniture & Home'];
  if (s.includes('cloth') || s.includes('fashion')) return PRODUCT_CATEGORY_CONFIGS['Clothing & Fashion'];
  if (s.includes('babi') || s.includes('baby') || s.includes('kid')) return PRODUCT_CATEGORY_CONFIGS['Babies & Kids'];
  if (s.includes('health') || s.includes('beauty')) return PRODUCT_CATEGORY_CONFIGS['Health & Beauty'];
  if (s.includes('agricultur') || s.includes('food') || s.includes('grain')) return PRODUCT_CATEGORY_CONFIGS['Agriculture & Food'];
  if (s.includes('animal') || s.includes('pet')) return PRODUCT_CATEGORY_CONFIGS['Animals & Pets'];
  if (s.includes('sport') || s.includes('outdoor')) return PRODUCT_CATEGORY_CONFIGS['Sports & Outdoors'];
  if (s.includes('commercial') || s.includes('equipment')) return PRODUCT_CATEGORY_CONFIGS['Commercial Equipment'];
  if (s.includes('other')) return PRODUCT_CATEGORY_CONFIGS['Other Products'];

  return PRODUCT_CATEGORY_CONFIGS[subcat] || PRODUCT_CATEGORY_CONFIGS['Other Products'];
}

const LOCAL_BUSINESS_TITLE_PLACEHOLDERS: Record<string, string> = {
  'Restaurants & Cafes': 'e.g., Habesha Family Restaurant & Cafe',
  'Shops & Supermarkets': 'e.g., Bole Family Supermarket',
  'Salons & Beauty': 'e.g., Elegant Beauty Salon',
  'Salons & Beauty Shops': 'e.g., Elegant Beauty Salon',
  'Auto Repair & Garage': 'e.g., Bole Auto Repair & Garage',
  'Pharmacies & Health': 'e.g., Sunrise Pharmacy & Clinic',
  'Pharmacies & Clinics': 'e.g., Sunrise Pharmacy & Clinic',
  'Agencies & Consultancy': 'e.g., Abbadinsa Business Consultancy',
  'Hotels & Lodging': 'e.g., Addis View Hotel & Guest House',
  'Hotels & Guest Houses': 'e.g., Addis View Hotel & Guest House'
};

function getLocalBusinessTitlePlaceholder(subcat?: string): string {
  if (!subcat) return 'e.g., Habesha Family Restaurant & Cafe';
  if (LOCAL_BUSINESS_TITLE_PLACEHOLDERS[subcat]) {
    return LOCAL_BUSINESS_TITLE_PLACEHOLDERS[subcat];
  }
  const s = subcat.trim().toLowerCase();
  if (s.includes('restaurant') || s.includes('cafe')) return 'e.g., Habesha Family Restaurant & Cafe';
  if (s.includes('shop') || s.includes('supermarket')) return 'e.g., Bole Family Supermarket';
  if (s.includes('salon') || s.includes('beauty')) return 'e.g., Elegant Beauty Salon';
  if (s.includes('auto') || s.includes('garage') || s.includes('repair')) return 'e.g., Bole Auto Repair & Garage';
  if (s.includes('pharm') || s.includes('clinic') || s.includes('health')) return 'e.g., Sunrise Pharmacy & Clinic';
  if (s.includes('agency') || s.includes('agencies') || s.includes('consult')) return 'e.g., Abbadinsa Business Consultancy';
  if (s.includes('hotel') || s.includes('guest') || s.includes('lodg')) return 'e.g., Addis View Hotel & Guest House';

  return 'e.g., Habesha Family Restaurant & Cafe';
}

interface WizardStep2DetailsProps {
  majorCategory: string;
  subcategory?: string;
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
  currentUser?: any;
}

export const WizardStep2Details: React.FC<WizardStep2DetailsProps> = ({
  majorCategory,
  subcategory,
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
  videoError,
  currentUser
}) => {
  const { currentUser: contextUser, t, currentLanguage } = useApp();
  const user = currentUser || contextUser;

  const formData = fieldsState;
  const setFormData = (updater: any) => {
    if (typeof updater === 'function') {
      const next = updater(fieldsState);
      Object.keys(next).forEach(k => handleFieldChange(k, next[k]));
    } else {
      Object.keys(updater).forEach(k => handleFieldChange(k, updater[k]));
    }
  };

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

  const activeSubcategory = subcategory || fieldsState.subcategory || '';
  const productConfig = getProductCategoryConfig(activeSubcategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dynamic Inputs */}
      {majorCategory === 'Products' ? (
        <div className="space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {t('product_details_media') || 'Product Details & Media'}
            </h4>
            <p className="text-[10px] text-white/40">
              {activeSubcategory ? getTranslatedSubcategoryName(activeSubcategory, currentLanguage) : (t('specSubtext') || 'Enter accurate specifications for your product')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              1. {t('titleLabel') || 'Listing Title'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={productConfig.titlePlaceholder}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                2. {getTranslatedFieldLabel(productConfig.brandLabel, currentLanguage) || productConfig.brandLabel}
              </label>
              <input
                type="text"
                value={fieldsState.brand || ''}
                placeholder={productConfig.brandPlaceholder}
                onChange={e => handleFieldChange('brand', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {getTranslatedFieldLabel(productConfig.modelLabel, currentLanguage) || productConfig.modelLabel}
              </label>
              <input
                type="text"
                value={(fieldsState.model !== undefined && fieldsState.model !== '') ? fieldsState.model : (fieldsState.storageSpec || '')}
                placeholder={productConfig.modelPlaceholder}
                onChange={e => {
                  handleFieldChange('model', e.target.value);
                  handleFieldChange('storageSpec', e.target.value);
                }}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                3. {t('condition') || 'Condition'} *
              </label>
              <select
                value={fieldsState.condition || 'New'}
                onChange={e => handleFieldChange('condition', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              >
                <option value="New" className="bg-[#0c0c0c]">{getTranslatedCondition('New', currentLanguage)}</option>
                <option value="Refurbished" className="bg-[#0c0c0c]">{getTranslatedCondition('Refurbished', currentLanguage)}</option>
                <option value="Used - Like New" className="bg-[#0c0c0c]">{getTranslatedCondition('Used - Like New', currentLanguage)}</option>
                <option value="Used - Good" className="bg-[#0c0c0c]">{getTranslatedCondition('Used - Good', currentLanguage)}</option>
                <option value="For Parts / Not Working" className="bg-[#0c0c0c]">{getTranslatedCondition('For Parts / Not Working', currentLanguage)}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                4. {t('locLabel') || 'Location'} *
              </label>
              <input
                type="text"
                required
                value={fieldsState.location || ''}
                placeholder={t('locPlaceholder') || 'e.g. Bole Medhanialem, Addis Ababa'}
                onChange={e => handleFieldChange('location', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              5. {t('descLabel') || 'Description'} *
            </label>
            <textarea
              required
              rows={3}
              value={fieldsState.description || ''}
              placeholder={t('product_desc_placeholder') || 'Describe key features, condition, benefits, and special terms...'}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              6. {(t('contact_phone_label') || 'Contact Phone').replace(/\s*\*+$/, '')} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.contactPhone || fieldsState.ownerPhone || ''}
              placeholder="+251 91 123 4567"
              onChange={e => {
                handleFieldChange('contactPhone', e.target.value);
                handleFieldChange('ownerPhone', e.target.value);
              }}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Admin-Only: Listing on Behalf of Owner */}
          {(user?.role === 'admin' || user?.isAdmin) && (
            <div className="flex flex-col gap-2 my-4 p-4 bg-[#141418] border border-[#F5A623]/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#F5A623] text-black font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin_only_badge') || 'Admin Only'}
                </span>
                <label className="text-sm font-medium text-[#F5A623] tracking-wider">
                  {t('ownerNameLabel') || 'Property / Item Owner Name'} *
                </label>
              </div>
              <input
                type="text"
                placeholder={t('ownerNamePlaceholder') || 'e.g., Abebe Kebede (Client Name)'}
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#1A1B22] text-white border border-[#22242E] rounded-lg p-3 focus:border-[#F5A623] outline-none text-sm placeholder:text-gray-500"
                required={(user?.role === 'admin' || user?.isAdmin)}
              />
              <p className="text-xs text-gray-400">
                {t('ownerNameDesc') || 'Enter the full name of the owner you are listing on behalf of.'}
              </p>
            </div>
          )}
        </div>
      ) : majorCategory === 'Jobs' ? (
        <div className="space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {t('job_details') || 'Job Details'}
            </h4>
            <p className="text-[10px] text-white/40">
              {getTranslatedCategoryName('Jobs', currentLanguage)}
            </p>
          </div>

          {/* 1. Job Title* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              1. {t('job_title_label') || 'Job Title'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={t('job_title_placeholder') || 'e.g., Senior Full Stack Developer / Accountant'}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 2. Location* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              2. {t('locLabel') || 'Location'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.location || ''}
              placeholder={t('locPlaceholder') || 'e.g. Bole, Addis Ababa'}
              onChange={e => handleFieldChange('location', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 3. Employment Skill* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              3. {t('employment_skill_label') || 'Employment Skill'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.employmentSkill || fieldsState.qualification || ''}
              placeholder={t('employment_skill_placeholder') || 'e.g., React, TypeScript, Accounting, Financial Analysis, Sales'}
              onChange={e => {
                handleFieldChange('employmentSkill', e.target.value);
                handleFieldChange('qualification', e.target.value);
              }}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 4. Work Arrangement* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              4. {t('work_arrangement_label') || 'Work Arrangement'} *
            </label>
            <select
              required
              value={fieldsState.workArrangement || 'On-site'}
              onChange={e => handleFieldChange('workArrangement', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            >
              <option value="On-site">{t('work_arr_onsite') || 'On-site'}</option>
              <option value="Remote">{t('work_arr_remote') || 'Remote'}</option>
              <option value="Hybrid">{t('work_arr_hybrid') || 'Hybrid'}</option>
            </select>
          </div>

          {/* 5. Description* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              5. {t('descLabel') || 'Description'} *
            </label>
            <textarea
              required
              rows={4}
              value={fieldsState.description || ''}
              placeholder={t('job_desc_placeholder') || 'Describe job responsibilities, key qualifications, benefits, and requirements...'}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 6. Contact Phone* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              6. {t('contact_phone_label') || 'Contact Phone'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.contactPhone || ''}
              placeholder="+251 91 123 4567"
              onChange={e => handleFieldChange('contactPhone', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Admin-Only: Listing on Behalf of Owner / Employer */}
          {(user?.role === 'admin' || user?.isAdmin) && (
            <div className="flex flex-col gap-2 my-4 p-4 bg-[#141418] border border-[#F5A623]/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#F5A623] text-black font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin_only_badge') || 'Admin Only'}
                </span>
                <label className="text-sm font-medium text-[#F5A623] tracking-wider">
                  {t('employerNameLabel') || 'Company / Employer Name'} *
                </label>
              </div>
              <input
                type="text"
                placeholder={t('employerNamePlaceholder') || 'e.g., Acme Corp (Client Name)'}
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#1A1B22] text-white border border-[#22242E] rounded-lg p-3 focus:border-[#F5A623] outline-none text-sm placeholder:text-gray-500"
                required={(user?.role === 'admin' || user?.isAdmin)}
              />
              <p className="text-xs text-gray-400">
                {t('employerNameDesc') || 'Enter the name of the hiring organization you are listing on behalf of.'}
              </p>
            </div>
          )}
        </div>
      ) : majorCategory === 'Services' ? (
        <div className="space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {t('service_details') || 'Service Details'}
            </h4>
            <p className="text-[10px] text-white/40">
              {getTranslatedCategoryName('Services', currentLanguage)}
            </p>
          </div>

          {/* 1. Service Title* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              1. {t('service_title_label') || 'Service Title'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={t('service_title_placeholder') || 'e.g., Professional House Cleaning & Painting'}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 2. Location* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              2. {t('locLabel') || 'Location'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.location || ''}
              placeholder={t('locPlaceholder') || 'e.g. Bole, Addis Ababa'}
              onChange={e => handleFieldChange('location', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 3. Description* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              3. {t('descLabel') || 'Description'} *
            </label>
            <textarea
              required
              rows={4}
              value={fieldsState.description || ''}
              placeholder={t('service_desc_placeholder') || 'Describe the services you offer, qualifications, experience, and workflow...'}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* 4. Contact Phone* */}
          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              4. {t('contact_phone_label') || 'Contact Phone'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.contactPhone || ''}
              placeholder="+251 91 123 4567"
              onChange={e => handleFieldChange('contactPhone', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Admin-Only: Listing on Behalf of Owner / Provider */}
          {(user?.role === 'admin' || user?.isAdmin) && (
            <div className="flex flex-col gap-2 my-4 p-4 bg-[#141418] border border-[#F5A623]/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#F5A623] text-black font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin_only_badge') || 'Admin Only'}
                </span>
                <label className="text-sm font-medium text-[#F5A623] tracking-wider">
                  {t('ownerNameLabel') || 'Service Provider / Owner Name'} *
                </label>
              </div>
              <input
                type="text"
                placeholder={t('ownerNamePlaceholder') || 'e.g., Abebe Kebede (Client Name)'}
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#1A1B22] text-white border border-[#22242E] rounded-lg p-3 focus:border-[#F5A623] outline-none text-sm placeholder:text-gray-500"
                required={(user?.role === 'admin' || user?.isAdmin)}
              />
              <p className="text-xs text-gray-400">
                {t('ownerNameDesc') || 'Enter the full name of the service provider you are listing on behalf of.'}
              </p>
            </div>
          )}
        </div>
      ) : majorCategory === 'Local Businesses' ? (
        <div className="space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {t('business_details_media') || 'Business Details & Media'}
            </h4>
            <p className="text-[10px] text-white/40">
              {activeSubcategory ? getTranslatedSubcategoryName(activeSubcategory, currentLanguage) : (t('business_details_subtext') || 'Enter accurate details for your business')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              1. {t('titleLabel') || 'Listing Title'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={getLocalBusinessTitlePlaceholder(activeSubcategory)}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                2. {t('locLabel') || 'Location'} *
              </label>
              <input
                type="text"
                required
                value={fieldsState.location || ''}
                placeholder="e.g., Bole, Addis Ababa"
                onChange={e => handleFieldChange('location', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                3. {(t('contact_phone_label') || 'Contact Phone').replace(/\s*\*+$/, '')} *
              </label>
              <input
                type="text"
                required
                value={fieldsState.contactPhone || fieldsState.ownerPhone || ''}
                placeholder="+251 91 123 4567"
                onChange={e => {
                  handleFieldChange('contactPhone', e.target.value);
                  handleFieldChange('ownerPhone', e.target.value);
                }}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              4. {t('descLabel') || 'Description'} *
            </label>
            <textarea
              required
              rows={3}
              value={fieldsState.description || ''}
              placeholder={t('business_desc_placeholder') || 'Describe your business, services, products, opening hours, and other important information...'}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Admin-Only: Listing on Behalf of Owner */}
          {(user?.role === 'admin' || user?.isAdmin) && (
            <div className="flex flex-col gap-2 my-4 p-4 bg-[#141418] border border-[#F5A623]/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#F5A623] text-black font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin_only_badge') || 'Admin Only'}
                </span>
                <label className="text-sm font-medium text-[#F5A623] tracking-wider">
                  {t('ownerNameLabel') || 'Business Owner Name'} *
                </label>
              </div>
              <input
                type="text"
                placeholder={t('ownerNamePlaceholder') || 'e.g., Abebe Kebede (Client Name)'}
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#1A1B22] text-white border border-[#22242E] rounded-lg p-3 focus:border-[#F5A623] outline-none text-sm placeholder:text-gray-500"
                required={(user?.role === 'admin' || user?.isAdmin)}
              />
              <p className="text-xs text-gray-400">
                {t('ownerNameDesc') || 'Enter the full name of the business owner you are listing on behalf of.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {getTranslatedCategoryName(majorCategory, currentLanguage)} {t('property_details') || 'Details'}
            </h4>
            <p className="text-[10px] text-white/40">
              {getTranslatedCategoryName(majorCategory, currentLanguage)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">
              {t('titleLabel') || 'Listing Title'} *
            </label>
            <input
              type="text"
              required
              value={fieldsState.title || ''}
              placeholder={majorCategory === 'Properties' ? (t('property_title_placeholder') || 'e.g. Modern 3 Bedroom Apartment in Bole') : majorCategory === 'Vehicles' ? (t('vehicle_title_placeholder') || 'e.g. Toyota RAV4 2022 Hybrid') : (t('titlePlaceholder') || 'Professional Listing')}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {majorCategory === 'Properties' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                    {t('purpose') || getTranslatedFieldLabel('purpose', currentLanguage) || 'Purpose'} *
                  </label>
                  <select
                    value={fieldsState.purpose || 'Sale'}
                    onChange={e => handleFieldChange('purpose', e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                  >
                    <option value="Sale">{t('option_for_sale') || getTranslatedOption('Sale', currentLanguage) || 'For Sale'}</option>
                    <option value="Rent">{t('option_for_rent') || getTranslatedOption('Rent', currentLanguage) || 'For Rent'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('bedrooms') || 'Bedrooms'}</label>
                  <input
                    type="number"
                    value={fieldsState.bedrooms || ''}
                    placeholder="3"
                    onChange={e => handleFieldChange('bedrooms', e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('bathrooms') || 'Bathrooms'}</label>
                  <input
                    type="number"
                    value={fieldsState.bathrooms || ''}
                    placeholder="2"
                    onChange={e => handleFieldChange('bathrooms', e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('area') || 'Area (m²)'}</label>
                  <input
                    type="number"
                    value={fieldsState.area || ''}
                    placeholder="150"
                    onChange={e => handleFieldChange('area', e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                  {t('property_condition_status_label') || 'Property Condition / Status'}
                </label>
                <select
                  value={fieldsState.condition || ''}
                  onChange={e => handleFieldChange('condition', e.target.value)}
                  className="w-full p-3 bg-[#0A0A0C] border border-white/10 focus:border-[#F5A623] rounded-xl text-xs text-white focus:outline-none transition"
                >
                  <option value="" disabled className="bg-[#0A0A0C] text-white/40">{t('select_property_condition') || 'Select Property Condition / Status...'}</option>
                  <option value="Furnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Furnished', currentLanguage)}</option>
                  <option value="Unfurnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Unfurnished', currentLanguage)}</option>
                  <option value="Semi-Furnished" className="bg-[#0A0A0C]">{getTranslatedFurnished('Semi-Furnished', currentLanguage)}</option>
                  <option value="Under Construction" className="bg-[#0A0A0C]">{getTranslatedCondition('Under Construction', currentLanguage)}</option>
                  <option value="Brand New / Newly Built" className="bg-[#0A0A0C]">{getTranslatedCondition('Brand New / Newly Built', currentLanguage)}</option>
                </select>
              </div>
            </div>
          )}

          {majorCategory === 'Vehicles' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('brand') || 'Make / Brand'}</label>
                <input
                  type="text"
                  value={fieldsState.brand || ''}
                  placeholder="Toyota"
                  onChange={e => handleFieldChange('brand', e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('model') || 'Model'}</label>
                <input
                  type="text"
                  value={fieldsState.model || ''}
                  placeholder="RAV4"
                  onChange={e => handleFieldChange('model', e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('year') || 'Year'}</label>
                <input
                  type="number"
                  value={fieldsState.year || ''}
                  placeholder="2022"
                  onChange={e => handleFieldChange('year', e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('condition') || 'Condition'}</label>
                <select
                  value={(fieldsState.condition === 'New' ? 'Brand New' : fieldsState.condition) || 'Used'}
                  onChange={e => handleFieldChange('condition', e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white"
                >
                  <option value="Brand New">{getTranslatedCondition('Brand New', currentLanguage)}</option>
                  <option value="Used">{getTranslatedCondition('Used', currentLanguage)}</option>
                  <option value="Classic">{getTranslatedCondition('Classic', currentLanguage)}</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('locLabel') || 'Location'} *</label>
              <input
                type="text"
                required
                value={fieldsState.location || ''}
                placeholder={t('locPlaceholder') || 'e.g. Bole, Addis Ababa'}
                onChange={e => handleFieldChange('location', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase mb-1">
                {majorCategory === 'Vehicles'
                  ? ((t('contact_phone_label') || 'Contact Phone').includes('*') ? (t('contact_phone_label') || 'Contact Phone') : `${t('contact_phone_label') || 'Contact Phone'} *`)
                  : (t('ownerPhoneLabel') || 'Contact Phone *')}
              </label>
              <input
                type="text"
                required
                value={fieldsState.contactPhone || ''}
                placeholder="+251 91 123 4567"
                onChange={e => handleFieldChange('contactPhone', e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 uppercase mb-1">{t('descLabel') || 'Description'} *</label>
            <textarea
              required
              rows={3}
              value={fieldsState.description || ''}
              placeholder={t('descPlaceholder') || 'Detailed description of your listing...'}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Admin-Only: Listing on Behalf of Owner */}
          {(user?.role === 'admin' || user?.isAdmin) && (
            <div className="flex flex-col gap-2 my-4 p-4 bg-[#141418] border border-[#F5A623]/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#F5A623] text-black font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin_only_badge') || 'Admin Only'}
                </span>
                <label className="text-sm font-medium text-[#F5A623] tracking-wider">
                  {t('ownerNameLabel') || 'Property / Item Owner Name'} *
                </label>
              </div>
              <input
                type="text"
                placeholder={t('ownerNamePlaceholder') || 'e.g., Abebe Kebede (Client Name)'}
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#1A1B22] text-white border border-[#22242E] rounded-lg p-3 focus:border-[#F5A623] outline-none text-sm placeholder:text-gray-500"
                required={(user?.role === 'admin' || user?.isAdmin)}
              />
              <p className="text-xs text-gray-400">
                {t('ownerNameDesc') || 'Enter the full name of the owner you are listing on behalf of.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Combined Media Upload Drop Zone */}
      <div className="space-y-3 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
            {majorCategory === 'Jobs' 
              ? (t('media_upload_optional') || '7. Media Upload (Photos & Video) (Optional)') 
              : majorCategory === 'Services'
              ? (t('service_media_upload_optional') || '5. Media Upload (Photos & Video) (Optional)')
              : majorCategory === 'Products'
              ? `7. ${(t('media_upload_title') || 'Media Upload (Photos & Video) *').replace(/\s*\*+$/, '')} *`
              : majorCategory === 'Local Businesses'
              ? `5. ${(t('media_upload_title') || 'Media Upload (Photos & Video) *').replace(/\s*\*+$/, '')} *`
              : (t('media_upload_title') || 'Media Upload (Photos & Video) *')}
          </label>
          <span className="text-[11px] font-mono text-white/50">
            {imagesList.length} / 10 {t('photosCount') || 'photos'}
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
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-white/15 bg-zinc-900/40 hover:border-amber-500/40 hover:bg-zinc-900/60'
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
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="w-6 h-6" />
            </div>

            <button
              type="button"
              onClick={() => document.getElementById('media-file-input')?.click()}
              disabled={isCompressingPhotos || isVideoUploading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              {isCompressingPhotos ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('compressing_photos') || 'Compressing Photos...'}</span>
                </>
              ) : isVideoUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('processing_video') || 'Processing Video...'}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>📷 {t('upload_photos_video_btn') || 'Upload Photos/Video'}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-white/40 mt-1">
              {t('media_upload_instructions') || 'Drag & drop photos or short video (JPG, PNG, WebP up to 10MB; MP4/MOV up to 50MB)'}
            </p>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-4 font-medium transition cursor-pointer mt-1"
            >
              {showUrlInput ? (t('hide_url_input') || 'Hide URL paste input') : (t('or_paste_media_url') || 'or paste image/video URL')}
            </button>
          </div>

          {showUrlInput && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
              <input
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder={t('media_url_placeholder') || 'https://example.com/photo.jpg or video link'}
                className="flex-1 bg-black/60 border border-white/15 focus:border-amber-500 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap border border-amber-500/30"
              >
                {t('common.confirm') || 'Add URL'}
              </button>
            </div>
          )}
        </div>

        {photoError && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        {videoError && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{videoError}</span>
          </div>
        )}

        {/* Photos Thumbnail Grid */}
        {imagesList.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] text-white/60 font-medium">
              {t('uploaded_photos_info', { count: imagesList.length }) || 'Uploaded Photos (' + imagesList.length + ') • First photo is Cover Photo'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {imagesList.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/15 bg-black group">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      {t('cover_photo_badge') || '⭐ Cover Photo'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverPhoto(idx)}
                        className="bg-amber-500 text-black text-[9px] font-bold px-2 py-1 rounded hover:bg-amber-400 transition"
                        title={t('make_cover_btn') || 'Cover'}
                      >
                        {t('make_cover_btn') || 'Cover'}
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'left')}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white text-[10px]"
                        title={t('move_left_btn') || 'Move Left'}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < imagesList.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(idx, 'right')}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white text-[10px]"
                        title={t('move_right_btn') || 'Move Right'}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setImagesList(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 bg-rose-500/80 hover:bg-rose-500 rounded text-white text-[10px]"
                      title={t('delete_photo_btn') || 'Delete Photo'}
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
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium truncate">
              <Film className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{t('video_attached') || 'Video attached:'} {fieldsState.video.slice(0, 40)}...</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer shrink-0 ml-2"
            >
              {t('remove_video_btn') || 'Remove'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
