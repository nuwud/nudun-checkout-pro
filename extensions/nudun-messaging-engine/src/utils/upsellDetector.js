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
 * Checks if product has:
 * - Current frequency: quarterly, monthly, bimonthly
 * - Available upgrade: annual or biannual
 * 
 * @param {Object} lineItem - Cart line item
 * @param {Array} availablePlans - All available selling plans for this product
 * @returns {UpsellOpportunity|null} Upsell opportunity or null
 * 
 * @example
 * const upsell = detectUpsellOpportunity(lineItem, plans);
 * if (upsell) {
 *   console.log(`Save ${upsell.savingsPercentage}% by upgrading!`);
 * }
 */
export function detectUpsellOpportunity(lineItem, availablePlans = []) {
  // Must have a selling plan (subscription)
  if (!lineItem?.sellingPlan) {
    return null;
  }
  
  const currentPlan = lineItem.sellingPlan;
  const currentFrequency = extractFrequency(currentPlan);
  
  // Only upsell certain frequencies
  const upsellableFrequencies = ['monthly', 'bimonthly', 'quarterly'];
  if (!upsellableFrequencies.includes(currentFrequency)) {
    return null;
  }
  
  // Find better plan (longer frequency = better value)
  const upgradePlan = findUpgradePlan(currentFrequency, availablePlans);
  if (!upgradePlan) {
    return null;
  }
  
  // Calculate savings
  const savings = calculateAnnualSavings(
    lineItem,
    currentPlan,
    upgradePlan
  );
  
  if (savings.amount <= 0) {
    return null; // No savings, don't upsell
  }
  
  return {
    currentProduct: {
      id: lineItem.id,
      title: lineItem.title,
      sellingPlan: currentPlan,
      price: getCurrentPrice(lineItem),
      quantity: lineItem.quantity
    },
    upgradePlan: upgradePlan,
    savingsAmount: savings.amount,
    savingsPercentage: savings.percentage,
    upgradeFrequency: extractFrequency(upgradePlan),
    upgradePrice: getUpgradePrice(lineItem, upgradePlan)
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
 * @param {string} currentFrequency - Current subscription frequency
 * @param {Array} availablePlans - All available selling plans
 * @returns {Object|null} Best upgrade plan or null
 */
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
 * @param {Array} lines - All cart line items
 * @param {Object} productData - Product data with selling plans (optional)
 * @returns {Array<UpsellOpportunity>} Array of upsell opportunities
 * 
 * @example
 * const upsells = detectAllUpsells(shopify.lines.value);
 * console.log(`Found ${upsells.length} upsell opportunities`);
 */
export function detectAllUpsells(lines, productData = {}) {
  if (!lines || lines.length === 0) {
    return [];
  }
  
  return lines
    .map(line => {
      const availablePlans = productData[line.id]?.sellingPlans || [];
      return detectUpsellOpportunity(line, availablePlans);
    })
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
