import { Property, WholesalePriceTier } from '../types';

export type NormalizedSellingType = 'Retail' | 'Wholesale' | 'Retail + Wholesale';

export const STANDARD_UNITS = [
  'Piece',
  'Pair',
  'Set',
  'Box',
  'Kg',
  'Liter',
  'Meter',
  'Other'
] as const;

export const STANDARD_CONDITIONS = [
  'New',
  'Used',
  'Refurbished'
] as const;

/**
 * Normalizes selling type for uniform comparisons and backward compatibility.
 * Default is 'Retail' for any existing/legacy listing without this field.
 */
export function normalizeSellingType(rawType?: string | null): NormalizedSellingType {
  if (!rawType) return 'Retail';
  const clean = String(rawType).trim().toLowerCase();
  if (clean === 'wholesale') return 'Wholesale';
  if (clean === 'retail_wholesale' || clean === 'retail + wholesale' || clean === 'retail & wholesale') {
    return 'Retail + Wholesale';
  }
  return 'Retail';
}

/**
 * Safely extracts wholesale pricing tiers, with legacy fallbacks.
 */
export function getWholesaleTiers(property: Partial<Property>): WholesalePriceTier[] {
  if (Array.isArray(property.wholesalePriceTiers) && property.wholesalePriceTiers.length > 0) {
    return [...property.wholesalePriceTiers]
      .filter(t => t && typeof t.minimumQuantity === 'number' && typeof t.pricePerUnit === 'number')
      .sort((a, b) => a.minimumQuantity - b.minimumQuantity);
  }

  // Fallback for legacy listings with wholesalePrice and minimumOrderQuantity
  if (property.wholesalePrice && Number(property.wholesalePrice) > 0) {
    return [
      {
        minimumQuantity: property.minimumOrderQuantity ? Math.max(1, Number(property.minimumOrderQuantity)) : 1,
        pricePerUnit: Number(property.wholesalePrice)
      }
    ];
  }

  return [];
}

/**
 * Retrieves the effective Minimum Order Quantity (MOQ).
 */
export function getMoq(property: Partial<Property>): number {
  if (property.minimumOrderQuantity && Number(property.minimumOrderQuantity) > 0) {
    return Number(property.minimumOrderQuantity);
  }
  const tiers = getWholesaleTiers(property);
  if (tiers.length > 0 && tiers[0].minimumQuantity > 0) {
    return tiers[0].minimumQuantity;
  }
  return 1;
}

/**
 * Retrieves standard product unit label (e.g., 'Piece', 'Box', 'Kg').
 */
export function getProductUnit(property: Partial<Property>): string {
  return property.unit || property.wholesaleUnit || 'Piece';
}

export interface PriceCalculationResult {
  unitPrice: number;
  totalPrice: number;
  sellingType: NormalizedSellingType;
  isWholesaleTier: boolean;
  activeTier: WholesalePriceTier | null;
  moq: number;
  meetsMoq: boolean;
  nextTier?: WholesalePriceTier | null;
  unitsToNextTier?: number;
  currency: string;
}

/**
 * Automatically determines the correct unit price and total price based on buyer quantity.
 * Implements Section 8 & Section 9 of SOF-UMER listing specification.
 */
export function calculateDynamicPrice(
  property: Partial<Property>,
  requestedQuantity: number
): PriceCalculationResult {
  const sellingType = normalizeSellingType(property.sellingType);
  const qty = Math.max(1, Math.floor(requestedQuantity || 1));
  const currency = property.currency || 'ETB';
  const retailPrice = Number(property.retailPrice || property.price || 0);
  const moq = getMoq(property);
  const tiers = getWholesaleTiers(property);

  if (sellingType === 'Retail') {
    return {
      unitPrice: retailPrice,
      totalPrice: retailPrice * qty,
      sellingType: 'Retail',
      isWholesaleTier: false,
      activeTier: null,
      moq: 1,
      meetsMoq: true,
      nextTier: null,
      currency
    };
  }

  if (sellingType === 'Wholesale') {
    const meetsMoq = qty >= moq;
    let activeTier: WholesalePriceTier | null = null;
    let nextTier: WholesalePriceTier | null = null;

    for (let i = 0; i < tiers.length; i++) {
      if (qty >= tiers[i].minimumQuantity) {
        activeTier = tiers[i];
      } else if (!nextTier) {
        nextTier = tiers[i];
      }
    }

    const fallbackPrice = activeTier ? activeTier.pricePerUnit : (tiers[0]?.pricePerUnit || Number(property.wholesalePrice || retailPrice));
    const unitPrice = fallbackPrice;

    return {
      unitPrice,
      totalPrice: unitPrice * qty,
      sellingType: 'Wholesale',
      isWholesaleTier: true,
      activeTier,
      moq,
      meetsMoq,
      nextTier,
      unitsToNextTier: nextTier ? Math.max(0, nextTier.minimumQuantity - qty) : undefined,
      currency
    };
  }

  // Retail + Wholesale
  if (qty < moq || tiers.length === 0) {
    // Falls back to retail pricing
    const nextTier = tiers.find(t => t.minimumQuantity >= moq) || tiers[0] || null;
    return {
      unitPrice: retailPrice,
      totalPrice: retailPrice * qty,
      sellingType: 'Retail + Wholesale',
      isWholesaleTier: false,
      activeTier: null,
      moq,
      meetsMoq: true, // Retail + Wholesale allows buying below MOQ at retail price!
      nextTier,
      unitsToNextTier: nextTier ? Math.max(0, nextTier.minimumQuantity - qty) : undefined,
      currency
    };
  }

  // Qualifies for wholesale tiers
  let activeTier: WholesalePriceTier | null = null;
  let nextTier: WholesalePriceTier | null = null;

  for (let i = 0; i < tiers.length; i++) {
    if (qty >= tiers[i].minimumQuantity) {
      activeTier = tiers[i];
    } else if (!nextTier) {
      nextTier = tiers[i];
    }
  }

  const unitPrice = activeTier ? activeTier.pricePerUnit : retailPrice;

  return {
    unitPrice,
    totalPrice: unitPrice * qty,
    sellingType: 'Retail + Wholesale',
    isWholesaleTier: activeTier !== null,
    activeTier,
    moq,
    meetsMoq: true,
    nextTier,
    unitsToNextTier: nextTier ? Math.max(0, nextTier.minimumQuantity - qty) : undefined,
    currency
  };
}

/**
 * Validates wholesale tiers and MOQ according to Section 10 rules.
 */
export function validateWholesaleConfig(
  moqInput: number | string,
  tiers: WholesalePriceTier[]
): { isValid: boolean; error?: string } {
  const moq = Number(moqInput);
  if (!moq || isNaN(moq) || moq < 1) {
    return { isValid: false, error: 'Minimum Order Quantity (MOQ) must be at least 1 unit.' };
  }

  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return { isValid: false, error: 'At least one wholesale pricing tier is required.' };
  }

  // Ensure first tier starts at or matches MOQ
  if (tiers[0].minimumQuantity !== moq) {
    return {
      isValid: false,
      error: `The first wholesale pricing tier must start at your MOQ (${moq} units).`
    };
  }

  const seenQuantities = new Set<number>();

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const qty = Number(tier.minimumQuantity);
    const price = Number(tier.pricePerUnit);

    if (isNaN(qty) || qty < 1) {
      return { isValid: false, error: `Tier #${i + 1} has an invalid quantity.` };
    }

    if (isNaN(price) || price <= 0) {
      return { isValid: false, error: `Tier #${i + 1} price per unit must be greater than 0.` };
    }

    if (seenQuantities.has(qty)) {
      return { isValid: false, error: `Duplicate quantity threshold detected: ${qty} units.` };
    }
    seenQuantities.add(qty);

    if (i > 0) {
      const prevQty = Number(tiers[i - 1].minimumQuantity);
      if (qty <= prevQty) {
        return {
          isValid: false,
          error: `Quantity tiers must strictly increase: Tier #${i + 1} (${qty}) must be greater than Tier #${i} (${prevQty}).`
        };
      }
    }
  }

  return { isValid: true };
}

export interface CustomerTierDisplay {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  label: string; // e.g. "10+ — ETB 1,200 / piece"
}

export interface ListingCustomerPricingDisplay {
  currency: string;
  unit: string;
  hasRetailPrice: boolean;
  retailPrice: number | null;
  retailPriceFormatted: string | null; // e.g. "ETB 1,500 / piece"
  hasAvailableQuantity: boolean;
  availableQuantity: number | null;
  availableQuantityFormatted: string | null; // e.g. "Available: 25 pieces"
  hasMoq: boolean;
  moq: number | null;
  moqFormatted: string | null; // e.g. "MOQ: 10 pieces"
  hasWholesaleTiers: boolean;
  wholesaleTiers: CustomerTierDisplay[];
}

export function formatQuantityWithUnit(quantity: number, rawUnit?: string): string {
  const cleanUnit = (rawUnit || 'piece').trim();
  const unitLower = cleanUnit.toLowerCase();

  if (['kg', 'kilogram', 'kilograms', 'g', 'gram', 'grams', 'liter', 'liters', 'meter', 'meters', 'ton', 'tons'].includes(unitLower)) {
    return `${quantity.toLocaleString()} ${cleanUnit}`;
  }

  if (quantity === 1) {
    const sing = cleanUnit.endsWith('s') && cleanUnit.length > 3 ? cleanUnit.slice(0, -1) : cleanUnit;
    return `1 ${sing}`;
  }

  if (unitLower.endsWith('s')) {
    return `${quantity.toLocaleString()} ${cleanUnit}`;
  }
  if (unitLower === 'box') {
    return `${quantity.toLocaleString()} boxes`;
  }
  return `${quantity.toLocaleString()} ${cleanUnit}s`;
}

/**
 * Generates pure data-driven pricing & quantity display for customer-facing screens.
 * Strictly adheres to:
 * - NO selling-type labels (No "Retail", No "Wholesale", No "Retail + Wholesale")
 * - NO word "Wholesale" in customer pricing display
 * - Displays only what the seller actually entered
 * - Hides all empty/null/zero fields completely (no "N/A" or placeholders)
 */
export function getListingCustomerPricingDisplay(property: Partial<Property>): ListingCustomerPricingDisplay {
  const currency = property.currency || 'ETB';
  const majorCategory = property.majorCategory;
  const isProductCategory = !majorCategory || (majorCategory as string) === 'Products' || (majorCategory as string) === 'Electronics';

  // Unit
  const rawUnit = property.unit || (property as any).wholesaleUnit || (isProductCategory ? 'piece' : '');
  const cleanUnit = rawUnit.trim();
  const unitForPriceSlash = cleanUnit ? cleanUnit.toLowerCase() : '';

  // Selling Type (internal configuration only)
  const normalizedSt = normalizeSellingType(property.sellingType);

  // 1. Retail Price
  let retailPrice: number | null = null;
  if ((property as any).retailPrice !== undefined && (property as any).retailPrice !== null && (property as any).retailPrice !== '') {
    const p = Number((property as any).retailPrice);
    if (!isNaN(p) && p > 0) {
      retailPrice = p;
    }
  } else if (normalizedSt !== 'Wholesale' && property.price !== undefined && property.price !== null && (property.price as any) !== '') {
    const p = Number(property.price);
    if (!isNaN(p) && p > 0) {
      retailPrice = p;
    }
  }

  const hasRetailPrice = retailPrice !== null && retailPrice > 0;
  const retailPriceFormatted = hasRetailPrice
    ? (unitForPriceSlash
        ? `${currency} ${retailPrice!.toLocaleString()} / ${unitForPriceSlash}`
        : `${currency} ${retailPrice!.toLocaleString()}`)
    : null;

  // 2. Available Quantity
  let availableQuantity: number | null = null;
  const propQty = (property as any).quantity;
  const rawAvail = (property as any).availableQuantity !== undefined && (property as any).availableQuantity !== null && (property as any).availableQuantity !== ''
    ? (property as any).availableQuantity
    : ((propQty !== undefined && propQty !== null && propQty !== '' && propQty !== '0' && propQty !== 0) ? propQty : null);

  if (rawAvail !== null && rawAvail !== undefined && rawAvail !== '') {
    const q = Number(rawAvail);
    if (!isNaN(q) && q > 0) {
      availableQuantity = q;
    }
  }

  const hasAvailableQuantity = availableQuantity !== null && availableQuantity > 0;
  const availableQuantityFormatted = hasAvailableQuantity
    ? `Available: ${formatQuantityWithUnit(availableQuantity!, cleanUnit || 'piece')}`
    : null;

  // 3. Wholesale Tiers & MOQ
  const tiers = getWholesaleTiers(property);
  const hasWholesaleTiers = tiers.length > 0;

  let moq: number | null = null;
  if (property.minimumOrderQuantity !== undefined && property.minimumOrderQuantity !== null && (property.minimumOrderQuantity as any) !== '') {
    const m = Number(property.minimumOrderQuantity);
    if (!isNaN(m) && m > 0) {
      moq = m;
    }
  } else if (hasWholesaleTiers && tiers[0].minimumQuantity > 0) {
    moq = tiers[0].minimumQuantity;
  }

  const hasMoq = hasWholesaleTiers && moq !== null && moq > 0;
  const moqFormatted = hasMoq
    ? `MOQ: ${formatQuantityWithUnit(moq!, cleanUnit || 'piece')}`
    : null;

  const wholesaleTiersFormatted: CustomerTierDisplay[] = tiers.map(tier => {
    const tierUnit = unitForPriceSlash || 'piece';
    const label = `${tier.minimumQuantity}+ — ${currency} ${tier.pricePerUnit.toLocaleString()} / ${tierUnit}`;
    return {
      minQuantity: tier.minimumQuantity,
      maxQuantity: (tier as any).maxQuantity,
      pricePerUnit: tier.pricePerUnit,
      label
    };
  });

  return {
    currency,
    unit: cleanUnit,
    hasRetailPrice,
    retailPrice,
    retailPriceFormatted,
    hasAvailableQuantity,
    availableQuantity,
    availableQuantityFormatted,
    hasMoq,
    moq,
    moqFormatted,
    hasWholesaleTiers,
    wholesaleTiers: wholesaleTiersFormatted
  };
}
