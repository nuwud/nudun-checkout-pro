# Upsell Banner Debug Report

## Issues Identified

### 1. Banner Not Visible
**Root Cause**: `detectAllUpsells()` returns empty array because `findUpgradePlan()` has no plans to compare.

**Current Flow**:
```javascript
detectAllUpsells(lines, productData = {})
  → detectUpsellOpportunity(line, [])  // availablePlans is empty!
    → findUpgradePlan(currentFrequency, [])  // No plans to check
      → returns null
```

**Problem**: We're not passing available selling plans. The function expects external product data with all plans, but we only have the current plan from the line item.

### 2. No Product Images
**Issue**: Image extraction looks correct, but might be failing silently if Shopify structure is different.

**Current Code**:
```javascript
image: lineItem.merchandise?.image?.url || lineItem.image?.url || null
```

### 3. Prices Not Displaying
**Issue**: `getCurrentPrice()` returns cents, but `formatSavings()` divides by 100. This is correct, but might be getting 0 or undefined.

### 4. No Savings Calculations
**Issue**: Savings calculation depends on finding an upgrade plan. If no upgrade found, no savings calculated.

### 5. No Customizable Messages
**Issue**: Messages depend on having a valid upsell object. If upsell detection fails, no messages.

## Solution Approach

We have two options:

### Option A: Simplified Single-Product Detection (RECOMMENDED)
Don't try to compare multiple plans. Instead, detect based on the current plan's properties and make assumptions about upgrade availability.

**Pros**:
- Works without external data
- Simpler logic
- Less prone to API structure changes

**Cons**:
- Can't verify upgrade actually exists
- Savings estimates might be inaccurate

### Option B: Query Shopify API for Product Plans
Fetch all available plans for each product using the Shopify API.

**Pros**:
- Accurate plan comparison
- Real pricing data

**Cons**:
- Requires API calls (slower)
- Needs product ID mapping
- More complex implementation

## Recommended Fix: Option A

Simplify detection to work with just the current plan:

1. Detect if current plan is quarterly/monthly/bimonthly
2. Assume annual plan exists (most subscription products have this)
3. Estimate savings based on typical discount rates
4. Show banner with "Check if annual plan is available" message

This matches common Shopify subscription patterns and works without external data.
