import { useState, useEffect, useMemo } from 'preact/hooks';
import { detectSubscription } from './utils/subscriptionDetection';
import { getIncludedItemPrice } from './utils/includedItemLookup';

export const formatPrice = (amount, currencyCode) => {
  if (!amount || !currencyCode) return null;
  return `$${amount} ${currencyCode}`;
};

export const getMessageContent = (glassCount, interval, priceFormatted) => {
  const glassLabel = glassCount === 1 ? 'Glass' : 'Glasses';
  const heading = `��� ${glassCount} Premium ${glassLabel} Included`;
  
  let description = `Complimentary ${glassLabel.toLowerCase()} included with your ${interval} subscription`;
  
  if (priceFormatted) {
    description += ` • Value: ${priceFormatted}`;
  }
  
  return { heading, description };
};

export const GlasswareBanner = ({ glassCount, interval, priceFormatted }) => {
  const content = getMessageContent(glassCount, interval, priceFormatted);
  
  return (
    <s-banner tone="success">
      <s-heading>{content.heading}</s-heading>
      <s-text>{content.description}</s-text>
    </s-banner>
  );
};

export default function GlasswareMessage({
  productHandle = 'premium-glass',
  hideIfNoSubscription = true
} = {}) {
  const [glassPrice, setGlassPrice] = useState(null);
  
  const subscriptionLines = useMemo(() => {
    const lines = shopify?.lines?.value || [];
    return lines
      .map((line) => {
        if (!line || typeof line !== 'object') return null;
        const detection = detectSubscription(line);
        if (!detection.isSubscription) return null;
        return {
          ...detection,
          productTitle: line?.title || line?.merchandise?.title || line?.merchandise?.product?.title || 'Product'
        };
      })
      .filter(Boolean);
  }, []);
  
  const hasSubscriptions = subscriptionLines.length > 0;
  
  useEffect(() => {
    if (!hasSubscriptions) return;
    
    (async () => {
      try {
        const result = await getIncludedItemPrice(productHandle);
        if (result?.price) {
          setGlassPrice(result.price);
        }
      } catch (error) {
        console.error('Failed to fetch glass product price:', error);
      }
    })();
  }, [productHandle, hasSubscriptions]);
  
  if (!hasSubscriptions && hideIfNoSubscription) {
    return null;
  }
  
  if (!hasSubscriptions) {
    return null;
  }
  
  const priceFormatted = glassPrice ? formatPrice(glassPrice.amount, glassPrice.currencyCode) : null;
  
  return (
    <s-stack direction="block">
      {subscriptionLines.map((sub, idx) => (
        <GlasswareBanner
          key={idx}
          glassCount={sub.glassCount}
          interval={sub.interval}
          priceFormatted={priceFormatted}
        />
      ))}
    </s-stack>
  );
}

export const _internals = {
  formatPrice,
  getMessageContent,
  GlasswareBanner
};
