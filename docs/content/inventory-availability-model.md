# Inventory and Availability Model

Phase 2 separates the farm's master catalog from current customer-facing
availability.

## Master Catalog

The master catalog is the long-lived record of mushrooms and products the farm
grows, sells, may sell, or wants to educate customers about. A catalog item can
exist without being cartable.

Current species codes in the master mushroom catalog:

- `BO`: Blue Oyster
- `GO`: Golden Oyster
- `PO`: Pink Oyster
- `WO`: White Oyster
- `EO`: Elm Oyster
- `KB`: King Blue
- `KT`: King Trumpet
- `LM`: Lion's Mane
- `PP`: Pioppino
- `CNT`: Chestnut
- `STK`: Shiitake
- `MTK`: Maitake
- `TT`: Turkey Tail
- `RSH`: Reishi
- `CDY`: Cordyceps
- `ENK`: Enoki

Species placeholders use conservative culinary or educational copy. Functional
mushroom species are flagged for legal/business review and must not make
disease-treatment claims.

## Current Availability

Current availability controls what the customer can buy, preorder, inquire
about, or learn about right now. The canonical state is stored as product
availability metadata and is mirrored into Medusa product, variant, and
inventory metadata during seed.

| State | Shop | Catalog/species | Cartable | Future notify-me | Customer action |
| --- | --- | --- | --- | --- | --- |
| `available` | Yes | Yes | Yes | No | Add to cart if fulfillment allows |
| `low-stock` | Yes | Yes | Yes | No | Add to cart with low-stock messaging |
| `sold-out` | Yes | Yes | No | Yes | Notify-me later |
| `coming-soon` | Yes | Yes | No | Yes | Join launch/availability updates |
| `seasonal` | Yes | Yes | Only if explicitly cartable | Yes | Harvest-dependent ordering or seasonal notification |
| `preorder` | Yes | Yes | Only with preorder fulfillment | Yes | Preorder coordination or preorder updates |
| `hidden` | No | No | No | No | Admin/internal only |
| `wholesale-only` | Yes | Yes | No | No | Restaurant/wholesale inquiry |
| `inquiry-only` | Yes | Yes | No | No | Contact/availability inquiry |

Default safety rule: newly added catalog items should default to
`coming-soon`, `hidden`, or another non-cartable state until the owner
explicitly marks them available or preorder-capable.

## Launch-Stock Workflow

For launch preparation, an admin should be able to:

1. Choose a product.
2. Set an availability state.
3. Set public visibility: `shop`, `catalog`, or `hidden`.
4. Set cartability deliberately.
5. Set available quantity or a stock note.
6. Add expected availability or return timing.
7. Add pickup/local-delivery notes.
8. Route wholesale-only or inquiry-only products away from ordinary checkout.
9. Rerun seed and verification before relying on Medusa Store API behavior.

Zero quantity blocks carting unless a future workflow explicitly models a safe
preorder. Coming-soon, sold-out, hidden, wholesale-only, and inquiry-only items
remain blocked from ordinary checkout.

## Admin Foundation

The initial admin surface is a development-only storefront route:

```text
http://localhost:3000/internal/availability
```

It is enabled only outside production unless
`MRMF_ENABLE_DEV_AVAILABILITY_ADMIN=false` disables it locally. It lists products
and species, then lets the running storefront process preview availability
overrides for:

- availability state;
- public visibility;
- cartability;
- available quantity;
- stock note;
- expected availability date;
- pickup or delivery note;
- wholesale-only or inquiry-only routing;
- short public availability message.

These overrides are process-local and are not a production persistence model.
They are a safe scaffold for owner review and a future authenticated Medusa
Admin extension or production-tracking integration.

## Future Production App Hooks

The availability model is intentionally shaped so a future production-tracking
system can send updates such as:

- harvest batch available;
- quantity updated;
- product sold out;
- expected return date changed;
- batch or lot metadata attached;
- COGS/profitability metadata prepared later.

The public website should consume only customer-safe availability fields. Batch,
COGS, operational notes, and sensitive production details should stay in the
internal system unless explicitly approved for customer display.

## Remaining Launch Blockers

- Final launch quantities and stock notes need owner confirmation.
- Final pickup windows and local-delivery rules need confirmation.
- Notify-me/back-in-stock storage now has a Postgres-backed Phase 3 foundation,
  but production email sending still needs provider, privacy, unsubscribe, and
  owner-approval work.
- The development admin scaffold needs authenticated persistence before
  production use.
- Legal/business review is still required for supplement and functional
  mushroom language.
