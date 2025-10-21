# Phase 3 Implementation Plan

## Technical Stack & Architecture

### Core Technologies
- **Framework**: Preact v10.10.x (lightweight alternative to React)
- **UI Components**: Shopify Polaris Web Components (`<s-*>` tags)
- **State Management**: Preact hooks (useState, useEffect, useMemo)
- **Testing**: Vitest v0.34.0 (already configured)
- **Build**: Vite (already configured)

### Component Architecture

#### GlasswareMessage.jsx
```
Purpose: Main component that orchestrates subscription detection + product lookup
Inputs: 
  - shopify.lines.value (cart items)
  - shopify.localization.value (customer currency)
  - Configuration props
Outputs: 
  - <s-banner> with glass benefits messaging, OR
  - null (if no subscription)

Key Dependencies:
  - detectSubscription() from subscriptionDetection.js
  - getIncludedItemPrice() from includedItemLookup.js
  - Polaris web components
```

#### Data Processing Flow
```
1. Read cart lines from shopify.lines.value
2. Loop through lines and detect subscriptions
3. If any subscription found:
   a. Determine glass count (4 for annual, 1 for quarterly/generic)
   b. Look up glass product price: getIncludedItemPrice('premium-glass')
   c. Format price and renewal date
4. Render appropriate banner or hidden state
```

#### Component Structure
```jsx
export default function GlasswareMessage() {
  // 1. Read reactive signals from shopify global
  const lines = shopify?.lines?.value || [];
  const currency = shopify?.localization?.value?.currency || 'USD';
  
  // 2. Detect subscriptions in cart
  const subscriptions = lines.map(detectSubscription);
  const hasSubscription = subscriptions.some(s => s.isSubscription);
  const totalGlasses = subscriptions.reduce((sum, s) => sum + s.glassCount, 0);
  
  // 3. Look up glass product price
  const [glassPrice, setGlassPrice] = useState(null);
  useEffect(async () => {
    if (hasSubscription) {
      const { price } = await getIncludedItemPrice('premium-glass');
      setGlassPrice(price);
    }
  }, [hasSubscription]);
  
  // 4. Format and render
  if (!hasSubscription) return null;
  
  return <BannerContent glassCount={totalGlasses} price={glassPrice} />;
}
```

### Test Strategy

#### Test Categories
1. **Subscription Detection** (3 tests)
   - Annual subscription → 4 glasses
   - Quarterly subscription → 1 glass
   - Mixed subscriptions → correct total

2. **Product Lookup** (3 tests)
   - Price found → display with currency
   - Price not found → display without value
   - Multiple lookups → cached correctly

3. **Rendering** (5 tests)
   - With subscription → banner visible
   - Without subscription → null render
   - Mobile viewport → responsive
   - Currency formatting → correct display
   - Error state → graceful degradation

4. **Edge Cases** (4 tests)
   - Empty cart → null render
   - Non-object line items → skip safely
   - null lines → graceful handling
   - shopify global undefined → safe render

### Performance Considerations

#### Bundle Size Target: <10KB (gzipped)
- Use Preact (3KB) instead of React (45KB)
- Import only needed Polaris components
- Tree-shake unused code
- Minification + gzip compression

#### Render Time Target: <100ms
- Use useMemo to cache calculations
- Lazy load price lookup (don't block render)
- Avoid expensive DOM operations
- Defer non-critical re-renders

#### Caching Strategy
- Per-product cache in includedItemLookup.js
- Reuse across component instances
- Clear cache on new session

### Error Handling & Graceful Degradation

```javascript
// Safe property access with optional chaining
const lines = shopify?.lines?.value || [];

// Try/catch around async operations
try {
  const { price } = await getIncludedItemPrice(handle);
} catch (error) {
  // Log silently, render without price
  setGlassPrice(null);
}

// Null-safe component rendering
return hasSubscription ? <Banner /> : null;

// Type safety with JSDoc
/** @param {unknown} lineItem */
function processLine(lineItem) {
  const item = /** @type {Record<string, unknown>} */ (lineItem);
  // Safe access to item properties
}
```

### Accessibility Requirements

#### WCAG 2.1 AA Compliance
- ✅ Semantic HTML (use Polaris `<s-banner>`, `<s-heading>`, `<s-text>`)
- ✅ Sufficient color contrast (Polaris handles this)
- ✅ Keyboard navigation (web components support this)
- ✅ Screen reader friendly (descriptive text)
- ✅ No keyboard traps (Polaris components tested)

#### Accessibility Testing Checklist
- [ ] Tab through component - no traps
- [ ] Read with screen reader - sensible text
- [ ] Color-blind safe (rely on text, not color)
- [ ] Mobile touch targets >44x44px
- [ ] Works with text zoom 200%

### Internationalization Considerations

#### Phase 3 (MVP): English only
- Component text hardcoded in English
- Use `shopify.localization.value.currency` for currency display

#### Phase 4 (Future): Multi-language support
- Move strings to `locales/` JSON files
- Support French (`locales/fr.json`)
- Use Shopify's i18n helpers

### Integration Points

#### With subscriptionDetection.js
```javascript
import { detectSubscription } from './subscriptionDetection.js';

const result = detectSubscription(lineItem);
// Returns: { isSubscription, glassCount, interval, provider, metadata }
```

#### With includedItemLookup.js
```javascript
import { getIncludedItemPrice } from './includedItemLookup.js';

const { price, found } = await getIncludedItemPrice('premium-glass');
// Returns: { price: { amount, currencyCode }, found: boolean }
```

#### With Checkout Extension
```javascript
// In Checkout.jsx
import GlasswareMessage from './GlasswareMessage.jsx';

export default async () => {
  render(
    <GlasswareMessage productHandle="premium-glass" />,
    document.body
  );
};
```

### Configuration Schema

```javascript
/**
 * @typedef {Object} GlasswareMessageConfig
 * @property {string} productHandle - Glassware product handle (default: 'premium-glass')
 * @property {boolean} showRenewalDate - Show next delivery date (default: true)
 * @property {string} tone - Banner tone: 'success' | 'info' (default: 'success')
 * @property {boolean} hideIfNoSubscription - Hide when no subscriptions (default: true)
 */
```

## Next Steps
1. Create GlasswareMessage.jsx component file
2. Create test file with 15+ test cases
3. Implement component logic with proper error handling
4. Verify tests pass and bundle size is acceptable
5. Manual integration testing in dev store checkout preview
