/**
 * Merchant Settings Configuration
 * 
 * This file contains merchant-editable settings for dynamic messaging.
 * 
 * IMPORTANT FOR MERCHANTS:
 * - Edit this file to customize messaging for your store
 * - Changes take effect immediately on next build
 * - For legal compliance, use 'legal' or 'conservative' template style
 * - Custom templates allow complete message override
 * 
 * Future: This will be moved to Shopify admin UI for easier editing
 */

/**
 * Template Style Selection - Threshold Messages
 * 
 * Options:
 * - 'default': Standard marketing language with "free" terminology
 * - 'legal': Legal-compliant language ("complimentary" instead of "free")
 * - 'conservative': Minimal marketing language, straightforward messaging
 * - 'custom': Use customTemplates below for full control
 */
export const TEMPLATE_STYLE = 'default'; // Change to 'legal' or 'conservative' as needed

/**
 * Upsell Template Style Selection
 * 
 * Options:
 * - 'default': Standard marketing language with savings emphasis
 * - 'legal': Conservative, compliance-friendly language
 * - 'minimal': Brief, straightforward messaging
 * - 'enthusiastic': High-energy marketing language
 * - 'custom': Use CUSTOM_UPSELL_TEMPLATES below for full control
 */
export const UPSELL_TEMPLATE_STYLE = 'default';

/**
 * Upsell Display Settings
 * 
 * Control what information is shown in upsell banners
 */
export const UPSELL_DISPLAY_SETTINGS = {
  showProductImage: true,        // Show product thumbnail in upsell
  showCurrentPrice: true,         // Show current subscription price
  showUpgradePrice: true,         // Show upgrade subscription price
  showSavingsAmount: true,        // Show savings dollar amount
  showSavingsPercentage: true,    // Show savings percentage
  showProductName: true,          // Show product title
  imageSize: 'small',             // 'small', 'medium', 'large'
  imagePosition: 'left'           // 'left', 'right', 'top'
};

/**
 * Custom Threshold Message Templates (Optional)
 * 
 * Define your own messages here. These override the TEMPLATE_STYLE above.
 * Use template variables:
 * - {amount} - Remaining amount to reach threshold (e.g., "$25.00")
 * - {threshold} - Threshold value (e.g., "$50.00")
 * - {percentage} - Progress percentage (e.g., "50%")
 * - {discount} - Discount percentage (if applicable)
 * 
 * Example: Remove "free" language for legal compliance
 */
export const CUSTOM_TEMPLATES = {
  // Uncomment and edit to customize:
  /*
  unmet: {
    shipping: {
      title: "Shipping Offer",
      message: "Add {amount} more to qualify for complimentary shipping.",
      progressText: "{percentage} toward complimentary shipping"
    },
    gift: {
      title: "Bonus Gift",
      message: "Spend {amount} more to receive a bonus item.",
      progressText: "{percentage} toward bonus item"
    }
  },
  met: {
    shipping: {
      title: "✓ Shipping Qualified",
      message: "You qualify for complimentary shipping.",
      progressText: "Complimentary shipping applied"
    },
    gift: {
      title: "✓ Bonus Item Qualified",
      message: "You've qualified for a bonus item.",
      progressText: "Bonus item included"
    }
  }
  */
};

/**
 * Custom Upsell Templates (Optional)
 * 
 * Define your own upsell messages here. These override UPSELL_TEMPLATE_STYLE above.
 * Use template variables:
 * - {productName} - Product title
 * - {currentFrequency} - Current subscription frequency (e.g., "Quarterly")
 * - {upgradeFrequency} - Upgrade frequency (e.g., "Annual")
 * - {savingsAmount} - Savings amount with currency (e.g., "$45.00")
 * - {savingsPercentage} - Savings percentage (e.g., "15")
 * - {currentPrice} - Current subscription price
 * - {upgradePrice} - Upgrade subscription price
 * 
 * Example: Custom upsell messaging
 */
export const CUSTOM_UPSELL_TEMPLATES = {
  // Uncomment and edit to customize:
  /*
  heading: '💰 Switch to {upgradeFrequency} & Save',
  message: 'Upgrade {productName} from {currentFrequency} to {upgradeFrequency} and save {savingsAmount} every year',
  context: 'Current plan: {currentFrequency} at {currentPrice}',
  buttonText: 'Upgrade Now',
  compact: 'Save {savingsAmount}/year with {upgradeFrequency}'
  */
};

/**
 * Display Settings
 */
export const DISPLAY_SETTINGS = {
  // Maximum number of banners to show simultaneously
  maxVisibleBanners: 2,
  
  // Allow customers to dismiss banners
  allowDismiss: true,
  
  // Persist dismissed banners across page refreshes
  persistDismissed: true,
  
  // Show progress bars on unmet thresholds
  showProgressBar: true,
  
  // Progress bar style
  progressBarStyle: 'gradient', // 'gradient' or 'solid'
  
  // Auto-hide met thresholds after delay (milliseconds, 0 = never)
  autoHideMetThresholdsDelay: 0,
  
  // Animation style
  animationStyle: 'fade', // 'fade', 'slide', or 'none'
};

/**
 * Branding Settings
 */
export const BRANDING_SETTINGS = {
  // Use custom colors (set to null to use Shopify defaults)
  customColors: {
    // Unmet threshold banner (info tone)
    unmetBackground: null, // e.g., '#e3f2fd'
    unmetText: null,       // e.g., '#01579b'
    unmetBorder: null,     // e.g., '#90caf9'
    
    // Met threshold banner (success tone)
    metBackground: null,   // e.g., '#e8f5e9'
    metText: null,         // e.g., '#2e7d32'
    metBorder: null,       // e.g., '#81c784'
    
    // Progress bar
    progressBarColor: null, // e.g., '#4caf50'
  },
  
  // Custom emoji/icons (set to null to use defaults)
  customIcons: {
    shipping: '🚚',      // Shipping icon
    gift: '🎁',          // Gift icon
    discount: '💰',      // Discount icon
    success: '🎉',       // Success icon (when threshold met)
    progress: '📊',      // Progress icon
  },
};

/**
 * A/B Testing Configuration
 * 
 * Test different message variations to optimize conversion.
 * Set enabled: true to activate testing.
 */
export const AB_TESTING = {
  enabled: false,
  
  // Test variants (only active if enabled: true)
  variants: [
    {
      name: 'control',
      weight: 50, // 50% of users see this
      templateStyle: 'default'
    },
    {
      name: 'legal',
      weight: 50, // 50% of users see this
      templateStyle: 'legal'
    }
  ]
};

/**
 * Analytics Settings
 */
export const ANALYTICS_SETTINGS = {
  // Track banner impressions
  trackImpressions: true,
  
  // Track banner dismissals
  trackDismissals: true,
  
  // Track threshold crossings
  trackThresholdCrossings: true,
  
  // Analytics event prefix (e.g., 'nudun_checkout_' + 'banner_view')
  eventPrefix: 'nudun_checkout_'
};

/**
 * Get active template style based on A/B test (if enabled)
 * @returns {string} Template style to use
 */
export function getActiveTemplateStyle() {
  if (!AB_TESTING.enabled) {
    return TEMPLATE_STYLE;
  }
  
  // Simple A/B test: Use session storage to persist variant
  if (typeof sessionStorage !== 'undefined') {
    let variant = sessionStorage.getItem('nudun_ab_variant');
    
    if (!variant) {
      // Assign variant based on weights
      const random = Math.random() * 100;
      let cumulative = 0;
      
      for (const v of AB_TESTING.variants) {
        cumulative += v.weight;
        if (random <= cumulative) {
          variant = v.name;
          break;
        }
      }
      
      sessionStorage.setItem('nudun_ab_variant', variant);
    }
    
    // Find variant config
    const variantConfig = AB_TESTING.variants.find(v => v.name === variant);
    return variantConfig?.templateStyle || TEMPLATE_STYLE;
  }
  
  return TEMPLATE_STYLE;
}

/**
 * Get custom templates if defined
 * @returns {Object|null} Custom templates or null
 */
export function getCustomTemplates() {
  // Check if custom templates are defined (not just the empty object)
  if (CUSTOM_TEMPLATES.unmet || CUSTOM_TEMPLATES.met) {
    return CUSTOM_TEMPLATES;
  }
  return null;
}

/**
 * Get active upsell template style
 * @returns {string} Upsell template style to use
 */
export function getActiveUpsellTemplateStyle() {
  return UPSELL_TEMPLATE_STYLE;
}

/**
 * Get custom upsell templates if defined
 * @returns {Object|null} Custom upsell templates or null
 */
export function getCustomUpsellTemplates() {
  if (CUSTOM_UPSELL_TEMPLATES.heading || CUSTOM_UPSELL_TEMPLATES.message) {
    return CUSTOM_UPSELL_TEMPLATES;
  }
  return null;
}

/**
 * Get upsell display settings
 * @returns {Object} Upsell display configuration
 */
export function getUpsellDisplaySettings() {
  return UPSELL_DISPLAY_SETTINGS;
}
