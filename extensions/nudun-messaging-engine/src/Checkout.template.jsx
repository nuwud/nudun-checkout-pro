// @ts-nocheck
/**
 * TEMPLATE FILE - FOR REFERENCE ONLY
 * 
 * This is NOT used in production. See Checkout.jsx for the actual extension.
 * This file demonstrates the correct Shopify-approved pattern for extensions.
 * 
 * TypeScript checking is disabled for this reference file because the shopify
 * global object IS available at runtime, but TypeScript types are incomplete.
 * 
 * For full code examples, see: EXTENSION-QUICK-REF.md
 */

import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  // ✅ SHOPIFY APPROVAL PATTERN: Always use optional chaining
  // The shopify global object IS available at runtime in extensions,
  // but TypeScript types don't capture all properties (this is expected).
  const totalAmount = shopify?.cost?.totalAmount?.value;
  const itemCount = shopify?.lines?.value?.length || 0;
  
  // ✅ SHOPIFY APPROVAL PATTERN: Graceful fallback
  if (!totalAmount) {
    return null; // Don't render if data unavailable
  }
  
  // ✅ SHOPIFY APPROVAL PATTERN: User-friendly messaging
  return (
    <s-banner tone="info">
      <s-heading>Template Example</s-heading>
      <s-text>
        Cart has {itemCount} {itemCount === 1 ? 'item' : 'items'} totaling ${totalAmount}
      </s-text>
    </s-banner>
  );
}
