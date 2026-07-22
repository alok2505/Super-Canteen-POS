// ============================================================
// Sidebar.jsx — Role-aware navigation sidebar
// ============================================================
// What each role sees:
//   Admin          → Franchises (home), Products
//   StoreManager   → POS, Bills, Hold Bills, Catalog, My Staff
//   InventoryStaff → POS, Bills, Hold Bills  (billing only)
// ============================================================

import { useState } from "react";
import {
  FaBars,
  FaCashRegister,
  FaBox,
  FaFileInvoice,
  FaTimes,
  FaStore,
  FaUsers,
  FaList,
  FaSignOutAlt,
  FaUserCircle,
  FaChartBar,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();

  // Read the stored user object to determine which role is active
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Derive boolean flags so nav conditions read like plain English below
  const isAdmin = user?.role === "Admin";
  const isStoreManager = user?.role === "StoreManager";

  // InventoryStaff — daily billing operator (cashier at the counter)
  const isInventoryStaff = user?.role === "InventoryStaff";

  // isBillingUser — true for StoreManager and InventoryStaff
  // Used to show POS / Bills / Hold Bills links
  // Admin is intentionally excluded: Admin manages the business, not the counter
  const isBillingUser = isStoreManager || isInventoryStaff;

  // ------------------------------------------------------------
  // handleLogout
  // ------------------------------------------------------------
  // Clears the stored token and user data then redirects to /login.
  // Called when the user clicks the "Logout" button at the bottom.
  // ------------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Base Tailwind classes shared by all navigation links
  // Active state uses indigo-600 to visually highlight the current page
  const baseLinkClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-slate-800";
  const activeLinkClass = `${baseLinkClass} bg-indigo-600`;

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-800 bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        {!collapsed && <span className="text-lg font-bold">Super POS</span>}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-3">

        {/* POS — for StoreManager and InventoryStaff only
            Admin manages the business and does not work the counter */}
        {isBillingUser && (
          <NavLink
            to="/pos"
            className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}
          >
            <FaCashRegister className="shrink-0" />
            {!collapsed && <span>POS</span>}
          </NavLink>
        )}

        {/* Bills — for StoreManager and InventoryStaff */}
        {isBillingUser && (
          <NavLink
            to="/bills"
            className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}
          >
            <FaFileInvoice className="shrink-0" />
            {!collapsed && <span>Bills</span>}
          </NavLink>
        )}

        {/* Hold Bills — for StoreManager and InventoryStaff */}
        {isBillingUser && (
          <NavLink to="/hold-bills"
            className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}>
              <FaFileInvoice className="shrink-0" />
              {!collapsed && <span>Hold Bills</span>}
          </NavLink>
        )}

        {/* Franchises — Admin only: main management hub */}
        {isAdmin && (
          <NavLink to="/franchises"
            className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}>
              <FaStore className="shrink-0" />
              {!collapsed && <span>Franchises</span>}
          </NavLink>
        )}

        {/* Products — Admin sees master catalogue; StoreManager sees their inventory */}
        {!isInventoryStaff && (
          <NavLink
            to="/products"
            className={({ isActive }) => isActive ? activeLinkClass : baseLinkClass}
          >
            <FaBox className="shrink-0" />
            {!collapsed && <span>Products</span>}
          </NavLink>
        )}

        {/* Product Catalog — StoreManager only
            StoreManagers browse the master catalogue to add products
            to their franchise's stock */}
        {isStoreManager && (
          <NavLink to="/catalog" className={({ isActive }) =>`${baseLinkClass} ${isActive ? "bg-indigo-600" : ""}`}>
            <FaList className="shrink-0" />
            {!collapsed && <span>Product Catalog</span>}
          </NavLink>
        )}

        {/* My Staff — StoreManager only
            StoreManagers create and manage InventoryStaff for their franchise */}
        {isStoreManager && (
          <NavLink to="/staff" className={({ isActive }) =>`${baseLinkClass} ${isActive ? "bg-indigo-600" : ""}`}>
            <FaUsers className="shrink-0" />
            {!collapsed && <span>My Staff</span>}
          </NavLink>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-800/60 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {user.username?.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.username}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`${baseLinkClass} w-full text-left text-red-400 hover:text-red-300`}
        >
          <FaSignOutAlt className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
