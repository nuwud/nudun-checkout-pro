# Contract: POST /app/api/messaging-settings/reset

## Description
Restores messaging configuration to platform defaults. Deletes thresholds and upsell records, repopulates with baseline template, and logs audit entry.

## Authentication
- Requires `authenticate.admin()` session check.

## Request
```
POST /app/api/messaging-settings/reset
Content-Type: application/json
Accept: application/json
```

### Body
```json
{
  "reason": "string optional (<=255 characters)"
}
```

## Success Response (200)
```json
{
  "status": "ok",
  "message": "Configuration restored to defaults",
  "lastPublishedAt": "2025-10-19T18:05:44.000Z"
}
```

## Error Responses
- `400 Bad Request` – already at defaults; include `errorCode: "ALREADY_DEFAULT"`.
- `401 Unauthorized` – session invalid.
- `500 Internal Server Error` – unexpected failure.

## Notes
- Defaults loaded from static JSON asset within repo (`app/data/default-messaging.json`).
- Audit log entry includes actor, reason (if provided), and prior snapshot diff.
- Endpoint should throttle to prevent accidental repeated resets.
