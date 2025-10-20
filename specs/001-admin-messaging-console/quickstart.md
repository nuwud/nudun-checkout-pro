# Quickstart: Admin Messaging Console

_Last updated: 2025-10-19_

This guide helps merchants configure checkout messaging once the console ships.

## Prerequisites
- App installed on the Shopify store with required scopes.
- Staff account with permission to manage apps.
- Dynamic Messaging extension already placed in checkout editor.

## Steps
1. **Open the app**: From Shopify Admin, go to Apps → NUDUN Checkout Pro.
2. **Navigate to Messaging Console**: Click the new "Messaging" section in the left navigation.
3. **Adjust global copy**:
   - Update the hero headline and body text (supports placeholders like `{amount}` and `{country}`).
   - Choose default tone (`info`, `success`, `warning`, `critical`).
4. **Manage thresholds**:
   - Use "Add threshold" button to create spending tiers. Enter amount, tone, and message copy.
   - Drag rows to reorder priority (higher priority shows first in checkout).
   - Toggle visibility with the Active switch.
5. **Configure upsell**:
   - Enable upsell messaging and edit title/body fields.
   - (Optional) Specify target product or discount code reference for internal tracking.
6. **Preview**:
   - Use the preview pane to load checkout sandbox with sample cart values.
   - Switch between preset scenarios (cart totals, locales) using the preview controls.
7. **Save & publish**:
   - Click Save. A success toast confirms new settings are live within ~1 minute.
   - Checkout extension automatically fetches updated config on next render.
8. **Review audit log**:
   - Scroll to "Recent changes" to see who updated what. Export CSV for records if needed.
9. **Reset to defaults** (optional):
   - Use Reset button to revert to default copy/thresholds. Confirm in modal; action is logged.

## Best Practices
- Keep threshold copy concise (≤120 characters) to avoid checkout overflow.
- Provide both `en` and `fr` translations for every message to ensure bilingual compliance.
- Test on mobile preview to validate layout.
- Avoid referencing personal data or restricted discount codes in messaging copy.

## Troubleshooting
- **Messages not updating**: Confirm Save was successful, then refresh checkout preview (cache up to 60s). Check audit log for recent changes.
- **Validation errors**: Inline messages highlight missing fields or invalid amounts; fix and retry.
- **Preview blank**: Ensure checkout extension still installed; use "Reload preview" button.
- **Reset failed**: Verify you have required permissions; contact support if issue persists.
