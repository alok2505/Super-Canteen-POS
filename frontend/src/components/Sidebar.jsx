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
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = user?.role === "Admin";
  const isStoreManager = user?.role === "StoreManager";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const baseLinkClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-slate-800";

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
        {!isAdmin && <NavLink
          to="/pos"
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`
          }
        >
          <FaCashRegister className="shrink-0" />
          {!collapsed && <span>POS</span>}
        </NavLink>}

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`
          }
        >
          <FaBox className="shrink-0" />
          {!collapsed && <span>Products</span>}
        </NavLink>

        <NavLink
          to="/bills"
          className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`
          }
        >
          <FaFileInvoice className="shrink-0" />
          {!collapsed && <span>Bills</span>}
        </NavLink>

        <NavLink to="/hold-bills" className={({ isActive }) =>
            `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`
          }>
            <FaFileInvoice className="shrink-0" />
            {!collapsed && <span>Hold Bills</span>}
        </NavLink>

        {isAdmin && (
          <NavLink to="/franchises" className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`
            }>
              <FaStore className="shrink-0" />
              {!collapsed && <span>Franchises</span>}
          </NavLink>
        )}
        {isStoreManager && (
          <NavLink to="/catalog" className={({ isActive }) => `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`}>
            <FaList className="shrink-0" />
            {!collapsed && <span>Product Catalog</span>}
          </NavLink>
        )}
        {isStoreManager && (
          <NavLink to="/staff" className={({ isActive }) => `${baseLinkClass} ${isActive ? "bg-slate-800" : ""}`}>
            <FaUsers className="shrink-0" />
            {!collapsed && <span>My Staff</span>}
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-slate-800">
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
