/**
 * Add-On Configuration Map
 * 
 * Defines all supported add-on types with their display properties.
 * Extensible design: Add new types without code changes.
 * 
 * Related: T005 - Create add-on configuration map
 * User Story: US5 - Generic Add-On System
 */

/**
 * @typedef {Object} AddOnConfig
 * @property {string} name - Display name (e.g., "Premium Glass")
 * @property {string} pluralName - Plural form (e.g., "Premium Glasses")
 * @property {string} imageUrl - Product image URL (optional)
 * @property {string} productHandle - Shopify product handle for linking
 * @property {string} icon - Emoji or icon for display
 */

/**
 * @type {Record<string, AddOnConfig>}
 */
export const ADD_ON_CONFIG = {
  glass: {
    name: 'Premium Glass',
    pluralName: 'Premium Glasses',
    imageUrl: null, // TODO: Add product image
    productHandle: 'premium-glass',
    icon: '🍷'
  },
  
  bottle: {
    name: 'Bottle',
    pluralName: 'Bottles',
    imageUrl: null, // TODO: Add product image
    productHandle: 'wine-bottle',
    icon: '🍾'
  },
  
  accessory: {
    name: 'Wine Accessory',
    pluralName: 'Wine Accessories',
    imageUrl: null, // TODO: Add product image
    productHandle: 'wine-accessory',
    icon: '🔧'
  },
  
  sticker: {
    name: 'Sticker',
    pluralName: 'Stickers',
    imageUrl: null, // TODO: Add product image
    productHandle: 'wine-sticker',
    icon: '✨'
  },
  
  sample: {
    name: 'Sample',
    pluralName: 'Samples',
    imageUrl: null, // TODO: Add product image
    productHandle: 'wine-sample',
    icon: '🎁'
  }
};

/**
 * Get add-on configuration by type
 * 
 * @param {string} addonType - Add-on type key (e.g., 'glass', 'bottle')
 * @returns {AddOnConfig|null} Configuration object or null if not found
 * 
 * @example
 * const config = getAddOnConfig('glass');
 * console.log(config.name); // "Premium Glass"
 */
export function getAddOnConfig(addonType) {
  return ADD_ON_CONFIG[addonType] || null;
}

/**
 * Get all supported add-on types
 * 
 * @returns {string[]} Array of add-on type keys
 * 
 * @example
 * const types = getSupportedAddOnTypes();
 * console.log(types); // ['glass', 'bottle', 'accessory', 'sticker', 'sample']
 */
export function getSupportedAddOnTypes() {
  return Object.keys(ADD_ON_CONFIG);
}

/**
 * Check if add-on type is supported
 * 
 * @param {string} addonType - Add-on type to check
 * @returns {boolean} True if supported
 * 
 * @example
 * isValidAddOnType('glass');  // true
 * isValidAddOnType('invalid'); // false
 */
export function isValidAddOnType(addonType) {
  return addonType in ADD_ON_CONFIG;
}

/**
 * Format add-on display name with quantity
 * 
 * @param {string} addonType - Add-on type key
 * @param {number} count - Quantity of add-ons
 * @returns {string} Formatted display string
 * 
 * @example
 * formatAddOnName('glass', 1);  // "1 Premium Glass"
 * formatAddOnName('glass', 4);  // "4 Premium Glasses"
 * formatAddOnName('invalid', 1); // "1 Unknown Add-On"
 */
export function formatAddOnName(addonType, count) {
  const config = getAddOnConfig(addonType);
  
  if (!config) {
    return `${count} Unknown Add-On${count !== 1 ? 's' : ''}`;
  }
  
  const name = count === 1 ? config.name : config.pluralName;
  return `${count} ${name}`;
}

/**
 * Get display icon for add-on type
 * 
 * @param {string} addonType - Add-on type key
 * @returns {string} Icon emoji or fallback
 * 
 * @example
 * getAddOnIcon('glass');   // "🍷"
 * getAddOnIcon('invalid'); // "📦"
 */
export function getAddOnIcon(addonType) {
  const config = getAddOnConfig(addonType);
  return config ? config.icon : '📦';
}

/**
 * Extensibility Example:
 * 
 * To add a new add-on type (e.g., 'corkscrew'):
 * 1. Add entry to ADD_ON_CONFIG:
 *    corkscrew: {
 *      name: 'Premium Corkscrew',
 *      pluralName: 'Premium Corkscrews',
 *      imageUrl: 'https://...',
 *      productHandle: 'premium-corkscrew',
 *      icon: '🍴'
 *    }
 * 2. No code changes needed in components
 * 3. Add translation keys to locales/en.default.json and locales/fr.json
 * 4. Done! New type works automatically.
 */
