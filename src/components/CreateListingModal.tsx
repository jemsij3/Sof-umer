import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { getCampaignStatusInfo } from '../utils/campaignUtils';
import { ReceiptUploadInput } from './ReceiptUploadInput';
import { 
  getMatchingSubcategoryId, 
  getTranslatedCategoryName, 
  getTranslatedSubcategoryName, 
  getTranslatedOption,
  getTranslatedFieldLabel
} from '../lib/categoriesData';
import { 
  X, Building, DollarSign, Plus, Trash2, Camera, Upload, Car, ShoppingBag, 
  Briefcase, Wrench, Calendar, Info, Check, ArrowRight, ArrowLeft, Eye, 
  Zap, Crown, ShieldCheck, CreditCard, Sparkles, Star, Tag, MapPin, Phone, User as UserIcon, Store, Package,
  Video, Film, Play, AlertCircle, Loader2, CheckCircle2, ArrowUp, ArrowDown, Layers, Truck, CheckSquare, Square
} from 'lucide-react';
import { ListingWizard } from './ListingWizard';
import { WizardStep1Category } from './wizard/WizardStep1Category';
import { WizardStep2Details } from './wizard/WizardStep2Details';
import { WizardStep3Pricing } from './wizard/WizardStep3Pricing';
import { WizardStep4Review } from './wizard/WizardStep4Review';
import { SellingTypeSelector } from './SellingTypeSelector';
import { WholesalePricingTiersEditor } from './WholesalePricingTiersEditor';
import { ProductVariationsManager } from './ProductVariationsManager';
import { WholesalePriceTier, ProductVariation } from '../types';
import { 
  normalizeSellingType, 
  validateWholesaleConfig, 
  getPluralizedUnit,
  STANDARD_UNITS, 
  STANDARD_CONDITIONS,
  NormalizedSellingType 
} from '../utils/wholesalePricing';

interface CreateListingModalProps {
  onClose: () => void;
}

// L10n Consolidated into official translations architecture
export const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  Properties: [
    { id: 'Houses', name: 'Houses' },
    { id: 'Apartments', name: 'Apartments' },
    { id: 'Villas', name: 'Villas' },
    { id: 'Land', name: 'Land & Plots' },
    { id: 'Offices', name: 'Offices' },
    { id: 'Shops', name: 'Shops' },
    { id: 'Warehouses', name: 'Warehouses' },
    { id: 'Commercial', name: 'Commercial Buildings' }
  ],
  Vehicles: [
    { id: 'Cars', name: 'Cars' },
    { id: 'Motorcycles', name: 'Motorcycles' },
    { id: 'Trucks', name: 'Trucks' },
    { id: 'Buses', name: 'Buses' },
    { id: 'Heavy Equipment', name: 'Heavy Equipment' },
    { id: 'Spare Parts', name: 'Vehicle Parts' },
    { id: 'Accessories', name: 'Vehicle Accessories' }
  ],
  Products: [
    { id: 'Electronics', name: 'Electronics & Gadgets' },
    { id: 'Phones & Tablets', name: 'Phones & Tablets' },
    { id: 'Computers & Laptops', name: 'Computers & Laptops' },
    { id: 'Furniture', name: 'Furniture & Home' },
    { id: 'Clothing & Fashion', name: 'Clothing & Fashion' },
    { id: 'Babies & Kids', name: 'Babies & Kids' },
    { id: 'Health & Beauty', name: 'Health & Beauty' },
    { id: 'Agriculture & Food', name: 'Agriculture & Food' },
    { id: 'Animals & Pets', name: 'Animals & Pets' },
    { id: 'Sports & Outdoors', name: 'Sports & Outdoors' },
    { id: 'Commercial Equipment', name: 'Commercial Equipment' },
    { id: 'Others', name: 'Other Products' }
  ],
  Jobs: [
    { id: 'Full-time', name: 'Full-time Jobs' },
    { id: 'Part-time', name: 'Part-time Jobs' },
    { id: 'Freelance', name: 'Freelance / Contract' },
    { id: 'Remote', name: 'Remote Jobs' },
    { id: 'Construction', name: 'Construction Jobs' },
    { id: 'Driver', name: 'Driver Jobs' },
    { id: 'Office', name: 'Office Jobs' },
    { id: 'Teaching', name: 'Teaching Jobs' },
    { id: 'Healthcare', name: 'Healthcare Jobs' },
    { id: 'Internship', name: 'Internships' }
  ],
  Services: [
    { id: 'Repair Services', name: 'Repair & Maintenance' },
    { id: 'Cleaning Services', name: 'Cleaning Services' },
    { id: 'Construction Services', name: 'Construction & Renovation' },
    { id: 'Transport & Moving', name: 'Transport & Moving' },
    { id: 'IT Services', name: 'IT & Software Services' },
    { id: 'Design & Marketing', name: 'Design & Marketing' },
    { id: 'Photography & Video', name: 'Photography & Media' },
    { id: 'Event Services', name: 'Event Services' },
    { id: 'Education & Tutoring', name: 'Education & Tutoring' }
  ],
  'Local Businesses': [
    { id: 'Restaurants & Cafes', name: 'Restaurants & Cafes' },
    { id: 'Shops & Supermarkets', name: 'Shops & Supermarkets' },
    { id: 'Salons & Beauty', name: 'Salons & Beauty Shops' },
    { id: 'Auto Repair & Garage', name: 'Auto Repair & Garage' },
    { id: 'Pharmacies & Health', name: 'Pharmacies & Clinics' },
    { id: 'Agencies & Consultancy', name: 'Agencies & Consultancy' },
    { id: 'Hotels & Lodging', name: 'Hotels & Guest Houses' }
  ],
  Community: [
    { id: 'Events', name: 'Events & Gathering' },
    { id: 'Announcements', name: 'Announcements' },
    { id: 'Lost & Found', name: 'Lost and Found' },
    { id: 'Charity & Volunteering', name: 'Charity & Volunteering' }
  ]
};

const CATEGORY_OPTIONS = [
  { id: 'Properties', name: 'Properties', icon: Building },
  { id: 'Vehicles', name: 'Vehicles', icon: Car },
  { id: 'Products', name: 'Products', icon: ShoppingBag },
  { id: 'Jobs', name: 'Jobs', icon: Briefcase },
  { id: 'Services', name: 'Services', icon: Wrench },
  { id: 'Local Businesses', name: 'Local Business', icon: Store },
  { id: 'Community', name: 'Community', icon: Calendar }
];

interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'images';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  colSpan?: 'half' | 'full';
}

// Clean helper to extract all user-filled specifications without duplication or empty fields
function buildCleanAmenities(
  majorCategory: string,
  subcategory: string,
  fieldsState: Record<string, any>,
  activeFields: FieldConfig[]
): string[] {
  const labelMap: Record<string, string> = {
    propertyType: majorCategory === 'Vehicles' ? 'Vehicle Type' : majorCategory === 'Services' ? 'Service Type' : majorCategory === 'Local Businesses' ? 'Business Type' : 'Property Type',
    purpose: 'Purpose',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    toilet: 'Toilets',
    area: 'Area (m²)',
    furnished: 'Furnished',
    parking: 'Parking',
    floorLevel: 'Floor Level',
    ownershipStatus: 'Ownership / Title Deed',
    transmission: 'Transmission',
    fuelType: 'Fuel Type',
    engineSize: 'Engine Capacity',
    year: 'Year',
    mileage: 'Mileage',
    color: 'Color',
    clothingType: 'Clothing Type',
    gender: 'Gender',
    brand: 'Brand',
    model: 'Model',
    size: 'Size',
    material: 'Material',
    condition: 'Condition',
    quantity: 'Quantity',
    negotiable: 'Negotiable',
    jobType: 'Job Type',
    sector: 'Sector / Industry',
    salaryRange: 'Salary Range',
    qualification: 'Qualification',
    experience: 'Experience Required',
    deadline: 'Deadline',
    pricingUnit: 'Pricing Unit',
    providerType: 'Provider Type',
    coverageArea: 'Coverage Area',
    availability: 'Availability',
    openingHours: 'Opening Hours',
    website: 'Website',
    organizer: 'Organizer',
    venue: 'Venue',
    eventDate: 'Date',
    eventTime: 'Time',
    video: 'Video Tour'
  };

  const skipKeys = new Set(['title', 'description', 'location', 'price', 'images', 'contactPhone', 'contactEmail', 'ownerName', 'logo']);
  const result: string[] = [];
  const addedKeys = new Set<string>();

  if (subcategory) {
    result.push(`Subcategory: ${subcategory}`);
    addedKeys.add('subcategory');
  }

  // Iterate strictly over activeFields for the selected category & subcategory
  for (const field of activeFields) {
    if (skipKeys.has(field.id)) continue;
    const rawVal = fieldsState[field.id];
    
    // Skip negotiable if 'No' or false
    if (field.id === 'negotiable') {
      const negStr = String(rawVal || '').toLowerCase().trim();
      if (!rawVal || negStr === 'no' || negStr === 'false') continue;
    }

    if (rawVal === undefined || rawVal === null) continue;
    const valStr = String(rawVal).trim();
    if (!valStr || (valStr === '0' && ['bedrooms', 'bathrooms', 'toilet', 'area'].includes(field.id))) continue;

    const label = labelMap[field.id] || field.label || field.id;
    let formattedVal = valStr;
    if (field.id === 'mileage' && !valStr.toLowerCase().includes('km')) {
      formattedVal = `${Number(valStr) ? Number(valStr).toLocaleString() : valStr} km`;
    }

    const normKey = label.toLowerCase().trim();
    if (!addedKeys.has(normKey)) {
      addedKeys.add(normKey);
      result.push(`${label}: ${formattedVal}`);
    }
  }

  return result;
}

// Configuration-driven Dynamic Fields based on Category & Subcategory selection
function getFieldsForSelection(majorCategory: string, subcategory: string, t?: (key: string, params?: any) => string): FieldConfig[] {
  // 1. PRODUCTS
  if (majorCategory === 'Products') {
    if (subcategory === 'Clothing & Fashion') {
      return [
        { id: 'title', label: 'Item Title', type: 'text', placeholder: 'e.g., Men\'s Leather Jacket / Summer Dress', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Zara, Nike, Adidas, Gucci', colSpan: 'half' },
        { id: 'size', label: 'Size', type: 'text', placeholder: 'e.g., S, M, L, XL, 42', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black, Blue, Red, White', colSpan: 'half' },
        { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Cotton, Leather, Denim, Silk', colSpan: 'half' },
        { id: 'gender', label: 'Gender', type: 'select', options: ['Unisex', 'Men', 'Women', 'Kids'], colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 1500', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, style...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., YouTube video URL (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Electronics' || subcategory === 'Phones & Tablets' || subcategory === 'Computers & Laptops') {
      return [
        { id: 'title', label: 'Item Title', type: 'text', placeholder: 'e.g., iPhone 15 Pro Max 256GB / Dell XPS 15', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Apple, Samsung, Dell, HP, Sony', required: true, colSpan: 'half' },
        { id: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Galaxy S24 Ultra, ThinkPad T14', colSpan: 'half' },
        { id: 'size', label: 'Storage / Spec', type: 'text', placeholder: 'e.g., 256GB, 1TB SSD, 16GB RAM', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Space Gray, Titanium, Black', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Refurbished', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 85000', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: t ? t('address_eg_placeholder') : 'e.g., Mexico, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: t ? t('describe_specs_battery_accessories') : 'Describe specifications, battery health, accessories included...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., YouTube or Vimeo video link (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Furniture') {
      return [
        { id: 'title', label: 'Furniture Title', type: 'text', placeholder: 'e.g., 6-Seater Modern Leather Sofa Set', required: true, colSpan: 'full' },
        { id: 'material', label: 'Material', type: 'text', placeholder: 'e.g., Oak Wood, Leather, Fabric, Steel', colSpan: 'half' },
        { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Beige, Brown, Black', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
        { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 45000', required: true, colSpan: 'half' },
        { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., CMC, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe dimensions, style, comfort, condition...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Product Title', type: 'text', placeholder: 'e.g., Product Name / Item Title', required: true, colSpan: 'full' },
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g., Brand name', colSpan: 'half' },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Like New', 'Used - Good'], colSpan: 'half' },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2500', required: true, colSpan: 'half' },
      { id: 'negotiable', label: 'Negotiable', type: 'select', options: ['No', 'Yes'], colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, benefits...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
    ];
  }

  // 2. PROPERTIES
  if (majorCategory === 'Properties') {
    if (subcategory === 'Land') {
      return [
        { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., 500 m² Prime Plot for Sale in Bole', required: true, colSpan: 'full' },
        { id: 'purpose', label: 'Purpose', type: 'select', options: ['Sale', 'Rent', 'Buy'], colSpan: 'half' },
        { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 500', required: true, colSpan: 'half' },
        { id: 'ownershipStatus', label: 'Ownership / Title Deed', type: 'select', options: ['Title Deed (Carta)', 'Map (Karta)', 'Leasehold'], colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2500000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe land features, soil type, location advantages, access road...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
      ];
    }
    if (subcategory === 'Offices' || subcategory === 'Shops' || subcategory === 'Warehouses' || subcategory === 'Commercial') {
      return [
        { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., Commercial Office Space in City Center', required: true, colSpan: 'full' },
        { id: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'e.g., Office, Showroom, Warehouse, Shop', required: true, colSpan: 'half' },
        { id: 'purpose', label: 'Purpose', type: 'select', options: ['Rent', 'Sale', 'Buy'], colSpan: 'half' },
        { id: 'toilet', label: 'Toilets', type: 'number', placeholder: 'e.g., 2', colSpan: 'half' },
        { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 200', required: true, colSpan: 'half' },
        { id: 'parking', label: 'Parking Available', type: 'select', options: ['Yes', 'No'], colSpan: 'half' },
        { id: 'floorLevel', label: 'Floor Level', type: 'text', placeholder: 'e.g., Ground Floor, 3rd Floor', colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 50000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Kazanchis, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe facility, floor level, parking, security...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g., 3 Bedroom Modern House for Rent in Bole', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Property Type', type: 'text', placeholder: 'e.g., House, Apartment, Villa', required: true, colSpan: 'half' },
      { id: 'purpose', label: 'Purpose', type: 'select', options: ['Rent', 'Sale', 'Buy'], colSpan: 'half' },
      { id: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: 'e.g., 3', colSpan: 'half' },
      { id: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: 'e.g., 2', colSpan: 'half' },
      { id: 'condition', label: 'Property Condition / Status', type: 'select', options: ['Furnished', 'Unfurnished', 'Semi-Furnished', 'Under Construction', 'Brand New / Newly Built'], colSpan: 'half' },
      { id: 'area', label: 'Area (m²)', type: 'number', placeholder: 'e.g., 150', required: true, colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 25000', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, compound, security...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
    ];
  }

  // 3. VEHICLES
  if (majorCategory === 'Vehicles') {
    if (subcategory === 'Vehicle Parts' || subcategory === 'Vehicle Accessories' || subcategory === 'Spare Parts' || subcategory === 'Accessories') {
      return [
        { id: 'title', label: 'Part / Accessory Title', type: 'text', placeholder: 'e.g., Toyota Engine Belt / Alloy Rims 17"', required: true, colSpan: 'full' },
        { id: 'brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'e.g., Toyota, Michelin, Bosch', colSpan: 'half' },
        { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Foreign', 'Used - Local'], colSpan: 'half' },
        { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 5000', required: true, colSpan: 'half' },
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Kera, Addis Ababa', required: true, colSpan: 'half' },
        { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
        { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., seller@sofumer.com', required: true, colSpan: 'half' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Specify fitment, part numbers, compatibility...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
      ];
    }
    return [
      { id: 'title', label: 'Vehicle Title', type: 'text', placeholder: 'e.g., Toyota Corolla 2022 in Excellent Condition', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Vehicle Type', type: 'text', placeholder: 'e.g., Sedan, SUV, Motorcycle, Truck, Bus', required: true, colSpan: 'half' },
      { id: 'brand', label: 'Make / Brand', type: 'text', placeholder: 'e.g., Toyota, Suzuki, Hyundai, Isuzu', required: true, colSpan: 'half' },
      { id: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual'], colSpan: 'half' },
      { id: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'], colSpan: 'half' },
      { id: 'engineSize', label: 'Engine Capacity', type: 'text', placeholder: 'e.g., 1.6L, 2000cc', colSpan: 'half' },
      { id: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2022', colSpan: 'half' },
      { id: 'mileage', label: 'Mileage (km)', type: 'number', placeholder: 'e.g., 45000', colSpan: 'half' },
      { id: 'color', label: 'Color', type: 'text', placeholder: 'e.g., Black, Silver, White', colSpan: 'half' },
      { id: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used - Foreign', 'Used - Local'], colSpan: 'half' },
      { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 2800000', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'full' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe vehicle features, accident history, service records...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video tour link (optional)', colSpan: 'full' }
    ];
  }

  // 4. JOBS
  if (majorCategory === 'Jobs') {
    return [
      { id: 'title', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior Full Stack Developer / Accountant', required: true, colSpan: 'full' },
      { id: 'jobType', label: 'Employment Type', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Remote'], colSpan: 'half' },
      { id: 'sector', label: 'Sector / Industry', type: 'text', placeholder: 'e.g., Technology, Banking, Hospitality, Construction', required: true, colSpan: 'half' },
      { id: 'salaryRange', label: 'Salary Range', type: 'text', placeholder: 'e.g., 20,000 - 35,000 / month (Negotiable)', colSpan: 'half' },
      { id: 'qualification', label: 'Education Required', type: 'text', placeholder: 'e.g., Bachelor\'s Degree in Computer Science', colSpan: 'half' },
      { id: 'experience', label: 'Experience Required', type: 'text', placeholder: 'e.g., 2-4 years', required: true, colSpan: 'half' },
      { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'deadline', label: 'Application Deadline', type: 'text', placeholder: 'YYYY-MM-DD', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., hr@company.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description & Requirements', type: 'textarea', placeholder: 'Describe job responsibilities, required skills, benefits...', required: true, colSpan: 'full' },
      { id: 'logo', label: 'Company Logo URL', type: 'text', placeholder: 'Paste company logo image URL (optional)', colSpan: 'full' }
    ];
  }

  // 5. SERVICES
  if (majorCategory === 'Services') {
    return [
      { id: 'title', label: 'Service Title', type: 'text', placeholder: 'e.g., Professional House Cleaning & Gardening Service', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Service Category', type: 'text', placeholder: 'e.g., Cleaning, Repair, Moving, Tutoring, Plumbing', required: true, colSpan: 'half' },
      { id: 'pricingUnit', label: 'Pricing Unit', type: 'select', options: ['Fixed Rate', 'Hourly Rate', 'Daily Rate', 'Per Job / Negotiable'], colSpan: 'half' },
      { id: 'price', label: 'Price / Rate', type: 'number', placeholder: 'e.g., 500', colSpan: 'half' },
      { id: 'experience', label: 'Years of Experience', type: 'text', placeholder: 'e.g., 5+ Years', colSpan: 'half' },
      { id: 'coverageArea', label: 'Coverage Area', type: 'text', placeholder: 'e.g., All Addis Ababa', colSpan: 'half' },
      { id: 'location', label: 'Base Location', type: 'text', placeholder: 'e.g., Sarbet, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@service.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe services offered, equipment used, reliability guarantee...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Showcase video URL (optional)', colSpan: 'full' }
    ];
  }

  // 6. LOCAL BUSINESSES
  if (majorCategory === 'Local Businesses') {
    return [
      { id: 'title', label: 'Business Name', type: 'text', placeholder: 'e.g., Habesha Gourmet Restaurant & Cafe', required: true, colSpan: 'full' },
      { id: 'propertyType', label: 'Business Type', type: 'text', placeholder: 'e.g., Restaurant, Supermarket, Salon, Pharmacy, Garage', required: true, colSpan: 'half' },
      { id: 'openingHours', label: 'Opening Hours', type: 'text', placeholder: 'e.g., Mon-Sat 8:00 AM - 10:00 PM', colSpan: 'half' },
      { id: 'website', label: 'Website / Social Link', type: 'text', placeholder: 'e.g., https://facebook.com/mybusiness', colSpan: 'half' },
      { id: 'location', label: 'Business Address / Area', type: 'text', placeholder: 'e.g., Bole Medhanialem, Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Business Email', type: 'text', placeholder: 'e.g., info@business.com', required: true, colSpan: 'half' },
      { id: 'description', label: 'Business Description', type: 'textarea', placeholder: 'Describe your business products, services, specialty...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Store & Product Photos', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video Tour URL', type: 'text', placeholder: 'e.g., Store tour video URL (optional)', colSpan: 'full' }
    ];
  }

  // 7. COMMUNITY
  if (majorCategory === 'Community') {
    return [
      { id: 'title', label: 'Post / Announcement Title', type: 'text', placeholder: 'e.g., Annual Tech Community Meetup 2026', required: true, colSpan: 'full' },
      { id: 'organizer', label: 'Organizer Name / Group', type: 'text', placeholder: 'e.g., Oromia Tech Youth Club', colSpan: 'half' },
      { id: 'venue', label: 'Venue / Address', type: 'text', placeholder: 'e.g., Skylight Hotel, Addis Ababa', colSpan: 'half' },
      { id: 'eventDate', label: 'Event Date & Time', type: 'text', placeholder: 'e.g., August 15, 2026 at 2:00 PM', colSpan: 'half' },
      { id: 'location', label: 'City / Region', type: 'text', placeholder: 'e.g., Addis Ababa', required: true, colSpan: 'half' },
      { id: 'contactPhone', label: 'Contact Phone', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
      { id: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'e.g., info@community.org', required: true, colSpan: 'half' },
      { id: 'description', label: 'Full Description', type: 'textarea', placeholder: 'Provide complete details about this notice, event, or cause...', required: true, colSpan: 'full' },
      { id: 'images', label: 'Photos / Banner', type: 'images', colSpan: 'full' },
      { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
    ];
  }

  // Default Fallback
  return [
    { id: 'title', label: 'Listing Title', type: 'text', placeholder: 'e.g., Title of your listing', required: true, colSpan: 'full' },
    { id: 'price', label: 'Price', type: 'number', placeholder: 'e.g., 500', colSpan: 'half' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Bole, Addis Ababa', required: true, colSpan: 'half' },
    { id: 'contactPhone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +251911223344', required: true, colSpan: 'half' },
    { id: 'contactEmail', label: 'Email', type: 'text', placeholder: 'e.g., contact@sofumer.com', required: true, colSpan: 'half' },
    { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe key features, condition, benefits...', required: true, colSpan: 'full' },
    { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
    { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video link (optional)', colSpan: 'full' }
  ];
}

export default function CreateListingModal({ onClose }: CreateListingModalProps) {
  const { currentUser, refreshData, t, currentLanguage, paymentMethods, systemSettings } = useApp();

  // Unified Translation proxy: accesses official translations via t()
  const d = new Proxy({} as Record<string, string>, {
    get(_, prop: string) {
      if (typeof prop === 'string') {
        return t(prop);
      }
      return '';
    }
  });

  // 4-Step Flow State: 1 = Type & Selling Mode, 2 = Details & Media, 3 = Pricing & Logistics, 4 = Preview & Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [majorCategory, setMajorCategory] = useState<'Properties' | 'Vehicles' | 'Products' | 'Jobs' | 'Services' | 'Local Businesses' | 'Community'>('Products');
  const [subcategory, setSubcategory] = useState('Electronics');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'SAR' | 'EUR' | 'AED'>('ETB');

  // Media upload & drag drop states
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Plan & Monetization State
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | 'vip'>('free');
  const [isTopAdAddon, setIsTopAdAddon] = useState(false);
  const [isFeaturedAddon, setIsFeaturedAddon] = useState(false);
  const [selectedDirectMethodId, setSelectedDirectMethodId] = useState('');
  const [receiptRefNumber, setReceiptRefNumber] = useState('');
  const [receiptFileData, setReceiptFileData] = useState<{ url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null>(null);

  // Selling Type, Wholesale Pricing Tiers & SKU Variations State
  const [sellingType, setSellingType] = useState<NormalizedSellingType>('Retail');
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesalePriceTier[]>([
    { minimumQuantity: 1, pricePerUnit: 0 }
  ]);
  const [variationsList, setVariationsList] = useState<ProductVariation[]>([]);

  // Clean form state initialized with base fields only
  const [fieldsState, setFieldsState] = useState<Record<string, any>>({
    title: '',
    description: '',
    location: '',
    price: '',
    retailPrice: '',
    unit: 'Piece',
    quantity: '1',
    availableQuantity: '',
    sellingType: 'Retail',
    businessType: 'Wholesaler',
    minimumOrderQuantity: '1',
    wholesalePrice: '',
    wholesaleNotes: '',
    contactPhone: '',
    ownerName: '',
    contactEmail: '',
    video: ''
  });

  // Reset subcategory and clear category-specific fields when majorCategory changes
  useEffect(() => {
    const subcats = SUBCATEGORIES[majorCategory];
    if (subcats && subcats.length > 0) {
      setSubcategory(subcats[0].id);
    }
    setFieldsState(prev => ({
      ...prev,
      title: prev.title || '',
      description: prev.description || '',
      location: prev.location || '',
      price: prev.price || '',
      contactPhone: prev.contactPhone || '',
      ownerName: prev.ownerName || '',
      contactEmail: prev.contactEmail || '',
      video: prev.video || ''
    }));
  }, [majorCategory]);

  // Pre-fill owner details from authenticated user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setFieldsState(prev => ({
          ...prev,
          ownerName: prev.ownerName || '',
          contactEmail: prev.contactEmail || '',
          contactPhone: prev.contactPhone || ''
        }));
      } else {
        setFieldsState(prev => ({
          ...prev,
          ownerName: prev.ownerName || currentUser.fullName || '',
          contactEmail: prev.contactEmail || currentUser.email || '',
          contactPhone: prev.contactPhone || currentUser.phone || ''
        }));
      }
    }
  }, [currentUser]);

  const activeFields = getFieldsForSelection(majorCategory, subcategory, t);

  // Pre-fill default option for select fields (such as condition and negotiable) if not explicitly set
  useEffect(() => {
    if (activeFields && activeFields.length > 0) {
      setFieldsState(prev => {
        let changed = false;
        const next = { ...prev };
        for (const f of activeFields) {
          if (f.type === 'select' && f.options && f.options.length > 0) {
            // For properties, do not hardcode default condition or furnished values
            if (f.id === 'condition' && (majorCategory === 'Properties' || majorCategory?.toLowerCase() === 'properties')) {
              continue;
            }
            if (next[f.id] === undefined || next[f.id] === '') {
              next[f.id] = f.options[0];
              changed = true;
            }
          }
        }
        return changed ? next : prev;
      });
    }
  }, [subcategory, majorCategory]);

  const handleFieldChange = (id: string, value: any) => {
    setFieldsState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddImage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (imageInput.trim() && !imagesList.includes(imageInput.trim())) {
      setImagesList([...imagesList, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImagesList(imagesList.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handlePhotoFilesChange(e.target.files);
    }
    e.target.value = '';
  };

  // Photo Optimization & Handlers
  const [photoError, setPhotoError] = useState('');
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);

  const compressImage = (file: File, maxDimension = 1920, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoFilesChange = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setPhotoError('');

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['jpg', 'jpeg', 'png', 'webp'];
    const maxPhotos = 10;
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    const filesArray = Array.from(filesList);

    if (imagesList.length + filesArray.length > maxPhotos) {
      setPhotoError(t('media.max_photos_exceeded') || `Maximum ${maxPhotos} photos allowed per listing.`);
      return;
    }

    for (const file of filesArray) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(file.type) && !validExts.includes(ext || '')) {
        setPhotoError(t('media.image_format_invalid') || 'Invalid image format. Supported formats: JPG, JPEG, PNG, WebP.');
        return;
      }
      if (file.size > maxSizeBytes) {
        setPhotoError(t('media.image_size_exceeded') || 'Image file size exceeds 10 MB limit.');
        return;
      }
    }

    setIsCompressingPhotos(true);
    try {
      const compressedResults = await Promise.all(
        filesArray.map(file => compressImage(file))
      );
      const validCompressed = compressedResults.filter(Boolean);
      setImagesList(prev => [...prev, ...validCompressed].slice(0, maxPhotos));
    } catch (err) {
      console.error('Error compressing photos:', err);
      setPhotoError('Failed to process one or more photo files.');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleSetCoverPhoto = (idx: number) => {
    if (idx === 0) return;
    setImagesList(prev => {
      const copy = [...prev];
      const selected = copy.splice(idx, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleMovePhoto = (idx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= imagesList.length) return;
    setImagesList(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Video Optimization & Handlers
  const [videoError, setVideoError] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const handleVideoFileChange = async (file: File | null) => {
    setVideoError('');
    if (!file) return;

    const validFormats = ['video/mp4', 'video/quicktime', 'video/webm'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['mp4', 'mov', 'webm'];

    if (!validFormats.includes(file.type) && !validExts.includes(ext || '')) {
      setVideoError(t('media.video_format_invalid') || 'Unsupported video format. Supported: MP4, MOV, WebM.');
      return;
    }

    const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSizeBytes) {
      setVideoError(t('media.video_max_size_exceeded') || 'Video file size exceeds maximum limit of 50 MB.');
      return;
    }

    setIsVideoUploading(true);
    try {
      const tempUrl = URL.createObjectURL(file);
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.src = tempUrl;

      await new Promise<void>((resolve, reject) => {
        videoEl.onloadedmetadata = () => {
          URL.revokeObjectURL(tempUrl);
          if (videoEl.duration > 30.5) {
            reject(new Error(t('media.video_max_duration_exceeded') || 'Video duration exceeds maximum allowed limit of 30 seconds.'));
          } else {
            resolve();
          }
        };
        videoEl.onerror = () => {
          URL.revokeObjectURL(tempUrl);
          reject(new Error('Unable to read video metadata. Please select a valid video file.'));
        };
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Vid = reader.result as string;
        setFieldsState(prev => ({
          ...prev,
          video: base64Vid,
          videoUrl: base64Vid
        }));
        setIsVideoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsVideoUploading(false);
      setVideoError(err.message || 'Error processing video file.');
    }
  };

  const handleRemoveVideo = () => {
    setVideoError('');
    setFieldsState(prev => ({
      ...prev,
      video: '',
      videoUrl: ''
    }));
  };

  const getSubcatDesc = (cat: string, sub: string) => {
    const normalizedSub = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `sub_${cat.toLowerCase()}_${normalizedSub}`;
    return d[key] || sub;
  };

  // Calculate pricing & dynamic Admin Ad Packages
  const topAdPrice = systemSettings?.marketplaceSettings?.topAdPrice ?? 150;
  const featuredPrice = systemSettings?.marketplaceSettings?.featuredAdPrice ?? 300;

  const DEFAULT_AD_PACKAGES = [
    { id: 'starter', name: 'STARTER', price: 100, currency: 'ETB', duration: '3 days', daysCount: 3, views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
    { id: 'premium', name: 'PREMIUM', price: 150, currency: 'ETB', duration: '7 days', daysCount: 7, views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
    { id: 'vip', name: 'VIP ELITE', price: 500, currency: 'ETB', duration: '30 days', daysCount: 30, views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
  ];

  const checkFreeListingActive = (fls: any) => {
    if (!fls || fls.enabled === false) return false;
    const now = new Date();
    if (fls.startDate) {
      const start = new Date(fls.startDate);
      if (!isNaN(start.getTime()) && now < start) return false;
    }
    if (fls.endDate) {
      const end = new Date(fls.endDate);
      end.setHours(23, 59, 59, 999);
      if (!isNaN(end.getTime()) && now > end) return false;
    }
    return true;
  };

  const campaignInfo = getCampaignStatusInfo(systemSettings?.freeListingSettings);
  const isFreeListingEnabled = campaignInfo.isActive;

  const rawPackages = (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
    ? systemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'))
    : DEFAULT_AD_PACKAGES;

  const dynamicPackages = rawPackages.length > 0 ? rawPackages : DEFAULT_AD_PACKAGES;

  const flsConfig = systemSettings?.freeListingSettings;
  const maxFree = campaignInfo.maxListings;
  const freeDurationText = campaignInfo.displayText;

  const allPromotionPlans = [
    ...(isFreeListingEnabled ? [{ 
      id: 'free', 
      name: 'Standard Free Listing', 
      cost: 0, 
      days: freeDurationText, 
      daysCount: 0, 
      desc: `Standard catalog listing (Campaign: ${campaignInfo.displayText}, limit ${maxFree} free listings)`, 
      badge: campaignInfo.isLastDay ? 'LAST DAY' : 'FREE' 
    }] : []),
    ...dynamicPackages.map((pkg: any) => ({
      id: pkg.id || pkg.name,
      name: pkg.name,
      cost: Number(pkg.price) || 0,
      days: pkg.duration || '7 Days',
      daysCount: pkg.daysCount || (pkg.duration?.includes('30') ? 30 : pkg.duration?.includes('3') ? 3 : 7),
      badge: pkg.badge || 'PROMO',
      desc: pkg.desc || `Promotional ad package: ${pkg.name} (${pkg.duration || '7 days'})`
    }))
  ];

  const effectiveSelectedPlan = (selectedPlan === 'free' && !isFreeListingEnabled)
    ? (allPromotionPlans[0]?.id || 'starter')
    : selectedPlan;

  const selectedPlanObj = allPromotionPlans.find(p => p.id === effectiveSelectedPlan) || allPromotionPlans[0];
  const baseCost = selectedPlanObj ? selectedPlanObj.cost : 0;
  const addonTopCost = isTopAdAddon ? topAdPrice : 0;
  const addonFeaturedCost = isFeaturedAddon ? featuredPrice : 0;
  const totalCost = baseCost + addonTopCost + addonFeaturedCost;

  const walletBalance = currentUser?.walletBalance || 0;

    const st = sellingType;

    // Media upload handler for drag-and-drop & file selection
    const handleMediaUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const allFiles = Array.from(files);
      const photoFiles: File[] = [];
      let videoFile: File | null = null;

      for (const f of allFiles) {
        if (f.type.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(f.name.split('.').pop()?.toLowerCase() || '')) {
          if (!videoFile) videoFile = f;
        } else {
          photoFiles.push(f);
        }
      }

      if (videoFile) {
        await handleVideoFileChange(videoFile);
      }
      if (photoFiles.length > 0) {
        const dt = new DataTransfer();
        photoFiles.forEach(pf => dt.items.add(pf));
        await handlePhotoFilesChange(dt.files);
      }
    };

    const handleAddMediaUrl = () => {
      if (!mediaUrlInput || !mediaUrlInput.trim()) return;
      const url = mediaUrlInput.trim();
      if (url.match(/\.(mp4|mov|webm)$/i) || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
        handleFieldChange('video', url);
        setMediaUrlInput('');
        setShowUrlInput(false);
      } else {
        if (imagesList.length >= 10) {
          setPhotoError('Maximum 10 photos allowed per listing.');
          return;
        }
        setImagesList(prev => [...prev, url]);
        setMediaUrlInput('');
        setShowUrlInput(false);
      }
    };

    // Step 1 -> Step 2 validation & transition
    const handleContinueToStep2 = () => {
      setError('');
      const subcats = SUBCATEGORIES[majorCategory];
      if (!subcategory && subcats && subcats.length > 0) {
        setSubcategory(subcats[0].id);
      }
      if (sellingType === 'Wholesale' || sellingType === 'Retail + Wholesale') {
        const curMoq = Number(fieldsState.minimumOrderQuantity || 1);
        const safeMoq = curMoq < 10 ? 10 : curMoq;
        handleFieldChange('minimumOrderQuantity', safeMoq);
        setWholesaleTiers(prev => {
          if (!prev || prev.length === 0) return [{ minimumQuantity: safeMoq, pricePerUnit: 0 }];
          return prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: safeMoq } : t);
        });
      }
      setCurrentStep(2);
    };

    // Step 2 -> Step 3 validation & transition
    const handleContinueToStep3 = () => {
      setError('');
      if (!fieldsState.title || String(fieldsState.title).trim() === '') {
        setError('Please enter a product/listing title.');
        return;
      }
      if (!fieldsState.location || String(fieldsState.location).trim() === '') {
        setError('Please enter a location.');
        return;
      }
      if (!fieldsState.description || String(fieldsState.description).trim() === '') {
        setError('Please provide a description.');
        return;
      }
      if (currentUser?.role === 'admin' && st !== 'Wholesale') {
        if (!fieldsState.ownerName || String(fieldsState.ownerName).trim() === '') {
          setError(d.ownerNameVal || 'Please enter owner name.');
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError(d.ownerPhoneVal || 'Please enter contact phone.');
          return;
        }
      }
      if (!imagesList || imagesList.length === 0) {
        setError('Please upload or add at least one photo for your listing.');
        return;
      }
      setCurrentStep(3);
    };

    // Step 3 -> Step 4 validation & transition
    const handleContinueToStep4 = () => {
      setError('');

      if (majorCategory === 'Properties') {
        const propPrice = Number(fieldsState.price || fieldsState.retailPrice || 0);
        if (!propPrice || propPrice <= 0) {
          setError('Please enter a valid Property Price greater than 0.');
          return;
        }
      } else if (st === 'Retail') {
        const retPrice = Number(fieldsState.retailPrice || fieldsState.price || 0);
        if (!retPrice || retPrice <= 0) {
          setError('Please enter a valid Retail Price greater than 0.');
          return;
        }
        const qty = Number(fieldsState.quantity || fieldsState.availableQuantity || 0);
        if (!qty || qty <= 0) {
          setError('Please enter a valid Available Quantity / Stock.');
          return;
        }
      } else if (st === 'Wholesale') {
        const moq = Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10);
        if (!moq || moq < 1) {
          setError('Minimum Order Quantity (MOQ) must be at least 1 (default is 10+).');
          return;
        }
        const wholesaleValidation = validateWholesaleConfig(moq, wholesaleTiers);
        if (!wholesaleValidation.isValid) {
          setError(wholesaleValidation.error || 'Invalid wholesale pricing configuration.');
          return;
        }
        const tier1Price = Number(wholesaleTiers[0]?.pricePerUnit || fieldsState.wholesalePrice || 0);
        if (!tier1Price || tier1Price <= 0) {
          setError('Please enter a valid Unit Price for Wholesale Tier 1.');
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError('Please enter a Contact Phone Number for supplier inquiries.');
          return;
        }
      } else if (st === 'Retail + Wholesale' || (st as string) === 'Retail & Wholesale') {
        const retPrice = Number(fieldsState.retailPrice || fieldsState.price || 0);
        if (!retPrice || retPrice <= 0) {
          setError('Please enter a valid Retail Price greater than 0.');
          return;
        }
        const moq = Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 10);
        if (!moq || moq < 1) {
          setError('Minimum Order Quantity (MOQ) must be at least 1.');
          return;
        }
        const wholesaleValidation = validateWholesaleConfig(moq, wholesaleTiers);
        if (!wholesaleValidation.isValid) {
          setError(wholesaleValidation.error || 'Invalid wholesale pricing configuration.');
          return;
        }
        const tier1Price = Number(wholesaleTiers[0]?.pricePerUnit || fieldsState.wholesalePrice || 0);
        if (!tier1Price || tier1Price <= 0) {
          setError('Please enter a valid Unit Price for Wholesale Tier 1.');
          return;
        }
        // Validation rule: Wholesale Tier 1 Unit Price must be strictly lower than Retail Price!
        if (tier1Price >= retPrice) {
          setError(`Wholesale Tier 1 Unit Price (${tier1Price} ${currency}) must be strictly lower than Retail Price (${retPrice} ${currency}) to offer a wholesale discount.`);
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError('Please enter a Contact Phone Number.');
          return;
        }
      }

      setCurrentStep(4); // Advance to Preview & Publish
    };

    const handleValidateStep3 = (e: React.FormEvent) => {
      e.preventDefault();
      handleContinueToStep4();
    };

  // Final submission of listing and promotion purchase
  const handleFinalPublish = async () => {
    if (!currentUser) return;
    setError('');
    setSubmitting(true);

    try {
      const finalAmenities = buildCleanAmenities(majorCategory, subcategory, fieldsState, activeFields);
      let finalPropertyType = subcategory;
      let dbMajorCategory: any = majorCategory;
      let finalCategory = 'Buy';

      if (majorCategory === 'Properties') {
        finalPropertyType = subcategory;
        finalCategory = fieldsState.purpose || 'Sale';
      } else if (majorCategory === 'Vehicles') {
        dbMajorCategory = 'Products';
        finalPropertyType = 'Vehicles';
        finalCategory = subcategory;
      } else if (majorCategory === 'Products') {
        dbMajorCategory = 'Products';
        finalPropertyType = subcategory;
        finalCategory = 'For Sale';
      } else if (majorCategory === 'Jobs') {
        finalPropertyType = subcategory;
        finalCategory = fieldsState.jobType || 'Full-time';
      } else {
        finalPropertyType = subcategory;
        finalCategory = subcategory;
      }

      const computedSubcatId = getMatchingSubcategoryId({
        majorCategory: dbMajorCategory,
        propertyType: finalPropertyType,
        category: finalCategory,
        title: fieldsState.title,
        description: fieldsState.description,
        amenities: finalAmenities
      });

      const days = selectedPlan === 'basic' ? 3 : selectedPlan === 'premium' ? 7 : selectedPlan === 'vip' ? 30 : 0;
      const expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : undefined;

      const isPropertyCategory = dbMajorCategory === 'Properties' || majorCategory === 'Properties';
      const finalUnit = isPropertyCategory ? '' : (fieldsState.unit || fieldsState.wholesaleUnit || 'Piece');
      const isRetail = !isPropertyCategory && (sellingType === 'Retail' || sellingType === 'Retail + Wholesale' || (sellingType as any) === 'Retail & Wholesale');
      const isWholesale = !isPropertyCategory && (sellingType === 'Wholesale' || sellingType === 'Retail + Wholesale' || (sellingType as any) === 'Retail & Wholesale');

      const retailVal = isPropertyCategory
        ? Number(fieldsState.price || fieldsState.retailPrice || 0)
        : (isRetail ? Number(fieldsState.retailPrice || fieldsState.price || 0) : undefined);
      const wholesaleMoq = isWholesale ? Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 1) : undefined;
      const primaryWholesalePrice = isWholesale ? Number(wholesaleTiers[0]?.pricePerUnit || fieldsState.wholesalePrice || 0) : undefined;
      const availStock = isPropertyCategory
        ? undefined
        : (fieldsState.availableQuantity ? Number(fieldsState.availableQuantity) : (fieldsState.quantity ? Number(fieldsState.quantity) : undefined));

      const displayPrice = isPropertyCategory
        ? Number(fieldsState.price || fieldsState.retailPrice || 0)
        : (sellingType === 'Wholesale' ? (primaryWholesalePrice || 0) : (retailVal || 0));

      const propertyData = {
        title: fieldsState.title,
        description: fieldsState.description,
        location: fieldsState.location,
        majorCategory: dbMajorCategory,
        propertyType: finalPropertyType,
        category: finalCategory,
        price: displayPrice,
        retailPrice: isPropertyCategory ? undefined : retailVal,
        currency,
        brand: fieldsState.brand || '',
        condition: (fieldsState.condition !== undefined && fieldsState.condition !== '') ? fieldsState.condition : (isPropertyCategory ? '' : 'New'),
        unit: isPropertyCategory ? '' : finalUnit,
        wholesaleUnit: isPropertyCategory ? '' : finalUnit,
        negotiable: fieldsState.negotiable || 'No',
        isNegotiable: (fieldsState.negotiable || 'No') === 'Yes',
        model: fieldsState.model || '',
        color: fieldsState.color || '',
        storageSpec: fieldsState.storageSpec || fieldsState.specifications || '',
        region: fieldsState.region || '',
        city: fieldsState.city || '',
        quantity: isPropertyCategory ? undefined : (availStock || 1),
        availableQuantity: isPropertyCategory ? undefined : availStock,
        bedrooms: majorCategory === 'Properties' ? Number(fieldsState.bedrooms || 0) : 0,
        bathrooms: majorCategory === 'Properties' ? Number(fieldsState.bathrooms || 0) : 0,
        area: majorCategory === 'Properties' ? Number(fieldsState.area || 0) : 0,
        amenities: finalAmenities,
        images: imagesList.length > 0 ? imagesList : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'],
        coverImage: imagesList[0] || '',
        video: fieldsState.video || fieldsState.videoUrl || '',
        videoUrl: fieldsState.video || fieldsState.videoUrl || '',
        ownerId: currentUser.role === 'admin' ? (fieldsState.ownerId || '') : currentUser.id,
        ownerName: currentUser.role === 'admin' ? (fieldsState.ownerName || 'Property Owner') : (fieldsState.ownerName || currentUser.fullName || 'Anonymous'),
        contactPhone: fieldsState.contactPhone || (currentUser.role === 'admin' ? '' : '+251911223344'),
        contactEmail: fieldsState.contactEmail || (currentUser.role === 'admin' ? '' : (currentUser.email || '')),
        ownerBusinessName: fieldsState.ownerBusinessName || '',
        ownerAvatar: fieldsState.ownerAvatar || '',
        postedOnBehalf: currentUser.role === 'admin',
        boostPlan: selectedPlan,
        isTopAd: isTopAdAddon,
        isFeatured: isFeaturedAddon || selectedPlan === 'vip',
        promotionExpiresAt: expiresAt,
        approvalStatus: currentUser?.role === 'admin' ? 'approved' : 'pending',
        verificationStatus: currentUser?.role === 'admin' ? 'verified' : 'pending',
        isVerifiedListing: currentUser?.role === 'admin',
        subCategoryId: computedSubcatId || undefined,
        sellingType: isPropertyCategory ? 'Retail' : sellingType,
        businessType: isWholesale ? (fieldsState.businessType || 'Wholesaler') : undefined,
        wholesalePrice: primaryWholesalePrice,
        minimumOrderQuantity: wholesaleMoq,
        wholesalePriceTiers: isWholesale ? wholesaleTiers : undefined,
        deliveryOptions: isWholesale && Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [],
        wholesaleNotes: isWholesale ? (fieldsState.wholesaleNotes || '') : undefined,
        variations: variationsList.length > 0 ? variationsList : undefined
      };

      const authToken = localStorage.getItem('sof_umer_token') || '';
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(propertyData)
      });

      const responseText = await res.text();
      let createdProp: any = null;
      let errData: any = null;

      if (responseText && responseText.trim()) {
        try {
          const parsed = JSON.parse(responseText);
          if (res.ok) {
            createdProp = parsed.listing || parsed;
          } else {
            errData = parsed;
          }
        } catch (parseErr) {
          console.error('[CreateListing] Response is not valid JSON:', responseText.substring(0, 250));
          throw new Error(`Server returned HTTP ${res.status}, but response was not valid JSON.`);
        }
      }

      if (!res.ok) {
        const errorMsg = errData?.error || errData?.message || `Failed to create listing (Server status ${res.status}).`;
        throw new Error(errorMsg);
      }

      if (!createdProp) {
        throw new Error('Listing was created but server returned empty response data.');
      }

      // Handle monetization payment if totalCost > 0
      if (totalCost > 0) {
        const directMethod = paymentMethods.find(m => m.id === selectedDirectMethodId);
        await fetch('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userEmail: currentUser.email,
            userName: currentUser.fullName,
            amount: totalCost,
            paymentMethodId: selectedDirectMethodId || 'direct-transfer',
            paymentMethodName: directMethod?.name || 'Direct Bank / Telebirr',
            relatedPropertyId: createdProp.id,
            relatedPropertyTitle: createdProp.title,
            referenceNumber: receiptRefNumber.trim() || undefined,
            receiptUrlOrFile: receiptFileData?.url || receiptRefNumber || 'Payment Reference Submitted',
            fileType: receiptFileData?.fileType || 'image',
            fileName: receiptFileData?.fileName,
            fileSize: receiptFileData?.fileSize
          })
        });
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getHeaderTitle = () => {
    if (majorCategory === 'Properties') {
      return t('create_property_listing') || 'Create Property Listing';
    }
    if (majorCategory === 'Products') {
      return t('create_product_listing') || 'Create Product Listing';
    }
    if (majorCategory === 'Vehicles') {
      return t('create_vehicle_listing') || 'Create Vehicle Listing';
    }
    if (majorCategory === 'Services') {
      return t('create_service_listing') || 'Create Service Listing';
    }
    if (majorCategory === 'Jobs') {
      return t('create_job_listing') || 'Create Job Listing';
    }
    if (majorCategory === 'Local Businesses') {
      return t('create_business_listing') || 'Create Business Listing';
    }
    return t('create_listing_title') || 'Create Listing';
  };

  const HeaderIcon = majorCategory === 'Properties' 
    ? Building 
    : majorCategory === 'Vehicles' 
    ? Car 
    : majorCategory === 'Products' 
    ? ShoppingBag 
    : majorCategory === 'Services' 
    ? Wrench 
    : majorCategory === 'Jobs' 
    ? Briefcase 
    : majorCategory === 'Local Businesses'
    ? Store
    : Tag;

  const handleSelectSellingType = (type: NormalizedSellingType) => {
    setSellingType(type);
    handleFieldChange('sellingType', type);
    if (type === 'Wholesale' || type === 'Retail + Wholesale') {
      const curMoq = Number(fieldsState.minimumOrderQuantity || 1);
      const safeMoq = curMoq < 10 ? 10 : curMoq;
      handleFieldChange('minimumOrderQuantity', safeMoq);
      setWholesaleTiers(prev => {
        if (!prev || prev.length === 0) return [{ minimumQuantity: safeMoq, pricePerUnit: 0 }];
        return prev.map((t, idx) => idx === 0 ? { ...t, minimumQuantity: safeMoq } : t);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-center items-center p-0 sm:p-4">
      <div className="bg-[#0c0c0c] w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl overflow-hidden border-0 sm:border sm:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 create-modal-view text-[#F5F5F4] flex flex-col">
        
        {/* Header with dynamic title */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-[#08080a] shrink-0">
          <div className="flex items-center gap-2.5">
            <HeaderIcon className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-serif text-base sm:text-lg tracking-wider uppercase font-medium text-white">
              {getHeaderTitle()}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs py-3 px-5 text-center font-semibold shrink-0">
            ⚠️ {error}
          </div>
        )}

        {/* 4-Step Progress Bar */}
        <ListingWizard 
          currentStep={currentStep} 
          onStepClick={(s) => {
            if (s < currentStep) setCurrentStep(s as any);
          }} 
        />

        {/* Scrollable Step Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 create-modal-scroll space-y-6">
          {currentStep === 1 && (
            <WizardStep1Category
              majorCategory={majorCategory}
              setMajorCategory={setMajorCategory}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              sellingType={sellingType}
              onSelectSellingType={handleSelectSellingType}
              currentLanguage={currentLanguage}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2Details
              majorCategory={majorCategory}
              fieldsState={fieldsState}
              handleFieldChange={handleFieldChange}
              imagesList={imagesList}
              setImagesList={setImagesList}
              handleSetCoverPhoto={handleSetCoverPhoto}
              handleMovePhoto={handleMovePhoto}
              handleMediaUpload={handleMediaUpload}
              handleRemoveVideo={handleRemoveVideo}
              isCompressingPhotos={isCompressingPhotos}
              isVideoUploading={isVideoUploading}
              photoError={photoError}
              videoError={videoError}
              currentUser={currentUser}
            />
          )}

          {currentStep === 3 && (
            <WizardStep3Pricing
              majorCategory={majorCategory}
              sellingType={sellingType}
              currency={currency}
              setCurrency={setCurrency}
              fieldsState={fieldsState}
              handleFieldChange={handleFieldChange}
              wholesaleTiers={wholesaleTiers}
              setWholesaleTiers={setWholesaleTiers}
            />
          )}

          {currentStep === 4 && (
            <WizardStep4Review
              majorCategory={majorCategory}
              subcategory={subcategory}
              sellingType={sellingType}
              currency={currency}
              fieldsState={fieldsState}
              imagesList={imagesList}
              wholesaleTiers={wholesaleTiers}
              isFeaturedAddon={isFeaturedAddon}
              setIsFeaturedAddon={(val) => {
                setIsFeaturedAddon(val);
                setIsTopAdAddon(val);
                setSelectedPlan(val ? 'vip' : 'free');
              }}
              submitting={submitting}
              onPublish={handleFinalPublish}
              onBackToPricing={() => setCurrentStep(3)}
              paymentMethods={paymentMethods}
              selectedDirectMethodId={selectedDirectMethodId}
              setSelectedDirectMethodId={setSelectedDirectMethodId}
              receiptRefNumber={receiptRefNumber}
              setReceiptRefNumber={setReceiptRefNumber}
              receiptFileData={receiptFileData}
              setReceiptFileData={setReceiptFileData}
              currentUser={currentUser}
              currentLanguage={currentLanguage}
            />
          )}
        </div>

        {/* Dynamic Footer Navigation for Steps 1-3 */}
        {currentStep < 4 && (
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#08080a] flex justify-between items-center gap-3 shrink-0">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-bold transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>[🡠 Back]</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white/50 hover:text-white text-xs font-bold transition duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={handleContinueToStep2}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>[ Continue to Basic Info ➔ ]</span>
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleContinueToStep3}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>[ Continue to Pricing ➔ ]</span>
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleContinueToStep4}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>[ Review Listing ➔ ]</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
