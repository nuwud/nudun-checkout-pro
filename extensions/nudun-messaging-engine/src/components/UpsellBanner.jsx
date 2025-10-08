/* eslint-disable react/prop-types */
/**
 * UpsellBanner Component
 * 
 * Displays smart upsell suggestions for subscription upgrades.
 * Shows savings when upgrading from quarterly to annual plans.
 * 
 * Related: T023 - Build UpsellBanner component
 * User Story: US7 - Strategic Upsells
 * Requirements: FR-035, FR-036
 */

import '@shopify/ui-extensions/preact';
import { useComputed } from '@preact/signals';
import { detectAllUpsells, formatSavings } from '../utils/upsellDetector.js';

/**
 * UpsellBanner Component
 * 
 * Displays upgrade suggestion with savings calculation.
 * Only shows when there's a clear upsell opportunity.
 * 
 * @param {Object} props
 * @param {Object} props.shopify - Shopify global API
 * @param {boolean} [props.allowDismiss=true] - Allow dismissal
 * @returns {JSX.Element|null} Upsell banner or null
 * 
 * @example
 * <UpsellBanner shopify={shopify} allowDismiss={true} />
 */
export default function UpsellBanner({ shopify, allowDismiss = true }) {
  // Reactive cart monitoring
  const lines = useComputed(() => shopify?.lines?.value || []);
  
  // Detect upsell opportunities
  const upsells = useComputed(() => {
    return detectAllUpsells(lines.value);
  });
  
  // Get currency
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  // Don't render if no upsells
  if (!upsells.value || upsells.value.length === 0) {
    return null;
  }
  
  // Show highest savings opportunity first
  const bestUpsell = upsells.value.sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
  
  return (
    <UpsellBannerContent
      upsell={bestUpsell}
      currency={currency.value}
      allowDismiss={allowDismiss}
    />
  );
}

/**
 * UpsellBannerContent - Individual upsell suggestion
 */
function UpsellBannerContent({ upsell, currency, allowDismiss }) {
  const { currentProduct, savingsAmount, savingsPercentage, upgradeFrequency } = upsell;
  
  const savingsText = formatSavings(savingsAmount, currency);
  const currentFreq = formatFrequency(extractFrequencyFromProduct(currentProduct));
  const upgradeFreq = formatFrequency(upgradeFrequency);
  
  return (
    <s-banner tone="info">
      <s-stack direction="block" spacing="tight">
        <s-heading>💡 Save More with {upgradeFreq} Subscription</s-heading>
        
        <s-text>
          Upgrade your {currentFreq} subscription to {upgradeFreq} and save{' '}
          <s-text emphasis="bold">{savingsText}/year</s-text>{' '}
          ({savingsPercentage}% savings)
        </s-text>
        
        <s-text size="small" appearance="subdued">
          You're currently subscribed to: {currentProduct.title}
        </s-text>
        
        {/* Future: Add upgrade button here when API supports it */}
        {/*
        <s-button onClick={handleUpgrade}>
          Upgrade & Save {savingsPercentage}%
        </s-button>
        */}
      </s-stack>
    </s-banner>
  );
}

/**
 * CompactUpsellBanner - Minimal version for space-constrained layouts
 */
export function CompactUpsellBanner({ shopify }) {
  const lines = useComputed(() => shopify?.lines?.value || []);
  const upsells = useComputed(() => detectAllUpsells(lines.value));
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  if (!upsells.value || upsells.value.length === 0) {
    return null;
  }
  
  const bestUpsell = upsells.value.sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
  const savingsText = formatSavings(bestUpsell.savingsAmount, currency.value);
  
  return (
    <s-banner tone="info">
      <s-text>
        💡 Upgrade to {formatFrequency(bestUpsell.upgradeFrequency)} and save{' '}
        <s-text emphasis="bold">{savingsText}/year</s-text>
      </s-text>
    </s-banner>
  );
}

/**
 * DetailedUpsellBanner - Enhanced version with breakdown
 */
export function DetailedUpsellBanner({ shopify, allowDismiss = true }) {
  const lines = useComputed(() => shopify?.lines?.value || []);
  const upsells = useComputed(() => detectAllUpsells(lines.value));
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  if (!upsells.value || upsells.value.length === 0) {
    return null;
  }
  
  const bestUpsell = upsells.value.sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
  const { currentProduct, savingsAmount, savingsPercentage, upgradeFrequency, upgradePrice } = bestUpsell;
  
  const currentFreq = formatFrequency(extractFrequencyFromProduct(currentProduct));
  const upgradeFreq = formatFrequency(upgradeFrequency);
  const savingsText = formatSavings(savingsAmount, currency.value);
  const upgradePriceText = formatSavings(upgradePrice, currency.value);
  
  // Calculate deliveries per year
  const currentDeliveries = getDeliveriesPerYear(extractFrequencyFromProduct(currentProduct));
  const upgradeDeliveries = getDeliveriesPerYear(upgradeFrequency);
  
  return (
    <s-banner tone="info">
      <s-stack direction="block" spacing="base">
        <s-heading>💡 Upgrade & Save {savingsPercentage}%</s-heading>
        
        <s-text>
          Switch from <s-text emphasis="bold">{currentFreq}</s-text> to{' '}
          <s-text emphasis="bold">{upgradeFreq}</s-text> delivery
        </s-text>
        
        <s-divider />
        
        <s-stack direction="block" spacing="tight">
          <s-text size="small">
            Current: {currentDeliveries}x/year @ {formatSavings(currentProduct.price, currency.value)} ={' '}
            {formatSavings(currentProduct.price * currentDeliveries, currency.value)}/year
          </s-text>
          
          <s-text size="small">
            Upgrade: {upgradeDeliveries}x/year @ {upgradePriceText} ={' '}
            {formatSavings(upgradePrice * upgradeDeliveries, currency.value)}/year
          </s-text>
          
          <s-text size="small" emphasis="bold" appearance="success">
            Annual Savings: {savingsText}
          </s-text>
        </s-stack>
      </s-stack>
    </s-banner>
  );
}

/**
 * Helper: Extract frequency from product object
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
  
  // Fallback: Check name
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
 * Helper: Get deliveries per year
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
