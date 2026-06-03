/**
 * Unit Conversion System
 * 
 * Strategy: Base-Unit Normalization
 * - Weight: stored in grams (g). 1 kg = 1000 g
 * - Volume: stored in milliliters (mL). 1 L = 1000 mL
 * - Count: stored as units. 1 unit = 1 unit
 * 
 * Prices are stored as INR per base unit (per gram, per mL, or per unit).
 * When a user orders in a different unit (e.g., kg instead of g),
 * we convert to base units for storage and calculate price accordingly.
 */

export type Dimension = 'weight' | 'volume' | 'count';
export type BaseUnit = 'g' | 'mL' | 'unit';
export type DisplayUnit = 'g' | 'kg' | 'mL' | 'L' | 'unit';

// Maps each display unit to its base unit
export const UNIT_TO_BASE: Record<DisplayUnit, BaseUnit> = {
  g: 'g',
  kg: 'g',
  mL: 'mL',
  L: 'mL',
  unit: 'unit',
};

// Conversion factor: how many base units per 1 display unit
export const CONVERSION_FACTORS: Record<DisplayUnit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
};

// Available display units per dimension
export const DIMENSION_UNITS: Record<Dimension, DisplayUnit[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['unit'],
};

// Human-readable unit labels
export const UNIT_LABELS: Record<DisplayUnit, string> = {
  g: 'Grams (g)',
  kg: 'Kilograms (kg)',
  mL: 'Milliliters (mL)',
  L: 'Liters (L)',
  unit: 'Units',
};

// Short labels
export const UNIT_SHORT: Record<DisplayUnit, string> = {
  g: 'g',
  kg: 'kg',
  mL: 'mL',
  L: 'L',
  unit: 'pcs',
};

/**
 * Convert a quantity from any display unit to its base unit.
 * Example: toBaseUnit(2, 'kg') → 2000 (grams)
 */
export function toBaseUnit(quantity: number, fromUnit: DisplayUnit): number {
  return quantity * CONVERSION_FACTORS[fromUnit];
}

/**
 * Convert a quantity from base unit to a display unit.
 * Example: fromBaseUnit(2000, 'kg') → 2 (kg)
 */
export function fromBaseUnit(quantity: number, toUnit: DisplayUnit): number {
  return quantity / CONVERSION_FACTORS[toUnit];
}

/**
 * Calculate price for a given quantity and unit.
 * basePricePerBaseUnit is the price per 1 base unit (per gram, mL, or unit).
 * 
 * Example: calculatePrice(2, 'kg', 0.05) 
 *   → 2 kg = 2000g × ₹0.05/g = ₹100.00
 */
export function calculatePrice(
  quantity: number,
  unit: DisplayUnit,
  basePricePerBaseUnit: number
): number {
  const baseQuantity = toBaseUnit(quantity, unit);
  return baseQuantity * basePricePerBaseUnit;
}

/**
 * Get the price per display unit from the base price.
 * Example: getPricePerUnit('kg', 0.05) → 50 (₹50/kg when base is ₹0.05/g)
 */
export function getPricePerUnit(unit: DisplayUnit, basePricePerBaseUnit: number): number {
  return basePricePerBaseUnit * CONVERSION_FACTORS[unit];
}

/**
 * Format a quantity for display with appropriate precision.
 * Removes unnecessary trailing zeros.
 */
export function formatQuantity(quantity: number, unit: DisplayUnit): string {
  const formatted = unit === 'unit' 
    ? Math.round(quantity).toString()
    : quantity.toFixed(quantity < 1 ? 4 : 2).replace(/\.?0+$/, '');
  return `${formatted} ${UNIT_SHORT[unit]}`;
}

/**
 * Get compatible units for a given base unit
 */
export function getCompatibleUnits(baseUnit: BaseUnit): DisplayUnit[] {
  switch (baseUnit) {
    case 'g': return ['g', 'kg'];
    case 'mL': return ['mL', 'L'];
    case 'unit': return ['unit'];
  }
}

/**
 * Auto-select the best display unit for a quantity stored in base units
 * e.g., 5000g → displays as 5kg, 500g → stays as 500g
 */
export function autoDisplayUnit(baseQuantity: number, baseUnit: BaseUnit): { quantity: number; unit: DisplayUnit } {
  if (baseUnit === 'g' && baseQuantity >= 1000) {
    return { quantity: baseQuantity / 1000, unit: 'kg' };
  }
  if (baseUnit === 'mL' && baseQuantity >= 1000) {
    return { quantity: baseQuantity / 1000, unit: 'L' };
  }
  return { quantity: baseQuantity, unit: baseUnit };
}
