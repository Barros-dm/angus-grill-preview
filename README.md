# Angus Grill Premium Meat Web App Preview

Standalone Phase 1 web app preview for Angus Grill Premium Meat.

## Scope

This build follows `angus-grill-simple-app-scope-pricing.md`:

- Premium product catalogue
- Product categories, product listing and product detail modal
- Cart / order summary
- WhatsApp order finalisation
- Business, contact and location information
- Admin management preview for products, prices, categories, availability, featured products and offers
- No card payments, customer accounts, push notifications, delivery tracking or full ecommerce checkout in this phase

## Run locally

```bash
cd "/Users/juliobarros/Documents/Angus Grill"
python3 -m http.server 4173
```

Open:

- Customer app: `http://localhost:4173/`
- Admin preview: `http://localhost:4173/admin.html`

You can also open `index.html` directly in a browser.

## Update products

Product data lives in:

```text
assets/js/data.js
```

Replace images in:

```text
assets/images/
```

## WhatsApp flow

The checkout button generates a WhatsApp URL using `447923832005` and includes customer details, delivery/collection choice, date, time, products, quantities, subtotal and butcher notes.

## Future Phase 2

The approved next product phase is the simple mobile ordering app for Google Play and Apple App Store, positioned as:

```text
Simple Mobile Ordering App - from £6,500
```

Backend, real admin login, image upload, stock automation, payments, accounts, live order tracking and push notifications are later upgrades.
