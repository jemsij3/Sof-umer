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
  Video, Film, Play, AlertCircle, Loader2, CheckCircle2, ArrowUp, ArrowDown, Layers
} from 'lucide-react';
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
const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
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
function getFieldsForSelection(majorCategory: string, subcategory: string): FieldConfig[] {
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
        { id: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Mexico, Addis Ababa', required: true, colSpan: 'full' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe specifications, battery health, accessories included...', required: true, colSpan: 'full' },
        { id: 'images', label: 'Photos', type: 'images', colSpan: 'full' },
        { id: 'video', label: 'Video URL', type: 'text', placeholder: 'e.g., Video demo URL (optional)', colSpan: 'full' }
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
      { id: 'furnished', label: 'Furnished Status', type: 'select', options: ['Unfurnished', 'Furnished', 'Semi-Furnished'], colSpan: 'half' },
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
  const { currentUser, refreshData, t, currentLanguage, paymentMethods, spendWallet, topUpWallet, systemSettings } = useApp();

  // Unified Translation proxy: accesses official translations via t()
  const d = new Proxy({} as Record<string, string>, {
    get(_, prop: string) {
      if (typeof prop === 'string') {
        return t(prop);
      }
      return '';
    }
  });

  // 5-Step Flow State: 1 = Category, 2 = Subcategory, 3 = Details, 4 = Preview, 5 = Choose Plan
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [majorCategory, setMajorCategory] = useState<'Properties' | 'Vehicles' | 'Products' | 'Jobs' | 'Services' | 'Local Businesses' | 'Community'>('Properties');
  const [subcategory, setSubcategory] = useState('Houses');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'SAR' | 'EUR' | 'AED'>('ETB');

  // Plan & Monetization State
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'premium' | 'vip'>('free');
  const [isTopAdAddon, setIsTopAdAddon] = useState(false);
  const [isFeaturedAddon, setIsFeaturedAddon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'direct'>('wallet');
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

  const activeFields = getFieldsForSelection(majorCategory, subcategory);

  // Pre-fill default option for select fields (such as condition and negotiable) if not explicitly set
  useEffect(() => {
    if (activeFields && activeFields.length > 0) {
      setFieldsState(prev => {
        let changed = false;
        const next = { ...prev };
        for (const f of activeFields) {
          if (f.type === 'select' && f.options && f.options.length > 0) {
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

  const handleQuickAddImagePlaceholder = () => {
    const urls = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ];
    const pick = urls[Math.floor(Math.random() * urls.length)];
    if (!imagesList.includes(pick)) {
      setImagesList([...imagesList, pick]);
    }
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
    
    // Step 3 Validation before previewing
    const handleValidateStep3 = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (currentUser?.role === 'admin' && st !== 'Wholesale') {
        if (!fieldsState.ownerName || String(fieldsState.ownerName).trim() === '') {
          setError(d.ownerNameVal);
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError(d.ownerPhoneVal);
          return;
        }
        if (!fieldsState.contactEmail || String(fieldsState.contactEmail).trim() === '') {
          setError(d.ownerEmailVal);
          return;
        }
      }

      // Title validation
      if (!fieldsState.title || String(fieldsState.title).trim() === '') {
        setError('Please enter a product title.');
        return;
      }

      // Location validation
      if (!fieldsState.location || String(fieldsState.location).trim() === '') {
        setError('Please enter a location.');
        return;
      }

      // Description validation
      if (!fieldsState.description || String(fieldsState.description).trim() === '') {
        setError('Please provide a product description.');
        return;
      }

      for (const field of activeFields) {
        if (field.type !== 'images') {
          // Skip fields handled in dedicated sections
          if (['price', 'retailPrice', 'negotiable', 'quantity', 'availableQuantity', 'unit', 'wholesalePrice', 'minimumOrderQuantity', 'wholesaleUnit', 'title', 'location', 'description'].includes(field.id)) {
            continue;
          }
          if (currentUser?.role === 'admin' && (field.id === 'contactPhone' || field.id === 'contactEmail' || field.id === 'ownerName')) {
            continue;
          }
          if (st === 'Wholesale') {
            const excludeForWholesale = [
              'bedrooms', 'bathrooms', 'toilet', 'area', 
              'floorLevel', 'parking', 'ownershipStatus', 'furnished', 'propertyType',
              'contactPhone', 'contactEmail', 'ownerName'
            ];
            if (excludeForWholesale.includes(field.id)) continue;
          }

          const val = fieldsState[field.id];
          if (field.required && (!val || String(val).trim() === '')) {
            const translatedLabel = getTranslatedFieldLabel(field.label, currentLanguage);
            setError(`${d.fieldReqVal} ${translatedLabel}`);
            return;
          }
        }
      }

      // Photos validation
      if (!imagesList || imagesList.length === 0) {
        setError('Please upload or add at least one photo for your listing.');
        return;
      }

      // Conditional validations based on category and selling type:
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
        const moq = Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 1);
        const wholesaleValidation = validateWholesaleConfig(moq, wholesaleTiers);
        if (!wholesaleValidation.isValid) {
          setError(wholesaleValidation.error || 'Invalid wholesale pricing configuration.');
          return;
        }
        const availQty = Number(fieldsState.availableQuantity || fieldsState.quantity || 0);
        if (availQty > 0 && availQty < moq) {
          setError(`Available stock (${availQty}) cannot be less than Minimum Order Quantity (${moq}).`);
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
        const moq = Number(fieldsState.minimumOrderQuantity || wholesaleTiers[0]?.minimumQuantity || 1);
        const wholesaleValidation = validateWholesaleConfig(moq, wholesaleTiers);
        if (!wholesaleValidation.isValid) {
          setError(wholesaleValidation.error || 'Invalid wholesale pricing configuration.');
          return;
        }
        if (!fieldsState.contactPhone || String(fieldsState.contactPhone).trim() === '') {
          setError('Please enter a Contact Phone Number.');
          return;
        }
      }

      setError('');
      setCurrentStep(4); // Advance to Preview
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
        condition: (fieldsState.condition !== undefined && fieldsState.condition !== '') ? fieldsState.condition : 'New',
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
        if (paymentMethod === 'wallet') {
          await spendWallet(
            totalCost,
            `${selectedPlan.toUpperCase()} Boost & Promotion for "${createdProp.title}"`,
            createdProp.id,
            selectedPlan,
            days || 7
          );
        } else if (paymentMethod === 'direct') {
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
      }

      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-[#0c0c0c] rounded-2xl w-full max-w-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 create-modal-view text-[#F5F5F4] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#08080a] shrink-0">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-serif text-lg tracking-wider uppercase font-medium text-white">
              {t('create_listing_title') || 'Create New Listing'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition duration-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs py-3.5 px-5 text-center font-semibold shrink-0">
            ⚠️ {error}
          </div>
        )}

        {/* Stepper Navigation Bar */}
        <div className="bg-zinc-900/80 border-b border-white/5 px-6 py-3 flex items-center justify-between overflow-x-auto text-[11px] shrink-0 scrollbar-none">
          {[
            { step: 1, label: `1. ${t('wizard.step_category')}` },
            { step: 2, label: `2. ${t('wizard.step_subcategory')}` },
            { step: 3, label: `3. ${t('wizard.step_details_photos')}` },
            { step: 4, label: `4. ${t('wizard.step_preview_ad')}` },
            { step: 5, label: `5. ${t('wizard.step_boost_pay')}` }
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step as any);
                }}
                disabled={s.step > currentStep}
                className={`flex items-center gap-1.5 font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    : isCompleted
                    ? 'text-emerald-400 hover:text-white'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body Wrap */}
        <div className="flex-1 flex flex-col overflow-hidden text-left">
          
          {/* Scrollable Step Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">

            {/* STEP 1: CATEGORY SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Selling Type Selection right at the beginning of the Create Listing form (for products) */}
                {majorCategory !== 'Properties' && (
                  <SellingTypeSelector
                    value={sellingType}
                    onChange={(type) => {
                      setSellingType(type);
                      handleFieldChange('sellingType', type);
                    }}
                  />
                )}

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                    {d.catLabel} *
                  </label>
                  <p className="text-xs text-[#F5F5F4]/50 font-light">{d.catDesc}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  {CATEGORY_OPTIONS.map(cat => {
                    const Icon = cat.icon;
                    const isActive = majorCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setMajorCategory(cat.id as any);
                          // Auto set subcategory default
                          const subs = SUBCATEGORIES[cat.id as keyof typeof SUBCATEGORIES];
                          if (subs && subs.length > 0) setSubcategory(subs[0].id);
                        }}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition duration-300 cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 font-bold shadow-lg shadow-amber-500/5'
                            : 'bg-zinc-900/50 border-white/5 text-white/60 hover:border-white/15 hover:bg-zinc-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-amber-400" />
                        <span className="text-[11px] truncate w-full text-center font-medium">
                          {getTranslatedCategoryName(cat.name, currentLanguage)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Category Guideline Helper Description */}
                <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-200/80 leading-relaxed font-light">
                  <span className="font-bold text-amber-400 mr-2 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-amber-500" />
                    {d.guideTitle}: {majorCategory}
                  </span>
                  <p className="italic">
                    {majorCategory === 'Properties' && d.propGuide}
                    {majorCategory === 'Vehicles' && d.vehGuide}
                    {majorCategory === 'Products' && d.prodGuide}
                    {majorCategory === 'Jobs' && d.jobGuide}
                    {majorCategory === 'Services' && d.srvGuide}
                    {majorCategory === 'Community' && d.commGuide}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SUBCATEGORY & CURRENCY */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {d.subcatLabel}
                    </label>
                    <p className="text-[11px] text-[#F5F5F4]/40 font-light">{d.subcatDesc}</p>
                    <select
                      value={subcategory}
                      onChange={e => setSubcategory(e.target.value)}
                      className="w-full p-3.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                    >
                      {SUBCATEGORIES[majorCategory]?.map(sub => (
                        <option key={sub.id} value={sub.id} className="bg-[#0c0c0c]">
                          {getTranslatedSubcategoryName(sub.name, currentLanguage)}
                        </option>
                      ))}
                    </select>

                    {subcategory && (
                      <div className="mt-3 p-3.5 bg-white/5 border border-white/5 rounded-xl text-[11px] text-[#F5F5F4]/70 leading-relaxed font-light">
                        <span className="font-bold text-white mr-1">📌 {d.subcatTitle}:</span>
                        {getSubcatDesc(majorCategory, subcategory)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">
                      {d.currLabel} *
                    </label>
                    <p className="text-[11px] text-[#F5F5F4]/40 font-light">{d.currDesc}</p>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value as any)}
                      className="w-full p-3.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                    >
                      <option value="ETB" className="bg-[#0c0c0c]">{t("curr_etb")}</option>
                      <option value="USD" className="bg-[#0c0c0c]">USD (United States Dollar)</option>
                      <option value="SAR" className="bg-[#0c0c0c]">{t("curr_sar")}</option>
                      <option value="EUR" className="bg-[#0c0c0c]">EUR (Euro)</option>
                      <option value="AED" className="bg-[#0c0c0c]">{t("curr_aed")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SPECIFICATIONS & FIELDS */}
            {currentStep === 3 && (
              <form id="listing-details-form" onSubmit={handleValidateStep3} className="space-y-5 animate-in fade-in duration-300">
                <div className="border-l-2 border-amber-500 pl-3">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                    {d.specHeader} ({getTranslatedCategoryName(majorCategory, currentLanguage)} &rarr; {getTranslatedSubcategoryName(subcategory, currentLanguage)})
                  </h4>
                  <p className="text-[10px] text-white/40 font-light">{d.specSubtext}</p>
                </div>

                {/* Selling Type Selector - Prominently placed at top of Step 3 (for physical goods) */}
                {majorCategory !== 'Properties' && (
                  <SellingTypeSelector
                    value={sellingType}
                    onChange={(type) => {
                      setSellingType(type);
                      handleFieldChange('sellingType', type);
                    }}
                  />
                )}

                {/* Admin-only Property Owner Contact Details (Hidden for Wholesale) */}
                {currentUser?.role === 'admin' && (fieldsState.sellingType || 'Retail') !== 'Wholesale' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {d.adminOwnerTitle}
                      </h4>
                    </div>
                    <p className="text-[11px] text-white/60">
                      {d.adminOwnerDesc}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerNameLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={fieldsState.ownerName || ''}
                          placeholder="e.g. Abebe Bikila"
                          onChange={e => handleFieldChange('ownerName', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerPhoneLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={fieldsState.contactPhone || ''}
                          placeholder="e.g. +251911223344"
                          onChange={e => handleFieldChange('contactPhone', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          {d.ownerEmailLabel} *
                        </label>
                        <input
                          type="email"
                          required
                          value={fieldsState.contactEmail || ''}
                          placeholder="e.g. owner@sofumer.com"
                          onChange={e => handleFieldChange('contactEmail', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          Owner Business / Company
                        </label>
                        <input
                          type="text"
                          value={fieldsState.ownerBusinessName || ''}
                          placeholder="e.g. Bikila Real Estate"
                          onChange={e => handleFieldChange('ownerBusinessName', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-white/80 uppercase mb-1">
                          Owner Photo / Logo URL
                        </label>
                        <input
                          type="url"
                          value={fieldsState.ownerAvatar || ''}
                          placeholder="https://..."
                          onChange={e => handleFieldChange('ownerAvatar', e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-zinc-900/20 p-5 rounded-2xl border border-white/5">
                  {activeFields
                    .filter(field => {
                      const excludeForPricing = [
                        'price', 'retailPrice', 'negotiable', 'quantity', 'availableQuantity', 'unit',
                        'wholesalePrice', 'minimumOrderQuantity', 'wholesaleUnit', 'sellingType', 'businessType'
                      ];
                      if (excludeForPricing.includes(field.id)) return false;

                      if (sellingType === 'Wholesale') {
                        const excludeForWholesale = [
                          'bedrooms', 'bathrooms', 'toilet', 'area', 
                          'floorLevel', 'parking', 'ownershipStatus', 'furnished', 'propertyType',
                          'contactPhone', 'contactEmail', 'ownerName'
                        ];
                        if (excludeForWholesale.includes(field.id)) return false;
                      }
                      if (currentUser?.role === 'admin' && (field.id === 'contactPhone' || field.id === 'contactEmail' || field.id === 'ownerName')) {
                        return false;
                      }
                      return true;
                    })
                    .map(field => {
                    const val = fieldsState[field.id] !== undefined ? fieldsState[field.id] : '';
                    const spanClass = field.colSpan === 'full' ? 'col-span-full' : 'col-span-1';

                    // Photo uploader
                    if (field.type === 'images') {
                      return (
                        <div key={field.id} className="col-span-full space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider">
                                {t('media.photos_limit_title') || 'Photos & Media (Max 10 Photos, 1 Video)'} *
                              </label>
                              <p className="text-[10px] text-[#F5F5F4]/40 font-light mt-0.5">
                                {t('media.reorder_hint') || 'The first photo is your Cover Photo. Reorder or set any photo as cover.'}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${imagesList.length >= 10 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {imagesList.length} / 10 {t('photos') || 'Photos'}
                            </span>
                          </div>

                          {/* Error Banner */}
                          {photoError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{photoError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Device File Picker Dropzone */}
                            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-center items-center text-center group hover:border-amber-500/40 transition duration-300 relative">
                              {isCompressingPhotos ? (
                                <div className="flex flex-col items-center py-4">
                                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                                  <span className="text-xs font-bold text-amber-400">Optimizing & compressing photos...</span>
                                </div>
                              ) : (
                                <>
                                  <Camera className="w-8 h-8 text-amber-500/60 group-hover:text-amber-500 transition mb-2" />
                                  <span className="text-xs font-bold text-white/90 block mb-1">{d.deviceUpload || 'Upload Photos'}</span>
                                  <span className="text-[10px] text-white/40 block mb-3">JPG, JPEG, PNG, WebP (Max 10MB each)</span>
                                  
                                  <label className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-xs font-bold transition duration-200 cursor-pointer inline-flex items-center gap-2">
                                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{d.uploadBtn || 'Select Photos'}</span>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/jpeg,image/jpg,image/png,image/webp"
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                  </label>
                                </>
                              )}
                            </div>

                            {/* URL & Stock Photo Input */}
                            <div className="space-y-3 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                              <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider">
                                {d.imgUrlLabel || 'Or Add Photo URL'}
                              </label>
                              
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={imageInput}
                                  onChange={e => setImageInput(e.target.value)}
                                  placeholder={d.imgUrlPlaceholder || 'https://...'}
                                  className="flex-1 p-2.5 bg-zinc-900 border border-white/10 focus:border-amber-500/60 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddImage}
                                  className="px-3.5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
                                >
                                  {d.addBtn || 'Add'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[10px] text-white/40 italic">{d.needStock || 'Need sample images?'}</span>
                                <button
                                  type="button"
                                  onClick={handleQuickAddImagePlaceholder}
                                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-amber-400 transition cursor-pointer"
                                >
                                  ⚡ {d.quickBtn || 'Quick Add'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Thumbnail Previews with Cover Badge & Reordering */}
                          {imagesList.length > 0 && (
                            <div className="pt-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                  {d.addedPhotos || 'Selected Photos'} ({imagesList.length}/10)
                                </label>
                                <span className="text-[10px] text-amber-400/80">★ First photo is Cover Photo</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {imagesList.map((img, i) => (
                                  <div 
                                    key={i} 
                                    className={`relative rounded-2xl overflow-hidden border transition shadow-lg group bg-zinc-950 ${
                                      i === 0 ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-white/10 hover:border-white/30'
                                    }`}
                                  >
                                    <div className="h-24 w-full overflow-hidden">
                                      <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                                    </div>

                                    {/* Cover Badge */}
                                    {i === 0 ? (
                                      <div className="absolute top-1.5 left-1.5 bg-amber-500 text-black px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 shadow">
                                        <Star className="w-2.5 h-2.5 fill-black" />
                                        <span>{t('media.cover_photo') || 'Cover Photo'}</span>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSetCoverPhoto(i)}
                                        className="absolute top-1.5 left-1.5 bg-black/70 hover:bg-amber-500 hover:text-black text-white px-2 py-0.5 rounded-md text-[9px] font-bold border border-white/20 transition cursor-pointer"
                                      >
                                        {t('media.set_as_cover') || 'Set as Cover'}
                                      </button>
                                    )}

                                    {/* Control Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition duration-200">
                                      {i > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => handleMovePhoto(i, 'left')}
                                          title="Move Left"
                                          className="p-1.5 bg-zinc-800/90 hover:bg-amber-500 hover:text-black text-white rounded-lg transition cursor-pointer"
                                        >
                                          <ArrowLeft className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {i < imagesList.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleMovePhoto(i, 'right')}
                                          title="Move Right"
                                          className="p-1.5 bg-zinc-800/90 hover:bg-amber-500 hover:text-black text-white rounded-lg transition cursor-pointer"
                                        >
                                          <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(i)}
                                        title="Remove"
                                        className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Dedicated Video Showcase Uploader
                    if (field.id === 'video' || field.id === 'videoUrl') {
                      const currentVid = fieldsState.video || fieldsState.videoUrl || '';
                      return (
                        <div key={field.id} className="col-span-full space-y-3 bg-zinc-900/40 border border-white/10 p-5 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold text-[#F5F5F4]/80 uppercase tracking-wider flex items-center gap-2">
                              <Video className="w-4 h-4 text-amber-500" />
                              <span>{t("upload_video_file")} (Optional, Max 30s, 50MB)</span>
                            </label>
                            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              MP4, MOV, WebM
                            </span>
                          </div>

                          {/* Video Error Banner */}
                          {videoError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              <span>{videoError}</span>
                            </div>
                          )}

                          {isVideoUploading ? (
                            <div className="p-6 bg-zinc-950 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                              <span className="text-xs font-bold text-white">{t('media.video_uploading') || 'Processing & Uploading Video...'}</span>
                              <span className="text-[10px] text-white/40">Validating duration (max 30s) & preparing stream...</span>
                            </div>
                          ) : currentVid ? (
                            <div className="bg-zinc-950 rounded-2xl overflow-hidden border border-amber-500/30 p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span>{t("upload_video_file")} Uploaded & Ready</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-white/10">
                                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{t('media.replace_video') || 'Replace'}</span>
                                    <input
                                      type="file"
                                      accept="video/mp4,video/quicktime,video/webm"
                                      onChange={e => e.target.files?.[0] && handleVideoFileChange(e.target.files[0])}
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleRemoveVideo}
                                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t('media.remove_video') || 'Remove'}</span>
                                  </button>
                                </div>
                              </div>
                              <div className="rounded-xl overflow-hidden bg-black max-h-64 flex justify-center">
                                <video
                                  src={currentVid}
                                  controls
                                  className="max-h-64 w-full object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Direct File Selector */}
                              <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 bg-zinc-950/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center group transition">
                                <Film className="w-8 h-8 text-amber-500/60 group-hover:text-amber-500 transition mb-2" />
                                <span className="text-xs font-bold text-white mb-0.5">Upload Video File</span>
                                <span className="text-[10px] text-white/40 mb-3">Max 30s duration, 50MB file size</span>
                                
                                <label className="px-4 py-2 bg-amber-500 text-black hover:bg-amber-400 font-bold rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-lg">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{t('media.upload_video_btn') || 'Select Video File'}</span>
                                  <input
                                    type="file"
                                    accept="video/mp4,video/quicktime,video/webm"
                                    onChange={e => e.target.files?.[0] && handleVideoFileChange(e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              {/* Video URL Fallback Input */}
                              <div className="space-y-2 flex flex-col justify-center">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">
                                  Or Paste Direct Video URL
                                </label>
                                <input
                                  type="text"
                                  value={currentVid}
                                  placeholder="https://example.com/video.mp4"
                                  onChange={e => {
                                    setVideoError('');
                                    handleFieldChange(field.id, e.target.value);
                                  }}
                                  className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-mono"
                                />
                                <span className="text-[10px] text-white/30 italic">Supports direct MP4/WebM video links.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Select input
                    if (field.type === 'select') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                            {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                          </label>
                          <select
                            value={val}
                            required={field.required}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            {field.options?.map(opt => (
                              <option key={opt} value={opt} className="bg-[#0c0c0c]">
                                {getTranslatedOption(opt, currentLanguage)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // Textarea input
                    if (field.type === 'textarea') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                            {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                          </label>
                          <textarea
                            rows={3}
                            value={val}
                            required={field.required}
                            placeholder={field.placeholder}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light resize-none"
                          />
                        </div>
                      );
                    }

                    // Location input enhancement for long addresses
                    if (field.id === 'location') {
                      return (
                        <div key={field.id} className={spanClass}>
                          <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-normal normal-case">Full address (multi-line auto-wrap)</span>
                          </label>
                          <textarea
                            rows={2}
                            required={field.required}
                            value={val}
                            placeholder={field.placeholder || 'e.g., Bole Sub City, Woreda 03, Near Edna Mall, Addis Ababa'}
                            onChange={e => handleFieldChange(field.id, e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light resize-y min-h-[52px] leading-relaxed break-words whitespace-pre-wrap"
                          />
                        </div>
                      );
                    }

                    // Standard text / number inputs
                    return (
                      <div key={field.id} className={spanClass}>
                        <label className="block text-[11px] font-bold text-[#F5F5F4]/70 uppercase tracking-wider mb-1">
                          {getTranslatedFieldLabel(field.label, currentLanguage)} {field.required && '*'}
                        </label>
                        <input
                          type={field.type === 'number' ? 'text' : field.type}
                          inputMode="text"
                          required={field.required}
                          value={val}
                          placeholder={field.placeholder}
                          onChange={e => handleFieldChange(field.id, e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition placeholder-zinc-600 font-light"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Conditional Pricing & Inventory Engine based on Category and Selling Type */}
                {majorCategory === 'Properties' ? (
                  <div className="bg-zinc-900/40 border border-white/10 p-5 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Property Pricing
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          Property Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs text-amber-500 font-bold">{currency}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            placeholder="e.g. 10000000"
                            value={fieldsState.price !== undefined ? fieldsState.price : (fieldsState.retailPrice || '')}
                            onChange={e => {
                              handleFieldChange('price', e.target.value);
                              handleFieldChange('retailPrice', e.target.value);
                            }}
                            className="w-full pl-14 pr-3 py-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-medium focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          💱 Currency *
                        </label>
                        <select
                          value={currency}
                          onChange={e => setCurrency(e.target.value as any)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition font-bold text-amber-400"
                        >
                          <option value="ETB">{t("curr_etb")}</option>
                          <option value="USD">{t("curr_usd")}</option>
                          <option value="SAR">{t("curr_sar")}</option>
                          <option value="EUR">{t("curr_eur")}</option>
                          <option value="AED">{t("curr_aed")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                          Price Negotiable?
                        </label>
                        <select
                          value={fieldsState.negotiable || 'No'}
                          onChange={e => handleFieldChange('negotiable', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                        >
                          <option value="No">{t("opt_no_fixed_price")}</option>
                          <option value="Yes">{t("opt_yes_negotiable")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="bg-zinc-900/40 border border-white/10 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {sellingType === 'Retail' ? 'Retail Pricing & Inventory' : sellingType === 'Wholesale' ? 'Wholesale Pricing & Bulk Quantities' : 'Retail & Wholesale Combined Pricing'}
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {sellingType}
                    </span>
                  </div>

                  {/* Common Unit of Sale & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                        📏 Unit of Sale *
                      </label>
                      <select
                        value={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
                        onChange={e => {
                          handleFieldChange('unit', e.target.value);
                          handleFieldChange('wholesaleUnit', e.target.value);
                        }}
                        className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                      >
                        {STANDARD_UNITS.map(u => (
                          <option key={u} value={u} className="bg-zinc-900 text-white">
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                        💱 Currency *
                      </label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as any)}
                        className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition font-bold text-amber-400"
                      >
                        <option value="ETB">{t("curr_etb")}</option>
                        <option value="USD">{t("curr_usd")}</option>
                        <option value="SAR">{t("curr_sar")}</option>
                        <option value="EUR">{t("curr_eur")}</option>
                        <option value="AED">{t("curr_aed")}</option>
                      </select>
                    </div>
                  </div>

                  {/* 1. RETAIL FIELDS (Shown for Retail and Retail + Wholesale) */}
                  {(sellingType === 'Retail' || sellingType === 'Retail + Wholesale' || (sellingType as any) === 'Retail & Wholesale') && (
                    <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Retail Pricing Details
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                            Retail Price (Per {fieldsState.unit || 'Unit'}) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-xs text-amber-500 font-bold">{currency}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              required
                              placeholder="e.g. 250"
                              value={fieldsState.retailPrice !== undefined ? fieldsState.retailPrice : (fieldsState.price || '')}
                              onChange={e => {
                                handleFieldChange('retailPrice', e.target.value);
                                handleFieldChange('price', e.target.value);
                              }}
                              className="w-full pl-14 pr-3 py-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white font-mono font-medium focus:outline-none transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                            Available Retail Stock (Qty) *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            placeholder="e.g. 50"
                            value={fieldsState.quantity !== undefined ? fieldsState.quantity : (fieldsState.availableQuantity || '')}
                            onChange={e => {
                              handleFieldChange('quantity', e.target.value);
                              if (sellingType === 'Retail') {
                                handleFieldChange('availableQuantity', e.target.value);
                              }
                            }}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                            Price Negotiable?
                          </label>
                          <select
                            value={fieldsState.negotiable || 'No'}
                            onChange={e => handleFieldChange('negotiable', e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            <option value="No">{t("opt_no_fixed_price")}</option>
                            <option value="Yes">{t("opt_yes_negotiable")}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. WHOLESALE FIELDS (Shown for Wholesale and Retail + Wholesale) */}
                  {(sellingType === 'Wholesale' || sellingType === 'Retail + Wholesale' || (sellingType as any) === 'Retail & Wholesale') && (
                    <div className="bg-zinc-950/60 border border-amber-500/20 p-4 rounded-xl space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Wholesale Tiered Pricing & Minimum Order Quantity
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300/80 font-mono">
                          Bulk Wholesale Rules
                        </span>
                      </div>

                      {/* Stock Quantity for Wholesale-only */}
                      {sellingType === 'Wholesale' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                              Total Available Bulk Stock ({fieldsState.unit || 'Units'}) *
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              required
                              placeholder="e.g. 500"
                              value={fieldsState.availableQuantity !== undefined ? fieldsState.availableQuantity : ''}
                              onChange={e => handleFieldChange('availableQuantity', e.target.value)}
                              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                            />
                            <span className="text-[10px] text-white/40 mt-1 block">
                              Must be at least equal to your Minimum Order Quantity (MOQ).
                            </span>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                              Price Negotiable on Large Volumes?
                            </label>
                            <select
                              value={fieldsState.negotiable || 'No'}
                              onChange={e => handleFieldChange('negotiable', e.target.value)}
                              className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                            >
                              <option value="No">{t("opt_no_fixed_tier")}</option>
                              <option value="Yes">{t("opt_yes_open_discussion")}</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Wholesale Pricing Tiers Editor */}
                      <WholesalePricingTiersEditor
                        currency={currency}
                        unit={fieldsState.unit || fieldsState.wholesaleUnit || 'Piece'}
                        moq={fieldsState.minimumOrderQuantity}
                        initialMoq={Number(fieldsState.minimumOrderQuantity || 1)}
                        tiers={wholesaleTiers}
                        isRetailAndWholesale={sellingType === 'Retail + Wholesale' || (sellingType as any) === 'Retail & Wholesale'}
                        onChange={(moq, newTiers) => {
                          setWholesaleTiers(newTiers);
                          handleFieldChange('minimumOrderQuantity', moq);
                          if (newTiers[0]?.pricePerUnit) {
                            handleFieldChange('wholesalePrice', newTiers[0].pricePerUnit);
                          }
                        }}
                      />

                      {/* Business Type & Delivery Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div>
                          <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                            🏢 Supplier Business Type
                          </label>
                          <select
                            value={fieldsState.businessType || 'Wholesaler'}
                            onChange={e => handleFieldChange('businessType', e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            <option value="Wholesaler">{t("biz_wholesaler")}</option>
                            <option value="Manufacturer">{t("biz_manufacturer")}</option>
                            <option value="Distributor">{t("biz_distributor")}</option>
                            <option value="Importer">{t("biz_importer")}</option>
                            <option value="Exporter">{t("biz_exporter")}</option>
                            <option value="Authorized Dealer">{t("biz_authorized_dealer")}</option>
                            <option value="Local Supplier">{t("biz_local_supplier")}</option>
                            <option value="Farmer / Producer">{t("biz_farmer_producer")}</option>
                            <option value="Cooperative">{t("biz_cooperative")}</option>
                            <option value="Other">{t("unit_other")}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-1">
                            📞 Supplier Contact Phone Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. +251911223344"
                            value={fieldsState.contactPhone || ''}
                            onChange={e => handleFieldChange('contactPhone', e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Delivery Options */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider">
                          🚚 Bulk Delivery Options
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'Store Pickup', label: 'Store / Warehouse Pickup' },
                            { id: 'Local Delivery', label: 'Local City Delivery' },
                            { id: 'Nationwide Delivery', label: 'Nationwide Freight Delivery' }
                          ].map(item => {
                            const currentDel: string[] = Array.isArray(fieldsState.deliveryOptions) ? fieldsState.deliveryOptions : [];
                            const isChecked = currentDel.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                    : 'bg-zinc-900/80 border-white/10 text-white/70 hover:border-white/20'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      handleFieldChange('deliveryOptions', [...currentDel, item.id]);
                                    } else {
                                      handleFieldChange('deliveryOptions', currentDel.filter(d => d !== item.id));
                                    }
                                  }}
                                  className="accent-amber-500 rounded"
                                />
                                <span>{item.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Wholesale Terms (Optional) */}
                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <label className="block text-[11px] font-bold text-white/80 uppercase tracking-wider">
                          📝 Wholesale Policy & Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Example: Tier 1 pricing applies from 10 to 49 pieces. Cash on delivery or bank transfer accepted. Lead time 2-3 business days."
                          value={fieldsState.wholesaleNotes || ''}
                          onChange={e => handleFieldChange('wholesaleNotes', e.target.value)}
                          className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition resize-none font-light placeholder-zinc-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* 3. PRODUCT VARIATIONS / SKU MANAGEMENT (For physical products only) */}
                {majorCategory !== 'Properties' && (
                  <ProductVariationsManager
                    variations={variationsList}
                    onChange={setVariationsList}
                  />
                )}
              </form>
            )}

            {/* STEP 4: LIVE PREVIEW MODE */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Eye className="w-4 h-4" />
                    <span>{d.previewHeader}</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70">{d.previewSubtext}</span>
                </div>

                <div className="bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl max-w-xl mx-auto">
                  <div className="relative h-52 bg-zinc-800">
                    <img 
                      src={imagesList[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'} 
                      alt="Listing Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-wider border border-white/10">
                      {getTranslatedCategoryName(majorCategory, currentLanguage)} &bull; {getTranslatedSubcategoryName(subcategory, currentLanguage)}
                    </div>
                    {imagesList.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>{imagesList.length} {d.photosCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white line-clamp-1">
                          {fieldsState.title || d.untitled}
                        </h3>
                        <div className="text-xs text-white/70 flex items-start gap-1.5 mt-1.5 leading-relaxed bg-white/5 p-2 rounded-xl border border-white/5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="whitespace-pre-wrap break-words flex-1 text-white/90 leading-snug">
                            {fieldsState.location || d.noLocation}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {majorCategory === 'Properties' ? (
                          <span className="text-lg font-extrabold text-amber-400 font-mono block">
                            {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : d.contactPrice}
                          </span>
                        ) : (fieldsState.sellingType || 'Retail') === 'Wholesale' ? (
                          <>
                            <span className="text-lg font-extrabold text-amber-400 font-mono block">
                              {fieldsState.wholesalePrice ? `${Number(fieldsState.wholesalePrice).toLocaleString()} ${currency}` : d.contactPrice}
                              <span className="text-xs font-normal text-amber-300/80 ml-1">/ {fieldsState.wholesaleUnit || 'Piece'}</span>
                            </span>
                            <span className="text-[10px] text-amber-300/90 font-bold block mt-0.5">
                              MOQ: {fieldsState.minimumOrderQuantity || 1} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 1), fieldsState.wholesaleUnit || fieldsState.unit || 'Piece')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-lg font-extrabold text-amber-400 font-mono block">
                              {fieldsState.price ? `${Number(fieldsState.price).toLocaleString()} ${currency}` : d.contactPrice}
                            </span>
                            {(fieldsState.sellingType || 'Retail') === 'Retail & Wholesale' && fieldsState.wholesalePrice && (
                              <span className="text-[10px] text-amber-300 font-bold block mt-0.5">
                                Wholesale: {Number(fieldsState.wholesalePrice).toLocaleString()} {currency} / {fieldsState.wholesaleUnit || fieldsState.unit || 'Piece'} (MOQ: {fieldsState.minimumOrderQuantity || 1} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 1), fieldsState.wholesaleUnit || fieldsState.unit || 'Piece')})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {majorCategory !== 'Properties' && ((fieldsState.sellingType || 'Retail') === 'Wholesale' || (fieldsState.sellingType || 'Retail') === 'Retail & Wholesale') && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-amber-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{fieldsState.sellingType} &bull; {fieldsState.businessType || 'Wholesaler'}</span>
                        </div>
                        <div className="text-[10px] text-amber-400/80 font-mono text-right">
                          <span>MOQ: {fieldsState.minimumOrderQuantity || 1} {getPluralizedUnit(Number(fieldsState.minimumOrderQuantity || 1), fieldsState.wholesaleUnit || fieldsState.unit || 'Piece')}</span>
                          {fieldsState.availableQuantity ? (
                            <span className="ml-2 font-semibold text-amber-300">
                              &bull; Stock: {fieldsState.availableQuantity} {getPluralizedUnit(Number(fieldsState.availableQuantity), fieldsState.wholesaleUnit || fieldsState.unit || 'Piece')}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Wholesale Tiers Preview in Step 4 */}
                    {majorCategory !== 'Properties' && ((fieldsState.sellingType || 'Retail') === 'Wholesale' || (fieldsState.sellingType || 'Retail') === 'Retail & Wholesale' || (fieldsState.sellingType || 'Retail') === 'Retail + Wholesale') && wholesaleTiers.length > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                          <span>📦 Tiered Bulk Pricing</span>
                          <span className="text-[10px] text-white/50">{wholesaleTiers.length} Volume Tiers</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {wholesaleTiers.map((tier, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 p-2 rounded-lg text-center">
                              <span className="text-[10px] text-white/60 block">
                                {tier.minQuantity}{tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} {fieldsState.unit || fieldsState.wholesaleUnit || 'units'}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-400">
                                {Number(tier.pricePerUnit).toLocaleString()} {currency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variations Preview in Step 4 */}
                    {majorCategory !== 'Properties' && variationsList.length > 0 && (
                      <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-1.5">
                        <span className="text-[11px] font-bold text-white/80 block">
                          🎨 Available Options ({variationsList.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {variationsList.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-white font-medium border border-white/10">
                              {v.name}: <strong className="text-amber-300">{v.value}</strong>
                              {v.priceAdjustment ? ` (${v.priceAdjustment > 0 ? '+' : ''}${v.priceAdjustment} ${currency})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                      {buildCleanAmenities(majorCategory, subcategory, fieldsState, activeFields).map((spec, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] text-white/80 font-medium truncate">
                          ✨ {spec}
                        </div>
                      ))}
                    </div>

                    {/* Description Snippet */}
                    <div className="text-xs text-white/60 line-clamp-2 pt-1 border-t border-white/5">
                      {fieldsState.description || d.noDesc}
                    </div>

                    {/* Seller Contact Info Preview */}
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {fieldsState.ownerAvatar ? (
                          <img src={fieldsState.ownerAvatar} alt={fieldsState.ownerName || 'Owner'} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs border border-amber-500/30">
                            {(fieldsState.ownerName || currentUser?.fullName || 'O').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-white block text-[11px]">
                            {fieldsState.ownerName || (currentUser?.role === 'admin' ? 'Property Owner' : currentUser?.fullName)}
                          </span>
                          <span className="text-[10px] text-amber-400/80 block font-mono">
                            {fieldsState.ownerBusinessName || (currentUser?.role === 'admin' ? 'Public Listing Owner' : d.verifiedPublisher)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <Phone className="w-3.5 h-3.5" />
                        <span>
                          {fieldsState.contactPhone || (currentUser?.role === 'admin' ? 'Owner Phone' : (currentUser?.phone || '+251911...'))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BOOST PLAN & PAYMENT METHOD */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>{d.boostTitle}</span>
                  </h4>
                  <p className="text-[11px] text-[#F5F5F4]/50 font-light">{d.boostSubtext}</p>
                </div>

                {/* Free Listing Campaign Notice Card */}
                <div className="bg-zinc-900/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${campaignInfo.badgeColor}`}>
                        {campaignInfo.status}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {campaignInfo.displayText}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 font-medium">
                      <span className="text-amber-400 font-bold">Campaign Period:</span> {campaignInfo.startDateFormatted} → {campaignInfo.endDateFormatted}
                    </p>
                  </div>
                  {campaignInfo.isActive && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        🎁 Free Listing Eligible ({campaignInfo.maxListings} per user limit)
                      </span>
                    </div>
                  )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {allPromotionPlans.map(p => {
                    const isSel = selectedPlan === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition cursor-pointer ${
                          isSel 
                            ? 'bg-amber-500/15 border-amber-500 shadow-lg text-white' 
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/10 text-white/70'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                              {p.badge}
                            </span>
                            <span className="text-[10px] text-white/40">{p.days}</span>
                          </div>
                          <h5 className="font-bold text-sm text-white mb-1">{p.name}</h5>
                          <p className="text-[10px] text-white/50 mb-3">{p.desc}</p>
                        </div>
                        <div className="pt-2 border-t border-white/5 font-mono text-base font-extrabold text-amber-400">
                          {p.cost === 0 ? '0 ETB' : `${p.cost} ETB`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add-ons Selection */}
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">{d.addonsTitle}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${isTopAdAddon ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                      <div className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={isTopAdAddon}
                          onChange={e => setIsTopAdAddon(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{d.topAd}</span>
                          <span className="text-[10px] text-white/40">{d.topAdDesc}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">+{topAdPrice} ETB</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${isFeaturedAddon ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                      <div className="flex items-center gap-2.5 text-xs">
                        <input
                          type="checkbox"
                          checked={isFeaturedAddon}
                          onChange={e => setIsFeaturedAddon(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold block">{d.spotlight}</span>
                          <span className="text-[10px] text-white/40">{d.spotlightDesc}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">+{featuredPrice} ETB</span>
                    </label>
                  </div>
                </div>

                {/* Price Breakdown Summary */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white uppercase block">{d.totalInvestment}</span>
                    <span className="text-[10px] text-amber-300/70">{d.totalInvestmentSub}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">{totalCost} ETB</span>
                  </div>
                </div>

                {/* Payment Options (If totalCost > 0) */}
                {totalCost > 0 && (
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {d.payMethodLabel}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                          paymentMethod === 'wallet' 
                            ? 'bg-amber-500/15 border-amber-500 text-white' 
                            : 'bg-zinc-900/40 border-white/5 text-white/60 hover:bg-zinc-900'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">{d.accWallet}</span>
                          <span className="text-[10px] text-white/50 block font-mono">
                            {d.walletBal} {walletBalance.toLocaleString()} ETB
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('direct')}
                        className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                          paymentMethod === 'direct' 
                            ? 'bg-amber-500/15 border-amber-500 text-white' 
                            : 'bg-zinc-900/40 border-white/5 text-white/60 hover:bg-zinc-900'
                        }`}
                      >
                        <Building className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">{d.directBank}</span>
                          <span className="text-[10px] text-white/50 block">{d.directSub}</span>
                        </div>
                      </button>
                    </div>

                    {/* Wallet Details View */}
                    {paymentMethod === 'wallet' && (
                      <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">{d.yourBal}</span>
                          <span className="font-mono font-bold text-white">{walletBalance.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">{d.deduction}</span>
                          <span className="font-mono font-bold text-amber-400">-{totalCost} ETB</span>
                        </div>
                        {walletBalance < totalCost ? (
                          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg mt-2 font-medium">
                            ⚠️ {d.insufficientBal}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-lg mt-2 font-medium">
                            ✅ {d.sufficientBal}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Direct Transfer View */}
                    {paymentMethod === 'direct' && (
                      <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/10 space-y-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-white/70 uppercase mb-1.5">
                            {d.payChannel}
                          </label>
                          <select
                            value={selectedDirectMethodId}
                            onChange={e => setSelectedDirectMethodId(e.target.value)}
                            className="w-full p-3 bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition"
                          >
                            <option value="">{d.payChannelPlaceholder}</option>
                            {paymentMethods.map(m => (
                              <option key={m.id} value={m.id} className="bg-[#0c0c0c]">
                                {m.name} ({m.accountNumber})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2">
                          <ReceiptUploadInput
                            referenceNumber={receiptRefNumber}
                            onReferenceChange={setReceiptRefNumber}
                            receiptFile={receiptFileData?.url || ''}
                            fileName={receiptFileData?.fileName}
                            fileType={receiptFileData?.fileType}
                            fileSize={receiptFileData?.fileSize}
                            onFileChange={(data) => setReceiptFileData(data)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Dynamic Footer Actions */}
          <div className="p-5 border-t border-white/10 bg-[#08080a] flex justify-between items-center gap-3 shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-bold transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{d.backBtn}</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white/50 hover:text-white text-xs font-bold transition duration-200 cursor-pointer"
              >
                {d.cancelBtn}
              </button>

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{d.chooseSubBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>{d.fillSpecsBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={(e) => handleValidateStep3(e)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{d.previewAdBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 transition duration-200 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{d.selectPromoBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              )}

              {currentStep === 5 && (
                <button
                  type="button"
                  disabled={submitting || (totalCost > 0 && paymentMethod === 'wallet' && walletBalance < totalCost)}
                  onClick={handleFinalPublish}
                  className="px-6 py-2.5 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition duration-200 cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <span>{d.pubProgress}</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>{totalCost === 0 ? d.pubFreeBtn : d.payAndPostBtn.replace('{cost}', String(totalCost))}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
