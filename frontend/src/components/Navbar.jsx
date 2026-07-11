import { useState } from "react";
import {
  FaCashRegister,
  FaUserCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { previewBill } from "../services/ProductApi";


function Navbar() {
  const [activeTab, setActiveTab] = useState("Billing");

  const today = new Date().toLocaleDateString("en-IN");

  

  return (
    <header className="bg-white shadow-sm border-b">

      <div className="flex items-center justify-between px-6 h-16">

        {/* Left */}

        <div className="flex items-center gap-8">

          <div className="flex items-center gap-3">

            <FaCashRegister className="text-blue-600 text-2xl" />

            <h1 className="text-2xl font-bold text-blue-700">
              Super Canteen POS
            </h1>

          </div>

          {/* Tabs */}

          <div className="flex gap-2">

            <button
              onClick={() => setActiveTab("Billing")}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab === "Billing"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Billing
            </button>

            <button
              onClick={() => setActiveTab("Returns")}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                activeTab === "Returns"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Returns
            </button>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-8 text-gray-700">

          <div className="flex items-center gap-2">

            <FaCalendarAlt />

            <span>{today}</span>

          </div>

          <div>

            <span className="font-semibold">
              {previewBill?.billNumber || previewBill?.billNo || "N/A"}
            </span>

          </div>

          <div className="flex items-center gap-2">

            <FaUserCircle className="text-2xl text-blue-600" />

            <span>Admin</span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;