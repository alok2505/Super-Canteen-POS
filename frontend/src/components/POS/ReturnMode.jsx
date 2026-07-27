import { useState, useRef, useEffect } from "react";
import { searchBill, processReturn } from "../../services/returnApi";
import { getBills } from "../../services/billApi";
import { FaSearch, FaBarcode, FaCheckCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";

function ReturnMode() {
  const [billNo, setBillNo] = useState("");
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [returnItems, setReturnItems] = useState({}); // { billItemId: qty }
  const [reason, setReason] = useState("Damaged");
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [success, setSuccess] = useState(null);
  const barcodeRef = useRef(null);

  const [recentBills, setRecentBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  useEffect(() => {
    loadRecentBills();
  }, []);

  const loadRecentBills = async () => {
    try {
      setLoadingBills(true);
      const res = await getBills();
      setRecentBills(res.data.bills || []);
    } catch (error) {
      console.error("Failed to load recent bills:", error);
    } finally {
      setLoadingBills(false);
    }
  };

  const handleSearch = async (searchBillNo) => {
    const query = typeof searchBillNo === 'string' ? searchBillNo : billNo;
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setBill(null);
    setReturnItems({});
    setSuccess(null);

    try {
      const res = await searchBill(query);
      setBill(res.data.bill);
      setBillNo(res.data.bill.billNo);
    } catch (err) {
      setError(err.response?.data?.message || "Bill not found.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = recentBills.filter(b => 
    b.billNo?.toLowerCase().includes(billNo.toLowerCase()) || 
    b.customerMobile?.includes(billNo)
  );

  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim() || !bill) return;

    const item = bill.items.find(i => i.barcode === barcodeInput);
    if (!item) {
      setError("This product does not belong to this bill.");
      setBarcodeInput("");
      return;
    }

    const maxReturnable = item.quantity - (item.returnedQty || 0);
    const currentReturnQty = returnItems[item._id] || 0;

    if (currentReturnQty >= maxReturnable) {
      setError("Cannot return more than purchased for this item.");
    } else {
      setReturnItems(prev => ({
        ...prev,
        [item._id]: currentReturnQty + 1
      }));
      setError("");
    }
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  const increaseReturn = (item) => {
    const maxReturnable = item.quantity - (item.returnedQty || 0);
    const current = returnItems[item._id] || 0;
    if (current < maxReturnable) {
      setReturnItems(prev => ({ ...prev, [item._id]: current + 1 }));
    }
  };

  const decreaseReturn = (item) => {
    const current = returnItems[item._id] || 0;
    if (current > 0) {
      setReturnItems(prev => ({ ...prev, [item._id]: current - 1 }));
    }
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = Object.entries(returnItems)
      .filter(([id, qty]) => qty > 0)
      .map(([id, qty]) => ({ _id: id, returnedQty: qty }));

    if (itemsToReturn.length === 0) {
      setError("Please select at least one item to return.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await processReturn({
        billId: bill._id,
        items: itemsToReturn,
        reason,
        refundMethod
      });
      setSuccess(res.data.returnRecord);
      setBill(null);
      setReturnItems({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process return.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBill(null);
    setBillNo("");
    setSuccess(null);
    setError("");
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-2xl mx-auto mt-10">
        <FaCheckCircle className="text-emerald-500 text-6xl mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Return Processed Successfully</h2>
        <p className="text-slate-500 mb-6">Return ID: <span className="font-bold text-slate-700">{success.returnNo}</span></p>
        
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-slate-500">Refund Amount:</span>
            <span className="font-bold text-lg text-emerald-600">₹{success.refundAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-500">Refund Method:</span>
            <span className="font-medium text-slate-700">{success.refundMethod}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={reset} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            New Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between shrink-0">
        <form onSubmit={handleSearch} className="flex gap-4 w-1/2">
          <input
            type="text"
            placeholder="Search Bill Number or Customer Mobile..."
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Search Bill
          </button>
        </form>
        {bill && (
          <button onClick={() => { setBill(null); setBillNo(""); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
            <FaArrowLeft /> Back to List
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shrink-0">
          {error}
        </div>
      )}

      {!bill && (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 text-lg">Select a Bill to Return</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loadingBills ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-blue-500 text-2xl" />
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">No bills found matching your search.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="pb-3 font-semibold">Bill No</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map(b => (
                    <tr key={b._id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => handleSearch(b.billNo)}>
                      <td className="py-4 font-bold text-slate-800">{b.billNo}</td>
                      <td className="py-4 text-slate-600">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-slate-600">{b.customerName || "Walk-in"}</td>
                      <td className="py-4 font-medium text-slate-700">₹{b.netAmount?.toFixed(2) || "0.00"}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === 'Completed' || !b.status ? 'bg-green-100 text-green-700' :
                          b.status === 'Partially Returned' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {b.status || 'Completed'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Select</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {bill && (
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Items */}
          <div className="w-[70%] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Bill {bill.billNo}</h2>
                <p className="text-sm text-slate-500">Customer: {bill.customerName} | Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
              </div>
              <form onSubmit={handleBarcodeScan} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan product barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  ref={barcodeRef}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-48"
                />
                <button type="submit" className="bg-indigo-600 p-2 text-white rounded-lg hover:bg-indigo-700">
                  <FaBarcode />
                </button>
              </form>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Purchased</th>
                    <th className="pb-3">Returned</th>
                    <th className="pb-3 text-center">Return Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.items.map(item => {
                    const maxReturnable = item.quantity - (item.returnedQty || 0);
                    const currentReturn = returnItems[item._id] || 0;
                    return (
                      <tr key={item._id} className={currentReturn > 0 ? "bg-amber-50" : ""}>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.barcode}</p>
                        </td>
                        <td className="py-4 font-medium text-slate-700">₹{item.sellingPrice}</td>
                        <td className="py-4 font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-4 font-bold text-red-500">{item.returnedQty || 0}</td>
                        <td className="py-4 text-center">
                          {maxReturnable > 0 ? (
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => decreaseReturn(item)}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center"
                              >-</button>
                              <span className="font-bold w-6 text-center">{currentReturn}</span>
                              <button 
                                onClick={() => increaseReturn(item)}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center"
                              >+</button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">Fully Returned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-[30%] bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-4">Return Summary</h3>
            
            <div className="flex flex-col gap-4 mb-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Damaged</option>
                  <option>Wrong Item</option>
                  <option>Expired</option>
                  <option>Customer Changed Mind</option>
                  <option>Billing Mistake</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Refund Method</label>
                <select 
                  value={refundMethod} 
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Wallet</option>
                  <option>Store Credit</option>
                </select>
              </div>

              <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Refund Total</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{Object.entries(returnItems).reduce((acc, [id, qty]) => {
                      const item = bill.items.find(i => i._id === id);
                      return acc + (item ? item.sellingPrice * qty : 0);
                    }, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmitReturn}
              disabled={loading || Object.values(returnItems).reduce((a,b)=>a+b,0) === 0}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading ? "Processing..." : "Complete Return"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReturnMode;
