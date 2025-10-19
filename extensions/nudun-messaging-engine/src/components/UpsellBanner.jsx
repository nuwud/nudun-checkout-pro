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
import { buildUpsellMessage } from '../config/upsellTemplates.js';
import { 
  getActiveUpsellTemplateStyle, 
  getCustomUpsellTemplates,
  getUpsellDisplaySettings 
} from '../config/merchantSettings.js';

/**
 * UpsellBanner Component
 * 
 * Displays upgrade suggestion with savings calculation.
 * Only shows when there's a clear upsell opportunity.
 * 
 * @param {Object} props
 * @param {Object} props.shopify - Shopify global API
 * @returns {JSX.Element|null} Upsell banner or null
 * 
 * @example
 * <UpsellBanner shopify={shopify} />
 */
export default function UpsellBanner({ shopify }) {
  // Reactive cart monitoring
  const lines = useComputed(() => shopify?.lines?.value || []);
  
  // Detect upsell opportunities
  const upsells = useComputed(() => {
    const detected = detectAllUpsells(lines.value);
    
    // Debug logging
    console.log('[UpsellBanner] Lines:', lines.value?.length || 0);
    console.log('[UpsellBanner] Detected upsells:', detected.length);
    if (detected.length > 0) {
      console.log('[UpsellBanner] First upsell:', detected[0]);
    }
    
    return detected;
  });
  
  // Get currency
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  // Don't render if no upsells
  if (!upsells.value || upsells.value.length === 0) {
    console.log('[UpsellBanner] No upsells detected, not rendering');
    return null;
  }
  
  // Show highest savings opportunity first
  const bestUpsell = upsells.value.sort((a, b) => b.savingsAmount - a.savingsAmount)[0];
  
  console.log('[UpsellBanner] Rendering with best upsell:', bestUpsell);
  
  return (
    <UpsellBannerContent
      upsell={bestUpsell}
      currency={currency.value}
    />
  );
}

/**
 * UpsellBannerContent - Individual upsell suggestion with customizable templates
 */
function UpsellBannerContent({ upsell, currency }) {
  // Get merchant settings
  const displaySettings = getUpsellDisplaySettings();
  const templateStyle = getActiveUpsellTemplateStyle();
  const customTemplates = getCustomUpsellTemplates();
  
  // Build customizable message
  const message = buildUpsellMessage(upsell, currency, templateStyle, customTemplates);
  
  const { currentProduct } = upsell;
  const productImage = currentProduct.image;
  const currentPrice = formatSavings(currentProduct.price, currency);
  const upgradePrice = formatSavings(upsell.upgradePrice, currency);
  
  return (
    <s-banner tone="info">
      <s-stack direction="block">
        {/* Product Image + Content Layout */}
        {displaySettings.showProductImage && productImage && displaySettings.imagePosition === 'top' && (
          <s-image 
            src={productImage} 
            alt={currentProduct.title}
          />
        )}
        
        <s-stack direction="inline">
          {displaySettings.showProductImage && productImage && displaySettings.imagePosition === 'left' && (
            <s-image 
              src={productImage} 
              alt={currentProduct.title}
            />
          )}
          
          <s-stack direction="block">
            {/* Customizable Heading */}
            <s-heading>{message.heading}</s-heading>
            
            {/* Customizable Message */}
            <s-text>{message.message}</s-text>
            
            {/* Price Comparison (Optional) */}
            {(displaySettings.showCurrentPrice || displaySettings.showUpgradePrice) && (
              <s-stack direction="inline">
                {displaySettings.showCurrentPrice && (
                  <s-text>Current: {currentPrice}</s-text>
                )}
                {displaySettings.showCurrentPrice && displaySettings.showUpgradePrice && (
                  <s-text>→</s-text>
                )}
                {displaySettings.showUpgradePrice && (
                  <s-text>Upgrade: {upgradePrice}</s-text>
                )}
              </s-stack>
            )}
            
            {/* Customizable Context */}
            {displaySettings.showProductName && (
              <s-text>{message.context}</s-text>
            )}
          </s-stack>
          
          {displaySettings.showProductImage && productImage && displaySettings.imagePosition === 'right' && (
            <s-image 
              src={productImage} 
              alt={currentProduct.title}
            />
          )}
        </s-stack>
        
        {/* Future: Add upgrade button here when API supports it */}
        {/*
        <s-button onClick={handleUpgrade}>
          {message.buttonText}
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
        <strong>{savingsText}/year</strong>
      </s-text>
    </s-banner>
  );
}

/**
 * DetailedUpsellBanner - Enhanced version with breakdown
 */
export function DetailedUpsellBanner({ shopify }) {
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
      <s-stack direction="block">
        <s-heading>💡 Upgrade & Save {savingsPercentage}%</s-heading>
        
        <s-text>
          Switch from <strong>{currentFreq}</strong> to{' '}
          <strong>{upgradeFreq}</strong> delivery
        </s-text>
        
        <s-divider />
        
        <s-stack direction="block">
          <s-text>
            Current: {currentDeliveries}x/year @ {formatSavings(currentProduct.price, currency.value)} ={' '}
            {formatSavings(currentProduct.price * currentDeliveries, currency.value)}/year
          </s-text>
          
          <s-text>
            Upgrade: {upgradeDeliveries}x/year @ {upgradePriceText} ={' '}
            {formatSavings(upgradePrice * upgradeDeliveries, currency.value)}/year
          </s-text>
          
          <s-text>
            <strong>Annual Savings: {savingsText}</strong>
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
