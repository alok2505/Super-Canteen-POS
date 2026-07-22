// ============================================================
// App.jsx — Root application with routing and role-based guards
// ============================================================
// Three roles exist in this system:
//   • Admin          — manages franchises, products, users system-wide
//   • StoreManager   — manages one franchise: inventory, staff, billing
//   • InventoryStaff — daily billing only: POS, bills, hold bills
//
// Route guards are applied here at the React Router level so that
// users who navigate directly to a URL they don't have access to
// are redirected rather than seeing an empty or broken page.
// The backend ALSO enforces these same rules via requireRole() —
// so even if someone bypasses the frontend, the API returns 403.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import POS from "./pages/POS";
import Bills from "./pages/Bills";
import Products from "./pages/Products";
import BillDetails from "./pages/BillDetails";
import HoldBills from "./pages/HoldBills";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Franchises from "./pages/Franchises";
import Staff from "./pages/Staff";
import Catalog from "./pages/Catalog";

// Helper: reads role from localStorage
const getRole = () => JSON.parse(localStorage.getItem("user") || "null")?.role;

// ------------------------------------------------------------
// ProtectedRoute
// ------------------------------------------------------------
// Checks for a JWT in localStorage. If missing, redirects to /login.
// Every page inside the app is wrapped in this — no unauthenticated
// user can see any screen beyond the login page.
// ------------------------------------------------------------
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


// ------------------------------------------------------------
// AdminRoute
// ------------------------------------------------------------
// Restricts access to Admin-only pages: /franchises, /products (full view).
// Non-admins are redirected to their home page.
// ------------------------------------------------------------
const AdminRoute = ({ children }) => {
  const role = getRole();
  return role === "Admin" ? children : <Navigate to="/pos" replace />;
};

// ------------------------------------------------------------
// StoreManagerRoute
// ------------------------------------------------------------
// Restricts access to StoreManager-only pages: /staff, /catalog.
// Other roles are redirected to their home page.
// ------------------------------------------------------------
const StoreManagerRoute = ({ children }) => {
  const role = getRole();
  return role === "StoreManager" ? children : <Navigate to="/pos" replace />;
};

// ------------------------------------------------------------
// BillingRoute
// ------------------------------------------------------------
// Restricts billing pages to StoreManager and InventoryStaff ONLY.
//   /pos, /bills, /bills/:id, /hold-bills
// Admin is intentionally excluded — Admin manages the business, not the counter.
// Non-billing users (including Admin) are redirected to /franchises or /products.
// ------------------------------------------------------------
const BillingRoute = ({ children }) => {
  const role = getRole();
  const billingRoles = ["StoreManager", "InventoryStaff"];
  return billingRoles.includes(role) ? children : <Navigate to="/franchises" replace />;
};

// ------------------------------------------------------------
// RoleDefaultRedirect
// ------------------------------------------------------------
// Sends each role to their correct home page after login.
//   Admin          → /franchises  (their management hub)
//   StoreManager   → /pos         (billing is their main work)
//   InventoryStaff → /pos
// ------------------------------------------------------------
const RoleDefaultRedirect = () => {
  const role = getRole();
  if (role === "Admin") return <Navigate to="/franchises" replace />;
  return <Navigate to="/pos" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Default redirect — role-aware: Admin→/franchises, others→/pos */}
            <Route path="/" element={<RoleDefaultRedirect />} />

            {/* POS — Billing screen (StoreManager + InventoryStaff only) */}
            <Route path="/pos" element={<BillingRoute><POS /></BillingRoute>} />

            {/* Products — Master catalogue (Admin sees all, StoreManager browses) */}
            <Route path="/products" element={<Products />} />

            {/* Bills — View / print completed bills (StoreManager + Staff) */}
            <Route path="/bills" element={<BillingRoute><Bills /></BillingRoute>} />

            {/* Bill Details — Full receipt view for a single bill */}
            <Route path="/bills/:id" element={<BillingRoute><BillDetails /></BillingRoute>} />

            {/* Hold Bills — Paused orders to resume later (StoreManager + Staff) */}
            <Route path="/hold-bills" element={<BillingRoute><HoldBills /></BillingRoute>} />

            {/* Franchises — Admin only: create, manage, toggle, assign managers */}
            <Route path="/franchises" element={<AdminRoute><Franchises /></AdminRoute>} />

            {/* Staff — Manage InventoryStaff for own franchise (StoreManager only) */}
            <Route path="/staff" element={<StoreManagerRoute><Staff /></StoreManagerRoute>} />

            {/* Catalog — Browse master products (StoreManager only) */}
            <Route path="/catalog" element={<StoreManagerRoute><Catalog /></StoreManagerRoute>} />
          </Route>

          {/* Public Auth Routes — accessible without a token */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
