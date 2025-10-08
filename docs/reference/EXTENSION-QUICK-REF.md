# Checkout Extension Quick Reference

## ✅ Working Pattern (2025-10 API)

### Minimal Working Example
```jsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return (
    <s-banner tone="critical">
      <s-heading>Your Message</s-heading>
      <s-text>Your description</s-text>
    </s-banner>
  );
}
```

## 🎨 Common Patterns

### 1. Access Cart Data
```jsx
function Extension() {
  const total = shopify.cost.totalAmount.value;
  const items = shopify.lines.value;
  
  return (
    <s-text>
      You have {items.length} items totaling ${total}
    </s-text>
  );
}
```

### 2. Conditional Rendering
```jsx
function Extension() {
  const total = shopify.cost.totalAmount.value;
  
  if (total < 50) {
    return (
      <s-banner tone="info">
        <s-text>Add ${50 - total} more for free shipping!</s-text>
      </s-banner>
    );
  }
  
  return null;
}
```

### 3. Interactive Button
```jsx
import { useState } from 'preact/hooks';

function Extension() {
  const [clicked, setClicked] = useState(false);
  
  return (
    <s-stack direction="block">
      <s-button onClick={() => setClicked(true)}>
        Click me
      </s-button>
      {clicked && <s-text>Thanks for clicking!</s-text>}
    </s-stack>
  );
}
```

### 4. Product Detection
```jsx
function Extension() {
  const lines = shopify.lines.value;
  
  const hasSubscription = lines.some(line => 
    line.sellingPlan != null
  );
  
  if (hasSubscription) {
    return (
      <s-banner tone="success">
        <s-heading>Subscription Detected</s-heading>
        <s-text>You're saving 15% with auto-delivery!</s-text>
      </s-banner>
    );
  }
  
  return null;
}
```

### 5. Customer Info
```jsx
function Extension() {
  const customer = shopify.customer.value;
  const address = shopify.shippingAddress.value;
  
  if (address?.countryCode === 'US') {
    return (
      <s-text>
        Shipping to {address.city}, {address.provinceCode}
      </s-text>
    );
  }
  
  return null;
}
```

### 6. Multiple Components
```jsx
function Extension() {
  return (
    <s-stack direction="block" gap="base">
      <s-banner tone="warning">
        <s-heading>Limited Time Offer</s-heading>
      </s-banner>
      
      <s-stack direction="inline" gap="small">
        <s-image src="https://cdn.shopify.com/image.jpg" />
        <s-text>Product description</s-text>
      </s-stack>
      
      <s-button>Add to Order</s-button>
    </s-stack>
  );
}
```

## 📦 Available Components

### Layout
- `<s-stack direction="inline|block" gap="base|small|tight">` - Container
- `<s-box padding="base" borderRadius="base">` - Box with styling

### Content
- `<s-heading>` - Headings
- `<s-text>` - Body text
- `<s-image src="..." />` - Images
- `<s-banner tone="info|warning|critical|success">` - Alerts

### Interactive
- `<s-button onClick={fn}>` - Buttons
- `<s-checkbox>` - Checkboxes
- `<s-text-field>` - Text inputs
- `<s-select>` - Dropdowns

## 🌐 Shopify Global API

### Cart/Order Data
- `shopify.cost.totalAmount.value` - Cart total
- `shopify.lines.value` - Array of line items
- `shopify.discountCodes.value` - Applied discount codes

### Customer Data
- `shopify.customer.value` - Customer info (if logged in)
- `shopify.email.value` - Email address
- `shopify.phone.value` - Phone number

### Shipping Data
- `shopify.shippingAddress.value` - Shipping address
- `shopify.deliveryGroups.value` - Delivery options
- `shopify.shippingOption.value` - Selected shipping method

### Payment Data
- `shopify.paymentOption.value` - Selected payment method

## ⚙️ Configuration

### shopify.extension.toml
```toml
api_version = "2025-10"

[[extensions]]
name = "your-extension"
type = "ui_extension"

[[extensions.targeting]]
module = "./src/Checkout.jsx"
target = "purchase.checkout.block.render"

[extensions.capabilities]
api_access = true
```

### package.json (extension folder)
```json
{
  "dependencies": {
    "preact": "^10.10.x",
    "@shopify/ui-extensions": "2025.10.x"
  }
}
```

## 🐛 Common Mistakes

❌ **Wrong**: Using `/checkout` import
```jsx
import '@shopify/ui-extensions/checkout'; // OLD API
```

✅ **Correct**: Using `/preact` import
```jsx
import '@shopify/ui-extensions/preact'; // 2025-10 API
```

---

❌ **Wrong**: Using vanilla JS API
```jsx
export default (root) => {
  root.createComponent('Banner', {...});
};
```

✅ **Correct**: Using Preact render
```jsx
export default async () => {
  render(<Extension />, document.body);
};
```

---

❌ **Wrong**: Banner with title prop
```jsx
<s-banner title="Title" tone="critical">Message</s-banner>
```

✅ **Correct**: Banner with heading child
```jsx
<s-banner tone="critical">
  <s-heading>Title</s-heading>
  <s-text>Message</s-text>
</s-banner>
```

## 🚀 Testing

1. Start dev server: `npm run dev`
2. Open checkout editor in admin
3. Drag extension from sidebar into layout
4. Save and preview

## 📚 Documentation Links

- [Checkout UI Extensions](https://shopify.dev/docs/api/checkout-ui-extensions)
- [Polaris Components](https://shopify.dev/docs/api/checkout-ui-extensions/latest/polaris-web-components)
- [Extension APIs](https://shopify.dev/docs/api/checkout-ui-extensions/apis)
- [Preact Guide](https://preactjs.com/guide/v10/getting-started)
