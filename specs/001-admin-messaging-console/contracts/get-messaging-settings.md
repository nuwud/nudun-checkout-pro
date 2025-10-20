# Contract: GET /app/api/messaging-settings

## Description
Returns the published messaging configuration for the authenticated shop. Used by admin console loader and checkout extension fetcher.

## Authentication
- Requires Shopify session via `authenticate.admin()` (admin console)
- Checkout extension uses signed fetch through app proxy (session token injected by Shopify runtime)

## Request
```
GET /app/api/messaging-settings
Accept: application/json
```

### Query Parameters
- `preview` (optional, boolean) – when `true`, include unpublished draft values. Defaults to `false`.

## Success Response (200)
```json
{
  "shopDomain": "nudun-dev-store.myshopify.com",
  "currencyCode": "USD",
  "hero": {
    "headline": "Unlock free shipping",
    "body": "Spend {amount} more to activate complimentary shipping.",
    "tone": "info"
  },
  "thresholds": [
    {
      "id": 12,
      "amount": "75.00",
      "tone": "success",
      "message": {
        "en": "You're eligible for free shipping!",
        "fr": "Vous profitez de la livraison gratuite !"
      },
      "priority": 0,
      "isActive": true
    }
  ],
  "upsell": {
    "isEnabled": true,
    "title": {
      "en": "Add a mystery gift for $10",
      "fr": "Ajoutez un cadeau mystère pour 10 $"
    },
    "body": {
      "en": "Customers love surprises—add one now!",
      "fr": "Les clients adorent les surprises—ajoutez-en une maintenant !"
    },
    "targetProduct": "gid://shopify/Product/1234567890"
  },
  "lastPublishedAt": "2025-10-18T21:07:11.000Z"
}
```

## Error Responses
- `401 Unauthorized` – session invalid; redirect to auth.
- `404 Not Found` – configuration missing (likely new install). Caller should fall back to defaults.
- `500 Internal Server Error` – unexpected failure (log and surface toast in admin).

## Notes
- Amount values returned as strings to avoid floating point issues.
- Localized strings returned as key map; admin UI decides which locale to display.
- When `preview=true`, include both published and draft fields in payload under `draftConfig` for console use.
