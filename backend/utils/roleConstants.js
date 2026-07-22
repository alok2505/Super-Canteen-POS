// ============================================================
// roleConstants.js — Single source of truth for all role names
// ============================================================
// Why this file exists:
//   Spelling "StoreManager" wrong in a requireRole() call would silently
//   block everyone. By importing constants, a typo becomes a JS error.
//
// Permission philosophy (multi-franchise POS):
//   • Admin        = Business owner — manages structure, not operations
//   • StoreManager = Branch manager — runs one franchise end-to-end
//   • InventoryStaff = Cashier/operator — billing only at the counter
// ============================================================

// Admin — business management: franchises, master products, users, reports
// Admin is NOT a cashier and does NOT perform billing operations
const ADMIN = "Admin";

// StoreManager — manages exactly one franchise:
//   inventory (receive/update/locate), staff, billing, reports for own branch
const STORE_MANAGER = "StoreManager";

// InventoryStaff — daily billing operator inside one franchise:
//   POS, scan, create/hold/resume bills, process payments — NO inventory writes
const INVENTORY_STAFF = "InventoryStaff";

// PackingStaff — packing operations (future use)
const PACKING_STAFF = "PackingStaff";

// ---------------------------------------------------------------
// Grouped role sets — pass these arrays directly to requireRole()
// ---------------------------------------------------------------

// BILLING_ROLES — who is allowed to create, hold, resume, and print bills
// Admin is intentionally excluded: Admin manages the business, not the counter.
// If Admin needs to bill for testing/emergency, use the "Act as Franchise" feature.
const BILLING_ROLES = [STORE_MANAGER, INVENTORY_STAFF];

// INVENTORY_WRITE_ROLES — who can receive batches, update stock, move locations
// StoreManager is the primary inventory operator for their franchise.
// Admin can also perform inventory operations (optional / emergency override).
const INVENTORY_WRITE_ROLES = [ADMIN, STORE_MANAGER];

// INVENTORY_VIEW_ROLES — who can VIEW inventory (read-only)
// Admin monitors inventory across ALL franchises for reporting.
// StoreManager and InventoryStaff view inventory within their own franchise.
const INVENTORY_VIEW_ROLES = [ADMIN, STORE_MANAGER, INVENTORY_STAFF];

// ADMIN_AND_MANAGER — useful for user-management and reporting routes where
// both Admin (globally) and StoreManager (within their franchise) have access
const ADMIN_AND_MANAGER = [ADMIN, STORE_MANAGER];

// ADMIN_ONLY — routes that only the superuser can access
// (franchise CRUD, master products, assign users, system settings)
const ADMIN_ONLY = [ADMIN];

// MANAGER_ONLY — routes that only a StoreManager can access
// (staff management for their own franchise)
const MANAGER_ONLY = [STORE_MANAGER];

// ALL_ROLES — routes accessible by any authenticated user
// (e.g. product search — Admin needs it for catalogue, staff needs it for POS)
const ALL_ROLES = [ADMIN, STORE_MANAGER, INVENTORY_STAFF];

module.exports = {
  ADMIN,
  STORE_MANAGER,
  INVENTORY_STAFF,
  PACKING_STAFF,
  BILLING_ROLES,
  INVENTORY_WRITE_ROLES,
  INVENTORY_VIEW_ROLES,
  ADMIN_AND_MANAGER,
  ADMIN_ONLY,
  MANAGER_ONLY,
  ALL_ROLES,
};
