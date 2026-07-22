// ============================================================
// Navbar.jsx — Top bar for the POS / billing screen
// ============================================================
// Shows: app branding, current bill number, date, and the
// logged-in user's name + role pulled from localStorage.
// Previously this hardcoded "Admin" — now reads the real user.
// ============================================================

import { FaCashRegister, FaUserCircle, FaCalendarAlt } from "react-icons/fa";

function Navbar({ billNo }) {
  // Read logged-in user from localStorage — set during login
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const displayName = user?.username || user?.email || "User";
  const displayRole = user?.role || "";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 h-16">

        {/* Left — branding */}
        <div className="flex items-center gap-3">
          <FaCashRegister className="text-blue-600 text-2xl" />
          <h1 className="text-xl font-bold text-blue-700">Super Canteen POS</h1>
        </div>

        {/* Right — date, bill no, user */}
        <div className="flex items-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-slate-400" />
            <span>{today}</span>
          </div>

          {billNo && (
            <div className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Bill #{billNo}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-400">{displayRole}</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;