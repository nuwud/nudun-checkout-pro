/**
 * Message Templates Configuration
 * 
 * Provides customizable message templates for threshold banners.
 * Merchants can edit these to comply with legal requirements
 * (e.g., removing "free" language where not permitted).
 * 
 * Template variables:
 * - {amount} - Currency amount (e.g., "$25.00")
 * - {threshold} - Threshold value
 * - {percentage} - Progress percentage (e.g., "50%")
 * - {reward} - Reward type (e.g., "shipping", "gift")
 */

/**
 * Default message templates (US English, standard marketing language)
 */
export const defaultTemplates = {
  // Unmet threshold messages (progress toward goal)
  unmet: {
    shipping: {
      title: "Unlock Free Shipping",
      message: "Add {amount} more to qualify for free shipping!",
      progressText: "{percentage} toward free shipping"
    },
    gift: {
      title: "Free Gift Available",
      message: "Spend {amount} more to unlock a free gift!",
      progressText: "{percentage} toward your free gift"
    },
    discount: {
      title: "Discount Available",
      message: "Add {amount} more to unlock {discount}% off!",
      progressText: "{percentage} toward your discount"
    }
  },
  
  // Met threshold messages (celebration, goal achieved)
  met: {
    shipping: {
      title: "🎉 Free Shipping Unlocked!",
      message: "You qualify for free shipping on this order.",
      progressText: "Free shipping applied"
    },
    gift: {
      title: "🎁 Free Gift Unlocked!",
      message: "You've earned a free gift with your order!",
      progressText: "Free gift included"
    },
    discount: {
      title: "💰 Discount Unlocked!",
      message: "You've unlocked {discount}% off your order!",
      progressText: "Discount applied"
    }
  }
};

/**
 * Legal-compliant templates (removes "free" language)
 * Use these in jurisdictions where "free" claims require disclaimers
 */
export const legalCompliantTemplates = {
  unmet: {
    shipping: {
      title: "Qualify for Complimentary Shipping",
      message: "Add {amount} more to qualify for complimentary shipping.",
      progressText: "{percentage} toward complimentary shipping"
    },
    gift: {
      title: "Bonus Gift Available",
      message: "Spend {amount} more to receive a bonus gift.",
      progressText: "{percentage} toward your bonus gift"
    },
    discount: {
      title: "Discount Available",
      message: "Add {amount} more to unlock {discount}% off.",
      progressText: "{percentage} toward your discount"
    }
  },
  
  met: {
    shipping: {
      title: "🎉 Complimentary Shipping Qualified!",
      message: "You qualify for complimentary shipping on this order.",
      progressText: "Complimentary shipping applied"
    },
    gift: {
      title: "🎁 Bonus Gift Qualified!",
      message: "You've earned a bonus gift with your order.",
      progressText: "Bonus gift included"
    },
    discount: {
      title: "💰 Discount Qualified!",
      message: "You've unlocked {discount}% off your order.",
      progressText: "Discount applied"
    }
  }
};

/**
 * Conservative templates (minimal marketing language)
 * For brands preferring understated messaging
 */
export const conservativeTemplates = {
  unmet: {
    shipping: {
      title: "Shipping Threshold",
      message: "Add {amount} to reach ${threshold} for free shipping.",
      progressText: "{percentage} complete"
    },
    gift: {
      title: "Gift Threshold",
      message: "Spend {amount} more to reach ${threshold} and receive a gift.",
      progressText: "{percentage} complete"
    },
    discount: {
      title: "Discount Threshold",
      message: "Add {amount} to unlock {discount}% off at ${threshold}.",
      progressText: "{percentage} complete"
    }
  },
  
  met: {
    shipping: {
      title: "Shipping Threshold Reached",
      message: "Your order qualifies for free shipping.",
      progressText: "Complete"
    },
    gift: {
      title: "Gift Threshold Reached",
      message: "Your order qualifies for a complimentary gift.",
      progressText: "Complete"
    },
    discount: {
      title: "Discount Applied",
      message: "Your order qualifies for {discount}% off.",
      progressText: "Complete"
    }
  }
};

/**
 * Get message templates by style
 * @param {'default' | 'legal' | 'conservative'} style - Template style
 * @returns {Object} Message templates
 */
export function getTemplatesByStyle(style) {
  switch (style) {
    case 'legal':
      return legalCompliantTemplates;
    case 'conservative':
      return conservativeTemplates;
    default:
      return defaultTemplates;
  }
}

/**
 * Get a specific message template
 * @param {string} status - 'met' or 'unmet'
 * @param {string} rewardType - 'shipping', 'gift', or 'discount'
 * @param {'default' | 'legal' | 'conservative'} style - Template style
 * @returns {Object} Message template with title, message, progressText
 */
export function getMessageTemplate(status, rewardType, style = 'default') {
  const templates = getTemplatesByStyle(style);
  return templates[status]?.[rewardType] || templates.unmet.shipping;
}

/**
 * Interpolate template variables with actual values
 * @param {string} template - Template string with {variables}
 * @param {Object} values - Object with variable values
 * @returns {string} Interpolated string
 */
export function interpolateTemplate(template, values) {
  if (!template) return '';
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
}

/**
 * Build a complete message object with interpolated values
 * @param {string} status - 'met' or 'unmet'
 * @param {string} rewardType - 'shipping', 'gift', or 'discount'
 * @param {Object} values - Values for interpolation
 * @param {'default' | 'legal' | 'conservative'} style - Template style
 * @returns {Object} Complete message with title, message, progressText
 */
export function buildMessage(status, rewardType, values, style = 'default') {
  const template = getMessageTemplate(status, rewardType, style);
  
  return {
    title: interpolateTemplate(template.title, values),
    message: interpolateTemplate(template.message, values),
    progressText: interpolateTemplate(template.progressText, values)
  };
}

/**
 * Custom message override (merchant-specific)
 * Allows merchants to provide completely custom messages via admin
 * @param {Object} customTemplates - Merchant-provided templates
 * @returns {Object} Merged templates (custom overrides default)
 */
export function applyCustomTemplates(customTemplates) {
  return {
    unmet: {
      ...defaultTemplates.unmet,
      ...customTemplates?.unmet
    },
    met: {
      ...defaultTemplates.met,
      ...customTemplates?.met
    }
  };
}
