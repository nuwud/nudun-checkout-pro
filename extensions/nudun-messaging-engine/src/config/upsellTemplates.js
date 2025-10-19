/**
 * Upsell Message Templates
 * 
 * Customizable templates for subscription upgrade suggestions.
 * Supports variable interpolation and multiple template styles.
 * 
 * Related: T023 - UpsellBanner customization
 * User Story: US7 - Strategic Upsells
 */

/**
 * Template Variables:
 * {productName} - Product title
 * {currentFrequency} - Current subscription frequency (e.g., "Quarterly")
 * {upgradeFrequency} - Upgrade frequency (e.g., "Annual")
 * {savingsAmount} - Savings amount with currency (e.g., "$45.00")
 * {savingsPercentage} - Savings percentage (e.g., "15")
 * {currentPrice} - Current subscription price
 * {upgradePrice} - Upgrade subscription price
 */

/**
 * Default Upsell Templates
 * Standard marketing language with clear value proposition
 */
export const DEFAULT_UPSELL_TEMPLATES = {
  // Main heading
  heading: '💡 Save More with {upgradeFrequency} Subscription',
  
  // Primary message
  message: 'Upgrade your {currentFrequency} subscription to {upgradeFrequency} and save {savingsAmount}/year ({savingsPercentage}% savings)',
  
  // Secondary context message
  context: 'You\'re currently subscribed to: {productName}',
  
  // Button text (future use)
  buttonText: 'Upgrade & Save {savingsPercentage}%',
  
  // Compact variant
  compact: '💡 Upgrade to {upgradeFrequency} and save {savingsAmount}/year'
};

/**
 * Legal/Conservative Templates
 * Compliant messaging for regulated industries
 */
export const LEGAL_UPSELL_TEMPLATES = {
  heading: 'Annual Subscription Available',
  
  message: 'Switch from {currentFrequency} to {upgradeFrequency} delivery and reduce annual cost by {savingsAmount} ({savingsPercentage}%)',
  
  context: 'Current subscription: {productName}',
  
  buttonText: 'Switch to {upgradeFrequency}',
  
  compact: 'Annual delivery available - reduce cost by {savingsAmount}/year'
};

/**
 * Minimal Templates
 * Brief, straightforward messaging
 */
export const MINIMAL_UPSELL_TEMPLATES = {
  heading: 'Switch to {upgradeFrequency}',
  
  message: 'Save {savingsAmount}/year with {upgradeFrequency} delivery',
  
  context: '{productName}',
  
  buttonText: 'Switch Now',
  
  compact: '{upgradeFrequency}: Save {savingsAmount}/year'
};

/**
 * Enthusiastic Templates
 * High-energy marketing language
 */
export const ENTHUSIASTIC_UPSELL_TEMPLATES = {
  heading: '🎉 Huge Savings with {upgradeFrequency} Plan!',
  
  message: 'Level up to {upgradeFrequency} and pocket {savingsAmount} every year! That\'s {savingsPercentage}% more savings on {productName}',
  
  context: 'Currently on {currentFrequency} - upgrade now!',
  
  buttonText: 'Yes! Upgrade & Save {savingsPercentage}%',
  
  compact: '🎉 {upgradeFrequency} = {savingsAmount}/year savings!'
};

/**
 * Get templates by style name
 * 
 * @param {string} style - Template style ('default', 'legal', 'minimal', 'enthusiastic', 'custom')
 * @returns {Object} Template object
 */
export function getUpsellTemplatesByStyle(style = 'default') {
  switch (style) {
    case 'legal':
      return LEGAL_UPSELL_TEMPLATES;
    case 'minimal':
      return MINIMAL_UPSELL_TEMPLATES;
    case 'enthusiastic':
      return ENTHUSIASTIC_UPSELL_TEMPLATES;
    case 'default':
    default:
      return DEFAULT_UPSELL_TEMPLATES;
  }
}

/**
 * Interpolate template variables
 * 
 * @param {string} template - Template string with {variables}
 * @param {Object} data - Data object with values
 * @returns {string} Interpolated string
 */
export function interpolateUpsellTemplate(template, data) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

/**
 * Build complete upsell message
 * 
 * @param {Object} upsell - Upsell opportunity object
 * @param {string} currency - Currency code
 * @param {string} style - Template style
 * @param {Object} customTemplates - Optional custom template overrides
 * @returns {Object} Message object with heading, message, context
 */
export function buildUpsellMessage(upsell, currency, style = 'default', customTemplates = null) {
  // Get base templates
  const templates = customTemplates || getUpsellTemplatesByStyle(style);
  
  // Prepare interpolation data
  const data = {
    productName: upsell.currentProduct.title,
    currentFrequency: formatFrequency(extractFrequencyFromProduct(upsell.currentProduct)),
    upgradeFrequency: formatFrequency(upsell.upgradeFrequency),
    savingsAmount: formatSavings(upsell.savingsAmount, currency),
    savingsPercentage: upsell.savingsPercentage,
    currentPrice: formatSavings(upsell.currentProduct.price, currency),
    upgradePrice: formatSavings(upsell.upgradePrice, currency)
  };
  
  return {
    heading: interpolateUpsellTemplate(templates.heading, data),
    message: interpolateUpsellTemplate(templates.message, data),
    context: interpolateUpsellTemplate(templates.context, data),
    buttonText: interpolateUpsellTemplate(templates.buttonText, data),
    compact: interpolateUpsellTemplate(templates.compact, data)
  };
}

/**
 * Helper: Extract frequency from product
 */
function extractFrequencyFromProduct(product) {
  const plan = product.sellingPlan;
  if (!plan) return 'unknown';
  
  const interval = plan.deliveryPolicy?.interval;
  const intervalCount = plan.deliveryPolicy?.intervalCount || 1;
  
  if (interval === 'MONTH' || interval === 'month') {
    if (intervalCount === 1) return 'monthly';
    if (intervalCount === 2) return 'bimonthly';
    if (intervalCount === 3) return 'quarterly';
    if (intervalCount === 6) return 'biannual';
    if (intervalCount === 12) return 'annual';
  }
  
  if (interval === 'YEAR' || interval === 'year') {
    return 'annual';
  }
  
  const name = (plan.name || '').toLowerCase();
  if (name.includes('annual')) return 'annual';
  if (name.includes('quarter')) return 'quarterly';
  if (name.includes('month')) return 'monthly';
  
  return 'unknown';
}

/**
 * Helper: Format frequency for display
 */
function formatFrequency(freq) {
  const formats = {
    monthly: 'Monthly',
    bimonthly: 'Bi-Monthly',
    quarterly: 'Quarterly',
    biannual: 'Bi-Annual',
    annual: 'Annual',
    unknown: 'Subscription'
  };
  return formats[freq] || freq;
}

/**
 * Helper: Format savings with currency
 */
function formatSavings(amountInCents, currency) {
  const amount = (amountInCents / 100).toFixed(2);
  const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount}`;
}
