import {
  FaCashRegister,
  FaBox,
  FaFileInvoice,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white">

      <div className="text-2xl font-bold p-6 border-b">
        Super POS
      </div>

      <NavLink
        to="/pos"
        className="flex items-center gap-3 p-5 hover:bg-slate-800"
      >
        <FaCashRegister />
        POS
      </NavLink>

      <NavLink
        to="/products"
        className="flex items-center gap-3 p-5 hover:bg-slate-800"
      >
        <FaBox />
        Products
      </NavLink>

      <NavLink
        to="/bills"
        className="flex items-center gap-3 p-5 hover:bg-slate-800"
      >
        <FaFileInvoice />
        Bills
      </NavLink>

    </div>
  );
}

export default Sidebar;