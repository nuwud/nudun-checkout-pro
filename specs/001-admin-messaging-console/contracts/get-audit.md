# Contract: GET /app/api/messaging-settings/audit

## Description
Returns paginated audit trail of configuration changes for the authenticated shop. Surface in admin console for transparency and export.

## Authentication
- Requires `authenticate.admin()` session check.

## Request
```
GET /app/api/messaging-settings/audit?page=1&pageSize=10
Accept: application/json
```

### Query Parameters
- `page` (optional, default `1`) – 1-based page index.
- `pageSize` (optional, default `10`, max `20`).

## Success Response (200)
```json
{
  "items": [
    {
      "id": 45,
      "actor": {
        "shopDomain": "nudun-dev-store.myshopify.com",
        "email": "merchant@example.com"
      },
      "action": "UPDATE",
      "summary": "Updated free shipping threshold",
      "diff": {
        "thresholds": {
          "[id=12]": {
            "amount": { "before": "50.00", "after": "75.00" }
          }
        }
      },
      "createdAt": "2025-10-19T16:43:02.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 2,
    "totalCount": 12
  }
}
```

## Error Responses
- `401 Unauthorized` – session invalid.
- `500 Internal Server Error` – unexpected failure.

## Notes
- `diff` stored as JSON; keep payload ≤5 KB by storing only changed fields. UI may render summary string plus expandable JSON viewer.
- API should support CSV export via `Accept: text/csv`; if requested, return CSV stream with same filters (documented separately if needed).
