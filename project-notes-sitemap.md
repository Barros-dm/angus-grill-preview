# Angus Grill Web App - Project Notes and Sitemap

## Project Summary

Angus Grill Premium Meat is currently a Phase 1 web app preview for a premium butcher and Brazilian meat specialist in Canterbury.

The current build is a static web app prototype with product browsing, categories, product detail modal, cart, delivery/collection form, WhatsApp order submission, mobile layout refinements, and an admin preview page.

This phase is intentionally simple. It is not a full ecommerce platform and does not include card payments, customer accounts, live tracking, push notifications, or backend inventory automation.

## Current Sitemap

### Customer Web App

File:

`index.html`

Sections:

- Announcement bar
- Header with logo, category selector, search, call link, cart button
- Category navigation
- Hero section
- Trust strip
- Category carousel
- Product catalogue
- Product filters
- Product cards
- Product detail modal
- Kit churrasco feature section
- Customer reviews carousel
- How it works section
- Footer
- Cart drawer
- Checkout form
- Floating WhatsApp button

### Admin Preview

File:

`admin.html`

Sections:

- Admin header
- Admin overview
- Summary metrics
- Phase 1 / backend future / out-of-scope explanation
- Product management preview table
- WhatsApp order flow scope note

## Main Features Completed

- Premium dark Angus Grill visual direction
- New steak hero background
- Updated Angus Grill logo
- Product catalogue structure
- Category navigation
- One-row category carousel
- Product filtering by category
- Product search
- Product sorting
- Product detail modal
- Cart drawer
- Quantity controls
- Delivery or collection selection
- WhatsApp order message generation
- Floating WhatsApp CTA
- Mobile layout pass
- Admin preview page
- Admin scope clarification

## Product Images Added

The following product images were added and connected:

- Picanha Premium
- Contra-file
- Fraldinha
- Costela Bovina
- Linguica Toscana Premium
- Kit Churrasco Familia
- Kit Churrasco Premium

Some products still use placeholder imagery and should be replaced before final client presentation.

## WhatsApp Ordering Flow

The checkout form builds a WhatsApp message containing:

- Customer name
- Contact
- Delivery or collection choice
- Delivery address when applicable
- Preferred date
- Preferred time
- Products
- Quantities
- Subtotal
- Butcher notes

Current WhatsApp number:

`44 7923 832005`

WhatsApp URL format:

`https://wa.me/447923832005`

## Current Scope

Included in Phase 1:

- Static web app preview
- Product catalogue
- Cart
- WhatsApp ordering
- Admin preview concept
- Mobile responsive pass
- Premium visual styling

Not included in Phase 1:

- Online card payments
- Customer accounts
- Full backend
- Real admin saving
- Live order tracking
- Push notifications
- POS integration
- Accounting integration
- Automated stock control

## Suggested Next Steps

1. Confirm final product list, prices, units, and categories.
2. Replace remaining placeholder product images.
3. Test the WhatsApp order message with real sample orders.
4. Confirm delivery area, collection rules, minimum order, and opening hours.
5. Add simple policy pages if publishing publicly:
   - Privacy Policy
   - Terms
   - Delivery and Collection
   - Refund or Cancellation Policy
6. Compress large product images for faster loading.
7. Decide whether Phase 2 should be:
   - simple backend/admin,
   - hosted web app,
   - or mobile app for Apple and Google stores.

## Future App Direction

If approved, the next phase can become a simple mobile ordering app using one shared codebase for iOS and Android.

Recommended approach:

- React Native / Expo
- Reuse current product data structure
- Reuse cart and WhatsApp message logic
- Keep the first mobile app as catalogue + cart + WhatsApp order flow
- Avoid full ecommerce complexity unless the client specifically approves that scope

