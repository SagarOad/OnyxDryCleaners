# Multi-tenant rollout checklist

## 1) Pre-migration safety
- Take a full production DB backup.
- Verify restore in a staging environment.
- Set `SUPERADMIN_USERNAME` and `SUPERADMIN_PASSWORD` env vars for bootstrap.

## 2) Apply schema changes
- Run Prisma migration for the updated `schema.prisma`.
- Run:
  - `npm run mt:bootstrap`
  - `npm run mt:validate`

## 3) Validation queries
- Ensure no legacy null tenant rows remain:
  - `Customer.businessId`
  - `Order.businessId`
  - `OrderItem.businessId`
  - `Product.businessId`
  - `ExistingCustomers.businessId`
  - `OutsourcingCompany.businessId`
- Ensure business-scoped uniqueness is healthy:
  - `(businessId, name)` for customers and existing customers
  - `(businessId, value)` for products

## 4) Smoke tests (2 tenants minimum)
- Login as superadmin and create a new business with owner credentials.
- Login as business owner A and create products/customers/orders.
- Login as business owner B and verify A data is not visible.
- Verify dashboard, orders, finance, and ledger all show only tenant data.
- Verify subscription status updates from superadmin.

## 5) Cutover hardening (recommended)
- Once data is clean, make tenant columns required in a follow-up migration.
- Remove legacy `Admin` fallback login after all users are in `BusinessUser`.
- Add API-level audit logging for superadmin actions.

