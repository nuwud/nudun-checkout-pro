/**
 * Upsell Detection Utility
 * 
 * Detects upgrade opportunities for subscription products.
 * Identifies quarterly subscriptions that can be upgraded to annual plans.
 * 
 * Related: T022 - Detect quarterly → annual upgrade opportunities
 * User Story: US7 - Strategic Upsells
 * Requirement: FR-034 - Smart upsell detection
 */

/**
 * @typedef {Object} SubscriptionProduct
 * @property {string} id - Product variant ID
 * @property {string} title - Product title
 * @property {string|null} image - Product image URL
 * @property {Object} sellingPlan - Selling plan details
 * @property {number} price - Price in cents
 * @property {number} quantity - Quantity in cart
 */

/**
 * @typedef {Object} UpsellOpportunity
 * @property {SubscriptionProduct} currentProduct - Current subscription product
 * @property {Object} upgradePlan - Recommended upgrade selling plan
 * @property {number} savingsAmount - Savings in cents per year
 * @property {number} savingsPercentage - Savings as percentage (e.g., 15 = 15%)
 * @property {string} upgradeFrequency - Upgrade frequency ('annual', 'biannual')
 * @property {number} upgradePrice - Price of upgrade in cents
 */

/**
 * Detect if a subscription product can be upgraded
 * 
 * Simplified detection that works without external plan data.
 * Assumes annual/biannual plans exist for products with monthly/quarterly plans.
 * 
 * Checks if product has:
 * - Current frequency: quarterly, monthly, bimonthly
 * - Eligible for upgrade to annual
 * 
 * @param {Object} lineItem - Cart line item
 * @returns {UpsellOpportunity|null} Upsell opportunity or null
 * 
 * @example
 * const upsell = detectUpsellOpportunity(lineItem);
 * if (upsell) {
 *   console.log(`Save ${upsell.savingsPercentage}% by upgrading!`);
 * }
 */
export function detectUpsellOpportunity(lineItem) {
  console.log('[detectUpsellOpportunity] Checking line item:', lineItem?.title || 'Unknown');
  
  // Must have a selling plan (subscription)
  if (!lineItem?.sellingPlan) {
    console.log('[detectUpsellOpportunity] No selling plan found');
    return null;
  }
  
  const currentPlan = lineItem.sellingPlan;
  const currentFrequency = extractFrequency(currentPlan);
  console.log('[detectUpsellOpportunity] Current frequency:', currentFrequency);
  
  // Only upsell certain frequencies
  const upsellableFrequencies = ['monthly', 'bimonthly', 'quarterly'];
  if (!upsellableFrequencies.includes(currentFrequency)) {
    console.log('[detectUpsellOpportunity] Not upsellable frequency:', currentFrequency);
    return null;
  }
  
  // Assume annual upgrade exists (standard for subscription products)
  // Calculate estimated savings based on typical subscription discounts
  const currentPrice = getCurrentPrice(lineItem);
  console.log('[detectUpsellOpportunity] Current price (cents):', currentPrice);
  
  if (currentPrice <= 0) {
    console.log('[detectUpsellOpportunity] Invalid price, cannot calculate savings');
    return null; // Can't calculate without valid price
  }
  
  // Estimate upgrade pricing and savings
  const upgradeEstimate = estimateUpgrade(lineItem, currentFrequency);
  console.log('[detectUpsellOpportunity] Upgrade estimate:', upgradeEstimate);
  
  if (upgradeEstimate.savingsAmount <= 0) {
    console.log('[detectUpsellOpportunity] No savings, not showing upsell');
    return null; // No savings, don't upsell
  }
  
  return {
    currentProduct: {
      id: lineItem.id || lineItem.merchandise?.id,
      title: lineItem.title || lineItem.merchandise?.title,
      image: lineItem.merchandise?.image?.url || lineItem.image?.url || null,
      sellingPlan: currentPlan,
      price: currentPrice,
      quantity: lineItem.quantity || 1
    },
    upgradePlan: {
      name: 'Annual Subscription',
      frequency: 'annual'
    },
    savingsAmount: upgradeEstimate.savingsAmount,
    savingsPercentage: upgradeEstimate.savingsPercentage,
    upgradeFrequency: 'annual',
    upgradePrice: upgradeEstimate.upgradePrice
  };
}

/**
 * Estimate upgrade pricing and savings
 * 
 * Uses industry-standard subscription discount rates:
 * - Monthly → Annual: 15-20% savings
 * - Quarterly → Annual: 10-15% savings
 * 
 * @param {Object} lineItem - Cart line item
 * @param {string} currentFrequency - Current subscription frequency
 * @returns {{upgradePrice: number, savingsAmount: number, savingsPercentage: number}}
 */
function estimateUpgrade(lineItem, currentFrequency) {
  const currentPrice = getCurrentPrice(lineItem);
  const quantity = lineItem.quantity || 1;
  
  // Typical discount rates for longer commitments
  const discountRates = {
    monthly: 0.18,    // 18% savings on annual vs monthly
    bimonthly: 0.15,  // 15% savings on annual vs bimonthly
    quarterly: 0.12   // 12% savings on annual vs quarterly
  };
  
  const discountRate = discountRates[currentFrequency] || 0.12;
  
  // Calculate deliveries per year
  const currentDeliveries = getDeliveriesPerYear(currentFrequency);
  
  // Current yearly cost
  const currentYearlyCost = currentPrice * currentDeliveries * quantity;
  
  // Estimated annual price with discount
  const estimatedAnnualPrice = Math.round(currentYearlyCost * (1 - discountRate));
  const upgradePrice = Math.round(estimatedAnnualPrice / quantity); // Per-unit price
  
  // Calculate savings
  const savingsAmount = currentYearlyCost - estimatedAnnualPrice;
  const savingsPercentage = Math.round((savingsAmount / currentYearlyCost) * 100);
  
  return {
    upgradePrice,
    savingsAmount,
    savingsPercentage
  };
}

/**
 * Extract frequency from selling plan
 * Looks at interval and interval count to determine frequency
 * 
 * @param {Object} sellingPlan - Selling plan object
 * @returns {string} Frequency ('monthly', 'quarterly', 'biannual', 'annual', 'unknown')
 */
function extractFrequency(sellingPlan) {
  if (!sellingPlan) return 'unknown';
  
  // Check delivery policy
  const interval = sellingPlan.deliveryPolicy?.interval;
  const intervalCount = sellingPlan.deliveryPolicy?.intervalCount || 1;
  
  if (!interval) {
    // Fallback: Check name/title
    const name = (sellingPlan.name || '').toLowerCase();
    if (name.includes('annual') || name.includes('yearly')) return 'annual';
    if (name.includes('biannual') || name.includes('semi')) return 'biannual';
    if (name.includes('quarter')) return 'quarterly';
    if (name.includes('bimonth') || name.includes('bi-month')) return 'bimonthly';
    if (name.includes('month')) return 'monthly';
    return 'unknown';
  }
  
  // Calculate based on interval
  switch (interval.toLowerCase()) {
    case 'month':
      if (intervalCount === 1) return 'monthly';
      if (intervalCount === 2) return 'bimonthly';
      if (intervalCount === 3) return 'quarterly';
      if (intervalCount === 6) return 'biannual';
      if (intervalCount === 12) return 'annual';
      return 'unknown';
    
    case 'year':
      return intervalCount === 1 ? 'annual' : 'unknown';
    
    case 'week':
      if (intervalCount === 4 || intervalCount === 5) return 'monthly';
      return 'unknown';
    
    default:
      return 'unknown';
  }
}

/**
 * Find the best upgrade plan for current frequency
 * Priority: annual > biannual > quarterly > bimonthly > monthly
 * 
 * NOTE: Currently unused - kept for future implementation when we have access to all plans
 * 
 * @param {string} currentFrequency - Current subscription frequency
 * @param {Array} availablePlans - All available selling plans
 * @returns {Object|null} Best upgrade plan or null
 */
/* eslint-disable no-unused-vars */
function findUpgradePlan(currentFrequency, availablePlans) {
  if (!availablePlans || availablePlans.length === 0) {
    return null;
  }
  
  // Define upgrade hierarchy
  const hierarchy = ['monthly', 'bimonthly', 'quarterly', 'biannual', 'annual'];
  const currentIndex = hierarchy.indexOf(currentFrequency);
  
  if (currentIndex === -1 || currentIndex === hierarchy.length - 1) {
    return null; // Already at highest tier or unknown
  }
  
  // Find plans with higher frequency
  const betterPlans = availablePlans
    .map(plan => ({
      plan,
      frequency: extractFrequency(plan),
      index: hierarchy.indexOf(extractFrequency(plan))
    }))
    .filter(p => p.index > currentIndex && p.index !== -1)
    .sort((a, b) => b.index - a.index); // Highest tier first
  
  return betterPlans[0]?.plan || null;
}

/**
 * Calculate annual savings when upgrading plans
 * 
 * NOTE: Currently unused - kept for future implementation when we have actual upgrade plans
 * 
 * Compares total yearly cost of current plan vs upgrade plan.
 * Accounts for quantity in cart.
 * 
 * @param {Object} lineItem - Current cart line item
 * @param {Object} currentPlan - Current selling plan
 * @param {Object} upgradePlan - Upgrade selling plan
 * @returns {{amount: number, percentage: number}} Savings amount (cents) and percentage
 */
function calculateAnnualSavings(lineItem, currentPlan, upgradePlan) {
  const currentPrice = getCurrentPrice(lineItem);
  const upgradePrice = getUpgradePrice(lineItem, upgradePlan);
  
  const currentFrequency = extractFrequency(currentPlan);
  const upgradeFrequency = extractFrequency(upgradePlan);
  
  // Calculate deliveries per year
  const currentDeliveriesPerYear = getDeliveriesPerYear(currentFrequency);
  const upgradeDeliveriesPerYear = getDeliveriesPerYear(upgradeFrequency);
  
  if (currentDeliveriesPerYear === 0 || upgradeDeliveriesPerYear === 0) {
    return { amount: 0, percentage: 0 };
  }
  
  // Total yearly cost for each plan
  const currentYearlyCost = currentPrice * currentDeliveriesPerYear * lineItem.quantity;
  const upgradeYearlyCost = upgradePrice * upgradeDeliveriesPerYear * lineItem.quantity;
  
  const savingsAmount = currentYearlyCost - upgradeYearlyCost;
  const savingsPercentage = currentYearlyCost > 0
    ? Math.round((savingsAmount / currentYearlyCost) * 100)
    : 0;
  
  return {
    amount: savingsAmount,
    percentage: savingsPercentage
  };
}

/**
 * Get number of deliveries per year for frequency
 * @param {string} frequency - Frequency string
 * @returns {number} Deliveries per year
 */
function getDeliveriesPerYear(frequency) {
  switch (frequency) {
    case 'monthly': return 12;
    case 'bimonthly': return 6;
    case 'quarterly': return 4;
    case 'biannual': return 2;
    case 'annual': return 1;
    default: return 0;
  }
}

/**
 * Get current price from line item
 * @param {Object} lineItem - Cart line item
 * @returns {number} Price in cents
 */
function getCurrentPrice(lineItem) {
  // Try cost.totalAmount first (includes discounts)
  if (lineItem.cost?.totalAmount?.amount) {
    return Math.round(parseFloat(lineItem.cost.totalAmount.amount) * 100);
  }
  
  // Fallback to line item price
  if (lineItem.price?.amount) {
    return Math.round(parseFloat(lineItem.price.amount) * 100);
  }
  
  return 0;
}

/**
 * Get upgrade price for new plan
 * Estimate based on current plan pricing adjustments
 * 
 * @param {Object} lineItem - Current line item
 * @param {Object} upgradePlan - Upgrade selling plan
 * @returns {number} Estimated upgrade price in cents
 */
function getUpgradePrice(lineItem, upgradePlan) {
  // Try to get price from plan pricing policies
  const priceAdjustment = upgradePlan.priceAdjustments?.[0];
  
  if (priceAdjustment) {
    const basePrice = getCurrentPrice(lineItem);
    
    if (priceAdjustment.adjustmentType === 'PERCENTAGE') {
      const adjustment = priceAdjustment.adjustmentValue || 0;
      return Math.round(basePrice * (1 - adjustment / 100));
    }
    
    if (priceAdjustment.adjustmentType === 'FIXED_AMOUNT') {
      const adjustment = priceAdjustment.adjustmentValue || 0;
      return Math.max(0, basePrice - Math.round(adjustment * 100));
    }
    
    if (priceAdjustment.adjustmentType === 'PRICE') {
      const fixedPrice = priceAdjustment.adjustmentValue || 0;
      return Math.round(fixedPrice * 100);
    }
  }
  
  // Fallback: Estimate based on frequency
  // Annual plans typically cost ~10-15% less per unit than quarterly
  const currentPrice = getCurrentPrice(lineItem);
  const currentFreq = extractFrequency(lineItem.sellingPlan);
  const upgradeFreq = extractFrequency(upgradePlan);
  
  const currentPerYear = getDeliveriesPerYear(currentFreq);
  const upgradePerYear = getDeliveriesPerYear(upgradeFreq);
  
  if (currentPerYear > 0 && upgradePerYear > 0) {
    // Scale price proportionally with ~10% discount for longer commitment
    const discount = 0.90; // 10% savings
    return Math.round((currentPrice * currentPerYear / upgradePerYear) * discount);
  }
  
  return currentPrice;
}

/**
 * Detect all upsell opportunities in cart
 * 
 * Simplified to work without external product data.
 * Checks each line item for upgrade potential based on current plan.
 * 
 * @param {Array} lines - All cart line items
 * @returns {Array<UpsellOpportunity>} Array of upsell opportunities
 * 
 * @example
 * const upsells = detectAllUpsells(shopify.lines.value);
 * console.log(`Found ${upsells.length} upsell opportunities`);
 */
export function detectAllUpsells(lines) {
  if (!lines || lines.length === 0) {
    return [];
  }
  
  return lines
    .map(line => detectUpsellOpportunity(line))
    .filter(upsell => upsell !== null);
}

/**
 * Format savings for display
 * @param {number} amount - Savings amount in cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted savings (e.g., "$45.00")
 */
export function formatSavings(amount, currency = 'USD') {
  const value = (amount / 100).toFixed(2);
  const symbols = { USD: '$', CAD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  return `${symbol}${value}`;
}
