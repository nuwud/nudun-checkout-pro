# Contract: PUT /app/api/messaging-settings

## Description
Creates or updates messaging console settings for the authenticated shop. Validates payload with Zod schemas before persisting via Prisma.

## Authentication
- Requires `authenticate.admin()` session check.
- Only accessible from embedded admin; not exposed to checkout extension.

## Request
```
PUT /app/api/messaging-settings
Content-Type: application/json
Accept: application/json
```

### Body Schema
```json
{
  "hero": {
    "headline": "string (1-255)",
    "body": "string (1-2000)",
    "tone": "info|success|warning|critical"
  },
  "currencyCode": "ISO-4217",
  "thresholds": [
    {
      "id": "number|null",
      "amount": "string-decimal", // >=0, 2 decimal places
      "tone": "info|success|warning|critical",
      "priority": "integer 0-9",
      "isActive": "boolean",
      "message": {
        "en": "string <= 200",
        "fr": "string <= 200"
      }
    }
  ],
  "upsell": {
    "isEnabled": "boolean",
    "title": { "en": "string", "fr": "string" },
    "body": { "en": "string", "fr": "string" },
    "targetProduct": "gid://shopify/Product/..." | null,
    "discountCode": "string <= 32" | null
  }
}
```

## Success Response (200)
```json
{
  "status": "ok",
  "configId": 4,
  "lastPublishedAt": "2025-10-19T17:22:05.000Z"
}
```

## Error Responses
- `400 Bad Request` – validation failed; response contains `errors` array with field messages.
- `401 Unauthorized` – session expired.
- `409 Conflict` – optimistic concurrency failure (stale config). Response includes `currentVersion` hash.
- `500 Internal Server Error` – unexpected failure.

## Additional Notes
- Payload sanitized (strip HTML tags except allowed formatting, e.g., `<strong>`). Document allowed elements in UI.
- Service generates audit diff by comparing prior config snapshot vs new payload.
- Response includes updated `lastPublishedAt` so UI can display "Live" timestamp.
