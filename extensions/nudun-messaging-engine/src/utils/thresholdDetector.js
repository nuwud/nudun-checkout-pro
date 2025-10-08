/**
 * Threshold Detector
 * 
 * Monitors cart value and detects threshold status changes.
 * Determines when dynamic threshold messages should be displayed.
 * 
 * Related: T015 - Implement threshold detector
 * User Story: US6 - Real-Time Dynamic Messaging
 * Requirements: FR-023, FR-025, FR-027
 */

import {
  getNextThreshold,
  getMetThresholds,
  calculateRemaining,
  getActiveThresholds,
  interpolateMessage
} from '../config/thresholdConfig.js';

/**
 * @typedef {Object} ThresholdStatus
 * @property {Object|null} next - Next unmet threshold
 * @property {Object[]} met - Array of met thresholds
 * @property {Object[]} active - Active thresholds for display (max 2, priority-sorted)
 * @property {boolean} hasUnmetThresholds - Whether any unmet thresholds exist
 * @property {number} cartValue - Current cart subtotal in cents
 * @property {string} currency - Currency code
 */

/**
 * Detect current threshold status
 * 
 * Analyzes cart value and returns comprehensive threshold state.
 * Used to determine which messages to display.
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {ThresholdStatus} Current threshold status
 * 
 * @example
 * const status = detectThresholdStatus(3500, 'USD'); // $35.00
 * // Returns:
 * // {
 * //   next: { value: 5000, message: '...' },
 * //   met: [],
 * //   active: [{ threshold, remaining: 1500, met: false }],
 * //   hasUnmetThresholds: true,
 * //   cartValue: 3500,
 * //   currency: 'USD'
 * // }
 */
export function detectThresholdStatus(cartValue, currencyCode) {
  const next = getNextThreshold(cartValue, currencyCode);
  const met = getMetThresholds(cartValue, currencyCode);
  const active = getActiveThresholds(cartValue, currencyCode);
  
  return {
    next,
    met,
    active,
    hasUnmetThresholds: next !== null,
    cartValue,
    currency: currencyCode
  };
}

/**
 * Check if threshold status has changed
 * 
 * Compares previous and current status to detect meaningful changes.
 * Used to determine when to trigger banner updates.
 * 
 * @param {ThresholdStatus|null} previous - Previous threshold status
 * @param {ThresholdStatus} current - Current threshold status
 * @returns {boolean} True if status changed (new threshold met or cart value changed)
 * 
 * @example
 * const prev = detectThresholdStatus(4000, 'USD'); // $40.00
 * const curr = detectThresholdStatus(5500, 'USD'); // $55.00 (crossed $50 threshold)
 * const changed = hasThresholdChanged(prev, curr); // true
 */
export function hasThresholdChanged(previous, current) {
  // If no previous state, consider it changed
  if (!previous) return true;
  
  // Cart value changed
  if (previous.cartValue !== current.cartValue) return true;
  
  // Currency changed
  if (previous.currency !== current.currency) return true;
  
  // Next threshold changed (crossed a threshold)
  const prevNextValue = previous.next?.value;
  const currNextValue = current.next?.value;
  if (prevNextValue !== currNextValue) return true;
  
  // Met thresholds count changed
  if (previous.met.length !== current.met.length) return true;
  
  return false;
}

/**
 * Get messages to display for current cart state
 * 
 * Returns array of formatted messages based on active thresholds.
 * Each message includes interpolated values and display tone.
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {Array<{message: string, tone: string, met: boolean, priority: number, progress: number}>} Messages to display
 * 
 * @example
 * const messages = getThresholdMessages(3500, 'USD');
 * // Returns:
 * // [{
 * //   message: 'Add $15.00 more for free shipping!',
 * //   tone: 'info',
 * //   met: false,
 * //   priority: 2,
 * //   progress: 70
 * // }]
 */
export function getThresholdMessages(cartValue, currencyCode) {
  const active = getActiveThresholds(cartValue, currencyCode);
  
  return active.map(({ threshold, remaining, met }) => {
    // Use met message if threshold achieved, otherwise interpolate template
    const message = met 
      ? threshold.metMessage 
      : interpolateMessage(threshold.message, remaining, currencyCode);
    
    return {
      message,
      tone: met ? 'success' : threshold.tone,
      met,
      priority: threshold.priority,
      progress: met ? 100 : Math.round((cartValue / threshold.value) * 100)
    };
  });
}

/**
 * Get next threshold message with remaining amount
 * 
 * Convenience function to get only the next unmet threshold message.
 * Returns null if all thresholds are met.
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {{message: string, remaining: number, progress: number, tone: string, priority: number}|null} Next threshold message or null
 * 
 * @example
 * const next = getNextThresholdMessage(3500, 'USD');
 * // Returns:
 * // {
 * //   message: 'Add $15.00 more for free shipping!',
 * //   remaining: 1500,
 * //   progress: 70
 * // }
 */
export function getNextThresholdMessage(cartValue, currencyCode) {
  const next = getNextThreshold(cartValue, currencyCode);
  
  if (!next) return null;
  
  const remaining = calculateRemaining(cartValue, next.value);
  const progress = Math.round((cartValue / next.value) * 100);
  const message = interpolateMessage(next.message, remaining, currencyCode);
  
  return {
    message,
    remaining,
    progress,
    tone: next.tone,
    priority: next.priority
  };
}

/**
 * Get met threshold messages
 * 
 * Returns array of messages for all achieved thresholds.
 * Useful for displaying congratulatory messages.
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {Array<{message: string, tone: string}>} Met threshold messages
 * 
 * @example
 * const met = getMetThresholdMessages(12000, 'USD'); // $120.00
 * // Returns:
 * // [
 * //   { message: '🎉 You qualify for free shipping!', tone: 'success' },
 * //   { message: '🎁 Free gift unlocked!', tone: 'success' }
 * // ]
 */
export function getMetThresholdMessages(cartValue, currencyCode) {
  const met = getMetThresholds(cartValue, currencyCode);
  
  return met
    .filter(threshold => !threshold.hideWhenMet)
    .map(threshold => ({
      message: threshold.metMessage,
      tone: 'success',
      priority: threshold.priority
    }));
}

/**
 * Check if cart has met any thresholds
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {boolean} True if at least one threshold is met
 * 
 * @example
 * hasMetThresholds(6000, 'USD'); // true (met $50 threshold)
 * hasMetThresholds(3000, 'USD'); // false (below $50)
 */
export function hasMetThresholds(cartValue, currencyCode) {
  const met = getMetThresholds(cartValue, currencyCode);
  return met.length > 0;
}

/**
 * Check if cart has unmet thresholds
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {boolean} True if at least one threshold is unmet
 * 
 * @example
 * hasUnmetThresholds(3000, 'USD'); // true (can reach $50)
 * hasUnmetThresholds(25000, 'USD'); // false (all thresholds met)
 */
export function hasUnmetThresholds(cartValue, currencyCode) {
  const next = getNextThreshold(cartValue, currencyCode);
  return next !== null;
}

/**
 * Get threshold crossing information
 * 
 * Detects when cart value crosses a threshold boundary.
 * Useful for triggering animations or analytics events.
 * 
 * @param {number} previousValue - Previous cart value in cents
 * @param {number} currentValue - Current cart value in cents
 * @param {string} currencyCode - Currency code
 * @returns {{crossed: boolean, threshold: Object|null, direction: 'up'|'down'|null}} Crossing information
 * 
 * @example
 * const crossing = getThresholdCrossing(4500, 5500, 'USD');
 * // Returns:
 * // {
 * //   crossed: true,
 * //   threshold: { value: 5000, message: '...' },
 * //   direction: 'up'
 * // }
 */
export function getThresholdCrossing(previousValue, currentValue, currencyCode) {
  const prevMet = getMetThresholds(previousValue, currencyCode);
  const currMet = getMetThresholds(currentValue, currencyCode);
  
  // Check if count changed
  if (prevMet.length === currMet.length) {
    return {
      crossed: false,
      threshold: null,
      direction: null
    };
  }
  
  // Determine direction and threshold
  if (currMet.length > prevMet.length) {
    // Crossed upward - new threshold met
    const newThreshold = currMet[currMet.length - 1];
    return {
      crossed: true,
      threshold: newThreshold,
      direction: 'up'
    };
  } else {
    // Crossed downward - threshold lost
    const lostThreshold = prevMet[prevMet.length - 1];
    return {
      crossed: true,
      threshold: lostThreshold,
      direction: 'down'
    };
  }
}

/**
 * Calculate distance to next threshold
 * 
 * @param {number} cartValue - Current cart subtotal in cents
 * @param {string} currencyCode - Currency code
 * @returns {{distance: number, percentage: number}|null} Distance info or null
 * 
 * @example
 * const distance = getDistanceToNextThreshold(3500, 'USD');
 * // Returns: { distance: 1500, percentage: 30 }
 * // (need $15.00 more, currently at 70%)
 */
export function getDistanceToNextThreshold(cartValue, currencyCode) {
  const next = getNextThreshold(cartValue, currencyCode);
  
  if (!next) return null;
  
  const distance = calculateRemaining(cartValue, next.value);
  const percentage = 100 - Math.round((cartValue / next.value) * 100);
  
  return {
    distance,
    percentage
  };
}
