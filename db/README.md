# ERP Database Schema (Beginner-friendly Overview)

This document explains the tables and relationships defined in `db/schema_postgres.sql` for a minimal ERP system.

## Entities and Relationships

- Company 1—N Users, Customers, Suppliers, Warehouses, Product Categories, Products, Orders, Invoices, Payments.
- Users N—M Roles via `user_roles`.
- Customers have Sales Orders -> Invoices -> Payments.
- Suppliers have Purchase Orders -> Invoices -> Payments.
- Inventory moves IN on Purchase receipts and OUT on Sales shipments.

A simple relationship diagram (text):

Company
 ├─ Users ──┬─ user_roles ── Roles
 ├─ Customers ──┬─ Sales Orders ──┬─ Sales Order Lines
 │              │                 └─ Invoices (type=SALES) ──┬─ Invoice Lines
 │              │                                            └─ Payments (INCOMING) ── Payment Allocations
 ├─ Suppliers ──┬─ Purchase Orders ──┬─ Purchase Order Lines
 │              │                    └─ Invoices (type=PURCHASE) ──┬─ Invoice Lines
 │              │                                                  └─ Payments (OUTGOING) ── Payment Allocations
 ├─ Product Categories ──┬─ Products
 └─ Warehouses ──┬─ Inventory Movements ── v_inventory_on_hand (view)

## Table-by-table explanation

### 1) companies
- id: unique identifier.
- name, legal_name: display and registered names.
- tax_id: GSTIN/VAT/TIN.
- contact fields: email, phone, website.
- address fields: address_line1/2, city, state, postal_code, country.
- currency_code: default currency (e.g., INR, USD).
- created_at, updated_at: audit timestamps.

### 2) roles
- name: role key (e.g., admin, sales, purchase).
- description: human-friendly.

### 3) users
- company_id: which company the user belongs to.
- email: login identifier (unique per company).
- full_name: person's name.
- password_hash: hashed password.
- is_active: can login?
- last_login: last time they logged in.
- created_at, updated_at: audit.

### 4) user_roles (join)
- user_id, role_id: assignment of roles to users.

### 5) customers
- company_id: owning company.
- code: short unique code (per company) for reference.
- name: business or person name.
- contact: email, phone.
- tax_number: GSTIN/VAT.
- billing_... and shipping_...: addresses.
- credit_limit: allowed outstanding balance.
- notes: free text.
- created_at, updated_at: audit.

### 6) suppliers
- Similar to customers but for vendors you buy from.

### 7) product_categories
- name: category name.
- parent_id: optional parent for hierarchy (e.g., Electronics > Mobile).

### 8) products
- company_id: owning company.
- sku: unique item code.
- name, description: details.
- hsn_code: HSN/SAC for tax classification.
- category_id: optional category.
- unit: measure (PCS, KG, LTR etc.).
- cost_price: purchase/base cost.
- selling_price: default selling price.
- gst_rate: tax rate % for India (or VAT).
- is_active: can be sold/bought?
- created_at, updated_at: audit.

### 9) warehouses
- locations where stock is stored.
- code, name, address fields.

### 10) inventory_movements
- Records every stock movement.
- product_id, warehouse_id: what and where.
- qty: quantity moved (positive for IN, negative for OUT) and move_type.
- move_type: IN, OUT, ADJUST.
- source_kind, source_id, source_line_id: link to source doc (PO, SO, invoice) when applicable.
- occurred_at: when the movement happened.
- created_by, note: audit and notes.

View `v_inventory_on_hand`: sums movements to show current stock per product per warehouse.

### 11) sales_orders
- customer_id: who ordered.
- order_number: human reference (unique per company).
- status: DRAFT, CONFIRMED, SHIPPED, CANCELLED, CLOSED.
- order_date, expected_ship_date.
- currency_code, subtotal, discount_total, tax_total, grand_total: header-level totals.
- created_by, notes, timestamps.

### 12) sales_order_lines
- sales_order_id: parent order.
- line_no: line sequence.
- product_id, description, quantity, unit, unit_price, discount_percent, tax_percent, line_total.

### 13) purchase_orders
- supplier_id: vendor.
- po_number: unique per company.
- status: DRAFT, ORDERED, RECEIVED, CANCELLED, CLOSED.
- dates, currency, totals, notes.

### 14) purchase_order_lines
- purchase_order_id: parent PO.
- line_no, product_id, description, quantity, unit, unit_price, tax_percent, line_total.

### 15) invoices
- type: SALES or PURCHASE.
- customer_id OR supplier_id enforced by a CHECK constraint (depends on type).
- links back to sales_order_id or purchase_order_id when applicable.
- invoice_number: unique per company per type.
- status: DRAFT, ISSUED, PARTIAL, PAID, CANCELLED.
- invoice_date, due_date, currency, totals, notes, audit.

### 16) invoice_lines
- invoice_id: parent invoice.
- line_no, product_id (optional for service lines), description, quantity, unit, unit_price, tax_percent, line_total.

### 17) payments
- type: INCOMING (from customers) or OUTGOING (to suppliers).
- method: CASH, BANK_TRANSFER, CARD, CHEQUE, UPI, OTHER.
- customer_id OR supplier_id enforced by CHECK.
- payment_ref: bank/cheque/UPI reference.
- amount, currency_code, paid_at, notes, audit.

### 18) payment_allocations
- Links a payment to one or more invoices with an amount applied.
- Ensures you can split a single payment across multiple invoices.

## Key relationships summary
- users.company_id → companies.id
- user_roles.user_id → users.id, user_roles.role_id → roles.id
- customers.company_id → companies.id
- suppliers.company_id → companies.id
- products.company_id → companies.id, products.category_id → product_categories.id
- warehouses.company_id → companies.id
- inventory_movements.product_id → products.id, .warehouse_id → warehouses.id
- sales_orders.customer_id → customers.id
- sales_order_lines.sales_order_id → sales_orders.id, .product_id → products.id
- purchase_orders.supplier_id → suppliers.id
- purchase_order_lines.purchase_order_id → purchase_orders.id, .product_id → products.id
- invoices.customer_id/supplier_id → customers/suppliers, links to orders optional
- invoice_lines.invoice_id → invoices.id
- payments.customer_id/supplier_id → customers/suppliers
- payment_allocations.payment_id → payments.id, .invoice_id → invoices.id

## Tips for beginners
- Start with `companies`, then `users` and `roles`.
- Load `product_categories`, `products`, and `warehouses`.
- Add `customers` and `suppliers`.
- Use POs to bring stock IN (inventory_movements IN), SOs to ship stock OUT.
- Create invoices from orders; record payments; allocate payments to invoices.
- Use view `v_inventory_on_hand` to check stock levels.

## Applying the schema
Run this in psql as a superuser or a role with DDL privileges:

```sql
\i db/schema_postgres.sql
```

Optionally enable trigram extension for name search indexes:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
