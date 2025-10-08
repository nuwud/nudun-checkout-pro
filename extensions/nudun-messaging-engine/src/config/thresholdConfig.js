/**
 * Threshold Configuration
 * 
 * Defines cart value thresholds for dynamic messaging.
 * Supports multiple currencies and configurable messaging rules.
 * 
 * Related: T014 - Create threshold configuration
 * User Story: US6 - Real-Time Dynamic Messaging
 * Requirement: FR-024 - Configurable value thresholds
 */

/**
 * @typedef {Object} ThresholdConfig
 * @property {number} value - Threshold value in cents (e.g., 5000 = $50.00)
 * @property {string} message - Message template to display
 * @property {string} tone - Banner tone ('info', 'success', 'warning', 'critical')
 * @property {number} priority - Display priority (1 = highest)
 * @property {boolean} [hideWhenMet] - Hide message after threshold met (default: false)
 */

/**
 * @typedef {Object} CurrencyThresholds
 * @property {string} currency - Currency code (USD, CAD, EUR, GBP)
 * @property {ThresholdConfig[]} thresholds - Array of threshold configurations
 */

/**
 * Default threshold configurations by currency
 * 
 * Note: Values are in cents (e.g., 5000 = $50.00)
 */
export const THRESHOLD_CONFIG = {
  USD: [
    {
      value: 5000, // $50.00
      message: 'Add ${remaining} more for free shipping!',
      tone: 'info',
      priority: 2,
      hideWhenMet: false,
      metMessage: '🎉 You qualify for free shipping!'
    },
    {
      value: 10000, // $100.00
      message: 'Spend ${remaining} more to unlock a free gift!',
      tone: 'info',
      priority: 3,
      hideWhenMet: false,
      metMessage: '🎁 Free gift unlocked!'
    },
    {
      value: 20000, // $200.00
      message: 'You\'re ${remaining} away from VIP benefits!',
      tone: 'info',
      priority: 4,
      hideWhenMet: false,
      metMessage: '⭐ VIP status achieved!'
    }
  ],
  CAD: [
    {
      value: 7000, // $70.00 CAD
      message: 'Add ${remaining} more for free shipping!',
      tone: 'info',
      priority: 2,
      hideWhenMet: false,
      metMessage: '🎉 You qualify for free shipping!'
    },
    {
      value: 13000, // $130.00 CAD
      message: 'Spend ${remaining} more to unlock a free gift!',
      tone: 'info',
      priority: 3,
      hideWhenMet: false,
      metMessage: '🎁 Free gift unlocked!'
    }
  ],
  EUR: [
    {
      value: 4500, // €45.00
      message: 'Add ${remaining} more for free shipping!',
      tone: 'info',
      priority: 2,
      hideWhenMet: false,
      metMessage: '🎉 You qualify for free shipping!'
    },
    {
      value: 9000, // €90.00
      message: 'Spend ${remaining} more to unlock a free gift!',
      tone: 'info',
      priority: 3,
      hideWhenMet: false,
      metMessage: '🎁 Free gift unlocked!'
    }
  ],
  GBP: [
    {
      value: 4000, // £40.00
      message: 'Add ${remaining} more for free shipping!',
      tone: 'info',
      priority: 2,
      hideWhenMet: false,
      metMessage: '🎉 You qualify for free shipping!'
    },
    {
      value: 8000, // £80.00
      message: 'Spend ${remaining} more to unlock a free gift!',
      tone: 'info',
      priority: 3,
      hideWhenMet: false,
      metMessage: '🎁 Free gift unlocked!'
    }
  ]
};

/**
 * Get thresholds for currency
 * 
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {ThresholdConfig[]} Array of thresholds or default USD
 * 
 * @example
 * const thresholds = getThresholdsForCurrency('USD');
 * // Returns USD threshold configurations
 */
export function getThresholdsForCurrency(currencyCode) {
  const currency = currencyCode?.toUpperCase() || 'USD';
  return THRESHOLD_CONFIG[currency] || THRESHOLD_CONFIG.USD;
}

/**
 * Get next threshold above current cart value
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {ThresholdConfig|null} Next threshold or null if all met
 * 
 * @example
 * const nextThreshold = getNextThreshold(3500, 'USD'); // $35.00
 * // Returns: { value: 5000, message: 'Add $15.00 more...', ... }
 */
export function getNextThreshold(cartValue, currencyCode) {
  const thresholds = getThresholdsForCurrency(currencyCode);
  
  // Sort by value ascending
  const sorted = [...thresholds].sort((a, b) => a.value - b.value);
  
  // Find first threshold above cart value
  return sorted.find(threshold => threshold.value > cartValue) || null;
}

/**
 * Get all met thresholds
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {ThresholdConfig[]} Array of met thresholds
 * 
 * @example
 * const met = getMetThresholds(12000, 'USD'); // $120.00
 * // Returns thresholds for $50 and $100
 */
export function getMetThresholds(cartValue, currencyCode) {
  const thresholds = getThresholdsForCurrency(currencyCode);
  
  return thresholds.filter(threshold => threshold.value <= cartValue);
}

/**
 * Calculate remaining amount to reach threshold
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {number} thresholdValue - Threshold value in cents
 * @returns {number} Remaining amount in cents
 * 
 * @example
 * const remaining = calculateRemaining(3500, 5000);
 * // Returns: 1500 (need $15.00 more)
 */
export function calculateRemaining(cartValue, thresholdValue) {
  const remaining = thresholdValue - cartValue;
  return Math.max(0, remaining);
}

/**
 * Calculate progress percentage towards threshold
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {number} thresholdValue - Threshold value in cents
 * @returns {number} Progress percentage (0-100)
 * 
 * @example
 * const progress = calculateProgress(3500, 5000);
 * // Returns: 70 (70% towards threshold)
 */
export function calculateProgress(cartValue, thresholdValue) {
  if (thresholdValue <= 0) return 100;
  
  const progress = (cartValue / thresholdValue) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Format currency amount for display
 * 
 * @param {number} amountInCents - Amount in cents
 * @param {string} currencyCode - Currency code
 * @returns {string} Formatted amount (e.g., "$15.00")
 * 
 * @example
 * formatAmount(1500, 'USD');  // "$15.00"
 * formatAmount(2000, 'EUR');  // "€20.00"
 */
export function formatAmount(amountInCents, currencyCode) {
  const amount = amountInCents / 100;
  
  // Currency symbols
  const symbols = {
    USD: '$',
    CAD: 'CA$',
    EUR: '€',
    GBP: '£'
  };
  
  const symbol = symbols[currencyCode] || currencyCode;
  
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Interpolate message template with values
 * 
 * @param {string} template - Message template with ${remaining} placeholder
 * @param {number} remainingInCents - Remaining amount in cents
 * @param {string} currencyCode - Currency code
 * @returns {string} Interpolated message
 * 
 * @example
 * interpolateMessage('Add ${remaining} more!', 1500, 'USD');
 * // Returns: "Add $15.00 more!"
 */
export function interpolateMessage(template, remainingInCents, currencyCode) {
  const formattedAmount = formatAmount(remainingInCents, currencyCode);
  return template.replace(/\$\{remaining\}/g, formattedAmount);
}

/**
 * Get all active thresholds for display
 * 
 * Determines which thresholds should be shown based on cart value.
 * By default, shows next unmet threshold and all met thresholds (unless hideWhenMet).
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @param {number} maxVisible - Maximum thresholds to show (default: 2)
 * @returns {Array<{threshold: ThresholdConfig, remaining: number, met: boolean}>} Active thresholds
 * 
 * @example
 * const active = getActiveThresholds(3500, 'USD', 2);
 * // Returns next threshold ($50 shipping) with remaining $15.00
 */
export function getActiveThresholds(cartValue, currencyCode, maxVisible = 2) {
  const active = [];
  
  // Add next unmet threshold
  const next = getNextThreshold(cartValue, currencyCode);
  if (next) {
    active.push({
      threshold: next,
      remaining: calculateRemaining(cartValue, next.value),
      met: false,
      progress: calculateProgress(cartValue, next.value)
    });
  }
  
  // Add met thresholds (unless hideWhenMet)
  const met = getMetThresholds(cartValue, currencyCode);
  for (const threshold of met) {
    if (!threshold.hideWhenMet) {
      active.push({
        threshold,
        remaining: 0,
        met: true,
        progress: 100
      });
    }
  }
  
  // Sort by priority (lower number = higher priority)
  active.sort((a, b) => a.threshold.priority - b.threshold.priority);
  
  // Limit to maxVisible
  return active.slice(0, maxVisible);
}
