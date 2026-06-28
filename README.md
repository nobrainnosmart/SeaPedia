# SEAPEDIA

Multi-role e-commerce platform featuring Buyers, Sellers, Drivers, and Admins.

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev
# API: http://localhost:4000
# Docs: http://localhost:4000/api/docs
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# App: http://localhost:3000
```

## Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@seapedia.com | Admin123! | Full admin access |
| Seller | seller1@seapedia.com | Seller123! | Has store + products |
| Buyer | buyer1@seapedia.com | Buyer123! | Rp 5.000.000 balance |
| Driver | driver1@seapedia.com | Driver123! | Ready to take jobs |
| Multi-Role | multi@seapedia.com | Multi123! | Buyer+Seller+Driver |

## Business Rules

### Single-Store Checkout
Cart can only contain products from ONE store. Adding product from different store returns HTTP 409.
The UI shows a confirmation dialog: "Kosongkan keranjang dari toko lain?"

### PPN 12% Calculation
- taxBase = subtotal - discountAmount + deliveryFee
- PPN = taxBase × 0.12
- finalTotal = taxBase + PPN

### Discount Rules
- Voucher: has expiry date + max usage count. Code: SAVE10, HEMAT20000
- Promo: has expiry date only, unlimited usage. Code: PROMO5
- Stacking: both can be used simultaneously. Voucher applied to subtotal first, promo applied to remaining.
- Neither can reduce total below delivery fee + PPN.

### Delivery Fees
| Method | Fee |
|--------|-----|
| Instant | Rp 25.000 |
| Next Day | Rp 15.000 |
| Regular | Rp 9.000 |

### Driver Earning Rule
driverEarning = order.deliveryFee
Credited when driver confirms job completion.

### Order Lifecycle
SEDANG_DIKEMAS → (Seller processes) → MENUNGGU_PENGIRIM → (Driver takes) → SEDANG_DIKIRIM → (Driver completes) → PESANAN_SELESAI
Any overdue order → DIKEMBALIKAN (auto-return with full refund)

### Overdue SLA
| Method | SLA Reference | Duration |
|--------|--------------|----------|
| INSTANT | From SEDANG_DIKIRIM | 2 hours |
| NEXT_DAY | From MENUNGGU_PENGIRIM | 24 hours |
| REGULAR | From MENUNGGU_PENGIRIM | 72 hours (3 days) |

Time simulation: Admin → POST /api/admin/time-simulation

## Security Notes
- **SQL Injection**: Prisma ORM used exclusively — all queries parameterized by default.
- **XSS**: sanitize-html strips all HTML tags from user inputs before DB storage. Frontend renders content as text nodes only.
- **Input Validation**: Zod schemas on every request body. Returns 400 with field-level errors.
- **Rate Limiting**: Auth routes: 30 req/15min. General: 100 req/min.
- **Security Headers**: helmet() middleware sets CSP, X-Frame-Options, etc.
- **Token Management**: JWT (7d expiry). Logout blacklists token server-side (in-memory Set).
- **RBAC**: Active role embedded in JWT, verified server-side on every protected endpoint. Frontend role checks are supplementary only.

## API Documentation
http://localhost:4000/api/docs

## End-to-End Testing Guide
1. Guest: browse http://localhost:3000/products — no checkout button visible
2. Register buyer → top up wallet → browse products → add to cart → checkout
3. Login as seller → Toko Saya → see pending order → Proses Pesanan
4. Login as driver → Cari Pekerjaan → Ambil Pekerjaan → Konfirmasi Selesai
5. Login as admin → Dashboard → Time Simulation → Maju 1 Hari (repeat to trigger SLA)
6. Security test: submit `<script>alert(1)</script>` in review → displays as text ✓