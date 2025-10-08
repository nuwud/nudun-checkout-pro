/* eslint-disable react/prop-types */
/**
 * BannerQueue Component
 * 
 * Priority-based queue manager for dynamic threshold messages.
 * Controls banner visibility, ordering, and dismissal behavior.
 * 
 * Related: T017 - Implement BannerQueue component
 * User Story: US6 - Real-Time Dynamic Messaging
 * Requirements: FR-028, FR-029, FR-030
 */

import '@shopify/ui-extensions/preact';
import { useState, useEffect } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { getThresholdMessages } from '../utils/thresholdDetector.js';

/**
 * BannerQueue Component
 * 
 * Manages display of multiple threshold banners with priority ordering.
 * Enforces max 2 visible banners at a time (FR-028).
 * Supports dismissal with session persistence.
 * 
 * @param {Object} props
 * @param {Object} props.shopify - Shopify global API object
 * @param {number} [props.maxVisible=2] - Maximum visible banners (default: 2)
 * @param {boolean} [props.allowDismiss=true] - Allow banner dismissal
 * @param {boolean} [props.persistDismissed=true] - Remember dismissed banners
 * @returns {JSX.Element|null} Queue of prioritized banners
 * 
 * @example
 * <BannerQueue shopify={shopify} maxVisible={2} />
 */
export default function BannerQueue({ 
  shopify, 
  maxVisible = 2,
  allowDismiss = true,
  persistDismissed = true
}) {
  // Track dismissed banner priorities (session-persistent)
  const [dismissedPriorities, setDismissedPriorities] = useState(() => {
    if (!persistDismissed) return new Set();
    
    try {
      const stored = sessionStorage.getItem('nudun_dismissed_banners');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  // Reactive cart value and currency
  const cartValue = useComputed(() => {
    const total = shopify?.cost?.subtotalAmount?.value;
    if (!total) return 0;
    
    const amount = parseFloat(total.amount || '0');
    return Math.round(amount * 100);
  });
  
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  // Get all threshold messages
  const allMessages = useComputed(() => {
    return getThresholdMessages(cartValue.value, currency.value);
  });
  
  // Filter out dismissed messages and apply max visible limit
  const visibleMessages = useComputed(() => {
    const filtered = allMessages.value.filter(
      msg => !dismissedPriorities.has(msg.priority)
    );
    
    // Sort by priority (lower number = higher priority)
    const sorted = [...filtered].sort((a, b) => a.priority - b.priority);
    
    // Limit to maxVisible
    return sorted.slice(0, maxVisible);
  });
  
  // Clear dismissed banners when thresholds are met (user progressed)
  useEffect(() => {
    // If all visible messages are "met", clear dismissals for fresh start
    const allMet = visibleMessages.value.every(msg => msg.met);
    
    if (allMet && dismissedPriorities.size > 0) {
      setDismissedPriorities(new Set());
      if (persistDismissed) {
        sessionStorage.removeItem('nudun_dismissed_banners');
      }
    }
  }, [visibleMessages.value, dismissedPriorities.size, persistDismissed]);
  
  // Handle banner dismissal
  const handleDismiss = (priority) => {
    if (!allowDismiss) return;
    
    const newDismissed = new Set(dismissedPriorities);
    newDismissed.add(priority);
    setDismissedPriorities(newDismissed);
    
    // Persist to session storage
    if (persistDismissed) {
      try {
        sessionStorage.setItem(
          'nudun_dismissed_banners',
          JSON.stringify([...newDismissed])
        );
      } catch (error) {
        console.warn('Failed to persist dismissed banners:', error);
      }
    }
  };
  
  // Don't render if no visible messages
  if (!visibleMessages.value || visibleMessages.value.length === 0) {
    return null;
  }
  
  return (
    <s-stack direction="block">
      {visibleMessages.value.map((msg, index) => (
        <QueuedBanner
          key={`banner-${msg.priority}-${index}`}
          message={msg.message}
          tone={/** @type {'info'|'success'|'warning'|'critical'} */ (msg.tone)}
          met={msg.met}
          progress={msg.progress}
          allowDismiss={allowDismiss && !msg.met}
          onDismiss={() => handleDismiss(msg.priority)}
        />
      ))}
    </s-stack>
  );
}

/**
 * QueuedBanner Sub-Component
 * 
 * Individual banner with dismissal capability.
 * Wraps threshold message with dismiss button.
 * 
 * @param {Object} props
 * @param {string} props.message - Banner message text
 * @param {'info'|'success'|'warning'|'critical'} props.tone - Banner tone
 * @param {boolean} props.met - Whether threshold is met
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {boolean} props.allowDismiss - Show dismiss button
 * @param {() => void} props.onDismiss - Dismiss callback
 * @returns {JSX.Element} Banner with optional dismiss
 */
function QueuedBanner({ 
  message, 
  tone, 
  met, 
  progress, 
  allowDismiss,
  onDismiss 
}) {
  return (
    <s-banner tone={tone}>
      <s-stack direction="block">
        <s-stack direction="inline">
          <s-text>{message}</s-text>
          {allowDismiss && (
            <DismissButton onDismiss={onDismiss} />
          )}
        </s-stack>
        
        {!met && progress > 0 && (
          <ProgressIndicator progress={progress} />
        )}
      </s-stack>
    </s-banner>
  );
}

/**
 * DismissButton Sub-Component
 * 
 * Dismissal button for banners.
 * Uses standard "×" close icon.
 * 
 * @param {Object} props
 * @param {() => void} props.onDismiss - Dismiss callback
 * @returns {JSX.Element} Dismiss button
 */
function DismissButton({ onDismiss }) {
  return (
    <s-button
      onClick={onDismiss}
      accessibilityLabel="Dismiss message"
    >
      ×
    </s-button>
  );
}

/**
 * ProgressIndicator Sub-Component
 * 
 * Visual progress display for threshold completion.
 * Shows percentage and optional visual bar.
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @returns {JSX.Element} Progress display
 */
function ProgressIndicator({ progress }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <s-text>
      {clampedProgress}% towards goal
    </s-text>
  );
}

/**
 * CompactBannerQueue Component
 * 
 * Space-saving variant that shows only the highest priority message.
 * No dismissal, minimal UI.
 * 
 * @param {Object} props
 * @param {Object} props.shopify - Shopify global API object
 * @returns {JSX.Element|null} Single highest-priority banner
 * 
 * @example
 * <CompactBannerQueue shopify={shopify} />
 */
export function CompactBannerQueue({ shopify }) {
  const cartValue = useComputed(() => {
    const total = shopify?.cost?.subtotalAmount?.value;
    if (!total) return 0;
    
    const amount = parseFloat(total.amount || '0');
    return Math.round(amount * 100);
  });
  
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  const messages = useComputed(() => {
    return getThresholdMessages(cartValue.value, currency.value);
  });
  
  // Get highest priority message (lowest number)
  const topMessage = messages.value?.[0];
  
  if (!topMessage || topMessage.met) {
    return null;
  }
  
  return (
    <s-text>{topMessage.message}</s-text>
  );
}

/**
 * PersistentBannerQueue Component
 * 
 * Enhanced queue that persists state across page navigation.
 * Uses localStorage for longer-term persistence (vs sessionStorage).
 * 
 * @param {Object} props
 * @param {Object} props.shopify - Shopify global API object
 * @param {number} [props.maxVisible=2] - Maximum visible banners
 * @returns {JSX.Element|null} Persistent banner queue
 * 
 * @example
 * <PersistentBannerQueue shopify={shopify} />
 */
export function PersistentBannerQueue({ shopify, maxVisible = 2 }) {
  const [dismissedPriorities, setDismissedPriorities] = useState(() => {
    try {
      const stored = localStorage.getItem('nudun_dismissed_banners');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  const cartValue = useComputed(() => {
    const total = shopify?.cost?.subtotalAmount?.value;
    if (!total) return 0;
    
    const amount = parseFloat(total.amount || '0');
    return Math.round(amount * 100);
  });
  
  const currency = useComputed(() => {
    return shopify?.cost?.subtotalAmount?.value?.currencyCode || 'USD';
  });
  
  const allMessages = useComputed(() => {
    return getThresholdMessages(cartValue.value, currency.value);
  });
  
  const visibleMessages = useComputed(() => {
    const filtered = allMessages.value.filter(
      msg => !dismissedPriorities.has(msg.priority)
    );
    
    const sorted = [...filtered].sort((a, b) => a.priority - b.priority);
    return sorted.slice(0, maxVisible);
  });
  
  const handleDismiss = (priority) => {
    const newDismissed = new Set(dismissedPriorities);
    newDismissed.add(priority);
    setDismissedPriorities(newDismissed);
    
    try {
      localStorage.setItem(
        'nudun_dismissed_banners',
        JSON.stringify([...newDismissed])
      );
    } catch (error) {
      console.warn('Failed to persist dismissed banners:', error);
    }
  };
  
  if (!visibleMessages.value || visibleMessages.value.length === 0) {
    return null;
  }
  
  return (
    <s-stack direction="block">
      {visibleMessages.value.map((msg, index) => (
        <QueuedBanner
          key={`banner-${msg.priority}-${index}`}
          message={msg.message}
          tone={/** @type {'info'|'success'|'warning'|'critical'} */ (msg.tone)}
          met={msg.met}
          progress={msg.progress}
          allowDismiss={!msg.met}
          onDismiss={() => handleDismiss(msg.priority)}
        />
      ))}
    </s-stack>
  );
}

/**
 * Queue Behavior Notes:
 * 
 * 1. Priority Sorting:
 *    - Lower priority number = higher importance (1 > 2 > 3)
 *    - Sorted before limiting to maxVisible
 *    - Met thresholds shown with 'success' tone
 * 
 * 2. Dismissal Behavior:
 *    - Only unmet thresholds can be dismissed (met = celebration)
 *    - Dismissed priorities stored in Set for O(1) lookup
 *    - Session storage persists across page refreshes (same session)
 *    - Local storage persists across sessions (PersistentBannerQueue)
 * 
 * 3. Auto-Clear Logic:
 *    - When all visible messages are "met", clear dismissals
 *    - Rationale: User achieved goals, start fresh for next thresholds
 *    - Prevents permanently hiding future messages
 * 
 * 4. Performance:
 *    - Filter/sort happens in useComputed (memoized)
 *    - Only recomputes when messages or dismissals change
 *    - Storage operations are async-safe with try/catch
 * 
 * 5. Requirements:
 *    - FR-028: Max 2 visible banners ✅
 *    - FR-029: Priority-based ordering ✅
 *    - FR-030: Dismissal capability ✅
 */
