import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaMoneyBillWave, FaShoppingBag, FaBoxes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getHoldBills, deleteHoldBill } from "../services/holdBillApi";

function HoldBills() {
  const [holdBills, setHoldBills] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadHoldBills = async () => {
    try {
      const res = await getHoldBills();
      setHoldBills(Array.isArray(res.data.holdBills) ? res.data.holdBills : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadHoldBills();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Hold Bill?")) return;

    try {
      await deleteHoldBill(id);
      loadHoldBills();
    } catch (err) {
      console.log(err);
    }
  };

  const handleResume = (bill) => {
    navigate("/pos", { state: { resumeHoldBill: bill } });
  };

  const filteredBills = holdBills.filter((bill) =>
    (bill.customerName || "Walk-in").toLowerCase().includes(search.toLowerCase())
  );

  const totalBills = filteredBills.length;
  const totalAmount = useMemo(() => filteredBills.reduce((sum, bill) => sum + (bill.netAmount || 0), 0), [filteredBills]);
  const totalQuantity = useMemo(() => filteredBills.reduce((sum, bill) => sum + (bill.totalQuantity || 0), 0), [filteredBills]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold">Hold Bills</h1>
        <p className="mt-2 text-blue-100 text-lg">Resume customer orders that were kept on hold.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Hold Bills</p>
            <h2 className="text-4xl font-bold text-blue-600 mt-2">{totalBills}</h2>
          </div>
          <div className="bg-blue-100 p-5 rounded-full"><FaShoppingBag className="text-blue-600" size={28} /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Hold Amount</p>
            <h2 className="text-4xl font-bold text-green-600 mt-2">₹ {totalAmount}</h2>
          </div>
          <div className="bg-green-100 p-5 rounded-full"><FaMoneyBillWave className="text-green-600" size={28} /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Quantity</p>
            <h2 className="text-4xl font-bold text-purple-600 mt-2">{totalQuantity}</h2>
          </div>
          <div className="bg-purple-100 p-5 rounded-full"><FaBoxes className="text-purple-600" size={28} /></div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg mt-8 p-5">
        <div className="flex items-center gap-4">
          <FaSearch className="text-gray-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Customer Name..."
            className="flex-1 outline-none text-lg"
          />
        </div>
      </div>

      {/* Hold Bills */}
      {filteredBills.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-16 text-center">
          <h2 className="text-3xl font-bold text-gray-400">No Hold Bills Found</h2>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {filteredBills.map((bill) => (
            <div key={bill._id} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col font-mono text-sm">
              <div className="p-5 flex-1 space-y-4">
                
                {/* Header */}
                <div className="flex justify-between font-bold text-slate-800 pb-2 border-b border-dashed border-slate-300">
                  <span>{bill.billNo || bill._id.slice(-8).toUpperCase()}</span>
                  <span>{bill.status || "HOLD"}</span>
                </div>

                {/* Customer Details */}
                <div className="text-slate-600 space-y-1">
                  <div className="grid grid-cols-[100px_1fr]"><span>Customer</span><span>: {bill.customerName || "Walk-in"}</span></div>
                  {bill.customerMobile && (
                    <div className="grid grid-cols-[100px_1fr]"><span>Mobile</span><span>: {bill.customerMobile}</span></div>
                  )}
                </div>

                {/* Items Summary */}
                <div className="text-slate-600 space-y-1">
                  <div className="grid grid-cols-[100px_1fr]"><span>Items</span><span>: {bill.totalItems || bill.items?.length || 0}</span></div>
                  <div className="grid grid-cols-[100px_1fr]"><span>Quantity</span><span>: {bill.totalQuantity || bill.items?.reduce((a, b) => a + b.quantity, 0) || 0}</span></div>
                </div>

                {/* Products List */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Products</h3>
                  <ul className="text-slate-600 space-y-1 pl-2">
                    {bill.items?.map((item, idx) => (
                      <li key={idx}>• {item.name} <span className="font-bold ml-1">×{item.quantity}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Financials */}
                <div className="border-t border-dashed border-slate-300 pt-3 text-slate-600 space-y-1">
                  <div className="flex justify-between"><span>Gross Amount</span><span>₹{bill.grossAmount?.toFixed(2) || "0.00"}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>₹{((bill.discount || 0) + (bill.couponDiscount || 0)).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>GST</span><span>₹{bill.gst?.toFixed(2) || "0.00"}</span></div>
                  <div className="flex justify-between font-bold text-slate-800 mt-1"><span>Net Amount</span><span>₹{bill.netAmount?.toFixed(2) || "0.00"}</span></div>
                </div>

                {/* Payment Info */}
                <div className="border-t border-dashed border-slate-300 pt-3 text-slate-600 space-y-1">
                  <div className="flex justify-between"><span>Payment Mode</span><span>{bill.paymentMode || "Cash"}</span></div>
                  <div className="flex justify-between"><span>Paid</span><span>₹{bill.customerPaid?.toFixed(2) || "0.00"}</span></div>
                  <div className="flex justify-between"><span>Remaining</span><span>₹{((bill.netAmount || 0) - (bill.customerPaid || 0) > 0 ? (bill.netAmount || 0) - (bill.customerPaid || 0) : 0).toFixed(2)}</span></div>
                </div>
                
                <div className="border-t border-dashed border-slate-300 pt-3 text-slate-500 text-xs text-center">
                  Created {new Date(bill.createdAt).toLocaleDateString()} {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => handleResume(bill)}
                  className="py-3 text-blue-600 font-bold hover:bg-blue-50 transition"
                >
                  Resume
                </button>
                <button
                  onClick={() => handleDelete(bill._id)}
                  className="py-3 text-red-600 font-bold hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HoldBills;